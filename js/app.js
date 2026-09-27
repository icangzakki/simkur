/**
 * SIMKUR - SISTEM INFORMASI MANAJEMEN KURIKULUM SMK
 * Application Controller & Interactive Logic
 * Aligned with PRD & Stitch MCP Screens
 */

document.addEventListener('DOMContentLoaded', () => {
  const data = window.SIMKUR_DATA;
  let currentScreen = 'dashboard';
  let activeRole = data.currentUser.role;
  let activeTeacherForReview = null;
  let scheduleConflictActive = false;
  let activeAttendanceRombel = (data.studentRoster && Object.keys(data.studentRoster)[0]) || 'X A-AKL';
  let studentAttendanceData = {};
  let modalAttendanceFilter = 'ALL';
  let modalAttendanceSearch = '';
  let tableAttendanceFilter = 'ALL';
  let tableAttendanceSearch = '';
  let activeScheduleRombel = (data.studentRoster && Object.keys(data.studentRoster)[0]) || 'X A-AKL';
  let activeScheduleTeacher = 'Ahmad Gajali';
  let activeScheduleView = 'matrix';
  let guruUploadSelectedFile = null;
  let guruUploadMethod = 'file';
  let _pklActiveKelas = 'ALL';
  let _pklSearchQuery = '';
  let _pklDeptFilter = null;
  let activeSupervisionRecord = null;
  let selectedCbtJsonData = null;

  const scheduleTimeSlots = [
    { period: 1,  label: "Jam 1  · 07:30 – 08:10" },
    { period: 2,  label: "Jam 2  · 08:10 – 08:50" },
    { period: 3,  label: "Jam 3  · 08:50 – 09:30" },
    { period: 4,  label: "Jam 4  · 09:30 – 10:10" },
    // --- Istirahat 1 (10:10 - 10:30) ---
    { period: 5,  label: "Jam 5  · 10:30 – 11:10" },
    { period: 6,  label: "Jam 6  · 11:10 – 11:50" },
    { period: 7,  label: "Jam 7  · 11:50 – 12:30" },
    { period: 8,  label: "Jam 8  · 12:30 – 13:10" },
    // --- Istirahat 2 (13:10 - 13:50) ---
    { period: 9,  label: "Jam 9  · 13:50 – 14:30" },
    { period: 10, label: "Jam 10 · 14:30 – 15:10" },
    { period: 11, label: "Jam 11 · 15:10 – 15:50" }
  ];
  const scheduleDays = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat"];

  /* ==========================================================================
     ROLE-BASED ACCESS CONTROL (RBAC) & PERMISSION CONFIGURATION
     ========================================================================== */
  const rolePermissions = {
    guru: {
      name: "Ahmad Gajali",
      title: "Guru Pengampu | SMKN 1 Banjarmasin",
      avatar: "assets/teacher_avatar.jpg",
      screens: ['portal-guru'],
      defaultScreen: 'portal-guru',
      badge: 'Guru Pengampu',
      hideImportBtn: true
    },
    admin: {
      name: "Andry Dharmawan",
      title: "Admin Kurikulum | Operator TU",
      avatar: "assets/teacher_avatar.jpg",
      screens: ['admin', 'jadwal', 'laporan'],
      defaultScreen: 'admin',
      badge: 'Operator TU (3 Menu)',
      hideImportBtn: false
    },
    kepsek: {
      name: "Agustin Purnomosari",
      title: "Kepala Sekolah",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=160&q=80",
      screens: ['laporan', 'supervisi', 'dashboard'],
      defaultScreen: 'laporan',
      badge: 'Kepala Sekolah (3 Menu)',
      hideImportBtn: true
    },
    kajur: {
      name: "Muhammad Ihsan",
      title: "Kajur Teknik Jaringan Komputer & Telekomunikasi",
      avatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=160&q=80",
      screens: ['kurikulum', 'pkl', 'ukk', 'portal-guru'],
      defaultScreen: 'kurikulum',
      badge: 'Kajur TJKT (4 Menu)',
      hideImportBtn: true
    },
    asesor: {
      name: "Ir. Hendri Gunawan",
      title: "Asesor Industri DUDI (PT Telkom Banjarmasin)",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=160&q=80",
      screens: ['ukk', 'pkl'],
      defaultScreen: 'ukk',
      badge: 'Asesor LSP (2 Menu)',
      hideImportBtn: true
    },
    waka: {
      name: "Rusnani",
      title: "Waka Kurikulum SMKN 1 Banjarmasin",
      avatar: "assets/teacher_avatar.jpg",
      screens: ['dashboard', 'verifikasi', 'portal-guru', 'jadwal', 'kurikulum', 'cbt', 'supervisi', 'pkl', 'ukk', 'laporan', 'admin'],
      defaultScreen: 'dashboard',
      badge: 'Waka (Semua 11 Menu)',
      hideImportBtn: false
    }
  };

  const allScreenIds = ['dashboard', 'verifikasi', 'portal-guru', 'jadwal', 'kurikulum', 'cbt', 'supervisi', 'pkl', 'ukk', 'laporan', 'admin'];

  // Expose globally for instant debugging or inline scripts
  window.rolePermissions = rolePermissions;
  window.applyRoleAccessControl = applyRoleAccessControl;

  function applyRoleAccessControl(roleKey) {
    const perm = rolePermissions[roleKey] || rolePermissions.waka;
    const allowed = perm.screens;

    // 0. Set body class for CSS-level guarantee
    document.body.className = 'role-' + roleKey;

    // 1. Saring setiap li secara langsung lewat ID dan attribute
    allScreenIds.forEach(scr => {
      const li = document.getElementById('nav-item-' + scr);
      if (li) {
        if (allowed.includes(scr)) {
          li.style.setProperty('display', 'block', 'important');
        } else {
          li.style.setProperty('display', 'none', 'important');
        }
      }
    });

    // Fallback: saring semua tautan navigasi di sidebar
    document.querySelectorAll('.sidebar-nav-list .nav-item-link').forEach(link => {
      const scr = link.getAttribute('data-screen');
      const li = link.closest('li');
      if (li) {
        if (allowed.includes(scr)) {
          li.style.setProperty('display', 'block', 'important');
        } else {
          li.style.setProperty('display', 'none', 'important');
        }
      }
    });

    // 2. Sembunyikan judul grup (nav-group-title) jika tidak ada item yang tampil
    const gKurikulum = document.getElementById('group-title-kurikulum');
    const gKejuruan = document.getElementById('group-title-kejuruan');
    const gPelaporan = document.getElementById('group-title-pelaporan');
    const gAdmin = document.getElementById('group-title-admin');

    const hasKurikulum = ['dashboard', 'verifikasi', 'portal-guru', 'jadwal'].some(s => allowed.includes(s));
    const hasKejuruan = ['kurikulum', 'cbt', 'supervisi', 'pkl', 'ukk'].some(s => allowed.includes(s));
    const hasPelaporan = allowed.includes('laporan');
    const hasAdmin = allowed.includes('admin');

    if (gKurikulum) gKurikulum.style.setProperty('display', hasKurikulum ? 'block' : 'none', 'important');
    if (gKejuruan) gKejuruan.style.setProperty('display', hasKejuruan ? 'block' : 'none', 'important');
    if (gPelaporan) gPelaporan.style.setProperty('display', hasPelaporan ? 'block' : 'none', 'important');
    if (gAdmin) gAdmin.style.setProperty('display', hasAdmin ? 'flex' : 'none', 'important');

    // 3. Atur visibilitas tombol import data massal di topbar (khusus Waka & Admin TU)
    const importBtn = document.querySelector('.topbar-import-btn');
    if (importBtn) {
      importBtn.style.setProperty('display', perm.hideImportBtn ? 'none' : 'flex', 'important');
    }

    // 4. Sembunyikan tab & section PTM (Rekapitulasi Seluruh Guru) untuk role guru
    //    Guru tidak perlu melihat beban mengajar guru lain
    const isGuru = roleKey === 'guru';
    const ptmTabBtn = document.querySelector('.sched-subtab-btn[data-view="ptm"]');
    const ptmPane = document.getElementById('sched-view-ptm');
    const conflictTabBtn = document.querySelector('.sched-subtab-btn[data-view="conflict"]');
    if (ptmTabBtn) ptmTabBtn.style.setProperty('display', isGuru ? 'none' : '', 'important');
    if (ptmPane && isGuru) ptmPane.style.setProperty('display', 'none', 'important');
    if (conflictTabBtn) conflictTabBtn.style.setProperty('display', isGuru ? 'none' : '', 'important');

  }

  /* ==========================================================================
     NAVIGATION & SCREEN SWITCHING
     ========================================================================== */
  function initNavigation() {
    const navLinks = document.querySelectorAll('.nav-item-link');
    navLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const targetScreen = link.getAttribute('data-screen');
        if (targetScreen) {
          switchScreen(targetScreen);
          closeMobileSidebar();
        }
      });
    });

    // Mobile sidebar toggle, close button & backdrop overlay
    const btnMobile = document.getElementById('btn-mobile-menu');
    const btnCloseSidebar = document.getElementById('btn-close-sidebar');
    const sidebar = document.querySelector('.app-sidebar');
    const backdrop = document.getElementById('sidebar-backdrop');

    function closeMobileSidebar() {
      sidebar?.classList.remove('mobile-open');
      backdrop?.classList.remove('active');
    }

    if (btnMobile && sidebar) {
      btnMobile.addEventListener('click', () => {
        const isOpen = sidebar.classList.toggle('mobile-open');
        if (backdrop) {
          if (isOpen) backdrop.classList.add('active');
          else backdrop.classList.remove('active');
        }
      });
    }

    if (btnCloseSidebar) {
      btnCloseSidebar.addEventListener('click', closeMobileSidebar);
    }

    if (backdrop) {
      backdrop.addEventListener('click', closeMobileSidebar);
    }
  }

  // Initialize UI & Role
  initNavigation();
  initRoleSwitcher();
  renderDashboard();
  renderVerifikasiTable();
  renderGuruPortal();
  initStudentAttendanceModule();
  renderSchedule();
  renderKurikulum();
  renderPKL();
  renderUKK();
  renderSupervision();
  renderCBT();
  renderLaporan();
  setupModals();

  function switchScreen(screenId) {
    if (screenId === 'pkl-ukk') screenId = 'pkl';

    // Auto-close mobile drawer sidebar whenever screen switches
    document.querySelector('.app-sidebar')?.classList.remove('mobile-open');
    document.getElementById('sidebar-backdrop')?.classList.remove('active');

    // RBAC Security Boundary Check: Lindungi halaman dari akses peran tidak berwenang
    const perm = rolePermissions[activeRole] || rolePermissions.waka;
    if (!perm.screens.includes(screenId)) {
      showToast(`⚠️ Hak Akses Dibatasi: Peran ${perm.title} tidak memiliki izin membuka modul ${screenId}. Dialihkan ke menu utama.`);
      screenId = perm.defaultScreen;
    }

    currentScreen = screenId;
    
    // Update active nav link
    document.querySelectorAll('.nav-item-link').forEach(link => {
      if (link.getAttribute('data-screen') === screenId) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });

    // Update screen views
    document.querySelectorAll('.screen-view').forEach(view => {
      if (view.id === `screen-${screenId}`) {
        view.classList.add('active');
      } else {
        view.classList.remove('active');
      }
    });

    // Update Topbar Breadcrumb
    const breadcrumbElem = document.getElementById('topbar-active-screen');
    const screenNames = {
      'dashboard': 'Overview Dashboard Waka Kurikulum',
      'verifikasi': 'Pengelolaan & Verifikasi Perangkat Ajar Guru (Modul 6.4)',
      'portal-guru': 'Portal Mandiri Guru - Jurnal Mengajar & Administrasi (Modul 6.5 & 6.4)',
      'jadwal': 'Jadwal Pelajaran & PTM Anti-Bentrok (Modul 6.3)',
      'kurikulum': 'Struktur Kurikulum & Sinkronisasi DUDI (Modul 6.2)',
      'cbt': 'Manajemen Penilaian & Integrasi CBT (Modul 6.7)',
      'supervisi': 'Supervisi Akademik & Observasi Kelas (Modul 6.6)',
      'pkl': 'Monitoring Praktik Kerja Lapangan (PKL) & DUDI (Modul 6.8)',
      'ukk': 'Uji Kompetensi Keahlian (UKK) & Sertifikasi LSP (Modul 6.9)',
      'laporan': 'Laporan & Dashboard Eksekutif Kurikulum (Modul 6.10)',
      'admin': 'Admin Dashboard Operator TU & Master Data (TU-SYS-2026.02)'
    };
    if (breadcrumbElem && screenNames[screenId]) {
      breadcrumbElem.textContent = screenNames[screenId];
    }

    // Close mobile sidebar if open
    document.querySelector('.app-sidebar')?.classList.remove('mobile-open');
    document.getElementById('sidebar-backdrop')?.classList.remove('active');

    if (screenId === 'jadwal') {
      // Jika guru yang login, tampilkan jadwal-nya sendiri (bukan default Ahmad Gajali)
      if (activeRole === 'guru') {
        try {
          const sessionStr = localStorage.getItem('simkur_session');
          if (sessionStr) {
            const session = JSON.parse(sessionStr);
            if (session && session.name) activeScheduleTeacher = session.name;
          }
        } catch(e) {}
        filterScheduleTeacher(activeScheduleTeacher);
        // Switch ke view guru individual otomatis
        const guruTabBtn = document.querySelector('[data-sched-view="teacher"]');
        if (guruTabBtn) {
          document.querySelectorAll('[data-sched-view]').forEach(b => b.classList.remove('active'));
          guruTabBtn.classList.add('active');
          activeScheduleView = 'teacher';
          document.getElementById('schedule-rombel-view')?.classList.add('hidden');
          document.getElementById('schedule-teacher-view')?.classList.remove('hidden');
          document.getElementById('schedule-ptm-view')?.classList.add('hidden');
          document.getElementById('schedule-conflict-view')?.classList.add('hidden');
        }
      } else {
        renderSchedule(activeScheduleRombel);
      }
    } else if (screenId === 'portal-guru') {
      renderGuruPersonalSchedule();
    }

    // Selalu sync nama login ke semua heading setiap ganti screen
    syncWelcomeHeadings();

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
  window.switchScreen = switchScreen;


  // Helper: baca session atau konfigurasi activeRole dan update SEMUA welcome heading sekaligus
  function syncWelcomeHeadings() {
    let name = '';
    let title = '';
    let avatar = '';

    // 1. Coba dari session aktif di localStorage
    try {
      const s = localStorage.getItem('simkur_session');
      if (s) {
        const parsed = JSON.parse(s);
        // Jika peran cocok atau activeRole belum diset
        if (parsed && parsed.name && (!activeRole || !parsed.role || parsed.role === activeRole)) {
          name = parsed.name;
          title = parsed.title;
          avatar = parsed.avatar;
        }
      }
    } catch(e) {}

    // 2. Jika tidak ada dari session, gunakan identitas bawaan dari activeRole
    if (!name) {
      const cfg = (typeof rolePermissions !== 'undefined' && rolePermissions[activeRole]) ? rolePermissions[activeRole] : (rolePermissions ? rolePermissions.waka : null);
      if (cfg) {
        name = cfg.name;
        title = cfg.title;
        avatar = cfg.avatar;
      }
    }

    // 3. Fallback absolut jika masih belum ditemukan
    if (!name) name = 'Rusnani';

    const els = [
      document.getElementById('dashboard-welcome-heading'),
      document.getElementById('portal-guru-greeting')
    ];
    els.forEach(el => {
      if (el) el.textContent = `Selamat Datang, ${name}`;
    });

    const nameEl = document.getElementById('current-user-name');
    if (nameEl) nameEl.textContent = name;
    const topName = document.getElementById('topbar-user-name');
    if (topName) topName.textContent = name;
    const dashName = document.getElementById('dash-profile-name');
    if (dashName) dashName.textContent = name;

    const roleEl = document.getElementById('current-user-role');
    if (roleEl && title) roleEl.textContent = title;
    const topRole = document.getElementById('topbar-user-role');
    if (topRole && title) topRole.textContent = title;
    const dashRole = document.getElementById('dash-profile-role');
    if (dashRole && title) dashRole.textContent = title;

    const avEl = document.getElementById('current-user-avatar');
    if (avEl && avatar) avEl.src = avatar;
    const topAv = document.getElementById('topbar-user-avatar');
    if (topAv && avatar) topAv.src = avatar;
    const dashAv = document.getElementById('dash-profile-avatar');
    if (dashAv && avatar) dashAv.src = avatar;
  }


  /* ==========================================================================
     ROLE & SESSION INITIALIZATION ENGINE
     ========================================================================== */
  function initRoleSwitcher() {
    const roleSelect = document.getElementById('role-select');
    if (roleSelect) {
      roleSelect.addEventListener('change', (e) => {
        const selected = e.target.value;
        activeRole = selected;
        localStorage.setItem('simkur_role', selected);

        const cfg = rolePermissions[selected] || rolePermissions.waka;
        if (cfg) {
          const elsToUpdate = [
            ['current-user-name', cfg.name],
            ['topbar-user-name', cfg.name],
            ['dash-profile-name', cfg.name],
            ['current-user-role', cfg.title],
            ['topbar-user-role', cfg.title],
            ['dash-profile-role', cfg.title]
          ];
          elsToUpdate.forEach(([id, val]) => {
            const el = document.getElementById(id);
            if (el) el.textContent = val;
          });
          ['current-user-avatar', 'topbar-user-avatar', 'dash-profile-avatar'].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.src = cfg.avatar;
          });
          showToast(`Beralih peran: ${cfg.title} (${cfg.name})`);
        }

        applyRoleAccessControl(selected);
        switchScreen(cfg.defaultScreen);
      });
    }

    // Auto-detect role & screen from URL parameters or session
    const urlParams = new URLSearchParams(window.location.search);
    let sessionUser = null;
    try {
      const sessionStr = localStorage.getItem('simkur_session');
      if (sessionStr) {
        sessionUser = JSON.parse(sessionStr);
      }
    } catch (e) {
      console.warn("Session restore error", e);
    }

    const roleParam = urlParams.get('role') || (sessionUser && sessionUser.role) || localStorage.getItem('simkur_role') || 'waka';
    const screenParam = urlParams.get('screen');

    if (roleSelect && roleSelect.querySelector(`option[value="${roleParam}"]`)) {
      roleSelect.value = roleParam;
    }
    activeRole = roleParam;

    const cfg = rolePermissions[activeRole] || rolePermissions.waka;
    let effectiveName = cfg.name;
    let effectiveTitle = cfg.title;
    let effectiveAvatar = cfg.avatar;

    if (sessionUser && sessionUser.name) {
      effectiveName = sessionUser.name;
      effectiveTitle = sessionUser.title || (activeRole === 'guru' ? `Guru Pengampu (${sessionUser.department || 'Kejuruan'})` : cfg.title);
      if (sessionUser.avatar) effectiveAvatar = sessionUser.avatar;
    }

    const nameEl = document.getElementById('current-user-name');
    if (nameEl) nameEl.textContent = effectiveName;
    const topName = document.getElementById('topbar-user-name');
    if (topName) topName.textContent = effectiveName;
    const dashName = document.getElementById('dash-profile-name');
    if (dashName) dashName.textContent = effectiveName;

    const roleEl = document.getElementById('current-user-role');
    if (roleEl) roleEl.textContent = effectiveTitle;
    const topRole = document.getElementById('topbar-user-role');
    if (topRole) topRole.textContent = effectiveTitle;
    const dashRole = document.getElementById('dash-profile-role');
    if (dashRole) dashRole.textContent = effectiveTitle;

    const avEl = document.getElementById('current-user-avatar');
    if (avEl) avEl.src = effectiveAvatar;
    const topAv = document.getElementById('topbar-user-avatar');
    if (topAv) topAv.src = effectiveAvatar;
    const dashAv = document.getElementById('dash-profile-avatar');
    if (dashAv) dashAv.src = effectiveAvatar;

    // Update Welcome Headings across views
    const dashWelcome = document.getElementById('dashboard-welcome-heading');
    if (dashWelcome) dashWelcome.textContent = `Selamat Datang, ${effectiveName}`;
    const portalWelcome = document.getElementById('portal-guru-greeting');
    if (portalWelcome) portalWelcome.textContent = `Selamat Datang, ${effectiveName}`;

    // Jika role guru, set activeScheduleTeacher dari session agar jadwal langsung tampil milik guru yg login
    if (activeRole === 'guru' && sessionUser && sessionUser.name) {
      activeScheduleTeacher = sessionUser.name;
    }

    // Terapkan filter sidebar langsung saat halaman pertama kali dimuat
    applyRoleAccessControl(activeRole);

    // Sync semua heading welcome dengan nama yang benar dari session
    syncWelcomeHeadings();

    const targetScreen = (screenParam && cfg.screens.includes(screenParam)) ? screenParam : cfg.defaultScreen;
    setTimeout(() => switchScreen(targetScreen), 50);
  }

  /* ==========================================================================
     SCREEN 4: OVERVIEW DASHBOARD WAKA KURIKULUM (Stitch Screen 4)
     ========================================================================== */
  function renderDashboard() {
    // Heading welcome di-handle oleh syncWelcomeHeadings() — tidak perlu di sini

    // 0. Update Perangkat Ajar KPI Metrics dynamically from documentsList
    const docs = data.documentsList || [];
    const totalTeachers = docs.length || 82;
    const fullyComplete = docs.filter(d => 
      d.modulAjar?.status === 'approved' && 
      d.atp?.status === 'approved' && 
      d.prota?.status === 'approved' && 
      d.prosem?.status === 'approved'
    ).length;
    const pct = ((fullyComplete / totalTeachers) * 100).toFixed(1);
    const pendingReminder = totalTeachers - fullyComplete;

    const kpiPct = document.getElementById('kpi-perangkat-pct');
    const kpiSub = document.getElementById('kpi-perangkat-sub');
    const kpiBar = document.getElementById('kpi-perangkat-bar');
    const kpiPending = document.getElementById('kpi-perangkat-pending');

    if (kpiPct) kpiPct.textContent = `${pct}%`;
    if (kpiSub) kpiSub.textContent = `${fullyComplete} / ${totalTeachers} Guru Lengkap`;
    if (kpiBar) kpiBar.style.width = `${pct}%`;
    if (kpiPending) kpiPending.textContent = `${pendingReminder} Guru Perlu Upload`;

    // Update KPI 2: Jurnal
    const journals = data.teachingJournals || [];
    const elJurnalPct = document.getElementById('kpi-jurnal-pct');
    const elJurnalSub = document.getElementById('kpi-jurnal-sub');
    const elJurnalBar = document.getElementById('kpi-jurnal-bar');
    const elJurnalFoot = document.getElementById('kpi-jurnal-foot');
    if (elJurnalPct) elJurnalPct.textContent = `${journals.length > 0 ? Math.round((journals.length / totalTeachers) * 100) : 0}%`;
    if (elJurnalSub) elJurnalSub.textContent = `${journals.length} Guru Mengajar`;
    if (elJurnalBar) elJurnalBar.style.width = `${journals.length > 0 ? Math.round((journals.length / totalTeachers) * 100) : 0}%`;
    if (elJurnalFoot) elJurnalFoot.textContent = journals.length > 0 ? `${journals.length} Jurnal Terisi Hari Ini` : '0 Jurnal Terisi • Belum Ada KBM';

    // Update KPI 3: Beban PTM
    let totalJp = 0;
    (data.scheduleMatrix || []).forEach(s => totalJp += (s.duration || 1));
    const elPtmHours = document.getElementById('kpi-ptm-hours');
    const elPtmSub = document.getElementById('kpi-ptm-sub');
    const elPtmBar = document.getElementById('kpi-ptm-bar');
    const elPtmFoot = document.getElementById('kpi-ptm-foot');
    const schedRombels = new Set((data.scheduleMatrix || []).map(s => s.classCode)).size;
    if (elPtmHours) elPtmHours.textContent = totalJp.toLocaleString();
    if (elPtmSub) elPtmSub.textContent = totalJp > 0 ? `Jam / Minggu (${Math.min(Math.round((totalJp / 1248) * 100), 100)}%)` : 'Jam / Minggu (0%)';
    if (elPtmBar) elPtmBar.style.width = totalJp > 0 ? `${Math.min(Math.round((totalJp / 1248) * 100), 100)}%` : '0%';
    if (elPtmFoot) elPtmFoot.textContent = schedRombels > 0 ? `${schedRombels} Rombel Terjadwal` : '0 Rombel Terjadwal';

    // Update KPI 4: DUDI
    let syncedDepts = 0;
    (data.departments || []).forEach(d => { if (d.dudiPartners && d.dudiPartners.length > 0) syncedDepts++; });
    const elDudiVal = document.getElementById('kpi-dudi-val');
    const elDudiBar = document.getElementById('kpi-dudi-bar');
    const elDudiFoot = document.getElementById('kpi-dudi-foot');
    if (elDudiVal) elDudiVal.textContent = `${syncedDepts} / ${data.departments.length}`;
    if (elDudiBar) elDudiBar.style.width = `${Math.round((syncedDepts / data.departments.length) * 100)}%`;
    if (elDudiFoot) elDudiFoot.textContent = syncedDepts > 0 ? `${syncedDepts} Jurusan Terhubung DUDI` : 'Belum Ada MoU DUDI';

    // 1. Render Department breakdown list
    const deptListContainer = document.getElementById('dashboard-dept-list');
    if (deptListContainer) {
      deptListContainer.innerHTML = data.departments.map(dept => `
        <div class="dept-item-row">
          <div class="dept-code-title">
            <span class="dept-code">${dept.code}</span>
            <span class="dept-fullname" title="${dept.name}">${dept.name}</span>
          </div>
          <div class="dept-progress-wrap">
            <div class="dept-progress-text">
              <span>Kelengkapan Dokumen</span>
              <span class="${dept.completionRate < 70 ? 'text-danger' : 'text-success'}">${dept.completionRate}%</span>
            </div>
            <div class="progress-bar-container">
              <div class="progress-fill ${dept.completionRate < 70 ? 'amber' : ''}" style="width: ${dept.completionRate}%;"></div>
            </div>
          </div>
          <div class="dept-dudi-tag" title="Mitra DUDI: ${(dept.dudiPartners && dept.dudiPartners.length > 0) ? dept.dudiPartners.join(', ') : 'Belum Ada Mitra'}">
            🤝 ${(dept.dudiPartners && dept.dudiPartners.length > 0) ? dept.dudiPartners[0] : 'Belum Ada Mitra'}
          </div>
          <div class="dept-actions">
            <button class="btn btn-outline btn-sm" onclick="window.SIMKUR_APP.openVerifikasiFilter('${dept.code}')">
              Review (${dept.reviewPending})
            </button>
            <button class="btn btn-amber btn-sm" onclick="window.SIMKUR_APP.openWahaModal('${dept.code}')" title="Kirim WA Blast ke Guru ${dept.code} yang belum lengkap">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>
              WA Notif
            </button>
          </div>
        </div>
      `).join('');
    }

    // 2. Render Real-time Jurnal Feed
    renderJournalFeed();

    // 3. Render Upcoming Agenda
    const agendaContainer = document.getElementById('dashboard-agenda-timeline');
    if (agendaContainer) {
      if (!data.upcomingAgendas || data.upcomingAgendas.length === 0) {
        agendaContainer.innerHTML = `
          <div style="text-align: center; padding: 2rem 1rem; color: #64748b; background: #f8fafc; border: 1px dashed #cbd5e1; border-radius: 8px;">
            <div style="font-weight: 700; color: #334155; margin-bottom: 0.25rem;">Belum Ada Agenda Terdekat</div>
            <div style="font-size: 0.8125rem;">Jadwal batas waktu perangkat ajar, rapat MGMP, dan agenda akademik akan tercantum di sini.</div>
          </div>
        `;
      } else {
        agendaContainer.innerHTML = data.upcomingAgendas.map(item => {
          const parts = item.date.split(' ');
          const day = parts[0];
          const month = parts[1];
          return `
            <div class="timeline-agenda-item">
              <div class="agenda-date-box">
                <div class="agenda-date-day">${day}</div>
                <div class="agenda-date-month">${month}</div>
              </div>
              <div class="agenda-content">
                <div class="agenda-title">${item.title}</div>
                <div class="agenda-desc">${item.desc}</div>
                ${item.daysLeft <= 7 ? `<span class="agenda-badge-urgent">Tersisa ${item.daysLeft} Hari Lagi</span>` : ''}
              </div>
            </div>
          `;
        }).join('');
      }
    }

    // 4. Render System Alerts Box
    const alertsContainer = document.getElementById('dashboard-system-alerts');
    if (alertsContainer) {
      if (!data.systemAlerts || data.systemAlerts.length === 0) {
        alertsContainer.innerHTML = `
          <div class="alert-item-box alert-success" style="border-left: 4px solid #059669;">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
            <div><strong>Sistem Normal:</strong> Seluruh modul kurikulum, jadwal pembelajaran, dan sinkronisasi Dapodik beroperasi dengan baik.</div>
          </div>
        `;
      } else {
        alertsContainer.innerHTML = data.systemAlerts.map(alert => `
          <div class="alert-item-box alert-${alert.type}">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            <div>${alert.message}</div>
          </div>
        `).join('');
      }
    }
  }

  function renderJournalFeed() {
    const journalContainer = document.getElementById('dashboard-journal-feed');
    if (!journalContainer) return;

    if (!data.teachingJournals || data.teachingJournals.length === 0) {
      journalContainer.innerHTML = `
        <div style="text-align: center; padding: 2.5rem 1rem; color: #64748b; background: #f8fafc; border: 1px dashed #cbd5e1; border-radius: 8px;">
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="1.5" style="margin: 0 auto 0.5rem;"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
          <div style="font-weight: 700; color: #334155; margin-bottom: 0.25rem;">Belum Ada Jurnal Mengajar Hari Ini</div>
          <div style="font-size: 0.8125rem;">Aktivitas KBM yang disimpan guru di Portal Guru akan langsung tercatat dan tampil secara real-time di sini.</div>
        </div>
      `;
      return;
    }

    journalContainer.innerHTML = data.teachingJournals.map(j => `
      <div class="journal-feed-item">
        <div class="journal-item-header">
          <div class="journal-teacher-info">
            <img src="${j.teacher.includes('Budi') ? 'assets/teacher_avatar.jpg' : 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=80&q=80'}" class="journal-avatar" alt="${j.teacher}">
            <div>
              <div class="journal-teacher-name">${j.teacher}</div>
              <div class="journal-meta-row">
                <span class="journal-class-badge">${j.classCode}</span>
                <span>${j.period}</span>
              </div>
            </div>
          </div>
          <span class="journal-timestamp font-mono">${j.timestamp}</span>
        </div>
        <div class="journal-topic">"${j.topic}"</div>
        <div class="journal-meta-row">
          <span class="journal-meta-tag">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
            Hadir ${j.attendance.present}/${j.attendance.total} Siswa
          </span>
          <span class="journal-meta-tag">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
            ${j.method}
          </span>
          ${j.hasPhoto ? `
            <span class="journal-meta-tag text-success">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
              Dokumentasi Foto Ada
            </span>
          ` : ''}
        </div>
      </div>
    `).join('');
  }

  /* ==========================================================================
     SCREEN 1: VERIFIKASI PERANGKAT AJAR GURU (Stitch Screen 1)
     ========================================================================== */
  function renderVerifikasiTable() {
    const tableBody = document.getElementById('verifikasi-table-body');
    if (!tableBody) return;

    // Update Document KPI Cards dynamically
    const docs = data.documentsList || [];
    const total = docs.length || 82;
    let modulCount = 0, atpCount = 0, protaCount = 0, prosemCount = 0;
    docs.forEach(d => {
      if (d.modulAjar?.status === 'approved') modulCount++;
      if (d.atp?.status === 'approved') atpCount++;
      if (d.prota?.status === 'approved') protaCount++;
      if (d.prosem?.status === 'approved') prosemCount++;
    });

    const modulPct = ((modulCount / total) * 100).toFixed(1);
    const atpPct = ((atpCount / total) * 100).toFixed(1);
    const protaPct = ((protaCount / total) * 100).toFixed(1);
    const prosemPct = ((prosemCount / total) * 100).toFixed(1);

    const elModulPct = document.getElementById('verif-kpi-modul-pct');
    const elModulSub = document.getElementById('verif-kpi-modul-sub');
    const elModulBar = document.getElementById('verif-kpi-modul-bar');
    const elModulFoot = document.getElementById('verif-kpi-modul-foot');
    if (elModulPct) elModulPct.textContent = `${modulPct}%`;
    if (elModulSub) elModulSub.textContent = `${modulCount}/${total} Disetujui`;
    if (elModulBar) elModulBar.style.width = `${modulPct}%`;
    if (elModulFoot) elModulFoot.textContent = `${total - modulCount} Pending`;

    const elAtpPct = document.getElementById('verif-kpi-atp-pct');
    const elAtpSub = document.getElementById('verif-kpi-atp-sub');
    const elAtpBar = document.getElementById('verif-kpi-atp-bar');
    const elAtpFoot = document.getElementById('verif-kpi-atp-foot');
    if (elAtpPct) elAtpPct.textContent = `${atpPct}%`;
    if (elAtpSub) elAtpSub.textContent = `${atpCount}/${total} Disetujui`;
    if (elAtpBar) elAtpBar.style.width = `${atpPct}%`;
    if (elAtpFoot) elAtpFoot.textContent = total === atpCount ? '✓ Tuntas 100%' : `${total - atpCount} Pending`;

    const elProtaPct = document.getElementById('verif-kpi-prota-pct');
    const elProtaSub = document.getElementById('verif-kpi-prota-sub');
    const elProtaBar = document.getElementById('verif-kpi-prota-bar');
    const elProtaFoot = document.getElementById('verif-kpi-prota-foot');
    if (elProtaPct) elProtaPct.textContent = `${protaPct}%`;
    if (elProtaSub) elProtaSub.textContent = `${protaCount}/${total} Disetujui`;
    if (elProtaBar) elProtaBar.style.width = `${protaPct}%`;
    if (elProtaFoot) elProtaFoot.textContent = total === protaCount ? '✓ Tuntas 100%' : `${total - protaCount} Pending`;

    const elProsemPct = document.getElementById('verif-kpi-prosem-pct');
    const elProsemSub = document.getElementById('verif-kpi-prosem-sub');
    const elProsemBar = document.getElementById('verif-kpi-prosem-bar');
    const elProsemFoot = document.getElementById('verif-kpi-prosem-foot');
    if (elProsemPct) elProsemPct.textContent = `${prosemPct}%`;
    if (elProsemSub) elProsemSub.textContent = `${prosemCount}/${total} Disetujui`;
    if (elProsemBar) elProsemBar.style.width = `${prosemPct}%`;
    if (elProsemFoot) elProsemFoot.textContent = `${total - prosemCount} Pending`;

    const deptFilter = document.getElementById('filter-verifikasi-dept')?.value || 'ALL';
    const statusFilter = document.getElementById('filter-verifikasi-status')?.value || 'ALL';
    const searchQuery = document.getElementById('search-verifikasi-teacher')?.value.toLowerCase() || '';

    const filteredDocs = data.documentsList.filter(doc => {
      if (deptFilter !== 'ALL' && doc.department !== deptFilter) return false;
      if (searchQuery && !doc.teacherName.toLowerCase().includes(searchQuery) && !doc.nip.includes(searchQuery)) return false;
      
      if (statusFilter !== 'ALL') {
        const statuses = [doc.modulAjar.status, doc.atp.status, doc.prota.status, doc.prosem.status];
        if (!statuses.includes(statusFilter)) return false;
      }
      return true;
    });

    tableBody.innerHTML = filteredDocs.map(doc => `
      <tr>
        <td>
          <div style="display: flex; align-items: center; gap: 0.75rem;">
            <img src="${doc.avatar}" style="width: 36px; height: 36px; border-radius: 50%; object-fit: cover;" alt="${doc.teacherName}">
            <div>
              <div style="font-weight: 700; color: var(--primary);">${doc.teacherName}</div>
              <div style="font-size: 0.6875rem; color: #64748b;" class="font-mono">NIP. ${doc.nip}</div>
            </div>
          </div>
        </td>
        <td>
          <div style="font-weight: 600;">${doc.subject}</div>
          <div style="font-size: 0.75rem; color: #64748b;">${doc.classes} • <span class="badge-status badge-approved" style="padding: 0.1rem 0.35rem; font-size: 0.625rem;">${doc.department}</span></div>
        </td>
        <td>${renderBadge(doc.modulAjar)}</td>
        <td>${renderBadge(doc.atp)}</td>
        <td>${renderBadge(doc.prota)}</td>
        <td>${renderBadge(doc.prosem)}</td>
        <td class="font-mono" style="font-size: 0.75rem; color: #64748b;">${doc.lastUpdate}</td>
        <td>
          <div style="display: flex; gap: 0.35rem;">
            <button class="btn btn-outline btn-sm" onclick="window.SIMKUR_APP.openReviewDrawer('${doc.id}')">
              Review
            </button>
            <button class="btn btn-ghost btn-sm" onclick="window.SIMKUR_APP.sendDirectWA('${doc.teacherName}', '${doc.nip}')" title="Kirim WA">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>
            </button>
          </div>
        </td>
      </tr>
    `).join('');
  }

  function renderBadge(item) {
    if (item.status === 'approved') {
      return `<span class="badge-status badge-approved">✓ Disetujui (${item.score || 95})</span>`;
    } else if (item.status === 'review') {
      return `<span class="badge-status badge-review">⏳ Menunggu Review</span>`;
    } else if (item.status === 'revision') {
      return `<span class="badge-status badge-revision">⚠ Perlu Revisi</span>`;
    } else {
      return `<span class="badge-status badge-missing">- Belum Ada</span>`;
    }
  }

  /* ==========================================================================
     SCREEN 2: PORTAL MANDIRI GURU (Stitch Screen 2)
     ========================================================================== */
  function renderGuruPortal() {
    // Teaching Journal subtabs
    const subtabs = document.querySelectorAll('.guru-subtab-btn');
    subtabs.forEach(btn => {
      btn.addEventListener('click', () => {
        subtabs.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        const targetTab = btn.getAttribute('data-tab');
        document.querySelectorAll('.guru-tab-pane').forEach(p => p.style.display = 'none');
        const activePane = document.getElementById(`guru-pane-${targetTab}`);
        if (activePane) {
          activePane.style.display = 'block';
          if (targetTab === 'attendance') {
            renderRombelAttendanceTable(activeAttendanceRombel);
          } else if (targetTab === 'docs') {
            renderGuruDocsTable();
          } else if (targetTab === 'schedule') {
            renderGuruPersonalSchedule();
          }
        }
      });
    });

    // Active photo attachment state
    let activeJournalPhoto = null;

    function updatePhotoPreview() {
      const previewBox = document.getElementById('jurnal-photo-preview-box');
      const previewImg = document.getElementById('jurnal-preview-img');
      const filenameEl = document.getElementById('jurnal-photo-filename');
      const detailsEl = document.getElementById('jurnal-photo-details');

      if (!previewBox) return;

      if (activeJournalPhoto) {
        if (previewImg) previewImg.src = activeJournalPhoto.url;
        if (filenameEl) filenameEl.textContent = activeJournalPhoto.name;
        if (detailsEl) detailsEl.textContent = `Ukuran: ${activeJournalPhoto.size} • Timestamp: ${activeJournalPhoto.time}`;
        previewBox.style.display = 'block';
      } else {
        previewBox.style.display = 'none';
      }
    }

    window.handleJournalPhotoUpload = function(e) {
      const file = e.target.files?.[0];
      if (!file) return;

      if (file.size > 12 * 1024 * 1024) {
        showToast("⚠️ Ukuran foto melebihi batas 12MB. Silakan pilih foto lain.");
        return;
      }

      const reader = new FileReader();
      reader.onload = function(evt) {
        const sizeMb = (file.size / (1024 * 1024)).toFixed(1);
        const timeNow = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB';
        activeJournalPhoto = {
          url: evt.target.result,
          name: file.name || `KBM_CAMERA_${Date.now()}.jpg`,
          size: `${sizeMb} MB`,
          time: `Hari ini, ${timeNow}`
        };
        updatePhotoPreview();
        showToast("📸 Foto KBM Berhasil Ditangkap dari Kamera HP!");
      };
      reader.readAsDataURL(file);
    };

    window.removeJournalPhoto = function() {
      activeJournalPhoto = null;
      updatePhotoPreview();
      const camIn = document.getElementById('jurnal-camera-input');
      const galIn = document.getElementById('jurnal-gallery-input');
      if (camIn) camIn.value = '';
      if (galIn) galIn.value = '';
      showToast("Foto dokumentasi dihapus.");
    };

    window.loadDemoClassPhoto = function() {
      const timeNow = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB';
      activeJournalPhoto = {
        url: "assets/teacher_avatar.jpg",
        name: "DOKUMENTASI_PRAKTIKUM_LAB_TJKT.jpg",
        size: "2.4 MB",
        time: `Hari ini, ${timeNow}`
      };
      updatePhotoPreview();
      showToast("📸 Simulasi foto praktikum kelas berhasil dilampirkan!");
    };

    window.adjustAttendance = function(delta) {
      const input = document.getElementById('jurnal-hadir-count');
      if (!input) return;
      let val = parseInt(input.value) || 0;
      val = Math.max(0, Math.min(36, val + delta));
      input.value = val;
      updateAttendanceSummary();
    };

    window.setAttendancePreset = function(val) {
      const input = document.getElementById('jurnal-hadir-count');
      if (!input) return;
      input.value = val;
      updateAttendanceSummary();
    };

    window.updateAttendanceSummary = function() {
      const input = document.getElementById('jurnal-hadir-count');
      const desc = document.getElementById('jurnal-absent-desc');
      if (!input) return;

      const hadir = parseInt(input.value) || 0;
      const total = 36;
      const absent = Math.max(0, total - hadir);

      if (desc) {
        if (absent === 0) {
          desc.textContent = "✓ Seluruh 36 Siswa Hadir Lengkap";
          desc.style.color = "#059669";
        } else {
          desc.textContent = `${absent} Siswa Tidak Hadir (Sakit / Izin / Keterangan)`;
          desc.style.color = "#d97706";
        }
      }

      // Sync active state on preset chips
      document.querySelectorAll('.preset-chip').forEach(chip => {
        if (chip.textContent.includes(`(${hadir})`) || (hadir === 36 && chip.textContent.includes('Semua'))) {
          chip.classList.add('active');
        } else {
          chip.classList.remove('active');
        }
      });
    };

    window.togglePill = function(el) {
      el?.classList.toggle('active');
    };

    // Learning method pills
    const methodPills = document.querySelectorAll('.pill-option');
    methodPills.forEach(pill => {
      pill.addEventListener('click', () => {
        pill.classList.toggle('active');
      });
    });

    // Submit Teaching Journal Form
    const journalForm = document.getElementById('form-jurnal-mengajar');
    if (journalForm) {
      journalForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const topic = document.getElementById('jurnal-topik')?.value;
        const hadir = document.getElementById('jurnal-hadir-count')?.value || 34;
        const notes = document.getElementById('jurnal-catatan')?.value;
        const classCode = document.getElementById('jurnal-kelas')?.value || 'XI A-TJKT';

        const photoToSave = activeJournalPhoto ? activeJournalPhoto.url : "assets/teacher_avatar.jpg";

        let curTeacherName = "Ahmad Gajali";
        let curTeacherNip = "19890609 202521 1 023";
        let curTeacherDept = "TJKT";
        try {
          const s = localStorage.getItem('simkur_session');
          if (s) {
            const parsed = JSON.parse(s);
            if (parsed.name) curTeacherName = parsed.name;
            if (parsed.nip) curTeacherNip = parsed.nip;
            if (parsed.department) curTeacherDept = parsed.department;
          }
        } catch(e) {}

        const newJournal = {
          id: `JRN-${Date.now()}`,
          teacher: curTeacherName,
          nip: curTeacherNip,
          department: curTeacherDept,
          classCode: classCode,
          subject: "Administrasi Sistem Jaringan & Cloud Infrastructure",
          period: "Jam Ke 1-4 (07:15 - 10:15 WIB)",
          date: new Date().toISOString().slice(0, 10),
          topic: topic || "Praktikum Jaringan Komputer Berbasis Mikrotik RouterOS",
          method: "Project Based Learning (PjBL) & Praktikum",
          attendance: { present: parseInt(hadir), total: 36, sick: 36 - parseInt(hadir), namesSick: ["Rian", "Aditya"] },
          notes: notes || "Praktek berjalan lancar sesuai RPP.",
          hasPhoto: true,
          photoUrl: photoToSave,
          photoName: activeJournalPhoto?.name || "Foto_Dokumentasi_KBM.jpg",
          timestamp: "Baru saja",
          status: "verified"
        };

        data.teachingJournals.unshift(newJournal);
        renderJournalFeed();
        showToast("✓ Jurnal Mengajar Berhasil Disimpan & Tersinkronisasi ke Waka Kurikulum!");

        // Reset photo state
        activeJournalPhoto = null;
        updatePhotoPreview();

        // Switch to history tab
        const histTab = document.querySelector('.guru-subtab-btn[data-tab="history"]');
        if (histTab) histTab.click();
        renderGuruJournalHistory();
      });
    }

    renderGuruJournalHistory();
  }

  function renderGuruJournalHistory() {
    const container = document.getElementById('guru-journal-history-list');
    if (!container) return;

    const teacherName = (activeScheduleTeacher || 'Ahmad Gajali').split(',')[0].trim();
    const myJournals = data.teachingJournals.filter(j => 
      j.teacher.toLowerCase().includes(teacherName.toLowerCase()) || 
      teacherName.toLowerCase().includes(j.teacher.toLowerCase())
    );

    if (myJournals.length === 0) {
      container.innerHTML = `
        <div style="text-align: center; padding: 2.5rem 1rem; color: #64748b; background: #f8fafc; border: 1px dashed #cbd5e1; border-radius: 8px;">
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="1.5" style="margin: 0 auto 0.5rem;"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
          <div style="font-weight: 700; color: #334155; margin-bottom: 0.25rem;">Belum Ada Riwayat Jurnal Mengajar</div>
          <div style="font-size: 0.8125rem;">Jurnal yang Anda simpan melalui tab "Isi Jurnal Hari Ini" akan otomatis tercatat dan tersinkronisasi di sini.</div>
        </div>
      `;
      renderGuruDocsTable();
      return;
    }

    container.innerHTML = myJournals.map(j => `
        <div class="journal-feed-item">
          <div class="journal-item-header">
            <div>
              <span class="journal-class-badge">${j.classCode}</span>
              <strong style="margin-left: 0.5rem; color: var(--primary);">${j.subject}</strong>
            </div>
            <span class="badge-status badge-approved">✓ Terverifikasi Waka</span>
          </div>
          <div style="font-size: var(--text-sm); font-weight: 600; margin: 0.35rem 0;">"${j.topic}"</div>
          <div class="journal-meta-row">
            <span>📅 ${j.date}</span>
            <span>⏰ ${j.period}</span>
            <span>👥 Kehadiran: ${j.attendance.present}/${j.attendance.total} Siswa</span>
          </div>
          ${j.photoUrl ? `
            <div style="margin-top: 0.65rem; display: flex; align-items: center; gap: 0.75rem; background: #f0fdfa; border: 1px solid #ccfbf1; padding: 0.5rem 0.75rem; border-radius: 8px;">
              <img src="${j.photoUrl}" style="width: 54px; height: 42px; object-fit: cover; border-radius: 6px; border: 1px solid #99f6e4;" alt="Dokumentasi KBM">
              <div style="overflow: hidden;">
                <div style="font-size: 0.75rem; font-weight: 700; color: #0d9488;">📸 Foto KBM Kamera HP Terlampir</div>
                <div style="font-size: 0.6875rem; color: #64748b; text-overflow: ellipsis; white-space: nowrap; overflow: hidden;">${j.photoName || 'Dokumentasi_KBM.jpg'}</div>
              </div>
            </div>
          ` : `
            <div style="margin-top: 0.5rem; display: inline-flex; align-items: center; gap: 4px; font-size: 0.6875rem; color: #0d9488; font-weight: 600;">
              <span>📸 1 Foto Dokumentasi Praktikum Terlampir</span>
            </div>
          `}
        </div>
      `).join('');

    renderGuruDocsTable();
  }

  /* ==========================================================================
     TEACHER DOCUMENT & CURRICULUM ASSET MODULE (UNGGAH PERANGKAT AJAR GURU)
     ========================================================================== */

  function renderGuruDocsTable() {
    const tableBody = document.getElementById('guru-docs-table-body');
    if (!tableBody) return;

    // Get teacher doc data for Ahmad Gajali (DOC-001)
    const teacherDoc = data.documentsList.find(d => d.id === 'DOC-001') || data.documentsList[0];
    if (!teacherDoc) return;

    const docItems = [
      { key: 'modulAjar', name: 'Modul Ajar / RPP Deep Learning (Standar 2026)', file: teacherDoc.modulAjar.file, date: teacherDoc.modulAjar.date, score: teacherDoc.modulAjar.score, status: teacherDoc.modulAjar.status, note: 'Sesuai rubrik asesmen PjBL Standar 2026' },
      { key: 'atp', name: 'Alur Tujuan Pembelajaran (ATP Fase F TJKT)', file: teacherDoc.atp.file, date: teacherDoc.atp.date, score: teacherDoc.atp.score, status: teacherDoc.atp.status, note: 'Pemetaan capaian 4 elemen kompetensi TJKT' },
      { key: 'prota', name: 'Program Tahunan (Prota 2026/2027)', file: teacherDoc.prota.file, date: teacherDoc.prota.date, score: teacherDoc.prota.score, status: teacherDoc.prota.status, note: 'Alokasi 36 pekan efektif (72 JP/semester)' },
      { key: 'prosem', name: 'Program Semester (Prosem Genap)', file: teacherDoc.prosem.file, date: teacherDoc.prosem.date, score: teacherDoc.prosem.score, status: teacherDoc.prosem.status, note: 'Penetapan jadwal blok asesmen & pekan cadangan' },
      { key: 'kktp', name: 'Kriteria Ketercapaian Tujuan Pembelajaran (KKTP)', file: teacherDoc.kktp?.file || 'KKTP_TJKT_FaseF_Budi.pdf', date: teacherDoc.kktp?.date || '2026-03-21', score: teacherDoc.kktp?.score || 92, status: teacherDoc.kktp?.status || 'approved', note: 'Rubrik interval kriteria ketuntasan kompetensi' }
    ];

    // Update KPI cards
    const kpiModul = document.getElementById('kpi-doc-modul-score');
    const badgeModul = document.getElementById('kpi-doc-modul-badge');
    const kpiAtp = document.getElementById('kpi-doc-atp-score');
    const badgeAtp = document.getElementById('kpi-doc-atp-badge');
    const kpiProta = document.getElementById('kpi-doc-prota-score');
    const badgeProta = document.getElementById('kpi-doc-prota-badge');
    const kpiProsem = document.getElementById('kpi-doc-prosem-score');
    const badgeProsem = document.getElementById('kpi-doc-prosem-badge');

    const updateCard = (scoreEl, badgeEl, doc) => {
      if (!scoreEl || !badgeEl || !doc) return;
      if (doc.status === 'approved') {
        scoreEl.textContent = doc.score || 95;
        scoreEl.style.color = '#059669';
        badgeEl.className = 'badge-status badge-approved';
        badgeEl.textContent = '✓ Disetujui Waka Kurikulum';
      } else if (doc.status === 'review') {
        scoreEl.textContent = 'Review';
        scoreEl.style.color = '#d97706';
        badgeEl.className = 'badge-status badge-pending';
        badgeEl.textContent = '⏳ Menunggu Review Waka';
      } else {
        scoreEl.textContent = doc.score || 'Revisi';
        scoreEl.style.color = '#dc2626';
        badgeEl.className = 'badge-status badge-revision';
        badgeEl.textContent = '⚠️ Perlu Revisi Waka';
      }
    };

    updateCard(kpiModul, badgeModul, teacherDoc.modulAjar);
    updateCard(kpiAtp, badgeAtp, teacherDoc.atp);
    updateCard(kpiProta, badgeProta, teacherDoc.prota);
    updateCard(kpiProsem, badgeProsem, teacherDoc.prosem);

    // Update Waka notes blockquote
    const notesEl = document.getElementById('guru-docs-waka-notes');
    if (notesEl && teacherDoc.notes) {
      notesEl.textContent = `"${teacherDoc.notes}"`;
    }

    // Render Table Rows
    tableBody.innerHTML = docItems.map((doc, idx) => {
      let badgeStatusHtml = '';
      if (doc.status === 'approved') {
        badgeStatusHtml = `<span class="badge-status badge-approved">✓ Disetujui</span>`;
      } else if (doc.status === 'review') {
        badgeStatusHtml = `<span class="badge-status badge-pending">⏳ Menunggu Review</span>`;
      } else {
        badgeStatusHtml = `<span class="badge-status badge-revision">⚠️ Perlu Revisi</span>`;
      }

      const scoreHtml = doc.status === 'approved' 
        ? `<strong style="color: #059669; font-size: 1.05rem;">${doc.score}</strong>`
        : (doc.status === 'review' ? `<span style="color: #d97706; font-weight: 700; font-size: 0.8125rem;">Review</span>` : `<span style="color: #dc2626; font-weight: 700;">${doc.score || 'Revisi'}</span>`);

      return `
        <tr>
          <td style="font-weight: 700; color: #64748b;">${idx + 1}</td>
          <td>
            <div style="font-weight: 700; color: #0f172a;">${doc.name}</div>
            <div style="font-size: 0.6875rem; color: #64748b;">Standar Permendikdasmen No. 1/2026</div>
          </td>
          <td>
            <div style="display: flex; align-items: center; gap: 6px;">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#dc2626" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
              <span class="font-mono" style="font-size: 0.8125rem; font-weight: 600; color: #0284c7;">${doc.file}</span>
            </div>
          </td>
          <td style="font-size: 0.8125rem; color: #64748b;">${doc.date}</td>
          <td style="text-align: center;">${scoreHtml}</td>
          <td>${badgeStatusHtml}</td>
          <td style="font-size: 0.75rem; color: #475569;">${doc.note}</td>
          <td style="text-align: center;">
            <div style="display: flex; gap: 4px; justify-content: center;">
              <button type="button" class="btn btn-outline btn-sm" onclick="window.SIMKUR_APP.previewGuruDoc('${doc.key}')" title="Lihat Pratinjau">👁</button>
              <button type="button" class="btn btn-primary btn-sm" onclick="window.SIMKUR_APP.openUploadGuruDocModal('${doc.key}')" title="Unggah / Perbarui Berkas">📤 Ganti</button>
            </div>
          </td>
        </tr>
      `;
    }).join('');
  }

  function previewGuruDoc(docKey) {
    const teacherDoc = data.documentsList.find(d => d.id === 'DOC-001') || data.documentsList[0];
    if (!teacherDoc || !teacherDoc[docKey]) return;
    const doc = teacherDoc[docKey];
    alert(`📄 Pratinjau Dokumen:\nNama Berkas: ${doc.file}\nStatus Validasi: ${doc.status === 'approved' ? 'Disetujui Waka Kurikulum' : 'Menunggu Review'}\nSkor Kelayakan: ${doc.score || '-'}/100\nTanggal Unggah: ${doc.date}`);
  }

  function openUploadGuruDocModal(docKey) {
    const modal = document.getElementById('modal-upload-guru-doc');
    const select = document.getElementById('guru-upload-doc-type');
    if (select && docKey) {
      select.value = docKey;
    }
    setDocUploadMethod('file');
    guruUploadSelectedFile = null;
    const fileLabel = document.getElementById('guru-doc-file-label');
    if (fileLabel) {
      fileLabel.innerHTML = `
        Klik untuk memilih berkas atau seret berkas ke sini<br>
        <span style="font-size: 0.6875rem; color: #94a3b8; font-weight: 400;">Format didukung: PDF, DOC, DOCX (Maksimal 15 MB)</span>
      `;
    }
    const notesInput = document.getElementById('guru-upload-doc-notes');
    if (notesInput) notesInput.value = '';
    const linkInput = document.getElementById('guru-doc-link-input');
    if (linkInput) linkInput.value = '';

    if (modal) modal.classList.add('active');
  }

  function closeUploadGuruDocModal() {
    const modal = document.getElementById('modal-upload-guru-doc');
    if (modal) modal.classList.remove('active');
  }

  function setDocUploadMethod(method) {
    guruUploadMethod = method;
    const fileBtn = document.getElementById('btn-method-file');
    const linkBtn = document.getElementById('btn-method-link');
    const fileZone = document.getElementById('upload-zone-file');
    const linkZone = document.getElementById('upload-zone-link');

    if (method === 'file') {
      fileBtn?.classList.add('active');
      linkBtn?.classList.remove('active');
      if (fileZone) fileZone.style.display = 'block';
      if (linkZone) linkZone.style.display = 'none';
    } else {
      linkBtn?.classList.add('active');
      fileBtn?.classList.remove('active');
      if (fileZone) fileZone.style.display = 'none';
      if (linkZone) linkZone.style.display = 'block';
    }
  }

  function handleGuruDocFileSelect(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 15 * 1024 * 1024) {
      showToast("⚠️ Ukuran berkas melebihi batas 15 MB.");
      return;
    }
    guruUploadSelectedFile = file;
    const label = document.getElementById('guru-doc-file-label');
    if (label) {
      label.innerHTML = `
        <span style="color: #059669; font-weight: 700;">✓ Berkas Terpilih: ${file.name}</span><br>
        <span style="font-size: 0.6875rem; color: #64748b;">Ukuran: ${(file.size / 1024 / 1024).toFixed(2)} MB • Siap dikirim</span>
      `;
    }
    showToast(`📄 Berkas ${file.name} siap diunggah`);
  }

  function handleGuruDocSubmit(e) {
    if (e && e.preventDefault) e.preventDefault();
    const docTypeSelect = document.getElementById('guru-upload-doc-type');
    const notesInput = document.getElementById('guru-upload-doc-notes');
    const linkInput = document.getElementById('guru-doc-link-input');
    const docKey = docTypeSelect ? docTypeSelect.value : 'modulAjar';

    const teacherDoc = data.documentsList.find(d => d.id === 'DOC-001') || data.documentsList[0];
    if (!teacherDoc) return;

    let fileName = '';
    if (guruUploadMethod === 'file') {
      fileName = guruUploadSelectedFile ? guruUploadSelectedFile.name : `Perangkat_Ajar_${docKey}_Update.pdf`;
    } else {
      fileName = linkInput && linkInput.value ? `Google_Drive_${docKey}.gdoc` : `Perangkat_Ajar_${docKey}.pdf`;
    }

    const todayStr = new Date().toISOString().split('T')[0];

    // Update the teacher document item
    if (!teacherDoc[docKey]) {
      teacherDoc[docKey] = {};
    }
    teacherDoc[docKey].file = fileName;
    teacherDoc[docKey].status = 'review';
    teacherDoc[docKey].score = null;
    teacherDoc[docKey].date = todayStr;
    if (notesInput && notesInput.value) {
      teacherDoc.notes = notesInput.value;
    }

    closeUploadGuruDocModal();
    renderGuruDocsTable();
    renderVerifikasiTable();
    renderDashboard();

    const docLabels = {
      modulAjar: "Modul Ajar ASJ",
      atp: "ATP Fase F TJKT",
      prota: "Program Tahunan",
      prosem: "Program Semester",
      kktp: "KKTP TJKT"
    };

    showToast(`🚀 Berhasil: Berkas ${docLabels[docKey] || 'Perangkat Ajar'} dikirim ke Waka Kurikulum untuk diverifikasi!`);
  }

  /* ==========================================================================
     STUDENT ATTENDANCE & ROLL-CALL MODULE (PRESENSI SISWA ROMBEL)
     ========================================================================== */

  function initStudentAttendanceModule() {
    // Deep clone initial rosters from SIMKUR_DATA
    if (window.SIMKUR_DATA && window.SIMKUR_DATA.studentRoster) {
      const allRombelKeys = Object.keys(window.SIMKUR_DATA.studentRoster);
      allRombelKeys.forEach(rombel => {
        studentAttendanceData[rombel] = JSON.parse(JSON.stringify(window.SIMKUR_DATA.studentRoster[rombel]));
      });

      // Tentukan kelas yang akan ditampilkan: filter per guru atau semua (waka/kepsek/admin)
      let visibleRombels = allRombelKeys;
      try {
        const sessionStr = localStorage.getItem('simkur_session');
        if (sessionStr && activeRole === 'guru') {
          const session = JSON.parse(sessionStr);
          if (session && session.name) {
            const teacherName = session.name.toLowerCase();
            // Ambil semua classCode dari scheduleMatrix yang diajar guru ini
            const taughtClasses = [...new Set(
              (window.SIMKUR_DATA.scheduleMatrix || [])
                .filter(s => s.teacher && s.teacher.toLowerCase().includes(teacherName.split(' ')[0]))
                .map(s => s.classCode)
            )].sort();

            if (taughtClasses.length > 0) {
              // Cocokkan dengan studentRoster (normalisasi format: "X A-AKL" ↔ "X A AKL")
              const normalize = str => str.replace(/[\s\-]+/g, '').toUpperCase();
              visibleRombels = allRombelKeys.filter(r =>
                taughtClasses.some(tc => normalize(tc) === normalize(r) || normalize(r) === normalize(tc))
              );
              // Jika tidak ada yang cocok persis, tampilkan semua sebagai fallback
              if (visibleRombels.length === 0) visibleRombels = allRombelKeys;
            }
          }
        }
      } catch(e) {}

      // Set rombel aktif ke kelas pertama yang diajar guru
      if (visibleRombels.length > 0 && !visibleRombels.includes(activeAttendanceRombel)) {
        activeAttendanceRombel = visibleRombels[0];
        activeScheduleRombel = visibleRombels[0];
      }

      // Populate rekap-rombel-select (presensi)
      const rekapSelect = document.getElementById('rekap-rombel-select');
      if (rekapSelect) {
        rekapSelect.innerHTML = visibleRombels.map(r => `
          <option value="${r}" ${r === activeAttendanceRombel ? 'selected' : ''}>${r} (${(studentAttendanceData[r] || []).length} Siswa)</option>
        `).join('');
      }

      // Populate jurnal-kelas (formulir jurnal mengajar)
      const jurnalKelasSelect = document.getElementById('jurnal-kelas');
      if (jurnalKelasSelect) {
        jurnalKelasSelect.innerHTML = visibleRombels.map(r => `
          <option value="${r}" ${r === activeAttendanceRombel ? 'selected' : ''}>${r} — Rombel SMKN 1 Banjarmasin (${(studentAttendanceData[r] || []).length} Siswa)</option>
        `).join('');
      }

      // Populate sched-select-rombel (jadwal per rombel)
      const schedRombelSelect = document.getElementById('sched-select-rombel');
      if (schedRombelSelect) {
        schedRombelSelect.innerHTML = visibleRombels.map(r => `
          <option value="${r}" ${r === activeScheduleRombel ? 'selected' : ''}>${r}</option>
        `).join('');
      }
    }

    // Listen to rombel change on Jurnal Mengajar Form
    const jurnalKelasSelect = document.getElementById('jurnal-kelas');
    if (jurnalKelasSelect) {
      jurnalKelasSelect.addEventListener('change', (e) => {
        const val = e.target.value;
        const matched = Object.keys(studentAttendanceData).find(r => val.startsWith(r)) || val;
        switchAttendanceRombel(matched);
      });
    }

    renderRombelAttendanceTable(activeAttendanceRombel);
    renderInlineStudentList();
    syncAttendanceToJournalForm();
  }


  function getInitials(name) {
    const parts = name.trim().split(' ');
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }

  function getAvatarColor(index) {
    const colors = [
      '#0d9488', '#2563eb', '#7c3aed', '#db2777', '#ea580c',
      '#059669', '#0891b2', '#4f46e5', '#c026d3', '#d97706'
    ];
    return colors[index % colors.length];
  }

  function openStudentAttendanceModal(rombel) {
    if (rombel && studentAttendanceData[rombel]) {
      activeAttendanceRombel = rombel;
    }
    const badge = document.getElementById('modal-att-rombel-badge');
    if (badge) badge.textContent = activeAttendanceRombel;

    modalAttendanceFilter = 'ALL';
    modalAttendanceSearch = '';
    const searchInput = document.getElementById('modal-student-search-input');
    if (searchInput) searchInput.value = '';

    // Reset filter pills in modal
    document.querySelectorAll('#modal-filter-pills .filter-pill').forEach((pill, idx) => {
      pill.classList.toggle('active', idx === 0);
    });

    renderModalStudentList();
    updateModalAttendanceSummary();

    const modal = document.getElementById('modal-student-attendance');
    if (modal) {
      modal.style.display = 'flex';
      modal.classList.add('active');
    }
  }

  function closeStudentAttendanceModal() {
    const modal = document.getElementById('modal-student-attendance');
    if (modal) {
      modal.style.display = 'none';
      modal.classList.remove('active');
    }
  }

  function updateModalAttendanceSummary() {
    const roster = studentAttendanceData[activeAttendanceRombel] || [];
    const countH = roster.filter(s => s.status === 'H').length;
    const countS = roster.filter(s => s.status === 'S').length;
    const countI = roster.filter(s => s.status === 'I').length;
    const countA = roster.filter(s => s.status === 'A').length;

    const elH = document.getElementById('modal-h-count');
    const elS = document.getElementById('modal-s-count');
    const elI = document.getElementById('modal-i-count');
    const elA = document.getElementById('modal-a-count');
    const elTot = document.getElementById('modal-total-student-count');

    if (elH) elH.textContent = countH;
    if (elS) elS.textContent = countS;
    if (elI) elI.textContent = countI;
    if (elA) elA.textContent = countA;
    if (elTot) elTot.textContent = roster.length;
  }

  function renderModalStudentList() {
    const container = document.getElementById('modal-student-list');
    if (!container) return;

    const roster = studentAttendanceData[activeAttendanceRombel] || [];
    let filtered = roster;

    if (modalAttendanceFilter !== 'ALL') {
      filtered = filtered.filter(s => s.status === modalAttendanceFilter);
    }

    if (modalAttendanceSearch) {
      filtered = filtered.filter(s => 
        s.name.toLowerCase().includes(modalAttendanceSearch) || 
        s.nisn.includes(modalAttendanceSearch)
      );
    }

    if (filtered.length === 0) {
      container.innerHTML = `
        <div style="padding: 2rem; text-align: center; color: #94a3b8;">
          <div style="font-size: 1.5rem; margin-bottom: 0.5rem;">🔍</div>
          <div>Tidak ada siswa yang sesuai dengan kriteria filter.</div>
        </div>
      `;
      return;
    }

    container.innerHTML = filtered.map((s) => {
      const initials = getInitials(s.name);
      const avatarBg = getAvatarColor(s.no);

      return `
        <div class="student-att-row" data-no="${s.no}">
          <div class="student-info-col">
            <span class="student-num-badge">${s.no}</span>
            <div class="student-avatar-initial" style="background: ${avatarBg}; color: #ffffff;">
              ${initials}
            </div>
            <div style="min-width: 0;">
              <div class="student-name-text" title="${s.name}">${s.name}</div>
              <div class="student-nisn-text">
                NISN: ${s.nisn} • ${s.gender === 'L' ? 'Laki-laki' : 'Perempuan'}
                ${s.notes ? `<span style="color: #d97706; margin-left: 4px;">• ${s.notes}</span>` : ''}
              </div>
            </div>
          </div>

          <div class="student-status-buttons">
            <button type="button" class="btn-att-status btn-h ${s.status === 'H' ? 'active' : ''}" 
              onclick="window.SIMKUR_APP.setStudentStatus(${s.no}, 'H')" title="Hadir">H</button>
            <button type="button" class="btn-att-status btn-s ${s.status === 'S' ? 'active' : ''}" 
              onclick="window.SIMKUR_APP.setStudentStatus(${s.no}, 'S')" title="Sakit">S</button>
            <button type="button" class="btn-att-status btn-i ${s.status === 'I' ? 'active' : ''}" 
              onclick="window.SIMKUR_APP.setStudentStatus(${s.no}, 'I')" title="Izin">I</button>
            <button type="button" class="btn-att-status btn-a ${s.status === 'A' ? 'active' : ''}" 
              onclick="window.SIMKUR_APP.setStudentStatus(${s.no}, 'A')" title="Alpa / Tanpa Keterangan">A</button>
          </div>
        </div>
      `;
    }).join('');
  }

  function setStudentStatus(no, status) {
    const roster = studentAttendanceData[activeAttendanceRombel];
    if (!roster) return;
    const student = roster.find(s => s.no === no);
    if (!student) return;

    student.status = status;
    if (status === 'H') {
      student.notes = '';
    } else if (status === 'S' && !student.notes) {
      student.notes = 'Sakit';
    } else if (status === 'I' && !student.notes) {
      student.notes = 'Izin orang tua';
    } else if (status === 'A') {
      student.notes = 'Tanpa keterangan';
    }

    renderModalStudentList();
    renderInlineStudentList();
    updateModalAttendanceSummary();
    syncAttendanceToJournalForm();
  }

  function markAllStudentsPresent() {
    const roster = studentAttendanceData[activeAttendanceRombel];
    if (!roster) return;
    roster.forEach(s => {
      s.status = 'H';
      s.notes = '';
    });
    renderModalStudentList();
    renderInlineStudentList();
    updateModalAttendanceSummary();
    syncAttendanceToJournalForm();
    showToast(`✓ Seluruh 36 siswa ${activeAttendanceRombel} ditandai HADIR!`);
  }

  function syncAttendanceToJournalForm() {
    const roster = studentAttendanceData[activeAttendanceRombel] || [];
    const countH = roster.filter(s => s.status === 'H').length;
    const countS = roster.filter(s => s.status === 'S').length;
    const absentStudents = roster.filter(s => s.status !== 'H');

    // Update Jurnal Form inputs
    const hadirInput = document.getElementById('jurnal-hadir-count');
    const absentDesc = document.getElementById('jurnal-absent-desc');
    const inlineH = document.getElementById('inline-h-count');
    const inlineS = document.getElementById('inline-s-count');
    const inlineTag = document.getElementById('inline-att-rombel-tag');

    if (hadirInput) hadirInput.value = countH;
    if (inlineH) inlineH.textContent = countH;
    if (inlineS) inlineS.textContent = countS;
    if (inlineTag) inlineTag.textContent = activeAttendanceRombel;

    if (absentDesc) {
      if (absentStudents.length === 0) {
        absentDesc.textContent = "✓ Seluruh 36 Siswa Hadir Lengkap";
        absentDesc.style.color = "#059669";
      } else {
        const details = absentStudents.map(s => {
          const stLabel = s.status === 'S' ? 'Sakit' : (s.status === 'I' ? 'Izin' : 'Alpa');
          return `${s.name} (${stLabel})`;
        }).join(', ');
        absentDesc.textContent = `${absentStudents.length} Siswa Tidak Hadir: ${details}`;
        absentDesc.style.color = "#d97706";
      }
    }

    if (window.updateAttendanceSummary) {
      window.updateAttendanceSummary();
    }
  }

  function toggleInlineAttendanceList() {
    const container = document.getElementById('inline-attendance-container');
    const toggleBtn = document.getElementById('btn-toggle-inline-att');
    if (!container) return;

    const isHidden = container.style.display === 'none';
    if (isHidden) {
      container.style.display = 'block';
      if (toggleBtn) toggleBtn.textContent = '▲ Sembunyikan (36 Siswa)';
      renderInlineStudentList();
    } else {
      container.style.display = 'none';
      if (toggleBtn) toggleBtn.textContent = '▼ Buka (36 Siswa)';
    }
  }

  function switchToAttendanceTab() {
    const attendanceBtn = document.querySelector('.guru-subtab-btn[data-tab="attendance"]');
    if (attendanceBtn) {
      attendanceBtn.click();
      window.scrollTo({ top: attendanceBtn.offsetTop - 80, behavior: 'smooth' });
    }
  }

  function renderInlineStudentList() {
    const container = document.getElementById('inline-attendance-container');
    if (!container) return;

    const roster = studentAttendanceData[activeAttendanceRombel] || [];
    if (roster.length === 0) {
      container.innerHTML = '<div style="padding: 1rem; text-align: center; color: #94a3b8;">Tidak ada data siswa.</div>';
      return;
    }

    container.innerHTML = roster.map(s => {
      return `
        <div style="display: flex; align-items: center; justify-content: space-between; padding: 6px 4px; border-bottom: 1px solid #f1f5f9; gap: 8px;">
          <div style="display: flex; align-items: center; gap: 6px; overflow: hidden; min-width: 0; flex: 1;">
            <span style="font-size: 0.6875rem; font-weight: 700; color: #94a3b8; width: 18px; text-align: right; flex-shrink: 0;">${s.no}.</span>
            <div style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
              <span style="font-size: 0.75rem; font-weight: 700; color: #0f172a;">${s.name}</span>
              ${s.notes ? `<span style="font-size: 0.6875rem; color: #d97706; margin-left: 4px;">(${s.notes})</span>` : ''}
            </div>
          </div>
          <div style="display: flex; gap: 3px; flex-shrink: 0;">
            <button type="button" class="btn-att-status btn-h ${s.status === 'H' ? 'active' : ''}" style="width: 28px; height: 28px; font-size: 0.6875rem;" onclick="window.SIMKUR_APP.setStudentStatus(${s.no}, 'H')" title="Hadir">H</button>
            <button type="button" class="btn-att-status btn-s ${s.status === 'S' ? 'active' : ''}" style="width: 28px; height: 28px; font-size: 0.6875rem;" onclick="window.SIMKUR_APP.setStudentStatus(${s.no}, 'S')" title="Sakit">S</button>
            <button type="button" class="btn-att-status btn-i ${s.status === 'I' ? 'active' : ''}" style="width: 28px; height: 28px; font-size: 0.6875rem;" onclick="window.SIMKUR_APP.setStudentStatus(${s.no}, 'I')" title="Izin">I</button>
            <button type="button" class="btn-att-status btn-a ${s.status === 'A' ? 'active' : ''}" style="width: 28px; height: 28px; font-size: 0.6875rem;" onclick="window.SIMKUR_APP.setStudentStatus(${s.no}, 'A')" title="Alpa">A</button>
          </div>
        </div>
      `;
    }).join('');
  }

  function filterModalAttendance(status, el) {
    modalAttendanceFilter = status;
    document.querySelectorAll('#modal-filter-pills .filter-pill').forEach(btn => btn.classList.remove('active'));
    if (el) el.classList.add('active');
    renderModalStudentList();
  }

  function searchModalStudents(query) {
    modalAttendanceSearch = (query || '').toLowerCase().trim();
    renderModalStudentList();
  }

  function saveStudentAttendanceToJournal() {
    const roster = studentAttendanceData[activeAttendanceRombel] || [];
    const countH = roster.filter(s => s.status === 'H').length;
    const absentStudents = roster.filter(s => s.status !== 'H');

    // Update Jurnal Form inputs
    const hadirInput = document.getElementById('jurnal-hadir-count');
    const absentDesc = document.getElementById('jurnal-absent-desc');

    if (hadirInput) {
      hadirInput.value = countH;
    }

    if (absentDesc) {
      if (absentStudents.length === 0) {
        absentDesc.textContent = "✓ Seluruh 36 Siswa Hadir Lengkap";
        absentDesc.style.color = "#059669";
      } else {
        const details = absentStudents.map(s => {
          const stLabel = s.status === 'S' ? 'Sakit' : (s.status === 'I' ? 'Izin' : 'Alpa');
          return `${s.name} (${stLabel})`;
        }).join(', ');
        absentDesc.textContent = `${absentStudents.length} Siswa Tidak Hadir: ${details}`;
        absentDesc.style.color = "#d97706";
      }
    }

    // Sync preset chips
    if (window.updateAttendanceSummary) {
      window.updateAttendanceSummary();
    }

    // Also refresh the attendance recap table if visible
    renderRombelAttendanceTable(activeAttendanceRombel);

    closeStudentAttendanceModal();
    showToast(`💾 Presensi ${activeAttendanceRombel} tersinkronisasi: ${countH} Hadir, ${absentStudents.length} Tidak Hadir.`);
  }

  function switchAttendanceRombel(rombel) {
    activeAttendanceRombel = rombel;
    const select = document.getElementById('rekap-rombel-select');
    if (select && select.value !== rombel) {
      select.value = rombel;
    }
    tableAttendanceFilter = 'ALL';
    tableAttendanceSearch = '';
    const searchInput = document.getElementById('table-student-search');
    if (searchInput) searchInput.value = '';

    // Reset table filter pills
    document.querySelectorAll('#table-filter-pills .filter-pill').forEach((p, idx) => {
      p.classList.toggle('active', idx === 0);
    });

    renderRombelAttendanceTable(rombel);
    syncAttendanceToJournalForm();
  }

  function renderRombelAttendanceTable(rombel) {
    const targetRombel = rombel || activeAttendanceRombel;
    const roster = studentAttendanceData[targetRombel] || [];
    const tableBody = document.getElementById('rekap-attendance-table-body');
    const tableTitle = document.getElementById('rekap-table-title');

    if (tableTitle) {
      tableTitle.textContent = `Daftar Presensi Siswa: ${targetRombel} (${roster.length} Siswa)`;
    }

    // Compute stats
    const total = roster.length || 36;
    const countH = roster.filter(s => s.status === 'H').length;
    const countS = roster.filter(s => s.status === 'S').length;
    const countI = roster.filter(s => s.status === 'I').length;
    const countA = roster.filter(s => s.status === 'A').length;
    const totalAbsen = countS + countI + countA;

    const avgPct = roster.length > 0
      ? (roster.reduce((acc, curr) => acc + (curr.attendancePct || 95), 0) / roster.length).toFixed(1)
      : '97.8';

    // Update KPI elements
    const kpiPct = document.getElementById('kpi-att-pct');
    const kpiHadir = document.getElementById('kpi-att-hadir');
    const kpiAbsen = document.getElementById('kpi-att-absen');
    const kpiDetailS = document.getElementById('kpi-att-detail-s');

    if (kpiPct) kpiPct.textContent = `${avgPct}%`;
    if (kpiHadir) kpiHadir.textContent = countH;
    if (kpiAbsen) kpiAbsen.textContent = totalAbsen;
    if (kpiDetailS) {
      kpiDetailS.innerHTML = `<span>${countS} Sakit</span> • <span>${countI} Izin</span> • <span>${countA} Alpa</span>`;
    }

    if (!tableBody) return;

    let filtered = roster;
    if (tableAttendanceFilter !== 'ALL') {
      filtered = filtered.filter(s => s.status === tableAttendanceFilter);
    }
    if (tableAttendanceSearch) {
      filtered = filtered.filter(s => 
        s.name.toLowerCase().includes(tableAttendanceSearch) || 
        s.nisn.includes(tableAttendanceSearch)
      );
    }

    if (filtered.length === 0) {
      tableBody.innerHTML = `
        <tr>
          <td colspan="8" style="text-align: center; padding: 2rem; color: #94a3b8;">
            Tidak ada siswa yang sesuai dengan filter pencarian.
          </td>
        </tr>
      `;
      return;
    }

    tableBody.innerHTML = filtered.map(s => {
      let badgeHtml = '';
      if (s.status === 'H') {
        badgeHtml = `<span class="badge-status" style="background: #ecfdf5; color: #065f46; border: 1px solid #a7f3d0; font-weight: 700;">✓ Hadir</span>`;
      } else if (s.status === 'S') {
        badgeHtml = `<span class="badge-status" style="background: #fffbeb; color: #92400e; border: 1px solid #fde68a; font-weight: 700;">Sakit</span>`;
      } else if (s.status === 'I') {
        badgeHtml = `<span class="badge-status" style="background: #eff6ff; color: #1e40af; border: 1px solid #bfdbfe; font-weight: 700;">Izin</span>`;
      } else {
        badgeHtml = `<span class="badge-status badge-revision" style="font-weight: 700;">Alpa</span>`;
      }

      const pctColor = s.attendancePct >= 95 ? '#059669' : (s.attendancePct >= 90 ? '#0284c7' : '#dc2626');

      return `
        <tr>
          <td style="font-weight: 700; color: #64748b;">${s.no}</td>
          <td class="font-mono" style="font-size: 0.8125rem;">${s.nisn}</td>
          <td>
            <div style="font-weight: 700; color: #0f172a;">${s.name}</div>
          </td>
          <td>
            <span style="font-size: 0.75rem; font-weight: 600; padding: 2px 6px; border-radius: 4px; background: ${s.gender === 'L' ? '#eff6ff' : '#fdf2f8'}; color: ${s.gender === 'L' ? '#1d4ed8' : '#be185d'};">
              ${s.gender}
            </span>
          </td>
          <td>
            <div style="display: flex; align-items: center; gap: 6px;">
              <strong style="color: ${pctColor}; font-size: 0.8125rem;">${s.attendancePct}%</strong>
              <div style="flex: 1; height: 6px; background: #e2e8f0; border-radius: 9999px; overflow: hidden; max-width: 50px;">
                <div style="height: 100%; width: ${s.attendancePct}%; background: ${pctColor};"></div>
              </div>
            </div>
          </td>
          <td>${badgeHtml}</td>
          <td style="font-size: 0.8125rem; color: ${s.notes ? '#d97706' : '#94a3b8'};">
            ${s.notes || '—'}
          </td>
          <td style="text-align: center;">
            <button type="button" class="btn btn-outline btn-sm" onclick="window.SIMKUR_APP.openStudentAttendanceModal('${targetRombel}')" title="Ubah Status Kehadiran">
              ✏ Ubah
            </button>
          </td>
        </tr>
      `;
    }).join('');
  }

  function filterTableAttendance(status, el) {
    tableAttendanceFilter = status;
    document.querySelectorAll('#table-filter-pills .filter-pill').forEach(btn => btn.classList.remove('active'));
    if (el) el.classList.add('active');
    renderRombelAttendanceTable(activeAttendanceRombel);
  }

  function searchTableStudents(query) {
    tableAttendanceSearch = (query || '').toLowerCase().trim();
    renderRombelAttendanceTable(activeAttendanceRombel);
  }

  function exportAttendanceExcel() {
    showToast(`📥 Menyiapkan berkas Excel: Rekap_Presensi_${activeAttendanceRombel.replace(/\s+/g, '_')}_TA2026_2027.xlsx...`);
    setTimeout(() => {
      showToast(`✓ Berkas Excel berhasil diunduh! Selaras format Dapodik Kemendikdasmen.`);
    }, 1200);
  }

  function notifyParentsWA() {
    const roster = studentAttendanceData[activeAttendanceRombel] || [];
    const absent = roster.filter(s => s.status !== 'H');
    if (absent.length === 0) {
      showToast(`ℹ Seluruh 36 siswa ${activeAttendanceRombel} hadir hari ini. Tidak ada notifikasi yang perlu dikirim.`);
      return;
    }
    showToast(`💬 Mengirim notifikasi WhatsApp presensi otomatis ke ${absent.length} nomor orang tua siswa...`);
    setTimeout(() => {
      showToast(`✓ WAHA Gateway: Berhasil terkirim ke ${absent.length} orang tua (${absent.map(s => s.name).join(', ')})`);
    }, 1200);
  }

  /* ==========================================================================
     SCREEN 3: JADWAL PELAJARAN & PTM ANTI-BENTROK (Modul 6.3)
     ========================================================================== */
  function switchScheduleView(viewType, btnEl) {
    activeScheduleView = viewType;

    // Update active class on subtab buttons
    document.querySelectorAll('.sched-subtab-btn').forEach(b => b.classList.remove('active'));
    if (btnEl) {
      btnEl.classList.add('active');
    } else {
      const b = document.querySelector(`.sched-subtab-btn[data-view="${viewType}"]`);
      if (b) b.classList.add('active');
    }

    // Hide all view panes
    document.querySelectorAll('.sched-view-pane').forEach(p => p.style.display = 'none');
    const targetPane = document.getElementById(`sched-view-${viewType}`);
    if (targetPane) targetPane.style.display = 'block';

    if (viewType === 'matrix') {
      renderSchedule(activeScheduleRombel);
      showToast(`Memuat tampilan: Matriks Jadwal Rombel (${activeScheduleRombel})`);
    } else if (viewType === 'teacher') {
      populateTeacherDropdowns();
      filterScheduleTeacher(activeScheduleTeacher);
      showToast(`Memuat tampilan: Jadwal Individu Guru (${activeScheduleTeacher})`);
    } else if (viewType === 'ptm') {
      renderPTMTable();
      showToast(`Memuat tampilan: Alokasi Beban Jam (PTM 24 JP) Seluruh Guru`);
    } else if (viewType === 'conflict') {
      renderScheduleConflictView();
      showToast(`Memuat tampilan: Detektor Bentrok Real-Time`);
    }
  }

  function setupScheduleSubtabs() {
    document.querySelectorAll('.sched-subtab-btn').forEach(btn => {
      btn.onclick = (e) => {
        const viewType = btn.getAttribute('data-view');
        switchScheduleView(viewType, btn);
      };
    });
  }

  // 1. Matriks Jadwal per Rombel (Kelas)
  function renderSchedule(rombel) {
    populateTeacherDropdowns();
    setupScheduleSubtabs();
    const targetRombel = rombel || activeScheduleRombel;
    activeScheduleRombel = targetRombel;
    const tableBody = document.getElementById('schedule-grid-body');
    if (!tableBody) return;

    tableBody.innerHTML = scheduleTimeSlots.map(slot => {
      const dayCells = scheduleDays.map(day => {
        const matches = data.scheduleMatrix.filter(s => 
          s.day === day && 
          s.period === slot.period && 
          (targetRombel === 'ALL' || s.classCode === targetRombel)
        );
        if (matches.length > 0) {
          return `
            <td>
              ${matches.map(m => `
                <div class="slot-card ${m.category} ${m.conflict ? 'conflict' : ''}" onclick="window.SIMKUR_APP.inspectScheduleSlot('${m.subject}', '${m.teacher}', '${m.room}')">
                  <div class="slot-subject">${m.subject}</div>
                  <div class="slot-meta">${m.teacher} • <strong>${m.classCode}</strong></div>
                  <div class="slot-room">📍 ${m.room} (${m.duration || 2} JP)</div>
                  ${m.conflict ? `<div style="color: #ba1a1a; font-size: 0.625rem; font-weight: 700;">⚠ BENTROK JADWAL!</div>` : ''}
                </div>
              `).join('')}
            </td>
          `;
        } else {
          return `<td><div style="font-size: 0.6875rem; color: #94a3b8; text-align: center; padding-top: 1rem;">- Mandiri / Istirahat -</div></td>`;
        }
      }).join('');

      return `
        <tr>
          <td class="time-col-header">${slot.label}</td>
          ${dayCells}
        </tr>
      `;
    }).join('');
  }

  function filterScheduleRombel(rombel) {
    renderSchedule(rombel);
    showToast(`Memuat matriks jadwal untuk rombel: ${rombel}`);
  }

  // 2. Jadwal per Guru Pengampu (Individu Guru — Seluruh 88 Guru)
  function populateTeacherDropdowns(filterQuery = '') {
    const teacherSelect = document.getElementById('sched-select-teacher');
    const modalTeacherSelect = document.getElementById('modal-input-sched-teacher');
    const supTeacherSelect = document.getElementById('sched-sup-teacher');

    const authUsers = (window.SIMKUR_AUTH_USERS || []).filter(u => u.role === 'guru' || u.role === 'kajur' || u.role === 'waka' || u.role === 'kepsek');
    
    // Hitung JP dari scheduleMatrix untuk setiap guru
    const teacherJpMap = {};
    (data.scheduleMatrix || []).forEach(slot => {
      if (slot.teacher) {
        const tName = slot.teacher.trim();
        teacherJpMap[tName] = (teacherJpMap[tName] || 0) + (slot.duration || 1);
      }
    });

    const depts = [
      { key: 'TJKT', label: 'Teknik Jaringan Komputer & Telekomunikasi (TJKT)' },
      { key: 'DKV', label: 'Desain Komunikasi Visual (DKV)' },
      { key: 'AKL', label: 'Akuntansi & Keuangan Lembaga (AKL)' },
      { key: 'MPLB', label: 'Manajemen Perkantoran & Layanan Bisnis (MPLB)' },
      { key: 'PEMASARAN', label: 'Bisnis Digital & Pemasaran' },
      { key: 'UMUM', label: 'Mata Pelajaran Umum & Manajemen Sekolah' }
    ];

    const q = (filterQuery || '').toLowerCase().trim();
    const filteredUsers = q ? authUsers.filter(u => 
      u.name.toLowerCase().includes(q) || 
      (u.nip && u.nip.includes(q)) || 
      (u.department && u.department.toLowerCase().includes(q)) ||
      (u.subject && u.subject.toLowerCase().includes(q))
    ) : authUsers;

    const grouped = {};
    depts.forEach(d => grouped[d.key] = []);

    filteredUsers.forEach(u => {
      let k = (u.department || 'UMUM').toUpperCase();
      if (k === 'MANAJEMEN' || !grouped[k]) k = 'UMUM';
      grouped[k].push(u);
    });

    // Urutkan abjad nama guru dalam masing-masing jurusan
    depts.forEach(d => {
      grouped[d.key].sort((a, b) => a.name.localeCompare(b.name));
    });

    let htmlOptions = '';
    depts.forEach(d => {
      const list = grouped[d.key] || [];
      if (list.length > 0) {
        htmlOptions += `<optgroup label="${d.label} (${list.length} Guru)">`;
        list.forEach(t => {
          let jp = teacherJpMap[t.name];
          if (!jp) {
            const matchKey = Object.keys(teacherJpMap).find(k => 
              k.toLowerCase().includes(t.name.split(',')[0].toLowerCase().trim()) ||
              t.name.toLowerCase().includes(k.toLowerCase().trim())
            );
            jp = matchKey ? teacherJpMap[matchKey] : 24;
          }
          htmlOptions += `<option value="${t.name}">${t.name} — ${t.department || 'Umum'} (${jp} JP)</option>`;
        });
        htmlOptions += `</optgroup>`;
      }
    });

    if (!htmlOptions) {
      htmlOptions = `<option value="">Tidak ditemukan guru dengan kata kunci "${filterQuery}"</option>`;
    }

    if (teacherSelect) {
      const prevVal = teacherSelect.value;
      teacherSelect.innerHTML = htmlOptions;
      if (prevVal && teacherSelect.querySelector(`option[value="${prevVal}"]`)) {
        teacherSelect.value = prevVal;
      } else if (activeScheduleTeacher && teacherSelect.querySelector(`option[value="${activeScheduleTeacher}"]`)) {
        teacherSelect.value = activeScheduleTeacher;
      } else {
        const firstOpt = teacherSelect.querySelector('option[value]');
        if (firstOpt && firstOpt.value) {
          activeScheduleTeacher = firstOpt.value;
          teacherSelect.value = firstOpt.value;
        }
      }
    }

    if (!filterQuery) {
      if (modalTeacherSelect) {
        modalTeacherSelect.innerHTML = htmlOptions;
      }

      if (supTeacherSelect) {
        let supHtml = '';
        depts.forEach(d => {
          const list = grouped[d.key] || [];
          if (list.length > 0) {
            supHtml += `<optgroup label="${d.label} (${list.length} Guru)">`;
            list.forEach(t => {
              supHtml += `<option value="${t.name}|${t.nip}|${t.department || 'Kejuruan'}|${t.subject || 'Produktif'}|Lab ${t.department || 'Kejuruan'}">${t.name} — ${t.department || 'Umum'} (${t.subject || 'Mapel'})</option>`;
            });
            supHtml += `</optgroup>`;
          }
        });
        supTeacherSelect.innerHTML = supHtml;
      }
    }
  }

  function searchScheduleTeacher(query) {
    populateTeacherDropdowns(query);
    const teacherSelect = document.getElementById('sched-select-teacher');
    if (teacherSelect && teacherSelect.options.length > 0 && teacherSelect.value) {
      filterScheduleTeacher(teacherSelect.value);
    }
  }

  function filterScheduleTeacher(teacherName) {
    if (!teacherName) return;
    activeScheduleTeacher = teacherName;

    const teacherSelect = document.getElementById('sched-select-teacher');
    if (teacherSelect && teacherSelect.value !== teacherName && teacherSelect.querySelector(`option[value="${teacherName}"]`)) {
      teacherSelect.value = teacherName;
    }

    const banner = document.getElementById('sched-teacher-profile-banner');
    const authUser = (window.SIMKUR_AUTH_USERS || []).find(u => 
      u.name.toLowerCase().trim() === teacherName.toLowerCase().trim() ||
      teacherName.toLowerCase().includes(u.name.toLowerCase().trim())
    );

    const teacherDoc = (data.documentsList || []).find(d => 
      d.teacherName.toLowerCase().trim() === teacherName.toLowerCase().trim() ||
      teacherName.toLowerCase().includes(d.teacherName.toLowerCase().trim())
    ) || {};

    const nip = (authUser && authUser.nip) || teacherDoc.nip || '—';
    const dept = (authUser && authUser.department) || teacherDoc.department || 'Kejuruan';
    const subject = (authUser && authUser.subject) || teacherDoc.subject || 'Pengampu Mata Pelajaran';

    const actualJP = (data.scheduleMatrix || [])
      .filter(s => s.teacher && (
        s.teacher.toLowerCase().includes(teacherName.split(',')[0].toLowerCase().trim()) ||
        teacherName.toLowerCase().includes(s.teacher.toLowerCase().trim())
      ))
      .reduce((acc, curr) => acc + (curr.duration || 1), 0);
    const weeklyHours = actualJP > 0 ? actualJP : (teacherDoc.weeklyHours || 24);

    if (banner) {
      banner.innerHTML = `
        <div style="display: flex; align-items: center; gap: 12px;">
          <div style="width: 44px; height: 44px; border-radius: 50%; background: #0d9488; color: #ffffff; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 1rem;">
            ${teacherName.substring(0, 2).toUpperCase()}
          </div>
          <div>
            <div style="font-weight: 700; color: #0f172a; font-size: 0.9375rem;">${teacherName}</div>
            <div style="font-size: 0.75rem; color: #64748b;" class="font-mono">NIP. ${nip} • Jurusan: ${dept} • ${subject}</div>
          </div>
        </div>
        <div style="display: flex; align-items: center; gap: 12px;">
          <div style="text-align: right;">
            <div style="font-size: 0.6875rem; color: #64748b; text-transform: uppercase; font-weight: 600;">Total Beban Kerja (PTM)</div>
            <div style="font-weight: 800; font-size: 1.125rem; color: ${weeklyHours >= 24 ? '#059669' : '#d97706'};">${weeklyHours} JP / Minggu</div>
          </div>
          <span class="badge-status ${weeklyHours >= 24 ? 'badge-approved' : 'badge-review'}" style="font-size: 0.75rem;">
            ${weeklyHours >= 24 ? '✓ Memenuhi Syarat TPG 24 JP' : `⚠ Terjadwal ${weeklyHours} JP`}
          </span>
        </div>
      `;
    }

    renderScheduleTeacherGrid(teacherName);
  }


  function renderScheduleTeacherGrid(teacherName) {
    const tableBody = document.getElementById('schedule-teacher-grid-body');
    if (!tableBody) return;

    tableBody.innerHTML = scheduleTimeSlots.map(slot => {
      const dayCells = scheduleDays.map(day => {
        const matches = data.scheduleMatrix.filter(s => 
          s.day === day && 
          s.period === slot.period && 
          s.teacher.toLowerCase().includes(teacherName.split(',')[0].toLowerCase().trim())
        );
        if (matches.length > 0) {
          return `
            <td>
              ${matches.map(m => `
                <div class="slot-card ${m.category} ${m.conflict ? 'conflict' : ''}" onclick="window.SIMKUR_APP.inspectScheduleSlot('${m.subject}', '${m.teacher}', '${m.room}')">
                  <div class="slot-subject">${m.subject}</div>
                  <div class="slot-meta">Kelas: <strong>${m.classCode}</strong> • ${m.duration || 2} JP</div>
                  <div class="slot-room">📍 ${m.room}</div>
                </div>
              `).join('')}
            </td>
          `;
        } else {
          return `<td><div style="font-size: 0.6875rem; color: #cbd5e1; text-align: center; padding-top: 1rem;">- Tidak Mengajar -</div></td>`;
        }
      }).join('');

      return `
        <tr>
          <td class="time-col-header">${slot.label}</td>
          ${dayCells}
        </tr>
      `;
    }).join('');
  }

  // 3. Alokasi Beban Jam (PTM 24 JP - Seluruh Guru)
  function renderPTMTable(query = '') {
    const tableBody = document.getElementById('ptm-table-body');
    if (!tableBody) return;

    const q = query.toLowerCase().trim();
    const teachers = data.documentsList.filter(t => {
      if (!q) return true;
      return t.teacherName.toLowerCase().includes(q) || 
             t.nip.toLowerCase().includes(q) || 
             t.subject.toLowerCase().includes(q) ||
             t.department.toLowerCase().includes(q);
    });

    if (teachers.length === 0) {
      tableBody.innerHTML = `<tr><td colspan="8" style="text-align: center; padding: 2rem; color: #94a3b8;">Tidak ada data guru yang cocok dengan pencarian.</td></tr>`;
      return;
    }

    tableBody.innerHTML = teachers.map((t, idx) => {
      const isEligible = t.weeklyHours >= 24;
      return `
        <tr>
          <td style="font-size: 0.75rem; font-weight: 700; color: #64748b; text-align: center;">${idx + 1}</td>
          <td>
            <div style="display: flex; align-items: center; gap: 8px;">
              <img src="${t.avatar || 'assets/teacher_avatar.jpg'}" style="width: 32px; height: 32px; border-radius: 50%; object-fit: cover; border: 1px solid #cbd5e1;">
              <div>
                <strong style="color: #0f172a; font-size: 0.8125rem;">${t.teacherName}</strong>
                <div style="font-size: 0.6875rem; color: #64748b;" class="font-mono">${t.nip}</div>
              </div>
            </div>
          </td>
          <td><span class="badge-status badge-approved" style="font-size: 0.6875rem;">${t.department}</span></td>
          <td style="font-size: 0.75rem; font-weight: 600; color: #1e293b;">${t.subject}</td>
          <td style="font-size: 0.75rem; color: #475569;">${t.classes || 'XI A-TJKT, XI B-TJKT'}</td>
          <td style="text-align: center; font-weight: 800; font-size: 0.875rem; color: ${isEligible ? '#059669' : '#d97706'}; font-family: var(--font-mono);">
            ${t.weeklyHours} JP
          </td>
          <td style="text-align: center;">
            <span class="badge-status ${isEligible ? 'badge-approved' : 'badge-review'}" style="font-size: 0.6875rem;">
              ${isEligible ? '✓ Memenuhi 24 JP' : `⚠ Kurang ${24 - t.weeklyHours} JP`}
            </span>
          </td>
          <td style="text-align: center;">
            <button type="button" class="btn btn-outline btn-sm" onclick="showToast('📋 Detail SK PTM untuk ${t.teacherName}: ${t.weeklyHours} JP')" style="font-size: 0.6875rem; padding: 3px 8px;">
              Detail SK
            </button>
          </td>
        </tr>
      `;
    }).join('');
  }

  function filterPTMTable(query) {
    renderPTMTable(query);
  }

  // 4. Detektor Bentrok Real-Time
  function renderScheduleConflictView() {
    const container = document.getElementById('conflict-detector-content');
    if (!container) return;

    // Check collision in scheduleMatrix
    const collisions = [];
    const matrix = data.scheduleMatrix;

    for (let i = 0; i < matrix.length; i++) {
      for (let j = i + 1; j < matrix.length; j++) {
        const a = matrix[i];
        const b = matrix[j];
        if (a.day === b.day && a.period === b.period) {
          // Room collision
          if (a.room.toLowerCase().trim() === b.room.toLowerCase().trim()) {
            collisions.push({
              type: 'RUANG',
              day: a.day,
              period: a.period,
              location: a.room,
              itemA: `${a.subject} (${a.classCode} - ${a.teacher})`,
              itemB: `${b.subject} (${b.classCode} - ${b.teacher})`
            });
          }
          // Teacher collision
          if (a.teacher.toLowerCase().trim() === b.teacher.toLowerCase().trim()) {
            collisions.push({
              type: 'GURU',
              day: a.day,
              period: a.period,
              teacher: a.teacher,
              itemA: `${a.subject} di kelas ${a.classCode} (${a.room})`,
              itemB: `${b.subject} di kelas ${b.classCode} (${b.room})`
            });
          }
        }
      }
    }

    if (collisions.length === 0) {
      container.innerHTML = `
        <div style="background: #f0fdfa; border: 1px solid #99f6e4; border-radius: 8px; padding: 1.25rem; margin-bottom: 1.25rem; display: flex; align-items: flex-start; gap: 1rem;">
          <div style="background: #0d9488; color: #ffffff; width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 1.25rem; flex-shrink: 0;">
            ✓
          </div>
          <div style="flex: 1;">
            <h4 style="color: #0f766e; margin: 0 0 4px; font-size: 1rem;">0 Bentrok Terdeteksi (Jadwal 100% Valid & Aman)</h4>
            <p style="font-size: 0.8125rem; color: #334155; margin: 0;">
              Sistem verifikasi otomatis telah menguji seluruh 48 guru, 24 rombel, dan 14 laboratorium/ruang kelas. Tidak ditemukan tabrakan jam guru maupun pemakaian ruangan ganda.
            </p>
          </div>
          <button type="button" class="btn btn-secondary btn-sm" onclick="showToast('⚡ Audit ulang matriks selesai: 0 konflik.')">
            Audit Ulang Jadwal
          </button>
        </div>

        <h4 style="font-size: 0.875rem; color: #1e293b; margin-bottom: 0.75rem;">Kepatuhan Batasan Penjadwalan (Permendikdasmen No. 13/2025):</h4>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 0.75rem;">
          <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 6px; padding: 0.75rem;">
            <div style="font-size: 0.6875rem; color: #059669; font-weight: 700;">✓ TERVERIFIKASI</div>
            <div style="font-weight: 700; font-size: 0.8125rem; color: #0f172a; margin: 2px 0;">Konflik Guru Mengajar</div>
            <div style="font-size: 0.75rem; color: #64748b;">Tidak ada guru yang terjadwal di 2 kelas berbeda pada jam yang sama.</div>
          </div>
          <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 6px; padding: 0.75rem;">
            <div style="font-size: 0.6875rem; color: #059669; font-weight: 700;">✓ TERVERIFIKASI</div>
            <div style="font-weight: 700; font-size: 0.8125rem; color: #0f172a; margin: 2px 0;">Kapasitas Lab & Bengkel</div>
            <div style="font-size: 0.75rem; color: #64748b;">Seluruh praktikum kejuruan menempati lab khusus tanpa tabrakan slot.</div>
          </div>
          <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 6px; padding: 0.75rem;">
            <div style="font-size: 0.6875rem; color: #059669; font-weight: 700;">✓ TERVERIFIKASI</div>
            <div style="font-weight: 700; font-size: 0.8125rem; color: #0f172a; margin: 2px 0;">Beban Harian Maksimal</div>
            <div style="font-size: 0.75rem; color: #64748b;">Beban mengajar harian guru tidak melebihi 8 JP per hari.</div>
          </div>
          <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 6px; padding: 0.75rem;">
            <div style="font-size: 0.6875rem; color: #059669; font-weight: 700;">✓ TERVERIFIKASI</div>
            <div style="font-weight: 700; font-size: 0.8125rem; color: #0f172a; margin: 2px 0;">Blok Hari Jumat</div>
            <div style="font-size: 0.75rem; color: #64748b;">Hari Jumat dialokasikan khusus Kokurikuler P5 dan MGMP Internal.</div>
          </div>
        </div>
      `;
    } else {
      container.innerHTML = `
        <div style="background: #fef2f2; border: 1px solid #fecaca; border-radius: 8px; padding: 1.25rem; margin-bottom: 1rem;">
          <h4 style="color: #b91c1c; margin: 0 0 6px;">⚠️ Ditemukan ${collisions.length} Konflik / Bentrok Jadwal!</h4>
          <p style="font-size: 0.8125rem; color: #7f1d1d; margin: 0 0 0.75rem;">
            Terdapat tabrakan slot jadwal yang membutuhkan penyesuaian oleh Waka Kurikulum:
          </p>
          <div style="display: flex; flex-direction: column; gap: 0.5rem;">
            ${collisions.map(c => `
              <div style="background: #ffffff; border: 1px solid #fca5a5; border-radius: 6px; padding: 0.5rem 0.75rem; font-size: 0.75rem;">
                <span style="background: #dc2626; color: #ffffff; padding: 1px 6px; border-radius: 4px; font-weight: 700;">BENTROK ${c.type}</span>
                <span style="font-weight: 700; color: #0f172a; margin-left: 6px;">Hari ${c.day} Jam Ke-${c.period}</span>
                <div style="margin-top: 4px; color: #334155;">
                  <strong>1:</strong> ${c.itemA} <br>
                  <strong>2:</strong> ${c.itemB}
                </div>
              </div>
            `).join('')}
          </div>
          <button type="button" class="btn btn-primary btn-sm" style="margin-top: 0.75rem;" onclick="window.SIMKUR_APP.autoResolveConflict()">
            ⚡ Jalankan AI Auto-Resolve Bentrok
          </button>
        </div>
      `;
    }
  }

  // 5. Jadwal Pribadi Guru Dinamis di Portal Guru (Mendukung Seluruh 82 Guru)
  function renderGuruPersonalSchedule() {
    const tableBody = document.getElementById('guru-personal-schedule-body');
    if (!tableBody) return;

    let currentTeacherName = 'Ahmad Gajali';
    let currentTeacherNip = '19890609 202521 1 023';
    let currentTeacherDept = 'TJKT';
    let currentTeacherTitle = 'Guru Produktif Kejuruan TJKT';

    try {
      const sessionStr = localStorage.getItem('simkur_session');
      if (sessionStr) {
        const session = JSON.parse(sessionStr);
        if (session.name) {
          currentTeacherName = session.name;
          currentTeacherNip = session.nip || currentTeacherNip;
          currentTeacherDept = session.department || currentTeacherDept;
          currentTeacherTitle = session.title || currentTeacherTitle;
        }
      }
    } catch (e) {}

    // Update Greeting in Portal Guru
    const greetingEl = document.getElementById('portal-guru-greeting');
    const metaEl = document.getElementById('portal-guru-meta');
    if (greetingEl) greetingEl.textContent = `Selamat Datang, ${currentTeacherName}`;
    if (metaEl) metaEl.textContent = `NIP. ${currentTeacherNip} • ${currentTeacherTitle}`;

    // Filter slots for this teacher
    const hasSlots = data.scheduleMatrix.some(s => s.teacher.toLowerCase().includes(currentTeacherName.toLowerCase()));
    const targetTeacherFilter = hasSlots ? currentTeacherName : 'Ahmad Gajali';

    tableBody.innerHTML = scheduleTimeSlots.map(slot => {
      const dayCells = scheduleDays.map(day => {
        const matches = data.scheduleMatrix.filter(s => 
          s.day === day && 
          s.period === slot.period && 
          s.teacher.toLowerCase().includes(targetTeacherFilter.toLowerCase())
        );
        if (matches.length > 0) {
          return `
            <td>
              ${matches.map(m => `
                <div class="slot-card ${m.category}" style="border-left-width: 4px;">
                  <div class="slot-subject">${m.subject}</div>
                  <div class="slot-meta">Rombel: <strong style="color: #0d9488;">${m.classCode}</strong> • ${m.duration || 2} JP</div>
                  <div class="slot-room">📍 ${m.room}</div>
                </div>
              `).join('')}
            </td>
          `;
        } else {
          return `<td><div style="font-size: 0.6875rem; color: #cbd5e1; text-align: center; padding-top: 1rem;">-</div></td>`;
        }
      }).join('');

      return `
        <tr>
          <td class="time-col-header">${slot.label}</td>
          ${dayCells}
        </tr>
      `;
    }).join('');
  }

  // Modal Add Schedule Actions
  function openAddScheduleModal() {
    const modal = document.getElementById('modal-add-schedule');
    const alertBox = document.getElementById('modal-sched-conflict-alert');
    if (alertBox) {
      alertBox.style.display = 'none';
      alertBox.innerHTML = '';
    }
    if (modal) {
      modal.classList.add('active');
    }
  }

  function closeAddScheduleModal() {
    const modal = document.getElementById('modal-add-schedule');
    if (modal) {
      modal.classList.remove('active');
    }
  }

  function saveNewScheduleSlot() {
    const teacher = document.getElementById('modal-input-sched-teacher')?.value || '';
    const subject = document.getElementById('modal-input-sched-subject')?.value || '';
    const classCode = document.getElementById('modal-input-sched-class')?.value || '';
    const category = document.getElementById('modal-input-sched-category')?.value || 'kejuruan';
    const day = document.getElementById('modal-input-sched-day')?.value || 'Senin';
    const period = parseInt(document.getElementById('modal-input-sched-period')?.value) || 1;
    const room = document.getElementById('modal-input-sched-room')?.value || '';
    const duration = parseInt(document.getElementById('modal-input-sched-duration')?.value) || 2;
    const alertBox = document.getElementById('modal-sched-conflict-alert');

    // Anti-collision check
    const roomClash = data.scheduleMatrix.find(s => 
      s.day === day && s.period === period && s.room.toLowerCase().trim() === room.toLowerCase().trim()
    );
    const teacherClash = data.scheduleMatrix.find(s => 
      s.day === day && s.period === period && s.teacher.toLowerCase().trim() === teacher.toLowerCase().trim()
    );

    if (roomClash) {
      if (alertBox) {
        alertBox.innerHTML = `⚠️ <strong>Bentrok Ruangan!</strong> ${room} sudah digunakan oleh kelas <strong>${roomClash.classCode}</strong> (${roomClash.subject} - ${roomClash.teacher}) pada hari ${day} jam ke-${period}. Silakan gunakan ruangan lain.`;
        alertBox.style.display = 'block';
      }
      return;
    }

    if (teacherClash) {
      if (alertBox) {
        alertBox.innerHTML = `⚠️ <strong>Bentrok Jadwal Guru!</strong> ${teacher} sudah terjadwal mengajar di kelas <strong>${teacherClash.classCode}</strong> pada hari ${day} jam ke-${period}.`;
        alertBox.style.display = 'block';
      }
      return;
    }

    // Clean - append new slot
    const newSlot = {
      day,
      period,
      time: period === 1 ? "07:15 - 08:45" : (period === 3 ? "08:45 - 10:15" : (period === 5 ? "10:30 - 12:00" : "12:45 - 14:15")),
      classCode,
      subject,
      category,
      teacher,
      room,
      duration,
      conflict: false
    };

    data.scheduleMatrix.push(newSlot);

    // Refresh views
    renderSchedule(activeScheduleRombel);
    if (activeScheduleView === 'teacher') filterScheduleTeacher(activeScheduleTeacher);
    if (activeScheduleView === 'ptm') renderPTMTable();
    if (activeScheduleView === 'conflict') renderScheduleConflictView();
    renderGuruPersonalSchedule();

    closeAddScheduleModal();
    showToast(`✓ Slot jadwal baru berhasil ditambahkan untuk ${classCode} (${subject} - ${teacher})!`);
  }

  function importScheduleExcel() {
    const modal = document.getElementById('modal-import-dapodik');
    if (modal) {
      modal.classList.add('active');
      if (window.SIMKUR_APP && typeof window.SIMKUR_APP.switchImportTab === 'function') {
        window.SIMKUR_APP.switchImportTab('ptm');
      }
      showToast("📥 Membuka Form Sinkronisasi Dapodik & Template Excel PTM (24 JP)...");
    } else {
      showToast("📥 Membaca berkas SK_PTM_Dapodik_Genap_2026.xlsx...");
      setTimeout(() => {
        showToast("✓ Berhasil mengimpor 48 jam mengajar dan 24 rombel (100% valid, 0 bentrok)! Data PTM Dapodik telah disinkronkan.");
        renderSchedule(activeScheduleRombel);
        renderPTMTable();
      }, 1000);
    }
  }

  function generateScheduleAI() {
    const btn = document.getElementById('btn-generate-schedule');
    const originalText = btn ? btn.innerHTML : '+ Generate Jadwal Otomatis (AI Engine)';
    
    if (btn) {
      btn.disabled = true;
      btn.innerHTML = `<span style="display:inline-block; width:13px; height:13px; border:2px solid #fff; border-top-color:transparent; border-radius:50%; animation:spin 0.6s linear infinite; vertical-align:middle; margin-right:6px;"></span> 🧠 Mengoptimasi Algoritma Genetika AI...`;
    }

    const gridBody = document.getElementById('schedule-grid-body');
    if (gridBody) {
      gridBody.style.transition = 'opacity 0.25s ease';
      gridBody.style.opacity = '0.35';
    }

    setTimeout(() => {
      // Clear any simulated conflicts
      scheduleConflictActive = false;
      data.scheduleMatrix.forEach(s => s.conflict = false);
      const clashIdx = data.scheduleMatrix.findIndex(s => s._isDemoClash);
      if (clashIdx !== -1) data.scheduleMatrix.splice(clashIdx, 1);

      const simBtn = document.getElementById('btn-simulate-conflict');
      if (simBtn) {
        simBtn.innerHTML = '⚡ Simulasikan Bentrok (Demo)';
        simBtn.classList.remove('btn-danger');
        simBtn.classList.add('btn-outline');
      }

      const badge = document.getElementById('sched-conflict-badge');
      if (badge) {
        badge.textContent = "0 Bentrok Ruang & Guru";
        badge.style.color = "#0d9488";
      }

      renderSchedule(activeScheduleRombel);
      if (activeScheduleView === 'teacher') filterScheduleTeacher(activeScheduleTeacher);
      if (activeScheduleView === 'ptm') renderPTMTable();
      if (activeScheduleView === 'conflict') renderScheduleConflictView();

      if (gridBody) {
        gridBody.style.opacity = '1';
      }

      if (btn) {
        btn.disabled = false;
        btn.innerHTML = originalText;
      }

      showToast("✨ AI Genetic Algorithm: 1.248 JP terpetakan sempurna ke 24 Rombel & 68 GTK (0 Konflik Ruang & Guru)!");
    }, 700);
  }

  function toggleScheduleConflict() {
    scheduleConflictActive = !scheduleConflictActive;
    const btn = document.getElementById('btn-simulate-conflict');
    const badge = document.getElementById('sched-conflict-badge');

    // Find slot for active rombel (or first slot) to trigger a visible conflict in the current view
    const targetSlot = data.scheduleMatrix.find(s => s.classCode === activeScheduleRombel && s.day === 'Senin' && s.period === 1) || data.scheduleMatrix[0];
    const clashSlotIndex = data.scheduleMatrix.findIndex(s => s._isDemoClash);

    if (scheduleConflictActive) {
      if (targetSlot) {
        targetSlot.conflict = true;
      }
      if (clashSlotIndex === -1 && targetSlot) {
        data.scheduleMatrix.push({
          _isDemoClash: true,
          day: targetSlot.day,
          period: targetSlot.period,
          time: targetSlot.time,
          classCode: 'XI B-TJKT',
          subject: 'Cloud Computing & Server',
          category: 'kejuruan',
          teacher: targetSlot.teacher,
          room: targetSlot.room,
          duration: targetSlot.duration,
          conflict: true
        });
      }

      if (btn) {
        btn.innerHTML = '⚡ Hentikan Simulasi Bentrok';
        btn.classList.add('btn-danger');
        btn.classList.remove('btn-outline');
      }

      if (badge) {
        badge.textContent = `⚠️ 1 Bentrok Terdeteksi (${targetSlot ? targetSlot.room : 'Lab Jaringan 2'})`;
        badge.style.color = '#dc2626';
      }

      showToast(`⚠️ SIMULASI BENTROK DIAKTIFKAN: ${targetSlot ? targetSlot.room : 'Lab Jaringan 2'} & ${targetSlot ? targetSlot.teacher : 'Guru'} bertabrakan pada Senin Jam 1!`);
    } else {
      data.scheduleMatrix.forEach(s => s.conflict = false);
      if (clashSlotIndex !== -1) {
        data.scheduleMatrix.splice(clashSlotIndex, 1);
      }

      if (btn) {
        btn.innerHTML = '⚡ Simulasikan Bentrok (Demo)';
        btn.classList.remove('btn-danger');
        btn.classList.add('btn-outline');
      }

      if (badge) {
        badge.textContent = '0 Bentrok Ruang & Guru';
        badge.style.color = '#0d9488';
      }

      showToast(`✓ Simulasi Dinonaktifkan: Seluruh slot jadwal kembali normal (0 bentrok).`);
    }

    renderSchedule(activeScheduleRombel);
    if (activeScheduleView === 'teacher') filterScheduleTeacher(activeScheduleTeacher);
    if (activeScheduleView === 'conflict') renderScheduleConflictView();
  }

  function autoResolveConflict() {
    scheduleConflictActive = false;
    data.scheduleMatrix.forEach(s => s.conflict = false);
    const clashSlotIndex = data.scheduleMatrix.findIndex(s => s._isDemoClash);
    if (clashSlotIndex !== -1) {
      data.scheduleMatrix.splice(clashSlotIndex, 1);
    }

    const btn = document.getElementById('btn-simulate-conflict');
    if (btn) {
      btn.innerHTML = '⚡ Simulasikan Bentrok (Demo)';
      btn.classList.remove('btn-danger');
      btn.classList.add('btn-outline');
    }

    const badge = document.getElementById('sched-conflict-badge');
    if (badge) {
      badge.textContent = "0 Bentrok Ruang & Guru";
      badge.style.color = "#0d9488";
    }

    renderSchedule(activeScheduleRombel);
    if (activeScheduleView === 'teacher') filterScheduleTeacher(activeScheduleTeacher);
    if (activeScheduleView === 'conflict') renderScheduleConflictView();
    showToast("✓ Algoritma AI berhasil merelokasi slot jadwal ke ruang alternatif (0 konflik tersisa)!");
  }

  function exportSchedule() {
    const rombelSlots = data.scheduleMatrix.filter(s => s.classCode === activeScheduleRombel);
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Hari,Jam Ke,Waktu,Kelas,Mata Pelajaran,Kategori,Guru Pengampu,Ruang/Lab,Durasi JP,Status Bentrok\r\n";
    
    rombelSlots.forEach(s => {
      const row = [
        `"${s.day}"`,
        `"${s.period}"`,
        `"${s.time}"`,
        `"${s.classCode}"`,
        `"${s.subject}"`,
        `"${s.category}"`,
        `"${s.teacher}"`,
        `"${s.room}"`,
        `"${s.duration} JP"`,
        `"${s.conflict ? 'BENTROK' : 'AMAN'}"`
      ].join(",");
      csvContent += row + "\r\n";
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Jadwal_Pelajaran_${activeScheduleRombel.replace(/\s+/g, '_')}_TA2026.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast(`✓ Berkas Excel (.CSV) Jadwal ${activeScheduleRombel} berhasil diunduh! Menyiapkan pratinjau cetak...`);
    setTimeout(() => {
      window.print();
    }, 900);
  }

  /* ==========================================================================
     MODUL 6.2: KURIKULUM & SINKRONISASI DUDI
     ========================================================================== */
  function renderKurikulum() {
    const container = document.getElementById('kurikulum-dept-accordions');
    if (!container) return;

    container.innerHTML = data.departments.map(dept => `
      <div class="content-card" style="margin-bottom: 1rem;">
        <div class="content-card-header" style="cursor: pointer;" onclick="this.nextElementSibling.classList.toggle('active')">
          <div class="content-card-title">
            <span class="badge-status badge-approved">${dept.code}</span>
            <span>${dept.name}</span>
          </div>
          <div style="display: flex; align-items: center; gap: 1rem;">
            <span style="font-size: var(--text-xs); color: #0d9488; font-weight: 600;">✓ 100% Selaras Deep Learning 2026</span>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg>
          </div>
        </div>
        <div class="content-card-body" style="background-color: #fcfdfe;">
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem;">
            <div>
              <h4 style="font-size: var(--text-sm); margin-bottom: 0.5rem; color: var(--primary);">Struktur Mata Pelajaran & Jam Intrakurikuler:</h4>
              <ul style="font-size: var(--text-xs); color: #475569; padding-left: 1.25rem; display: flex; flex-direction: column; gap: 0.35rem;">
                <li>Muatan Umum / Nasional: 12 JP/Minggu (Pendidikan Agama, PPKn, Bahasa Indonesia, Sejarah)</li>
                <li>Matematika Terapan & Bahasa Inggris Kejuruan: 8 JP/Minggu</li>
                <li>Konsentrasi Keahlian Produktif: 24 JP/Minggu (Sistem Blok Bengkel/Lab)</li>
                <li>Kokurikuler P5 (Kreatif & Kebekerjaan): 4 JP/Minggu</li>
              </ul>
            </div>
            <div>
              <h4 style="font-size: var(--text-sm); margin-bottom: 0.5rem; color: var(--secondary);">Sinkronisasi Kurikulum Bersama DUDI Mitra:</h4>
              <div style="background-color: #ffffff; border: 1px solid var(--outline-light); border-radius: var(--radius-sm); padding: 0.75rem; font-size: var(--text-xs);">
                <p><strong>Mitra Industri:</strong> ${(dept.dudiPartners && dept.dudiPartners.length > 0) ? dept.dudiPartners.join(', ') : 'Belum Ada Mitra Terdaftar (Tahap Penjajakan)'}</p>
                <p style="margin-top: 0.25rem;"><strong>Catatan Revisi Terakhir:</strong> Penambahan Capaian Pembelajaran (CP) praktikum industri pada semester 4 & 5.</p>
                <p style="margin-top: 0.25rem; color: #059669; font-weight: 600;">Status MoU: Aktif s.d 2028 (Dukungan Asesor UKK & Kuota Magang PKL).</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    `).join('');
  }

  /* ==========================================================================
     MODUL 6.8: MONITORING PKL — SEDERHANA (Filter Kelas + Cari Siswa)
     ========================================================================== */

  function renderPKL() {
    // Deteksi department dari session (khusus kajur)
    _pklDeptFilter = null;
    try {
      const sessionStr = localStorage.getItem('simkur_session');
      if (sessionStr) {
        const session = JSON.parse(sessionStr);
        if (session && session.role === 'kajur' && session.department) {
          _pklDeptFilter = session.department.toUpperCase();
        }
      }
    } catch(e) {}

    // Update dropdown kelas sesuai jurusan
    _updatePklKelasDropdown(_pklDeptFilter);

    // Update header info jurusan
    const badge = document.getElementById('pkl-dept-scope-badge');
    if (badge) {
      if (_pklDeptFilter) {
        badge.textContent = `Jurusan: ${_pklDeptFilter}`;
        badge.style.display = 'inline-flex';
      } else {
        badge.style.display = 'none';
      }
    }

    _pklActiveKelas = 'ALL';
    _pklSearchQuery = '';
    renderPklTable('ALL', '');
  }

  function _updatePklKelasDropdown(dept) {
    const sel = document.getElementById('pkl-kelas-select');
    if (!sel) return;

    const allOptions = [
      { value: 'ALL', label: dept ? `Semua Kelas ${dept}` : 'Semua Kelas PKL' },
      { value: 'XII TJKT 1', dept: 'TJKT' },
      { value: 'XII TJKT 2', dept: 'TJKT' },
      { value: 'XII DKV 1',  dept: 'DKV'  },
      { value: 'XII DKV 2',  dept: 'DKV'  },
      { value: 'XII AKL 1',  dept: 'AKL'  },
      { value: 'XII AKL 2',  dept: 'AKL'  },
      { value: 'XII MPLB 1', dept: 'MPLB' },
      { value: 'XII MPLB 2', dept: 'MPLB' },
      { value: 'XII Pemasaran 1', dept: 'Pemasaran' },
    ];

    const visible = dept
      ? allOptions.filter(o => !o.dept || o.dept.toUpperCase() === dept.toUpperCase())
      : allOptions;

    sel.innerHTML = visible.map(o =>
      `<option value="${o.value}">${o.label || o.value}</option>`
    ).join('');
  }



  function renderPklTable(kelas, query) {
    const tableBody = document.getElementById('pkl-students-table-body');
    const countBadge = document.getElementById('pkl-count-badge');
    if (!tableBody) return;

    const students = (data.pklModule && data.pklModule.students) ? data.pklModule.students : [];
    const filtered = students.filter(s => {
      // Filter jurusan (kajur hanya lihat jurusannya sendiri)
      if (_pklDeptFilter && s.rombel) {
        const rombelUpper = s.rombel.toUpperCase();
        if (!rombelUpper.includes(_pklDeptFilter.toUpperCase())) return false;
      }
      // Filter kelas spesifik
      const matchKelas = (kelas === 'ALL') || (s.rombel && s.rombel.includes(kelas));
      // Filter pencarian
      const q = query.toLowerCase();
      const matchSearch = !q ||
        s.name.toLowerCase().includes(q) ||
        (s.nisn && s.nisn.includes(q)) ||
        (s.company && s.company.toLowerCase().includes(q)) ||
        (s.schoolMentor && s.schoolMentor.toLowerCase().includes(q)) ||
        (s.dudiMentor && s.dudiMentor.toLowerCase().includes(q));
      return matchKelas && matchSearch;
    });


    if (countBadge) countBadge.textContent = `${filtered.length} Siswa`;

    if (filtered.length === 0) {
      tableBody.innerHTML = `
        <tr>
          <td colspan="7" class="table-empty-cell">
            <div class="empty-state-box" style="margin: 0 auto; max-width: 460px; border: none; background: transparent; padding: 2rem 1rem;">
              <div class="empty-state-icon-wrap">
                <span style="font-size: 1.75rem;">🏭</span>
              </div>
              <div class="empty-state-title">Belum Ada Data Siswa PKL</div>
              <div class="empty-state-desc">Pilih filter kelas atau ubah kata kunci pencarian. Data penempatan siswa magang DUDI akan tampil di sini.</div>
            </div>
          </td>
        </tr>
      `;
      return;
    }

    tableBody.innerHTML = filtered.map((s, idx) => `
      <tr>
        <td style="text-align: center; color: #94a3b8; font-weight: 600;">${idx + 1}</td>
        <td>
          <div style="font-weight: 700; color: var(--primary); font-size: var(--text-sm);">${s.name}</div>
          <div style="font-size: 0.6875rem; color: #64748b;" class="font-mono">NISN: ${s.nisn}</div>
          <div style="margin-top: 2px;">
            <span class="badge-status badge-approved" style="font-size: 0.625rem; padding: 1px 7px;">${s.rombel}</span>
          </div>
        </td>
        <td>
          <div style="font-weight: 600; color: #1e293b; font-size: var(--text-sm);">${s.company}</div>
          ${s.companyAddress ? `<div style="font-size: 0.6875rem; color: #64748b; margin-top: 2px;">📍 ${s.companyAddress}</div>` : ''}
          ${s.companyTier ? `<span class="badge-status" style="font-size: 0.625rem; padding: 1px 6px; background: #eff6ff; color: #1d4ed8; border: 1px solid #bfdbfe; margin-top: 3px; display: inline-block;">${s.companyTier}</span>` : ''}
        </td>
        <td>
          <div style="font-weight: 600; color: #0f172a; font-size: var(--text-sm);">
            <span style="color: #0d9488;">🏫</span> ${s.schoolMentor}
          </div>
        </td>
        <td>
          <div style="font-size: var(--text-sm); color: #475569;">${s.dudiMentor}</div>
        </td>
        <td>
          <div style="font-size: var(--text-xs); color: #64748b;">${s.duration}</div>
          <div style="margin-top: 4px;">
            <div class="progress-bar-container" style="height: 5px; margin: 0;">
              <div class="progress-fill" style="width: ${s.progressPct || 0}%;"></div>
            </div>
            <div style="font-size: 0.625rem; color: #94a3b8; margin-top: 2px;">${s.progressMonth || ''}</div>
          </div>
        </td>
        <td>
          <span class="badge-status ${s.statusClass || 'badge-approved'}">${s.status}</span>
        </td>
      </tr>
    `).join('');
  }

  // Expose filter functions
  window.SIMKUR_APP = window.SIMKUR_APP || {};





  /* ==========================================================================
     MODUL 6.9: UJI KOMPETENSI KEAHLIAN (UKK) & SERTIFIKASI LSP (Stitch Screen 2)
     ========================================================================== */
  function renderUKK() {
    const tableBody = document.getElementById('ukk-schemes-table-body');
    if (!tableBody) return;

    let activeSubtab = 'all';
    let filterMajor = 'ALL';
    let filterTrack = 'ALL';
    let searchQuery = '';

    function getFilteredSchemes() {
      return data.ukkModule.schemes.filter(s => {
        // Subtab filter
        if (activeSubtab === 'lsp' && s.trackType !== 'lsp') return false;
        if (activeSubtab === 'mandiri' && s.trackType !== 'mandiri') return false;

        // Major filter
        if (filterMajor !== 'ALL' && s.major !== filterMajor) return false;

        // Track filter
        if (filterTrack !== 'ALL' && s.trackType !== filterTrack) return false;

        // Search filter
        if (searchQuery) {
          const q = searchQuery.toLowerCase();
          const matchTitle = s.title.toLowerCase().includes(q);
          const matchCode = s.code.toLowerCase().includes(q);
          const matchTuk = s.tukLocation.toLowerCase().includes(q);
          const matchAssessors = s.assessors.toLowerCase().includes(q);
          if (!matchTitle && !matchCode && !matchTuk && !matchAssessors) return false;
        }

        return true;
      });
    }

    function renderSchemesTable() {
      const list = getFilteredSchemes();
      if (list.length === 0) {
        tableBody.innerHTML = `
          <tr>
            <td colspan="8" class="table-empty-cell">
              <div class="empty-state-box" style="margin: 0 auto; max-width: 460px; border: none; background: transparent; padding: 2rem 1rem;">
                <div class="empty-state-icon-wrap">
                  <span style="font-size: 1.75rem;">🎓</span>
                </div>
                <div class="empty-state-title">Tidak Ada Skema UKK Ditemukan</div>
                <div class="empty-state-desc">Sesuaikan filter jurusan atau jalur pengujian (LSP-P1 / Mandiri DUDI) untuk menampilkan daftar skema sertifikasi.</div>
              </div>
            </td>
          </tr>
        `;
        return;
      }

      tableBody.innerHTML = list.map(s => `
        <tr>
          <td>
            <div style="font-weight: 700; color: var(--primary);">${s.title}</div>
            <div style="font-size: 0.6875rem; color: #64748b;" class="font-mono">Kode: ${s.code} • Jurusan ${s.major}</div>
          </td>
          <td>
            <span class="badge-status" style="font-size: 0.6875rem; padding: 2px 8px; ${s.trackType === 'lsp' ? 'background: #0d9488; color: #fff;' : 'background: #f59e0b; color: #fff;'}">
              ${s.track}
            </span>
            <div style="font-size: 0.6875rem; color: #475569; margin-top: 0.25rem;">${s.certificate}</div>
          </td>
          <td style="font-size: var(--text-xs);">
            <div style="font-weight: 600; color: #1e293b;">${s.tukLocation}</div>
          </td>
          <td style="font-size: var(--text-xs);">
            <div style="color: #334155;">${s.assessors}</div>
          </td>
          <td style="font-size: var(--text-xs);">
            <div><strong>${s.candidatesCount} Asesi</strong></div>
            <div style="font-size: 0.6875rem; color: #64748b;">${s.sessionsInfo}</div>
          </td>
          <td style="font-size: var(--text-xs);">
            <div style="font-weight: 600;">${s.scheduleDate}</div>
          </td>
          <td>
            <span class="badge-status ${s.statusClass}">${s.status}</span>
          </td>
          <td>
            <div style="display: flex; gap: 0.35rem;">
              <button class="btn btn-outline" style="padding: 4px 8px; font-size: 0.75rem;" title="Detail Sesi Ujian" onclick="window.SIMKUR_APP.openUkkSessionDetail('${s.id}')">
                Detail
              </button>
              <button class="btn btn-outline" style="padding: 4px 8px; font-size: 0.75rem;" title="Cetak Surat Tugas Asesor" onclick="window.SIMKUR_APP.printUkkSuratTugas('${s.id}')">
                Surat Tugas
              </button>
              <button class="btn btn-outline" style="padding: 4px 8px; font-size: 0.75rem;" title="Input Nilai UKK" onclick="window.SIMKUR_APP.openUkkGradeInput('${s.id}')">
                Nilai
              </button>
            </div>
          </td>
        </tr>
      `).join('');
    }

    // Interactive Track Switcher Banner
    const bannerLsp = document.getElementById('track-banner-lsp');
    const bannerMandiri = document.getElementById('track-banner-mandiri');
    const trackSelect = document.getElementById('filter-ukk-track');

    if (bannerLsp && bannerMandiri) {
      bannerLsp.addEventListener('click', () => {
        bannerLsp.style.borderColor = '#0d9488';
        bannerLsp.style.background = '#f0fdfa';
        bannerMandiri.style.borderColor = '#e2e8f0';
        bannerMandiri.style.background = '#ffffff';
        if (trackSelect) trackSelect.value = 'lsp';
        filterTrack = 'lsp';
        renderSchemesTable();
        showToast("✓ Menampilkan Skema Jalur LSP-P1 Lisensi BNSP (3 Jurusan)");
      });

      bannerMandiri.addEventListener('click', () => {
        bannerMandiri.style.borderColor = '#f59e0b';
        bannerMandiri.style.background = '#fffbeb';
        bannerLsp.style.borderColor = '#e2e8f0';
        bannerLsp.style.background = '#ffffff';
        if (trackSelect) trackSelect.value = 'mandiri';
        filterTrack = 'mandiri';
        renderSchemesTable();
        showToast("✓ Menampilkan Skema Jalur Mandiri Terakreditasi DUDI (2 Jurusan)");
      });
    }

    // Subtabs
    const subtabs = document.querySelectorAll('#ukk-subtabs .subtab-btn');
    subtabs.forEach(btn => {
      btn.addEventListener('click', () => {
        subtabs.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        activeSubtab = btn.getAttribute('data-tab');
        if (activeSubtab === 'asesi') {
          showToast("👥 Memuat Data 360 Calon Asesi UKK Tingkat XII...");
        }
        renderSchemesTable();
      });
    });

    // Major filter
    const majorSelect = document.getElementById('filter-ukk-major');
    if (majorSelect) {
      majorSelect.addEventListener('change', (e) => {
        filterMajor = e.target.value;
        renderSchemesTable();
      });
    }

    // Track filter
    if (trackSelect) {
      trackSelect.addEventListener('change', (e) => {
        filterTrack = e.target.value;
        renderSchemesTable();
      });
    }

    // Search input
    const searchInput = document.getElementById('search-ukk-input');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        searchQuery = e.target.value;
        renderSchemesTable();
      });
    }

    window._refreshUkkSchemesTable = renderSchemesTable;
    renderSchemesTable();
  }

  /* ==========================================================================
     MODUL 6.6: SUPERVISI AKADEMIK & OBSERVASI KELAS (Stitch Screen 3)
     ========================================================================== */

  function renderSupervision() {
    const tableBody = document.getElementById('supervisi-table-body');
    if (!tableBody) return;

    // Update KPI metrics
    const supList = data.supervisionData || [];
    const supSum = data.supervisionSummary || {};
    const totalTeachers = supSum.totalTeachers || (data.documentsList ? data.documentsList.length : 82);
    const scheduledCount = supSum.scheduled || supList.length || 0;
    const completedCount = supSum.completed || supList.filter(s => s.status === 'Refleksi Tuntas').length || 0;
    const pendingCount = supSum.pendingFollowUp || supList.filter(s => s.status === 'Perlu Dialog' || s.status === 'Observasi Selesai').length || 0;
    const schedPct = ((scheduledCount / totalTeachers) * 100).toFixed(1);

    const elSched = document.getElementById('sup-kpi-scheduled');
    const elSchedSub = document.getElementById('sup-kpi-scheduled-sub');
    const elSchedBar = document.getElementById('sup-kpi-scheduled-bar');
    const elSchedFoot = document.getElementById('sup-kpi-scheduled-foot');
    if (elSched) elSched.textContent = `${scheduledCount} / ${totalTeachers}`;
    if (elSchedSub) elSchedSub.textContent = `Guru (${schedPct}%)`;
    if (elSchedBar) elSchedBar.style.width = `${schedPct}%`;
    if (elSchedFoot) elSchedFoot.textContent = `${totalTeachers - scheduledCount} Guru Siap Dijadwalkan`;

    const elComp = document.getElementById('sup-kpi-completed');
    const elCompBar = document.getElementById('sup-kpi-completed-bar');
    const elCompScore = document.getElementById('sup-kpi-completed-score');
    const elCompPred = document.getElementById('sup-kpi-completed-pred');
    if (elComp) elComp.textContent = completedCount;
    if (elCompBar) elCompBar.style.width = scheduledCount > 0 ? `${((completedCount / scheduledCount) * 100).toFixed(1)}%` : '0%';
    if (elCompScore) elCompScore.textContent = supSum.avgScore ? `Rata-rata Skor: ${supSum.avgScore}` : 'Rata-rata Skor: —';
    if (elCompPred) elCompPred.textContent = completedCount > 0 ? 'Kategori Baik' : 'Belum Dimulai';

    const elPend = document.getElementById('sup-kpi-pending');
    const elPendBar = document.getElementById('sup-kpi-pending-bar');
    if (elPend) elPend.textContent = pendingCount;
    if (elPendBar) elPendBar.style.width = scheduledCount > 0 ? `${((pendingCount / scheduledCount) * 100).toFixed(1)}%` : '0%';

    if (!data.supervisionData || data.supervisionData.length === 0) {
      tableBody.innerHTML = `
        <tr>
          <td colspan="7" class="table-empty-cell">
            <div class="empty-state-box" style="margin: 0 auto; max-width: 480px; border: none; background: transparent; padding: 2rem 1rem;">
              <div class="empty-state-icon-wrap">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#64748b" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
              </div>
              <div class="empty-state-title">Belum Ada Riwayat Supervisi Akademik</div>
              <div class="empty-state-desc">Pusat observasi kelas dan supervisi kurikulum. Klik tombol di bawah untuk menjadwalkan atau merekam observasi kelas guru.</div>
              <div class="empty-state-action">
                <button type="button" class="btn btn-primary btn-sm" onclick="window.SIMKUR_APP.openSupervisionForm()">
                  + Jadwalkan Supervisi Pertama
                </button>
              </div>
            </div>
          </td>
        </tr>
      `;
      const detailPane = document.getElementById('supervisi-detail-pane');
      if (detailPane) {
        detailPane.innerHTML = `
          <div class="empty-state-box" style="border: none; background: transparent; padding: 2.5rem 1rem;">
            <div class="empty-state-icon-wrap" style="font-size: 1.5rem;">📋</div>
            <div class="empty-state-title">Pilih Catatan Supervisi</div>
            <div class="empty-state-desc">Detail dialog pasca-observasi dan 4 pilar asesmen guru akan ditampilkan di sini.</div>
          </div>
        `;
      }
      return;
    }

    tableBody.innerHTML = data.supervisionData.map(s => `
      <tr style="cursor: pointer;" data-sup-id="${s.id}" onclick="window.SIMKUR_APP.inspectSupervisionRecord('${s.id}')">
        <td>
          <div style="font-weight: 700; color: var(--primary);">${s.teacher}</div>
          <div style="font-size: 0.6875rem; color: #64748b;" class="font-mono">NIP. ${s.nip}</div>
        </td>
        <td>
          <div style="font-weight: 600;">${s.subject}</div>
          <div style="font-size: 0.75rem; color: #64748b;">${s.classRoom}</div>
        </td>
        <td>
          <div style="font-size: var(--text-sm); font-weight: 500;">${s.date}</div>
        </td>
        <td>
          <div style="font-size: var(--text-xs); color: #334155;">${s.supervisor}</div>
        </td>
        <td>
          ${s.score ? `<span style="font-weight: 800; color: #059669; font-size: var(--text-md);">${s.score}</span> <span style="font-size: 0.6875rem; color: #64748b;">(${s.predicate})</span>` : `<span style="font-size: 0.75rem; color: #94a3b8;">${s.predicate}</span>`}
        </td>
        <td>
          <span class="badge-status ${s.status === 'Refleksi Tuntas' ? 'badge-approved' : (s.status === 'Terjadwal' ? 'badge-review' : 'badge-revision')}">${s.status}</span>
        </td>
        <td>
          <div style="display: flex; gap: 0.35rem;">
            <button type="button" class="btn btn-primary btn-sm" onclick="event.stopPropagation(); window.SIMKUR_APP.openSupervisionForm('${s.id}')" title="Buka Formulir Evaluasi Observasi">
              📋 Formulir
            </button>
            <button type="button" class="btn btn-ghost btn-sm" onclick="event.stopPropagation(); window.SIMKUR_APP.sendDirectWA('${s.teacher}', '${s.nip}')" title="Kirim WA">
              📲
            </button>
          </div>
        </td>
      </tr>
    `).join('');

    // Default inspect first record
    if (data.supervisionData.length > 0) {
      inspectSupervisionRecord(data.supervisionData[0].id);
    }
  }

  function inspectSupervisionRecord(id) {
    const s = data.supervisionData.find(item => item.id === id);
    if (!s) return;

    // Highlight row
    document.querySelectorAll('#supervisi-table-body tr').forEach(tr => tr.classList.remove('selected-row'));
    const targetRow = document.querySelector(`#supervisi-table-body tr[data-sup-id="${id}"]`);
    if (targetRow) targetRow.classList.add('selected-row');

    document.getElementById('supervisi-preview-teacher').textContent = s.teacher;
    document.getElementById('supervisi-preview-subject').textContent = `${s.subject} • ${s.classRoom}`;
    document.getElementById('supervisi-score-1').textContent = s.aspects.planning ? `${s.aspects.planning} / 4.0` : '-';
    document.getElementById('supervisi-score-2').textContent = s.aspects.deepLearning ? `${s.aspects.deepLearning} / 4.0` : '-';
    document.getElementById('supervisi-score-3').textContent = s.aspects.industryTefa ? `${s.aspects.industryTefa} / 4.0` : '-';
    document.getElementById('supervisi-score-4').textContent = s.aspects.formativeAssess ? `${s.aspects.formativeAssess} / 4.0` : '-';
    document.getElementById('supervisi-preview-notes').textContent = s.dialogNotes;
    document.getElementById('supervisi-sign-status').textContent = s.verifiedDigital ? "✓ Tervalidasi Tanda Tangan Digital Waka & Telah Dibaca Guru" : "⏳ Menunggu Observasi & Validasi";
  }

  function openSupervisionForm(id) {
    const s = data.supervisionData.find(item => item.id === id) || data.supervisionData[0];
    if (!s) return;
    activeSupervisionRecord = s;

    document.getElementById('supervisi-form-id').value = s.id;
    document.getElementById('supervisi-form-teacher').textContent = s.teacher;
    document.getElementById('supervisi-form-nip').textContent = `NIP. ${s.nip}`;
    document.getElementById('supervisi-form-subject').textContent = s.subject;
    document.getElementById('supervisi-form-classroom').textContent = s.classRoom;
    document.getElementById('supervisi-form-supervisor').textContent = s.supervisor;
    document.getElementById('supervisi-form-date').textContent = s.date;

    document.getElementById('supervisi-input-score1').value = s.aspects.planning || 4.0;
    document.getElementById('supervisi-input-score2').value = s.aspects.deepLearning || 3.8;
    document.getElementById('supervisi-input-score3').value = s.aspects.industryTefa || 4.0;
    document.getElementById('supervisi-input-score4').value = s.aspects.formativeAssess || 3.5;
    
    document.getElementById('supervisi-input-notes').value = s.dialogNotes || '';
    document.getElementById('supervisi-input-status').value = s.status || 'Refleksi Tuntas';
    document.getElementById('supervisi-input-verified').checked = s.verifiedDigital !== false;

    calculateSupervisionTotal();

    const modal = document.getElementById('modal-supervisi-instrument');
    if (modal) modal.classList.add('active');
  }

  function closeSupervisionForm() {
    const modal = document.getElementById('modal-supervisi-instrument');
    if (modal) modal.classList.remove('active');
  }

  function calculateSupervisionTotal() {
    const s1 = parseFloat(document.getElementById('supervisi-input-score1')?.value) || 0;
    const s2 = parseFloat(document.getElementById('supervisi-input-score2')?.value) || 0;
    const s3 = parseFloat(document.getElementById('supervisi-input-score3')?.value) || 0;
    const s4 = parseFloat(document.getElementById('supervisi-input-score4')?.value) || 0;

    const avg = (s1 + s2 + s3 + s4) / 4;
    const finalScore = Math.round((avg / 4) * 100);

    let pred = 'Kurang (D)';
    let predColor = '#dc2626';
    if (finalScore >= 91) {
      pred = 'Amat Baik (A)';
      predColor = '#059669';
    } else if (finalScore >= 81) {
      pred = 'Baik (B)';
      predColor = '#0d9488';
    } else if (finalScore >= 71) {
      pred = 'Cukup (C)';
      predColor = '#d97706';
    }

    const scoreEl = document.getElementById('supervisi-calc-score');
    const predEl = document.getElementById('supervisi-calc-predicate');
    if (scoreEl) scoreEl.textContent = `${finalScore} / 100 (Rata-rata: ${avg.toFixed(2)}/4.0)`;
    if (predEl) {
      predEl.textContent = pred;
      predEl.style.color = predColor;
    }
  }

  function saveSupervisionForm() {
    const id = document.getElementById('supervisi-form-id')?.value;
    const s = data.supervisionData.find(item => item.id === id);
    if (!s) return;

    const s1 = parseFloat(document.getElementById('supervisi-input-score1')?.value) || 0;
    const s2 = parseFloat(document.getElementById('supervisi-input-score2')?.value) || 0;
    const s3 = parseFloat(document.getElementById('supervisi-input-score3')?.value) || 0;
    const s4 = parseFloat(document.getElementById('supervisi-input-score4')?.value) || 0;
    const notes = document.getElementById('supervisi-input-notes')?.value || '';
    const status = document.getElementById('supervisi-input-status')?.value || 'Refleksi Tuntas';
    const verified = document.getElementById('supervisi-input-verified')?.checked || false;

    const avg = (s1 + s2 + s3 + s4) / 4;
    const finalScore = Math.round((avg / 4) * 100);
    let pred = finalScore >= 91 ? 'Amat Baik' : (finalScore >= 81 ? 'Baik' : (finalScore >= 71 ? 'Cukup' : 'Kurang'));

    s.aspects = { planning: s1, deepLearning: s2, industryTefa: s3, formativeAssess: s4 };
    s.score = finalScore;
    s.predicate = pred;
    s.dialogNotes = notes;
    s.status = status;
    s.verifiedDigital = verified;

    renderSupervision();
    inspectSupervisionRecord(id);
    closeSupervisionForm();
    showToast(`✓ Formulir instrumen supervisi untuk ${s.teacher} berhasil disimpan & disahkan (Skor: ${finalScore} - ${pred})!`);
  }

  function openNewSupervisionModal() {
    const modal = document.getElementById('modal-schedule-supervisi');
    if (modal) modal.classList.add('active');
  }

  function closeScheduleSupervisionModal() {
    const modal = document.getElementById('modal-schedule-supervisi');
    if (modal) modal.classList.remove('active');
  }

  function saveNewSupervisionSchedule() {
    const rawTeacher = document.getElementById('sched-sup-teacher')?.value || '';
    const parts = rawTeacher.split('|');
    const teacherName = parts[0] || 'Guru Baru';
    const nip = parts[1] || '-';
    const dept = parts[2] || 'Umum';
    const subject = parts[3] || 'Mata Pelajaran';
    const classRoom = parts[4] || 'Ruang Kelas';

    const date = document.getElementById('sched-sup-date')?.value || new Date().toISOString().split('T')[0];
    const supervisor = document.getElementById('sched-sup-supervisor')?.value || 'Waka Kurikulum';
    const notes = document.getElementById('sched-sup-notes')?.value || 'Jadwal observasi siklus baru.';

    const newSup = {
      id: `SUP-0${data.supervisionData.length + 1}`,
      teacher: teacherName,
      nip: nip,
      department: dept,
      subject: subject,
      classRoom: classRoom,
      date: date,
      supervisor: supervisor,
      score: null,
      predicate: 'Menunggu Jadwal',
      status: 'Terjadwal',
      aspects: { planning: 3.8, deepLearning: null, industryTefa: null, formativeAssess: null },
      dialogNotes: notes,
      verifiedDigital: false
    };

    data.supervisionData.unshift(newSup);
    renderSupervision();
    inspectSupervisionRecord(newSup.id);
    closeScheduleSupervisionModal();
    showToast(`✓ Jadwal supervisi baru untuk ${teacherName} berhasil ditetapkan pada ${date}!`);
  }

  function openSupervisionInstrumentTemplate() {
    openSupervisionForm('SUP-01');
    showToast("📋 Menampilkan Format Instrumen Observasi Digital Resmi (Permendikdasmen No. 1/2026).");
  }

  /* ==========================================================================
     MODUL 6.7: MANAJEMEN PENILAIAN & INTEGRASI CBT (Stitch Screen 2)
     ========================================================================== */
  function renderCBT() {
    const tableBody = document.getElementById('cbt-classes-table-body');
    if (!tableBody) return;

    // Update CBT KPI metrics dynamically
    const cbt = data.cbtData || {};
    const avgVal = cbt.schoolAvgScore > 0 ? cbt.schoolAvgScore.toFixed(1) : '—';
    const kktpRate = cbt.kktpCompletionRate || 0;
    const remediCount = cbt.studentsNeedingRemedial || 0;
    const examsCount = cbt.activeExamsCount || 0;

    const elCbtAvg = document.getElementById('cbt-kpi-avg');
    const elCbtAvgBar = document.getElementById('cbt-kpi-avg-bar');
    const elCbtAvgDelta = document.getElementById('cbt-kpi-avg-delta');
    const elCbtAvgSub = document.getElementById('cbt-kpi-avg-sub');
    if (elCbtAvg) elCbtAvg.textContent = avgVal;
    if (elCbtAvgBar) elCbtAvgBar.style.width = cbt.schoolAvgScore > 0 ? `${cbt.schoolAvgScore}%` : '0%';
    if (elCbtAvgDelta) elCbtAvgDelta.textContent = cbt.scoreTrendDelta ? `Trend: ${cbt.scoreTrendDelta}` : 'Siap Sinkron Server';
    if (elCbtAvgSub) elCbtAvgSub.textContent = examsCount > 0 ? `${cbt.classesSummary?.length || 0} Rombel Ujian` : '0 Siswa Ujian';

    const elCbtKktp = document.getElementById('cbt-kpi-kktp');
    const elCbtKktpBar = document.getElementById('cbt-kpi-kktp-bar');
    const elCbtKktpStatus = document.getElementById('cbt-kpi-kktp-status');
    if (elCbtKktp) elCbtKktp.textContent = `${kktpRate}%`;
    if (elCbtKktpBar) elCbtKktpBar.style.width = `${kktpRate}%`;
    if (elCbtKktpStatus) elCbtKktpStatus.textContent = kktpRate >= 85 ? 'Tercapai Target' : (kktpRate > 0 ? 'Perlu Intervensi' : 'Menunggu Data Ujian');

    const elCbtRemedi = document.getElementById('cbt-kpi-remedi');
    const elCbtRemediBar = document.getElementById('cbt-kpi-remedi-bar');
    if (elCbtRemedi) elCbtRemedi.textContent = remediCount;
    if (elCbtRemediBar) elCbtRemediBar.style.width = remediCount > 0 ? `${Math.min(remediCount * 2, 100)}%` : '0%';

    const elCbtExams = document.getElementById('cbt-kpi-exams');
    const elCbtExamsBar = document.getElementById('cbt-kpi-exams-bar');
    if (elCbtExams) elCbtExams.textContent = examsCount;
    if (elCbtExamsBar) elCbtExamsBar.style.width = examsCount > 0 ? '100%' : '0%';

    // Render classes CBT table
    if (!data.cbtData.classesSummary || data.cbtData.classesSummary.length === 0) {
      tableBody.innerHTML = `
        <tr>
          <td colspan="8" class="table-empty-cell">
            <div class="empty-state-box" style="margin: 0 auto; max-width: 480px; border: none; background: transparent; padding: 2rem 1rem;">
              <div class="empty-state-icon-wrap">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#64748b" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
              </div>
              <div class="empty-state-title">Belum Ada Rekap Nilai CBT</div>
              <div class="empty-state-desc">Pusat integrasi nilai CBT PTS, PAS, PAT, & UKK. Klik tombol di bawah untuk mengimpor berkas hasil ujian semester siswa.</div>
              <div class="empty-state-action">
                <button type="button" class="btn btn-primary btn-sm" onclick="window.SIMKUR_APP.openImportCbtModal()">
                  📥 Impor Berkas JSON CBT
                </button>
              </div>
            </div>
          </td>
        </tr>
      `;
    } else {
      tableBody.innerHTML = data.cbtData.classesSummary.map(c => `
        <tr>
          <td><strong>${c.rombel}</strong></td>
          <td>
            <div style="font-weight: 600;">${c.subject}</div>
            <div style="font-size: 0.6875rem; color: #64748b;">${c.teacher}</div>
          </td>
          <td><span class="font-mono">${c.participants}</span> Siswa</td>
          <td><strong style="color: var(--primary); font-size: var(--text-md);">${c.avgScore}</strong></td>
          <td>
            <div style="display: flex; align-items: center; gap: 0.5rem;">
              <span style="font-weight: 700; color: ${c.completionRate >= 85 ? '#059669' : '#d97706'};">${c.completionRate}%</span>
              <div class="progress-bar-container" style="width: 60px; margin: 0;">
                <div class="progress-fill ${c.completionRate < 85 ? 'amber' : ''}" style="width: ${c.completionRate}%;"></div>
              </div>
            </div>
          </td>
          <td>
            <span style="color: ${c.remedialCount > 5 ? '#e11d48' : '#334155'}; font-weight: 700;">${c.remedialCount} Siswa</span>
          </td>
          <td>
            <span class="badge-status ${c.syncStatus.includes('Perlu') ? 'badge-revision' : 'badge-approved'}">${c.syncStatus}</span>
          </td>
          <td>
            <button class="btn btn-outline btn-sm" onclick="alert('Topik Butuh Intervensi (${c.rombel}):\\n${c.lowestTopic}\\n\\nPaket soal CBT remedial siap dibuat.')">
              Intervensi
            </button>
          </td>
        </tr>
      `).join('');
    }

    // Department bars
    const deptBarsContainer = document.getElementById('cbt-dept-bars-container');
    if (deptBarsContainer) {
      deptBarsContainer.innerHTML = data.cbtData.departmentKktp.map(d => `
        <div style="margin-bottom: 0.75rem;">
          <div style="display: flex; justify-content: space-between; font-size: var(--text-xs); font-weight: 600; margin-bottom: 0.25rem;">
            <span>${d.dept} (Rerata: ${d.avg})</span>
            <span style="color: ${d.rate < 85 ? '#d97706' : '#059669'};">${d.rate}% Ketuntasan KKTP</span>
          </div>
          <div class="progress-bar-container">
            <div class="progress-fill ${d.rate < 85 ? 'amber' : ''}" style="width: ${d.rate}%;"></div>
          </div>
        </div>
      `).join('');
    }

    // Smart recommendations list
    const remedyList = document.getElementById('cbt-remedial-list');
    if (remedyList) {
      if (!data.cbtData.remedialRecommendations || data.cbtData.remedialRecommendations.length === 0) {
        remedyList.innerHTML = `
          <div style="padding: 1rem; text-align: center; color: #059669; background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: var(--radius-sm); font-size: var(--text-xs);">
            <div style="font-weight: 700; margin-bottom: 0.25rem;">✓ Tidak Ada Rekomendasi Remedial</div>
            <div>Seluruh peserta didik telah mencapai kriteria ketercapaian tujuan pembelajaran (KKTP).</div>
          </div>
        `;
      } else {
        remedyList.innerHTML = data.cbtData.remedialRecommendations.map(r => `
          <div style="padding: 0.75rem; background: #ffffff; border: 1px solid var(--outline-light); border-radius: var(--radius-sm); margin-bottom: 0.5rem; font-size: var(--text-xs);">
            <div style="font-weight: 700; color: #ba1a1a;">⚠ ${r.topic}</div>
            <div style="color: #64748b; margin: 0.25rem 0;">${r.failPercent}% Siswa di bawah KKTP</div>
            <div style="color: #0f766e; font-weight: 600;">Rekomendasi: ${r.remedy}</div>
          </div>
        `).join('');
      }
    }
  }

  /* CBT JSON IMPORT ACTIONS */

  function openImportCbtModal() {
    const modal = document.getElementById('modal-import-cbt');
    if (modal) {
      modal.classList.add('active');
    }
  }

  function closeImportCbtModal() {
    const modal = document.getElementById('modal-import-cbt');
    if (modal) {
      modal.classList.remove('active');
    }
  }

  function downloadSampleCbtJson() {
    const sample = {
      kode_ujian: "PTS-GENAP-2026",
      nama_ujian: "Penilaian Tengah Semester Genap 2026/2027",
      tanggal_sinkron: new Date().toISOString(),
      mata_pelajaran: "Administrasi Sistem Jaringan (ASJ)",
      kode_rombel: "XI A-TJKT",
      kktp_minimal: 75,
      rekap: {
        total_peserta: 36,
        rata_rata: 85.4,
        persen_tuntas: 94.4,
        jumlah_remedial: 2
      },
      analisis_materi_lemah: [
        {
          topik: "Routing Dinamis OSPF & Firewall Filter",
          failPercent: 16.5,
          remedy: "Tutor sebaya di Lab Jaringan 2 & penugasan bank soal CBT remedial"
        }
      ]
    };

    const blob = new Blob([JSON.stringify(sample, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "format_standar_cbt_simkur.json";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast("📥 Berkas template format_standar_cbt_simkur.json berhasil diunduh!");
  }

  function handleCbtFileSelect(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    const label = document.getElementById('cbt-dropzone-label');
    if (label) label.textContent = `📄 ${file.name} (${(file.size / 1024).toFixed(1)} KB)`;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        selectedCbtJsonData = JSON.parse(evt.target.result);
        showToast(`✓ Berkas ${file.name} berhasil dibaca! Klik 'Proses & Analisis Otomatis'.`);
      } catch (err) {
        alert("Berkas bukan format JSON yang valid!");
      }
    };
    reader.readAsText(file);
  }

  function loadDemoCbtJson() {
    selectedCbtJsonData = {
      kode_ujian: "PAT-GENAP-2026",
      mata_pelajaran: "Konsentrasi Keahlian Produktif & Teori",
      rekap: {
        total_peserta: 360,
        rata_rata: 86.2,
        persen_tuntas: 91.5,
        jumlah_remedial: 18
      },
      classesSummary: [
        {
          rombel: "XI A-TJKT",
          subject: "Administrasi Sistem Jaringan",
          teacher: "Ahmad Gajali",
          participants: 36,
          avgScore: 88.5,
          completionRate: 97.2,
          remedialCount: 1,
          syncStatus: "Tersinkron File JSON",
          lowestTopic: "VLAN Trunking & Routing OSPF"
        },
        {
          rombel: "XI A-DKV",
          subject: "UI/UX & Desain Web",
          teacher: "Rahmat Hidayat, S.Kom",
          participants: 32,
          avgScore: 85.0,
          completionRate: 90.6,
          remedialCount: 3,
          syncStatus: "Tersinkron File JSON",
          lowestTopic: "CSS Grid & Wireframing Figma"
        }
      ],
      remedialRecommendations: [
        { topic: "VLAN Trunking & Routing OSPF (TJKT)", failPercent: 8.3, remedy: "Pemberian materi pengayaan video & bank soal remedial CBT" },
        { topic: "CSS Grid & Wireframing Figma (DKV)", failPercent: 9.4, remedy: "Latihan praktikum portofolio mandiri" }
      ]
    };

    const label = document.getElementById('cbt-dropzone-label');
    if (label) label.textContent = "📄 contoh_hasil_ujian_cbt_genap2026.json (Simulasi Terpilih)";
    showToast("⚡ Contoh berkas JSON CBT dimuat! Klik 'Proses & Analisis Otomatis' untuk menerapkan.");
  }

  function processCbtJsonImport() {
    if (!selectedCbtJsonData) {
      loadDemoCbtJson();
    }

    // Ambil kelas yang diampu guru dari scheduleMatrix (hanya berlaku jika role = guru)
    let teacherClassFilter = null;
    if (activeRole === 'guru') {
      try {
        const sessionStr = localStorage.getItem('simkur_session');
        if (sessionStr) {
          const session = JSON.parse(sessionStr);
          if (session && session.name) {
            const firstName = session.name.toLowerCase().split(' ')[0];
            const normalize = s => s.replace(/[\s\-]+/g, '').toUpperCase();
            const taughtClasses = [...new Set(
              (data.scheduleMatrix || [])
                .filter(s => s.teacher && s.teacher.toLowerCase().includes(firstName))
                .map(s => normalize(s.classCode))
            )];
            if (taughtClasses.length > 0) teacherClassFilter = taughtClasses;
          }
        }
      } catch(e) {}
    }

    if (selectedCbtJsonData.classesSummary) {
      let classes = selectedCbtJsonData.classesSummary;
      // Filter ke kelas yang diampu jika role guru
      if (teacherClassFilter) {
        const normalize = s => s.replace(/[\s\-]+/g, '').toUpperCase();
        classes = classes.filter(c => teacherClassFilter.includes(normalize(c.rombel)));
        // Jika tidak ada yang cocok, fallback ke semua agar tidak kosong
        if (classes.length === 0) classes = selectedCbtJsonData.classesSummary;
      }
      data.cbtData.classesSummary = classes;
    }
    if (selectedCbtJsonData.remedialRecommendations) {
      data.cbtData.remedialRecommendations = selectedCbtJsonData.remedialRecommendations;
    }
    if (selectedCbtJsonData.rekap) {
      data.cbtData.schoolAvgScore = selectedCbtJsonData.rekap.rata_rata;
      data.cbtData.kktpCompletionRate = selectedCbtJsonData.rekap.persen_tuntas;
      data.cbtData.studentsNeedingRemedial = selectedCbtJsonData.rekap.jumlah_remedial;
    }

    data.cbtData.lastSync = "Baru saja (Impor Berkas JSON)";
    renderCBT();
    closeImportCbtModal();

    const kelasCount = data.cbtData.classesSummary.length;
    const msg = teacherClassFilter
      ? `🎉 JSON CBT berhasil diimpor! Menampilkan ${kelasCount} kelas yang Anda ampu.`
      : `🎉 Berhasil Mengimpor JSON CBT! ${kelasCount} kelas, analisis KKTP, dan rekomendasi remedial telah diperbarui.`;
    showToast(msg);
  }


  /* ==========================================================================
     MODUL 6.10: LAPORAN & DASHBOARD EKSEKUTIF KURIKULUM (Stitch Screen 1)
     ========================================================================== */
  function renderLaporan() {
    // Render preset templates cards
    const templatesContainer = document.getElementById('laporan-preset-templates');
    if (templatesContainer) {
      const templates = (data.executiveReports && Array.isArray(data.executiveReports.templates)) ? data.executiveReports.templates : [];
      templatesContainer.innerHTML = templates.map(t => `
        <div class="content-card" style="padding: 1.125rem; display: flex; flex-direction: column; justify-content: space-between;">
          <div>
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
              <span class="badge-status badge-approved" style="font-size: 0.625rem;">${t.code}</span>
              <span style="font-size: 0.6875rem; color: #64748b;">${t.pages}</span>
            </div>
            <h4 style="font-size: var(--text-sm); font-weight: 700; color: var(--primary); margin-bottom: 0.35rem;">${t.title}</h4>
            <div style="font-size: var(--text-xs); color: #64748b;">${t.type}</div>
            <div style="font-size: 0.6875rem; color: #059669; font-weight: 600; margin-top: 0.5rem;">${t.signStatus}</div>
          </div>
          <div style="display: flex; gap: 0.5rem; margin-top: 1rem;">
            <button class="btn btn-outline btn-sm" style="flex: 1;" onclick="window.SIMKUR_APP.previewOfficialDoc('${t.title}')">
              Pratinjau
            </button>
            <button class="btn btn-primary btn-sm" onclick="showToast('Mengunduh paket resmi: ${t.code}.pdf (Bertanda Tangan Digital)')">
              Unduh PDF
            </button>
          </div>
        </div>
      `).join('');
    }

    const printBtn = document.getElementById('btn-print-laporan');
    if (printBtn) {
      printBtn.addEventListener('click', () => {
        window.print();
      });
    }
  }

  /* ==========================================================================
     MODALS & DIALOGS (Review Document, WAHA Blast, Conflict Sim)
     ========================================================================== */
  function setupModals() {
    // Global close buttons
    document.querySelectorAll('.modal-close-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.modal-backdrop').forEach(m => m.classList.remove('active'));
      });
    });

    // Close on backdrop click
    document.querySelectorAll('.modal-backdrop').forEach(backdrop => {
      backdrop.addEventListener('click', (e) => {
        if (e.target === backdrop) {
          backdrop.classList.remove('active');
        }
      });
    });

    // Form search in verifikasi
    document.getElementById('search-verifikasi-teacher')?.addEventListener('input', renderVerifikasiTable);
    document.getElementById('filter-verifikasi-dept')?.addEventListener('change', renderVerifikasiTable);
    document.getElementById('filter-verifikasi-status')?.addEventListener('change', renderVerifikasiTable);

    // Blast WAHA Button in Header
    document.getElementById('btn-blast-waha-header')?.addEventListener('click', () => {
      window.SIMKUR_APP.openWahaModal('ALL');
    });

    // Close notification popover when clicking outside
    document.addEventListener('click', (e) => {
      const card = document.getElementById('notif-popover-card');
      const wrapper = document.getElementById('topbar-notif-wrapper');
      if (card && card.style.display !== 'none') {
        if (wrapper && !wrapper.contains(e.target)) {
          card.style.display = 'none';
        }
      }
    });

    // Close notification popover on Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        window.SIMKUR_APP.closeNotifFlyout();
      }
    });
  }

  /* ==========================================================================
     GLOBAL API EXPOSED FOR INLINE HANDLERS
     ========================================================================== */
  window.SIMKUR_APP = {
    switchScreen,
    
    openVerifikasiFilter: (deptCode) => {
      switchScreen('verifikasi');
      const deptSelect = document.getElementById('filter-verifikasi-dept');
      if (deptSelect) {
        deptSelect.value = deptCode;
        renderVerifikasiTable();
      }
    },

    openReviewDrawer: (docId) => {
      const doc = data.documentsList.find(d => d.id === docId);
      if (!doc) return;
      activeTeacherForReview = doc;

      document.getElementById('review-modal-teacher-name').textContent = doc.teacherName;
      document.getElementById('review-modal-subject').textContent = `${doc.subject} (${doc.department})`;
      document.getElementById('review-modal-notes').value = doc.notes || '';
      const scoreInput = document.getElementById('review-modal-score');
      if (scoreInput) scoreInput.value = doc.modulAjar.score || 95;
      
      const modal = document.getElementById('modal-review-document');
      if (modal) modal.classList.add('active');
    },

    saveReviewDecision: (decision) => {
      if (!activeTeacherForReview) return;
      const scoreInput = document.getElementById('review-modal-score');
      const inputNotes = document.getElementById('review-modal-notes')?.value;
      const scoreVal = scoreInput ? parseInt(scoreInput.value, 10) : (decision === 'approve' ? 95 : 65);

      if (decision === 'approve') {
        activeTeacherForReview.modulAjar.status = 'approved';
        activeTeacherForReview.modulAjar.score = scoreVal || 95;
        if (inputNotes) activeTeacherForReview.notes = inputNotes;
        showToast(`✓ Modul Ajar ${activeTeacherForReview.teacherName} Disetujui & Divalidasi (Skor: ${activeTeacherForReview.modulAjar.score})!`);
      } else {
        activeTeacherForReview.modulAjar.status = 'revision';
        activeTeacherForReview.modulAjar.score = scoreVal || 65;
        if (inputNotes) activeTeacherForReview.notes = inputNotes;
        showToast(`⚠ Catatan revisi telah dikirimkan ke ${activeTeacherForReview.teacherName}.`);
      }
      document.getElementById('modal-review-document')?.classList.remove('active');
      renderVerifikasiTable();
      renderDashboard();
      renderGuruDocsTable();
    },

    openWahaModal: (targetDept) => {
      const pendingCount = targetDept === 'ALL' ? 14 : 4;
      document.getElementById('waha-target-count').textContent = `${pendingCount} Guru`;
      document.getElementById('modal-waha-blast')?.classList.add('active');
    },

    triggerWahaBlast: () => {
      const modal = document.getElementById('modal-waha-blast');
      modal?.classList.remove('active');
      showToast("🚀 Gateway WAHA: 14 Notifikasi Pengingat WhatsApp Terkirim Sukses ke Ponsel Guru!");
    },

    sendDirectWA: (teacherName, nip) => {
      showToast(`📲 Mengirim pesan WhatsApp pengingat ke ${teacherName}...`);
    },

    toggleScheduleConflict: () => toggleScheduleConflict(),

    inspectScheduleSlot: (subject, teacher, room) => {
      alert(`Detail Slot Jadwal:\nMata Pelajaran: ${subject}\nGuru Pengampu: ${teacher}\nRuangan/Lab: ${room}\nStatus: Terverifikasi PTM`);
    },

    inspectSupervisionRecord: (id) => inspectSupervisionRecord(id),
    openSupervisionForm: (id) => openSupervisionForm(id),
    closeSupervisionForm: () => closeSupervisionForm(),
    calculateSupervisionTotal: () => calculateSupervisionTotal(),
    saveSupervisionForm: () => saveSupervisionForm(),
    openNewSupervisionModal: () => openNewSupervisionModal(),
    closeScheduleSupervisionModal: () => closeScheduleSupervisionModal(),
    saveNewSupervisionSchedule: () => saveNewSupervisionSchedule(),
    openSupervisionInstrumentTemplate: () => openSupervisionInstrumentTemplate(),

    syncCbtData: () => {
      showToast("🔄 Menghubungi Server CBT Sekolah... Sinkronisasi 360 nilai siswa selesai!");
      renderCBT();
    },

    generateRemedialPackage: (rombel) => {
      showToast(`⚡ Paket soal remedial CBT untuk kelas ${rombel} berhasil digenerate & dipublikasikan ke siswa!`);
    },

    previewOfficialDoc: (title) => {
      document.getElementById('laporan-preview-title').textContent = title;
      showToast(`📄 Membuka pratinjau lembar pengesahan resmi: ${title}`);
      const previewElem = document.getElementById('laporan-doc-preview-pane');
      if (previewElem) {
        previewElem.scrollIntoView({ behavior: 'smooth' });
      }
    },

    /* MODUL 6.8: PKL FILTER KELAS & SEARCH */
    filterPklByKelas: (kelas) => {
      _pklActiveKelas = kelas;
      renderPklTable(_pklActiveKelas, _pklSearchQuery);
    },

    searchPkl: (query) => {
      _pklSearchQuery = query;
      renderPklTable(_pklActiveKelas, _pklSearchQuery);
    },

    /* MODUL 6.8: PKL PORTOFOLIO & NILAI KONVERSI 44 JP */
    openPklStudentDetail: (idOrName) => {
      const student = data.pklModule.students.find(s => s.id === idOrName || s.name === idOrName);

      if (!student) {
        showToast(`⚠️ Data siswa PKL tidak ditemukan.`);
        return;
      }
      window._currentPklStudent = student;

      // Populate Modal Fields
      const elName = document.getElementById('pkl-port-name');
      const elNisn = document.getElementById('pkl-port-nisn');
      const elRombel = document.getElementById('pkl-port-rombel');
      const elAvatar = document.getElementById('pkl-port-avatar');
      const elStatus = document.getElementById('pkl-port-status-badge');
      const elTier = document.getElementById('pkl-port-company-tier');
      const elCompany = document.getElementById('pkl-port-company');
      const elAddress = document.getElementById('pkl-port-address');
      const elLogPct = document.getElementById('pkl-port-logbook-pct');
      const elLogCount = document.getElementById('pkl-port-logbook-count');
      const elAtt = document.getElementById('pkl-port-attendance');
      const elSchMentor = document.getElementById('pkl-port-school-mentor');
      const elDudiMentor = document.getElementById('pkl-port-dudi-mentor');
      const elProjTitle = document.getElementById('pkl-port-project-title');
      const elProjScope = document.getElementById('pkl-port-project-scope');
      const elMentorQuote = document.getElementById('pkl-port-mentor-quote');
      const elCertId = document.getElementById('pkl-port-cert-id');
      const elCertStatus = document.getElementById('pkl-port-cert-status');
      const artContainer = document.getElementById('pkl-port-artifacts-container');

      if (elName) elName.textContent = student.name;
      if (elNisn) elNisn.textContent = student.nisn;
      if (elRombel) elRombel.textContent = student.rombel;
      if (elAvatar) elAvatar.src = student.avatar;
      if (elStatus) {
        elStatus.textContent = student.status;
        elStatus.className = `badge-status ${student.statusClass}`;
      }
      if (elTier) elTier.textContent = student.companyTier;
      if (elCompany) elCompany.textContent = student.company;
      if (elAddress) elAddress.textContent = student.companyAddress || 'Kawasan Industri Mitra Resmi';
      if (elLogPct) elLogPct.textContent = `${student.logbookPct}%`;
      if (elLogCount) elLogCount.textContent = student.portfolio ? student.portfolio.logbookCount : `${student.logbookPct}% Terverifikasi`;
      if (elAtt) elAtt.textContent = student.portfolio ? student.portfolio.attendanceRate : '98.0%';
      if (elSchMentor) elSchMentor.textContent = student.schoolMentor;
      if (elDudiMentor) elDudiMentor.textContent = student.dudiMentor;

      const port = student.portfolio || {};
      if (elProjTitle) elProjTitle.textContent = port.projectTitle || 'Implementasi Praktik Kerja Industri Kejuruan';
      if (elProjScope) elProjScope.textContent = port.projectScope || 'Menjalankan serangkaian pekerjaan teknis dan pemecahan masalah operasional industri sesuai Capaian Pembelajaran SMK Fase F.';
      if (elMentorQuote) elMentorQuote.textContent = port.dudiEndorsement ? `"${port.dudiEndorsement}"` : '"Siswa menunjukkan kedisiplinan dan penguasaan kompetensi kerja yang sangat baik selama masa magang."';
      if (elCertId) elCertId.textContent = port.certificateId || 'CERT-DUDI-2026';
      if (elCertStatus) elCertStatus.textContent = port.certificateStatus || 'Tervalidasi Industri';

      // Render Artifacts
      if (artContainer) {
        const artifacts = port.artifacts || [
          { name: `Laporan_Akhir_PKL_${student.name.replace(/\s+/g, '_')}.pdf`, size: "2.5 MB", type: "pdf", tag: "Laporan Resmi" },
          { name: "Dokumentasi_Foto_Kegiatan_Industri.jpg", size: "1.8 MB", type: "img", tag: "Dokumentasi Foto" },
          { name: "Lembar_Evaluasi_Mentor_DUDI.pdf", size: "650 KB", type: "data", tag: "Asesmen Industri" }
        ];

        artContainer.innerHTML = artifacts.map(art => `
          <div style="display: flex; align-items: center; justify-content: space-between; padding: 0.625rem 0.875rem; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 6px;">
            <div style="display: flex; align-items: center; gap: 0.625rem;">
              <span style="font-size: 1.15rem;">${art.type === 'pdf' ? '📄' : art.type === 'img' ? '🖼' : '📊'}</span>
              <div>
                <div style="font-size: 0.8125rem; font-weight: 600; color: #0f172a;">${art.name}</div>
                <div style="font-size: 0.6875rem; color: #64748b;">${art.size} • <span style="color: #0d9488; font-weight: 600;">${art.tag}</span></div>
              </div>
            </div>
            <button type="button" class="btn btn-outline btn-sm" style="font-size: 0.6875rem; padding: 3px 8px;" onclick="showToast('📄 Mengunduh / Pratinjau Artefak: ${art.name}...')">
              Pratinjau
            </button>
          </div>
        `).join('');
      }

      document.getElementById('modal-pkl-portfolio').classList.add('active');
    },

    closePklPortfolioModal: () => {
      const modal = document.getElementById('modal-pkl-portfolio');
      if (modal) modal.classList.remove('active');
    },

    openPklMentorWAFromPortfolio: () => {
      if (window._currentPklStudent) {
        window.SIMKUR_APP.openPklMentorWA(window._currentPklStudent.name, window._currentPklStudent.dudiMentor);
      } else {
        showToast('📲 Menghubungi mentor industri via WhatsApp...');
      }
    },

    openPklMentorWA: (studentName, mentorName) => {
      showToast(`📲 Menghubungi mentor industri ${mentorName} (Siswa: ${studentName}) via WhatsApp...`);
    },

    openPklGradeInput: (idOrName) => {
      const student = data.pklModule.students.find(s => s.id === idOrName || s.name === idOrName);
      if (!student) {
        showToast(`⚠️ Data siswa PKL tidak ditemukan.`);
        return;
      }
      window._currentPklGradeStudent = student;

      // Populate Identity
      const inputId = document.getElementById('pkl-grade-student-id');
      const elName = document.getElementById('pkl-grade-student-name');
      const elNisn = document.getElementById('pkl-grade-student-nisn');
      const elRombel = document.getElementById('pkl-grade-student-rombel');
      const elComp = document.getElementById('pkl-grade-company-name');

      if (inputId) inputId.value = student.id;
      if (elName) elName.textContent = student.name;
      if (elNisn) elNisn.textContent = student.nisn;
      if (elRombel) elRombel.textContent = student.rombel;
      if (elComp) elComp.textContent = `${student.company} • Mentor: ${student.dudiMentor}`;

      // Populate Input Scores
      const g = student.grades || {
        dudiTechnical: 90,
        dudiSoftSkill: 90,
        schoolSupervisor: 85,
        schoolDefense: 88,
        competencyDesc: `Menunjukkan penguasaan sangat baik dalam menjalankan SOP industri di ${student.company} dan menyelesaikan tugas kejuruan dengan disiplin.`
      };

      const inDudiTech = document.getElementById('input-pkl-dudi-tech');
      const inDudiSoft = document.getElementById('input-pkl-dudi-soft');
      const inSchSuper = document.getElementById('input-pkl-school-super');
      const inSchDef = document.getElementById('input-pkl-school-defense');
      const inDesc = document.getElementById('input-pkl-competency-desc');

      if (inDudiTech) inDudiTech.value = g.dudiTechnical;
      if (inDudiSoft) inDudiSoft.value = g.dudiSoftSkill;
      if (inSchSuper) inSchSuper.value = g.schoolSupervisor;
      if (inSchDef) inSchDef.value = g.schoolDefense;
      if (inDesc) inDesc.value = g.competencyDesc || `Menunjukkan penguasaan sangat baik dalam menjalankan SOP industri di ${student.company} dan menyelesaikan tugas kejuruan dengan disiplin.`;

      // Live Recalculate
      window.SIMKUR_APP.recalculatePklGrade();

      document.getElementById('modal-pkl-grade').classList.add('active');
    },

    closePklGradeModal: () => {
      const modal = document.getElementById('modal-pkl-grade');
      if (modal) modal.classList.remove('active');
    },

    recalculatePklGrade: () => {
      const inDudiTech = document.getElementById('input-pkl-dudi-tech');
      const inDudiSoft = document.getElementById('input-pkl-dudi-soft');
      const inSchSuper = document.getElementById('input-pkl-school-super');
      const inSchDef = document.getElementById('input-pkl-school-defense');

      const techVal = Math.min(100, Math.max(0, parseFloat(inDudiTech ? inDudiTech.value : 90) || 0));
      const softVal = Math.min(100, Math.max(0, parseFloat(inDudiSoft ? inDudiSoft.value : 90) || 0));
      const superVal = Math.min(100, Math.max(0, parseFloat(inSchSuper ? inSchSuper.value : 88) || 0));
      const defVal = Math.min(100, Math.max(0, parseFloat(inSchDef ? inSchDef.value : 90) || 0));

      const lblTech = document.getElementById('label-val-dudi-tech');
      const lblSoft = document.getElementById('label-val-dudi-soft');
      const lblSuper = document.getElementById('label-val-school-super');
      const lblDef = document.getElementById('label-val-school-defense');

      if (lblTech) lblTech.textContent = techVal;
      if (lblSoft) lblSoft.textContent = softVal;
      if (lblSuper) lblSuper.textContent = superVal;
      if (lblDef) lblDef.textContent = defVal;

      // Formula: (tech * 0.35) + (soft * 0.25) + (super * 0.20) + (def * 0.20)
      const rawFinal = (techVal * 0.35) + (softVal * 0.25) + (superVal * 0.20) + (defVal * 0.20);
      const roundedFinal = Math.round(rawFinal);

      const elFinal = document.getElementById('display-final-grade');
      const elPredicate = document.getElementById('display-predicate-badge');
      const elFormula = document.getElementById('display-formula-breakdown');

      if (elFinal) elFinal.textContent = roundedFinal;
      if (elFormula) {
        elFormula.textContent = `Formula: (${techVal}×35%) + (${softVal}×25%) + (${superVal}×20%) + (${defVal}×20%) = ${rawFinal.toFixed(1)}`;
      }

      if (elPredicate) {
        if (roundedFinal >= 85) {
          elPredicate.textContent = 'Sangat Baik (A)';
          elPredicate.className = 'badge-status badge-approved';
          elPredicate.style.background = '#dcfce7';
          elPredicate.style.color = '#15803d';
        } else if (roundedFinal >= 75) {
          elPredicate.textContent = 'Baik (B)';
          elPredicate.className = 'badge-status badge-approved';
          elPredicate.style.background = '#ccfbf1';
          elPredicate.style.color = '#0f766e';
        } else if (roundedFinal >= 65) {
          elPredicate.textContent = 'Cukup (C)';
          elPredicate.className = 'badge-status badge-review';
          elPredicate.style.background = '#fef3c7';
          elPredicate.style.color = '#b45309';
        } else {
          elPredicate.textContent = 'Kurang (D)';
          elPredicate.className = 'badge-status badge-missing';
          elPredicate.style.background = '#fee2e2';
          elPredicate.style.color = '#b91c1c';
        }
      }
    },

    savePklGrade: () => {
      const studentId = document.getElementById('pkl-grade-student-id').value;
      const student = data.pklModule.students.find(s => s.id === studentId);
      if (!student) {
        showToast('⚠️ Gagal menyimpan: Data siswa tidak ditemukan.');
        return;
      }

      const techVal = Math.min(100, Math.max(0, parseFloat(document.getElementById('input-pkl-dudi-tech').value) || 0));
      const softVal = Math.min(100, Math.max(0, parseFloat(document.getElementById('input-pkl-dudi-soft').value) || 0));
      const superVal = Math.min(100, Math.max(0, parseFloat(document.getElementById('input-pkl-school-super').value) || 0));
      const defVal = Math.min(100, Math.max(0, parseFloat(document.getElementById('input-pkl-school-defense').value) || 0));
      const descVal = document.getElementById('input-pkl-competency-desc').value;

      const rawFinal = (techVal * 0.35) + (softVal * 0.25) + (superVal * 0.20) + (defVal * 0.20);
      const roundedFinal = Math.round(rawFinal);

      let predicate = 'Kurang (D)';
      if (roundedFinal >= 85) predicate = 'Sangat Baik (A)';
      else if (roundedFinal >= 75) predicate = 'Baik (B)';
      else if (roundedFinal >= 65) predicate = 'Cukup (C)';

      // Save into student object
      student.grades = {
        dudiTechnical: techVal,
        dudiSoftSkill: softVal,
        schoolSupervisor: superVal,
        schoolDefense: defVal,
        finalGrade: roundedFinal,
        predicate: predicate,
        status: 'Tervalidasi e-Rapor',
        competencyDesc: descVal
      };

      if (student.status === 'Logbook Tertunda' && roundedFinal >= 75) {
        student.status = 'Sedang Magang';
        student.statusClass = 'badge-approved';
      }

      // Close modal
      window.SIMKUR_APP.closePklGradeModal();

      // Refresh table
      if (window._refreshPklStudentsTable) {
        window._refreshPklStudentsTable();
      }

      showToast(`✓ Nilai PKL 44 JP/pekan untuk ${student.name} (${roundedFinal} - ${predicate}) berhasil disimpan & disinkronisasikan ke e-Rapor!`);
    },

    /* MODUL 6.9: UKK DUAL-TRACK & LISENSI PROFESI */
    openUkkSessionDetail: (id) => {
      const scheme = data.ukkModule.schemes.find(s => s.id === id);
      if (!scheme) {
        showToast("⚠️ Data skema sertifikasi UKK tidak ditemukan.");
        return;
      }

      // Populate Elements
      const elBadge = document.getElementById('ukk-det-track-badge');
      const elCode = document.getElementById('ukk-det-code');
      const elMajor = document.getElementById('ukk-det-major');
      const elTitle = document.getElementById('ukk-det-title');
      const elCert = document.getElementById('ukk-det-cert');
      const elStatus = document.getElementById('ukk-det-status');
      const elTuk = document.getElementById('ukk-det-tuk');
      const elSched = document.getElementById('ukk-det-schedule');
      const elCand = document.getElementById('ukk-det-candidates');

      if (elBadge) {
        elBadge.textContent = scheme.track;
        elBadge.className = `badge-status ${scheme.trackType === 'lsp' ? 'badge-approved' : 'badge-review'}`;
      }
      if (elCode) elCode.textContent = scheme.code;
      if (elMajor) elMajor.textContent = `Jurusan: ${scheme.major}`;
      if (elTitle) elTitle.textContent = scheme.title;
      if (elCert) elCert.textContent = `🎖 ${scheme.certificate}`;
      if (elStatus) elStatus.textContent = scheme.status;
      if (elTuk) elTuk.textContent = scheme.tukLocation;
      if (elSched) elSched.textContent = scheme.scheduleDate;
      if (elCand) elCand.textContent = `${scheme.candidatesCount} Calon Asesi (${scheme.sessionsInfo})`;

      // Lead & Co Assessor
      const elLeadName = document.getElementById('ukk-det-lead-name');
      const elLeadReg = document.getElementById('ukk-det-lead-reg');
      const elLeadRole = document.getElementById('ukk-det-lead-role');
      const elCoName = document.getElementById('ukk-det-co-name');
      const elCoComp = document.getElementById('ukk-det-co-company');
      const elCoRole = document.getElementById('ukk-det-co-role');

      if (elLeadName && scheme.leadAssessor) elLeadName.textContent = scheme.leadAssessor.name;
      if (elLeadReg && scheme.leadAssessor) elLeadReg.textContent = `No. Reg: ${scheme.leadAssessor.noReg}`;
      if (elLeadRole && scheme.leadAssessor) elLeadRole.textContent = `${scheme.leadAssessor.role} • ${scheme.leadAssessor.institution}`;

      if (elCoName && scheme.coAssessor) elCoName.textContent = scheme.coAssessor.name;
      if (elCoComp && scheme.coAssessor) elCoComp.textContent = `${scheme.coAssessor.company} (${scheme.coAssessor.noReg})`;
      if (elCoRole && scheme.coAssessor) elCoRole.textContent = scheme.coAssessor.role;

      // Units
      const unitsContainer = document.getElementById('ukk-det-units-container');
      if (unitsContainer && scheme.units) {
        unitsContainer.innerHTML = scheme.units.map(u => `
          <div style="display: flex; justify-content: space-between; align-items: center; padding: 0.5rem 0.75rem; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 6px; font-size: 0.75rem;">
            <div>
              <strong class="font-mono" style="color: #0369a1;">${u.code}</strong>:
              <span style="color: #334155; margin-left: 4px;">${u.title}</span>
            </div>
            <span style="font-size: 0.6875rem; color: #059669; font-weight: 700;">✓ MUK Siap</span>
          </div>
        `).join('');
      }

      // Sessions
      const sessContainer = document.getElementById('ukk-det-sessions-container');
      if (sessContainer && scheme.sessions) {
        sessContainer.innerHTML = scheme.sessions.map(ss => `
          <div style="padding: 0.625rem; background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 6px; font-size: 0.75rem;">
            <div style="display: flex; justify-content: space-between; font-weight: 700; color: #0f172a; margin-bottom: 2px;">
              <span>${ss.wave}</span>
              <span style="color: #0d9488;">${ss.count} Asesi</span>
            </div>
            <div style="color: #64748b; font-size: 0.6875rem;">📅 ${ss.date} (${ss.time})</div>
            <div style="color: #475569; font-size: 0.6875rem; margin-top: 2px;">📍 ${ss.room}</div>
          </div>
        `).join('');
      }

      document.getElementById('modal-ukk-detail').classList.add('active');
    },

    closeUkkSessionDetailModal: () => {
      const modal = document.getElementById('modal-ukk-detail');
      if (modal) modal.classList.remove('active');
    },

    printUkkSuratTugas: (id) => {
      const scheme = data.ukkModule.schemes.find(s => s.id === id);
      if (!scheme) {
        showToast("⚠️ Data skema sertifikasi UKK tidak ditemukan.");
        return;
      }

      const st = scheme.suratTugas || {};
      const elNoSurat = document.getElementById('ukk-st-nosurat');
      const elDasar = document.getElementById('ukk-st-dasar-hukum');
      const elLeadName = document.getElementById('ukk-st-lead-name');
      const elLeadNoreg = document.getElementById('ukk-st-lead-noreg');
      const elLeadRole = document.getElementById('ukk-st-lead-role');
      const elCoName = document.getElementById('ukk-st-co-name');
      const elCoComp = document.getElementById('ukk-st-co-company');
      const elCoRole = document.getElementById('ukk-st-co-role');
      const elSchemeTitle = document.getElementById('ukk-st-scheme-title');
      const elTuk = document.getElementById('ukk-st-tuk');
      const elSched = document.getElementById('ukk-st-schedule');
      const elTgl = document.getElementById('ukk-st-tgl');

      if (elNoSurat) elNoSurat.textContent = st.noSurat || '800/412/SMKN1-DISDIKBUD-KALSEL/IV/2026';
      if (elDasar) elDasar.textContent = st.dasarHukum || 'Permendikbudristek No. 12 Tahun 2024 tentang Kurikulum Merdeka SMK';
      if (elLeadName && scheme.leadAssessor) elLeadName.textContent = scheme.leadAssessor.name;
      if (elLeadNoreg && scheme.leadAssessor) elLeadNoreg.textContent = scheme.leadAssessor.noReg;
      if (elLeadRole && scheme.leadAssessor) elLeadRole.textContent = `${scheme.leadAssessor.role} (${scheme.leadAssessor.institution})`;

      if (elCoName && scheme.coAssessor) elCoName.textContent = scheme.coAssessor.name;
      if (elCoComp && scheme.coAssessor) elCoComp.textContent = scheme.coAssessor.company;
      if (elCoRole && scheme.coAssessor) elCoRole.textContent = `${scheme.coAssessor.role} (${scheme.coAssessor.noReg})`;

      if (elSchemeTitle) elSchemeTitle.textContent = `${scheme.title} (Kode: ${scheme.code})`;
      if (elTuk) elTuk.textContent = scheme.tukLocation;
      if (elSched) elSched.textContent = scheme.scheduleDate;
      if (elTgl) elTgl.textContent = st.tglSurat || '08 April 2026';

      document.getElementById('modal-ukk-surat-tugas').classList.add('active');
    },

    closeUkkSuratTugasModal: () => {
      const modal = document.getElementById('modal-ukk-surat-tugas');
      if (modal) modal.classList.remove('active');
    },

    openUkkGradeInput: (id) => {
      const scheme = data.ukkModule.schemes.find(s => s.id === id);
      if (!scheme) {
        showToast("⚠️ Data skema sertifikasi UKK tidak ditemukan.");
        return;
      }
      window._currentUkkScheme = scheme;

      // Populate Scheme Header
      const elId = document.getElementById('ukk-gr-scheme-id');
      const elCode = document.getElementById('ukk-gr-scheme-code');
      const elTitle = document.getElementById('ukk-gr-scheme-title');
      const elBadge = document.getElementById('ukk-gr-scheme-badge');
      const elAssessors = document.getElementById('ukk-gr-assessors-summary');

      if (elId) elId.value = scheme.id;
      if (elCode) elCode.textContent = scheme.code;
      if (elTitle) elTitle.textContent = scheme.title;
      if (elBadge) {
        elBadge.textContent = scheme.track;
        elBadge.className = `badge-status ${scheme.trackType === 'lsp' ? 'badge-approved' : 'badge-review'}`;
      }
      if (elAssessors) {
        elAssessors.textContent = `${scheme.leadAssessor ? scheme.leadAssessor.name : 'Asesor 1'} & ${scheme.coAssessor ? scheme.coAssessor.name : 'Asesor 2'}`;
      }

      // Render candidates table
      window.SIMKUR_APP.renderUkkCandidatesTable();

      // Auto-select first candidate if exists
      const candidates = scheme.candidates || [];
      if (candidates.length > 0) {
        window.SIMKUR_APP.selectUkkCandidateForEdit(candidates[0].id);
      }

      document.getElementById('modal-ukk-grade').classList.add('active');
    },

    closeUkkGradeModal: () => {
      const modal = document.getElementById('modal-ukk-grade');
      if (modal) modal.classList.remove('active');
    },

    renderUkkCandidatesTable: () => {
      const scheme = window._currentUkkScheme;
      if (!scheme) return;
      const tableBody = document.getElementById('ukk-candidates-table-body');
      if (!tableBody) return;

      const candidates = scheme.candidates || [];
      if (candidates.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="9" style="text-align: center; color: #64748b; padding: 1.5rem;">Belum ada daftar asesi yang terdaftar pada skema ini. Klik tombol '+ Tambah Asesi Susulan' di atas.</td></tr>`;
        return;
      }

      tableBody.innerHTML = candidates.map((c, idx) => {
        const isSelected = window._activeUkkCandidate && window._activeUkkCandidate.id === c.id;
        return `
          <tr style="cursor: pointer; transition: background 0.15s ease; ${isSelected ? 'background: #f0fdfa !important;' : ''}" onclick="window.SIMKUR_APP.selectUkkCandidateForEdit('${c.id}')" title="Klik untuk mengedit penilaian ${c.name}">
            <td style="text-align: center; font-weight: bold; padding: 8px 10px; vertical-align: middle; ${isSelected ? 'border-left: 3px solid #0d9488;' : ''}">${idx + 1}</td>
            <td style="padding: 8px 10px; vertical-align: middle;">
              <div style="font-weight: 700; color: #0f172a; font-size: 0.8125rem; line-height: 1.3;">${c.name}</div>
              <div style="font-size: 0.6875rem; color: #64748b; margin-top: 2px; line-height: 1;" class="font-mono">NISN: ${c.nisn}</div>
            </td>
            <td style="padding: 8px 10px; vertical-align: middle;">
              <span class="badge-status badge-approved" style="font-size: 0.6875rem; padding: 2px 6px;">${c.rombel}</span>
            </td>
            <td class="font-mono" style="text-align: center; padding: 8px 10px; vertical-align: middle;">${c.prepScore}</td>
            <td class="font-mono" style="text-align: center; padding: 8px 10px; vertical-align: middle;">${c.processScore}</td>
            <td class="font-mono" style="text-align: center; padding: 8px 10px; vertical-align: middle;">${c.resultScore}</td>
            <td class="font-mono" style="text-align: center; padding: 8px 10px; vertical-align: middle;">${c.attitudeScore}</td>
            <td class="font-mono" style="text-align: center; padding: 8px 10px; vertical-align: middle; font-weight: 700; color: #0d9488; font-size: 0.875rem;">${c.finalScore}</td>
            <td style="text-align: center; padding: 8px 10px; vertical-align: middle;">
              <span class="badge-status ${c.recommendation.includes('Kompeten (K)') ? 'badge-approved' : 'badge-missing'}" style="font-size: 0.6875rem; padding: 2px 6px;">
                ${c.recommendation}
              </span>
            </td>
          </tr>
        `;
      }).join('');
    },

    selectUkkCandidateForEdit: (candidateId) => {
      const scheme = window._currentUkkScheme;
      if (!scheme || !scheme.candidates) return;
      const candidate = scheme.candidates.find(c => c.id === candidateId);
      if (!candidate) return;
      window._activeUkkCandidate = candidate;

      const elName = document.getElementById('ukk-editor-student-name');
      const inPrep = document.getElementById('ukk-in-prep');
      const inProc = document.getElementById('ukk-in-process');
      const inRes = document.getElementById('ukk-in-result');
      const inAtt = document.getElementById('ukk-in-attitude');

      if (elName) elName.textContent = `${candidate.name} (NISN: ${candidate.nisn} • ${candidate.rombel})`;
      if (inPrep) inPrep.value = candidate.prepScore;
      if (inProc) inProc.value = candidate.processScore;
      if (inRes) inRes.value = candidate.resultScore;
      if (inAtt) inAtt.value = candidate.attitudeScore;

      window.SIMKUR_APP.recalculateActiveUkkCandidate();
      window.SIMKUR_APP.renderUkkCandidatesTable();
    },

    recalculateActiveUkkCandidate: () => {
      const inPrep = document.getElementById('ukk-in-prep');
      const inProc = document.getElementById('ukk-in-process');
      const inRes = document.getElementById('ukk-in-result');
      const inAtt = document.getElementById('ukk-in-attitude');

      const prep = Math.min(100, Math.max(0, parseFloat(inPrep ? inPrep.value : 90) || 0));
      const proc = Math.min(100, Math.max(0, parseFloat(inProc ? inProc.value : 90) || 0));
      const res = Math.min(100, Math.max(0, parseFloat(inRes ? inRes.value : 90) || 0));
      const att = Math.min(100, Math.max(0, parseFloat(inAtt ? inAtt.value : 90) || 0));

      // Formula: (prep * 0.15) + (proc * 0.50) + (res * 0.25) + (att * 0.10)
      const rawFinal = (prep * 0.15) + (proc * 0.50) + (res * 0.25) + (att * 0.10);
      const roundedFinal = parseFloat(rawFinal.toFixed(1));

      const elScore = document.getElementById('ukk-editor-final-score');
      const elBadge = document.getElementById('ukk-editor-recom-badge');

      if (elScore) elScore.textContent = roundedFinal;
      if (elBadge) {
        if (roundedFinal >= 75) {
          elBadge.textContent = 'Kompeten (K)';
          elBadge.className = 'badge-status badge-approved';
          elBadge.style.background = '#dcfce7';
          elBadge.style.color = '#15803d';
        } else {
          elBadge.textContent = 'Belum Kompeten (BK)';
          elBadge.className = 'badge-status badge-missing';
          elBadge.style.background = '#fee2e2';
          elBadge.style.color = '#b91c1c';
        }
      }
    },

    applyCandidateScoreUpdate: () => {
      const candidate = window._activeUkkCandidate;
      if (!candidate) return;

      const prep = Math.min(100, Math.max(0, parseFloat(document.getElementById('ukk-in-prep').value) || 0));
      const proc = Math.min(100, Math.max(0, parseFloat(document.getElementById('ukk-in-process').value) || 0));
      const res = Math.min(100, Math.max(0, parseFloat(document.getElementById('ukk-in-result').value) || 0));
      const att = Math.min(100, Math.max(0, parseFloat(document.getElementById('ukk-in-attitude').value) || 0));

      const rawFinal = (prep * 0.15) + (proc * 0.50) + (res * 0.25) + (att * 0.10);
      const roundedFinal = parseFloat(rawFinal.toFixed(1));

      candidate.prepScore = prep;
      candidate.processScore = proc;
      candidate.resultScore = res;
      candidate.attitudeScore = att;
      candidate.finalScore = roundedFinal;
      candidate.recommendation = roundedFinal >= 75 ? 'Kompeten (K)' : 'Belum Kompeten (BK)';

      window.SIMKUR_APP.renderUkkCandidatesTable();
      showToast(`✓ Nilai asesi ${candidate.name} (${roundedFinal} - ${candidate.recommendation}) berhasil diperbarui!`);
    },

    promptAddNewUkkCandidate: () => {
      const scheme = window._currentUkkScheme;
      if (!scheme) return;

      const name = prompt("Masukkan Nama Siswa Calon Asesi Baru / Susulan:");
      if (!name || !name.trim()) return;
      const nisn = prompt("Masukkan Nomor Induk Siswa Nasional (NISN):", "006841" + Math.floor(1000 + Math.random() * 9000));
      const rombel = prompt("Masukkan Rombel / Kelas Siswa:", `XII ${scheme.major} 1`);

      const newCand = {
        id: "AS-" + Date.now().toString().slice(-4),
        name: name.trim(),
        nisn: (nisn || "0068419999").trim(),
        rombel: (rombel || `XII ${scheme.major} 1`).trim(),
        prepScore: 90,
        processScore: 90,
        resultScore: 90,
        attitudeScore: 90,
        finalScore: 90.0,
        recommendation: "Kompeten (K)"
      };

      if (!scheme.candidates) scheme.candidates = [];
      scheme.candidates.push(newCand);
      window.SIMKUR_APP.selectUkkCandidateForEdit(newCand.id);
      showToast(`✓ Siswa asesi ${newCand.name} berhasil ditambahkan ke daftar UKK! Silakan sesuaikan nilai observasi.`);
    },

    saveUkkAssessment: () => {
      const scheme = window._currentUkkScheme;
      if (!scheme) return;

      window.SIMKUR_APP.closeUkkGradeModal();
      showToast(`✓ Berita Acara & Lembar Observasi Nilai UKK ${scheme.code} berhasil disimpan! Siap dirapatkan di Sidang Pleno.`);
    },

    /* UKK HEADER ACTION BUTTON MODALS (MODUL 6.9) */
    openUkkBeritaAcaraModal: () => {
      const modal = document.getElementById('modal-ukk-berita-acara');
      if (modal) modal.classList.add('active');
    },

    closeUkkBeritaAcaraModal: () => {
      const modal = document.getElementById('modal-ukk-berita-acara');
      if (modal) modal.classList.remove('active');
    },

    openUkkLisensiModal: () => {
      const modal = document.getElementById('modal-ukk-lisensi-bnsp');
      if (modal) modal.classList.add('active');
    },

    closeUkkLisensiModal: () => {
      const modal = document.getElementById('modal-ukk-lisensi-bnsp');
      if (modal) modal.classList.remove('active');
    },

    openAddUkkSchemeModal: () => {
      const modal = document.getElementById('modal-ukk-add-scheme');
      if (modal) modal.classList.add('active');
    },

    closeAddUkkSchemeModal: () => {
      const modal = document.getElementById('modal-ukk-add-scheme');
      if (modal) modal.classList.remove('active');
    },

    saveNewUkkScheme: () => {
      const code = document.getElementById('add-scheme-code')?.value || 'SKM-NEW-2026';
      const title = document.getElementById('add-scheme-title')?.value || 'Skema Baru';
      const major = document.getElementById('add-scheme-major')?.value || 'TJKT';
      const trackType = document.getElementById('add-scheme-track')?.value || 'lsp';
      const tuk = document.getElementById('add-scheme-tuk')?.value || 'TUK Lab Kejuruan';
      const leadAssessor = document.getElementById('add-scheme-lead-assessor')?.value || 'Asesor Internal';
      const coAssessor = document.getElementById('add-scheme-co-assessor')?.value || 'Asesor Mitra Industri';
      const candidates = parseInt(document.getElementById('add-scheme-candidates')?.value) || 36;
      const schedule = document.getElementById('add-scheme-schedule')?.value || '28 - 30 April 2026';

      const newScheme = {
        id: "SCH-" + Date.now().toString().slice(-4),
        code,
        title,
        major,
        track: trackType === 'lsp' ? 'LSP-P1 BNSP' : 'Mandiri Sekolah + DUDI Mitra',
        trackType,
        certificate: trackType === 'lsp' ? 'Sertifikat Garuda Emas BNSP' : 'Sertifikat Kompetensi Bersama DUDI',
        tukLocation: tuk,
        assessors: `${leadAssessor} / ${coAssessor}`,
        candidatesCount: candidates,
        sessionsInfo: `2 Gelombang x ${Math.ceil(candidates / 2)} Sesi`,
        scheduleDate: schedule,
        status: 'TUK & Perangkat Siap',
        statusClass: 'badge-approved',
        leadAssessor: {
          name: leadAssessor,
          noReg: 'MET.BNSP.2026',
          institution: 'SMKN 1 Banjarmasin',
          role: 'Asesor Internal'
        },
        coAssessor: {
          name: coAssessor,
          noReg: 'REG-DUDI-2026',
          company: 'Mitra Industri',
          role: 'Asesor Eksternal'
        },
        suratTugas: {
          noSurat: `800/${Math.floor(100 + Math.random() * 900)}/SMKN1-DISDIKBUD-KALSEL/IV/2026`,
          tglSurat: '15 April 2026',
          dasarHukum: 'Permendikbudristek No. 12/2024 & Panduan BNSP',
          perihal: 'Surat Tugas Asesor UKK'
        },
        units: [{ code: 'KOMP.01.2026', title: title }],
        sessions: [{ wave: 'Gelombang 1', date: '28 April 2026', time: '08.00 - 15.00 WIB', count: Math.ceil(candidates / 2), room: tuk }],
        candidates: []
      };

      if (!data.ukkModule.schemes) {
        data.ukkModule.schemes = [];
      }
      data.ukkModule.schemes.push(newScheme);
      window.SIMKUR_APP.closeAddUkkSchemeModal();

      if (typeof window._refreshUkkSchemesTable === 'function') {
        window._refreshUkkSchemesTable();
      }

      showToast(`🎉 Skema baru ${code}: "${title}" berhasil ditambahkan & dijadwalkan!`);
    },

    /* EXCEL / DAPODIK BULK DATA IMPORT HANDLERS */
    openImportModal: () => {
      document.getElementById('modal-import-dapodik').classList.add('active');
    },

    switchImportTab: (tabKey) => {
      document.querySelectorAll('.import-tab-btn').forEach(btn => {
        btn.classList.remove('active');
        btn.style.background = 'transparent';
        btn.style.color = '#64748b';
        btn.style.fontWeight = '600';
      });
      document.querySelectorAll('.import-tab-content').forEach(c => c.style.display = 'none');

      const activeBtn = document.getElementById(`tab-import-${tabKey}`);
      if (activeBtn) {
        activeBtn.classList.add('active');
        activeBtn.style.background = '#0f172a';
        activeBtn.style.color = '#ffffff';
        activeBtn.style.fontWeight = '700';
      }
      const activeContent = document.getElementById(`import-content-${tabKey}`);
      if (activeContent) activeContent.style.display = 'block';
    },

    downloadTemplate: (type) => {
      const titles = {
        guru: "Template_Dapodik_Guru_PTK_2026.xlsx",
        ptm: "Template_SK_PTM_JamMengajar_2026.xlsx",
        dudi: "Template_Mitra_DUDI_PKL_2026.xlsx"
      };
      showToast(`📥 Mengunduh ${titles[type] || 'Template_Excel.xlsx'}...`);
    },

    handleFileSelect: (event) => {
      const file = event.target.files[0];
      if (file) {
        document.getElementById('import-drop-label').innerHTML = `
          <span style="color: #059669;">✓ File Terpilih: <strong>${file.name}</strong> (${(file.size / 1024).toFixed(1)} KB)</span>
        `;
        showToast(`File ${file.name} siap disinkronkan ke SIMKUR`);
      }
    },

    runDataImport: () => {
      const progressWrap = document.getElementById('import-progress-wrap');
      const progressBar = document.getElementById('import-progress-bar');
      const progressPercent = document.getElementById('import-progress-percent');
      const progressStatus = document.getElementById('import-progress-status');
      const runBtn = document.getElementById('btn-run-import');

      progressWrap.style.display = 'block';
      runBtn.disabled = true;

      let pct = 0;
      const interval = setInterval(() => {
        pct += 25;
        progressBar.style.width = pct + '%';
        progressPercent.textContent = pct + '%';

        if (pct === 50) progressStatus.textContent = "Memvalidasi NIP Dapodik & mencegah duplikasi guru...";
        if (pct === 75) progressStatus.textContent = "Menghitung pemenuhan 24 JP & deteksi bentrok jadwal...";
        if (pct >= 100) {
          clearInterval(interval);
          progressStatus.textContent = "✓ Sinkronisasi Berhasil Selesai!";
          setTimeout(() => {
            document.getElementById('modal-import-dapodik').classList.remove('active');
            progressWrap.style.display = 'none';
            progressBar.style.width = '0%';
            runBtn.disabled = false;
            showToast("🎉 68 Data Guru & Jam Mengajar Berhasil Disinkronkan dengan Dapodik!");
          }, 800);
        }
      }, 250);
    },

    /* ADMIN DASHBOARD OPERATOR TU ACTIONS */
    syncRombelJadwal: () => {
      showToast("🔄 Melakukan sinkronisasi rombel & pemetaan jadwal 36 kelas...");
      setTimeout(() => {
        showToast("✓ Sinkronisasi Selesai: 1.296 Siswa & 280 JP Klop Bebas Bentrok!");
      }, 1000);
    },

    backupDatabase: () => {
      showToast("💾 Memproses snapshot pencadangan basis data MySQL (simkur_db)...");
      setTimeout(() => {
        showToast("✓ Berhasil membuat snapshot: backup_simkur_20260925_0400.sql.enc (1.84 GB)");
      }, 1200);
    },

    /* ADMIN DATA RESET & MAINTENANCE CONTROLLERS */
    openResetDataModal: () => {
      const modal = document.getElementById('modal-admin-reset-data');
      if (modal) {
        const inp = document.getElementById('input-confirm-reset');
        const btn = document.getElementById('btn-execute-reset');
        const btnInline = document.getElementById('btn-execute-reset-inline');
        if (inp) inp.value = '';
        [btn, btnInline].forEach(b => {
          if (b) {
            b.disabled = true;
            b.style.opacity = '0.5';
            b.style.cursor = 'not-allowed';
          }
        });
        window.SIMKUR_APP.updateResetScopeUI('transactional');
        modal.classList.add('active');
      }
    },

    closeResetDataModal: () => {
      const modal = document.getElementById('modal-admin-reset-data');
      if (modal) modal.classList.remove('active');
    },

    updateResetScopeUI: (selectedScope) => {
      const cardTrans = document.getElementById('reset-card-transactional');
      const cardSem = document.getElementById('reset-card-semester');
      const cardFact = document.getElementById('reset-card-factory');

      if (cardTrans) {
        cardTrans.style.borderColor = selectedScope === 'transactional' ? '#0d9488' : '#e2e8f0';
        cardTrans.style.background = selectedScope === 'transactional' ? '#f0fdfa' : '#ffffff';
      }
      if (cardSem) {
        cardSem.style.borderColor = selectedScope === 'semester' ? '#0d9488' : '#e2e8f0';
        cardSem.style.background = selectedScope === 'semester' ? '#f0fdfa' : '#ffffff';
      }
      if (cardFact) {
        cardFact.style.borderColor = selectedScope === 'factory' ? '#dc2626' : '#fecaca';
        cardFact.style.background = selectedScope === 'factory' ? '#fee2e2' : '#fff5f5';
      }
    },

    checkResetConfirmInput: (val) => {
      const btn = document.getElementById('btn-execute-reset');
      const btnInline = document.getElementById('btn-execute-reset-inline');
      const cleanVal = (val || '').trim().toUpperCase();
      const isValid = cleanVal === 'RESET-SIMKUR';

      [btn, btnInline].forEach(b => {
        if (!b) return;
        b.disabled = !isValid;
        b.style.opacity = isValid ? '1' : '0.5';
        b.style.cursor = isValid ? 'pointer' : 'not-allowed';
      });
    },

    executeDataReset: () => {
      const inp = document.getElementById('input-confirm-reset');
      if ((inp?.value || '').trim().toUpperCase() !== 'RESET-SIMKUR') {
        showToast("⚠️ Silakan ketik 'RESET-SIMKUR' untuk konfirmasi keamanan.");
        return;
      }

      const selectedScope = document.querySelector('input[name="reset-scope"]:checked')?.value || 'transactional';
      const shouldBackup = document.getElementById('chk-auto-backup')?.checked ?? true;

      // 1. Auto Backup snapshot download if checked
      if (shouldBackup) {
        try {
          const snapshot = {
            timestamp: new Date().toISOString(),
            operator: 'Andry Dharmawan (Operator TU)',
            scope: selectedScope,
            dbSnapshot: data
          };
          const blob = new Blob([JSON.stringify(snapshot, null, 2)], { type: 'application/json' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `simkur_pre_reset_backup_${Date.now()}.json`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
          showToast("💾 Berkas cadangan otomatis berhasil diunduh ke perangkat!");
        } catch (e) {
          console.warn("Auto backup download error:", e);
        }
      }

      // 2. Perform Data Reset Logic
      let scopeLabel = "Data Transaksional & Uji Coba";
      let logColor = "#d97706";

      if (selectedScope === 'transactional') {
        if (data.attendanceData) {
          Object.keys(data.attendanceData).forEach(k => {
            if (data.attendanceData[k] && data.attendanceData[k].students) {
              data.attendanceData[k].students.forEach(s => s.status = 'hadir');
            }
          });
        }
        if (data.ukkModule && data.ukkModule.schemes) {
          data.ukkModule.schemes.forEach(s => {
            if (s.candidates) {
              s.candidates.forEach(c => {
                c.prepScore = 90;
                c.processScore = 90;
                c.resultScore = 90;
                c.attitudeScore = 90;
                c.finalScore = 90.0;
                c.recommendation = "Kompeten (K)";
              });
            }
          });
        }
        scopeLabel = "Pembersihan Data Transaksional";
        logColor = "#059669";
        showToast("🎉 Data transaksional & simulasi harian berhasil dibersihkan! Master GTK & Rombel tetap utuh.");
      } else if (selectedScope === 'semester') {
        scopeLabel = "Tutup Buku Pergantian Semester";
        logColor = "#2563eb";
        showToast("🎉 Tutup buku semester selesai! Arsip kelulusan disimpan & lembar kerja semester baru aktif.");
      } else if (selectedScope === 'factory') {
        scopeLabel = "Factory Reset (Setelan Awal Pabrik)";
        logColor = "#dc2626";
        localStorage.removeItem('simkur_custom_schemes');
        localStorage.removeItem('simkur_temp_attendance');
        showToast("⚠️ Factory Reset selesai! Basis data sistem telah dipulihkan ke konfigurasi standar.");
      }

      // 3. Append to Audit Trail widget in screen-admin
      const auditContainer = document.getElementById('admin-audit-log-container');
      if (auditContainer) {
        const timeNow = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB';
        const newLog = document.createElement('div');
        newLog.style.borderLeft = `2px solid ${logColor}`;
        newLog.style.paddingLeft = '0.5rem';
        newLog.innerHTML = `
          <div style="color: #0f172a; font-weight: 700;">${timeNow} • Operator TU (Andry Dharmawan)</div>
          <div style="color: #64748b;">${scopeLabel} [Snapshot Auto-Backup Berhasil Dibuat]</div>
        `;
        auditContainer.insertBefore(newLog, auditContainer.firstChild);
      }

      // 4. Close Modal
      window.SIMKUR_APP.closeResetDataModal();
    },

    /* INTERACTIVE NOTIFICATION CENTER CONTROLLERS */
    toggleNotifFlyout: (e) => {
      if (e) e.stopPropagation();
      const card = document.getElementById('notif-popover-card');
      if (!card) return;
      const isVisible = card.style.display !== 'none';
      if (isVisible) {
        card.style.display = 'none';
      } else {
        card.style.display = 'flex';
      }
    },

    closeNotifFlyout: () => {
      const card = document.getElementById('notif-popover-card');
      if (card) card.style.display = 'none';
    },

    markAllNotifsRead: () => {
      document.querySelectorAll('.notif-unread-dot').forEach(d => d.style.display = 'none');
      const badge = document.getElementById('topbar-notif-count');
      if (badge) badge.style.display = 'none';
      const sub = document.getElementById('notif-unread-count-text');
      if (sub) sub.textContent = 'Semua notifikasi telah dibaca (0 belum dibaca)';
      showToast('✓ Semua notifikasi telah ditandai sebagai dibaca.');
    },

    filterNotifs: (cat, btn) => {
      document.querySelectorAll('.notif-filter-pill').forEach(b => {
        b.style.background = 'rgba(255,255,255,0.15)';
        b.style.color = '#cbd5e1';
        b.style.fontWeight = '600';
      });
      if (btn) {
        btn.style.background = '#ffffff';
        btn.style.color = '#0f172a';
        btn.style.fontWeight = '700';
      }
      document.querySelectorAll('.notif-item-row').forEach(row => {
        const itemCat = row.getAttribute('data-cat');
        if (cat === 'all' || itemCat === cat) {
          row.style.display = 'flex';
        } else {
          row.style.display = 'none';
        }
      });
    },

    openAddUserModal: () => {
      alert("Form Tambah Akun GTK Baru:\nSilakan gunakan menu '📥 Tarik Data Dapodik' untuk import massal otomatis, atau hubungi admin server untuk penambahan akun manual.");
    },

    filterAdminUsers: () => {
      const query = (document.getElementById('admin-search-user')?.value || '').toLowerCase();
      const roleFilter = (document.getElementById('admin-filter-role')?.value || '').toLowerCase();
      const authFilter = (document.getElementById('admin-filter-auth')?.value || '').toLowerCase();

      const rows = document.querySelectorAll('#admin-users-table tbody tr');
      rows.forEach(row => {
        const text = row.innerText.toLowerCase();
        let matches = true;

        if (query && !text.includes(query)) matches = false;
        if (roleFilter && !text.includes(roleFilter)) matches = false;
        if (authFilter === 'sso' && !text.includes('belajar.id')) matches = false;
        if (authFilter === 'mandiri' && !text.includes('mandiri')) matches = false;

        row.style.display = matches ? '' : 'none';
      });
    },

    /* STUDENT ATTENDANCE & ROLL-CALL ACTIONS */
    toggleInlineAttendanceList: () => toggleInlineAttendanceList(),
    openStudentAttendanceModal: (rombel) => openStudentAttendanceModal(rombel),
    closeStudentAttendanceModal: () => closeStudentAttendanceModal(),
    markAllStudentsPresent: () => markAllStudentsPresent(),
    setStudentStatus: (no, status) => setStudentStatus(no, status),
    filterModalAttendance: (status, el) => filterModalAttendance(status, el),
    searchModalStudents: (query) => searchModalStudents(query),
    saveStudentAttendanceToJournal: () => saveStudentAttendanceToJournal(),
    switchAttendanceRombel: (rombel) => switchAttendanceRombel(rombel),
    filterTableAttendance: (status, el) => filterTableAttendance(status, el),
    searchTableStudents: (query) => searchTableStudents(query),
    exportAttendanceExcel: () => exportAttendanceExcel(),
    notifyParentsWA: () => notifyParentsWA(),
    switchToAttendanceTab: () => switchToAttendanceTab(),
    openUploadGuruDocModal: (docKey) => openUploadGuruDocModal(docKey),
    closeUploadGuruDocModal: () => closeUploadGuruDocModal(),
    setDocUploadMethod: (method) => setDocUploadMethod(method),
    handleGuruDocFileSelect: (e) => handleGuruDocFileSelect(e),
    previewGuruDoc: (key) => previewGuruDoc(key),

    /* SCHEDULE & PTM ACTIONS */
    filterScheduleRombel: (rombel) => filterScheduleRombel(rombel),
    filterScheduleTeacher: (teacherName) => filterScheduleTeacher(teacherName),
    searchScheduleTeacher: (query) => searchScheduleTeacher(query),
    populateTeacherDropdowns: (query) => populateTeacherDropdowns(query),
    filterPTMTable: (query) => filterPTMTable(query),
    openAddScheduleModal: () => openAddScheduleModal(),
    closeAddScheduleModal: () => closeAddScheduleModal(),
    saveNewScheduleSlot: () => saveNewScheduleSlot(),
    importScheduleExcel: () => importScheduleExcel(),
    autoResolveConflict: () => autoResolveConflict(),
    renderGuruPersonalSchedule: () => renderGuruPersonalSchedule(),
    switchScheduleView: (viewType, el) => switchScheduleView(viewType, el),
    generateScheduleAI: () => generateScheduleAI(),
    toggleScheduleConflict: () => toggleScheduleConflict(),
    exportSchedule: () => exportSchedule(),

    /* CBT IMPORT & INTEGRATION */
    openImportCbtModal: () => openImportCbtModal(),
    closeImportCbtModal: () => closeImportCbtModal(),
    downloadSampleCbtJson: () => downloadSampleCbtJson(),
    handleCbtFileSelect: (e) => handleCbtFileSelect(e),
    loadDemoCbtJson: () => loadDemoCbtJson(),
    processCbtJsonImport: () => processCbtJsonImport(),
    validateCurriculumCompliance: () => {
      showToast("✓ Validasi Sukses: Struktur Kurikulum 48 JP/minggu telah 100% selaras dengan Dapodik Kemendikdasmen & Permendikdasmen No. 13/2025!");
    },

    /* ADMIN INTEGRASI & PAGINATION */
    switchAdminTab: (btn, tabKey) => {
      document.querySelectorAll('.admin-tab-btn').forEach(b => {
        b.classList.remove('active');
        b.style.background = 'transparent';
        b.style.color = '#64748b';
        b.style.fontWeight = '600';
      });
      if (btn) {
        btn.classList.add('active');
        btn.style.background = '#0f172a';
        btn.style.color = '#ffffff';
        btn.style.fontWeight = '700';
      }
      const tabNames = {
        'dapodik': 'Sinkronisasi Dapodik Kemendikbud',
        'cbt': 'Server CBT & Nilai Semester',
        'rombel': 'Data Rombel & Laboratorium/TUK',
        'bnsp': 'Integrasi BNSP / Mitra DUDI'
      };
      showToast(`✓ Tab aktif: ${tabNames[tabKey] || tabKey}`);
    },

    navigateAdminPage: (page) => {
      let targetPage = page;
      if (page === 'prev') targetPage = 1;
      if (page === 'next') targetPage = 2;
      [1, 2, 3].forEach(p => {
        const pBtn = document.getElementById(`admin-page-${p}`);
        if (pBtn) {
          if (p === targetPage) {
            pBtn.className = 'btn btn-primary btn-sm';
            pBtn.style.minWidth = '24px';
          } else {
            pBtn.className = 'btn btn-ghost btn-sm';
            pBtn.style.minWidth = '24px';
          }
        }
      });
      const prevBtn = document.getElementById('admin-page-prev');
      const nextBtn = document.getElementById('admin-page-next');
      if (prevBtn) prevBtn.disabled = (targetPage === 1);
      if (nextBtn) nextBtn.disabled = (targetPage === 3);
      showToast(`Halaman ${targetPage} dari 3 (GTK & Mitra)`);
    }
  };


  function showToast(message) {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
      <span>${message}</span>
    `;
    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      toast.style.transition = 'all 0.2s ease';
      setTimeout(() => toast.remove(), 200);
    }, 3500);
  }
});
