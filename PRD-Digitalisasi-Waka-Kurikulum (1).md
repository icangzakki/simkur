# Product Requirements Document (PRD)
# Sistem Informasi Manajemen Kurikulum (SIMKUR) — Digitalisasi Tupoksi Wakil Kepala Sekolah Bidang Kurikulum

| | |
|---|---|
| **Versi Dokumen** | 1.2 |
| **Tanggal** | 24 September 2026 |
| **Status** | Draft — Bahan Penawaran/Proposal (telah diselaraskan dengan regulasi terbaru per 2026) |
| **Ditujukan kepada** | Wakil Kepala Sekolah Bidang Kurikulum (Waka Kurikulum) |
| **Konteks Sekolah** | SMK dengan 5 program keahlian: TJKT, MPLB, AKL, DKV, Pemasaran |

---

## 1. Ringkasan Eksekutif

Dokumen ini adalah proposal pengembangan **Sistem Informasi Manajemen Kurikulum (SIMKUR)** — sebuah platform digital yang dirancang untuk membantu Waka Kurikulum menjalankan seluruh tugas pokok dan fungsinya secara lebih efisien, terpusat, dan terukur.

Selama ini, sebagian besar tupoksi Waka Kurikulum (penjadwalan, pengelolaan perangkat ajar, supervisi, rekap kehadiran mengajar, hingga koordinasi PKL dan UKK) masih dikerjakan manual lewat Excel, WhatsApp, dan dokumen fisik yang tersebar. Hal ini membuat proses menjadi lambat, sulit dipantau, dan rawan kehilangan data.

SIMKUR hadir sebagai **satu pintu (single dashboard)** bagi Waka Kurikulum untuk memantau dan mengelola seluruh proses akademik sekolah — mulai dari perencanaan kurikulum, jadwal mengajar, perangkat ajar guru, penilaian, sampai pelaporan ke kepala sekolah dan dinas pendidikan.

**Nilai yang ditawarkan:**
- Menghemat waktu administratif Waka Kurikulum secara signifikan.
- Data akademik terpusat, real-time, dan mudah diaudit.
- Mempermudah pelaporan ke Kepala Sekolah, Pengawas Sekolah, dan Dinas Pendidikan.
- Mendukung kebutuhan spesifik SMK: sinkronisasi kurikulum dengan DUDI, PKL, dan Uji Kompetensi Keahlian (UKK).

---

## 2. Latar Belakang & Masalah

### 2.1 Tupoksi Waka Kurikulum (Acuan Cakupan Sistem)

| # | Tupoksi | Kondisi Saat Ini (Asumsi Umum) |
|---|---------|-------------------------------|
| 1 | Menyusun program kerja & kalender akademik tahunan | Dokumen Word/PDF statis, sulit diakses semua pihak |
| 2 | Menyusun kurikulum & sinkronisasi dengan DUDI (khusus SMK) | Rapat manual, dokumen kurikulum tersebar per jurusan |
| 3 | Menyusun pembagian tugas mengajar (PTM) & jadwal pelajaran | Excel manual, rawan bentrok jadwal |
| 4 | Mengkoordinasikan perangkat ajar guru (Modul Ajar/RPP, ATP, Prota, Prosem) | Dikumpulkan manual via WA/print, sulit dipantau kelengkapannya |
| 5 | Mengatur pelaksanaan penilaian (PTS, PAS, PAT, USP) | Terpisah dari sistem lain, direkap manual |
| 6 | Mengatur Uji Kompetensi Keahlian (UKK) per jurusan | Koordinasi manual dengan tiap kajur & asesor eksternal |
| 7 | Mengkoordinasikan Praktik Kerja Lapangan (PKL) dari sisi akademik | Data tersebar, sulit tracking progres siswa per DUDI |
| 8 | Supervisi akademik/kunjungan kelas | Catatan manual di kertas, sulit ditindaklanjuti |
| 9 | Rekap kehadiran & jurnal mengajar guru | Absensi manual, rawan tidak konsisten |
| 10 | Analisis hasil belajar & tindak lanjut (remedial/pengayaan) | Data nilai tersebar, analisis manual di Excel |
| 11 | Koordinasi MGMP internal sekolah | Jadwal & notulen tidak terdokumentasi rapi |
| 12 | Pelaporan ke Kepala Sekolah & Dinas Pendidikan | Disusun manual tiap periode, memakan waktu lama |

