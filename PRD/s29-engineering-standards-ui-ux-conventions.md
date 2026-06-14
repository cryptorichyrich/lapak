## 29. Engineering Standards & UI/UX Conventions

> This section is the coding constitution. Every PR, every commit, every component follows these rules. No exceptions.

---

### 29.1 Architecture Patterns

**Shared DB + RLS Multi-Tenancy**
- Every table has `tenant_id uuid not null references tenants(id)`
- Every query auto-scoped by RLS policy: `using (tenant_id = auth.tenant_id())`
- Zero manual `WHERE tenant_id = ?` filtering in application code
- Cross-tenant data leaks = P0 severity bug
- Tenant resolution happens once per request in middleware → stored in `context`

**Edge-First SSR (Storefront)**
- Astro renders server-side at CF edge. Ship 0 JS by default.
- React islands for interactive bits only: cart, gallery, variant picker, checkout, search suggestions
- Every island loads with `client:load` or `client:visible` — never `client:only`
- Island props = serializable only (no functions, no class instances)

**BFF (Backend for Frontend)**
- `api/` repo = single API layer shared by all clients (Storefront browser writes, Studio, Console)
- Hono framework on CF Functions
- **Storefront SSR reads go direct to Supabase** with `service_role` key (server-to-server, key never touches browser, faster page loads — 1 call vs 2)
- **All browser-initiated requests and all writes** go through BFF (auth validation, tenant resolution, input sanitization, rate limiting, CSRF, plan gating)
- BFF handles: auth validation, tenant resolution, input sanitization, rate limiting, CSRF protection, plan gating
- Route groups: `/api/auth/*`, `/api/pages/*`, `/api/products/*`, `/api/orders/*`, `/api/checkout/*`, `/api/admin/*`

**Why SSR reads direct (ADR-001):**
- Astro SSR runs on CF Workers — it IS the backend. `service_role` stays in server env vars.
- Skipping API hop = faster TTFB for buyer pages.
- Supabase officially recommends this pattern for SSR frameworks.
- No security risk: browser never sees the key, never talks to Supabase.

**Repository Pattern**
- Data access behind thin repository functions: `getProducts(tenantId)`, `createOrder(data)`
- Business logic in service layer, not in routes
- Swap Supabase → another DB = change repository functions only
- Repos return typed objects (Zod-validated), never raw Supabase rows

**Event-Driven Webhooks**
- Xendit payment callbacks → `POST /webhooks/xendit`
- Everpro shipping updates → `POST /webhooks/everpro`
- Idempotent handlers: hash `event_id + status` → skip if already processed
- Retry: 3 attempts with exponential backoff (1s, 5s, 30s)
- Webhook secrets verified via HMAC signature validation

---

### 29.2 Design Patterns

**Strategy — Payment Methods**
```typescript
// Each payment method implements the same interface
interface PaymentStrategy {
  createInvoice(params: CreateInvoiceParams): Promise<InvoiceResult>
  verifyWebhook(payload: string, signature: string): boolean
  getFee(amount: number): number
}
// VA, QRIS, e-wallet — add new without touching checkout code
```

**Strategy — Shipping Providers**
```typescript
interface ShippingProvider {
  getRates(origin: string, destination: string, weight: number): Promise<Rate[]>
  createShipment(order: Order): Promise<TrackingResult>
  trackAWB(awb: string): Promise<TrackingStatus>
}
// Everpro, future providers — swap without touching order flow
```

**Factory — Block Type Creation**
```typescript
// Block factory creates correct component + schema + defaults
const block = createBlock('hero') 
// → { type: 'hero', schema: heroSchema, component: HeroBlock, defaults: { heading: '...', ... } }
// Editor uses factory to render property panels and validate content
```

**Adapter — Multi-Provider Services**
```typescript
// Email (unemail), AI providers, storage (R2) — all behind adapters
interface EmailAdapter { send(to: string, template: string, data: object): Promise<void> }
interface AIAdapter { complete(prompt: string, model: string): Promise<string> }
interface StorageAdapter { upload(key: string, file: Buffer): Promise<string> }
// Swap Resend → Mailgun = change adapter, zero business logic changes
```

**Builder — Checkout Flow**
```typescript
// Checkout is a step-by-step builder. Each step independent.
const checkout = new CheckoutBuilder(cart)
  .setShippingAddress(address)
  .selectShippingRate(rate)
  .applyVoucher(voucherId)
  .selectPaymentMethod('qris')
  .build() // → creates Xendit Invoice
// Steps can be re-ordered, skipped (no voucher), retried independently
```

