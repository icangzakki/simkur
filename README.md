# SIMKUR — Sistem Informasi Manajemen Kurikulum SMK

[![Status](https://img.shields.io/badge/Status-Production%20Ready-brightgreen)](https://github.com/icangzakki/simkur)
[![Version](https://img.shields.io/badge/Version-3.3.0-blue)](https://github.com/icangzakki/simkur)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![SMK Bisa](https://img.shields.io/badge/SMK-Bisa%20Hebat-orange)](https://smkn1bjm.sch.id)

> **SIMKUR** adalah Portal Digitalisasi Terpadu Manajemen Kurikulum SMK yang dirancang khusus untuk memenuhi kebutuhan tata kelola kurikulum modern, selaras dengan **Permendikbudristek No. 12/2024** dan **Permendikdasmen No. 13/2025**.

---

## 🚀 Fitur Unggulan

### 1. 📅 Jadwal PTM Anti-Bentrok (Intelligent Conflict Detector)
* **Real-time Conflict Checking**: Deteksi instan bentrok jadwal pada 3 parameter kritis: **Guru**, **Ruangan Lab/Teori**, dan **Rombel/Kelas**.
* **Filter Interaktif**: Matrix jadwal per tingkat (X, XI, XII), per jurusan/program keahlian, dan jadwal personal guru.
* **Akses Khusus Waka Kurikulum**: Panel penyusunan jadwal terpusat untuk menjaga konsistensi jam mengajar (JJM).

### 2. 🏢 Monitoring & Manajemen PKL (Praktik Kerja Lapangan)
* **Scope Otomatis per Jurusan**:
  * **Kajur DKV**: Hanya menampilkan siswa DKV, rombel XII DKV 1 & 2, serta DUDI mitra DKV.
  * **Kajur TJKT**: Filter otomatis siswa TJKT, rombel XII TJKT 1 & 2, serta DUDI jaringan/telekomunikasi.
  * **Kajur AKL, MPLB, & Pemasaran**: Tampilan otomatis terisolasi sesuai program keahlian masing-masing.
  * **Waka Kurikulum / Admin**: Monitoring menyeluruh (360+ siswa, 80+ mitra DUDI).
* **Tracking Penempatan**: Lokasi DUDI mitra, kontak person, guru pembimbing sekolah, dan instruktur industri.

### 3. 📊 Manajemen Penilaian & Analitik CBT
* **Impor Data Nilai JSON/CBT**: Rekapitulasi nilai ujian berbasis komputer dengan filter kelas dan mata pelajaran yang diampu.
* **Ketercapaian CP**: Visualisasi progress Capaian Pembelajaran (Tercapai, Intervensi Khusus, Pengayaan).
* **Export Rekapitulasi**: Ekspor rekap nilai semester dan nilai uji kompetensi ke format PDF / Spreadsheet.

### 4. 📁 Perangkat Pembelajaran & e-Verifikasi
* Pengumpulan dan validasi digital Modul Ajar, Alur Tujuan Pembelajaran (ATP), dan Program Tahunan/Semester.
* Status verifikasi berjenjang: *Draft*, *Revisi*, *Disetujui Waka Kurikulum*.

### 5. 👥 Role-Based Access Control (RBAC) Multilevel
* **Waka Kurikulum** (Full Administrative Access & Approval)
* **Kepala Sekolah** (Executive Monitoring & Laporan Supervisi)
* **Ketua Jurusan / Kajur** (Manajemen PKL & Verifikasi Perangkat Jurusan)
* **Guru Mata Pelajaran** (Portal Pribadi: Jadwal, Upload Perangkat, Input Nilai)
* **Asesor Industri / DUDI** (Validasi Portofolio PKL & Uji Sertifikasi)
* **Admin / Operator TU** (Master Data Siswa, Guru, & Rombel)

---

## 🛠️ Arsitektur & Teknologi

* **Frontend**: HTML5 Semantik, CSS3 Modern (Custom CSS Design System, Responsive, Mobile-friendly), Vanilla JavaScript ES6+.
* **Database**: MySQL 8.0 / MariaDB 10.11 (`database/simkur_db.sql`).
* **Deployment Ready**: Terkonfigurasi untuk Vercel (`vercel.json`), Netlify, Cloudflare Pages, GitHub Pages, maupun Web Server Tradisional (Apache/Nginx/aaPanel).

---

## 📂 Struktur Direktori

```text
SIMKUR/
├── index.html                           # Halaman Utama Aplikasi Portal SIMKUR
├── login.html                           # Autentikasi Pengguna & Switcher Multi-Role
├── vercel.json                          # Konfigurasi Security Headers & Routing Vercel
├── package.json                         # Manifest Proyek
├── css/                                 # Style Sheet Desain Antarmuka
├── js/
│   ├── app.js                           # Logika Inti Aplikasi, Navigasi, RBAC & PKL Filter
│   ├── data.js                          # Mock Data Master (Guru, Siswa, DUDI, Jadwal)
│   └── auth_users.js                    # Database Akun Pengguna & Autentikasi Demo
├── assets/                              # Aset Gambar, Logo, & Ikon
├── database/
│   └── simkur_db.sql                    # Skema Database Relasional MySQL & Seed Data
└── DOKUMENTASI-LENGKAP-SIMKUR-2026.md   # Buku Petunjuk Teknis & Standar Operasional
```

---

## ⚡ Panduan Menjalankan Secara Lokal

1. **Clone Repositori**:
   ```bash
   git clone https://github.com/icangzakki/simkur.git
   cd simkur
   ```

2. **Jalankan Web Server Lokal**:
   * Menggunakan Python:
     ```bash
     python3 -m http.server 8000
     ```
   * Menggunakan PHP:
     ```bash
     php -S localhost:8000
     ```
   * Menggunakan Live Server di VS Code: klik kanan `login.html` atau `index.html` → **Open with Live Server**.

3. **Buka di Peramban**:
   Akses `http://localhost:8000/login.html`

---

## 🔐 Akun Demo Akses Cepat

| Role / Jabatan | Nama Pengguna | NIP / Akun Login | Password Default |
|---|---|---|---|
| **Waka Kurikulum** | Rusnani | `19730802 200012 2 003` | `password` / `123456` |
| **Kepala Sekolah** | Agustin Purnomosari | `3153750649300003` | `password` / `123456` |
| **Kajur TJKT** | Muhammad Ihsan | `19880110 202221 1 001` | `password` / `123456` |
| **Kajur DKV** | Hendra Surya Pratama | `19930516 202221 1 001` | `password` / `123456` |
| **Guru Pengajar** | Ahmad Gajali | `19890609 202521 1 023` | `password` / `123456` |
| **Admin TU** | Andry Dharmawan | `8554762663130202` | `password` / `123456` |

---

## 📄 Lisensi & Hak Cipta

Dikembangkan untuk **SMKN 1 Banjarmasin** © 2026. Seluruh hak cipta dilindungi.
# simkur
# simkur
