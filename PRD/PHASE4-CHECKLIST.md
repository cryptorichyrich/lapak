# Phase 4 — Payments + Shipping + Domains
## Pre-Flight Checklist & Execution Plan

**Date:** 2026-06-13
**Status:** 16/16 todo — ZERO started

---

## 0. PREREQUISITES — External Accounts & Credentials

Before writing ANY code, these must be in place:

- [ ] **Xendit account** — Register at https://dashboard.xenplatform.co
  - Get sandbox API keys (public + secret)
  - Enable XenPlatform (sub-accounts) — contact support if "Owned" disabled for Indonesia
  - Get webhook signing secret
  - Test: `POST https://api.xendit.co/v2/accounts` with sandbox key
- [ ] **Everpro account** — Register at https://everpro.id
  - Get API key (sandbox)
  - Confirm origin address for rate calculation
  - Test: rate calculation API call
- [ ] **RajaOngkir account** — Register at https://rajaongkir.com
  - Get API key (starter plan)
  - Same interface as Everpro (adapter pattern)
- [ ] **Resend account** — https://resend.com (for email notifications)
  - Get API key
  - Verify sender domain (SPF/DKIM)
- [ ] **Cloudflare API token** — Already have (in `.env`, acct `09dabe15db11e2f59e97c9807c18cf73`)
  - Need: CF for SaaS enabled on zone
  - Pages custom hostname fallback origin = `lapak.pages.dev`

**Credentials to add to `api/.dev.vars`:**
```
XENDIT_PUBLIC_KEY=...
XENDIT_SECRET_KEY=...
XENDIT_WEBHOOK_SECRET=...
EVERPRO_API_KEY=...
RAJAONGKIR_API_KEY=...
RESEND_API_KEY=...
FROM_EMAIL=noreply@lapak.id
```

---

## 1. DATABASE — Migrations Needed

### 1.1 tenants table — Add Xendit sub-account column
**Migration:** `00008_tenants_xendit.sql`
```sql
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS xendit_sub_account_id TEXT;
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS plan_expires_at TIMESTAMPTZ;
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS ai_credits_balance INT NOT NULL DEFAULT 0;
```
- `xendit_sub_account_id` — returned by Xendit `POST /v2/accounts`
- `plan_expires_at` — for subscription billing (4.11)
- `ai_credits_balance` — denormalized balance (4.12/4.13)

### 1.2 orders table — Add buyer/seller notes (verify exists)
Already in 00007: `buyer_notes`, `seller_notes`, `courier`, `courier_service`, `payment_method`, `payment_proof_url`, `payment_verified_at`. ✅

### 1.3 Verify all Phase 4 tables exist
| Table | Migration | Status |
|-------|-----------|--------|
| orders | 00003 | ✅ |
| order_items | 00003 | ✅ |
| order_status_log | 00007 | ✅ |
| vouchers | 00003 | ✅ |
| voucher_usages | 00003 | ✅ |
| tenant_addons | 00003 | ✅ |
| shipping_zones | 00003 | ✅ |
| shipping_origins | 00007 | ✅ |
| ai_credit_purchases | 00004 | ✅ |
| ai_credit_balances | 00004 | ✅ |
| cart_sessions | 00003 | ✅ |
| external_link_clicks | 00003 | ✅ |

---

## 2. API — Edge Functions / Routes to Build

### 4.1 Xendit XenPlatform Setup
**File:** `api/src/routes/xendit.ts`
- `POST /api/xendit/create-subaccount` — called when tenant upgrades to Starter/Pro
  - Body: `{ tenant_id, email, business_name }`
  - Calls `POST https://api.xenplatform.co/v2/accounts`
  - Headers: `Authorization: Basic base64(secret_key:)`
  - Stores `xendit_sub_account_id` in `tenants` table
- **Dependency:** Xendit sandbox credentials

