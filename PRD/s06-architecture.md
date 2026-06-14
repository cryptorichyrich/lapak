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
