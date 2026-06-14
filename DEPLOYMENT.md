# Deployment Guide

## 1. Set Secrets (run in `/api/`)

```bash
wrangler secret put SUPABASE_URL                # https://emopndwniprbmkwxqnrz.supabase.co
wrangler secret put SUPABASE_ANON_KEY            # Get from Supabase dashboard
wrangler secret put SUPABASE_SERVICE_KEY         # Get from Supabase dashboard
wrangler secret put JWT_SECRET                 # openssl rand -base64 32
wrangler secret put XENDIT_API_KEY             # From Xendit dashboard
wrangler secret put XENDIT_CALLBACK_TOKEN      # From Xendit dashboard
wrangler secret put EVERPRO_BASE_URL            # https://api.everpro.id
wrangler secret put EVERPRO_CLIENT_KEY          # From Everpro
wrangler secret put EVERPRO_CLIENT_SECRET       # From Everpro
wrangler secret put RESEND_API_KEY             # From Resend.com
wrangler secret put FROM_EMAIL                # orders@yourdomain.com
wrangler secret put CLOUDFLARE_API_TOKEN       # Your CF API token
wrangler secret put CLOUDFLARE_ZONE_ID        # Your CF zone ID
```

## 2. Deploy API

```bash
cd /api && npm run deploy
```

## 3. Deploy Storefront

```bash
cd /storefront && npm run build && npx wrangler pages deploy dist --project-name lapak-storefront
```

## Secrets Needed

| Secret | Where to get |
|--------|-------------|
| SUPABASE_ANON_KEY | https://supabase.com/dashboard/project/emopndwniprbmkwxqnrz/settings/api |
| SUPABASE_SERVICE_KEY | Same as above (keep secret!) |
| XENDIT_API_KEY | https://dashboard.xendit.co/settings/configurations |
| XENDIT_CALLBACK_TOKEN | Xendit callback settings |
| EVERPRO keys | Everpro dashboard (contact team) |
| RESEND_API_KEY | https://resend.com/api-keys |