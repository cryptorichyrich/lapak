## 27. Operational Policies

### Tenant Deletion & Data Retention

| Action | What Happens |
|---|---|
| **Seller downgrades to Free** | Paid features disabled. Pages/products/data retained. Checkout disabled. |
| **Seller requests deletion** | 30-day grace period. Data soft-deleted (flagged). After 30 days → hard delete all tenant data from Supabase + R2. |
| **Platform suspends tenant** | All storefront pages return 403. Studio read-only. Data retained 90 days. |
| **Inactive free tier (>12 months)** | Email warning at 11 months. If no login in 12 months → archive (hide from public, retain data). Delete after 24 months. |

### Backup Strategy

| What | Method | Frequency |
|---|---|---|
| **Supabase DB** | pg_dump via Supabase CLI | Daily (automated via cron) |
| **R2 images** | R2 bucket replication to backup bucket | Continuous |
| **Studio page JSON** | Stored in Supabase (backed up with DB) | Continuous |
| **Theme tokens** | Stored in Supabase (backed up with DB) | Continuous |

### Cookie/Session Strategy (Anonymous Cart)

- Anonymous buyers get a `lapak_cart` cookie with a UUID session ID
- Cart stored in Supabase `cart_sessions` table keyed by session UUID
- Cart expires after 7 days of inactivity
- On signup/login: merge anonymous cart into user's cart
- Cookie: `httpOnly=false` (JS reads for cart count badge), `SameSite=Lax`, `Secure` on production

### Image CDN Caching

- CF Images transformations cached at edge by default (respecting `Cache-Control`)
- Product images: `Cache-Control: public, max-age=86400, stale-while-revalidate=604800` (1 day cache, 7 day stale)
- Blog images: `Cache-Control: public, max-age=604800` (7 days)
- Seller logo/favicon: `Cache-Control: public, max-age=2592000` (30 days)
- R2 objects: immutable URLs with content hash in filename for cache busting

### i18n Strategy

- **Studio UI:** Bilingual toggle (Indonesian default, English available). Translation keys via `src/i18n/` JSON files.
- **Console UI:** Same bilingual toggle.
- **Storefront:** Seller's language (set in tenant_settings). Default: Indonesian.
- **Email templates:** Bilingual (Indonesian primary, "View in English" link at top).
- **Marketing site:** Indonesian only (target audience).
- **Implementation:** Simple key-value JSON files. No heavy i18n library. `useTranslation()` hook in React. Astro `t()` function for storefront.

---
