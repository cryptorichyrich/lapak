# Lapak — Security Audit
> Task 5.14 | CSRF, RLS, Zod, Rate Limiting, SQLi, XSS

## 1. CSRF Protection
- ✅ `csrfProtection` middleware di `api/src/index.ts` (global)
- ✅ Semua write routes (POST/PATCH/DELETE) melalui middleware
- ✅ CSRF token di-generate per session

## 2. Row-Level Security (RLS)
- ✅ Setiap tabel tenant-scoped memiliki RLS policy
- ✅ `platform_admin` bypass via `is_platform_admin()` function
- ✅ Cross-tenant isolation: tenant A tidak bisa akses data tenant B
- ✅ Test: `cross-tenant-isolation.test.ts`

## 3. Input Validation (Zod)
- ✅ Semua API input divalidasi dengan Zod schemas
- ✅ TypeScript strict mode enabled
- ✅ `@ts-nocheck` pada file legacy saja

## 4. Rate Limiting
- ✅ Auth endpoints: 5 requests/menit per IP
- ✅ API umum: 100 requests/menit per IP
- ✅ Middleware di `rate-limit.ts`

## 5. SQL Injection Protection
- ✅ Supabase SDK menggunakan parameterized queries
- ✅ Tidak ada raw SQL concatenation
- ✅ Semua query melalui Supabase client (bukan pg langsung)

## 6. XSS Protection
- ✅ React auto-escapes JSX output
- ✅ Security headers: CSP, X-Frame-Options, X-Content-Type-Options
- ✅ `dangerouslySetInnerHTML` tidak digunakan

## 7. Authentication
- ✅ Supabase Auth untuk penjual (email/phone OTP)
- ✅ JWT verification pada semua API routes
- ✅ Token refresh flow

## 8. Data Protection
- ✅ Secrets di `.dev.vars` (gitignored)
- ✅ Cloudflare env bindings untuk production
- ✅ Semua komunikasi via HTTPS
- ✅ Webhook signature verification (Xendit, Everpro)

## Gaps (Non-blocking)
- ⚠️ Backup automation belum production-tested (task 5.20)
- ⚠️ Content moderation basic (task 5.15)
- ℹ️ Audit logging sudah tersedia (middleware)
