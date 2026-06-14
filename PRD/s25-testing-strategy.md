## 25. Testing Strategy

> Every commit is tested. Every PR passes CI. Every release passes E2E. No exceptions.

---

### 25.1 Testing Philosophy

- **Test behavior, not implementation.** Mock external services, not internal modules.
- **Fail fast in CI.** Lint → type-check → unit → build → integration → E2E. Stop at first failure.
- **Tests document intent.** A new developer reads tests to understand how a feature works.
- **No flaky tests.** If a test fails intermittently, it's disabled and filed as P1 bug.
- **Indonesian UI copy in E2E assertions.** Our users see Indonesian — our tests assert Indonesian.

---

### 25.2 Test Stack

| Layer | Tool | Config File | When It Runs |
|---|---|---|---|
| Unit | **Vitest** | `vitest.config.ts` | Every push (CI) + local `npm test` |
| Integration | **Vitest** + Supabase local | `vitest.config.integration.ts` | Every PR (CI) |
| E2E | **Playwright** | `playwright.config.ts` | Before merge to main |
| Load | **k6** (Phase 5) | `k6/load-test.js` | Pre-launch + monthly |
| Type | **tsc --noEmit** | `tsconfig.json` | Every push (CI) |
| Lint | **ESLint** + **Prettier** | `.eslintrc.cjs` + `.prettierrc` | Every push (CI) |
| Accessibility | **axe-core** via Playwright | In E2E tests | Before merge to main |

---

### 25.3 Layer 1 — Unit Tests (Vitest)

**Target:** Pure functions, validators, transformers, formatters. No network, no database.

**Scope:**
- `src/lib/prices.ts` → formatRupiah, calculateDiscount, comparePrices
- `src/lib/slugs.ts` → generateSlug, validateSlug, slugFromName
- `src/lib/blocks.ts` → serializeBlock, deserializeBlock, validateBlockData
- `src/lib/themes.ts` → applyThemeTokens, resolveTheme, mergeOverrides
- `src/lib/validators.ts` → Zod schemas (product, page, block, order)
- `src/lib/ai-response.ts` → validateAIOutput, sanitizeHTML, extractFields
- `src/lib/errors.ts` → error hierarchy constructors, toJSON, isUserFacing
- `src/utils/*.ts` → formatPhone, normalizeIndonesianPhone, truncateText

**Example:**
```typescript
// tests/unit/prices.test.ts
import { describe, it, expect } from 'vitest'
import { formatRupiah, calculateDiscount } from '@/lib/prices'

describe('formatRupiah', () => {
  it('formats whole numbers', () => {
    expect(formatRupiah(150000)).toBe('Rp150.000')
  })
  it('formats zero', () => {
    expect(formatRupiah(0)).toBe('Rp0')
  })
  it('throws on negative', () => {
    expect(() => formatRupiah(-1)).toThrow()
  })
})
```

**Config:**
```typescript
// vitest.config.ts
export default defineConfig({
  test: {
    include: ['tests/unit/**/*.test.ts'],
    coverage: {
      include: ['src/lib/**/*.ts', 'src/utils/**/*.ts'],
      thresholds: { lines: 80, branches: 75, functions: 80 }
    }
  }
})
```

**Coverage Target:** 80%+ for `src/lib/` and `src/utils/`

---

### 25.4 Layer 2 — Integration Tests (Vitest + Supabase Local)

**Target:** API route handlers, database queries, RLS policies, webhook handlers.

**Setup:**
- `supabase start` — local Supabase with migrations applied
- `supabase/seed.sql` — 3 test tenants + products + pages + orders
- Test users: `seller@test.com` (tenant A), `seller2@test.com` (tenant B), `admin@test.com` (platform)
- Xendit sandbox keys in `.env.test`
- Tests run against local Supabase (not production/staging)

**Scope:**
- API CRUD: create/read/update/delete pages, products, blog posts
- RLS enforcement: tenant A cannot read/write tenant B's data
- Auth: unauthenticated requests return 401, wrong role returns 403
- Checkout flow: create order → mock Xendit invoice → webhook callback → order confirmed
- AI proxy: mock CF Workers AI → validate response → deduct credits
- Upload: mock R2 → upload image → verify URL → delete
- Tenant resolution: subdomain → KV lookup → tenant context

