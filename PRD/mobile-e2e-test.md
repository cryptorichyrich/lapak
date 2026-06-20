# Lapak — Mobile E2E Test Scenarios
> Task 5.12 | Mobile Chrome + Safari, touch interactions

## Test Devices
| Device | Browser | Resolution |
|--------|---------|------------|
| iPhone 15 | Safari | 390×844 |
| Samsung Galaxy S24 | Chrome | 412×915 |
| iPhone SE | Safari | 375×667 |

## Scenarios

### 1. Storefront — Product Browsing
- [ ] Infinite scroll produk berfungsi (touch swipe)
- [ ] Gambar produk lazy-load saat scroll
- [ ] Tombol "Tambah ke Keranjang" touch target ≥ 48px
- [ ] Filter produk bisa dibuka/tutup dengan tap
- [ ] Tidak ada horizontal scroll (semua konten ≤ viewport width)

### 2. Cart & Checkout
- [ ] Keranjang bisa diakses dari bottom nav
- [ ] Input jumlah produk menggunakan numeric keyboard
- [ ] Form checkout tidak terpotong (semua field visible)
- [ ] Pemilihan metode pembayaran dengan tap
- [ ] Notifikasi zoom tidak terblokir (viewport meta)

### 3. Studio — Seller Dashboard
- [ ] Sidebar bisa ditutup dengan swipe/gesture
- [ ] Form produk menyesuaikan lebar mobile
- [ ] Upload gambar dari gallery/kamera
- [ ] Block editor touch-friendly
- [ ] Tombol aksi (simpan/publikasi) accessible

### 4. Cross-cutting
- [ ] Font terbaca tanpa zoom (min 16px body)
- [ ] Warna kontras cukup (teks ≥ 4.5:1)
- [ ] Tidak ada popup yang tidak bisa ditutup
- [ ] Loading spinner tampil saat fetch data
- [ ] Error state ditampilkan dengan jelas
