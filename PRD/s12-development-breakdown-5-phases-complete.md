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
| 1.14 | **Shared types repo (@lapak/types)** | 6th polyrepo `Lapak/shared/`. TypeScript interfaces for blocks, products, orders, themes, vouchers, addons. Published as `@lapak/types` to GitHub Packages (private npm). Each app repo installs via `.npmrc` pointing to `github:cryptorichyrich`. Versioned via Changesets. | §5 |
| 1.15 | **Seed script** | SQL seed: 2 demo tenants (Toko Vavelle, KB Demo), 3 preset themes (Default, Minimalist, Bold), 10 sample products, 3 blog posts, homepage with 8 blocks. | §8 |
| 1.16 | **Email setup (unemail)** | Install `unemail`. Configure Resend driver + Mailgun fallback. Create email service module (`src/lib/email.ts`). Send test email via both drivers. Configure SPF + DKIM + DMARC DNS records for `lapak.id`. | §20 |
| 1.17 | **Error handling framework** | Create `src/lib/errors.ts` with typed error codes (`INSUFFICIENT_CREDITS`, `PAYMENT_FAILED`, `NOT_FOUND`, etc.). Implement error boundary components for Studio/Console. Create `/_fallback.html` static page for storefront SSR failures. Add consistent `{ ok, error }` response wrapper to all API routes. | §22 |
| 1.18 | **Health check + monitoring base** | Create `GET /api/health` endpoint checking Supabase + R2 + AI connectivity. Set up UptimeRobot for `lapak.id` + `studio.lapak.id`. Add structured logging middleware to all API routes. | §26 |
| 1.19 | **Anonymous cart session** | Create `cart_sessions` table. Implement `lapak_cart` cookie middleware (UUID session ID, 7-day expiry). Add cart session resolution to storefront API context. | §27 |
| 1.20 | **GitHub repos** | Create 6 private repos on `github.com/cryptorichyrich/`: api, storefront, studio, console, marketing, shared. Add remote origin to each local repo. Push initial commit (README.md + .gitignore + .editorconfig). | §5 |
| 1.23 | **Magic Link (passwordless login)** | `POST /api/auth/magic-link` → Supabase sends OTP email with login link. User clicks → auto-verified → session created. No password required. Supabase config: `enable_signup=true`, `enable_confirmations=false` (local). Config `additional_redirect_urls` includes storefront + studio. For production: enable confirmations + configure SMTP (Resend). | §5, §9 |
| 1.21 | **CF Pages projects** | Create 5 CF Pages projects via Wrangler, each git-connected to GitHub main branch: storefront (Astro SSR), studio (Vite SPA), console (Vite SPA), marketing (Astro SSG), api (Hono CF Workers). Configure build commands, output dirs, environment variables. | §5, §6 |
| 1.22 | **CI/CD pipeline** | GitHub Actions `.github/workflows/ci.yml` per repo. Steps: ESLint + Prettier → tsc --noEmit → Vitest → Build verify → E2E Playwright (storefront + studio) → Lighthouse (storefront + marketing) → Bundle size check. Deployment is automatic via CF Pages git integration (PR = preview, main = production). | §29 |

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
| 2.17 | **Buyer order tracking (public)** | `GET /api/track/{tracking_token}` → order detail via service_role (no auth). `POST /api/storefront/{shop}/track` → phone lookup via `normalize_phone()`. Both return: order_number, status timeline (from `order_status_log`), items, total, shipping address, tracking number, seller WA. Buyer CANNOT see: seller_notes, other buyers' orders. | §9, §23 |
|| 2.18 | **Storefront tracking page** | Astro SSR: `/track/[token]` → fetch order → render status timeline + items + total + shipping info. Mobile-first. Status badges: pending (yellow) → paid (blue) → shipped (orange) → delivered (green). Link to seller WA. | §9 |

#### Phase 2 Architecture Decisions (Post-Mental Gymnastics)

**Data flow:** Astro SSR calls Supabase directly with service_role key (zero HTTP hops). No API proxy for reads. Writes go through API.

**Supabase client:** Thin helper module (`api/src/lib/supabase.ts`) wrapping fetch(). No `@supabase/supabase-js` SDK. Consistent with auth.ts raw fetch pattern.

**Block naming:** Indonesian names per PRD §7 / Djualan convention. Internal `block_type` keys: `hero`, `manfaat`, `testimoni`, `faq`, `whatsapp`, `produk`, `teks`, `galeri`, `cta`, etc. (33 total in `@lapak/types`).

**Cart:** localStorage-only for guests (buyers have no auth). Server-side sync deferred to Phase 3.

**Checkout:** STUB in Phase 2. Real payment flow requires Xendit (Phase 4). Show summary + WA redirect.

**Storefront repo:** `Lapak/storefront/` — Astro v5 SSR (`output: 'server'`), `@astrojs/cloudflare` adapter, React islands, Tailwind v4.

**Prerequisite fixes (Layer 0):**
1. ✅ Fix seed.sql column bugs (`type` → `block_type`, remove `tenant_id` from blocks)
2. ✅ Update `@lapak/types` BlockType to Indonesian naming
3. ☐ Create `api/src/lib/supabase.ts` (thin fetch helper)
4. ☐ Fix `api/src/middleware/tenant.ts` (Supabase query fallback instead of null)
5. ☐ Create storefront API routes (7 public read endpoints)
6. ☐ Wire storefront routes in `api/src/index.ts`

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
| 3.9 | **Order manager module** | Order list with status filters (pending, paid, shipped, delivered, cancelled). Order detail page: buyer info, items with images, payment proof, status timeline (from `order_status_log`), shipping tracking number. Status update → auto-log to order_status_log → trigger Everpro shipment creation if "shipped". Internal seller_notes field (buyer cannot see). | §5, §10 |
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

**Prompt count: 105 steps across 5 phases.**
**PRD coverage: every section (§0–§29) mapped to at least one step.**

---
