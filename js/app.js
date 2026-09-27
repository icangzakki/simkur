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
      TEACHERS: 'portal_teachers_v1',
      CLASSES: 'portal_classes_v1',
      SUBJECTS: 'portal_subjects_v1',
      ROOMS: 'portal_rooms_v1',
      SCHEDULES: 'portal_schedules_v1',
      DOCUMENTS: 'portal_documents_v1',
      AGENDAS: 'portal_agendas_v1',
      TEACHER_ADMIN: 'portal_teacher_admin_v1',
      GURU_JOURNALS: 'portal_guru_journals_v1',
      GURU_DOCUMENTS: 'portal_guru_documents_v1',
      GURU_ATTENDANCE: 'portal_guru_attendance_v1'
    },

    init: function () {
      const data = window.SIMKUR_DATA || {};

      if (!localStorage.getItem(this.KEYS.TEACHERS)) {
        localStorage.setItem(this.KEYS.TEACHERS, JSON.stringify(data.masterTeachers || []));
      }
      if (!localStorage.getItem(this.KEYS.CLASSES)) {
        localStorage.setItem(this.KEYS.CLASSES, JSON.stringify(data.masterClasses || []));
      }
      if (!localStorage.getItem(this.KEYS.SUBJECTS)) {
        localStorage.setItem(this.KEYS.SUBJECTS, JSON.stringify(data.masterSubjects || []));
      }
      if (!localStorage.getItem(this.KEYS.ROOMS)) {
        localStorage.setItem(this.KEYS.ROOMS, JSON.stringify(data.masterRooms || []));
      }
      const storedScheds = localStorage.getItem(this.KEYS.SCHEDULES);
      if (!storedScheds || JSON.parse(storedScheds).length < 50) {
        localStorage.setItem(this.KEYS.SCHEDULES, JSON.stringify(data.schedules || []));
      }
      if (!localStorage.getItem(this.KEYS.DOCUMENTS)) {
        localStorage.setItem(this.KEYS.DOCUMENTS, JSON.stringify(data.documents || []));
      }
      if (!localStorage.getItem(this.KEYS.AGENDAS)) {
        localStorage.setItem(this.KEYS.AGENDAS, JSON.stringify(data.agendas || []));
      }

      // Inisialisasi Monitoring Administrasi Guru (90 Guru)
      if (!localStorage.getItem(this.KEYS.TEACHER_ADMIN)) {
        const teachers = this.get('teachers');
        const monitoring = teachers.map(function (t, idx) {
          const isRppDone = idx < 78;
          const isJurnalDone = idx < 82;
          const isSilabusDone = idx < 85;
          const isAsesmenDone = idx < 74;

          return {
            teacher_id: t.id,
            name: t.name,
            nip: t.nip || '-',
            department: t.department || 'Umum',
            subject: t.subject || 'Mata Pelajaran',
            rpp_status: isRppDone ? 'Lengkap' : (idx < 84 ? 'Review' : 'Belum'),
            jurnal_status: isJurnalDone ? 'Sudah' : 'Belum',
            jurnal_count: isJurnalDone ? (10 + (idx % 12)) : 0,
            silabus_status: isSilabusDone ? 'Lengkap' : 'Belum',
            asesmen_status: isAsesmenDone ? 'Lengkap' : 'Belum',
            notes: isRppDone && isJurnalDone ? 'Perangkat pembelajaran semester ganjil lengkap' : 'Perlu upload kelengkapan perangkat',
            updated_at: '2026-09-26'
          };
        });
        localStorage.setItem(this.KEYS.TEACHER_ADMIN, JSON.stringify(monitoring));
      }

      // Inisialisasi Riwayat Jurnal Guru (Awal untuk T-010 / Ahmad Gajali)
      if (!localStorage.getItem(this.KEYS.GURU_JOURNALS)) {
        const sampleJournals = [
          {
            id: 'JRN-018',
            teacher_id: 'T-010',
            teacher_name: 'Ahmad Gajali',
            class_name: 'XI A-TJKT',
            subject_name: 'Administrasi Sistem Jaringan & Cloud Infrastructure',
            date: '2026-09-25',
            time: 'Jam 1-4 (07:15 - 10:15 WITA)',
            topic: 'Konfigurasi MikroTik RouterOS: Implementasi VLAN Trunking, Inter-VLAN Routing, dan DHCP Server.',
            methods: ['Project Based Learning (PjBL)', 'Praktikum Lab Bengkel'],
            notes: 'Kelompok 3 perlu pendampingan crimping serat optik. Sisa modul konfigurasi firewall dilanjutkan Kamis blok praktek.',
            hadir_count: 34,
            total_students: 36,
            photo: 'assets/teacher_avatar.jpg',
            status: 'Terverifikasi Waka Kur',
            created_at: '2026-09-25 10:20'
          },
          {
            id: 'JRN-017',
            teacher_id: 'T-010',
            teacher_name: 'Ahmad Gajali',
            class_name: 'XI B-TJKT',
            subject_name: 'Administrasi Sistem Jaringan & Cloud Infrastructure',
            date: '2026-09-22',
            time: 'Jam 5-8 (10:30 - 13:30 WITA)',
            topic: 'Instalasi & Manajemen Server Linux Debian 12: Konfigurasi DNS Server (BIND9) & Virtual Host Apache.',
            methods: ['Praktikum Lab Bengkel', 'Problem Based Learning'],
            notes: 'Seluruh kelompok berhasil memetakan domain lokal .smkn1bjm.sch.id di lab workstation.',
            hadir_count: 36,
            total_students: 36,
            photo: '',
            status: 'Terverifikasi Waka Kur',
            created_at: '2026-09-22 13:40'
          },
          {
            id: 'JRN-016',
            teacher_id: 'T-010',
            teacher_name: 'Ahmad Gajali',
            class_name: 'XI A-TJKT',
            subject_name: 'Administrasi Sistem Jaringan & Cloud Infrastructure',
            date: '2026-09-18',
            time: 'Jam 1-4 (07:15 - 10:15 WITA)',
            topic: 'Subnetting IPv4 CIDR VLSM dan Alokasi IP Address Lab Komputer Jaringan Terpadu.',
            methods: ['Problem Based Learning', 'Diskusi Reflektif'],
            notes: 'Tugas mandiri perhitungan subnetting prefix /27 dan /28 terkumpul 100%.',
            hadir_count: 35,
            total_students: 36,
            photo: '',
            status: 'Terverifikasi Waka Kur',
            created_at: '2026-09-18 10:15'
          }
        ];
        localStorage.setItem(this.KEYS.GURU_JOURNALS, JSON.stringify(sampleJournals));
      }

      // Inisialisasi Dokumen Perangkat Ajar Guru (Awal untuk T-010 / Ahmad Gajali)
      if (!localStorage.getItem(this.KEYS.GURU_DOCUMENTS)) {
        const sampleGuruDocs = [
          {
            id: 'GDOC-001',
            teacher_id: 'T-010',
            title: 'Modul Ajar ASJ Fase F (MikroTik & Linux Server)',
            category: 'Modul Ajar',
            school_year: '2026/2027',
            file_name: 'Modul_Ajar_ASJ_FaseF_2026.pdf',
            file_size: '1.8 MB',
            status: 'Disetujui Waka Kur',
            score: 98,
            notes: 'Sesuai dengan Alur Capaian Standar Proses Permendikdasmen 2026.',
            uploaded_at: '2026-07-15 08:30'
          },
          {
            id: 'GDOC-002',
            teacher_id: 'T-010',
            title: 'Alur Tujuan Pembelajaran (ATP) Konsentrasi Keahlian TJKT',
            category: 'Silabus & ATP',
            school_year: '2026/2027',
            file_name: 'ATP_TJKT_FaseF_2026.pdf',
            file_size: '920 KB',
            status: 'Disetujui Waka Kur',
            score: 95,
            notes: 'Terintegrasi dengan materi sertifikasi kompetensi LSP-P1.',
            uploaded_at: '2026-07-18 10:15'
          },
          {
            id: 'GDOC-003',
            teacher_id: 'T-010',
            title: 'Program Tahunan (Prota) & Program Semester (Prosem) Ganjil',
            category: 'Program Tahunan & Semester',
            school_year: '2026/2027',
            file_name: 'Prota_Prosem_ASJ_2026.xlsx',
            file_size: '450 KB',
            status: 'Disetujui Waka Kur',
            score: 94,
            notes: 'Alokasi pekan efektif 18 minggu telah diverifikasi.',
            uploaded_at: '2026-07-20 09:00'
          },
          {
            id: 'GDOC-004',
            teacher_id: 'T-010',
            title: 'Perangkat Asesmen & Rubrik Praktikum Konfigurasi Jaringan',
            category: 'Instrumen Asesmen',
            school_year: '2026/2027',
            file_name: 'Rubrik_Asesmen_Praktik_ASJ.pdf',
            file_size: '1.2 MB',
            status: 'Disetujui Waka Kur',
            score: 96,
            notes: 'Dilengkapi pedoman penskoran dan asesmen performa kerja.',
            uploaded_at: '2026-08-02 11:30'
          }
        ];
        localStorage.setItem(this.KEYS.GURU_DOCUMENTS, JSON.stringify(sampleGuruDocs));
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
      }
      return items;
    },

    delete: function (key, id) {
      let items = this.get(key);
      items = items.filter(function (i) {
        return String(i.id || i.teacher_id) !== String(id);
      });
      this.set(key, items);
      return items;
    }
  };

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
    scheduleDayFilter: 'all',
    scheduleClassFilter: 'all',
    scheduleTeacherFilter: 'all',
    scheduleSearchQuery: '',
    dashScheduleQuery: '',
    dashScheduleClassFilter: 'all',
    masterSearchQuery: '',
    editingItem: null,
    // Portal Guru State
    activeGuruTab: 'jurnal', // 'jurnal' | 'presensi' | 'dokumen'
    currentGuruId: 'T-010', // Default Ahmad Gajali
    presensiClass: 'XI A-AKL',
    showAllClassesForGuru: false,
    presensiStudents: [],
    tempJournalPhoto: null
  };

  // =========================================================================
  // 3. TOAST & NOTIFICATION HELPER
  // =========================================================================
  function showToast(message, type) {
    const container = document.getElementById('toast-container');
    if (!container) return;

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
  // 5. NAVIGATION CONTROLLER (5 MENUS)
  // =========================================================================
  function switchScreen(screenName) {
    // Access guard: guru-only sessions cannot visit restricted screens
    try {
      var _sess = JSON.parse(localStorage.getItem('simkur_session') || 'null');
      if (_sess && _sess.accessLevel === 'guru-only') {
        var _restricted = ['dashboard', 'dokumen', 'jadwal', 'data-master'];
        if (_restricted.indexOf(screenName) !== -1) {
          screenName = 'portal-guru';
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
    const titleEl = document.getElementById('topbar-active-screen');
    if (titleEl) {
      const titles = {
        'dashboard': 'Dashboard Kurikulum',
        'dokumen': 'Dokumen & Administrasi',
        'jadwal': 'Jadwal Pelajaran',
        'data-master': 'Data Master Kurikulum',
        'portal-guru': 'Portal Guru — KBM'
      };
      titleEl.textContent = titles[screenName] || 'Portal Kurikulum';
    }

    // Close mobile sidebar if open
    closeMobileSidebar();

    // Trigger Screen Render
    if (screenName === 'dashboard') renderDashboard();
    else if (screenName === 'dokumen') renderDocuments();
    else if (screenName === 'jadwal') renderSchedules();
    else if (screenName === 'data-master') renderDataMaster();
    else if (screenName === 'portal-guru') renderPortalGuru();

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

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

    // 2. Render Jadwal Hari Ini
    renderDashboardSchedule(schedules);

    // 3. Render Agenda Kurikulum
    renderDashboardAgendas(agendas);
  }

  function renderDashboardSchedule(schedules) {
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

    let dayFiltered = daySchedules.filter(function (s) {
      const matchClass = classFilter === 'all' || s.class_name === classFilter;
      const matchSearch = !searchQuery ||
        (s.subject_name && s.subject_name.toLowerCase().includes(searchQuery)) ||
        (s.teacher_name && s.teacher_name.toLowerCase().includes(searchQuery)) ||
        (s.class_name && s.class_name.toLowerCase().includes(searchQuery)) ||
        (s.room_name && s.room_name.toLowerCase().includes(searchQuery));
      return matchClass && matchSearch;
    });

    // Sort chronologically by start_time, then class_name
    dayFiltered.sort(function (a, b) {
      const timeCompare = (a.start_time || '').localeCompare(b.start_time || '');
      if (timeCompare !== 0) return timeCompare;
      return (a.class_name || '').localeCompare(b.class_name || '');
    });

    const tbody = document.getElementById('dash-schedule-tbody');
    const labelDay = document.getElementById('dash-current-day-label');
    if (labelDay) {
      labelDay.textContent = 'Hari: ' + day + ' • ' + dayFiltered.length + ' Sesi KBM' + (classFilter !== 'all' || searchQuery ? ' (Tersaring)' : ' (Revisi 2 X-XI)');
    }

    if (!tbody) return;

    if (dayFiltered.length === 0) {
      tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; padding: 2.5rem; color: #888888;">' +
        '<div style="font-size: 2rem; margin-bottom: 0.5rem;">📅</div>' +
        '<strong>Tidak ada jadwal yang cocok untuk hari ' + day + '</strong>' +
        '<p style="font-size: 0.8125rem; color: #999; margin-top: 4px;">' +
        (searchQuery || classFilter !== 'all' ? 'Coba reset filter atau pencarian Anda.' : 'Gunakan menu Jadwal Pelajaran untuk menyusun jadwal.') +
        '</p>' +
        '</td></tr>';
      return;
    }

    let html = '';
    dayFiltered.forEach(function (s) {
      html += '<tr>' +
        '<td style="font-weight: 600; color: #262626;"><span class="badge badge-neutral" style="font-family: monospace;">' + s.start_time + ' - ' + s.end_time + '</span></td>' +
        '<td><span class="badge badge-primary" style="font-weight: 700;">' + s.class_name + '</span></td>' +
        '<td style="font-weight: 600; color: #262626;">' + s.subject_name + '</td>' +
        '<td>' + s.teacher_name + '</td>' +
        '<td><span class="badge badge-outline">' + s.room_name + '</span></td>' +
        '</tr>';
    });

    tbody.innerHTML = html;
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

    let html = '';
    agendas.forEach(function (a) {
      html += '<div style="display: flex; gap: 12px; align-items: flex-start; padding: 0.75rem 0; border-bottom: 1px solid #eeeeee;">' +
        '<div style="background: #EDE7FF; color: #4B22B8; font-weight: 700; font-size: 0.75rem; padding: 6px 10px; border-radius: 8px; text-align: center; min-width: 68px;">' +
        (a.date || 'TBA') +
        '</div>' +
        '<div style="flex: 1;">' +
        '<div style="font-weight: 600; font-size: 0.875rem; color: #262626;">' + a.title + '</div>' +
        '<div style="font-size: 0.775rem; color: #777777; margin-top: 2px;">' + (a.description || '-') + '</div>' +
        '</div>' +
        '<button class="btn btn-ghost btn-sm" style="color: #dc2626; padding: 4px;" onclick="window.PORTAL_APP.deleteAgenda(\'' + a.id + '\')" title="Hapus Agenda">✕</button>' +
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
  }

  function switchDocTab(tabName) {
    State.activeDocTab = tabName;
    renderDocuments();
  }

  // 7.1 TAB MONITORING KELENGKAPAN GURU (90 GURU)
  function renderTeacherAdminTable(monitoring) {
    const tbody = document.getElementById('teacher-admin-tbody');
    const badgeTotal = document.getElementById('doc-teacher-total-badge');
    if (!tbody) return;

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
      tbody.innerHTML = '<tr><td colspan="8" style="text-align: center; padding: 2.5rem; color: #888888;">' +
        '<strong>Tidak ada data guru yang sesuai dengan filter pencarian</strong>' +
        '<p style="font-size: 0.8125rem; color: #999; margin-top: 4px;">Ubah filter atau bersihkan kolom pencarian.</p>' +
        '</td></tr>';
      return;
    }

    let html = '';
    filtered.forEach(function (m, idx) {
      // Badge RPP
      let rppBadge = '<span class="badge badge-success" style="font-size: 0.75rem;">✅ Lengkap</span>';
      if (m.rpp_status === 'Review') {
        rppBadge = '<span class="badge badge-warning" style="font-size: 0.75rem;">⏳ Review</span>';
      } else if (m.rpp_status === 'Belum') {
        rppBadge = '<span class="badge badge-danger" style="font-size: 0.75rem;">❌ Belum</span>';
      }

      // Badge Jurnal
      let jurnalBadge = '<span class="badge badge-primary" style="font-size: 0.75rem;">✅ ' + (m.jurnal_count || 12) + ' Sesi</span>';
      if (m.jurnal_status === 'Belum') {
        jurnalBadge = '<span class="badge badge-danger" style="font-size: 0.75rem;">❌ 0 Sesi</span>';
      }

      // Badge Silabus
      let silabusBadge = m.silabus_status === 'Lengkap'
        ? '<span class="badge badge-success" style="font-size: 0.75rem;">✅ Ada</span>'
        : '<span class="badge badge-neutral" style="font-size: 0.75rem;">❌ Belum</span>';

      // Badge Asesmen
      let asesmenBadge = m.asesmen_status === 'Lengkap'
        ? '<span class="badge badge-success" style="font-size: 0.75rem;">✅ Ada</span>'
        : '<span class="badge badge-neutral" style="font-size: 0.75rem;">❌ Belum</span>';

      // Overall Status
      const isAllDone = m.rpp_status === 'Lengkap' && m.jurnal_status === 'Sudah' && m.silabus_status === 'Lengkap';
      const statusPill = isAllDone
        ? '<span class="badge" style="background: #E8FAF3; color: #20C985; font-weight: 700; font-size: 0.75rem;">Lengkap</span>'
        : '<span class="badge" style="background: #FEF3C7; color: #D97706; font-weight: 700; font-size: 0.75rem;">Ada Pending</span>';

      html += '<tr>' +
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
        '<td>' + statusPill + '</td>' +
        '<td>' +
        '<button class="btn btn-outline btn-sm" onclick="window.PORTAL_APP.openTeacherAdminModal(\'' + m.teacher_id + '\')" title="Update Status Kelengkapan">' +
        '✏️ Update' +
        '</button>' +
        '</td>' +
        '</tr>';
    });

    tbody.innerHTML = html;
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

  // 7.2 TAB ARSIP DOKUMEN SEKOLAH
  function renderArchiveDocsTable(docs) {
    const tbody = document.getElementById('doc-table-tbody');
    const badgeCount = document.getElementById('doc-total-badge');
    if (badgeCount) badgeCount.textContent = docs.length + ' Dokumen';

    if (!tbody) return;

    const filtered = docs.filter(function (d) {
      const matchesSearch = !State.docSearchQuery ||
        (d.name && d.name.toLowerCase().includes(State.docSearchQuery.toLowerCase())) ||
        (d.description && d.description.toLowerCase().includes(State.docSearchQuery.toLowerCase()));

      const matchesCategory = State.docCategoryFilter === 'all' || d.category === State.docCategoryFilter;
      const matchesYear = State.docYearFilter === 'all' || d.school_year === State.docYearFilter;

      return matchesSearch && matchesCategory && matchesYear;
    });

    if (filtered.length === 0) {
      tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; padding: 3rem; color: #888888;">' +
        '<div style="font-size: 2.2rem; margin-bottom: 0.5rem;">📁</div>' +
        '<strong>Tidak ada arsip dokumen yang sesuai</strong>' +
        '<p style="font-size: 0.8125rem; color: #999; margin-top: 4px;">Ubah filter atau unggah dokumen baru.</p>' +
        '</td></tr>';
      return;
    }

    let html = '';
    filtered.forEach(function (d) {
      html += '<tr>' +
        '<td>' +
        '<div style="display: flex; align-items: center; gap: 10px;">' +
        '<div style="width: 36px; height: 36px; border-radius: 8px; background: #EDE7FF; color: #4B22B8; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 0.75rem; flex-shrink: 0;">PDF</div>' +
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

    tbody.innerHTML = html;
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
    const tbody = document.getElementById('sched-table-tbody');
    const badgeCount = document.getElementById('sched-total-badge');
    if (badgeCount) badgeCount.textContent = schedules.length + ' Sesi';

    populateScheduleFilters(classes, teachers);

    if (!tbody) return;

    const filtered = schedules.filter(function (s) {
      const matchesDay = State.scheduleDayFilter === 'all' || s.day === State.scheduleDayFilter;
      const matchesClass = State.scheduleClassFilter === 'all' || String(s.class_id) === String(State.scheduleClassFilter) || s.class_name === State.scheduleClassFilter;
      const matchesTeacher = State.scheduleTeacherFilter === 'all' || String(s.teacher_id) === String(State.scheduleTeacherFilter) || s.teacher_name === State.scheduleTeacherFilter;
      const matchesSearch = !State.scheduleSearchQuery ||
        (s.subject_name && s.subject_name.toLowerCase().includes(State.scheduleSearchQuery.toLowerCase())) ||
        (s.teacher_name && s.teacher_name.toLowerCase().includes(State.scheduleSearchQuery.toLowerCase())) ||
        (s.class_name && s.class_name.toLowerCase().includes(State.scheduleSearchQuery.toLowerCase())) ||
        (s.room_name && s.room_name.toLowerCase().includes(State.scheduleSearchQuery.toLowerCase()));

      return matchesDay && matchesClass && matchesTeacher && matchesSearch;
    });

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

  function populateScheduleFilters(classes, teachers) {
    const selClass = document.getElementById('sched-class-filter');
    const selTeacher = document.getElementById('sched-teacher-filter');

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
  // 9. SCREEN 4: DATA MASTER (GURU, KELAS, MAPEL, RUANG)
  // =========================================================================
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
  }

  function switchMasterTab(tabName) {
    State.activeMasterTab = tabName;
    renderDataMaster();
  }

  // 9.1 Master Guru
  function renderMasterTeachers(teachers) {
    const tbody = document.getElementById('master-teachers-tbody');
    if (!tbody) return;

    const q = (State.masterSearchQuery || '').toLowerCase();
    const filtered = teachers.filter(function (t) {
      return !q || (t.name && t.name.toLowerCase().includes(q)) || (t.nip && t.nip.includes(q)) || (t.subject && t.subject.toLowerCase().includes(q));
    });

    if (filtered.length === 0) {
      tbody.innerHTML = '<tr><td colspan="7" style="text-align:center; padding: 2rem; color: #888;">Tidak ada data guru yang cocok.</td></tr>';
      return;
    }

    let html = '';
    filtered.forEach(function (t, i) {
      html += '<tr>' +
        '<td style="text-align: center; color: #888; font-size: 0.8125rem;">' + (i + 1) + '</td>' +
        '<td style="font-weight: 600; color: #262626;">' + t.name + '</td>' +
        '<td style="font-family: monospace; font-size: 0.8125rem;">' + (t.nip || '-') + '</td>' +
        '<td><span class="badge badge-neutral">' + (t.department || 'Umum') + '</span></td>' +
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
    });

    tbody.innerHTML = html;
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
    if (!tbody) return;

    const q = (State.masterSearchQuery || '').toLowerCase();
    const filtered = classes.filter(function (c) {
      return !q || (c.name && c.name.toLowerCase().includes(q)) || (c.major && c.major.toLowerCase().includes(q));
    });

    if (filtered.length === 0) {
      tbody.innerHTML = '<tr><td colspan="7" style="text-align:center; padding: 2rem; color: #888;">Tidak ada data kelas yang cocok.</td></tr>';
      return;
    }

    let html = '';
    filtered.forEach(function (c, i) {
      html += '<tr>' +
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
    });

    tbody.innerHTML = html;
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
    if (!tbody) return;

    const q = (State.masterSearchQuery || '').toLowerCase();
    const filtered = subjects.filter(function (s) {
      return !q || (s.name && s.name.toLowerCase().includes(q)) || (s.code && s.code.toLowerCase().includes(q));
    });

    if (filtered.length === 0) {
      tbody.innerHTML = '<tr><td colspan="6" style="text-align:center; padding: 2rem; color: #888;">Tidak ada data mata pelajaran.</td></tr>';
      return;
    }

    let html = '';
    filtered.forEach(function (s, i) {
      html += '<tr>' +
        '<td style="text-align: center; color: #888; font-size: 0.8125rem;">' + (i + 1) + '</td>' +
        '<td><span class="badge badge-neutral" style="font-family: monospace; font-weight: 700;">' + s.code + '</span></td>' +
        '<td style="font-weight: 600; color: #262626;">' + s.name + '</td>' +
        '<td><span class="badge ' + (s.category === 'Kejuruan' ? 'badge-primary' : 'badge-outline') + '">' + (s.category || 'Umum') + '</span></td>' +
        '<td><span class="badge ' + (s.is_active ? 'badge-success' : 'badge-neutral') + '">' + (s.is_active ? '● Aktif' : '○ Nonaktif') + '</span></td>' +
        '<td>' +
        '<div style="display: flex; gap: 6px;">' +
        '<button class="btn btn-outline btn-sm" onclick="window.PORTAL_APP.editSubject(\'' + s.id + '\')">✏️ Edit</button>' +
        '<button class="btn btn-ghost btn-sm" style="color: #dc2626;" onclick="window.PORTAL_APP.deleteSubject(\'' + s.id + '\')">🗑️</button>' +
        '</div>' +
        '</td>' +
        '</tr>';
    });

    tbody.innerHTML = html;
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
    if (!tbody) return;

    const q = (State.masterSearchQuery || '').toLowerCase();
    const filtered = rooms.filter(function (r) {
      return !q || (r.name && r.name.toLowerCase().includes(q)) || (r.description && r.description.toLowerCase().includes(q));
    });

    if (filtered.length === 0) {
      tbody.innerHTML = '<tr><td colspan="5" style="text-align:center; padding: 2rem; color: #888;">Tidak ada data ruang.</td></tr>';
      return;
    }

    let html = '';
    filtered.forEach(function (r, i) {
      html += '<tr>' +
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
    });

    tbody.innerHTML = html;
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
        }
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
  }

  // =========================================================================
  // 10. PORTAL GURU CONTROLLER (JURNAL, PRESENSI, & UPLOAD DOKUMEN)
  // =========================================================================
  function renderPortalGuru() {
    const teachers = StorageManager.get('teachers');
    const currentTeacherId = State.currentGuruId || 'T-010';
    const teacher = teachers.find(function (t) {
      return String(t.id) === String(currentTeacherId);
    }) || teachers[0] || {
      id: 'T-010',
      name: 'Ahmad Gajali',
      nip: '19890609 202521 1 023',
      department: 'TJKT',
      subject: 'Administrasi Sistem Jaringan & Cloud Infrastructure'
    };

    // 1. Populate teacher switch dropdown if needed
    const selectGuru = document.getElementById('select-active-guru');
    if (selectGuru && selectGuru.options.length <= 1) {
      selectGuru.innerHTML = teachers.map(function (t) {
        return '<option value="' + t.id + '"' + (String(t.id) === String(currentTeacherId) ? ' selected' : '') + '>' +
          t.name + ' (' + (t.department || 'Umum') + ')' +
        '</option>';
      }).join('');
    } else if (selectGuru) {
      selectGuru.value = currentTeacherId;
    }

    // 2. Update Teacher Header Info
    const elName = document.getElementById('portal-guru-name');
    const elMeta = document.getElementById('portal-guru-meta');
    const elBadge = document.getElementById('portal-guru-badge');
    if (elName) elName.textContent = teacher.name;
    if (elMeta) elMeta.textContent = 'NIP: ' + (teacher.nip || '-') + ' • Jurusan: ' + (teacher.department || 'Kejuruan') + ' • ' + (teacher.subject || 'Mata Pelajaran Produktif');
    if (elBadge) elBadge.textContent = 'Guru Pengampu ' + (teacher.department || 'Kejuruan');

    // 3. Update KPI Cards
    const journals = StorageManager.get('guru_journals').filter(function (j) {
      return String(j.teacher_id) === String(currentTeacherId);
    });
    const docs = StorageManager.get('guru_documents').filter(function (d) {
      return String(d.teacher_id) === String(currentTeacherId);
    });

    const elJurnalCount = document.getElementById('kpi-guru-jurnal-count');
    if (elJurnalCount) elJurnalCount.textContent = (journals.length || 18) + ' Sesi';

    const elDocCount = document.getElementById('kpi-guru-doc-count');
    if (elDocCount) elDocCount.textContent = (docs.length || 4) + ' / 4 Berkas';

    // 4. Populate Class Options in Jurnal & Presensi Forms (Filtered by Teacher)
    populateTeacherClassSelects(currentTeacherId);

    // Set default date in forms if empty
    const todayStr = new Date().toISOString().split('T')[0];
    const dateJurnal = document.getElementById('input-guru-jurnal-date');
    if (dateJurnal && !dateJurnal.value) dateJurnal.value = todayStr;
    const datePresensi = document.getElementById('input-presensi-date');
    if (datePresensi && !datePresensi.value) datePresensi.value = todayStr;

    // 5. Render Active Subtab
    const activeTab = State.activeGuruTab || 'jurnal';
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

    if (activeTab === 'jurnal') {
      if (paneJurnal) paneJurnal.style.display = 'block';
      if (panePresensi) panePresensi.style.display = 'none';
      if (paneDokumen) paneDokumen.style.display = 'none';
      renderGuruJournalHistory();
    } else if (activeTab === 'presensi') {
      if (paneJurnal) paneJurnal.style.display = 'none';
      if (panePresensi) panePresensi.style.display = 'block';
      if (paneDokumen) paneDokumen.style.display = 'none';
      loadPresensiStudents();
    } else if (activeTab === 'dokumen') {
      if (paneJurnal) paneJurnal.style.display = 'none';
      if (panePresensi) panePresensi.style.display = 'none';
      if (paneDokumen) paneDokumen.style.display = 'block';
      renderGuruDocuments();
    }
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

  function updateJurnalAttendanceSummary(className) {
    const roster = window.SIMKUR_DATA && window.SIMKUR_DATA.studentRoster;
    const students = (roster && roster[className]) || [];
    const total = students.length || 36;
    const defaultHadir = Math.max(0, total - 2);

    const hadirInput = document.getElementById('input-guru-jurnal-hadir-count');
    const totalSpan = document.getElementById('jurnal-hadir-total-label');
    const badge = document.getElementById('jurnal-attendance-badge');

    if (hadirInput) {
      hadirInput.max = total;
      hadirInput.value = defaultHadir;
    }
    if (totalSpan) totalSpan.textContent = '/ ' + total + ' Siswa Hadir';
    if (badge) {
      const pct = ((defaultHadir / total) * 100).toFixed(1);
      badge.textContent = defaultHadir + ' Hadir, 2 Sakit dari ' + total + ' Siswa (' + pct + '%)';
    }
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
    if (State.activeGuruTab === 'presensi') {
      loadPresensiStudents();
    }
  }

  function switchGuruTab(tabName) {
    State.activeGuruTab = tabName;
    renderPortalGuru();
  }

  function changeActiveGuru(teacherId) {
    State.currentGuruId = teacherId;
    const teacher = StorageManager.get('teachers').find(function (t) {
      return String(t.id) === String(teacherId);
    });

    // Reset presensiClass to first class of newly selected teacher
    const data = getClassesForTeacher(teacherId, State.showAllClassesForGuru);
    if (data.teacherClasses.length > 0) {
      State.presensiClass = data.teacherClasses[0].className;
    }

    // Auto-update subject field in Jurnal form to teacher's subject
    const subjInput = document.getElementById('input-guru-jurnal-subject');
    if (subjInput && teacher && teacher.subject) {
      subjInput.value = teacher.subject;
    }

    showToast('Beralih ke akun: ' + (teacher ? teacher.name : teacherId) + ' (' + (data.teacherClasses.length) + ' rombel binaan)', 'info');
    renderPortalGuru();
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
      listEl.innerHTML = '<div style="text-align: center; padding: 2rem; color: #777777;">Belum ada riwayat jurnal yang diisi. Silakan isi formulir di atas.</div>';
      return;
    }

    let html = '';
    teacherJournals.forEach(function (j) {
      const methodsHtml = (j.methods || []).map(function (m) {
        return '<span class="badge" style="background: rgba(75, 34, 184, 0.08); color: #4B22B8; font-size: 0.72rem; padding: 2px 8px; border-radius: 999px;">' + m + '</span>';
      }).join(' ');

      html += '<div style="background: #ffffff; border: 1px solid #ECECF2; border-radius: 12px; padding: 1.125rem; margin-bottom: 0.875rem; box-shadow: 0 1px 4px rgba(0,0,0,0.03);">' +
        '<div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.5rem; flex-wrap: wrap; gap: 6px;">' +
          '<div style="display: flex; align-items: center; gap: 8px;">' +
            '<span class="badge" style="background: #EDE8F5; color: #4B22B8; font-weight: 700; font-size: 0.75rem;">' + (j.date || 'Hari Ini') + '</span>' +
            '<span style="font-weight: 700; color: #262626; font-size: 0.9375rem;">' + j.class_name + '</span>' +
            '<span style="color: #777777; font-size: 0.8125rem;">• ' + (j.time || 'Jam 1-4') + '</span>' +
          '</div>' +
          '<span class="badge" style="background: #DEF7EC; color: #03543F; font-weight: 700; font-size: 0.75rem;">✓ ' + (j.status || 'Terverifikasi Waka Kur') + '</span>' +
        '</div>' +
        '<div style="font-size: 0.875rem; color: #374151; font-weight: 600; margin-bottom: 6px;">' + j.topic + '</div>' +
        (j.notes ? '<div style="font-size: 0.8125rem; color: #6B7280; margin-bottom: 8px; font-style: italic;">Catatan: ' + j.notes + '</div>' : '') +
        '<div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 8px; border-top: 1px solid #F3F4F6; padding-top: 8px; margin-top: 8px;">' +
          '<div style="display: flex; gap: 6px; align-items: center; flex-wrap: wrap;">' +
            methodsHtml +
          '</div>' +
          '<div style="display: flex; align-items: center; gap: 10px; font-size: 0.8125rem; color: #4B5563;">' +
            '<span>👥 Presensi: <strong>' + (j.hadir_count || 34) + ' / ' + (j.total_students || 36) + ' Hadir</strong></span>' +
            (j.photo ? '<span class="badge" style="background: #E0F2FE; color: #0369A1; font-size: 0.72rem;">📸 Foto KBM Ada</span>' : '') +
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

    const newJournal = {
      id: 'JRN-' + Date.now(),
      teacher_id: State.currentGuruId,
      teacher_name: teacher.name,
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

  function handleJournalPhotoUpload(event) {
    const file = event.target.files && event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function (e) {
      State.tempJournalPhoto = e.target.result;
      const previewBox = document.getElementById('jurnal-photo-preview-box');
      const previewImg = document.getElementById('jurnal-preview-img');
      const filenameEl = document.getElementById('jurnal-photo-filename');
      const detailsEl = document.getElementById('jurnal-photo-details');

      if (previewImg) previewImg.src = e.target.result;
      if (filenameEl) filenameEl.textContent = file.name;
      if (detailsEl) detailsEl.textContent = 'Ukuran: ' + (file.size / 1024 / 1024).toFixed(1) + ' MB • ' + new Date().toLocaleTimeString('id-ID');
      if (previewBox) previewBox.style.display = 'block';
      showToast('Foto dokumentasi KBM berhasil diunggah!');
    };
    reader.readAsDataURL(file);
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

    const allDocs = StorageManager.get('guru_documents');
    const teacherDocs = allDocs.filter(function (d) {
      return String(d.teacher_id) === String(State.currentGuruId);
    });

    if (teacherDocs.length === 0) {
      tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; padding: 2rem; color: #777777;">Belum ada dokumen yang diunggah. Silakan klik tombol Unggah Dokumen.</td></tr>';
      return;
    }

    let html = '';
    teacherDocs.forEach(function (d, idx) {
      html += '<tr>' +
        '<td style="text-align: center; color: #777777;">' + (idx + 1) + '</td>' +
        '<td>' +
          '<div style="font-weight: 700; color: #262626;">' + d.title + '</div>' +
          '<div style="font-size: 0.75rem; color: #777777;">📁 ' + d.file_name + ' (' + (d.file_size || '1.2 MB') + ')</div>' +
        '</td>' +
        '<td><span class="badge" style="background: rgba(75, 34, 184, 0.1); color: #4B22B8; font-weight: 600;">' + d.category + '</span></td>' +
        '<td style="font-size: 0.8125rem; color: #666666;">' + (d.uploaded_at || '2026-07-15') + '</td>' +
        '<td style="text-align: center;"><span class="badge" style="background: #DEF7EC; color: #03543F; font-weight: 700;">✓ ' + (d.status || 'Disetujui Waka Kur') + '</span></td>' +
        '<td style="font-size: 0.8125rem; color: #666666;">' + (d.notes || 'Lengkap & Terverifikasi') + '</td>' +
        '<td>' +
          '<div style="display: flex; gap: 4px;">' +
            '<button class="btn btn-ghost btn-sm" onclick="window.PORTAL_APP.downloadDocument(\'' + d.id + '\')" title="Unduh File">⬇️</button>' +
            '<button class="btn btn-ghost btn-sm" onclick="window.PORTAL_APP.deleteGuruDoc(\'' + d.id + '\')" style="color: #dc2626;" title="Hapus">🗑️</button>' +
          '</div>' +
        '</td>' +
      '</tr>';
    });

    tbody.innerHTML = html;
  }

  function openUploadGuruDocModal() {
    openModal('modal-guru-upload-doc');
  }

  function handleSaveGuruDoc(e) {
    e.preventDefault();
    const category = document.getElementById('select-guru-doc-cat').value;
    const title = document.getElementById('input-guru-doc-title').value.trim();
    const fileInput = document.getElementById('input-guru-doc-file');
    const notes = document.getElementById('input-guru-doc-notes').value.trim();

    const fileName = fileInput && fileInput.files && fileInput.files[0] ? fileInput.files[0].name : (title.replace(/\s+/g, '_') + '.pdf');
    const fileSize = fileInput && fileInput.files && fileInput.files[0] ? (fileInput.files[0].size / 1024 / 1024).toFixed(1) + ' MB' : '1.5 MB';

    const newDoc = {
      id: 'GDOC-' + Date.now(),
      teacher_id: State.currentGuruId,
      title: title,
      category: category,
      school_year: '2026/2027',
      file_name: fileName,
      file_size: fileSize,
      status: 'Disetujui Waka Kur',
      score: 96,
      notes: notes || 'Perangkat ajar mandiri diunggah melalui Portal Guru.',
      uploaded_at: new Date().toISOString().split('T')[0]
    };

    StorageManager.add('guru_documents', newDoc);

    // Sync with Waka Kur Monitoring
    if (category === 'Modul Ajar') {
      StorageManager.update('teacher_admin', State.currentGuruId, { rpp_status: 'Lengkap' });
    } else if (category === 'Silabus & ATP') {
      StorageManager.update('teacher_admin', State.currentGuruId, { silabus_status: 'Lengkap' });
    } else if (category === 'Instrumen Asesmen') {
      StorageManager.update('teacher_admin', State.currentGuruId, { asesmen_status: 'Lengkap' });
    }

    closeModal('modal-guru-upload-doc');
    showToast('✓ Berkas perangkat ajar berhasil diunggah dan terverifikasi!');
    renderGuruDocuments();
    renderPortalGuru();
    renderDocuments(); // Sync with Waka Kur
  }

  function deleteGuruDoc(id) {
    if (confirm('Yakin ingin menghapus dokumen ini?')) {
      StorageManager.delete('guru_documents', id);
      showToast('Dokumen berhasil dihapus.');
      renderGuruDocuments();
      renderPortalGuru();
    }
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

    var isGuruOnly = session && session.accessLevel === 'guru-only';

    // Update topbar user chip from session
    if (session) {
      var chipName = document.querySelector('.topbar-user-chip [style*="font-weight: 700"]');
      var chipRole = document.querySelector('.topbar-user-chip [style*="0.6875rem"]');
      var chipAvatar = document.querySelector('.topbar-user-chip img');
      if (chipName) chipName.textContent = session.name;
      if (chipRole) chipRole.textContent = session.title || (session.role === 'waka' ? 'Waka Kurikulum' : 'Guru Pengampu');
      if (chipAvatar && session.avatar) chipAvatar.src = session.avatar;

      // Update sidebar footer user card
      var footerName = document.querySelector('.sidebar-user-footer div[style*="font-weight: 700"]');
      var footerRole = document.querySelector('.sidebar-user-footer div[style*="0.6875rem"]');
      if (footerName) footerName.textContent = session.name;
      if (footerRole) footerRole.textContent = session.title || (session.role === 'waka' ? 'Waka Kurikulum' : 'Guru');
    }

    // If guru-only: hide Dashboard, Dokumen, Jadwal, Data Master nav items
    if (isGuruOnly) {
      var restrictedScreens = ['dashboard', 'dokumen', 'jadwal', 'data-master'];
      restrictedScreens.forEach(function (screen) {
        var navLink = document.querySelector('.nav-item-link[data-screen="' + screen + '"]');
        if (navLink) {
          var li = navLink.closest('li');
          if (li) li.style.display = 'none';
        }
      });

      // Update sidebar nav section label
      var navGroupTitle = document.querySelector('.nav-group-title');
      if (navGroupTitle) navGroupTitle.textContent = 'Menu Guru';

      // Hide topbar search bar (not useful for guru-only)
      var searchPill = document.querySelector('.topbar-search-pill');
      if (searchPill) searchPill.style.display = 'none';

      // Hide compliance badge to free up topbar space
      var complianceBadge = document.querySelector('.topbar-right .badge');
      if (complianceBadge) complianceBadge.style.display = 'none';
    }

    // Pre-select the logged-in teacher in Portal Guru
    if (session && (session.role === 'guru' || session.role === 'kajur') && session.nip) {
      var allTeachers = StorageManager.get('teachers') || [];
      var matchedTeacher = allTeachers.find(function (t) {
        return String(t.nip) === String(session.nip) || t.name === session.name;
      });
      if (matchedTeacher && matchedTeacher.id) {
        State.currentGuruId = matchedTeacher.id;
      }
    }
    // ── END ACCESS CONTROL ───────────────────────────────────────────────

    const params = new URLSearchParams(window.location.search);
    var initialScreen = params.get('screen') || (isGuruOnly ? 'portal-guru' : 'dashboard');

    // Force guru-only users to portal-guru regardless of URL param
    if (isGuruOnly) initialScreen = 'portal-guru';

    const initialDocTab = params.get('tab');
    if (initialDocTab) {
      State.activeDocTab = initialDocTab;
    }
    const initialGuruTab = params.get('guruTab');
    if (initialGuruTab) {
      State.activeGuruTab = initialGuruTab;
    }
    const initialGuruId = params.get('guruId');
    if (initialGuruId) {
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
    console.log('🚀 SIMKUR Portal siap. Akses:', isGuruOnly ? 'Guru Only → Portal Guru' : 'Full Access');
  }

  // Expose global methods for inline HTML onclick handlers
  window.PORTAL_APP = {
    switchScreen: switchScreen,
    openModal: openModal,
    closeModal: closeModal,
    selectDashboardDay: selectDashboardDay,
    filterDashboardSchedule: filterDashboardSchedule,
    openAddAgendaModal: openAddAgendaModal,
    deleteAgenda: deleteAgenda,
    switchDocTab: switchDocTab,
    openTeacherAdminModal: openTeacherAdminModal,
    exportAdminRecap: exportAdminRecap,
    openUploadDocModal: openUploadDocModal,
    editDocument: function (id) { openUploadDocModal(id); },
    deleteDocument: deleteDocument,
    downloadDocument: downloadDocument,
    openScheduleModal: openScheduleModal,
    editSchedule: function (id) { openScheduleModal(id); },
    deleteSchedule: deleteSchedule,
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
    getClassesForTeacher: getClassesForTeacher
  };

  // Backwards compatibility alias
  window.SIMKUR_APP = window.PORTAL_APP;

  // Run when DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
  } else {
    initApp();
  }
})();
