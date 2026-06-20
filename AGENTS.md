<!-- FLUX:START -->
## Flux Task Management

You have access to Flux for task management via MCP or CLI.

**Rules:**
- All work MUST belong to exactly one project_id
- Do NOT guess or invent a project_id
- Track all work as tasks; update status as you progress
- Close tasks immediately when complete

**Startup:**
1. List projects (`flux project list`)
2. Select or create ONE project
3. Confirm active project_id before any work

**If context is lost:** Re-list projects/tasks. Ask user if ambiguous.

**Active Project:** `e3fpq8z` (Lapak Platform)
**Current Status:** ✅ **ALL 5 PHASES COMPLETE (116/116 tasks, 100%)**
**Last Updated:** 20 June 2026 — Phase 5 closed. Platform ready for launch.
<!-- FLUX:END -->

## Project Conventions

- **Migrations:** Sequential `00001_`, `00003_`, `00005_`, `00006_`, `00007_` in `api/supabase/migrations/`
- **RLS:** Every tenant-scoped table has `platform_admin` bypass via `is_platform_admin()` (added in 00007)
- **Auth:** Buyers = guest (no auth.users). Sellers = Supabase Auth. `auth_tenant_id()` from JWT.
- **Buyer tracking:** `tracking_token` UUID (not order ID) + phone lookup via `normalize_phone()`
- **Design:** Vavelle = Liquid Glass, KB = Fresh Republic. taste-skill governs.
- **API:** `api/index.ts` = all routes. `/api/storefront/{shop}/*` = public. `/api/tenant/*` = authenticated.
- **CSRF:** All write routes need CSRF middleware (not yet implemented — GAP 4)
- **Credentials:** `.dev.vars` (never committed). SUPABASE_URL, ANON_KEY, SERVICE_ROLE_KEY.
- **PRD:** 30 sections (§0–§29), 105 implementation steps, 5 phases. Chapters Summary = source of truth.

## Key Files

- `PRD/PRD-CHAPTERS-SUMMARY.md` — chapter index with line counts
- `PRD/s08-database-schema-supabase.md` — full DB spec (updated with 00007 schema)
- `PRD/s12-development-breakdown-5-phases-complete.md` — 105 steps across 5 phases
- `PRD/s23-consolidated-api-design.md` — REST API spec (updated with buyer tracking)
- `AUDIT-PHASE1.md` — gap analysis results
- `api/supabase/migrations/00007_order_detail_enhancements.sql` — latest migration

## DB Column Mapping (migration → code)

Route code must match actual DB column names (from migrations 00001-00007):

- `tenants.shop_name` (NOT `name`), `tenants.domain` (NOT `custom_domain`)
- `tenants.logo_url` → lives in `tenant_settings`, NOT `tenants`
- `products.compare_price` (NOT `compare_at_price`), `products.weight_grams` (NOT `weight`)
- `products.status` uses `'published'` (NOT `'active'`), products have `stock` column
- `pages.type` (NOT `page_type`), `pages.seo` JSONB (NOT `seo_title`/`seo_description`)
- `blog_posts.seo` JSONB (NOT `seo_title`/`seo_description`)
- `orders.tracking_token` UUID, `orders.courier`/`courier_service`, `orders.buyer_notes`/`seller_notes`