### 2.2 Masalah Utama
1. Data akademik tersebar di banyak file/orang, tidak ada sumber data tunggal.
2. Waka Kurikulum kesulitan memantau progres administrasi guru (perangkat ajar, jurnal mengajar) secara real-time.
3. Penyusunan jadwal & pembagian tugas mengajar memakan waktu lama dan rawan bentrok.
4. Pelaporan berkala (ke Kepsek/Dinas) disusun ulang dari nol setiap periode.
5. Kebutuhan khusus SMK (sinkronisasi DUDI, PKL, UKK) belum punya alat bantu digital yang memadai.

---

## 2.3 Dasar Hukum & Regulasi Acuan (per 2026)

Agar rancangan sistem selaras dengan kebijakan terbaru, pengembangan SIMKUR mengacu pada regulasi berikut:

| # | Regulasi | Relevansi terhadap SIMKUR |
|---|----------|----------------------------|
| 1 | Permendikbudristek No. 12 Tahun 2024 tentang Kurikulum pada PAUD, Jenjang Pendidikan Dasar, dan Jenjang Pendidikan Menengah (menetapkan Kurikulum Merdeka sebagai kurikulum nasional) | Dasar struktur modul Manajemen Kurikulum (6.2) |
| 2 | Permendikdasmen No. 13 Tahun 2025 tentang Perubahan atas Permendikbudristek No. 12/2024 (struktur kurikulum & alokasi jam pelajaran TA 2026/2027) | Referensi struktur mata pelajaran & jam pelajaran per jurusan yang perlu didukung sistem |
| 3 | Permendikdasmen No. 1 Tahun 2026 tentang Standar Proses pada PAUD, Jenjang Pendidikan Dasar, dan Jenjang Pendidikan Menengah | Acuan alur perencanaan, pelaksanaan, dan penilaian pembelajaran (relevan untuk modul 6.1 dan 6.7) |
| 4 | Permendikdasmen No. 6 Tahun 2026 tentang Budaya Sekolah yang Aman dan Nyaman | Prinsip pengawasan ruang digital & perlindungan data murid, relevan untuk modul Supervisi Akademik (6.6) |
| 5 | UU No. 27 Tahun 2022 tentang Perlindungan Data Pribadi (PDP) | Dasar kebutuhan keamanan & tata kelola data pada seluruh modul yang menyimpan data pribadi guru/siswa |
| 6 | Permendikdasmen No. 3 Tahun 2025 tentang SPMB (Sistem Penerimaan Murid Baru) | Di luar lingkup SIMKUR (ranah Waka Kesiswaan), dicantumkan sebagai referensi batas lingkup saja |
| 7 | Pedoman/Juknis UKK SMK (Direktorat SMK) & Peraturan BNSP No. 5/BNSP/VII/2014 tentang Pedoman Tempat Uji Kompetensi | Dasar modul UKK (6.9) yang mendukung dua jalur: LSP (LSP-P1 sekolah, lisensi BNSP) dan jalur mandiri sekolah terakreditasi bersama DUDI |

> Catatan: Daftar ini akan diperbarui mengikuti perubahan regulasi Kemendikdasmen. Karena Waka Kurikulum bukan penasihat hukum, bagian ini bersifat referensi kebijakan, bukan opini/kepastian hukum — verifikasi akhir sebaiknya tetap dikonfirmasi ke Dinas Pendidikan setempat.

---

## 3. Tujuan Produk

| # | Tujuan | Indikator Keberhasilan |
|---|--------|-------------------------|
| 1 | Satu dashboard terpusat untuk seluruh tupoksi Waka Kurikulum | Waka Kurikulum tidak lagi bergantung pada banyak file Excel/WA terpisah |
| 2 | Mempercepat penyusunan jadwal & pembagian tugas mengajar | Waktu penyusunan jadwal berkurang signifikan dibanding cara manual |
| 3 | Transparansi kelengkapan perangkat ajar guru | Status kelengkapan (Modul Ajar/RPP dsb) per guru terlihat real-time |
| 4 | Mempermudah pelaporan berkala | Laporan ke Kepsek/Dinas bisa digenerate otomatis dari data yang sudah ada |
| 5 | Mendukung proses khas SMK (DUDI, PKL, UKK) | Tersedia modul tracking PKL & UKK per jurusan |

