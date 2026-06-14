## 23. Consolidated API Design

### API Surface — CF Pages Functions

All API routes run as CF Pages Functions (edge). Base URL: `https://lapak.id/api` or `https://{shop}.lapak.id/api`.

**Public (Storefront):**
```
GET  /api/storefront/{shop}           → Store info + published pages
GET  /api/storefront/{shop}/products  → Product catalog (paginated)
GET  /api/storefront/{shop}/products/{slug} → Product detail
GET  /api/storefront/{shop}/blog      → Blog posts (paginated)
GET  /api/storefront/{shop}/blog/{slug} → Blog post detail
GET  /api/storefront/{shop}/categories → Categories with product counts
POST /api/storefront/{shop}/cart      → Add to cart / update cart
POST /api/storefront/{shop}/checkout  → Initiate checkout → Xendit invoice
POST /api/storefront/{shop}/reviews   → Submit review
GET  /api/storefront/{shop}/bio       → Link-in-bio page data

# Buyer Order Tracking (no auth required)
POST /api/storefront/{shop}/track     → Phone lookup → list of orders
GET  /api/track/{tracking_token}      → Order detail by tracking token
```

**Authenticated (Studio):**
```
# Auth
POST /api/auth/login                   → Sign in (email/password)
POST /api/auth/register                → Create account + tenant
POST /api/auth/logout                  → Sign out
GET  /api/auth/me                      → Current user + tenant info

# Pages
GET    /api/pages                      → List pages
POST   /api/pages                      → Create page
GET    /api/pages/{id}                 → Get page with blocks
PUT    /api/pages/{id}                 → Update page (blocks, SEO, status)
DELETE /api/pages/{id}                 → Delete page

# Products
GET    /api/products                   → List products (paginated, filterable)
POST   /api/products                   → Create product
GET    /api/products/{id}              → Product detail
PUT    /api/products/{id}              → Update product
DELETE /api/products/{id}              → Delete product

# Blog
GET    /api/blog/posts                 → List posts
POST   /api/blog/posts                 → Create post
PUT    /api/blog/posts/{id}            → Update post
DELETE /api/blog/posts/{id}            → Delete post

# Media
POST   /api/media/upload               → Upload to R2, return URL
DELETE /api/media/{key}                → Delete from R2

# Settings
GET    /api/settings                   → Tenant settings
PUT    /api/settings                   → Update settings
PUT    /api/settings/theme             → Update theme tokens

# Orders
GET    /api/orders                     → List orders (filterable)
GET    /api/orders/{id}                → Order detail
PUT    /api/orders/{id}/status         → Update order status

# AI
POST   /api/ai/generate                → Unified AI endpoint (task-based routing)
GET    /api/ai/usage                   → Usage history + balance
POST   /api/ai/credits/purchase        → Buy credits (creates Xendit invoice)
GET    /api/ai/credits/balance         → Current balance

# Webhooks
POST   /api/webhooks/xendit            → Xendit callback (payment status)
POST   /api/webhooks/shipping          → Shipping tracker callback
```

**Platform (Console):**
```
GET    /api/admin/tenants              → All tenants (paginated)
PUT    /api/admin/tenants/{id}/status  → Suspend/activate tenant
GET    /api/admin/stats                → Platform-wide stats
GET    /api/admin/ai/usage             → AI usage across all tenants
GET    /api/admin/revenue              → Revenue summary
```

### Authentication
- **Studio/Console:** Supabase Auth JWT in cookie (httpOnly, secure, SameSite=Lax)
- **Public storefront:** No auth required. Cart = cookie-based session ID.
- **API keys:** None in MVP. All auth via Supabase JWT.
- **CSRF:** Double-submit cookie pattern on all state-changing requests.

### Response Format
```typescript
// Success
{ ok: true, data: T }

// Error
{ ok: false, error: { code: string, message: string } }

// Paginated
{ ok: true, data: T[], pagination: { page: number, per_page: number, total: number } }
```

---
