# PRD — Modul Supervisi Akademik dan Manajerial pada SIMKUR

**SMKN 1 Banjarmasin** — Alur: Kepala Sekolah → Waka dan Kajur → Guru

| **Keterangan**     | **Isi**                                                  |
|--------------------|----------------------------------------------------------|
| Versi              | 1.0 (draf awal)                                          |
| Tanggal            | 29 September 2026                                        |
| Sistem             | SIMKUR — https://simkur-nine.vercel.app/                 |
| Teknologi saat ini | Web statis (HTML/JS) di Vercel, Firebase Cloud Firestore |
| Status             | Draf untuk ditinjau Waka Kurikulum dan Kepala Sekolah    |

## 1. Ringkasan

SIMKUR saat ini melayani Waka Kurikulum: dokumen kurikulum, jadwal pelajaran, data master, monitoring kelengkapan administrasi guru, dan Portal Guru KBM (jurnal, presensi, berkas perangkat ajar). Menu "Rapat & Supervisi" baru berupa agenda dan belum ada modul yang mengelola supervisi itu sendiri.

Dokumen ini mendefinisikan modul Supervisi yang mendigitalkan seluruh siklus: perencanaan program oleh Kepala Sekolah, supervisi manajerial terhadap Waka dan Kajur, supervisi akademik oleh Kajur terhadap guru, pelaporan berjenjang, dan tindak lanjut. Instrumen observasi disusun mengikuti struktur supervisi akademik klinis yang lazim dipakai dinas (pra-observasi, observasi, pasca-observasi) dan disesuaikan dengan Kurikulum Merdeka serta karakter SMK.

### 1.1 Masalah yang diselesaikan

- Supervisi dicatat di kertas atau berkas terpisah sehingga sulit direkap dan ditelusuri.

- Waka Kurikulum dan Kepala Sekolah tidak punya gambaran real-time siapa yang sudah dan belum disupervisi.

- Hasil supervisi tidak terhubung dengan data perangkat ajar dan jurnal mengajar yang sudah ada di SIMKUR.

- Tindak lanjut (pembinaan, supervisi ulang) tidak terpantau.

### 1.2 Tujuan

- Menyediakan siklus supervisi berjenjang yang tercatat lengkap dalam satu sistem.

- Menyeragamkan instrumen dan skala penilaian di seluruh jurusan.

- Menghasilkan laporan supervisi otomatis untuk Kajur, Waka, dan Kepala Sekolah.

- Memastikan setiap temuan memiliki rencana tindak lanjut dan tenggat.

### 1.3 Indikator keberhasilan

| **Indikator**                                                | **Target awal**                             |
|--------------------------------------------------------------|---------------------------------------------|
| Guru tersupervisi per semester                               | 100% (90 guru), minimal 1 kali per semester |
| Laporan supervisi diselesaikan Kajur setelah pasca-observasi | ≤ 7 hari kalender                           |
| Temuan dengan rencana tindak lanjut tercatat                 | ≥ 90%                                       |
| Waktu Kepsek/Waka melihat rekap seluruh sekolah              | \< 1 menit dari dashboard                   |
| Berkas kertas supervisi yang masih dipakai                   | 0 setelah fase 1 berjalan satu semester     |

## 2. Ruang lingkup

### 2.1 Dalam lingkup

- Supervisi manajerial: Kepala Sekolah terhadap Waka dan Kajur.

- Supervisi akademik: Kajur terhadap guru di jurusannya (perangkat ajar dan observasi pembelajaran).

- Penjadwalan, instrumen digital, penilaian, refleksi, umpan balik, rencana tindak lanjut (RTL), dan laporan.

- Integrasi dengan data guru, perangkat ajar, dan jurnal KBM yang sudah ada.

- Ekspor laporan ke PDF dan Excel.

### 2.2 Di luar lingkup (fase ini)

- Penilaian kinerja guru resmi (PMM/PKG) dan integrasinya ke platform pusat.

- Supervisi oleh pengawas sekolah eksternal (dapat ditambah sebagai role pada fase 3).

- Rekaman video kelas dan analisis otomatis.

- Perubahan pada modul jadwal dan data master di luar kebutuhan integrasi.

