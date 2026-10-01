# 🚀 SIMKUR — Panduan Deployment & Pemeliharaan

> **Sistem Informasi Manajemen Kurikulum SMKN 1 Banjarmasin**  
> Versi: 1.1.0 · Update: 30 September 2026  
> Target: Raspberry Pi 4 (aaPanel) · VPS Sekolah (Nginx/Apache)

---

## 📋 Daftar Isi

1. [Gambaran Arsitektur](#arsitektur)
2. [Prasyarat](#prasyarat)
3. [Struktur File Deployment](#struktur-file)
4. [Step 1 — Buat Database MySQL](#step-1--buat-database-mysql)
5. [Step 2 — Buat Website di aaPanel](#step-2--buat-website-di-aapanel)
6. [Step 3 — Upload & Ekstrak File](#step-3--upload--ekstrak-file)
7. [Step 4 — Konfigurasi API](#step-4--konfigurasi-api)
8. [Step 5 — Import Skema Database](#step-5--import-skema-database)
9. [Step 6 — Test & Verifikasi](#step-6--test--verifikasi)
10. [Upload Foto Jurnal & Dokumen](#upload-foto-dokumen)
11. [Deploy ke VPS Sekolah (Admin Web)](#deploy-vps)
12. [Cara Update Versi Baru](#cara-update)
13. [Cara Update Data Guru dari Excel](#cara-update-data-guru)
14. [Cara Build Ulang ZIP Deployment](#build-ulang)
15. [Troubleshooting](#troubleshooting)
16. [Referensi File & Endpoint API](#referensi-file)

---

## Arsitektur

### Sebelum (Firebase)
```
Browser (HTML/JS) ←──────────────→ Firebase Firestore (Google Cloud)
                  ←── cache ──→   localStorage
```

### Sesudah (Pi4 Lokal)
```
Browser (HTML/JS) ←── HTTP/REST ──→ PHP API (aaPanel/Nginx)
                                          │
                                    MySQL/MariaDB (Pi4)
```

### Keuntungan Migrasi ke Pi4

| Aspek | Firebase | Pi4 Lokal |
|-------|----------|-----------|
| Biaya | Gratis (limit) / berbayar | ✅ Gratis selamanya |
| Koneksi Internet | Wajib | ✅ Tidak perlu |
| Kecepatan | Latency Google Server | ✅ Lokal, sangat cepat |
| Privasi Data | Data di server Google | ✅ Data di sekolah sendiri |
| Kontrol Penuh | Terbatas | ✅ Penuh |

---

## Prasyarat

Pastikan sudah tersedia di Raspberry Pi 4:

- [x] **aaPanel** terinstall dan bisa diakses di `http://IP-PI:8888`
- [x] **Nginx** sudah diinstall via aaPanel
- [x] **PHP 8.x** sudah diinstall via aaPanel (App Store → PHP)
- [x] **MySQL/MariaDB** sudah diinstall via aaPanel (App Store → MySQL)
- [x] **phpMyAdmin** sudah diinstall (opsional, untuk manajemen database via GUI)

> **Cari IP Raspberry Pi:** URL aaPanel Anda biasanya `http://192.168.1.xxx:8888`  
> IP tersebut adalah IP Pi4 Anda di jaringan lokal.

---

## Struktur File

Isi file ZIP deployment (`simkur-deploy-YYYYMMDD-HHMMSS.zip`):

```
simkur/
├── index.html               ← Halaman utama (dashboard waka, dll)
├── login.html               ← Halaman login
│
├── css/
│   ├── styles.css           ← Stylesheet utama
│   └── tokens.css           ← Design tokens (warna, font)
│
├── js/
│   ├── api-service.js       ← ⭐ Pengganti firebase-service.js
│   ├── firebase-service.js  ← Disimpan sebagai referensi
│   ├── auth_users.js        ← Master data 81 pengguna (guru)
│   ├── data.js              ← Master data (77 guru, kelas, mapel, dll)
│   ├── app.js               ← Logika utama aplikasi
│   └── security-guard.js   ← Proteksi keamanan
│
├── assets/
│   ├── logo.svg
│   ├── logo-white.svg
│   └── teacher_avatar.jpg
│
├── api/                     ← ⭐ Backend PHP REST API (BARU)
│   ├── config.php           ← Konfigurasi koneksi database
│   ├── crud.php             ← Handler CRUD semua collection
│   └── health.php           ← Endpoint cek status API
│
└── database/
    └── simkur_schema.sql    ← ⭐ Skema 16 tabel MySQL (BARU)
```

---

## Step 1 — Buat Database MySQL

1. Buka aaPanel di browser: `http://IP-PI:8888`
2. Klik menu **"Database"** di sidebar kiri
3. Klik tombol **"Add Database"**
4. Isi form:

   | Field | Nilai |
   |-------|-------|
   | Database Name | `simkur_db` |
   | Username | `simkur_user` |
   | Password | *(buat password kuat, **catat!**)* |
   | Access | `localhost` |

5. Klik **Submit**

> ⚠️ **Catat password-nya!** Akan dibutuhkan di Step 4.

---

## Step 2 — Buat Website di aaPanel

1. aaPanel → klik **"Website"** di sidebar
2. Klik **"Add Site"**
3. Isi form:

   | Field | Nilai |
   |-------|-------|
   | Domain | IP Pi4 Anda (misal: `192.168.1.100`) atau `simkur.local` |
   | Root Directory | `/www/wwwroot/simkur` |
   | PHP Version | **PHP 8.x** ← harus PHP, bukan Pure Static! |
   | Database | Pilih `simkur_db` (yang dibuat di Step 1) |

4. Klik **Submit**

> 💡 **Kenapa harus PHP?** Karena folder `api/` berisi file `.php` untuk REST API.

---

## Step 3 — Upload & Ekstrak File

### Upload ZIP

1. aaPanel → **"Files"** (File Manager)
2. Navigasi ke `/www/wwwroot/simkur/`
3. **Hapus** file `index.html` default bawaan aaPanel
4. Klik tombol **"Upload"**
5. Pilih file ZIP dari laptop Anda:
   ```
   simkur-deploy-YYYYMMDD-HHMMSS.zip
   ```
6. Tunggu upload selesai

### Ekstrak

1. Di File Manager, **klik kanan** pada file ZIP
2. Pilih **"Extract"** (Ekstrak)
3. Pastikan diekstrak ke: `/www/wwwroot/simkur/`
4. Setelah selesai, **hapus file ZIP** (klik kanan → Delete)

### Verifikasi Struktur

Pastikan isi folder seperti ini:
```
/www/wwwroot/simkur/
├── index.html       ✅
├── login.html       ✅
├── css/             ✅
├── js/              ✅
├── assets/          ✅
├── api/             ✅
│   ├── config.php
│   ├── crud.php
│   └── health.php
└── database/        ✅
    └── simkur_schema.sql
```

---

## Step 4 — Konfigurasi API

> ⚠️ **Langkah ini wajib** sebelum API bisa bekerja.

1. Di File Manager, buka folder `api/`
2. Klik file **`config.php`** → klik **"Edit"**
3. Cari dan ubah baris ini:

```php
define('DB_USER', 'simkur_user');        // ← sesuaikan jika beda
define('DB_PASS', 'GANTI_PASSWORD_INI'); // ← isi password dari Step 1
```

4. Klik **"Save"**

Contoh setelah diisi:
```php
define('DB_HOST', 'localhost');
define('DB_NAME', 'simkur_db');
define('DB_USER', 'simkur_user');
define('DB_PASS', 'P@ssw0rdKuat2026!'); // ← password Anda
define('DB_CHARSET', 'utf8mb4');
```

---

## Step 5 — Import Skema Database

### Via phpMyAdmin (Direkomendasikan)

1. aaPanel → **"Database"** → klik tombol **"phpMyAdmin"**
2. Login jika diminta
3. Di panel kiri, klik database **`simkur_db`**
4. Klik tab **"Import"** di menu atas
5. Klik **"Choose File"** → pilih file dari server:
   `/www/wwwroot/simkur/database/simkur_schema.sql`
6. Klik tombol **"Go"** / **"Import"**
7. Tunggu hingga selesai

**Hasil yang diharapkan:** Muncul **16 tabel** baru:

| Tabel | Isi |
|-------|-----|
| `teachers` | Master data guru |
| `classes` | Master rombel/kelas |
| `subjects` | Master mata pelajaran |
| `rooms` | Master ruang |
| `schedules` | Jadwal pelajaran |
| `agendas` | Agenda kurikulum |
| `documents` | Dokumen kurikulum |
| `teacher_admin` | Status administrasi guru |
| `guru_journals` | Jurnal mengajar |
| `guru_documents` | Upload dokumen guru |
| `guru_attendance` | Absensi kehadiran guru |
| `supervisi_program` | Program supervisi |
| `supervisi_sesi` | Sesi supervisi |
| `supervisi_rtl` | Rencana tindak lanjut |
| `supervisi_manajerial` | Supervisi manajerial |
| `users` | Referensi auth (opsional) |

### Via Terminal aaPanel (Alternatif)

1. aaPanel → **"Terminal"**
2. Jalankan:

```bash
mysql -u simkur_user -p simkur_db < /www/wwwroot/simkur/database/simkur_schema.sql
# Masukkan password saat diminta
```

---

## Step 6 — Test & Verifikasi

### Test API Health Check

Buka di browser dari perangkat yang terhubung jaringan yang sama:

```
http://IP-PI/api/health.php
```

Response sukses:
```json
{
  "success": true,
  "message": "API berjalan normal",
  "data": {
    "api": "ok",
    "database": "connected",
    "tables": ["agendas", "classes", "documents", ...],
    "record_counts": { "agendas": 0, "teachers": 0 }
  }
}
```

### Test Aplikasi

```
http://IP-PI/
```

### Checklist Final

- [ ] `http://IP-PI/api/health.php` → `"database": "connected"`
- [ ] `http://IP-PI/` → halaman login SIMKUR muncul
- [ ] Login berhasil dengan NIP guru
- [ ] Data guru ter-load di dashboard
- [ ] Tombol Sinkronisasi berfungsi (upload data lokal ke MySQL Pi4)

---

## Cara Update Data Guru

Jika ada perubahan SK Pembagian Tugas (guru baru, wali kelas baru, dll):

### 1. Siapkan File Excel SK Baru

File Excel harus memiliki sheet:
- **`tugas guru 2026-perbaikan`** — data tugas mengajar (Lampiran 1)
- **`Lamp.2 Wl KLs`** — data wali kelas (Lampiran 2)
- **`Lamp.3 Tgs tambahan lain`** — tugas tambahan (Lampiran 3)

### 2. Jalankan Script Update di Laptop

```bash
cd /Users/icangzakki/GAWIANKU/SIMKUR

# Install dependency jika belum ada
pip3 install openpyxl

# Letakkan file Excel di folder project, lalu jalankan script
# (script akan otomatis baca file Excel dan update auth_users.js & data.js)
```

### 3. Build Ulang ZIP & Upload ke Pi4

```bash
bash scripts/build-deploy.sh
```

Upload ZIP baru ke aaPanel → ekstrak → selesai.

---

## Build Ulang

Jalankan di terminal laptop setiap ada perubahan kode:

```bash
bash /Users/icangzakki/GAWIANKU/SIMKUR/scripts/build-deploy.sh
```

Script otomatis akan:
- Bersihkan ZIP lama
- Buat ZIP baru dengan timestamp
- Tampilkan daftar isi dan ukuran file

File ZIP tersimpan di: `/Users/icangzakki/GAWIANKU/SIMKUR/`

---

## Troubleshooting

| Masalah | Penyebab | Solusi |
|---------|----------|--------|
| `health.php` → `"database": "error"` | Password salah di `config.php` | Edit `api/config.php`, sesuaikan `DB_PASS` |
| `SQLSTATE[HY000] [2002] No such file or directory` | PHP mencari Unix socket di `/var/run/mysqld/mysqld.sock`, sedangkan MySQL aaPanel ada di `/tmp/mysql.sock` atau `DB_HOST` masih `localhost` | **Solusi 1:** Edit `api/config.php` ubah `DB_HOST` dari `'localhost'` jadi `'127.0.0.1'`<br>**Solusi 2:** Di Terminal aaPanel ketik: `ln -sf /tmp/mysql.sock /var/run/mysqld/mysqld.sock` |
| Halaman 403 Forbidden | Permission salah | Terminal aaPanel: `chmod -R 755 /www/wwwroot/simkur/` |
| Halaman kosong / PHP error | PHP belum install atau versi salah | aaPanel App Store → install PHP 8.x, lalu set ke website |
| CSS/JS tidak load (404) | File tidak ter-ekstrak dengan benar | Cek di File Manager, pastikan `css/` dan `js/` ada langsung di root `simkur/` |
| Login SIMKUR gagal | NIP tidak terdaftar | Cek NIP di `js/auth_users.js`, buka Console browser (F12) |
| Data kosong setelah login | Database MySQL masih kosong | Login → buka menu Sinkronisasi → klik "Upload ke Server" |
| Upload ZIP gagal (file terlalu besar) | Limit upload PHP | aaPanel → PHP Settings → ubah `upload_max_filesize` ke `50M` |

---

## Referensi File

| File | Lokasi | Fungsi |
|------|--------|--------|
| `api/config.php` | `/www/wwwroot/simkur/` | Koneksi database — **edit password di sini** |
| `api/crud.php` | `/www/wwwroot/simkur/` | REST API CRUD untuk semua collection |
| `api/health.php` | `/www/wwwroot/simkur/` | Cek status API & database |
| `js/api-service.js` | `/www/wwwroot/simkur/` | Pengganti firebase-service.js |
| `js/auth_users.js` | `/www/wwwroot/simkur/` | Master 81 pengguna (dari SK 2026/2027) |
| `js/data.js` | `/www/wwwroot/simkur/` | Master data 77 guru, kelas, mapel |
| `database/simkur_schema.sql` | `/www/wwwroot/simkur/` | Skema 16 tabel MySQL |
| `scripts/build-deploy.sh` | Laptop | Script build ZIP deployment |

## Endpoint API

Base URL: `http://IP-PI/api/`

| Method | Endpoint | Fungsi |
|--------|----------|--------|
| `GET` | `health.php` | Cek status API & database |
| `GET` | `crud.php?collection=teachers` | Ambil semua data guru |
| `GET` | `crud.php?collection=teachers&id=T-001` | Ambil satu guru by ID |
| `POST` | `crud.php?collection=teachers` | Simpan/update (body: JSON) |
| `DELETE` | `crud.php?collection=teachers&id=T-001` | Hapus data |

**Collection yang tersedia:**
`teachers` · `classes` · `subjects` · `rooms` · `schedules` · `agendas` · `documents` · `teacher_admin` · `guru_journals` · `guru_documents` · `guru_attendance` · `supervisi_program` · `supervisi_sesi` · `supervisi_rtl` · `supervisi_manajerial`

---

## Upload Foto Jurnal & Dokumen

Dengan storage 128GB di Pi4, semua foto jurnal dan dokumen guru tersimpan langsung di server.

### Alur Upload Foto Jurnal KBM

```
Guru ambil foto / pilih galeri
        ↓
compressImage() → otomatis kompres ~80KB
        ↓
Jurnal disimpan lokal dulu (UI langsung responsif)
        ↓  (background, tidak blokir guru)
uploadPhoto() → kirim ke api/upload.php di Pi4
        ↓
Foto disimpan ke /uploads/jurnal/2026/09/
        ↓
URL foto disimpan ke MySQL (bukan base64 besar)
```

### Struktur Folder Upload di Pi4

```
/www/wwwroot/simkur/uploads/
├── jurnal/
│   └── 2026/09/              ← foto KBM per bulan
│       ├── jurnal_T001_abc.jpg
│       └── jurnal_T002_def.jpg
├── dokumen/
│   └── 2026/09/              ← RPP, Modul Ajar, Silabus, Asesmen
│       ├── dokumen_T001_xyz.pdf
│       └── dokumen_T002_uvw.docx
└── supervisi/
    └── 2026/09/              ← foto bukti supervisi
```

### Jenis File yang Didukung

| Tipe | Format | Keterangan |
|------|--------|------------|
| Foto Jurnal | `.jpg`, `.png`, `.webp` | Dikompresi otomatis sebelum upload |
| Dokumen Ajar | `.pdf`, `.doc`, `.docx` | RPP, Modul Ajar, Silabus |
| Data | `.xls`, `.xlsx` | Instrumen Asesmen, nilai |
| Maks ukuran | 5MB | Per file (foto jurnal biasanya <200KB) |

### ⚠️ Permission Folder Upload — Wajib!

Setelah ekstrak ZIP, jalankan di terminal aaPanel:

```bash
chmod -R 755 /www/wwwroot/simkur/uploads/
chown -R www:www /www/wwwroot/simkur/uploads/
```

Tanpa ini PHP tidak bisa menyimpan file ke folder `uploads/`.

### Cara Preview & Download Dokumen

| Kondisi file | Yang terjadi di browser |
|-------------|------------------------|
| PDF di Pi4 (`/uploads/...pdf`) | Preview inline (iframe) |
| Gambar di Pi4 (`/uploads/...jpg`) | Tampil sebagai gambar |
| Word/Excel di Pi4 | Tombol Download otomatis |
| Google Drive link | Buka tab baru |
| Base64 (mode offline) | Download dari memori |

---

## Deploy ke VPS Sekolah (Admin Web)

ZIP yang sama bisa digunakan di Pi4 lokal **dan** VPS sekolah.
Admin web cukup mengubah **satu baris** di `api/config.php`.

### Perbandingan Pi4 vs VPS

| Aspek | 🍓 Pi4 Anda (aaPanel) | 🌐 VPS Admin Web |
|-------|----------------------|------------------|
| Akses | WiFi sekolah saja | Internet, dari mana saja |
| Domain | `192.168.x.x` | `simkur.smkn1bjm.sch.id` |
| Panel | aaPanel | Nginx / Apache / cPanel |
| Database | MySQL lokal | MySQL di VPS |
| `SERVER_MODE` | `'pi4'` | `'vps'` |
| Data | Terpisah | Terpisah |

### Yang Dikirim ke Admin Web

Kirim **1 file saja:**
```
simkur-deploy-YYYYMMDD-HHMMSS.zip
```

SQL schema sudah ada di dalam ZIP di `database/simkur_schema.sql`.

### Instruksi untuk Admin Web VPS

**1. Ekstrak ZIP ke web root VPS:**
```bash
unzip simkur-deploy-*.zip -d /var/www/simkur/
```

**2. Buat database MySQL di VPS:**
```sql
CREATE DATABASE simkur_db CHARACTER SET utf8mb4;
CREATE USER 'simkur_user'@'localhost' IDENTIFIED BY 'buatpassword';
GRANT ALL ON simkur_db.* TO 'simkur_user'@'localhost';
```

**3. Import skema database (sudah ada di ZIP):**
```bash
mysql -u simkur_user -p simkur_db < /var/www/simkur/database/simkur_schema.sql
```

**4. Edit `api/config.php` — 3 baris ini saja:**
```php
define('SERVER_MODE', 'vps');           // ← ganti dari 'pi4' ke 'vps'
define('DB_USER', 'simkur_user');
define('DB_PASS', 'password_yang_dibuat');
// Jika web root berbeda dari /var/www/simkur/, ganti ke 'custom'
```

**5. Set permission folder uploads:**
```bash
mkdir -p /var/www/simkur/uploads
chmod -R 755 /var/www/simkur/uploads
chown -R www-data:www-data /var/www/simkur/uploads  # Nginx
# atau: chown -R apache:apache /var/www/simkur/uploads  # Apache
```

**6. Test:**
```
https://domain-sekolah.sch.id/api/health.php
→ harus muncul: "database": "connected"
```

> ⚠️ **Data Pi4 dan VPS terpisah.** Keduanya database MySQL independen. Jika diperlukan sinkronisasi data, hubungi pengembang.

---

## Cara Update Versi Baru

Setiap ada perubahan fitur, perbaikan bug, atau pembaruan kode, Anda dapat melakukan update dengan sangat mudah.

---

### 🌟 METODE 1: Update via Git (Paling Cepat & Praktis — Direkomendasikan ⭐)

Karena server Pi 4 sudah terhubung langsung ke repository GitHub SIMKUR, alur update hanya butuh 2 langkah sederhana:

#### 1. Di Laptop Anda (setelah selesai edit kode):
Buka terminal di folder project lalu jalankan:
```bash
cd /Users/icangzakki/GAWIANKU/SIMKUR
git add .
git commit -m "Deskripsi perubahan/fitur baru"
git push origin main
```

#### 2. Di Raspberry Pi 4 (Terminal aaPanel atau SSH):
Buka terminal aaPanel lalu cukup jalankan:
```bash
cd /www/wwwroot/simkur
git pull
```
> Selesai! Semua file kode terbaru langsung diterapkan di server dalam hitungan detik.

#### 🛡️ Mengapa Metode Git Aman?
- **Password DB Aman:** File `api/config.php` sudah diset `assume-unchanged` di Pi 4, sehingga kredensial database lokal tidak akan pernah tertimpa oleh GitHub.
- **File Upload Aman:** Folder `uploads/` (foto KBM guru, file RPP, PDF modul) tidak terpengaruh oleh Git.
- **Database MySQL Aman:** Data absensi, jurnal, agenda, dan administrasi guru tersimpan di MariaDB/MySQL dan tidak tersentuh.

---

### 📦 METODE 2: Update via ZIP & Script Otomatis (Alternatif Offline/Manual)

Jika tidak ingin menggunakan Git pull di server:

#### 1. Di Laptop:
```bash
cd /Users/icangzakki/GAWIANKU/SIMKUR
bash scripts/build-deploy.sh
# Menghasilkan file: simkur-deploy-YYYYMMDD-HHMMSS.zip
```

#### 2. Di Pi 4 (via aaPanel):
1. Buka aaPanel → menu **Files** → buka `/www/wwwroot/simkur/`.
2. Klik **Upload** → upload file ZIP hasil build tadi.
3. Buka menu **Terminal** di aaPanel, lalu jalankan:
   ```bash
   cd /www/wwwroot/simkur
   bash scripts/update-simkur.sh simkur-deploy-*.zip
   ```
4. Ketik `y` untuk konfirmasi. Script akan mengekstrak file baru, melindungi `uploads/`, memulihkan `config.php`, dan merapikan izin akses file secara otomatis.
| ② | Ekstrak ZIP baru ke folder sementara |
| ③ | **Hapus** `config.php` & `uploads/` dari ekstrak |
| ④ | Salin file baru ke web root |
| ⑤ | **Restore** `config.php` backup |
| 🧹 | Bersihkan folder sementara |

### Yang AMAN (tidak pernah tertimpa)

- ✅ `api/config.php` — password DB tetap
- ✅ `uploads/jurnal/` — semua foto KBM guru
- ✅ `uploads/dokumen/` — RPP, Modul Ajar, Silabus
- ✅ Database MySQL — data tidak terhapus

### Yang DIUPDATE setiap versi baru

- 🔄 `index.html`, `login.html` — tampilan & fitur baru
- 🔄 `css/`, `js/` — perbaikan bug, fitur baru
- 🔄 `api/crud.php`, `upload.php`, `health.php`

> 💡 Jika ada **perubahan struktur database** (kolom baru, tabel baru), akan disertakan file `database/update_vX.sql` yang dijalankan sekali secara manual. Data lama **tidak akan hilang**.

---

*Dokumentasi SIMKUR · SMKN 1 Banjarmasin · TP 2026/2027*
