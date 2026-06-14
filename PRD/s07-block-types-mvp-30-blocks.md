## 7. Block Types (MVP — 30 blocks)

> **Based on 100% reverse-engineering of Djualan's 27 blocks + Lapak originals (Reviews, Navigation, Footer)**
> Full field schemas: `competitive-analysis-djualan.md` §21

### Categories
- **UTAMA** (6): Hero, Manfaat, Testimoni, Form Pemesanan, FAQ, WhatsApp
- **PENDUKUNG** (15): Masalah, Garansi, Bonus, Hitung Mundur, Pengumuman, Galeri, Sebelum & Sesudah, Cara Order, Bukti Sosial, Video, Form Lead, Booking, Profil Penjual, Sertifikasi, Paket Harga
- **TAMBAHAN** (9): Teks, Gambar, Gambar & Teks, Tombol, Pemisah, Running Text, Logo Media, Animasi, Embed

### Universal Block Features
- **Actions:** Move Up / Move Down / Duplicate / Delete / AI Rewrite
- **Tampilan (Appearance):** Background color/image + Text color + Inner padding (0/S/M/L) + Block margin (0/S/M/L/XL) + Reset
- **Schema:** Strict JSON per block type, validated in editor + at build
- **Render:** Astro component (SSG) + React editor component
- **Theme:** CSS tokens (colors, fonts, spacing, radius)
- **Responsive:** Mobile-first by default

### Block Field Summary

**UTAMA:**

| Block | Purpose | Key Fields |
|---|---|---|
| **Hero** | Landing banner | heading, subheading, CTA button, hero image, rating, bullet points (3/6), price |
| **Manfaat** | Benefits | layout (cards/list), heading, items[] {title, desc, icon} (3/6) |
| **Testimoni** | Social proof | heading, tabbed items[] {name, text, rating, avatar, source} (3/8) |
| **Form Pemesanan** | Order form | heading, fields (name/phone/address/notes), product selector, qty, payment, WA integration |
| **FAQ** | Questions | heading, items[] {question, answer} (3/10), accordion toggle |
| **WhatsApp** | CTA button | heading, button text, WA number, pre-filled message, floating toggle |

**PENDUKUNG:**

| Block | Purpose | Key Fields |
|---|---|---|
| **Masalah** | Problem agitation | heading, problem items[] {text} (3/5), 4 starters |
| **Garansi** | Guarantee/trust | heading, description, button, badges[] {text} (3/6) |
| **Bonus** | Value stacking | eyebrow, heading, desc, layout (cards/list/compact), columns (2/3), items[] {name, price} (3/8), total toggle, save% toggle, order note |
| **Hitung Mundur** | Urgency timer | heading, date picker, time picker, expiry action (hide section) |
| **Pengumuman** | Announcement bar | text, dismissible toggle |
| **Galeri** | Image gallery | heading, columns (2/3), images[] (0/6, upload/URL, JPG/PNG/WebP 10MB) |
| **Sebelum & Sesudah** | Before/after | layout (2col/photo), heading, labels, items[] {image, text} (3/5) |
| **Cara Order** | How to order | layout (horiz/vert), heading, steps[] {title, desc} (5/6, numbered) |
| **Bukti Sosial** | Social proof stats | stats[] {value, label}, stars, testimoni cards[] |
| **Video** | Video embed | heading, URL (YouTube/Vimeo) |
| **Form Lead** ⭐ | Lead capture | eyebrow, heading, desc, layout (4 options), fields[] (3/10, custom types + IDs), button, WA target, message template with {variables}, after-submit action (WA/Message/Redirect), success message, privacy note |
| **Booking** | Appointment booking | heading, date/time picker, slots, contact fields, confirmation (WA/email) |
| **Profil Penjual** | Seller profile | avatar, name, bio, social links[], trust badges |
| **Sertifikasi** | Certifications | heading, items[] {image, title, issuer, year} (3/6) |
| **Paket Harga** | Pricing tiers | heading, packages[] {name, price, period, desc, highlight, features[], button} (3/4) |

**TAMBAHAN:**

| Block | Purpose | Key Fields |
|---|---|---|
| **Teks** | Rich text | WYSIWYG content (headings, bold, italic, lists, links) |
| **Gambar** | Single image | upload/URL, alt text, link, width/height |
| **Gambar & Teks** | Image + text combo | image, rich text, layout (left/right), vertical alignment |
| **Tombol** | Button | text, URL, style (primary/secondary/outline), size, full-width, icon |
| **Pemisah** | Divider | style (line/dots/space/gradient), color, width, thickness |
| **Running Text** | Marquee | text, speed, direction, pause-on-hover |
| **Logo Media** | As seen on | heading, logos[] (3/10, image + URL), layout, grayscale toggle |
| **Animasi** | Lottie animation | category picker, size, speed, 9 color presets + custom |
| **Embed** | Iframe | URL, height, responsive toggle, border toggle |

### ⭐ NEW: Lapak Exclusive Blocks (Not in Djualan)

| Block | Purpose | Key Fields |
|---|---|---|
| **Reviews** ⭐ | Product/store reviews | heading, source (manual/auto), items[] {name, rating, text, avatar, date, product}, filter by rating, sort (newest/highest), min display count, "Write a review" CTA |
| **Navigation** ⭐ | Site nav bar | logo, links[] {text, url, children[]}, sticky toggle, transparent toggle, mobile hamburger |
| **Footer** ⭐ | Site footer | columns[] {title, links[]}, social links[], copyright, payment method logos |

---
