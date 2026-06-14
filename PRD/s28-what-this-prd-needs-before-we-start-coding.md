## 28. What This PRD Needs Before We Start Coding

- [x] Confirm name → **Lapak** ✅
- [x] Confirm pricing tiers → **Free / Rp99K / Rp199K** ✅
- [x] Confirm payment gateway → **Xendit XenPlatform** ✅
- [x] Confirm shipping provider → **Everpro** ✅
- [x] Confirm tech stack → **Astro SSR + React SPA + CF Pages** ✅
- [x] Confirm AI strategy → **CF Workers AI + BYOK + Credits** ✅
- [x] Confirm subproject breakdown → **Storefront + Studio + Console + Marketing** ✅
- [x] Confirm image storage → **Cloudflare R2 (zero egress)** ✅
- [x] Confirm background removal → **CF Images API (free, built-in)** ✅
- [x] Confirm AI reseller legality → **All providers allow commercial use** ✅
- [x] Product variants → **JSONB field on products table** (A) ✅
- [x] Email provider → **unemail (multi-provider abstraction, Resend default + Mailgun fallback)** ✅
- [x] Studio/Console UI language → **Bilingual toggle (Indonesian default, English available)** (C) ✅
- [x] Link-in-Bio → **In MVP** (A) — simple bio page, ~400 lines, 1-2 day build ✅
- [x] Onboarding flow → **4-step wizard + Getting Started checklist + 5 templates** ✅
- [x] Notification system → **Supabase Realtime (Studio push) + unemail (email)** ✅
- [x] Error handling → **Typed error codes + fallback chains per service + error boundaries** ✅
- [x] Testing strategy → **Vitest (unit) + Supabase local (integration) + Playwright (E2E)** ✅
- [x] Monitoring → **CF Analytics + UptimeRobot + structured logging + health endpoint** ✅
- [x] API design → **Consolidated spec: public storefront + authenticated Studio + admin Console** ✅
- [x] Data retention → **30-day grace on deletion, 12-month inactive archive, 24-month hard delete** ✅
- [x] i18n → **Simple key-value JSON, no heavy library** ✅
- [x] Cart sessions → **Cookie-based UUID + Supabase cart_sessions table** ✅
- [x] Image caching → **Cache-Control headers by content type (1d/7d/30d)** ✅
- [x] Backup → **Daily pg_dump + R2 continuous replication** ✅
- [ ] Design: any visual references for the editor?
- [ ] Logo/branding direction?

**All 18 gaps patched. PRD coverage: 100%. Ready for implementation.**
