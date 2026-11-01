# 🛒 Kasir Saya (Kios Bu Sribekti)

> **Aplikasi Kasir (Point of Sale) Modern Berbasis Web dengan Arsitektur Offline-First, Role-Based Access Control, dan Dashboard Analitik.**

---

## 🌟 Tentang Proyek

**Kasir Saya** adalah aplikasi kasir (*Point of Sale / POS*) modern yang dikembangkan untuk mendukung operasional retail UMKM (Kios Bu Sribekti). Aplikasi ini dirancang dengan prinsip **Offline-First**, memastikan kasir dapat melayani transaksi, mencari barang, menghitung kembalian, dan mencetak struk secara andal dan cepat tanpa ketergantungan koneksi internet.

Seluruh data produk, riwayat transaksi, dan akun pengguna disimpan dan dikelola langsung pada browser menggunakan **IndexedDB** (`idb`).

---

## ✨ Fitur Utama

- **⚡ Offline-First Architecture**: Aplikasi tetap berjalan 100% tanpa jaringan internet; data transaksi tersimpan aman di IndexedDB lokal.
- **🛒 Manajemen Kasir & Transaksi Cepat**:
  - Pencarian produk *real-time* dan filter kategori.
  - Dukungan produk varian (misal: eceran vs dus).
  - Shortcut keyboard kasir:
    - `F2`: Fokus cepat ke pencarian barang.
    - `F9`: Buka modal pembayaran / checkout.
  - Validasi pembayaran otomatis dan perhitungan uang kembalian.
  - Cetak struk belanja (*receipt print* & download struk).
- **🔐 Role-Based Access Control (RBAC)**:
  - **Admin**: Akses penuh ke Dashboard Analitik, Manajemen Produk, Riwayat Transaksi, Laporan Penjualan, dan Manajemen Pengguna.
  - **Kasir**: Akses terfokus pada Transaksi Kasir dan Riwayat Penjualan.
- **📊 Dashboard Analitik Admin**:
  - Ringkasan omzet hari ini, jumlah transaksi, rata-rata belanja, dan produk terlaris.
  - Timeline aktivitas transaksi terkini.
- **📦 Manajemen Produk (Katalog)**:
  - Tambah, edit, dan hapus produk (single item atau multi-varian).
  - Validasi harga dan kategori.
- **👥 Manajemen Pengguna**:
  - Admin dapat menambahkan akun kasir baru serta mengatur hak akses.
- **🎨 UI/UX Modern & Responsif**:
  - Desain elegan dengan *glassmorphism*, aksen warna harmonis, *slide-up snackbar notifications*, dan *collapsible sidebar*.

---

## 🔑 Akun Bawaan (Default Credentials)

Saat pertama kali dibuka, sistem otomatis melakukan *seeding* akun bawaan:

| Role | Username | Password | Hak Akses |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin` | `admin123` | Full Access (Dashboard, Produk, Riwayat, Laporan, User) |
| **Kasir** | `kasir` | `kasir123` | Limited Access (Kasir & Riwayat) |

---

## 🛠️ Tech Stack

- **Frontend Framework**: [React 19](https://react.dev/)
- **Build Tool**: [Vite](https://vite.dev/)
- **Database & Storage**: [IndexedDB via idb](https://github.com/jakearchibald/idb), LocalStorage
- **Icons**: [Lucide React](https://lucide.dev/)
- **Styling**: Modern CSS3 (CSS Variables, Flexbox, CSS Grid, Glassmorphism)
- **Struk & Gambar**: [html2canvas](https://html2canvas.hertzen.com/)

---

## 🚀 Cara Menjalankan Secara Lokal

1. **Clone repository ini**:
   ```bash
   git clone https://github.com/giovani18/kasir-saya.git
   cd kasir-saya
   ```

2. **Install dependensi**:
   ```bash
   npm install
   ```

3. **Jalankan development server**:
   ```bash
   npm run dev
   ```

4. **Buka di peramban**:
   Akses `http://localhost:5173` pada browser Anda.

---

## 📁 Struktur Direktori

```text
kasir-saya/
├── public/              # Aset statis publik
├── src/
│   ├── assets/          # Logo & aset gambar
│   ├── components/      # Komponen layout (Sidebar, Toast)
│   ├── pages/           # Halaman (Cashier, Dashboard, Product, History, Report, Users, Login)
│   ├── stores/          # AppContext (Global State & Actions)
│   ├── utils/           # Database (IndexedDB), Auth, Formatting, Printing
│   ├── App.jsx          # Root component & routing
│   └── main.jsx         # Entry point
├── index.html           # HTML template
├── package.json
└── vite.config.js
```

---

## 📄 Lisensi

Proyek ini dibuat untuk keperluan portofolio dan operasional kasir UMKM. Bebas dikembangkan lebih lanjut.