## 3. Peran pengguna dan hak akses

| **Peran**                                   | **Tugas di modul Supervisi**                                                                        | **Hak akses data**                                                       |
|---------------------------------------------|-----------------------------------------------------------------------------------------------------|--------------------------------------------------------------------------|
| Kepala sekolah                              | Menetapkan program, jadwal, dan SK tim; menyupervisi Waka dan Kajur; menetapkan tindak lanjut akhir | Baca semua; tulis penilaian Waka dan Kajur; setujui program dan laporan  |
| Waka (Kurikulum, Kesiswaan, Sarpras, Humas) | Diawasi Kepsek; Waka Kurikulum merekap laporan supervisi akademik dan meneruskan ke Kepsek          | Baca rekap seluruh guru (Waka Kurikulum); baca hasil dirinya (Waka lain) |
| Kajur (kepala program keahlian)             | Diawasi Kepsek; menyupervisi guru di jurusannya; menyusun laporan jurusan                           | Baca dan tulis untuk guru di jurusannya saja; baca hasil dirinya         |
| Guru                                        | Menyiapkan perangkat ajar, mengikuti observasi, mengisi refleksi, menjalankan RTL                   | Baca hasil dan umpan balik dirinya; tulis refleksi dan bukti RTL         |
| Admin sistem                                | Mengelola akun, role, pemetaan Kajur-jurusan, dan bank instrumen                                    | Kelola pengguna; tidak melihat isi penilaian kecuali diberi hak          |

*Catatan: satu orang dapat memegang lebih dari satu peran (misalnya Waka sekaligus guru); sistem menampilkan tab sesuai peran aktif.*

## 4. Alur bisnis

### 4.1 Alur utama

1.  Kepala sekolah membuat Program Supervisi semester (tujuan, sasaran, periode, tim) dan menerbitkan jadwal.

2.  Sistem membuat sesi supervisi manajerial untuk setiap Waka dan Kajur, serta sesi supervisi akademik untuk setiap guru sesuai jurusan kepada Kajur terkait.

3.  Supervisi manajerial: pengawas (Kepsek) memeriksa dokumen program kerja, pelaksanaan, dan laporan; mengisi Instrumen E; memberi umpan balik.

4.  Supervisi akademik, pra-observasi: guru mengunggah/mengonfirmasi perangkat ajar; Kajur menelaah (Instrumen B) dan melakukan wawancara awal (Instrumen A).

5.  Observasi: Kajur mengamati pembelajaran di kelas, bengkel, atau lab dan mengisi Instrumen C (dapat dari HP).

6.  Pasca-observasi: guru mengisi refleksi, Kajur memberi umpan balik dan bersama guru menyepakati RTL (Instrumen D).

7.  Kajur mengirim laporan jurusan ke Waka Kurikulum; Waka Kurikulum merekap dan meneruskan ke Kepala Sekolah.

8.  Kepala sekolah menetapkan tindak lanjut akhir; sesi ditutup atau dijadwalkan supervisi ulang.

### 4.2 Status sesi supervisi

| **Status**      | **Arti**                          | **Pemicu perpindahan**                       |
|-----------------|-----------------------------------|----------------------------------------------|
| Dijadwalkan     | Sesi dibuat dari program          | Program diterbitkan                          |
| Pra-observasi   | Perangkat ajar dan wawancara awal | Guru mengunggah perangkat atau Kajur memulai |
| Observasi       | Pengamatan pembelajaran           | Kajur menyimpan Instrumen B dan A            |
| Pasca-observasi | Refleksi, umpan balik, RTL        | Kajur menyimpan Instrumen C                  |
| Laporan dikirim | Menunggu tinjauan Waka/Kepsek     | Instrumen D lengkap dan disetujui guru       |
| Ditindaklanjuti | RTL berjalan                      | Laporan diterima atasan                      |
| Selesai         | Semua RTL terpenuhi               | Kajur/Kepsek menandai selesai                |

*Aturan: sesi tidak dapat maju ke status berikutnya sebelum instrumen tahap saat ini terisi. Sesi dapat dijadwalkan ulang maksimal dua kali dengan alasan tercatat.*

## 5. Kebutuhan fungsional

