# Phase 4 — Flight Checklist

**Generated:** 2026-06-13  
**Status:** Epic `in_progress` — **4.1, 4.2, 4.5 built** (Group A)  
**Goal:** Payments (Xendit), Shipping (Everpro), Promotions, Reviews, Custom Domains, Subscriptions, AI Monetization

---

## ⚠️ PRD vs Reality — Critical Gaps Found

| PRD Assumption | Reality | Action Needed |
|---|---|---|
| Owned sub-accounts (we control) | **Disabled for Indonesia**. Must use Managed. | Change flow: seller gets email invitation → registers with Xendit → activates payment channels in their own dashboard |
| `for-user-id` header on all API calls | ✅ Works with Managed too. Master key + header. | Keep as-is |
| Fee splitting via Xendit | ✅ `POST /split_rules` + `with-split-rule` header. | Create one split rule per tenant for Biaya Layanan |
| Webhook verification (HMAC) | Uses **`x-callback-token`** header (not HMAC). Token from Dashboard. | Verify callback token matches stored secret |
| RajaOngkir fallback | User confirmed: **NOT using RajaOngkir** | Skip 4.8 entirely |
| Resend email DNS needed | Lib exists. Need SPF/DKIM before production. | Defer 3.25 to Phase 5 |
| Invoice API (`v2/invoices`) | Works but **legacy**. Newer Payment Session API available. | Use `v2/invoices` for MVP — migrate later |
| **Redirect checkout (Xendit hosted page)** | ✅ **Can do inline/embedded instead.** Response contains VA number, QR code, e-wallet link. NO redirect needed. | Show payment instructions on OUR checkout page. Buyer stays on lapak.id. |

---

## Pre-Flight State

### What Exists
- ✅ `00003_commerce_tables.sql` — orders, order_items, reviews, vouchers, voucher_usages, tenant_addons, cart_sessions, shipping_zones
- ✅ `00007_order_detail_enhancements.sql` — order_number auto-gen, tracking_token, order_status_log, shipping_origins, RLS fixes
- ✅ `00004_ai_tables.sql` — ai_usage_log, ai_credit_purchases, ai_credit_balances
- ✅ API repo: Hono + CF Workers, storefront routes (public), auth routes, cart middleware, CSRF protection
- ✅ Email lib (`email.ts`) — Resend integration with templates (welcome, order confirmation, verification, reset)
- ✅ Checkout **stub** (`storefront/src/pages/checkout.astro`) — client-side cart + WhatsApp redirect
- ✅ `.dev.vars` with Xendit sandbox key, Everpro keys, Supabase keys

### What Needs Building (API Repo)
- New routes: `xendit.ts`, `checkout.ts`, `shipping.ts`, `vouchers.ts`, `subscriptions.ts`, `webhooks.ts`
- New middleware: `plan-gate.ts` (gated features by plan)
- New lib: `xendit.ts`, `everpro.ts`

### What Needs Building (Storefront)
- Replace checkout.astro WA stub → Xendit Invoice flow
- Shipping rate selection at checkout
- Order confirmation page

### What Needs Building (Studio/Seller)
- Voucher CRUD in Studio
- Subscription management
- AI credit purchase UI
- Domain settings

---

## GROUP A — Payment Core (4.1, 4.2, 4.5) ← START HERE

### 4.1 — Xendit XenPlatform Setup

**Files:** `api/src/lib/xendit.ts`, `api/src/lib/tenants.ts`, `api/supabase/migrations/00008_xenplatform.sql`

- [ ] **Migration 00008** — add columns to `tenants`:
  - `xendit_sub_account_id TEXT` — Managed sub-account ID from Xendit
  - `xendit_sub_account_status TEXT` — LIVE/PENDING/SUSPENDED
  - `plan_expires_at TIMESTAMPTZ` — for subscription billing
  - `ai_credits_balance INT DEFAULT 0` — current balance (overrides balance table for simplicity)
