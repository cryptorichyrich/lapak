## 2. Product Model — Shopify-Style SaaS

### How It Works (Shopify model)
1. Tenant signs up at `lapak.id` → gets `shopname.lapak.id`
2. Picks template → customizes with block editor → adds products → publishes
3. Customers browse, add to cart, checkout, pay (QRIS/VA/e-wallet)
4. Tenant manages orders from dashboard
5. Tenant can upgrade to connect custom domain (`shopname.com`)

### Domain Strategy
| Plan | URL | Checkout |
|---|---|---|
| **Free** | `shopname.lapak.id` | ❌ No checkout — CTA links to WhatsApp |
| **Starter** | `shopname.lapak.id` + custom domain | ✅ Full checkout (Xendit) |
| **Pro** | `shopname.lapak.id` + custom domain | ✅ Full checkout + analytics + remove branding |

**Free users CAN:**
- Build unlimited pages with block editor
- Add products (display only — no cart/checkout)
- Customize theme (colors, fonts, layout)
- CTA buttons link to WhatsApp (like Djualan's free model)
- Publish instantly

**Free users CANNOT:**
- Accept online payments
- Have a shopping cart
- Use custom domain
- Remove "Powered by Lapak" branding

**This is the funnel:** Free users build beautiful storefronts → they want to sell → upgrade to Starter for checkout + payments.

### Pricing (IDR)
**Benchmark:** Djualan charges Rp99K/mo, Rp55K/mo (3-month), Rp42K/mo (annual). All include same features — only period differs.

|| Plan | Price | What you get |
|---|---|---|
|| **Free** | Rp 0 | Unlimited pages, block editor, `shopname.lapak.id`, products display, WhatsApp CTA, 10 AI credits/mo, Link-in-Bio, Blog, SEO Auto-Pilot |
|| **Starter** | Rp 99.000/mo | + Checkout (QRIS/VA/e-wallet via Xendit), + Shipping (JNE/J&T/SiCepat via Everpro), + Custom domain, + "Powered by" removed |
|| **Pro** | Rp 199.000/mo | + Analytics dashboard, + 50 AI credits/mo included, + Priority support, + Staff accounts (up to 3), + Reviews moderation |

**Billing periods (match Djualan's strategy):**
- Monthly: Rp99K/mo (Starter), Rp199K/mo (Pro)
- 3-month: Rp55K/mo billed Rp165K upfront (44% savings)
- Annual: Rp42K/mo billed Rp500K upfront (58% savings)

**0% seller commission.** All transaction costs are passed to the **buyer** at checkout. Seller receives exactly their listed price — zero deductions.

**Buyer checkout breakdown:**
```
Product:          Rp200.000
Ongkir (JNT):      Rp18.000
Biaya Layanan:      Rp2.500   ← Lapak service fee (Rp1K–3K, scales with order value)
Asuransi:           Rp1.500   ← Mandatory, always on (from Everpro `insurance_price`)
PG Fee (QRIS):      Rp1.400   ← ~0.7%, shown as separate line item
Voucher:          -Rp10.000   ← Seller-created, buyer taps to apply (optional)
──────────────────────────────
TOTAL:            Rp213.400
```

**Seller receives: Rp200.000 (exactly their listed price). No deductions.**

**Why buyer-pays-all:**
- Indonesian buyers are trained by Shopee/Tokopedia — they already expect "Biaya Layanan" + "Ongkir" at checkout
- Sellers LOVE "I set Rp200K, I get Rp200K" — clean, predictable, no surprises
- Zero accounting complexity for sellers — no fee reconciliation needed
- Our revenue: **Biaya Layanan Lapak** (Rp1K base + 0.3% for orders >Rp500K). Per-transaction, buyer-funded.
- Djualan passes PG fees to seller. We don't. That's a moat.

**Biaya Layanan Lapak pricing:**
| Order Value | Service Fee |
|---|---|
| Rp0–100K | Rp1.000 |
| Rp100K–500K | Rp2.000 |
| Rp500K–1M | Rp2.500 + 0.3% of excess |
| Rp1M+ | Rp4.000 + 0.2% of excess |

This is NOT a commission from the seller. It's a **buyer-facing service fee** — same model as Shopee's "Biaya Layanan" (Rp1K–4K) and GoFood's "Biaya Layanan."

### Feature Addons (À La Carte)

**Problem with plan-only pricing:** Free users who want ONE feature (custom domain, or analytics) must jump Rp99K/mo. That's a big commitment for Indonesian UMKM. Many churn instead.

**Solution: Feature Addons.** Every paid feature is also available individually as a micro-subscription. Plans become "bundles" (best value), but features are also accessible standalone.

**Why this works:**
- **Lower first-payment barrier.** Rp29K feels like "buying a coffee." Rp99K feels like "a subscription commitment."
- **Compounding revenue.** Free user adds Custom Domain (Rp29K). Then Checkout (Rp49K). Then Analytics (Rp29K). Total: Rp107K/mo — MORE than Starter. They're paying more, one step at a time.
- **Upsell path:** Free + addons → "Switch to Starter and save RpXX/mo!" → Starter → Pro.
- **No plan anxiety.** Sellers never feel "locked out." They see the feature, they see the price, they decide.

**Addon Catalog:**

| Addon | Price | What it unlocks | Included in plan |
|---|---|---|---|
| **Checkout** | Rp 49.000/mo | Cart + Xendit payment (QRIS/VA/e-wallet) + order management | Starter, Pro |
| **Shipping** | Rp 19.000/mo | Multi-courier calc (JNE/J&T/SiCepat) at checkout | Starter, Pro |
| **Custom Domain** | Rp 29.000/mo | Connect own domain + auto SSL via CF for SaaS | Starter, Pro |
| **Remove Branding** | Rp 19.000/mo | Hide "Powered by Lapak" from storefront | Starter, Pro |
| **Analytics** | Rp 29.000/mo | Traffic, conversion, top products, referral sources | Pro |
| **Staff Accounts** | Rp 15.000/mo per seat | Additional login with role-based permissions (editor, viewer) | Pro (3 seats) |
| **Reviews Moderation** | Rp 19.000/mo | Approve/reject reviews, pin featured, respond | Pro |
| **AI Credits Pack** | Rp 25K–150K one-time | 50–500 AI credits (copywriter, SEO, page gen) | All plans |

**Addon rules:**
- **Stacking allowed.** A Free user can add Checkout + Custom Domain = Rp78K/mo. Still cheaper than Starter (Rp99K) but they don't get Shipping or Branding removal. Starter is still a better deal for bundled features.
- **Plan beats addons.** If total addons exceed plan price, show "Switch to Starter and save RpXX/mo!" banner in Studio.
- **Addons are monthly.** Cancel anytime. No commitment.
- **AI Credits are one-time packs.** Not subscription. Expire 12 months.
- **Bundled = always cheaper.** Starter (Rp99K) includes Rp116K worth of features. Pro (Rp199K) includes Rp200K+ worth. Plans always win on value.

**Pricing psychology:**
```
Free user sees Analytics addon:
  "Rp29K/mo? That's like one Nasi Goreng per month. Sure."

vs.

Free user sees Starter plan:
  "Rp99K/mo? Hmm, do I really need all that? Let me think..."
```

**Revenue impact (projected at 1,000 tenants):**
- Plan-only model: ~600 Free, ~300 Starter, ~100 Pro = Rp49.7M/mo
- Addon model: ~600 Free (30% buy addons avg Rp35K) + 300 Starter + 100 Pro = Rp56.1M/mo
- **+13% revenue** from addon conversion of free users who'd never jump to a plan

**Implementation:**
- `tenant_addons` table: `{ tenant_id, addon_slug, status, started_at, expires_at }`
- Addon check middleware: `hasAddon(tenant_id, 'checkout')` → returns true if addon active OR plan includes feature
- Studio shows addon toggle: feature gated → "Enable for Rp29K/mo" → 1-click subscribe via Xendit recurring
- Console shows addon analytics: adoption rate, revenue per addon, plan vs addon revenue split

---
