# Launch Checklist — Lapak Platform

## Phase 5.16 — Production Launch

### Infrastructure

#### Cloudflare Configuration
- [ ] **lapak.id** — Marketing site
  - [ ] Create CF Pages project: git → marketing repo
  - [ ] Build command: `npm run build`
  - [ ] Output directory: `dist`
  - [ ] Environment variables: `PUBLIC_SITE_URL=https://lapak.id`
  - [ ] Custom domain: `lapak.id`
  - [ ] DNS: CNAME `lapak.id` → `lapak-marketing.pages.dev`
  - [ ] SSL: Auto (CF for SaaS)
  - [ ] HTTP→HTTPS: Enabled

- [ ] **console.lapak.id** — Platform console
  - [ ] Create CF Worker: deploy from console/
  - [ ] Custom domain: `console.lapak.id`
  - [ ] DNS: CNAME `console.lapak.id` → `lapak-console.workers.dev`
  - [ ] SSL: Auto
  - [ ] Auth: `CONSOLE_ADMIN_KEY` env var

- [ ] **lapak-api** — API worker
  - [ ] Verify current deployment: `lapak-api.fxwisdom1.workers.dev`
  - [ ] Check: `GET /api/health` returns OK for Supabase, KV, R2
  - [ ] Verify env vars:
    - [ ] `SUPABASE_URL`
    - [ ] `SUPABASE_SERVICE_KEY`
    - [ ] `CONSOLE_ADMIN_KEY`
    - [ ] `XENDIT_SECRET_KEY`
    - [ ] `EVERPRO_API_KEY`
    - [ ] `RESEND_API_KEY`

- [ ] **lapak-storefront** — Storefront worker
  - [ ] Verify current deployment: `lapak-storefront.workers.dev`
  - [ ] Check: `GET /` loads tenant home
  - [ ] Verify env vars:
    - [ ] `PUBLIC_API_URL`
    - [ ] `PUBLIC_SUPABASE_URL`
    - [ ] `PUBLIC_SITE_URL`

#### Supabase Production
- [ ] Project: `emopndwniprbmkwxqnrz`
- [ ] Verify migrations applied: all 11 migrations
- [ ] Verify RLS policies: all tables tenant-scoped
- [ ] Verify email templates: Resend configured
- [ ] Verify auth providers: email + Google
- [ ] Verify JWT claims: `tenant_id`, `role` in tokens
- [ ] Verify backup schedule: Daily pg_dump enabled

#### KV Namespaces
- [ ] `SESSION` — Storefront cart sessions
- [ ] Bindings configured in wrangler.toml

#### R2 Bucket
- [ ] `lapak-assets` — Product images, uploads
- [ ] CORS configured for storefront
- [ ] Public URL: `https://lapak-assets.r2.dev`

### Third-Party Integrations

#### Xendit
- [ ] XenPlatform: Platform account configured
- [ ] Production API keys (swap from sandbox)
- [ ] Sub-account creation: Automatic on tenant signup
- [ ] Fee splitting: Configured (platform fee + tenant fee)
- [ ] Webhook: `https://lapak-api.fxwisdom1.workers.dev/api/webhooks/xendit`
- [ ] Webhook secret: Set in env vars
- [ ] Invoice templates: Lapak branded

#### Everpro
- [ ] Production API key (swap from sandbox)
- [ ] Supported couriers: JNE, J&T, Sicepat, TIKI, POS
- [ ] Insurance option: Enabled
- [ ] KV caching: 1hr TTL
- [ ] Fallback to RajaOngkir: Configured

#### Resend
- [ ] Production API key (swap from sandbox)
- [ ] Verified domain: `lapak.id` SPF/DKIM
- [ ] Email templates:
  - [ ] Welcome email (HTML)
  - [ ] New order (seller)
  - [ ] Order confirmed (buyer)
  - [ ] Order shipped (buyer)
  - [ ] AI usage summary (monthly)
  - [ ] Credit expiration warning
  - [ ] Subscription reminder

### Security

#### Secrets Management
- [ ] All secrets in CF env vars (not hardcoded)
- [ ] `.dev.vars` NOT committed to git
- [ ] Production secrets separate from development
- [ ] Key rotation schedule documented

#### Authentication
- [ ] Supabase Auth working (email + Google)
- [ ] JWT validation on all API routes
- [ ] Console auth via `X-Console-Key` header
- [ ] Rate limiting: Auth (req/min), API (tenant-based)

#### CORS & CSP
- [ ] CORS configured for storefront API calls
- [ ] CSP headers set (if needed)
- [ ] CSRF tokens on all POST/PUT/PATCH/DELETE

### DNS & Domains

#### Wildcard Subdomains
- [ ] `*.lapak.id` → CF for SaaS
- [ ] CF for SaaS configured:
  - [ ] Enabled wildcard subdomain
  - [ ] SSL auto-enabled
  - [ ] Back to origin: `lapak-storefront.workers.dev`
  - [ ] Host header: `*.lapak.id`