---

## 4. Ruang Lingkup

### 4.1 Dalam Lingkup (In Scope)
- Dashboard Waka Kurikulum sebagai pusat kendali & monitoring.
- Manajemen kalender akademik & program kerja.
- Manajemen kurikulum per jurusan (termasuk catatan sinkronisasi DUDI).
- Penyusunan jadwal pelajaran & pembagian tugas mengajar (PTM).
- Pengumpulan & tracking kelengkapan perangkat ajar guru.
- Jurnal mengajar & rekap kehadiran guru.
- Supervisi akademik (jadwal, catatan, tindak lanjut).
- Modul PKL (koordinasi akademik, bukan pengelolaan keuangan/kerja sama industri).
- Modul Uji Kompetensi Keahlian (UKK).
- Integrasi/rujukan ke sistem CBT untuk data ujian & nilai (bila sudah tersedia).
- Laporan & dashboard analitik untuk Kepala Sekolah dan Dinas Pendidikan.

### 4.2 Luar Lingkup (Out of Scope)
- Pengelolaan keuangan sekolah (SPP, dana BOS, dll).
- Manajemen kepegawaian penuh (payroll, cuti, dll) — hanya data kompetensi/administrasi mengajar yang relevan.
- Kerja sama industri secara legal/kontraktual (MoU) — sistem hanya mencatat, bukan mengelola proses hukum.
- Presensi siswa harian (domain Waka Kesiswaan), kecuali kehadiran dalam konteks ujian.

---

## 5. Target Pengguna & Role

| Role | Deskripsi | Hak Akses Utama |
|------|-----------|------------------|
| **Waka Kurikulum** | Pengguna utama/pemilik proses | Akses penuh seluruh modul, approval, dan laporan |
| **Kepala Sekolah** | Penerima laporan | Akses read-only ke dashboard ringkasan & laporan |
| **Kepala Jurusan (Kajur)** | Koordinator tiap program keahlian | Kelola kurikulum, PKL, UKK untuk jurusannya |
| **Guru** | Pengampu mapel | Upload perangkat ajar, isi jurnal mengajar |
| **Staf TU/Admin Kurikulum** | Operator harian | Input data jadwal, kalender, rekap administratif |
| **Pengawas Sekolah** (opsional) | Pihak eksternal Dinas | Akses read-only ke laporan tertentu jika diizinkan |

---

## 6. Kebutuhan Fungsional

Prioritas: **M** = Must have, **S** = Should have, **C** = Could have.

### 6.1 Kalender Akademik & Program Kerja

| # | Kebutuhan | Prioritas |
|---|-----------|-----------|
| 6.1.1 | Input & publikasi kalender akademik tahunan (hari efektif, libur, ujian) | M |
| 6.1.2 | Program kerja kurikulum tahunan dengan tracking progres per kegiatan | S |
| 6.1.3 | Notifikasi otomatis mendekati tanggal penting (mis. batas kumpul perangkat ajar) | S |
| 6.1.4 | Template alur perencanaan-pelaksanaan-penilaian pembelajaran mengikuti Standar Proses terbaru (Permendikdasmen No. 1/2026) | S |

### 6.2 Manajemen Kurikulum & Sinkronisasi DUDI

> Struktur kurikulum mengacu pada Kurikulum Merdeka sebagai kurikulum nasional (Permendikbudristek No. 12/2024, diperbarui melalui Permendikdasmen No. 13/2025), termasuk pendekatan *deep learning* yang berlaku mulai TA 2025/2026. Sistem dirancang mendukung struktur kurikulum berbasis Capaian Pembelajaran per fase, bukan lagi Kurikulum 2013, kecuali bagi sekolah yang masih dalam masa transisi.

