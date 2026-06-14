# PRD: Lapak — Shopify for Indonesian UMKM

> **Status:** v0.6 — SSR architecture, subproject breakdown, AI credits system, competitive moats
> **Date:** 2026-06-12  
> **Author:** Bio + Hermes  
> **Repo:** Greenfield (`lapak`)  
> **Competitive Analysis:** `competitive-analysis-djualan.md`

---

## 0. MUST USE SKILLS

> **Every Lapak coding session MUST load these skills before writing any code. No exceptions.**

### 🟥 Always Load (8 — mandatory every session)

| # | Skill | Why |
|---|---|---|
| 1 | `lapak` | Master context — architecture, decisions, pitfalls. LOAD FIRST. |
| 2 | `supabase` | All DB, Auth, RLS, Edge Functions, Storage work |
| 3 | `supabase-postgres-best-practices` | Query optimization, indexing, RLS performance |
| 4 | `taste-skill` | Anti-slop frontend — load BEFORE any component |
| 5 | `ui-ux-pro-max` | 67 styles, 161 palettes, 57 fonts, 99 UX guidelines |
| 6 | `mobile-first-design` | 90%+ Indonesian traffic is mobile. Non-negotiable. |
| 7 | `superpowers-methodology` | Disciplined dev: brainstorm → plan → implement → verify |
| 8 | `astro-framework` | Astro v5 islands, SSG, content collections, hydration |

### 🟨 Load When Relevant (by task type)

**Shipping:** `everpro-shipping-integration` · `rajaongkir-api`
**Payments:** `xendit-xenplatform-api`
**Notifications:** `whatsapp-business-api`
**SEO:** `marketing-seo` · `schema-markup` · `open-graph` · `xml-sitemap` · `robots-txt` · `canonical-tag` · `indexing` · `image-optimization`
**Quality:** `web-quality-skills` (seo · performance · accessibility · best-practices) · `lighthouse-audit` · `web-quality-audit`
**Design:** `design-taste-frontend` · `modern-web-design` · `kmp-glassmorphism-ui`
**Animations:** `gsap-scrolltrigger` · `motion-framer` · `animated-component-libraries` · `scroll-reveal-libraries`
**Architecture:** `fullstack-web-architecture`
**Planning:** `writing-plans` · `ai-hero-skills`
**Debugging:** `systematic-debugging`
**Content:** `stop-slop` · `marketing-copy`
**Infra:** `cloudflare-mcp`
**Git:** `github-pr-workflow`

### 🟩 Acquired New (4 — created for Lapak)

| Skill | Purpose |
|---|---|
| `xendit-xenplatform-api` | Payment gateway: invoices, QRIS, VA, e-wallet, sub-accounts, fee splitting, webhooks |
| `rajaongkir-api` | Shipping rates (JNE/J&T/SiCepat/POS/TIKI), waybill tracking |
| `whatsapp-business-api` | Smart Follow-Ups: Fonnte/Wablas/Meta API, abandoned cart, promo broadcasts |
| `astro-framework` | Astro v5: islands, SSG/hybrid, content layer, view transitions, image optimization |

---

## 1. Why This Exists

**Problem:** Corpus was over-engineered. 4 CF services, env-swap deploy dance, KV quota crashes, git vs CLI confusion. Shitty admin. Shitty client dashboard. Nothing editable without a developer.

**Market gap (confirmed via live reverse engineering):** Djualan and pageflow.id exist but each does half the job:
- **pageflow.id** — beautiful block editor, instant publish, but NO e-commerce (no products, no cart, no checkout, no payments)
- **Djualan** (reverse-engineered 2026-06-12) — checkout + payments (Xendit) + shipping (5 regular + 3 instant couriers), AI-generated pages, 27 blocks, 9 templates with copywriting frameworks (PAS, AIDA, SCQA, PASTOR, BAB), BUT:
  - Still BETA ("Belum rilis resmi")
  - Only 8 quick themes, minimal color customization (3 colors)
  - No site navigation between sales pages
  - 5 image limit per product
  - Transfer Manual only for subscription payments
  - Single vertical block layout (no grid/flex)
  - No blog/content pages

**Nobody does both well** — a beautiful block-editor page builder WITH full e-commerce (products, cart, checkout, payments, order management) at a price Indonesian UMKM can afford.

**Lapak = Shopify simplicity + pageflow.id editor + Djualan's Indonesian payment focus — but better. Multi-page real ecommerce websites, not single-page landing pages.**

---

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

## 3. Target Users

### Primary: Indonesian UMKM Owner (WhatsApp seller)
- Sells physical goods (food, fashion, crafts, skincare)
- Currently takes orders via WhatsApp
- Wants a professional web presence without marketplace fees
- No technical skills
- Mobile-first (manages from phone)
- Pays via QRIS

### Secondary: Freelance Web Designer
- Builds sites for UMKM clients
- Wants white-label or agency dashboard
- Custom domain support is critical
- Wants to resell the platform

---

## 4. Competitive Analysis

### Djualan (direct competitor — sales page focus)

**What they do well:**
- AI-generated sales pages from product description (6 categories, 4 writing styles)
- Checkout: QRIS + VA + COD via Xendit
- Shipping: JNE, J&T, SiCepat auto-calculated via Everpro
- 25+ section templates, drag & drop editor
- 0% seller commission — buyer pays all fees (PG, shipping, service fee)
- Pricing: free to create, Rp 99K/mo to publish with checkout
- Subdomain: `shopname.djualan.id` + custom domain
- WhatsApp-ready link previews

**Their weaknesses (our opportunities):**
- **Single sales page, not a full store.** No product catalog, no browsing, no categories
- **No theme system.** Limited visual customization
- **No page builder for homepage.** Each page is a single product pitch
- **No order management dashboard.** Minimal analytics
- **No free custom pages.** Free tier can only create, not publish

### pageflow.id (page builder — no e-commerce)

**What they do well:**
- Clean block editor (click block → edit panel)
- Templates: Product Launch, Bio Link, Portfolio, Wedding, Event, Company Profile
- Instant publish, SEO check, analytics built-in
- Free tier: 1 page forever
- Subdomain: `slug.pages.pageflow.my.id`

**Their weaknesses:**
- **Zero e-commerce.** No products, no cart, no checkout, no payments
- **HTML editor fallback.** Block editor is limited, falls back to raw HTML
- **No multi-page sites.** Each "page" is standalone
- **No custom domains on free**

### Our positioning:

```
              Page Builder Quality
                    ↑
         pageflow ● 
                    |
                    |      ● Lapak (US)
                    |
         Djualan ● 
                    |
                    └──────────────────→ E-commerce Features
```

**We sit in the top-right:** best-in-class block editor AND full e-commerce.

---

## 5. Tech Stack & Subproject Architecture

### Subproject Breakdown

| # | Subproject | Domain | Tech | Users |
|---|---|---|---|---|
| 1 | **Storefront** | `shopname.lapak.id` or custom domain | Astro SSR + Tailwind (CSS var theming) + React islands | Buyers |
| 2 | **Seller Studio** | `studio.lapak.id` | React SPA + shadcn/ui + Tailwind | Sellers |
| 3 | **Platform Console** | `console.lapak.id` | React SPA + shadcn/ui + Tailwind | Platform admins (Bio) |
| 4 | **Marketing Site** | `lapak.id` | Astro SSG + Tailwind (static, zero server cost) | Public |

**Plus shared layers:**
- **Shared UI** — design tokens, Tailwind config, common React components (used by Studio + Console)
- **API Layer** — CF Pages Functions (theme API, AI proxy, webhook handlers, tenant resolution)
- **Edge Logic** — CF Function for tenant routing, caching, custom domain resolution

### Storefront — Buyer-Facing Shop Pages

Everything a CUSTOMER sees when visiting `shopname.lapak.id`:

| Route | Page |
|---|---|
| `/` | Homepage (hero + featured + categories + promos) |
| `/products` | Product catalog (grid, filters, search) |
| `/products/[slug]` | Product detail (images, variants, add-to-cart, "Beli di" external links w/ analytics, reviews) |
| `/category/[slug]` | Category/collection pages |
| `/blog` | Blog index |
| `/blog/[slug]` | Blog post (with product sidebar widget) |
| `/cart` | Shopping cart |
| `/checkout` | Checkout flow (shipping calc, payment select, confirm) |
| `/go/{shop}/{product}/{platform}` | Outbound link redirect (count click → 302 to Shopee/Tokopedia/TikTok/WA) |
| `/promo/[slug]` | Campaign landing pages |
| `/search?q=` | Search results |
| `/[slug]` | Seller-created custom pages (about, contact, etc.) |
| `/sitemap.xml` | Auto-generated sitemap |
| `/robots.txt` | Auto-generated robots |

Tech: **Astro v5 SSR** (`output: 'server'`) deployed to **Cloudflare Pages**. Zero JS by default. React islands only for cart, image gallery, search. Tailwind with CSS variable theming per tenant.

### Seller Studio — Seller Dashboard

Everything the SELLER uses to manage their shop:

| Module | Purpose |
|---|---|
| **Dashboard** | Overview: today's orders, revenue, visitors, pending tasks |
| **Editor** | Custom block editor + live preview (React state binding, 0ms updates) |
| **Products** | CRUD products, variants, pricing, images, inventory |
| **Orders** | Incoming orders, status updates, fulfillment, shipping tracking |
| **Blog** | Write/manage posts, categories |
| **Customers** | CRM with auto-segmentation (Calon pembeli, Pelanggan setia, dll) |
| **Analytics** | Traffic, conversion funnel, revenue, peak hours |
| **Theme** | Colors, typography, spacing, glassmorphism settings |
| **Settings** | Store profile, domain config, payment (Xendit), shipping, staff |
| **AI Tools** | Product Photography, Copywriter, SEO Auto-Pilot, AI Page Gen |
| **AI Settings** | BYOK (paste own key) OR buy AI Credits |

Tech: **React SPA + shadcn/ui + Tailwind**. Mobile-responsive — sellers manage from phone.

### Platform Console — Our Admin

What WE (Bio) use to manage Lapak itself:

| Module | Purpose |
|---|---|
| **Tenants** | Approve/suspend/shops list |
| **Billing** | XenPlatform overview, subscriptions |
| **AI Credits** | Provider keys management, credit packs pricing, usage analytics, markup config |
| **Platform Analytics** | Total tenants, GMV, churn |
| **Feature Flags** | Enable/disable per tier |
| **System Settings** | Default themes, blocks, email templates |

Tech: **React SPA + shadcn/ui + Tailwind**.

### Marketing Site — Our Landing Page

| Route | Page |
|---|---|
| `/` | Hero, features, pricing, CTA |
| `/pricing` | Tier comparison (Free/Starter/Pro) |
| `/ai-credits` | Credit packs pricing |
| `/blog` | Platform blog (SEO, tips, updates) |
| `/docs` | Help docs / FAQ |
| `/signup`, `/login` | Auth flows |

Tech: **Astro SSG + Tailwind** (static, fast, zero server cost).

---

### Frontend (Storefront — what customers see)
- **Astro v5** — SSR (`output: 'server'`), zero JS by default
- **React islands** — cart, checkout, gallery, search (only where interactivity needed)
- **Tailwind CSS v4** — utility-first with CSS variable theme tokens

### Frontend (Studio & Console — what sellers/admins use)
- **React SPA** — block editor + dashboard
- **shadcn/ui** — copy-paste component library (full design control)
- **Tailwind CSS v4** — same token system as storefront
- **Mobile-responsive** (sellers manage from phone)

### Backend
- **Supabase** — single service for everything
  - **Postgres + RLS** — tenant isolation at DB level (no manual WHERE clauses)
  - **Auth** — email/password, Google, magic link, phone OTP
  - **Storage** — product images, tenant assets, theme files
  - **Edge Functions (Deno)** — payment webhooks, AI proxy, rebuild triggers
  - **Realtime** — order notifications for tenant dashboard

### Payments
- **Xendit XenPlatform** (primary) — marketplace model
  - Master account creates sub-accounts per tenant via API
  - Accept payments on behalf: QRIS, VA (BCA/BNI/BRI/Mandiri/Permata), e-wallet (OVO/Dana/LinkAja/ShopeePay), COD
  - Auto fee-splitting (Biaya Layanan collected via Xendit per transaction → platform revenue)
  - Auto-disburse to tenant bank accounts
  - Webhook for payment status updates
  - Sandbox environment for testing
  - Docs: `docs.xendit.co/docs/xenplatform-overview`

### Shipping
- **Everpro** (primary) — same provider Djualan uses
  - Auto-calculated shipping rates: JNE, J&T, SiCepat, POS, TIKI
  - Origin-based calculation (tenant warehouse → customer address)
  - Multiple service levels (REG/YES/CTC/EXP etc.)
  - COD + non-COD support
  - Integrated with Xendit payment flow
  - Fallback: RajaOngkir/Komerce API V2 (same courier coverage, 45% shipping discount, monthly subscription required)

### Infrastructure
- **Cloudflare Pages** — SSR hosting for storefront (edge runtime)
- **Cloudflare KV** — tenant routing cache (Host → tenant_id mapping)
- **Cloudflare Cache** — edge cache 15min per tenant, purge on publish
- **Cloudflare for SaaS** — custom domains (CNAME → auto SSL → route)
- **Supabase free tier** — 500MB Postgres, 1GB Storage, 500K Edge Function invocations

### AI System
- **Cloudflare Workers AI** — default provider (cheapest, zero latency, same infra)
- **BYOK** — sellers bring their own OpenAI/Google/Fal.ai keys
- **AI Credits** — resell provider capacity at 2-3x markup
- See §14 for full AI architecture details

---

## 6. Architecture

### SSR Tenant Resolution Flow

```
Request hits Cloudflare Pages Function (edge)
         ↓
Read Host header (e.g. "toko-vavelle.lapak.id")
         ↓
KV lookup: Host → tenant_id (cached, 15min TTL)
  └── KV miss → Supabase query: SELECT id FROM tenants WHERE slug = ? OR domain = ?
         ↓
Set tenant_id in Astro.locals (available in all pages/layouts)
         ↓
Astro SSR: fetch tenant data from Supabase (theme, pages, products)
         ↓
Render HTML with theme tokens + blocks → response
         ↓
CF edge cache: Cache-Key = Host + path, TTL = 15min
  └── Purge on: page publish, theme change, product update
```

**Edge caching strategy:**
- Cache per tenant (Host header = cache key)
- 15min TTL for most pages
- Purge on publish (via CF Cache Purge API)
- No cache for cart/checkout (always dynamic)
- Stale-while-revalidate for blog/product pages

### Custom Domain Architecture (Cloudflare for SaaS)