**Example:**
```typescript
// tests/integration/api-products.test.ts
import { describe, it, expect, beforeAll } from 'vitest'
import { createClient } from '@supabase/supabase-js'

describe('Products API — RLS enforcement', () => {
  let tenantA, tenantB

  beforeAll(async () => {
    tenantA = createClient(URL, KEY, { global: { headers: { Authorization: `Bearer ${tokenA}` } } })
    tenantB = createClient(URL, KEY, { global: { headers: { Authorization: `Bearer ${tokenB}` } } })
  })

  it('tenant A cannot read tenant B products', async () => {
    // Create product as tenant B
    const { data } = await tenantB.from('products').insert({ name: 'Secret', tenant_id: tenantBId }).select().single()

    // Try to read as tenant A
    const { data: stolen } = await tenantA.from('products').select().eq('id', data.id)

    expect(stolen).toHaveLength(0) // RLS blocks cross-tenant read
  })
})
```

**Config:**
```typescript
// vitest.config.integration.ts
export default defineConfig({
  test: {
    include: ['tests/integration/**/*.test.ts'],
    testTimeout: 30000, // DB queries need more time
    setupFiles: ['tests/helpers/supabase-setup.ts']
  }
})
```

**Coverage Target:** 100% of API endpoints have at least 1 integration test

---

### 25.5 Layer 3 — E2E Tests (Playwright)

**Target:** Critical user flows end-to-end. Tests run against preview deployment.

**Scope — Buyer Flows:**
1. Browse storefront homepage → see blocks render correctly
2. Click product → see product detail page
3. Add to cart → cart drawer opens → item count updates
4. Search product → see results → click suggestion
5. Checkout via WhatsApp redirect → correct message format
6. Track order via tracking link → see order status
7. 404 page renders for invalid URLs

**Scope — Seller Flows (Studio):**
1. Login → see dashboard
2. Create product → fill form → save → appears in product list
3. Edit page → add block → rearrange → save → preview storefront
4. View orders → change status to "shipped" → buyer gets notification
5. Settings → change store name → save → reflected on storefront

**Scope — Admin Flows (Console):**
1. Login as admin → see tenant list
2. View tenant detail → suspend → storefront shows 503
3. View platform analytics → data loads

**Example:**
```typescript
// tests/e2e/buyer-checkout.spec.ts
import { test, expect } from '@playwright/test'

test('buyer can add to cart and see checkout', async ({ page }) => {
  await page.goto('https://toko-vavelle.lapak.id/')
  await expect(page.locator('h1')).toContainText('Toko Vavelle')

  // Click first product
  await page.locator('[data-testid="product-card"]').first().click()
  await expect(page.locator('[data-testid="product-name"]')).toBeVisible()

  // Add to cart
  await page.locator('[data-testid="add-to-cart"]').click()
  await expect(page.locator('[data-testid="cart-drawer"]')).toBeVisible()
  await expect(page.locator('[data-testid="cart-count"]')).toContainText('1')

  // Checkout opens WhatsApp
  const [popup] = await Promise.all([
    page.waitForEvent('popup'),
    page.locator('[data-testid="checkout-wa"]').click()
  ])
  expect(popup.url()).toContain('wa.me')
  expect(popup.url()).toContain('Halo, saya ingin memesan')
})
```

**Accessibility Checks (axe-core):**
- Every E2E test can optionally run axe-core audit
- `page.goto()` → `injectAxe()` → `checkA11y()` on key pages
- Fail on WCAG 2.2 AA violations
- Storefront pages: homepage, product, cart, 404
- Studio: dashboard, product editor, page editor

**Config:**
```typescript
// playwright.config.ts
export default defineConfig({
  use: { baseURL: process.env.E2E_BASE_URL || 'http://localhost:4321' },
  testDir: 'tests/e2e',
  retries: 1, // allow 1 retry for flaky network
  timeout: 30000,
  reporter: [['html', { open: 'never' }]]
})
```

---