| # | Kebutuhan | Prioritas |
|---|-----------|-----------|
| 6.2.1 | Dokumentasi struktur kurikulum per jurusan (mata pelajaran, jam pelajaran intrakurikuler & kokurikuler, capaian pembelajaran per fase) sesuai struktur Kurikulum Merdeka/Nasional terbaru | M |
| 6.2.2 | Catatan hasil sinkronisasi kurikulum dengan DUDI per jurusan (mis. hasil rapat, poin revisi) | S |
| 6.2.3 | Riwayat versi kurikulum per tahun ajaran, termasuk status transisi K-13 → Kurikulum Merdeka bagi sekolah yang belum sepenuhnya beralih | C |
| 6.2.4 | Indikator kepatuhan struktur kurikulum terhadap Permendikdasmen terbaru (checklist kesesuaian jam pelajaran per jurusan) | C |

### 6.3 Jadwal Pelajaran & Pembagian Tugas Mengajar (PTM)

| # | Kebutuhan | Prioritas |
|---|-----------|-----------|
| 6.3.1 | Input data guru, mapel yang diampu, dan jumlah jam mengajar | M |
| 6.3.2 | Generator jadwal pelajaran dengan deteksi bentrok otomatis (guru/ruang/kelas) | M |
| 6.3.3 | Publikasi jadwal per rombel & per guru, dapat diakses/diunduh | M |
| 6.3.4 | Riwayat perubahan jadwal (jika ada revisi di tengah semester) | S |

### 6.4 Perangkat Ajar Guru

| # | Kebutuhan | Prioritas |
|---|-----------|-----------|
| 6.4.1 | Upload perangkat ajar (Modul Ajar/RPP, ATP, Prota, Prosem) per guru per mapel | M |
| 6.4.2 | Dashboard status kelengkapan perangkat ajar per guru/jurusan (lengkap/belum) | M |
| 6.4.3 | Review & feedback Waka Kurikulum atas perangkat ajar yang diunggah | S |
| 6.4.4 | Reminder otomatis untuk guru yang belum melengkapi | S |

### 6.5 Jurnal Mengajar & Kehadiran Guru

| # | Kebutuhan | Prioritas |
|---|-----------|-----------|
| 6.5.1 | Guru mengisi jurnal mengajar harian (materi, kelas, jam) via sistem | M |
| 6.5.2 | Rekap kehadiran mengajar guru per periode | M |
| 6.5.3 | Laporan guru yang sering tidak mengisi jurnal/tidak hadir mengajar | S |

### 6.6 Supervisi Akademik

> Pengelolaan catatan supervisi memperhatikan prinsip ruang digital yang terawasi dan aman sebagaimana ditegaskan dalam Permendikdasmen No. 6/2026 tentang Budaya Sekolah yang Aman dan Nyaman — akses catatan dibatasi hanya untuk pihak berwenang (Waka Kurikulum, Kepsek, guru bersangkutan).

| # | Kebutuhan | Prioritas |
|---|-----------|-----------|
| 6.6.1 | Penjadwalan supervisi/kunjungan kelas per guru | M |
| 6.6.2 | Formulir digital catatan hasil supervisi | M |
| 6.6.3 | Tindak lanjut hasil supervisi (rekomendasi, target perbaikan) dengan status tracking | S |
| 6.6.4 | Kontrol akses ketat (hanya guru bersangkutan, Waka Kurikulum, dan Kepsek) atas catatan hasil supervisi individu | M |

### 6.7 Manajemen Penilaian (Terhubung dengan Sistem CBT)

| # | Kebutuhan | Prioritas |
|---|-----------|-----------|
| 6.7.1 | Rujukan/integrasi data jadwal PTS, PAS, PAT, USP dari sistem CBT (bila tersedia) | S |
| 6.7.2 | Rekap nilai per jurusan/rombel ditarik dari sistem CBT untuk kebutuhan laporan kurikulum | S |
| 6.7.3 | Analisis capaian belajar & rekomendasi tindak lanjut (remedial/pengayaan) | C |

> Catatan: Modul ini dirancang agar **terhubung**, bukan menggantikan, sistem CBT yang sudah/akan dibangun terpisah — sehingga Waka Kurikulum tidak perlu input dua kali.

### 6.8 Praktik Kerja Lapangan (PKL)

| # | Kebutuhan | Prioritas |
|---|-----------|-----------|
| 6.8.1 | Data pemetaan siswa ke tempat PKL per jurusan | M |
| 6.8.2 | Tracking progres/status PKL siswa (belum berangkat/berjalan/selesai) | M |
| 6.8.3 | Upload laporan/nilai PKL dari pembimbing | S |