*Prioritas: P1 = wajib fase 1; P2 = fase 2; P3 = fase 3.*

| **ID** | **Kebutuhan**                                                                                | **Peran**     | **Prioritas** |
|--------|----------------------------------------------------------------------------------------------|---------------|---------------|
| FR-01  | Login berbasis akun per pengguna dengan role (Kepsek, Waka, Kajur, Guru, Admin)              | Semua         | P1            |
| FR-02  | Pemetaan Kajur ke jurusan dan guru ke Kajur otomatis dari field Departemen pada Data Guru    | Admin         | P1            |
| FR-03  | Membuat Program Supervisi (semester, periode, sasaran, tim, catatan)                         | Kepsek        | P1            |
| FR-04  | Membuat jadwal sesi massal dari program dan mengubah jadwal per sesi                         | Kepsek, Kajur | P1            |
| FR-05  | Daftar sesi per peran dengan filter jurusan, status, dan tanggal                             | Semua         | P1            |
| FR-06  | Pra-observasi: menampilkan berkas perangkat ajar guru yang sudah ada di SIMKUR               | Kajur, Guru   | P1            |
| FR-07  | Formulir Instrumen A (wawancara pra-observasi) dengan kolom jawaban dan catatan              | Kajur         | P1            |
| FR-08  | Formulir Instrumen B (telaah perangkat ajar) skala 1–4, hitung skor otomatis                 | Kajur         | P1            |
| FR-09  | Formulir Instrumen C (observasi pembelajaran) responsif untuk HP, simpan draf otomatis       | Kajur         | P1            |
| FR-10  | Formulir Instrumen D (refleksi guru, umpan balik, RTL) dengan tenggat per tindakan           | Guru, Kajur   | P1            |
| FR-11  | Guru dapat melihat hasil dan mengonfirmasi ("sudah dibaca") umpan balik                      | Guru          | P1            |
| FR-12  | Perhitungan nilai akhir dan predikat sesuai Bagian 7                                         | Sistem        | P1            |
| FR-13  | Laporan supervisi per guru (PDF) berisi skor, catatan, dan RTL                               | Kajur, Guru   | P1            |
| FR-14  | Laporan jurusan: rekap skor, sebaran predikat, temuan umum, ekspor Excel                     | Kajur         | P1            |
| FR-15  | Supervisi manajerial dengan Instrumen E untuk Waka dan Kajur                                 | Kepsek        | P2            |
| FR-16  | Dashboard Kepsek dan Waka Kurikulum: progres supervisi, rata-rata per jurusan, sesi tertunda | Kepsek, Waka  | P2            |
| FR-17  | Kartu progres supervisi di dashboard SIMKUR dan isi otomatis Agenda Kurikulum                | Waka          | P2            |
| FR-18  | Kolom status dan skor supervisi terakhir pada tabel Monitoring Kelengkapan per Guru          | Waka          | P2            |
| FR-19  | Notifikasi dalam aplikasi untuk jadwal, pengingat H-3, dan RTL jatuh tempo                   | Semua         | P2            |
| FR-20  | Ekspor rekap seluruh sekolah ke Excel dan PDF                                                | Kepsek, Waka  | P2            |
| FR-21  | Pelacak RTL: daftar tindakan terbuka, unggah bukti, verifikasi Kajur                         | Guru, Kajur   | P2            |
| FR-22  | Bank Instrumen: butir dapat diubah, ditambah, dinonaktifkan, dan diberi versi oleh Admin     | Admin         | P3            |
| FR-23  | Notifikasi WhatsApp opsional (misalnya melalui WAHA) untuk jadwal dan pengingat              | Sistem        | P3            |
| FR-24  | Analitik tren antar-semester per guru dan per jurusan                                        | Kepsek, Waka  | P3            |
| FR-25  | Role Pengawas sekolah dengan akses baca dan penilaian terbatas                               | Admin         | P3            |
| FR-26  | Log audit: siapa mengubah nilai atau status, kapan                                           | Admin         | P2            |

## 6. Layar dan pengalaman pengguna

Modul mengikuti gaya SIMKUR yang ada (sidebar, kartu, tabel, modal). Menu baru "Supervisi" berada di grup Pembelajaran; tab di dalamnya menyesuaikan peran.

