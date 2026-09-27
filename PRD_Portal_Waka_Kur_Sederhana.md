# PRD — Web Portal Waka Kur SMK (Versi Sederhana)

## 1. Ringkasan Produk

**Nama:** Portal Waka Kur SMK  
**Versi:** MVP / Versi 1  
**Tujuan:** Membantu Waka Kur mengelola informasi dasar kurikulum, dokumen, dan jadwal pelajaran dalam satu web sederhana.

Portal ini **bukan aplikasi akademik lengkap**. Fokusnya hanya pada pekerjaan administrasi dasar Waka Kur.

---

## 2. Tujuan Utama

Portal membantu Waka Kur untuk:

1. Melihat ringkasan kondisi sekolah.
2. Menyimpan dan mengelola dokumen kurikulum secara digital.
3. Membuat dan mengelola jadwal pelajaran.
4. Mengelola data dasar yang diperlukan untuk jadwal.

---

## 3. Target Pengguna

### Pengguna utama
**Waka Kurikulum**

Dapat:
- Melihat dashboard.
- Mengelola dokumen.
- Mengelola jadwal.
- Mengelola data guru, kelas, mata pelajaran, dan ruang.

### Admin
Pada MVP, admin dapat menggunakan hak akses yang sama dengan Waka Kur.

> Sistem multi-role yang kompleks tidak diperlukan pada versi pertama.

---

# 4. Scope MVP

Portal hanya memiliki **4 menu utama**:

```text
Dashboard
Dokumen
Jadwal Pelajaran
Data Master
```

---

# 5. Dashboard

## Tujuan

Memberikan informasi penting secara cepat tanpa laporan yang rumit.

## Komponen

### Statistik

Tampilkan 4 kartu:

- Jumlah Siswa
- Jumlah Guru
- Jumlah Kelas
- Jumlah Dokumen

Contoh:

```text
┌────────────┐ ┌────────────┐ ┌────────────┐ ┌────────────┐
│ 1.245      │ │ 85         │ │ 36         │ │ 128        │
│ Siswa      │ │ Guru       │ │ Kelas      │ │ Dokumen    │
└────────────┘ └────────────┘ └────────────┘ └────────────┘
```

### Jadwal Hari Ini

Menampilkan jadwal berdasarkan hari berjalan.

Kolom:

- Jam
- Kelas
- Mata Pelajaran
- Guru
- Ruang

### Agenda Sederhana

Opsional pada MVP:

- Nama agenda
- Tanggal

Contoh:

```text
30 September 2026 — Rapat Kurikulum
5 Oktober 2026 — Asesmen
```

---

# 6. Modul Dokumen

## Tujuan

Menjadi arsip digital sederhana untuk dokumen kurikulum.

## Fitur

### Upload Dokumen

Input:

- File
- Nama dokumen
- Kategori
- Tahun ajaran
- Keterangan

### Kategori

Gunakan kategori sederhana:

```text
KSP
Modul Ajar
Silabus
Administrasi Guru
Asesmen
Lainnya
```

### Daftar Dokumen

Tampilkan:

| Field | Keterangan |
|---|---|
| Nama | Nama dokumen |
| Kategori | Kategori dokumen |
| Tahun | Tahun ajaran |
| Tanggal Upload | Waktu upload |
| Aksi | Download / Edit / Hapus |

### Fitur yang wajib

- Upload
- Search
- Filter kategori
- Filter tahun
- Download
- Edit metadata
- Hapus

### Catatan

File disimpan pada **Supabase Storage**.

Database hanya menyimpan metadata dan lokasi file.

---

# 7. Modul Jadwal Pelajaran

## Tujuan

Menyimpan jadwal pelajaran sekolah secara sederhana.

## Data Jadwal

Setiap jadwal memiliki:

```text
Hari
Jam Mulai
Jam Selesai
Kelas
Mata Pelajaran
Guru
Ruang
```

## CRUD

Waka Kur dapat:

