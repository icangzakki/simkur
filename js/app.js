/**
 * SIMKUR — PORTAL WAKA KURIKULUM SMKN 1 BANJARMASIN
 * Aplikasi Web Sederhana Sesuai PRD_Portal_Waka_Kur_Sederhana.md
 * Modul: Dashboard, Dokumen, Jadwal Pelajaran, Data Master (Guru, Kelas, Mapel, Ruang)
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
      AGENDAS: 'portal_agendas_v1'
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
      if (!localStorage.getItem(this.KEYS.SCHEDULES)) {
        localStorage.setItem(this.KEYS.SCHEDULES, JSON.stringify(data.schedules || []));
      }
      if (!localStorage.getItem(this.KEYS.DOCUMENTS)) {
        localStorage.setItem(this.KEYS.DOCUMENTS, JSON.stringify(data.documents || []));
      }
      if (!localStorage.getItem(this.KEYS.AGENDAS)) {
        localStorage.setItem(this.KEYS.AGENDAS, JSON.stringify(data.agendas || []));
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
      const index = items.findIndex(function (i) { return String(i.id) === String(id); });
      if (index !== -1) {
        items[index] = Object.assign({}, items[index], updatedFields);
        this.set(key, items);
      }
      return items;
    },

    delete: function (key, id) {
      let items = this.get(key);
      items = items.filter(function (i) { return String(i.id) !== String(id); });
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
    selectedDay: 'Senin',
    docSearchQuery: '',
    docCategoryFilter: 'all',
    docYearFilter: 'all',
    scheduleDayFilter: 'all',
    scheduleClassFilter: 'all',
    scheduleTeacherFilter: 'all',
    scheduleSearchQuery: '',
    masterSearchQuery: '',
    editingItem: null
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
  // 5. NAVIGATION CONTROLLER (4 MENUS)
  // =========================================================================
  function switchScreen(screenName) {
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
        'dashboard': 'Overview Dashboard Waka Kurikulum',
        'dokumen': 'Arsip Dokumen Kurikulum',
        'jadwal': 'Jadwal Pelajaran',
        'data-master': 'Data Master Kurikulum'
      };
      titleEl.textContent = titles[screenName] || 'Portal Waka Kur';
    }

    // Close mobile sidebar if open
    closeMobileSidebar();

    // Trigger Screen Render
    if (screenName === 'dashboard') renderDashboard();
    else if (screenName === 'dokumen') renderDocuments();
    else if (screenName === 'jadwal') renderSchedules();
    else if (screenName === 'data-master') renderDataMaster();

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

    // 1. KPI Cards
    const elSiswa = document.getElementById('dash-stat-siswa');
    const elGuru = document.getElementById('dash-stat-guru');
    const elKelas = document.getElementById('dash-stat-kelas');
    const elDokumen = document.getElementById('dash-stat-dokumen');

    if (elSiswa) elSiswa.textContent = '1.564';
    if (elGuru) elGuru.textContent = String(teachers.filter(function (t) { return t.is_active; }).length);
    if (elKelas) elKelas.textContent = String(classes.filter(function (c) { return c.is_active; }).length);
    if (elDokumen) elDokumen.textContent = String(docs.length);

    // 2. Render Jadwal Hari Ini
    renderDashboardSchedule(schedules);

    // 3. Render Agenda Kurikulum
    renderDashboardAgendas(agendas);
  }

  function renderDashboardSchedule(schedules) {
    const day = State.selectedDay || 'Senin';
    const dayFiltered = schedules.filter(function (s) {
      return s.day && s.day.toLowerCase() === day.toLowerCase();
    });

    const tbody = document.getElementById('dash-schedule-tbody');
    const labelDay = document.getElementById('dash-current-day-label');
    if (labelDay) labelDay.textContent = 'Hari: ' + day;

    if (!tbody) return;

    if (dayFiltered.length === 0) {
      tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; padding: 2.5rem; color: #888888;">' +
        '<div style="font-size: 2rem; margin-bottom: 0.5rem;">📅</div>' +
        '<strong>Belum ada jadwal untuk hari ' + day + '</strong>' +
        '<p style="font-size: 0.8125rem; color: #999; margin-top: 4px;">Gunakan menu Jadwal Pelajaran untuk menyusun jadwal.</p>' +
        '<button class="btn btn-outline btn-sm" style="margin-top: 10px;" onclick="window.PORTAL_APP.switchScreen(\'jadwal\')">+ Tambah Jadwal</button>' +
        '</td></tr>';
      return;
    }

    let html = '';
    dayFiltered.forEach(function (s) {
      html += '<tr>' +
        '<td style="font-weight: 600; color: #262626;"><span class="badge badge-neutral" style="font-family: monospace;">' + s.start_time + ' - ' + s.end_time + '</span></td>' +
        '<td><span class="badge badge-primary">' + s.class_name + '</span></td>' +
        '<td style="font-weight: 600; color: #262626;">' + s.subject_name + '</td>' +
        '<td>' + s.teacher_name + '</td>' +
        '<td><span class="badge badge-outline">' + s.room_name + '</span></td>' +
        '</tr>';
    });

    tbody.innerHTML = html;
  }

  function selectDashboardDay(dayName, btnEl) {
    State.selectedDay = dayName;
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
  // 7. SCREEN 2: DOKUMEN KURIKULUM
  // =========================================================================
  function renderDocuments() {
    const docs = StorageManager.get('documents');
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
        '<strong>Tidak ada dokumen yang sesuai dengan pencarian / filter</strong>' +
        '<p style="font-size: 0.8125rem; color: #999; margin-top: 4px;">Coba ubah kata kunci atau unggah dokumen baru.</p>' +
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
      if (titleEl) titleEl.textContent = 'Upload Dokumen Kurikulum';
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

    // Trigger synthetic text file download representing the document
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

    // Populate filter dropdowns if not already populated
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

    // Populate modal dropdowns with latest data master
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
      tbody.innerHTML = '<tr><td colspan="6" style="text-align:center; padding: 2rem; color: #888;">Tidak ada data guru yang cocok.</td></tr>';
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
          State.docSearchQuery = val;
          renderDocuments();
        } else if (State.currentScreen === 'jadwal') {
          State.scheduleSearchQuery = val;
          renderSchedules();
        } else if (State.currentScreen === 'data-master') {
          State.masterSearchQuery = val;
          renderDataMaster();
        }
      });
    }

    // 4. Dokumen Filters
    const docSearch = document.getElementById('doc-search-input');
    const docCategory = document.getElementById('doc-category-filter');
    const docYear = document.getElementById('doc-year-filter');

    if (docSearch) {
      docSearch.addEventListener('input', function () {
        State.docSearchQuery = this.value.trim();
        renderDocuments();
      });
    }
    if (docCategory) {
      docCategory.addEventListener('change', function () {
        State.docCategoryFilter = this.value;
        renderDocuments();
      });
    }
    if (docYear) {
      docYear.addEventListener('change', function () {
        State.docYearFilter = this.value;
        renderDocuments();
      });
    }

    // 5. Jadwal Filters
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

    // 6. Data Master Subtab Buttons & Search
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

    // 7. Form Submissions
    const formDoc = document.getElementById('form-modal-doc');
    if (formDoc) formDoc.addEventListener('submit', handleSaveDocument);

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
  }

  // =========================================================================
  // 11. BOOTSTRAP APPLICATION
  // =========================================================================
  function initApp() {
    StorageManager.init();
    initEventListeners();

    // Determine initial screen from URL or default to dashboard
    const params = new URLSearchParams(window.location.search);
    const initialScreen = params.get('screen') || 'dashboard';

    // Auto set day to today if weekday
    const daysMap = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    const currentDay = daysMap[new Date().getDay()];
    if (currentDay !== 'Minggu') {
      State.selectedDay = currentDay;
    } else {
      State.selectedDay = 'Senin';
    }

    // Select active day pill in dashboard
    document.querySelectorAll('.day-pill-btn').forEach(function (b) {
      if (b.getAttribute('data-day') === State.selectedDay) {
        b.classList.add('active');
      } else {
        b.classList.remove('active');
      }
    });

    switchScreen(initialScreen);
    console.log('🚀 SIMKUR Portal Waka Kur (Versi Sederhana) siap digunakan.');
  }

  // Expose global methods for inline HTML onclick handlers
  window.PORTAL_APP = {
    switchScreen: switchScreen,
    openModal: openModal,
    closeModal: closeModal,
    selectDashboardDay: selectDashboardDay,
    openAddAgendaModal: openAddAgendaModal,
    deleteAgenda: deleteAgenda,
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
    showToast: showToast
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