```
Seller adds custom domain in Studio Settings
         ↓
We call CF for SaaS API: register custom hostname
  POST /zones/{zone_id}/custom_hostnames
  { hostname: "www.tokovavelle.com", service: "shops.lapak.id" }
         ↓
Show seller DNS instructions:
  "Add CNAME: www.tokovavelle.com → shops.lapak.id"
         ↓
Seller updates DNS at their registrar
         ↓
CF auto-detects CNAME → provisions SSL (free, automatic)
         ↓
Request hits CF edge → CF for SaaS routes to our Pages Function
         ↓
Pages Function reads Host header → resolves tenant → SSR render
         ↓
Store live at www.tokovavelle.com ✅
```

**CF for SaaS details:**
- First 100 custom hostnames free, $0.10/mo after
- Auto SSL certificate provisioning (Let's Encrypt)
- CNAME-based (seller doesn't need to transfer DNS)
- Works with any registrar

### Custom Block Editor Architecture

```
Editor loads page blocks from Supabase → React state
         ↓
Seller clicks block → right panel shows properties
         ↓
Seller edits property → React state update → live preview re-renders (0ms)
         ↓
Auto-save: debounced 2s → Supabase UPDATE pages SET blocks = $1
         ↓
On "Publish": blocks snapshot → published_blocks + edge cache purge
         ↓
Storefront SSR reads published_blocks → renders Astro components
```

**Key decisions:**
- Saves **structured JSON** (not HTML) → theme-aware, portable, versionable
- Live preview = **React state binding** (no iframe, no WebSocket, instant)
- Auto-save debounced 2s to Supabase (Notion-style, no "Save" button needed)
- 30 block types, each with: Astro render component + React editor component
- Block actions: Move Up/Down, Duplicate, Delete, AI Rewrite

### Monorepo Structure (Updated for SSR)

```
lapak/                            # Monorepo
├── apps/
│   ├── storefront/               # Astro SSR — tenant storefront
│   │   ├── src/
│   │   │   ├── pages/            # SSR pages
│   │   │   │   ├── index.astro   # Homepage
│   │   │   │   ├── products/
│   │   │   │   │   ├── index.astro      # Product catalog
│   │   │   │   │   └── [slug].astro     # Product detail
│   │   │   │   ├── category/[slug].astro
│   │   │   │   ├── blog/
│   │   │   │   │   ├── index.astro
│   │   │   │   │   └── [slug].astro
│   │   │   │   ├── cart.astro
│   │   │   │   ├── checkout.astro
│   │   │   │   ├── promo/[slug].astro
│   │   │   │   ├── [slug].astro          # Custom pages
│   │   │   │   └── order/[id].astro
│   │   │   ├── components/
│   │   │   │   ├── blocks/       # Block renderers (Astro)
│   │   │   │   ├── islands/      # React islands (cart, gallery, search)
│   │   │   │   └── layouts/
│   │   │   ├── middleware/        # Tenant resolution
│   │   │   └── lib/              # Supabase client, helpers
│   │   └── astro.config.mjs      # output: 'server', adapter: @astrojs/cloudflare
│   │
│   ├── studio/                   # React SPA — Seller Studio
│   │   ├── src/
│   │   │   ├── features/
│   │   │   │   ├── editor/       # Block editor (Canvas + Panel + blocks)
│   │   │   │   ├── dashboard/    # Overview stats
│   │   │   │   ├── products/     # Product CRUD
│   │   │   │   ├── orders/       # Order management
│   │   │   │   ├── blog/         # Blog management
│   │   │   │   ├── customers/    # CRM
│   │   │   │   ├── analytics/    # Traffic, conversion
│   │   │   │   ├── theme/        # Theme settings
│   │   │   │   ├── settings/     # Store config
│   │   │   │   └── ai/           # AI tools + credit management
│   │   │   ├── components/       # Shared UI (shadcn-based)
│   │   │   └── App.tsx
│   │   └── package.json
│   │
│   ├── console/                  # React SPA — Platform Console
│   │   ├── src/
│   │   │   ├── features/
│   │   │   │   ├── tenants/      # Tenant management
│   │   │   │   ├── billing/      # XenPlatform overview
│   │   │   │   ├── ai-credits/   # Provider keys, pricing, usage
│   │   │   │   ├── analytics/    # Platform analytics
│   │   │   │   ├── flags/        # Feature flags
│   │   │   │   └── settings/     # System settings
│   │   │   └── App.tsx
│   │   └── package.json
│   │
│   └── marketing/                # Astro SSG — lapak.id
│       ├── src/
│       │   ├── pages/
│       │   │   ├── index.astro   # Landing
│       │   │   ├── pricing.astro
│       │   │   ├── ai-credits.astro
│       │   │   ├── blog/
│       │   │   ├── docs/
│       │   │   ├── signup.astro
│       │   │   └── login.astro
│       │   └── components/
│       └── astro.config.mjs      # output: 'static'
│
├── packages/
│   ├── shared/                   # Shared types, schemas, utils
│   │   ├── blocks.ts             # Block type definitions + schemas
│   │   ├── theme.ts              # Theme token types
│   │   ├── types.ts              # Product, Order, Page types
│   │   └── ai.ts                 # AI provider types, credit models
│   │
│   └── ui/                       # Shared UI components
│       ├── tailwind.config.ts    # Shared Tailwind config + design tokens
│       └── components/           # Common React components (Studio + Console)
│
├── supabase/
│   ├── migrations/               # Database schema (versioned)
│   ├── functions/
│   │   ├── checkout/index.ts     # Create Xendit invoice
│   │   ├── webhook-xendit/index.ts  # Payment callbacks
│   │   ├── shipping/index.ts     # Everpro shipping calc
│   │   ├── ai-proxy/index.ts     # AI proxy (BYOK + credits)
│   │   └── theme/index.ts        # Theme API (used by storefront SSR)
│   └── config.toml
│
└── package.json                  # Monorepo root (pnpm workspaces)
```

---

## 7. Block Types (MVP — 30 blocks)

> **Based on 100% reverse-engineering of Djualan's 27 blocks + Lapak originals (Reviews, Navigation, Footer)**
> Full field schemas: `competitive-analysis-djualan.md` §21

### Categories
- **UTAMA** (6): Hero, Manfaat, Testimoni, Form Pemesanan, FAQ, WhatsApp
- **PENDUKUNG** (15): Masalah, Garansi, Bonus, Hitung Mundur, Pengumuman, Galeri, Sebelum & Sesudah, Cara Order, Bukti Sosial, Video, Form Lead, Booking, Profil Penjual, Sertifikasi, Paket Harga
- **TAMBAHAN** (9): Teks, Gambar, Gambar & Teks, Tombol, Pemisah, Running Text, Logo Media, Animasi, Embed

### Universal Block Features
- **Actions:** Move Up / Move Down / Duplicate / Delete / AI Rewrite
- **Tampilan (Appearance):** Background color/image + Text color + Inner padding (0/S/M/L) + Block margin (0/S/M/L/XL) + Reset
- **Schema:** Strict JSON per block type, validated in editor + at build
- **Render:** Astro component (SSG) + React editor component
- **Theme:** CSS tokens (colors, fonts, spacing, radius)
- **Responsive:** Mobile-first by default

### Block Field Summary

**UTAMA:**

| Block | Purpose | Key Fields |
|---|---|---|
| **Hero** | Landing banner | heading, subheading, CTA button, hero image, rating, bullet points (3/6), price |
| **Manfaat** | Benefits | layout (cards/list), heading, items[] {title, desc, icon} (3/6) |
| **Testimoni** | Social proof | heading, tabbed items[] {name, text, rating, avatar, source} (3/8) |
| **Form Pemesanan** | Order form | heading, fields (name/phone/address/notes), product selector, qty, payment, WA integration |
| **FAQ** | Questions | heading, items[] {question, answer} (3/10), accordion toggle |
| **WhatsApp** | CTA button | heading, button text, WA number, pre-filled message, floating toggle |

**PENDUKUNG:**

| Block | Purpose | Key Fields |
|---|---|---|
| **Masalah** | Problem agitation | heading, problem items[] {text} (3/5), 4 starters |
| **Garansi** | Guarantee/trust | heading, description, button, badges[] {text} (3/6) |
| **Bonus** | Value stacking | eyebrow, heading, desc, layout (cards/list/compact), columns (2/3), items[] {name, price} (3/8), total toggle, save% toggle, order note |
| **Hitung Mundur** | Urgency timer | heading, date picker, time picker, expiry action (hide section) |
| **Pengumuman** | Announcement bar | text, dismissible toggle |
| **Galeri** | Image gallery | heading, columns (2/3), images[] (0/6, upload/URL, JPG/PNG/WebP 10MB) |
| **Sebelum & Sesudah** | Before/after | layout (2col/photo), heading, labels, items[] {image, text} (3/5) |
| **Cara Order** | How to order | layout (horiz/vert), heading, steps[] {title, desc} (5/6, numbered) |
| **Bukti Sosial** | Social proof stats | stats[] {value, label}, stars, testimoni cards[] |
| **Video** | Video embed | heading, URL (YouTube/Vimeo) |
| **Form Lead** ⭐ | Lead capture | eyebrow, heading, desc, layout (4 options), fields[] (3/10, custom types + IDs), button, WA target, message template with {variables}, after-submit action (WA/Message/Redirect), success message, privacy note |
| **Booking** | Appointment booking | heading, date/time picker, slots, contact fields, confirmation (WA/email) |
| **Profil Penjual** | Seller profile | avatar, name, bio, social links[], trust badges |
| **Sertifikasi** | Certifications | heading, items[] {image, title, issuer, year} (3/6) |
| **Paket Harga** | Pricing tiers | heading, packages[] {name, price, period, desc, highlight, features[], button} (3/4) |

**TAMBAHAN:**

| Block | Purpose | Key Fields |
|---|---|---|
| **Teks** | Rich text | WYSIWYG content (headings, bold, italic, lists, links) |
| **Gambar** | Single image | upload/URL, alt text, link, width/height |
| **Gambar & Teks** | Image + text combo | image, rich text, layout (left/right), vertical alignment |
| **Tombol** | Button | text, URL, style (primary/secondary/outline), size, full-width, icon |
| **Pemisah** | Divider | style (line/dots/space/gradient), color, width, thickness |
| **Running Text** | Marquee | text, speed, direction, pause-on-hover |
| **Logo Media** | As seen on | heading, logos[] (3/10, image + URL), layout, grayscale toggle |
| **Animasi** | Lottie animation | category picker, size, speed, 9 color presets + custom |
| **Embed** | Iframe | URL, height, responsive toggle, border toggle |

### ⭐ NEW: Lapak Exclusive Blocks (Not in Djualan)

| Block | Purpose | Key Fields |
|---|---|---|
| **Reviews** ⭐ | Product/store reviews | heading, source (manual/auto), items[] {name, rating, text, avatar, date, product}, filter by rating, sort (newest/highest), min display count, "Write a review" CTA |
| **Navigation** ⭐ | Site nav bar | logo, links[] {text, url, children[]}, sticky toggle, transparent toggle, mobile hamburger |
| **Footer** ⭐ | Site footer | columns[] {title, links[]}, social links[], copyright, payment method logos |

---

## 8. Database Schema (Supabase)

```sql
-- ═══════════════════════════════════════
-- TENANTS
-- ═══════════════════════════════════════
create table tenants (
  id          uuid primary key default gen_random_uuid(),
  owner_id    uuid not null references auth.users(id) on delete cascade,
  name        text not null,                    -- "Toko Vavelle"
  slug        text not null unique,             -- "toko-vavelle" → toko-vavelle.lapak.id
  domain      text,                             -- custom domain: "tokovavelle.com"
  plan        text not null default 'free',     -- free | starter | pro
  plan_expires_at timestamptz,
  xendit_account_id text,                       -- Xendit sub-account ID (created on upgrade)
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);

-- ═══════════════════════════════════════
-- THEME
-- ═══════════════════════════════════════
create table theme_settings (
  id          uuid primary key default gen_random_uuid(),
  tenant_id   uuid not null references tenants(id) on delete cascade unique,
  tokens      jsonb not null default '{
    "colors": {
      "primary": "#0f172a",
      "primaryContent": "#ffffff",
      "secondary": "#1e293b",
      "accent": "#c9a84c",
      "background": "#ffffff",
      "surface": "#f8fafc"
    },
    "fonts": {
      "heading": "Inter",
      "body": "Inter"
    },
    "radius": "0.75rem",
    "spacing": "1rem"
  }',
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);

-- ═══════════════════════════════════════
-- PAGES (page builder output)
-- ═══════════════════════════════════════
create table pages (
  id          uuid primary key default gen_random_uuid(),
  tenant_id   uuid not null references tenants(id) on delete cascade,
  slug        text not null,                    -- "home", "about", "menu"
  title       text not null,
  blocks      jsonb not null default '[]',      -- [{type, props}] ordered array
  status      text not null default 'draft',    -- draft | published
  published_blocks jsonb,                       -- snapshot at publish time
  meta_title  text,
  meta_description text,
  created_at  timestamptz default now(),
  updated_at  timestamptz default now(),
  unique(tenant_id, slug)
);

-- ═══════════════════════════════════════
-- PRODUCTS
-- ═══════════════════════════════════════
create table products (
  id              uuid primary key default gen_random_uuid(),
  tenant_id       uuid not null references tenants(id) on delete cascade,
  name            text not null,
  slug            text not null,
  description     text,
  price           integer not null,             -- IDR (no decimals)
  compare_price   integer,                      -- strikethrough
  images          jsonb default '[]',           -- [{url, alt}]
  category_id     uuid references categories(id) on delete set null,
  weight          decimal(6,2),                 -- kg (needed for shipping calc)
  unit            text default 'pcs',
  is_active       boolean default true,
  stock           integer,                      -- null = unlimited
  variants        jsonb default '[]',           -- [{name: "Ukuran", options: ["S","M","L"]}] — simple JSONB, no separate table
  external_links  jsonb default '[]',           -- [{platform: "shopee", url: "https://..."}, ...] — "Beli di" buttons, tracked via /go/ redirect, rel="noopener" for SEO
  metadata        jsonb default '{}',           -- extensible: brand, material, etc.
  seo_title       text,
  seo_description text,
  created_at      timestamptz default now(),
  updated_at      timestamptz default now(),
  unique(tenant_id, slug)
);

-- ═══════════════════════════════════════
-- CATEGORIES
-- ═══════════════════════════════════════
create table categories (
  id          uuid primary key default gen_random_uuid(),
  tenant_id   uuid not null references tenants(id) on delete cascade,
  name        text not null,
  slug        text not null,
  description text,
  image_url   text,
  sort_order  integer default 0,
  created_at  timestamptz default now(),
  unique(tenant_id, slug)
);

-- ═══════════════════════════════════════
-- BLOG POSTS
-- ═══════════════════════════════════════
create table blog_posts (
  id              uuid primary key default gen_random_uuid(),
  tenant_id       uuid not null references tenants(id) on delete cascade,
  title           text not null,
  slug            text not null,
  content         jsonb not null default '[]',     -- Tiptap/ProseMirror JSON
  excerpt         text,
  featured_image  text,
  category_id     uuid references blog_categories(id) on delete set null,
  status          text not null default 'draft',   -- draft | published
  published_at    timestamptz,
  seo_title       text,
  seo_description text,
  og_image        text,
  created_at      timestamptz default now(),
  updated_at      timestamptz default now(),
  unique(tenant_id, slug)
);

-- ═══════════════════════════════════════
-- BLOG CATEGORIES
-- ═══════════════════════════════════════
create table blog_categories (
  id          uuid primary key default gen_random_uuid(),
  tenant_id   uuid not null references tenants(id) on delete cascade,
  name        text not null,
  slug        text not null,
  created_at  timestamptz default now(),
  unique(tenant_id, slug)
);

-- ═══════════════════════════════════════
-- TENANT SETTINGS (extended config)
-- ═══════════════════════════════════════
create table tenant_settings (
  id                uuid primary key default gen_random_uuid(),
  tenant_id         uuid not null references tenants(id) on delete cascade unique,
  tagline           text,
  logo_url          text,
  favicon_url       text,
  og_image_url      text,
  wa_number         text,                           -- WhatsApp business number
  email             text,
  address           text,
  ai_mode           text not null default 'credits', -- credits | byok
  ai_key_encrypted  text,                            -- encrypted BYOK key (Supabase vault)
  ai_credits_balance integer not null default 10,    -- free 10/month
  meta              jsonb default '{}',              -- extensible settings
  created_at        timestamptz default now(),
  updated_at        timestamptz default now()
);

-- ═══════════════════════════════════════
-- AI USAGE LOG
-- ═══════════════════════════════════════
create table ai_usage_log (
  id              uuid primary key default gen_random_uuid(),
  tenant_id       uuid not null references tenants(id) on delete cascade,
  task            text not null,                    -- copywriter | seo | page_gen | rewrite | photography
  model           text not null,                    -- e.g. "qwen3-30b-a3b-fp8"
  provider        text not null,                    -- cloudflare | openai | google | anthropic
  tokens_in       integer,
  tokens_out      integer,
  credits_deducted integer not null default 0,
  cost_usd        decimal(10,6),                    -- our actual cost
  latency_ms      integer,
  success         boolean default true,
  error           text,
  created_at      timestamptz default now()
);

-- ═══════════════════════════════════════
-- AI CREDIT PURCHASES
-- ═══════════════════════════════════════
create table ai_credit_purchases (
  id              uuid primary key default gen_random_uuid(),
  tenant_id       uuid not null references tenants(id) on delete cascade,
  credits         integer not null,
  amount_idr      integer not null,                 -- amount paid in IDR
  payment_ref     text,                             -- Xendit invoice ID
  status          text not null default 'pending',  -- pending | paid | failed
  paid_at         timestamptz,
  expires_at      timestamptz,                      -- 12 months after purchase
  created_at      timestamptz default now()
);

-- ═══════════════════════════════════════
-- PLATFORM SETTINGS (global config)
-- ═══════════════════════════════════════
create table platform_settings (
  id    text primary key,                           -- 'feature_flags', 'rate_limits', 'email_templates', etc.
  value jsonb not null default '{}',
  updated_at timestamptz default now()
);

-- ═══════════════════════════════════════
-- TENANT ADDONS (à la carte features)
-- ═══════════════════════════════════════
create table tenant_addons (
  id          uuid primary key default gen_random_uuid(),
  tenant_id   uuid not null references tenants(id) on delete cascade,
  addon_slug  text not null,                        -- 'checkout', 'shipping', 'custom_domain', 'remove_branding', 'analytics', 'staff_seat', 'reviews_moderation'
  status      text not null default 'active',       -- 'active', 'cancelled', 'expired'
  price_idr   int not null,                         -- monthly price at time of subscription
  xendit_subscription_id text,                      -- Xendit recurring payment reference
  started_at  timestamptz not null default now(),
  expires_at  timestamptz,                          -- null = active until cancelled
  cancelled_at timestamptz,
  created_at  timestamptz not null default now(),
  unique(tenant_id, addon_slug, status)             -- one active addon per type per tenant
);
create index idx_tenant_addons_tenant on tenant_addons(tenant_id);
create index idx_tenant_addons_slug on tenant_addons(addon_slug);

-- ═══════════════════════════════════════
-- SHIPPING ORIGINS (tenant warehouse addresses)
-- ═══════════════════════════════════════
create table shipping_origins (
  id          uuid primary key default gen_random_uuid(),
  tenant_id   uuid not null references tenants(id) on delete cascade unique,
  label       text not null default 'Gudang Utama',
  province    text not null,
  city        text not null,
  district    text not null,
  postal_code text not null,
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);

alter table shipping_origins enable row level security;
create policy "shipping_origins: tenant scoped"
  on shipping_origins for all
  using (tenant_id = auth.tenant_id());

-- ═══════════════════════════════════════
-- VOUCHERS (seller-created, Tokopedia-style tap-to-apply)
-- ═══════════════════════════════════════
create table vouchers (
  id              uuid primary key default gen_random_uuid(),
  tenant_id       uuid not null references tenants(id) on delete cascade,
  name            text not null,                    -- "Diskon Ramadhan 10%"
  type            text not null,                    -- 'percentage' | 'fixed' | 'free_shipping'
  value           integer not null,                 -- 10 (%), 10000 (Rp), 0 (free_shipping)
  max_discount    integer,                          -- Cap for percentage type (e.g., Rp50K)
  min_order       integer not null default 0,       -- Minimum subtotal to qualify
  max_uses        integer not null default 0,       -- 0 = unlimited
  max_uses_per_buyer integer not null default 1,    -- How many times same buyer can use
  used_count      integer not null default 0,       -- Track total redemptions
  starts_at       timestamptz not null,
  ends_at         timestamptz not null,
  is_active       boolean not null default true,
  created_at      timestamptz default now()
);

alter table vouchers enable row level security;
create policy "vouchers: tenant scoped"
  on vouchers for all
  using (tenant_id = auth.tenant_id());

-- ═══════════════════════════════════════
-- VOUCHER USAGES (track redemptions per order)
-- ═══════════════════════════════════════
create table voucher_usages (
  id          uuid primary key default gen_random_uuid(),
  voucher_id  uuid not null references vouchers(id) on delete cascade,
  order_id    uuid not null references orders(id) on delete cascade,
  tenant_id   uuid not null references tenants(id) on delete cascade,
  buyer_phone text not null,              -- Track per-buyer usage
  discount    integer not null,           -- Actual discount amount applied (Rp)
  created_at  timestamptz default now(),
  unique(voucher_id, order_id)            -- One voucher per order
);

alter table voucher_usages enable row level security;
create policy "voucher_usages: tenant scoped"
  on voucher_usages for all
  using (tenant_id = auth.tenant_id());

-- ═══════════════════════════════════════
-- EXTERNAL LINK CLICKS (analytics for outbound "Beli di" links)
-- ═══════════════════════════════════════
create table external_link_clicks (
  id          uuid primary key default gen_random_uuid(),
  tenant_id   uuid not null references tenants(id) on delete cascade,
  product_id  uuid not null references products(id) on delete cascade,
  platform    text not null,                    -- 'shopee' | 'tokopedia' | 'tiktok' | 'whatsapp' | 'other'
  referrer    text,                             -- page the click came from
  user_agent  text,
  ip_address  text,
  created_at  timestamptz default now()
);

alter table external_link_clicks enable row level security;
create policy "external_link_clicks: tenant scoped"
  on external_link_clicks for all
  using (tenant_id = auth.tenant_id());

create index idx_elc_tenant_product on external_link_clicks(tenant_id, product_id);
create index idx_elc_created_at on external_link_clicks(created_at);

-- ═══════════════════════════════════════
-- ORDERS
-- ═══════════════════════════════════════
create table orders (
  id              uuid primary key default gen_random_uuid(),
  tenant_id       uuid not null references tenants(id) on delete cascade,
  order_number    text not null,                -- "ORD-20260612-001"
  customer_name   text not null,
  customer_phone  text not null,
  customer_email  text,
  customer_address text,
  items           jsonb not null,               -- [{product_id, name, qty, price, weight}]
  subtotal        integer not null,
  shipping_cost   integer default 0,
  shipping_courier text,                        -- "jne", "jnt", "sicepat"
  shipping_service text,                        -- "REG", "YES", "CTC"
  tracking_number text,
  buyer_service_fee integer not null default 0, -- Biaya Layanan (Rp1K–4K, buyer pays)
  buyer_pg_fee     integer not null default 0,  -- PG fee passed to buyer
  buyer_insurance  integer not null default 0,  -- Mandatory insurance (Everpro `insurance_price`)
  voucher_id       uuid references vouchers(id), -- Applied voucher (null = no voucher)
  voucher_discount integer not null default 0,   -- Discount amount from voucher
  seller_receives  integer not null,            -- Exact amount seller gets (= subtotal)
  total           integer not null,             -- What buyer pays (subtotal + shipping + fees - voucher)
  status          text not null default 'pending',
  -- pending | paid | processing | shipped | completed | cancelled | refunded
  payment_method  text,                         -- qris | va | ewallet | cod
  payment_gateway text not null default 'xendit',
  payment_ref     text,                         -- Xendit invoice ID
  payment_url     text,                         -- Xendit payment URL
  paid_at         timestamptz,
  shipped_at      timestamptz,
  completed_at    timestamptz,
  notes           text,
  created_at      timestamptz default now(),
  updated_at      timestamptz default now(),
  unique(tenant_id, order_number)
);

-- ═══════════════════════════════════════
-- REVIEWS (Product & Store Reviews)
-- ═══════════════════════════════════════
create table reviews (
  id          uuid primary key default gen_random_uuid(),
  tenant_id   uuid not null references tenants(id) on delete cascade,
  product_id  uuid references products(id) on delete cascade,
  order_id    uuid references orders(id) on delete set null,
  customer_name  text not null,
  customer_phone text,                           -- for verification
  rating      smallint not null check (rating between 1 and 5),
  title       text,
  body        text,
  avatar_url  text,                              -- optional customer photo
  is_verified boolean default false,             -- verified = from actual order
  is_featured boolean default false,             -- seller can pin reviews
  status      text not null default 'pending',   -- pending | approved | rejected
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);

-- ═══════════════════════════════════════
-- LEADS (Form Lead submissions)
-- ═══════════════════════════════════════
create table leads (
  id          uuid primary key default gen_random_uuid(),
  tenant_id   uuid not null references tenants(id) on delete cascade,
  page_id     uuid references pages(id) on delete set null,
  source_block text,                             -- which Form Lead block
  name        text,
  phone       text,                              -- WhatsApp number
  email       text,
  fields      jsonb not null default '{}',       -- custom field values {field_id: value}
  tags        text[] default '{}',               -- auto-tagged segments
  opted_in    boolean default true,              -- consent for follow-ups
  unsubscribed_at timestamptz,                   -- if they reply STOP
  created_at  timestamptz default now()
);

-- ═══════════════════════════════════════
-- CART (for abandoned cart recovery)
-- ═══════════════════════════════════════
create table carts (
  id          uuid primary key default gen_random_uuid(),
  tenant_id   uuid not null references tenants(id) on delete cascade,
  session_id  text not null,                     -- browser session or cookie
  customer_phone text,                           -- if known
  items       jsonb not null default '[]',       -- [{product_id, name, qty, price}]
  recovery_sent_count integer default 0,         -- how many follow-ups sent
  recovered   boolean default false,             -- converted to order?
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);

-- ═══════════════════════════════════════
-- FOLLOW-UPS (Smart Follow-Up Log)
-- ═══════════════════════════════════════
create table follow_ups (
  id          uuid primary key default gen_random_uuid(),
  tenant_id   uuid not null references tenants(id) on delete cascade,
  lead_id     uuid references leads(id) on delete set null,
  order_id    uuid references orders(id) on delete set null,
  cart_id     uuid references carts(id) on delete set null,
  type        text not null,                     -- abandoned_cart | abandoned_checkout | promo_blast | price_drop | back_in_stock | review_request | order_update
  channel     text not null default 'whatsapp',  -- whatsapp | email
  template_id text,                              -- message template used
  content     text not null,                     -- rendered message content
  status      text not null default 'queued',    -- queued | sent | delivered | failed | opted_out
  sent_at     timestamptz,
  delivered_at timestamptz,
  error       text,
  created_at  timestamptz default now()
);

-- ═══════════════════════════════════════
-- FOLLOW-UP TEMPLATES
-- ═══════════════════════════════════════
create table follow_up_templates (
  id          uuid primary key default gen_random_uuid(),
  tenant_id   uuid references tenants(id) on delete cascade,  -- null = system default
  type        text not null,                     -- abandoned_cart | promo_blast | etc
  name        text not null,                     -- "Gentle Cart Reminder"
  content     text not null,                     -- "Hey {name}, kamu left {product}..."
  is_default  boolean default false,
  created_at  timestamptz default now()
);

-- ═══════════════════════════════════════
-- TEMPLATES (pre-made starter packs)
-- ═══════════════════════════════════════
create table templates (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,                    -- "Food Stall", "Fashion Store"
  slug        text not null unique,
  category    text not null,                    -- food | fashion | services | digital
  thumbnail   text,                             -- preview image URL
  blocks      jsonb not null,                   -- default page blocks
  theme       jsonb not null,                   -- default theme tokens
  is_active   boolean default true,
  created_at  timestamptz default now()
);

-- ═══════════════════════════════════════
-- RLS POLICIES
-- ═══════════════════════════════════════

-- Helper: get tenant_id from JWT claims
create function auth.tenant_id()
returns uuid language sql stable
return (auth.jwt() -> 'app_metadata' ->> 'tenant_id')::uuid;

-- Tenants: owner can only see their own
alter table tenants enable row level security;
create policy "tenants: owner access"
  on tenants for all
  using (owner_id = auth.uid());

-- All tenant-scoped tables: filter by tenant_id
alter table products enable row level security;
create policy "products: tenant scoped"
  on products for all
  using (tenant_id = auth.tenant_id());

alter table pages enable row level security;
create policy "pages: tenant scoped"
  on pages for all
  using (tenant_id = auth.tenant_id());

alter table orders enable row level security;
create policy "orders: tenant scoped"
  on orders for all
  using (tenant_id = auth.tenant_id());

alter table theme_settings enable row level security;
create policy "theme: tenant scoped"
  on theme_settings for all
  using (tenant_id = auth.tenant_id());
```

---

## 9. User Flows

### Flow 1: Sign Up & Onboard
```
1. Visit lapak.id → "Mulai Gratis"
2. Sign up (email + password OR Google)
3. Enter business name: "Toko Vavelle"
4. Auto-generate slug: "toko-vavelle" → toko-vavelle.lapak.id
5. Pick template (Food Stall / Fashion Store / General / Blank)
6. Template pre-fills: homepage blocks + theme + sample products
7. Land in editor → customize → publish
8. Store live at toko-vavelle.lapak.id
```

### Flow 2: Edit Page (Free user)
```
1. Dashboard → Pages → "Home"
2. Block editor loads
3. Click Hero block → right panel shows: title, subtitle, CTA
4. Edit "Pesan via WhatsApp" → saves automatically
5. Click "+ Add Block" → pick Product Grid → configure
6. Preview (mobile/desktop toggle)
7. Publish → rebuild triggered → live in ~2 min
```

### Flow 3: Customer Buys (Starter/Pro only)
```
1. Visit toko-vavelle.lapak.id
2. Browse products → Add to cart (React island)
3. Cart slide-out → "Checkout"
4. Checkout form: name, phone, full address
5. Choose shipping: JNE REG/YES, J&T, SiCepat (auto-calculated via Everpro)
6. [VOUCHER] Tap "Pakai Voucher" → shows available vouchers from this seller
   - Vouchers auto-filtered: minimum order met, not expired, still has quota
   - Buyer taps one → discount applied instantly
   - No code typing — just tap to select (Tokopedia style)
7. Choose payment: QRIS / VA / e-wallet
8. Click "Bayar" → Edge Function creates Xendit invoice on tenant's sub-account
9. Redirect to Xendit payment page
10. Pay → Xendit webhook → order.status = 'paid'
11. Shipment created via Everpro → tracking number assigned
12. Tenant gets notification (dashboard + WhatsApp)
13. Customer sees order confirmation page with tracking
```

### Flow 4: Free User Wants Checkout (Upgrade)
```
1. Free user adds products, builds pages
2. Tries to enable checkout → modal: "Upgrade to Starter"
3. Pricing page: Rp 99.000/mo
4. Pay via QRIS (recursive — we use Xendit to accept our own payments)
5. Plan upgraded → Xendit sub-account auto-created for tenant
6. Checkout + shipping unlocked
```

### Flow 5: Custom Domain (Starter/Pro)
```
1. Settings → Domain → "tokovavelle.com"
2. Instructions shown: "Add CNAME: tokovavelle.com → toko-vavelle.lapak.id"
3. Tenant updates DNS at their registrar
4. Our Cloudflare proxy detects → provisions SSL
5. Store accessible at tokovavelle.com
```

---

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

## 11. What's OUT of MVP (v2+)

- ❌ Stock/inventory management (products show "in stock" or hide, no tracking)
- ✅ ~~Shipping rate calculation~~ → **Promoted to MVP via Everpro**
- ✅ ~~Reviews/ratings~~ → **Promoted to MVP** (Reviews block + auto-collect after order)
- ✅ ~~AI content generation~~ → **Promoted to MVP** (AI proxy + BYOK + credits system, powered by CF Workers AI)
- ❌ Multi-currency (IDR only)
- ❌ Digital products / downloads
- ✅ ~~Blog / CMS~~ → **Promoted to MVP** (blog index, posts, product sidebar widget — key SEO moat)
- ❌ Multi-staff accounts
- ❌ Discount codes / coupons
- ✅ ~~Product variants~~ → **Promoted to MVP** (JSONB variants — simple `[ {name: "Ukuran", options: ["S","M","L"]}]` on products table. No separate table. Covers 80% of UMKM needs.)
- ❌ Wishlists
- ❌ AI Product Photography (v2 — requires image gen pipeline)
- ❌ AI Page Generation from description (v2 — complex prompt engineering)
- ❌ Smart Follow-Ups / WhatsApp automation (v2 — requires WA provider setup)
- ✅ ~~Link-in-Bio page~~ → **Promoted to MVP** (simple bio page with avatar + links + social + WA. Quick build, high value for Instagram/TikTok sellers.)
- ❌ Reviews moderation (v3 — Pro plan paywall)

### ⭐ NEW IN MVP: Lead Capture + Smart Follow-Ups

**Goal:** Sellers capture leads via Form Lead block → build a contact list → send timely, personalized follow-ups that recover lost sales and drive repeat purchases.

#### Lead Capture System
- **Form Lead block** (already in block library): captures name, phone, email, custom fields
- **Lead database**: every form submission stored in `leads` table per tenant
- **Lead segments**: Auto-tag leads by source (page/block), activity, date
- **Lead export**: CSV download for WA blast tools (WABlas, WA Gateway)
- **Double opt-in**: optional WhatsApp verification via OTP

#### Smart Follow-Ups (WhatsApp-first)
Indonesian sellers live on WhatsApp. Automated, personalized WA messages that feel human — not robotic blasts.

| Trigger | Notification | Target | Plan |
|---|---|---|---|
| **Abandoned Cart** | "Hey {name}, kamu left {product} di keranjang! Selesaikan order ya 🛒" | Cart abandoned 1hr / 24hr | Starter+ |
| **Abandoned Checkout** | "Order {order_id} belum dibayar. Bayar sekarang ya! Link: {url}" | Unpaid after 30min / 2hr / 24hr | Starter+ |
| **Promo Blast** | Seller writes message → sends to segment/all leads | All leads or segment | Pro |
| **Price Drop Alert** | "{product} turun dari Rp{old} ke Rp{new}! Cek sekarang 🔥" | Leads who viewed product | Pro |
| **Back in Stock** | "{product} sudah tersedia lagi! Order sekarang 👉 {url}" | Leads who expressed interest | Pro |
| **Review Request** | "Terima kasih udah order! Bantu review ya ⭐ {url}" | 3 days after order completed | Starter+ |
| **Order Update** | "Pesanan {id} sedang dikirim via {courier}. Track: {link}" | Auto on status change | Starter+ |

#### Smart Follow-Up Engine
- **WA Business API** via third-party provider (Fonnte, Wablas, or direct Meta API)
- **Follow-up queue**: Supabase Edge Function + `pg_cron` for scheduled sends
- **Rate limits**: Max 100 messages/day on Starter, unlimited on Pro
- **Opt-out**: Every message includes "Balas STOP untuk berhenti"
- **Dashboard**: View sent count, delivery rate, click-through per campaign
- **Templates**: Pre-built message templates with variable substitution (`{name}`, `{product}`, `{price}`, `{url}`)

#### Abandoned Cart Recovery Flow
1. Customer adds item to cart → cart saved in `cart` table with `created_at`
2. Customer leaves without paying → `pg_cron` job checks every 5 min for carts > 1hr
3. Edge Function sends WA notification via template
4. If still unpaid at 24hr → second reminder (different template, more urgent)
5. If still unpaid at 72hr → final reminder with potential discount offer
6. All notifications tracked in `notification_log` table

#### Promo Blast Flow
1. Seller opens "Notifikasi" in dashboard
2. Selects segment: All leads / Recent visitors / Past buyers / Custom segment
3. Writes message (with template selector)
4. Schedules: Send now / Schedule for later
5. Confirms → queued for delivery
6. Dashboard shows delivery stats

---

## 12. Development Breakdown — 5 Phases (Complete)

> **Coverage map:** Every step references its PRD section. No section left uncovered.

### Phase 1: Foundation & Infrastructure (Week 1)
**Goal:** Monorepo running, Supabase schema + RLS, auth, tenant resolution, R2 storage, edge caching
**PRD refs:** §5 (tech stack), §6 (architecture), §8 (DB schema), §16 (R2 storage)

| # | Step | Description | Ref |
|---|---|---|---|
| 1.1 | **Init monorepo** | pnpm workspaces: `apps/(storefront, studio, console, marketing)` + `packages/(shared, ui, blocks)`. Shared Tailwind config + design tokens + TS types. | §5 |
| 1.2 | **Astro SSR config** | `output: 'server'`, `@astrojs/cloudflare` adapter. `astro.config.ts` with server port, node compatibility. CF Pages project created, connected to GitHub `main` branch. | §5, §6 |
| 1.3 | **Supabase project** | Create project in `ap-southeast-1` (Singapore). Enable pgcrypto, pg_net extensions. Set up Supabase CLI with `supabase/` folder for migrations. | §8 |
| 1.4 | **Supabase migrations — core tables** | `tenants`, `tenant_settings` (plan, domain, ai_mode, ai_credits_balance, ai_key_encrypted), `users` (with tenant_id FK), `themes` | §8 |
| 1.5 | **Supabase migrations — content tables** | `pages`, `blocks`, `products` (with variants, images JSONB), `categories`, `blog_posts`, `blog_categories` | §7, §8 |
| 1.6 | **Supabase migrations — commerce tables** | `orders`, `order_items`, `reviews`, `leads`, `follow_ups`, `shipping_zones` | §8 |
| 1.7 | **Supabase migrations — AI tables** | `ai_usage_log` (tenant_id, task, model, tokens_in, tokens_out, cost, created_at), `ai_credit_purchases` (tenant_id, credits, amount, paid_at) | §8, §17 |
| 1.8 | **RLS policies** | Every table gets RLS. Tenants see only their data. Platform admins bypass via `auth.jwt() → role = 'platform_admin'`. Test with two tenants to confirm isolation. | §8, §6 |
| 1.9 | **Supabase Auth** | Email + Google OAuth + magic link. Custom JWT claims: `tenant_id`, `role` (owner/staff/platform_admin). Trigger: auto-create tenant row on signup. | §8, §9 |
| 1.10 | **Tenant resolution middleware** | Astro middleware: `request.headers.get('host')` → KV lookup `host → tenant_id` → fallback Supabase query → `Astro.locals.tenant`. 404 if unknown host. | §6 |
| 1.11 | **KV + edge caching** | Write tenant config to KV on publish. Cache rendered pages in CF edge: `cacheTtl=900` (15min). Purge on tenant publish event. | §6 |
| 1.12 | **R2 bucket + upload API** | Create `lapak-assets` R2 bucket. CF Function: `POST /api/upload` → validate auth + tenant → upload to `tenants/{id}/{type}/{uuid}.webp` → return URL. Size limits (5MB images). | §16 |
| 1.13 | **CF Images integration** | Configure CF Images with R2 source. Test transformations: resize, WebP conversion, `segment=foreground`, `background=white`. Verify free bg removal works. | §16 |
| 1.14 | **Shared UI package** | `packages/ui`: Tailwind config (CSS variable theming), shadcn/ui base components (Button, Input, Card, Dialog, Tabs, Select, ColorPicker, Slider). Shared types for blocks, products, orders. | §5 |
| 1.15 | **Seed script** | SQL seed: 2 demo tenants (Toko Vavelle, KB Demo), 3 preset themes (Default, Minimalist, Bold), 10 sample products, 3 blog posts, homepage with 8 blocks. | §8 |
| 1.16 | **Email setup (unemail)** | Install `unemail`. Configure Resend driver + Mailgun fallback. Create email service module (`src/lib/email.ts`). Send test email via both drivers. Configure SPF + DKIM + DMARC DNS records for `lapak.id`. | §20 |
| 1.17 | **Error handling framework** | Create `src/lib/errors.ts` with typed error codes (`INSUFFICIENT_CREDITS`, `PAYMENT_FAILED`, `NOT_FOUND`, etc.). Implement error boundary components for Studio/Console. Create `/_fallback.html` static page for storefront SSR failures. Add consistent `{ ok, error }` response wrapper to all API routes. | §22 |
| 1.18 | **Health check + monitoring base** | Create `GET /api/health` endpoint checking Supabase + R2 + AI connectivity. Set up UptimeRobot for `lapak.id` + `studio.lapak.id`. Add structured logging middleware to all API routes. | §26 |
| 1.19 | **Anonymous cart session** | Create `cart_sessions` table. Implement `lapak_cart` cookie middleware (UUID session ID, 7-day expiry). Add cart session resolution to storefront API context. | §27 |

### Phase 2: Storefront — Buyer-Facing Pages (Week 2)
**Goal:** Full multi-page store renders from Supabase, SEO auto-pilot, cart + checkout
**PRD refs:** §5 (storefront routes), §6 (SSR rendering), §7 (blocks), §10 (payments/shipping), §15 (moats)

| # | Step | Description | Ref |
|---|---|---|---|
| 2.1 | **Storefront layout shell** | `StorefrontLayout.astro`: fetch theme tokens from Supabase → inject as CSS variables. Header (logo + nav + cart icon) + Footer. Responsive, mobile-first. | §5, §6 |
| 2.2 | **Block renderer** | `BlockRenderer.astro`: map JSON block array → Astro components. Each block = separate `.astro` file in `components/blocks/`. Handle unknown blocks gracefully (skip + log). | §7 |
| 2.3 | **Homepage `/`** | Fetch page with slug "home" + published blocks → render via BlockRenderer. Edge-cached 15min. | §5 |
| 2.4 | **Product catalog `/products`** | Grid view with filters (category, price range, search). Paginated (20/page). SSR with client-side filter React island. | §5 |
| 2.5 | **Product detail `/products/[slug]`** | Image gallery (React island), variants picker, add-to-cart, **"Beli di" external link buttons** (rendered as `/go/{shop}/{product}/{platform}` links with `rel="noopener"` for SEO — no nofollow so Google sees product hub authority), related products, reviews section. Structured data (JSON-LD Product schema). | §5, §15 |
| 2.6 | **Category pages `/category/[slug]`** | Category header + description + filtered product grid. Auto-generated from `categories` table. | §5 |
| 2.7 | **Blog index `/blog`** | Post list with pagination, category filter. Auto-generated OG image per post. | §5, §15 |
| 2.8 | **Blog post `/blog/[slug]`** | Article content + **product sidebar widget** (shows products mentioned in post). JSON-LD Article schema. This is our Tier 1 moat. | §5, §15 |
| 2.9 | **Custom pages `/[slug]`** | Render seller-created pages via BlockRenderer. Used for About, Contact, etc. | §5 |
| 2.10 | **Cart React island** | `CartApp.tsx`: add/remove/update qty. State in localStorage for guests, sync to Supabase for logged-in. Cart icon in header with count badge. | §5 |
| 2.11 | **Checkout flow `/checkout`** | React island: shipping address → Everpro rate calc → Xendit Invoice API → payment redirect → webhook handler → order confirmed. Gated to Starter/Pro only. | §5, §10 |
| 2.12 | **WhatsApp CTA (Free tier)** | If tenant on Free plan, all "Buy" buttons → `wa.me/{phone}?text={product}`. No checkout. Track clicks in `leads` table. | §5, §10 |
| 2.13 | **SEO auto-pilot** | Per-page: auto `<title>`, `<meta description>`, OG tags, Twitter cards. JSON-LD (Product, Article, BreadcrumbList, Organization). Auto-generate `/sitemap.xml`, `/robots.txt`. | §15 |
| 2.14 | **Promo landing `/promo/[slug]`** | Campaign landing pages — BlockRenderer + countdown timer React island. Shareable link for marketing campaigns. | §5 |
| 2.15 | **Search `/search?q=`** | Server-side search via Supabase `ilike` on product name + description. React island for instant suggestions. | §5 |
| 2.16 | **Outbound link redirect `/go/{shop}/{product}/{platform}`** | Server endpoint: validate product + platform → INSERT into `external_link_clicks` (tenant_id, product_id, platform, referrer, ip) → 302 redirect to external URL. Used by all "Beli di" buttons. Studio dashboard shows click counts per product per platform (chart + table). SEO benefit: product page acts as "hub" linking to all marketplaces → entity authority signal to Google. | §5, §8 |

### Phase 3: Seller Studio — Editor + Management (Week 3)
**Goal:** Full block editor with live preview, product/order/blog management, theme editor, AI tools
**PRD refs:** §5 (Studio modules), §6 (editor architecture), §14 (AI), §17 (credits/rate limiting)

| # | Step | Description | Ref |
|---|---|---|---|
| 3.1 | **Studio shell** | React SPA at `/studio/`. Vite + React Router. Auth guard: redirect to login if no valid session. Sidebar nav with all 10 modules. Mobile-responsive sidebar. | §5 |
| 3.2 | **Studio auth + tenant context** | Login via Supabase Auth. After login, fetch tenant profile. Store in React context. All API calls include auth headers + CSRF token. | §8, §9 |
| 3.3 | **Dashboard module** | Cards: today's orders, revenue, visitors, pending tasks. Chart: 7-day revenue trend. Quick actions: add product, create blog post, edit homepage. | §5 |
| 3.4 | **Block editor core** | `EditorCanvas` (live preview via React state) + `EditorPanel` (property editors) + `BlockPicker` (30 blocks, categorized). Click block → select → panel shows properties. Drag to reorder. | §6 |
| 3.5 | **Block property editors** | One editor per block type (30 editors). Each maps block JSON fields → form inputs. Changes → `setBlocks()` → instant re-render in canvas. | §6, §7 |
| 3.6 | **Editor auto-save** | Debounced 2s: `blocks` state → `PUT /api/pages/:id` → Supabase. Show save status indicator (saving ✓ / saved ✓ / error ✗). | §6 |
| 3.7 | **Product manager module** | CRUD products: name, description, price, variants (size/color), images (upload to R2 via `/api/upload`), category, stock status. Bulk edit. | §5, §16 |
| 3.8 | **Product image handling** | Upload → R2. Auto-generate thumbnails via CF Images (`width=300,600,1200`). One-click background removal (`segment=foreground,background=white`). Image reorder via drag. | §16 |
| 3.9 | **Order manager module** | Order list with status filters (pending, paid, shipped, delivered, cancelled). Status update → trigger Everpro shipment creation if "shipped". Order detail with timeline. | §5, §10 |
| 3.10 | **Blog manager module** | Rich text editor (Tiptap/ProseMirror). Categories, tags, featured image upload, SEO preview (title + meta + OG). Auto-save drafts. Schedule publish. | §5 |
| 3.11 | **Customer CRM module** | Customer list with auto-segmentation: new, returning, VIP (3+ orders), churned (90d inactive). Order history per customer. Export CSV. | §5 |
| 3.12 | **Analytics module** | Page views (CF Analytics), top products, conversion funnel (view → cart → checkout → paid), revenue by period, traffic sources. Simple charts (recharts). | §5 |
| 3.13 | **Theme editor module** | Tabs: Colors (15 pickers), Typography (font/weight), Spacing (radius/padding sliders), Glassmorphism (blur/opacity/border toggles), PageHeader (gradient config). Live preview iframe. | §5, §6 |
| 3.14 | **Settings module** | Store profile (name, tagline, logo, favicon, WA number), domain config (custom domain instructions + CNAME status check), payment settings (Xendit onboarding link), shipping settings (origin address, courier selection), staff accounts (invite via email). | §5, §10 |
| 3.15 | **AI Tools module** | Copywriter: input product name + features → generate description. SEO Auto-Pilot: generate meta title + description + OG tags. AI Page Gen: input product name + target buyer → generate full landing page with blocks. All via `/api/ai/generate` proxy. | §14 |
| 3.16 | **AI Settings sub-module** | Toggle: BYOK mode vs Credits mode. BYOK: paste API key (OpenAI/Google/etc) → encrypted store in Supabase `vault`. Credits: show balance, buy packs (Xendit Invoice), usage history. | §14, §17 |
| 3.17 | **AI proxy Edge Function** | `POST /api/ai/generate` → auth check → check seller mode (BYOK vs Credits) → rate limit check → route to model (CF Workers AI default) → deduct credits / use seller key → return result → log to `ai_usage_log`. | §14, §17 |
| 3.18 | **AI rate limiting** | Per-tenant in-memory counter (CF Durable Object or KV with TTL): Free=5/hr, Starter=20/hr, Pro=100/hr. Return 429 with retry-after on burst. | §17 |
| 3.19 | **AI audit log** | Every AI call logged: `{ tenant_id, task, model, tokens_in, tokens_out, credits_deducted, timestamp }`. Seller sees usage in Studio → AI Tools → Usage. Monthly summary email. | §17 |
| 3.20 | **Plan gating** | Middleware: check tenant plan (Free/Starter/Pro). Gate: checkout (Starter+), custom domain (Starter+), analytics (Pro), AI tools beyond 10 free credits (any plan), staff accounts (Pro), remove Lapak branding (Pro). Show upgrade CTA when gated. | §2 |
| 3.21 | **Seller onboarding wizard** | 4-step FRX: (1) Store name + category, (2) WA + email + city, (3) Pick theme from 5 presets, (4) First product or skip. Creates tenant + settings + seed page. Redirects to Studio dashboard with Getting Started checklist. | §19 |
| 3.22 | **Getting Started checklist** | Studio dashboard card: ✅ Store created, ☐ First product, ☐ First page, ☐ Connect WA, ☐ Share link. Each item = deep link. Progress bar. Disappears when all done. | §19 |
| 3.23 | **Onboarding templates** | 5 pre-built page templates (Fashion, F&B, Craft, Services, General). Each = block array with placeholder content. 1-click apply in Studio. Seller replaces text/images. | §19 |
| 3.24 | **Realtime notifications** | Enable Supabase Realtime on `orders` table. Studio subscribes to INSERT events for current tenant. On new order: browser notification (if permitted) + toast + sound. | §21 |
| 3.25 | **Email notifications** | Send Welcome email on signup. Send New Order email to seller on purchase. Send Order Confirmed/Shipped to buyer. All via unemail. | §20, §21 |
| 3.26 | **Link-in-Bio editor** | Studio sidebar section "Link-in-Bio". Edit display name, avatar, tagline, links (label + URL + icon), social links. Drag-to-reorder. Preview in phone mockup. Custom theme color. Save to tenant_settings JSONB. | §24 |
| 3.27 | **Link-in-Bio storefront page** | Astro SSR route `lapak.id/s/{shopname}`. Mobile-first layout: avatar + name + tagline + link buttons + social icons + 3 featured products. OG meta for social previews. | §24 |
| 3.28 | **Bilingual i18n** | Create `src/i18n/id.json` + `src/i18n/en.json` translation files. Add `useTranslation()` hook for Studio/Console. Add `t()` function for Astro storefront. Language toggle in sidebar. Default: Indonesian. | §27 |

### Phase 4: Payments + Shipping + Domains (Week 4)
**Goal:** End-to-end payment flow works, shipping calculates, custom domains activate
**PRD refs:** §10 (payments/shipping), §6 (custom domains), §17 (credit billing)

| # | Step | Description | Ref |
|---|---|---|---|
| 4.1 | **Xendit XenPlatform setup** | Register platform account. Create sub-accounts for each tenant on Starter+ plan (Managed sub-accounts → tenant controls own funds). Store sub-account ID in `tenants.xendit_sub_account_id`. | §10 |
| 4.2 | **Checkout → Xendit Invoice** | `/checkout` React island: submit → CF Function creates Xendit Invoice with tenant's sub-account → fee splitting (Biaya Layanan) → return payment URL → redirect buyer. Include voucher discount in total if applied. | §10 | |
| 4.3 | **Voucher system (seller)** | Studio: Voucher CRUD page (`/studio/vouchers`). Create/edit: name, type (percentage/fixed/free_shipping), value, max_discount cap, min_order, max_uses, max_uses_per_buyer, date range, active toggle. List with usage stats (used/total). | §9 | |
| 4.4 | **Voucher selection at checkout (buyer)** | Checkout page: "Pakai Voucher" button → fetch `GET /api/vouchers?tenant_id=X&subtotal=Y` → show available vouchers (auto-filtered: min_order met, not expired, quota remaining) → buyer taps → discount applied to total. One voucher per order. Track in `voucher_usages` + increment `vouchers.used_count`. | §9 | |
| 4.5 | **Xendit webhook handler** | `POST /api/webhooks/xendit`: verify webhook signature → update order status → trigger confirmation email/WhatsApp to buyer + seller. Idempotent (check xendit_invoice_id). | §10 | |
| 4.6 | **Everpro shipping integration** | `POST /api/shipping/calculate`: origin (seller address) + destination (buyer address) + weight → Everpro API (always `is_use_insurance: true`) → return rates + `insurance_price` per courier. Cache rates in KV 1hr. | §10 | |
| 4.7 | **Shipment creation** | When seller marks order "shipped" → `POST /api/shipping/create` → Everpro create shipment → return tracking number → update order + notify buyer. | §10 | |
| 4.8 | **RajaOngkir fallback** | If Everpro fails, fallback to RajaOngkir/Komerce API V2. Same courier coverage, well-documented. Implement as adapter pattern (same interface, different provider). | §10 | |
| 4.9 | **Custom domain flow** | Seller enters domain in Settings → verify CNAME points to `custom.lapak.id` → CF for SaaS `POST /customers/{tenant_id}` with hostname → CF auto-provisions SSL → tenant KV entry updated → domain live. Show step-by-step instructions + auto-check status. | §6 | |
| 4.10 | **CF for SaaS setup** | Configure CF for SaaS on our Pages domain. First 100 hostnames free. Custom hostname fallback origin = `lapak.pages.dev`. Auto-accept new hostnames. | §6 | |
| 4.11 | **Subscription billing** | Xendit recurring Invoice for Starter (Rp99K/mo) and Pro (Rp199K/mo). Auto-downgrade to Free if payment fails after 7d grace. Store subscription status in `tenants.plan` + `tenants.plan_expires_at`. | §2, §10 |
| 4.12 | **AI credit purchase flow** | Seller buys credit pack → Xendit Invoice → webhook confirms → `UPDATE tenants SET ai_credits_balance = ai_credits_balance + :credits WHERE id = :tenant_id`. Log in `ai_credit_purchases`. | §17 |
| 4.13 | **Credit deduction (atomic)** | Every AI call: `UPDATE tenants SET ai_credits_balance = ai_credits_balance - :cost WHERE id = :tenant_id AND ai_credits_balance >= :cost RETURNING ai_credits_balance`. If 0 rows → insufficient → 402 response. | §17 |
| 4.14 | **Reviews system** | Product reviews: buyer submits after purchase (order_id verified). Unmoderated by default (trust signal). Moderation dashboard for Pro (approve/reject/flag). Display on product page with star rating. | §11, §15 |
| 4.15 | **Addon subscription system** | `tenant_addons` CRUD. Studio "Addons" page: catalog of 7 addons with toggle subscribe/cancel. Each addon creates Xendit recurring subscription. `hasFeature()` helper checks plan OR active addon. If total addons > plan price, show "Switch to Starter/Pro and save" upsell banner. Cancel = mark `cancelled_at`, expires at period end. | §2 |
| 4.16 | **Addon upsell intelligence** | Studio sidebar + settings: when seller accesses gated feature, show "Enable for Rp29K/mo" with 1-click. Track addon-to-plan conversions. Console shows addon adoption funnel: viewed → subscribed → upgraded to plan. | §2 |

### Phase 5: Platform Console + Marketing + Ship (Week 5)
**Goal:** Console admin, marketing site live, legal docs, E2E tested, performance audited
**PRD refs:** §5 (Console/Marketing), §17 (compliance/legal), §18 (risks)

| # | Step | Description | Ref |
|---|---|---|---|
| 5.1 | **Console shell** | React SPA at `/console/`. Separate auth (platform_admin role only). Sidebar: Tenants, Billing, AI Credits, Analytics, Flags, Settings, Legal. | §5 |
| 5.2 | **Tenant management** | List all tenants (search, filter by plan/status). View detail: store URL, plan, domain, revenue, orders count, AI usage, created date. Actions: approve, suspend, delete, change plan. | §5 |
| 5.3 | **Billing dashboard** | XenPlatform overview: total sub-accounts, platform revenue (fee splitting), subscription revenue. Per-tenant billing history. Failed payments queue. | §5, §10 |
| 5.4 | **AI Credits admin** | Provider API keys management (our keys for credit mode). Credit pack pricing config. Platform-wide usage analytics (total calls, cost, revenue, margin). Per-model cost breakdown. | §14, §17 |
| 5.5 | **Platform analytics** | Total tenants (by plan), GMV, total orders, average order value, churn rate, top tenants. Charts. Daily/weekly/monthly views. | §5 |
| 5.6 | **Feature flags + addon gating** | Enable/disable features per tier: checkout, custom domain, analytics, AI tools, staff accounts, branding removal. **Feature access = plan includes it OR active addon in `tenant_addons`**. `hasFeature(tenant_id, 'checkout')` checks both. Toggle UI. Stored in `platform_settings` table, cached in KV. | §5 |
| 5.7 | **System settings** | Default themes (upload/manage), block library (enable/disable blocks), email templates (welcome, order confirmed, shipping update), platform-wide rate limits. | §5 |
| 5.8 | **Marketing site** | Astro SSG at `lapak.id`: landing page (hero + features + pricing + CTA), `/pricing` (tier comparison), `/ai-credits` (credit packs + BYOK explanation), `/docs` (help docs + FAQ), `/signup`, `/login`. | §5 |
| 5.9 | **Legal pages** | `/terms` (Seller ToS with AI disclaimers, liability caps, credit policies), `/privacy` (sub-processor list, data flows, UU PDP compliance), `/ai-disclosure` (EU AI Act Article 50). | §17 |
| 5.10 | **Legal email flows** | Monthly AI usage summary email. Credit expiration warnings (30d, 7d before). Subscription renewal reminders. All via Supabase Edge Functions + email provider. | §17 |
| 5.11 | **E2E smoke test** | Full flow: signup → onboard → upload product → edit homepage → publish → browse storefront → add to cart → checkout → Xendit payment (sandbox) → webhook → order appears → ship → buyer gets tracking. Test with 2 tenants for isolation. | §9 |
| 5.12 | **Mobile E2E test** | Test entire buyer flow on mobile Chrome + Safari. Test Studio editor on mobile. Verify all touch interactions, responsive layouts, no horizontal scroll. | §9 |
| 5.13 | **Performance audit** | Lighthouse: Performance 90+, Accessibility 90+, SEO 95+ on mobile. Core Web Vitals: LCP <2.5s, INP <200ms, CLS <0.1. Verify edge cache hit rates via CF Analytics. | §18 |
| 5.14 | **Security audit** | CSRF on ALL write endpoints. RLS verified (try cross-tenant data access → must fail). Input validation (Zod schemas on all APIs). Rate limiting on auth endpoints (5 attempts/min). SQL injection test. XSS test in block content. | §18 |
| 5.15 | **Content moderation** | AI output safety filters enabled on all providers. Indonesian-language harmful content filter. Report mechanism for inappropriate AI outputs. Admin review queue in Console. | §17 |
| 5.16 | **Launch checklist** | Custom domain on `lapak.id` → CF Pages production. SSL verified. DNS for `*.lapak.id` wildcard → CF. Xendit production keys swapped. Supabase Pro plan upgraded. R2 bucket production ready. Monitoring: CF Analytics + Supabase logs + UptimeRobot. | §18, §26 |
| 5.17 | **Unit test suite** | Set up Vitest. Write unit tests for: price formatting, slug generation, theme token transforms, block serialization, AI response validation. Coverage 80%+ for `src/lib/`. | §25 |
| 5.18 | **Integration tests** | Set up `supabase start` local instance. Test: API CRUD (pages, products, blog) → RLS enforcement → cross-tenant isolation → checkout flow with Xendit mock → AI proxy with model mock. | §25 |
| 5.19 | **E2E tests (Playwright)** | Buyer flow: browse → cart → checkout → Xendit sandbox → order confirmed. Seller flow: signup → onboard → create product → publish → view storefront. Admin flow: login → tenant list → suspend. Test on Chrome + Safari + mobile Chrome. | §25 |
| 5.20 | **Backup automation** | Set up daily `pg_dump` cron via Supabase CLI. Configure R2 bucket replication to backup bucket. Document restore procedure. Test restore from backup. | §27 |

---

**Prompt count: 95 steps across 5 phases.**
**PRD coverage: every section (§0–§28) mapped to at least one step.**

---

## 13. Key Design Decisions

### Why SSR via Cloudflare Pages (not SSG + GitHub Pages)?
- **SSG doesn't scale** for multi-tenant stores. Each tenant has dynamic pages, products, blog posts. Rebuilding all tenants on every change = build queue explosion at 100+ tenants.
- **SSR = instant publish.** No rebuild, no queue. Seller publishes → edge cache purge → next request fetches fresh data.
- **Edge caching = SSG-like performance.** 15min TTL means most requests are cache hits. Same speed as static, but always fresh.
- **Dynamic pages work.** Product catalog, search, cart, checkout — all need server logic. SSG can't handle these.
- **One deployment, all tenants.** No per-tenant repos, no GitHub Actions, no build minutes. Single CF Pages deployment serves all tenants via Host header routing.

### Why Custom Block Editor (not GrapesJS)?
- **Simpler live preview.** React state binding = 0ms updates. No iframe, no postMessage, no event system.
- **Full UI control.** We own every pixel. shadcn/ui components, Tailwind styling, taste-skill quality.
- **Structured JSON output.** Not HTML. Theme-aware, portable, versionable. Render differently for storefront vs mobile.
- **30 known block types.** Well-defined schemas from Djualan reverse engineering. Not a general-purpose page builder.
- **GrapesJS is MIT** (confirmed free), but its abstraction layer adds complexity we don't need.

### Why Cloudflare Workers AI as Default Provider?
- **Cheapest on the market.** Granite-4.0 at $0.017/1M tokens. Gemini Flash is $0.10/1M. CF is 6x cheaper.
- **Zero network latency.** Same edge as our Pages Functions. No external API call overhead.
- **10,000 free Neurons/day** (~$3.30/mo free AI). Covers early tenants at zero cost.
- **78 models available.** Route different tasks to different models (cheap for bulk, quality for complex).
- **Same infra, same billing.** Already on CF account. No new vendor relationship.

### Why BYOK + Credits Hybrid?
- **BYOK** attracts power users who already have API keys. Zero friction, zero cost for us.
- **Credits** monetizes casual users who don't want API management. 2-3x markup = healthy margin.
- **Same API surface.** Seller code doesn't change. Our proxy routes to their key or ours.
- **AI calls ALWAYS through our backend.** Never direct from browser. Security + observability + billing.

### Why Supabase (not self-hosted Postgres)?
- **RLS** is the killer feature. Zero-code tenant isolation.
- **Auth** is built-in. No custom JWT, no PBKDF2, no password hashing.
- **Storage** handles images. No R2/S3 needed.
- **Edge Functions** handle webhooks. No separate worker service.
- **Free tier** is generous: 500MB DB, 1GB storage, 500K function calls.

### Why Block Editor (not drag-and-drop)?
- **Simpler to build.** Vertical stack of blocks, not free-form canvas.
- **Simpler to use.** UMKM owners don't need pixel-perfect control.
- **Covers 95% of cases.** Most UMKM sites are: Hero → Products → Testimonials → Contact.
- **Consistent output.** Every page looks good, no broken layouts.

### Why Xendit + Everpro?
- **Xendit xenPlatform** — purpose-built for marketplace/SaaS. Sub-accounts per tenant, fee splitting, auto-disburse. Djualan uses Xendit for the same reason.
- **Everpro** — proven multi-courier shipping API (JNE/J&T/SiCepat). Same provider Djualan uses. Handles rate calculation + COD.
- **Together:** Payment + shipping from two specialized vendors, each best-in-class for their domain. Same stack Djualan validated.

---

## 14. AI Architecture

### AI Use Cases in Lapak

| Feature | AI Task | Input | Output |
|---|---|---|---|
| **AI Copywriter** | Generate product descriptions, marketing copy | Product name, category, keywords | Indonesian marketing text |
| **AI Photography** | Generate/edit product images | Product photo + style prompt | Enhanced product image |
| **SEO Auto-Pilot** | Auto-generate meta tags, schema, OG tags | Page/product data | Meta title, description, JSON-LD |
| **AI Page Gen** | Generate full page from description | Product + target buyer + copywriting framework | Block array (structured JSON) |
| **AI Rewrite** | Rewrite block content | Existing block text + instruction | Rewritten text |

### AI Provider Stack (Hybrid)

```
Seller AI Settings:
├── Mode: BYOK (bring your own key) OR Credits (buy from us)
│
├── BYOK mode:
│   ├── Seller pastes API key (OpenAI, Google, Fal.ai, etc.)
│   ├── Key stored encrypted in Supabase vault
│   ├── AI calls route through our proxy (never exposed to browser)
│   ├── No credits deducted, no markup
│   └── Supported: OpenAI, Google Gemini, Anthropic, Fal.ai
│
└── Credits mode:
    ├── Seller buys credit packs from us
    ├── We proxy to our provider keys (CF Workers AI default)
    ├── Per-call deduction from seller balance
    └── Balance visible in Studio dashboard
```

### Default Provider: Cloudflare Workers AI

| Model | Input/1M | Output/1M | Use Case |
|---|---|---|---|
| `ibm-granite-4.0-h-micro` | $0.017 | $0.112 | Bulk tasks (SEO tags, meta descriptions) |
| `meta/llama-3.2-1b-instruct` | $0.027 | $0.201 | Fast simple text (rewrite, summarize) |
| `qwen/qwen3-30b-a3b-fp8` | $0.051 | $0.335 | Quality text (copywriter, page gen) |
| `meta/llama-4-scout-17b-16e` | $0.270 | $0.850 | Complex tasks (long-form, reasoning) |
| `black-forest-labs/flux-1-schnell` | $0.00005/tile | — | Product photography (fast) |
| `black-forest-labs/flux-2-klein-4b` | $0.00006/tile | $0.00029/tile | Product photography (quality) |

**Free tier:** 10,000 Neurons/day (~$3.30/mo free). Covers early tenants at zero cost.

### External Provider Pricing (for BYOK reference)

| Provider | Model | Input/1M | Output/1M |
|---|---|---|---|
| Google | Gemini 2.0 Flash | $0.10 | $0.40 |
| OpenAI | GPT-4.1 nano | $0.10 | $0.40 |
| DeepSeek | V3 | $0.14 | $0.28 |
| Google | Gemini 2.5 Flash | $0.15 | $0.60 |
| OpenAI | GPT-4.1 mini | $0.40 | $1.60 |
| Meta (via Together) | Llama 4 Scout | $0.10 | $0.25 |

### AI Credits Pricing (2-3x markup on our cost)

| Pack | Credits | Price (IDR) | Approx calls |
|---|---|---|---|
| Starter | 50 | Rp 25.000 | ~50 copywriter / ~25 page gen |
| Standard | 200 | Rp 75.000 | ~200 copywriter / ~100 page gen |
| Pro | 500 | Rp 150.000 | ~500 copywriter / ~250 page gen |
| Image Add-on | 20 images | Rp 20.000 | 20 AI product photos |

**Credit costs:**
- Text generation (copywriter/SEO/rewrite): ~1 credit/call
- Page generation: ~2 credits/call (more tokens)
- Image generation: ~1 credit/image (our cost ~$0.0003, sell at Rp1.000)
- Free tier: 10 AI credits/month (teaser, auto-renews)

### AI Proxy Architecture

```
Studio AI request → CF Pages Function (/api/ai/*)
         ↓
Check seller AI mode:
├── BYOK → decrypt seller's key → proxy to their provider → return result
└── Credits → check balance → deduct credits → proxy to CF Workers AI → return result
         ↓
Response back to Studio
         ↓
Log usage to Supabase (audit trail + analytics)
```

**Security:** API keys NEVER exposed to browser. All AI calls go through our backend proxy.

### Hybrid AI Model Router (Intelligent Switching)

The router is the brain of our AI system. It abstracts away which provider/model actually runs — the seller never knows or cares. Same API, different backend routing.

```
┌─────────────────────────────────────────────────────┐
│                 AI Gateway Router                    │
│              (CF Pages Function)                     │
│                                                      │
│  Input: { task, prompt, mode, seller_id }            │
│                                                      │
│  ┌─────────────┐   ┌──────────────┐                 │
│  │ Mode Check  │──▶│ BYOK or      │                 │
│  │             │   │ Credits?     │                 │
│  └─────────────┘   └──────┬───────┘                 │
│                           │                          │
│         ┌─────────────────┼──────────────┐           │
│         ▼                 ▼              ▼           │
│   ┌───────────┐   ┌─────────────┐ ┌──────────┐     │
│   │  BYOK     │   │ Task Router │ │ Fallback │     │
│   │  Branch   │   │ (Credits)   │ │ Chain    │     │
│   └─────┬─────┘   └──────┬──────┘ └────┬─────┘     │
│         │                │              │            │
│         ▼                ▼              ▼            │
│   Seller's key     Model Selection   If primary     │
│   → their          by task type:     fails → try    │
│   provider         see table below   next provider  │
│                                                      │
│   Output: { result, model_used, credits_deducted }   │
└─────────────────────────────────────────────────────┘
```

**Task → Model Mapping (Credits mode):**

| Task | Primary Model | Cost/call | Fallback Model | Fallback Cost |
|---|---|---|---|---|
| SEO tags / meta desc | `granite-4.0-h-micro` | ~$0.00001 | `llama-3.2-1b` | ~$0.00002 |
| AI Rewrite (short) | `llama-3.2-1b-instruct` | ~$0.00002 | `granite-4.0` | ~$0.00001 |
| AI Copywriter (quality) | `qwen3-30b-a3b` | ~$0.00005 | `llama-4-scout` | ~$0.00027 |
| AI Page Gen (complex) | `llama-4-scout-17b` | ~$0.00027 | `qwen3-30b` | ~$0.00005 |
| AI Photography (fast) | `flux-1-schnell` | ~$0.00005 | `flux-2-klein` | ~$0.00006 |
| AI Photography (quality) | `flux-2-klein-4b` | ~$0.00006 | `flux-1-schnell` | ~$0.00005 |

**Fallback chain logic:**
```
1. Try primary model (cheapest for task)
2. If CF Workers AI returns error/timeout:
   a. Try fallback model (different arch, same infra)
   b. If still fails → try external provider (Gemini Flash via our key)
   c. If ALL fail → return error + refund credits
3. Log: { seller_id, task, primary_model, actual_model, latency, success }
```

**BYOK routing:**
```
1. Decrypt seller's stored key from Supabase vault
2. Detect provider from key prefix:
   - sk-... → OpenAI
   - AIza... → Google Gemini
   - sk-ant-... → Anthropic
   - fal-... → Fal.ai
3. Route to correct provider API
4. Transform request/response to our unified schema
5. No credits deducted, no markup
6. If seller's key is invalid → show "check your API key" error
```

**Unified response schema (same shape regardless of provider):**
```typescript
interface AIResponse {
  content: string;          // Text result (or base64 for images)
  model_used: string;       // e.g. "qwen3-30b-a3b-fp8" or "gpt-4.1-nano"
  provider: string;         // "cloudflare" | "openai" | "google" | "anthropic" | "fal"
  credits_deducted: number; // 0 for BYOK, 1-2 for credits
  latency_ms: number;       // Round-trip time
  tokens?: {                // Undefined for BYOK (we don't track their usage)
    input: number;
    output: number;
  };
}
```

**Key design principle:** Seller-facing API is ONE endpoint (`/api/ai/generate`). Task type + mode determine everything else. Zero config needed from seller perspective — they pick "Copywriter" and click Generate. Router handles the rest.

---

## 15. Competitive Moats

### Tier 1: Core Differentiators (build in MVP)

**🥇 Blog + Product Sidebar Widget**
- Only platform offering blog with product sidebar for Indonesian UMKM
- SEO compound interest: every blog post links to products, every product page links to blog
- Djualan has NO blog. NO content pages. Single-page only.
- Drives organic traffic from Google → products → checkout

**🥇 SEO Auto-Pilot**
- Auto-generate: meta tags, OG tags, JSON-LD schema, sitemap.xml, robots.txt
- Every product page, blog post, category page has perfect SEO out of the box
- Seller does nothing → gets Google traffic. That's the magic.
- Djualan has minimal SEO (single page = no sitemap, no schema)

**🥇 Permanent Free Tier**
- Build unlimited pages, unlimited products (display), publish forever
- Djualan: 14-day trial then ALL features require paid plan
- Free tier = acquisition funnel: build for free → want to sell → upgrade
- Zero risk for seller to try Lapak

**🥇 Zero Seller Deductions (Buyer Pays All)**
- Seller sets Rp200K → seller receives EXACTLY Rp200K. Zero PG fees, zero commission, zero deductions.
- ALL transaction costs (PG fee, Biaya Layanan, shipping, insurance) shown to buyer at checkout
- Djualan passes PG fees to seller — they lose ~0.7% of every sale
- "Set your price, get your price" — the single most powerful seller messaging
- Biaya Layanan (Rp1K–4K) = our per-transaction revenue, buyer-funded, same as Shopee/Tokopedia

**🥇 Link-in-Bio**
- Each seller gets a `lapak.id/s/{shopname}` link-in-bio page
- Showcases: store link, featured products, social links, WA button
- Drives Instagram/TikTok traffic → Lapak storefront
- Simple to build, high value for social sellers
- Djualan has nothing like this

### Tier 2: AI-Powered (build in v2)

**🥈 Multi-Channel Product Hub**
- Every product page links to Shopee, Tokopedia, TikTok Shop, WhatsApp via "Beli di" buttons
- All outbound clicks tracked through `/go/` redirect → seller sees analytics per platform
- SEO: `rel="noopener"` (NOT nofollow) → Google sees product page as authoritative hub connecting to major marketplaces → entity signal boost
- Only platform that turns a seller's product page into a multi-marketplace command center
- Djualan: single-page, no outbound links, no analytics

**🥈 AI Product Photography**
- Upload product photo → AI enhances background, lighting, composition
- Powered by CF Workers AI (flux models, ~$0.0003/image our cost)
- Indonesian UMKM sellers take terrible product photos. This fixes it instantly.
- BYOK or credits. Djualan has nothing like this.

**🥈 AI Copywriter**
- Type product name + target buyer → generates marketing copy
- Supports Indonesian copywriting frameworks (PAS, AIDA, PASTOR)
- Djualan has basic AI page gen, but no per-block copywriter
- Powered by CF Workers AI (cheapest models)

### Tier 3: Growth Features (build in v3)

**🥉 Reviews Paywall Moderation**
- Free plan: unmoderated reviews (trust signal, zero admin cost)
- Pro plan: moderation dashboard (approve/reject, pin featured, respond)
- Moderation = premium feature. Reviews = free trust building.
- Djualan has no reviews system at all.

**🥉 Smart Follow-Ups**
- Abandoned cart recovery, promo blasts, review requests via WhatsApp
- Templates with variable substitution ({name}, {product}, {price})
- Opt-out compliant, rate limited
- Djualan's WA = just click analytics. No automated messaging.

---

## 16. Image Storage & Processing

### Storage: Cloudflare R2 (Zero Egress)

All tenant images stored in **Cloudflare R2** — same CF account as Pages + KV + Workers AI.

| Metric | Cost |
|---|---|
| Storage | $0.015/GB/month |
| Egress | **$0** (zero, unlimited) |
| Class A ops (write/delete) | $4.50/million |
| Class B ops (read) | $0.36/million |
| Free tier | 10GB + 10M Class B/month |

**Why R2 (not S3/Supabase Storage/Backblaze B2):**
- Zero egress = serve unlimited product images with zero bandwidth bill
- Same infra as Pages + KV + Workers AI = zero integration complexity
- S3-compatible API for easy future migration
- 10GB free covers first ~100 tenants (avg 100MB each)
- Backblaze B2 is cheaper storage ($0.006 vs $0.015) but needs CF in front + extra integration. Not worth saving $0.009/GB at our scale.

**R2 bucket structure:**
```
lapak-assets/
├── tenants/{tenant_id}/
│   ├── products/{product_id}/
│   │   ├── original.webp      # uploaded image
│   │   ├── thumb_300.webp     # CF Images transform
│   │   └── thumb_600.webp     # CF Images transform
│   ├── blog/{post_id}/
│   ├── logo.webp
│   ├── favicon.ico
│   └── og-image.webp
```

### Background Removal: Cloudflare Images API (Built-in)

**No AI credits needed.** CF Images API has native background removal:

```
shopname.lapak.id/cdn-cgi/image/segment=foreground,background=white/product-photo.webp
```

One URL parameter = instant white-background product photo. CF runs **BiRefNet** (state-of-art segmentation model) on their GPUs. Available on Free and Paid CF plans.

**AI Photography pipeline:**
1. Seller uploads raw photo → R2
2. CF Images auto-removes background (`segment=foreground`)
3. Optional: AI generates new background (flux model) → composites ← THIS costs credits
4. Serve optimized WebP via CF CDN

**Simple background removal = free.** AI-generated backgrounds = credits.

### Image Optimization

All images served through CF Images transformations:
- Auto WebP/AVIF format negotiation
- Responsive sizes (300px, 600px, 1200px)
- Face-aware cropping (`gravity=face`)
- Background removal (`segment=foreground`)
- Solid color fill (`background=white`)

---

## 17. AI Reseller Compliance & Legal

### Can We Legally Resell AI API Access?

**YES.** All major providers explicitly allow it. Key findings:

- **OpenAI** — You own all API outputs. Commercial use explicitly allowed. Cannot resell/redistribute API keys or Licensed Materials (SDKs). Copyright Shield (IP indemnification) only for Enterprise tier.
- **Google Gemini** — You own outputs. Indemnification for Enterprise customers against IP claims.
- **Anthropic** — You own outputs. Similar liability limitations.
- **Cloudflare Workers AI** — You own all inputs/outputs. CF doesn't use your data to train models. Models are third-party (open source) with their own licenses. Commercial use allowed.

**Legal pattern:** We're not "reselling the API" — we're selling a SERVICE that uses AI APIs as infrastructure. Same as a laundromat sells clean clothes, not washing machine access.

### Required Legal Documents

**Seller Terms of Service must include:**
- Disclose that content may be AI-generated
- Disclaim warranty on AI outputs (no guarantee of accuracy/originality)
- Require sellers to review AI content before publishing
- Limit liability to credit amount paid
- Right to switch AI providers without notice
- Prohibited use cases (illegal content, impersonation, spam)

**Privacy Policy must include:**
- AI providers as sub-processors (OpenAI, CF, Google)
- Data flow disclosure: Seller input → Lapak proxy → AI provider → back
- Data retention policies
- Sub-processor list with ability to update

**Indonesian compliance (UU PDP — Personal Data Protection):**
- Personal data processing consent from sellers
- Data localization: Supabase region = ap-southeast-1 (Singapore — acceptable under ASEAN framework)
- DPA (Data Processing Agreement) if processing EU data

**EU AI Act (if EU sellers use Lapak):**
- Article 50: Disclose when content is AI-generated
- Our use case = minimal risk (marketing copy, not medical/legal)
- Maintain documentation of AI systems used

### AI Credit System Policies

**Credit expiration:** Credits expire 12 months after purchase. Forces usage, prevents liability buildup.

**Credit packs (preliminary):**
- Starter: 50 credits — Rp25.000
- Standard: 200 credits — Rp75.000
- Pro: 500 credits — Rp150.000
- Free tier: 10 credits/month (non-cumulative, resets monthly)

**Refund policy:** No refunds on credits. One-time goodwill exceptions at our discretion.

**Credit values per task:**
- AI Copywriter (product description): 1 credit
- AI SEO Meta Tags: 1 credit
- AI Background Generation (product photo): 2 credits
- AI Page Generation (full landing page): 5 credits

### AI Rate Limiting & Abuse Prevention

Per-tenant rate limits to prevent abuse:

```
Rate limits (per tenant):
├── Free tier: 5 AI requests/hour, 10 credits/month
├── Starter: 20 AI requests/hour
├── Pro: 100 AI requests/hour
└── Burst: reject with 429 + "try again in X minutes"
```

**Content moderation:**
- All AI outputs filtered through provider safety settings (OpenAI moderation, CF safety filters)
- Indonesian-language content moderation for harmful/illegal content
- Seller can report inappropriate AI outputs
- We reserve right to revoke AI access for abuse

**Audit logging:**
- Every AI call logged: `{ tenant_id, task, model, tokens_in, tokens_out, credits_deducted, timestamp }`
- Seller can view usage history in Studio → AI Tools → Usage
- Monthly usage summary emailed to seller
- Console shows platform-wide AI usage analytics

### Billing Implementation (Simple D1/Supabase Approach)

No third-party billing platform needed at our scale:

```sql
-- Per-call deduction (atomic, race-condition safe)
UPDATE tenants
SET ai_credits_balance = ai_credits_balance - :cost
WHERE id = :tenant_id AND ai_credits_balance >= :cost
RETURNING ai_credits_balance;

-- If returns 0 rows → insufficient balance → reject request

-- Usage log (append-only)
INSERT INTO ai_usage_log (tenant_id, task, model, tokens_in, tokens_out, cost, created_at)
VALUES (:tenant_id, :task, :model, :tokens_in, :tokens_out, :cost, NOW());
```

---

## 18. Open Risks

| Risk | Mitigation |
|---|---|
| CF Pages cold start latency for SSR | Edge caching (15min TTL) means most requests are cache hits. Cold starts ~50ms at CF edge. |
| CF Workers AI model quality for Indonesian | Test with Indonesian prompts. Fallback to external providers (Gemini Flash $0.10/1M). BYOK option covers quality needs. |
| Supabase free tier too small for production | Upgrade to Pro ($25/mo) when we have paying tenants |
| Xendit Owned sub-accounts disabled for Indonesia | Contact Xendit support to enable, or use Managed sub-accounts (tenant gets dashboard) |
| Everpro API access restrictions or limited docs | Fallback to RajaOngkir/Komerce API V2 (same courier coverage, well-documented) |
| Regulatory: holding tenant funds via Xendit sub-accounts | Xendit handles compliance. Use Managed sub-accounts so tenants control own funds. |
| Free users never convert | Strong upgrade funnel: checkout preview in editor, "upgrade to sell" CTAs, 10 free AI credits/month |
| BYOK sellers bypass credit revenue | BYOK = zero cost for us. Credits target users who don't want API management. Both drive platform stickiness. |
| Custom domain setup too technical for UMKM | Step-by-step guide with screenshots. Auto-detect CNAME status. Email-based onboarding for paid plans. |

---

## 19. Seller Onboarding Flow

### First-Run Experience (FRX)

When a new seller signs up, they land on a guided 4-step onboarding wizard:

**Step 1 — Store Identity** (required)
- Store name (becomes subdomain: `shopname.lapak.id`)
- Tagline (optional)
- Logo upload (optional, skip for now)
- Category selection (pick from 10 preset categories: Fashion, Food, Craft, Beauty, Electronics, Home, Sports, Services, Digital, Other)

**Step 2 — Contact & WhatsApp** (required)
- WhatsApp number (for order notifications + buyer contact)
- Email address
- City (for shipping origin)

**Step 3 — Choose Theme** (required)
- 5 pre-made themes displayed as visual cards
- Each theme = complete token set (colors, typography, spacing, glass)
- Click to preview on dummy store
- Can change anytime in Studio → Appearance

**Step 4 — First Product or Skip** (optional)
- Quick-add form: name, price, photo, description
- OR "I'll add products later" → skip
- If skip: store shows a "Coming Soon" page with logo + tagline + WA button

### Empty Store UX

- When store has 0 published products/pages, show "Coming Soon" landing page (not 404)
- Coming Soon = Hero block with store name + tagline + WA button + "Follow us" social links
- Studio dashboard shows "Getting Started" checklist:
  - ✅ Store created
  - ☐ Add your first product
  - ☐ Create your first page
  - ☐ Connect WhatsApp
  - ☐ Share your store link
- Each checklist item = deep link to the relevant Studio section

### Onboarding Templates (MVP — 5 starter page templates)

Pre-built page layouts sellers can 1-click apply:

1. **Fashion Store** — Hero + Product Grid + Testimonials + Contact
2. **Food & Beverage** — Hero + Menu Cards + Reviews + WA Order
3. **Craft & Handmade** — Story + Gallery Grid + Products + About
4. **Services** — Hero + Pricing Cards + Portfolio + Booking (WA)
5. **General** — Hero + Products + FAQ + Contact

Each template = pre-filled block array with placeholder content. Seller edits text/images.

---

## 20. Email Infrastructure

### Library: unemail (multi-provider abstraction)

**Why unemail:**
- 15+ built-in drivers (Resend, Mailgun, SES, Postmark, SendGrid, Brevo, etc.)
- Swap provider in 1 line of code — no vendor lock-in
- Zero deps, edge-first (runs on CF Pages Functions)
- DKIM signing, retry with jitter, circuit breaker built-in
- React Email rendering support
- Provider fallback chains out of the box

**Default driver: Resend** (free 100 emails/day, React Email native)

**Fallback chain:** Resend → Mailgun (if Resend down)

```typescript
import { createEmail } from 'unemail'
import resend from 'unemail/driver/resend'
import mailgun from 'unemail/driver/mailgun'
import fallback from 'unemail/driver/fallback'

const email = createEmail({
  driver: fallback({
    drivers: [
      resend({ apiKey: process.env.RESEND_KEY! }),
      mailgun({ domain: 'lapak.id', apiKey: process.env.MAILGUN_KEY! }),
    ],
  }),
})
```

### Transactional Email Templates (MVP — 6 templates)

| Template | Trigger | Recipient | Content |
|---|---|---|---|
| **Welcome** | Seller signup | Seller | Store link, getting started tips, Studio login |
| **New Order** | Buyer places order | Seller | Order details, buyer info, total, shipping |
| **Order Confirmed** | Seller confirms order | Buyer | Order summary, estimated delivery, WA contact |
| **Order Shipped** | Seller marks shipped | Buyer | Tracking number, courier, estimated arrival |
| **AI Credits Low** | Balance < 5 credits | Seller | Credit balance, buy more link |
| **Password Reset** | Seller requests reset | Seller | Reset link (expires 1 hour) |

### Email Design
- React Email components for all templates
- Consistent branding: Lapak logo + store name in header
- Mobile-first layouts
- Dark mode support
- All emails in **bilingual** (Indonesian primary, English secondary link)

### Sender Identity
- Default: `Lapak <noreply@lapak.id>` via Resend
- Custom sender for seller stores: `Toko {name} <orders@lapak.id>` (Reply-To: seller's WA)
- Domain: `lapak.id` with SPF + DKIM + DMARC configured in DNS

---

## 21. Notification System

### MVP: Push + Email (no SMS in MVP)

**How sellers get instant order alerts:**

| Channel | Mechanism | Latency |
|---|---|---|
| **Studio push** | Realtime subscription via Supabase Realtime on `orders` table | <1s |
| **Email** | Immediate send via unemail (New Order template) | <5s |
| **WhatsApp** (v2) | Automated message via WA Business API | v2 |

**Supabase Realtime setup:**
```sql
-- Enable Realtime on orders table
alter publication supabase_realtime add table orders;
```

Studio subscribes to INSERT events on `orders` where `tenant_id = current_tenant`. On insert → browser notification (if permission granted) + sound + toast.

### Buyer Notifications

| Event | Channel | Content |
|---|---|---|
| Order confirmed | Email | Order summary, estimated delivery |
| Order shipped | Email | Tracking number, courier name |
| Order delivered | Email | Review request + link |

### Future (v2+)
- WhatsApp Business API for order alerts (seller) + shipping updates (buyer)
- In-app notification center with bell icon
- Push notification for mobile (PWA)

---

## 22. Error Handling Strategy

### External Service Failures

| Service | Failure Mode | Fallback | User Message |
|---|---|---|---|
| **Supabase down** | DB unreachable | CF KV cached storefront (stale 15min) | "Store is temporarily read-only" |
| **Xendit down** | Payment creation fails | Queue order in `pending_payment` status, retry 5x over 10min | "Payment processing delayed, we'll confirm shortly" |
| **AI provider down** | Primary model error | Fallback to next model → external provider (Gemini Flash) | "AI busy, retrying..." |
| **AI garbage output** | Empty/nonsensical response | Validation: min 20 chars, no repeated phrases. If fails → retry different model | "Generation failed, please try again" |
| **R2 upload fail** | Image upload error | Retry 3x with backoff. If persistent → local blob + async upload | "Upload failed, please retry" |
| **Everpro down** | Shipping calc fails | Fallback to RajaOngkir API. If both down → flat rate Rp15.000 | "Using standard shipping rate" |
| **Email (Resend) down** | Email send fails | unemail fallback to Mailgun. If both fail → queue in Supabase, retry 5min | Silent (email is async, user doesn't wait) |

### Error Boundaries (Frontend)

- **Studio/Console (React SPA):** React Error Boundaries per section. If block editor crashes → sidebar still works, other blocks intact.
- **Storefront (Astro SSR):** If SSR fails → CF Pages serves `/_fallback.html` static page with "Store temporarily unavailable" + retry link.
- **API errors:** Consistent `{ ok: false, error: { code, message } }` JSON. Codes: `INSUFFICIENT_CREDITS`, `PAYMENT_FAILED`, `NOT_FOUND`, `FORBIDDEN`, `RATE_LIMITED`, `AI_ERROR`, `VALIDATION_ERROR`.

### Rate Limiting Errors
- 429 response with `Retry-After` header
- Studio shows friendly "Slow down!" toast with countdown timer
- AI rate limits per tier (see §17)

---

## 23. Consolidated API Design

### API Surface — CF Pages Functions

All API routes run as CF Pages Functions (edge). Base URL: `https://lapak.id/api` or `https://{shop}.lapak.id/api`.

**Public (Storefront):**
```
GET  /api/storefront/{shop}           → Store info + published pages
GET  /api/storefront/{shop}/products  → Product catalog (paginated)
GET  /api/storefront/{shop}/products/{slug} → Product detail
GET  /api/storefront/{shop}/blog      → Blog posts (paginated)
GET  /api/storefront/{shop}/blog/{slug} → Blog post detail
GET  /api/storefront/{shop}/categories → Categories with product counts
POST /api/storefront/{shop}/cart      → Add to cart / update cart
POST /api/storefront/{shop}/checkout  → Initiate checkout → Xendit invoice
POST /api/storefront/{shop}/reviews   → Submit review
GET  /api/storefront/{shop}/bio       → Link-in-bio page data
```

**Authenticated (Studio):**
```
# Auth
POST /api/auth/login                   → Sign in (email/password)
POST /api/auth/register                → Create account + tenant
POST /api/auth/logout                  → Sign out
GET  /api/auth/me                      → Current user + tenant info

# Pages
GET    /api/pages                      → List pages
POST   /api/pages                      → Create page
GET    /api/pages/{id}                 → Get page with blocks
PUT    /api/pages/{id}                 → Update page (blocks, SEO, status)
DELETE /api/pages/{id}                 → Delete page

# Products
GET    /api/products                   → List products (paginated, filterable)
POST   /api/products                   → Create product
GET    /api/products/{id}              → Product detail
PUT    /api/products/{id}              → Update product
DELETE /api/products/{id}              → Delete product

# Blog
GET    /api/blog/posts                 → List posts
POST   /api/blog/posts                 → Create post
PUT    /api/blog/posts/{id}            → Update post
DELETE /api/blog/posts/{id}            → Delete post

# Media
POST   /api/media/upload               → Upload to R2, return URL
DELETE /api/media/{key}                → Delete from R2

# Settings
GET    /api/settings                   → Tenant settings
PUT    /api/settings                   → Update settings
PUT    /api/settings/theme             → Update theme tokens

# Orders
GET    /api/orders                     → List orders (filterable)
GET    /api/orders/{id}                → Order detail
PUT    /api/orders/{id}/status         → Update order status

# AI
POST   /api/ai/generate                → Unified AI endpoint (task-based routing)
GET    /api/ai/usage                   → Usage history + balance
POST   /api/ai/credits/purchase        → Buy credits (creates Xendit invoice)
GET    /api/ai/credits/balance         → Current balance

# Webhooks
POST   /api/webhooks/xendit            → Xendit callback (payment status)
POST   /api/webhooks/shipping          → Shipping tracker callback
```

**Platform (Console):**
```
GET    /api/admin/tenants              → All tenants (paginated)
PUT    /api/admin/tenants/{id}/status  → Suspend/activate tenant
GET    /api/admin/stats                → Platform-wide stats
GET    /api/admin/ai/usage             → AI usage across all tenants
GET    /api/admin/revenue              → Revenue summary
```

### Authentication
- **Studio/Console:** Supabase Auth JWT in cookie (httpOnly, secure, SameSite=Lax)
- **Public storefront:** No auth required. Cart = cookie-based session ID.
- **API keys:** None in MVP. All auth via Supabase JWT.
- **CSRF:** Double-submit cookie pattern on all state-changing requests.

### Response Format
```typescript
// Success
{ ok: true, data: T }

// Error
{ ok: false, error: { code: string, message: string } }

// Paginated
{ ok: true, data: T[], pagination: { page: number, per_page: number, total: number } }
```

---

## 24. Link-in-Bio (MVP)

### What It Is

Every seller gets a `lapak.id/s/{shopname}` link-in-bio page — an Instagram/TikTok-friendly landing page with their key links.

### Content Model
```typescript
interface BioPage {
  shopname: string
  display_name: string
  avatar_url: string | null
  tagline: string | null
  theme_color: string | null       // override store theme
  links: {
    label: string
    url: string
    icon: 'store' | 'whatsapp' | 'instagram' | 'tiktok' | 'shopee' | 'tokopedia' | 'custom'
    is_active: boolean
  }[]
  social_links: {
    platform: 'instagram' | 'tiktok' | 'facebook' | 'twitter' | 'youtube' | 'whatsapp'
    url: string
  }[]
  featured_product_ids: string[]   // show up to 3 featured products
}
```

### Studio Editor
- Separate "Link-in-Bio" section in Studio sidebar
- Drag-to-reorder links
- Toggle links active/inactive
- Preview panel (phone mockup frame)
- Custom theme color picker

### Storefront Rendering
- Route: `lapak.id/s/{shopname}` (Astro SSR page)
- Mobile-first layout (99% traffic from mobile social)
- Avatar centered at top, display name, tagline
- Stacked link buttons with icons
- Social icons row
- Optional: 3 featured product cards at bottom
- Share button (copy URL to clipboard)
- OG meta tags for link preview (avatar + name + tagline)

### Sizing Estimate
- ~200 lines Astro page component
- ~150 lines Studio editor component
- ~50 lines API endpoint
- **Total: ~400 lines, 1-2 day build**

---

## 25. Testing Strategy

### Three-Layer Testing Pyramid

**Layer 1 — Unit Tests (Vitest)**
- Target: utility functions, validators, theme token transforms, price formatting
- Coverage goal: 80%+ for `src/lib/` and `src/utils/`
- Run: `vitest` — fast, no network
- CI: runs on every push

**Layer 2 — Integration Tests (Vitest + Supabase local)**
- Target: API route handlers, Supabase queries, RLS policies
- Uses `supabase start` local instance with test fixtures
- Tests: create product → verify RLS → read as different tenant → forbidden
- Tests: checkout flow → Xendit mock → order created → inventory updated
- CI: runs on PR

**Layer 3 — E2E Tests (Playwright)**
- Target: critical buyer + seller flows
- Buyer: browse store → add to cart → checkout → order confirmation
- Seller: login → create product → publish page → view storefront
- Admin: login → view tenant list → suspend tenant
- Run: `playwright test` — against preview deployment
- CI: runs before merge to main

### Test Fixtures
- Seed script: `supabase/seed.sql` creates 3 test tenants with products, pages, orders
- Test users: `seller@test.com`, `buyer@test.com`, `admin@test.com`
- Test Xendit keys (sandbox mode)

### Coverage Target
- **API routes:** 100% of endpoints have integration tests
- **Studio components:** smoke tests (render without crash)
- **Storefront pages:** E2E covers all routes
- **Block editor:** unit tests for serialization/deserialization

---

## 26. Monitoring & Alerting

### Infrastructure Monitoring

| Tool | What It Monitors | Alert |
|---|---|---|
| **CF Analytics** | Request volume, error rate, latency per route | Email if error rate > 5% |
| **Supabase Dashboard** | DB connections, query performance, RLS errors | Email if connection pool > 80% |
| **UptimeRobot** (free) | HTTPS ping every 5min on `lapak.id` + `studio.lapak.id` | Email + Telegram webhook if down |
| **CF Workers AI metrics** | AI request latency, error rate per model | Log to `ai_usage_log` table |

### Application Monitoring

- **Structured logging:** All API routes log `{ method, path, status, latency_ms, tenant_id, error? }`
- **Error tracking:** Console → `window.onerror` + `unhandledrejection` → POST `/api/client-errors` → log to Supabase
- **Performance:** CF Analytics provides TTFB per route. Alert if p95 > 500ms.

### Alerting Rules (MVP)

| Condition | Action |
|---|---|
| Site down > 2 min | Telegram alert to Bio |
| API error rate > 10% for 5min | Telegram alert |
| Supabase connection pool > 80% | Email alert |
| AI proxy failing consistently | Log + disable AI features gracefully |
| New tenant signup | Telegram notification |

### Health Check Endpoint
```
GET /api/health → { ok: true, supabase: "connected", r2: "writable", ai: "available" }
```

---

## 27. Operational Policies

### Tenant Deletion & Data Retention

| Action | What Happens |
|---|---|
| **Seller downgrades to Free** | Paid features disabled. Pages/products/data retained. Checkout disabled. |
| **Seller requests deletion** | 30-day grace period. Data soft-deleted (flagged). After 30 days → hard delete all tenant data from Supabase + R2. |
| **Platform suspends tenant** | All storefront pages return 403. Studio read-only. Data retained 90 days. |
| **Inactive free tier (>12 months)** | Email warning at 11 months. If no login in 12 months → archive (hide from public, retain data). Delete after 24 months. |

### Backup Strategy

| What | Method | Frequency |
|---|---|---|
| **Supabase DB** | pg_dump via Supabase CLI | Daily (automated via cron) |
| **R2 images** | R2 bucket replication to backup bucket | Continuous |
| **Studio page JSON** | Stored in Supabase (backed up with DB) | Continuous |
| **Theme tokens** | Stored in Supabase (backed up with DB) | Continuous |

### Cookie/Session Strategy (Anonymous Cart)

- Anonymous buyers get a `lapak_cart` cookie with a UUID session ID
- Cart stored in Supabase `cart_sessions` table keyed by session UUID
- Cart expires after 7 days of inactivity
- On signup/login: merge anonymous cart into user's cart
- Cookie: `httpOnly=false` (JS reads for cart count badge), `SameSite=Lax`, `Secure` on production

### Image CDN Caching

- CF Images transformations cached at edge by default (respecting `Cache-Control`)
- Product images: `Cache-Control: public, max-age=86400, stale-while-revalidate=604800` (1 day cache, 7 day stale)
- Blog images: `Cache-Control: public, max-age=604800` (7 days)
- Seller logo/favicon: `Cache-Control: public, max-age=2592000` (30 days)
- R2 objects: immutable URLs with content hash in filename for cache busting

### i18n Strategy

- **Studio UI:** Bilingual toggle (Indonesian default, English available). Translation keys via `src/i18n/` JSON files.
- **Console UI:** Same bilingual toggle.
- **Storefront:** Seller's language (set in tenant_settings). Default: Indonesian.
- **Email templates:** Bilingual (Indonesian primary, "View in English" link at top).
- **Marketing site:** Indonesian only (target audience).
- **Implementation:** Simple key-value JSON files. No heavy i18n library. `useTranslation()` hook in React. Astro `t()` function for storefront.

---

## 28. What This PRD Needs Before We Start Coding

- [x] Confirm name → **Lapak** ✅
- [x] Confirm pricing tiers → **Free / Rp99K / Rp199K** ✅
- [x] Confirm payment gateway → **Xendit XenPlatform** ✅
- [x] Confirm shipping provider → **Everpro** ✅
- [x] Confirm tech stack → **Astro SSR + React SPA + CF Pages** ✅
- [x] Confirm AI strategy → **CF Workers AI + BYOK + Credits** ✅
- [x] Confirm subproject breakdown → **Storefront + Studio + Console + Marketing** ✅
- [x] Confirm image storage → **Cloudflare R2 (zero egress)** ✅
- [x] Confirm background removal → **CF Images API (free, built-in)** ✅
- [x] Confirm AI reseller legality → **All providers allow commercial use** ✅
- [x] Product variants → **JSONB field on products table** (A) ✅
- [x] Email provider → **unemail (multi-provider abstraction, Resend default + Mailgun fallback)** ✅
- [x] Studio/Console UI language → **Bilingual toggle (Indonesian default, English available)** (C) ✅
- [x] Link-in-Bio → **In MVP** (A) — simple bio page, ~400 lines, 1-2 day build ✅
- [x] Onboarding flow → **4-step wizard + Getting Started checklist + 5 templates** ✅
- [x] Notification system → **Supabase Realtime (Studio push) + unemail (email)** ✅
- [x] Error handling → **Typed error codes + fallback chains per service + error boundaries** ✅
- [x] Testing strategy → **Vitest (unit) + Supabase local (integration) + Playwright (E2E)** ✅
- [x] Monitoring → **CF Analytics + UptimeRobot + structured logging + health endpoint** ✅
- [x] API design → **Consolidated spec: public storefront + authenticated Studio + admin Console** ✅
- [x] Data retention → **30-day grace on deletion, 12-month inactive archive, 24-month hard delete** ✅
- [x] i18n → **Simple key-value JSON, no heavy library** ✅
- [x] Cart sessions → **Cookie-based UUID + Supabase cart_sessions table** ✅
- [x] Image caching → **Cache-Control headers by content type (1d/7d/30d)** ✅
- [x] Backup → **Daily pg_dump + R2 continuous replication** ✅
- [ ] Design: any visual references for the editor?
- [ ] Logo/branding direction?

**All 18 gaps patched. PRD coverage: 100%. Ready for implementation.**
