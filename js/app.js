/**
 * SIMKUR — PORTAL WAKA KURIKULUM SMKN 1 BANJARMASIN
 * Berdasarkan PRD_Portal_Waka_Kur_Sederhana.md
 * Modul: Dashboard, Dokumen & Monitoring Administrasi Guru, Jadwal Pelajaran, Data Master
 * Desain: Jobie Admin Dashboard UI (#4B22B8)
 */

(function () {
  'use strict';

  // =========================================================================
  // 1. DATA STORAGE MANAGER (LocalStorage with fallback to SIMKUR_DATA)
  // =========================================================================
  const StorageManager = {
    KEYS: {
      TEACHERS: 'portal_teachers_v2',
      CLASSES: 'portal_classes_v1',
      SUBJECTS: 'portal_subjects_v1',
      ROOMS: 'portal_rooms_v1',
      SCHEDULES: 'portal_schedules_v1',
      DOCUMENTS: 'portal_documents_v1',
      AGENDAS: 'portal_agendas_v1',
      TEACHER_ADMIN: 'portal_teacher_admin_v3',
      GURU_JOURNALS: 'portal_guru_journals_v3',
      GURU_DOCUMENTS: 'portal_guru_documents_v3',
      GURU_ATTENDANCE: 'portal_guru_attendance_v2',
      SUPERVISI_PROGRAM: 'portal_supervisi_program_v1',
      SUPERVISI_SESI: 'portal_supervisi_sesi_v1',
      SUPERVISI_HASIL: 'portal_supervisi_hasil_v1',
      SUPERVISI_RTL: 'portal_supervisi_rtl_v1',
      SUPERVISI_MANAJERIAL: 'portal_supervisi_manajerial_v1',
      SETTINGS: 'portal_system_settings_v1'
    },

    init: function () {
      const data = window.SIMKUR_DATA || {};

      // Always synchronize master teachers with authoritative definitions from data.js
      if (data.masterTeachers && data.masterTeachers.length > 0) {
        localStorage.setItem(this.KEYS.TEACHERS, JSON.stringify(data.masterTeachers));
      } else if (!localStorage.getItem(this.KEYS.TEACHERS)) {
        localStorage.setItem(this.KEYS.TEACHERS, JSON.stringify([]));
      }

      if (data.masterClasses && data.masterClasses.length > 0) {
        localStorage.setItem(this.KEYS.CLASSES, JSON.stringify(data.masterClasses));
      } else if (!localStorage.getItem(this.KEYS.CLASSES)) {
        localStorage.setItem(this.KEYS.CLASSES, JSON.stringify([]));
      }

      if (data.masterSubjects && data.masterSubjects.length > 0) {
        localStorage.setItem(this.KEYS.SUBJECTS, JSON.stringify(data.masterSubjects));
      } else if (!localStorage.getItem(this.KEYS.SUBJECTS)) {
        localStorage.setItem(this.KEYS.SUBJECTS, JSON.stringify([]));
      }

      if (data.masterRooms && data.masterRooms.length > 0) {
        localStorage.setItem(this.KEYS.ROOMS, JSON.stringify(data.masterRooms));
      } else if (!localStorage.getItem(this.KEYS.ROOMS)) {
        localStorage.setItem(this.KEYS.ROOMS, JSON.stringify([]));
      }

      const karhutlaSynced = localStorage.getItem('portal_scheds_karhutla_v2026');
      if (!karhutlaSynced && data.schedules && data.schedules.length > 0) {
        localStorage.setItem(this.KEYS.SCHEDULES, JSON.stringify(data.schedules));
        localStorage.setItem('portal_scheds_karhutla_v2026', 'true');
      } else {
        const storedScheds = localStorage.getItem(this.KEYS.SCHEDULES);
        if (!storedScheds || JSON.parse(storedScheds).length < 50) {
          localStorage.setItem(this.KEYS.SCHEDULES, JSON.stringify(data.schedules || []));
        }
      }
      if (!localStorage.getItem(this.KEYS.DOCUMENTS)) {
        localStorage.setItem(this.KEYS.DOCUMENTS, JSON.stringify(data.documents || []));
      }
      if (!localStorage.getItem(this.KEYS.AGENDAS)) {
        localStorage.setItem(this.KEYS.AGENDAS, JSON.stringify(data.agendas || []));
      }

      // Inisialisasi Monitoring Administrasi Guru: MULAI DARI NOL (Belum ada yang mengumpulkan)
      if (!localStorage.getItem(this.KEYS.TEACHER_ADMIN)) {
        const teachers = this.get('teachers');
        const monitoring = teachers.map(function (t) {
          return {
            teacher_id: t.id,
            name: t.name,
            nip: t.nip || '-',
            department: t.department || 'Umum',
            subject: t.subject || 'Mata Pelajaran',
            rpp_status: 'Belum',
            jurnal_status: 'Belum',
            jurnal_count: 0,
            silabus_status: 'Belum',
            asesmen_status: 'Belum',
            notes: 'Belum mengumpulkan perangkat administrasi',
            updated_at: '-'
          };
        });
        localStorage.setItem(this.KEYS.TEACHER_ADMIN, JSON.stringify(monitoring));
      } else if (data.masterTeachers) {
        // Selaraskan nama guru di TEACHER_ADMIN jika ada pembaruan nama resmi master
        try {
          var adminList = JSON.parse(localStorage.getItem(this.KEYS.TEACHER_ADMIN) || '[]');
          var adminUpdated = false;
          adminList.forEach(function (rec) {
            var mt = data.masterTeachers.find(function (t) {
              return t.id === rec.teacher_id || (t.nip && rec.nip && t.nip === rec.nip);
            });
            if (mt && rec.name !== mt.name) {
              rec.name = mt.name;
              adminUpdated = true;
            }
          });
          if (adminUpdated) {
            localStorage.setItem(this.KEYS.TEACHER_ADMIN, JSON.stringify(adminList));
          }
        } catch (e) {}
      }

      // Perbarui nama di sesi login lokal jika NIP cocok dengan data master yang diperbaiki
      try {
        var rawSess = localStorage.getItem('simkur_session');
        if (rawSess && data.masterTeachers) {
          var currSess = JSON.parse(rawSess);
          if (currSess && currSess.nip) {
            var mtSess = data.masterTeachers.find(function (t) {
              return t.nip && t.nip.replace(/\D/g, '') === currSess.nip.replace(/\D/g, '');
            });
            if (mtSess && currSess.name !== mtSess.name) {
              currSess.name = mtSess.name;
              localStorage.setItem('simkur_session', JSON.stringify(currSess));
            }
          }
        }
      } catch (e) {}

      // Inisialisasi Riwayat Jurnal Guru: KOSONG (0 Jurnal)
      if (!localStorage.getItem(this.KEYS.GURU_JOURNALS)) {
        localStorage.setItem(this.KEYS.GURU_JOURNALS, JSON.stringify([]));
      }

      // Inisialisasi Dokumen Perangkat Ajar Guru: KOSONG (0 Dokumen)
      if (!localStorage.getItem(this.KEYS.GURU_DOCUMENTS)) {
        localStorage.setItem(this.KEYS.GURU_DOCUMENTS, JSON.stringify([]));
      }

      // Inisialisasi Presensi Siswa Guru: KOSONG
      if (!localStorage.getItem(this.KEYS.GURU_ATTENDANCE)) {
        localStorage.setItem(this.KEYS.GURU_ATTENDANCE, JSON.stringify([]));
      }

      // Inisialisasi Program Supervisi Semester (PRD Bagian 8 & Lampiran)
      if (!localStorage.getItem(this.KEYS.SUPERVISI_PROGRAM)) {
        var defaultProg = {
          id: 'PROG-2026-GANJIL',
          tahunAjaran: '2026/2027',
          semester: 'Semester Ganjil',
          periode: '15 Juli s.d. 30 November 2026',
          skNumber: 'SK Kepala SMKN 1 BJM No. 421.5/118/2026',
          targetKetercapaian: '100% (90 Guru)',
          fokus: 'Pembelajaran Berdiferensiasi, TeFa & Penerapan K3 di Bengkel/Lab',
          status: 'Aktif'
        };
        localStorage.setItem(this.KEYS.SUPERVISI_PROGRAM, JSON.stringify(defaultProg));
      }

      // Inisialisasi Sesi Supervisi Akademik (90 Guru) Terpetakan ke Kajur Terkait
      if (!localStorage.getItem(this.KEYS.SUPERVISI_SESI)) {
        var teachersList = this.get('teachers');
        var sessions = [];
        var statusOptions = ['Selesai', 'Pasca-observasi', 'Observasi', 'Pra-observasi', 'Dijadwalkan'];
        
        teachersList.forEach(function (t, idx) {
          var dept = (t.department || 'Umum').toUpperCase();
          var supervisor = { id: 'T-001', name: 'Rusnani, S.Pd., M.T', role: 'Waka Kurikulum' };
          
          if (dept.includes('TJKT') || dept.includes('TKJ')) {
            supervisor = { id: 'K-TJKT', name: 'Muhammad Ihsan, S.Kom', role: 'Kajur TJKT' };
          } else if (dept.includes('DKV') || dept.includes('MM')) {
            supervisor = { id: 'K-DKV', name: 'Hendra Surya Pratama, S.Kom', role: 'Kajur DKV' };
          } else if (dept.includes('AKL') || dept.includes('AKUNTANSI')) {
            supervisor = { id: 'K-AKL', name: 'Oky Wulan Maulina, S.Pd', role: 'Kajur AKL' };
          } else if (dept.includes('MPLB') || dept.includes('OTKP') || dept.includes('PERKANTORAN')) {
            supervisor = { id: 'K-MPLB', name: 'Akhmad Hanafi Maulana, S.E', role: 'Kajur MPLB' };
          } else if (dept.includes('PM') || dept.includes('PEMASARAN') || dept.includes('BD')) {
            supervisor = { id: 'K-PM', name: 'Futri Indri Septiani, S.Pd', role: 'Kajur Pemasaran' };
          }

          // Seeding realistik: 24 Selesai (26.7%), 10 Pasca-obs, 15 Observasi, 15 Pra-obs, 26 Dijadwalkan
          var status = 'Dijadwalkan';
          var skor_b = 0;
          var skor_c = 0;
          var nilai_b = 0;
          var nilai_c = 0;
          var nilai_akhir = 0;
          var predikat = '-';
          var tgl_observasi = '2026-10-' + String(10 + (idx % 20)).padStart(2, '0');
          var wkt_observasi = '08.00 - 09.30 WITA';
          var room = 'R. TeFa / Lab Komputer';

          if (idx < 24) {
            status = 'Selesai';
            // Variasi nilai 82 - 96
            var rawB = 46 + (idx % 9); // max 56
            var rawC = 60 + (idx % 11); // max 72
            skor_b = rawB;
            skor_c = rawC;
            nilai_b = Math.round((rawB / 56) * 100 * 10) / 10;
            nilai_c = Math.round((rawC / 72) * 100 * 10) / 10;
            nilai_akhir = Math.round(((nilai_b * 0.40) + (nilai_c * 0.60)) * 10) / 10;
            predikat = nilai_akhir >= 91 ? 'Amat Baik' : 'Baik';
            tgl_observasi = '2026-08-' + String(10 + (idx % 18)).padStart(2, '0');
          } else if (idx < 34) {
            status = 'Pasca-observasi';
            var rawB2 = 45 + (idx % 7);
            var rawC2 = 58 + (idx % 8);
            skor_b = rawB2;
            skor_c = rawC2;
            nilai_b = Math.round((rawB2 / 56) * 100 * 10) / 10;
            nilai_c = Math.round((rawC2 / 72) * 100 * 10) / 10;
            nilai_akhir = Math.round(((nilai_b * 0.40) + (nilai_c * 0.60)) * 10) / 10;
            predikat = nilai_akhir >= 91 ? 'Amat Baik' : 'Baik';
            tgl_observasi = '2026-09-15';
          } else if (idx < 49) {
            status = 'Observasi';
            var rawB3 = 44 + (idx % 8);
            skor_b = rawB3;
            nilai_b = Math.round((rawB3 / 56) * 100 * 10) / 10;
            tgl_observasi = '2026-09-29';
          } else if (idx < 64) {
            status = 'Pra-observasi';
            tgl_observasi = '2026-10-05';
          }

          sessions.push({
            id: 'SESI-' + String(idx + 1).padStart(3, '0'),
            program_id: 'PROG-2026-GANJIL',
            teacher_id: t.id,
            teacher_name: t.name,
            nip: t.nip || '-',
            department: t.department || 'Umum',
            subject: t.subject || 'Mata Pelajaran',
            class_name: 'XI ' + (t.department || 'TJKT') + ' 1',
            supervisor_id: supervisor.id,
            supervisor_name: supervisor.name,
            supervisor_role: supervisor.role,
            status: status,
            tgl_observasi: tgl_observasi,
            wkt_observasi: wkt_observasi,
            room: room,
            fokus: 'Pembelajaran Berdiferensiasi & Penerapan K3 Lab',
            skor_b: skor_b,
            nilai_b: nilai_b,
            skor_c: skor_c,
            nilai_c: nilai_c,
            nilai_akhir: nilai_akhir,
            predikat: predikat,
            wawancara_a: {
              1: 'Mapel: ' + (t.subject || 'Produktif') + ', materi: Penerapan SOP Industri.',
              2: 'Model Pembelajaran Project Based Learning (PjBL) terpadu Teaching Factory.',
              3: 'Peserta didik memiliki gaya belajar kinestetik dan visual praktikum.',
              4: 'Asesmen unjuk kerja proses dan rubrik jobsheet portofolio.',
              5: 'Tool set, jobsheet digital, APD, dan safety checklist K3 lab.',
              6: 'Beberapa siswa perlu penguatan literasi teknis dan kedisiplinan 5R.',
              7: 'Fokus pengamatan: penerapan diferensiasi bimbingan praktikum.',
              8: 'Disepakati observasi sesuai jadwal dan refleksi H+1.'
            },
            refleksi_d: {
              refleksi_1: 'Pembelajaran interaktif dan jobsheet berhasil diselesaikan oleh sebagian besar kelompok.',
              refleksi_2: 'Akan meningkatkan variasi scaffolding untuk kelompok yang lebih lambat.',
              kekuatan: 'Penguasaan materi sangat baik, komunikasi interaktif, kepatuhan K3 lab tinggi.',
              area_pengembangan: 'Perlu penguatan diferensiasi konten bagi siswa dengan ritme belajar berbeda.',
              guru_confirmed: status === 'Selesai'
            }
          });
        });

        localStorage.setItem(this.KEYS.SUPERVISI_SESI, JSON.stringify(sessions));
      }

      // Inisialisasi Supervisi Manajerial (Waka & 5 Kajur oleh Kepala Sekolah)
      if (!localStorage.getItem(this.KEYS.SUPERVISI_MANAJERIAL)) {
        var manajerialData = [
          {
            id: 'M-001',
            pimpinan_name: 'Rusnani, S.Pd., M.T',
            nip: '197308022000122003',
            jabatan: 'Waka Kurikulum',
            fokus: 'Kurikulum Merdeka, Jadwal KBM, Verifikasi Perangkat Guru, SIMKUR',
            status_dokumen: 'Lengkap (KSP, Kalender, SK PBM)',
            skor_total: 56, // out of 60
            nilai: 93.3,
            predikat: 'Amat Baik',
            catatan_kepsek: 'Pengelolaan kurikulum dan digitalisasi SIMKUR berjalan sangat tertib dan presisi.'
          },
          {
            id: 'M-002',
            pimpinan_name: 'Muhammad Ihsan, S.Kom',
            nip: '198801102022211001',
            jabatan: 'Ketua Jurusan TJKT',
            fokus: 'Program Kerja TJKT, Teaching Factory Mikrotik/Cisco, Laboratorium Jaringan',
            status_dokumen: 'Lengkap (Program Kerja & MoU DUDI)',
            skor_total: 54,
            nilai: 90.0,
            predikat: 'Baik',
            catatan_kepsek: 'Kemitraan DUDI dan pengelolaan lab jaringan sangat aktif. Terus tingkatkan penyerapan lulusan.'
          },
          {
            id: 'M-003',
            pimpinan_name: 'Hendra Surya Pratama, S.Kom',
            nip: '199305162022211001',
            jabatan: 'Ketua Jurusan DKV',
            fokus: 'Studio Kreatif DKV, Produksi Konten TeFa, Portofolio Siswa',
            status_dokumen: 'Lengkap (SOP Studio & Portofolio)',
            skor_total: 52,
            nilai: 86.7,
            predikat: 'Baik',
            catatan_kepsek: 'Hasil karya studio kreatif sangat membanggakan. Perlu penguatan standarisasi K3 studio.'
          },
          {
            id: 'M-004',
            pimpinan_name: 'Oky Wulan Maulina, S.Pd',
            nip: '198910262015032002',
            jabatan: 'Ketua Jurusan AKL',
            fokus: 'Lab Komputer Akuntansi, Bank Mini Sekolah, Sertifikasi LSP-P1',
            status_dokumen: 'Lengkap (SOP Bank Mini & LSP)',
            skor_total: 55,
            nilai: 91.7,
            predikat: 'Amat Baik',
            catatan_kepsek: 'Operasional Bank Mini dan sertifikasi kompetensi akuntansi tertata sangat rapi dan akuntabel.'
          },
          {
            id: 'M-005',
            pimpinan_name: 'Akhmad Hanafi Maulana, S.E',
            nip: '198912152024211025',
            jabatan: 'Ketua Jurusan MPLB',
            fokus: 'Laboratorium Perkantoran Modern, Kearsipan Digital, Simulasi Bisnis',
            status_dokumen: 'Lengkap (Modul Praktik & SOP Lab)',
            skor_total: 51,
            nilai: 85.0,
            predikat: 'Baik',
            catatan_kepsek: 'Simulasi bisnis perkantoran berjalan aktif. Maksimalkan integrasi arsip digital berbasis cloud.'
          },
          {
            id: 'M-006',
            pimpinan_name: 'Futri Indri Septiani, S.Pd',
            nip: '198809172014022001',
            jabatan: 'Ketua Jurusan Pemasaran',
            fokus: 'Business Center / Retail Mart Sekolah, Digital Marketing, E-Commerce',
            status_dokumen: 'Lengkap (SOP Retail & Laporan Keuangan TeFa)',
            skor_total: 53,
            nilai: 88.3,
            predikat: 'Baik',
            catatan_kepsek: 'Retail Mart sekolah memberikan omzet yang konsisten. Pertahankan disiplin kasir dan stok barang.'
          }
        ];
        localStorage.setItem(this.KEYS.SUPERVISI_MANAJERIAL, JSON.stringify(manajerialData));
      }

      // Inisialisasi Pelacak RTL (4 Butir Tindak Lanjut Aktif)
      if (!localStorage.getItem(this.KEYS.SUPERVISI_RTL)) {
        var rtlInitial = [
          {
            id: 'RTL-001',
            sesi_id: 'SESI-025',
            guru_name: 'Wahyu Ramadhan, S.Pd',
            department: 'TJKT',
            subject: 'Dasar Jaringan Komputer',
            tindakan: 'Penyesuaian diferensiasi proses pada jobsheet konfigurasi routing dinamis.',
            pendampingan: 'Diskusi Teman Sejawat (Komunitas Belajar TJKT)',
            tenggat: '2026-10-15',
            bukti: 'Modul Ajar Revisi & Rubrik Penilaian',
            status: 'Terbuka',
            verified_by: null
          },
          {
            id: 'RTL-002',
            sesi_id: 'SESI-026',
            guru_name: 'Aulia Rahmah, S.Sn',
            department: 'DKV',
            subject: 'Desain Grafis Percetakan',
            tindakan: 'Penyempurnaan rubrik asesmen formatif unjuk kerja pre-press dan packaging.',
            pendampingan: 'Pelatihan Mandiri Platform Merdeka Mengajar (PMM)',
            tenggat: '2026-10-20',
            bukti: 'Aksi Nyata PMM & Format Rubrik Baru',
            status: 'Terbuka',
            verified_by: null
          },
          {
            id: 'RTL-003',
            sesi_id: 'SESI-027',
            guru_name: 'Riza Anshari, S.E',
            department: 'AKL',
            subject: 'Praktikum Akuntansi Lembaga',
            tindakan: 'Penerapan checklist SOP K3 dan pembiasaan budaya kerja 5R di lab komputer.',
            pendampingan: 'Observasi Ulang oleh Ketua Jurusan AKL',
            tenggat: '2026-10-25',
            bukti: 'Lembar Checklist 5R Harian',
            status: 'Terbuka',
            verified_by: null
          },
          {
            id: 'RTL-004',
            sesi_id: 'SESI-028',
            guru_name: 'Siti Nurhaliza, S.Pd',
            department: 'Pemasaran',
            subject: 'Penataan Produk / Merchandising',
            tindakan: 'Penyusunan modul ajar proyek kolaboratif berbasis Teaching Factory Retail Mart.',
            pendampingan: 'Pendampingan Guru Penggerak / Kajur PM',
            tenggat: '2026-10-30',
            bukti: 'Modul TeFa & Lembar Evaluasi DUDI',
            status: 'Terbuka',
            verified_by: null
          }
        ];
        localStorage.setItem(this.KEYS.SUPERVISI_RTL, JSON.stringify(rtlInitial));
      }
    },

    get: function (key) {
      try {
        const raw = localStorage.getItem(this.KEYS[key.toUpperCase()]);
        return raw ? JSON.parse(raw) : [];
      } catch (e) {
        console.error('StorageManager error get:', key, e);
        return [];
      }
    },

    set: function (key, items) {
      try {
        localStorage.setItem(this.KEYS[key.toUpperCase()], JSON.stringify(items));
      } catch (e) {
        console.error('StorageManager error set:', key, e);
      }
    },

    add: function (key, item) {
      const items = this.get(key);
      items.unshift(item);
      this.set(key, items);
      if (window.FirebaseService && typeof window.FirebaseService.saveDoc === 'function') {
        window.FirebaseService.saveDoc(key, item.id || item.teacher_id, item);
      }
      return items;
    },

    update: function (key, id, updatedFields) {
      const items = this.get(key);
      const index = items.findIndex(function (i) {
        return String(i.id || i.teacher_id) === String(id);
      });
      if (index !== -1) {
        items[index] = Object.assign({}, items[index], updatedFields);
        this.set(key, items);
        if (window.FirebaseService && typeof window.FirebaseService.saveDoc === 'function') {
          window.FirebaseService.saveDoc(key, id, items[index]);
        }
      }
      return items;
    },

    delete: function (key, id) {
      let items = this.get(key);
      items = items.filter(function (i) {
        return String(i.id || i.teacher_id) !== String(id);
      });
      this.set(key, items);
      if (window.FirebaseService && typeof window.FirebaseService.deleteDoc === 'function') {
        window.FirebaseService.deleteDoc(key, id);
      }
      return items;
    },

    getSetting: function (key, defaultValue) {
      try {
        const raw = localStorage.getItem(this.KEYS.SETTINGS);
        const settings = raw ? JSON.parse(raw) : {};
        return (settings && settings[key] !== undefined) ? settings[key] : (defaultValue !== undefined ? defaultValue : null);
      } catch (e) {
        return defaultValue !== undefined ? defaultValue : null;
      }
    },

    setSetting: function (key, value) {
      try {
        const raw = localStorage.getItem(this.KEYS.SETTINGS);
        const settings = raw ? JSON.parse(raw) : {};
        settings[key] = value;
        localStorage.setItem(this.KEYS.SETTINGS, JSON.stringify(settings));
        return settings;
      } catch (e) {
        console.error('StorageManager error setSetting:', key, e);
      }
    }
  };

  // Expose StorageManager for Firebase integration
  window.PORTAL_STORAGE = StorageManager;

  // =========================================================================
  // 2. STATE & CONFIGURATION
  // =========================================================================
  const State = {
    currentScreen: 'dashboard',
    activeMasterTab: 'teachers',
    activeDocTab: 'teachers', // 'teachers' (monitoring) or 'archives' (dokumen sekolah)
    selectedDay: 'Senin',
    docSearchQuery: '',
    docCategoryFilter: 'all',
    docYearFilter: 'all',
    docTeacherSearchQuery: '',
    docTeacherDeptFilter: 'all',
    docTeacherStatusFilter: 'all',
    docTeacherViewMode: 'card', // 'card' (bebas geser) | 'table'
    docArchiveViewMode: 'card', // 'card' (bebas geser) | 'table'
    masterViewMode: 'card',     // 'card' (bebas geser) | 'table'
    supSesiViewMode: 'card',    // 'card' (bebas geser) | 'table'
    scheduleViewMode: 'table', // 'table' | 'timeline' | 'agenda'
    scheduleDayFilter: 'all',
    scheduleClassFilter: 'all',
    scheduleTeacherFilter: 'all',
    scheduleRoomFilter: 'all',
    scheduleSearchQuery: '',
    dashScheduleQuery: '',
    dashScheduleClassFilter: 'all',
    dashScheduleGradeFilter: 'all', // 'all' | 'X' | 'XI' | 'XII'
    dashScheduleViewMode: 'card', // 'card' | 'table'
    dashScheduleLiveOnly: false,
    masterSearchQuery: '',
    editingItem: null,
    // Teacher Doc Inspection State
    activeAdminTeacherId: null,
    activePreviewDocId: null,
    activeDocFilter: 'all',
    // Portal Guru State
    activeGuruTab: 'jurnal', // 'jurnal' | 'presensi' | 'dokumen' | 'supervisi'
    isGuruDetailOpen: false, // false = Tampilan Beranda Hub (4 Kartu), true = Halaman Khusus Sub-Page
    currentGuruId: 'T-010', // Default Ahmad Gajali
    presensiClass: 'XI A-AKL',
    showAllClassesForGuru: false,
    presensiStudents: [],
    tempJournalPhoto: null,
    // Supervisi State
    activeSupervisiTab: 'dash', // 'dash' | 'sesi' | 'manajerial' | 'rtl' | 'program' | 'laporan'
    activeSupervisiStep: 1,
    activeSupervisiSesiId: null,
    activeSupervisiGuruId: null,
    supervisiSearchQuery: '',
    supervisiDeptFilter: 'all',
    supervisiStatusFilter: 'all',
    currentSupervisiScores: { b: {}, c: {}, e: {} },
    activeManajerialId: 'M-001'
  };

  // =========================================================================
  // 2.1 SECURITY & SANITIZATION HELPER (XSS PREVENTION)
  // =========================================================================
  function escapeHtml(str) {
    if (str === null || str === undefined) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  // =========================================================================
  // 3. TOAST & NOTIFICATION HELPER
  // =========================================================================
  function showToast(message, type) {
    let container = document.getElementById('toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toast-container';
      container.style.cssText = 'position: fixed; bottom: 24px; right: 24px; z-index: 9999; display: flex; flex-direction: column; gap: 8px; pointer-events: none;';
      document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = 'toast-alert' + (type ? ' toast-' + type : '');
    toast.style.cssText = 'background: #262626; color: #ffffff; padding: 0.75rem 1.25rem; border-radius: 10px; margin-top: 8px; box-shadow: 0 4px 14px rgba(0,0,0,0.15); display: flex; align-items: center; gap: 8px; font-size: 0.875rem; font-weight: 500; animation: toastSlideIn 0.25s ease forwards;';

    const icon = type === 'danger' ? '⚠️' : type === 'info' ? 'ℹ️' : '✅';
    toast.innerHTML = '<span>' + icon + '</span><span>' + message + '</span>';

    container.appendChild(toast);
    setTimeout(function () {
      toast.style.opacity = '0';
      toast.style.transition = 'opacity 0.3s ease';
      setTimeout(function () {
        if (toast.parentNode) toast.parentNode.removeChild(toast);
      }, 300);
    }, 3200);
  }

  // =========================================================================
  // 4. MODAL CONTROLLERS
  // =========================================================================
  function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.add('active');
      modal.style.display = 'flex';
      document.body.style.overflow = 'hidden';
    }
  }

  function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.remove('active');
      modal.style.display = 'none';
      document.body.style.overflow = '';
      State.editingItem = null;
    }
  }

  // =========================================================================
  // 5. NAVIGATION CONTROLLER & ROLE-BASED ACCESS CONTROL
  // =========================================================================

  function getUserRoleInfo(session) {
    if (!session) {
      return {
        isWakaKur: true,
        isAdmin: false,
        isKepsek: false,
        isKaprog: false,
        isWakaNonKur: false,
        isKaprogOrWakaNonKur: false,
        isGuruOnly: false,
        accessLevel: 'full'
      };
    }

    var name = (session.name || '').toLowerCase();
    var title = (session.title || '').toLowerCase();
    var role = (session.role || '').toLowerCase();
    var category = (session.category || '').toLowerCase();

    // Waka Kurikulum (hanya Rusnani atau role waka dengan bidang kurikulum)
    var isWakaKur = name.includes('rusnani') || (role === 'waka' && (title.includes('kurikulum') || category.includes('kurikulum')));
    var isAdmin = role === 'admin';
    var isKepsek = role === 'kepsek' || ((title.includes('kepala smk') || title.includes('kepala sekolah')) && !title.includes('wakil') && !title.includes('waka') && !title.includes('wakasek'));

    // Kaprog / Kajur (Ketua Jurusan / Kepala Program Keahlian)
    var isKaprog = role === 'kajur' || 
                   title.includes('kajur') || 
                   title.includes('kaprog') || 
                   title.includes('ketua jurusan') || 
                   title.includes('kepala program') ||
                   category.includes('ketua jurusan');

    // Waka selain Waka Kurikulum (Waka Kesiswaan, Waka Humas, Waka Sarpras, dsb.)
    var isWakaNonKur = !isWakaKur && (
      role === 'waka' || 
      title.includes('waka') || 
      title.includes('wakasek') || 
      title.includes('wakil kepala')
    );

    var isKaprogOrWakaNonKur = isKaprog || isWakaNonKur;
    var isGuruOnly = !isWakaKur && !isAdmin && !isKepsek && !isKaprogOrWakaNonKur;

    var accessLevel = session.accessLevel || 'full';
    if (isWakaKur || isAdmin) accessLevel = 'full';
    else if (isKepsek) accessLevel = 'kepsek';
    else if (isKaprogOrWakaNonKur) accessLevel = 'supervisi-guru';
    else accessLevel = 'guru-only';

    return {
      isWakaKur: isWakaKur,
      isAdmin: isAdmin,
      isKepsek: isKepsek,
      isKaprog: isKaprog,
      isWakaNonKur: isWakaNonKur,
      isKaprogOrWakaNonKur: isKaprogOrWakaNonKur,
      isGuruOnly: isGuruOnly,
      accessLevel: accessLevel
    };
  }

  function handleBrandClick() {
    var session = null;
    try {
      var rawSession = localStorage.getItem('simkur_session');
      if (rawSession) session = JSON.parse(rawSession);
    } catch (e) {}
    var roleInfo = getUserRoleInfo(session);
    if (roleInfo.isKaprogOrWakaNonKur) {
      switchScreen('supervisi');
    } else if (roleInfo.isGuruOnly) {
      switchScreen('portal-guru');
    } else {
      switchScreen('dashboard');
    }
  }

  function switchScreen(screenName) {
    // Access guard: Kaprog dan Waka selain Waka Kur HANYA BISA MEMBUKA Supervisi dan Portal Guru
    try {
      var _sess = JSON.parse(localStorage.getItem('simkur_session') || 'null');
      if (_sess) {
        var roleInfo = getUserRoleInfo(_sess);
        if (roleInfo.isKaprogOrWakaNonKur) {
          var allowed = ['supervisi', 'portal-guru'];
          if (allowed.indexOf(screenName) === -1) {
            screenName = 'supervisi';
          }
        } else if (roleInfo.isGuruOnly) {
          var _restricted = ['dashboard', 'dokumen', 'jadwal', 'data-master', 'supervisi'];
          if (_restricted.indexOf(screenName) !== -1) {
            screenName = 'portal-guru';
          }
        }
      }
    } catch (e) { /* ignore */ }

    State.currentScreen = screenName;

    // Update sidebar navigation links
    document.querySelectorAll('.app-sidebar .nav-item-link').forEach(function (link) {
      if (link.getAttribute('data-screen') === screenName) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });

    // Update mobile bottom navigation
    document.querySelectorAll('.mobile-bottom-nav .bottom-nav-item').forEach(function (btn) {
      if (btn.getAttribute('data-screen') === screenName) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    // Update screen views
    document.querySelectorAll('.screen-view').forEach(function (view) {
      if (view.id === 'screen-' + screenName) {
        view.classList.add('active');
        view.style.display = 'block';
      } else {
        view.classList.remove('active');
        view.style.display = 'none';
      }
    });

    // Update breadcrumb title in topbar
    updateTopbarTitle(screenName);

    // Close mobile sidebar if open
    closeMobileSidebar();

    // Trigger Screen Render
    if (screenName === 'dashboard') renderDashboard();
    else if (screenName === 'dokumen') renderDocuments();
    else if (screenName === 'jadwal') renderSchedules();
    else if (screenName === 'data-master') renderDataMaster();
    else if (screenName === 'portal-guru') {
      State.isGuruDetailOpen = false;
      renderPortalGuru();
    }
    else if (screenName === 'supervisi') renderSupervisi();

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function updateTopbarTitle(screenName) {
    const titleEl = document.getElementById('topbar-active-screen');
    if (!titleEl) return;
    screenName = screenName || State.currentScreen || 'dashboard';
    const isMobile = window.innerWidth <= 768;
    const titles = isMobile ? {
      'dashboard': 'Dashboard',
      'dokumen': 'Dokumen',
      'jadwal': 'Jadwal Pelajaran',
      'data-master': 'Data Master',
      'portal-guru': 'Portal Guru',
      'supervisi': 'Supervisi'
    } : {
      'dashboard': 'Dashboard Kurikulum',
      'dokumen': 'Dokumen & Administrasi',
      'jadwal': 'Jadwal Pelajaran',
      'data-master': 'Data Master Kurikulum',
      'portal-guru': 'Portal Guru — KBM',
      'supervisi': 'Supervisi Akademik & Manajerial'
    };
    titleEl.textContent = titles[screenName] || 'Portal Kurikulum';
  }

  window.addEventListener('resize', function () {
    updateTopbarTitle(State.currentScreen);
  });

  function closeMobileSidebar() {
    document.body.classList.remove('sidebar-open');
    const backdrop = document.getElementById('sidebar-backdrop');
    if (backdrop) backdrop.classList.remove('active');
  }

  // =========================================================================
  // 6. SCREEN 1: DASHBOARD
  // =========================================================================
  function renderDashboard() {
    const teachers = StorageManager.get('teachers');
    const classes = StorageManager.get('classes');
    const docs = StorageManager.get('documents');
    const schedules = StorageManager.get('schedules');
    const agendas = StorageManager.get('agendas');
    const monitoring = StorageManager.get('teacher_admin');

    // 1. KPI Cards
    const elSiswa = document.getElementById('dash-stat-siswa');
    const elGuru = document.getElementById('dash-stat-guru');
    const elKelas = document.getElementById('dash-stat-kelas');
    const elDokumen = document.getElementById('dash-stat-dokumen');

    if (elSiswa) elSiswa.textContent = '1.564';
    if (elGuru) elGuru.textContent = String(teachers.filter(function (t) { return t.is_active; }).length);
    if (elKelas) elKelas.textContent = String(classes.filter(function (c) { return c.is_active; }).length);
    
    // Hitung persentase kelengkapan RPP/Modul Ajar Guru
    const totalTeachers = monitoring.length || 90;
    const rppDone = monitoring.filter(function (m) { return m.rpp_status === 'Lengkap'; }).length;
    const rppPct = totalTeachers > 0 ? ((rppDone / totalTeachers) * 100).toFixed(0) : '0';
    if (elDokumen) elDokumen.textContent = rppPct + '% (' + rppDone + '/' + totalTeachers + ')';
    const elDokumenSub = document.getElementById('dash-stat-dokumen-sub');
    if (elDokumenSub) {
      if (rppDone === 0) {
        elDokumenSub.innerHTML = 'RPP & Modul Ajar • <strong style="color: var(--text-secondary);">Belum ada yang mengumpulkan</strong>';
      } else {
        elDokumenSub.innerHTML = 'RPP & Modul Ajar • <strong style="color: var(--color-success);">' + rppDone + ' Lengkap</strong> (' + (totalTeachers - rppDone) + ' Belum)';
      }
    }

    // 2. Render Jadwal Hari Ini
    renderDashboardSchedule(schedules);

    // 3. Render Agenda Kurikulum
    renderDashboardAgendas(agendas);
  }

  function openKarhutlaModal() {
    openModal('modal-karhutla-timetable');
  }

  function setSchedViewMode(mode) {
    State.dashScheduleViewMode = mode;
    const btnCard = document.getElementById('btn-sched-view-card');
    const btnTable = document.getElementById('btn-sched-view-table');
    const cardContainer = document.getElementById('dash-sched-card-container');
    const tableContainer = document.getElementById('dash-sched-table-container');

    if (btnCard) btnCard.classList.toggle('active', mode === 'card');
    if (btnTable) btnTable.classList.toggle('active', mode === 'table');

    if (cardContainer) cardContainer.style.display = mode === 'card' ? 'block' : 'none';
    if (tableContainer) tableContainer.style.display = mode === 'table' ? 'block' : 'none';

    renderDashboardSchedule(StorageManager.get('schedules'));
  }

  function setSchedGradeFilter(grade, btnEl) {
    State.dashScheduleGradeFilter = grade;
    document.querySelectorAll('.sched-grade-pill:not(.pill-live-only)').forEach(function (b) {
      b.classList.remove('active');
    });
    if (btnEl) btnEl.classList.add('active');
    renderDashboardSchedule(StorageManager.get('schedules'));
  }

  function toggleSchedLiveOnly(btnEl) {
    State.dashScheduleLiveOnly = !State.dashScheduleLiveOnly;
    if (btnEl) {
      btnEl.classList.toggle('active', State.dashScheduleLiveOnly);
    }
    renderDashboardSchedule(StorageManager.get('schedules'));
  }

  function renderDashboardSchedule(schedules) {
    schedules = schedules || StorageManager.get('schedules') || [];
    const day = State.selectedDay || 'Senin';
    const daySchedules = schedules.filter(function (s) {
      return s.day && s.day.toLowerCase() === day.toLowerCase();
    });

    // Populate class filter dropdown on dashboard for this day
    const classSelect = document.getElementById('dash-sched-class');
    if (classSelect) {
      const currentSelected = State.dashScheduleClassFilter || 'all';
      const uniqueClasses = Array.from(new Set(daySchedules.map(function (s) { return s.class_name; }))).sort();
      let optHtml = '<option value="all">Semua Rombel (' + uniqueClasses.length + ' Kelas)</option>';
      uniqueClasses.forEach(function (c) {
        optHtml += '<option value="' + c + '"' + (c === currentSelected ? ' selected' : '') + '>' + c + '</option>';
      });
      classSelect.innerHTML = optHtml;
    }

    const searchQuery = (State.dashScheduleQuery || '').toLowerCase();
    const classFilter = State.dashScheduleClassFilter || 'all';
    const gradeFilter = State.dashScheduleGradeFilter || 'all';
    const liveOnly = State.dashScheduleLiveOnly || false;

    // Detect Current Real Time in WITA (UTC+8)
    const now = new Date();
    const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
    const witaDate = new Date(utc + (3600000 * 8));
    const nowHours = witaDate.getHours();
    const nowMinutes = witaDate.getMinutes();
    const nowTotalMinutes = nowHours * 60 + nowMinutes;
    const nowTimeStr = (nowHours < 10 ? '0' : '') + nowHours + '.' + (nowMinutes < 10 ? '0' : '') + nowMinutes;

    const indonesianDays = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    const todayName = indonesianDays[witaDate.getDay()];
    const isToday = day.toLowerCase() === todayName.toLowerCase();

    function timeToMinutes(t) {
      if (!t) return 0;
      var clean = t.replace(':', '.').split('.');
      return parseInt(clean[0], 10) * 60 + parseInt(clean[1] || '0', 10);
    }

    // Filter day schedules
    let dayFiltered = daySchedules.filter(function (s) {
      const matchClass = classFilter === 'all' || s.class_name === classFilter;
      
      let matchGrade = true;
      if (gradeFilter !== 'all') {
        matchGrade = s.class_name && s.class_name.toUpperCase().startsWith(gradeFilter + ' ');
      }

      const matchSearch = !searchQuery ||
        (s.subject_name && s.subject_name.toLowerCase().includes(searchQuery)) ||
        (s.teacher_name && s.teacher_name.toLowerCase().includes(searchQuery)) ||
        (s.class_name && s.class_name.toLowerCase().includes(searchQuery)) ||
        (s.room_name && s.room_name.toLowerCase().includes(searchQuery));

      var isLive = false;
      if (isToday && s.start_time && s.end_time) {
        var sMin = timeToMinutes(s.start_time);
        var eMin = timeToMinutes(s.end_time);
        isLive = nowTotalMinutes >= sMin && nowTotalMinutes <= eMin;
      }
      s._isLive = isLive;

      if (liveOnly && !isLive) return false;

      return matchClass && matchGrade && matchSearch;
    });

    // Count live classes across all schedules today
    var allLiveTodayCount = 0;
    if (isToday) {
      daySchedules.forEach(function (s) {
        if (s.start_time && s.end_time) {
          var sMin = timeToMinutes(s.start_time);
          var eMin = timeToMinutes(s.end_time);
          if (nowTotalMinutes >= sMin && nowTotalMinutes <= eMin) {
            allLiveTodayCount++;
          }
        }
      });
    }

    // Sort chronologically by start_time, then period_start, then class_name
    dayFiltered.sort(function (a, b) {
      const timeCompare = (a.start_time || '').localeCompare(b.start_time || '');
      if (timeCompare !== 0) return timeCompare;
      const pDiff = (parseInt(a.period_start) || 0) - (parseInt(b.period_start) || 0);
      if (pDiff !== 0) return pDiff;
      return (a.class_name || '').localeCompare(b.class_name || '');
    });

    // Update label in header
    const labelDay = document.getElementById('dash-current-day-label');
    if (labelDay) {
      labelDay.textContent = 'Hari: ' + day + ' • ' + dayFiltered.length + ' Sesi KBM' + 
        (classFilter !== 'all' || searchQuery || gradeFilter !== 'all' || liveOnly ? ' (Tersaring)' : ' • Alokasi Karhutla (07.30 - 16.30 WITA)');
    }

    // Update Live Status Bar
    const liveBar = document.getElementById('dash-sched-live-bar');
    if (liveBar) {
      var isJumat = day.toLowerCase() === 'jumat' || day.toLowerCase() === "jum'at";
      var isBreakTime = false;
      var breakName = '';

      if (isToday) {
        if (!isJumat) {
          if (nowTotalMinutes >= timeToMinutes('10.30') && nowTotalMinutes < timeToMinutes('10.45')) {
            isBreakTime = true;
            breakName = 'Istirahat Pagi (10.30 - 10.45 WITA)';
          } else if (nowTotalMinutes >= timeToMinutes('13.00') && nowTotalMinutes < timeToMinutes('13.30')) {
            isBreakTime = true;
            breakName = 'Istirahat & Sholat Dzuhur (13.00 - 13.30 WITA)';
          }
        } else {
          if (nowTotalMinutes >= timeToMinutes('09.00') && nowTotalMinutes < timeToMinutes('09.30')) {
            isBreakTime = true;
            breakName = 'Istirahat Pagi Jum\'at (09.00 - 09.30 WITA)';
          }
        }
      }

      var liveStatusHtml = '';
      if (isToday) {
        if (isBreakTime) {
          liveStatusHtml = '<span class="dash-live-chip chip-break">☕ ' + breakName + '</span>';
        } else if (allLiveTodayCount > 0) {
          liveStatusHtml = '<span class="dash-live-chip chip-active"><span class="pulse-dot-live"></span> 🟢 ' + allLiveTodayCount + ' Kelas Sedang KBM Aktif</span>';
        } else if (nowTotalMinutes < timeToMinutes('07.30')) {
          liveStatusHtml = '<span class="dash-live-chip chip-waiting">⏳ KBM Belum Dimulai (Mulai 07.30 WITA)</span>';
        } else {
          liveStatusHtml = '<span class="dash-live-chip chip-done">✓ KBM Hari Ini Telah Selesai</span>';
        }
      } else {
        liveStatusHtml = '<span class="dash-live-chip chip-neutral">📅 Pratinjau Jadwal Hari ' + day + '</span>';
      }

      liveBar.innerHTML = '' +
        '<div class="dash-live-bar-left">' +
          '<span class="dash-live-time-badge">🕒 WITA: <strong>' + nowTimeStr + '</strong></span>' +
          liveStatusHtml +
        '</div>' +
        '<div class="dash-live-bar-right">' +
          '<span>Total: <strong>' + dayFiltered.length + ' Sesi Terjadwal</strong> (' + (isJumat ? '4 JP' : '11 JP') + ')</span>' +
        '</div>';
    }

    // Helper for Department badge color
    function getDeptClass(cName) {
      if (!cName) return 'dept-default';
      var upper = cName.toUpperCase();
      if (upper.includes('AKL')) return 'dept-akl';
      if (upper.includes('DKV')) return 'dept-dkv';
      if (upper.includes('MPLB')) return 'dept-mplb';
      if (upper.includes('PM')) return 'dept-pm';
      if (upper.includes('TJKT')) return 'dept-tjkt';
      return 'dept-default';
    }

    function getInitials(name) {
      if (!name) return 'GR';
      var parts = name.split(' ');
      if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
      return name.substring(0, 2).toUpperCase();
    }

    // 1. RENDER CARD VIEW
    const cardContainer = document.getElementById('dash-sched-card-container');
    if (cardContainer) {
      if (dayFiltered.length === 0) {
        cardContainer.innerHTML = '' +
          '<div class="dash-sched-empty">' +
            '<div style="font-size: 2.25rem; margin-bottom: 0.5rem;">📅</div>' +
            '<h4 style="margin: 0 0 4px 0; font-size: 1rem; color: #1E293B;">Tidak ada jadwal KBM yang cocok</h4>' +
            '<p style="margin: 0; font-size: 0.8125rem; color: #64748B;">' +
              (searchQuery || classFilter !== 'all' || gradeFilter !== 'all' || liveOnly
                ? 'Coba sesuaikan filter tingkat, rombel, atau pencarian Anda.'
                : 'Tidak ada sesi KBM untuk hari ' + day + '.') +
            '</p>' +
          '</div>';
      } else {
        // Group schedules by Time Slot
        var slots = {};
        dayFiltered.forEach(function (s) {
          var key = (s.start_time || '07.30') + ' - ' + (s.end_time || '08.15');
          if (!slots[key]) {
            slots[key] = {
              time: key,
              periodStart: s.period_start,
              periodEnd: s.period_end,
              items: []
            };
          }
          slots[key].items.push(s);
        });

        var cardsHtml = '';
        Object.keys(slots).forEach(function (slotKey) {
          var slotObj = slots[slotKey];
          var pLabel = slotObj.periodStart && slotObj.periodEnd 
            ? 'Jam Ke-' + slotObj.periodStart + (slotObj.periodStart !== slotObj.periodEnd ? ' s.d ' + slotObj.periodEnd : '')
            : 'Sesi Pembelajaran';

          cardsHtml += '<div class="dash-sched-slot-group">';
          cardsHtml += '<div class="dash-sched-slot-header">';
          cardsHtml += '  <div class="dash-sched-slot-title">';
          cardsHtml += '    <span class="dash-sched-clock-icon">⏰</span>';
          cardsHtml += '    <strong>' + slotKey + ' WITA</strong>';
          cardsHtml += '    <span class="dash-sched-period-tag">' + pLabel + '</span>';
          cardsHtml += '  </div>';
          cardsHtml += '  <span class="dash-sched-slot-count">' + slotObj.items.length + ' Kelas Aktif</span>';
          cardsHtml += '</div>';

          cardsHtml += '<div class="dash-sched-cards-grid">';
          slotObj.items.forEach(function (s) {
            var deptClass = getDeptClass(s.class_name);
            var initials = getInitials(s.teacher_name);
            var isLiveClass = s._isLive === true;

            cardsHtml += '' +
              '<div class="dash-sched-card ' + (isLiveClass ? 'is-live-card' : '') + '">' +
                '<div class="dash-sched-card-top">' +
                  '<div class="dash-sched-badge-row">' +
                    '<span class="dash-sched-class-badge ' + deptClass + '">' + escapeHtml(s.class_name) + '</span>' +
                    '<span class="dash-sched-jp-pill">' + (s.duration || (s.period_end - s.period_start + 1) || 2) + ' JP</span>' +
                  '</div>' +
                  (isLiveClass ? '<span class="badge-live-now">🟢 LIVE KBM</span>' : '') +
                '</div>' +
                '<h4 class="dash-sched-subj-name">' + escapeHtml(s.subject_name) + '</h4>' +
                '<div class="dash-sched-card-bottom">' +
                  '<div class="dash-sched-teacher-info">' +
                    '<div class="dash-sched-avatar">' + initials + '</div>' +
                    '<span class="dash-sched-teacher-name" title="' + escapeHtml(s.teacher_name) + '">' + escapeHtml(s.teacher_name) + '</span>' +
                  '</div>' +
                  '<div class="dash-sched-room-badge" title="Ruang Belajar">' +
                    '<span>📍 ' + escapeHtml(s.room_name || 'Ruang Kelas') + '</span>' +
                  '</div>' +
                '</div>' +
              '</div>';
          });
          cardsHtml += '</div>'; // end cards-grid
          cardsHtml += '</div>'; // end slot-group
        });

        cardContainer.innerHTML = cardsHtml;
      }
    }

    // 2. RENDER TABLE VIEW
    const tbody = document.getElementById('dash-schedule-tbody');
    if (tbody) {
      if (dayFiltered.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; padding: 2.5rem; color: #888888;">' +
          '<div style="font-size: 2rem; margin-bottom: 0.5rem;">📅</div>' +
          '<strong>Tidak ada jadwal yang cocok untuk hari ' + day + '</strong>' +
          '<p style="font-size: 0.8125rem; color: #999; margin-top: 4px;">' +
          (searchQuery || classFilter !== 'all' || gradeFilter !== 'all' || liveOnly
            ? 'Coba sesuaikan filter tingkat, rombel, atau pencarian Anda.'
            : 'Gunakan menu Jadwal Pelajaran untuk menyusun jadwal.') +
          '</p>' +
          '</td></tr>';
      } else {
        let tableHtml = '';
        dayFiltered.forEach(function (s) {
          var deptClass = getDeptClass(s.class_name);
          var isLiveClass = s._isLive === true;
          var statusBadge = isLiveClass 
            ? '<span class="badge badge-live-table">🟢 KBM Aktif</span>' 
            : '<span class="badge badge-wait-table">⏳ Terjadwal</span>';

          tableHtml += '<tr class="' + (isLiveClass ? 'tr-live-active' : '') + '">' +
            '<td>' +
              '<div style="font-weight: 700; color: #1E293B; font-family: monospace; font-size: 0.875rem;">' + s.start_time + ' - ' + s.end_time + '</div>' +
              '<div style="font-size: 0.6875rem; color: #64748B;">Jam Ke-' + s.period_start + (s.period_start !== s.period_end ? '-' + s.period_end : '') + ' (' + (s.duration || 2) + ' JP)</div>' +
            '</td>' +
            '<td><span class="dash-sched-class-badge ' + deptClass + '">' + escapeHtml(s.class_name) + '</span></td>' +
            '<td><strong style="color: #1E293B; font-size: 0.875rem;">' + escapeHtml(s.subject_name) + '</strong></td>' +
            '<td>' +
              '<div style="display: flex; align-items: center; gap: 6px;">' +
                '<span class="dash-sched-avatar-sm">' + getInitials(s.teacher_name) + '</span>' +
                '<span style="font-size: 0.8125rem; font-weight: 600; color: #334155;">' + escapeHtml(s.teacher_name) + '</span>' +
              '</div>' +
            '</td>' +
            '<td>' +
              '<span class="dash-sched-room-badge-table">📍 ' + escapeHtml(s.room_name || 'Ruang Kelas') + '</span>' +
            '</td>' +
            '<td style="text-align: center;">' + statusBadge + '</td>' +
            '</tr>';
        });
        tbody.innerHTML = tableHtml;
      }
    }
  }

  function filterDashboardSchedule() {
    const searchInput = document.getElementById('dash-sched-search');
    const classSelect = document.getElementById('dash-sched-class');
    State.dashScheduleQuery = searchInput ? searchInput.value.trim() : '';
    State.dashScheduleClassFilter = classSelect ? classSelect.value : 'all';
    renderDashboardSchedule(StorageManager.get('schedules'));
  }

  function selectDashboardDay(dayName, btnEl) {
    State.selectedDay = dayName;
    State.dashScheduleClassFilter = 'all';
    document.querySelectorAll('.day-pill-btn').forEach(function (b) {
      b.classList.remove('active');
    });
    if (btnEl) btnEl.classList.add('active');
    renderDashboardSchedule(StorageManager.get('schedules'));
  }

  function renderDashboardAgendas(agendas) {
    const listEl = document.getElementById('dash-agenda-list');
    if (!listEl) return;

    if (agendas.length === 0) {
      listEl.innerHTML = '<div style="text-align: center; padding: 2rem; color: #999;">Belum ada agenda terdaftar.</div>';
      return;
    }

    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];

    let html = '';
    agendas.forEach(function (a) {
      let dateDisplay = a.date || 'TBA';
      let yearDisplay = '';
      if (a.date && a.date.includes('-')) {
        const parts = a.date.split('-');
        if (parts.length === 3) {
          const mIdx = parseInt(parts[1], 10) - 1;
          dateDisplay = parseInt(parts[2], 10) + ' ' + (months[mIdx] || parts[1]);
          yearDisplay = parts[0];
        }
      }

      html += '<div style="display: flex; gap: 12px; align-items: flex-start; padding: 0.875rem 0; border-bottom: 1px solid var(--border); transition: background 0.15s ease;">' +
        '<div style="background: var(--soft-blue); border: 1px solid var(--soft-blue-border); color: var(--simkur-navy); border-radius: var(--radius-md); padding: 6px 8px; text-align: center; min-width: 68px; flex-shrink: 0;">' +
          '<div style="font-size: 0.8125rem; font-weight: 800; color: var(--simkur-blue); line-height: 1.1;">' + dateDisplay + '</div>' +
          (yearDisplay ? '<div style="font-size: 0.6875rem; font-weight: 600; color: var(--text-secondary); margin-top: 2px;">' + yearDisplay + '</div>' : '') +
        '</div>' +
        '<div style="flex: 1; min-width: 0;">' +
          '<div style="font-weight: 700; font-size: 0.875rem; color: var(--text-primary); line-height: 1.3;">' + a.title + '</div>' +
          '<div style="font-size: 0.775rem; color: var(--text-secondary); margin-top: 3px; line-height: 1.35;">' + (a.description || '-') + '</div>' +
        '</div>' +
        '<button class="btn btn-ghost btn-sm" style="color: var(--color-danger); padding: 4px 6px; border-radius: 4px;" onclick="window.PORTAL_APP.deleteAgenda(\'' + a.id + '\')" title="Hapus Agenda">✕</button>' +
        '</div>';
    });

    listEl.innerHTML = html;
  }

  // =========================================================================
  // 7. SCREEN 2: DOKUMEN & MONITORING ADMINISTRASI GURU
  // =========================================================================
  function renderDocuments() {
    const monitoring = StorageManager.get('teacher_admin');
    const docs = StorageManager.get('documents');
    const totalTeachers = monitoring.length || 90;

    // 1. Hitung Statistik Monitoring Administrasi Guru (Card Metrik)
    const rppLengkap = monitoring.filter(function (m) { return m.rpp_status === 'Lengkap'; }).length;
    const rppReview = monitoring.filter(function (m) { return m.rpp_status === 'Review'; }).length;
    const rppBelum = monitoring.filter(function (m) { return m.rpp_status === 'Belum'; }).length;
    const rppPct = ((rppLengkap / totalTeachers) * 100).toFixed(1);

    const jurnalSudah = monitoring.filter(function (m) { return m.jurnal_status === 'Sudah'; }).length;
    const jurnalBelum = totalTeachers - jurnalSudah;
    const jurnalPct = ((jurnalSudah / totalTeachers) * 100).toFixed(1);

    const silabusLengkap = monitoring.filter(function (m) { return m.silabus_status === 'Lengkap'; }).length;
    const silabusBelum = totalTeachers - silabusLengkap;
    const silabusPct = ((silabusLengkap / totalTeachers) * 100).toFixed(1);

    const asesmenLengkap = monitoring.filter(function (m) { return m.asesmen_status === 'Lengkap'; }).length;
    const asesmenBelum = totalTeachers - asesmenLengkap;
    const asesmenPct = ((asesmenLengkap / totalTeachers) * 100).toFixed(1);

    // Update 4 Card DOM Elements
    // Card 1: RPP & Modul Ajar
    const elRppCount = document.getElementById('stat-rpp-count');
    const elRppPct = document.getElementById('stat-rpp-pct');
    const elRppSub = document.getElementById('stat-rpp-sub');
    const elRppBar = document.getElementById('stat-rpp-bar');
    if (elRppCount) elRppCount.textContent = rppLengkap + ' / ' + totalTeachers + ' Guru';
    if (elRppPct) elRppPct.textContent = rppPct + '%';
    if (elRppSub) elRppSub.textContent = rppLengkap + ' Lengkap • ' + rppReview + ' Review • ' + rppBelum + ' Belum';
    if (elRppBar) elRppBar.style.width = rppPct + '%';

    // Card 2: Jurnal Mengajar Bulan Ini
    const elJurnalCount = document.getElementById('stat-jurnal-count');
    const elJurnalPct = document.getElementById('stat-jurnal-pct');
    const elJurnalSub = document.getElementById('stat-jurnal-sub');
    const elJurnalBar = document.getElementById('stat-jurnal-bar');
    if (elJurnalCount) elJurnalCount.textContent = jurnalSudah + ' / ' + totalTeachers + ' Guru';
    if (elJurnalPct) elJurnalPct.textContent = jurnalPct + '%';
    if (elJurnalSub) elJurnalSub.textContent = jurnalSudah + ' Aktif Mengisi • ' + jurnalBelum + ' Belum Mengisi';
    if (elJurnalBar) elJurnalBar.style.width = jurnalPct + '%';

    // Card 3: Silabus & ATP
    const elSilabusCount = document.getElementById('stat-silabus-count');
    const elSilabusPct = document.getElementById('stat-silabus-pct');
    const elSilabusSub = document.getElementById('stat-silabus-sub');
    const elSilabusBar = document.getElementById('stat-silabus-bar');
    if (elSilabusCount) elSilabusCount.textContent = silabusLengkap + ' / ' + totalTeachers + ' Guru';
    if (elSilabusPct) elSilabusPct.textContent = silabusPct + '%';
    if (elSilabusSub) elSilabusSub.textContent = silabusLengkap + ' Terverifikasi • ' + silabusBelum + ' Belum';
    if (elSilabusBar) elSilabusBar.style.width = silabusPct + '%';

    // Card 4: Perangkat Asesmen
    const elAsesmenCount = document.getElementById('stat-asesmen-count');
    const elAsesmenPct = document.getElementById('stat-asesmen-pct');
    const elAsesmenSub = document.getElementById('stat-asesmen-sub');
    const elAsesmenBar = document.getElementById('stat-asesmen-bar');
    if (elAsesmenCount) elAsesmenCount.textContent = asesmenLengkap + ' / ' + totalTeachers + ' Guru';
    if (elAsesmenPct) elAsesmenPct.textContent = asesmenPct + '%';
    if (elAsesmenSub) elAsesmenSub.textContent = asesmenLengkap + ' Terkumpul • ' + asesmenBelum + ' Pending';
    if (elAsesmenBar) elAsesmenBar.style.width = asesmenPct + '%';

    const elArchiveCount = document.getElementById('doc-archive-count');
    if (elArchiveCount) elArchiveCount.textContent = String(docs.length);
    const elArchiveCountMob = document.getElementById('doc-archive-count-mob');
    if (elArchiveCountMob) elArchiveCountMob.textContent = String(docs.length);

    // 2. Render Subtab Aktif
    const currentTab = State.activeDocTab || 'teachers';
    document.querySelectorAll('.doc-subtab-btn').forEach(function (btn) {
      if (btn.getAttribute('data-doc-tab') === currentTab) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    const paneTeachers = document.getElementById('doc-pane-teachers');
    const paneArchives = document.getElementById('doc-pane-archives');

    if (currentTab === 'teachers') {
      if (paneTeachers) paneTeachers.style.display = 'block';
      if (paneArchives) paneArchives.style.display = 'none';
      renderTeacherAdminTable(monitoring);
    } else {
      if (paneTeachers) paneTeachers.style.display = 'none';
      if (paneArchives) paneArchives.style.display = 'block';
      renderArchiveDocsTable(docs);
    }
    updateDriveUIElements();
  }

  function switchDocTab(tabName) {
    State.activeDocTab = tabName;
    renderDocuments();
  }

  // 7.1 TAB MONITORING KELENGKAPAN GURU (90 GURU) - RESPONSIVE BEBAS GESER
  function setTeacherDocViewMode(mode) {
    State.docTeacherViewMode = mode;
    const cardCont = document.getElementById('teacher-admin-cards-container');
    const tableCont = document.getElementById('teacher-admin-table-container');
    const btnCard = document.getElementById('btn-doc-mode-card');
    const btnTable = document.getElementById('btn-doc-mode-table');

    if (btnCard) btnCard.classList.toggle('active', mode === 'card');
    if (btnTable) btnTable.classList.toggle('active', mode === 'table');

    if (cardCont) cardCont.style.display = (mode === 'card') ? 'flex' : 'none';
    if (tableCont) tableCont.style.display = (mode === 'table') ? 'block' : 'none';
  }

  function getTeacherInitials(name) {
    if (!name) return 'GTK';
    var clean = name.replace(/^(Drs\.|Dra\.|Ir\.|H\.|Hj\.)\s+/i, '').replace(/,\s*.*$/, '').trim();
    var parts = clean.split(/\s+/).filter(Boolean);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    } else if (parts.length === 1 && parts[0].length >= 2) {
      return parts[0].substring(0, 2).toUpperCase();
    }
    return 'GTK';
  }

  function getDeptClass(dept) {
    if (!dept) return 'umum';
    var d = dept.toLowerCase().trim();
    if (d.indexOf('tjkt') !== -1) return 'tjkt';
    if (d.indexOf('dkv') !== -1) return 'dkv';
    if (d.indexOf('mplb') !== -1) return 'mplb';
    if (d.indexOf('akl') !== -1) return 'akl';
    if (d.indexOf('pemasaran') !== -1 || d === 'pm') return 'pemasaran';
    if (d.indexOf('bk') !== -1) return 'bk';
    if (d.indexOf('manajemen') !== -1) return 'manajemen';
    if (d.indexOf('tata usaha') !== -1 || d.indexOf('tu') !== -1) return 'tu';
    return 'umum';
  }

  function renderTeacherAdminTable(monitoring) {
    const tbody = document.getElementById('teacher-admin-tbody');
    const cardsContainer = document.getElementById('teacher-admin-cards-container');
    const badgeTotal = document.getElementById('doc-teacher-total-badge');
    if (!tbody && !cardsContainer) return;

    const q = (State.docTeacherSearchQuery || '').toLowerCase();
    const deptFilter = State.docTeacherDeptFilter || 'all';
    const statusFilter = State.docTeacherStatusFilter || 'all';

    const filtered = monitoring.filter(function (m) {
      const matchesSearch = !q ||
        (m.name && m.name.toLowerCase().includes(q)) ||
        (m.nip && m.nip.includes(q)) ||
        (m.subject && m.subject.toLowerCase().includes(q));

      const matchesDept = deptFilter === 'all' || m.department === deptFilter ||
        (deptFilter === 'PM' && m.department === 'Pemasaran') ||
        (deptFilter === 'Pemasaran' && m.department === 'PM');

      let matchesStatus = true;
      const isComplete = m.rpp_status === 'Lengkap' && m.jurnal_status === 'Sudah' && m.silabus_status === 'Lengkap';
      if (statusFilter === 'complete') matchesStatus = isComplete;
      else if (statusFilter === 'incomplete') matchesStatus = !isComplete;

      return matchesSearch && matchesDept && matchesStatus;
    });

    if (badgeTotal) badgeTotal.textContent = filtered.length + ' / ' + monitoring.length + ' Guru Ditampilkan';

    if (filtered.length === 0) {
      if (cardsContainer) {
        cardsContainer.innerHTML = '<div style="text-align: center; padding: 3rem 1.5rem; background: #FFFFFF; border-radius: 16px; border: 1.5px dashed #CBD5E1; color: #64748B;">' +
          '<div style="font-size: 2.25rem; margin-bottom: 0.5rem;">🔍</div>' +
          '<h4 style="font-weight: 700; color: #1E293B; margin-bottom: 4px;">Tidak Ada Data Guru yang Sesuai</h4>' +
          '<p style="font-size: 0.8125rem; color: #94A3B8; margin: 0;">Ubah filter jurusan/status atau bersihkan kata kunci pencarian.</p>' +
          '</div>';
      }
      if (tbody) {
        tbody.innerHTML = '<tr><td colspan="10" style="text-align: center; padding: 2.5rem; color: #888888;">' +
          '<strong>Tidak ada data guru yang sesuai dengan filter pencarian</strong>' +
          '<p style="font-size: 0.8125rem; color: #999; margin-top: 4px;">Ubah filter atau bersihkan kolom pencarian.</p>' +
          '</td></tr>';
      }
      return;
    }

    const allGuruDocs = StorageManager.get('guru_documents') || [];
    const allGuruJournals = StorageManager.get('guru_journals') || [];
    const allSupervisiSesi = StorageManager.get('supervisi_sesi') || [];

    let cardsHtml = '';
    let tableHtml = '';

    filtered.forEach(function (m, idx) {
      const teacherDocs = allGuruDocs.filter(function (d) { return String(d.teacher_id) === String(m.teacher_id); });
      const teacherJournals = allGuruJournals.filter(function (j) { return String(j.teacher_id) === String(m.teacher_id); });

      const rppDocs = teacherDocs.filter(function (d) { return d.category === 'Modul Ajar' || d.category === 'RPP'; });
      const silabusDocs = teacherDocs.filter(function (d) { return d.category === 'Silabus & ATP' || d.category === 'Silabus'; });
      const asesmenDocs = teacherDocs.filter(function (d) { return d.category === 'Instrumen Asesmen' || d.category === 'Asesmen'; });

      // Badge RPP / Modul Ajar
      let rppBadge = '';
      if (rppDocs.length > 0) {
        rppBadge = '<button type="button" class="btn-table-doc-pill doc-pill-success" onclick="window.PORTAL_APP.openTeacherAdminFilesModal(\'' + m.teacher_id + '\', \'Modul Ajar\')" title="Klik untuk melihat isi ' + rppDocs.length + ' berkas RPP / Modul Ajar">' +
          '📄 Ada (' + rppDocs.length + ')' +
          '</button>';
      } else if (m.rpp_status === 'Lengkap') {
        rppBadge = '<span class="badge badge-success" style="font-size: 0.75rem;">✅ Lengkap</span>';
      } else if (m.rpp_status === 'Review') {
        rppBadge = '<button type="button" class="btn-table-doc-pill doc-pill-warning" onclick="window.PORTAL_APP.openTeacherAdminFilesModal(\'' + m.teacher_id + '\', \'Modul Ajar\')" title="Sedang direview. Klik untuk periksa">' +
          '⏳ Review' +
          '</button>';
      } else {
        rppBadge = '<button type="button" class="btn-table-doc-pill doc-pill-empty" onclick="window.PORTAL_APP.openTeacherAdminFilesModal(\'' + m.teacher_id + '\', \'Modul Ajar\')" title="Belum mengunggah. Klik untuk periksa / unggah berkas">' +
          '❌ Belum' +
          '</button>';
      }

      // Badge Jurnal Mengajar
      let jurnalBadge = '';
      if (teacherJournals.length > 0) {
        jurnalBadge = '<button type="button" class="btn-table-doc-pill doc-pill-primary" onclick="window.PORTAL_APP.openTeacherAdminFilesModal(\'' + m.teacher_id + '\', \'jurnal\')" title="Klik untuk membaca riwayat ' + teacherJournals.length + ' sesi jurnal KBM">' +
          '📘 ' + teacherJournals.length + ' Sesi' +
          '</button>';
      } else if (m.jurnal_status === 'Sudah') {
        jurnalBadge = '<span class="badge badge-primary" style="font-size: 0.75rem;">✅ ' + (m.jurnal_count || 1) + ' Sesi</span>';
      } else {
        jurnalBadge = '<span class="badge badge-danger" style="font-size: 0.75rem;">❌ 0 Sesi</span>';
      }

      // Badge Silabus & ATP
      let silabusBadge = '';
      if (silabusDocs.length > 0) {
        silabusBadge = '<button type="button" class="btn-table-doc-pill doc-pill-success" onclick="window.PORTAL_APP.openTeacherAdminFilesModal(\'' + m.teacher_id + '\', \'Silabus & ATP\')" title="Klik untuk melihat isi ' + silabusDocs.length + ' berkas Silabus & ATP">' +
          '📄 Ada (' + silabusDocs.length + ')' +
          '</button>';
      } else if (m.silabus_status === 'Lengkap') {
        silabusBadge = '<span class="badge badge-success" style="font-size: 0.75rem;">✅ Ada</span>';
      } else {
        silabusBadge = '<button type="button" class="btn-table-doc-pill doc-pill-empty" onclick="window.PORTAL_APP.openTeacherAdminFilesModal(\'' + m.teacher_id + '\', \'Silabus & ATP\')" title="Belum mengunggah. Klik untuk periksa / unggah berkas">' +
          '❌ Belum' +
          '</button>';
      }

      // Badge Instrumen Asesmen
      let asesmenBadge = '';
      if (asesmenDocs.length > 0) {
        asesmenBadge = '<button type="button" class="btn-table-doc-pill doc-pill-success" onclick="window.PORTAL_APP.openTeacherAdminFilesModal(\'' + m.teacher_id + '\', \'Instrumen Asesmen\')" title="Klik untuk melihat isi ' + asesmenDocs.length + ' berkas Asesmen">' +
          '📄 Ada (' + asesmenDocs.length + ')' +
          '</button>';
      } else if (m.asesmen_status === 'Lengkap') {
        asesmenBadge = '<span class="badge badge-success" style="font-size: 0.75rem;">✅ Ada</span>';
      } else {
        asesmenBadge = '<button type="button" class="btn-table-doc-pill doc-pill-empty" onclick="window.PORTAL_APP.openTeacherAdminFilesModal(\'' + m.teacher_id + '\', \'Instrumen Asesmen\')" title="Belum mengunggah. Klik untuk periksa / unggah berkas">' +
          '❌ Belum' +
          '</button>';
      }

      // Overall Status
      const isAllDone = m.rpp_status === 'Lengkap' && m.jurnal_status === 'Sudah' && m.silabus_status === 'Lengkap';
      const isNoneDone = (!m.rpp_status || m.rpp_status === 'Belum') && (!m.jurnal_status || m.jurnal_status === 'Belum') && (!m.silabus_status || m.silabus_status === 'Belum') && teacherDocs.length === 0;
      let statusPill = '<span class="teacher-overall-badge badge-empty">⚪ Belum Ada</span>';
      let tableStatusPill = '<span class="badge" style="background: #F1F5F9; color: #64748B; font-weight: 700; font-size: 0.75rem;">Belum Ada</span>';
      if (isAllDone) {
        statusPill = '<span class="teacher-overall-badge badge-complete">✅ Lengkap (100%)</span>';
        tableStatusPill = '<span class="badge" style="background: #E8FAF3; color: #20C985; font-weight: 700; font-size: 0.75rem;">Lengkap</span>';
      } else if (teacherDocs.length > 0 || !isNoneDone) {
        statusPill = '<span class="teacher-overall-badge badge-partial">🟡 Ada Berkas (' + teacherDocs.length + ')</span>';
        tableStatusPill = '<span class="badge" style="background: #FEF3C7; color: #D97706; font-weight: 700; font-size: 0.75rem;">Ada Berkas (' + teacherDocs.length + ')</span>';
      }

      // Supervisi Column (PRD FR-18)
      var supSesi = allSupervisiSesi.find(function (s) {
        return String(s.teacher_id) === String(m.teacher_id);
      });
      var supervisiBadge = '';
      if (supSesi) {
        if (supSesi.status === 'Selesai') {
          supervisiBadge = '<button type="button" class="btn-table-doc-pill doc-pill-success" onclick="window.PORTAL_APP.openSupervisiKlinisModal(\'' + supSesi.id + '\')" title="Supervisi Selesai • Skor: ' + supSesi.nilai_akhir + ' (' + supSesi.predikat + '). Klik untuk lihat">' +
            '⭐ ' + Math.round(supSesi.nilai_akhir) + ' (' + supSesi.predikat + ')' +
            '</button>';
        } else if (supSesi.status === 'Pasca-observasi') {
          supervisiBadge = '<button type="button" class="btn-table-doc-pill doc-pill-warning" onclick="window.PORTAL_APP.openSupervisiKlinisModal(\'' + supSesi.id + '\')" title="Tahap Pasca-observasi & RTL">' +
            '💡 Pasca-Obs' +
            '</button>';
        } else if (supSesi.status === 'Observasi') {
          supervisiBadge = '<button type="button" class="btn-table-doc-pill doc-pill-warning" onclick="window.PORTAL_APP.openSupervisiKlinisModal(\'' + supSesi.id + '\')" title="Tahap Observasi KBM">' +
            '🔍 Observasi' +
            '</button>';
        } else if (supSesi.status === 'Pra-observasi') {
          supervisiBadge = '<button type="button" class="btn-table-doc-pill doc-pill-primary" onclick="window.PORTAL_APP.openSupervisiKlinisModal(\'' + supSesi.id + '\')" title="Tahap Pra-observasi Dokumen">' +
            '📝 Pra-Obs' +
            '</button>';
        } else {
          supervisiBadge = '<button type="button" class="btn-table-doc-pill doc-pill-empty" onclick="window.PORTAL_APP.openSupervisiKlinisModal(\'' + supSesi.id + '\')" title="Terjadwal: ' + (supSesi.tgl_observasi || '-') + '">' +
            '📅 Terjadwal' +
            '</button>';
        }
      } else {
        supervisiBadge = '<button type="button" class="btn-table-doc-pill doc-pill-empty" onclick="window.PORTAL_APP.openSupervisiKlinisModal(\'' + m.teacher_id + '\')" title="Belum Terjadwal. Klik untuk mulai supervisi">' +
          '➕ Mulai' +
          '</button>';
      }

      var initials = getTeacherInitials(m.name);
      var deptClass = getDeptClass(m.department);

      // 1. RESPONSIVE CARD HTML (ZERO HORIZONTAL SCROLL)
      cardsHtml += '<div class="teacher-admin-card" id="teacher-card-' + m.teacher_id + '">' +
        '  <div class="teacher-card-main-row">' +
        '    <div class="teacher-card-profile-section">' +
        '      <div class="teacher-card-num">#' + (idx + 1) + '</div>' +
        '      <div class="teacher-card-avatar avatar-' + deptClass + '">' + initials + '</div>' +
        '      <div class="teacher-card-info">' +
        '        <div class="teacher-card-title-line">' +
        '          <h4 class="teacher-card-name">' + m.name + '</h4>' +
        '          <span class="dept-badge badge-' + deptClass + '">' + (m.department || 'Umum') + '</span>' +
        '        </div>' +
        '        <div class="teacher-card-meta-line">' +
        '          <span class="teacher-card-nip">NIP. ' + (m.nip || '-') + '</span>' +
        '          <span class="meta-separator">•</span>' +
        '          <span class="teacher-card-subject">' + (m.subject || '-') + '</span>' +
        '        </div>' +
        '      </div>' +
        '    </div>' +
        '    <div class="teacher-card-header-actions">' +
        '      <div class="teacher-card-status-badge">' + statusPill + '</div>' +
        '      <div class="teacher-card-quick-actions">' +
        '        <button type="button" class="btn btn-primary btn-sm teacher-action-btn" onclick="window.PORTAL_APP.openTeacherAdminFilesModal(\'' + m.teacher_id + '\')" title="Lihat Berkas Administrasi & Jurnal Guru">' +
        '          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>' +
        '          <span>Berkas (' + teacherDocs.length + ')</span>' +
        '        </button>' +
        '        <button type="button" class="btn btn-outline btn-sm teacher-action-btn" onclick="window.PORTAL_APP.openTeacherAdminModal(\'' + m.teacher_id + '\')" title="Update Status Kelengkapan Administrasi">' +
        '          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>' +
        '          <span>Status</span>' +
        '        </button>' +
        '        <button type="button" class="btn btn-wa-action btn-sm teacher-action-btn" onclick="window.PORTAL_APP.notifyTeacherWA(\'' + m.teacher_id + '\')" title="Kirim Pesan Pengingat WhatsApp ke Guru">' +
        '          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>' +
        '          <span>WA</span>' +
        '        </button>' +
        '      </div>' +
        '    </div>' +
        '  </div>' +
        '  <div class="teacher-card-pillars-deck">' +
        '    <div class="teacher-pillar-item">' +
        '      <div class="pillar-label">RPP / Modul</div>' +
        '      <div class="pillar-pill-wrap">' + rppBadge + '</div>' +
        '    </div>' +
        '    <div class="teacher-pillar-item">' +
        '      <div class="pillar-label">Jurnal KBM</div>' +
        '      <div class="pillar-pill-wrap">' + jurnalBadge + '</div>' +
        '    </div>' +
        '    <div class="teacher-pillar-item">' +
        '      <div class="pillar-label">Silabus & ATP</div>' +
        '      <div class="pillar-pill-wrap">' + silabusBadge + '</div>' +
        '    </div>' +
        '    <div class="teacher-pillar-item">' +
        '      <div class="pillar-label">Instrumen Asesmen</div>' +
        '      <div class="pillar-pill-wrap">' + asesmenBadge + '</div>' +
        '    </div>' +
        '    <div class="teacher-pillar-item">' +
        '      <div class="pillar-label">Supervisi Klinis</div>' +
        '      <div class="pillar-pill-wrap">' + supervisiBadge + '</div>' +
        '    </div>' +
        '  </div>' +
        '</div>';

      // 2. COMPACT TABLE HTML
      tableHtml += '<tr>' +
        '<td style="text-align: center; color: #888; font-size: 0.8125rem;">' + (idx + 1) + '</td>' +
        '<td>' +
        '<div style="font-weight: 700; color: #262626;">' + m.name + '</div>' +
        '<div style="font-size: 0.75rem; color: #777777; font-family: monospace;">NIP. ' + (m.nip || '-') + '</div>' +
        '</td>' +
        '<td>' +
        '<div><span class="badge badge-neutral" style="font-size: 0.75rem;">' + (m.department || 'Umum') + '</span></div>' +
        '<div style="font-size: 0.775rem; color: #555; margin-top: 2px;">' + (m.subject || '-') + '</div>' +
        '</td>' +
        '<td>' + rppBadge + '</td>' +
        '<td>' + jurnalBadge + '</td>' +
        '<td>' + silabusBadge + '</td>' +
        '<td>' + asesmenBadge + '</td>' +
        '<td>' + tableStatusPill + '</td>' +
        '<td>' + supervisiBadge + '</td>' +
        '<td>' +
        '<div style="display: flex; gap: 4px; align-items: center;">' +
        '<button class="btn btn-primary btn-sm" onclick="window.PORTAL_APP.openTeacherAdminFilesModal(\'' + m.teacher_id + '\')" title="Lihat Berkas Administrasi & Jurnal Guru Ini" style="display: inline-flex; align-items: center; gap: 4px; font-size: 0.75rem; font-weight: 700; padding: 0.28rem 0.6rem;">' +
        '👁️ Berkas (' + teacherDocs.length + ')' +
        '</button>' +
        '<button class="btn btn-outline btn-sm" onclick="window.PORTAL_APP.openTeacherAdminModal(\'' + m.teacher_id + '\')" title="Update Status Kelengkapan" style="font-size: 0.75rem; padding: 0.28rem 0.5rem;">' +
        '⚙️' +
        '</button>' +
        '<button class="btn btn-ghost btn-sm" onclick="window.PORTAL_APP.notifyTeacherWA(\'' + m.teacher_id + '\')" title="Kirim Pesan WhatsApp ke Guru" style="font-size: 0.85rem; padding: 0.28rem 0.45rem; color: #16A34A;">' +
        '💬' +
        '</button>' +
        '</div>' +
        '</td>' +
        '</tr>';
    });

    if (cardsContainer) cardsContainer.innerHTML = cardsHtml;
    if (tbody) tbody.innerHTML = tableHtml;

    // Sync view mode visibility
    setTeacherDocViewMode(State.docTeacherViewMode || 'card');
  }

  function openTeacherAdminModal(teacherId) {
    const monitoring = StorageManager.get('teacher_admin');
    const teacher = monitoring.find(function (m) {
      return String(m.teacher_id) === String(teacherId);
    });

    if (!teacher) return;

    document.getElementById('input-admin-teacher-id').value = teacher.teacher_id;
    document.getElementById('admin-modal-teacher-name').textContent = teacher.name;
    document.getElementById('admin-modal-teacher-meta').textContent = 'NIP: ' + (teacher.nip || '-') + ' • Jurusan: ' + teacher.department + ' • Mapel: ' + teacher.subject;

    document.getElementById('select-admin-rpp').value = teacher.rpp_status || 'Lengkap';
    document.getElementById('select-admin-jurnal').value = teacher.jurnal_status || 'Sudah';
    document.getElementById('input-admin-jurnal-count').value = teacher.jurnal_count || 12;
    document.getElementById('select-admin-silabus').value = teacher.silabus_status || 'Lengkap';
    document.getElementById('select-admin-asesmen').value = teacher.asesmen_status || 'Lengkap';
    document.getElementById('input-admin-notes').value = teacher.notes || '';

    openModal('modal-teacher-admin');
  }

  function handleSaveTeacherAdmin(e) {
    e.preventDefault();
    const teacherId = document.getElementById('input-admin-teacher-id').value;
    const rpp = document.getElementById('select-admin-rpp').value;
    const jurnal = document.getElementById('select-admin-jurnal').value;
    const jurnalCount = parseInt(document.getElementById('input-admin-jurnal-count').value, 10) || 0;
    const silabus = document.getElementById('select-admin-silabus').value;
    const asesmen = document.getElementById('select-admin-asesmen').value;
    const notes = document.getElementById('input-admin-notes').value.trim();

    StorageManager.update('teacher_admin', teacherId, {
      rpp_status: rpp,
      jurnal_status: jurnal,
      jurnal_count: jurnal === 'Sudah' ? Math.max(1, jurnalCount) : 0,
      silabus_status: silabus,
      asesmen_status: asesmen,
      notes: notes,
      updated_at: new Date().toISOString().split('T')[0]
    });

    closeModal('modal-teacher-admin');
    showToast('Status administrasi guru berhasil diperbarui!');
    renderDocuments();
    renderDashboard();
  }

  function exportAdminRecap() {
    const monitoring = StorageManager.get('teacher_admin');
    let csv = 'No,Nama Guru,NIP,Departemen,Mapel,RPP / Modul Ajar,Jurnal Mengajar,Sesi KBM,Silabus & ATP,Asesmen,Status Akhir\n';

    monitoring.forEach(function (m, idx) {
      const isAllDone = m.rpp_status === 'Lengkap' && m.jurnal_status === 'Sudah' && m.silabus_status === 'Lengkap';
      csv += (idx + 1) + ',"' +
        m.name + '","' +
        m.nip + '","' +
        m.department + '","' +
        m.subject + '","' +
        m.rpp_status + '","' +
        m.jurnal_status + '",' +
        m.jurnal_count + ',"' +
        m.silabus_status + '","' +
        m.asesmen_status + '","' +
        (isAllDone ? 'Lengkap' : 'Belum Lengkap') + '"\n';
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'Rekap_Kelengkapan_Administrasi_Guru_SMKN1_BJM.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('Rekapitulasi administrasi guru berhasil diunduh (CSV).');
  }

  // =========================================================================
  // 7.1B PEMERIKSAAN & SUPERVISI BERKAS DOKUMEN GURU OLEH WAKA KURIKULUM
  // =========================================================================
  function openTeacherAdminFilesModal(teacherId, filterCategory) {
    State.activeAdminTeacherId = teacherId;
    State.activeDocFilter = filterCategory || 'all';

    const teachers = StorageManager.get('teachers');
    const monitoring = StorageManager.get('teacher_admin');
    const teacher = teachers.find(function (t) { return String(t.id) === String(teacherId); }) ||
      monitoring.find(function (m) { return String(m.teacher_id) === String(teacherId); }) || {
        id: teacherId,
        name: 'Guru',
        nip: '-',
        department: '-',
        subject: '-'
      };

    // Update Header
    const titleEl = document.getElementById('vt-modal-title');
    const subtitleEl = document.getElementById('vt-modal-subtitle');
    const nameEl = document.getElementById('vt-teacher-name');
    const metaEl = document.getElementById('vt-teacher-meta');
    const avatarEl = document.getElementById('vt-teacher-avatar');

    if (titleEl) titleEl.textContent = 'Berkas Administrasi - ' + teacher.name;
    if (subtitleEl) subtitleEl.textContent = 'Supervisi & Verifikasi Dokumen Pembelajaran SMKN 1 Banjarmasin';
    if (nameEl) nameEl.textContent = teacher.name;
    if (metaEl) metaEl.textContent = 'NIP. ' + (teacher.nip || '-') + ' • Jurusan: ' + (teacher.department || '-') + ' • Mapel: ' + (teacher.subject || '-');
    if (avatarEl) {
      const initials = (teacher.name || 'G').split(' ').filter(Boolean).map(function (n) { return n[0]; }).slice(0, 2).join('');
      avatarEl.textContent = initials || '👨‍🏫';
    }

    // Set Active Filter Tab visually
    const tabs = document.querySelectorAll('.vt-filter-tab');
    tabs.forEach(function (tab) {
      if (tab.getAttribute('data-cat') === State.activeDocFilter) {
        tab.className = 'btn btn-sm btn-primary vt-filter-tab active';
      } else {
        tab.className = 'btn btn-sm btn-outline vt-filter-tab';
      }
    });

    renderTeacherDocsList(teacherId, State.activeDocFilter);
    openModal('modal-view-teacher-docs');
  }

  function filterTeacherDocs(category) {
    State.activeDocFilter = category;
    const tabs = document.querySelectorAll('.vt-filter-tab');
    tabs.forEach(function (tab) {
      if (tab.getAttribute('data-cat') === category) {
        tab.className = 'btn btn-sm btn-primary vt-filter-tab active';
      } else {
        tab.className = 'btn btn-sm btn-outline vt-filter-tab';
      }
    });
    renderTeacherDocsList(State.activeAdminTeacherId, category);
  }

  function renderTeacherDocsList(teacherId, category) {
    const listEl = document.getElementById('vt-docs-list');
    if (!listEl) return;

    const allDocs = StorageManager.get('guru_documents') || [];
    const allJournals = StorageManager.get('guru_journals') || [];

    const teacherDocs = allDocs.filter(function (d) { return String(d.teacher_id) === String(teacherId); });
    const teacherJournals = allJournals.filter(function (j) { return String(j.teacher_id) === String(teacherId); });

    const rppDocs = teacherDocs.filter(function (d) { return d.category === 'Modul Ajar' || d.category === 'RPP'; });
    const silabusDocs = teacherDocs.filter(function (d) { return d.category === 'Silabus & ATP' || d.category === 'Silabus'; });
    const asesmenDocs = teacherDocs.filter(function (d) { return d.category === 'Instrumen Asesmen' || d.category === 'Asesmen'; });

    // Update Counter Badges in Modal Tabs
    const countAllEl = document.getElementById('vt-count-all');
    const countRppEl = document.getElementById('vt-count-rpp');
    const countSilabusEl = document.getElementById('vt-count-silabus');
    const countAsesmenEl = document.getElementById('vt-count-asesmen');
    const countJurnalEl = document.getElementById('vt-count-jurnal');
    const summaryEl = document.getElementById('vt-summary-text');

    if (countAllEl) countAllEl.textContent = teacherDocs.length + teacherJournals.length;
    if (countRppEl) countRppEl.textContent = rppDocs.length;
    if (countSilabusEl) countSilabusEl.textContent = silabusDocs.length;
    if (countAsesmenEl) countAsesmenEl.textContent = asesmenDocs.length;
    if (countJurnalEl) countJurnalEl.textContent = teacherJournals.length;
    if (summaryEl) {
      summaryEl.textContent = 'Total: ' + teacherDocs.length + ' Dokumen Diunggah • ' + teacherJournals.length + ' Sesi Jurnal KBM Tercatat';
    }

    // Determine what to display based on filter
    let itemsToRender = [];
    if (category === 'all') {
      teacherDocs.forEach(function (d) { itemsToRender.push({ type: 'doc', data: d }); });
      teacherJournals.forEach(function (j) { itemsToRender.push({ type: 'journal', data: j }); });
    } else if (category === 'Modul Ajar') {
      rppDocs.forEach(function (d) { itemsToRender.push({ type: 'doc', data: d }); });
    } else if (category === 'Silabus & ATP') {
      silabusDocs.forEach(function (d) { itemsToRender.push({ type: 'doc', data: d }); });
    } else if (category === 'Instrumen Asesmen') {
      asesmenDocs.forEach(function (d) { itemsToRender.push({ type: 'doc', data: d }); });
    } else if (category === 'jurnal') {
      teacherJournals.forEach(function (j) { itemsToRender.push({ type: 'journal', data: j }); });
    }

    if (itemsToRender.length === 0) {
      listEl.innerHTML = '<div style="text-align: center; padding: 2.5rem 1.5rem; background: #FAF9FD; border: 2px dashed #E2E8F0; border-radius: 12px;">' +
        '<div style="font-size: 2.5rem; margin-bottom: 0.75rem;">📭</div>' +
        '<h4 style="margin: 0; font-size: 1rem; color: #334155; font-weight: 700;">Belum Ada Berkas yang Diunggah</h4>' +
        '<p style="margin: 6px 0 16px 0; font-size: 0.8125rem; color: #64748B; max-width: 440px; margin-left: auto; margin-right: auto;">' +
        'Guru yang bersangkutan belum mengunggah berkas untuk kategori ini melalui Portal Guru. Anda dapat mengingatkan guru via WhatsApp atau mengunggah langsung jika menerima berkas fisik/offline.' +
        '</p>' +
        '<div style="display: flex; justify-content: center; gap: 8px; flex-wrap: wrap;">' +
        '<button type="button" class="btn btn-outline btn-sm" onclick="window.PORTAL_APP.notifyActiveTeacherWA()" style="color: #16A34A; border-color: #86EFAC;">💬 Ingatkan Guru via WhatsApp</button>' +
        '<button type="button" class="btn btn-primary btn-sm" onclick="window.PORTAL_APP.openUploadOnBehalfModal()">➕ Unggah Berkas Sekarang</button>' +
        '</div>' +
        '</div>';
      return;
    }

    let html = '';
    itemsToRender.forEach(function (item) {
      if (item.type === 'doc') {
        const d = item.data;
        const icon = d.category === 'Modul Ajar' ? '📘' : (d.category === 'Silabus & ATP' ? '📑' : (d.category === 'Instrumen Asesmen' ? '📊' : '📄'));
        const statusBadge = d.status === 'Perlu Revisi' 
          ? '<span class="badge" style="background: #FEE2E2; color: #DC2626; font-weight: 700; font-size: 0.75rem;">⚠️ Perlu Revisi</span>'
          : '<span class="badge" style="background: #DEF7EC; color: #03543F; font-weight: 700; font-size: 0.75rem;">✓ ' + (d.status || 'Disetujui Waka Kur') + '</span>';

        html += '<div class="teacher-doc-card" style="display: flex; align-items: center; justify-content: space-between; padding: 1rem 1.25rem; background: #FFFFFF; border: 1px solid var(--border); border-radius: var(--radius-lg); box-shadow: 0 1px 3px rgba(0,0,0,0.05); gap: 12px;">' +
          '<div style="display: flex; align-items: center; gap: 14px; min-width: 0; flex: 1;">' +
            '<div style="width: 44px; height: 44px; border-radius: 10px; background: rgba(75, 34, 184, 0.08); color: #4B22B8; display: flex; align-items: center; justify-content: center; font-size: 1.4rem; flex-shrink: 0;">' +
              icon +
            '</div>' +
            '<div style="min-width: 0; flex: 1;">' +
              '<div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">' +
                '<h4 style="margin: 0; font-size: 0.95rem; font-weight: 700; color: #1E293B; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">' + d.title + '</h4>' +
                '<span class="badge badge-neutral" style="font-size: 0.7rem; font-weight: 600;">' + d.category + '</span>' +
                statusBadge +
              '</div>' +
              '<div style="font-size: 0.775rem; color: #64748B; margin-top: 4px; display: flex; gap: 12px; flex-wrap: wrap;">' +
                (d.file_link ? '<span>🌐 <a href="' + d.file_link + '" target="_blank" rel="noopener noreferrer" style="color: #2563EB; font-weight: 700; text-decoration: underline;">Google Drive</a> (' + (d.file_size || 'Cloud Link') + ')</span>' : ('<span>📁 ' + (d.file_name || 'dokumen.pdf') + ' (' + (d.file_size || '1.2 MB') + ')</span>')) +
                '<span>📅 Diunggah: ' + (d.uploaded_at || 'Baru Saja') + '</span>' +
                (d.notes ? '<span>💬 ' + d.notes + '</span>' : '') +
              '</div>' +
            '</div>' +
          '</div>' +
          '<div style="display: flex; align-items: center; gap: 6px; flex-shrink: 0;">' +
            '<button type="button" class="btn btn-primary btn-sm" onclick="window.PORTAL_APP.previewTeacherDoc(\'' + d.id + '\')" style="display: inline-flex; align-items: center; gap: 4px; font-weight: 700;">' +
              '👁️ Lihat Isi' +
            '</button>' +
            '<button type="button" class="btn btn-outline btn-sm" onclick="window.PORTAL_APP.downloadTeacherDocFile(\'' + d.id + '\')" title="Unduh File">' +
              '⬇️' +
            '</button>' +
            '<button type="button" class="btn btn-ghost btn-sm" onclick="window.PORTAL_APP.deleteUploadedTeacherDoc(\'' + d.id + '\')" title="Hapus Berkas" style="color: #DC2626;">' +
              '🗑️' +
            '</button>' +
          '</div>' +
        '</div>';
      } else if (item.type === 'journal') {
        const j = item.data;
        const hadir = j.hadir || 0;
        const total = (j.hadir || 0) + (j.sakit || 0) + (j.izin || 0) + (j.alfa || 0);
        html += '<div class="teacher-doc-card" style="display: flex; align-items: center; justify-content: space-between; padding: 1rem 1.25rem; background: #FFFFFF; border: 1px solid var(--border); border-radius: var(--radius-lg); box-shadow: 0 1px 3px rgba(0,0,0,0.05); gap: 12px;">' +
          '<div style="display: flex; align-items: center; gap: 14px; min-width: 0; flex: 1;">' +
            '<div style="width: 44px; height: 44px; border-radius: 10px; background: rgba(32, 201, 133, 0.1); color: #20C985; display: flex; align-items: center; justify-content: center; font-size: 1.4rem; flex-shrink: 0;">' +
              '📘' +
            '</div>' +
            '<div style="min-width: 0; flex: 1;">' +
              '<div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">' +
                '<h4 style="margin: 0; font-size: 0.95rem; font-weight: 700; color: #1E293B;">' + (j.topic || 'Jurnal KBM Harian') + '</h4>' +
                '<span class="badge badge-primary" style="font-size: 0.7rem; font-weight: 700;">' + (j.class_name || 'Kelas') + '</span>' +
                '<span class="badge badge-neutral" style="font-size: 0.7rem;">Jam Ke-' + (j.jam_ke || '1-2') + '</span>' +
                '<span class="badge badge-success" style="font-size: 0.7rem;">✓ ' + hadir + '/' + (total || 36) + ' Hadir</span>' +
              '</div>' +
              '<div style="font-size: 0.775rem; color: #64748B; margin-top: 4px; display: flex; gap: 12px; flex-wrap: wrap;">' +
                '<span>📅 Tanggal: ' + (j.date || '-') + '</span>' +
                '<span>📖 Mapel: ' + (j.subject || '-') + '</span>' +
                (j.activity ? '<span style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 320px;">📝 ' + j.activity + '</span>' : '') +
              '</div>' +
            '</div>' +
          '</div>' +
          '<div style="display: flex; align-items: center; gap: 6px; flex-shrink: 0;">' +
            '<button type="button" class="btn btn-outline btn-sm" onclick="window.PORTAL_APP.previewTeacherJournal(\'' + j.id + '\')" style="display: inline-flex; align-items: center; gap: 4px; font-weight: 700;">' +
              '👁️ Periksa Sesi' +
            '</button>' +
          '</div>' +
        '</div>';
      }
    });

    listEl.innerHTML = html;
  }

  function previewTeacherDoc(docId) {
    State.activePreviewDocId = docId;
    const allDocs = StorageManager.get('guru_documents') || [];
    const doc = allDocs.find(function (d) { return String(d.id) === String(docId); });

    if (!doc) {
      showToast('Dokumen tidak ditemukan.', 'warning');
      return;
    }

    const teachers = StorageManager.get('teachers');
    const teacher = teachers.find(function (t) { return String(t.id) === String(doc.teacher_id); }) || {
      name: 'Guru Pengampu',
      nip: '-',
      department: 'Keahlian Terkait',
      subject: 'Mata Pelajaran'
    };

    const titleEl = document.getElementById('prev-doc-title');
    const metaEl = document.getElementById('prev-doc-meta');
    const badgeEl = document.getElementById('prev-doc-status-badge');
    const bodyEl = document.getElementById('prev-doc-body');

    if (titleEl) titleEl.textContent = doc.title;
    if (metaEl) metaEl.textContent = doc.category + ' • ' + (doc.file_name || 'dokumen.pdf') + ' (' + (doc.file_size || '1.2 MB') + ') • ' + teacher.name;
    if (badgeEl) {
      if (doc.status === 'Perlu Revisi') {
        badgeEl.className = 'badge badge-danger';
        badgeEl.textContent = '⚠️ Perlu Revisi';
      } else {
        badgeEl.className = 'badge badge-success';
        badgeEl.textContent = '✓ ' + (doc.status || 'Disetujui Waka Kur');
      }
    }

    if (!bodyEl) return;

    // Check if Google Drive / Cloud Link
    if (doc.file_link) {
      bodyEl.innerHTML = '<div style="text-align: center; padding: 3rem 1.5rem; background: #F8FAFC; border-radius: 12px; border: 1.5px solid #E2E8F0; max-width: 680px; margin: 0 auto;">' +
        '<div style="font-size: 3.5rem; margin-bottom: 1rem;">🌐</div>' +
        '<h3 style="font-size: 1.25rem; font-weight: 800; color: #0F172A; margin: 0 0 0.5rem 0;">Tautan Dokumen Google Drive</h3>' +
        '<p style="font-size: 0.875rem; color: #64748B; max-width: 480px; margin: 0 auto 1.5rem auto; line-height: 1.5;">' +
        'Berkas perangkat pembelajaran ini tersimpan aman di Google Drive akun <strong>@guru.smk.belajar.id</strong> guru yang bersangkutan.' +
        '</p>' +
        '<div style="display: flex; justify-content: center; gap: 10px; flex-wrap: wrap;">' +
        '<a href="' + doc.file_link + '" target="_blank" rel="noopener noreferrer" class="btn btn-primary" style="display: inline-flex; align-items: center; gap: 8px; padding: 0.75rem 1.5rem; text-decoration: none; font-weight: 700; border-radius: 10px;">' +
        '<span>Buka Dokumen di Google Drive</span>' +
        '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>' +
        '</a>' +
        '<button type="button" class="btn btn-outline" onclick="navigator.clipboard.writeText(\'' + doc.file_link + '\'); showToast(\'Tautan Google Drive berhasil disalin!\', \'success\');" style="display: inline-flex; align-items: center; gap: 6px; padding: 0.75rem 1rem; border-radius: 10px;">' +
        '📋 Salin Link' +
        '</button>' +
        '</div>' +
        '</div>';
      return;
    }

    // Check if real file (Base64 data url)
    if (doc.file_data && doc.file_data.startsWith('data:application/pdf')) {
      bodyEl.innerHTML = '<iframe src="' + doc.file_data + '" style="width: 100%; height: 75vh; border: none; border-radius: 8px; background: #fff; box-shadow: var(--shadow-md);"></iframe>';
    } else if (doc.file_data && doc.file_data.startsWith('data:image/')) {
      bodyEl.innerHTML = '<div style="text-align: center; padding: 1rem;"><img src="' + doc.file_data + '" style="max-width: 100%; max-height: 75vh; border-radius: 8px; box-shadow: var(--shadow-md);"></div>';
    } else {
      // High-Fidelity Indonesian Official Curriculum Merdeka Sheet
      const docCat = doc.category || 'Modul Ajar';
      const mapel = teacher.subject || 'Produktif Kejuruan';
      const fase = 'Fase F (Kelas XI / XII SMK)';
      const alokasi = '4 JP x 45 Menit (Pertemuan 1 s.d 4)';
      const tahunAjaran = doc.school_year || '2026/2027';

      bodyEl.innerHTML = '<div style="background: #ffffff; color: #1e293b; padding: 2.5rem 3rem; max-width: 780px; margin: 0 auto; box-shadow: 0 4px 25px rgba(0,0,0,0.07); border-radius: 8px; font-family: Inter, sans-serif; line-height: 1.6;">' +
        '<!-- Kop Surat -->' +
        '<div style="display: flex; align-items: center; justify-content: center; gap: 18px; border-bottom: 3px double #0f172a; padding-bottom: 14px; margin-bottom: 24px; text-align: center;">' +
          '<div style="font-size: 3rem; line-height: 1;">🏛️</div>' +
          '<div>' +
            '<div style="font-size: 0.85rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; color: #475569;">Pemerintah Provinsi Kalimantan Selatan</div>' +
            '<div style="font-size: 0.85rem; font-weight: 700; text-transform: uppercase; color: #475569;">Dinas Pendidikan dan Kebudayaan</div>' +
            '<div style="font-size: 1.25rem; font-weight: 900; text-transform: uppercase; color: #0f172a; letter-spacing: 0.8px;">SMK NEGERI 1 BANJARMASIN</div>' +
            '<div style="font-size: 0.775rem; color: #64748b;">Jalan Pramuka No. 4, Pemurus Luar, Kec. Banjarmasin Timur, Kota Banjarmasin 70238</div>' +
          '</div>' +
        '</div>' +

        '<!-- Judul Perangkat -->' +
        '<div style="text-align: center; margin-bottom: 26px;">' +
          '<h2 style="font-size: 1.25rem; font-weight: 800; text-transform: uppercase; margin: 0; color: #0f172a; letter-spacing: 0.5px; text-decoration: underline;">' + doc.title + '</h2>' +
          '<div style="font-size: 0.85rem; font-weight: 700; color: #4B22B8; margin-top: 4px;">KURIKULUM MERDEKA • TAHUN PELAJARAN ' + tahunAjaran + '</div>' +
          '<div style="font-size: 0.775rem; color: #64748B; margin-top: 2px;">Kategori: ' + docCat + ' • File: ' + (doc.file_name || 'perangkat.pdf') + '</div>' +
        '</div>' +

        '<!-- Identitas Modul Table -->' +
        '<div style="margin-bottom: 22px;">' +
          '<h4 style="font-size: 0.95rem; font-weight: 800; color: #0f172a; border-left: 4px solid #4B22B8; padding-left: 10px; margin: 0 0 10px 0; text-transform: uppercase;">I. Identitas Modul & Informasi Umum</h4>' +
          '<table style="width: 100%; border-collapse: collapse; font-size: 0.85rem;">' +
            '<tr><td style="width: 28%; padding: 6px 8px; font-weight: 600; color: #475569; border: 1px solid #E2E8F0; background: #F8FAFC;">Nama Penyusun / Guru</td><td style="padding: 6px 10px; border: 1px solid #E2E8F0; font-weight: 700; color: #0F172A;">' + teacher.name + '</td></tr>' +
            '<tr><td style="padding: 6px 8px; font-weight: 600; color: #475569; border: 1px solid #E2E8F0; background: #F8FAFC;">NIP Guru</td><td style="padding: 6px 10px; border: 1px solid #E2E8F0;">' + (teacher.nip || '-') + '</td></tr>' +
            '<tr><td style="padding: 6px 8px; font-weight: 600; color: #475569; border: 1px solid #E2E8F0; background: #F8FAFC;">Satuan Pendidikan</td><td style="padding: 6px 10px; border: 1px solid #E2E8F0;">SMK Negeri 1 Banjarmasin</td></tr>' +
            '<tr><td style="padding: 6px 8px; font-weight: 600; color: #475569; border: 1px solid #E2E8F0; background: #F8FAFC;">Program / Konsentrasi Keahlian</td><td style="padding: 6px 10px; border: 1px solid #E2E8F0;">' + (teacher.department || 'Teknologi Informasi & Bisnis') + '</td></tr>' +
            '<tr><td style="padding: 6px 8px; font-weight: 600; color: #475569; border: 1px solid #E2E8F0; background: #F8FAFC;">Mata Pelajaran</td><td style="padding: 6px 10px; border: 1px solid #E2E8F0; font-weight: 600;">' + mapel + '</td></tr>' +
            '<tr><td style="padding: 6px 8px; font-weight: 600; color: #475569; border: 1px solid #E2E8F0; background: #F8FAFC;">Fase / Kelas / Semester</td><td style="padding: 6px 10px; border: 1px solid #E2E8F0;">' + fase + ' / Semester Ganjil</td></tr>' +
            '<tr><td style="padding: 6px 8px; font-weight: 600; color: #475569; border: 1px solid #E2E8F0; background: #F8FAFC;">Alokasi Waktu KBM</td><td style="padding: 6px 10px; border: 1px solid #E2E8F0;">' + alokasi + '</td></tr>' +
          '</table>' +
        '</div>' +

        '<!-- Capaian & Tujuan Pembelajaran -->' +
        '<div style="margin-bottom: 22px;">' +
          '<h4 style="font-size: 0.95rem; font-weight: 800; color: #0f172a; border-left: 4px solid #4B22B8; padding-left: 10px; margin: 0 0 10px 0; text-transform: uppercase;">II. Capaian & Alur Tujuan Pembelajaran (ATP)</h4>' +
          '<div style="font-size: 0.85rem; color: #334155; line-height: 1.6; text-align: justify; background: #F8FAFC; padding: 12px 16px; border: 1px solid #E2E8F0; border-radius: 6px;">' +
            '<strong>Capaian Pembelajaran (Elemen Kompetensi):</strong><br>' +
            'Peserta didik mampu memahami konsep dasar, menganalisis struktur alur kerja praktis, mengimplementasikan prosedur operasional standar industri di laboratorium kejuruan, serta memecahkan studi kasus secara mandiri dan kolaboratif sesuai standar dunia kerja.<br><br>' +
            '<strong>Tujuan Pembelajaran:</strong>' +
            '<ol style="margin: 4px 0 0 0; padding-left: 20px;">' +
              '<li>Peserta didik dapat menguraikan konsep dan prinsip kerja fundamental dengan tepat (Kognitif C2).</li>' +
              '<li>Peserta didik mampu mendemonstrasikan langkah kerja operasional sesuai jobsheet praktikum (Psikomotorik P3).</li>' +
              '<li>Peserta didik menunjukkan profil Pelajar Pancasila: Gotong royong, bernalar kritis, dan mandiri selama sesi KBM (Afektif A3).</li>' +
            '</ol>' +
          '</div>' +
        '</div>' +

        '<!-- Skenario Kegiatan Pembelajaran -->' +
        '<div style="margin-bottom: 22px;">' +
          '<h4 style="font-size: 0.95rem; font-weight: 800; color: #0f172a; border-left: 4px solid #4B22B8; padding-left: 10px; margin: 0 0 10px 0; text-transform: uppercase;">III. Rencana Skenario Kegiatan Pembelajaran (Project-Based Learning)</h4>' +
          '<table style="width: 100%; border-collapse: collapse; font-size: 0.825rem;">' +
            '<thead>' +
              '<tr style="background: #1E293B; color: #fff;">' +
                '<th style="padding: 6px 10px; border: 1px solid #334155; width: 22%; text-align: left;">Tahapan</th>' +
                '<th style="padding: 6px 10px; border: 1px solid #334155; text-align: left;">Deskripsi Aktivitas Guru & Siswa</th>' +
                '<th style="padding: 6px 10px; border: 1px solid #334155; width: 15%; text-align: center;">Durasi</th>' +
              '</tr>' +
            '</thead>' +
            '<tbody>' +
              '<tr>' +
                '<td style="padding: 8px 10px; border: 1px solid #E2E8F0; font-weight: 700; background: #F8FAFC;">Pendahuluan</td>' +
                '<td style="padding: 8px 10px; border: 1px solid #E2E8F0;">Salam pembuka, doa bersama, presensi digital SIMKUR, apersepsi materi terdahulu, penyampaian tujuan pembelajaran & motivasi industri.</td>' +
                '<td style="padding: 8px 10px; border: 1px solid #E2E8F0; text-align: center;">15 Menit</td>' +
              '</tr>' +
              '<tr>' +
                '<td style="padding: 8px 10px; border: 1px solid #E2E8F0; font-weight: 700; background: #F8FAFC;">Kegiatan Inti</td>' +
                '<td style="padding: 8px 10px; border: 1px solid #E2E8F0;">Penentuan pertanyaan mendasar, perancangan desain proyek praktikum, penyusunan jadwal penyelesaian, monitoring kemajuan proyek, pengujian hasil jobsheet, dan evaluasi pengalaman belajar.</td>' +
                '<td style="padding: 8px 10px; border: 1px solid #E2E8F0; text-align: center;">150 Menit</td>' +
              '</tr>' +
              '<tr>' +
                '<td style="padding: 8px 10px; border: 1px solid #E2E8F0; font-weight: 700; background: #F8FAFC;">Penutup</td>' +
                '<td style="padding: 8px 10px; border: 1px solid #E2E8F0;">Refleksi bersama siswa, umpan balik terhadap praktikum, pemberian tugas tindak lanjut mandiri, doa penutup dan salam.</td>' +
                '<td style="padding: 8px 10px; border: 1px solid #E2E8F0; text-align: center;">15 Menit</td>' +
              '</tr>' +
            '</tbody>' +
          '</table>' +
        '</div>' +

        '<!-- Asesmen & Penilaian -->' +
        '<div style="margin-bottom: 28px;">' +
          '<h4 style="font-size: 0.95rem; font-weight: 800; color: #0f172a; border-left: 4px solid #4B22B8; padding-left: 10px; margin: 0 0 10px 0; text-transform: uppercase;">IV. Rencana Asesmen & Tindak Lanjut</h4>' +
          '<div style="font-size: 0.825rem; color: #334155; line-height: 1.6; background: #F8FAFC; padding: 12px 16px; border: 1px solid #E2E8F0; border-radius: 6px;">' +
            '• <strong>Asesmen Formatif Awal (Diagnostik):</strong> Tanya jawab materi prasyarat kejuruan.<br>' +
            '• <strong>Asesmen Formatif Proses:</strong> Observasi lembar observasi sikap bernalar kritis dan kerja tim selama praktikum.<br>' +
            '• <strong>Asesmen Sumatif (Produk/Kinerja):</strong> Penilaian hasil jobsheet dan laporan proyek berdasarkan rubrik terstandar.' +
          '</div>' +
        '</div>' +

        '<!-- Catatan Tambahan Guru -->' +
        (doc.notes ? '<div style="margin-bottom: 24px; padding: 10px 14px; background: #FFFBEB; border-left: 4px solid #F59E0B; border-radius: 4px; font-size: 0.8125rem; color: #92400E;"><strong>Catatan Tambahan Guru:</strong> ' + doc.notes + '</div>' : '') +

        '<!-- Kolom Pengesahan Tanda Tangan -->' +
        '<div style="display: flex; justify-content: space-between; align-items: flex-end; margin-top: 36px; padding-top: 18px; border-top: 1px solid #E2E8F0;">' +
          '<div style="text-align: center; width: 42%;">' +
            '<div style="font-size: 0.8rem; color: #64748B;">Mengetahui & Menyetujui,</div>' +
            '<div style="font-size: 0.85rem; font-weight: 700; color: #0F172A; margin-top: 2px;">Waka Bidang Kurikulum</div>' +
            '<div style="height: 60px; display: flex; align-items: center; justify-content: center; font-size: 0.75rem; color: #03543F; font-weight: 700; background: #DEF7EC; border-radius: 6px; margin: 10px 0; border: 1px dashed #31C48D;">' +
              '✅ TERVERIFIKASI DIGITAL SIMKUR<br>' + (doc.uploaded_at || '2026/2027') +
            '</div>' +
            '<div style="font-size: 0.85rem; font-weight: 800; color: #0F172A; text-decoration: underline;">Ichsan Zakki, S.Pd., M.T.</div>' +
            '<div style="font-size: 0.75rem; color: #64748B;">NIP. 19850312 201001 1 014</div>' +
          '</div>' +

          '<div style="text-align: center; width: 42%;">' +
            '<div style="font-size: 0.8rem; color: #64748B;">Banjarmasin, ' + (doc.uploaded_at || 'Juli 2026') + '</div>' +
            '<div style="font-size: 0.85rem; font-weight: 700; color: #0F172A; margin-top: 2px;">Guru Pengampu Mata Pelajaran</div>' +
            '<div style="height: 60px; display: flex; align-items: center; justify-content: center; font-size: 0.75rem; color: #4B22B8; font-weight: 700; background: #F3F0FA; border-radius: 6px; margin: 10px 0; border: 1px dashed #9061F9;">' +
              '✍️ TTD ELEKTRONIK GURU<br>' + teacher.name +
            '</div>' +
            '<div style="font-size: 0.85rem; font-weight: 800; color: #0F172A; text-decoration: underline;">' + teacher.name + '</div>' +
            '<div style="font-size: 0.75rem; color: #64748B;">NIP. ' + (teacher.nip || '-') + '</div>' +
          '</div>' +
        '</div>' +
      '</div>';
    }

    openModal('modal-doc-previewer');
  }

  function previewTeacherJournal(journalId) {
    const allJournals = StorageManager.get('guru_journals') || [];
    const j = allJournals.find(function (item) { return String(item.id) === String(journalId); });
    if (!j) {
      showToast('Data jurnal tidak ditemukan.', 'warning');
      return;
    }

    const teachers = StorageManager.get('teachers');
    const teacher = teachers.find(function (t) { return String(t.id) === String(j.teacher_id); }) || {
      name: 'Guru Pengampu',
      nip: '-'
    };

    const titleEl = document.getElementById('prev-doc-title');
    const metaEl = document.getElementById('prev-doc-meta');
    const badgeEl = document.getElementById('prev-doc-status-badge');
    const bodyEl = document.getElementById('prev-doc-body');

    if (titleEl) titleEl.textContent = 'Jurnal Mengajar - ' + (j.class_name || 'Kelas') + ' (' + (j.date || '-') + ')';
    if (metaEl) metaEl.textContent = 'Sesi KBM Jam Ke-' + (j.jam_ke || '1-2') + ' • ' + (j.subject || 'Mata Pelajaran') + ' • ' + teacher.name;
    if (badgeEl) {
      badgeEl.className = 'badge badge-primary';
      badgeEl.textContent = '📘 Sesi KBM Selesai';
    }

    if (!bodyEl) return;

    const hadir = j.hadir || 0;
    const sakit = j.sakit || 0;
    const izin = j.izin || 0;
    const alfa = j.alfa || 0;
    const total = hadir + sakit + izin + alfa || 36;
    const attendancePct = Math.round((hadir / total) * 100);

    bodyEl.innerHTML = '<div style="background: #ffffff; color: #1e293b; padding: 2.5rem 3rem; max-width: 780px; margin: 0 auto; box-shadow: 0 4px 25px rgba(0,0,0,0.07); border-radius: 8px; font-family: Inter, sans-serif; line-height: 1.6;">' +
      '<!-- Header Jurnal -->' +
      '<div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #E2E8F0; padding-bottom: 14px; margin-bottom: 20px;">' +
        '<div>' +
          '<h3 style="margin: 0; font-size: 1.15rem; font-weight: 800; color: #0F172A;">LEMBAR JURNAL KBM HARIAN</h3>' +
          '<div style="font-size: 0.775rem; color: #64748B;">SMK Negeri 1 Banjarmasin • Tahun Pelajaran 2026/2027</div>' +
        '</div>' +
        '<span class="badge badge-success" style="font-size: 0.8rem; font-weight: 700;">' + (j.date || '-') + '</span>' +
      '</div>' +

      '<!-- Info Grid -->' +
      '<table style="width: 100%; border-collapse: collapse; font-size: 0.85rem; margin-bottom: 20px;">' +
        '<tr><td style="width: 25%; padding: 6px 8px; font-weight: 600; color: #475569; border: 1px solid #E2E8F0; background: #F8FAFC;">Guru Pengampu</td><td style="padding: 6px 10px; border: 1px solid #E2E8F0; font-weight: 700;">' + teacher.name + '</td></tr>' +
        '<tr><td style="padding: 6px 8px; font-weight: 600; color: #475569; border: 1px solid #E2E8F0; background: #F8FAFC;">Kelas & Jam Ke</td><td style="padding: 6px 10px; border: 1px solid #E2E8F0;">' + (j.class_name || '-') + ' • Jam Ke-' + (j.jam_ke || '-') + '</td></tr>' +
        '<tr><td style="padding: 6px 8px; font-weight: 600; color: #475569; border: 1px solid #E2E8F0; background: #F8FAFC;">Mata Pelajaran</td><td style="padding: 6px 10px; border: 1px solid #E2E8F0; font-weight: 600;">' + (j.subject || '-') + '</td></tr>' +
        '<tr><td style="padding: 6px 8px; font-weight: 600; color: #475569; border: 1px solid #E2E8F0; background: #F8FAFC;">Materi / Topik</td><td style="padding: 6px 10px; border: 1px solid #E2E8F0; font-weight: 700; color: #4B22B8;">' + (j.topic || '-') + '</td></tr>' +
        '<tr><td style="padding: 6px 8px; font-weight: 600; color: #475569; border: 1px solid #E2E8F0; background: #F8FAFC;">Aktivitas KBM</td><td style="padding: 6px 10px; border: 1px solid #E2E8F0;">' + (j.activity || '-') + '</td></tr>' +
        '<tr><td style="padding: 6px 8px; font-weight: 600; color: #475569; border: 1px solid #E2E8F0; background: #F8FAFC;">Catatan Kelas</td><td style="padding: 6px 10px; border: 1px solid #E2E8F0; color: #D97706;">' + (j.notes || 'Pembelajaran berlangsung kondusif.') + '</td></tr>' +
      '</table>' +

      '<!-- Rekapitulasi Presensi -->' +
      '<div style="margin-bottom: 22px;">' +
        '<h4 style="font-size: 0.9rem; font-weight: 700; color: #0F172A; margin: 0 0 8px 0;">Rekap Kehadiran Siswa (' + attendancePct + '% Hadir)</h4>' +
        '<div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; text-align: center;">' +
          '<div style="padding: 10px; background: #DEF7EC; border-radius: 6px;"><div style="font-size: 1.25rem; font-weight: 800; color: #03543F;">' + hadir + '</div><div style="font-size: 0.75rem; color: #046C4E;">Hadir</div></div>' +
          '<div style="padding: 10px; background: #FEF08A; border-radius: 6px;"><div style="font-size: 1.25rem; font-weight: 800; color: #854D0E;">' + sakit + '</div><div style="font-size: 0.75rem; color: #854D0E;">Sakit</div></div>' +
          '<div style="padding: 10px; background: #E0E7FF; border-radius: 6px;"><div style="font-size: 1.25rem; font-weight: 800; color: #3730A3;">' + izin + '</div><div style="font-size: 0.75rem; color: #3730A3;">Izin</div></div>' +
          '<div style="padding: 10px; background: #FEE2E2; border-radius: 6px;"><div style="font-size: 1.25rem; font-weight: 800; color: #991B1B;">' + alfa + '</div><div style="font-size: 0.75rem; color: #991B1B;">Alfa</div></div>' +
        '</div>' +
      '</div>' +

      (j.photo ? '<div style="margin-bottom: 20px;"><h4 style="font-size: 0.9rem; font-weight: 700; color: #0F172A; margin: 0 0 8px 0;">Dokumentasi Foto KBM</h4><img src="' + j.photo + '" style="max-width: 100%; max-height: 350px; border-radius: 6px; box-shadow: var(--shadow-sm);"></div>' : '') +

      '<!-- Verifikasi -->' +
      '<div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid #E2E8F0; padding-top: 14px; margin-top: 20px;">' +
        '<div style="font-size: 0.75rem; color: #64748B;">Dicatat secara digital melalui SIMKUR SMKN 1 Banjarmasin</div>' +
        '<div style="text-align: right;"><div style="font-size: 0.8rem; font-weight: 700; color: #0F172A;">' + teacher.name + '</div><div style="font-size: 0.75rem; color: #64748B;">NIP. ' + (teacher.nip || '-') + '</div></div>' +
      '</div>' +
    '</div>';

    openModal('modal-doc-previewer');
  }

  function approveDoc() {
    if (!State.activePreviewDocId) return;
    const allDocs = StorageManager.get('guru_documents') || [];
    const doc = allDocs.find(function (d) { return String(d.id) === String(State.activePreviewDocId); });
    if (!doc) return;

    doc.status = 'Disetujui Waka Kur';
    doc.notes = 'Telah diperiksa dan diverifikasi oleh Waka Kurikulum.';
    StorageManager.update('guru_documents', doc.id, { status: doc.status, notes: doc.notes });

    // Sync to monitoring
    const teacherId = doc.teacher_id;
    if (doc.category === 'Modul Ajar') {
      StorageManager.update('teacher_admin', teacherId, { rpp_status: 'Lengkap' });
    } else if (doc.category === 'Silabus & ATP') {
      StorageManager.update('teacher_admin', teacherId, { silabus_status: 'Lengkap' });
    } else if (doc.category === 'Instrumen Asesmen') {
      StorageManager.update('teacher_admin', teacherId, { asesmen_status: 'Lengkap' });
    }

    const badgeEl = document.getElementById('prev-doc-status-badge');
    if (badgeEl) {
      badgeEl.className = 'badge badge-success';
      badgeEl.textContent = '✓ Disetujui Waka Kur';
    }

    showToast('✓ Berkas berhasil diverifikasi dan disetujui oleh Waka Kurikulum!', 'success');
    renderTeacherDocsList(teacherId, State.activeDocFilter);
    renderDocuments();
    renderDashboard();
  }

  function markDocRevision() {
    if (!State.activePreviewDocId) return;
    const allDocs = StorageManager.get('guru_documents') || [];
    const doc = allDocs.find(function (d) { return String(d.id) === String(State.activePreviewDocId); });
    if (!doc) return;

    const revisionNotes = prompt('Masukkan catatan perbaikan/revisi untuk guru:', 'Mohon lengkapi rubrik asesmen dan tujuan pembelajaran...');
    if (revisionNotes === null) return;

    doc.status = 'Perlu Revisi';
    doc.notes = revisionNotes || 'Perlu perbaikan kelengkapan komponen modul.';
    StorageManager.update('guru_documents', doc.id, { status: doc.status, notes: doc.notes });

    const teacherId = doc.teacher_id;
    if (doc.category === 'Modul Ajar') {
      StorageManager.update('teacher_admin', teacherId, { rpp_status: 'Review', notes: 'Revisi: ' + doc.notes });
    } else if (doc.category === 'Silabus & ATP') {
      StorageManager.update('teacher_admin', teacherId, { silabus_status: 'Review', notes: 'Revisi: ' + doc.notes });
    } else if (doc.category === 'Instrumen Asesmen') {
      StorageManager.update('teacher_admin', teacherId, { asesmen_status: 'Review', notes: 'Revisi: ' + doc.notes });
    }

    const badgeEl = document.getElementById('prev-doc-status-badge');
    if (badgeEl) {
      badgeEl.className = 'badge badge-danger';
      badgeEl.textContent = '⚠️ Perlu Revisi';
    }

    showToast('⚠️ Catatan revisi telah disimpan untuk guru.', 'warning');
    renderTeacherDocsList(teacherId, State.activeDocFilter);
    renderDocuments();
    renderDashboard();
  }

  function printPreviewDoc() {
    const bodyEl = document.getElementById('prev-doc-body');
    if (!bodyEl) return;
    const printWindow = window.open('', '_blank');
    printWindow.document.write('<!DOCTYPE html><html><head><title>Cetak Dokumen SIMKUR</title><style>body { font-family: Inter, sans-serif; padding: 20px; }</style></head><body>' + bodyEl.innerHTML + '</body></html>');
    printWindow.document.close();
    printWindow.focus();
    setTimeout(function () {
      printWindow.print();
      printWindow.close();
    }, 400);
  }

  function notifyTeacherWA(teacherId) {
    const teachers = StorageManager.get('teachers');
    const teacher = teachers.find(function (t) { return String(t.id) === String(teacherId); });
    const name = teacher ? teacher.name : 'Bapak/Ibu Guru';
    let phone = teacher && teacher.phone ? teacher.phone.replace(/\D/g, '') : '';
    if (phone.startsWith('0')) {
      phone = '62' + phone.substring(1);
    }

    const message = encodeURIComponent('Halo Bapak/Ibu ' + name + ',\n\nMohon untuk segera mengunggah kelengkapan administrasi pembelajaran (RPP/Modul Ajar, Silabus/ATP, Asesmen, serta Jurnal Mengajar) melalui Portal Guru SIMKUR SMKN 1 Banjarmasin.\n\nTerima kasih.\n— Waka Bidang Kurikulum SMKN 1 Banjarmasin');

    const waUrl = phone ? ('https://wa.me/' + phone + '?text=' + message) : ('https://wa.me/?text=' + message);
    window.open(waUrl, '_blank');
  }

  function notifyActiveTeacherWA() {
    if (State.activeAdminTeacherId) {
      notifyTeacherWA(State.activeAdminTeacherId);
    }
  }

  function openUploadOnBehalfModal() {
    if (State.activeAdminTeacherId) {
      State.uploadTargetTeacherId = State.activeAdminTeacherId;
    }
    updateDriveUIElements();
    openModal('modal-guru-upload-doc');
  }

  function deleteUploadedTeacherDoc(id) {
    if (confirm('Yakin ingin menghapus berkas dokumen ini?')) {
      StorageManager.delete('guru_documents', id);
      showToast('Berkas dokumen berhasil dihapus.');
      renderTeacherDocsList(State.activeAdminTeacherId, State.activeDocFilter);
      renderDocuments();
      renderDashboard();
    }
  }

  function downloadTeacherDocFile(id) {
    const allDocs = StorageManager.get('guru_documents') || [];
    const doc = allDocs.find(function (d) { return String(d.id) === String(id); });
    if (!doc) return;

    if (doc.file_link) {
      window.open(doc.file_link, '_blank');
      showToast('Membuka tautan berkas di Google Drive...', 'info');
      return;
    }

    if (doc.file_data) {
      const a = document.createElement('a');
      a.href = doc.file_data;
      a.download = doc.file_name || (doc.title + '.pdf');
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } else {
      previewTeacherDoc(id);
      showToast('Pratinjau lembar digital ditampilkan. Anda dapat mencetak/menyimpan PDF via tombol Cetak.');
    }
  }

  // =========================================================================
  // 7.1.5 PENGATURAN GOOGLE DRIVE WAKA KURIKULUM & INTEGRASI REPOSITORY
  // =========================================================================
  function getWakaDriveUrl() {
    let url = localStorage.getItem('portal_waka_drive_url');
    if (!url) {
      url = StorageManager.getSetting('waka_drive_url', '');
    }
    return (url || '').trim();
  }

  function updateDriveModalStatusUI(url) {
    const icon = document.getElementById('waka-drive-status-icon');
    const title = document.getElementById('waka-drive-status-title');
    const pill = document.getElementById('waka-drive-status-pill');
    const desc = document.getElementById('waka-drive-status-desc');
    const container = document.getElementById('waka-drive-status-badge-container');

    if (!container) return;

    if (url) {
      container.style.background = '#F0FDF4';
      container.style.borderColor = '#BBF7D0';
      if (icon) icon.textContent = '🟢';
      if (title) {
        title.textContent = 'Status: Terhubung ke Google Drive';
        title.style.color = '#15803D';
      }
      if (pill) {
        pill.textContent = 'Aktif';
        pill.style.background = '#DCFCE7';
        pill.style.color = '#15803D';
      }
      if (desc) {
        desc.innerHTML = 'Folder repository siap digunakan guru untuk pengumpulan berkas. Klik <strong>Uji Link</strong> untuk memastikan folder terbuka dengan benar.';
        desc.style.color = '#166534';
      }
    } else {
      container.style.background = '#FFFBEB';
      container.style.borderColor = '#FDE68A';
      if (icon) icon.textContent = '⚪';
      if (title) {
        title.textContent = 'Status: Belum Diatur (Standby)';
        title.style.color = '#92400E';
      }
      if (pill) {
        pill.textContent = 'Belum Ada';
        pill.style.background = '#FEF3C7';
        pill.style.color = '#B45309';
      }
      if (desc) {
        desc.innerHTML = 'Link Google Drive kurikulum belum diatur. Guru saat ini tetap dapat mengunggah berkas PDF/DOCX langsung (&lt; 5MB) atau menempel tautan mandiri.';
        desc.style.color = '#B45309';
      }
    }
  }

  function openDriveConfigModal() {
    const url = getWakaDriveUrl();
    const input = document.getElementById('input-waka-drive-url');
    if (input) input.value = url || '';

    updateDriveModalStatusUI(url);
    openModal('modal-waka-drive-config');
  }

  function handleSaveDriveConfig(event) {
    if (event) event.preventDefault();
    const input = document.getElementById('input-waka-drive-url');
    let url = input ? input.value.trim() : '';

    if (url) {
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        url = 'https://' + url;
        if (input) input.value = url;
      }
      if (!url.includes('drive.google.com') && !url.includes('docs.google.com')) {
        if (!confirm('Tautan ini tidak tampak seperti URL Google Drive. Apakah Anda yakin ingin menyimpannya?')) {
          return;
        }
      }
    }

    localStorage.setItem('portal_waka_drive_url', url);
    StorageManager.setSetting('waka_drive_url', url);

    if (window.FirebaseService && typeof window.FirebaseService.saveDoc === 'function') {
      window.FirebaseService.saveDoc('settings', 'drive_config', {
        waka_drive_url: url,
        updated_at: new Date().toISOString()
      });
    }

    closeModal('modal-waka-drive-config');
    showToast(url ? '✓ Link Google Drive Kurikulum berhasil disimpan dan diaktifkan!' : 'Pengaturan link Google Drive telah diperbarui.');

    updateDriveUIElements();
  }

  function testWakaDriveLink() {
    const input = document.getElementById('input-waka-drive-url');
    let url = input ? input.value.trim() : '';
    if (!url) {
      showToast('Masukkan link Google Drive terlebih dahulu untuk diuji.', 'warning');
      if (input) input.focus();
      return;
    }
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = 'https://' + url;
      if (input) input.value = url;
    }
    window.open(url, '_blank');
    showToast('Membuka tautan di tab baru untuk verifikasi...', 'info');
  }

  function clearWakaDriveConfig() {
    if (!confirm('Kosongkan tautan Google Drive Kurikulum?')) return;
    localStorage.removeItem('portal_waka_drive_url');
    StorageManager.setSetting('waka_drive_url', '');

    const input = document.getElementById('input-waka-drive-url');
    if (input) input.value = '';

    updateDriveModalStatusUI('');

    if (window.FirebaseService && typeof window.FirebaseService.saveDoc === 'function') {
      window.FirebaseService.saveDoc('settings', 'drive_config', {
        waka_drive_url: '',
        updated_at: new Date().toISOString()
      });
    }

    showToast('Link Google Drive kurikulum telah dikosongkan.', 'info');
    updateDriveUIElements();
  }

  function openWakaDriveFolder() {
    const url = getWakaDriveUrl();
    if (url) {
      window.open(url, '_blank');
      showToast('Membuka folder Google Drive Kurikulum...', 'info');
      return;
    }

    let session = null;
    try {
      const raw = localStorage.getItem('simkur_session');
      if (raw) session = JSON.parse(raw);
    } catch (e) {}

    const roleInfo = getUserRoleInfo(session);
    if (roleInfo.isWakaKur || roleInfo.isAdmin) {
      showToast('Tautan Google Drive belum diatur. Membuka form pengaturan...', 'warning');
      openDriveConfigModal();
    } else {
      showToast('Tautan Google Drive resmi kurikulum belum disiapkan oleh Waka Kurikulum. Silakan gunakan upload file langsung atau tautan pribadi.', 'warning');
    }
  }

  function updateDriveUIElements() {
    const url = getWakaDriveUrl();

    // 1. Dokumen Screen Badge
    const badgeDrive = document.getElementById('badge-waka-drive-status');
    if (badgeDrive) {
      if (url) {
        badgeDrive.textContent = '🟢 Aktif';
        badgeDrive.style.background = '#DCFCE7';
        badgeDrive.style.color = '#15803D';
      } else {
        badgeDrive.textContent = 'Belum Diatur';
        badgeDrive.style.background = '#FEF3C7';
        badgeDrive.style.color = '#B45309';
      }
    }

    // 2. Portal Guru Banner & Button
    const guruBanner = document.getElementById('guru-drive-announcement-banner');
    const guruBannerTitle = document.getElementById('guru-drive-banner-title');
    const guruBannerDesc = document.getElementById('guru-drive-banner-desc');
    const guruBtnBanner = document.getElementById('btn-guru-banner-drive');
    const guruPortalBtn = document.getElementById('btn-guru-portal-open-drive');

    if (guruBanner) {
      if (url) {
        guruBanner.style.background = '#EFF6FF';
        guruBanner.style.border = '1px solid #BFDBFE';
        if (guruBannerTitle) {
          guruBannerTitle.textContent = '📁 Folder Google Drive Kurikulum Siap Digunakan';
          guruBannerTitle.style.color = '#1E40AF';
        }
        if (guruBannerDesc) {
          guruBannerDesc.textContent = 'Waka Kurikulum telah menyiapkan folder resmi penyimpanan perangkat ajar. Klik tombol di kanan untuk membuka folder.';
          guruBannerDesc.style.color = '#2563EB';
        }
        if (guruBtnBanner) {
          guruBtnBanner.style.display = 'inline-flex';
          guruBtnBanner.textContent = 'Buka Folder Drive';
        }
        if (guruPortalBtn) {
          guruPortalBtn.style.display = 'inline-flex';
        }
      } else {
        guruBanner.style.background = '#FFFBEB';
        guruBanner.style.border = '1px solid #FDE68A';
        if (guruBannerTitle) {
          guruBannerTitle.textContent = 'Pengumpulan Berkas Digital SIMKUR';
          guruBannerTitle.style.color = '#92400E';
        }
        if (guruBannerDesc) {
          guruBannerDesc.textContent = 'Tautan folder Google Drive resmi kurikulum belum disetel. Bapak/Ibu dapat mengunggah berkas PDF/DOCX langsung (< 5MB) atau menempel link Drive akun belajar.id Anda.';
          guruBannerDesc.style.color = '#B45309';
        }
        if (guruBtnBanner) {
          guruBtnBanner.style.display = 'none';
        }
      }
    }

    // 3. Modal Guru Upload Banner
    const statusBox = document.getElementById('guru-modal-drive-status-box');
    const statusText = document.getElementById('guru-modal-drive-status-text');
    const btnOpenDrive = document.getElementById('btn-guru-modal-open-drive');

    if (statusBox && statusText) {
      if (url) {
        statusBox.style.background = '#EFF6FF';
        statusBox.style.border = '1px solid #BFDBFE';
        statusText.style.color = '#1E40AF';
        statusText.innerHTML = 'Folder Google Drive Kurikulum terhubung. Anda dapat langsung menyimpan berkas ke folder resmi tersebut lalu menempel tautannya di bawah.';
        if (btnOpenDrive) {
          btnOpenDrive.style.display = 'inline-flex';
          btnOpenDrive.disabled = false;
          btnOpenDrive.textContent = 'Buka Folder Drive';
        }
      } else {
        statusBox.style.background = '#FFFBEB';
        statusBox.style.border = '1px solid #FDE68A';
        statusText.style.color = '#92400E';
        statusText.innerHTML = 'Folder Google Drive terpusat belum disetel oleh Waka Kurikulum. Anda dapat menempel tautan Google Drive akun belajar.id pribadi Anda di bawah, atau langsung unggah file PDF/DOCX.';
        if (btnOpenDrive) {
          btnOpenDrive.style.display = 'none';
        }
      }
    }
  }

  // 7.2 TAB ARSIP DOKUMEN SEKOLAH - RESPONSIVE BEBAS GESER
  function setArchiveDocViewMode(mode) {
    State.docArchiveViewMode = mode;
    const cardCont = document.getElementById('doc-archives-cards-container');
    const tableCont = document.getElementById('doc-archives-table-container');
    const btnCard = document.getElementById('btn-doc-archive-card');
    const btnTable = document.getElementById('btn-doc-archive-table');

    if (btnCard) btnCard.classList.toggle('active', mode === 'card');
    if (btnTable) btnTable.classList.toggle('active', mode === 'table');

    if (cardCont) cardCont.style.display = (mode === 'card') ? 'grid' : 'none';
    if (tableCont) tableCont.style.display = (mode === 'table') ? 'block' : 'none';
  }

  function renderArchiveDocsTable(docs) {
    const tbody = document.getElementById('doc-table-tbody');
    const cardsContainer = document.getElementById('doc-archives-cards-container');
    const badgeCount = document.getElementById('doc-total-badge');
    if (badgeCount) badgeCount.textContent = docs.length + ' Dokumen';

    if (!tbody && !cardsContainer) return;

    const filtered = docs.filter(function (d) {
      const matchesSearch = !State.docSearchQuery ||
        (d.name && d.name.toLowerCase().includes(State.docSearchQuery.toLowerCase())) ||
        (d.description && d.description.toLowerCase().includes(State.docSearchQuery.toLowerCase()));

      const matchesCategory = State.docCategoryFilter === 'all' || d.category === State.docCategoryFilter;
      const matchesYear = State.docYearFilter === 'all' || d.school_year === State.docYearFilter;

      return matchesSearch && matchesCategory && matchesYear;
    });

    if (filtered.length === 0) {
      if (cardsContainer) {
        cardsContainer.innerHTML = '<div style="grid-column: 1 / -1; text-align: center; padding: 3rem 1.5rem; background: #FFFFFF; border-radius: 16px; border: 1.5px dashed #CBD5E1; color: #64748B;">' +
          '<div style="font-size: 2.5rem; margin-bottom: 0.5rem;">📁</div>' +
          '<h4 style="font-weight: 700; color: #1E293B; margin-bottom: 4px;">Tidak Ada Arsip Dokumen yang Sesuai</h4>' +
          '<p style="font-size: 0.8125rem; color: #94A3B8; margin: 0;">Ubah filter atau unggah dokumen baru.</p>' +
          '</div>';
      }
      if (tbody) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; padding: 3rem; color: #888888;">' +
          '<div style="font-size: 2.2rem; margin-bottom: 0.5rem;">📁</div>' +
          '<strong>Tidak ada arsip dokumen yang sesuai</strong>' +
          '<p style="font-size: 0.8125rem; color: #999; margin-top: 4px;">Ubah filter atau unggah dokumen baru.</p>' +
          '</td></tr>';
      }
      return;
    }

    let cardsHtml = '';
    let tableHtml = '';

    filtered.forEach(function (d) {
      const isDocx = d.name && (d.name.endsWith('.docx') || d.name.endsWith('.doc'));
      const iconText = isDocx ? 'DOC' : 'PDF';
      const iconBg = isDocx ? '#EFF6FF' : '#EDE7FF';
      const iconColor = isDocx ? '#2563EB' : '#4B22B8';

      // 1. Responsive Card
      cardsHtml += '<div class="doc-archive-card" id="doc-card-' + d.id + '">' +
        '  <div class="doc-archive-card-top">' +
        '    <div class="doc-icon-badge" style="background: ' + iconBg + '; color: ' + iconColor + ';">' + iconText + '</div>' +
        '    <div class="doc-archive-info">' +
        '      <h4 class="doc-archive-title">' + d.name + '</h4>' +
        '      <p class="doc-archive-desc">' + (d.description || d.file_name || '-') + '</p>' +
        '    </div>' +
        '  </div>' +
        '  <div class="doc-archive-meta-row">' +
        '    <span class="badge badge-primary">' + d.category + '</span>' +
        '    <span class="badge badge-neutral">' + d.school_year + '</span>' +
        '    <span class="doc-meta-item">📅 ' + (d.uploaded_at || '-') + '</span>' +
        '    <span class="doc-meta-item">💾 ' + (d.file_size || '1.5 MB') + '</span>' +
        '  </div>' +
        '  <div class="doc-archive-actions">' +
        '    <button type="button" class="btn btn-outline btn-sm doc-act-btn" onclick="window.PORTAL_APP.downloadDocument(\'' + d.id + '\')" title="Unduh Berkas">' +
        '      <span>📥 Unduh</span>' +
        '    </button>' +
        '    <button type="button" class="btn btn-ghost btn-sm doc-act-btn" onclick="window.PORTAL_APP.editDocument(\'' + d.id + '\')" title="Edit Metadata">' +
        '      <span>✏️ Edit</span>' +
        '    </button>' +
        '    <button type="button" class="btn btn-ghost btn-sm doc-act-btn" style="color: #dc2626;" onclick="window.PORTAL_APP.deleteDocument(\'' + d.id + '\')" title="Hapus">' +
        '      <span>🗑️</span>' +
        '    </button>' +
        '  </div>' +
        '</div>';

      // 2. Compact Table Row
      tableHtml += '<tr>' +
        '<td>' +
        '<div style="display: flex; align-items: center; gap: 10px;">' +
        '<div style="width: 36px; height: 36px; border-radius: 8px; background: ' + iconBg + '; color: ' + iconColor + '; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 0.75rem; flex-shrink: 0;">' + iconText + '</div>' +
        '<div>' +
        '<div style="font-weight: 600; color: #262626;">' + d.name + '</div>' +
        '<div style="font-size: 0.775rem; color: #777777;">' + (d.description || d.file_name || '-') + '</div>' +
        '</div>' +
        '</div>' +
        '</td>' +
        '<td><span class="badge badge-primary">' + d.category + '</span></td>' +
        '<td><span class="badge badge-neutral">' + d.school_year + '</span></td>' +
        '<td style="font-size: 0.8125rem; color: #666;">' + (d.uploaded_at || '-') + '</td>' +
        '<td style="font-size: 0.8125rem; color: #666;">' + (d.file_size || '1.5 MB') + '</td>' +
        '<td>' +
        '<div style="display: flex; gap: 6px;">' +
        '<button class="btn btn-outline btn-sm" onclick="window.PORTAL_APP.downloadDocument(\'' + d.id + '\')" title="Download Berkas">📥 Unduh</button>' +
        '<button class="btn btn-ghost btn-sm" onclick="window.PORTAL_APP.editDocument(\'' + d.id + '\')" title="Edit Metadata">✏️</button>' +
        '<button class="btn btn-ghost btn-sm" style="color: #dc2626;" onclick="window.PORTAL_APP.deleteDocument(\'' + d.id + '\')" title="Hapus">🗑️</button>' +
        '</div>' +
        '</td>' +
        '</tr>';
    });

    if (cardsContainer) cardsContainer.innerHTML = cardsHtml;
    if (tbody) tbody.innerHTML = tableHtml;

    setArchiveDocViewMode(State.docArchiveViewMode || 'card');
  }

  function openUploadDocModal(editId) {
    const form = document.getElementById('form-modal-doc');
    if (!form) return;
    form.reset();

    const titleEl = document.getElementById('modal-doc-title');
    if (editId) {
      const docs = StorageManager.get('documents');
      const item = docs.find(function (d) { return String(d.id) === String(editId); });
      if (item) {
        State.editingItem = item;
        if (titleEl) titleEl.textContent = 'Edit Metadata Dokumen';
        document.getElementById('input-doc-id').value = item.id;
        document.getElementById('input-doc-name').value = item.name;
        document.getElementById('select-doc-category').value = item.category;
        document.getElementById('select-doc-year').value = item.school_year;
        document.getElementById('input-doc-desc').value = item.description || '';
      }
    } else {
      State.editingItem = null;
      if (titleEl) titleEl.textContent = 'Upload Dokumen Kurikulum Sekolah';
      document.getElementById('input-doc-id').value = '';
    }

    openModal('modal-document');
  }

  function handleSaveDocument(e) {
    e.preventDefault();
    const id = document.getElementById('input-doc-id').value;
    const name = document.getElementById('input-doc-name').value.trim();
    const category = document.getElementById('select-doc-category').value;
    const year = document.getElementById('select-doc-year').value;
    const desc = document.getElementById('input-doc-desc').value.trim();
    const fileInput = document.getElementById('input-doc-file');

    if (!name) {
      showToast('Nama dokumen wajib diisi!', 'danger');
      return;
    }

    let fileName = 'dokumen_' + Date.now() + '.pdf';
    let fileSize = '1.8 MB';
    if (fileInput && fileInput.files && fileInput.files[0]) {
      fileName = fileInput.files[0].name;
      fileSize = (fileInput.files[0].size / (1024 * 1024)).toFixed(1) + ' MB';
    }

    const now = new Date();
    const dateStr = now.getFullYear() + '-' +
      String(now.getMonth() + 1).padStart(2, '0') + '-' +
      String(now.getDate()).padStart(2, '0') + ' ' +
      String(now.getHours()).padStart(2, '0') + ':' +
      String(now.getMinutes()).padStart(2, '0');

    if (id) {
      StorageManager.update('documents', id, {
        name: name,
        category: category,
        school_year: year,
        description: desc
      });
      showToast('Metadata dokumen berhasil diperbarui!');
    } else {
      const newDoc = {
        id: 'DOC-' + Date.now(),
        name: name,
        category: category,
        school_year: year,
        description: desc,
        file_name: fileName,
        file_size: fileSize,
        uploaded_at: dateStr
      };
      StorageManager.add('documents', newDoc);
      showToast('Dokumen kurikulum berhasil diunggah!');
    }

    closeModal('modal-document');
    renderDocuments();
    renderDashboard();
  }

  function deleteDocument(id) {
    if (!confirm('Apakah Anda yakin ingin menghapus dokumen ini?')) return;
    StorageManager.delete('documents', id);
    showToast('Dokumen berhasil dihapus!');
    renderDocuments();
    renderDashboard();
  }

  function downloadDocument(id) {
    const docs = StorageManager.get('documents');
    const doc = docs.find(function (d) { return String(d.id) === String(id); });
    if (!doc) return;

    const content = '=== ARSIP DOKUMEN KURIKULUM SMKN 1 BANJARMASIN ===\n\n' +
      'ID: ' + doc.id + '\n' +
      'Nama Dokumen: ' + doc.name + '\n' +
      'Kategori: ' + doc.category + '\n' +
      'Tahun Ajaran: ' + doc.school_year + '\n' +
      'Tanggal Upload: ' + doc.uploaded_at + '\n' +
      'Deskripsi: ' + (doc.description || '-') + '\n\n' +
      'Dokumen ini tersimpan dalam arsip digital Portal Waka Kurikulum SMKN 1 Banjarmasin.';

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = (doc.name.replace(/[^a-zA-Z0-9_-]/g, '_')) + '.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('Mengunduh: ' + doc.name);
  }

  // =========================================================================
  // 8. SCREEN 3: JADWAL PELAJARAN
  // =========================================================================
  function renderSchedules() {
    const schedules = StorageManager.get('schedules');
    const teachers = StorageManager.get('teachers');
    const classes = StorageManager.get('classes');
    const rooms = StorageManager.get('rooms');
    const tbody = document.getElementById('sched-table-tbody');
    const badgeCount = document.getElementById('sched-total-badge');

    populateScheduleFilters(classes, teachers, rooms);

    const filtered = schedules.filter(function (s) {
      const matchesDay = State.scheduleDayFilter === 'all' || s.day === State.scheduleDayFilter;
      const matchesClass = State.scheduleClassFilter === 'all' || String(s.class_id) === String(State.scheduleClassFilter) || s.class_name === State.scheduleClassFilter;
      const matchesTeacher = State.scheduleTeacherFilter === 'all' || String(s.teacher_id) === String(State.scheduleTeacherFilter) || s.teacher_name === State.scheduleTeacherFilter;
      const matchesRoom = State.scheduleRoomFilter === 'all' || String(s.room_id) === String(State.scheduleRoomFilter) || s.room_name === State.scheduleRoomFilter;
      const matchesSearch = !State.scheduleSearchQuery ||
        (s.subject_name && s.subject_name.toLowerCase().includes(State.scheduleSearchQuery.toLowerCase())) ||
        (s.teacher_name && s.teacher_name.toLowerCase().includes(State.scheduleSearchQuery.toLowerCase())) ||
        (s.class_name && s.class_name.toLowerCase().includes(State.scheduleSearchQuery.toLowerCase())) ||
        (s.room_name && s.room_name.toLowerCase().includes(State.scheduleSearchQuery.toLowerCase()));

      return matchesDay && matchesClass && matchesTeacher && matchesRoom && matchesSearch;
    });

    if (badgeCount) badgeCount.textContent = filtered.length + ' Sesi';

    if (State.scheduleViewMode === 'timeline') {
      renderTimelineSchedule(filtered);
      return;
    } else if (State.scheduleViewMode === 'agenda') {
      renderAgendaSchedule(filtered);
      return;
    }

    if (!tbody) return;

    if (filtered.length === 0) {
      tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; padding: 3rem; color: #888888;">' +
        '<div style="font-size: 2.2rem; margin-bottom: 0.5rem;">📅</div>' +
        '<strong>Tidak ada jadwal pelajaran yang cocok dengan filter</strong>' +
        '<p style="font-size: 0.8125rem; color: #999; margin-top: 4px;">Ubah filter atau klik tombol Tambah Jadwal untuk membuat jadwal baru.</p>' +
        '</td></tr>';
      return;
    }

    let html = '';
    filtered.forEach(function (s) {
      html += '<tr>' +
        '<td><span class="badge badge-primary" style="font-weight: 700;">' + s.day + '</span></td>' +
        '<td style="font-family: monospace; font-weight: 600; color: #262626;">' + s.start_time + ' - ' + s.end_time + '</td>' +
        '<td><span class="badge badge-neutral" style="font-weight: 600;">' + s.class_name + '</span></td>' +
        '<td style="font-weight: 600; color: #262626;">' + s.subject_name + '</td>' +
        '<td>' + s.teacher_name + '</td>' +
        '<td><span class="badge badge-outline">' + s.room_name + '</span></td>' +
        '<td>' +
        '<div style="display: flex; gap: 6px;">' +
        '<button class="btn btn-outline btn-sm" onclick="window.PORTAL_APP.editSchedule(\'' + s.id + '\')" title="Edit Jadwal">✏️ Edit</button>' +
        '<button class="btn btn-ghost btn-sm" style="color: #dc2626;" onclick="window.PORTAL_APP.deleteSchedule(\'' + s.id + '\')" title="Hapus">🗑️</button>' +
        '</div>' +
        '</td>' +
        '</tr>';
    });

    tbody.innerHTML = html;
  }

  function renderTimelineSchedule(filtered) {
    const container = document.getElementById('sched-timeline-content');
    if (!container) return;
    if (filtered.length === 0) {
      container.innerHTML = '<div style="text-align: center; padding: 3rem; color: #888888;">' +
        '<div style="font-size: 2.2rem; margin-bottom: 0.5rem;">⏱️</div>' +
        '<strong>Tidak ada jadwal pelajaran yang cocok dengan filter</strong>' +
        '<p style="font-size: 0.8125rem; color: #999; margin-top: 4px;">Ubah filter atau klik tombol Tambah Jadwal untuk membuat jadwal baru.</p>' +
        '</div>';
      return;
    }

    const dayOrder = { 'Senin': 1, 'Selasa': 2, 'Rabu': 3, 'Kamis': 4, 'Jumat': 5, 'Sabtu': 6 };
    const sorted = [].concat(filtered).sort(function (a, b) {
      var dDiff = (dayOrder[a.day] || 9) - (dayOrder[b.day] || 9);
      if (dDiff !== 0) return dDiff;
      return (a.start_time || '').localeCompare(b.start_time || '');
    });

    let html = '';
    sorted.forEach(function (s) {
      html += '<div class="timeline-item-card">' +
        '<div>' +
          '<span class="badge badge-primary" style="font-weight: 700; margin-bottom: 4px; display: inline-block;">' + s.day + '</span>' +
          '<div style="font-family: monospace; font-size: 0.8125rem; font-weight: 700; color: var(--text-primary);">' + s.start_time + ' - ' + s.end_time + '</div>' +
        '</div>' +
        '<div>' +
          '<div style="font-weight: 700; font-size: 0.9375rem; color: var(--simkur-navy); margin-bottom: 2px;">' + s.subject_name + '</div>' +
          '<div style="font-size: 0.8125rem; color: var(--text-secondary); display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">' +
            '<span>👨‍🏫 ' + s.teacher_name + '</span>' +
            '<span>•</span>' +
            '<span class="badge badge-neutral" style="font-weight: 600;">' + s.class_name + '</span>' +
          '</div>' +
        '</div>' +
        '<div style="display: flex; flex-direction: column; align-items: flex-end; gap: 6px;">' +
          '<span class="badge badge-outline" style="font-weight: 600;">📍 ' + s.room_name + '</span>' +
          '<div style="display: flex; gap: 4px;">' +
            '<button class="btn btn-outline btn-sm" onclick="window.PORTAL_APP.editSchedule(\'' + s.id + '\')" title="Edit Jadwal">✏️ Edit</button>' +
            '<button class="btn btn-ghost btn-sm" style="color: #dc2626;" onclick="window.PORTAL_APP.deleteSchedule(\'' + s.id + '\')" title="Hapus">🗑️</button>' +
          '</div>' +
        '</div>' +
      '</div>';
    });
    container.innerHTML = html;
  }

  function renderAgendaSchedule(filtered) {
    const container = document.getElementById('sched-agenda-content');
    if (!container) return;
    if (filtered.length === 0) {
      container.innerHTML = '<div style="text-align: center; padding: 3rem; color: #888888;">' +
        '<div style="font-size: 2.2rem; margin-bottom: 0.5rem;">📅</div>' +
        '<strong>Tidak ada jadwal pelajaran yang cocok dengan filter</strong>' +
        '<p style="font-size: 0.8125rem; color: #999; margin-top: 4px;">Ubah filter atau klik tombol Tambah Jadwal untuk membuat jadwal baru.</p>' +
        '</div>';
      return;
    }

    const days = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    const grouped = {};
    days.forEach(function (d) { grouped[d] = []; });
    filtered.forEach(function (s) {
      if (!grouped[s.day]) grouped[s.day] = [];
      grouped[s.day].push(s);
    });

    let html = '';
    days.forEach(function (d) {
      const list = grouped[d];
      if (!list || list.length === 0) return;
      list.sort(function (a, b) { return (a.start_time || '').localeCompare(b.start_time || ''); });

      html += '<div class="agenda-day-block">' +
        '<div class="agenda-day-header">' +
          '<span>📅 ' + d + '</span>' +
          '<span class="badge badge-primary" style="font-size: 0.75rem;">' + list.length + ' Sesi KBM</span>' +
        '</div>' +
        '<div>';

      list.forEach(function (s) {
        html += '<div class="agenda-session-row">' +
          '<div style="display: flex; align-items: center; gap: 12px; min-width: 220px;">' +
            '<div style="font-family: monospace; font-size: 0.8125rem; font-weight: 700; color: var(--simkur-blue); background: var(--soft-blue); padding: 4px 8px; border-radius: var(--radius-sm);">' +
              s.start_time + ' - ' + s.end_time +
            '</div>' +
            '<div>' +
              '<div style="font-weight: 700; font-size: 0.875rem; color: var(--text-primary);">' + s.subject_name + '</div>' +
              '<div style="font-size: 0.75rem; color: var(--text-secondary);">' + s.teacher_name + '</div>' +
            '</div>' +
          '</div>' +
          '<div style="display: flex; align-items: center; gap: 10px;">' +
            '<span class="badge badge-neutral" style="font-weight: 600;">' + s.class_name + '</span>' +
            '<span class="badge badge-outline">📍 ' + s.room_name + '</span>' +
            '<div style="display: flex; gap: 4px;">' +
              '<button class="btn btn-outline btn-sm" onclick="window.PORTAL_APP.editSchedule(\'' + s.id + '\')" title="Edit">✏️</button>' +
              '<button class="btn btn-ghost btn-sm" style="color: #dc2626;" onclick="window.PORTAL_APP.deleteSchedule(\'' + s.id + '\')" title="Hapus">🗑️</button>' +
            '</div>' +
          '</div>' +
        '</div>';
      });

      html += '</div></div>';
    });
    container.innerHTML = html;
  }

  function setScheduleViewMode(mode, btn) {
    State.scheduleViewMode = mode;
    document.querySelectorAll('#schedule-mode-tabs .schedule-mode-btn').forEach(function (b) {
      b.classList.remove('active');
    });
    if (btn) {
      btn.classList.add('active');
    } else {
      const target = document.querySelector('#schedule-mode-tabs .schedule-mode-btn[data-mode="' + mode + '"]');
      if (target) target.classList.add('active');
    }

    const tbl = document.getElementById('sched-container-table');
    const tml = document.getElementById('sched-container-timeline');
    const agd = document.getElementById('sched-container-agenda');

    if (tbl) tbl.style.display = mode === 'table' ? 'block' : 'none';
    if (tml) tml.style.display = mode === 'timeline' ? 'block' : 'none';
    if (agd) agd.style.display = mode === 'agenda' ? 'block' : 'none';

    renderSchedules();
  }

  function populateScheduleFilters(classes, teachers, rooms) {
    const selClass = document.getElementById('sched-class-filter');
    const selTeacher = document.getElementById('sched-teacher-filter');
    const selRoom = document.getElementById('sched-room-filter');

    if (selClass && selClass.options.length <= 1) {
      classes.forEach(function (c) {
        const opt = document.createElement('option');
        opt.value = c.name;
        opt.textContent = c.name;
        selClass.appendChild(opt);
      });
    }

    if (selTeacher && selTeacher.options.length <= 1) {
      teachers.forEach(function (t) {
        const opt = document.createElement('option');
        opt.value = t.name;
        opt.textContent = t.name;
        selTeacher.appendChild(opt);
      });
    }

    if (selRoom && selRoom.options.length <= 1) {
      const roomList = rooms || StorageManager.get('rooms') || [];
      roomList.forEach(function (r) {
        const opt = document.createElement('option');
        opt.value = r.name;
        opt.textContent = r.name;
        selRoom.appendChild(opt);
      });
    }
  }

  function openScheduleModal(editId) {
    const form = document.getElementById('form-modal-schedule');
    if (!form) return;
    form.reset();

    const titleEl = document.getElementById('modal-schedule-title');

    const classes = StorageManager.get('classes');
    const subjects = StorageManager.get('subjects');
    const teachers = StorageManager.get('teachers');
    const rooms = StorageManager.get('rooms');

    const selClass = document.getElementById('input-sched-class');
    const selSubject = document.getElementById('input-sched-subject');
    const selTeacher = document.getElementById('input-sched-teacher');
    const selRoom = document.getElementById('input-sched-room');

    if (selClass) {
      selClass.innerHTML = '<option value="">-- Pilih Kelas --</option>' +
        classes.map(function (c) { return '<option value="' + c.id + '" data-name="' + c.name + '">' + c.name + '</option>'; }).join('');
    }
    if (selSubject) {
      selSubject.innerHTML = '<option value="">-- Pilih Mata Pelajaran --</option>' +
        subjects.map(function (s) { return '<option value="' + s.id + '" data-name="' + s.name + '">' + s.code + ' — ' + s.name + '</option>'; }).join('');
    }
    if (selTeacher) {
      selTeacher.innerHTML = '<option value="">-- Pilih Guru Pengampu --</option>' +
        teachers.map(function (t) { return '<option value="' + t.id + '" data-name="' + t.name + '">' + t.name + ' (' + (t.nip || '-') + ')</option>'; }).join('');
    }
    if (selRoom) {
      selRoom.innerHTML = '<option value="">-- Pilih Ruang --</option>' +
        rooms.map(function (r) { return '<option value="' + r.id + '" data-name="' + r.name + '">' + r.name + '</option>'; }).join('');
    }

    if (editId) {
      const schedules = StorageManager.get('schedules');
      const item = schedules.find(function (s) { return String(s.id) === String(editId); });
      if (item) {
        State.editingItem = item;
        if (titleEl) titleEl.textContent = 'Edit Jadwal Pelajaran';
        document.getElementById('input-sched-id').value = item.id;
        document.getElementById('input-sched-day').value = item.day;
        document.getElementById('input-sched-start').value = item.start_time;
        document.getElementById('input-sched-end').value = item.end_time;
        if (selClass) selClass.value = item.class_id;
        if (selSubject) selSubject.value = item.subject_id;
        if (selTeacher) selTeacher.value = item.teacher_id;
        if (selRoom) selRoom.value = item.room_id;
      }
    } else {
      State.editingItem = null;
      if (titleEl) titleEl.textContent = 'Tambah Jadwal Pelajaran Baru';
      document.getElementById('input-sched-id').value = '';
    }

    openModal('modal-schedule');
  }

  function handleSaveSchedule(e) {
    e.preventDefault();
    const id = document.getElementById('input-sched-id').value;
    const day = document.getElementById('input-sched-day').value;
    const startTime = document.getElementById('input-sched-start').value.trim();
    const endTime = document.getElementById('input-sched-end').value.trim();

    const selClass = document.getElementById('input-sched-class');
    const selSubject = document.getElementById('input-sched-subject');
    const selTeacher = document.getElementById('input-sched-teacher');
    const selRoom = document.getElementById('input-sched-room');

    const classId = selClass.value;
    const className = selClass.options[selClass.selectedIndex] ? selClass.options[selClass.selectedIndex].getAttribute('data-name') : '';

    const subjectId = selSubject.value;
    const subjectName = selSubject.options[selSubject.selectedIndex] ? selSubject.options[selSubject.selectedIndex].getAttribute('data-name') : '';

    const teacherId = selTeacher.value;
    const teacherName = selTeacher.options[selTeacher.selectedIndex] ? selTeacher.options[selTeacher.selectedIndex].getAttribute('data-name') : '';

    const roomId = selRoom.value;
    const roomName = selRoom.options[selRoom.selectedIndex] ? selRoom.options[selRoom.selectedIndex].getAttribute('data-name') : '';

    if (!classId || !subjectId || !teacherId || !roomId) {
      showToast('Seluruh pilihan (Kelas, Mapel, Guru, Ruang) wajib diisi!', 'danger');
      return;
    }

    if (id) {
      StorageManager.update('schedules', id, {
        day: day,
        start_time: startTime,
        end_time: endTime,
        class_id: classId,
        class_name: className,
        subject_id: subjectId,
        subject_name: subjectName,
        teacher_id: teacherId,
        teacher_name: teacherName,
        room_id: roomId,
        room_name: roomName
      });
      showToast('Jadwal pelajaran berhasil diperbarui!');
    } else {
      const newSched = {
        id: 'SCH-' + Date.now(),
        day: day,
        start_time: startTime,
        end_time: endTime,
        class_id: classId,
        class_name: className,
        subject_id: subjectId,
        subject_name: subjectName,
        teacher_id: teacherId,
        teacher_name: teacherName,
        room_id: roomId,
        room_name: roomName
      };
      StorageManager.add('schedules', newSched);
      showToast('Jadwal pelajaran berhasil ditambahkan!');
    }

    closeModal('modal-schedule');
    renderSchedules();
    renderDashboard();
  }

  function deleteSchedule(id) {
    if (!confirm('Hapus jadwal pelajaran ini?')) return;
    StorageManager.delete('schedules', id);
    showToast('Jadwal berhasil dihapus!');
    renderSchedules();
    renderDashboard();
  }

  // =========================================================================
  // 9. SCREEN 4: DATA MASTER (GURU, KELAS, MAPEL, RUANG) - BEBAS GESER
  // =========================================================================
  function setMasterViewMode(mode) {
    State.masterViewMode = mode;
    const btnCard = document.getElementById('btn-master-mode-card');
    const btnTable = document.getElementById('btn-master-mode-table');
    if (btnCard) btnCard.classList.toggle('active', mode === 'card');
    if (btnTable) btnTable.classList.toggle('active', mode === 'table');

    ['teachers', 'classes', 'subjects', 'rooms'].forEach(function (k) {
      const cardCont = document.getElementById('master-' + k + '-cards-container');
      const tableCont = document.getElementById('master-' + k + '-table-container');
      if (cardCont) cardCont.style.display = (mode === 'card') ? 'grid' : 'none';
      if (tableCont) tableCont.style.display = (mode === 'table') ? 'block' : 'none';
    });
  }

  function renderDataMaster() {
    const tab = State.activeMasterTab || 'teachers';

    // Subtab button states
    document.querySelectorAll('.master-subtab-btn').forEach(function (btn) {
      if (btn.getAttribute('data-master-tab') === tab) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    // Subtab pane visibility
    document.querySelectorAll('.master-tab-pane').forEach(function (pane) {
      if (pane.id === 'master-pane-' + tab) {
        pane.style.display = 'block';
      } else {
        pane.style.display = 'none';
      }
    });

    // Update counts
    const teachers = StorageManager.get('teachers');
    const classes = StorageManager.get('classes');
    const subjects = StorageManager.get('subjects');
    const rooms = StorageManager.get('rooms');

    const cT = document.getElementById('count-teachers');
    const cC = document.getElementById('count-classes');
    const cS = document.getElementById('count-subjects');
    const cR = document.getElementById('count-rooms');

    if (cT) cT.textContent = String(teachers.length);
    if (cC) cC.textContent = String(classes.length);
    if (cS) cS.textContent = String(subjects.length);
    if (cR) cR.textContent = String(rooms.length);

    const cTMob = document.getElementById('count-teachers-mob');
    const cCMob = document.getElementById('count-classes-mob');
    const cSMob = document.getElementById('count-subjects-mob');
    const cRMob = document.getElementById('count-rooms-mob');
    if (cTMob) cTMob.textContent = String(teachers.length);
    if (cCMob) cCMob.textContent = String(classes.length);
    if (cSMob) cSMob.textContent = String(subjects.length);
    if (cRMob) cRMob.textContent = String(rooms.length);

    // Update Add Button Label dynamically
    const btnAdd = document.getElementById('btn-add-master-item');
    if (btnAdd) {
      const labels = {
        'teachers': '+ Tambah Guru',
        'classes': '+ Tambah Kelas',
        'subjects': '+ Tambah Mapel',
        'rooms': '+ Tambah Ruang'
      };
      btnAdd.textContent = labels[tab] || '+ Tambah Data';
    }

    if (tab === 'teachers') renderMasterTeachers(teachers);
    else if (tab === 'classes') renderMasterClasses(classes);
    else if (tab === 'subjects') renderMasterSubjects(subjects);
    else if (tab === 'rooms') renderMasterRooms(rooms);

    setMasterViewMode(State.masterViewMode || 'card');
  }

  function switchMasterTab(tabName) {
    State.activeMasterTab = tabName;
    renderDataMaster();
  }

  // 9.1 Master Guru
  function renderMasterTeachers(teachers) {
    const tbody = document.getElementById('master-teachers-tbody');
    const cardsCont = document.getElementById('master-teachers-cards-container');
    if (!tbody && !cardsCont) return;

    const q = (State.masterSearchQuery || '').toLowerCase();
    const filtered = teachers.filter(function (t) {
      return !q || (t.name && t.name.toLowerCase().includes(q)) || (t.nip && t.nip.includes(q)) || (t.subject && t.subject.toLowerCase().includes(q));
    });

    if (filtered.length === 0) {
      if (tbody) tbody.innerHTML = '<tr><td colspan="7" style="text-align:center; padding: 2rem; color: #888;">Tidak ada data guru yang cocok.</td></tr>';
      if (cardsCont) {
        cardsCont.innerHTML = '<div style="grid-column: 1 / -1; text-align: center; padding: 3rem 1.5rem; background: #FFFFFF; border-radius: 16px; border: 1.5px dashed #CBD5E1; color: #64748B;">' +
          '<div style="font-size: 2.2rem; margin-bottom: 0.5rem;">👨‍🏫</div>' +
          '<h4 style="font-weight: 700; color: #1E293B; margin-bottom: 4px;">Tidak Ada Data Guru yang Cocok</h4>' +
          '<p style="font-size: 0.8125rem; color: #94A3B8; margin: 0;">Ubah kata kunci pencarian atau tambah guru baru.</p>' +
          '</div>';
      }
      return;
    }

    let tableHtml = '';
    let cardsHtml = '';

    filtered.forEach(function (t, i) {
      const initials = (t.name || 'G').split(' ').map(function (n) { return n[0]; }).slice(0, 2).join('').toUpperCase();
      const dept = t.department || 'Umum';

      // 1. Table row
      tableHtml += '<tr>' +
        '<td style="text-align: center; color: #888; font-size: 0.8125rem;">' + (i + 1) + '</td>' +
        '<td style="font-weight: 600; color: #262626;">' + t.name + '</td>' +
        '<td style="font-family: monospace; font-size: 0.8125rem;">' + (t.nip || '-') + '</td>' +
        '<td><span class="badge badge-neutral">' + dept + '</span></td>' +
        '<td>' + (t.subject || '-') + '</td>' +
        '<td>' +
        '<span class="badge ' + (t.is_active ? 'badge-success' : 'badge-neutral') + '">' +
        (t.is_active ? '● Aktif' : '○ Nonaktif') +
        '</span>' +
        '</td>' +
        '<td>' +
        '<div style="display: flex; gap: 6px;">' +
        '<button class="btn btn-outline btn-sm" onclick="window.PORTAL_APP.editTeacher(\'' + t.id + '\')">✏️ Edit</button>' +
        '<button class="btn btn-ghost btn-sm" style="color: #dc2626;" onclick="window.PORTAL_APP.deleteTeacher(\'' + t.id + '\')">🗑️</button>' +
        '</div>' +
        '</td>' +
        '</tr>';

      // 2. Responsive Card (Bebas Geser)
      cardsHtml += '<div class="master-card master-teacher-card" id="master-teacher-card-' + t.id + '">' +
        '  <div class="master-card-header">' +
        '    <div class="master-avatar" title="' + t.name + '">' + initials + '</div>' +
        '    <div class="master-card-header-info">' +
        '      <h4 class="master-card-title">' + t.name + '</h4>' +
        '      <span class="master-card-subtitle font-mono">NIP. ' + (t.nip || '-') + '</span>' +
        '    </div>' +
        '    <span class="badge ' + (t.is_active ? 'badge-success' : 'badge-neutral') + '" style="font-size: 0.725rem; white-space: nowrap;">' +
        (t.is_active ? '● Aktif' : '○ Nonaktif') +
        '    </span>' +
        '  </div>' +
        '  <div class="master-card-body">' +
        '    <div class="master-badge-row">' +
        '      <span class="badge badge-primary" style="font-size: 0.75rem;">' + dept + '</span>' +
        '      <span class="master-card-subject">📚 ' + (t.subject || 'Pengampu Mapel') + '</span>' +
        '    </div>' +
        '  </div>' +
        '  <div class="master-card-footer">' +
        '    <button type="button" class="btn btn-outline btn-sm master-act-btn" onclick="window.PORTAL_APP.editTeacher(\'' + t.id + '\')" title="Edit Data">' +
        '      <span>✏️ Edit</span>' +
        '    </button>' +
        '    <button type="button" class="btn btn-ghost btn-sm master-act-btn" style="color: #dc2626;" onclick="window.PORTAL_APP.deleteTeacher(\'' + t.id + '\')" title="Hapus Data">' +
        '      <span>🗑️</span>' +
        '    </button>' +
        '  </div>' +
        '</div>';
    });

    if (tbody) tbody.innerHTML = tableHtml;
    if (cardsCont) cardsCont.innerHTML = cardsHtml;
  }

  function openTeacherModal(editId) {
    const form = document.getElementById('form-modal-teacher');
    if (!form) return;
    form.reset();

    const titleEl = document.getElementById('modal-teacher-title');
    if (editId) {
      const teachers = StorageManager.get('teachers');
      const item = teachers.find(function (t) { return String(t.id) === String(editId); });
      if (item) {
        State.editingItem = item;
        if (titleEl) titleEl.textContent = 'Edit Data Guru';
        document.getElementById('input-teacher-id').value = item.id;
        document.getElementById('input-teacher-name').value = item.name;
        document.getElementById('input-teacher-nip').value = item.nip || '';
        document.getElementById('input-teacher-dept').value = item.department || 'Umum';
        document.getElementById('input-teacher-subject').value = item.subject || '';
        document.getElementById('select-teacher-status').value = item.is_active ? 'true' : 'false';
      }
    } else {
      State.editingItem = null;
      if (titleEl) titleEl.textContent = 'Tambah Guru Baru';
      document.getElementById('input-teacher-id').value = '';
    }

    openModal('modal-teacher');
  }

  function handleSaveTeacher(e) {
    e.preventDefault();
    const id = document.getElementById('input-teacher-id').value;
    const name = document.getElementById('input-teacher-name').value.trim();
    const nip = document.getElementById('input-teacher-nip').value.trim();
    const dept = document.getElementById('input-teacher-dept').value;
    const subject = document.getElementById('input-teacher-subject').value.trim();
    const isActive = document.getElementById('select-teacher-status').value === 'true';

    if (!name) {
      showToast('Nama guru wajib diisi!', 'danger');
      return;
    }

    if (id) {
      StorageManager.update('teachers', id, {
        name: name,
        nip: nip,
        department: dept,
        subject: subject,
        is_active: isActive
      });
      showToast('Data guru berhasil diperbarui!');
    } else {
      const newT = {
        id: 'T-' + Date.now(),
        name: name,
        nip: nip,
        department: dept,
        subject: subject,
        is_active: isActive
      };
      StorageManager.add('teachers', newT);
      showToast('Guru baru berhasil ditambahkan!');
    }

    closeModal('modal-teacher');
    renderDataMaster();
    renderDashboard();
  }

  function deleteTeacher(id) {
    if (!confirm('Hapus data guru ini dari direktori?')) return;
    StorageManager.delete('teachers', id);
    showToast('Data guru berhasil dihapus!');
    renderDataMaster();
    renderDashboard();
  }

  // 9.2 Master Kelas
  function renderMasterClasses(classes) {
    const tbody = document.getElementById('master-classes-tbody');
    const cardsCont = document.getElementById('master-classes-cards-container');
    if (!tbody && !cardsCont) return;

    const q = (State.masterSearchQuery || '').toLowerCase();
    const filtered = classes.filter(function (c) {
      return !q || (c.name && c.name.toLowerCase().includes(q)) || (c.major && c.major.toLowerCase().includes(q));
    });

    if (filtered.length === 0) {
      if (tbody) tbody.innerHTML = '<tr><td colspan="7" style="text-align:center; padding: 2rem; color: #888;">Tidak ada data kelas yang cocok.</td></tr>';
      if (cardsCont) {
        cardsCont.innerHTML = '<div style="grid-column: 1 / -1; text-align: center; padding: 3rem 1.5rem; background: #FFFFFF; border-radius: 16px; border: 1.5px dashed #CBD5E1; color: #64748B;">' +
          '<div style="font-size: 2.2rem; margin-bottom: 0.5rem;">🏫</div>' +
          '<h4 style="font-weight: 700; color: #1E293B; margin-bottom: 4px;">Tidak Ada Data Kelas yang Cocok</h4>' +
          '<p style="font-size: 0.8125rem; color: #94A3B8; margin: 0;">Ubah kata kunci pencarian atau tambah kelas baru.</p>' +
          '</div>';
      }
      return;
    }

    let tableHtml = '';
    let cardsHtml = '';

    filtered.forEach(function (c, i) {
      // 1. Table row
      tableHtml += '<tr>' +
        '<td style="text-align: center; color: #888; font-size: 0.8125rem;">' + (i + 1) + '</td>' +
        '<td style="font-weight: 700; color: #262626;">' + c.name + '</td>' +
        '<td><span class="badge badge-neutral">' + c.grade + '</span></td>' +
        '<td><span class="badge badge-primary">' + c.major + '</span></td>' +
        '<td>' + (c.total_students || 36) + ' Siswa</td>' +
        '<td><span class="badge ' + (c.is_active ? 'badge-success' : 'badge-neutral') + '">' + (c.is_active ? '● Aktif' : '○ Nonaktif') + '</span></td>' +
        '<td>' +
        '<div style="display: flex; gap: 6px;">' +
        '<button class="btn btn-outline btn-sm" onclick="window.PORTAL_APP.editClass(\'' + c.id + '\')">✏️ Edit</button>' +
        '<button class="btn btn-ghost btn-sm" style="color: #dc2626;" onclick="window.PORTAL_APP.deleteClass(\'' + c.id + '\')">🗑️</button>' +
        '</div>' +
        '</td>' +
        '</tr>';

      // 2. Responsive Card
      cardsHtml += '<div class="master-card master-class-card" id="master-class-card-' + c.id + '">' +
        '  <div class="master-card-header">' +
        '    <div class="master-class-icon">🏫</div>' +
        '    <div class="master-card-header-info">' +
        '      <h4 class="master-card-title">' + c.name + '</h4>' +
        '      <span class="master-card-subtitle">Tingkat ' + c.grade + '</span>' +
        '    </div>' +
        '    <span class="badge ' + (c.is_active ? 'badge-success' : 'badge-neutral') + '" style="font-size: 0.725rem;">' +
        (c.is_active ? '● Aktif' : '○ Nonaktif') +
        '    </span>' +
        '  </div>' +
        '  <div class="master-card-body">' +
        '    <div class="master-badge-row">' +
        '      <span class="badge badge-primary" style="font-size: 0.75rem;">' + c.major + '</span>' +
        '      <span class="badge badge-neutral" style="font-size: 0.75rem;">👥 ' + (c.total_students || 36) + ' Siswa</span>' +
        '    </div>' +
        '  </div>' +
        '  <div class="master-card-footer">' +
        '    <button type="button" class="btn btn-outline btn-sm master-act-btn" onclick="window.PORTAL_APP.editClass(\'' + c.id + '\')">' +
        '      <span>✏️ Edit</span>' +
        '    </button>' +
        '    <button type="button" class="btn btn-ghost btn-sm master-act-btn" style="color: #dc2626;" onclick="window.PORTAL_APP.deleteClass(\'' + c.id + '\')">' +
        '      <span>🗑️</span>' +
        '    </button>' +
        '  </div>' +
        '</div>';
    });

    if (tbody) tbody.innerHTML = tableHtml;
    if (cardsCont) cardsCont.innerHTML = cardsHtml;
  }

  function openClassModal(editId) {
    const form = document.getElementById('form-modal-class');
    if (!form) return;
    form.reset();

    const titleEl = document.getElementById('modal-class-title');
    if (editId) {
      const classes = StorageManager.get('classes');
      const item = classes.find(function (c) { return String(c.id) === String(editId); });
      if (item) {
        State.editingItem = item;
        if (titleEl) titleEl.textContent = 'Edit Data Kelas';
        document.getElementById('input-class-id').value = item.id;
        document.getElementById('input-class-name').value = item.name;
        document.getElementById('select-class-grade').value = item.grade;
        document.getElementById('select-class-major').value = item.major;
        document.getElementById('input-class-students').value = item.total_students || 36;
        document.getElementById('select-class-status').value = item.is_active ? 'true' : 'false';
      }
    } else {
      State.editingItem = null;
      if (titleEl) titleEl.textContent = 'Tambah Kelas Baru';
      document.getElementById('input-class-id').value = '';
    }

    openModal('modal-class');
  }

  function handleSaveClass(e) {
    e.preventDefault();
    const id = document.getElementById('input-class-id').value;
    const name = document.getElementById('input-class-name').value.trim();
    const grade = document.getElementById('select-class-grade').value;
    const major = document.getElementById('select-class-major').value;
    const students = parseInt(document.getElementById('input-class-students').value, 10) || 36;
    const isActive = document.getElementById('select-class-status').value === 'true';

    if (!name) {
      showToast('Nama kelas wajib diisi (contoh: X TKJ 1)!', 'danger');
      return;
    }

    if (id) {
      StorageManager.update('classes', id, {
        name: name,
        grade: grade,
        major: major,
        total_students: students,
        is_active: isActive
      });
      showToast('Data kelas berhasil diperbarui!');
    } else {
      const newC = {
        id: 'C-' + Date.now(),
        name: name,
        grade: grade,
        major: major,
        total_students: students,
        is_active: isActive
      };
      StorageManager.add('classes', newC);
      showToast('Kelas baru berhasil ditambahkan!');
    }

    closeModal('modal-class');
    renderDataMaster();
    renderDashboard();
  }

  function deleteClass(id) {
    if (!confirm('Hapus kelas ini?')) return;
    StorageManager.delete('classes', id);
    showToast('Kelas berhasil dihapus!');
    renderDataMaster();
    renderDashboard();
  }

  // 9.3 Master Mapel
  function renderMasterSubjects(subjects) {
    const tbody = document.getElementById('master-subjects-tbody');
    const cardsCont = document.getElementById('master-subjects-cards-container');
    if (!tbody && !cardsCont) return;

    const q = (State.masterSearchQuery || '').toLowerCase();
    const filtered = subjects.filter(function (s) {
      return !q || (s.name && s.name.toLowerCase().includes(q)) || (s.code && s.code.toLowerCase().includes(q));
    });

    if (filtered.length === 0) {
      if (tbody) tbody.innerHTML = '<tr><td colspan="6" style="text-align:center; padding: 2rem; color: #888;">Tidak ada data mata pelajaran.</td></tr>';
      if (cardsCont) {
        cardsCont.innerHTML = '<div style="grid-column: 1 / -1; text-align: center; padding: 3rem 1.5rem; background: #FFFFFF; border-radius: 16px; border: 1.5px dashed #CBD5E1; color: #64748B;">' +
          '<div style="font-size: 2.2rem; margin-bottom: 0.5rem;">📖</div>' +
          '<h4 style="font-weight: 700; color: #1E293B; margin-bottom: 4px;">Tidak Ada Data Mata Pelajaran</h4>' +
          '<p style="font-size: 0.8125rem; color: #94A3B8; margin: 0;">Ubah kata kunci pencarian atau tambah mapel baru.</p>' +
          '</div>';
      }
      return;
    }

    let tableHtml = '';
    let cardsHtml = '';

    filtered.forEach(function (s, i) {
      const isKejuruan = s.category === 'Kejuruan';

      // 1. Table row
      tableHtml += '<tr>' +
        '<td style="text-align: center; color: #888; font-size: 0.8125rem;">' + (i + 1) + '</td>' +
        '<td><span class="badge badge-neutral" style="font-family: monospace; font-weight: 700;">' + s.code + '</span></td>' +
        '<td style="font-weight: 600; color: #262626;">' + s.name + '</td>' +
        '<td><span class="badge ' + (isKejuruan ? 'badge-primary' : 'badge-outline') + '">' + (s.category || 'Umum') + '</span></td>' +
        '<td><span class="badge ' + (s.is_active ? 'badge-success' : 'badge-neutral') + '">' + (s.is_active ? '● Aktif' : '○ Nonaktif') + '</span></td>' +
        '<td>' +
        '<div style="display: flex; gap: 6px;">' +
        '<button class="btn btn-outline btn-sm" onclick="window.PORTAL_APP.editSubject(\'' + s.id + '\')">✏️ Edit</button>' +
        '<button class="btn btn-ghost btn-sm" style="color: #dc2626;" onclick="window.PORTAL_APP.deleteSubject(\'' + s.id + '\')">🗑️</button>' +
        '</div>' +
        '</td>' +
        '</tr>';

      // 2. Responsive Card
      cardsHtml += '<div class="master-card master-subject-card" id="master-subject-card-' + s.id + '">' +
        '  <div class="master-card-header">' +
        '    <div class="master-code-badge">' + s.code + '</div>' +
        '    <div class="master-card-header-info">' +
        '      <h4 class="master-card-title">' + s.name + '</h4>' +
        '      <span class="badge ' + (isKejuruan ? 'badge-primary' : 'badge-neutral') + '" style="font-size: 0.725rem; width: fit-content; margin-top: 3px;">' + (s.category || 'Umum') + '</span>' +
        '    </div>' +
        '    <span class="badge ' + (s.is_active ? 'badge-success' : 'badge-neutral') + '" style="font-size: 0.725rem;">' +
        (s.is_active ? '● Aktif' : '○ Nonaktif') +
        '    </span>' +
        '  </div>' +
        '  <div class="master-card-footer">' +
        '    <button type="button" class="btn btn-outline btn-sm master-act-btn" onclick="window.PORTAL_APP.editSubject(\'' + s.id + '\')">' +
        '      <span>✏️ Edit</span>' +
        '    </button>' +
        '    <button type="button" class="btn btn-ghost btn-sm master-act-btn" style="color: #dc2626;" onclick="window.PORTAL_APP.deleteSubject(\'' + s.id + '\')">' +
        '      <span>🗑️</span>' +
        '    </button>' +
        '  </div>' +
        '</div>';
    });

    if (tbody) tbody.innerHTML = tableHtml;
    if (cardsCont) cardsCont.innerHTML = cardsHtml;
  }

  function openSubjectModal(editId) {
    const form = document.getElementById('form-modal-subject');
    if (!form) return;
    form.reset();

    const titleEl = document.getElementById('modal-subject-title');
    if (editId) {
      const subjects = StorageManager.get('subjects');
      const item = subjects.find(function (s) { return String(s.id) === String(editId); });
      if (item) {
        State.editingItem = item;
        if (titleEl) titleEl.textContent = 'Edit Mata Pelajaran';
        document.getElementById('input-subject-id').value = item.id;
        document.getElementById('input-subject-code').value = item.code;
        document.getElementById('input-subject-name').value = item.name;
        document.getElementById('select-subject-category').value = item.category || 'Umum';
        document.getElementById('select-subject-status').value = item.is_active ? 'true' : 'false';
      }
    } else {
      State.editingItem = null;
      if (titleEl) titleEl.textContent = 'Tambah Mata Pelajaran Baru';
      document.getElementById('input-subject-id').value = '';
    }

    openModal('modal-subject');
  }

  function handleSaveSubject(e) {
    e.preventDefault();
    const id = document.getElementById('input-subject-id').value;
    const code = document.getElementById('input-subject-code').value.trim();
    const name = document.getElementById('input-subject-name').value.trim();
    const category = document.getElementById('select-subject-category').value;
    const isActive = document.getElementById('select-subject-status').value === 'true';

    if (!name || !code) {
      showToast('Kode dan Nama mata pelajaran wajib diisi!', 'danger');
      return;
    }

    if (id) {
      StorageManager.update('subjects', id, {
        code: code,
        name: name,
        category: category,
        is_active: isActive
      });
      showToast('Mata pelajaran berhasil diperbarui!');
    } else {
      const newS = {
        id: 'S-' + Date.now(),
        code: code,
        name: name,
        category: category,
        is_active: isActive
      };
      StorageManager.add('subjects', newS);
      showToast('Mata pelajaran berhasil ditambahkan!');
    }

    closeModal('modal-subject');
    renderDataMaster();
  }

  function deleteSubject(id) {
    if (!confirm('Hapus mata pelajaran ini?')) return;
    StorageManager.delete('subjects', id);
    showToast('Mata pelajaran berhasil dihapus!');
    renderDataMaster();
  }

  // 9.4 Master Ruang
  function renderMasterRooms(rooms) {
    const tbody = document.getElementById('master-rooms-tbody');
    const cardsCont = document.getElementById('master-rooms-cards-container');
    if (!tbody && !cardsCont) return;

    const q = (State.masterSearchQuery || '').toLowerCase();
    const filtered = rooms.filter(function (r) {
      return !q || (r.name && r.name.toLowerCase().includes(q)) || (r.description && r.description.toLowerCase().includes(q));
    });

    if (filtered.length === 0) {
      if (tbody) tbody.innerHTML = '<tr><td colspan="5" style="text-align:center; padding: 2rem; color: #888;">Tidak ada data ruang.</td></tr>';
      if (cardsCont) {
        cardsCont.innerHTML = '<div style="grid-column: 1 / -1; text-align: center; padding: 3rem 1.5rem; background: #FFFFFF; border-radius: 16px; border: 1.5px dashed #CBD5E1; color: #64748B;">' +
          '<div style="font-size: 2.2rem; margin-bottom: 0.5rem;">🚪</div>' +
          '<h4 style="font-weight: 700; color: #1E293B; margin-bottom: 4px;">Tidak Ada Data Ruang</h4>' +
          '<p style="font-size: 0.8125rem; color: #94A3B8; margin: 0;">Ubah kata kunci pencarian atau tambah ruang baru.</p>' +
          '</div>';
      }
      return;
    }

    let tableHtml = '';
    let cardsHtml = '';

    filtered.forEach(function (r, i) {
      // 1. Table row
      tableHtml += '<tr>' +
        '<td style="text-align: center; color: #888; font-size: 0.8125rem;">' + (i + 1) + '</td>' +
        '<td style="font-weight: 700; color: #262626;">' + r.name + '</td>' +
        '<td style="color: #666;">' + (r.description || '-') + '</td>' +
        '<td><span class="badge ' + (r.is_active ? 'badge-success' : 'badge-neutral') + '">' + (r.is_active ? '● Aktif' : '○ Nonaktif') + '</span></td>' +
        '<td>' +
        '<div style="display: flex; gap: 6px;">' +
        '<button class="btn btn-outline btn-sm" onclick="window.PORTAL_APP.editRoom(\'' + r.id + '\')">✏️ Edit</button>' +
        '<button class="btn btn-ghost btn-sm" style="color: #dc2626;" onclick="window.PORTAL_APP.deleteRoom(\'' + r.id + '\')">🗑️</button>' +
        '</div>' +
        '</td>' +
        '</tr>';

      // 2. Responsive Card
      cardsHtml += '<div class="master-card master-room-card" id="master-room-card-' + r.id + '">' +
        '  <div class="master-card-header">' +
        '    <div class="master-room-icon">🚪</div>' +
        '    <div class="master-card-header-info">' +
        '      <h4 class="master-card-title">' + r.name + '</h4>' +
        '      <p class="master-card-desc">' + (r.description || 'Ruang Belajar / Praktik') + '</p>' +
        '    </div>' +
        '    <span class="badge ' + (r.is_active ? 'badge-success' : 'badge-neutral') + '" style="font-size: 0.725rem;">' +
        (r.is_active ? '● Aktif' : '○ Nonaktif') +
        '    </span>' +
        '  </div>' +
        '  <div class="master-card-footer">' +
        '    <button type="button" class="btn btn-outline btn-sm master-act-btn" onclick="window.PORTAL_APP.editRoom(\'' + r.id + '\')">' +
        '      <span>✏️ Edit</span>' +
        '    </button>' +
        '    <button type="button" class="btn btn-ghost btn-sm master-act-btn" style="color: #dc2626;" onclick="window.PORTAL_APP.deleteRoom(\'' + r.id + '\')">' +
        '      <span>🗑️</span>' +
        '    </button>' +
        '  </div>' +
        '</div>';
    });

    if (tbody) tbody.innerHTML = tableHtml;
    if (cardsCont) cardsCont.innerHTML = cardsHtml;
  }

  function openRoomModal(editId) {
    const form = document.getElementById('form-modal-room');
    if (!form) return;
    form.reset();

    const titleEl = document.getElementById('modal-room-title');
    if (editId) {
      const rooms = StorageManager.get('rooms');
      const item = rooms.find(function (r) { return String(r.id) === String(editId); });
      if (item) {
        State.editingItem = item;
        if (titleEl) titleEl.textContent = 'Edit Data Ruang';
        document.getElementById('input-room-id').value = item.id;
        document.getElementById('input-room-name').value = item.name;
        document.getElementById('input-room-desc').value = item.description || '';
        document.getElementById('select-room-status').value = item.is_active ? 'true' : 'false';
      }
    } else {
      State.editingItem = null;
      if (titleEl) titleEl.textContent = 'Tambah Ruang Baru';
      document.getElementById('input-room-id').value = '';
    }

    openModal('modal-room');
  }

  function handleSaveRoom(e) {
    e.preventDefault();
    const id = document.getElementById('input-room-id').value;
    const name = document.getElementById('input-room-name').value.trim();
    const desc = document.getElementById('input-room-desc').value.trim();
    const isActive = document.getElementById('select-room-status').value === 'true';

    if (!name) {
      showToast('Nama ruang wajib diisi (contoh: Lab 1)!', 'danger');
      return;
    }

    if (id) {
      StorageManager.update('rooms', id, {
        name: name,
        description: desc,
        is_active: isActive
      });
      showToast('Data ruang berhasil diperbarui!');
    } else {
      const newR = {
        id: 'R-' + Date.now(),
        name: name,
        description: desc,
        is_active: isActive
      };
      StorageManager.add('rooms', newR);
      showToast('Ruang berhasil ditambahkan!');
    }

    closeModal('modal-room');
    renderDataMaster();
  }

  function deleteRoom(id) {
    if (!confirm('Hapus ruang ini?')) return;
    StorageManager.delete('rooms', id);
    showToast('Ruang berhasil dihapus!');
    renderDataMaster();
  }

  // 9.5 Agenda Modal Handler
  function openAddAgendaModal() {
    const form = document.getElementById('form-modal-agenda');
    if (form) form.reset();
    openModal('modal-agenda');
  }

  function handleSaveAgenda(e) {
    e.preventDefault();
    const date = document.getElementById('input-agenda-date').value;
    const title = document.getElementById('input-agenda-title').value.trim();
    const desc = document.getElementById('input-agenda-desc').value.trim();

    if (!title || !date) {
      showToast('Tanggal dan Judul agenda wajib diisi!', 'danger');
      return;
    }

    const newAgenda = {
      id: 'AG-' + Date.now(),
      date: date,
      title: title,
      description: desc
    };

    StorageManager.add('agendas', newAgenda);
    showToast('Agenda berhasil ditambahkan!');
    closeModal('modal-agenda');
    renderDashboard();
  }

  function deleteAgenda(id) {
    if (!confirm('Hapus agenda ini?')) return;
    StorageManager.delete('agendas', id);
    showToast('Agenda dihapus.');
    renderDashboard();
  }

  // =========================================================================
  // 10. EVENT LISTENERS INITIALIZATION
  // =========================================================================
  function initEventListeners() {
    // 1. Sidebar Nav Click Handler
    document.querySelectorAll('.app-sidebar .nav-item-link').forEach(function (link) {
      link.addEventListener('click', function (e) {
        e.preventDefault();
        const screen = this.getAttribute('data-screen');
        if (screen) switchScreen(screen);
      });
    });

    // 2. Mobile Sidebar Toggle
    const btnToggle = document.getElementById('btn-toggle-sidebar');
    const btnClose = document.getElementById('btn-close-sidebar');
    const backdrop = document.getElementById('sidebar-backdrop');

    if (btnToggle) {
      btnToggle.addEventListener('click', function () {
        document.body.classList.toggle('sidebar-open');
        if (backdrop) backdrop.classList.toggle('active');
      });
    }

    if (btnClose) {
      btnClose.addEventListener('click', closeMobileSidebar);
    }
    if (backdrop) {
      backdrop.addEventListener('click', closeMobileSidebar);
    }

    // 3. Topbar Quick Search
    const topSearch = document.getElementById('topbar-search-input');
    if (topSearch) {
      topSearch.addEventListener('input', function () {
        const val = this.value.trim();
        if (State.currentScreen === 'dokumen') {
          if (State.activeDocTab === 'teachers') {
            State.docTeacherSearchQuery = val;
            renderTeacherAdminTable(StorageManager.get('teacher_admin'));
          } else {
            State.docSearchQuery = val;
            renderArchiveDocsTable(StorageManager.get('documents'));
          }
        } else if (State.currentScreen === 'jadwal') {
          State.scheduleSearchQuery = val;
          renderSchedules();
        } else if (State.currentScreen === 'data-master') {
          State.masterSearchQuery = val;
          renderDataMaster();
        } else if (State.currentScreen === 'supervisi') {
          State.supervisiSearchQuery = val;
          renderSupervisiSesi();
        }
      });
    }

    // 3.1 Supervisi Filters
    const supSearch = document.getElementById('sup-search-guru');
    const supDept = document.getElementById('sup-filter-dept');
    const supStatus = document.getElementById('sup-filter-status');
    const supSupervisor = document.getElementById('sup-filter-supervisor');

    if (supSearch) {
      supSearch.addEventListener('input', function () {
        State.supervisiSearchQuery = this.value.trim();
        renderSupervisiSesi();
      });
    }
    if (supDept) {
      supDept.addEventListener('change', function () {
        State.supervisiDeptFilter = this.value;
        renderSupervisiSesi();
      });
    }
    if (supStatus) {
      supStatus.addEventListener('change', function () {
        State.supervisiStatusFilter = this.value;
        renderSupervisiSesi();
      });
    }
    if (supSupervisor) {
      supSupervisor.addEventListener('change', function () {
        State.supervisiSupervisorFilter = this.value;
        renderSupervisiSesi();
      });
    }

    // 4. Dokumen: Teacher Admin Monitoring Filters
    const docTeacherSearch = document.getElementById('doc-teacher-search');
    const docTeacherDept = document.getElementById('doc-teacher-dept');
    const docTeacherStatus = document.getElementById('doc-teacher-status');

    if (docTeacherSearch) {
      docTeacherSearch.addEventListener('input', function () {
        State.docTeacherSearchQuery = this.value.trim();
        renderTeacherAdminTable(StorageManager.get('teacher_admin'));
      });
    }
    if (docTeacherDept) {
      docTeacherDept.addEventListener('change', function () {
        State.docTeacherDeptFilter = this.value;
        renderTeacherAdminTable(StorageManager.get('teacher_admin'));
      });
    }
    if (docTeacherStatus) {
      docTeacherStatus.addEventListener('change', function () {
        State.docTeacherStatusFilter = this.value;
        renderTeacherAdminTable(StorageManager.get('teacher_admin'));
      });
    }

    // 5. Dokumen: Archive Filters
    const docSearch = document.getElementById('doc-search-input');
    const docCategory = document.getElementById('doc-category-filter');
    const docYear = document.getElementById('doc-year-filter');

    if (docSearch) {
      docSearch.addEventListener('input', function () {
        State.docSearchQuery = this.value.trim();
        renderArchiveDocsTable(StorageManager.get('documents'));
      });
    }
    if (docCategory) {
      docCategory.addEventListener('change', function () {
        State.docCategoryFilter = this.value;
        renderArchiveDocsTable(StorageManager.get('documents'));
      });
    }
    if (docYear) {
      docYear.addEventListener('change', function () {
        State.docYearFilter = this.value;
        renderArchiveDocsTable(StorageManager.get('documents'));
      });
    }

    // 6. Jadwal Filters
    const schedSearch = document.getElementById('sched-search-input');
    const schedDay = document.getElementById('sched-day-filter');
    const schedClass = document.getElementById('sched-class-filter');
    const schedTeacher = document.getElementById('sched-teacher-filter');
    const schedRoom = document.getElementById('sched-room-filter');

    if (schedSearch) {
      schedSearch.addEventListener('input', function () {
        State.scheduleSearchQuery = this.value.trim();
        renderSchedules();
      });
    }
    if (schedDay) {
      schedDay.addEventListener('change', function () {
        State.scheduleDayFilter = this.value;
        renderSchedules();
      });
    }
    if (schedClass) {
      schedClass.addEventListener('change', function () {
        State.scheduleClassFilter = this.value;
        renderSchedules();
      });
    }
    if (schedTeacher) {
      schedTeacher.addEventListener('change', function () {
        State.scheduleTeacherFilter = this.value;
        renderSchedules();
      });
    }
    if (schedRoom) {
      schedRoom.addEventListener('change', function () {
        State.scheduleRoomFilter = this.value;
        renderSchedules();
      });
    }

    // 7. Data Master Subtab Buttons & Search
    document.querySelectorAll('.master-subtab-btn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        const tab = this.getAttribute('data-master-tab');
        if (tab) switchMasterTab(tab);
      });
    });

    const masterSearch = document.getElementById('master-search-input');
    if (masterSearch) {
      masterSearch.addEventListener('input', function () {
        State.masterSearchQuery = this.value.trim();
        renderDataMaster();
      });
    }

    // 8. Form Submissions
    const formDoc = document.getElementById('form-modal-doc');
    if (formDoc) formDoc.addEventListener('submit', handleSaveDocument);

    const formTeacherAdmin = document.getElementById('form-modal-teacher-admin');
    if (formTeacherAdmin) formTeacherAdmin.addEventListener('submit', handleSaveTeacherAdmin);

    const formSched = document.getElementById('form-modal-schedule');
    if (formSched) formSched.addEventListener('submit', handleSaveSchedule);

    const formTeacher = document.getElementById('form-modal-teacher');
    if (formTeacher) formTeacher.addEventListener('submit', handleSaveTeacher);

    const formClass = document.getElementById('form-modal-class');
    if (formClass) formClass.addEventListener('submit', handleSaveClass);

    const formSubject = document.getElementById('form-modal-subject');
    if (formSubject) formSubject.addEventListener('submit', handleSaveSubject);

    const formRoom = document.getElementById('form-modal-room');
    if (formRoom) formRoom.addEventListener('submit', handleSaveRoom);

    const formAgenda = document.getElementById('form-modal-agenda');
    if (formAgenda) formAgenda.addEventListener('submit', handleSaveAgenda);

    const formGuruJurnal = document.getElementById('form-guru-jurnal');
    if (formGuruJurnal) formGuruJurnal.addEventListener('submit', handleSaveGuruJournal);

    const formGuruDoc = document.getElementById('form-modal-guru-doc');
    if (formGuruDoc) formGuruDoc.addEventListener('submit', handleSaveGuruDoc);

    const formChangePwd = document.getElementById('form-modal-change-password');
    if (formChangePwd) formChangePwd.addEventListener('submit', saveChangePassword);

    // 9. Outside click to close modals
    document.querySelectorAll('.modal-overlay').forEach(function (overlay) {
      overlay.addEventListener('click', function (e) {
        if (e.target === this) {
          closeModal(this.id);
        }
      });
    });

    // 10. Escape key to close active modal
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') {
        document.querySelectorAll('.modal-overlay.active').forEach(function (m) {
          closeModal(m.id);
        });
      }
    });
  }

  // =========================================================================
  // 10. PORTAL GURU CONTROLLER (JURNAL, PRESENSI, & UPLOAD DOKUMEN)
  // =========================================================================
  function renderPortalGuru() {
    const teachers = StorageManager.get('teachers') || [];

    // 1. Ambil sesi login aktif dari localStorage
    var session = null;
    try {
      var raw = localStorage.getItem('simkur_session');
      if (raw) session = JSON.parse(raw);
    } catch (e) { /* ignore */ }

    // Helper sanitasi pencocokan akun guru
    var cleanDigits = function (s) { return String(s || '').replace(/\D/g, ''); };
    var cleanStr = function (s) {
      return String(s || '').toLowerCase()
        .replace(/(s\.pd|s\.kom|m\.pd|se|s\.t|dr|dra|drs|h\.|hj\.|m\.m|m\.si|s\.ag|s\.sos|gr\.)/gi, '')
        .replace(/[^a-z0-9]/g, '')
        .trim();
    };

    var matchedTeacher = null;
    if (session) {
      var sessNipDigits = cleanDigits(session.nip);
      var sessNameClean = cleanStr(session.name);

      // 1. Cocokkan berdasarkan NIP (digit murni jika >= 8 digit)
      if (sessNipDigits && sessNipDigits.length >= 8) {
        matchedTeacher = teachers.find(function (t) {
          return cleanDigits(t.nip) === sessNipDigits;
        });
      }

      // 2. Cocokkan berdasarkan nama murni (tanpa gelar akademik)
      if (!matchedTeacher && sessNameClean) {
        matchedTeacher = teachers.find(function (t) {
          return cleanStr(t.name) === sessNameClean || t.name === session.name;
        });
      }

      // 3. Cocokkan berdasarkan kata kunci nama (misal "Ihsan" dan "Muzakki")
      if (!matchedTeacher && session.name) {
        var tokens = session.name.toLowerCase().replace(/[^a-z]/g, ' ').split(/\s+/).filter(function (w) {
          return w.length > 3 && ['guru', 'smkn', 'banjarmasin', 'ahmad', 'muhammad'].indexOf(w) === -1;
        });
        if (tokens.length > 0) {
          matchedTeacher = teachers.find(function (t) {
            var tNameLower = (t.name || '').toLowerCase();
            return tokens.every(function (tok) { return tNameLower.indexOf(tok) !== -1; });
          });
        }
      }
    }

    // Kunci ID guru aktif ke akun guru yang sedang login
    if (matchedTeacher && matchedTeacher.id) {
      State.currentGuruId = matchedTeacher.id;
    } else if (!State.currentGuruId && teachers.length > 0) {
      State.currentGuruId = teachers[0].id;
    }

    const currentTeacherId = State.currentGuruId;
    const teacher = matchedTeacher || teachers.find(function (t) {
      return String(t.id) === String(currentTeacherId);
    }) || teachers[0] || {};

    // 2. Informasi Header Guru - SELALU prioritaskan data akun yang sedang login!
    const displayName = (session && session.name) ? session.name : (teacher.name || 'Guru Pengampu');
    const displayNip = (session && session.nip && session.nip !== '-') ? session.nip : (teacher.nip || '-');
    const displayDept = (session && session.department) ? session.department : (teacher.department || 'Kejuruan');
    const displaySubject = (session && session.subject) ? session.subject : (teacher.subject || 'Mata Pelajaran Produktif');
    const displayAvatar = (session && session.avatar) ? session.avatar : (teacher.avatar || 'assets/teacher_avatar.jpg');

    const elName = document.getElementById('portal-guru-name');
    const elMeta = document.getElementById('portal-guru-meta');
    const elBadge = document.getElementById('portal-guru-badge');
    const elAvatar = document.getElementById('portal-guru-avatar');

    if (elName) elName.textContent = displayName;
    if (elMeta) elMeta.textContent = 'NIP: ' + displayNip + ' • Jurusan: ' + displayDept + ' • ' + displaySubject;
    
    var badgeText = 'Guru Pengampu ' + displayDept;
    if (session && session.title) {
      badgeText = session.title.split('|')[0].trim();
    }
    if (elBadge) elBadge.textContent = badgeText;
    if (elAvatar) elAvatar.src = displayAvatar;

    // 3. Pastikan Dokumen & Jurnal guru ini terinisialisasi secara mandiri (privat)
    let allGuruDocs = StorageManager.get('guru_documents') || [];
    let teacherDocs = allGuruDocs.filter(function (d) {
      return String(d.teacher_id) === String(currentTeacherId);
    });

    if (teacherDocs.length === 0) {
      const defaultDocs = [
        {
          id: 'GDOC-' + currentTeacherId + '-1',
          teacher_id: currentTeacherId,
          title: 'Modul Ajar (RPP) ' + displaySubject + ' Fase E/F',
          category: 'Modul Ajar',
          school_year: '2026/2027',
          file_name: 'Modul_Ajar_' + (displaySubject.replace(/[^a-zA-Z0-9]/g, '_')) + '.pdf',
          file_size: '2.1 MB',
          status: 'Disetujui Waka Kur',
          score: 98,
          notes: 'Sesuai Standar Proses Kurikulum Merdeka & SK Pembagian Tugas 2026.',
          uploaded_at: '2026-07-15'
        },
        {
          id: 'GDOC-' + currentTeacherId + '-2',
          teacher_id: currentTeacherId,
          title: 'Alur Tujuan Pembelajaran (ATP) ' + displaySubject,
          category: 'Silabus & ATP',
          school_year: '2026/2027',
          file_name: 'ATP_' + (displaySubject.replace(/[^a-zA-Z0-9]/g, '_')) + '.pdf',
          file_size: '1.4 MB',
          status: 'Disetujui Waka Kur',
          score: 96,
          notes: 'Pemetaan capaian pembelajaran semester ganjil lengkap.',
          uploaded_at: '2026-07-16'
        },
        {
          id: 'GDOC-' + currentTeacherId + '-3',
          teacher_id: currentTeacherId,
          title: 'Program Tahunan & Semester (Prota & Promes) 2026/2027',
          category: 'Program Tahunan / Semester',
          school_year: '2026/2027',
          file_name: 'Prota_Promes_2026_2027.xlsx',
          file_size: '850 KB',
          status: 'Disetujui Waka Kur',
          score: 97,
          notes: 'Alokasi pekan efektif dan jam tatap muka sesuai kalender akademik.',
          uploaded_at: '2026-07-18'
        },
        {
          id: 'GDOC-' + currentTeacherId + '-4',
          teacher_id: currentTeacherId,
          title: 'Kisi-kisi & Rubrik Instrumen Asesmen ' + displayDept,
          category: 'Instrumen Asesmen',
          school_year: '2026/2027',
          file_name: 'Instrumen_Asesmen_2026.pdf',
          file_size: '1.3 MB',
          status: 'Disetujui Waka Kur',
          score: 95,
          notes: 'Instrumen asesmen formatif & sumatif terstandar industri.',
          uploaded_at: '2026-07-20'
        }
      ];
      defaultDocs.forEach(function (doc) {
        StorageManager.add('guru_documents', doc);
      });
      teacherDocs = defaultDocs;
    }

    let allGuruJournals = StorageManager.get('guru_journals') || [];
    let teacherJournals = allGuruJournals.filter(function (j) {
      return String(j.teacher_id) === String(currentTeacherId);
    });

    if (teacherJournals.length === 0) {
      const classInfo = getClassesForTeacher(currentTeacherId, false);
      const defaultClassName = (classInfo.teacherClasses[0] && classInfo.teacherClasses[0].className) || 'XI A-' + (displayDept || 'TJKT');
      const sampleJournals = [
        {
          id: 'JRN-' + currentTeacherId + '-1',
          teacher_id: currentTeacherId,
          teacher_name: displayName,
          class_name: defaultClassName,
          subject_name: displaySubject,
          date: '2026-09-22',
          time: 'Jam 1-4 (07:15 - 10:15 WITA)',
          topic: 'Pendalaman Materi & Praktik Mandiri: ' + displaySubject,
          methods: ['Project Based Learning (PjBL)', 'Praktikum Lab Bengkel'],
          notes: 'Seluruh siswa aktif mengikuti praktikum dan menyelesaikan modul dengan baik.',
          hadir_count: 35,
          total_students: 36,
          photo: 'assets/teacher_avatar.jpg',
          status: 'Terverifikasi Waka Kur',
          created_at: '2026-09-22 10:20'
        },
        {
          id: 'JRN-' + currentTeacherId + '-2',
          teacher_id: currentTeacherId,
          teacher_name: displayName,
          class_name: defaultClassName,
          subject_name: displaySubject,
          date: '2026-09-25',
          time: 'Jam 5-8 (10:30 - 13:30 WITA)',
          topic: 'Asesmen Formatif & Diskusi Reflektif Capaian Pembelajaran',
          methods: ['Problem Based Learning', 'Diskusi Reflektif'],
          notes: 'Asesmen formatif terlaksana tertib, pemahaman materi siswa mencapai rata-rata 88.5.',
          hadir_count: 36,
          total_students: 36,
          photo: '',
          status: 'Terverifikasi Waka Kur',
          created_at: '2026-09-25 13:40'
        }
      ];
      sampleJournals.forEach(function (jrn) {
        StorageManager.add('guru_journals', jrn);
      });
      teacherJournals = sampleJournals;
    }

    // 4. Update KPI Cards Guru yang sedang login
    const schedules = StorageManager.get('schedules') || [];
    const teacherSchedules = schedules.filter(function (s) {
      return String(s.teacher_id) === String(currentTeacherId) || (s.teacher_name && cleanStr(s.teacher_name) === cleanStr(displayName));
    });
    let totalJp = 0;
    teacherSchedules.forEach(function (s) {
      totalJp += Number(s.duration) || 2;
    });
    if (totalJp === 0) totalJp = 24;

    const elJp = document.getElementById('kpi-guru-jp');
    if (elJp) elJp.textContent = totalJp + ' / 24 JP';

    const elJurnalCount = document.getElementById('kpi-guru-jurnal-count');
    if (elJurnalCount) elJurnalCount.textContent = teacherJournals.length + ' Sesi';

    const elDocCount = document.getElementById('kpi-guru-doc-count');
    if (elDocCount) elDocCount.textContent = teacherDocs.length + ' / 4 Berkas';

    // 5. Populate Class Options in Jurnal & Presensi Forms (Filtered by Teacher)
    populateTeacherClassSelects(currentTeacherId);

    // Set default date in forms if empty
    const todayStr = new Date().toISOString().split('T')[0];
    const dateJurnal = document.getElementById('input-guru-jurnal-date');
    if (dateJurnal && !dateJurnal.value) dateJurnal.value = todayStr;
    const datePresensi = document.getElementById('input-presensi-date');
    if (datePresensi && !datePresensi.value) datePresensi.value = todayStr;

    // Set mapel di formulir jurnal otomatis ke mapel guru ini
    populateTeacherSubjectSelect(currentTeacherId, teacher, session, State.presensiClass);

    // 6. Update Hub Card Badges
    const hubBadgeJurnal = document.getElementById('hub-badge-jurnal');
    if (hubBadgeJurnal) {
      hubBadgeJurnal.textContent = '📝 ' + teacherJournals.length + ' Sesi Terisi';
    }

    const hubBadgeDokumen = document.getElementById('hub-badge-dokumen');
    if (hubBadgeDokumen) {
      hubBadgeDokumen.textContent = '📁 ' + teacherDocs.length + '/4 Berkas Lengkap';
    }

    const hubBadgePresensi = document.getElementById('hub-badge-presensi');
    if (hubBadgePresensi) {
      const presensiList = StorageManager.get('presensi_records') || [];
      const teacherPresensi = presensiList.filter(function (p) {
        return String(p.teacher_id) === String(currentTeacherId);
      });
      if (teacherPresensi.length > 0) {
        hubBadgePresensi.textContent = '👥 ' + teacherPresensi.length + ' Sesi Terekam';
      } else {
        hubBadgePresensi.textContent = '👥 Siap Input Presensi';
      }
    }

    const hubBadgeSupervisi = document.getElementById('hub-badge-supervisi');
    if (hubBadgeSupervisi) {
      const allSupervisi = StorageManager.get('supervisi_evaluations') || [];
      const mySupervisi = allSupervisi.filter(function (s) {
        return String(s.guru_id) === String(currentTeacherId);
      });
      if (mySupervisi.length > 0 && mySupervisi[0].score) {
        hubBadgeSupervisi.textContent = '⭐ Nilai: ' + mySupervisi[0].score + ' (' + (mySupervisi[0].grade || 'Baik') + ')';
      } else {
        hubBadgeSupervisi.textContent = '⭐ Terjadwal / Siap';
      }
    }

    // Toggle Hub View vs Detail View
    const hubView = document.getElementById('guru-hub-view');
    const detailView = document.getElementById('guru-detail-view');
    const kpiGrid = document.querySelector('.portal-guru-kpi-grid');
    const detailTitle = document.getElementById('guru-detail-header-title');

    const activeTab = State.activeGuruTab || 'jurnal';

    if (State.isGuruDetailOpen) {
      if (hubView) hubView.style.display = 'none';
      if (kpiGrid) kpiGrid.style.display = 'none';
      if (detailView) detailView.style.display = 'block';

      if (detailTitle) {
        const titles = {
          'jurnal': '📝 Jurnal Mengajar Harian & Riwayat Tatap Muka',
          'presensi': '👥 Presensi Kehadiran Siswa per Sesi KBM',
          'dokumen': '📁 Perangkat Ajar & Berkas Kurikulum',
          'supervisi': '🔍 Hasil Supervisi Klinis & RTL Pembinaan'
        };
        detailTitle.textContent = titles[activeTab] || 'Layanan Guru';
      }
    } else {
      if (hubView) hubView.style.display = 'block';
      if (kpiGrid) kpiGrid.style.display = 'grid';
      if (detailView) detailView.style.display = 'none';
    }

    // 7. Render Active Subtab
    document.querySelectorAll('.guru-subtab-btn').forEach(function (btn) {
      if (btn.getAttribute('data-guru-tab') === activeTab) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    const paneJurnal = document.getElementById('guru-pane-jurnal');
    const panePresensi = document.getElementById('guru-pane-presensi');
    const paneDokumen = document.getElementById('guru-pane-dokumen');
    const paneSupervisi = document.getElementById('guru-pane-supervisi');

    if (activeTab === 'jurnal') {
      if (paneJurnal) paneJurnal.style.display = 'block';
      if (panePresensi) panePresensi.style.display = 'none';
      if (paneDokumen) paneDokumen.style.display = 'none';
      if (paneSupervisi) paneSupervisi.style.display = 'none';
      renderGuruJournalHistory();
    } else if (activeTab === 'presensi') {
      if (paneJurnal) paneJurnal.style.display = 'none';
      if (panePresensi) panePresensi.style.display = 'block';
      if (paneDokumen) paneDokumen.style.display = 'none';
      if (paneSupervisi) paneSupervisi.style.display = 'none';
      loadPresensiStudents();
    } else if (activeTab === 'dokumen') {
      if (paneJurnal) paneJurnal.style.display = 'none';
      if (panePresensi) panePresensi.style.display = 'none';
      if (paneDokumen) paneDokumen.style.display = 'block';
      if (paneSupervisi) paneSupervisi.style.display = 'none';
      renderGuruDocuments();
    } else if (activeTab === 'supervisi') {
      if (paneJurnal) paneJurnal.style.display = 'none';
      if (panePresensi) panePresensi.style.display = 'none';
      if (paneDokumen) paneDokumen.style.display = 'none';
      if (paneSupervisi) paneSupervisi.style.display = 'block';
      renderGuruSupervisiPane(currentTeacherId, teacher, session);
    }
    updateDriveUIElements();
  }

  function getClassesForTeacher(teacherId, showAll) {
    const allMasterClasses = StorageManager.get('classes') || [];
    const teacherMap = (window.SIMKUR_DATA && window.SIMKUR_DATA.teacherRombelMap) || {};
    const assigned = teacherMap[teacherId] || [];

    // Also collect any dynamic schedules from StorageManager
    const dynamicSchedules = StorageManager.get('schedules') || [];
    const extraClasses = [];
    dynamicSchedules.forEach(function (s) {
      if (String(s.teacher_id) === String(teacherId) && s.class_name) {
        if (!assigned.some(function (a) { return a.className === s.class_name; }) && !extraClasses.includes(s.class_name)) {
          extraClasses.push(s.class_name);
        }
      }
    });

    const teacherClasses = [].concat(assigned);
    extraClasses.forEach(function (c) {
      teacherClasses.push({ className: c, role: 'Jadwal Mengajar' });
    });

    // If teacher has no assigned classes, fallback to matching department
    if (teacherClasses.length === 0) {
      const teacher = (StorageManager.get('teachers') || []).find(function (t) {
        return String(t.id) === String(teacherId);
      });
      if (teacher && teacher.department && teacher.department !== 'Umum' && teacher.department !== 'Normatif Adaptif') {
        allMasterClasses.forEach(function (c) {
          if (c.major === teacher.department || c.name.endsWith('-' + teacher.department)) {
            if (teacherClasses.length < 4) {
              teacherClasses.push({ className: c.name, role: 'Rombel ' + teacher.department });
            }
          }
        });
      }
    }

    if (teacherClasses.length === 0) {
      allMasterClasses.slice(0, 3).forEach(function (c) {
        teacherClasses.push({ className: c.name, role: 'Rombel Binaan' });
      });
    }

    return {
      teacherClasses: teacherClasses,
      allMasterClasses: allMasterClasses
    };
  }

  function populateTeacherClassSelects(currentTeacherId) {
    const classSelectJurnal = document.getElementById('input-guru-jurnal-class');
    const classSelectPresensi = document.getElementById('select-presensi-class');
    const showAll = State.showAllClassesForGuru || false;

    const data = getClassesForTeacher(currentTeacherId, showAll);
    const assigned = data.teacherClasses;
    const all = data.allMasterClasses;

    // Check if current State.presensiClass is valid for this teacher
    const assignedNames = assigned.map(function (a) { return a.className; });
    if (!assignedNames.includes(State.presensiClass)) {
      State.presensiClass = assignedNames[0] || 'XI A-AKL';
    }

    // Build options HTML
    let optionsHtml = '';
    optionsHtml += '<optgroup label="⭐ Rombel Guru Pengampu (' + assigned.length + ' Kelas)">';
    assigned.forEach(function (item) {
      const isSelected = item.className === State.presensiClass;
      optionsHtml += '<option value="' + item.className + '"' + (isSelected ? ' selected' : '') + '>' +
        item.className + ' (' + item.role + ')' +
      '</option>';
    });
    optionsHtml += '</optgroup>';

    if (showAll) {
      const otherClasses = all.filter(function (c) {
        return !assignedNames.includes(c.name);
      });
      if (otherClasses.length > 0) {
        optionsHtml += '<optgroup label="── Rombel Lainnya di Sekolah (' + otherClasses.length + ' Kelas) ──">';
        otherClasses.forEach(function (c) {
          const major = c.major || c.department || '';
          const isSelected = c.name === State.presensiClass;
          optionsHtml += '<option value="' + c.name + '"' + (isSelected ? ' selected' : '') + '>' +
            c.name + (major ? ' (' + major + ')' : '') +
          '</option>';
        });
        optionsHtml += '</optgroup>';
      }
    }

    if (classSelectJurnal) {
      classSelectJurnal.innerHTML = optionsHtml;
      classSelectJurnal.value = State.presensiClass;
    }

    if (classSelectPresensi) {
      classSelectPresensi.innerHTML = optionsHtml;
      classSelectPresensi.value = State.presensiClass;
    }

    // Sync checkbox states
    const c1 = document.getElementById('check-show-all-jurnal-classes');
    const c2 = document.getElementById('check-show-all-presensi-classes');
    if (c1) c1.checked = showAll;
    if (c2) c2.checked = showAll;

    updateJurnalAttendanceSummary(State.presensiClass);
  }

  function parseTeacherSubjects(subjStr) {
    if (!subjStr) return [];
    var str = String(subjStr);
    str = str.replace(/Pendidikan Jasmani,\s*Olahraga dan Kesehatan/gi, 'Pendidikan Jasmani Olahraga dan Kesehatan');
    str = str.replace(/Praktikum Ak\.\s*Pers Jasa,\s*Dagang/gi, 'Praktikum Ak. Pers Jasa Dagang');
    str = str.replace(/Praktik Ak\.\s*Pers Jasa,\s*Dagang/gi, 'Praktik Ak. Pers Jasa Dagang');
    str = str.replace(/Prak Ak\s*Pers Jasa,\s*Dagang/gi, 'Prak Ak Pers Jasa Dagang');

    var results = [];
    var current = '';
    var inParen = 0;
    for (var i = 0; i < str.length; i++) {
      var ch = str[i];
      if (ch === '(') inParen++;
      else if (ch === ')') inParen = Math.max(0, inParen - 1);

      if ((ch === ',' || ch === ';') && inParen === 0) {
        if (current.trim()) results.push(current.trim());
        current = '';
      } else {
        current += ch;
      }
    }
    if (current.trim()) results.push(current.trim());

    return results.map(function (s) {
      return s.replace('Pendidikan Jasmani Olahraga dan Kesehatan', 'Pendidikan Jasmani, Olahraga dan Kesehatan')
              .replace('Praktikum Ak. Pers Jasa Dagang', 'Praktikum Ak. Pers Jasa, Dagang')
              .replace('Praktik Ak. Pers Jasa Dagang', 'Praktik Ak. Pers Jasa, Dagang')
              .replace('Prak Ak Pers Jasa Dagang', 'Prak Ak Pers Jasa, Dagang');
    });
  }

  function populateTeacherSubjectSelect(teacherId, teacher, session, targetClassName) {
    var subjectSelect = document.getElementById('input-guru-jurnal-subject');
    if (!subjectSelect) return;

    var previousVal = subjectSelect.value;

    // 1. Kumpulkan daftar mapel resmi yang diampu guru ini (SK PTM & Jadwal)
    var assignedSet = [];
    function addSubject(s) {
      if (!s) return;
      var clean = s.trim();
      if (clean && assignedSet.indexOf(clean) === -1) {
        assignedSet.push(clean);
      }
    }

    if (session && session.subject) {
      parseTeacherSubjects(session.subject).forEach(addSubject);
    }
    if (teacher && teacher.subject) {
      parseTeacherSubjects(teacher.subject).forEach(addSubject);
    }

    var schedules = StorageManager.get('schedules') || [];
    var teacherSchedules = schedules.filter(function (s) {
      return String(s.teacher_id) === String(teacherId) ||
        (s.teacher_name && teacher && teacher.name && s.teacher_name.toLowerCase().includes(teacher.name.toLowerCase().split(' ')[0]));
    });

    teacherSchedules.forEach(function (s) {
      if (s.subject_name) addSubject(s.subject_name);
    });

    // Fallback jika tidak ada data mapel
    if (assignedSet.length === 0) {
      var dept = (session && session.department) || (teacher && teacher.department) || 'Produktif';
      addSubject('Konsentrasi Keahlian ' + dept);
    }

    // 2. Ambil master mapel sekolah untuk pilihan alternatif
    var allMasterSubjects = StorageManager.get('subjects') || [];
    var otherSubjects = allMasterSubjects.filter(function (s) {
      return !assignedSet.some(function (a) {
        return a.toLowerCase() === s.name.toLowerCase();
      });
    });

    // 3. Tentukan mapel terpilih (Smart auto-select berdasarkan jadwal rombel)
    var currentClass = targetClassName || State.presensiClass || (document.getElementById('input-guru-jurnal-class') ? document.getElementById('input-guru-jurnal-class').value : '');
    var scheduledSubjectForClass = '';
    if (currentClass && teacherSchedules.length > 0) {
      var matchSched = teacherSchedules.find(function (s) {
        return s.class_name === currentClass;
      });
      if (matchSched && matchSched.subject_name) {
        scheduledSubjectForClass = matchSched.subject_name;
      }
    }

    var selectedSubject = '';
    if (scheduledSubjectForClass) {
      var foundExact = assignedSet.find(function (a) {
        return a.toLowerCase() === scheduledSubjectForClass.toLowerCase();
      });
      if (foundExact) {
        selectedSubject = foundExact;
      } else {
        var foundPartial = assignedSet.find(function (a) {
          var aL = a.toLowerCase();
          var sL = scheduledSubjectForClass.toLowerCase();
          return aL.includes(sL) || sL.includes(aL);
        });
        selectedSubject = foundPartial || scheduledSubjectForClass;
      }
    } else if (previousVal && (assignedSet.indexOf(previousVal) !== -1 || otherSubjects.some(function (o) { return o.name === previousVal; }))) {
      selectedSubject = previousVal;
    } else {
      selectedSubject = assignedSet[0] || '';
    }

    // 4. Update badge sumber data
    var badgeSource = document.getElementById('badge-mapel-source');
    if (badgeSource) {
      if (scheduledSubjectForClass) {
        badgeSource.textContent = '✓ Terjadwal di ' + currentClass;
        badgeSource.style.background = '#EDE8F5';
        badgeSource.style.color = '#4B22B8';
        badgeSource.style.borderColor = '#DDD6FE';
      } else {
        badgeSource.textContent = '✓ ' + assignedSet.length + ' Mapel Diampu';
        badgeSource.style.background = '#E0F2FE';
        badgeSource.style.color = '#0284C7';
        badgeSource.style.borderColor = '#BAE6FD';
      }
    }

    // 5. Render options dengan group
    var html = '';
    html += '<optgroup label="⭐ Mapel Diampu Guru (SK PTM 2026 & Jadwal)">';
    assignedSet.forEach(function (subj) {
      var isSel = (subj === selectedSubject);
      html += '<option value="' + subj.replace(/"/g, '&quot;') + '"' + (isSel ? ' selected' : '') + '>' +
        '✓ ' + subj +
      '</option>';
    });
    html += '</optgroup>';

    if (otherSubjects.length > 0) {
      html += '<optgroup label="── 📚 Mapel Lainnya di Sekolah ──">';
      otherSubjects.forEach(function (subj) {
        var isSel = (subj.name === selectedSubject);
        html += '<option value="' + subj.name.replace(/"/g, '&quot;') + '"' + (isSel ? ' selected' : '') + '>' +
          subj.name + (subj.category ? ' (' + subj.category + ')' : '') +
        '</option>';
      });
      html += '</optgroup>';
    }

    subjectSelect.innerHTML = html;
    if (selectedSubject) {
      subjectSelect.value = selectedSubject;
    }
  }

  function updateJurnalAttendanceSummary(className) {
    const roster = window.SIMKUR_DATA && window.SIMKUR_DATA.studentRoster;
    const students = (roster && roster[className]) || [];
    const total = students.length || 36;
    const defaultHadir = Math.max(0, total - 2);

    const hadirInput = document.getElementById('input-guru-jurnal-hadir-count');
    const totalSpan = document.getElementById('jurnal-hadir-total-label');

    if (hadirInput) {
      hadirInput.max = total;
      hadirInput.value = defaultHadir;
    }
    if (totalSpan) totalSpan.textContent = '/ ' + total + ' Siswa Hadir';

    syncJurnalAttendanceBadge();
  }

  function stepHadirCount(delta) {
    const hadirInput = document.getElementById('input-guru-jurnal-hadir-count');
    if (!hadirInput) return;
    const max = parseInt(hadirInput.max, 10) || 36;
    let current = parseInt(hadirInput.value, 10) || 0;
    current = Math.min(max, Math.max(0, current + delta));
    hadirInput.value = current;
    syncJurnalAttendanceBadge();
  }

  function syncJurnalAttendanceBadge() {
    const hadirInput = document.getElementById('input-guru-jurnal-hadir-count');
    const badge = document.getElementById('jurnal-attendance-badge');
    if (!hadirInput || !badge) return;

    const max = parseInt(hadirInput.max, 10) || 36;
    const hadir = Math.min(max, Math.max(0, parseInt(hadirInput.value, 10) || 0));
    const tidakHadir = max - hadir;
    const pct = max > 0 ? ((hadir / max) * 100).toFixed(1) : '100';

    badge.innerHTML = hadir + ' Hadir' + (tidakHadir > 0 ? ', ' + tidakHadir + ' Sakit/Izin' : '') + ' dari ' + max + ' Siswa (' + pct + '%)';
  }

  function insertQuickText(targetId, text) {
    const el = document.getElementById(targetId);
    if (!el) return;
    if (el.value.trim() === '') {
      el.value = text + ' ';
    } else {
      el.value = el.value.trim() + ' • ' + text + ' ';
    }
    el.focus();
  }

  function toggleShowAllClasses(checked) {
    State.showAllClassesForGuru = !!checked;
    populateTeacherClassSelects(State.currentGuruId);
    showToast(checked ? 'Menampilkan seluruh 45 kelas sekolah.' : 'Hanya menampilkan rombel binaan & mengajar guru.', 'info');
  }

  function handleJurnalClassChange(className) {
    State.presensiClass = className;
    const selectPresensi = document.getElementById('select-presensi-class');
    if (selectPresensi) selectPresensi.value = className;
    updateJurnalAttendanceSummary(className);

    // Auto-update Mata Pelajaran yang Diampu sesuai kelas/jadwal yang dipilih
    const teachers = StorageManager.get('teachers');
    const teacher = teachers.find(function (t) {
      return String(t.id) === String(State.currentGuruId);
    });
    let session = null;
    try {
      const raw = localStorage.getItem('simkur_session');
      if (raw) session = JSON.parse(raw);
    } catch (e) {}
    populateTeacherSubjectSelect(State.currentGuruId, teacher, session, className);

    if (State.activeGuruTab === 'presensi') {
      loadPresensiStudents();
    }
  }

  function openGuruSection(sectionName) {
    State.activeGuruTab = sectionName || 'jurnal';
    State.isGuruDetailOpen = true;
    renderPortalGuru();
    const detailView = document.getElementById('guru-detail-view');
    if (detailView) {
      detailView.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  function closeGuruSection() {
    State.isGuruDetailOpen = false;
    renderPortalGuru();
    const hubView = document.getElementById('guru-hub-view');
    if (hubView) {
      hubView.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  function switchGuruTab(tabName) {
    State.activeGuruTab = tabName;
    State.isGuruDetailOpen = true;
    renderPortalGuru();
  }

  function changeActiveGuru(teacherId) {
    // Dinonaktifkan demi privasi guru: setiap guru hanya dapat mengelola data KBM miliknya sendiri
    console.warn('Peralihan akun guru dinonaktifkan: masing-masing guru tidak diizinkan beralih ke akun guru lain.');
  }

  function toggleMethodTag(btn) {
    btn.classList.toggle('active');
  }

  function renderGuruJournalHistory() {
    const listEl = document.getElementById('guru-journal-history-list');
    if (!listEl) return;

    const allJournals = StorageManager.get('guru_journals');
    const teacherJournals = allJournals.filter(function (j) {
      return String(j.teacher_id) === String(State.currentGuruId);
    });

    if (teacherJournals.length === 0) {
      listEl.innerHTML = '<div class="journal-empty-state">' +
        '<div style="font-size: 2rem; margin-bottom: 6px;">📝</div>' +
        '<strong style="color: #1E293B; font-size: 0.95rem;">Belum Ada Riwayat Jurnal</strong>' +
        '<p style="color: #64748B; font-size: 0.8125rem; margin: 4px 0 0 0;">Isi formulir jurnal di atas untuk mencatat pelaksanaan tatap muka KBM Anda.</p>' +
        '</div>';
      return;
    }

    let html = '';
    teacherJournals.forEach(function (j) {
      const methodsHtml = (j.methods || []).map(function (m) {
        return '<span class="journal-method-tag">' + escapeHtml(m) + '</span>';
      }).join(' ');

      // Format tanggal menjadi format Indonesia yang ramah (misal: 22 Sep 2026)
      let displayDate = j.date || 'Hari Ini';
      try {
        if (displayDate.includes('-')) {
          const parts = displayDate.split('-');
          if (parts.length === 3) {
            const months = ['', 'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
            displayDate = parseInt(parts[2], 10) + ' ' + (months[parseInt(parts[1], 10)] || parts[1]) + ' ' + parts[0];
          }
        }
      } catch (e) {}

      html += '<div class="guru-journal-card">' +
        '<!-- Header Bar: Tanggal, Waktu, & Status Verifikasi -->' +
        '<div class="journal-card-top-bar">' +
          '<div class="journal-date-time-group">' +
            '<span class="journal-date-badge">' +
              '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>' +
              escapeHtml(displayDate) +
            '</span>' +
            '<span class="journal-time-pill">' +
              '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>' +
              escapeHtml(j.time || 'Jam 1-4') +
            '</span>' +
          '</div>' +
          '<span class="journal-status-badge">' +
            '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>' +
            escapeHtml(j.status || 'Terverifikasi Waka Kur') +
          '</span>' +
        '</div>' +

        '<!-- Identitas: Kelas & Mata Pelajaran -->' +
        '<div class="journal-target-row">' +
          '<span class="journal-class-badge">' + escapeHtml(j.class_name) + '</span>' +
          (j.subject_name ? '<span class="journal-subject-badge">' + escapeHtml(j.subject_name) + '</span>' : '') +
        '</div>' +

        '<!-- Materi & Capaian Pembelajaran -->' +
        '<div class="journal-topic-box">' +
          '<div class="journal-topic-label">Materi / Capaian Pembelajaran (CP):</div>' +
          '<div class="journal-topic-text">' + escapeHtml(j.topic) + '</div>' +
        '</div>' +

        '<!-- Catatan Perkembangan Siswa (Jika Ada) -->' +
        (j.notes ? '<div class="journal-notes-box">' +
          '<span class="journal-notes-icon">💬</span>' +
          '<div class="journal-notes-content"><strong>Catatan Guru:</strong> ' + escapeHtml(j.notes) + '</div>' +
        '</div>' : '') +

        '<!-- Footer: Metode Pembelajaran & Presensi -->' +
        '<div class="journal-card-footer">' +
          '<div class="journal-methods-wrap">' +
            methodsHtml +
          '</div>' +
          '<div class="journal-footer-stats">' +
            '<span class="journal-stat-pill">👥 Presensi: <strong>' + (j.hadir_count || 34) + ' / ' + (j.total_students || 36) + ' Hadir</strong></span>' +
            (j.photo ? '<span class="journal-photo-pill">📸 Foto KBM Ada</span>' : '') +
          '</div>' +
        '</div>' +
      '</div>';
    });

    listEl.innerHTML = html;
  }

  function handleSaveGuruJournal(e) {
    e.preventDefault();
    const className = document.getElementById('input-guru-jurnal-class').value;
    const subjectName = document.getElementById('input-guru-jurnal-subject').value.trim();
    if (!subjectName) {
      showToast('Silakan pilih mata pelajaran yang diampu terlebih dahulu.', 'error');
      return;
    }
    const date = document.getElementById('input-guru-jurnal-date').value;
    const time = document.getElementById('input-guru-jurnal-time').value;
    const topic = document.getElementById('input-guru-jurnal-topic').value.trim();
    const notes = document.getElementById('input-guru-jurnal-notes').value.trim();
    const hadirCount = parseInt(document.getElementById('input-guru-jurnal-hadir-count').value, 10) || 34;

    // Get active methods
    const activeMethods = [];
    document.querySelectorAll('#guru-methods-group .method-tag-btn.active').forEach(function (btn) {
      activeMethods.push(btn.textContent.trim());
    });
    if (activeMethods.length === 0) {
      activeMethods.push('Praktikum Lab Bengkel');
    }

    const teachers = StorageManager.get('teachers');
    const teacher = teachers.find(function (t) {
      return String(t.id) === String(State.currentGuruId);
    }) || { name: 'Ahmad Gajali' };

    let session = null;
    try {
      const raw = localStorage.getItem('simkur_session');
      if (raw) session = JSON.parse(raw);
    } catch (err) { /* ignore */ }

    const teacherName = (session && session.name) ? session.name : teacher.name;

    const newJournal = {
      id: 'JRN-' + Date.now(),
      teacher_id: State.currentGuruId,
      teacher_name: teacherName,
      class_name: className,
      subject_name: subjectName,
      date: date || new Date().toISOString().split('T')[0],
      time: time,
      topic: topic,
      methods: activeMethods,
      notes: notes,
      hadir_count: hadirCount,
      total_students: 36,
      photo: State.tempJournalPhoto || '',
      status: 'Terverifikasi Waka Kur',
      created_at: new Date().toISOString().replace('T', ' ').substring(0, 16)
    };

    StorageManager.add('guru_journals', newJournal);

    // Sync with Waka Kur Monitoring (portal_teacher_admin_v1)
    const adminList = StorageManager.get('teacher_admin');
    const adminTeacher = adminList.find(function (a) {
      return String(a.teacher_id) === String(State.currentGuruId);
    });
    if (adminTeacher) {
      const newCount = (parseInt(adminTeacher.jurnal_count, 10) || 0) + 1;
      StorageManager.update('teacher_admin', State.currentGuruId, {
        jurnal_status: 'Sudah',
        jurnal_count: newCount,
        updated_at: new Date().toISOString().split('T')[0]
      });
    }

    // Reset input fields
    document.getElementById('input-guru-jurnal-topic').value = '';
    document.getElementById('input-guru-jurnal-notes').value = '';
    removeJournalPhoto();

    showToast('✓ Jurnal Mengajar berhasil disimpan dan tersinkron ke Waka Kurikulum!');
    renderGuruJournalHistory();
    renderPortalGuru();
    renderDocuments(); // Update Waka Kur Monitoring automatically!
  }

  // Client-Side Image Compressor (Optimized for 90 Teachers Daily Journals)
  function compressImage(file, maxWidth, maxHeight, quality, callback) {
    maxWidth = maxWidth || 1024;
    maxHeight = maxHeight || 1024;
    quality = quality || 0.72;

    const reader = new FileReader();
    reader.onload = function (e) {
      const img = new Image();
      img.onload = function () {
        let width = img.width;
        let height = img.height;

        // Maintain aspect ratio within bounding box
        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';
          ctx.drawImage(img, 0, 0, width, height);

          const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
          const head = 'data:image/jpeg;base64,';
          const sizeInBytes = Math.round(((compressedDataUrl.length - head.length) * 3) / 4);
          const sizeInKb = (sizeInBytes / 1024).toFixed(1);
          callback(compressedDataUrl, sizeInKb);
        } else {
          callback(e.target.result, (file.size / 1024).toFixed(1));
        }
      };
      img.onerror = function () {
        callback(e.target.result, (file.size / 1024).toFixed(1));
      };
      img.src = e.target.result;
    };
    reader.onerror = function () {
      showToast('Gagal membaca berkas gambar kamera.', 'danger');
    };
    reader.readAsDataURL(file);
  }

  function handleJournalPhotoUpload(event) {
    const file = event.target.files && event.target.files[0];
    if (!file) return;

    const originalSizeMb = (file.size / (1024 * 1024)).toFixed(1);
    showToast('⚡ Mengompres foto KBM secara otomatis...', 'info');

    compressImage(file, 1024, 1024, 0.72, function (compressedDataUrl, compressedKb) {
      State.tempJournalPhoto = compressedDataUrl;
      const previewBox = document.getElementById('jurnal-photo-preview-box');
      const previewImg = document.getElementById('jurnal-preview-img');
      const filenameEl = document.getElementById('jurnal-photo-filename');
      const detailsEl = document.getElementById('jurnal-photo-details');

      if (previewImg) previewImg.src = compressedDataUrl;
      if (filenameEl) filenameEl.textContent = file.name;
      if (detailsEl) {
        detailsEl.innerHTML = '<span style="color: #059669; font-weight: 700;">⚡ Terkompresi Otomatis: ' + compressedKb + ' KB</span>' +
          ' <span style="color: #94A3B8;">(Asli: ' + originalSizeMb + ' MB)</span> • ' +
          new Date().toLocaleTimeString('id-ID');
      }
      if (previewBox) previewBox.style.display = 'block';
      showToast('✓ Foto berhasil dikompresi menjadi ' + compressedKb + ' KB (Hemat ~95%)!', 'success');
    });
  }

  function removeJournalPhoto() {
    State.tempJournalPhoto = null;
    const previewBox = document.getElementById('jurnal-photo-preview-box');
    const cameraInput = document.getElementById('jurnal-camera-input');
    const galleryInput = document.getElementById('jurnal-gallery-input');
    if (previewBox) previewBox.style.display = 'none';
    if (cameraInput) cameraInput.value = '';
    if (galleryInput) galleryInput.value = '';
  }

  function loadPresensiStudents() {
    const classSelect = document.getElementById('select-presensi-class');
    const className = classSelect ? classSelect.value : (State.presensiClass || 'XI A-AKL');
    State.presensiClass = className;

    // Sync Jurnal class select value
    const jurnalSelect = document.getElementById('input-guru-jurnal-class');
    if (jurnalSelect && jurnalSelect.value !== className) {
      jurnalSelect.value = className;
    }

    const roster = window.SIMKUR_DATA && window.SIMKUR_DATA.studentRoster;
    let students = (roster && roster[className]) || [];

    // Fallback if class not in roster
    if (students.length === 0) {
      students = [];
      for (let i = 1; i <= 36; i++) {
        students.push({
          no: i,
          nisn: '010' + (1000000 + i),
          name: 'Siswa ' + i + ' (' + className + ')',
          gender: i % 2 === 0 ? 'P' : 'L',
          status: i === 3 ? 'S' : (i === 12 ? 'S' : 'H'),
          notes: i === 3 ? 'Demam' : ''
        });
      }
    }

    // Update Set Semua Hadir button text
    const btnSetAll = document.getElementById('btn-set-all-presensi');
    if (btnSetAll) {
      btnSetAll.textContent = '✓ Set Semua Hadir (' + students.length + ')';
    }

    // Update Jurnal attendance summary badge
    updateJurnalAttendanceSummary(className);

    State.presensiStudents = students.map(function (s, idx) {
      return {
        no: s.no || (idx + 1),
        nisn: s.nisn || ('010' + (idx + 100)),
        name: s.name,
        gender: s.gender || 'L',
        status: s.status || 'H',
        notes: s.notes || ''
      };
    });

    renderPresensiTable();
  }

  function renderPresensiTable() {
    const tbody = document.getElementById('table-guru-presensi-tbody');
    if (!tbody) return;

    let hadir = 0, sakit = 0, izin = 0, alpa = 0;
    let html = '';

    State.presensiStudents.forEach(function (s, idx) {
      if (s.status === 'H') hadir++;
      else if (s.status === 'S') sakit++;
      else if (s.status === 'I') izin++;
      else if (s.status === 'A') alpa++;

      html += '<tr class="presensi-student-row">' +
        '<td class="col-att-no" style="text-align: center; color: #777777;"><span class="att-no-badge">' + s.no + '</span></td>' +
        '<td class="col-att-nisn" style="font-family: monospace; font-size: 0.8125rem;">' + s.nisn + '</td>' +
        '<td class="col-att-name" style="font-weight: 600; color: #262626;"><span class="att-student-name">' + s.name + '</span></td>' +
        '<td class="col-att-gender" style="text-align: center;"><span class="badge badge-neutral att-gender-badge">' + s.gender + '</span></td>' +
        '<td class="col-att-status" style="text-align: center;">' +
          '<div class="col-att-status-group">' +
            '<button type="button" class="attendance-status-btn ' + (s.status === 'H' ? 'active-H' : '') + '" onclick="window.PORTAL_APP.setPresensiStatus(' + idx + ', \'H\')" title="Hadir"><span class="btn-att-lbl">H</span><span class="btn-att-sub">Hadir</span></button>' +
            '<button type="button" class="attendance-status-btn ' + (s.status === 'S' ? 'active-S' : '') + '" onclick="window.PORTAL_APP.setPresensiStatus(' + idx + ', \'S\')" title="Sakit"><span class="btn-att-lbl">S</span><span class="btn-att-sub">Sakit</span></button>' +
            '<button type="button" class="attendance-status-btn ' + (s.status === 'I' ? 'active-I' : '') + '" onclick="window.PORTAL_APP.setPresensiStatus(' + idx + ', \'I\')" title="Izin"><span class="btn-att-lbl">I</span><span class="btn-att-sub">Izin</span></button>' +
            '<button type="button" class="attendance-status-btn ' + (s.status === 'A' ? 'active-A' : '') + '" onclick="window.PORTAL_APP.setPresensiStatus(' + idx + ', \'A\')" title="Alpa"><span class="btn-att-lbl">A</span><span class="btn-att-sub">Alpa</span></button>' +
          '</div>' +
        '</td>' +
        '<td class="col-att-notes">' +
          '<input type="text" class="form-input att-note-input" style="padding: 0.25rem 0.5rem; font-size: 0.8125rem;" value="' + (s.notes || '') + '" placeholder="Catatan/keterangan siswa..." onchange="window.PORTAL_APP.updatePresensiNote(' + idx + ', this.value)">' +
        '</td>' +
      '</tr>';
    });

    tbody.innerHTML = html;

    // Update summary counts
    const total = State.presensiStudents.length;
    const pct = total > 0 ? ((hadir / total) * 100).toFixed(1) : 0;

    const elH = document.getElementById('presensi-count-h');
    const elS = document.getElementById('presensi-count-s');
    const elI = document.getElementById('presensi-count-i');
    const elA = document.getElementById('presensi-count-a');
    const elPct = document.getElementById('presensi-pct');

    if (elH) elH.textContent = String(hadir);
    if (elS) elS.textContent = String(sakit);
    if (elI) elI.textContent = String(izin);
    if (elA) elA.textContent = String(alpa);
    if (elPct) elPct.textContent = pct + '%';

    const mobH = document.getElementById('mob-bar-h');
    const mobS = document.getElementById('mob-bar-s');
    const mobI = document.getElementById('mob-bar-i');
    const mobA = document.getElementById('mob-bar-a');
    if (mobH) mobH.textContent = String(hadir);
    if (mobS) mobS.textContent = String(sakit);
    if (mobI) mobI.textContent = String(izin);
    if (mobA) mobA.textContent = String(alpa);
  }

  function setPresensiStatus(idx, status) {
    if (State.presensiStudents[idx]) {
      State.presensiStudents[idx].status = status;
      renderPresensiTable();
    }
  }

  function updatePresensiNote(idx, note) {
    if (State.presensiStudents[idx]) {
      State.presensiStudents[idx].notes = note;
    }
  }

  function setAllPresensi(status) {
    State.presensiStudents.forEach(function (s) {
      s.status = status;
    });
    renderPresensiTable();
    showToast('Seluruh siswa diset: ' + (status === 'H' ? 'Hadir (100%)' : status));
  }

  function handleSavePresensi() {
    const hadir = State.presensiStudents.filter(function (s) { return s.status === 'H'; }).length;
    const sakit = State.presensiStudents.filter(function (s) { return s.status === 'S'; }).length;
    const total = State.presensiStudents.length;
    const pct = total > 0 ? ((hadir / total) * 100).toFixed(1) : 0;

    // Save session attendance
    StorageManager.add('guru_attendance', {
      id: 'ATT-' + Date.now(),
      class_name: State.presensiClass,
      teacher_id: State.currentGuruId,
      date: document.getElementById('input-presensi-date') ? document.getElementById('input-presensi-date').value : new Date().toISOString().split('T')[0],
      hadir: hadir,
      sakit: sakit,
      total: total,
      students: State.presensiStudents
    });

    // Update Jurnal Form's summary
    const badgeSummary = document.getElementById('jurnal-attendance-badge');
    const inputHadirCount = document.getElementById('input-guru-jurnal-hadir-count');
    if (badgeSummary) {
      badgeSummary.textContent = hadir + ' Hadir, ' + sakit + ' Sakit dari ' + total + ' Siswa (' + pct + '%)';
    }
    if (inputHadirCount) {
      inputHadirCount.value = hadir;
    }

    showToast('✓ Presensi sesi ' + State.presensiClass + ' berhasil disimpan & disinkronkan ke Formulir Jurnal!');
  }

  function renderGuruDocuments() {
    const tbody = document.getElementById('guru-docs-tbody');
    if (!tbody) return;

    const allDocs = StorageManager.get('guru_documents') || [];
    const teacherDocs = allDocs.filter(function (d) {
      return String(d.teacher_id) === String(State.currentGuruId);
    });

    if (teacherDocs.length === 0) {
      tbody.innerHTML =
        '<div class="guru-doc-empty">' +
          '<span style="font-size:2.5rem;">📂</span>' +
          '<p style="font-size:0.9375rem;font-weight:700;color:#374151;margin:8px 0 4px;">Belum Ada Berkas</p>' +
          '<p style="font-size:0.8125rem;color:#6B7280;margin:0;">Klik tombol <strong>+ Unggah Berkas Baru</strong><br>untuk menambahkan perangkat ajar Anda.</p>' +
        '</div>';
      return;
    }

    const categoryColors = {
      'Modul Ajar':         { bg: '#EDE8F5', color: '#4B22B8', icon: '📘' },
      'Silabus & ATP':      { bg: '#E0F2FE', color: '#0369A1', icon: '📗' },
      'Program Tahunan':    { bg: '#FEF3C7', color: '#92400E', icon: '📅' },
      'Program Semester':   { bg: '#FEF3C7', color: '#92400E', icon: '📆' },
      'Instrumen Asesmen':  { bg: '#DEF7EC', color: '#03543F', icon: '📋' },
      'default':            { bg: '#F1F5F9', color: '#334155', icon: '📁' }
    };

    let html = '';
    teacherDocs.forEach(function (d, idx) {
      var cat = categoryColors[d.category] || categoryColors['default'];
      var statusOk = (d.status || '').toLowerCase().indexOf('setuju') >= 0 || (d.status || '').toLowerCase().indexOf('verif') >= 0;
      html +=
        '<div class="guru-doc-card">' +
          '<div class="guru-doc-card-left">' +
            '<div class="guru-doc-num">' + (idx + 1) + '</div>' +
            '<div class="guru-doc-icon-wrap" style="background:' + cat.bg + ';color:' + cat.color + ';">' +
              cat.icon +
            '</div>' +
          '</div>' +
          '<div class="guru-doc-card-body">' +
            '<div class="guru-doc-title">' + d.title + '</div>' +
            '<div class="guru-doc-filename">' +
              (d.file_link ? '🌐 <a href="' + d.file_link + '" target="_blank" rel="noopener noreferrer" style="color: #4B22B8; font-weight: 700; text-decoration: underline;">Tautan Google Drive (Belajar.id)</a>' : ('📎 ' + (d.file_name || 'dokumen.pdf'))) +
              ' &nbsp;·&nbsp; ' + (d.file_size || (d.file_link ? 'Cloud Link' : '1.2 MB')) +
            '</div>' +
            '<div class="guru-doc-meta-row">' +
              '<span class="guru-doc-cat-badge" style="background:' + cat.bg + ';color:' + cat.color + ';">' + d.category + '</span>' +
              '<span class="guru-doc-status-badge ' + (statusOk ? 'status-ok' : 'status-pending') + '">' +
                (statusOk ? '✓ ' : '⏳ ') + (d.status || 'Disetujui') +
              '</span>' +
            '</div>' +
            (d.notes ? '<div class="guru-doc-notes">' + d.notes + '</div>' : '') +
          '</div>' +
          '<div class="guru-doc-card-actions">' +
            '<button class="guru-doc-btn" onclick="window.PORTAL_APP.previewTeacherDoc(\'' + d.id + '\')" title="Pratinjau">👁️</button>' +
            '<button class="guru-doc-btn" onclick="window.PORTAL_APP.downloadTeacherDocFile(\'' + d.id + '\')" title="Unduh">⬇️</button>' +
            '<button class="guru-doc-btn guru-doc-btn-danger" onclick="window.PORTAL_APP.deleteGuruDoc(\'' + d.id + '\')" title="Hapus">🗑️</button>' +
          '</div>' +
        '</div>';
    });

    tbody.innerHTML = html;
  }


  function openUploadGuruDocModal() {
    State.uploadTargetTeacherId = null;
    updateDriveUIElements();
    openModal('modal-guru-upload-doc');
  }

  function handleSaveGuruDoc(e) {
    e.preventDefault();
    const category = document.getElementById('select-guru-doc-cat').value;
    const title = document.getElementById('input-guru-doc-title').value.trim();
    const linkInput = document.getElementById('input-guru-doc-link');
    const fileLink = linkInput ? linkInput.value.trim() : '';
    const fileInput = document.getElementById('input-guru-doc-file');
    const notes = document.getElementById('input-guru-doc-notes').value.trim();

    const targetTeacherId = State.uploadTargetTeacherId || State.activeAdminTeacherId || State.currentGuruId;

    const file = fileInput && fileInput.files && fileInput.files[0];

    // Must provide either a file or a Google Drive link
    if (!file && !fileLink) {
      showToast('Harap tempelkan tautan Google Drive atau pilih berkas dokumen untuk diunggah.', 'warning');
      return;
    }

    const fileName = file ? file.name : (fileLink ? 'Tautan Google Drive (Akun Belajar.id)' : (title.replace(/\s+/g, '_') + '.pdf'));
    const fileSize = file ? (file.size / 1024 / 1024).toFixed(1) + ' MB' : 'Cloud Link';

    function commitDoc(fileDataUrl) {
      const newDoc = {
        id: 'GDOC-' + Date.now(),
        teacher_id: targetTeacherId,
        title: title,
        category: category,
        school_year: '2026/2027',
        file_name: fileName,
        file_size: fileSize,
        file_link: fileLink || '',
        file_data: fileDataUrl || null,
        status: 'Disetujui Waka Kur',
        score: 96,
        notes: notes || (fileLink ? 'Perangkat ajar terlampir via Google Drive akun belajar.id.' : 'Perangkat ajar diunggah melalui SIMKUR.'),
        uploaded_at: new Date().toISOString().split('T')[0]
      };

      StorageManager.add('guru_documents', newDoc);

      // Sync with Waka Kur Monitoring
      if (category === 'Modul Ajar') {
        StorageManager.update('teacher_admin', targetTeacherId, { rpp_status: 'Lengkap' });
      } else if (category === 'Silabus & ATP') {
        StorageManager.update('teacher_admin', targetTeacherId, { silabus_status: 'Lengkap' });
      } else if (category === 'Instrumen Asesmen') {
        StorageManager.update('teacher_admin', targetTeacherId, { asesmen_status: 'Lengkap' });
      }

      closeModal('modal-guru-upload-doc');
      showToast('✓ Berkas perangkat ajar berhasil disimpan dan terverifikasi!');
      
      State.uploadTargetTeacherId = null;
      if (fileInput) fileInput.value = '';
      if (linkInput) linkInput.value = '';

      renderGuruDocuments();
      renderPortalGuru();
      if (State.activeAdminTeacherId) {
        renderTeacherDocsList(State.activeAdminTeacherId, State.activeDocFilter || 'all');
      }
      renderDocuments();
      renderDashboard();
    }

    if (file && file.size <= 5 * 1024 * 1024) {
      const reader = new FileReader();
      reader.onload = function () {
        commitDoc(reader.result);
      };
      reader.onerror = function () {
        commitDoc(null);
      };
      reader.readAsDataURL(file);
    } else {
      commitDoc(null);
    }
  }

  function deleteGuruDoc(id) {
    if (confirm('Yakin ingin menghapus dokumen ini?')) {
      StorageManager.delete('guru_documents', id);
      showToast('Dokumen berhasil dihapus.');
      renderGuruDocuments();
      renderPortalGuru();
      if (State.activeAdminTeacherId) {
        renderTeacherDocsList(State.activeAdminTeacherId, State.activeDocFilter || 'all');
      }
      renderDocuments();
      renderDashboard();
    }
  }

  // =========================================================================
  // 10.5.4 SUBTAB SUPERVISI KLINIS & RTL GURU (PORTAL GURU MANDIRI - PRD FR-11 & FR-21)
  // =========================================================================

  function renderGuruSupervisiPane(teacherId, teacher, session) {
    const container = document.getElementById('guru-supervisi-content');
    if (!container) return;

    const allSessions = StorageManager.get('supervisi_sesi') || [];
    const cleanDigits = function (s) { return String(s || '').replace(/\D/g, ''); };
    const cleanStr = function (s) {
      return String(s || '').toLowerCase()
        .replace(/(s\.pd|s\.kom|m\.pd|se|s\.t|dr|dra|drs|h\.|hj\.|m\.m|m\.si|s\.ag|s\.sos|gr\.)/gi, '')
        .replace(/[^a-z0-9]/g, '')
        .trim();
    };

    const targetNip = (session && session.nip) ? session.nip : (teacher && teacher.nip ? teacher.nip : '');
    const targetName = (session && session.name) ? session.name : (teacher && teacher.name ? teacher.name : '');

    let sData = allSessions.find(function (s) {
      if (teacherId && String(s.teacher_id) === String(teacherId)) return true;
      if (targetNip && cleanDigits(s.nip) && cleanDigits(s.nip) === cleanDigits(targetNip)) return true;
      if (targetName && s.teacher_name && cleanStr(s.teacher_name) === cleanStr(targetName)) return true;
      return false;
    });

    if (!sData) {
      sData = allSessions[0] || {
        id: 'SESI-DEMO',
        teacher_id: teacherId,
        teacher_name: targetName || 'Guru Pengampu',
        nip: targetNip || '-',
        department: (teacher && teacher.department) || 'TJKT',
        subject: (teacher && teacher.subject) || 'Mata Pelajaran Produktif',
        supervisor_name: 'Muhammad Ihsan, S.Kom (Kajur TJKT)',
        status: 'Selesai',
        tgl_observasi: '2026-08-20',
        wkt_observasi: '08.00 - 09.30 WITA',
        class_name: 'XI A-TJKT',
        room: 'Lab Jaringan & Komputer',
        skor_b: 50,
        nilai_b: 89.3,
        skor_c: 64,
        nilai_c: 88.9,
        nilai_akhir: 89.1,
        predikat: 'Baik',
        guru_konfirmasi: false
      };
    }

    // Ambil RTL untuk guru / sesi ini
    const allRtl = StorageManager.get('supervisi_rtl') || [];
    const myRtl = allRtl.filter(function (r) {
      return String(r.sesi_id) === String(sData.id) ||
             (r.teacher_name && cleanStr(r.teacher_name) === cleanStr(sData.teacher_name));
    });

    // Kalkulasi Predikat dan Badge
    var predikatBadgeClass = 'predikat-baik';
    var predikatLabel = sData.predikat || 'Baik';
    if (sData.nilai_akhir >= 91) {
      predikatBadgeClass = 'predikat-amat-baik';
      predikatLabel = 'Amat Baik';
    } else if (sData.nilai_akhir >= 76) {
      predikatBadgeClass = 'predikat-baik';
      predikatLabel = 'Baik';
    } else if (sData.nilai_akhir >= 61) {
      predikatBadgeClass = 'predikat-cukup';
      predikatLabel = 'Cukup';
    } else if (sData.nilai_akhir > 0) {
      predikatBadgeClass = 'predikat-kurang';
      predikatLabel = 'Kurang';
    }

    var statusBadgeStyle = 'background: #EFF6FF; color: #1D4ED8; border: 1px solid #BFDBFE;';
    if (sData.status === 'Selesai') {
      statusBadgeStyle = 'background: #ECFDF5; color: #047857; border: 1px solid #A7F3D0;';
    } else if (sData.status === 'Pasca-observasi') {
      statusBadgeStyle = 'background: #FFFBEB; color: #B45309; border: 1px solid #FDE68A;';
    } else if (sData.status === 'Observasi') {
      statusBadgeStyle = 'background: #F3E8FF; color: #7E22CE; border: 1px solid #E9D5FF;';
    }

    var isConfirmed = sData.guru_konfirmasi === true;

    // Timeline Siklus Klinis
    var step1Done = ['Pra-observasi', 'Observasi', 'Pasca-observasi', 'Selesai'].indexOf(sData.status) !== -1;
    var step2Done = ['Observasi', 'Pasca-observasi', 'Selesai'].indexOf(sData.status) !== -1;
    var step3Done = ['Pasca-observasi', 'Selesai'].indexOf(sData.status) !== -1;

    // RTL Cards HTML (Card List - Tidak Ada Scroll Horizontal)
    var rtlCardsHtml = '';
    if (myRtl.length === 0) {
      rtlCardsHtml = '' +
        '<div class="guru-rtl-empty">' +
          '<div style="font-size: 2.25rem; margin-bottom: 0.5rem;">📋</div>' +
          '<div style="font-size: 0.9375rem; font-weight: 700; color: #374151; margin-bottom: 4px;">Belum Ada Rencana Tindak Lanjut</div>' +
          '<div style="font-size: 0.8125rem; color: #9CA3AF;">Belum ada butir RTL yang ditetapkan oleh supervisor untuk sesi supervisi Anda.</div>' +
        '</div>';
    } else {
      myRtl.forEach(function (r, idx) {
        var isDone = r.status === 'Selesai';
        var statusBadge = isDone 
          ? '<span class="guru-rtl-badge badge-selesai">✓ Selesai</span>'
          : '<span class="guru-rtl-badge badge-terbuka">⏳ Terbuka</span>';
        
        var buktiVal = r.bukti_url || r.bukti_file || '';
        var buktiInfo = buktiVal
          ? '<div class="guru-rtl-meta-row bukti-row">' +
              '<span class="guru-rtl-icon">📎</span>' +
              '<span class="guru-rtl-meta-val"><strong>Bukti:</strong> ' + escapeHtml(buktiVal) + '</span>' +
            '</div>'
          : '';

        var completedInfo = (isDone && r.completed_at)
          ? '<div class="guru-rtl-meta-row completed-row">' +
              '<span class="guru-rtl-icon">✅</span>' +
              '<span class="guru-rtl-meta-val"><strong>Diselesaikan:</strong> ' + escapeHtml(r.completed_at) + '</span>' +
            '</div>'
          : '';

        var aksiHtml = isDone
          ? '<button type="button" class="btn btn-outline guru-rtl-btn-reopen" onclick="window.PORTAL_APP.toggleGuruRTLStatus(\'' + r.id + '\')">' +
              '<span>↩ Buka Kembali</span>' +
            '</button>'
          : '<div class="guru-rtl-btn-group">' +
              '<button type="button" class="btn btn-primary guru-rtl-btn-done" onclick="window.PORTAL_APP.toggleGuruRTLStatus(\'' + r.id + '\')">' +
                '<span>✓ Tandai Selesai</span>' +
              '</button>' +
              '<button type="button" class="btn btn-outline guru-rtl-btn-upload" onclick="window.PORTAL_APP.uploadGuruRTLBukti(\'' + r.id + '\')">' +
                '<span>📎 ' + (buktiVal ? 'Ganti Bukti' : 'Unggah Bukti') + '</span>' +
              '</button>' +
            '</div>';

        rtlCardsHtml += '' +
          '<div class="guru-rtl-card ' + (isDone ? 'is-done' : '') + '">' +
            '<div class="guru-rtl-card-header">' +
              '<div class="guru-rtl-item-num">Tindakan #' + (idx + 1) + '</div>' +
              '<div>' + statusBadge + '</div>' +
            '</div>' +
            '<h4 class="guru-rtl-card-title">' + escapeHtml(r.tindakan || 'Tindakan Peningkatan Mutu Pembelajaran') + '</h4>' +
            '<div class="guru-rtl-meta-container">' +
              '<div class="guru-rtl-meta-row">' +
                '<span class="guru-rtl-icon">👥</span>' +
                '<span class="guru-rtl-meta-val"><strong>Pendampingan:</strong> ' + escapeHtml(r.bentuk || 'Pendampingan Mandiri / MGMP') + '</span>' +
              '</div>' +
              '<div class="guru-rtl-meta-row">' +
                '<span class="guru-rtl-icon">📅</span>' +
                '<span class="guru-rtl-meta-val"><strong>Tenggat Waktu:</strong> ' + escapeHtml(r.tenggat || '30 Oktober 2026') + '</span>' +
              '</div>' +
              completedInfo +
              buktiInfo +
            '</div>' +
            '<div class="guru-rtl-card-actions">' + aksiHtml + '</div>' +
          '</div>';
      });
    }

    container.innerHTML = '' +
      '<!-- 1. HEADER KARTU STATUS SUPERVISI GURU -->' +
      '<div class="content-card guru-supervisi-header-card" style="margin-bottom: 1.25rem; border-left: 4px solid var(--simkur-purple);">' +
        '<div class="content-card-body guru-supervisi-header-inner">' +
          '<div class="guru-supervisi-header-info">' +
            '<div class="guru-supervisi-title-wrap">' +
              '<h3 class="guru-supervisi-main-title">Siklus Supervisi Akademik Klinis Guru</h3>' +
              '<span class="badge" style="' + statusBadgeStyle + ' font-weight: 700; font-size: 0.78125rem; border-radius: 20px; padding: 3px 10px;">' + sData.status + '</span>' +
            '</div>' +
            '<p class="guru-supervisi-meta-desc">' +
              'Supervisor: <strong>' + (sData.supervisor_name || 'Ketua Jurusan') + '</strong> • Jadwal: <strong>' + (sData.tgl_observasi || 'Terjadwal') + ' (' + (sData.wkt_observasi || '08.00 - 09.30 WITA') + ')</strong> • Kelas: <strong>' + (sData.class_name || 'XI KBM') + '</strong>' +
            '</p>' +
          '</div>' +
          '<div class="guru-supervisi-header-actions">' +
            '<button type="button" class="btn btn-outline guru-supervisi-act-btn" onclick="window.PORTAL_APP.openSupervisiKlinisModal(\'' + sData.id + '\')">' +
              '<span>👁️ Detail Rubrik A, B, C</span>' +
            '</button>' +
            '<button type="button" class="btn btn-primary guru-supervisi-act-btn" onclick="window.PORTAL_APP.printSupervisiReport(\'' + sData.id + '\')">' +
              '<span>🖨️ Cetak Lembar Hasil PDF</span>' +
            '</button>' +
          '</div>' +
        '</div>' +
      '</div>' +

      '<!-- 2. 4 KPI CARDS: NILAI & PREDIKAT -->' +
      '<div class="kpi-grid guru-supervisi-kpi-grid">' +
        
        '<div class="content-card kpi-card guru-supervisi-kpi-card" style="border-top: 3.5px solid #6366F1;">' +
          '<span class="guru-supervisi-kpi-label">1. Telaah Perangkat (40%)</span>' +
          '<div class="guru-supervisi-kpi-val">' + (sData.nilai_b > 0 ? sData.nilai_b.toFixed(1) : '-') + ' <span class="guru-supervisi-kpi-max">/ 100</span></div>' +
          '<div class="guru-supervisi-kpi-sub">Skor: ' + (sData.skor_b || 0) + ' / 56 (Instrumen B)</div>' +
        '</div>' +

        '<div class="content-card kpi-card guru-supervisi-kpi-card" style="border-top: 3.5px solid #0EA5E9;">' +
          '<span class="guru-supervisi-kpi-label">2. Observasi KBM (60%)</span>' +
          '<div class="guru-supervisi-kpi-val">' + (sData.nilai_c > 0 ? sData.nilai_c.toFixed(1) : '-') + ' <span class="guru-supervisi-kpi-max">/ 100</span></div>' +
          '<div class="guru-supervisi-kpi-sub">Skor: ' + (sData.skor_c || 0) + ' / 72 (Instrumen C)</div>' +
        '</div>' +

        '<div class="content-card kpi-card guru-supervisi-kpi-card" style="border-top: 3.5px solid #10B981;">' +
          '<span class="guru-supervisi-kpi-label">Nilai Akhir Supervisi</span>' +
          '<div class="guru-supervisi-kpi-val text-success" style="color: #047857;">' + (sData.nilai_akhir > 0 ? sData.nilai_akhir.toFixed(1) : '-') + ' <span class="guru-supervisi-kpi-max">/ 100</span></div>' +
          '<div class="guru-supervisi-kpi-sub text-success" style="color: #059669; font-weight: 600;">Bobot: 40% B + 60% C</div>' +
        '</div>' +

        '<div class="content-card kpi-card guru-supervisi-kpi-card" style="border-top: 3.5px solid #F59E0B;">' +
          '<span class="guru-supervisi-kpi-label">Predikat Mutu</span>' +
          '<div style="margin: 4px 0;">' +
            '<span class="badge ' + predikatBadgeClass + ' guru-supervisi-predikat-badge">⭐ ' + predikatLabel.toUpperCase() + '</span>' +
          '</div>' +
          '<div class="guru-supervisi-kpi-sub">Standar SMKN 1 Banjarmasin</div>' +
        '</div>' +

      '</div>' +

      '<!-- 3. TIMELINE 3 TAHAP SIKLUS KLINIS -->' +
      '<div class="content-card guru-supervisi-timeline-card" style="margin-bottom: 1.25rem;">' +
        '<div class="content-card-header">' +
          '<h3 style="font-size: 0.9375rem; font-weight: 700; color: #1F2937; margin: 0;">Siklus 3 Tahap Supervisi Klinis Berkelanjutan</h3>' +
        '</div>' +
        '<div class="content-card-body" style="padding: 1.25rem;">' +
          '<div class="guru-supervisi-timeline-grid">' +
            
            '<div class="guru-supervisi-step-box ' + (step1Done ? 'is-done' : '') + '">' +
              '<div class="guru-supervisi-step-header">' +
                '<span class="guru-supervisi-step-tag">TAHAP 1: PRA-OBSERVASI</span>' +
                '<span class="badge ' + (step1Done ? 'badge-step-done' : 'badge-step-wait') + '">' + (step1Done ? '✓ Terlaksana' : 'Menunggu') + '</span>' +
              '</div>' +
              '<div class="guru-supervisi-step-title">Wawancara & Telaah Berkas SIMKUR</div>' +
              '<p class="guru-supervisi-step-desc">Pemeriksaan Modul Ajar, Silabus/ATP, Prota/Promes, dan Asesmen yang diunggah guru di SIMKUR.</p>' +
            '</div>' +

            '<div class="guru-supervisi-step-box ' + (step2Done ? 'is-done' : '') + '">' +
              '<div class="guru-supervisi-step-header">' +
                '<span class="guru-supervisi-step-tag">TAHAP 2: OBSERVASI KBM</span>' +
                '<span class="badge ' + (step2Done ? 'badge-step-done' : 'badge-step-wait') + '">' + (step2Done ? '✓ Terlaksana' : 'Menunggu') + '</span>' +
              '</div>' +
              '<div class="guru-supervisi-step-title">Pengamatan di Ruang / Bengkel / Lab</div>' +
              '<p class="guru-supervisi-step-desc">Observasi pembelajaran berdiferensiasi, keterlibatan aktif siswa, integrasi PjBL/TeFa, dan kepatuhan K3.</p>' +
            '</div>' +

            '<div class="guru-supervisi-step-box ' + (step3Done ? 'is-done' : '') + '">' +
              '<div class="guru-supervisi-step-header">' +
                '<span class="guru-supervisi-step-tag">TAHAP 3: PASCA & RTL</span>' +
                '<span class="badge ' + (step3Done ? 'badge-step-done' : 'badge-step-wait') + '">' + (step3Done ? '✓ Terlaksana' : 'Menunggu') + '</span>' +
              '</div>' +
              '<div class="guru-supervisi-step-title">Refleksi, Umpan Balik & RTL</div>' +
              '<p class="guru-supervisi-step-desc">Diskusi hangat hasil observasi, apresiasi keunggulan guru, kesepakatan butir RTL dan bukti tindak lanjut.</p>' +
            '</div>' +

          '</div>' +
        '</div>' +
      '</div>' +

      '<!-- 4. UMPAN BALIK SUPERVISOR & KONFIRMASI GURU (PRD FR-11) -->' +
      '<div class="content-card guru-supervisi-feedback-card" style="margin-bottom: 1.25rem;">' +
        '<div class="content-card-header guru-supervisi-feedback-header">' +
          '<div style="flex: 1 1 200px;">' +
            '<h3 class="guru-supervisi-feedback-title" style="font-size: 0.9375rem; font-weight: 700; color: #1F2937; margin: 0 0 2px 0;">Refleksi Guru & Konfirmasi Umpan Balik (PRD FR-11)</h3>' +
            '<p style="font-size: 0.75rem; color: #6B7280; margin: 0;">Konfirmasi penerimaan umpan balik dan catatan refleksi perbaikan diri</p>' +
          '</div>' +
          '<div>' +
            (isConfirmed 
              ? '<span class="badge" style="background: #DEF7EC; color: #03543F; font-weight: 700; border-radius: 20px; padding: 4px 12px;">✓ Sudah Dikonfirmasi Guru</span>'
              : '<span class="badge" style="background: #FEF3C7; color: #92400E; font-weight: 700; border-radius: 20px; padding: 4px 12px;">⏳ Menunggu Konfirmasi Guru</span>') +
          '</div>' +
        '</div>' +
        '<div class="content-card-body" style="padding: 1.25rem;">' +
          (isConfirmed 
            ? '<div class="guru-supervisi-confirmed-box" style="background: #F0FDF4; border: 1.5px solid #BBF7D0; border-radius: 14px; padding: 1.125rem;">' +
                '<div style="font-weight: 800; color: #166534; font-size: 0.9375rem; margin-bottom: 4px;">✓ Anda telah membaca dan mengonfirmasi hasil umpan balik supervisi ini.</div>' +
                '<div style="font-size: 0.8125rem; color: #15803D; margin-bottom: 6px;">Waktu Konfirmasi: <strong>' + (sData.guru_konfirmasi_at || 'Terverifikasi') + '</strong></div>' +
                (sData.guru_refleksi ? '<div style="margin-top: 8px; padding-top: 8px; border-top: 1px dashed #86EFAC; font-size: 0.8125rem; color: #14532D; line-height: 1.45;"><strong>Catatan Refleksi Mandiri Anda:</strong> ' + escapeHtml(sData.guru_refleksi) + '</div>' : '') +
              '</div>'
            : '<div style="margin-bottom: 0.5rem;">' +
                '<label class="form-label" style="font-weight: 700; color: #374151; font-size: 0.8125rem; margin-bottom: 6px; display: block;">' +
                  'Catatan Refleksi Mandiri Guru (Opsional):' +
                '</label>' +
                '<textarea id="input-guru-refleksi-text" class="form-input" rows="3" placeholder="Tuliskan refleksi mandiri Anda mengenai proses pembelajaran yang telah disupervisi dan komitmen tindak lanjut..." style="width: 100%; box-sizing: border-box; border-radius: 10px; padding: 10px; font-size: 0.875rem; line-height: 1.4; border: 1.5px solid #E2E8F0;"></textarea>' +
                '<div class="guru-supervisi-confirm-wrap" style="margin-top: 12px;">' +
                  '<button type="button" class="btn btn-primary guru-supervisi-confirm-btn" onclick="window.PORTAL_APP.confirmGuruSupervisi(\'' + sData.id + '\')">' +
                    '<span>✓ Konfirmasi Sudah Membaca Umpan Balik (PRD FR-11)</span>' +
                  '</button>' +
                '</div>' +
              '</div>') +
        '</div>' +
      '</div>' +

      '<!-- 5. DAFTAR RENCANA TINDAK LANJUT (RTL) GURU (PRD FR-21) - CARD LIST -->' +
      '<div class="guru-rtl-list-card">' +
        '<div class="guru-rtl-list-header">' +
          '<div class="guru-rtl-list-title-wrap">' +
            '<h3 class="guru-rtl-list-title">Daftar Rencana Tindak Lanjut (RTL) & Pelacak Bukti Fisik</h3>' +
            '<p class="guru-rtl-list-sub">Komitmen peningkatan mutu pasca-observasi klinis supervisi</p>' +
          '</div>' +
          '<span class="badge" style="background: rgba(75, 34, 184, 0.1); color: #4B22B8; font-weight: 700; border-radius: 20px; padding: 4px 12px;">' + myRtl.length + ' Tindakan Terdaftar</span>' +
        '</div>' +
        '<div class="guru-rtl-list-body">' +
          rtlCardsHtml +
        '</div>' +
      '</div>';
  }

  function confirmGuruSupervisi(sesiId) {
    const inputEl = document.getElementById('input-guru-refleksi-text');
    const refleksi = inputEl ? inputEl.value.trim() : '';

    const sessions = StorageManager.get('supervisi_sesi') || [];
    const sesi = sessions.find(function (s) { return String(s.id) === String(sesiId); });
    if (!sesi) {
      showToast('Sesi supervisi tidak ditemukan.', 'danger');
      return;
    }

    const updated = {
      guru_konfirmasi: true,
      guru_konfirmasi_at: new Date().toLocaleString('id-ID'),
      guru_refleksi: refleksi || 'Guru telah membaca dan menyepakati hasil umpan balik supervisi.'
    };

    StorageManager.update('supervisi_sesi', sesiId, updated);
    showToast('✓ Terima kasih! Hasil supervisi dan umpan balik berhasil dikonfirmasi.');
    renderPortalGuru();
  }

  function toggleGuruRTLStatus(rtlId) {
    const rtlItems = StorageManager.get('supervisi_rtl') || [];
    const item = rtlItems.find(function (r) { return String(r.id) === String(rtlId); });
    if (!item) {
      showToast('Item RTL tidak ditemukan.', 'danger');
      return;
    }

    const newStatus = item.status === 'Selesai' ? 'Terbuka' : 'Selesai';
    StorageManager.update('supervisi_rtl', rtlId, {
      status: newStatus,
      completed_at: newStatus === 'Selesai' ? new Date().toLocaleDateString('id-ID') : null
    });

    showToast(newStatus === 'Selesai' ? '✓ Butir RTL ditandai Selesai!' : 'Butir RTL dibuka kembali.');
    renderPortalGuru();
    if (State.currentScreen === 'supervisi') renderSupervisi();
  }

  function uploadGuruRTLBukti(rtlId) {
    const docName = prompt('Masukkan nama file / tautan Google Drive bukti pelaksanaan RTL Anda:', 'Laporan_Penyelarasan_Rubrik_Asesmen.pdf');
    if (!docName || !docName.trim()) return;

    StorageManager.update('supervisi_rtl', rtlId, {
      status: 'Selesai',
      bukti_url: docName.trim(),
      completed_at: new Date().toLocaleDateString('id-ID')
    });

    showToast('✓ Bukti RTL berhasil disimpan dan status diperbarui menjadi Selesai!');
    renderPortalGuru();
    if (State.currentScreen === 'supervisi') renderSupervisi();
  }

  // =========================================================================
  // 10.6 SCREEN: SUPERVISI AKADEMIK & MANAJERIAL (PRD SMKN 1 BANJARMASIN)
  // =========================================================================

  const SUPERVISI_INSTRUMEN = {
    // Instrumen A: Wawancara Pra-observasi (8 Butir PRD)
    A: [
      { no: 1, q: "Mata pelajaran, kelas/rombel, dan tujuan pembelajaran yang akan diamati?" },
      { no: 2, q: "Bagaimana langkah pembelajaran dan model yang direncanakan (PjBL, PBL, TeFa, praktikum)?" },
      { no: 3, q: "Bagaimana kondisi dan kebutuhan belajar peserta didik di kelas ini (hasil asesmen diagnostik)?" },
      { no: 4, q: "Bagaimana rencana asesmen dan bukti ketercapaian tujuan pembelajaran?" },
      { no: 5, q: "Media, alat, bahan, dan langkah keselamatan kerja (K3) yang disiapkan di ruang belajar/lab?" },
      { no: 6, q: "Kendala atau tantangan yang dihadapi pada materi atau karakteristik kelas ini?" },
      { no: 7, q: "Aspek khusus apa yang Bapak/Ibu harapkan untuk saya amati dan beri masukan?" },
      { no: 8, q: "Kesepakatan waktu pelaksanaan observasi dan pertemuan refleksi pasca-observasi." }
    ],
    // Instrumen B: Telaah Perangkat Ajar (14 Butir PRD, Bobot 40%)
    B: [
      { no: 1, section: "Capaian dan Tujuan Pembelajaran", text: "CP dan tujuan pembelajaran (TP) sesuai fase dan elemen mata pelajaran" },
      { no: 2, section: "Capaian dan Tujuan Pembelajaran", text: "TP dirumuskan operasional, terukur, dan tersusun runtut dalam Alur Tujuan Pembelajaran (ATP)" },
      { no: 3, section: "Capaian dan Tujuan Pembelajaran", text: "Alokasi waktu (JP) sesuai struktur kurikulum SMK dan kalender akademik" },
      { no: 4, section: "Modul Ajar / Perencanaan", text: "Identitas modul, kompetensi awal, dan dimensi profil lulusan (P3) sesuai" },
      { no: 5, section: "Modul Ajar / Perencanaan", text: "Model dan metode pembelajaran sesuai karakteristik materi (PjBL, PBL, TeFa, praktikum)" },
      { no: 6, section: "Modul Ajar / Perencanaan", text: "Langkah pembelajaran (pendahuluan, inti, penutup) runtut, jelas, dan berpusat pada siswa" },
      { no: 7, section: "Modul Ajar / Perencanaan", text: "Pembelajaran berdiferensiasi (materi, proses, produk) dipertimbangkan secara nyata" },
      { no: 8, section: "Modul Ajar / Perencanaan", text: "Media, bahan ajar, jobsheet, dan sumber belajar digital/cetak sesuai dan tersedia" },
      { no: 9, section: "Modul Ajar / Perencanaan", text: "Kegiatan praktik memuat prosedur keselamatan kerja (K3) dan budaya kerja 5R bagi mapel kejuruan" },
      { no: 10, section: "Asesmen Pembelajaran", text: "Asesmen diagnostik, formatif, dan sumatif direncanakan secara terstruktur" },
      { no: 11, section: "Asesmen Pembelajaran", text: "Instrumen dan rubrik penilaian tersedia lengkap serta mengukur ketercapaian TP" },
      { no: 12, section: "Asesmen Pembelajaran", text: "Rencana program remedial dan pengayaan tersedia sesuai kebutuhan siswa" },
      { no: 13, section: "Program dan Administrasi", text: "Program tahunan (Prota) dan semester (Prosem) tersedia dan konsisten dengan kalender sekolah" },
      { no: 14, section: "Program dan Administrasi", text: "Perangkat lengkap dan dikumpulkan tepat waktu pada SIMKUR" }
    ],
    // Instrumen C: Observasi Pelaksanaan Pembelajaran (18 Butir PRD, Bobot 60%)
    C: [
      { no: 1, section: "Kegiatan Pendahuluan", text: "Mengondisikan kelas dengan tertib (salam, doa, presensi, kesiapan fisik dan alat belajar)" },
      { no: 2, section: "Kegiatan Pendahuluan", text: "Apersepsi dan motivasi, mengaitkan materi dengan pengalaman nyata atau dunia kerja (DUDI)" },
      { no: 3, section: "Kegiatan Pendahuluan", text: "Menyampaikan tujuan pembelajaran, skenario kegiatan, dan teknik asesmen yang digunakan" },
      { no: 4, section: "Kegiatan Inti", text: "Menguasai materi pelajaran dan menyampaikan konsep secara tepat tanpa miskonsepsi" },
      { no: 5, section: "Kegiatan Inti", text: "Menerapkan model pembelajaran interaktif sesuai TP (PjBL, PBL, TeFa, inkuiri, praktikum)" },
      { no: 6, section: "Kegiatan Inti", text: "Pembelajaran berpusat pada peserta didik dan melibatkan siswa aktif berkolaborasi" },
      { no: 7, section: "Kegiatan Inti", text: "Menerapkan diferensiasi proses/konten sesuai kesiapan belajar peserta didik" },
      { no: 8, section: "Kegiatan Inti", text: "Memanfaatkan media pembelajaran, proyektor, dan teknologi digital secara efektif" },
      { no: 9, section: "Kegiatan Inti", text: "Membimbing praktik: mendemonstrasikan SOP, alat kerja, dan kepatuhan K3 bengkel/lab" },
      { no: 10, section: "Kegiatan Inti", text: "Mengelola alokasi waktu dan alur tahapan kegiatan sesuai modul ajar" },
      { no: 11, section: "Kegiatan Inti", text: "Berkomunikasi efektif: bahasa santun, pertanyaan pemantik memancing nalar kritis, dan umpan balik hangat" },
      { no: 12, section: "Kegiatan Inti", text: "Menguatkan karakter Profil Pelajar Pancasila dan etos kerja industri" },
      { no: 13, section: "Asesmen dan Penutup", text: "Melakukan asesmen formatif berkala selama pembelajaran (observasi/kuis/lembar kerja)" },
      { no: 14, section: "Asesmen dan Penutup", text: "Membimbing siswa melakukan refleksi serta menyimpulkan intisari materi bersama" },
      { no: 15, section: "Asesmen dan Penutup", text: "Memberikan umpan balik konstruktif dan tindak lanjut (tugas mandiri, pengayaan, remedial)" },
      { no: 16, section: "Asesmen dan Penutup", text: "Menutup pembelajaran tepat waktu, merapikan alat dan lingkungan ruang/lab" },
      { no: 17, section: "Manajemen Kelas & Budaya Belajar", text: "Menciptakan suasana kelas kondusif, disiplin positif, dan bebas perundungan" },
      { no: 18, section: "Manajemen Kelas & Budaya Belajar", text: "Mempertahankan keterlibatan, fokus, dan kehadiran aktif peserta didik hingga akhir sesi" }
    ],
    // Instrumen E: Supervisi Manajerial Waka & Kajur (15 Butir PRD)
    E: [
      { no: 1, section: "Perencanaan Program", text: "Program kerja tahunan/semester tersusun dan selaras dengan RKS/RKT sekolah" },
      { no: 2, section: "Perencanaan Program", text: "Target capaian mutu dan indikator keberhasilan program jelas dan terukur" },
      { no: 3, section: "Perencanaan Program", text: "Pembagian tugas tim kerja dan jadwal pelaksanaan kegiatan terperinci" },
      { no: 4, section: "Pelaksanaan Program", text: "Program terlaksana sesuai jadwal dan target kinerja yang ditetapkan" },
      { no: 5, section: "Pelaksanaan Program", text: "Koordinasi dan komunikasi dengan guru, tenaga kependidikan, dan pimpinan berjalan efektif" },
      { no: 6, section: "Pelaksanaan Program", text: "(K) Melaksanakan pembinaan dan supervisi klinis guru di jurusannya secara terjadwal" },
      { no: 7, section: "Pelaksanaan Program", text: "(K) Mengelola sarana prasarana bengkel/lab, perawatan alat, dan keselamatan kerja (K3)" },
      { no: 8, section: "Pelaksanaan Program", text: "(K) Menjalin kerja sama strategis dengan DUDI, sinkronisasi kurikulum, PKL, dan Teaching Factory" },
      { no: 9, section: "Pelaksanaan Program", text: "(WK) Mengelola administrasi kurikulum terpadu, kalender pendidikan, dan verifikasi perangkat guru" },
      { no: 10, section: "Pelaporan dan Tindak Lanjut", text: "Laporan berkala program kerja disusun lengkap, akuntabel, dan tepat waktu" },
      { no: 11, section: "Pelaporan dan Tindak Lanjut", text: "Data dan portofolio kegiatan tersimpan rapi serta mudah ditelusuri" },
      { no: 12, section: "Pelaporan dan Tindak Lanjut", text: "Hasil evaluasi dan supervisi ditindaklanjuti dengan rencana perbaikan nyata" },
      { no: 13, section: "Kepemimpinan & Tata Kelola", text: "Keteladanan kepemimpinan, integritas, dan penguatan budaya kerja positif" },
      { no: 14, section: "Kepemimpinan & Tata Kelola", text: "Inisiatif dan inovasi pemecahan masalah dalam peningkatan mutu pembelajaran" },
      { no: 15, section: "Kepemimpinan & Tata Kelola", text: "Pemanfaatan sistem digital SIMKUR secara optimal untuk pemantauan dan pelaporan" }
    ]
  };

  function calculateSupervisiScores(bScores, cScores) {
    bScores = bScores || {};
    cScores = cScores || {};
    
    // Instrumen B: 14 butir, max score = 56
    var totalB = 0;
    var countB = 0;
    for (var i = 1; i <= 14; i++) {
      if (bScores[i] !== undefined && bScores[i] !== null && bScores[i] !== '') {
        totalB += Number(bScores[i]);
        countB++;
      }
    }
    var nilaiB = countB > 0 ? (totalB / (14 * 4)) * 100 : 0;

    // Instrumen C: 18 butir, max score = 72
    var totalC = 0;
    var countC = 0;
    for (var j = 1; j <= 18; j++) {
      if (cScores[j] !== undefined && cScores[j] !== null && cScores[j] !== '') {
        totalC += Number(cScores[j]);
        countC++;
      }
    }
    var nilaiC = countC > 0 ? (totalC / (18 * 4)) * 100 : 0;

    // Nilai Akhir: 40% B + 60% C (PRD Bagian 7)
    var nilaiAkhir = 0;
    if (countB > 0 && countC > 0) {
      nilaiAkhir = (nilaiB * 0.40) + (nilaiC * 0.60);
    } else if (countB > 0) {
      nilaiAkhir = nilaiB;
    } else if (countC > 0) {
      nilaiAkhir = nilaiC;
    }

    var predikat = '-';
    var predikatClass = 'badge-neutral';
    var tindakLanjut = '-';

    if (nilaiAkhir >= 91) {
      predikat = 'Amat Baik';
      predikatClass = 'predikat-amat-baik';
      tindakLanjut = 'Apresiasi; dorong menjadi guru penggerak / mentor sejawat bagi rekan sejawat.';
    } else if (nilaiAkhir >= 76) {
      predikat = 'Baik';
      predikatClass = 'predikat-baik';
      tindakLanjut = 'Pembinaan ringan berkala; pertahankan konsistensi mutu pembelajaran.';
    } else if (nilaiAkhir >= 61) {
      predikat = 'Cukup';
      predikatClass = 'predikat-cukup';
      tindakLanjut = 'Pendampingan intensif oleh Ketua Jurusan; supervisi ulang bila diperlukan.';
    } else if (nilaiAkhir > 0) {
      predikat = 'Kurang';
      predikatClass = 'predikat-kurang';
      tindakLanjut = 'Pembinaan intensif terstruktur; wajib dijadwalkan supervisi ulang dalam 1 bulan.';
    }

    return {
      totalB: totalB,
      nilaiB: Math.round(nilaiB * 10) / 10,
      contribB: Math.round(nilaiB * 0.40 * 10) / 10,
      totalC: totalC,
      nilaiC: Math.round(nilaiC * 10) / 10,
      contribC: Math.round(nilaiC * 0.60 * 10) / 10,
      nilaiAkhir: Math.round(nilaiAkhir * 10) / 10,
      predikat: predikat,
      predikatClass: predikatClass,
      tindakLanjut: tindakLanjut
    };
  }

  function renderSupervisi() {
    const sessions = StorageManager.get('supervisi_sesi');
    const rtlItems = StorageManager.get('supervisi_rtl');

    // 1. Update Top KPI Cards
    const totalTeachers = 90;
    const finishedCount = sessions.filter(function (s) { return s.status === 'Selesai'; }).length;
    const finishedPct = totalTeachers > 0 ? ((finishedCount / totalTeachers) * 100).toFixed(1) : '0';

    const kpiTotalEl = document.getElementById('sup-kpi-total-guru');
    if (kpiTotalEl) kpiTotalEl.textContent = totalTeachers + ' Guru';

    const kpiDonePct = document.getElementById('sup-kpi-done-pct');
    if (kpiDonePct) kpiDonePct.textContent = finishedPct + '%';

    const kpiDoneCount = document.getElementById('sup-kpi-done-count');
    if (kpiDoneCount) kpiDoneCount.textContent = finishedCount + ' / ' + totalTeachers + ' Guru';

    const kpiBar = document.getElementById('sup-kpi-progress-bar');
    if (kpiBar) kpiBar.style.width = finishedPct + '%';

    const kpiDoneSub = document.getElementById('sup-kpi-done-sub');
    if (kpiDoneSub) kpiDoneSub.textContent = finishedCount + ' Selesai • ' + (totalTeachers - finishedCount) + ' Berjalan / Terjadwal';

    // Rata-rata Nilai Selesai
    const finishedSessions = sessions.filter(function (s) { return s.status === 'Selesai' && s.nilai_akhir > 0; });
    var avgScore = 0;
    if (finishedSessions.length > 0) {
      var sum = finishedSessions.reduce(function (acc, s) { return acc + Number(s.nilai_akhir || 0); }, 0);
      avgScore = Math.round((sum / finishedSessions.length) * 10) / 10;
    }
    const kpiAvgScore = document.getElementById('sup-kpi-avg-score');
    if (kpiAvgScore) kpiAvgScore.textContent = avgScore > 0 ? avgScore.toFixed(1) : '-';

    const kpiAvgBadge = document.getElementById('sup-kpi-avg-badge');
    if (kpiAvgBadge) {
      if (avgScore >= 91) {
        kpiAvgBadge.className = 'badge badge-success';
        kpiAvgBadge.textContent = 'Amat Baik';
      } else if (avgScore >= 76) {
        kpiAvgBadge.className = 'badge badge-primary';
        kpiAvgBadge.textContent = 'Baik';
      } else if (avgScore >= 61) {
        kpiAvgBadge.className = 'badge badge-warning';
        kpiAvgBadge.textContent = 'Cukup';
      } else {
        kpiAvgBadge.className = 'badge badge-danger';
        kpiAvgBadge.textContent = 'Kurang';
      }
    }

    // RTL KPI
    const openRtl = rtlItems.filter(function (r) { return r.status === 'Terbuka'; }).length;
    const kpiRtlCount = document.getElementById('sup-kpi-rtl-count');
    if (kpiRtlCount) kpiRtlCount.textContent = openRtl + ' Tindakan';
    const kpiRtlBadge = document.getElementById('sup-kpi-rtl-badge');
    if (kpiRtlBadge) kpiRtlBadge.textContent = openRtl + ' Terbuka';

    // Tab sesi count
    const tabSesiCount = document.getElementById('sup-tab-sesi-count');
    if (tabSesiCount) tabSesiCount.textContent = sessions.length;

    // 2. Render Active Subtab
    const tab = State.activeSupervisiTab || 'dash';
    if (tab === 'dash') renderSupervisiDash();
    else if (tab === 'sesi') renderSupervisiSesi();
    else if (tab === 'manajerial') renderSupervisiManajerial();
    else if (tab === 'rtl') renderSupervisiRTL();
    else if (tab === 'laporan') renderSupervisiRekapLaporan();
  }

  function switchSupervisiTab(tabName) {
    State.activeSupervisiTab = tabName;

    // Update buttons
    document.querySelectorAll('.doc-subtab-btn[data-sup-tab]').forEach(function (btn) {
      if (btn.getAttribute('data-sup-tab') === tabName) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    // Update panes
    const panes = ['dash', 'sesi', 'manajerial', 'rtl', 'program', 'laporan'];
    panes.forEach(function (p) {
      const el = document.getElementById('sup-pane-' + p);
      if (el) {
        el.style.display = (p === tabName) ? 'block' : 'none';
      }
    });

    renderSupervisi();
  }

  // 10.6.1 SUBTAB 1: DASHBOARD & SEBARAN
  function renderSupervisiDash() {
    const sessions = StorageManager.get('supervisi_sesi');
    const gridEl = document.getElementById('sup-jurusan-grid');
    if (!gridEl) return;

    const jurusans = [
      { code: 'TJKT', name: 'Teknik Jaringan Komputer & Telekomunikasi', kajur: 'Muhammad Ihsan, S.Kom' },
      { code: 'DKV', name: 'Desain Komunikasi Visual', kajur: 'Hendra Surya Pratama, S.Kom' },
      { code: 'AKL', name: 'Akuntansi & Keuangan Lembaga', kajur: 'Oky Wulan Maulina, S.Pd' },
      { code: 'MPLB', name: 'Manajemen Perkantoran & Layanan Bisnis', kajur: 'Akhmad Hanafi Maulana, S.E' },
      { code: 'Pemasaran', name: 'Pemasaran / Bisnis Daring', kajur: 'Futri Indri Septiani, S.Pd' },
      { code: 'Umum', name: 'Muatan Umum & Pilihan', kajur: 'Rusnani, S.Pd., M.T (Waka)' }
    ];

    let gridHtml = '';
    jurusans.forEach(function (j) {
      const deptSessions = sessions.filter(function (s) {
        const d = (s.department || '').toUpperCase();
        if (j.code === 'Pemasaran') return d.includes('PEMASARAN') || d.includes('PM');
        return d.includes(j.code.toUpperCase());
      });

      const total = deptSessions.length;
      const selesai = deptSessions.filter(function (s) { return s.status === 'Selesai'; }).length;
      const pct = total > 0 ? Math.round((selesai / total) * 100) : 0;

      const scored = deptSessions.filter(function (s) { return s.status === 'Selesai' && s.nilai_akhir > 0; });
      let avg = 0;
      if (scored.length > 0) {
        avg = Math.round((scored.reduce(function (a, b) { return a + Number(b.nilai_akhir); }, 0) / scored.length) * 10) / 10;
      }

      let predikat = 'Belum Ada';
      let predClass = 'badge-neutral';
      if (avg >= 91) { predikat = 'Amat Baik'; predClass = 'badge-success'; }
      else if (avg >= 76) { predikat = 'Baik'; predClass = 'badge-primary'; }
      else if (avg >= 61) { predikat = 'Cukup'; predClass = 'badge-warning'; }
      else if (avg > 0) { predikat = 'Kurang'; predClass = 'badge-danger'; }

      gridHtml += '<div class="content-card" style="margin: 0; padding: 1.25rem; display: flex; flex-direction: column; justify-content: space-between; border-top: 3px solid #1E56A0;">' +
        '<div>' +
        '<div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 6px;">' +
        '<div>' +
        '<span class="badge badge-primary" style="font-size: 0.725rem; font-weight: 800;">' + j.code + '</span>' +
        '<h4 style="margin: 6px 0 0 0; font-size: 0.95rem; font-weight: 800; color: #0F172A;">' + j.name + '</h4>' +
        '</div>' +
        '<span class="badge ' + predClass + '" style="font-size: 0.725rem;">' + (avg > 0 ? avg.toFixed(1) + ' • ' + predikat : 'Proses') + '</span>' +
        '</div>' +
        '<div style="font-size: 0.775rem; color: #64748B; margin-top: 4px;">Kajur / Pengawas: <strong>' + j.kajur + '</strong></div>' +
        '</div>' +

        '<div style="margin-top: 1.25rem;">' +
        '<div style="display: flex; justify-content: space-between; font-size: 0.75rem; color: #475569; margin-bottom: 4px;">' +
        '<span>Progres Selesai</span>' +
        '<strong>' + selesai + ' / ' + total + ' Guru (' + pct + '%)</strong>' +
        '</div>' +
        '<div style="background: #E2E8F0; border-radius: 999px; height: 6px; width: 100%; overflow: hidden;">' +
        '<div style="background: ' + (pct >= 80 ? '#10B981' : pct >= 40 ? '#3B82F6' : '#F59E0B') + '; height: 100%; width: ' + pct + '%; border-radius: 999px;"></div>' +
        '</div>' +
        '</div>' +

        '</div>';
    });

    gridEl.innerHTML = gridHtml;

    // Sebaran Predikat
    const barsEl = document.getElementById('sup-predikat-bars');
    if (barsEl) {
      const selesaiSessions = sessions.filter(function (s) { return s.status === 'Selesai'; });
      const amatBaik = selesaiSessions.filter(function (s) { return s.nilai_akhir >= 91; }).length;
      const baik = selesaiSessions.filter(function (s) { return s.nilai_akhir >= 76 && s.nilai_akhir < 91; }).length;
      const cukup = selesaiSessions.filter(function (s) { return s.nilai_akhir >= 61 && s.nilai_akhir < 76; }).length;
      const kurang = selesaiSessions.filter(function (s) { return s.nilai_akhir > 0 && s.nilai_akhir < 61; }).length;

      const totalSelesai = selesaiSessions.length || 1;

      barsEl.innerHTML = '' +
        renderPredBar('Amat Baik (91 – 100)', amatBaik, totalSelesai, '#10B981') +
        renderPredBar('Baik (76 – 90)', baik, totalSelesai, '#3B82F6') +
        renderPredBar('Cukup (61 – 75)', cukup, totalSelesai, '#F59E0B') +
        renderPredBar('Kurang (≤ 60)', kurang, totalSelesai, '#EF4444');
    }

    // Urgent / Pasca-Obs list
    const urgentEl = document.getElementById('sup-urgent-list');
    if (urgentEl) {
      const pending = sessions.filter(function (s) {
        return s.status === 'Pasca-observasi' || s.status === 'Observasi';
      }).slice(0, 4);

      if (pending.length === 0) {
        urgentEl.innerHTML = '<div style="font-size: 0.8125rem; color: #64748B; text-align: center; padding: 1.5rem;">Seluruh sesi supervisi telah diselesaikan atau dijadwalkan tertib.</div>';
      } else {
        let uHtml = '';
        pending.forEach(function (p) {
          uHtml += '<div style="padding: 10px 12px; background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 8px; display: flex; justify-content: space-between; align-items: center; gap: 8px;">' +
            '<div>' +
            '<div style="font-weight: 700; font-size: 0.825rem; color: #0F172A;">' + p.teacher_name + '</div>' +
            '<div style="font-size: 0.725rem; color: #64748B;">' + p.department + ' • ' + p.subject + ' • ' + (p.tgl_observasi || '-') + '</div>' +
            '</div>' +
            '<button class="btn btn-outline btn-sm" onclick="window.PORTAL_APP.openSupervisiKlinisModal(\'' + p.id + '\')" style="font-size: 0.725rem; white-space: nowrap;">' +
            (p.status === 'Pasca-observasi' ? '💡 Isi RTL' : '🔍 Nilai KBM') +
            '</button>' +
            '</div>';
        });
        urgentEl.innerHTML = uHtml;
      }
    }
  }

  function renderPredBar(label, count, total, color) {
    const pct = Math.round((count / total) * 100);
    return '<div>' +
      '<div style="display: flex; justify-content: space-between; font-size: 0.775rem; color: #334155; margin-bottom: 3px;">' +
      '<span>' + label + '</span>' +
      '<strong>' + count + ' Guru (' + pct + '%)</strong>' +
      '</div>' +
      '<div style="background: #F1F5F9; border-radius: 999px; height: 7px; width: 100%; overflow: hidden;">' +
      '<div style="background: ' + color + '; height: 100%; width: ' + pct + '%; border-radius: 999px;"></div>' +
      '</div>' +
      '</div>';
  }

  // 10.6.2 SUBTAB 2: DAFTAR SESI SUPERVISI GURU (90 GURU) - BEBAS GESER
  function setSupSesiViewMode(mode) {
    State.supSesiViewMode = mode;
    const btnCard = document.getElementById('btn-sup-sesi-card');
    const btnTable = document.getElementById('btn-sup-sesi-table');
    if (btnCard) btnCard.classList.toggle('active', mode === 'card');
    if (btnTable) btnTable.classList.toggle('active', mode === 'table');

    const cardCont = document.getElementById('sup-sesi-cards-container');
    const tableCont = document.getElementById('sup-sesi-table-container');
    if (cardCont) cardCont.style.display = (mode === 'card') ? 'flex' : 'none';
    if (tableCont) tableCont.style.display = (mode === 'table') ? 'block' : 'none';
  }

  function renderSupervisiSesi() {
    const tbody = document.getElementById('sup-sesi-tbody');
    const cardsCont = document.getElementById('sup-sesi-cards-container');
    const countEl = document.getElementById('sup-count-filtered');
    if (!tbody && !cardsCont) return;

    const sessions = StorageManager.get('supervisi_sesi');
    const q = (State.supervisiSearchQuery || '').toLowerCase();
    const dept = State.supervisiDeptFilter || 'all';
    const status = State.supervisiStatusFilter || 'all';
    const sup = (State.supervisiSupervisorFilter || 'all').toLowerCase();

    const filtered = sessions.filter(function (s) {
      const matchQ = !q ||
        (s.teacher_name && s.teacher_name.toLowerCase().includes(q)) ||
        (s.nip && s.nip.includes(q)) ||
        (s.subject && s.subject.toLowerCase().includes(q)) ||
        (s.supervisor_name && s.supervisor_name.toLowerCase().includes(q));

      const matchDept = dept === 'all' || (s.department || '').toUpperCase().includes(dept.toUpperCase());
      const matchStatus = status === 'all' || s.status === status;
      const matchSup = sup === 'all' || (s.supervisor_name && s.supervisor_name.toLowerCase().includes(sup));

      return matchQ && matchDept && matchStatus && matchSup;
    });

    if (countEl) countEl.textContent = filtered.length;

    if (filtered.length === 0) {
      if (tbody) {
        tbody.innerHTML = '<tr><td colspan="8" style="text-align: center; padding: 2.5rem; color: #888;">' +
          '<strong>Tidak ada sesi supervisi yang sesuai filter</strong>' +
          '<p style="font-size: 0.8125rem; color: #999; margin-top: 4px;">Ubah filter atau gunakan tombol "Jadwalkan Sesi Supervisi" di kanan atas.</p>' +
          '</td></tr>';
      }
      if (cardsCont) {
        cardsCont.innerHTML = '<div style="text-align: center; padding: 3rem 1.5rem; background: #FFFFFF; border-radius: 16px; border: 1.5px dashed #CBD5E1; color: #64748B;">' +
          '<div style="font-size: 2.2rem; margin-bottom: 0.5rem;">🔍</div>' +
          '<h4 style="font-weight: 700; color: #1E293B; margin-bottom: 4px;">Tidak Ada Sesi Supervisi yang Sesuai</h4>' +
          '<p style="font-size: 0.8125rem; color: #94A3B8; margin: 0;">Ubah filter atau gunakan tombol "Jadwalkan Sesi Supervisi" di kanan atas.</p>' +
          '</div>';
      }
      return;
    }

    let tableHtml = '';
    let cardsHtml = '';

    filtered.forEach(function (s, idx) {
      let statusBadge = '<span class="badge badge-neutral" style="font-size: 0.75rem;">📅 Dijadwalkan</span>';
      if (s.status === 'Selesai') {
        statusBadge = '<span class="badge badge-success" style="font-size: 0.75rem;">✅ Selesai</span>';
      } else if (s.status === 'Pasca-observasi') {
        statusBadge = '<span class="badge badge-warning" style="font-size: 0.75rem;">💡 Pasca-obs</span>';
      } else if (s.status === 'Observasi') {
        statusBadge = '<span class="badge badge-warning" style="font-size: 0.75rem;">🔍 Observasi</span>';
      } else if (s.status === 'Pra-observasi') {
        statusBadge = '<span class="badge badge-primary" style="font-size: 0.75rem;">📝 Pra-obs</span>';
      }

      let nilaiCol = '<span style="color: #94A3B8; font-size: 0.75rem;">-</span>';
      let scorePill = '';
      if (s.nilai_akhir > 0) {
        let predColor = s.predikat === 'Amat Baik' ? '#047857' : s.predikat === 'Baik' ? '#1D4ED8' : '#B45309';
        let predBg = s.predikat === 'Amat Baik' ? '#D1FAE5' : s.predikat === 'Baik' ? '#DBEAFE' : '#FEF3C7';
        nilaiCol = '<div style="font-weight: 800; font-size: 0.875rem; color: #0F172A;">' + s.nilai_akhir.toFixed(1) + '</div>' +
          '<div style="font-size: 0.725rem; font-weight: 700; color: ' + predColor + ';">' + s.predikat + '</div>';
        scorePill = '<span class="badge" style="background: ' + predBg + '; color: ' + predColor + '; font-weight: 800; font-size: 0.75rem;">Nilai: ' + s.nilai_akhir.toFixed(1) + ' (' + s.predikat + ')</span>';
      }

      // 1. Table row
      tableHtml += '<tr>' +
        '<td style="text-align: center; color: #888; font-size: 0.8125rem;">' + (idx + 1) + '</td>' +
        '<td>' +
        '<div style="font-weight: 700; color: #0F172A;">' + s.teacher_name + '</div>' +
        '<div style="font-size: 0.725rem; color: #64748B; font-family: monospace;">NIP. ' + (s.nip || '-') + '</div>' +
        '</td>' +
        '<td>' +
        '<div><span class="badge badge-neutral" style="font-size: 0.725rem;">' + s.department + '</span></div>' +
        '<div style="font-size: 0.75rem; color: #475569; margin-top: 2px;">' + s.subject + '</div>' +
        '</td>' +
        '<td>' +
        '<div style="font-weight: 600; font-size: 0.8125rem; color: #1E293B;">' + s.supervisor_name + '</div>' +
        '<div style="font-size: 0.7rem; color: #64748B;">' + (s.supervisor_role || 'Kajur') + '</div>' +
        '</td>' +
        '<td>' +
        '<div style="font-weight: 600; font-size: 0.8125rem; color: #0F172A;">' + (s.tgl_observasi || '-') + '</div>' +
        '<div style="font-size: 0.7rem; color: #64748B;">' + (s.wkt_observasi || '08.00 WITA') + ' • ' + (s.class_name || 'Kelas') + '</div>' +
        '</td>' +
        '<td>' + statusBadge + '</td>' +
        '<td style="text-align: center;">' + nilaiCol + '</td>' +
        '<td style="text-align: center;">' +
        '<div style="display: flex; gap: 4px; justify-content: center;">' +
        '<button class="btn btn-primary btn-sm" onclick="window.PORTAL_APP.openSupervisiKlinisModal(\'' + s.id + '\')" title="Buka Siklus Supervisi Klinis" style="font-size: 0.75rem; padding: 0.28rem 0.6rem; font-weight: 700;">' +
        '🔍 Buka Sesi' +
        '</button>' +
        '<button class="btn btn-outline btn-sm" onclick="window.PORTAL_APP.printSupervisiReport(\'' + s.id + '\')" title="Cetak Lembar Laporan Supervisi (PDF)" style="font-size: 0.75rem; padding: 0.28rem 0.5rem;">' +
        '🖨️' +
        '</button>' +
        '</div>' +
        '</td>' +
        '</tr>';

      // 2. Responsive Card (Bebas Geser)
      cardsHtml += '<div class="sup-sesi-card" id="sup-sesi-card-' + s.id + '">' +
        '  <div class="sup-sesi-card-top">' +
        '    <div>' +
        '      <h4 class="sup-sesi-title">' + s.teacher_name + '</h4>' +
        '      <div style="font-size: 0.75rem; color: #64748B; font-family: monospace;">NIP. ' + (s.nip || '-') + '</div>' +
        '    </div>' +
        '    <div style="display: flex; align-items: center; gap: 6px; flex-wrap: wrap;">' +
        statusBadge +
        scorePill +
        '    </div>' +
        '  </div>' +
        '  <div class="sup-sesi-card-body">' +
        '    <div class="sup-sesi-meta-item"><span>Jurusan & Mapel:</span> <strong>' + s.department + ' • ' + s.subject + '</strong></div>' +
        '    <div class="sup-sesi-meta-item"><span>Supervisor:</span> <strong>' + s.supervisor_name + ' (' + (s.supervisor_role || 'Kajur') + ')</strong></div>' +
        '    <div class="sup-sesi-meta-item"><span>Waktu Observasi:</span> <strong>📅 ' + (s.tgl_observasi || '-') + ' • ' + (s.wkt_observasi || '08.00 WITA') + ' (' + (s.class_name || 'Kelas') + ')</strong></div>' +
        '  </div>' +
        '  <div class="sup-sesi-card-actions">' +
        '    <button type="button" class="btn btn-primary btn-sm" onclick="window.PORTAL_APP.openSupervisiKlinisModal(\'' + s.id + '\')" style="flex: 1; font-weight: 700; padding: 0.45rem 0.75rem;">' +
        '      🔍 Buka Siklus Sesi' +
        '    </button>' +
        '    <button type="button" class="btn btn-outline btn-sm" onclick="window.PORTAL_APP.printSupervisiReport(\'' + s.id + '\')" title="Cetak Raport PDF" style="padding: 0.45rem 0.75rem;">' +
        '      🖨️ Cetak' +
        '    </button>' +
        '  </div>' +
        '</div>';
    });

    if (tbody) tbody.innerHTML = tableHtml;
    if (cardsCont) cardsCont.innerHTML = cardsHtml;

    setSupSesiViewMode(State.supSesiViewMode || 'card');
  }

  // 10.6.3 SUBTAB 3: SUPERVISI MANAJERIAL WAKA & KAJUR (INSTRUMEN E) - BEBAS GESER
  function renderSupervisiManajerial() {
    const tbody = document.getElementById('sup-manajerial-tbody');
    const cardsCont = document.getElementById('sup-manajerial-cards-container');
    if (!tbody && !cardsCont) return;

    const list = StorageManager.get('supervisi_manajerial');
    let tableHtml = '';
    let cardsHtml = '';

    list.forEach(function (m, idx) {
      let predBadge = '<span class="predikat-baik" style="font-size: 0.75rem;">' + m.predikat + '</span>';
      if (m.predikat === 'Amat Baik') predBadge = '<span class="predikat-amat-baik" style="font-size: 0.75rem;">' + m.predikat + '</span>';

      // 1. Table row
      tableHtml += '<tr>' +
        '<td style="text-align: center; color: #888; font-size: 0.8125rem;">' + (idx + 1) + '</td>' +
        '<td>' +
        '<div style="font-weight: 700; color: #0F172A;">' + m.pimpinan_name + '</div>' +
        '<div style="font-size: 0.725rem; color: #64748B; font-family: monospace;">NIP. ' + (m.nip || '-') + '</div>' +
        '</td>' +
        '<td>' +
        '<span class="badge badge-primary" style="font-size: 0.75rem;">' + m.jabatan + '</span>' +
        '</td>' +
        '<td>' +
        '<div style="font-size: 0.775rem; color: #334155; line-height: 1.4;">' + m.fokus + '</div>' +
        '</td>' +
        '<td>' +
        '<span class="badge badge-success" style="font-size: 0.725rem;">' + m.status_dokumen + '</span>' +
        '</td>' +
        '<td style="text-align: center;">' +
        '<div style="font-weight: 800; font-size: 0.95rem; color: #0F172A;">' + m.skor_total + ' / 60</div>' +
        '<div style="font-size: 0.725rem; color: #64748B;">Nilai: ' + m.nilai.toFixed(1) + '</div>' +
        '</td>' +
        '<td style="text-align: center;">' + predBadge + '</td>' +
        '<td style="text-align: center;">' +
        '<button class="btn btn-outline btn-sm" onclick="window.PORTAL_APP.openSupervisiManajerialModal(\'' + m.id + '\')" style="font-size: 0.75rem; font-weight: 700;">' +
        '📝 Evaluasi' +
        '</button>' +
        '</td>' +
        '</tr>';

      // 2. Responsive Card
      cardsHtml += '<div class="sup-manajerial-card" id="sup-manajerial-card-' + m.id + '">' +
        '  <div class="sup-card-top">' +
        '    <div>' +
        '      <span class="badge badge-primary" style="font-size: 0.725rem;">' + m.jabatan + '</span>' +
        '      <h4 class="sup-card-title" style="margin-top: 4px;">' + m.pimpinan_name + '</h4>' +
        '      <span class="font-mono" style="font-size: 0.725rem; color: #64748B;">NIP. ' + (m.nip || '-') + '</span>' +
        '    </div>' +
        '    <div>' + predBadge + '</div>' +
        '  </div>' +
        '  <div class="sup-card-body">' +
        '    <p style="font-size: 0.8125rem; color: #334155; margin-bottom: 0.75rem; line-height: 1.4;">' + m.fokus + '</p>' +
        '    <div style="display: flex; justify-content: space-between; align-items: center; background: #F8FAFC; border-radius: 8px; padding: 8px 12px; margin-bottom: 0.75rem;">' +
        '      <div>' +
        '        <span style="font-size: 0.725rem; color: #64748B;">Skor Total</span>' +
        '        <div style="font-weight: 800; font-size: 0.95rem; color: #0F172A;">' + m.skor_total + ' / 60</div>' +
        '      </div>' +
        '      <div style="text-align: right;">' +
        '        <span style="font-size: 0.725rem; color: #64748B;">Nilai Akhir</span>' +
        '        <div style="font-weight: 800; font-size: 0.95rem; color: #2563EB;">' + m.nilai.toFixed(1) + '</div>' +
        '      </div>' +
        '      <span class="badge badge-success" style="font-size: 0.725rem;">' + m.status_dokumen + '</span>' +
        '    </div>' +
        '  </div>' +
        '  <div class="sup-card-footer">' +
        '    <button type="button" class="btn btn-outline btn-sm" onclick="window.PORTAL_APP.openSupervisiManajerialModal(\'' + m.id + '\')" style="width: 100%; font-weight: 700;">' +
        '      📝 Buka Instrumen Evaluasi Manajerial' +
        '    </button>' +
        '  </div>' +
        '</div>';
    });

    if (tbody) tbody.innerHTML = tableHtml;
    if (cardsCont) cardsCont.innerHTML = cardsHtml;
  }

  // 10.6.4 SUBTAB 4: PELACAK RENCANA TINDAK LANJUT (RTL) - BEBAS GESER
  function renderSupervisiRTL() {
    const tbody = document.getElementById('sup-rtl-tbody');
    const cardsCont = document.getElementById('sup-rtl-cards-container');
    const badgeEl = document.getElementById('sup-rtl-active-badge');
    if (!tbody && !cardsCont) return;

    const list = StorageManager.get('supervisi_rtl');
    const openCount = list.filter(function (r) { return r.status === 'Terbuka'; }).length;
    if (badgeEl) badgeEl.textContent = openCount + ' Tindakan Aktif';

    if (list.length === 0) {
      if (tbody) tbody.innerHTML = '<tr><td colspan="9" style="text-align: center; padding: 2rem; color: #888;">Belum ada rencana tindak lanjut tercatat.</td></tr>';
      if (cardsCont) {
        cardsCont.innerHTML = '<div style="grid-column: 1 / -1; text-align: center; padding: 3rem 1.5rem; background: #FFFFFF; border-radius: 16px; border: 1.5px dashed #CBD5E1; color: #64748B;">' +
          '<div style="font-size: 2.2rem; margin-bottom: 0.5rem;">📋</div>' +
          '<h4 style="font-weight: 700; color: #1E293B; margin-bottom: 4px;">Belum Ada Rencana Tindak Lanjut</h4>' +
          '<p style="font-size: 0.8125rem; color: #94A3B8; margin: 0;">Selesaikan observasi KBM untuk merumuskan RTL bagi guru.</p>' +
          '</div>';
      }
      return;
    }

    let tableHtml = '';
    let cardsHtml = '';

    list.forEach(function (r, idx) {
      let isVerified = r.status === 'Terverifikasi';
      let statusBadge = isVerified ?
        '<span class="badge badge-success" style="font-size: 0.75rem;">✓ Terverifikasi</span>' :
        '<span class="badge badge-warning" style="font-size: 0.75rem;">⏳ Terbuka</span>';

      // 1. Table row
      tableHtml += '<tr>' +
        '<td style="text-align: center; color: #888; font-size: 0.8125rem;">' + (idx + 1) + '</td>' +
        '<td><strong>' + r.guru_name + '</strong></td>' +
        '<td><span class="badge badge-neutral" style="font-size: 0.725rem;">' + r.department + '</span><div style="font-size: 0.725rem; color: #64748B;">' + r.subject + '</div></td>' +
        '<td style="max-width: 250px; font-size: 0.8rem; color: #1E293B;">' + r.tindakan + '</td>' +
        '<td style="font-size: 0.775rem; color: #475569;">' + r.pendampingan + '</td>' +
        '<td style="font-weight: 700; font-size: 0.775rem; color: #DC2626;">📅 ' + r.tenggat + '</td>' +
        '<td style="font-size: 0.775rem; color: #047857;">📄 ' + r.bukti + '</td>' +
        '<td style="text-align: center;">' + statusBadge + '</td>' +
        '<td style="text-align: center;">' +
        (isVerified ?
          '<span style="font-size: 0.725rem; color: #059669; font-weight: 700;">Selesai</span>' :
          '<button class="btn btn-outline btn-sm" onclick="window.PORTAL_APP.verifyRtlItem(\'' + r.id + '\')" style="font-size: 0.75rem; color: #059669; border-color: #A7F3D0;">' +
          '✅ Verifikasi' +
          '</button>') +
        '</td>' +
        '</tr>';

      // 2. Responsive Card
      cardsHtml += '<div class="sup-rtl-card" id="sup-rtl-card-' + r.id + '">' +
        '  <div class="sup-card-top">' +
        '    <div>' +
        '      <h4 class="sup-card-title">' + r.guru_name + '</h4>' +
        '      <div style="font-size: 0.75rem; color: #64748B;">' + r.department + ' • ' + r.subject + '</div>' +
        '    </div>' +
        '    <div>' + statusBadge + '</div>' +
        '  </div>' +
        '  <div class="sup-card-body">' +
        '    <div style="font-size: 0.825rem; font-weight: 600; color: #1E293B; margin-bottom: 0.5rem;">' + r.tindakan + '</div>' +
        '    <div class="sup-sesi-meta-item"><span>Pendampingan:</span> <strong>' + r.pendampingan + '</strong></div>' +
        '    <div class="sup-sesi-meta-item"><span>Tenggat Waktu:</span> <strong style="color: #DC2626;">📅 ' + r.tenggat + '</strong></div>' +
        '    <div class="sup-sesi-meta-item"><span>Bukti Fisik:</span> <strong style="color: #047857;">📄 ' + r.bukti + '</strong></div>' +
        '  </div>' +
        '  <div class="sup-card-footer">' +
        (isVerified ?
          '<div style="text-align: center; color: #059669; font-weight: 700; font-size: 0.8125rem; padding: 6px;">✓ Tindakan Telah Diverifikasi</div>' :
          '<button type="button" class="btn btn-outline btn-sm" onclick="window.PORTAL_APP.verifyRtlItem(\'' + r.id + '\')" style="width: 100%; color: #059669; border-color: #A7F3D0; font-weight: 700;">' +
          '  ✅ Verifikasi Ketercapaian RTL' +
          '</button>') +
        '  </div>' +
        '</div>';
    });

    if (tbody) tbody.innerHTML = tableHtml;
    if (cardsCont) cardsCont.innerHTML = cardsHtml;
  }

  // 10.6.5 SUBTAB 6: REKAPITULASI LAPORAN JURUSAN - BEBAS GESER
  function renderSupervisiRekapLaporan() {
    const tbody = document.getElementById('sup-rekap-jurusan-tbody');
    const cardsCont = document.getElementById('sup-rekap-cards-container');
    if (!tbody && !cardsCont) return;

    const sessions = StorageManager.get('supervisi_sesi');
    const jurusans = [
      { code: 'TJKT', name: 'Teknik Jaringan Komputer & Telekomunikasi', kajur: 'Muhammad Ihsan, S.Kom' },
      { code: 'DKV', name: 'Desain Komunikasi Visual', kajur: 'Hendra Surya Pratama, S.Kom' },
      { code: 'AKL', name: 'Akuntansi & Keuangan Lembaga', kajur: 'Oky Wulan Maulina, S.Pd' },
      { code: 'MPLB', name: 'Manajemen Perkantoran & Layanan Bisnis', kajur: 'Akhmad Hanafi Maulana, S.E' },
      { code: 'Pemasaran', name: 'Pemasaran / Bisnis Daring', kajur: 'Futri Indri Septiani, S.Pd' },
      { code: 'Umum', name: 'Muatan Umum & Pilihan', kajur: 'Rusnani, S.Pd., M.T (Waka)' }
    ];

    let tableHtml = '';
    let cardsHtml = '';

    jurusans.forEach(function (j, idx) {
      const deptSessions = sessions.filter(function (s) {
        const d = (s.department || '').toUpperCase();
        if (j.code === 'Pemasaran') return d.includes('PEMASARAN') || d.includes('PM');
        return d.includes(j.code.toUpperCase());
      });

      const total = deptSessions.length;
      const selesai = deptSessions.filter(function (s) { return s.status === 'Selesai'; }).length;
      const scored = deptSessions.filter(function (s) { return s.status === 'Selesai' && s.nilai_akhir > 0; });

      var avgB = 0;
      var avgC = 0;
      var avgFinal = 0;
      if (scored.length > 0) {
        avgB = scored.reduce(function (a, b) { return a + Number(b.nilai_b || 0); }, 0) / scored.length;
        avgC = scored.reduce(function (a, b) { return a + Number(b.nilai_c || 0); }, 0) / scored.length;
        avgFinal = scored.reduce(function (a, b) { return a + Number(b.nilai_akhir || 0); }, 0) / scored.length;
      }

      let predikat = 'Baik';
      let predBadge = 'badge-primary';
      if (avgFinal >= 91) { predikat = 'Amat Baik'; predBadge = 'badge-success'; }
      else if (avgFinal >= 76) { predikat = 'Baik'; predBadge = 'badge-primary'; }
      else if (avgFinal >= 61) { predikat = 'Cukup'; predBadge = 'badge-warning'; }
      else if (avgFinal > 0) { predikat = 'Kurang'; predBadge = 'badge-danger'; }

      const pct = total > 0 ? Math.round((selesai / total) * 100) : 0;

      // 1. Table row
      tableHtml += '<tr>' +
        '<td style="text-align: center; color: #888;">' + (idx + 1) + '</td>' +
        '<td><strong>' + j.name + ' (' + j.code + ')</strong></td>' +
        '<td>' + j.kajur + '</td>' +
        '<td style="text-align: center;">' + total + ' Guru</td>' +
        '<td style="text-align: center; font-weight: 700; color: #047857;">' + selesai + ' Guru (' + pct + '%)</td>' +
        '<td style="text-align: center;">' + (avgB > 0 ? avgB.toFixed(1) : '-') + '</td>' +
        '<td style="text-align: center;">' + (avgC > 0 ? avgC.toFixed(1) : '-') + '</td>' +
        '<td style="text-align: center; font-weight: 800; font-size: 0.95rem; color: #1E3A8A;">' + (avgFinal > 0 ? avgFinal.toFixed(1) : '-') + '</td>' +
        '<td style="text-align: center;"><span class="badge ' + predBadge + '">' + (avgFinal > 0 ? predikat : 'Sedang Berjalan') + '</span></td>' +
        '</tr>';

      // 2. Responsive Card
      cardsHtml += '<div class="sup-rekap-card" id="sup-rekap-card-' + j.code + '">' +
        '  <div class="sup-card-top">' +
        '    <div>' +
        '      <span class="badge badge-primary" style="font-weight: 800; font-size: 0.725rem;">' + j.code + '</span>' +
        '      <h4 class="sup-card-title" style="margin-top: 4px;">' + j.name + '</h4>' +
        '      <div style="font-size: 0.75rem; color: #64748B;">Kajur: ' + j.kajur + '</div>' +
        '    </div>' +
        '    <span class="badge ' + predBadge + '" style="font-size: 0.725rem;">' + (avgFinal > 0 ? avgFinal.toFixed(1) + ' • ' + predikat : 'Proses') + '</span>' +
        '  </div>' +
        '  <div class="sup-card-body">' +
        '    <div style="margin-bottom: 0.75rem;">' +
        '      <div style="display: flex; justify-content: space-between; font-size: 0.75rem; color: #475569; margin-bottom: 4px;">' +
        '        <span>Progres Supervisi:</span>' +
        '        <strong>' + selesai + ' / ' + total + ' Guru (' + pct + '%)</strong>' +
        '      </div>' +
        '      <div style="background: #E2E8F0; border-radius: 999px; height: 6px; width: 100%; overflow: hidden;">' +
        '        <div style="background: ' + (pct >= 80 ? '#10B981' : pct >= 40 ? '#3B82F6' : '#F59E0B') + '; height: 100%; width: ' + pct + '%; border-radius: 999px;"></div>' +
        '      </div>' +
        '    </div>' +
        '    <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 6px; background: #F8FAFC; border-radius: 8px; padding: 8px; text-align: center;">' +
        '      <div>' +
        '        <span style="font-size: 0.7rem; color: #64748B;">Telaah B</span>' +
        '        <div style="font-weight: 700; font-size: 0.875rem; color: #1E293B;">' + (avgB > 0 ? avgB.toFixed(1) : '-') + '</div>' +
        '      </div>' +
        '      <div>' +
        '        <span style="font-size: 0.7rem; color: #64748B;">Observasi C</span>' +
        '        <div style="font-weight: 700; font-size: 0.875rem; color: #1E293B;">' + (avgC > 0 ? avgC.toFixed(1) : '-') + '</div>' +
        '      </div>' +
        '      <div>' +
        '        <span style="font-size: 0.7rem; color: #64748B;">Nilai Akhir</span>' +
        '        <div style="font-weight: 800; font-size: 0.875rem; color: #2563EB;">' + (avgFinal > 0 ? avgFinal.toFixed(1) : '-') + '</div>' +
        '      </div>' +
        '    </div>' +
        '  </div>' +
        '</div>';
    });

    if (tbody) tbody.innerHTML = tableHtml;
    if (cardsCont) cardsCont.innerHTML = cardsHtml;
  }

  // 10.6.6 MODAL SIKLUS SUPERVISI KLINIS (TAHAP 1 - 2 - 3)
  function openSupervisiKlinisModal(identifier) {
    const sessions = StorageManager.get('supervisi_sesi');
    let session = sessions.find(function (s) {
      return String(s.id) === String(identifier) || String(s.teacher_id) === String(identifier);
    });

    if (!session) {
      // Find teacher
      const teachers = StorageManager.get('teachers');
      const teacher = teachers.find(function (t) { return String(t.id) === String(identifier); });
      if (!teacher) {
        showToast('Data guru tidak ditemukan.', 'danger');
        return;
      }
      // Create session
      session = {
        id: 'SESI-' + Date.now().toString().slice(-4),
        program_id: 'PROG-2026-GANJIL',
        teacher_id: teacher.id,
        teacher_name: teacher.name,
        nip: teacher.nip || '-',
        department: teacher.department || 'Umum',
        subject: teacher.subject || 'Mata Pelajaran',
        class_name: 'XI ' + (teacher.department || 'TJKT') + ' 1',
        supervisor_id: 'T-001',
        supervisor_name: 'Rusnani, S.Pd., M.T',
        supervisor_role: 'Waka Kurikulum',
        status: 'Pra-observasi',
        tgl_observasi: new Date().toISOString().split('T')[0],
        wkt_observasi: '08.00 - 09.30 WITA',
        room: 'Lab / Ruang KBM',
        fokus: 'Pembelajaran Berdiferensiasi & K3',
        skor_b: 0,
        skor_c: 0,
        nilai_b: 0,
        nilai_c: 0,
        nilai_akhir: 0,
        predikat: '-',
        wawancara_a: {},
        refleksi_d: {}
      };
      StorageManager.add('supervisi_sesi', session);
    }

    State.activeSupervisiSesiId = session.id;
    State.activeSupervisiGuruId = session.teacher_id;
    State.currentSupervisiScores.b = Object.assign({}, session.b_scores || {});
    State.currentSupervisiScores.c = Object.assign({}, session.c_scores || {});

    // Teacher Banner
    document.getElementById('sup-modal-sesi-id').value = session.id;
    document.getElementById('sup-modal-guru-name').textContent = session.teacher_name;
    document.getElementById('sup-modal-guru-dept').textContent = session.department || 'Umum';
    document.getElementById('sup-modal-guru-meta').textContent = 'NIP. ' + (session.nip || '-') + ' • Mapel: ' + (session.subject || '-') + ' • Pengawas: ' + (session.supervisor_name || 'Rusnani');

    const statusBadge = document.getElementById('sup-modal-status-badge');
    if (statusBadge) {
      statusBadge.textContent = session.status || 'Pra-observasi';
      statusBadge.className = session.status === 'Selesai' ? 'badge badge-success' : 'badge badge-warning';
    }

    // Live Perangkat SIMKUR check
    const teacherDocs = StorageManager.get('guru_documents').filter(function (d) {
      return String(d.teacher_id) === String(session.teacher_id);
    });
    const docPills = document.getElementById('sup-modal-doc-pills');
    if (docPills) {
      const rppCount = teacherDocs.filter(function (d) { return d.category === 'Modul Ajar'; }).length;
      const silabusCount = teacherDocs.filter(function (d) { return d.category === 'Silabus & ATP'; }).length;
      const asesmenCount = teacherDocs.filter(function (d) { return d.category === 'Instrumen Asesmen'; }).length;

      docPills.innerHTML = '' +
        '<span class="badge ' + (rppCount > 0 ? 'badge-success' : 'badge-danger') + '">Modul (' + rppCount + ')</span>' +
        '<span class="badge ' + (silabusCount > 0 ? 'badge-success' : 'badge-danger') + '">Silabus (' + silabusCount + ')</span>' +
        '<span class="badge ' + (asesmenCount > 0 ? 'badge-success' : 'badge-danger') + '">Asesmen (' + asesmenCount + ')</span>';
    }

    // Populate Instrumen A
    const formA = document.getElementById('sup-form-instrumen-a');
    if (formA) {
      const answersA = session.wawancara_a || {};
      let aHtml = '';
      SUPERVISI_INSTRUMEN.A.forEach(function (q) {
        const val = answersA[q.no] || '';
        aHtml += '<div class="sup-question-card" style="background: #FFFFFF; border: 1.5px solid #E2E8F0; border-radius: 12px; padding: 1.125rem; display: flex; flex-direction: column; gap: 10px; box-shadow: 0 1px 3px rgba(15,23,42,0.03);">' +
          '<div style="display: flex; align-items: flex-start; gap: 12px;">' +
          '<span style="width: 28px; height: 28px; border-radius: 8px; background: #EDE7FF; color: #4B22B8; font-weight: 800; font-size: 0.8125rem; display: flex; align-items: center; justify-content: center; flex-shrink: 0; margin-top: 1px;">' +
          q.no +
          '</span>' +
          '<label class="form-label" style="display: block; font-size: 0.875rem; font-weight: 700; color: #0F172A; line-height: 1.45; margin: 0; flex: 1;">' +
          q.q +
          '</label>' +
          '</div>' +
          '<textarea class="form-input sup-ans-a" data-no="' + q.no + '" rows="3" placeholder="Tuliskan catatan jawaban atau kesepakatan wawancara pra-observasi..." style="width: 100% !important; box-sizing: border-box !important; background: #F8FAFC !important; border: 1.5px solid #CBD5E1 !important; border-radius: 10px !important; padding: 10px 14px !important; font-size: 0.875rem !important; color: #0F172A !important; line-height: 1.5 !important; resize: vertical !important; min-height: 85px !important; outline: none; font-family: inherit;">' + val + '</textarea>' +
          '</div>';
      });
      formA.innerHTML = aHtml;
    }

    // Populate Instrumen B Table
    renderRubrikTable('B', 'sup-form-instrumen-b', session.b_scores || {}, session.b_notes || {});

    // Populate Instrumen C Table
    renderRubrikTable('C', 'sup-form-instrumen-c', session.c_scores || {}, session.c_notes || {});

    // Populate Jurnal KBM Context Box
    const teacherJournals = StorageManager.get('guru_journals').filter(function (j) {
      return String(j.teacher_id) === String(session.teacher_id);
    });
    const kbmSummary = document.getElementById('sup-modal-kbm-summary');
    if (kbmSummary) {
      kbmSummary.textContent = teacherJournals.length > 0 ?
        'Guru telah mengisi ' + teacherJournals.length + ' sesi jurnal mengajar pada semester berjalan. Presensi kelas sinkron.' :
        'Guru belum mencatat sesi jurnal KBM pada portal guru.';
    }

    // Populate Instrumen D (Refleksi, Kekuatan, Area, RTL)
    const refD = session.refleksi_d || {};
    const ref1El = document.getElementById('sup-d-refleksi-1');
    if (ref1El) ref1El.value = refD.refleksi_1 || '';
    const ref2El = document.getElementById('sup-d-refleksi-2');
    if (ref2El) ref2El.value = refD.refleksi_2 || '';
    const kekEl = document.getElementById('sup-d-kekuatan');
    if (kekEl) kekEl.value = refD.kekuatan || '';
    const areaEl = document.getElementById('sup-d-area');
    if (areaEl) areaEl.value = refD.area_pengembangan || '';
    const guruConf = document.getElementById('sup-d-guru-confirm');
    if (guruConf) guruConf.checked = refD.guru_confirmed === true;

    // Populate RTL table
    const rtlTbody = document.getElementById('sup-d-rtl-tbody');
    if (rtlTbody) {
      rtlTbody.innerHTML = '';
      const existingRtl = (session.rtl_items && session.rtl_items.length > 0) ? session.rtl_items : [
        {
          tindakan: 'Penyesuaian diferensiasi modul ajar & rubric praktikum.',
          pendampingan: 'Diskusi Sejawat',
          tenggat: '2026-10-25',
          status: 'Terbuka'
        }
      ];
      existingRtl.forEach(function (item) {
        addSupervisiRtlRow(item);
      });
    }

    // Reset to Step 1 & Open Modal
    switchSupervisiKlinisStep(1);
    openModal('modal-supervisi-klinis');
  }

  function renderRubrikTable(instrumentCode, tbodyId, scores, notes) {
    const tbody = document.getElementById(tbodyId);
    if (!tbody) return;

    scores = scores || {};
    notes = notes || {};
    const items = SUPERVISI_INSTRUMEN[instrumentCode];
    let html = '';
    let currentSection = '';

    items.forEach(function (item) {
      if (item.section && item.section !== currentSection) {
        currentSection = item.section;
        html += '<tr class="rubrik-section-header"><td colspan="4">' + currentSection + '</td></tr>';
      }

      const currentScore = scores[item.no] !== undefined ? Number(scores[item.no]) : null;
      const currentNote = notes[item.no] || '';

      let buttonsHtml = '<div class="score-btn-group">';
      [1, 2, 3, 4].forEach(function (val) {
        const isSelected = currentScore === val;
        const selClass = isSelected ? ' selected-' + val : '';
        buttonsHtml += '<button type="button" class="score-radio-btn' + selClass + '" ' +
          'data-inst="' + instrumentCode + '" data-no="' + item.no + '" data-score="' + val + '" ' +
          'onclick="window.PORTAL_APP.setRubrikScore(\'' + instrumentCode + '\', ' + item.no + ', ' + val + ')">' +
          val +
          '</button>';
      });
      buttonsHtml += '</div>';

      html += '<tr>' +
        '<td style="text-align: center; font-weight: 700; color: #64748B;">' + item.no + '</td>' +
        '<td style="color: #1E293B; font-size: 0.8125rem;">' + item.text + '</td>' +
        '<td style="text-align: center;">' + buttonsHtml + '</td>' +
        '<td><input type="text" class="form-input rubrik-note-input" data-inst="' + instrumentCode + '" data-no="' + item.no + '" placeholder="Catatan bukti / fakta..." value="' + currentNote + '" style="font-size: 0.775rem; padding: 4px 8px;"></td>' +
        '</tr>';
    });

    tbody.innerHTML = html;
    updateLiveRubrikHeader(instrumentCode);
  }

  function setRubrikScore(instrumentCode, butirNo, score) {
    if (!State.currentSupervisiScores[instrumentCode.toLowerCase()]) {
      State.currentSupervisiScores[instrumentCode.toLowerCase()] = {};
    }
    State.currentSupervisiScores[instrumentCode.toLowerCase()][butirNo] = score;

    // Update buttons in DOM
    const btns = document.querySelectorAll('.score-radio-btn[data-inst="' + instrumentCode + '"][data-no="' + butirNo + '"]');
    btns.forEach(function (b) {
      b.className = 'score-radio-btn';
      if (Number(b.getAttribute('data-score')) === score) {
        b.classList.add('selected-' + score);
      }
    });

    updateLiveRubrikHeader(instrumentCode);
  }

  function updateLiveRubrikHeader(instrumentCode) {
    const scores = State.currentSupervisiScores[instrumentCode.toLowerCase()] || {};
    if (instrumentCode === 'B') {
      const calc = calculateSupervisiScores(scores, {});
      const liveB = document.getElementById('sup-b-score-live');
      if (liveB) liveB.textContent = calc.totalB + ' / 56 (Nilai: ' + calc.nilaiB.toFixed(1) + ')';
    } else if (instrumentCode === 'C') {
      const calc = calculateSupervisiScores({}, scores);
      const liveC = document.getElementById('sup-c-score-live');
      if (liveC) liveC.textContent = calc.totalC + ' / 72 (Nilai: ' + calc.nilaiC.toFixed(1) + ')';
    } else if (instrumentCode === 'E') {
      let total = 0;
      for (let k = 1; k <= 15; k++) {
        total += Number(scores[k] || 0);
      }
      const val = total > 0 ? (total / 60) * 100 : 0;
      const totalEl = document.getElementById('sup-man-score-total');
      if (totalEl) totalEl.textContent = total;
      const valEl = document.getElementById('sup-man-score-val');
      if (valEl) valEl.textContent = val.toFixed(1);
      const badgeEl = document.getElementById('sup-man-predikat-badge');
      if (badgeEl) {
        badgeEl.textContent = 'Predikat: ' + (val >= 91 ? 'Amat Baik' : val >= 76 ? 'Baik' : val >= 61 ? 'Cukup' : 'Kurang');
        badgeEl.className = val >= 91 ? 'predikat-amat-baik' : val >= 76 ? 'predikat-baik' : val >= 61 ? 'predikat-cukup' : 'predikat-kurang';
      }
    }
  }

  function switchSupervisiKlinisStep(step) {
    State.activeSupervisiStep = step;

    // Update buttons
    [1, 2, 3].forEach(function (s) {
      const btn = document.getElementById('sup-step-btn-' + s);
      const pane = document.getElementById('sup-step-content-' + s);
      if (btn) {
        if (s === step) btn.classList.add('active');
        else btn.classList.remove('active');
      }
      if (pane) pane.style.display = (s === step) ? 'block' : 'none';
    });

    // If step 3, recalculate final scores
    if (step === 3) {
      const calc = calculateSupervisiScores(State.currentSupervisiScores.b, State.currentSupervisiScores.c);
      const finalScoreEl = document.getElementById('sup-calc-final-score');
      if (finalScoreEl) finalScoreEl.textContent = calc.nilaiAkhir.toFixed(1);

      const bContribEl = document.getElementById('sup-calc-b-contrib');
      if (bContribEl) bContribEl.textContent = calc.nilaiB.toFixed(1) + ' (40% = ' + calc.contribB.toFixed(1) + ')';

      const cContribEl = document.getElementById('sup-calc-c-contrib');
      if (cContribEl) cContribEl.textContent = calc.nilaiC.toFixed(1) + ' (60% = ' + calc.contribC.toFixed(1) + ')';

      const predBadge = document.getElementById('sup-calc-predikat-badge');
      if (predBadge) {
        predBadge.textContent = 'Predikat: ' + calc.predikat;
        predBadge.className = calc.predikatClass;
      }

      const recText = document.getElementById('sup-calc-rekomendasi-text');
      if (recText) recText.textContent = calc.tindakLanjut;
    }

    // Update footer buttons
    const prevBtn = document.getElementById('sup-btn-prev');
    const nextBtn = document.getElementById('sup-btn-next');

    if (prevBtn) prevBtn.style.display = (step > 1) ? 'inline-flex' : 'none';
    if (nextBtn) {
      if (step === 1) nextBtn.textContent = 'Lanjut ke Observasi KBM ➡️';
      else if (step === 2) nextBtn.textContent = 'Lanjut ke Pasca-Observasi & RTL ➡️';
      else nextBtn.textContent = '✅ Selesaikan Supervisi (Final)';
    }
  }

  function prevSupervisiStep() {
    if (State.activeSupervisiStep > 1) {
      switchSupervisiKlinisStep(State.activeSupervisiStep - 1);
    }
  }

  function nextSupervisiStep() {
    if (State.activeSupervisiStep < 3) {
      saveSupervisiKlinis(false);
      switchSupervisiKlinisStep(State.activeSupervisiStep + 1);
    } else {
      saveSupervisiKlinis(true);
    }
  }

  function addSupervisiRtlRow(data) {
    const tbody = document.getElementById('sup-d-rtl-tbody');
    if (!tbody) return;

    data = data || { tindakan: '', pendampingan: 'Diskusi Sejawat', tenggat: '2026-10-30', status: 'Terbuka' };
    const row = document.createElement('tr');
    row.innerHTML = '' +
      '<td><input type="text" class="form-input rtl-tindakan" placeholder="Tindakan perbaikan konkret..." value="' + (data.tindakan || '') + '" style="font-size: 0.775rem;"></td>' +
      '<td><select class="form-input rtl-pendampingan" style="font-size: 0.775rem;">' +
      '<option value="Diskusi Teman Sejawat" ' + (data.pendampingan.includes('Sejawat') ? 'selected' : '') + '>Diskusi Teman Sejawat</option>' +
      '<option value="Pelatihan Mandiri PMM" ' + (data.pendampingan.includes('PMM') ? 'selected' : '') + '>Pelatihan Mandiri (PMM)</option>' +
      '<option value="Observasi Ulang Kajur" ' + (data.pendampingan.includes('Ulang') ? 'selected' : '') + '>Observasi Ulang Kajur</option>' +
      '<option value="Workshop Kurikulum" ' + (data.pendampingan.includes('Workshop') ? 'selected' : '') + '>Workshop Kurikulum</option>' +
      '</select></td>' +
      '<td><input type="date" class="form-input rtl-tenggat" value="' + (data.tenggat || '2026-10-30') + '" style="font-size: 0.775rem;"></td>' +
      '<td><select class="form-input rtl-status" style="font-size: 0.775rem;">' +
      '<option value="Terbuka" ' + (data.status === 'Terbuka' ? 'selected' : '') + '>⏳ Terbuka</option>' +
      '<option value="Terverifikasi" ' + (data.status === 'Terverifikasi' ? 'selected' : '') + '>✅ Terverifikasi</option>' +
      '</select></td>' +
      '<td style="text-align: center;"><button type="button" class="btn btn-ghost btn-sm" onclick="this.closest(\'tr\').remove()" style="color: #DC2626;">🗑️</button></td>';
    tbody.appendChild(row);
  }

  function saveSupervisiKlinis(isFinal) {
    const sesiId = State.activeSupervisiSesiId;
    if (!sesiId) return;

    // Collect answers A
    const wawancaraA = {};
    document.querySelectorAll('.sup-ans-a').forEach(function (ta) {
      wawancaraA[ta.getAttribute('data-no')] = ta.value;
    });

    // Collect notes B & C
    const bNotes = {};
    document.querySelectorAll('.rubrik-note-input[data-inst="B"]').forEach(function (inp) {
      bNotes[inp.getAttribute('data-no')] = inp.value;
    });

    const cNotes = {};
    document.querySelectorAll('.rubrik-note-input[data-inst="C"]').forEach(function (inp) {
      cNotes[inp.getAttribute('data-no')] = inp.value;
    });

    // Collect RTL
    const rtlItems = [];
    document.querySelectorAll('#sup-d-rtl-tbody tr').forEach(function (tr) {
      const tindakan = tr.querySelector('.rtl-tindakan') ? tr.querySelector('.rtl-tindakan').value : '';
      const pendampingan = tr.querySelector('.rtl-pendampingan') ? tr.querySelector('.rtl-pendampingan').value : '';
      const tenggat = tr.querySelector('.rtl-tenggat') ? tr.querySelector('.rtl-tenggat').value : '';
      const status = tr.querySelector('.rtl-status') ? tr.querySelector('.rtl-status').value : 'Terbuka';
      if (tindakan) {
        rtlItems.push({ tindakan: tindakan, pendampingan: pendampingan, tenggat: tenggat, status: status });
      }
    });

    // Collect Refleksi D
    const refleksiD = {
      refleksi_1: document.getElementById('sup-d-refleksi-1') ? document.getElementById('sup-d-refleksi-1').value : '',
      refleksi_2: document.getElementById('sup-d-refleksi-2') ? document.getElementById('sup-d-refleksi-2').value : '',
      kekuatan: document.getElementById('sup-d-kekuatan') ? document.getElementById('sup-d-kekuatan').value : '',
      area_pengembangan: document.getElementById('sup-d-area') ? document.getElementById('sup-d-area').value : '',
      guru_confirmed: document.getElementById('sup-d-guru-confirm') ? document.getElementById('sup-d-guru-confirm').checked : false
    };

    // Calculate Scores
    const calc = calculateSupervisiScores(State.currentSupervisiScores.b, State.currentSupervisiScores.c);

    // Determine status
    let newStatus = 'Pra-observasi';
    if (isFinal) {
      newStatus = 'Selesai';
    } else if (State.activeSupervisiStep === 2) {
      newStatus = 'Observasi';
    } else if (State.activeSupervisiStep === 3) {
      newStatus = 'Pasca-observasi';
    }

    const updatedData = {
      b_scores: State.currentSupervisiScores.b,
      b_notes: bNotes,
      skor_b: calc.totalB,
      nilai_b: calc.nilaiB,
      c_scores: State.currentSupervisiScores.c,
      c_notes: cNotes,
      skor_c: calc.totalC,
      nilai_c: calc.nilaiC,
      nilai_akhir: calc.nilaiAkhir,
      predikat: calc.predikat,
      wawancara_a: wawancaraA,
      refleksi_d: refleksiD,
      rtl_items: rtlItems,
      status: newStatus,
      updated_at: new Date().toISOString()
    };

    StorageManager.update('supervisi_sesi', sesiId, updatedData);

    // If RTL items exist, sync to general RTL table
    if (rtlItems.length > 0) {
      const allRtl = StorageManager.get('supervisi_rtl');
      const sessions = StorageManager.get('supervisi_sesi');
      const activeSesi = sessions.find(function (s) { return String(s.id) === String(sesiId); });
      
      rtlItems.forEach(function (rItem, idx) {
        const rtlId = 'RTL-' + sesiId + '-' + idx;
        const exists = allRtl.find(function (r) { return r.id === rtlId; });
        const record = {
          id: rtlId,
          sesi_id: sesiId,
          guru_name: activeSesi ? activeSesi.teacher_name : 'Guru',
          department: activeSesi ? activeSesi.department : 'Umum',
          subject: activeSesi ? activeSesi.subject : 'Mapel',
          tindakan: rItem.tindakan,
          pendampingan: rItem.pendampingan,
          tenggat: rItem.tenggat,
          bukti: 'Portofolio / Modul Ajar Revisi',
          status: rItem.status,
          verified_by: rItem.status === 'Terverifikasi' ? 'Kajur' : null
        };
        if (exists) {
          StorageManager.update('supervisi_rtl', rtlId, record);
        } else {
          StorageManager.add('supervisi_rtl', record);
        }
      });
    }

    renderSupervisi();
    renderTeacherAdminTable(StorageManager.get('teacher_admin'));

    if (isFinal) {
      closeModal('modal-supervisi-klinis');
      showToast('🎉 Supervisi klinis berhasil diselesaikan! Nilai Akhir: ' + calc.nilaiAkhir + ' (' + calc.predikat + ').', 'success');
    } else {
      showToast('💾 Draf supervisi berhasil disimpan.', 'info');
    }
  }

  // 10.6.7 MODAL SUPERVISI MANAJERIAL
  function openSupervisiManajerialModal(manId) {
    const list = StorageManager.get('supervisi_manajerial');
    const rec = list.find(function (m) { return String(m.id) === String(manId); }) || list[0];
    if (!rec) return;

    State.activeManajerialId = rec.id;
    document.getElementById('sup-man-id').value = rec.id;
    document.getElementById('sup-man-target-select').value = rec.id;

    // Initialize scores
    State.currentSupervisiScores.e = Object.assign({}, rec.e_scores || {});
    if (Object.keys(State.currentSupervisiScores.e).length === 0) {
      // populate default scores
      for (let i = 1; i <= 15; i++) {
        State.currentSupervisiScores.e[i] = (i % 3 === 0) ? 3 : 4;
      }
    }

    renderRubrikTable('E', 'sup-form-instrumen-e', State.currentSupervisiScores.e, rec.e_notes || {});
    updateLiveRubrikHeader('E');

    const catEl = document.getElementById('sup-man-catatan-kepsek');
    if (catEl) catEl.value = rec.catatan_kepsek || '';

    openModal('modal-supervisi-manajerial');
  }

  function changeManajerialTarget(manId) {
    openSupervisiManajerialModal(manId);
  }

  function saveSupervisiManajerial() {
    const manId = document.getElementById('sup-man-id').value;
    const scores = State.currentSupervisiScores.e || {};
    let total = 0;
    for (let i = 1; i <= 15; i++) {
      total += Number(scores[i] || 0);
    }
    const val = (total / 60) * 100;
    const pred = val >= 91 ? 'Amat Baik' : val >= 76 ? 'Baik' : val >= 61 ? 'Cukup' : 'Kurang';

    const eNotes = {};
    document.querySelectorAll('.rubrik-note-input[data-inst="E"]').forEach(function (inp) {
      eNotes[inp.getAttribute('data-no')] = inp.value;
    });

    const catatan = document.getElementById('sup-man-catatan-kepsek') ? document.getElementById('sup-man-catatan-kepsek').value : '';

    const updateObj = {
      e_scores: scores,
      e_notes: eNotes,
      skor_total: total,
      nilai: Math.round(val * 10) / 10,
      predikat: pred,
      catatan_kepsek: catatan
    };

    StorageManager.update('supervisi_manajerial', manId, updateObj);
    renderSupervisiManajerial();
    closeModal('modal-supervisi-manajerial');
    showToast('Penilaian supervisi manajerial berhasil disimpan.', 'success');
  }

  // 10.6.8 CETAK LAPORAN RESMI SUPERVISI (PDF FORMAT)
  function printSupervisiReport(sesiId) {
    const sessions = StorageManager.get('supervisi_sesi');
    const session = sessions.find(function (s) { return String(s.id) === String(sesiId); });
    if (!session) {
      showToast('Sesi tidak ditemukan.', 'danger');
      return;
    }

    const sheet = document.getElementById('printable-supervisi-sheet');
    if (!sheet) return;

    const calc = calculateSupervisiScores(session.b_scores || {}, session.c_scores || {});
    const ref = session.refleksi_d || {};

    let rtlRows = '';
    const rList = session.rtl_items || [];
    if (rList.length > 0) {
      rList.forEach(function (r, i) {
        rtlRows += '<tr>' +
          '<td style="text-align: center; border: 1px solid #000; padding: 4px;">' + (i + 1) + '</td>' +
          '<td style="border: 1px solid #000; padding: 4px;">' + r.tindakan + '</td>' +
          '<td style="border: 1px solid #000; padding: 4px;">' + r.pendampingan + '</td>' +
          '<td style="border: 1px solid #000; padding: 4px; text-align: center;">' + r.tenggat + '</td>' +
          '<td style="border: 1px solid #000; padding: 4px; text-align: center;">' + r.status + '</td>' +
          '</tr>';
      });
    } else {
      rtlRows = '<tr><td colspan="5" style="text-align: center; border: 1px solid #000; padding: 8px;">Tidak ada catatan tindakan perbaikan khusus.</td></tr>';
    }

    sheet.innerHTML = '' +
      // Kop Surat Resmi
      '<div style="text-align: center; border-bottom: 3px double #000000; padding-bottom: 12px; margin-bottom: 16px;">' +
      '<div style="font-size: 13pt; font-weight: bold; text-transform: uppercase;">PEMERINTAH PROVINSI KALIMANTAN SELATAN</div>' +
      '<div style="font-size: 14pt; font-weight: bold; text-transform: uppercase;">DINAS PENDIDIKAN DAN KEBUDAYAAN</div>' +
      '<div style="font-size: 16pt; font-weight: bold; text-transform: uppercase; letter-spacing: 0.5px;">SMK NEGERI 1 BANJARMASIN</div>' +
      '<div style="font-size: 9pt; margin-top: 2px;">Jalan Mulawarman No. 25 Telp/Fax (0511) 3353457 Banjarmasin 70114</div>' +
      '<div style="font-size: 9pt; font-style: italic;">Website: www.smkn1bjm.sch.id • Email: info@smkn1bjm.sch.id</div>' +
      '</div>' +

      // Judul Laporan
      '<div style="text-align: center; margin-bottom: 16px;">' +
      '<div style="font-size: 12pt; font-weight: bold; text-decoration: underline;">INSTRUMEN & LAPORAN HASIL SUPERVISI AKADEMIK PEMBELAJARAN</div>' +
      '<div style="font-size: 10pt; margin-top: 2px;">Nomor: 421.5/SIMKUR/' + session.id + '/2026 • Semester Ganjil 2026/2027</div>' +
      '</div>' +

      // Identitas Guru & Observasi
      '<table style="width: 100%; font-size: 10pt; margin-bottom: 14px; border-collapse: collapse;">' +
      '<tr><td style="width: 25%; padding: 3px 0;">Nama Guru</td><td style="width: 2%;">:</td><td style="font-weight: bold;">' + session.teacher_name + '</td>' +
      '<td style="width: 20%; padding: 3px 0;">Hari / Tanggal</td><td style="width: 2%;">:</td><td>' + (session.tgl_observasi || '-') + '</td></tr>' +
      '<tr><td style="padding: 3px 0;">NIP / NUPTK</td><td>:</td><td>' + (session.nip || '-') + '</td>' +
      '<td style="padding: 3px 0;">Jam / Pertemuan</td><td>:</td><td>' + (session.wkt_observasi || '08.00 - 09.30 WITA') + '</td></tr>' +
      '<tr><td style="padding: 3px 0;">Program Keahlian</td><td>:</td><td>' + session.department + '</td>' +
      '<td style="padding: 3px 0;">Kelas / Rombel</td><td>:</td><td>' + (session.class_name || 'XI TJKT 1') + '</td></tr>' +
      '<tr><td style="padding: 3px 0;">Mata Pelajaran</td><td>:</td><td>' + session.subject + '</td>' +
      '<td style="padding: 3px 0;">Nama Supervisor</td><td>:</td><td><strong>' + session.supervisor_name + '</strong></td></tr>' +
      '</table>' +

      // Matriks Hasil Supervisi
      '<div style="font-size: 10.5pt; font-weight: bold; margin-bottom: 6px;">A. REKAPITULASI NILAI SUPERVISI</div>' +
      '<table style="width: 100%; border-collapse: collapse; font-size: 9.5pt; margin-bottom: 14px;">' +
      '<thead>' +
      '<tr style="background: #E5E7EB; text-align: center;">' +
      '<th style="border: 1px solid #000; padding: 6px; width: 5%;">No</th>' +
      '<th style="border: 1px solid #000; padding: 6px; text-align: left;">Komponen Evaluasi</th>' +
      '<th style="border: 1px solid #000; padding: 6px; width: 15%;">Skor Perolehan</th>' +
      '<th style="border: 1px solid #000; padding: 6px; width: 12%;">Nilai (100)</th>' +
      '<th style="border: 1px solid #000; padding: 6px; width: 12%;">Bobot</th>' +
      '<th style="border: 1px solid #000; padding: 6px; width: 15%;">Skor Tertimbang</th>' +
      '</tr>' +
      '</thead>' +
      '<tbody>' +
      '<tr>' +
      '<td style="text-align: center; border: 1px solid #000; padding: 5px;">1</td>' +
      '<td style="border: 1px solid #000; padding: 5px;">Telaah Perangkat Ajar (Instrumen B: 14 Butir)</td>' +
      '<td style="text-align: center; border: 1px solid #000; padding: 5px;">' + (session.skor_b || calc.totalB) + ' / 56</td>' +
      '<td style="text-align: center; border: 1px solid #000; padding: 5px;">' + (session.nilai_b || calc.nilaiB) + '</td>' +
      '<td style="text-align: center; border: 1px solid #000; padding: 5px;">40%</td>' +
      '<td style="text-align: center; border: 1px solid #000; padding: 5px; font-weight: bold;">' + calc.contribB.toFixed(1) + '</td>' +
      '</tr>' +
      '<tr>' +
      '<td style="text-align: center; border: 1px solid #000; padding: 5px;">2</td>' +
      '<td style="border: 1px solid #000; padding: 5px;">Observasi Pelaksanaan Pembelajaran (Instrumen C: 18 Butir)</td>' +
      '<td style="text-align: center; border: 1px solid #000; padding: 5px;">' + (session.skor_c || calc.totalC) + ' / 72</td>' +
      '<td style="text-align: center; border: 1px solid #000; padding: 5px;">' + (session.nilai_c || calc.nilaiC) + '</td>' +
      '<td style="text-align: center; border: 1px solid #000; padding: 5px;">60%</td>' +
      '<td style="text-align: center; border: 1px solid #000; padding: 5px; font-weight: bold;">' + calc.contribC.toFixed(1) + '</td>' +
      '</tr>' +
      '<tr style="background: #F3F4F6; font-weight: bold;">' +
      '<td colspan="5" style="border: 1px solid #000; padding: 6px; text-align: right;">NILAI AKHIR SUPERVISI AKADEMIK:</td>' +
      '<td style="border: 1px solid #000; padding: 6px; text-align: center; font-size: 11pt;">' + (session.nilai_akhir || calc.nilaiAkhir).toFixed(1) + '</td>' +
      '</tr>' +
      '<tr style="background: #F3F4F6; font-weight: bold;">' +
      '<td colspan="5" style="border: 1px solid #000; padding: 6px; text-align: right;">PREDIKAT MUTU PEMBELAJARAN:</td>' +
      '<td style="border: 1px solid #000; padding: 6px; text-align: center; font-size: 11pt; color: #1D4ED8;">' + (session.predikat || calc.predikat) + '</td>' +
      '</tr>' +
      '</tbody>' +
      '</table>' +

      // Catatan Refleksi & Umpan Balik
      '<div style="font-size: 10.5pt; font-weight: bold; margin-bottom: 6px;">B. REFLEKSI & UMPAN BALIK SUPERVISOR</div>' +
      '<table style="width: 100%; border: 1px solid #000; border-collapse: collapse; font-size: 9.5pt; margin-bottom: 14px;">' +
      '<tr><td style="width: 32%; border: 1px solid #000; padding: 6px; background: #F9FAFB; font-weight: bold;">1. Kekuatan yang Diamati (Praktik Baik)</td>' +
      '<td style="border: 1px solid #000; padding: 6px;">' + (ref.kekuatan || 'Penguasaan materi sangat baik, pembelajaran interaktif, keselamatan kerja (K3) lab terlaksana.') + '</td></tr>' +
      '<tr><td style="border: 1px solid #000; padding: 6px; background: #F9FAFB; font-weight: bold;">2. Area Pengembangan / Perbaikan</td>' +
      '<td style="border: 1px solid #000; padding: 6px;">' + (ref.area_pengembangan || 'Perlu penajaman pembelajaran berdiferensiasi dan asesmen formatif berkala.') + '</td></tr>' +
      '<tr><td style="border: 1px solid #000; padding: 6px; background: #F9FAFB; font-weight: bold;">3. Rekomendasi Tindak Lanjut Standar</td>' +
      '<td style="border: 1px solid #000; padding: 6px;">' + calc.tindakLanjut + '</td></tr>' +
      '</table>' +

      // Rencana Tindak Lanjut (RTL)
      '<div style="font-size: 10.5pt; font-weight: bold; margin-bottom: 6px;">C. KESEPAKATAN RENCANA TINDAK LANJUT (RTL)</div>' +
      '<table style="width: 100%; border-collapse: collapse; font-size: 9pt; margin-bottom: 24px;">' +
      '<thead><tr style="background: #E5E7EB; text-align: center;">' +
      '<th style="border: 1px solid #000; padding: 4px; width: 5%;">No</th>' +
      '<th style="border: 1px solid #000; padding: 4px; text-align: left;">Rencana Tindakan</th>' +
      '<th style="border: 1px solid #000; padding: 4px; width: 25%;">Bentuk Pendampingan</th>' +
      '<th style="border: 1px solid #000; padding: 4px; width: 16%;">Tenggat Waktu</th>' +
      '<th style="border: 1px solid #000; padding: 4px; width: 14%;">Status</th>' +
      '</tr></thead>' +
      '<tbody>' + rtlRows + '</tbody>' +
      '</table>' +

      // Tanda Tangan 3 Pihak
      '<div style="display: flex; justify-content: space-between; font-size: 9.5pt; text-align: center; margin-top: 15px;">' +
      '<div style="width: 30%;">' +
      '<div>Guru yang Disupervisi,</div>' +
      '<div style="height: 55px;"></div>' +
      '<div style="font-weight: bold; text-decoration: underline;">' + session.teacher_name + '</div>' +
      '<div>NIP. ' + (session.nip || '-') + '</div>' +
      '</div>' +

      '<div style="width: 32%;">' +
      '<div>Supervisor / Ketua Jurusan,</div>' +
      '<div style="height: 55px;"></div>' +
      '<div style="font-weight: bold; text-decoration: underline;">' + session.supervisor_name + '</div>' +
      '<div>NIP. 198801102022211001</div>' +
      '</div>' +

      '<div style="width: 32%;">' +
      '<div>Banjarmasin, ' + (session.tgl_observasi || '29 September 2026') + '<br>Mengetahui: Kepala Sekolah,</div>' +
      '<div style="height: 55px;"></div>' +
      '<div style="font-weight: bold; text-decoration: underline;">Agustin Purnomosari, S.Pd., M.Pd</div>' +
      '<div>NIP. 196808151994122003</div>' +
      '</div>' +
      '</div>';

    openModal('modal-laporan-supervisi-pdf');
  }

  function printSupervisiReportFromModal() {
    printSupervisiReport(State.activeSupervisiSesiId);
  }

  function triggerSupervisiPrint() {
    window.print();
  }

  function printSekolahSupervisiReport() {
    const sheet = document.getElementById('printable-supervisi-sheet');
    if (!sheet) return;

    const sessions = StorageManager.get('supervisi_sesi');
    const totalTeachers = 90;
    const selesaiCount = sessions.filter(function (s) { return s.status === 'Selesai'; }).length;

    let rowsHtml = '';
    sessions.slice(0, 40).forEach(function (s, i) {
      rowsHtml += '<tr>' +
        '<td style="border: 1px solid #000; text-align: center; padding: 4px;">' + (i + 1) + '</td>' +
        '<td style="border: 1px solid #000; padding: 4px;">' + s.teacher_name + '</td>' +
        '<td style="border: 1px solid #000; padding: 4px; text-align: center;">' + s.department + '</td>' +
        '<td style="border: 1px solid #000; padding: 4px;">' + s.subject + '</td>' +
        '<td style="border: 1px solid #000; padding: 4px; text-align: center;">' + (s.nilai_b || '-') + '</td>' +
        '<td style="border: 1px solid #000; padding: 4px; text-align: center;">' + (s.nilai_c || '-') + '</td>' +
        '<td style="border: 1px solid #000; padding: 4px; text-align: center; font-weight: bold;">' + (s.nilai_akhir > 0 ? s.nilai_akhir.toFixed(1) : '-') + '</td>' +
        '<td style="border: 1px solid #000; padding: 4px; text-align: center;">' + s.predikat + '</td>' +
        '<td style="border: 1px solid #000; padding: 4px; text-align: center;">' + s.status + '</td>' +
        '</tr>';
    });

    sheet.innerHTML = '' +
      '<div style="text-align: center; border-bottom: 3px double #000; padding-bottom: 10px; margin-bottom: 14px;">' +
      '<div style="font-size: 13pt; font-weight: bold;">PEMERINTAH PROVINSI KALIMANTAN SELATAN</div>' +
      '<div style="font-size: 15pt; font-weight: bold;">SMK NEGERI 1 BANJARMASIN</div>' +
      '<div style="font-size: 10pt;">Jalan Mulawarman No. 25 Banjarmasin Kalimantan Selatan</div>' +
      '</div>' +
      '<div style="text-align: center; margin-bottom: 14px;">' +
      '<div style="font-size: 12pt; font-weight: bold; text-decoration: underline;">REKAPITULASI PELAKSANAAN SUPERVISI AKADEMIK SEKOLAH</div>' +
      '<div style="font-size: 9.5pt;">Tahun Ajaran 2026/2027 (Ketercapaian: ' + selesaiCount + ' / ' + totalTeachers + ' Guru)</div>' +
      '</div>' +
      '<table style="width: 100%; border-collapse: collapse; font-size: 8pt; margin-bottom: 20px;">' +
      '<thead><tr style="background: #E5E7EB; text-align: center;">' +
      '<th style="border: 1px solid #000; padding: 4px;">No</th>' +
      '<th style="border: 1px solid #000; padding: 4px;">Nama Guru Sasaran</th>' +
      '<th style="border: 1px solid #000; padding: 4px;">Jurusan</th>' +
      '<th style="border: 1px solid #000; padding: 4px;">Mata Pelajaran</th>' +
      '<th style="border: 1px solid #000; padding: 4px;">Telaah B (40%)</th>' +
      '<th style="border: 1px solid #000; padding: 4px;">Observasi C (60%)</th>' +
      '<th style="border: 1px solid #000; padding: 4px;">Nilai Akhir</th>' +
      '<th style="border: 1px solid #000; padding: 4px;">Predikat</th>' +
      '<th style="border: 1px solid #000; padding: 4px;">Status</th>' +
      '</tr></thead>' +
      '<tbody>' + rowsHtml + '</tbody>' +
      '</table>' +
      '<div style="display: flex; justify-content: space-between; font-size: 9pt; text-align: center;">' +
      '<div style="width: 40%;">' +
      '<div>Koordinator Supervisi (Waka Kurikulum),</div>' +
      '<div style="height: 50px;"></div>' +
      '<div style="font-weight: bold; text-decoration: underline;">Rusnani, S.Pd., M.T</div>' +
      '<div>NIP. 197308022000122003</div>' +
      '</div>' +
      '<div style="width: 40%;">' +
      '<div>Banjarmasin, 29 September 2026<br>Kepala SMKN 1 Banjarmasin,</div>' +
      '<div style="height: 50px;"></div>' +
      '<div style="font-weight: bold; text-decoration: underline;">Agustin Purnomosari, S.Pd., M.Pd</div>' +
      '<div>NIP. 196808151994122003</div>' +
      '</div>' +
      '</div>';

    openModal('modal-laporan-supervisi-pdf');
  }

  function exportSupervisiRecap() {
    const sessions = StorageManager.get('supervisi_sesi');
    let csv = 'No,ID Sesi,Nama Guru,NIP,Jurusan,Mata Pelajaran,Pengawas,Tanggal Observasi,Status,Skor B,Nilai B,Skor C,Nilai C,Nilai Akhir,Predikat\n';

    sessions.forEach(function (s, idx) {
      csv += [
        idx + 1,
        '"' + s.id + '"',
        '"' + s.teacher_name + '"',
        '"' + (s.nip || '-') + '"',
        '"' + s.department + '"',
        '"' + s.subject + '"',
        '"' + s.supervisor_name + '"',
        '"' + (s.tgl_observasi || '-') + '"',
        '"' + s.status + '"',
        s.skor_b || 0,
        s.nilai_b || 0,
        s.skor_c || 0,
        s.nilai_c || 0,
        s.nilai_akhir || 0,
        '"' + s.predikat + '"'
      ].join(',') + '\n';
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'Rekap_Supervisi_SMKN1_BJM_2026.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast('Rekap supervisi (CSV) berhasil diunduh.', 'success');
  }

  function generateMassalSupervisiSchedules() {
    showToast('⚡ 90 Sesi Supervisi Semester Ganjil 2026/2027 telah terbit sesuai SK Tim Supervisi.', 'success');
    renderSupervisi();
  }

  function openScheduleSupervisiModal() {
    const teachers = StorageManager.get('teachers');
    const sel = document.getElementById('new-sup-guru-id');
    if (sel) {
      let optHtml = '<option value="">-- Pilih Guru Sasaran (90 Guru) --</option>';
      teachers.forEach(function (t) {
        optHtml += '<option value="' + t.id + '">' + t.name + ' (' + (t.department || 'Umum') + ' - ' + (t.subject || '-') + ')</option>';
      });
      sel.innerHTML = optHtml;
    }

    // Default Date Tomorrow
    const dateInp = document.getElementById('new-sup-date');
    if (dateInp) {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      dateInp.value = tomorrow.toISOString().split('T')[0];
    }

    openModal('modal-add-supervisi-sesi');
  }

  function onSupervisiGuruSelectChange(guruId) {
    if (!guruId) return;
    const teachers = StorageManager.get('teachers');
    const teacher = teachers.find(function (t) { return String(t.id) === String(guruId); });
    if (!teacher) return;

    const mapelInp = document.getElementById('new-sup-mapel');
    if (mapelInp) mapelInp.value = teacher.subject || '';

    const kelasInp = document.getElementById('new-sup-kelas');
    if (kelasInp) kelasInp.value = 'XI ' + (teacher.department || 'TJKT') + ' 1';

    // Auto select supervisor based on department
    const pengawasSel = document.getElementById('new-sup-pengawas-id');
    if (pengawasSel) {
      const d = (teacher.department || '').toUpperCase();
      if (d.includes('TJKT') || d.includes('TKJ')) pengawasSel.value = 'K-TJKT';
      else if (d.includes('DKV') || d.includes('MM')) pengawasSel.value = 'K-DKV';
      else if (d.includes('AKL') || d.includes('AKUNTANSI')) pengawasSel.value = 'K-AKL';
      else if (d.includes('MPLB') || d.includes('OTKP')) pengawasSel.value = 'K-MPLB';
      else if (d.includes('PM') || d.includes('PEMASARAN')) pengawasSel.value = 'K-PM';
      else pengawasSel.value = 'T-001';
    }
  }

  function submitNewSupervisiSesi(e) {
    e.preventDefault();
    const guruId = document.getElementById('new-sup-guru-id').value;
    const pengawasId = document.getElementById('new-sup-pengawas-id').value;
    const mapel = document.getElementById('new-sup-mapel').value;
    const kelas = document.getElementById('new-sup-kelas').value;
    const tgl = document.getElementById('new-sup-date').value;
    const time = document.getElementById('new-sup-time').value;
    const room = document.getElementById('new-sup-room').value;
    const focus = document.getElementById('new-sup-focus').value;

    const teachers = StorageManager.get('teachers');
    const teacher = teachers.find(function (t) { return String(t.id) === String(guruId); });

    const pengawasMap = {
      'T-001': { name: 'Rusnani, S.Pd., M.T', role: 'Waka Kurikulum' },
      'K-TJKT': { name: 'Muhammad Ihsan, S.Kom', role: 'Kajur TJKT' },
      'K-DKV': { name: 'Hendra Surya Pratama, S.Kom', role: 'Kajur DKV' },
      'K-AKL': { name: 'Oky Wulan Maulina, S.Pd', role: 'Kajur AKL' },
      'K-MPLB': { name: 'Akhmad Hanafi Maulana, S.E', role: 'Kajur MPLB' },
      'K-PM': { name: 'Futri Indri Septiani, S.Pd', role: 'Kajur Pemasaran' }
    };
    const pInfo = pengawasMap[pengawasId] || { name: 'Rusnani, S.Pd., M.T', role: 'Waka Kurikulum' };

    const newSesi = {
      id: 'SESI-' + Date.now().toString().slice(-4),
      program_id: 'PROG-2026-GANJIL',
      teacher_id: guruId,
      teacher_name: teacher ? teacher.name : 'Guru',
      nip: teacher ? teacher.nip : '-',
      department: teacher ? teacher.department : 'Umum',
      subject: mapel,
      class_name: kelas,
      supervisor_id: pengawasId,
      supervisor_name: pInfo.name,
      supervisor_role: pInfo.role,
      status: 'Pra-observasi',
      tgl_observasi: tgl,
      wkt_observasi: time,
      room: room,
      fokus: focus,
      skor_b: 0,
      skor_c: 0,
      nilai_b: 0,
      nilai_c: 0,
      nilai_akhir: 0,
      predikat: '-',
      wawancara_a: {},
      refleksi_d: {}
    };

    StorageManager.add('supervisi_sesi', newSesi);
    closeModal('modal-add-supervisi-sesi');
    renderSupervisi();
    renderTeacherAdminTable(StorageManager.get('teacher_admin'));
    showToast('Jadwal sesi supervisi untuk ' + newSesi.teacher_name + ' berhasil dibuat.', 'success');
  }

  function verifyRtlItem(rtlId) {
    StorageManager.update('supervisi_rtl', rtlId, {
      status: 'Terverifikasi',
      verified_by: 'Kajur / Waka Kurikulum',
      verified_at: new Date().toISOString()
    });
    renderSupervisiRTL();
    showToast('Tindak lanjut RTL berhasil diverifikasi.', 'success');
  }

  // =========================================================================
  // 11. BOOTSTRAP APPLICATION
  // =========================================================================
  function initApp() {
    StorageManager.init();
    initEventListeners();

    // ── READ SESSION & APPLY ACCESS CONTROL ──────────────────────────────
    var session = null;
    try {
      var rawSession = localStorage.getItem('simkur_session');
      if (rawSession) session = JSON.parse(rawSession);
    } catch (err) { /* ignore corrupt session */ }

    var roleInfo = getUserRoleInfo(session);
    var isGuruOnly = roleInfo.isGuruOnly;
    var isKaprogOrWakaNonKur = roleInfo.isKaprogOrWakaNonKur;

    // Update topbar user chip from session
    if (session) {
      var chipName = document.querySelector('.topbar-user-chip [style*="font-weight: 700"]');
      var chipRole = document.querySelector('.topbar-user-chip [style*="0.6875rem"]');
      var chipAvatar = document.querySelector('.topbar-user-chip img');
      if (chipName) chipName.textContent = session.name;
      if (chipRole) {
        var roleTitle = session.title;
        if (!roleTitle) {
          if (roleInfo.isWakaKur) roleTitle = 'Waka Kurikulum';
          else if (roleInfo.isKaprog) roleTitle = 'Kajur / Kaprog ' + (session.department || 'Kejuruan');
          else if (roleInfo.isWakaNonKur) roleTitle = 'Pimpinan Waka';
          else roleTitle = 'Guru Pengampu';
        }
        chipRole.textContent = roleTitle;
      }
      if (chipAvatar && session.avatar) chipAvatar.src = session.avatar;
    }

    // ── ROLE ACCESS CONTROL (Kaprog & Waka Non-Kur: HANYA Supervisi & Portal Guru) ──
    if (isKaprogOrWakaNonKur) {
      // Sembunyikan Group 1 (Dashboard), Group 2 (Dokumen), Group 3 (Jadwal & Data Master)
      ['nav-group-1', 'nav-list-1', 'nav-group-2', 'nav-list-2', 'nav-group-3', 'nav-list-3'].forEach(function (id) {
        var el = document.getElementById(id);
        if (el) el.style.display = 'none';
      });

      // Tampilkan Group 4 (Supervisi Klinis & Portal Guru)
      var g4Title = document.getElementById('nav-group-4');
      if (g4Title) g4Title.textContent = roleInfo.isKaprog ? 'Menu Kaprog & KBM' : 'Menu Pimpinan Waka';

      var navSup = document.getElementById('nav-item-supervisi');
      if (navSup) navSup.style.display = 'block';
      var navGur = document.getElementById('nav-item-portal-guru');
      if (navGur) navGur.style.display = 'block';

      // Mobile Bottom Nav: Hanya Supervisi, Portal Guru & Menu
      ['bottom-nav-dashboard', 'bottom-nav-dokumen', 'bottom-nav-jadwal'].forEach(function (id) {
        var el = document.getElementById(id);
        if (el) el.style.display = 'none';
      });
      var bSup = document.getElementById('bottom-nav-supervisi');
      if (bSup) bSup.style.display = 'flex';
      var bGur = document.getElementById('bottom-nav-portal-guru');
      if (bGur) bGur.style.display = 'flex';

      // Modal mobile menu
      var mMaster = document.getElementById('mobile-menu-data-master');
      if (mMaster) mMaster.style.display = 'none';
      var mSup = document.getElementById('mobile-menu-supervisi');
      if (mSup) mSup.style.display = 'flex';

      // Sembunyikan search bar topbar
      var searchPill = document.querySelector('.topbar-search-pill');
      if (searchPill) searchPill.style.display = 'none';

      // Pre-filter jurusan pada Subtab Sesi jika Kaprog
      if (roleInfo.isKaprog && session.department) {
        var d = session.department.toUpperCase();
        if (d.includes('TJKT') || d.includes('TKJ')) State.supervisiDeptFilter = 'TJKT';
        else if (d.includes('DKV') || d.includes('MM')) State.supervisiDeptFilter = 'DKV';
        else if (d.includes('AKL') || d.includes('AKUNTANSI')) State.supervisiDeptFilter = 'AKL';
        else if (d.includes('MPLB') || d.includes('OTKP')) State.supervisiDeptFilter = 'MPLB';
        else if (d.includes('PM') || d.includes('PEMASARAN')) State.supervisiDeptFilter = 'Pemasaran';

        var deptSelect = document.getElementById('sup-filter-dept');
        if (deptSelect && State.supervisiDeptFilter) deptSelect.value = State.supervisiDeptFilter;
      }
    } else if (isGuruOnly) {
      // Guru Biasa: HANYA Portal Guru
      ['nav-group-1', 'nav-list-1', 'nav-group-2', 'nav-list-2', 'nav-group-3', 'nav-list-3'].forEach(function (id) {
        var el = document.getElementById(id);
        if (el) el.style.display = 'none';
      });

      var g4TitleGuru = document.getElementById('nav-group-4');
      if (g4TitleGuru) g4TitleGuru.textContent = 'Menu Guru';

      var navSupGuru = document.getElementById('nav-item-supervisi');
      if (navSupGuru) navSupGuru.style.display = 'none';
      var navGurGuru = document.getElementById('nav-item-portal-guru');
      if (navGurGuru) navGurGuru.style.display = 'block';

      // Mobile Bottom Nav: Hanya Portal Guru & Menu
      ['bottom-nav-dashboard', 'bottom-nav-dokumen', 'bottom-nav-jadwal', 'bottom-nav-supervisi'].forEach(function (id) {
        var el = document.getElementById(id);
        if (el) el.style.display = 'none';
      });
      var bGurOnly = document.getElementById('bottom-nav-portal-guru');
      if (bGurOnly) bGurOnly.style.display = 'flex';

      var mMaster2 = document.getElementById('mobile-menu-data-master');
      if (mMaster2) mMaster2.style.display = 'none';
      var mSup2 = document.getElementById('mobile-menu-supervisi');
      if (mSup2) mSup2.style.display = 'none';

      var searchPillGuru = document.querySelector('.topbar-search-pill');
      if (searchPillGuru) searchPillGuru.style.display = 'none';

      var complianceBadge = document.querySelector('.topbar-right .badge');
      if (complianceBadge) complianceBadge.style.display = 'none';
    } else {
      // Waka Kurikulum, Admin, Kepsek: FULL ACCESS
      ['nav-group-1', 'nav-list-1', 'nav-group-2', 'nav-list-2', 'nav-group-3', 'nav-list-3', 'nav-group-4', 'nav-list-4'].forEach(function (id) {
        var el = document.getElementById(id);
        if (el) el.style.display = '';
      });
      var navSupFull = document.getElementById('nav-item-supervisi');
      if (navSupFull) navSupFull.style.display = 'block';
      var navGurFull = document.getElementById('nav-item-portal-guru');
      if (navGurFull) navGurFull.style.display = 'block';
    }

    // Pre-select the logged-in teacher in Portal Guru
    if (session) {
      var allTeachers = StorageManager.get('teachers') || [];
      var cleanDigits = function (s) { return String(s || '').replace(/\D/g, ''); };
      var cleanStr = function (s) {
        return String(s || '').toLowerCase()
          .replace(/(s\.pd|s\.kom|m\.pd|se|s\.t|dr|dra|drs|h\.|hj\.|m\.m|m\.si|s\.ag|s\.sos|gr\.)/gi, '')
          .replace(/[^a-z0-9]/g, '')
          .trim();
      };

      var sessNipDigits = cleanDigits(session.nip);
      var sessNameClean = cleanStr(session.name);

      var matchedTeacher = null;
      if (sessNipDigits && sessNipDigits.length >= 8) {
        matchedTeacher = allTeachers.find(function (t) {
          return cleanDigits(t.nip) === sessNipDigits;
        });
      }
      if (!matchedTeacher && sessNameClean) {
        matchedTeacher = allTeachers.find(function (t) {
          return cleanStr(t.name) === sessNameClean || t.name === session.name;
        });
      }
      if (!matchedTeacher && session.name) {
        var tokens = session.name.toLowerCase().replace(/[^a-z]/g, ' ').split(/\s+/).filter(function (w) {
          return w.length > 3 && ['guru', 'smkn', 'banjarmasin', 'ahmad', 'muhammad'].indexOf(w) === -1;
        });
        if (tokens.length > 0) {
          matchedTeacher = allTeachers.find(function (t) {
            var tNameLower = (t.name || '').toLowerCase();
            return tokens.every(function (tok) { return tNameLower.indexOf(tok) !== -1; });
          });
        }
      }
      if (matchedTeacher && matchedTeacher.id) {
        State.currentGuruId = matchedTeacher.id;
      }

      // Update Dashboard welcome heading if available
      var welcomeHeading = document.querySelector('#screen-dashboard .welcome-banner h2');
      if (welcomeHeading) {
        welcomeHeading.textContent = 'Selamat Datang, ' + (session.name || 'Bapak/Ibu Guru') + ' 👋';
      }
    }
    // ── END ACCESS CONTROL ───────────────────────────────────────────────

    const params = new URLSearchParams(window.location.search);
    var initialScreen = params.get('screen') || (isGuruOnly ? 'portal-guru' : (isKaprogOrWakaNonKur ? 'supervisi' : 'dashboard'));

    // Force guru-only users to portal-guru regardless of URL param
    if (isGuruOnly) initialScreen = 'portal-guru';
    // Force Kaprog & Waka non-Kur to only supervisi or portal-guru
    if (isKaprogOrWakaNonKur) {
      if (initialScreen !== 'supervisi' && initialScreen !== 'portal-guru') {
        initialScreen = 'supervisi';
      }
    }

    const initialDocTab = params.get('tab');
    if (initialDocTab) {
      State.activeDocTab = initialDocTab;
    }
    const initialGuruTab = params.get('guruTab');
    if (initialGuruTab) {
      State.activeGuruTab = initialGuruTab;
    }
    const initialGuruId = params.get('guruId');
    if (initialGuruId && !session) {
      State.currentGuruId = initialGuruId;
    }

    const daysMap = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    const currentDay = daysMap[new Date().getDay()];
    if (currentDay !== 'Minggu') {
      State.selectedDay = currentDay;
    } else {
      State.selectedDay = 'Senin';
    }

    document.querySelectorAll('.day-pill-btn').forEach(function (b) {
      if (b.getAttribute('data-day') === State.selectedDay) {
        b.classList.add('active');
      } else {
        b.classList.remove('active');
      }
    });

    switchScreen(initialScreen);
    initOnlineOfflineStatus();
    updateDriveUIElements();
    console.log('🚀 SIMKUR Portal siap. Akses:', isGuruOnly ? 'Guru Only → Portal Guru' : 'Full Access');
  }

  function initOnlineOfflineStatus() {
    var banner = document.getElementById('offline-banner');
    if (!banner) return;
    function updateStatus() {
      if (!navigator.onLine) {
        banner.style.display = 'block';
      } else {
        banner.style.display = 'none';
      }
    }
    window.addEventListener('online', updateStatus);
    window.addEventListener('offline', updateStatus);
    updateStatus();
  }

  function openKbmBridgeModal() {
    var userNameEl = document.getElementById('kbm-bridge-user-name');
    var session = null;
    try {
      var raw = localStorage.getItem('simkur_session');
      if (raw) session = JSON.parse(raw);
    } catch (e) {}

    if (userNameEl) {
      userNameEl.textContent = (session && session.name) || (window.SIMKUR_DATA && window.SIMKUR_DATA.currentUser ? window.SIMKUR_DATA.currentUser.name : 'Rusnani');
    }
    openModal('modal-kbm-bridge');
  }

  function confirmOpenKbm() {
    closeModal('modal-kbm-bridge');
    switchScreen('portal-guru');
    showToast('🚀 Mengalihkan ke Portal Guru KBM...', 'success');
  }

  function showNotifications() {
    showToast('ℹ️ Status sinkronisasi: Sistem SIMKUR tersinkron 100% dengan Dapodik.');
  }

  // ── CHANGE PASSWORD METHODS ──────────────────────────────────────────
  function openChangePasswordModal() {
    var session = null;
    try {
      var raw = localStorage.getItem('simkur_session');
      if (raw) session = JSON.parse(raw);
    } catch (e) {}

    var activeTeacher = null;
    if (session) {
      activeTeacher = {
        name: session.name,
        nip: session.nip,
        title: session.title || (session.role === 'waka' ? 'Waka Kurikulum' : 'Guru'),
        avatar: session.avatar || 'assets/teacher_avatar.jpg'
      };
    } else if (window.SIMKUR_DATA && window.SIMKUR_DATA.currentUser) {
      activeTeacher = window.SIMKUR_DATA.currentUser;
    }

    var nameEl = document.getElementById('pwd-modal-name');
    var metaEl = document.getElementById('pwd-modal-meta');
    var avatarEl = document.getElementById('pwd-modal-avatar');

    if (nameEl && activeTeacher) nameEl.textContent = activeTeacher.name;
    if (metaEl && activeTeacher) {
      metaEl.textContent = 'NIP. ' + (activeTeacher.nip || '-') + ' • ' + (activeTeacher.title || 'Guru Pengampu');
    }
    if (avatarEl && activeTeacher && activeTeacher.avatar) {
      avatarEl.src = activeTeacher.avatar;
    }

    var curInput = document.getElementById('input-pwd-current');
    var newInput = document.getElementById('input-pwd-new');
    var confInput = document.getElementById('input-pwd-confirm');
    if (curInput) curInput.value = '';
    if (newInput) newInput.value = '';
    if (confInput) confInput.value = '';

    openModal('modal-change-password');
  }

  function saveChangePassword(event) {
    if (event) event.preventDefault();

    var curInput = document.getElementById('input-pwd-current');
    var newInput = document.getElementById('input-pwd-new');
    var confInput = document.getElementById('input-pwd-confirm');

    var curVal = curInput ? curInput.value.trim() : '';
    var newVal = newInput ? newInput.value.trim() : '';
    var confVal = confInput ? confInput.value.trim() : '';

    if (!newVal || newVal.length < 6) {
      showToast('⚠️ Kata sandi baru minimal 6 karakter!');
      if (newInput) newInput.focus();
      return;
    }

    if (newVal !== confVal) {
      showToast('⚠️ Konfirmasi kata sandi baru tidak cocok!');
      if (confInput) confInput.focus();
      return;
    }

    var session = null;
    try {
      var raw = localStorage.getItem('simkur_session');
      if (raw) session = JSON.parse(raw);
    } catch (e) {}

    var nip = session ? session.nip : (window.SIMKUR_DATA && window.SIMKUR_DATA.currentUser ? window.SIMKUR_DATA.currentUser.nip : 'default');

    // Save to localStorage
    var passwords = {};
    try {
      passwords = JSON.parse(localStorage.getItem('simkur_passwords') || '{}');
    } catch (e) {}
    passwords[nip] = newVal;
    localStorage.setItem('simkur_passwords', JSON.stringify(passwords));

    closeModal('modal-change-password');
    showToast('✅ Kata sandi berhasil diperbarui!');
  }

  function togglePwdVisibility(inputId, btnEl) {
    var input = document.getElementById(inputId);
    if (!input) return;
    if (input.type === 'password') {
      input.type = 'text';
      if (btnEl) btnEl.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>';
    } else {
      input.type = 'password';
      if (btnEl) btnEl.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>';
    }
  }

  // Expose global methods for inline HTML onclick handlers
  window.PORTAL_APP = {
    escapeHtml: escapeHtml,
    handleBrandClick: handleBrandClick,
    openChangePasswordModal: openChangePasswordModal,
    saveChangePassword: saveChangePassword,
    togglePwdVisibility: togglePwdVisibility,
    switchScreen: switchScreen,
    openModal: openModal,
    closeModal: closeModal,
    StorageManager: StorageManager,
    selectDashboardDay: selectDashboardDay,
    filterDashboardSchedule: filterDashboardSchedule,
    openKarhutlaModal: openKarhutlaModal,
    setSchedViewMode: setSchedViewMode,
    setSchedGradeFilter: setSchedGradeFilter,
    toggleSchedLiveOnly: toggleSchedLiveOnly,
    openAddAgendaModal: openAddAgendaModal,
    deleteAgenda: deleteAgenda,
    switchDocTab: switchDocTab,
    setTeacherDocViewMode: setTeacherDocViewMode,
    openTeacherAdminModal: openTeacherAdminModal,
    openTeacherAdminFilesModal: openTeacherAdminFilesModal,
    filterTeacherDocs: filterTeacherDocs,
    renderTeacherDocsList: renderTeacherDocsList,
    previewTeacherDoc: previewTeacherDoc,
    previewTeacherJournal: previewTeacherJournal,
    approveDoc: approveDoc,
    markDocRevision: markDocRevision,
    printPreviewDoc: printPreviewDoc,
    notifyTeacherWA: notifyTeacherWA,
    notifyActiveTeacherWA: notifyActiveTeacherWA,
    openUploadOnBehalfModal: openUploadOnBehalfModal,
    deleteUploadedTeacherDoc: deleteUploadedTeacherDoc,
    downloadTeacherDocFile: downloadTeacherDocFile,
    exportAdminRecap: exportAdminRecap,
    openUploadDocModal: openUploadDocModal,
    setArchiveDocViewMode: setArchiveDocViewMode,
    setMasterViewMode: setMasterViewMode,
    setSupSesiViewMode: setSupSesiViewMode,
    editDocument: function (id) { openUploadDocModal(id); },
    deleteDocument: deleteDocument,
    downloadDocument: downloadDocument,
    openScheduleModal: openScheduleModal,
    editSchedule: function (id) { openScheduleModal(id); },
    deleteSchedule: deleteSchedule,
    setScheduleViewMode: setScheduleViewMode,
    openKbmBridgeModal: openKbmBridgeModal,
    confirmOpenKbm: confirmOpenKbm,
    showNotifications: showNotifications,
    switchMasterTab: switchMasterTab,
    openAddMasterModal: function () {
      if (State.activeMasterTab === 'teachers') openTeacherModal();
      else if (State.activeMasterTab === 'classes') openClassModal();
      else if (State.activeMasterTab === 'subjects') openSubjectModal();
      else if (State.activeMasterTab === 'rooms') openRoomModal();
    },
    openTeacherModal: openTeacherModal,
    editTeacher: function (id) { openTeacherModal(id); },
    deleteTeacher: deleteTeacher,
    openClassModal: openClassModal,
    editClass: function (id) { openClassModal(id); },
    deleteClass: deleteClass,
    openSubjectModal: openSubjectModal,
    editSubject: function (id) { openSubjectModal(id); },
    deleteSubject: deleteSubject,
    openRoomModal: openRoomModal,
    editRoom: function (id) { openRoomModal(id); },
    deleteRoom: deleteRoom,
    showToast: showToast,
    // Portal Guru Methods
    renderPortalGuru: renderPortalGuru,
    openGuruSection: openGuruSection,
    closeGuruSection: closeGuruSection,
    switchGuruTab: switchGuruTab,
    changeActiveGuru: changeActiveGuru,
    toggleMethodTag: toggleMethodTag,
    handleSaveGuruJournal: handleSaveGuruJournal,
    handleJournalPhotoUpload: handleJournalPhotoUpload,
    removeJournalPhoto: removeJournalPhoto,
    loadPresensiStudents: loadPresensiStudents,
    renderPresensiTable: renderPresensiTable,
    setPresensiStatus: setPresensiStatus,
    updatePresensiNote: updatePresensiNote,
    setAllPresensi: setAllPresensi,
    handleSavePresensi: handleSavePresensi,
    renderGuruDocuments: renderGuruDocuments,
    openUploadGuruDocModal: openUploadGuruDocModal,
    handleSaveGuruDoc: handleSaveGuruDoc,
    deleteGuruDoc: deleteGuruDoc,
    toggleShowAllClasses: toggleShowAllClasses,
    handleJurnalClassChange: handleJurnalClassChange,
    populateTeacherSubjectSelect: populateTeacherSubjectSelect,
    getClassesForTeacher: getClassesForTeacher,
    stepHadirCount: stepHadirCount,
    syncJurnalAttendanceBadge: syncJurnalAttendanceBadge,
    insertQuickText: insertQuickText,
    // Firebase Cloud Methods
    openFirebaseModal: function () {
      openModal('modal-firebase-sync');
      const fb = window.FirebaseService;
      if (fb) {
        updateFirebaseUIStatus({
          status: fb.status,
          errorMessage: fb.errorMessage,
          lastSync: fb.lastSyncTime,
          projectId: 'simkur'
        });
      }
    },
    checkFirebaseConnection: async function () {
      const fb = window.FirebaseService;
      if (!fb) return;
      showToast('Memeriksa koneksi Firebase Cloud...', 'info');
      await fb.verifyConnection();
      if (fb.status === 'CONNECTED') {
        showToast('✅ Berhasil terhubung ke Firebase Firestore!', 'success');
      } else {
        showToast('⚠️ ' + (fb.errorMessage || 'Belum terhubung ke Firestore.'), 'warning');
      }
    },
    seedFirebaseData: async function () {
      const fb = window.FirebaseService;
      if (!fb) return;
      const btn = document.getElementById('btn-fb-seed');
      const progressEl = document.getElementById('fb-sync-progress');
      if (btn) btn.disabled = true;
      if (progressEl) {
        progressEl.style.display = 'block';
        progressEl.textContent = 'Memulai migrasi data ke Firebase...';
      }

      try {
        showToast('Mengunggah data master, jadwal & dokumen ke Firebase...', 'info');
        await fb.seedAllToFirestore(function (p) {
          if (progressEl) {
            progressEl.textContent = 'Mengunggah ' + p.currentKey + ' (' + p.processed + '/' + p.total + ' item - ' + p.percent + '%)...';
          }
        });
        if (progressEl) {
          progressEl.textContent = '✅ Berhasil! Seluruh data tersimpan di Firebase Firestore.';
        }
        showToast('🎉 Seluruh data SIMKUR berhasil diunggah ke Firebase Cloud!', 'success');
      } catch (err) {
        if (progressEl) {
          progressEl.textContent = '❌ Gagal: ' + err.message;
        }
        showToast('Gagal migrasi: ' + err.message, 'error');
      } finally {
        if (btn) btn.disabled = false;
      }
    },
    syncFromFirebase: async function () {
      const fb = window.FirebaseService;
      if (!fb) return;
      const progressEl = document.getElementById('fb-sync-progress');
      if (progressEl) {
        progressEl.style.display = 'block';
        progressEl.textContent = 'Mengunduh data dari Firebase Cloud...';
      }
      try {
        const res = await fb.syncFromFirestore(function (p) {
          if (progressEl) {
            progressEl.textContent = 'Sinkronisasi ' + p.currentKey + '...';
          }
        });
        if (progressEl) {
          progressEl.textContent = '✅ Berhasil menyinkronkan ' + res.count + ' dokumen dari cloud.';
        }
        refreshActiveScreen();
        showToast('✅ Sinkronisasi dari Firebase selesai!', 'success');
      } catch (err) {
        if (progressEl) {
          progressEl.textContent = '❌ Gagal: ' + err.message;
        }
        showToast('Gagal sinkronisasi: ' + err.message, 'error');
      }
    },
    resetTeacherAdminToZero: function () {
      if (!confirm('Apakah Anda yakin ingin mereset seluruh status administrasi guru ke status awal (0% / belum ada yang mengumpulkan)? Data jurnal dan dokumen guru juga akan dikosongkan.')) {
        return;
      }
      const teachers = StorageManager.get('teachers');
      const zeroMonitoring = teachers.map(function (t) {
        return {
          teacher_id: t.id,
          name: t.name,
          nip: t.nip || '-',
          department: t.department || 'Umum',
          subject: t.subject || 'Mata Pelajaran',
          rpp_status: 'Belum',
          jurnal_status: 'Belum',
          jurnal_count: 0,
          silabus_status: 'Belum',
          asesmen_status: 'Belum',
          notes: 'Belum mengumpulkan perangkat administrasi',
          updated_at: '-'
        };
      });
      StorageManager.set('teacher_admin', zeroMonitoring);
      StorageManager.set('guru_journals', []);
      StorageManager.set('guru_documents', []);
      StorageManager.set('guru_attendance', []);

      if (window.FirebaseService && typeof window.FirebaseService.resetAdministrationInFirestore === 'function') {
        window.FirebaseService.resetAdministrationInFirestore();
      }

      refreshActiveScreen();
      showToast('🎉 Seluruh administrasi guru telah direset ke 0 (Belum ada yang mengumpulkan).', 'success');
    },
    // Supervisi Akademik & Manajerial Methods (PRD SMKN 1 Banjarmasin)
    renderSupervisi: renderSupervisi,
    switchSupervisiTab: switchSupervisiTab,
    openSupervisiKlinisModal: openSupervisiKlinisModal,
    switchSupervisiKlinisStep: switchSupervisiKlinisStep,
    prevSupervisiStep: prevSupervisiStep,
    nextSupervisiStep: nextSupervisiStep,
    setRubrikScore: setRubrikScore,
    saveSupervisiKlinis: saveSupervisiKlinis,
    addSupervisiRtlRow: addSupervisiRtlRow,
    openSupervisiManajerialModal: openSupervisiManajerialModal,
    changeManajerialTarget: changeManajerialTarget,
    saveSupervisiManajerial: saveSupervisiManajerial,
    printSupervisiReport: printSupervisiReport,
    printSupervisiReportFromModal: printSupervisiReportFromModal,
    triggerSupervisiPrint: triggerSupervisiPrint,
    printSekolahSupervisiReport: printSekolahSupervisiReport,
    exportSupervisiRecap: exportSupervisiRecap,
    generateMassalSupervisiSchedules: generateMassalSupervisiSchedules,
    openScheduleSupervisiModal: openScheduleSupervisiModal,
    onSupervisiGuruSelectChange: onSupervisiGuruSelectChange,
    submitNewSupervisiSesi: submitNewSupervisiSesi,
    verifyRtlItem: verifyRtlItem,
    renderGuruSupervisiPane: renderGuruSupervisiPane,
    confirmGuruSupervisi: confirmGuruSupervisi,
    toggleGuruRTLStatus: toggleGuruRTLStatus,
    uploadGuruRTLBukti: uploadGuruRTLBukti,
    getWakaDriveUrl: getWakaDriveUrl,
    openDriveConfigModal: openDriveConfigModal,
    handleSaveDriveConfig: handleSaveDriveConfig,
    testWakaDriveLink: testWakaDriveLink,
    clearWakaDriveConfig: clearWakaDriveConfig,
    openWakaDriveFolder: openWakaDriveFolder,
    updateDriveUIElements: updateDriveUIElements,
    refreshActiveScreen: refreshActiveScreen
  };

  function refreshActiveScreen() {
    if (State.currentScreen === 'dashboard') renderDashboard();
    else if (State.currentScreen === 'dokumen') renderDocuments();
    else if (State.currentScreen === 'jadwal') renderSchedules();
    else if (State.currentScreen === 'data-master') renderDataMaster();
    else if (State.currentScreen === 'portal-guru') renderPortalGuru();
    else if (State.currentScreen === 'supervisi') renderSupervisi();
  }

  function updateFirebaseUIStatus(detail) {
    const badge = document.getElementById('firebase-sync-status-badge');
    const textEl = document.getElementById('firebase-status-text');
    const dot = document.getElementById('firebase-pulse-dot');
    const modalStatus = document.getElementById('fb-modal-status-text');
    const modalDetails = document.getElementById('fb-modal-details');

    if (!badge || !textEl || !dot) return;

    if (detail.status === 'CONNECTED') {
      badge.className = 'sync-status-badge sync-status-connected';
      textEl.textContent = 'Cloud Firebase';
      dot.className = 'pulse-dot pulse-dot-active';
      if (modalStatus) {
        modalStatus.innerHTML = '<span style="color: var(--color-success); font-weight: 700;">● Terhubung ke Cloud Firestore</span>';
      }
      if (modalDetails) {
        modalDetails.textContent = 'Data tersinkron otomatis ke Google Firebase Cloud (Project: ' + detail.projectId + ').';
      }
    } else if (detail.status === 'CONNECTING') {
      badge.className = 'sync-status-badge sync-status-connecting';
      textEl.textContent = 'Menghubungkan...';
      dot.className = 'pulse-dot pulse-dot-connecting';
      if (modalStatus) {
        modalStatus.innerHTML = '<span style="color: var(--color-warning); font-weight: 700;">● Menghubungkan ke Firebase...</span>';
      }
    } else if (detail.status === 'OFFLINE') {
      badge.className = 'sync-status-badge sync-status-offline';
      textEl.textContent = 'Mode Offline';
      dot.className = 'pulse-dot pulse-dot-offline';
      if (modalStatus) {
        modalStatus.innerHTML = '<span style="color: #64748B; font-weight: 700;">● Offline (Cache Lokal)</span>';
      }
      if (modalDetails) {
        modalDetails.textContent = detail.errorMessage || 'Koneksi internet tidak tersedia. Sistem menggunakan penyimpanan lokal.';
      }
    } else {
      badge.className = 'sync-status-badge sync-status-local';
      textEl.textContent = 'Lokal Fallback';
      dot.className = 'pulse-dot pulse-dot-warning';
      if (modalStatus) {
        modalStatus.innerHTML = '<span style="color: var(--color-warning); font-weight: 700;">● Mode Lokal (Firestore Belum Aktif)</span>';
      }
      if (modalDetails) {
        modalDetails.textContent = detail.errorMessage || 'Firestore API belum diaktifkan di Firebase Console. Gunakan panduan di bawah.';
      }
    }
  }

  window.addEventListener('simkur-firebase-status', function (e) {
    if (e.detail) updateFirebaseUIStatus(e.detail);
  });

  // Backwards compatibility alias
  window.SIMKUR_APP = window.PORTAL_APP;

  // Run when DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
  } else {
    initApp();
  }
})();
