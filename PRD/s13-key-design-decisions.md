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

### Why Tracking Token (not order ID) for Buyer Access?
- **Order IDs are guessable.** UUIDs look random but if leaked, anyone can see order details.
- **tracking_token is a separate UUID** — revocable, unguessable, per-order. Not the PK.
- **No auth needed.** Buyers are guests. No `auth.users` row. No JWT. The token IS the auth.
- **Phone lookup as fallback.** Indonesians remember phone numbers, not URLs. `normalize_phone()` handles 08xx/628xx/+628xx variants.
- **Seller sees everything.** Buyer sees only: items, status, total, shipping, WA contact. NOT seller_notes or other buyers.

---
