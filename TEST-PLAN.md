# Lapak Studio — Comprehensive Test Plan

## Test Matrix: Every Studio Page

| # | Page | URL | Auth | Key Interactions | Expected Data Source |
|---|------|-----|------|------------------|---------------------|
| 1 | Login | `/login` | No | Email/password, link to register, forgot password | Supabase Auth |
| 2 | Register | `/register` | No | Email/password/name, link to login | Supabase Auth |
| 3 | Forgot Password | `/forgot-password` | No | Email → reset link | Supabase Auth |
| 4 | Reset Password | `/reset-password` | Token | New password form | Supabase Auth |
| 5 | Dashboard | `/` | Yes+Tenant | Stats cards, revenue chart, recent orders, checklist | Supabase (orders, products, pages) |
| 6 | Onboarding | `/onboarding` | Yes, no tenant | 4-step wizard, "Mulai Jualan" | Supabase (tenants, tenant_settings) |
| 7 | Products List | `/products` | Yes+Tenant | List, create, edit, delete | Supabase (products) |
| 8 | Product Form | `/products/new` | Yes+Tenant | Create form, image upload | Supabase (products, categories) |
| 9 | Product Edit | `/products/:id` | Yes+Tenant | Edit form, image management | Supabase (products) |
| 10 | Orders List | `/orders` | Yes+Tenant | Filter by status, list | Supabase (orders) |
| 11 | Order Detail | `/orders/:id` | Yes+Tenant | Status update, seller notes, items | Supabase (orders, order_items) |
| 12 | Pages List | `/pages` | Yes+Tenant | List, create, edit, delete | Supabase (pages) |
| 13 | Editor New | `/editor/new` | Yes+Tenant | Title input → create page → redirect | Supabase (pages INSERT) |
| 14 | Editor Edit | `/editor/:id` | Yes+Tenant | Block CRUD, autosave, appearance | Supabase (pages, blocks) |
| 15 | Analytics | `/analytics` | Yes+Tenant | Revenue, orders, top products chart | Supabase (orders, order_items) |
| 16 | Customers/CRM | `/customers` | Yes+Tenant | List, filter by segment, export CSV | Supabase (orders derived) |
| 17 | Vouchers | `/vouchers` | Yes+Tenant | CRUD, code generator, toggle | Supabase (vouchers) |
| 18 | Addons | `/addons` | Yes+Tenant | Subscribe/unsubscribe addons | Supabase (tenant_addons) |
| 19 | AI Tools | `/ai-tools` | Yes+Tenant | Generate content, usage log | Supabase (ai_usage_log) |
| 20 | AI Usage/Settings | `/ai-usage` | Yes+Tenant | Buy credits, usage stats | Supabase (ai_credits) |
| 21 | Theme Editor | `/theme` | Yes+Tenant | Colors, typography, spacing, glass | Supabase (tenant_settings.meta) |
| 22 | Link-in-Bio | `/bio` | Yes+Tenant | Add/edit/reorder links, save | Supabase (tenant_settings.meta) |
| 23 | Blog List | `/blog` | Yes+Tenant | List, create, edit, delete | Supabase (blog_posts) |
| 24 | Blog Editor | `/blog/:id` | Yes+Tenant | Title, content, SEO, image | Supabase (blog_posts, blog_categories) |
| 25 | Settings | `/settings` | Yes+Tenant | Shop info, WhatsApp, city, logo | Supabase (tenants, tenant_settings) |
| 26 | Account | `/account` | Yes+Tenant | Change password, sign out all | Supabase Auth |
| 27 | Support | `/support` | Yes+Tenant | FAQ, WhatsApp contact form | Static + wa.me link |
| 28 | Terms | `/terms` | No | Legal text | Static |
| 29 | Privacy | `/privacy` | No | Legal text | Static |
| 30 | 404 | `/nonexistent` | Any | Not found page | Static |

## Storefront Pages

| # | Page | URL Pattern | Key Test |
|---|------|-------------|----------|
| S1 | Home | `{slug}.workers.dev/` | Tenant resolution, blocks render |
| S2 | Custom Page | `{slug}.workers.dev/{page-slug}` | Blocks render, SEO meta |
| S3 | Products | `{slug}.workers.dev/products` | Product grid, category filter |
| S4 | Product Detail | `{slug}.workers.dev/products/{slug}` | Price, images, WA button |
| S5 | Blog List | `{slug}.workers.dev/blog` | Post cards, pagination |
| S6 | Blog Post | `{slug}.workers.dev/blog/{slug}` | Content, sidebar products |
| S7 | Category | `{slug}.workers.dev/category/{slug}` | Product grid |
| S8 | Search | `{slug}.workers.dev/search?q=` | Results |
| S9 | Track Order | `{slug}.workers.dev/track` | Token lookup |

## Critical Regression Tests

### R1: Page Refresh (Auth)
- [ ] Login → land on dashboard → F5 refresh → stays on dashboard (NOT onboarding)
- [ ] Navigate to any page → switch browser tabs → come back → no refetch

### R2: CORS / API
- [ ] Open DevTools Network tab → navigate all Studio pages → ZERO requests to `lapak-api.workers.dev`
- [ ] All data loads from `emopndwniprbmkwxqnrz.supabase.co` only

### R3: RLS / Permissions
- [ ] No 42501 errors in Network tab
- [ ] No 42703 (column doesn't exist) errors
- [ ] Data visible on dashboard, products, orders, pages

### R4: Editor
- [ ] `/editor/new` → shows title input form → creates page → redirects to editor
- [ ] `/editor/:existing-id` → loads blocks without crash
- [ ] Add block → appears in canvas → autosave triggers
- [ ] Edit block properties → updates in canvas
- [ ] Edit block appearance → no crash
- [ ] Delete block → removed from canvas
- [ ] Reorder blocks (up/down) → order changes

### R5: Storefront
- [ ] `vavelle.lapak-storefront.fxwisdom1.workers.dev/` → home page renders
- [ ] `/krispibabi-premium` → blocks render (not 404)
- [ ] `/flash-sale` → blocks render
- [ ] `/tentang-kami` → blocks render