**Plugin — Addons, Themes, Block Types**
```typescript
// The entire addon system IS the plugin pattern
interface AddonPlugin {
  id: string
  name: string
  price: number
  gateFeature: string // 'checkout' | 'custom_domain' | 'analytics' | ...
  activate(tenantId: string): Promise<void>
  deactivate(tenantId: string): Promise<void>
}
// `hasFeature()` checks: plan includes it OR active addon provides it
```

**Observer — Auto-Save & Status Changes**
```typescript
// Editor auto-save: debounce 2s → save to Supabase
const debouncedSave = debounce(async (blocks) => {
  await saveBlocks(pageId, blocks)
}, 2000)
// Order status change triggers cascade:
// 'paid' → notify seller (email + in-app) → auto-create Everpro shipment
// 'shipped' → notify buyer (email + WA) → update tracking
```

---

### 29.3 TypeScript Standards

- **Strict mode always** — `strict: true` in every `tsconfig.json`
- **No `any`** — use `unknown` + type narrowing, or Zod schema validation
- **Branded types for IDs** — `type TenantId = string & { __brand: 'TenantId' }` — prevents passing wrong ID type
- **Discriminated unions for state** — `{ status: 'loading' } | { status: 'success', data: T } | { status: 'error', error: E }`
- **Zod validation on ALL API inputs** — request body, query params, path params
- **Return types on every exported function** — no implicit returns
- **Enum-free** — use `as const` objects instead: `const PLAN = { FREE: 'free', STARTER: 'starter', PRO: 'pro' } as const`

### 29.4 Error Handling

**Error Hierarchy**
```typescript
class LapakError extends Error {
  constructor(message: string, public code: string, public statusCode: number) {
    super(message)
  }
}
class PaymentError extends LapakError { /* Xendit failures */ }
class AuthError extends LapakError { /* 401/403 */ }
class TenantError extends LapakError { /* tenant not found, suspended */ }
class ValidationError extends LapakError { /* Zod parse failure */ }
class NotFoundError extends LapakError { /* 404 */ }
class RateLimitError extends LapakError { /* 429 */ }
```

**Rules:**
- Never catch and swallow errors silently
- Every API route has a `try/catch` that maps `LapakError` → structured JSON response
- Unknown errors → Sentry alert + generic "Terjadi kesalahan" message (Indonesian)
- Frontend: React Error Boundaries per page section (sidebar can crash without killing the page)
- Sentry DSN configured per subproject. Source maps uploaded on deploy.

### 29.5 Security

- **CSRF tokens on ALL write endpoints** — `POST`, `PUT`, `PATCH`, `DELETE`
  - Token generated server-side, stored in `httpOnly` cookie + verified from request header
  - `getCsrfToken()` helper used in all Studio/Console API calls
- **Rate limiting** — CF Rate Limiting Rules per route group
  - Auth: 5 req/min per IP
  - Checkout: 10 req/min per IP
  - AI proxy: varies by tier (5/20/100 per hour)
  - Admin: 60 req/min per token
- **Input sanitization** — Zod schemas strip unknown fields. HTML content sanitized with `sanitize-html`
- **SQL injection** — impossible by design (Supabase client uses parameterized queries)
- **XSS** — Astro auto-escapes. React islands use `{}` (auto-escaped). Never `dangerouslySetInnerHTML`
- **Headers** — `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy: strict-origin-when-cross-origin`
- **Secrets** — never in code. CF Functions use `env` bindings (encrypted at rest)
- **Tenant isolation** — RLS is the last line of defense. Even if BFF has a bug, RLS prevents cross-tenant access

---

### 29.6 UI/UX Conventions

**Loading States — Skeleton Loaders for EVERYTHING**
- Every data-dependent component has a skeleton/shimmer loader
- Skeleton matches exact dimensions of real content (zero layout shift)
- No spinner wheels. No "Loading..." text. Skeletons ONLY.
- Skeletons cascade: page shell loads instantly → content area shows skeleton → real data hydrates
- Implementation: `<ProductCardSkeleton />`, `<OrderRowSkeleton />`, `<BlogPostSkeleton />`, `<BlockSkeleton />`

