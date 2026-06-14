# Phase 5 Addendum: Complete Feature Set for Early Majority

## Missing Features (Post-MVP Audit)

### Storefront Enhancements (Buyer Experience)

#### 5.21 — Multi-level Menu System
- **Table:** `menus` and `menu_items` (nested hierarchy)
- **Fields:** `id`, `tenant_id`, `title`, `url`, `parent_id`, `sort_order`, `mega_menu BOOLEAN`
- **API:** `GET /api/menus` — Returns nested menu structure
- **Frontend:** React mega-menu component with hover/click submenus

#### 5.22 — Advanced Catalog Search
- **Filters:** Price range, category, brand, attributes (color/size)
- **API:** `GET /api/storefront/products/search` with query params
- **UI:** Sidebar filters, sort dropdown, pagination

#### 5.23 — Product Quick View
- **Feature:** Modal with product images + variants + add-to-cart
- **No page navigation** — keeps buyer in catalog context

#### 5.24 — Related Products Engine
- **Logic:** Same category + purchased together + similar price range
- **API:** `GET /api/products/{id}/related`

#### 5.25 — Wishlist System
- **Guest:** localStorage wishlist
- **Member:** Sync to `wishlists` table with user_id
- **API:** `GET/POST/DELETE /api/wishlist`

### Studio Enhancements (Seller Tools)

#### 5.26 — Menu Builder
- **UI:** Drag-drop menu editor with submenu support
- **Preview:** Live site menu preview
- **Publish:** One-click apply to storefront

#### 5.27 — Subcategories
- **Migration:** Add `parent_id UUID REFERENCES categories(id)` + `lft/rght` for ordering
- **API:** Recursive category tree endpoint
- **UI:** Nested category picker in product editor

#### 5.28 — Bulk Import/Export
- **CSV import:** Products with variants/images via upload
- **CSV export:** Products + orders + customers
- **Template download:** Pre-filled CSV with headers

#### 5.29 — Inventory Alerts
- **Field:** `low_stock_threshold INT` per product
- **Notification:** Email + in-app when stock ≤ threshold
- **Dashboard:** Low stock products list

#### 5.30 — Order Bulk Actions
- **Export:** Selected orders to CSV
- **Status:** Bulk update (paid→shipped, etc.)
- **Print:** Shipping labels batch print

### API Enhancements

#### 5.31 — Rate Limiting
- **Endpoint:** `POST /api/auth/login` — 5 attempts/min per IP
- **KV counter:** `rate:{ip}:{endpoint}` with TTL
- **Response:** `429 Too Many Requests` with `Retry-After`

#### 5.32 — Webhook Retry Queue
- **Table:** `webhook_queue` — id, url, payload, attempts, last_error, created_at
- **Worker:** Background retry every 5 min for failed webhooks
- **Dead letter:** After 3 attempts, move to `webhook_dlq`

#### 5.33 — Audit Log
- **Table:** `audit_logs` — id, tenant_id, user_id, action, table_name, record_id, changes JSONB
- **Middleware:** Capture all write operations (POST/PUT/DELETE)
- **UI:** Audit trail in Studio settings

#### 5.34 — Hard Delete with Recovery
- **Soft delete:** `status = 'deleted'` + `deleted_at TIMESTAMP`
- **Recovery:** Admin can restore within 30 days
- **Cleanup:** Monthly cron to purge hard delete old records