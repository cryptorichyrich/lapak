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