### 25.6 Layer 4 — Load Tests (k6, Phase 5)

**Target:** Performance benchmarks before launch and monthly after.

**Scenarios:**
- 100 concurrent buyers browsing storefront (read-heavy)
- 10 concurrent sellers editing pages (write-heavy)
- 50 concurrent checkout attempts (payment flow)
- AI generation under load

**Thresholds:**
- p95 TTFB for storefront pages < 500ms
- p99 API response time < 1000ms
- Error rate < 1% under normal load
- Error rate < 5% under 2x expected peak load

---

### 25.7 CI Pipeline

**On every push (all branches):**
```
lint → type-check → unit tests → build
```
Fail fast: stop at first error. ~2-3 minutes total.

**On every PR to main:**
```
push pipeline +
integration tests +
E2E tests (against preview deploy)
```
~10-15 minutes total. Merge blocked until green.

**On merge to main:**
```
full pipeline +
deploy to preview → smoke test → deploy to production
```

**CI Config (GitHub Actions):**
```yaml
name: CI
on: [push, pull_request]
jobs:
  quality:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '20' }
      - run: npm ci
      - run: npm run lint
      - run: npm run typecheck
      - run: npm run test:unit -- --coverage
      - run: npm run build

  integration:
    needs: quality
    runs-on: ubuntu-latest
    services:
      supabase: # local Supabase via Docker
    steps:
      - run: npm run test:integration

  e2e:
    needs: quality
    runs-on: ubuntu-latest
    steps:
      - run: npm run build
      - run: npx playwright install
      - run: npm run test:e2e
```

---

### 25.8 Test Fixtures & Data

**Seed Script (`supabase/seed.sql`):**
- 3 tenants: Toko Vavelle (active), KB Demo (active), Suspended Shop (suspended)
- 30 products total (10 per tenant, mix of published/draft)
- 5 pages per tenant (homepage, about, contact, 2 custom)
- 10 orders per tenant (mix of statuses: pending, paid, shipped, delivered, cancelled)
- 2 blog posts per tenant
- Admin user + 3 seller users

**Test Users:**
| Email | Role | Tenant | Password |
|---|---|---|---|
| `admin@test.com` | platform_admin | — | `test-admin-123` |
| `seller@test.com` | owner | Toko Vavelle | `test-seller-123` |
| `seller2@test.com` | owner | KB Demo | `test-seller2-123` |
| `seller3@test.com` | owner | Suspended Shop | `test-seller3-123` |

**Mock Services:**
- Xendit: sandbox API keys (returns test invoice URLs)
- CF Workers AI: returns canned responses from `tests/mocks/ai-responses/`
- R2: uses local filesystem temp directory
- Everpro/RajaOngkir: returns fixture data from `tests/mocks/shipping/`

---

### 25.9 Coverage Targets

| Area | Target | How Measured |
|---|---|---|
| `src/lib/` + `src/utils/` | 80% line coverage | Vitest + c8 |
| API endpoints | 100% have ≥1 integration test | Manual audit in PR review |
| Storefront pages | All routes covered by E2E | Playwright test count = page count |
| Block editor | Serialization/deserialization unit tested | Vitest |
| Studio components | Smoke tests (render without crash) | Vitest + Testing Library |
| RLS policies | Cross-tenant isolation tested | Integration tests |
| Accessibility | WCAG 2.2 AA on key pages | axe-core in E2E |

---

### 25.10 Testing Rules

1. **No test skip without a ticket.** `xit` / `test.skip` must link to a GitHub issue.
2. **No `// @ts-ignore` in tests.** If types are wrong, fix the types.
3. **Deterministic only.** No `Math.random()`, no `Date.now()` without mocking.
4. **No external network in unit/integration.** Mock everything outside the process.
5. **E2E tests clean up after themselves.** Delete test data or use isolated test tenant.
6. **Screenshot on E2E failure.** Playwright config: `screenshot: 'only-on-failure'`.
7. **Test Indonesian copy.** E2E assertions check for "Tambah ke keranjang", not "Add to cart".
8. **Test error paths.** Every happy path test has a corresponding sad path (what if DB is down? what if input is empty?).

---
