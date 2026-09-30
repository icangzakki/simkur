# 📦 SIMKUR — Panduan Deploy untuk Admin Web VPS

> **Sistem Informasi Manajemen Kurikulum SMKN 1 Banjarmasin**  
> Dokumen ini khusus untuk Admin Web yang menerima file ZIP dari pengembang.  
> Versi: 1.1.0 · 30 September 2026

---

## Prasyarat di VPS

Pastikan VPS sudah terinstall:

| Kebutuhan | Versi Minimum | Cara Cek |
|-----------|--------------|----------|
| PHP | 7.4+ | `php -v` |
| MySQL / MariaDB | 5.7+ | `mysql --version` |
| Web server | Nginx / Apache | `nginx -v` |
| Ekstensi PHP | `pdo_mysql`, `fileinfo` | `php -m` |

---

## File yang Diterima

```
simkur-deploy-YYYYMMDD-HHMMSS.zip
```

Isi ZIP:

```
├── index.html, login.html       ← halaman web
├── css/, js/, assets/           ← tampilan & logika
├── api/
│   ├── config.php               ← ⚠️ EDIT FILE INI SAJA
│   ├── crud.php                 ← REST API (jangan diubah)
│   ├── upload.php               ← handler upload foto/dokumen
│   └── health.php               ← cek status server
├── uploads/README.md            ← folder placeholder
├── database/
│   └── simkur_schema.sql        ← skema 16 tabel MySQL
└── scripts/
    └── update-simkur.sh         ← script update versi berikutnya
```

---

## Langkah Deploy (Pertama Kali)

### Langkah 1 — Upload & Ekstrak ZIP

```bash
# Dari laptop: upload ZIP ke VPS
scp simkur-deploy-*.zip root@IP-VPS:/var/www/

# SSH ke VPS
ssh root@IP-VPS

# Buat folder dan ekstrak
mkdir -p /var/www/simkur
unzip simkur-deploy-*.zip -d /var/www/simkur/
```

> Jika web root VPS berbeda (contoh `/var/www/html/simkur/`), sesuaikan path di atas dan di langkah selanjutnya.

---

### Langkah 2 — Buat Database MySQL

```bash
mysql -u root -p
```

```sql
CREATE DATABASE simkur_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'simkur_user'@'localhost' IDENTIFIED BY 'PASSWORD_KUAT_ANDA';
GRANT ALL PRIVILEGES ON simkur_db.* TO 'simkur_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

> Catat username dan password — dipakai di Langkah 4.

---

### Langkah 3 — Import Skema Database

```bash
mysql -u simkur_user -p simkur_db < /var/www/simkur/database/simkur_schema.sql
```

Verifikasi (harus muncul 16 tabel):

```bash
mysql -u simkur_user -p simkur_db -e "SHOW TABLES;"
```

```
agendas, classes, documents, guru_attendance, guru_documents,
guru_journals, rooms, schedules, subjects, supervisi_manajerial,
supervisi_program, supervisi_rtl, supervisi_sesi,
teacher_admin, teachers, users
```

---

### Langkah 4 — Edit Konfigurasi (SATU FILE SAJA)

```bash
nano /var/www/simkur/api/config.php
```

Ubah bagian ini:

```php
// ← Ganti 'pi4' menjadi 'vps'
define('SERVER_MODE', 'vps');

// ← Isi dengan kredensial MySQL yang dibuat tadi
define('DB_NAME', 'simkur_db');
define('DB_USER', 'simkur_user');
define('DB_PASS', 'PASSWORD_KUAT_ANDA');  // ← WAJIB diubah!