| **Layar**            | **Peran**           | **Isi utama**                                                                                |
|----------------------|---------------------|----------------------------------------------------------------------------------------------|
| Program supervisi    | Kepsek              | Form program, daftar sasaran, tombol terbitkan jadwal                                        |
| Dashboard supervisi  | Kepsek, Waka        | Progres, rata-rata skor per jurusan, sesi tertunda, laporan menunggu                         |
| Sesi saya            | Kajur, Waka, Guru   | Daftar sesi dengan status, tombol aksi sesuai tahap                                          |
| Detail sesi          | Kajur, Guru         | Stepper pra-observasi, observasi, pasca-observasi; berkas perangkat ajar; jurnal KBM terkait |
| Formulir instrumen   | Kajur               | Butir dengan skala 1–4, kolom bukti, foto opsional, progres pengisian                        |
| Refleksi dan RTL     | Guru, Kajur         | Isian refleksi, tabel tindakan (tindakan, tenggat, bukti, status)                            |
| Laporan              | Kajur, Waka, Kepsek | Pratinjau, ekspor PDF/Excel, kirim ke atasan                                                 |
| Pengaturan supervisi | Admin               | Pemetaan Kajur-jurusan, bobot, skala, versi instrumen                                        |

## 7. Aturan penilaian

Setiap instrumen bernilai 1–4 per butir. Nilai instrumen = (jumlah skor ÷ (jumlah butir × 4)) × 100. Nilai akhir supervisi akademik guru dihitung dari bobot berikut (dapat diubah Admin):

| **Komponen**                         | **Bobot default** |
|--------------------------------------|-------------------|
| Telaah perangkat ajar (Instrumen B)  | 40%               |
| Observasi pembelajaran (Instrumen C) | 60%               |

| **Rentang nilai** | **Predikat** | **Tindak lanjut standar**                               |
|-------------------|--------------|---------------------------------------------------------|
| 91 – 100          | Amat baik    | Apresiasi; dorong menjadi guru penggerak/mentor sejawat |
| 76 – 90           | Baik         | Pembinaan ringan; pertahankan                           |
| 61 – 75           | Cukup        | Pendampingan Kajur; supervisi ulang bila perlu          |
| ≤ 60              | Kurang       | Pembinaan intensif; supervisi ulang dalam 1 bulan       |

*Rentang dan predikat di atas adalah nilai awal yang lazim dipakai dan dapat disesuaikan dengan ketentuan dinas melalui pengaturan.*

## 8. Model data (Cloud Firestore)

| **Koleksi**         | **Field kunci**                                                                                        | **Keterangan**                     |
|---------------------|--------------------------------------------------------------------------------------------------------|------------------------------------|
| users               | uid, nama, nip, role\[\], jurusan, kajurId                                                             | Akun dan peran; kajurId untuk guru |
| supervisi_program   | id, tahunAjaran, semester, periode, tim\[\], status                                                    | Dibuat Kepsek                      |
| supervisi_sesi      | id, programId, jenis (manajerial/akademik), pengawasUid, sasaranUid, status, jadwal, riwayatJadwal\[\] | Satu sesi per sasaran per program  |
| supervisi_instrumen | id, kode (A–E), versi, butir\[{no, kelompok, teks, bobot}\]                                            | Sumber butir; berversi             |
| supervisi_hasil     | sesiId, instrumenKode, versi, skor{butir:nilai}, catatan{butir}, total, predikat                       | Isian tiap instrumen               |
| supervisi_refleksi  | sesiId, refleksiGuru, kekuatan, areaPengembangan, dibacaGuruAt                                         | Pasca-observasi                    |
| supervisi_rtl       | id, sesiId, tindakan, tenggat, status, buktiUrl, verifiedBy                                            | Rencana tindak lanjut              |
| supervisi_laporan   | id, sesiId/jurusan, dikirimKe, status, tglKirim, tglTerima                                             | Pelaporan berjenjang               |
| supervisi_log       | at, byUid, aksi, ref, sebelum, sesudah                                                                 | Log audit                          |

## 9. Integrasi dengan fitur SIMKUR yang ada

