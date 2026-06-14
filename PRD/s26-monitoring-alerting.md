## 26. Monitoring & Alerting

### Infrastructure Monitoring

| Tool | What It Monitors | Alert |
|---|---|---|
| **CF Analytics** | Request volume, error rate, latency per route | Email if error rate > 5% |
| **Supabase Dashboard** | DB connections, query performance, RLS errors | Email if connection pool > 80% |
| **UptimeRobot** (free) | HTTPS ping every 5min on `lapak.id` + `studio.lapak.id` | Email + Telegram webhook if down |
| **CF Workers AI metrics** | AI request latency, error rate per model | Log to `ai_usage_log` table |

### Application Monitoring

- **Structured logging:** All API routes log `{ method, path, status, latency_ms, tenant_id, error? }`
- **Error tracking:** Console → `window.onerror` + `unhandledrejection` → POST `/api/client-errors` → log to Supabase
- **Performance:** CF Analytics provides TTFB per route. Alert if p95 > 500ms.

### Alerting Rules (MVP)

| Condition | Action |
|---|---|
| Site down > 2 min | Telegram alert to Bio |
| API error rate > 10% for 5min | Telegram alert |
| Supabase connection pool > 80% | Email alert |
| AI proxy failing consistently | Log + disable AI features gracefully |
| New tenant signup | Telegram notification |

### Health Check Endpoint
```
GET /api/health → { ok: true, supabase: "connected", r2: "writable", ai: "available" }
```

---
