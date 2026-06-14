## 9. User Flows

### Flow 1: Sign Up & Onboard
```
1. Visit lapak.id → "Mulai Gratis"
2. Sign up (email + password OR Google OR magic link)
3. Enter business name: "Toko Vavelle"
4. Auto-generate slug: "toko-vavelle" → toko-vavelle.lapak.id
5. Pick template (Food Stall / Fashion Store / General / Blank)
6. Template pre-fills: homepage blocks + theme + sample products
7. Land in editor → customize → publish
8. Store live at toko-vavelle.lapak.id
```

### Flow 1b: Magic Link Login (Passwordless)
```
1. User visits login page → taps "Kirim Magic Link"
2. Frontend calls POST /api/auth/magic-link { email }
3. Supabase sends email with one-click login link
4. User clicks link in email → Supabase verifies → redirects to storefront/callback
5. Callback handler extracts tokens → sets session cookies (lapak_session + lapak_refresh)
6. User lands on dashboard, fully authenticated — no password needed
7. Session valid for 1 hour (JWT expiry), refresh token auto-rotates for 7 days
```

### Flow 2: Edit Page (Free user)
```
1. Dashboard → Pages → "Home"
2. Block editor loads
3. Click Hero block → right panel shows: title, subtitle, CTA
4. Edit "Pesan via WhatsApp" → saves automatically
5. Click "+ Add Block" → pick Product Grid → configure
6. Preview (mobile/desktop toggle)
7. Publish → rebuild triggered → live in ~2 min
```

### Flow 3: Customer Buys (Starter/Pro only)
```
1. Visit toko-vavelle.lapak.id
2. Browse products → Add to cart (React island)
3. Cart slide-out → "Checkout"
4. Checkout form: name, phone, full address
5. Choose shipping: JNE REG/YES, J&T, SiCepat (auto-calculated via Everpro)
6. [VOUCHER] Tap "Pakai Voucher" → shows available vouchers from this seller
   - Vouchers auto-filtered: minimum order met, not expired, still has quota
   - Buyer taps one → discount applied instantly
   - No code typing — just tap to select (Tokopedia style)
7. Choose payment: QRIS / VA / e-wallet
8. Click "Bayar" → Edge Function creates Xendit invoice on tenant's sub-account
9. Redirect to Xendit payment page
10. Pay → Xendit webhook → order.status = 'paid'
11. Shipment created via Everpro → tracking number assigned
12. Tenant gets notification (dashboard + WhatsApp)
13. Customer sees order confirmation page with tracking
```

### Flow 4: Free User Wants Checkout (Upgrade)
```
1. Free user adds products, builds pages
2. Tries to enable checkout → modal: "Upgrade to Starter"
3. Pricing page: Rp 99.000/mo
4. Pay via QRIS (recursive — we use Xendit to accept our own payments)
5. Plan upgraded → Xendit sub-account auto-created for tenant
6. Checkout + shipping unlocked
```

### Flow 5: Custom Domain (Starter/Pro)
```
1. Settings → Domain → "tokovavelle.com"
2. Instructions shown: "Add CNAME: tokovavelle.com → toko-vavelle.lapak.id"
3. Tenant updates DNS at their registrar
4. Our Cloudflare proxy detects → provisions SSL
5. Store accessible at tokovavelle.com
```

### Flow 6: Buyer Tracks Order (no auth)
```
OPTION A — Tracking link (from order confirmation)
1. Buyer receives: "Track pesanan: tokovavelle.lapak.id/track/a3f8b2c1-..."
2. GET /api/track/{tracking_token} → order detail (status, items, timeline)
3. No login required — tracking_token is unguessable UUID

OPTION B — Phone lookup (Indonesian-friendly)
1. Buyer visits toko-vavelle.lapak.id → "Lacak Pesanan"
2. Enters phone number: 081234567890
3. POST /api/storefront/toko-vavelle/track { phone: "081234567890" }
4. Returns ALL orders for that phone at that shop
5. Buyer taps order → redirect to /track/{tracking_token}

What buyer sees:
- Order number (ORD-20260613-001)
- Status badge with timeline (pending → paid → shipped → delivered)
- Items: product name, price, qty, subtotal
- Total paid
- Shipping address
- Tracking number + courier name (if shipped)
- Seller's WhatsApp number (from tenant_settings.wa_number)

What buyer CANNOT see:
- Other buyers' orders
- Seller's internal notes (seller_notes)
- Other shops' orders
```

---
