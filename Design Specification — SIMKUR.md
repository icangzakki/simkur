# Design Specification — SIMKUR

## 1. Identitas Produk

**SIMKUR — Portal Kurikulum Sekolah** adalah aplikasi untuk Waka Kurikulum dan administrasi sekolah. SIMKUR mengelola dokumen kurikulum, jadwal pelajaran, data master sekolah, agenda kurikulum, dan monitoring kelengkapan administrasi guru.

SIMKUR adalah aplikasi terpisah dari SINTESA. Dokumen ini hanya membahas pengalaman pengguna, visual, navigasi, dan fitur SIMKUR.

## 2. Prinsip Desain

- Tepercaya, rapi, dan berorientasi administrasi sekolah.
- Dashboard menampilkan konteks tahun ajaran, sekolah, dan role.
- Tabel administratif tetap mudah digunakan di mobile.
- Aksi penting tersedia melalui quick actions.
- Status dokumen dan administrasi terlihat melalui chip, teks, ikon, dan progress.
- Role Waka Kurikulum, Guru, dan Admin memiliki menu yang sesuai.

## 3. Branding dan Visual

Gunakan identitas utama:

> SIMKUR  
> Portal Kurikulum Sekolah

Nama sekolah dan role pengguna menjadi informasi sekunder di header. SINTESA tidak menjadi bagian dari branding utama SIMKUR. Jika Portal Guru KBM dibuka, SINTESA dapat disebut sebagai aplikasi terpisah pada card integrasi.

### Warna

| Token | Nilai | Penggunaan |
|---|---|---|
| `simkur-navy` | `#123B66` | Logo, sidebar, header |
| `simkur-blue` | `#2563A6` | CTA, link, active state |
| `soft-blue` | `#EAF4FF` | Selected card, informasi |
| `success` | `#1F9D68` | Lengkap, aktif, tersinkron |
| `warning` | `#E89B2C` | Perlu review, deadline dekat |
| `danger` | `#D9535F` | Error, terlambat, nonaktif |
| `background` | `#F4F7FA` | Background halaman |
| `surface` | `#FFFFFF` | Card, tabel, modal |
| `text-primary` | `#172B4D` | Heading dan body |
| `text-secondary` | `#6B7A90` | Metadata dan helper text |

Gunakan Inter, SF Pro, atau sans-serif modern setara. Radius card 16–20 px, padding mobile 20–24 px, spacing kelipatan 4 px, dan target sentuh minimal 44 × 44 px.

## 4. Login SIMKUR

Halaman login dapat mempertahankan pola dua panel yang sudah digunakan.

### Panel Hero

- Logo `SIMKUR 2026`.
- Subjudul `Portal Kurikulum Sekolah`.
- Deskripsi tentang dokumen, jadwal, dan data master.
- Tiga metrik ringkas: guru aktif, siswa, dan rombel.
- Background navy/blue dengan ilustrasi administrasi sekolah yang ringan.

### Panel Form

- Heading `Selamat Datang, Rekan Guru`.
- Searchable teacher selector.
- Filter departemen atau jurusan.
- Avatar inisial setiap profil guru.
- Field password tampil setelah profil dipilih.
- CTA `Masuk sebagai [nama]`.
- Link `Lupa kata sandi?` dan `Ganti kata sandi`.

Pada layar kecil, gunakan search dan filter agar seluruh daftar guru tidak tampil sekaligus. NIP menjadi metadata sekunder. Password default tidak boleh ditampilkan pada production.

State login: default, focus, loading, kredensial salah, profil tidak tersedia, sesi berakhir, koneksi gagal, dan retry.

## 5. Dashboard Waka Kurikulum

### Header

Header menampilkan greeting, role `Waka Kurikulum`, nama sekolah, selector tahun ajaran aktif seperti `TA 2026/2027`, status sinkronisasi, notifikasi, avatar, dan menu akun.

### KPI Cards

1. **Jumlah Siswa** — total aktif dan jumlah rombel.
2. **Jumlah Guru** — guru dan tenaga kependidikan aktif.
3. **Jumlah Kelas** — distribusi tingkat X, XI, dan XII.
4. **Dokumen Kurikulum** — jumlah dokumen dan item yang perlu diperbarui.

### Operasional Hari Ini

Tampilkan dua panel utama: **Jadwal Pelajaran Hari Ini** dan **Agenda Kurikulum**. Pada desktop panel berdampingan; pada mobile bertumpuk. Jadwal mempunyai date strip, filter rombel, timeline jam, mata pelajaran, guru, dan ruang. Agenda mencakup rapat, supervisi, deadline unggah, dan revisi dokumen.

### Quick Actions

- Upload Dokumen.
- Tambah Jadwal.
- Tambah Guru.
- Tambah Kelas.
- Buka Portal Guru KBM.

## 6. Navigasi SIMKUR

Desktop memakai sidebar dengan kelompok:

1. **Ringkasan:** Dashboard.
2. **Administrasi Kurikulum:** Dokumen & Administrasi.
3. **Operasional Sekolah:** Jadwal Pelajaran dan Data Master.
4. **Pembelajaran:** Portal Guru KBM.
5. **Pengaturan.**

Mobile memakai bottom navigation `Dashboard`, `Dokumen`, `Jadwal`, dan `Menu`. Data Master, Portal Guru, dan Pengaturan berada di menu sekunder.

## 7. Dokumen & Administrasi

Sediakan search dan filter tahun ajaran, kategori, status, pemilik, serta departemen. Kategori meliputi KSP, Modul Ajar, Silabus, Administrasi Guru, Asesmen, dan Lainnya.