### 6.9 Uji Kompetensi Keahlian (UKK)

> Berdasarkan Pedoman/Juknis UKK SMK, UKK dapat diselenggarakan melalui dua jalur: **(a) Lembaga Sertifikasi Profesi (LSP)** — umumnya LSP Pihak Pertama (LSP-P1) yang didirikan sekolah dan berlisensi BNSP, menerbitkan sertifikat kompetensi resmi BNSP; atau **(b) jalur mandiri sekolah terakreditasi** bersama mitra dunia kerja/industri (tanpa LSP), menerbitkan sertifikat UKK sekolah. Karena sekolah memiliki kedua opsi ini, SIMKUR perlu mendukung keduanya sebagai jalur yang dapat dipilih per jurusan/skema, bukan mengasumsikan satu jalur saja.

| # | Kebutuhan | Prioritas |
|---|-----------|-----------|
| 6.9.1 | Jadwal pelaksanaan UKK per jurusan, dengan penanda jalur pelaksanaan: **LSP** atau **Mandiri Sekolah + DUDI** | M |
| 6.9.2 | Data asesor per jurusan — untuk jalur LSP: asesor kompetensi berlisensi BNSP (termasuk nomor registrasi asesor); untuk jalur mandiri: asesor internal guru & asesor eksternal DUDI | M |
| 6.9.3 | Data skema sertifikasi & Tempat Uji Kompetensi (TUK) per jurusan (khusus jalur LSP, mengacu skema yang dilisensi BNSP) | M |
| 6.9.4 | Input & rekap nilai UKK per siswa per jurusan, mencatat jalur (LSP/Mandiri) yang ditempuh | M |
| 6.9.5 | Sertifikat/hasil UKK dapat diunduh per siswa — termasuk penanda jenis sertifikat (Sertifikat Kompetensi BNSP via LSP, atau Sertifikat UKK Sekolah) | S |
| 6.9.6 | Rekap status lisensi LSP-P1 sekolah & masa berlaku skema sertifikasi per jurusan (reminder perpanjangan) | C |

### 6.10 Laporan & Dashboard Eksekutif

| # | Kebutuhan | Prioritas |
|---|-----------|-----------|
| 6.10.1 | Dashboard ringkasan untuk Kepala Sekolah (status kurikulum, kelengkapan administrasi, hasil belajar) | M |
| 6.10.2 | Generate laporan periodik siap cetak/export (PDF/Excel) untuk Dinas Pendidikan | M |
| 6.10.3 | Perbandingan capaian antar jurusan & antar periode | S |

---

## 7. Kebutuhan Non-Fungsional

| Kategori | Kebutuhan |
|----------|-----------|
| **Kemudahan Penggunaan** | Antarmuka sederhana; mayoritas pengguna (guru) bukan tenaga IT |
| **Aksesibilitas** | Dapat diakses via desktop maupun HP (responsif), karena guru & Waka Kurikulum sering mobile |
| **Keamanan Data** | Role-based access, data akademik hanya bisa diakses pihak berwenang |
| **Kepatuhan Data Pribadi** | Pengelolaan data pribadi guru dan siswa (nilai, kehadiran, catatan supervisi, data PKL yang dibagikan ke DUDI/asesor eksternal) mengikuti prinsip UU No. 27/2022 tentang Perlindungan Data Pribadi (PDP): persetujuan/legal basis pemrosesan data, pembatasan akses sesuai kebutuhan (*need-to-know*), enkripsi data sensitif, dan pencatatan log akses (audit trail) |
| **Integrasi** | Terbuka untuk integrasi dengan sistem CBT & potensi Dapodik/PMM di masa depan |
| **Reliabilitas** | Data tidak boleh hilang; backup rutin |

---

## 8. Asumsi & Batasan

**Asumsi:**
- Guru dan staf memiliki akses perangkat (HP/laptop) dan koneksi internet dasar.
- Sistem CBT (jika sudah dibangun) menyediakan API/ekspor data yang bisa dirujuk oleh SIMKUR.
- Waka Kurikulum bersedia menjadi champion/pengguna utama untuk mendorong adopsi oleh guru.

