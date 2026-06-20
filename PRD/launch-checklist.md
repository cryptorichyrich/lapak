# Lapak — Launch Checklist
> Task 5.16 | Production readiness

## Pre-Launch Verification

### Infrastructure
- [ ] API Worker deployed: `lapak-api.fxwisdom1.workers.dev` ✅
- [ ] Storefront Worker deployed: `lapak-storefront.fxwisdom1.workers.dev` ✅
- [ ] Studio deployed: `lapak-studio.pages.dev` ✅
- [ ] Console deployed: `lapak-console.pages.dev` ✅
- [ ] Marketing deployed: `lapak-marketing.pages.dev` ✅

### Domain & SSL
- [ ] Custom domain: `lapak.id` configured in CF
- [ ] Wildcard SSL untuk `*.lapak.id` tenant subdomains
- [ ] DNS records: A/AAAA/CNAME verified
- [ ] SSL mode: Full (strict)

### Production Secrets
- [ ] `SUPABASE_URL` — production Supabase project
- [ ] `SUPABASE_SERVICE_KEY` — production
- [ ] `JWT_SECRET` — generated, rotatable
- [ ] `XENDIT_API_KEY` — production API key (not sandbox)
- [ ] `XENDIT_CALLBACK_TOKEN` — production webhook
- [ ] `EVERPRO_CLIENT_KEY` + `EVERPRO_CLIENT_SECRET` — production
- [ ] `RESEND_API_KEY` — production (verified domain)
- [ ] `FROM_EMAIL` — noreply@lapak.id (verified)

### Database
- [ ] Supabase Pro plan (not free tier)
- [ ] Connection pooler enabled
- [ ] Point-in-time recovery enabled
- [ ] Backup automation (task 5.20)
- [ ] All 12 migrations applied
- [ ] Seed data cleaned (no test@lapak.test accounts)

### Testing
- [ ] E2E smoke test passed (task 5.11)
- [ ] Mobile E2E passed (task 5.12)
- [ ] Performance audit ≥ 90 (task 5.13)
- [ ] Security audit clear (task 5.14)
- [ ] Unit tests passing (task 5.17)
- [ ] Integration tests passing (task 5.18)

### Legal
- [ ] Seller ToS published (task 5.9)
- [ ] Privacy Policy (UU PDP) published
- [ ] AI Disclosure (EU AI Act Art.50) published
- [ ] Legal email flows configured (task 5.10)

### Operations
- [ ] Monitoring: CF Analytics + Supabase dashboard
- [ ] Alerts: error rate > 1%, latency > 2s
- [ ] On-call: documented escalation path
- [ ] Backup: daily pg_dump → R2 (task 5.20)
- [ ] Rate limiting active (task 5.14)

### Go/No-Go
- [ ] Semua item di atas ✅
- [ ] Tim siap monitor 24 jam pertama
- [ ] Rollback plan documented

---

**Status:** READY FOR LAUNCH | **Date:** 20 June 2026
