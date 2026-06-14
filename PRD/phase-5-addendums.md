# Phase 5 Addendums: Whole Product Features

## Addendum A — Menu System (Nav Builder)

**Problem:** Sellers need flexible navigation (submenus, megamenus) for multi-page stores.

**Solution:** Standalone `menus` + `menu_items` tables with nested structure.

### Tables

```sql
-- Menu templates (header, footer, mobile, etc.)
CREATE TABLE menus (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,          -- "Header Menu", "Footer Links", etc.
  location TEXT NOT NULL,      -- "header", "footer", "mobile"
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(tenant_id, location)
);

-- Menu items with nesting
CREATE TABLE menu_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  menu_id UUID NOT NULL REFERENCES menus(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES menu_items(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('page', 'category', 'product', 'custom', 'divider')),
  target_id UUID,              -- page.id / category.id / product.id
  title TEXT NOT NULL,
  url TEXT,                    -- For custom links
  icon TEXT,                   -- Icon name for visual nav
  open_in_new_tab BOOLEAN DEFAULT false,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

### API Endpoints
- `GET /api/tenant/menus` — All menus for tenant
- `PUT /api/tenant/menus/:location` — Update menu structure
- `GET /api/storefront/nav` — Serialized nav for storefront

---

## Addendum B — Subcategories

**Problem:** Sellers need hierarchical categories (not just flat list).

### Migration

Add `parent_id` to categories table:
```sql
ALTER TABLE categories ADD COLUMN parent_id UUID REFERENCES categories(id) ON DELETE CASCADE;
CREATE INDEX idx_categories_parent ON categories (parent_id);
```

### API
- `GET /api/storefront/categories?parent=<id>` — Get children
- `GET /api/storefront/categories/tree` — Full hierarchy

---

## Addendum C — Bulk Import/Export

**Problem:** Sellers switching from other platforms need data migration.

### Features
- CSV template download
- Product import with variants/images
- Order export (CSV/PDF)
- Category import
- Image batch upload (ZIP extrak)

---

## Addendum D — Advanced Search

**Problem:** Storefront search needs facets + filters for large catalogs.

### Features
- Full-text search (Supabase FTS)
- Filter by price range
- Filter by category
- Filter by attributes (color, size)
- Search suggestions (typeahead)
- Sort by price/popularity

---

## Addendum E — Audit Log

**Problem:** Who changed what? Platform needs accountability.

### Tables
```sql
CREATE TABLE audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID,             -- NULL for platform actions
  user_id UUID,
  action TEXT NOT NULL,       -- CREATE, UPDATE, DELETE
  resource TEXT NOT NULL,       -- products, orders, pages
  resource_id UUID,
  changes JSONB,              -- {field: {from, to}}
  ip TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

---

## Addendum F — Rate Limiting

**Problem:** Prevent API abuse + brute force attacks.

### Features
- KV-backed token bucket per IP + user
- Configurable limits per endpoint
- 429 responses with `Retry-After` header
- Auth endpoints: 5/min
- API endpoints: 100/hr per tenant

---

## Addendum G — Wishlist/Favorites

**Problem:** Buyers want to save products for later.

### Tables
```sql
CREATE TABLE wishlists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  session_id TEXT,             -- For guest users
  user_id UUID,                -- For logged-in users
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(tenant_id, session_id, user_id)
);

CREATE TABLE wishlist_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wishlist_id UUID NOT NULL REFERENCES wishlists(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(wishlist_id, product_id)
);
```

---

## Addendum H — Low Stock Alerts

**Problem:** Sellers need inventory notifications.

### Features
- Threshold setting per product
- Email/SMS when stock ≤ threshold
- Alert dashboard in Studio
- Bulk threshold update

---

## Addendum I — Support Tickets

**Problem:** Sellers need help desk for questions/bugs.

### Features
- Ticket creation from Studio
- Reply via email + in-console
- FAQ suggestions before submit
- Priority levels (P1-P4)

---

## Priority Matrix

| Priority | Features |
|----------|----------|
| **P0** (Must have before launch) | Menu system, Subcategories, Bulk import, Advanced search |
| **P1** (Launch week) | Audit log, Rate limiting, Wishlist, Low stock alerts |
| **P2** (Post-launch) | Support tickets, Image optimization, Webhook retry, Variant grid, Related products |