# Lapak PRD — Chapters Summary (Pillar Index)

> **Version:** v1.0 | **Last updated:** 2026-06-13
> **Total:** 30 sections (§0–§29), 3,300+ lines, 105 implementation steps
> **Source of truth:** `PRD-draft-v0.1.md` (monolith) or individual chapter files in `Lapak-PRD/`

---

## Chapter Index

| # | Title | File | Lines | Summary |
|---|-------|------|-------|---------|
| §0 | Must Use Skills | `s00-must-use-skills.md` | 44 | Skills inventory: 8 always-load, 30 conditional, 4 Lapak-specific. Mandatory loading rules per session type. |
| §1 | Why This Exists | `s01-why-this-exists.md` | 21 | Market gap: nobody does block-editor page builder + full e-commerce at UMKM price. Djualan = single-page + checkout. pageflow = editor + no commerce. Lapak = both. |
| §2 | Product Model | `s02-product-model-shopify-style-saas.md` | 134 | Shopify-style SaaS. 3 tiers (Free/Starter Rp99K/Pro Rp199K). Free = pages + products display + WA CTA. Starter = + checkout + custom domain. Pro = + analytics + remove branding. 7 à la carte addons. Buyer-bears-all-fees model (PG + Biaya Layanan + insurance all on buyer). Seller gets exact listed price. Voucher system (3 types). External "Beli di" links. |
| §3 | Target Users | `s03-target-users.md` | 18 | Primary: Indonesian UMKM WA seller ( Rp200K–5M/mo revenue, Instagram/WhatsApp). Secondary: freelance web designer building stores for clients. |
| §4 | Competitive Analysis | `s04-competitive-analysis.md` | 54 | Djualan (direct), pageflow.id (page builder). Lapak positioning: multi-page real ecommerce + block editor + free tier + blog + SEO. Zero seller commission — buyer pays all fees. |
| §5 | Tech Stack | `s05-tech-stack-subproject-architecture.md` | 142 | 4 subprojects: Storefront (Astro SSR/CF Pages), Studio (React SPA/shadcn), Console (React SPA/shadcn), Marketing (Astro SSG). Supabase + RLS. Xendit XenPlatform. Everpro shipping. R2 storage. CF Workers AI. |
| §6 | Architecture | `s06-architecture.md` | 178 | SSR tenant resolution (domain → Supabase lookup → render). Custom domains via CF for SaaS. Custom block editor (click-to-edit, React state, 2s debounce auto-save). Full monorepo directory structure. |
| §7 | Block Types | `s07-block-types-mvp-30-blocks.md` | 75 | 30 MVP blocks in 6 categories (Layout, Media, Commerce, Content, Social, Navigation). Universal features: padding, margin, bg, visibility. Lapak exclusives: Product Carousel, Category Grid, Voucher Banner, Store Map. |
| §8 | Database Schema | `s08-database-schema-supabase.md` | 520 | Full Supabase DDL: tenants, pages, blocks, products (variants JSONB, external_links JSONB), categories, orders (tracking_token, payment_proof, status_log, shipping_origins), order_items, order_status_log, vouchers, voucher_usages, external_link_clicks, tenant_addons, ai_credit_purchases, blog_posts, notifications, link_in_bio, leads. All RLS policies including platform_admin bypass. Indexes. |
| §9 | User Flows | `s09-user-flows.md` | 100 | 6 flows: (1) Sign up & onboard, (2) Edit page (free user), (3) Customer buys (checkout with voucher step), (4) Free user upgrades, (5) Custom domain setup, (6) Buyer tracks order (tracking_token + phone lookup, no auth). |
| §10 | Payment & Shipping | `s10-payment-shipping-integration.md` | 84 | Xendit XenPlatform: sub-accounts per tenant, VA/QRIS/e-wallet, fee splitting (Biaya Layanan collected automatically). Everpro: 5 regular + 3 instant couriers, insurance mandatory, webhook-driven. |
| §11 | What's OUT of MVP | `s11-what-s-out-of-mvp-v2.md` | 69 | Excluded from v1: inventory management, multi-currency, abandoned cart recovery, product reviews (in v1 but moderation in v2), mobile app, API marketplace, multi-warehouse, dropship, affiliate, live chat, social login, PIM. |
| §12 | Dev Breakdown | `s12-development-breakdown-5-phases-complete.md` | 148 | 105 steps across 5 phases: (1) Foundation (23 steps), (2) Storefront (18 steps incl. buyer order tracking + /go/ redirect + SEO), (3) Seller Studio (28 steps incl. order detail with status timeline), (4) Platform & Billing (16 steps), (5) Polish & Launch (20 steps). Maps every section to steps. |
| §13 | Key Design Decisions | `s13-key-design-decisions.md` | 49 | Documented decisions: product variants → JSONB, email → unemail, UI language → bilingual toggle, Link-in-Bio → in MVP, buyer-bears-all-fees, insurance mandatory, voucher system, external links with analytics. |
| §14 | AI Architecture | `s14-ai-architecture.md` | 173 | 5 AI functions: Copywriter (qwen3), Photography (flux-2), SEO Auto-Pilot (granite micro), Page Gen (llama-4-scout), Rewrite (llama-3.2-1b). Hybrid model: BYOK + credit reselling (2-3x markup). All proxied through CF Functions. Rate limits by tier. |
| §15 | Competitive Moats | `s15-competitive-moats.md` | 73 | 🥇 Blog+Sidebar+SEO Auto-Pilot+Free Tier+Link-in-Bio+Buyer-Pays-All. 🥈 Multi-Channel Product Hub+AI Photography+AI Copywriter. 🥉 Reviews Paywall+Smart Follow-Ups. |
| §16 | Image Storage | `s16-image-storage-processing.md` | 64 | R2 only (zero egress). CF Images BiRefNet background removal (free). Thumbnails auto-generated. Upload flow: R2 presigned → CF Images transform → CDN delivery. |
| §17 | AI Reseller Compliance | `s17-ai-reseller-compliance-legal.md` | 101 | Provider TOS analysis (all allow reselling). UU PDP compliance (user consent, data deletion). AI content disclosure. Credit system: packs (50/200/500), 12mo expiry, 10 free/month teaser. Billing via atomic Supabase UPDATE. |
| §18 | Open Risks | `s18-open-risks.md` | 16 | Key risks: Supabase cold start, Xendit API limits, R2 pricing changes, AI model deprecation, CF Pages deployment failures. Mitigations documented. |
| §19 | Seller Onboarding | `s19-seller-onboarding-flow.md` | 54 | 5-step wizard: (1) Store name + subdomain, (2) Business type, (3) Theme selection, (4) First product or skip, (5) Publish. Configurable via Studio → Appearance. |
| §20 | Email Infrastructure | `s20-email-infrastructure.md` | 57 | unemail library (15+ drivers, zero deps). Resend default + Mailgun fallback. Transactional emails: welcome, order confirmed, shipping update, password reset. Templates in React Email. |
| §21 | Notification System | `s21-notification-system.md` | 35 | In-app (bell icon, toast), email (transactional), WhatsApp (optional Pro). Notification preferences per seller. Stored in `notifications` table. |
| §22 | Error Handling | `s22-error-handling-strategy.md` | 194 | Full error hierarchy (12 error classes), 16 error codes with HTTP status + Indonesian messages, external service fallback matrix (10 services), SSR error pages (404/500/suspended/not-found), Studio error boundaries (granular per-block), retry strategies with backoff + jitter + circuit breaker, error logging format, graceful degradation priority. |
| §23 | Consolidated API | `s23-consolidated-api-design.md` | 106 | Full REST API spec: /api/auth/*, /api/pages/*, /api/blocks/*, /api/products/*, /api/orders/*, /api/track/* (buyer public tracking), /api/storefront/{shop}/track (phone lookup), /api/checkout/*, /api/admin/*, /api/theme/*, /api/upload/*, /api/ai/*. All with auth, validation, rate limiting. |
| §24 | Link-in-Bio | `s24-link-in-bio-mvp.md` | 53 | MVP feature: `/bio/{shopname}` page. Avatar, display name, tagline, stacked link buttons, social icons, 3 featured products. OG meta for previews. Share button. ~400 lines, 1-2 day build. |
| §25 | Testing Strategy | `s25-testing-strategy.md` | 235 | 4-layer pyramid: Vitest unit (80% lib coverage), Vitest+Supabase integration (100% API endpoints), Playwright E2E (buyer/seller/admin + axe-core a11y), k6 load (Phase 5). CI pipeline: lint → typecheck → unit → build → integration → E2E. Test fixtures (3 tenants, 30 products, 10 orders). Mock services (Xendit sandbox, AI canned, R2 local). 8 testing rules. Indonesian copy assertions. |
| §26 | Monitoring | `s26-monitoring-alerting.md` | 34 | Sentry (errors), CF Analytics (edge perf), Supabase Dashboard (DB health), Uptime Robot (availability). Alerts: error spike, slow queries, payment failures. |
| §27 | Operational Policies | `s27-operational-policies.md` | 47 | Data retention (7yr financial, 2yr analytics, 30d logs). Backup: daily pg_dump + R2 replication. Incident response: 1hr ack, 4hr resolution. SLA targets. |
| §28 | PRD Checklist | `s28-what-this-prd-needs-before-we-start-coding.md` | 31 | Pre-coding checklist: schema ✓, API ✓, user flows ✓, testing ✓, security ✓. Remaining: visual design refs + logo/branding. |
| §29 | Engineering Standards & UI/UX | `s29-engineering-standards-ui-ux-conventions.md` | 400 | 10 subsections: architecture patterns (RLS, BFF, repo pattern, webhooks), design patterns (Strategy, Factory, Adapter, Builder, Plugin, Observer), TypeScript strict standards, error hierarchy, security (CSRF, rate limiting, XSS, RLS defense-in-depth), UI/UX conventions (13 skeleton loaders, optimistic UI, empty states, mobile-first, WCAG 2.2 AA, toast patterns, form conventions), performance (Lighthouse 95+ targets, LCP/FID/CLS budgets, bundle size limits, image optimization, caching strategy, font strategy), component architecture (naming, file structure, props pattern), testing conventions (Vitest + Playwright + Lighthouse CI), Git & CI (conventional commits, branch strategy, 7-step CI pipeline). |

---

## Architecture at a Glance

```
┌─────────────────────────────────────────────────┐
│                  CLOUDFLARE EDGE                │
│  ┌──────────┐  ┌──────────┐  ┌───────────────┐  │
│  │Storefront│  │ Marketing│  │ CF Functions  │  │
│  │Astro SSR │  │Astro SSG │  │   (BFF API)   │  │
│  └─────┬────┘  └──────────┘  └───────┬───────┘  │
│        │         CF Pages            │          │
│        │    CF for SaaS (domains)    │          │
└────────┼─────────────────────────────┼──────────┘
         │                             │
         │    ┌────────────────┐       │
         │    │  R2 Storage    │       │
         │    │  CF Images     │       │
         │    └────────────────┘       │
         │                             │
         └──────────┬──────────────────┘
                    │
         ┌──────────┴──────────┐
         │     SUPABASE        │
         │  (RLS multi-tenant) │
         └─────────────────────┘

┌─────────────────────────────────────────────────┐
│          REACT SPAs (separate deploys)          │
│  ┌──────────────────┐  ┌────────────────────┐   │
│  │  Seller Studio   │  │ Platform Console   │   │
│  │  studio.lapak.id │  │ console.lapak.id   │   │
│  │  (shadcn/ui)     │  │  (shadcn/ui)       │   │
│  └──────────────────┘  └────────────────────┘   │
└─────────────────────────────────────────────────┘

External: Xendit XenPlatform (payments) │ Everpro (shipping) │ CF Workers AI
```

---

## Key Business Model Numbers

- **Free tier:** Unlimited pages, products display-only, WA CTA
- **Starter:** Rp99K/mo — + checkout + custom domain
- **Pro:** Rp199K/mo — + analytics + remove branding
- **7 Addons:** Rp15K–Rp49K/mo each (à la carte)
- **AI Credits:** 50/Rp25K, 200/Rp75K, 500/Rp150K
- **Revenue:** Biaya Layanan Rp1K–4K per transaction (buyer pays)
- **Seller gets:** Exact listed price. Zero deductions.

---

## File Structure

```
Lapak-PRD/
├── PRD-CHAPTERS-SUMMARY.md          ← YOU ARE HERE (pillar index)
├── PRD-draft-v0.1.md                ← Full monolith (2,482 lines)
├── s00-frontmatter.md                ← Title + metadata
├── s00-must-use-skills.md            ← §0 Skills inventory
├── s01-why-this-exists.md            ← §1 Market gap
├── s02-product-model-shopify-style-saas.md  ← §2 Tiers, pricing, addons, fees
├── s03-target-users.md               ← §3 User personas
├── s04-competitive-analysis.md       ← §4 Djualan vs pageflow vs Lapak
├── s05-tech-stack-subproject-architecture.md ← §5 Stack choices
├── s06-architecture.md               ← §6 SSR, domains, editor, monorepo
├── s07-block-types-mvp-30-blocks.md  ← §7 30 block types
├── s08-database-schema-supabase.md   ← §8 Full DDL + RLS (biggest chapter)
├── s09-user-flows.md                 ← §9 5 user flows
├── s10-payment-shipping-integration.md ← §10 Xendit + Everpro
├── s11-what-s-out-of-mvp-v2.md       ← §11 Excluded features
├── s12-development-breakdown-5-phases-complete.md ← §12 95 steps
├── s13-key-design-decisions.md       ← §13 Documented decisions
├── s14-ai-architecture.md            ← §14 AI functions + credits
├── s15-competitive-moats.md          ← §15 Moats (Tier 1-3)
├── s16-image-storage-processing.md   ← §16 R2 + CF Images
├── s17-ai-reseller-compliance-legal.md ← §17 Legal + UU PDP
├── s18-open-risks.md                 ← §18 Risks + mitigations
├── s19-seller-onboarding-flow.md     ← §19 5-step wizard
├── s20-email-infrastructure.md       ← §20 unemail + templates
├── s21-notification-system.md        ← §21 In-app + email + WA
├── s22-error-handling-strategy.md    ← §22 Error hierarchy
├── s23-consolidated-api-design.md    ← §23 Full REST API spec
├── s24-link-in-bio-mvp.md            ← §24 Bio page feature
├── s25-testing-strategy.md           ← §25 Vitest + Playwright + k6
├── s26-monitoring-alerting.md        ← §26 Sentry + CF Analytics
├── s27-operational-policies.md       ← §27 Retention + backup + SLA
├── s28-what-this-prd-needs-before-we-start-coding.md ← §28 Checklist
└── s29-engineering-standards-ui-ux-conventions.md    ← §29 Engineering + UI/UX
```

---

## Cross-Reference Map

**Database (§8) is referenced by:**
§2 (pricing model), §5 (tech stack), §9 (user flows), §10 (payment/shipping), §12 (dev steps), §14 (AI credits), §17 (billing), §23 (API design)

**Architecture (§6) is referenced by:**
§5 (tech stack), §7 (blocks), §12 (dev steps), §23 (API), §25 (testing)

**Payment (§10) is referenced by:**
§2 (pricing), §8 (orders schema), §9 (checkout flow), §12 (dev steps), §13 (decisions), §15 (moats)

**AI (§14) is referenced by:**
§2 (addons), §5 (tech stack), §12 (dev steps), §15 (moats), §16 (images), §17 (compliance)

---

*PRD coverage: 100%. All 30 sections (§0–§29) complete. 105 implementation steps mapped. Engineering standards locked. Migration 00007 adds order detail, buyer tracking, platform_admin RLS bypass. Ready for coding.*
