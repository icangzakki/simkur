/**
 * SIMKUR — Firebase Cloud Firestore Service
 * Project: simkur
 * Author: SMKN 1 Banjarmasin Web Engineering
 * 
 * Provides robust, offline-first Cloud Firestore database integration
 * with automatic fallback to local cache, batch seeding, and real-time syncing.
 */

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-app.js";
import { 
  getFirestore, 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  setDoc, 
  deleteDoc, 
  onSnapshot,
  writeBatch 
} from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";

// Official Firebase Web Configuration provided by user
export const firebaseConfig = {
  apiKey: "AIzaSyABJ1Be_yG2SGxzOg1VU9k--J0tGi7cqrQ",
  authDomain: "simkur.firebaseapp.com",
  projectId: "simkur",
  storageBucket: "simkur.firebasestorage.app",
  messagingSenderId: "430000459825",
  appId: "1:430000459825:web:291e1a714df20f0939c510"
};

// Map StorageManager keys to Firestore Collection names
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

class FirebaseService {
  constructor() {
    this.app = null;
    this.db = null;
    this.status = 'DISCONNECTED'; // 'CONNECTING' | 'CONNECTED' | 'ERROR' | 'OFFLINE'
    this.errorMessage = '';
    this.unsubscribers = [];
    this.isInitialized = false;
    this.lastSyncTime = null;
  }

  async init() {
    if (this.isInitialized) return;
    this.status = 'CONNECTING';
    this.notifyStatus();

    try {
      this.app = initializeApp(firebaseConfig);
      this.db = getFirestore(this.app);
      this.isInitialized = true;

      // Check connectivity and verify if Firestore is active in the project
      await this.verifyConnection();
    } catch (err) {
      console.warn('⚠️ [Firebase] Initialization failed:', err);
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
      // Lightweight probe: attempt to query metadata or agendas collection
      const testCol = collection(this.db, 'agendas');
      const snap = await getDocs(testCol);
      
      this.status = 'CONNECTED';
      this.errorMessage = '';
      this.lastSyncTime = new Date();
      console.log(`✅ [Firebase Cloud] Terhubung ke Firestore (Project: ${firebaseConfig.projectId}). Docs count in agendas: ${snap.size}`);
      this.notifyStatus();

      // Auto-sync initial data from cloud on startup
      this.autoSync();

      // Start real-time listeners for live updates
      this.setupRealtimeListeners();
    } catch (err) {
      this.handleError(err);
    }
  }

  handleError(err) {
    console.warn('ℹ️ [Firebase Cloud Status]:', err?.message || err);
    this.status = 'ERROR';
    
    const msg = String(err?.message || err);
    if (msg.includes('Cloud Firestore API has not been used') || msg.includes('SERVICE_DISABLED')) {
      this.errorMessage = 'Cloud Firestore belum diaktifkan di Firebase Console. Kunjungi Firebase Console > Firestore Database > Buat Database.';
    } else if (msg.includes('permission-denied') || msg.includes('Missing or insufficient permissions')) {
      this.errorMessage = 'Aturan keamanan (Security Rules) Firestore menolak akses. Atur rules ke mode pengujian: allow read, write: if true;';
    } else if (msg.includes('unavailable') || !navigator.onLine) {
      this.status = 'OFFLINE';
      this.errorMessage = 'Koneksi ke server Firebase terputus. Mode offline lokal aktif.';
    } else {
      this.errorMessage = msg;
    }
    this.notifyStatus();
  }

  notifyStatus() {
    window.dispatchEvent(new CustomEvent('simkur-firebase-status', {
      detail: {
        status: this.status,
        errorMessage: this.errorMessage,
        lastSync: this.lastSyncTime,
        projectId: firebaseConfig.projectId
      }
    }));
  }

  getCollectionName(key) {
    const k = String(key).toLowerCase();
    return COLLECTION_MAP[k] || k;
  }

