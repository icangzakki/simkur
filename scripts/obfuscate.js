/**
 * SIMKUR Obfuscation & Source Code Protection Pipeline
 * SMKN 1 Banjarmasin
 * 
 * Penggunaan:
 *   npm run protect
 *   node scripts/obfuscate.js
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '..');
const JS_DIR = path.join(ROOT_DIR, 'js');

console.log('🛡️  [SIMKUR] Menjalankan Pipeline Proteksi & Obfuscation Source Code...');

// 1. Obfuscate security-guard.src.js -> security-guard.js
const secSrc = path.join(JS_DIR, 'security-guard.src.js');
const secDest = path.join(JS_DIR, 'security-guard.js');

if (fs.existsSync(secSrc)) {
  console.log('🔒 Mengacak & mengamankan js/security-guard.js...');
  const cmd = `npx javascript-obfuscator "${secSrc}" --output "${secDest}" --compact true --control-flow-flattening true --string-array true --string-array-encoding 'rc4'`;
  try {
    execSync(cmd, { stdio: 'inherit', cwd: ROOT_DIR });
    console.log('✅ js/security-guard.js berhasil di-obfuscate!');
  } catch (err) {
    console.error('❌ Gagal meng-obfuscate security-guard.js:', err.message);
  }
}

console.log('\n✨ Proteksi source code selesai.');
console.log('Catatan: Kode asli yang dapat diedit pengembang tersimpan aman di js/security-guard.src.js');