- Tambah jadwal
- Lihat jadwal
- Edit jadwal
- Hapus jadwal

## Tampilan

### Tampilan Mingguan

```text
Senin

07.30 - 09.00
X TKJ 1 | Informatika | Budi | Lab 1

09.00 - 10.30
X TKJ 1 | Matematika | Ani | R. 5
```

### Filter

Sediakan:

- Hari
- Kelas
- Guru

## Tidak termasuk MVP

Tidak perlu membuat algoritma penyusunan jadwal otomatis.

Tidak perlu otomatis mencari jadwal bentrok.

Jika terjadi bentrok, Waka Kur mengatur secara manual.

---

# 8. Data Master

Data master digunakan sebagai sumber pilihan ketika membuat jadwal.

## 8.1 Guru

Field:

```text
ID
Nama Guru
NIP/NIK (opsional)
Status Aktif
```

Fitur:

- Tambah
- Edit
- Hapus
- Search

## 8.2 Kelas

Field:

```text
ID
Nama Kelas
Tingkat
Program Keahlian
Status Aktif
```

Contoh:

```text
X TKJ 1
X TKJ 2
XI TKJ 1
XII TKJ 1
```

## 8.3 Mata Pelajaran

Field:

```text
ID
Nama Mata Pelajaran
Kode (opsional)
Status Aktif
```

## 8.4 Ruang

Field:

```text
ID
Nama Ruang
Keterangan (opsional)
Status Aktif
```

---

# 9. Struktur Menu

```text
Portal Waka Kur

├── Dashboard
├── Dokumen
├── Jadwal Pelajaran
└── Data Master
    ├── Guru
    ├── Kelas
    ├── Mata Pelajaran
    └── Ruang
```

Tidak perlu sidebar dengan terlalu banyak menu.

---

# 10. Database Sederhana

Jika menggunakan Supabase, gunakan tabel berikut:

```text
teachers
classes
subjects
rooms
schedules
documents
```

## teachers

```text
id
name
nip
is_active
created_at
```

## classes

```text
id
name
grade
major
is_active
created_at
```

## subjects

```text
id
name
code
is_active
created_at
```

## rooms

```text
id
name
description
is_active
created_at
```

## schedules

```text
id
day
start_time
end_time
class_id
subject_id
teacher_id
room_id
created_at
```

Relasi:

```text
schedules
   ├── class_id → classes
   ├── subject_id → subjects
   ├── teacher_id → teachers
   └── room_id → rooms
```

## documents

```text
id
name
category
school_year
description
file_name
file_path
file_size
uploaded_at
```

---

# 11. Teknologi

Rekomendasi:

```text
Frontend
React + Vite

UI
Tailwind CSS

Icon
Lucide React

Backend
Supabase

Database
PostgreSQL

File Storage
Supabase Storage

Chart
Tidak wajib pada MVP
```

Tidak perlu membuat backend server sendiri.

---

# 12. Desain UI

Gunakan gaya dashboard modern dan sederhana.

### Warna

Primary:

```text
#4B22B8
```

Background:

```text
#F6F6F8
```

Card:

```text
#FFFFFF
```

Text:

```text
#262626
```

### Karakter desain

- Clean
- Minimal
- Banyak whitespace
- Card rounded
- Shadow lembut
- Sidebar sederhana
- Responsive
- Mudah digunakan oleh pengguna non-teknis

---

# 13. Halaman Login

MVP cukup menggunakan:

```text
Email
Password
Login
```

Menggunakan **Supabase Authentication**.

Tidak perlu:

- Registrasi publik
- Social login
- OTP
- Multi-role kompleks

Akun pengguna dibuat oleh administrator.

---

# 14. Alur Penggunaan

## Login

```text
Login
 ↓
Dashboard
```

## Upload Dokumen

```text
Dokumen
 ↓
Upload
 ↓
Isi metadata
 ↓
Pilih file
 ↓
Simpan
 ↓
Dokumen muncul di daftar
```

## Membuat Jadwal

