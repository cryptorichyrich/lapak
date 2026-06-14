## 22. Error Handling Strategy

> This section defines how Lapak handles every failure mode — from external service outages to invalid user input to catastrophic SSR failures. Every error path must have a defined fallback and a user-facing message in Indonesian.

---

### 22.1 Error Hierarchy (Code Reference: `src/lib/errors.ts`)

```typescript
// Base — all Lapak errors inherit from this
class LapakError extends Error {
  constructor(
    message: string,
    public code: string,        // machine-readable: PAYMENT_FAILED, NOT_FOUND
    public statusCode: number,   // HTTP status: 404, 422, 500
    public isUserFacing: boolean = true  // safe to show to user?
  ) {
    super(message)
    this.name = 'LapakError'
  }
}

// Specific errors
class PaymentError extends LapakError { /* Xendit/refund failures */ }
class AuthError extends LapakError { /* 401 unauthorized, 403 forbidden */ }
class TenantError extends LapakError { /* tenant not found, suspended, expired */ }
class ValidationError extends LapakError { /* Zod parse failure, invalid input */ }
class NotFoundError extends LapakError { /* resource not found */ }
class RateLimitError extends LapakError { /* 429 too many requests */ }
class ExternalServiceError extends LapakError { /* Supabase/R2/Xendit/AI down */ }
class InsufficientCreditsError extends LapakError { /* AI credits exhausted */ }
class TenantSuspendedError extends TenantError { /* tenant is suspended */ }
class PlanLimitError extends LapakError { /* feature not available on current plan */ }
```

**Rules:**
- Never catch and swallow errors silently
- Every API route wraps in `try/catch` that maps `LapakError` → structured JSON
- Unknown errors → Sentry alert + generic "Terjadi kesalahan" (Indonesian)
- `isUserFacing=false` for internal errors — never leak to client
- Frontend: React Error Boundaries per page section

---

### 22.2 API Error Response Format

All API errors return a consistent shape:

```json
{
  "ok": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Nama produk harus diisi",
    "details": [
      { "field": "name", "message": "Required" },
      { "field": "price", "message": "Must be positive number" }
    ]
  }
}
```

**Error Code Registry:**

| Code | HTTP Status | When | User Message (ID) |
|---|---|---|---|
| `VALIDATION_ERROR` | 422 | Zod parse fails | "Data tidak valid: {field}" |
| `NOT_FOUND` | 404 | Resource missing | "Halaman tidak ditemukan" |
| `UNAUTHORIZED` | 401 | No auth / expired JWT | "Silakan login ulang" |
| `FORBIDDEN` | 403 | Wrong tenant / role | "Anda tidak memiliki akses" |
| `TENANT_NOT_FOUND` | 404 | Unknown shop domain | "Toko tidak ditemukan" |
| `TENANT_SUSPENDED` | 403 | Tenant is suspended | "Toko sedang tidak tersedia" |
| `PAYMENT_FAILED` | 402 | Xendit error | "Pembayaran gagal, silakan coba lagi" |
| `PAYMENT_PENDING` | 202 | Payment queued for retry | "Pembayaran sedang diproses" |
| `INSUFFICIENT_CREDITS` | 403 | AI credits exhausted | "Kredit AI habis, upgrade plan Anda" |
| `PLAN_LIMIT` | 403 | Feature behind higher plan | "Fitur ini tersedia di plan {plan}" |
| `RATE_LIMITED` | 429 | Too many requests | "Terlalu banyak permintaan, coba lagi dalam {seconds} detik" |
| `UPLOAD_FAILED` | 500 | R2 upload error | "Upload gagal, silakan coba lagi" |
| `AI_ERROR` | 502 | AI model failure | "AI sedang sibuk, coba lagi nanti" |
| `SHIPPING_CALC_FAILED` | 502 | Courier API down | "Menggunakan tarif standar" |
| `INTERNAL_ERROR` | 500 | Unexpected failure | "Terjadi kesalahan, tim kami sudah diberitahu" |

---

### 22.3 External Service Failures — Fallback Matrix

| Service | Failure Mode | Detection | Fallback Strategy | User Message (ID) | Recovery |
|---|---|---|---|---|---|
| **Supabase** | DB unreachable | Connection timeout > 5s | Serve KV-cached storefront (stale ≤ 15min). Studio shows "read-only mode" banner. | "Toko sedang dalam mode baca saja" | Auto-recovers on reconnect. Alert Sentry. |
| **Supabase** | Query slow (>3s) | p95 latency spike | Return cached data if available, else loading spinner | — (transparent) | Alert to check indexes / connection pool |
| **Xendit** | Payment creation fails | HTTP 5xx / timeout | Queue order as `pending_payment`. Retry 5x over 10min with exponential backoff (1s, 2s, 4s, 8s, 16s). | "Pembayaran sedang diproses, kami akan konfirmasi segera" | If all retries fail → mark `payment_failed` → notify seller |
| **Xendit** | Webhook delayed | Payment not confirmed in 5min | Poll Xendit API for invoice status | — (silent) | Sync on next webhook or poll |
| **AI (CF Workers AI)** | Primary model error | HTTP 5xx / garbage output | Fallback chain: primary → secondary model → Gemini Flash (external) → cached template response | "AI sedang sibuk, coba lagi" | Auto-recovers. Log which model failed. |
| **AI** | Garbage output | Validation: <20 chars, repeated phrases, no meaningful content | Retry with different model. Max 3 attempts. | "Gagal membuat konten, coba lagi" | Log output for manual review |
| **R2** | Upload fails | HTTP 5xx / timeout | Retry 3x with backoff (1s, 3s, 9s). If persistent → store as local blob + async upload queue | "Upload gagal, silakan coba lagi" | Background worker retries from queue |
| **R2** | Image serve fails | 404 / timeout | CF Cache serves stale. If no cache → placeholder image | — (transparent) | Re-upload from source |
| **Everpro** | Shipping calc fails | HTTP 5xx / timeout | Fallback to RajaOngkir API V2. If both down → flat rate Rp15.000 | "Menggunakan tarif standar" | Retry in 30min. Alert to check API status |
| **Email (Resend)** | Send fails | HTTP 5xx / rejected | unemail fallback chain: Resend → Mailgun. If both fail → queue in `email_queue` table, retry every 5min | — (silent, async) | Background worker drains queue |
| **CF Workers** | Function timeout (>30s) | Worker killed | Return cached or partial response. Log timeout details | "Permintaan terlalu lama, coba lagi" | Optimize worker. Consider Durable Objects. |
| **CF Pages** | SSR render fails | Uncaught exception | Serve `/_fallback.html` static page | "Toko sedang tidak tersedia, coba lagi sebentar" | Auto-recover on next request |