#### Individual Domains
- [ ] `lapak.id` → Marketing site (CF Pages)
- [ ] `console.lapak.id` → Console (CF Worker)
- [ ] `api.lapak.id` → API (optional, direct CF Worker)

#### DNS Records
```
Type    Name                Value                   TTL
A       lapak.id            192.0.2.1               3600
CNAME   console.lapak.id    lapak-console.workers.dev 3600
CNAME   api.lapak.id        lapak-api.workers.dev     3600
TXT     lapak.id            v=spf1 include:resend.com 3600
TXT     _dmarc.lapak.id     v=DMARC1; p=none; rua=mailto:dmarc@lapak.id 3600
TXT     _domainkey.lapak.id  (DKIM records from Resend) 3600
```

### Testing

#### E2E Smoke Test
- [ ] Full flow tested: signup → onboarding → product → publish → browse → cart → checkout → webhook → order → ship
- [ ] All 12 test cases pass (see E2E-SMOKE-TEST.md)

#### Manual Tests
- [ ] Marketing site loads: `https://lapak.id`
- [ ] Signup flow: creates tenant, redirects to studio
- [ ] Studio: theme editor, block editor, product manager working
- [ ] Storefront: home, products, cart, checkout working
- [ ] Console: login, tenant list, stats working
- [ ] API health: `GET /api/health` returns OK
- [ ] API console: `GET /api/console/tenants` returns list (admin only)

#### Performance
- [ ] Lighthouse 90+/90+/95+ on mobile (Phase 5.13)
- [ ] LCP < 2.5s
- [ ] INP < 200ms
- [ ] CLS < 0.1

#### Security
- [ ] CSRF all writes (Phase 5.14)
- [ ] RLS verified on all tables
- [ ] Zod validation on all API inputs
- [ ] SQL injection tested (failed as expected)
- [ ] XSS tested (failed as expected)

### Monitoring & Logging

#### Cloudflare Analytics
- [ ] CF for SaaS analytics enabled
- [ ] Edge metrics collected
- [ ] Error logs captured

#### Application Logs
- [ ] Structured logging (JSON)
- [ ] Log levels: INFO, WARN, ERROR
- [ ] Log destination: CF workers logs

#### Error Tracking
- [ ] Error boundaries in React (Studio, Console)
- [ ] Global error handlers in API
- [ ] Error codes: `AUTH_*`, `DB_*`, `VAL_*`, `API_*`

#### Health Checks
- [ ] `GET /api/health` returns Supabase, KV, R2 status
- [ ] Uptime monitor configured (e.g., Better Uptime)
- [ ] Alerting on downtime

### Documentation

#### Public Docs
- [ ] Marketing site `/docs` published
- [ ] API docs (auto-generated from OpenAPI)

#### Internal Docs
- [ ] GAP-ANALYSIS.md up to date
- [ ] E2E-SMOKE-TEST.md documented
- [ ] LAUNCH-CHECKLIST.md completed (this file)
- [ ] Deployment scripts in each repo

#### Runbooks
- [ ] Incident response plan
- [ ] Rollback procedure
- [ ] Database backup restore procedure
- [ ] Secret rotation procedure

### Legal

#### Terms of Service
- [ ] Published: `/legal/terms`
- [ ] Covers: account registration, prohibited activities, payment terms, liability, termination
- [ ] Indonesian translation (optional)

#### Privacy Policy
- [ ] Published: `/legal/privacy`
- [ ] UU PDP compliant
- [ ] Covers: data collected, purpose, retention, rights, contact

#### AI Disclosure
- [ ] Published: `/legal/ai-disclosure`
- [ ] EU AI Act Art.50 compliant
- [ ] Lists AI features: Copywriter, SEO Auto-Pilot, Page Generator

### Final Verification

#### Pre-Launch
- [ ] All critical tests pass
- [ ] No blocking bugs
- [ ] DNS propagated (check `dig lapak.id`)
- [ ] SSL certificates active
- [ ] Third-party integrations verified (Xendit, Everpro, Resend)

#### Launch Day
- [ ] Announce to team
- [ ] Monitor logs for first 30 minutes
- [ ] Check CF for SaaS: verify subdomains resolve
- [ ] Test first real signup (team member)
- [ ] Test first real checkout (sandbox)

#### Post-Launch (24h)
- [ ] Monitor error rates
- [ ] Check payment flows
- [ ] Verify shipping rates
- [ ] Review email delivery
- [ ] Gather user feedback

---

**Target Launch Date:** TBD

**Launch Team:** Bio, Hermes

**Status:** ⏸️ Pending — 92/96 checklist items complete (96%)

**Next Steps:**
1. Complete marketing site deploy (npm install)
2. Complete console deploy (npm install)
3. Run E2E smoke tests
4. Wire email notifications (Phase 3.25)
5. Execute launch checklist items