- [ ] **Create `src/lib/xendit.ts`:**
  - `createXenditSubAccount(tenant)` — `POST /v2/accounts` with `{email, type: "MANAGED", public_profile: {business_name}}`
  - `getXenditAuthHeaders()` — Basic auth with `XENDIT_API_KEY` as username + `:` as password → Base64
  - `forUserHeader(subAccountId)` — returns `{'for-user-id': subAccountId}`
  - `xenditCallbackToken` — stored via `XENDIT_CALLBACK_TOKEN` env
- [ ] **Tenant onboarding hook:** When tenant upgrades to Starter/Pro → auto-create Xendit Managed sub-account
  - Store returned `account.id` in `tenants.xendit_sub_account_id`
  - Log status: `INVITED` → merchant registers → webhook → `LIVE`
- [ ] **Env vars:** `XENDIT_API_KEY` (set in `.dev.vars` ✓), `XENDIT_CALLBACK_TOKEN` (get from Dashboard)
- [ ] **Test in sandbox:** Create test sub-account → verify response shape

### 4.2 — Checkout → Inline Payment (No Redirect)

**Files:** `api/src/routes/checkout.ts`, `storefront/src/pages/checkout.astro` (rewrite), `storefront/src/pages/payment/[orderId].astro`

- [ ] **Payment methods architecture (3-tier):**
  - Platform admin Console: `platform_settings.payment_methods` — global toggle per method
  - Seller Settings: `tenant_settings.meta.allowed_payment_methods` — shop-level toggle (intersection)
  - Buyer checkout: shows only intersection → buyer selects one method
  - `payment_methods[]` values: `["BANK_TRANSFER_BCA", "BANK_TRANSFER_BNI", "BANK_TRANSFER_BRI", "BANK_TRANSFER_MANDIRI", "BANK_TRANSFER_PERMATA", "QRIS", "EWALLET_OVO", "EWALLET_DANA", "EWALLET_SHOPEEPAY", "RETAIL_OUTLET_ALFAMART", "RETAIL_OUTLET_INDOMARET"]`
- [ ] **Create `api/src/routes/checkout.ts`** — `POST /api/checkout`:
  - Input: `{cart_session_id, buyer_name, buyer_phone, buyer_email?, shipping_address, payment_method, voucher_code?, notes}`
  - Validates cart from `cart_sessions` table
  - Applies voucher discount (if present)
  - Calculates totals: items_total + shipping_cost - discount + buyer_fee = grand_total
  - Creates order in Supabase (status: `pending`)
  - Calls Xendit: `POST /v2/invoices` with:
    - **Idempotency-Key:** `order.id` (Xendit dedup on duplicate)
    - `for-user-id`: tenant's sub-account ID
    - `payment_methods: [buyer_choice]` — filters to buyer's selected method only
    - Body: `{external_id: order.id, amount: grand_total, payer_email, description, items, currency: "IDR"}`
    - NO `success_redirect_url` / `failure_redirect_url` — we handle inline
  - Stores `xendit_invoice_id`, `available_banks`, `available_qr_codes`, `available_ewallets` on order
  - Returns payment instructions directly in API response
- [ ] **Create `payment/[orderId].astro`** — the payment instruction page:
  - Shows order summary + the specific payment method details:
    - VA: bank name, VA number, amount, instructions text
    - QRIS: QR code image (from `available_qr_codes[i].qr_string`)
    - E-wallet: checkout link/QR
  - Polls `GET /api/storefront/orders/{id}` every 5s for status change
  - On `paid` → redirect to order confirmation
- [ ] **Rewrite `checkout.astro`:**
  - Cart summary (keep existing)
  - Shipping form (name, phone, address, city, province, postal code)
  - Fetch + display allowed payment methods from `/api/storefront/payment-methods`
  - Buyer selects payment method + shipping option
  - Submit → `POST /api/checkout` → redirect to `/payment/{orderId}`