- Data Master Guru: field Departemen menjadi dasar pemetaan guru ke Kajur.

- Berkas perangkat ajar (Modul Ajar, Silabus/ATP, Prota/Prosem, Asesmen): ditampilkan langsung di tahap pra-observasi; skor telaah dapat menggantikan skor verifikasi manual bila disepakati.

- Jurnal KBM dan presensi: ringkasan sesi bulan berjalan tampil di detail sesi sebagai data pendukung observasi.

- Monitoring Kelengkapan per Guru: menambah kolom skor dan status supervisi terakhir.

- Agenda Kurikulum "Rapat & Supervisi": terisi otomatis dari jadwal sesi.

- Portal Guru KBM: guru melihat jadwal dan hasil supervisi di halaman dirinya.

## 10. Kebutuhan non-fungsional dan keamanan

| **Aspek**           | **Kebutuhan**                                                                                                                            |
|---------------------|------------------------------------------------------------------------------------------------------------------------------------------|
| Autentikasi         | Firebase Authentication dengan akun per pengguna; kata sandi default wajib diganti saat login pertama dan tidak ditampilkan di antarmuka |
| Otorisasi           | Aturan Firestore berbasis role dan kepemilikan; aturan uji coba "allow read, write: if true" wajib dihapus sebelum modul dirilis         |
| Privasi             | Hasil penilaian hanya terlihat oleh pengawas, yang dinilai, dan atasan langsung; tidak terlihat oleh guru lain                           |
| Ketersediaan luring | Formulir observasi dapat diisi tanpa sinyal dan disinkronkan saat tersambung (bengkel/lab sering minim sinyal)                           |
| Kinerja             | Daftar sesi termuat \< 2 detik untuk 90 guru; formulir observasi tersimpan otomatis tiap 30 detik                                        |
| Perangkat           | Responsif HP dan tablet; tombol skala cukup besar untuk sentuhan                                                                         |
| Cadangan            | Ekspor Firestore terjadwal setiap minggu; log audit tidak dapat diubah pengguna biasa                                                    |
| Keterbacaan         | Bahasa Indonesia baku; format tanggal dan waktu WITA                                                                                     |

## 11. Roadmap

| **Fase**     | **Cakupan**                                                                                                           | **Hasil**                                                           |
|--------------|-----------------------------------------------------------------------------------------------------------------------|---------------------------------------------------------------------|
| Fase 1 (MVP) | FR-01 s.d. FR-14: akun dan role, program dan jadwal, alur Kajur → Guru dengan Instrumen A–D, laporan dasar            | Satu semester berjalan tanpa berkas kertas untuk supervisi akademik |
| Fase 2       | FR-15 s.d. FR-21 dan FR-26: supervisi manajerial, dashboard, integrasi monitoring, notifikasi, pelacak RTL, log audit | Kepsek dan Waka memantau seluruh siklus dari satu dashboard         |
| Fase 3       | FR-22 s.d. FR-25: bank instrumen, WhatsApp, analitik tren, role pengawas                                              | Instrumen fleksibel dan analisis lintas semester                    |

## 12. Risiko, asumsi, dan pertanyaan terbuka

### 12.1 Risiko

| **Risiko**                                   | **Dampak**                                                    | **Mitigasi**                                                              |
|----------------------------------------------|---------------------------------------------------------------|---------------------------------------------------------------------------|
| Keamanan Firestore masih terbuka             | Data penilaian dapat dibaca atau diubah pihak tidak berwenang | Terapkan Authentication dan rules berbasis role sebelum rilis (FR-01)     |
| Sinyal lemah di bengkel dan lab              | Data observasi hilang                                         | Mode luring dan simpan draf otomatis                                      |
| Resistensi terhadap penilaian digital        | Adopsi rendah                                                 | Sosialisasi, latihan singkat, formulir dibuat serupa dengan format kertas |
| Kajur dengan beban jam mengajar penuh        | Supervisi tertunda                                            | Jadwal realistis, pengingat, batas waktu fleksibel                        |
| Butir instrumen tidak sesuai ketentuan dinas | Instrumen harus diganti                                       | Butir disimpan berversi dan dapat diubah tanpa mengubah kode (FR-22)      |