```text
Jadwal
 ↓
Tambah Jadwal
 ↓
Pilih hari
 ↓
Pilih jam
 ↓
Pilih kelas
 ↓
Pilih mata pelajaran
 ↓
Pilih guru
 ↓
Pilih ruang
 ↓
Simpan
```

---

# 15. Acceptance Criteria

## Dashboard

- [ ] Dashboard dapat dibuka setelah login.
- [ ] Jumlah guru tampil.
- [ ] Jumlah kelas tampil.
- [ ] Jumlah dokumen tampil.
- [ ] Jadwal hari ini tampil.

## Dokumen

- [ ] User dapat upload file.
- [ ] User dapat melihat daftar dokumen.
- [ ] User dapat mencari dokumen.
- [ ] User dapat filter kategori.
- [ ] User dapat download dokumen.
- [ ] User dapat mengubah metadata.
- [ ] User dapat menghapus dokumen.

## Jadwal

- [ ] User dapat menambah jadwal.
- [ ] User dapat melihat jadwal.
- [ ] User dapat mengedit jadwal.
- [ ] User dapat menghapus jadwal.
- [ ] User dapat filter berdasarkan kelas.
- [ ] User dapat filter berdasarkan guru.
- [ ] Jadwal hari berjalan dapat dilihat dari Dashboard.

## Data Master

- [ ] CRUD Guru.
- [ ] CRUD Kelas.
- [ ] CRUD Mata Pelajaran.
- [ ] CRUD Ruang.

---

# 16. Di Luar Scope MVP

Agar proyek tetap sederhana, fitur berikut **jangan dibuat dulu**:

- Absensi siswa
- Absensi guru
- Nilai siswa
- Rapor
- BK
- PKL
- E-learning
- Perpustakaan
- Inventaris
- Presensi
- Dapodik
- Sinkronisasi sistem eksternal
- WhatsApp notification
- Penyusunan jadwal otomatis
- Deteksi bentrok otomatis
- Mobile application
- Multi-school
- Multi-role kompleks
- Payroll
- Keuangan sekolah

---

# 17. Prioritas Pengembangan

## Tahap 1 — Fondasi

```text
Supabase
Authentication
Database
Layout Dashboard
Sidebar
```

## Tahap 2 — Data Master

```text
Guru
Kelas
Mata Pelajaran
Ruang
```

## Tahap 3 — Jadwal

```text
CRUD Jadwal
Filter
Tampilan mingguan
```

## Tahap 4 — Dokumen

```text
Upload
Storage
Daftar dokumen
Download
Edit metadata
Delete
```

## Tahap 5 — Dashboard

```text
Statistik
Jadwal hari ini
Agenda sederhana
```

---

# 18. Definisi Selesai MVP

MVP dianggap selesai apabila Waka Kur dapat melakukan pekerjaan berikut tanpa menggunakan spreadsheet terpisah:

1. Login ke portal.
2. Melihat jumlah guru, kelas, dan dokumen.
3. Menambahkan data guru.
4. Menambahkan data kelas.
5. Menambahkan mata pelajaran.
6. Menambahkan ruang.
7. Membuat jadwal pelajaran.
8. Mengubah dan menghapus jadwal.
9. Melihat jadwal berdasarkan kelas/guru/hari.
10. Mengupload dokumen kurikulum.
11. Mencari dan memfilter dokumen.
12. Mendownload dokumen.

---

# 19. Prinsip Utama Produk

> **Sederhana, cepat, dan benar-benar membantu pekerjaan Waka Kur.**

Jangan membuat fitur hanya karena bisa dibuat.

Setiap fitur harus menjawab salah satu dari tiga kebutuhan:

```text
Mengelola Dokumen
        +
Mengelola Jadwal
        +
Melihat Informasi Penting
```

Dengan prinsip tersebut, Portal Waka Kur tetap kecil, mudah dikembangkan, dan tidak berubah menjadi sistem akademik sekolah yang terlalu kompleks.