// Opsional: batasi akses ke domain sekolah saja
// define('CORS_ORIGIN', 'https://simkur.smkn1bjm.sch.id');
```

Simpan: `Ctrl+O` → Enter → `Ctrl+X`

> **Jika web root VPS berbeda dari `/var/www/simkur/`**, ganti `SERVER_MODE` ke `'custom'`
> dan tambahkan:
> ```php
> define('UPLOAD_BASE_DIR', '/path/aktual/simkur/uploads/');
> define('UPLOAD_BASE_URL', '/uploads/');
> ```

---

### Langkah 5 — Konfigurasi Nginx

```bash
nano /etc/nginx/sites-available/simkur
```

Isi dengan konfigurasi berikut:

```nginx
server {
    listen 80;
    server_name simkur.smkn1bjm.sch.id;  # ← ganti domain/IP VPS Anda

    root /var/www/simkur;
    index index.html;

    # File statik
    location / {
        try_files $uri $uri/ /index.html;
    }

    # PHP API
    location /api/ {
        location ~ \.php$ {
            include snippets/fastcgi-php.conf;
            fastcgi_pass unix:/run/php/php8.1-fpm.sock; # sesuaikan versi PHP
        }
    }

    # Folder upload (foto & dokumen guru)
    location /uploads/ {
        alias /var/www/simkur/uploads/;
    }

    # Keamanan
    location ~ /\.         { deny all; }
    location ~ /database/  { deny all; }
    location ~ /scripts/   { deny all; }

    client_max_body_size 10M;
}
```

Aktifkan:

```bash
ln -s /etc/nginx/sites-available/simkur /etc/nginx/sites-enabled/
nginx -t && systemctl reload nginx
```

> **Jika pakai Apache**, buat `/var/www/simkur/.htaccess`:
> ```apache
> RewriteEngine On
> RewriteCond %{REQUEST_FILENAME} !-f
> RewriteCond %{REQUEST_FILENAME} !-d
> RewriteRule ^ index.html [L]
> php_value upload_max_filesize 10M
> php_value post_max_size 10M
> ```

---

### Langkah 6 — Set Permission Folder Upload

```bash
mkdir -p /var/www/simkur/uploads
chmod -R 755 /var/www/simkur/uploads
chown -R www-data:www-data /var/www/simkur/uploads   # untuk Nginx
# chown -R apache:apache /var/www/simkur/uploads     # untuk Apache
```

> ⚠️ Tanpa ini, upload foto jurnal dan dokumen guru akan **gagal**.

---

### Langkah 7 — Test & Verifikasi

```bash
# Cek API dari terminal VPS
curl http://localhost/api/health.php
```

Response sukses:

```json
{
  "success": true,
  "message": "API SIMKUR berjalan normal",
  "database": "connected",
  "server_mode": "vps"
}
```

Lalu buka di browser:

```
http://IP-VPS/api/health.php   → pastikan "database": "connected"
http://IP-VPS/                 → harus muncul halaman login SIMKUR
```

---

### Langkah 8 — HTTPS / SSL (Sangat Dianjurkan)

```bash
apt install certbot python3-certbot-nginx -y
certbot --nginx -d simkur.smkn1bjm.sch.id
certbot renew --dry-run   # verifikasi auto-renew
```

---

## Cara Update Versi Baru

Saat pengembang mengirim ZIP baru:

```bash
# 1. Upload ZIP baru ke VPS
scp simkur-deploy-BARU.zip root@IP-VPS:/var/www/simkur/

# 2. SSH ke VPS
ssh root@IP-VPS

# 3. Jalankan script update — config.php & uploads/ TIDAK tertimpa
bash /var/www/simkur/scripts/update-simkur.sh /var/www/simkur/simkur-deploy-BARU.zip
```

Yang **AMAN** (tidak pernah tertimpa saat update):

- ✅ `api/config.php` — password DB tetap tersimpan
- ✅ `uploads/jurnal/` — semua foto KBM guru
- ✅ `uploads/dokumen/` — RPP, Modul Ajar, Silabus
- ✅ Database MySQL — data tidak terhapus

---

## Troubleshooting

| Masalah | Penyebab | Solusi |
|---------|----------|--------|
| `500 Error` di `/api/` | PHP-FPM tidak jalan | `systemctl status php8.1-fpm` |
| `"database": "error"` | Password DB salah | Cek `api/config.php` DB_PASS |
| Upload gagal | Permission uploads/ | `chmod 755 uploads/ && chown www-data uploads/` |
| Halaman 404 | Nginx belum aktif | `nginx -t && systemctl reload nginx` |
| `UPLOAD_BASE_DIR` error | Web root berbeda | Ganti ke `SERVER_MODE = 'custom'` |

**Cek log:**

```bash
tail -50 /var/log/nginx/error.log
tail -50 /var/log/php8.1-fpm.log
```

---

## Kontak Pengembang

Jika ada pertanyaan atau masalah teknis:

> **Pengembang SIMKUR — SMKN 1 Banjarmasin**  
> Sistem Informasi Manajemen Kurikulum  
> Tahun Pelajaran 2026/2027

---

*Dokumen ini dikirim bersama file `simkur-deploy-YYYYMMDD.zip`*