### 12.2 Pertanyaan terbuka

- Apakah Dinas Pendidikan Provinsi atau pengawas pembina memiliki template instrumen resmi yang wajib dipakai? Jika ada, butir pada Lampiran menggantikan butir default di bawah.

- Apakah Waka lain (Kesiswaan, Sarpras, Humas) dinilai dengan Instrumen E yang sama, atau perlu butir khusus per bidang?

- Apakah nilai supervisi akan dipakai sebagai bahan penilaian kinerja atau hanya pembinaan?

- Berapa kali supervisi per guru per semester (satu atau dua)?

- Apakah hasil perlu ditandatangani (tanda tangan digital atau cetak)?

## Lampiran A. Instrumen supervisi akademik

Butir disusun mengikuti struktur supervisi akademik klinis yang lazim (pra-observasi, observasi, pasca-observasi) dan disesuaikan dengan Kurikulum Merdeka dan kebutuhan SMK. Jika dinas menetapkan template resmi, butir dapat diganti tanpa mengubah alur sistem.

### Instrumen A. Panduan wawancara pra-observasi

*Diisi Kajur bersama guru sebelum observasi. Jawaban dicatat dengan kata kunci.*

| **No** | **Pertanyaan**                                                                                 | **Catatan jawaban** |
|--------|------------------------------------------------------------------------------------------------|---------------------|
| 1      | Mata pelajaran, kelas/rombel, dan tujuan pembelajaran yang akan diamati?                       |                     |
| 2      | Bagaimana langkah pembelajaran dan model yang direncanakan (PjBL, PBL, TeFa, praktikum)?       |                     |
| 3      | Bagaimana kondisi dan kebutuhan belajar peserta didik di kelas ini (hasil asesmen diagnostik)? |                     |
| 4      | Bagaimana rencana asesmen dan bukti ketercapaian tujuan?                                       |                     |
| 5      | Media, alat, bahan, dan langkah keselamatan kerja (K3) yang disiapkan?                         |                     |
| 6      | Kendala yang dihadapi pada materi atau kelas ini?                                              |                     |
| 7      | Aspek apa yang Bapak/Ibu ingin saya amati dan beri masukan?                                    |                     |
| 8      | Kesepakatan waktu observasi dan pertemuan pasca-observasi.                                     |                     |

### Instrumen B. Telaah perangkat ajar (perencanaan)

*Skala: 4 = Sangat baik (semua indikator terpenuhi dan konsisten); 3 = Baik (sebagian besar terpenuhi); 2 = Cukup (sebagian kecil terpenuhi); 1 = Kurang (belum terpenuhi).*

| **No**                              | **Butir yang dinilai**                                                                       | **1** | **2** | **3** | **4** | **Catatan / bukti** |
|-------------------------------------|----------------------------------------------------------------------------------------------|-------|-------|-------|-------|---------------------|
| **Capaian dan tujuan pembelajaran** |                                                                                              |       |       |       |       |                     |
| 1                                   | CP dan tujuan pembelajaran (TP) sesuai fase dan elemen mata pelajaran                        |       |       |       |       |                     |
| 2                                   | TP dirumuskan operasional, terukur, dan tersusun runtut dalam Alur Tujuan Pembelajaran (ATP) |       |       |       |       |                     |
| 3                                   | Alokasi waktu (JP) sesuai struktur kurikulum SMK                                             |       |       |       |       |                     |
| **Modul ajar**                      |                                                                                              |       |       |       |       |                     |
| 4                                   | Identitas modul, kompetensi awal, dan dimensi profil lulusan sesuai                          |       |       |       |       |                     |
| 5                                   | Model dan metode pembelajaran sesuai karakteristik materi (PjBL, PBL, TeFa, dan sejenisnya)  |       |       |       |       |                     |
| 6                                   | Langkah pembelajaran (pendahuluan, inti, penutup) runtut dan jelas                           |       |       |       |       |                     |
| 7                                   | Pembelajaran berdiferensiasi (materi, proses, produk) dipertimbangkan                        |       |       |       |       |                     |
| 8                                   | Media, bahan ajar, jobsheet, dan sumber belajar sesuai dan tersedia                          |       |       |       |       |                     |
| 9                                   | Kegiatan praktik memuat prosedur keselamatan kerja (K3) bagi mapel produktif                 |       |       |       |       |                     |
| **Asesmen**                         |                                                                                              |       |       |       |       |                     |
| 10                                  | Asesmen diagnostik, formatif, dan sumatif direncanakan                                       |       |       |       |       |                     |
| 11                                  | Instrumen dan rubrik penilaian tersedia dan sesuai TP                                        |       |       |       |       |                     |
| 12                                  | Rencana remedial dan pengayaan tersedia                                                      |       |       |       |       |                     |
| **Program dan administrasi**        |                                                                                              |       |       |       |       |                     |
| 13                                  | Program tahunan dan semester tersedia dan konsisten dengan kalender pendidikan               |       |       |       |       |                     |
| 14                                  | Perangkat lengkap dan dikumpulkan tepat waktu                                                |       |       |       |       |                     |