Document row menampilkan nama dokumen, kategori, tahun ajaran, pemilik, tanggal pembaruan, status verifikasi, preview, download, dan edit. Status utama adalah Lengkap, Sedang Review, dan Belum Mengumpulkan.

Upload menggunakan drag-and-drop di desktop dan file picker besar di mobile. Form memiliki validasi ukuran/format file, progress upload, retry, dan notifikasi berhasil.

## 8. Jadwal Pelajaran

Sediakan mode `Timeline`, `Agenda`, dan `Table`. Timeline menampilkan jam, kelas, mata pelajaran, guru, dan ruang. Agenda menampilkan jadwal per hari untuk layar kecil. Filter mencakup rombel, guru, mata pelajaran, ruang, hari, dan tahun ajaran.

Gunakan warna kategori sebagai indikator tambahan dan selalu tampilkan informasi inti sebagai teks.

## 9. Data Master

Pisahkan Data Master menjadi tab:

- Guru & Tenaga Kependidikan.
- Kelas / Rombel.
- Mata Pelajaran.
- Ruang Belajar.

Setiap tab mempunyai search, filter status aktif/nonaktif, import, export, dan CTA tambah data. Form modal memiliki label konsisten, helper text, validasi inline, konfirmasi perubahan status nonaktif, dan ringkasan sebelum submit.

## 10. Monitoring Administrasi Guru

Tampilkan avatar, nama, departemen/mapel, progress kelengkapan dokumen, status jurnal mengajar bulan berjalan, status silabus/ATP, status instrumen asesmen, dan catatan supervisi.

Filter: Lengkap, Perlu Review, dan Belum Mengumpulkan. Pengurutan dapat berdasarkan deadline atau persentase kelengkapan. Progress bar menampilkan persentase serta label teks.

## 11. Portal Guru KBM

Portal Guru KBM adalah integrasi terpisah, bukan modul siswa SIMKUR. Gunakan card penghubung:

> Kelola jurnal mengajar, bahan ajar, presensi, tugas, dan ujian melalui Portal Guru KBM.

CTA: `Buka Portal Guru` dan `Lihat Aktivitas Terakhir`. Jika autentikasi terpadu belum tersedia, tampilkan interstitial yang menjelaskan perpindahan aplikasi sebelum membuka portal.

## 12. Interaksi dan UX States

Gunakan tap feedback ringan, transition sederhana, snackbar untuk aksi berhasil, confirmation sheet untuk aksi penting, dan progress upload. Hormati `prefers-reduced-motion`.

Setiap layar harus memiliki loading skeleton, empty state, error state, offline state, dan success feedback. Contoh empty state: `Belum ada dokumen. Upload dokumen pertama untuk memulai administrasi.`

## 13. Accessibility, Permission, dan Keamanan

Semua icon button memiliki accessible label. Input memakai label, bukan placeholder saja. Focus state harus terlihat. Tabel memiliki versi card atau scroll horizontal di mobile.

Data guru, siswa, NIP, dokumen, dan jadwal dibatasi berdasarkan role, sekolah, dan tahun ajaran. Aksi upload, hapus, ubah status, dan logout harus memberikan feedback yang jelas. Password default tidak boleh ditampilkan pada production.

## 14. Data Minimum

### Dokumen

`id`, `title`, `category`, `academicYearId`, `ownerId`, `fileUrl`, `reviewStatus`, `notes`, `updatedAt`.

### Jadwal

`id`, `day`, `startTime`, `endTime`, `classId`, `subjectId`, `teacherId`, `roomId`, `academicYearId`.

### Data Master

Guru, kelas/rombel, mata pelajaran, ruang, status aktif/nonaktif, dan relasi sekolah.

### Agenda

`id`, `title`, `date`, `description`, `type`, `academicYearId`, `createdBy`.

## 15. Tahap Implementasi

### Tahap 1 — Visual Foundation

Terapkan token warna, radius, spacing, typography, button, card, form input, modal, status chip, loading state, dan responsive layout. Rapikan login menjadi dua panel yang nyaman di mobile.

### Tahap 2 — Dashboard dan Navigasi

Refactor dashboard menjadi KPI, jadwal, agenda, quick action, selector tahun ajaran, dan status sinkronisasi. Buat sidebar desktop serta bottom navigation mobile.

### Tahap 3 — Modul Operasional

Redesain Dokumen & Administrasi dengan filter dan status, Jadwal dengan timeline/agenda responsif, Data Master dengan tab dan validasi, serta monitoring administrasi guru dengan progress.

### Tahap 4 — Integrasi Portal Guru

Tambahkan card Portal Guru KBM, sediakan perpindahan aplikasi yang jelas, dan gunakan role-aware navigation. SINTESA tetap menjadi aplikasi terpisah.

## 16. Acceptance Criteria

- Pengguna memahami bahwa SIMKUR adalah portal kurikulum, bukan portal siswa SINTESA.
- Login menampilkan role, sekolah, dan profil pengguna dengan jelas.
- Dashboard menunjukkan KPI, jadwal, agenda, dan quick action dalam satu tampilan.
- Tahun ajaran selalu terlihat pada konteks data.
- Dokumen, jadwal, dan data master dapat dicari serta difilter.
- Semua status memiliki label teks dan tidak bergantung pada warna saja.
- Layout nyaman pada ponsel Android dengan koneksi tidak stabil.
- Setiap modul memiliki loading, empty, error, success, dan offline state.
