/**
 * SIMKUR — Local API Service (Pengganti Firebase)
 * SMKN 1 Banjarmasin
 * 
 * Menghubungkan frontend ke REST API PHP di Raspberry Pi 4.
 * Drop-in replacement untuk firebase-service.js — interface sama,
 * implementasi berbeda (fetch ke API lokal, bukan Firestore).
 * 
 * CARA PAKAI:
 * Ganti di index.html:
 *   <script type="module" src="js/firebase-service.js">
 * menjadi:
 *   <script type="module" src="js/api-service.js">
 */

// ─────────────────────────────────────────────────────────────
// KONFIGURASI — Sesuaikan URL API dengan IP/domain Pi4 Anda
// ─────────────────────────────────────────────────────────────
const API_CONFIG = {
  // Ganti dengan IP atau domain Raspberry Pi 4 Anda
  // Contoh: 'http://192.168.1.100/api' atau 'http://simkur.local/api'
  baseUrl: window.location.origin + '/api',
  
  // Timeout request dalam ms
  timeout: 10000,
};

// Sama persis dengan COLLECTION_MAP di firebase-service.js (kompatibilitas)
export const COLLECTION_MAP = {
  'teachers': 'teachers',
  'classes': 'classes',
  'subjects': 'subjects',
  'rooms': 'rooms',
  'schedules': 'schedules',
  'documents': 'documents',
  'agendas': 'agendas',
  'teacher_admin': 'teacher_admin',
  'guru_journals': 'guru_journals',
  'guru_documents': 'guru_documents',
  'guru_attendance': 'guru_attendance',
  'supervisi_program': 'supervisi_program',
  'supervisi_sesi': 'supervisi_sesi',
  'supervisi_rtl': 'supervisi_rtl',
  'supervisi_manajerial': 'supervisi_manajerial'
};

class ApiService {
  constructor() {
    this.status = 'DISCONNECTED';
    this.errorMessage = '';
    this.isInitialized = false;
    this.lastSyncTime = null;
    this._pollInterval = null;
  }

  // ─────────────────────────────────────────────
  // Inisialisasi — cek koneksi ke API
  // ─────────────────────────────────────────────
  async init() {
    if (this.isInitialized) return;
    this.status = 'CONNECTING';
    this.notifyStatus();

    try {
      await this.verifyConnection();
      this.isInitialized = true;
    } catch (err) {
      console.warn('⚠️ [API] Init gagal:', err);
      this.handleError(err);
    }
  }

  async verifyConnection() {
    if (!navigator.onLine) {
      this.status = 'OFFLINE';
      this.errorMessage = 'Perangkat sedang offline. Menggunakan cache lokal.';
      this.notifyStatus();
      return;
    }

    try {
      const res = await this._fetch('health.php');
      if (res.success) {
        this.status = 'CONNECTED';
        this.errorMessage = '';
        this.lastSyncTime = new Date();
        console.log('✅ [API] Terhubung ke server Pi4. Tables:', res.data?.tables?.join(', '));
        this.notifyStatus();
        // Mulai polling ringan setiap 30 detik untuk cek status
        this._startPolling();
      } else {
        throw new Error(res.error || 'API tidak merespon dengan benar');
      }
    } catch (err) {
      this.handleError(err);
    }
  }

  handleError(err) {
    const msg = String(err?.message || err);
    this.status = 'ERROR';

    if (!navigator.onLine || msg.includes('Failed to fetch') || msg.includes('NetworkError')) {
      this.status = 'OFFLINE';
      this.errorMessage = 'Tidak bisa terhubung ke server Pi4. Menggunakan cache lokal.';
    } else if (msg.includes('404')) {
      this.errorMessage = 'API tidak ditemukan. Pastikan file api/ sudah di-upload ke server.';
    } else {
      this.errorMessage = msg;
    }

    console.warn('ℹ️ [API Status]:', this.errorMessage);
    this.notifyStatus();
  }

  notifyStatus() {
    window.dispatchEvent(new CustomEvent('simkur-firebase-status', {
      detail: {
        status: this.status,
        errorMessage: this.errorMessage,
        lastSync: this.lastSyncTime,
        projectId: 'pi4-local'
      }
    }));
  }

  // ─────────────────────────────────────────────
  // Polling ringan — refresh data aktif setiap 30 detik
  // ─────────────────────────────────────────────
  _startPolling() {
    if (this._pollInterval) return;
    this._pollInterval = setInterval(async () => {
      if (!navigator.onLine) return;
      await this._refreshActiveCollections();
    }, 30_000);
  }

  async _refreshActiveCollections() {
    const activeKeys = ['agendas', 'documents', 'guru_journals'];
    const sm = window.PORTAL_STORAGE;
    if (!sm || this.status !== 'CONNECTED') return;

    for (const key of activeKeys) {
      try {
        const items = await this.getCollection(key);
        if (items && items.length > 0) {
          sm.set(key, items);
        }
      } catch (_) {}
    }

    if (window.PORTAL_APP && typeof window.PORTAL_APP.refreshActiveScreen === 'function') {
      window.PORTAL_APP.refreshActiveScreen();
    }
  }

