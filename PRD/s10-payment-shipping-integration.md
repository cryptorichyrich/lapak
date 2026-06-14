## 10. Payment & Shipping Integration

### Xendit XenPlatform (Payments — all paid plans)

**Why Xendit:** Purpose-built for marketplace/SaaS platforms. One master account, sub-accounts per tenant via API. Same provider Djualan uses.

- **Model:** Master account (ours) → creates sub-account per tenant via `POST /v2/accounts` API
- **Sub-account types:**
  - **Owned** (MVP) — we control everything, tenant has no Xendit dashboard. Best for SaaS. *(Note: disabled for Indonesia by default — contact Xendit support to enable)*
  - **Managed** (v2) — tenant gets their own Xendit dashboard, can see transactions, withdraw funds independently
- **Payment methods:** QRIS, VA (BCA/BNI/BRI/Mandiri/Permata/etc), e-wallet (OVO/Dana/LinkAja/ShopeePay), COD
- **Key features:**
  - **for-user-id header** — all API calls specify which tenant sub-account to charge
  - **Fee splitting** — auto-deduct platform commission per transaction
  - **Auto-disburse** — settle tenant funds to their bank account on schedule
  - **Webhooks** — real-time payment status updates to our Edge Function
  - **Sandbox** — full test environment before going live
- **Flow:** `Checkout → Edge Fn → Xendit Invoice API (for-user-id: tenant_account_id) → payment URL → redirect → webhook`
- **Fees:** Rp 4K/VA, 0.7% QRIS (all passed to buyer as line items at checkout). Biaya Layanan (Rp1K–4K) auto-collected via Xendit fee splitting → platform revenue.
- **Docs:** `docs.xendit.co/docs/xenplatform-overview`

### Everpro (Shipping — Starter/Pro plans)

**Why Everpro:** Same provider Djualan uses. Proven for Indonesian e-commerce. Handles multi-courier rate calculation.

- **Supported couriers:** JNE, J&T, SiCepat, POS Indonesia, TIKI
- **Service levels:** Regular, Express, Same-day (where available)
- **How it works:**
  1. Tenant sets origin address in Settings (province, city, district, postal code)
  2. Customer enters destination at checkout
  3. Edge Function calls Everpro API: `origin → destination → weight → courier options + prices`
  4. Customer picks courier + service → shipping cost added to order total
  5. After payment confirmed → Edge Function creates shipment via Everpro API
  6. Tracking number generated → tenant + customer can track
- **COD integration:** Everpro handles COD cash management alongside Xendit payment
- **Fallback:** RajaOngkir/Komerce API V2 (same courier coverage, 45% shipping discount, but monthly subscription required)

### Architecture: How Payment + Shipping Work Together

```
Customer clicks "Checkout"
         ↓
Edge Function: /shipping/calculate
  → Everpro API: origin (tenant) → destination (customer) → rates
  → Returns: [{courier, service, price, est_delivery}]
         ↓
Customer picks shipping option
         ↓
Edge Function: /checkout
  → Creates order in Supabase (status: pending)
  → Xendit Invoice API (for-user-id: tenant's sub-account)
    → Amount: subtotal + shipping_cost
    → Payment methods: QRIS, VA, e-wallet
    → Callback URL: our webhook
  → Returns: payment_url
         ↓
Customer redirected to Xendit payment page
         ↓
Customer pays (QRIS/VA/e-wallet)
         ↓
Xendit webhook → Edge Function: /webhook-xendit
  → Updates order.status = 'paid'
  → Creates shipment via Everpro API
  → Notifies tenant (dashboard + WhatsApp)
  → Notifies customer (order confirmation page)
```

### Platform Monetization via Xendit Fee Splitting
```
Customer pays Rp 223.400 (product + ongkir + Biaya Layanan + PG fee + asuransi)
         ↓
Xendit deducts PG fee (~0.7% QRIS = Rp 1.566)
         ↓
Lapak collects Biaya Layanan (Rp 2.500) → platform revenue
         ↓
Seller receives exactly Rp 200.000 (their listed price) in tenant sub-account
         ↓
Auto-disburse to tenant's bank account (daily/weekly)
```

**MVP strategy:** All fees buyer-facing. Seller gets 100% of listed price. Revenue streams: subscription (Rp 99K/199K per month) + Biaya Layanan (Rp1K–4K per transaction). Xendit fee splitting configured to auto-collect Biaya Layanan per transaction.

---