### 4.2 Checkout → Xendit Invoice
**File:** `api/src/routes/checkout.ts`
- `POST /api/checkout` — authenticated (cart session)
  - Input: `{ shipping_address, shipping_zone_id, courier, courier_service, voucher_code?, name, phone, email? }`
  - Flow:
    1. Validate cart from `cart_sessions` table
    2. Calculate items total
    3. If voucher: validate + compute discount
    4. Call `POST /api/shipping/calculate` (internal) for shipping cost
    5. Create order in `orders` table (status: `pending`)
    6. Call Xendit Invoice API:
       ```
       POST https://api.xendit.co/v2/invoices
       Headers: Authorization: Basic base64(secret_key:)
       Headers: for-user-id: {tenant_xendit_sub_account_id}
       Body: {
         external_id: order.id,
         amount: grand_total,
         payer_email: buyer_email,
         description: "Order #{order_number}",
         customer: { given_names: name, phone: phone },
         success_redirect_url: "https://{domain}/track/{tracking_token}",
         failure_redirect_url: "https://{domain}/checkout?failed=true",
         payment_methods: ["qris", "bca", "bni", "bri", "mandiri", "ovo", "dana", "linkaja"],
         fees: [
           { type: "biaya_layanan", value: 2500 },
           { type: "pg_fee", value: percentage_of_total }
         ]
       }
       ```
    7. Store `xendit_invoice_id` + `xendit_payment_url` on order
    8. Return `{ payment_url, order_id }`
- **Dependency:** 4.1 (sub-account), 4.6 (shipping calc)

### 4.3 Voucher System (Seller CRUD)
**File:** `api/src/routes/vouchers.ts`
- `GET /api/tenant/vouchers` — list all vouchers for tenant
- `POST /api/tenant/vouchers` — create voucher
  - Body: `{ code, name, type, value, min_order, max_uses, max_discount, starts_at, ends_at }`
  - Validation: `type IN ('percentage','fixed','free_shipping')`, `value > 0`, `starts_at < ends_at`
- `PUT /api/tenant/vouchers/:id` — update voucher
- `DELETE /api/tenant/vouchers/:id` — deactivate voucher
- **Auth:** seller (tenant)
- **Dependency:** None (table exists)

### 4.4 Voucher at Checkout
**File:** `api/src/routes/voucher-validate.ts` (or inline in checkout)
- `GET /api/storefront/vouchers/:code` — public, tenant-scoped
  - Validates: active, not expired, uses remaining, min_order met
  - Returns: `{ valid, type, value, discount_amount }`
- **Dependency:** 4.3

### 4.5 Xendit Webhook Handler
**File:** `api/src/routes/webhooks/xendit.ts`
- `POST /api/webhooks/xendit` — NO auth (webhook, signature verified)
  - Verify webhook signature: `X-CALLBACK-TOKEN` header or HMAC
  - Find order by `xendit_invoice_id`
  - If status = `PAID`:
    - Update `orders.status = 'paid'`, `paid_at = now()`
    - Trigger `log_order_status_change()` (auto via trigger)
    - Send confirmation email to buyer (Resend)
    - Send notification to seller (Realtime + in-app)
  - If status = `EXPIRED`:
    - Update `orders.status = 'cancelled'`
  - Idempotent: check if order already `paid` before processing
- **Dependency:** Resend API key, Supabase Realtime

### 4.6 Everpro Shipping Calculation
**File:** `api/src/routes/shipping.ts`
- `POST /api/shipping/calculate` — public, tenant-scoped
  - Body: `{ origin_province, origin_city, dest_province, dest_city, weight_grams, courier? }`
  - Flow:
    1. Check KV cache: `shipping:{origin}:{dest}:{weight}` → return if hit
    2. Call Everpro API:
       ```
       POST https://api.everpro.id/v1/shipment/rates
       Headers: Authorization: Bearer {api_key}
       Body: {
         origin_province_id, origin_city_id,
         destination_province_id, destination_city_id,
         weight: weight_grams,
         courier: ["jne", "jnt", "sicepat", "pos", "tiki"],
         is_use_insurance: true
       }
       ```
    3. Parse response: `[{ courier, service, price, et_delivery, insurance_price }]`
    4. Cache in KV: 1 hour TTL
    5. Return rates array
- **Dependency:** Everpro API key, KV binding

### 4.7 Shipment Creation
**File:** `api/src/routes/shipping.ts` (same file, new route)
- `POST /api/shipping/create` — authenticated (seller)
  - Body: `{ order_id, courier, courier_service }`
  - Flow:
    1. Verify order belongs to seller's tenant, status = 'paid'
    2. Call Everpro create shipment API
    3. Store `tracking_number`, `courier`, `courier_service` on order
    4. Update order status to 'shipped'
    5. Notify buyer (tracking page)
- **Dependency:** 4.6

### 4.8 RajaOngkir Fallback
**File:** `api/src/routes/shipping.ts` (same file)
- Adapter pattern: `ShippingProvider` interface
  - `getRates(origin, dest, weight) → Rate[]`
  - `createShipment(order, courier, service) → { tracking_number }`
