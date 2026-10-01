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
    this._isSyncing = false;
    this.isPi4 = true;
    this.projectId = 'pi4-local';

    // Dengarkan saat PC kembali online agar otomatis auto-sync
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => {
        console.log('🌐 [API] Koneksi kembali online, memverifikasi server Pi4...');
        this.verifyConnection();
      });
    }
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

        // ═════════════════════════════════════════════════════════════
        // AUTO-SYNC ON STARTUP:
        // Cek data di database server Pi4
        // ═════════════════════════════════════════════════════════════
        const recordCounts = res.data?.record_counts || {};
        const totalServerRecords = Object.values(recordCounts).reduce((a, b) => a + Number(b || 0), 0);

        if (totalServerRecords > 0) {
          // Segera tarik data dari MySQL Pi4 ke browser PC ini secara otomatis
          this.autoSync(recordCounts);
        } else {
          console.log('ℹ️ [API] Database Pi4 masih kosong (0 records). Menunggu input data.');
        }

        // Mulai polling otomatis setiap 30 detik untuk sync real-time antar PC
        this._startPolling();
      } else {
        throw new Error(res.error || 'API tidak merespon dengan benar');
      }
    } catch (err) {
      this.handleError(err);
    }
  }

  /**
   * Auto-Sync: Menarik data secara mulus dari server ke browser PC saat dibuka
   */
  async autoSync(recordCounts = null) {
    if (this._isSyncing || this.status !== 'CONNECTED') return;
    this._isSyncing = true;

    // Beritahu UI bahwa sedang sinkronisasi
    window.dispatchEvent(new CustomEvent('simkur-firebase-status', {
      detail: {
        status: 'SYNCING',
        errorMessage: '',
        lastSync: this.lastSyncTime,
        projectId: 'pi4-local'
      }
    }));

    try {
      console.log('🔄 [API Auto-Sync] Mengunduh data terbaru dari database server Pi4...');
      const res = await this.syncFromFirestore();

      if (res && res.count > 0) {
        console.log(`✅ [API Auto-Sync] Selesai! ${res.count} data berhasil disinkronkan ke peramban.`);

        // Perbarui tampilan layar aktif agar data langsung muncul seketika
        if (window.PORTAL_APP && typeof window.PORTAL_APP.refreshActiveScreen === 'function') {
          window.PORTAL_APP.refreshActiveScreen();
        }

        // Tampilkan notifikasi singkat jika pertama kali buka di browser ini
        const noticeKey = 'simkur_last_server_sync_notice';
        const lastNotice = localStorage.getItem(noticeKey);
        const now = Date.now();
        // Notifikasi toast muncul maksimal 1x per 3 menit agar tidak mengganggu
        if (!lastNotice || (now - Number(lastNotice)) > 180000) {
          localStorage.setItem(noticeKey, String(now));
          if (window.PORTAL_APP && typeof window.PORTAL_APP.showToast === 'function') {
            window.PORTAL_APP.showToast(`⚡ Sinkronisasi otomatis: ${res.count} data dimuat dari database Pi4`, 'success', 3500);
          }
        }
      }
    } catch (err) {
      console.warn('⚠️ [API Auto-Sync] Gagal:', err.message);
    } finally {
      this._isSyncing = false;
      this.status = 'CONNECTED';
      this.notifyStatus();
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
  // Polling cerdas — cek perubahan data aktif setiap 30 detik
  // ─────────────────────────────────────────────
  _startPolling() {
    if (this._pollInterval) return;
    this._pollInterval = setInterval(async () => {
      if (!navigator.onLine || this.status !== 'CONNECTED' || this._isSyncing) return;
      await this._refreshActiveCollections();
    }, 30_000);
  }

  async _refreshActiveCollections() {
    const sm = window.PORTAL_STORAGE;
    if (!sm || this.status !== 'CONNECTED' || this._isSyncing) return;

    // Koleksi dinamis yang sering diubah oleh guru di PC lain
    const dynamicKeys = [
      'teacher_admin', 'guru_journals', 'guru_documents',
      'guru_attendance', 'agendas', 'documents', 'supervisi_sesi'
    ];

    let hasChanges = false;
    for (const key of dynamicKeys) {
      try {
        const serverItems = await this.getCollection(key);
        if (Array.isArray(serverItems) && serverItems.length > 0) {
          const localItems = sm.get(key) || [];
          if (serverItems.length !== localItems.length || JSON.stringify(serverItems) !== JSON.stringify(localItems)) {
            sm.set(key, serverItems);
            hasChanges = true;
          }
        }
      } catch (_) {}
    }

    if (hasChanges && window.PORTAL_APP && typeof window.PORTAL_APP.refreshActiveScreen === 'function') {
      console.log('🔄 [API Polling] Perubahan data dari server terdeteksi, memperbarui layar...');
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

      const text = await res.text();
      let json;
      try {
        json = JSON.parse(text);
      } catch (parseErr) {
        // Jika server PHP mengirim error HTML (<br /> <b>...), ekstrak teks aslinya
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = text;
        const cleanMsg = (tempDiv.textContent || tempDiv.innerText || text).replace(/\s+/g, ' ').trim();
        throw new Error(cleanMsg.slice(0, 250) || `HTTP ${res.status}: Respons server bukan JSON valid`);
      }
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
    if (res.success && Array.isArray(res.data)) {
      return res.data.map(item => {
        if (item && item.data_json && typeof item.data_json === 'object') {
          const { data_json, ...rest } = item;
          return { ...data_json, ...rest };
        }
        return item;
      });
    }
    if (res.success && res.data) return res.data;
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

    const collectionsToSeed = Object.keys(COLLECTION_MAP);

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
            percent: totalItems > 0 ? Math.round((processed / totalItems) * 100) : 100
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

    const collectionsToSync = Object.keys(COLLECTION_MAP);

    let count = 0;
    for (const key of collectionsToSync) {
      try {
        const items = await this.getCollection(key);
        if (Array.isArray(items) && items.length > 0) {
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
    localStorage.setItem('simkur_last_server_sync', this.lastSyncTime.toISOString());
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