**Batasan:**
- Fase awal tidak mencakup integrasi otomatis dua arah dengan Dapodik.
- Modul PKL fase awal hanya administratif/akademik, belum mencakup pengelolaan MoU industri.

---

## 9. Roadmap Pengembangan (Usulan)

| Fase | Fokus | Estimasi |
|------|-------|----------|
| **Fase 1** | Kalender akademik, jadwal & PTM, perangkat ajar guru, jurnal mengajar | 2-3 bulan |
| **Fase 2** | Supervisi akademik, integrasi data nilai dari CBT, laporan dasar | 2 bulan |
| **Fase 3** | Modul PKL, UKK, dashboard eksekutif untuk Kepsek/Dinas | 2 bulan |

---

## 10. Risiko & Mitigasi

| Risiko | Dampak | Mitigasi |
|--------|--------|----------|
| Guru enggan mengisi jurnal/perangkat ajar secara digital | Data tidak lengkap, sistem tidak efektif | Sosialisasi, pelatihan bertahap, dan reminder otomatis |
| Waka Kurikulum & staf TU terbiasa cara manual | Adopsi lambat | Migrasi bertahap: mulai dari 1-2 modul prioritas (jadwal & perangkat ajar) sebelum full rollout |
| Data dari sistem CBT tidak sinkron/format berbeda | Laporan nilai tidak akurat | Standarisasi format data & API sejak awal perancangan |

---

## 11. Argumen Nilai untuk Diajukan ke Waka Kurikulum

Poin-poin ini bisa ditekankan saat presentasi penawaran:

1. **Hemat waktu nyata** — penyusunan jadwal, rekap kehadiran, dan pelaporan yang biasanya makan waktu berhari-hari bisa dipangkas signifikan.
2. **Satu sumber data** — tidak perlu lagi mencari-cari file di banyak folder/WA grup guru.
3. **Terlihat progresnya** — Waka Kurikulum bisa tahu real-time siapa guru yang belum lengkap administrasinya, tanpa harus menagih manual satu per satu.
4. **Siap untuk akreditasi & audit** — data historis rapi, laporan bisa digenerate kapan saja saat dibutuhkan tim akreditasi atau pengawas.
5. **Selaras dengan kebutuhan SMK** — bukan sistem generik, tapi memang dirancang mempertimbangkan proses khas SMK seperti UKK dan PKL.

---

## 12. Glosarium

- **Waka Kurikulum**: Wakil Kepala Sekolah Bidang Kurikulum.
- **PTM**: Pembagian Tugas Mengajar.
- **ATP**: Alur Tujuan Pembelajaran.
- **DUDI**: Dunia Usaha dan Dunia Industri.
- **PKL**: Praktik Kerja Lapangan (magang siswa SMK).
- **UKK**: Uji Kompetensi Keahlian.
- **PTS/PAS/PAT/USP**: Penilaian Tengah/Akhir Semester, Penilaian Akhir Tahun, Ujian Sekolah.
- **MGMP**: Musyawarah Guru Mata Pelajaran.
- **Kurikulum Merdeka**: Kurikulum nasional yang berlaku sejak Permendikbudristek No. 12 Tahun 2024, menekankan pembelajaran berbasis Capaian Pembelajaran per fase dan fleksibilitas satuan pendidikan.
- **PDP**: Perlindungan Data Pribadi, mengacu pada UU No. 27 Tahun 2022.
- **SPMB**: Sistem Penerimaan Murid Baru (istilah baru pengganti PPDB, di luar lingkup SIMKUR).
- **LSP**: Lembaga Sertifikasi Profesi, lembaga berlisensi BNSP yang berwenang menerbitkan sertifikat kompetensi. **LSP-P1** adalah LSP yang didirikan sekolah untuk menguji peserta didiknya sendiri.
- **BNSP**: Badan Nasional Sertifikasi Profesi, pemegang mandat nasional sertifikasi kompetensi yang memberi lisensi kepada LSP.
- **TUK**: Tempat Uji Kompetensi, lokasi yang diverifikasi & dilisensi untuk pelaksanaan UKK.
- **KKNI**: Kerangka Kualifikasi Nasional Indonesia — UKK SMK setara kualifikasi jenjang 2 atau 3 KKNI.
