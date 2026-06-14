# Lapak — Shopify for Indonesian UMKM

> Multi-tenant e-commerce platform. Block editor page builder + full checkout + Indonesian payments. Multi-page real ecommerce websites, not single-page landing pages.

## Repository Structure

```
Lapak/
├── PRD/                    ← Product Requirements (all chapters + pillar index)
│   ├── PRD-CHAPTERS-SUMMARY.md   ← START HERE — pillar index with summaries
│   ├── PRD-draft-v0.1.md         ← Full monolith (2,482 lines)
│   └── s00-*.md through s28-*.md ← Individual chapter files
│
├── api/                    ← [REPO 1] BFF API Layer (CF Functions + Hono)
│   ├── /src/routes         ← API route handlers (auth, products, orders, checkout...)
│   ├── /src/middleware      ← Auth, CSRF, rate limiting, tenant resolution
│   ├── /src/services        ← Business logic (Xendit, Everpro, AI proxy, R2)
│   └── /src/lib            ← Supabase client, validators, error types
│
├── storefront/             ← [REPO 2] Astro SSR Storefront (CF Pages)
│   ├── /src/pages          ← Astro pages (SSR, tenant-resolved)
│   ├── /src/components     ← Astro + React island components
│   └── /src/lib            ← Shared utilities
│
├── studio/                 ← [REPO 3] Seller Studio SPA (CF Pages)
│   ├── /src/pages          ← React Router pages
│   ├── /src/components     ← UI components (shadcn/ui)
│   ├── /src/features       ← Feature modules (editor, products, orders...)
│   └── /src/lib            ← API client, auth, utilities
│
├── console/                ← [REPO 4] Platform Console SPA (CF Pages)
│   ├── /src/pages          ← React Router pages
│   ├── /src/components     ← UI components (shadcn/ui)
│   └── /src/lib            ← API client, auth, utilities
│
└── marketing/              ← [REPO 5] Marketing Site SSG (CF Pages)
    ├── /src/pages          ← Astro pages (static)
    ├── /src/components     ← Landing page sections
    └── /src/content        ← Blog, docs, changelog
```

## Quick Links

| What | Where |
|------|-------|
| PRD Pillar Index | `PRD/PRD-CHAPTERS-SUMMARY.md` |
| Full PRD Monolith | `PRD/PRD-draft-v0.1.md` |
| Database Schema | `PRD/s08-database-schema-supabase.md` |
| API Design | `PRD/s23-consolidated-api-design.md` |
| Dev Steps (95) | `PRD/s12-development-breakdown-5-phases-complete.md` |
| Tech Stack | `PRD/s05-tech-stack-subproject-architecture.md` |
| Architecture | `PRD/s06-architecture.md` |

## Subprojects

| Repo | Stack | Domain | Description |
|------|-------|--------|-------------|
| `api/` | CF Functions + Hono | `*.lapak.id/api/*` | BFF API — auth, CRUD, checkout, AI proxy, webhooks |
| `storefront/` | Astro SSR | `{shop}.lapak.id` | Multi-tenant storefront (pages, products, blog) |
| `studio/` | React SPA (Vite + shadcn) | `studio.lapak.id` | Seller admin — editor, products, orders |
| `console/` | React SPA (Vite + shadcn) | `console.lapak.id` | Platform admin — tenants, billing |
| `marketing/` | Astro SSG | `lapak.id` | Landing page, pricing, docs |

## Key Decisions

- **SSR via Cloudflare Pages** — edge rendering, zero cold starts
- **Supabase RLS** — shared DB, tenant-scoped by `tenant_id`
- **Xendit XenPlatform** — payments + fee splitting (Biaya Layanan)
- **Buyer-bears-all-fees** — seller gets exact listed price
- **Custom block editor** — not GrapesJS, click-to-edit with React state
- **R2 storage** — zero egress, CF Images for transforms
- **CF Workers AI** — default AI provider, BYOK option

## Status

- [x] PRD v0.8 complete (2,882 lines, 30 sections, 95 steps)
- [x] PRD split into chapters
- [x] 5 repos initialized (api, storefront, studio, console, marketing)
- [x] §29 Engineering Standards & UI/UX Conventions (400 lines)
- [ ] Begin coding Phase 1
