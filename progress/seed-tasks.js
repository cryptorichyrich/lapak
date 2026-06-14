// Direct SQLite seed — bypasses CLI shell issues
const Database = require('better-sqlite3');
const path = require('path');
const crypto = require('crypto');

const dbPath = path.resolve(__dirname, '..', '.flux', 'data.sqlite');
console.log('DB path:', dbPath);
const db = new Database(dbPath);
db.pragma('journal_mode = WAL');

function genId() { return crypto.randomBytes(4).toString('hex'); }

// Read current data
const row = db.prepare('SELECT data FROM store WHERE id = 1').get();
const data = JSON.parse(row.data);

// Task definitions: [epic_id, title, priority]
const tasks = [
  // Phase 1: Foundation (19 tasks)
  ['4kzvsjy','1.1 Init polyrepo structure — api repo with Hono + CF Workers + TypeScript', 0],
  ['4kzvsjy','1.2 Hono SSR config — @hono/node-server local, @hono/cloudflare-pages deploy', 0],
  ['4kzvsjy','1.3 Local Supabase — docker-compose postgres+auth+studio, supabase/ migrations folder', 0],
  ['4kzvsjy','1.4 Migrations — core tables: tenants, tenant_settings, users, themes', 0],
  ['4kzvsjy','1.5 Migrations — content tables: pages, blocks, products, categories, blog_posts, blog_categories', 0],
  ['4kzvsjy','1.6 Migrations — commerce tables: orders, order_items, reviews, leads, follow_ups, shipping_zones', 0],
  ['4kzvsjy','1.7 Migrations — AI tables: ai_usage_log, ai_credit_purchases', 0],
  ['4kzvsjy','1.8 RLS policies — every table tenant-scoped, platform_admin bypass, 2-tenant isolation test', 0],
  ['4kzvsjy','1.9 Supabase Auth — email+Google OAuth+magic link, JWT claims (tenant_id, role), auto-create tenant', 0],
  ['4kzvsjy','1.10 Tenant resolution middleware — host > KV > tenant_id > locals, 404 unknown host', 1],
  ['4kzvsjy','1.11 KV + edge caching — tenant config to KV on publish, cacheTtl=900, purge on publish', 1],
  ['4kzvsjy','1.12 R2 bucket + upload API — lapak-assets bucket, POST /api/upload, size limits 5MB', 1],
  ['4kzvsjy','1.13 CF Images integration — transformations: resize, WebP, bg removal test', 2],
  ['4kzvsjy','1.14 Shared types package — @lapak/types: blocks, products, orders, themes TS interfaces', 0],
  ['4kzvsjy','1.15 Seed script — 2 demo tenants, 3 themes, 10 products, 3 blog posts, homepage 8 blocks', 1],
  ['4kzvsjy','1.16 Email setup (unemail) — Resend driver + Mailgun fallback, SPF+DKIM+DMARC DNS', 2],
  ['4kzvsjy','1.17 Error handling framework — typed error codes, error boundaries, {ok,error} response wrapper', 1],
  ['4kzvsjy','1.18 Health check + monitoring — GET /api/health (Supabase+R2+AI), structured logging', 1],
  ['4kzvsjy','1.19 Anonymous cart session — cart_sessions table, lapak_cart cookie middleware', 1],

  // Phase 2: Storefront (16 tasks)
  ['8syjbi3','2.1 Storefront layout shell — theme tokens to CSS vars, header (logo+nav+cart), footer, mobile-first', 0],
  ['8syjbi3','2.2 Block renderer — map JSON block array to components, each block=separate file, graceful skip', 0],
  ['8syjbi3','2.3 Homepage / — fetch page slug "home" + published blocks, render via BlockRenderer, edge-cached 15min', 0],
  ['8syjbi3','2.4 Product catalog /products — grid view, filters (category/price/search), paginated 20/page, SSR+client', 1],
  ['8syjbi3','2.5 Product detail /products/[slug] — image gallery, variants, add-to-cart, Beli di links, reviews, JSON-LD', 1],
  ['8syjbi3','2.6 Category pages /category/[slug] — header + description + filtered product grid', 1],
  ['8syjbi3','2.7 Blog index /blog — post list with pagination, category filter, auto OG image', 2],
  ['8syjbi3','2.8 Blog post /blog/[slug] — article + product sidebar widget (Tier 1 moat), JSON-LD Article', 2],
  ['8syjbi3','2.9 Custom pages /[slug] — render seller-created pages via BlockRenderer', 1],
  ['8syjbi3','2.10 Cart React component — add/remove/update qty, localStorage guests, Supabase sync logged-in', 1],
  ['8syjbi3','2.11 Checkout flow /checkout — shipping > rate calc > payment > redirect > webhook > confirmed (Starter+)', 1],
  ['8syjbi3','2.12 WhatsApp CTA (Free tier) — Buy buttons to wa.me link, track clicks in leads table', 1],
  ['8syjbi3','2.13 SEO auto-pilot — auto title/meta/OG/Twitter, JSON-LD schemas, sitemap.xml, robots.txt', 1],
  ['8syjbi3','2.14 Promo landing /promo/[slug] — BlockRenderer + countdown timer, shareable campaign links', 2],
  ['8syjbi3','2.15 Search /search?q= — server-side ilike on name+description, instant suggestions client', 2],
  ['8syjbi3','2.16 Outbound redirect /go/{shop}/{product}/{platform} — validate > INSERT clicks > 302, hub authority', 1],

  // Phase 3: Studio (28 tasks)
  ['n35sdui','3.1 Studio shell — React SPA at /studio/, Vite+React Router, auth guard, sidebar nav, mobile-responsive', 0],
  ['n35sdui','3.2 Studio auth + tenant context — Supabase Auth login, tenant profile React context, CSRF token', 0],
  ['n35sdui','3.3 Dashboard module — cards: today orders/revenue/visitors, 7-day chart, quick actions', 1],
  ['n35sdui','3.4 Block editor core — EditorCanvas + EditorPanel + BlockPicker (30 blocks), drag reorder', 0],
  ['n35sdui','3.5 Block property editors — 30 editors, one per block type, JSON to form to instant re-render', 1],
  ['n35sdui','3.6 Editor auto-save — debounced 2s, blocks to PUT /api/pages/:id, save status indicator', 1],
  ['n35sdui','3.7 Product manager — CRUD: name/desc/price/variants/images/category/stock, bulk edit', 1],
  ['n35sdui','3.8 Product image handling — upload to R2, auto thumbnails CF Images, bg removal, drag reorder', 1],
  ['n35sdui','3.9 Order manager — status filters, status update triggers shipment, order detail timeline', 1],
  ['n35sdui','3.10 Blog manager — Tiptap rich text, categories/tags, featured image, SEO preview, schedule', 2],
  ['n35sdui','3.11 Customer CRM — auto-segmentation (new/returning/VIP/churned), order history, CSV export', 2],
  ['n35sdui','3.12 Analytics module — page views, top products, conversion funnel, revenue charts (recharts)', 2],
  ['n35sdui','3.13 Theme editor — Colors/Typography/Spacing/Glassmorphism/PageHeader tabs, live preview iframe', 1],
  ['n35sdui','3.14 Settings — store profile, domain config, Xendit onboarding, shipping origin, staff invites', 1],
  ['n35sdui','3.15 AI Tools — Copywriter (product desc), SEO Auto-Pilot (meta tags), AI Page Gen (landing)', 2],
  ['n35sdui','3.16 AI Settings — BYOK vs Credits toggle, encrypted key store, balance display, buy packs', 2],
  ['n35sdui','3.17 AI proxy Edge Function — POST /api/ai/generate, auth > mode > rate limit > model > deduct > log', 2],
  ['n35sdui','3.18 AI rate limiting — per-tenant: Free=5/hr, Starter=20/hr, Pro=100/hr, 429 on burst', 2],
  ['n35sdui','3.19 AI audit log — every call logged (tenant/task/model/tokens/credits), monthly summary email', 2],
  ['n35sdui','3.20 Plan gating — middleware check plan, gate features, upgrade CTA when blocked', 0],
  ['n35sdui','3.21 Seller onboarding wizard — 4-step: name > WA+email+city > theme > first product/skip', 0],
  ['n35sdui','3.22 Getting Started checklist — dashboard card with deep links, progress bar, auto-dismiss', 1],
  ['n35sdui','3.23 Onboarding templates — 5 pre-built templates (Fashion/F&B/Craft/Services/General)', 2],
  ['n35sdui','3.24 Realtime notifications — Supabase Realtime on orders INSERT, browser toast+sound', 1],
  ['n35sdui','3.25 Email notifications — Welcome, New Order (seller), Confirmed/Shipped (buyer)', 1],
  ['n35sdui','3.26 Link-in-Bio editor — name/avatar/tagline/links, drag reorder, phone mockup preview', 2],
  ['n35sdui','3.27 Link-in-Bio page — SSR /s/{shopname}, mobile-first, avatar+links+3 products, OG meta', 2],
  ['n35sdui','3.28 Bilingual i18n — id.json+en.json, useTranslation() hook, t() function, default Indonesian', 2],

  // Phase 4: Payments+Shipping (16 tasks)
  ['xbnzk32','4.1 Xendit XenPlatform setup — register platform, sub-accounts per tenant, store sub-account ID', 0],
  ['xbnzk32','4.2 Checkout to Xendit Invoice — create Invoice with tenant sub-account, fee splitting, payment URL', 0],
  ['xbnzk32','4.3 Voucher system (seller) — Studio CRUD: name/type/value/cap/min_order/max_uses/dates/active', 2],
  ['xbnzk32','4.4 Voucher at checkout — fetch available, auto-filter, apply discount, one per order', 2],
  ['xbnzk32','4.5 Xendit webhook handler — verify signature, update order, trigger email/WA, idempotent', 0],
  ['xbnzk32','4.6 Everpro shipping — calculate: origin+dest+weight to rates+insurance, cache KV 1hr', 0],
  ['xbnzk32','4.7 Shipment creation — seller marks shipped > Everpro create > tracking number > notify buyer', 0],
  ['xbnzk32','4.8 RajaOngkir fallback — adapter pattern, same interface as Everpro, auto-fallback', 1],
  ['xbnzk32','4.9 Custom domain flow — seller enters domain > verify CNAME > CF for SaaS > SSL > live', 1],
  ['xbnzk32','4.10 CF for SaaS setup — configure on Pages domain, first 100 free, fallback origin', 1],
  ['xbnzk32','4.11 Subscription billing — Xendit recurring Starter Rp99K/Pro Rp199K, auto-downgrade 7d grace', 0],
  ['xbnzk32','4.12 AI credit purchase — buy pack > Xendit Invoice > webhook confirms > atomic balance increment', 2],
  ['xbnzk32','4.13 Credit deduction (atomic) — UPDATE balance WHERE balance>=cost RETURNING, 402 if insufficient', 1],
  ['xbnzk32','4.14 Reviews system — buyer post-purchase submit, unmoderated default, Pro moderation dashboard', 2],
  ['xbnzk32','4.15 Addon subscriptions — tenant_addons CRUD, 7 addons, hasFeature() helper, Xendit recurring', 2],
  ['xbnzk32','4.16 Addon upsell — gated feature shows Enable for Rp29K/mo, adoption funnel in Console', 2],

  // Phase 5: Console+Marketing+Ship (20 tasks)
  ['b06h1rq','5.1 Console shell — React SPA /console/, platform_admin auth, sidebar: Tenants/Billing/AI/Analytics/Flags/Legal', 0],
  ['b06h1rq','5.2 Tenant management — list all (search/filter), detail view, actions: approve/suspend/delete/change plan', 1],
  ['b06h1rq','5.3 Billing dashboard — XenPlatform overview, platform revenue, per-tenant history, failed payments', 1],
  ['b06h1rq','5.4 AI Credits admin — provider keys, pack pricing, usage analytics, per-model cost breakdown', 2],
  ['b06h1rq','5.5 Platform analytics — tenants by plan, GMV, total orders, AOV, churn rate, daily/weekly/monthly', 1],
  ['b06h1rq','5.6 Feature flags + addon gating — enable/disable per tier, hasFeature() plan+addons, cached KV', 1],
  ['b06h1rq','5.7 System settings — default themes, block library toggle, email templates, rate limits', 2],
  ['b06h1rq','5.8 Marketing site — Astro SSG lapak.id: landing+pricing+/ai-credits+/docs+/signup+/login', 1],
  ['b06h1rq','5.9 Legal pages — /terms (Seller ToS+AI), /privacy (UU PDP), /ai-disclosure (EU AI Act Art.50)', 1],
  ['b06h1rq','5.10 Legal email flows — monthly AI usage, credit expiration warnings, subscription reminders', 2],
  ['b06h1rq','5.11 E2E smoke test — signup > onboard > product > publish > browse > cart > checkout > sandbox > webhook > order > ship', 0],
  ['b06h1rq','5.12 Mobile E2E test — full buyer+seller on mobile Chrome+Safari, touch, responsive', 0],
  ['b06h1rq','5.13 Performance audit — Lighthouse 90+/90+/95+ mobile, LCP<2.5s, INP<200ms, CLS<0.1', 0],
  ['b06h1rq','5.14 Security audit — CSRF all writes, RLS verified, Zod validation, auth rate limit, SQLi+XSS', 0],
  ['b06h1rq','5.15 Content moderation — AI safety filters, Indonesian harmful content filter, admin queue', 2],
  ['b06h1rq','5.16 Launch checklist — lapak.id CF Pages prod, SSL, DNS wildcard, Xendit prod keys, Supabase Pro', 0],
  ['b06h1rq','5.17 Unit tests — Vitest: price formatting, slug gen, theme transforms, block serialization, 80%+ lib/', 1],
  ['b06h1rq','5.18 Integration tests — Supabase local: API CRUD > RLS > cross-tenant > checkout mock > AI mock', 1],
  ['b06h1rq','5.19 E2E tests (Playwright) — buyer+seller+admin flows, Chrome+Safari+mobile', 1],
  ['b06h1rq','5.20 Backup automation — daily pg_dump cron, R2 replication, restore docs, test restore', 2],
];

// Insert tasks
const now = new Date().toISOString();
for (const [epicId, title, priority] of tasks) {
  data.tasks.push({
    id: genId(),
    project_id: 'zhid7z3',
    epic_id: epicId,
    title,
    status: 'todo',
    priority,
    notes: '',
    depends_on: [],
    created_at: now,
    updated_at: now,
  });
}

// Write back
db.prepare('UPDATE store SET data = ? WHERE id = 1').run(JSON.stringify(data));
console.log(`Inserted ${tasks.length} tasks`);
console.log('Phase counts:', data.tasks.reduce((acc, t) => {
  const prefix = t.title.split('.')[0];
  acc[prefix] = (acc[prefix] || 0) + 1;
  return acc;
}, {}));
