# Lapak — E2E Smoke Test Plan
> Task 5.11 | End-to-end buyer journey verification

## Test Flow: Pembeli Lengkap

### 1. Signup (Penjual Baru)
- [ ] Buka https://lapak-studio.pages.dev
- [ ] Klik "Daftar" → masukkan nomor WhatsApp
- [ ] Verifikasi OTP → isi nama toko, kategori
- [ ] Selesai onboarding → diarahkan ke dashboard

### 2. Onboarding
- [ ] Upload logo toko
- [ ] Isi informasi toko (deskripsi, alamat, jam operasional)
- [ ] Setup rekening bank untuk penarikan
- [ ] Status: "Toko Aktif"

### 3. Produk
- [ ] Buat produk baru: nama, harga, deskripsi, foto
- [ ] Atur stok dan variasi (ukuran/warna)
- [ ] Publikasikan produk
- [ ] Cek produk muncul di halaman toko

### 4. Browsing (Pembeli)
- [ ] Buka https://lapak-storefront.fxwisdom1.workers.dev
- [ ] Cari produk berdasarkan kata kunci
- [ ] Filter berdasarkan kategori/harga
- [ ] Buka halaman detail produk

### 5. Cart
- [ ] Tambahkan produk ke keranjang
- [ ] Ubah jumlah produk
- [ ] Lihat ringkasan keranjang
- [ ] Hapus produk dari keranjang

### 6. Checkout
- [ ] Klik "Checkout" dari keranjang
- [ ] Masukkan nomor WhatsApp pembeli
- [ ] Pilih metode pembayaran (VA/QRIS/E-Wallet)
- [ ] Konfirmasi pesanan
- [ ] Dapatkan nomor VA / kode QR
- [ ] Simulasikan pembayaran sukses (sandbox)

### 7. Webhook
- [ ] Verifikasi webhook Xendit diterima API
- [ ] Status pesanan berubah ke "paid"
- [ ] Penjual mendapat notifikasi email (jika 3.25 aktif)

### 8. Order Management (Penjual)
- [ ] Buka dashboard pesanan di Studio
- [ ] Lihat detail pesanan baru
- [ ] Konfirmasi pesanan → status "confirmed"
- [ ] Update status ke "shipped" dengan nomor resi

### 9. Tracking (Pembeli)
- [ ] Buka halaman tracking dengan token
- [ ] Lihat status pesanan real-time
- [ ] Lihat estimasi pengiriman

## Expected Results
- Semua langkah berhasil tanpa error
- UI responsif di mobile dan desktop
- Tidak ada redirect ke domain eksternal (white-label)
- Data konsisten di semua tampilan