**Skeleton inventory (must-have):**
- `ProductCardSkeleton` — image placeholder + 2 text lines + price
- `ProductGallerySkeleton` — large image + 4 thumbnail placeholders
- `OrderRowSkeleton` — ID + status badge + amount + date
- `OrderListSkeleton` — 5 × OrderRowSkeleton
- `BlockSkeleton` — matches block type shape (hero, text, image, grid)
- `BlogPostSkeleton` — title + meta + content lines
- `AnalyticsChartSkeleton` — chart area placeholder with axes
- `DataTableSkeleton` — header + N rows with varying widths
- `CategoryGridSkeleton` — N × card placeholders
- `ReviewSkeleton` — avatar + stars + text lines
- `VoucherCardSkeleton` — card shape
- `CheckoutStepSkeleton` — form fields placeholder
- `CartSkeleton` — 3 × item row placeholders

**Optimistic UI**
- Cart add/remove/update → instant state update → background API call → rollback on error
- Review submit → appears immediately → background save → error toast if fail
- Voucher apply → instant discount shown → verify server-side → revert if invalid
- Theme changes → instant preview → debounced save (2s)

**Empty States**
- Every list/table has a custom empty state (illustration + CTA)
- "No products yet. Add your first product →"
- "No orders yet. Share your store link to get started."
- Never show blank page. Always guide user to next action.

**Mobile-First (ALL subprojects, including Studio and Console)**
- Design at 375px first, scale up
- Touch targets minimum 44×44px
- Bottom sheet modals on mobile (not centered overlays)
- Swipe gestures: product gallery swipe, order list swipe-to-action
- Sticky headers with blur backdrop
- No hover-dependent interactions (hover = desktop bonus, not requirement)
- Studio block editor: tap to select → bottom panel for properties (not sidebar)

**Accessibility (WCAG 2.2 AA)**
- All interactive elements have visible focus rings (`:focus-visible`)
- Color contrast ratio ≥ 4.5:1 for text, 3:1 for large text
- Every image has meaningful `alt` text (AI-generated from product name)
- ARIA labels on all icons and buttons
- Keyboard navigation: Tab order logical, Enter/Space activate, Escape closes modals
- Skip-to-content link on every page
- Screen reader announcements for cart updates, form errors, status changes
- `prefers-reduced-motion` respected — disable animations for users who opt out
- Form errors: inline below field + `aria-invalid` + `aria-describedby`

**Toast/Notification Pattern**
- Success: green, auto-dismiss 3s, bottom-right
- Error: red, manual dismiss, bottom-right
- Warning: amber, manual dismiss, bottom-right
- Loading: spinner icon, auto-dismissed when promise resolves
- Max 3 visible toasts. Queue overflow → replace oldest.

**Confirmation Patterns**
- Destructive actions (delete product, cancel order, suspend tenant) → modal confirmation
- "Are you sure?" + action verb in button: "Delete Product", "Cancel Order"
- No accidental double-submits: button disabled after first click, show loading state
- Checkout "Pay Now" → loading state until Xendit redirect

**Form Conventions**
- Label above input, always visible (no floating/placeholder-only labels)
- Validation: inline on blur, re-validate on input
- Error message below field, red text, specific ("Price must be greater than 0")
- Disabled state: gray background, `not-allowed` cursor
- Required fields marked with red asterisk `*`
- Character counters on textarea (e.g. product description, SEO meta)

---

### 29.7 Performance Standards (Lighthouse 95+)

**Target: Performance ≥ 95, Accessibility ≥ 95, Best Practices ≥ 95, SEO ≥ 95**

**LCP (Largest Contentful Paint) < 2.5s**
- Hero image: `fetchpriority="high"` + `loading="eager"` on above-fold images
- CF CDN edge caching: 15min TTL for pages, purge on publish
- R2 images served via CF CDN with `width=800,quality=80,f=auto` transforms
- No render-blocking JS — Astro islands hydrate after content paint
- Preconnect: `<link rel="preconnect" href="https://fonts.googleapis.com">`

**FID/INP (Interaction to Next Paint) < 200ms**
- React islands: minimal bundle per island (code-split by default)
- Debounced handlers: search input (300ms), auto-save (2000ms)
- No heavy computation on main thread: AI preview renders in Web Worker if needed
- `requestIdleCallback` for non-critical work (analytics, prefetching)

**CLS (Cumulative Layout Shift) < 0.1**
- All images: explicit `width` + `height` attributes (or `aspect-ratio` CSS)
- Skeleton loaders match real content dimensions exactly
- Fonts: `font-display: swap` + `<link rel="preload">`
- No late-loading ads/banners that push content down
- Dynamic content containers: `min-height` set to skeleton height