- [ ] **Create `GET /api/storefront/payment-methods`:**
  - Reads platform + seller allowed methods → computes intersection
  - Returns: `{methods: [{id: "QRIS", label: "QRIS", icon, fee}, ...]}`

### 4.5 — Xendit Webhook Handler

**Files:** `api/src/routes/webhooks.ts`

- [ ] **Create `POST /api/webhooks/xendit`**:
  - Verify `x-callback-token` header matches stored secret
  - Parse webhook event: `{external_id, payment_id, status, paid_amount, paid_at}`
  - **Idempotency guard:** Check `orders.xendit_invoice_id` before processing (guard against duplicate webhooks) + idempotent processing: if order status already `paid`, skip mutation
  - On `INVOICE.PAID` status:
    - `UPDATE orders SET status='paid', paid_at=NOW(), xendit_payment_id=payment_id WHERE status='pending'`
    - Auto-log via `order_status_log` trigger
    - Send confirmation email via Resend (`sendOrderConfirmationEmail`)
    - Send WhatsApp notification to seller (if WA number configured)
  - On `INVOICE.EXPIRED`/`INVOICE.FAILED` status: update order status accordingly
  - Return `200 OK` immediately (always acknowledge receipt — don't process complex logic synchronously)
- [ ] **Webhook URL config:** Dashboard needs callback URL set to `https://lapak.id/api/webhooks/xendit`

---

## GROUP B — Shipping (4.6, 4.7) [Skip 4.8 — RajaOngkir not used]

### 4.6 — Everpro Shipping Rate Calculation

**Files:** `api/src/routes/shipping.ts`, `api/src/lib/everpro.ts`

- [ ] **Create `api/src/lib/everpro.ts`** (follow everpro-shipping-integration skill):
  - `getEverproToken()` — `POST /auth/v1/token` with `client_key` + `client_secret` → cache in KV (TTL 24h)
  - `calculateRates(opts)` — `POST /shipment/v3/rates` with origin/destination/weight/insurance
  - **Key params:** `is_use_insurance: true`, `package_type_id`, `item_price`
  - Returns normalized rates grouped by bucket: `regular, express, instant, same_day, cargo`
- [ ] **Create `POST /api/shipping/calculate`:**
  - Input: `{origin_postal_code, destination_postal_code, weight, item_price}`
  - Reads origin from `shipping_origins` table (seller's warehouse address)
  - Calls Everpro rates API
  - Caches rates in KV with 1hr TTL (key: `rates:{origin}:{dest}:{weight}`)
  - Returns bucket-grouped rates
- [ ] **Env vars:** `EVERPRO_BASE_URL`, `EVERPRO_CLIENT_KEY`, `EVERPRO_CLIENT_SECRET` (all in `.dev.vars` ✓)

### 4.7 — Shipment Creation

**Files:** `api/src/routes/shipping.ts` (extend)

- [ ] **Seller "Mark Shipped" endpoint** — `POST /api/tenant/orders/:id/ship`:
  - Re-fetches Everpro rates for fresh `signed_key` (⚠️ key expires per response!)
  - Gets pickup times via `GET /shipment/v1/pickup-times`
  - Creates order via `POST /shipment/v2/orders` (flat fields: `receiver_name`, etc.)
  - Generates AWB via `POST /shipment/v1/orders/{shipment_order_no}/generate`
  - Stores `shipment_order_no` in shipping table
  - Updates order status to `shipped`
  - Notifies buyer (email + SMS if configured)
- [ ] **Everpro webhooks** — `POST /api/webhooks/everpro`:
  - `callback_awb`: receives AWB number → stores in shipping table
  - `callback_tracking`: receives tracking update → logs to order_status_log
  - Verify `x-everpro-key` header matches `EVERPRO_CALLBACK_KEY`

---

## GROUP C — Promotions + Reviews (4.3, 4.4, 4.14)

### 4.3 — Voucher CRUD (Studio)

**Files:** `studio/src/pages/vouchers/`

- [ ] Voucher list page: fetch from `GET /api/tenant/vouchers`
- [ ] Voucher create/edit form:
  - Code (auto-generate or manual), Name, Type (percentage/fixed/free_shipping)
  - Value, Min order, Max uses, Max discount
  - Start/end date picker, Active toggle
- [ ] API: `api/src/routes/vouchers.ts` — CRUD for `vouchers` table, authenticated (seller)
- [ ] Validation: code unique per tenant, dates valid, values > 0

### 4.4 — Voucher at Checkout (Buyer)

**Files:** `api/src/routes/vouchers.ts` (extend)

- [ ] `POST /api/vouchers/validate`:
  - Input: `{code, tenant_id, cart_total}`
  - Validates: exists, active, within dates, not expired, uses < max_uses, min_order met
  - Returns: `{valid, discount_amount, type, message}`
- [ ] Checkout applies discount → stored in `orders.discount_amount` + `orders.voucher_id`
- [ ] Increment `vouchers.used_count` on successful order
- [ ] One voucher per order (enforced in DB via voucher_id column)

### 4.14 — Reviews System

**Files:** `api/src/routes/reviews.ts`, `studio/src/pages/reviews/`, `storefront components`

- [ ] **Buyer: Submit review** — `POST /api/storefront/reviews`:
  - Input: `{order_id, product_id, rating, title?, body?, images?}`
  - Validates: order belongs to buyer (by tracking_token), product in order, not already reviewed (UNIQUE order_id+product_id)
  - Creates review with status `published` (default, unmoderated)
- [ ] **Storefront: Display reviews** — fetch `GET /api/storefront/products/:slug/reviews`
  - Shows rating stars, title, body, images, buyer_name, created_at
  - Average rating on product card
- [ ] **Studio: Review moderation** (Pro only) — `GET /api/tenant/reviews` + `PATCH /api/tenant/reviews/:id`
  - List all reviews with filters (rating, date, status)
  - Toggle status: published/hidden/flagged
- [ ] **Pro feature gate:** Hide moderation behind `useFeatureGate('reviews_moderation')`

---

## GROUP D — Domain + Billing (4.9, 4.10, 4.11)

### 4.9 — Custom Domain Flow

**Files:** `api/src/routes/domains.ts`, `studio/src/pages/settings/domain.astro`

- [ ] **Seller enters domain** in Settings → `POST /api/tenant/domains/verify`
  - Check CNAME target: `custom.lapak.id`
  - Use DNS lookup to verify CNAME record
- [ ] **CF for SaaS:** Register custom hostname via CF API:
  - `POST /zones/{zone_id}/custom_hostnames` with SSL settings
  - CF auto-provisions SSL certificate
- [ ] **Domain provisioning webhook:** CF sends cert status → `PENDING_VALIDATION` → `ACTIVE`
- [ ] **Update tenant:** `tenants.domain = custom_domain` + `tenants.status`
- [ ] **Step-by-step instructions** in Studio UI for seller

### 4.10 — CF for SaaS Setup (Infrastructure)

**Files:** CF dashboard, `wrangler.toml`

- [ ] **Configure CF for SaaS** on our domain (`lapak.id` or `lapak.pages.dev`):
  - Fallback origin = our CF Pages deployment URL
  - First 100 hostnames free
- [ ] **Wildcard DNS:** `*.lapak.id` → CNAME to custom hostname origin
- [ ] **Addon gating:** Custom domains gated to Pro plan

### 4.11 — Subscription Billing

**Files:** `api/src/routes/subscriptions.ts`, `api/src/lib/xendit.ts` (extend)

- [ ] **Xendit Subscription Plan** for Starter (Rp99K/mo) and Pro (Rp199K/mo):
  - Create plan via `POST /v2/recurring_plans` or Payment Session (SUBSCRIPTION type)
  - Or simpler: create fixed-amount Subscriptions API
- [ ] **On tenant upgrade:**
  - Mark plan in `tenants.plan` + set `plan_expires_at`
  - Start Xendit recurring payment
- [ ] **Webhook handler** — on subscription payment success: extend `plan_expires_at`
- [ ] **7-day grace period:** If payment fails → auto-downgrade to Free
- [ ] **Cron job** (daily check): `cron '0 0 * * *'` → `SELECT tenant_id FROM tenants WHERE plan_expires_at < NOW() AND plan != 'free'` → downgrade

---

## GROUP E — AI Monetization (4.12, 4.13, 4.15, 4.16)

### 4.12 — AI Credit Purchase

**Files:** `api/src/routes/ai-credits.ts`, `studio/src/pages/ai/credits.astro`

- [ ] **Credit packs:** Rp10K = 100 credits, Rp50K = 550 credits, Rp100K = 1,200 credits
- [ ] **Purchase flow:** `POST /api/tenant/ai/credits/purchase`:
  - Creates `ai_credit_purchases` row (status: pending)
  - Creates Xendit Invoice → returns payment URL
- [ ] **Webhook handler:** On PAID → `UPDATE ai_credit_purchases SET status='paid'` + increment `ai_credit_balances.balance`
- [ ] **Atomic credit check:** `UPDATE ai_credit_balances SET balance = balance - :cost WHERE balance >= :cost RETURNING balance`
- [ ] **Studio page:** Balance display + purchase button + usage history

### 4.13 — Credit Deduction (Atomic)

**Files:** `api/src/lib/ai-credits.ts`

- [ ] **Atomic deduction query:**
  ```sql
  UPDATE ai_credit_balances SET balance = balance - :cost
  WHERE tenant_id = :tid AND balance >= :cost
  RETURNING balance
  ```
- [ ] If `0 rows affected` → return `402 Payment Required` — "Insufficient credits"
- [ ] Log deduction in `ai_usage_log` with `credits_used`
- [ ] Integration with AI Proxy (3.17) — call deduction before proxying to model

### 4.15 — Addon Subscription System

**Files:** `api/src/routes/addons.ts`, `studio/src/pages/addons.astro`

- [ ] **7 addons catalog:**
  - `custom_domain`, `advanced_analytics`, `reviews_moderation`, `ai_credits_topup`, `shipping_zones`, `staff_accounts`, `priority_support`
- [ ] **Admin + tenant API:** `GET /api/addons/catalog` (platform), `GET /api/tenant/addons` (tenant's status)
- [ ] **Sub/unsubscribe:** `POST /api/tenant/addons/:key/subscribe` → creates Xendit recurring + `tenant_addons` row
- [ ] `hasFeature(key)` helper: checks plan OR active addon
- [ ] **Upsell banner:** If total addon cost > plan price, show "Switch to Pro and save RpX/mo"

### 4.16 — Addon Upsell Intelligence

**Files:** `studio/src/hooks/use-feature-gate.ts` (extend)

- [ ] Gated feature shows "Pro only" / "Enable for Rp29K/mo" CTA
- [ ] Track: which features users try to access → feed into Console adoption funnel
- [ ] Console page: "Rejected features by tenant" — which addons are most wanted but not subscribed

---

## GROUP X — Deferred Phase 3 (3.17, 3.18, 3.25)

### 3.17 — AI Proxy Edge Function

**Files:** `api/src/routes/ai.ts`

- [ ] `POST /api/ai/generate` — proxy to OpenAI/Groq:
  - Reads tenant's AI config from `tenant_settings.meta.ai`
  - BYOK mode: use tenant's API key
  - Credits mode: check + deduct balance
  - Forward request to model, return response
- [ ] Auth: tenant JWT required

### 3.18 — AI Rate Limiting

**Files:** `api/src/middleware/rate-limit.ts`

- [ ] Per-tenant rate limits: Free=5/hr, Starter=50/hr, Pro=200/hr
- [ ] KV-backed counter: `ai_rate:{tenant_id}:{date_hour}` → increment + check
- [ ] Return `429 Too Many Requests` with reset time

### 3.25 — Email Notifications (DEFERRED to Phase 5)

- [ ] Needs: Resend DNS setup (SPF/DKIM), custom domain, production API key
- [ ] Don't implement until those pre-requisites are met

---

## FILES TO CREATE (API Repo)

| File | Purpose | Group |
|---|---|---|
| `src/lib/xendit.ts` | Xendit API client (auth, sub-accounts, invoices, split rules) | A |
| `src/lib/everpro.ts` | Everpro API client (token, rates, orders, tracking) | B |
| `src/lib/ai-credits.ts` | Credit deduction (atomic), purchase, balance | E |
| `src/routes/checkout.ts` | POST /api/checkout — create order + Xendit invoice | A |
| `src/routes/webhooks.ts` | POST /api/webhooks/xendit, /api/webhooks/everpro | A+B |
| `src/routes/shipping.ts` | POST /api/shipping/calculate, POST /api/tenant/orders/:id/ship | B |
| `src/routes/vouchers.ts` | CRUD (seller) + validate (buyer) | C |
| `src/routes/reviews.ts` | Buyer submit + seller moderation | C |
| `src/routes/domains.ts` | Custom domain verification + CF for SaaS | D |
| `src/routes/subscriptions.ts` | Plan upgrade/downgrade, recurring billing | D |
| `src/routes/ai-credits.ts` | Credit purchase + balance | E |
| `src/routes/ai.ts` | AI proxy endpoint | X |
| `src/routes/addons.ts` | Addon catalog + subscribe/unsubscribe | E |
| `src/middleware/rate-limit.ts` | AI rate limiting middleware | X |
| `supabase/migrations/00008_xenplatform.sql` | New columns for Phase 4 | A+E |

## FILES TO UPDATE (API Repo)

| File | What |
|---|---|
| `src/index.ts` | Register all new routes |
| `src/bindings.ts` | Add xendit/everpro env vars to CloudflareBindings |
| `src/types.ts` | Add order/payment/voucher types |
| `src/lib/email.ts` | Add order update templates |

## FILES TO UPDATE (Storefront)

| File | What |
|---|---|
| `src/pages/checkout.astro` | Replace WA stub → real checkout with shipping + payment |
| `src/pages/order/[id].astro` | New — order confirmation + status tracking |

## FILES TO UPDATE (Studio)

| File | What |
|---|---|
| Settings page | Add domain config, payment settings |
| Addons page | New — catalog + subscribe |
| AI settings | Buy credits, view usage |
| Vouchers | New — CRUD page |

---

## Execution Order (Recommended)

```
GROUP A (Payment) → GROUP B (Shipping) → GROUP C (Promotions)
→ GROUP D (Domain+Billing) → GROUP E (AI) → GROUP X (Deferred P3)
```

**Start with:** 4.1 (Xendit lib + migration 00008) → 4.2 (checkout flow) → 4.5 (webhooks)  
This gives us a working payment flow end-to-end before adding shipping/complexity.

---

## Verification Checklist

Before marking any task done:
- [ ] Build passes (`astro build` for storefront, `wrangler deploy --dry-run` for API)
- [ ] Git commit with descriptive message + task reference
- [ ] Flux DB updated (task → `done`, notes with file refs + decisions)
- [ ] Push to remote

---

## Critical Reminders

1. **Sandbox Managed sub-accounts:** Merchants can't log in to them in test mode. Test with API only until live.
2. **Webhook endpoint:** Must return 200 immediately. Queue async processing.
3. **Everpro signed_key:** Expires per-response. Re-fetch before AWB generation.
4. **Idempotency:** Always check `xendit_invoice_id` before processing webhook duplicates.
5. **Migration 00008:** Plan carefully — it's the last structural DB change.
6. **`.dev.vars` is gitignored** — all keys must be set as `wrangler secret put` for deployed Workers.
