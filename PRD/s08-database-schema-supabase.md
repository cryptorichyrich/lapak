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
-- ORDERS (enhanced with buyer tracking)
-- Migration 00007 adds: tracking_token, payment_proof_url,
--   payment_verified_at, courier, courier_service,
--   buyer_notes, seller_notes, order_status_log
-- ═══════════════════════════════════════
create table orders (
  id              uuid primary key default gen_random_uuid(),
  tenant_id       uuid not null references tenants(id) on delete cascade,
  order_number    text not null,                -- "ORD-20260612-001" (auto-generated)
  tracking_token  uuid not null default gen_random_uuid(),  -- public buyer access (no auth)
  customer_name   text not null,
  customer_phone  text not null,
  customer_email  text,
  customer_address text,
  items           jsonb not null,               -- [{product_id, name, qty, price, weight}]
  subtotal        integer not null,
  shipping_cost   integer default 0,
  courier         text,                         -- "JNE", "J&T", "SiCepat"
  courier_service text,                         -- "REG", "YES", "EZ"
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
  payment_method  text,                         -- qris | va | ewallet | cod | bank_transfer
  payment_gateway text not null default 'xendit',
  payment_ref     text,                         -- Xendit invoice ID
  payment_url     text,                         -- Xendit payment URL
  payment_proof_url text,                       -- buyer transfer screenshot (IDR standard)
  payment_verified_at timestAMPTZ,              -- when seller confirms payment
  paid_at         timestamptz,
  shipped_at      timestamptz,
  completed_at    timestamptz,
  buyer_notes     text,                         -- customer message to seller
  seller_notes    text,                         -- internal notes (buyer cannot see)
  created_at      timestamptz default now(),
  updated_at      timestamptz default now(),
  unique(tenant_id, order_number),
  unique(tracking_token)
);

-- ═══════════════════════════════════════
-- ORDER STATUS LOG (audit trail)
-- ═══════════════════════════════════════
create table order_status_log (
  id          uuid primary key default gen_random_uuid(),
  order_id    uuid not null references orders(id) on delete cascade,
  tenant_id   uuid not null references tenants(id) on delete cascade,
  old_status  text,
  new_status  text not null,
  changed_by  uuid references users(id),        -- null = system/webhook
  note        text,                             -- "JNE REG pickup scheduled"
  created_at  timestamptz not null default now()
);

-- ═══════════════════════════════════════
-- SHIPPING ORIGINS (seller warehouse)
-- ═══════════════════════════════════════
create table shipping_origins (
  id          uuid primary key default gen_random_uuid(),
  tenant_id   uuid not null references tenants(id) on delete cascade unique,
  label       text not null default 'Gudang Utama',
  province    text not null,
  city        text not null,
  district    text not null,
  postal_code text not null,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
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

### Platform Config (Zero Hardcoding)

```sql
-- ═══════════════════════════════════════
-- PLATFORM CONFIG — runtime config, no redeploy needed
-- ═══════════════════════════════════════
create table platform_config (
  key   text primary key,
  value jsonb not null
);

-- Plan pricing
INSERT INTO platform_config (key, value) VALUES
  ('plans', '{"free": {"price": 0}, "starter": {"price": 99000}, "pro": {"price": 199000}}'::jsonb);

-- Fee structure (buyer-bears-all)
INSERT INTO platform_config (key, value) VALUES
  ('fees', '{"service_fee_base": 1000, "service_fee_pct": 0.003, "pg_fee_qris_pct": 0.007, "pg_fee_va_flat": 4000}'::jsonb);

-- Rate limits per tier
INSERT INTO platform_config (key, value) VALUES
  ('rate_limits', '{"free": {"ai_per_hour": 5, "api_per_min": 30}, "starter": {"ai_per_hour": 20, "api_per_min": 60}, "pro": {"ai_per_hour": 100, "api_per_min": 120}}'::jsonb);

-- Courier codes
INSERT INTO platform_config (key, value) VALUES
  ('couriers', '{"regular": ["jne", "pos", "tiki", "sicepat", "anteraja"], "instant": ["grab", "gojek", "borzo"]}'::jsonb);

-- Feature flags
INSERT INTO platform_config (key, value) VALUES
  ('features', '{"blog_enabled": true, "reviews_enabled": true, "ai_copywriter_enabled": true, "ai_photography_enabled": true, "link_in_bio_enabled": true}'::jsonb);

-- AI credit pricing
INSERT INTO platform_config (key, value) VALUES
  ('ai_credits', '{"packs": [{"credits": 50, "price": 25000}, {"credits": 200, "price": 75000}, {"credits": 500, "price": 150000}], "image_packs": [{"credits": 20, "price": 20000}], "free_monthly": 10, "expiry_months": 12}'::jsonb);

-- Addon catalog
INSERT INTO platform_config (key, value) VALUES
  ('addons', '[{"id": "checkout", "name": "Checkout & Payments", "price": 49000}, {"id": "shipping", "name": "Shipping Integration", "price": 19000}, {"id": "custom_domain", "name": "Custom Domain", "price": 29000}, {"id": "remove_branding", "name": "Remove Branding", "price": 19000}, {"id": "analytics", "name": "Analytics", "price": 29000}, {"id": "staff_seats", "name": "Staff Seats", "price": 15000, "per_unit": true}, {"id": "reviews", "name": "Reviews & Ratings", "price": 19000}]'::jsonb);

-- No RLS needed — platform-level config, all tenants read, only console writes
alter table platform_config enable row level security;
create policy "platform_config: public read"
  on platform_config for select
  to anon, authenticated
  using (true);

create policy "platform_config: console write"
  on platform_config for all
  to authenticated
  using (auth.jwt() ->> 'role' = 'platform_admin');
```

---