  // ─────────────────────────────────────────────
  // Core: Fetch helper
  // ─────────────────────────────────────────────
  async _fetch(endpoint, options = {}) {
    const url = `${API_CONFIG.baseUrl}/${endpoint}`;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), API_CONFIG.timeout);

    try {
      const res = await fetch(url, {
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        ...options,
      });
      clearTimeout(timer);

      const json = await res.json();
      return json;
    } catch (err) {
      clearTimeout(timer);
      throw err;
    }
  }

  // ─────────────────────────────────────────────
  // CRUD Methods — sama dengan firebase-service.js
  // ─────────────────────────────────────────────

  getCollectionName(key) {
    const k = String(key).toLowerCase();
    return COLLECTION_MAP[k] || k;
  }

  /** Ambil semua dokumen dari satu collection */
  async getCollection(key) {
    const col = this.getCollectionName(key);
    const res = await this._fetch(`crud.php?collection=${col}`);
    if (res.success) return res.data || [];
    throw new Error(res.error || 'Gagal ambil data');
  }

  /** Simpan/update satu dokumen (sama dengan saveDoc di firebase-service.js) */
  async saveDoc(key, id, data) {
    if (this.status !== 'CONNECTED') return false;
    try {
      const col = this.getCollectionName(key);
      const payload = { ...data, id: String(id), _updatedAt: new Date().toISOString() };
      const res = await this._fetch(`crud.php?collection=${col}`, {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      return res.success === true;
    } catch (err) {
      console.warn(`[API] Save error (${key}/${id}):`, err.message);
      return false;
    }
  }

  /** Hapus satu dokumen (sama dengan deleteDoc di firebase-service.js) */
  async deleteDoc(key, id) {
    if (this.status !== 'CONNECTED') return false;
    try {
      const col = this.getCollectionName(key);
      const res = await this._fetch(`crud.php?collection=${col}&id=${encodeURIComponent(id)}`, {
        method: 'DELETE',
      });
      return res.success === true;
    } catch (err) {
      console.warn(`[API] Delete error (${key}/${id}):`, err.message);
      return false;
    }
  }

  /**
   * Upload semua data lokal ke database Pi4
   * (Sama dengan seedAllToFirestore di firebase-service.js)
   */
  async seedAllToFirestore(onProgress) {
    if (this.status !== 'CONNECTED') {
      throw new Error('Tidak terhubung ke server Pi4.');
    }

    const sm = window.PORTAL_STORAGE;
    if (!sm) throw new Error('StorageManager lokal tidak ditemukan.');

    const collectionsToSeed = [
      'agendas', 'documents', 'teachers', 'classes', 'subjects',
      'rooms', 'teacher_admin', 'guru_journals', 'guru_documents', 'schedules'
    ];

    let totalItems = 0;
    collectionsToSeed.forEach(k => { totalItems += (sm.get(k) || []).length; });

    let processed = 0;

    for (const key of collectionsToSeed) {
      const items = sm.get(key) || [];
      const col = this.getCollectionName(key);

      for (const item of items) {
        const id = String(item.id || item.teacher_id || `${key}_${Math.random().toString(36).substr(2,9)}`);
        await this.saveDoc(key, id, { ...item, id, _syncedAt: new Date().toISOString() });
        processed++;

        if (typeof onProgress === 'function') {
          onProgress({
            currentKey: key,
            processed,
            total: totalItems,
            percent: Math.round((processed / totalItems) * 100)
          });
        }
      }
    }

    this.lastSyncTime = new Date();
    this.notifyStatus();
    return { success: true, count: processed };
  }

  /**
   * Download data dari Pi4 ke localStorage
   * (Sama dengan syncFromFirestore di firebase-service.js)
   */
  async syncFromFirestore(onProgress) {
    if (this.status !== 'CONNECTED') {
      throw new Error('Tidak terhubung ke server Pi4.');
    }

    const sm = window.PORTAL_STORAGE;
    if (!sm) throw new Error('StorageManager lokal tidak ditemukan.');

    const collectionsToSync = [
      'agendas', 'documents', 'teachers', 'classes', 'subjects',
      'rooms', 'teacher_admin', 'guru_journals', 'guru_documents', 'schedules'
    ];

    let count = 0;
    for (const key of collectionsToSync) {
      try {
        const items = await this.getCollection(key);
        if (items.length > 0) {
          sm.set(key, items);
          count += items.length;
        }
        if (typeof onProgress === 'function') {
          onProgress({ currentKey: key, syncedCount: count });
        }
      } catch (err) {
        console.warn(`[API] Sync error (${key}):`, err.message);
      }
    }

    this.lastSyncTime = new Date();
    this.notifyStatus();
    return { success: true, count };
  }

  /**
   * Reset status administrasi guru di database Pi4
   * (Sama dengan resetAdministrationInFirestore)
   */
  async resetAdministrationInFirestore() {
    if (this.status !== 'CONNECTED') return;
    try {
      const sm = window.PORTAL_STORAGE;
      if (!sm) return;

      const items = sm.get('teacher_admin') || [];
      for (const item of items) {
        await this.saveDoc('teacher_admin', item.teacher_id || item.id, {
          ...item,
          _syncedAt: new Date().toISOString()
        });
      }

      // Hapus jurnal, dokumen, absensi guru
      const clearCollections = ['guru_journals', 'guru_documents', 'guru_attendance'];
      for (const key of clearCollections) {
        const existing = await this.getCollection(key);
        for (const item of existing) {
          await this.deleteDoc(key, item.id);
        }
      }

      console.log('✅ [API] Teacher administration reset di database Pi4.');
    } catch (err) {
      console.warn('⚠️ [API] Reset error:', err.message);
    }
  }

  // setupRealtimeListeners tidak ada di API lokal (digantikan polling)
  // Dibiarkan untuk kompatibilitas
  setupRealtimeListeners() {
    this._startPolling();
  }

  // ─────────────────────────────────────────────
  // uploadPhoto — Kirim foto (base64) ke Pi4
  // Dipanggil saat guru submit jurnal dengan foto
  //
  // Usage:
  //   const url = await FirebaseService.uploadPhoto(base64DataUrl, 'jurnal', teacherId, date);
  //   // url: '/uploads/jurnal/2026/09/jurnal_T001_abc123.jpg'
  // ─────────────────────────────────────────────
  async uploadPhoto(base64DataUrl, type = 'jurnal', teacherId = '', date = '') {
    if (!base64DataUrl || !base64DataUrl.startsWith('data:image')) {
      return base64DataUrl; // kembalikan apa adanya jika bukan base64 valid
    }

    if (this.status !== 'CONNECTED') {
      // Fallback: simpan base64 langsung jika offline
      console.warn('[API] Offline — foto disimpan sebagai base64 lokal');
      return base64DataUrl;
    }

    try {
      const res = await this._fetch('upload.php', {
        method: 'POST',
        headers: {}, // biarkan browser set Content-Type untuk FormData
        body: (() => {
          const fd = new FormData();
          fd.append('base64', base64DataUrl);
          fd.append('type', type);
          fd.append('teacher_id', teacherId);
          fd.append('date', date || new Date().toISOString().split('T')[0]);
          return fd;
        })(),
      });

      if (res.success && res.data?.url) {
        console.log(`✅ [API] Foto diupload: ${res.data.url} (${res.data.size_kb} KB)`);
        return res.data.url; // URL publik di Pi4, misal: /uploads/jurnal/2026/09/xxx.jpg
      } else {
        console.warn('[API] Upload foto gagal:', res.error);
        return base64DataUrl; // fallback base64
      }
    } catch (err) {
      console.warn('[API] Upload foto error:', err.message);
      return base64DataUrl; // fallback base64
    }
  }

  // ─────────────────────────────────────────────
  // uploadFile — Kirim file dokumen (PDF, DOC, XLS) ke Pi4
  // Dipanggil saat guru upload dokumen perangkat ajar
  //
  // Usage:
  //   const url = await FirebaseService.uploadFile(fileObject, 'dokumen', teacherId);
  //   // url: '/uploads/dokumen/2026/09/dokumen_T001_abc123.pdf'
  // ─────────────────────────────────────────────
  async uploadFile(file, type = 'dokumen', teacherId = '') {
    if (!file) return null;

    if (this.status !== 'CONNECTED') {
      throw new Error('Tidak terhubung ke server Pi4. Coba lagi saat online.');
    }

    try {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('type', type);
      fd.append('teacher_id', teacherId);
      fd.append('date', new Date().toISOString().split('T')[0]);

      const res = await this._fetch('upload.php', {
        method: 'POST',
        headers: {}, // biarkan browser handle Content-Type multipart
        body: fd,
      });

      if (res.success && res.data?.url) {
        console.log(`✅ [API] File diupload: ${res.data.url} (${res.data.size_kb} KB)`);
        return res.data; // { url, filename, size_kb, type }
      } else {
        throw new Error(res.error || 'Upload gagal');
      }
    } catch (err) {
      console.warn('[API] Upload file error:', err.message);
      throw err;
    }
  }

  // ─────────────────────────────────────────────
  // getUploadUrl — Ambil URL lengkap dari path relatif
  // ─────────────────────────────────────────────
  getUploadUrl(path) {
    if (!path) return '';
    if (path.startsWith('http') || path.startsWith('data:')) return path;
    return window.location.origin + path;
  }
}


// Singleton — sama seperti firebase-service.js
const instance = new ApiService();
window.FirebaseService = instance; // Nama tetap sama agar app.js tidak perlu diubah!

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => instance.init());
} else {
  instance.init();
}

export default instance;