- Implementations: `EverproProvider`, `RajaOngkirProvider`
- `RajaOngkirProvider` uses Komerce API V2:
  ```
  POST https://pro.rajaongkir.com/api/cost
  Headers: key: {api_key}
  Body: { origin, destination, weight, courier }
  ```
- Auto-fallback: try Everpro → if fails → try RajaOngkir
- **Dependency:** RajaOngkir API key

### 4.9 Custom Domain Flow
**File:** `api/src/routes/domains.ts`
- `POST /api/tenant/domains` — seller enters domain
  - Body: `{ domain }` (e.g. "tokoku.com")
  - Flow:
    1. Validate domain format
    2. Check not already taken
    3. Store in `tenants.domain` + status = 'pending_verification'
    4. Return CNAME instructions: `CNAME → custom.lapak.id`
- `GET /api/tenant/domains/verify` — check CNAME
  - DNS lookup: does `tokoku.com` CNAME → `custom.lapak.id`?
  - If yes: call CF for SaaS API:
    ```
    POST https://api.cloudflare.com/client/v4/accounts/{acct_id}/pages/projects/{project}/domains
    Headers: Authorization: Bearer {cf_token}
    Body: { name: "tokoku.com" }
    ```
  - CF auto-provisions SSL (can take 1-5 min)
  - Update status = 'active'
- `DELETE /api/tenant/domains` — remove custom domain
- **Dependency:** 4.10

### 4.10 CF for SaaS Setup
**File:** `api/src/lib/cloudflare.ts` (helper, not a route)
- Function: `registerCustomHostname(domain: string)`
  - Calls CF Pages API to add custom hostname
  - Fallback origin: `lapak.pages.dev`
  - First 100 hostnames free
- Function: `removeCustomHostname(domain: string)`
- **Dependency:** CF API token in env

### 4.11 Subscription Billing
**File:** `api/src/routes/subscriptions.ts`
- `POST /api/subscriptions/create` — create recurring invoice
  - Body: `{ tenant_id, plan }` ('starter' | 'pro')
  - Calls Xendit Recurring API:
    ```
    POST https://api.xenplatform.co/recurring_cycles
    Body: {
      external_id: "sub_{tenant_id}",
      amount: 99000 | 199000,
      interval: "MONTH",
      interval_count: 1,
      description: "Lapak {plan} Subscription",
      invoice_duration: 30,
      should_send_email: true,
      callback_url: "https://api.lapak.id/api/webhooks/xendit"
    }
    ```
  - Store subscription ID in `tenant_addons` or new `subscriptions` table
- `POST /api/webhooks/xendit/recurring` — handle recurring payment
  - If paid: extend `plan_expires_at`
  - If failed: start 7-day grace period → downgrade to 'free'
- **Dependency:** 4.1

### 4.12 AI Credit Purchase
**File:** `api/src/routes/ai-credits.ts`
- `POST /api/ai-credits/purchase` — create Xendit Invoice for credit pack
  - Body: `{ tenant_id, pack_id }` — packs: 1000, 5000, 10000 credits
  - Creates `ai_credit_purchases` row (status: 'pending')
  - Creates Xendit Invoice → returns payment URL
- **Dependency:** 4.1, 4.5 (webhook confirms payment)

### 4.13 Credit Deduction (Atomic)
**File:** `api/src/lib/ai-credits.ts` (helper)
- `deductCredits(tenant_id, cost) → { success, remaining }`
  ```sql
  UPDATE ai_credit_balances
  SET balance = balance - :cost, updated_at = now()
  WHERE tenant_id = :tenant_id AND balance >= :cost
  RETURNING balance;
  ```
  - If 0 rows returned → insufficient → return 402
- **Dependency:** None

### 4.14 Reviews System
**File:** `api/src/routes/reviews.ts`
- `GET /api/storefront/reviews/:product_slug` — public, tenant-scoped
  - Returns published reviews for product
  - Filter by `status = 'published'`
- `POST /api/storefront/reviews` — buyer post-purchase
  - Body: `{ order_id, product_id, rating, title, body, images? }`
  - Verify: order belongs to buyer (by tracking_token or phone), status = 'delivered'
  - Default status: 'published' (unmoderated)
  - UNIQUE constraint: one review per product per order
- `GET /api/tenant/reviews` — seller sees all reviews
- `PATCH /api/tenant/reviews/:id` — seller can hide/flag (Pro plan: moderation dashboard)
- **Dependency:** None (table exists)

