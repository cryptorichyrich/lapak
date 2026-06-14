## 20. Email Infrastructure

### Library: unemail (multi-provider abstraction)

**Why unemail:**
- 15+ built-in drivers (Resend, Mailgun, SES, Postmark, SendGrid, Brevo, etc.)
- Swap provider in 1 line of code — no vendor lock-in
- Zero deps, edge-first (runs on CF Pages Functions)
- DKIM signing, retry with jitter, circuit breaker built-in
- React Email rendering support
- Provider fallback chains out of the box

**Default driver: Resend** (free 100 emails/day, React Email native)

**Fallback chain:** Resend → Mailgun (if Resend down)

```typescript
import { createEmail } from 'unemail'
import resend from 'unemail/driver/resend'
import mailgun from 'unemail/driver/mailgun'
import fallback from 'unemail/driver/fallback'

const email = createEmail({
  driver: fallback({
    drivers: [
      resend({ apiKey: process.env.RESEND_KEY! }),
      mailgun({ domain: 'lapak.id', apiKey: process.env.MAILGUN_KEY! }),
    ],
  }),
})
```

### Transactional Email Templates (MVP — 6 templates)

| Template | Trigger | Recipient | Content |
|---|---|---|---|
| **Welcome** | Seller signup | Seller | Store link, getting started tips, Studio login |
| **New Order** | Buyer places order | Seller | Order details, buyer info, total, shipping |
| **Order Confirmed** | Seller confirms order | Buyer | Order summary, estimated delivery, WA contact |
| **Order Shipped** | Seller marks shipped | Buyer | Tracking number, courier, estimated arrival |
| **AI Credits Low** | Balance < 5 credits | Seller | Credit balance, buy more link |
| **Password Reset** | Seller requests reset | Seller | Reset link (expires 1 hour) |

### Email Design
- React Email components for all templates
- Consistent branding: Lapak logo + store name in header
- Mobile-first layouts
- Dark mode support
- All emails in **bilingual** (Indonesian primary, English secondary link)

### Sender Identity
- Default: `Lapak <noreply@lapak.id>` via Resend
- Custom sender for seller stores: `Toko {name} <orders@lapak.id>` (Reply-To: seller's WA)
- Domain: `lapak.id` with SPF + DKIM + DMARC configured in DNS

---