**Bundle Size Budget**
- Storefront initial JS: < 50KB gzipped (Astro = 0 JS by default)
- Studio initial JS: < 150KB gzipped
- Console initial JS: < 100KB gzipped
- Per-island JS: < 20KB gzipped
- Monitor with `bundlesize` CI check — fail build if exceeded

**Image Optimization**
- R2 originals → CF Images transforms on-the-fly
- Responsive: `srcset` with 300w, 600w, 1200w variants
- Format: WebP for browsers that support it, AVIF where possible
- Lazy load all below-fold images: `loading="lazy"`
- Product gallery: load first 2 eagerly, rest lazy

**Caching Strategy**
- Static assets (JS/CSS/fonts): immutable filenames + 1yr `Cache-Control`
- Storefront pages: `stale-while-revalidate` + 15min TTL at CF edge
- API responses: `no-store` (dynamic data)
- Cart/checkout: `no-store` always (fresh data required)
- R2 images: 30 day TTL via CF Cache

**Font Strategy**
- 1 font family max (Plus Jakarta Sans — Indonesian-designed, great for ID/EN)
- Variable font: single file, all weights
- `font-display: swap` — text visible immediately with fallback, swap when loaded
- Preload: `<link rel="preload" href="..." as="font" type="font/woff2" crossorigin>`
- Fallback metrics tuned: `font-family: 'Plus Jakarta Sans', system-ui, sans-serif`

---

### 29.8 Component Architecture

**Naming Convention**
- PascalCase for components: `ProductCard.tsx`, `OrderList.tsx`
- camelCase for utilities: `formatRupiah.ts`, `getAuthHeaders.ts`
- kebab-case for Astro pages: `product-detail.astro`, `blog-post.astro`
- Files: one component per file, named same as component
- Test files: `ProductCard.test.tsx` colocated

**Component Structure (React)**
```
src/features/products/
├── components/
│   ├── ProductCard.tsx
│   ├── ProductCardSkeleton.tsx
│   ├── ProductGallery.tsx
│   └── ProductGallerySkeleton.tsx
├── hooks/
│   └── useProducts.ts
├── types.ts
├── api.ts          ← API calls for this feature
└── index.ts        ← barrel export
```

**Component Structure (Astro)**
```
src/components/
├── blocks/
│   ├── HeroBlock.astro
│   ├── TextBlock.astro
│   ├── ImageBlock.astro
│   └── ProductCarousel.astro
├── product/
│   ├── ProductCard.astro
│   └── ProductGrid.astro
└── layout/
    ├── Header.astro
    └── Footer.astro
```

**Props Pattern**
```typescript
// Every component has explicit typed props
interface ProductCardProps {
  product: Product
  variant?: 'grid' | 'list' | 'compact'
  showExternalLinks?: boolean
}
// Default values via destructuring
export function ProductCard({ product, variant = 'grid', showExternalLinks = true }: ProductCardProps)
```

---

### 29.9 Testing Conventions

- **Unit tests**: Vitest — every utility function, every Zod schema, every repository function
- **Component tests**: Vitest + Testing Library — render, interact, assert
- **E2E tests**: Playwright — critical paths only (sign up, add product, checkout, webhook)
- **Visual regression**: Playwright screenshot comparison for block components
- **Lighthouse CI**: run on every PR, fail if score drops below 90
- **Coverage**: minimum 70% line coverage for `api/`, 50% for UI repos
- **Test data**: factory functions (`createMockProduct()`, `createMockOrder()`), never hardcoded

---

### 29.10 Git & CI Conventions

**Commit Messages**
- Conventional Commits: `feat(storefront): add product detail page`
- `feat`, `fix`, `chore`, `docs`, `refactor`, `test`, `perf`
- Scope = subproject: `api`, `storefront`, `studio`, `console`, `marketing`, `prd`

**Branch Strategy**
- `main` = production. Protected. Requires passing CI + review.
- `feat/XXX-description` = feature branches. Delete after merge.
- `fix/XXX-description` = hotfix branches.
- PR titles = conventional commit format.

**CI Pipeline (per repo)**
1. Lint (ESLint + Prettier check)
2. Type check (`tsc --noEmit`)
3. Unit tests (Vitest)
4. Build (verify no build errors)
5. E2E tests (Playwright, storefront + studio only)
6. Lighthouse audit (storefront + marketing only)
7. Bundle size check

**Deployment**
- `main` branch → CF Pages production deploy (automatic)
- PR → CF Pages preview deploy (automatic, unique URL)
- API: CF Functions deployed with storefront (same CF Pages project)