### 4.15 Addon Subscription System
**File:** `api/src/routes/addons.ts`
- `GET /api/tenant/addons` — list tenant's addons
- `POST /api/tenant/addons` — subscribe to addon
  - Body: `{ addon_key }` — one of 7 addons
  - Creates Xendit recurring subscription
  - Creates `tenant_addons` row
- `DELETE /api/tenant/addons/:key` — cancel addon
  - Set status = 'cancelled', expires at period end
- `GET /api/tenant/addons/catalog` — list all 7 addons with pricing
- **Dependency:** 4.1, 4.11

### 4.16 Addon Upsell
**File:** `api/src/routes/addons.ts` (same file)
- `GET /api/tenant/addons/upsell` — returns "Switch to Starter/Pro and save" calculation
  - If total addon prices > plan price → show upsell banner
- Studio UI: gated feature shows "Enable for Rp29K/mo" or "Upgrade plan"
- **Dependency:** 4.15

---

## 3. STOREFRONT — Pages to Build/Update

### 3.1 Checkout Page (Replace Stub)
**File:** `storefront/src/pages/checkout.astro`
- Replace WhatsApp redirect with real checkout flow:
  1. Cart review (items + prices)
  2. Shipping address form (name, phone, address, city, province, postal code)
  3. Shipping method selection (calls `/api/shipping/calculate`)
  4. Voucher code input (calls `/api/storefront/vouchers/:code`)
  5. Order summary (subtotal + shipping - discount = total)
  6. "Bayar Sekarang" button → calls `/api/checkout` → redirects to Xendit payment URL
- **Dependency:** 4.2, 4.4, 4.6

### 3.2 Order Tracking Page (Enhance)
**File:** `storefront/src/pages/track.astro`
- Already exists (uses tracking_token)
- Enhance: show payment status, courier info, tracking number
- **Dependency:** 4.5

### 3.3 Product Page — Reviews Section
**File:** `storefront/src/pages/products/[slug].astro`
- Add reviews section at bottom
- Show: rating stars, review count, review list
- "Write a review" button (if purchased — verify by phone)
- **Dependency:** 4.14

---

## 4. STUDIO — Pages to Build

### 4.1 Payment Settings
**File:** `studio/src/pages/settings/payment.tsx`
- Xendit onboarding status
- "Connect Xendit" button → triggers sub-account creation
- Show: sub-account status, fee splitting config
- **Dependency:** 4.1

### 4.2 Shipping Settings
**File:** `studio/src/pages/settings/shipping.tsx`
- Origin address form (province, city, district, postal code)
- Saved to `shipping_origins` table
- Courier selection (which couriers to offer)
- **Dependency:** 4.6

### 4.3 Voucher Manager
**File:** `studio/src/pages/vouchers/index.tsx`
- CRUD table: code, name, type, value, uses, dates, active toggle
- Create/edit modal
- Usage stats
- **Dependency:** 4.3

### 4.4 Order Manager (Enhance)
**File:** `studio/src/pages/orders/index.tsx`
- Add: "Mark as Shipped" button → calls `/api/shipping/create`
- Add: tracking number display
- Add: courier selection
- **Dependency:** 4.7

### 4.5 Reviews Manager (Pro only)
**File:** `studio/src/pages/reviews/index.tsx`
- List all reviews with status
- Hide/flag actions
- **Dependency:** 4.14

### 4.6 Addons Page
**File:** `studio/src/pages/addons/index.tsx`
- Catalog of 7 addons with pricing
- Toggle subscribe/cancel
- Upsell banner if addons > plan price
- **Dependency:** 4.15, 4.16

### 4.7 Subscription Billing
**File:** `studio/src/pages/settings/billing.tsx`
- Current plan display
- Upgrade/downgrade buttons
- Payment history
- Auto-downgrade warning
- **Dependency:** 4.11

### 4.8 AI Credits
**File:** `studio/src/pages/ai/credits.tsx`
- Current balance display
- Buy credits modal (pack selection)
- Purchase history
- **Dependency:** 4.12

### 4.9 Custom Domain
**File:** `studio/src/pages/settings/domain.tsx`
- Domain input
- CNAME verification status
- SSL status
- Instructions panel
- **Dependency:** 4.9

---

## 5. SHARED — Types & Helpers

