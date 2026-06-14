## 11. What's OUT of MVP (v2+)

- ❌ Stock/inventory management (products show "in stock" or hide, no tracking)
- ✅ ~~Shipping rate calculation~~ → **Promoted to MVP via Everpro**
- ✅ ~~Reviews/ratings~~ → **Promoted to MVP** (Reviews block + auto-collect after order)
- ✅ ~~AI content generation~~ → **Promoted to MVP** (AI proxy + BYOK + credits system, powered by CF Workers AI)
- ❌ Multi-currency (IDR only)
- ❌ Digital products / downloads
- ✅ ~~Blog / CMS~~ → **Promoted to MVP** (blog index, posts, product sidebar widget — key SEO moat)
- ❌ Multi-staff accounts
- ❌ Discount codes / coupons
- ✅ ~~Product variants~~ → **Promoted to MVP** (JSONB variants — simple `[ {name: "Ukuran", options: ["S","M","L"]}]` on products table. No separate table. Covers 80% of UMKM needs.)
- ❌ Wishlists
- ❌ AI Product Photography (v2 — requires image gen pipeline)
- ❌ AI Page Generation from description (v2 — complex prompt engineering)
- ❌ Smart Follow-Ups / WhatsApp automation (v2 — requires WA provider setup)
- ✅ ~~Link-in-Bio page~~ → **Promoted to MVP** (simple bio page with avatar + links + social + WA. Quick build, high value for Instagram/TikTok sellers.)
- ❌ Reviews moderation (v3 — Pro plan paywall)

### ⭐ NEW IN MVP: Lead Capture + Smart Follow-Ups

**Goal:** Sellers capture leads via Form Lead block → build a contact list → send timely, personalized follow-ups that recover lost sales and drive repeat purchases.

#### Lead Capture System
- **Form Lead block** (already in block library): captures name, phone, email, custom fields
- **Lead database**: every form submission stored in `leads` table per tenant
- **Lead segments**: Auto-tag leads by source (page/block), activity, date
- **Lead export**: CSV download for WA blast tools (WABlas, WA Gateway)
- **Double opt-in**: optional WhatsApp verification via OTP

#### Smart Follow-Ups (WhatsApp-first)
Indonesian sellers live on WhatsApp. Automated, personalized WA messages that feel human — not robotic blasts.

| Trigger | Notification | Target | Plan |
|---|---|---|---|
| **Abandoned Cart** | "Hey {name}, kamu left {product} di keranjang! Selesaikan order ya 🛒" | Cart abandoned 1hr / 24hr | Starter+ |
| **Abandoned Checkout** | "Order {order_id} belum dibayar. Bayar sekarang ya! Link: {url}" | Unpaid after 30min / 2hr / 24hr | Starter+ |
| **Promo Blast** | Seller writes message → sends to segment/all leads | All leads or segment | Pro |
| **Price Drop Alert** | "{product} turun dari Rp{old} ke Rp{new}! Cek sekarang 🔥" | Leads who viewed product | Pro |
| **Back in Stock** | "{product} sudah tersedia lagi! Order sekarang 👉 {url}" | Leads who expressed interest | Pro |
| **Review Request** | "Terima kasih udah order! Bantu review ya ⭐ {url}" | 3 days after order completed | Starter+ |
| **Order Update** | "Pesanan {id} sedang dikirim via {courier}. Track: {link}" | Auto on status change | Starter+ |

#### Smart Follow-Up Engine
- **WA Business API** via third-party provider (Fonnte, Wablas, or direct Meta API)
- **Follow-up queue**: Supabase Edge Function + `pg_cron` for scheduled sends
- **Rate limits**: Max 100 messages/day on Starter, unlimited on Pro
- **Opt-out**: Every message includes "Balas STOP untuk berhenti"
- **Dashboard**: View sent count, delivery rate, click-through per campaign
- **Templates**: Pre-built message templates with variable substitution (`{name}`, `{product}`, `{price}`, `{url}`)

#### Abandoned Cart Recovery Flow
1. Customer adds item to cart → cart saved in `cart` table with `created_at`
2. Customer leaves without paying → `pg_cron` job checks every 5 min for carts > 1hr
3. Edge Function sends WA notification via template
4. If still unpaid at 24hr → second reminder (different template, more urgent)
5. If still unpaid at 72hr → final reminder with potential discount offer
6. All notifications tracked in `notification_log` table

#### Promo Blast Flow
1. Seller opens "Notifikasi" in dashboard
2. Selects segment: All leads / Recent visitors / Past buyers / Custom segment
3. Writes message (with template selector)
4. Schedules: Send now / Schedule for later
5. Confirms → queued for delivery
6. Dashboard shows delivery stats

---
