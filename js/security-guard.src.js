/**
 * SIMKUR — Security & Source Code Protection Guard (SOURCE)
 * SMKN 1 Banjarmasin
 * 
 * Fitur Perlindungan:
 * 1. Pencegahan Klik Kanan (Anti Right-Click / Context Menu) dengan pengecualian input/textarea agar guru tetap bisa input & paste data
 * 2. Pemblokiran Shortcut Pengembang:
 *    - F12 (DevTools)
 *    - Ctrl+Shift+I / Cmd+Opt+I (Inspector)
 *    - Ctrl+Shift+J / Cmd+Opt+J (Console)
 *    - Ctrl+Shift+C / Cmd+Opt+C (Element Picker)
 *    - Ctrl+U / Cmd+Opt+U (View Page Source)
 *    - Ctrl+S / Cmd+S (Save Page HTML)
 * 3. Fallback Toast Mandiri (berjalan di index.html, login.html, maupun sebelum DOM selesai)
 * 4. Peringatan Keamanan Konsol Browser (Anti-Self XSS & Console Tampering)
 * 5. Proteksi Drag & Drop gambar/logo internal
 */

(function () {
  'use strict';

  // Helper untuk menampilkan notifikasi toast keamanan
  function showSecurityAlert(message, type) {
    if (window.PORTAL_APP && typeof window.PORTAL_APP.showToast === 'function') {
      window.PORTAL_APP.showToast(message, type || 'warning');
      return;
    }
    if (typeof window.showToast === 'function') {
      window.showToast(message);
      return;
    }
    if (!document.body) return;
    var toast = document.getElementById('simkur-sec-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'simkur-sec-toast';
      toast.style.cssText = 'position:fixed;bottom:24px;left:50%;transform:translateX(-50%);background:#0F172A;color:#F8FAFC;padding:10px 20px;border-radius:999px;font-size:12.5px;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;font-weight:600;box-shadow:0 12px 30px rgba(0,0,0,0.35);z-index:9999999;transition:all 0.25s ease;pointer-events:none;opacity:0;border:1px solid rgba(255,255,255,0.18);display:flex;align-items:center;gap:8px;';
      document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.style.opacity = '1';
    toast.style.transform = 'translateX(-50%) translateY(0)';
    clearTimeout(toast._timer);
    toast._timer = setTimeout(function () {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(-50%) translateY(8px)';
    }, 2800);
  }

  // 1. Matikan Klik Kanan (Context Menu)
  document.addEventListener('contextmenu', function (e) {
    var target = e.target;
    if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)) {
      return true;
    }
    e.preventDefault();
    showSecurityAlert('🔒 Klik kanan dinonaktifkan untuk menjaga keamanan source code & data SIMKUR SMKN 1.', 'warning');
    return false;
  }, false);

  // 2. Blokir Shortcut Pengembang (DevTools, View Source, Save Page)
  document.addEventListener('keydown', function (e) {
    var isMac = (navigator.platform && navigator.platform.toUpperCase().indexOf('MAC') >= 0) || 
                (navigator.userAgent && navigator.userAgent.toUpperCase().indexOf('MAC') >= 0);
    var cmdOrCtrl = isMac ? e.metaKey : e.ctrlKey;
    var shift = e.shiftKey;
    var alt = e.altKey;
    var key = e.key ? e.key.toUpperCase() : '';
    var keyCode = e.keyCode || e.which;

    // F12 -> DevTools
    if (keyCode === 123 || key === 'F12') {
      e.preventDefault();
      showSecurityAlert('🔒 Akses DevTools (F12) dibatasi oleh kebijakan keamanan SIMKUR.', 'danger');
      return false;
    }

    // Ctrl+Shift+I / Cmd+Opt+I -> Inspect Elements
    if (cmdOrCtrl && (shift || alt) && (key === 'I' || keyCode === 73)) {
      e.preventDefault();
      showSecurityAlert('🔒 Akses Inspeksi Elemen dibatasi oleh sistem SIMKUR.', 'danger');
      return false;
    }

    // Ctrl+Shift+J / Cmd+Opt+J -> JavaScript Console
    if (cmdOrCtrl && (shift || alt) && (key === 'J' || keyCode === 74)) {
      e.preventDefault();
      showSecurityAlert('🔒 Akses Konsol Pengembang dibatasi.', 'danger');
      return false;
    }

    // Ctrl+Shift+C / Cmd+Opt+C -> Element Inspector Tool
    if (cmdOrCtrl && (shift || alt) && (key === 'C' || keyCode === 67)) {
      e.preventDefault();
      showSecurityAlert('🔒 Akses Inspeksi Objek dibatasi.', 'danger');
      return false;
    }

    // Ctrl+U / Cmd+Opt+U -> View Source
    if ((cmdOrCtrl && !shift && (key === 'U' || keyCode === 85)) || 
        (isMac && cmdOrCtrl && alt && (key === 'U' || keyCode === 85))) {
      e.preventDefault();
      showSecurityAlert('🔒 Melihat kode sumber (View Source) dinonaktifkan.', 'danger');
      return false;
    }

    // Ctrl+S / Cmd+S -> Save Webpage Complete
    if (cmdOrCtrl && (key === 'S' || keyCode === 83)) {
      e.preventDefault();
      showSecurityAlert('🔒 Penyimpanan offline source code dibatasi.', 'warning');
      return false;
    }
  }, false);

  // 3. Cegah drag & drop gambar / logo agar tidak disalin sembarangan
  document.addEventListener('dragstart', function (e) {
    if (e.target && e.target.tagName === 'IMG') {
      e.preventDefault();
      return false;
    }
  }, false);

  // 4. Banner Keamanan di Konsol Browser (Self-XSS & Anti-Tampering)
  try {
    var titleStyle = 'color: #EF4444; font-size: 20px; font-weight: 900; -webkit-text-stroke: 1px black;';
    var textStyle = 'color: #0F172A; font-size: 13px; font-weight: 600; line-height: 1.5;';
    var badgeStyle = 'color: #B45309; font-size: 12px; font-weight: 700; background: #FEF3C7; padding: 4px 10px; border-radius: 4px; border: 1px solid #FCD34D;';

    console.log('%c⚠️ PERINGATAN KEAMANAN — SIMKUR SMKN 1 BANJARMASIN', titleStyle);
    console.log('%cArea ini ditujukan hanya untuk keperluan pemeliharaan resmi tim IT SMKN 1 Banjarmasin.\nJangan menyalin atau menjalankan script sembarangan di konsol ini (Pencegahan Serangan Self-XSS).', textStyle);
    console.log('%cIntegritas Data Dilindungi oleh Cloud Firestore Security Rules & Protokol SIMKUR v8.4.', badgeStyle);
  } catch (err) {}

})();