### Instrumen C. Observasi pembelajaran

*Skala: 4 = Sangat baik (semua indikator terpenuhi dan konsisten); 3 = Baik (sebagian besar terpenuhi); 2 = Cukup (sebagian kecil terpenuhi); 1 = Kurang (belum terpenuhi).*

| **No**                   | **Butir yang dinilai**                                                       | **1** | **2** | **3** | **4** | **Catatan / bukti** |
|--------------------------|------------------------------------------------------------------------------|-------|-------|-------|-------|---------------------|
| **Kegiatan pendahuluan** |                                                                              |       |       |       |       |                     |
| 1                        | Mengondisikan kelas dengan tertib (salam, doa, presensi, kesiapan alat)      |       |       |       |       |                     |
| 2                        | Apersepsi dan motivasi, mengaitkan materi dengan pengalaman atau dunia kerja |       |       |       |       |                     |
| 3                        | Menyampaikan tujuan pembelajaran dan langkah kegiatan                        |       |       |       |       |                     |
| **Kegiatan inti**        |                                                                              |       |       |       |       |                     |
| 4                        | Menguasai materi dan menyampaikan konsep dengan tepat                        |       |       |       |       |                     |
| 5                        | Model dan metode sesuai TP (PjBL, PBL, TeFa, inkuiri, praktikum)             |       |       |       |       |                     |
| 6                        | Pembelajaran berpusat pada peserta didik dan melibatkan mereka secara aktif  |       |       |       |       |                     |
| 7                        | Menerapkan pembelajaran berdiferensiasi sesuai kebutuhan peserta didik       |       |       |       |       |                     |
| 8                        | Memanfaatkan media, alat, dan teknologi digital secara efektif               |       |       |       |       |                     |
| 9                        | Membimbing praktik: prosedur kerja dan penerapan K3 di bengkel/lab           |       |       |       |       |                     |
| 10                       | Mengelola waktu dan alur kegiatan sesuai rencana                             |       |       |       |       |                     |
| 11                       | Berkomunikasi efektif: bahasa, pertanyaan pemantik, dan umpan balik          |       |       |       |       |                     |
| 12                       | Menguatkan karakter dan dimensi profil lulusan                               |       |       |       |       |                     |
| **Asesmen dan penutup**  |                                                                              |       |       |       |       |                     |
| 13                       | Melakukan asesmen formatif selama pembelajaran                               |       |       |       |       |                     |
| 14                       | Membimbing refleksi dan simpulan bersama peserta didik                       |       |       |       |       |                     |
| 15                       | Memberi umpan balik dan tindak lanjut (tugas, remedial, pengayaan)           |       |       |       |       |                     |
| 16                       | Menutup tepat waktu dan merapikan alat serta ruang                           |       |       |       |       |                     |
| **Manajemen kelas**      |                                                                              |       |       |       |       |                     |
| 17                       | Suasana kelas kondusif dan disiplin positif                                  |       |       |       |       |                     |
| 18                       | Keterlibatan dan kehadiran peserta didik terjaga                             |       |       |       |       |                     |

### Instrumen D. Refleksi, umpan balik, dan rencana tindak lanjut

*Diisi pada pertemuan pasca-observasi. Guru mengisi bagian 1; Kajur mengisi bagian 2 dan 3; keduanya menyepakati bagian 4.*

