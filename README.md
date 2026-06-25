# Isikuy — Aplikasi PPOB (Pulsa, Kuota, Token PLN, E-Wallet, Top Up Game)

Aplikasi web siap pakai untuk simulasi layanan isi pulsa, paket data, token listrik PLN,
top up e-wallet, top up game, BPJS, PDAM, dan TV kabel — lengkap dengan beragam metode
pembayaran (saldo aplikasi, Virtual Account bank, e-wallet, QRIS, gerai retail, kartu debit/kredit).

## Cara menjalankan

Paling sederhana — tinggal buka `index.html` langsung di browser (perlu koneksi internet
karena React, Babel, dan font dimuat dari CDN).

Atau jalankan local server supaya lebih stabil:

```bash
cd isikuy-app
python3 -m http.server 8000
```

Lalu buka `http://localhost:8000` di browser.

## Yang sudah ada di dalamnya

- **Dashboard saldo** dengan saldo bisa disembunyikan/ditampilkan
- **8 kategori layanan**: Pulsa, Paket Data, Token PLN, E-Wallet, Top Up Game, BPJS, PDAM, TV Kabel
- **Deteksi otomatis operator** dari nomor HP (Telkomsel, XL, Indosat, Tri, Axis, Smartfren)
- **6 e-wallet**: GoPay, OVO, DANA, ShopeePay, LinkAja, i.saku
- **6 game populer**: Mobile Legends, Free Fire, PUBG Mobile, Genshin Impact, Valorant, Call of Duty Mobile
- **14 metode pembayaran** dalam 6 kelompok: Saldo aplikasi, Virtual Account (BCA/BRI/BNI/Mandiri/Permata),
  E-Wallet, QRIS, Gerai retail (Alfamart/Indomaret), Kartu debit/kredit
- **Struk digital** setiap transaksi (bisa diunduh & dibagikan secara simulasi)
- **Riwayat transaksi** dengan filter status (berhasil/diproses/gagal)
- **Cek tagihan** untuk BPJS, PDAM, dan TV kabel sebelum bayar
- **Kontak cepat** untuk isi ulang nomor favorit
- Tampilan mobile-first, responsif, dark theme

## Catatan penting — ini simulasi front-end

Aplikasi ini berjalan sepenuhnya di browser memakai data tiruan (`localStorage`/state React),
**belum** terhubung ke:

- Payment gateway sungguhan (Midtrans, Xendit, DOKU, dll) untuk memproses VA/QRIS/e-wallet asli
- Provider/aggregator PPOB sungguhan (Digiflazz, Vipreseller, dll) untuk pengisian pulsa/token/voucher game asli
- Backend/database untuk menyimpan akun pengguna, saldo, dan riwayat secara permanen

### Langkah lanjutan untuk jadi aplikasi produksi

1. **Backend & database** — buat API (Node.js/Express, Laravel, atau lainnya) + database
   (PostgreSQL/MySQL) untuk akun pengguna, saldo, dan riwayat transaksi yang persisten.
2. **Integrasi payment gateway** — daftar ke Midtrans/Xendit untuk VA, QRIS, e-wallet, dan kartu.
   Mereka menyediakan SDK dan dokumentasi lengkap untuk redirect/callback pembayaran.
3. **Integrasi PPOB/H2H** — daftar ke aggregator seperti Digiflazz atau VIPReseller untuk daftar
   harga real-time dan API pengisian produk (pulsa, token, voucher game) ke nomor tujuan.
4. **Autentikasi pengguna** — tambahkan login (OTP SMS/WhatsApp atau email) dan keamanan PIN transaksi.
5. **Keamanan** — semua kunci API harus disimpan di server (bukan di kode front-end), gunakan HTTPS,
   dan validasi setiap transaksi di sisi server sebelum saldo berubah.

File `app.js` sudah disusun modular (per kategori layanan jadi komponen sendiri) sehingga
mudah disambungkan satu per satu ke API sungguhan tanpa mengubah struktur besar.