---

### 22.4 Storefront Error Pages

**404 — Page Not Found**
- Branded 404 page with store theme colors
- Shows: search bar + popular products + "Kembali ke beranda" button
- Logged: `{ path, tenant_id, referrer }`

**500 — Server Error**
- `/_fallback.html` — static HTML, no JS, no Supabase dependency
- Content: "Toko sedang tidak tersedia" + store logo (from KV cache) + retry link
- CF Pages serves this when SSR throws uncaught exception
- TTL: browser refreshes in 30s via meta refresh

**Tenant Suspended**
- Show: "Toko ini sedang tidak tersedia" (no details exposed to buyer)
- HTTP 503 Service Unavailable
- If owner visits Studio: show reason + action ("Hubungi support" or "Upgrade plan")

**Tenant Not Found**
- For `*.lapak.id` subdomains that don't exist: redirect to `lapak.id` with "Toko tidak ditemukan"
- For custom domains: show generic "Website not found" page

---

### 22.5 Studio/Console Error Boundaries

**Granular Recovery:**
```
App Layout
├── Sidebar → ErrorBoundary (sidebar survives main content crash)
├── Page Editor
│   ├── Block A → ErrorBoundary (only this block shows error)
│   ├── Block B → ErrorBoundary (unaffected)
│   └── Block C → ErrorBoundary (unaffected)
├── Settings Panel → ErrorBoundary
└── Preview Panel → ErrorBoundary
```

**Error boundary shows:**
- Icon + "Bagian ini mengalami masalah"
- "Muat ulang" button (resets the boundary)
- "Laporkan masalah" link (opens pre-filled GitHub issue)

**Global errors (auth failure, network offline):**
- Toast notification: "Koneksi terputus" or "Sesi berakhir, login ulang"
- Auto-retry for network recovery
- Redirect to login for auth errors

---

### 22.6 Retry Strategies

| Operation | Max Retries | Backoff | Jitter | Timeout |
|---|---|---|---|---|
| Payment (Xendit) | 5 | Exponential: 1s → 2s → 4s → 8s → 16s | ±200ms | 10s per attempt |
| Shipping calc | 2 | Fixed: 1s | ±100ms | 5s per attempt |
| AI generation | 3 | Exponential: 1s → 3s → 9s | ±500ms | 30s per attempt |
| Email send | 5 | Fixed: 5min intervals | None | 10s per attempt |
| R2 upload | 3 | Exponential: 1s → 3s → 9s | ±200ms | 15s per attempt |
| SSR data fetch | 1 | Fixed: 0ms (immediate retry) | None | 3s per attempt |
| Webhook processing | 3 | Exponential: 1s → 5s → 30s | ±500ms | 10s per attempt |

**Circuit Breaker (for AI + Payment):**
- After 5 consecutive failures → open circuit for 60s
- During open: immediately return fallback (cached template / queued payment)
- After 60s: half-open — allow 1 request. If success → close circuit. If fail → open for another 60s.
- Circuit state stored in KV (edge-accessible)

---

### 22.7 Error Logging & Alerting

**Structured Error Log Format:**
```json
{
  "timestamp": "2026-06-13T10:00:00Z",
  "level": "error",
  "service": "api" | "storefront" | "studio",
  "error_code": "PAYMENT_FAILED",
  "message": "Xendit invoice creation failed",
  "tenant_id": "uuid",
  "request_id": "cf-ray-id",
  "stack": "...",
  "context": {
    "xendit_status": 503,
    "order_id": "uuid",
    "amount": 150000
  }
}
```

**Alert Routing:**
- `INTERNAL_ERROR` (500) → Sentry + Telegram alert (Bio)
- `PaymentError` → Sentry + Telegram alert
- Rate limit spike (>100 429s in 5min) → Sentry alert
- Tenant suspended → log only (no alert — business decision)
- `ExternalServiceError` → Sentry + circuit breaker opens

**Client Error Collection:**
- `window.onerror` + `unhandledrejection` in storefront + studio
- Batched POST to `/api/client-errors` every 30s (max 10 errors per batch)
- Stored in Supabase `client_errors` table: `{ url, message, stack, browser, tenant_id, timestamp }`
- Deduped by `message + url` hash — same error logged once per hour

---

### 22.8 Graceful Degradation Priority

When multiple services fail simultaneously, prioritize by user impact:

1. **Storefront reads** (highest) → serve from KV cache, even if stale
2. **Payment flow** → queue for async processing, confirm to buyer
3. **Studio editing** → local drafts in IndexedDB, sync when back online
4. **AI features** → disable gracefully, show "AI sedang tidak tersedia"
5. **Email notifications** → queue and deliver later (user doesn't wait)
6. **Analytics/reporting** (lowest) → skip entirely during degradation

---