### 5.1 Shared Types
**File:** `shared/src/types.ts` — Add:
```typescript
export interface XenditInvoiceRequest {
  external_id: string;
  amount: number;
  payer_email?: string;
  description: string;
  customer?: { given_names?: string; phone?: string };
  success_redirect_url: string;
  failure_redirect_url: string;
  payment_methods?: string[];
  fees?: Array<{ type: string; value: number }>;
}

export interface ShippingRate {
  courier: string;
  service: string;
  price: number;
  et_delivery: string;
  insurance_price: number;
}

export interface Voucher {
  code: string;
  type: 'percentage' | 'fixed' | 'free_shipping';
  value: number;
  discount_amount: number;
}
```

### 5.2 API Bindings Update
**File:** `api/src/types.ts` — Add to `CloudflareBindings`:
```typescript
XENDIT_PUBLIC_KEY: string;
XENDIT_SECRET_KEY: string;
XENDIT_WEBHOOK_SECRET: string;
EVERPRO_API_KEY: string;
RAJAONGKIR_API_KEY: string;
```

---

## 6. EXECUTION ORDER (Dependency Chain)

```
Step 1: Migration 00008 (tenants.xendit_sub_account_id, plan_expires_at, ai_credits_balance)
Step 2: Credentials in .dev.vars
Step 3: 4.10 CF for SaaS helper (lib/cloudflare.ts)
Step 4: 4.1  Xendit setup (routes/xendit.ts)
Step 5: 4.6  Everpro shipping (routes/shipping.ts)
Step 6: 4.8  RajaOngkir fallback (routes/shipping.ts)
Step 7: 4.3  Voucher CRUD (routes/vouchers.ts)
Step 8: 4.4  Voucher validation (routes/voucher-validate.ts)
Step 9: 4.2  Checkout → Invoice (routes/checkout.ts) — depends on 4.1, 4.6, 4.4
Step 10: 4.5 Xendit webhook (routes/webhooks/xendit.ts)
Step 11: 4.7 Shipment creation (routes/shipping.ts)
Step 12: 4.9 Custom domain (routes/domains.ts) — depends on 4.10
Step 13: 4.11 Subscription billing (routes/subscriptions.ts) — depends on 4.1
Step 14: 4.12 AI credit purchase (routes/ai-credits.ts) — depends on 4.1
Step 15: 4.13 Credit deduction helper (lib/ai-credits.ts)
Step 16: 4.14 Reviews (routes/reviews.ts)
Step 17: 4.15 Addon subscriptions (routes/addons.ts) — depends on 4.1, 4.11
Step 18: 4.16 Addon upsell (routes/addons.ts)
Step 19: Storefront checkout page (replace stub)
Step 20: Studio pages (settings, vouchers, orders, reviews, addons, billing, domain, ai-credits)
```

---

## 7. TESTING CHECKLIST

- [ ] Xendit sandbox: create sub-account → store ID
- [ ] Xendit sandbox: create Invoice → get payment URL → pay with sandbox QRIS
- [ ] Webhook: Xendit sandbox → our endpoint → order status updated
- [ ] Everpro: rate calculation → returns rates
- [ ] Voucher: create → apply at checkout → discount correct
- [ ] Shipping: calculate → select → create shipment → tracking number
- [ ] Custom domain: CNAME check → CF for SaaS → SSL provisioned
- [ ] Subscription: create recurring → webhook fires → plan extended
- [ ] AI credits: purchase → webhook confirms → balance incremented → deduction atomic
- [ ] Reviews: post-purchase submit → appears on product page
- [ ] Addons: subscribe → Xendit recurring → cancel → expires at period end
- [ ] Cross-tenant isolation: tenant A cannot see tenant B's orders/vouchers/reviews

---

## 8. KNOWN GAPS / RISKS

1. **Xendit "Owned" sub-accounts disabled for Indonesia** — may need "Managed" type or contact support
2. **Resend DNS setup** — SPF/DKIM needed for production email delivery
3. **CF for SaaS** — first 100 free, then paid. Need billing with CF.
4. **Xendit fee splitting** — need to configure in Xendit dashboard, not just API
5. **Everpro API documentation** — verify exact endpoint URLs before coding
6. **RajaOngkir Komerce V2** — different from V1, verify endpoint format
7. **Webhook idempotency** — Xendit may send duplicate webhooks, must handle gracefully
8. **Cart → Order race condition** — two buyers, same cart session? (low risk, MVP)
9. **AI credit balance sync** — `ai_credit_balances` vs `tenants.ai_credits_balance` — keep in sync