| **Bagian**                | **Isian**                                                                          | **Catatan** |
|---------------------------|------------------------------------------------------------------------------------|-------------|
| 1\. Refleksi guru         | Menurut Bapak/Ibu, apa yang sudah berjalan baik dan apa yang belum sesuai rencana? |             |
|                           | Apa yang akan dilakukan berbeda pada pertemuan berikutnya?                         |             |
| 2\. Kekuatan yang diamati | Praktik baik yang perlu dipertahankan (sebutkan bukti)                             |             |
| 3\. Area pengembangan     | Aspek yang perlu ditingkatkan (sebutkan bukti dan butir instrumen terkait)         |             |
| 4\. Rencana tindak lanjut | Tindakan 1: ...... Tenggat: ...... Bentuk bukti: ......                            |             |
|                           | Tindakan 2: ...... Tenggat: ...... Bentuk bukti: ......                            |             |
|                           | Bentuk pendampingan (diskusi sejawat, pelatihan, observasi ulang)                  |             |
| 5\. Penutup               | Jadwal supervisi lanjutan (jika ada) dan konfirmasi guru telah membaca hasil       |             |

## Lampiran B. Instrumen supervisi manajerial

### Instrumen E. Supervisi manajerial Waka dan Kajur

*Diisi Kepala Sekolah. Butir khusus Kajur ditandai (K); butir khusus Waka Kurikulum ditandai (WK).*

*Skala: 4 = Sangat baik (semua indikator terpenuhi dan konsisten); 3 = Baik (sebagian besar terpenuhi); 2 = Cukup (sebagian kecil terpenuhi); 1 = Kurang (belum terpenuhi).*

| **No**                                  | **Butir yang dinilai**                                                           | **1** | **2** | **3** | **4** | **Catatan / bukti** |
|-----------------------------------------|----------------------------------------------------------------------------------|-------|-------|-------|-------|---------------------|
| **Perencanaan**                         |                                                                                  |       |       |       |       |                     |
| 1                                       | Program kerja tersusun dan selaras dengan RKS/RKT sekolah                        |       |       |       |       |                     |
| 2                                       | Target dan indikator keberhasilan program jelas dan terukur                      |       |       |       |       |                     |
| 3                                       | Pembagian tugas dan jadwal kegiatan tersusun                                     |       |       |       |       |                     |
| **Pelaksanaan**                         |                                                                                  |       |       |       |       |                     |
| 4                                       | Program terlaksana sesuai jadwal dan target                                      |       |       |       |       |                     |
| 5                                       | Koordinasi dengan guru, unit, dan pimpinan berjalan baik                         |       |       |       |       |                     |
| 6                                       | \(K\) Membina dan menyupervisi guru di jurusannya secara terjadwal               |       |       |       |       |                     |
| 7                                       | \(K\) Mengelola sarana bengkel/lab dan keselamatan kerja jurusan                 |       |       |       |       |                     |
| 8                                       | \(K\) Menjalin kerja sama dengan DUDI serta mengelola PKL dan TeFa               |       |       |       |       |                     |
| 9                                       | (WK) Mengelola administrasi kurikulum, jadwal pelajaran, dan perangkat ajar guru |       |       |       |       |                     |
| **Pelaporan dan tindak lanjut**         |                                                                                  |       |       |       |       |                     |
| 10                                      | Laporan berkala disusun lengkap dan tepat waktu                                  |       |       |       |       |                     |
| 11                                      | Data dan dokumentasi akurat serta dapat ditelusuri                               |       |       |       |       |                     |
| 12                                      | Hasil evaluasi ditindaklanjuti dengan perbaikan nyata                            |       |       |       |       |                     |
| **Kepemimpinan dan pemanfaatan sistem** |                                                                                  |       |       |       |       |                     |
| 13                                      | Komunikasi dan kerja sama tim baik                                               |       |       |       |       |                     |
| 14                                      | Inisiatif dan inovasi dalam memperbaiki mutu                                     |       |       |       |       |                     |
| 15                                      | Memanfaatkan SIMKUR untuk pemantauan dan pelaporan                               |       |       |       |       |                     |