  /**
   * Save or merge a document to Firestore asynchronously
   */
  async saveDoc(key, id, data) {
    if (!this.db || this.status !== 'CONNECTED') {
      return false;
    }
    try {
      const colName = this.getCollectionName(key);
      const docRef = doc(this.db, colName, String(id));
      const cleanData = Object.assign({}, data, {
        _updatedAt: new Date().toISOString()
      });
      await setDoc(docRef, cleanData, { merge: true });
      return true;
    } catch (err) {
      console.warn(`[Firebase] Save error (${key}/${id}):`, err.message);
      return false;
    }
  }

  /**
   * Delete a document from Firestore asynchronously
   */
  async deleteDoc(key, id) {
    if (!this.db || this.status !== 'CONNECTED') {
      return false;
    }
    try {
      const colName = this.getCollectionName(key);
      const docRef = doc(this.db, colName, String(id));
      await deleteDoc(docRef);
      return true;
    } catch (err) {
      console.warn(`[Firebase] Delete error (${key}/${id}):`, err.message);
      return false;
    }
  }

  /**
   * Upload all local dataset from StorageManager to Firestore in batches
   */
  async seedAllToFirestore(onProgress) {
    if (!this.db) {
      throw new Error('Database Firebase belum terinisialisasi.');
    }

    const sm = window.PORTAL_STORAGE;
    if (!sm) {
      throw new Error('StorageManager lokal tidak ditemukan.');
    }

    const collectionsToSeed = [
      'agendas',
      'documents',
      'teachers',
      'classes',
      'subjects',
      'rooms',
      'teacher_admin',
      'guru_journals',
      'guru_documents',
      'schedules'
    ];

    let totalItems = 0;
    collectionsToSeed.forEach(k => {
      totalItems += (sm.get(k) || []).length;
    });

    let processed = 0;

    for (const key of collectionsToSeed) {
      const items = sm.get(key) || [];
      const colName = this.getCollectionName(key);
      
      // Batch writes in chunks of 450 (Firestore limit is 500 per batch)
      const chunkSize = 400;
      for (let i = 0; i < items.length; i += chunkSize) {
        const chunk = items.slice(i, i + chunkSize);
        const batch = writeBatch(this.db);
        
        chunk.forEach(item => {
          const docId = String(item.id || item.teacher_id || `${key}_${Math.random().toString(36).substr(2, 9)}`);
          const docRef = doc(this.db, colName, docId);
          batch.set(docRef, Object.assign({}, item, {
            id: docId,
            _syncedAt: new Date().toISOString()
          }), { merge: true });
        });

        await batch.commit();
        processed += chunk.length;
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
    this.status = 'CONNECTED';
    this.notifyStatus();
    return { success: true, count: processed };
  }

  /**
   * Reset teacher administration status in Firestore and clear teacher journals/docs
   */
  async resetAdministrationInFirestore() {
    if (!this.db || this.status !== 'CONNECTED') return;

    try {
      const sm = window.PORTAL_STORAGE;
      if (!sm) return;

      // 1. Overwrite teacher_admin with clean zero state
      const adminCol = this.getCollectionName('teacher_admin');
      const items = sm.get('teacher_admin') || [];
      const batch = writeBatch(this.db);
      items.forEach(item => {
        const docRef = doc(this.db, adminCol, String(item.teacher_id || item.id));
        batch.set(docRef, Object.assign({}, item, {
          _syncedAt: new Date().toISOString()
        }), { merge: true });
      });
      await batch.commit();

      // 2. Clear previous uploaded guru_journals, guru_documents, guru_attendance
      const clearCollections = ['guru_journals', 'guru_documents', 'guru_attendance'];
      for (const colKey of clearCollections) {
        const colRef = collection(this.db, this.getCollectionName(colKey));
        const snap = await getDocs(colRef);
        if (!snap.empty) {
          const deleteBatch = writeBatch(this.db);
          snap.forEach(d => deleteBatch.delete(d.ref));
          await deleteBatch.commit();
        }
      }
      console.log('✅ [Firebase Cloud] Teacher administration reset to 0 in Cloud Firestore.');
    } catch(err) {
      console.warn('⚠️ [Firebase Cloud] Reset administration warning:', err.message);
    }
  }

  /**
   * Auto-sync dari Firebase ke browser lokal secara mulus
   */
  async autoSync() {
    if (this._isSyncing || this.status !== 'CONNECTED' || !this.db) return;
    this._isSyncing = true;

    try {
      console.log('🔄 [Firebase Auto-Sync] Mengunduh data terbaru dari Cloud Firestore...');
      const res = await this.syncFromFirestore();

      if (res && res.count > 0) {
        console.log(`✅ [Firebase Auto-Sync] Selesai! ${res.count} dokumen disinkronkan ke peramban.`);
        if (window.PORTAL_APP && typeof window.PORTAL_APP.refreshActiveScreen === 'function') {
          window.PORTAL_APP.refreshActiveScreen();
        }
      }
    } catch (err) {
      console.warn('⚠️ [Firebase Auto-Sync] Gagal:', err.message);
    } finally {
      this._isSyncing = false;
      this.status = 'CONNECTED';
      this.notifyStatus();
    }
  }

  /**
   * Download and sync cloud data into local StorageManager
   */
  async syncFromFirestore(onProgress) {
    if (!this.db) {
      throw new Error('Database Firebase belum terinisialisasi.');
    }

    const sm = window.PORTAL_STORAGE;
    if (!sm) {
      throw new Error('StorageManager lokal tidak ditemukan.');
    }

    const collectionsToSync = Object.keys(COLLECTION_MAP);

    let count = 0;
    for (const key of collectionsToSync) {
      try {
        const colName = this.getCollectionName(key);
        const colRef = collection(this.db, colName);
        const snapshot = await getDocs(colRef);
        
        if (!snapshot.empty) {
          const cloudItems = [];
          snapshot.forEach(docSnap => {
            cloudItems.push(docSnap.data());
          });
          sm.set(key, cloudItems);
          count += cloudItems.length;
        }
        if (typeof onProgress === 'function') {
          onProgress({ currentKey: key, syncedCount: count });
        }
      } catch (e) {
        console.warn(`[Firebase] Sync error (${key}):`, e.message);
      }
    }

    this.lastSyncTime = new Date();
    this.notifyStatus();
    return { success: true, count };
  }

  /**
   * Real-time listeners for immediate updates across browsers/tabs
   */
  setupRealtimeListeners() {
    // Unsubscribe any previous listeners
    this.unsubscribers.forEach(unsub => {
      try { unsub(); } catch(e) {}
    });
    this.unsubscribers = [];

    const activeKeys = ['agendas', 'documents', 'guru_journals'];
    const sm = window.PORTAL_STORAGE;
    if (!sm || !this.db) return;

    activeKeys.forEach(key => {
      try {
        const colName = this.getCollectionName(key);
        const colRef = collection(this.db, colName);
        const unsub = onSnapshot(colRef, (snapshot) => {
          // Ignore empty snapshot if local has data already
          if (snapshot.empty && (sm.get(key) || []).length > 0) return;

          const items = [];
          snapshot.forEach(docSnap => items.push(docSnap.data()));
          
          if (items.length > 0) {
            sm.set(key, items);
            if (window.PORTAL_APP && typeof window.PORTAL_APP.refreshActiveScreen === 'function') {
              window.PORTAL_APP.refreshActiveScreen();
            }
          }
        }, (err) => {
          console.warn(`[Firebase Listener] ${key} snapshot warning:`, err.message);
        });
        this.unsubscribers.push(unsub);
      } catch (e) {
        console.warn(`[Firebase] Listener setup error for ${key}:`, e);
      }
    });
  }
}

// Instantiate singleton & attach to global window
const instance = new FirebaseService();
window.FirebaseService = instance;

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => instance.init());
} else {
  instance.init();
}

export default instance;
