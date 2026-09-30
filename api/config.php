<?php
/**
 * SIMKUR API - Konfigurasi Utama
 * SMKN 1 Banjarmasin
 *
 * ╔══════════════════════════════════════════════════════════════════╗
 * ║  EDIT BAGIAN INI SESUAI SERVER ANDA — HANYA FILE INI!           ║
 * ╚══════════════════════════════════════════════════════════════════╝
 *
 * MODE SERVER — pilih salah satu:
 *
 *   'pi4'     → Raspberry Pi 4 lokal (aaPanel)
 *               Path: /www/wwwroot/simkur/
 *               Akses: http://192.168.x.x/ (WiFi sekolah saja)
 *
 *   'vps'     → VPS Linux sekolah (Nginx/Apache, panel bebas)
 *               Path: /var/www/simkur/ atau /var/www/html/simkur/
 *               Akses: https://simkur.smkn1bjm.sch.id/ (internet)
 *
 *   'hosting' → Shared hosting / cPanel / DirectAdmin
 *               Path: /home/USER/public_html/simkur/
 *               Akses: https://domain-sekolah.sch.id/simkur/
 *
 *   'custom'  → Isi manual UPLOAD_BASE_DIR & UPLOAD_BASE_URL di bawah
 */

// ════════════════════════════════════════════════════════════════
//  PILIH MODE SESUAI SERVER ANDA:
define('SERVER_MODE', 'pi4');   // ← 'pi4' | 'vps' | 'hosting' | 'custom'
// ════════════════════════════════════════════════════════════════

// ── Database ──────────────────────────────────────────────────────
define('DB_HOST', 'localhost');
define('DB_NAME', 'simkur_db');
define('DB_USER', 'simkur_user');        // Ganti dengan user MySQL Anda
define('DB_PASS', 'GANTI_PASSWORD_INI'); // ⚠️ WAJIB GANTI INI!
define('DB_CHARSET', 'utf8mb4');

// ── Path Upload File (otomatis sesuai SERVER_MODE) ────────────────
if (SERVER_MODE === 'pi4') {
    // ─ Raspberry Pi 4 + aaPanel ─────────────────────────────────
    define('UPLOAD_BASE_DIR', '/www/wwwroot/simkur/uploads/');
    define('UPLOAD_BASE_URL', '/uploads/');

} elseif (SERVER_MODE === 'vps') {
    // ─ VPS Linux (Nginx / Apache) ────────────────────────────────
    // Sesuaikan jika web root berbeda (cek dengan: echo document_root di phpinfo())
    // Umum: /var/www/simkur/ atau /var/www/html/simkur/
    define('UPLOAD_BASE_DIR', '/var/www/simkur/uploads/');
    define('UPLOAD_BASE_URL', '/uploads/');

} elseif (SERVER_MODE === 'hosting') {
    // ─ Shared Hosting / cPanel / DirectAdmin ─────────────────────
    // Ganti CPANEL_USER dengan username cPanel Anda
    define('UPLOAD_BASE_DIR', '/home/CPANEL_USER/public_html/simkur/uploads/');
    define('UPLOAD_BASE_URL', '/simkur/uploads/');

} else {
    // ─ Custom — isi manual ──────────────────────────────────────
    define('UPLOAD_BASE_DIR', '/path/ke/simkur/uploads/');
    define('UPLOAD_BASE_URL', '/uploads/');
}

// ── CORS ──────────────────────────────────────────────────────────
// Pi4 lokal  → '*' (aman, hanya di LAN sekolah)
// VPS/Hosting → ganti dengan domain Anda untuk keamanan lebih
// Contoh: 'https://simkur.smkn1bjm.sch.id'
define('CORS_ORIGIN', '*');

/**
 * Membuat koneksi PDO ke MySQL
 */
function getDB(): PDO {
    static $pdo = null;
    if ($pdo !== null) return $pdo;
    
    $dsn = "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=" . DB_CHARSET;
    $options = [
        PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES   => false,
    ];
    
    try {
        $pdo = new PDO($dsn, DB_USER, DB_PASS, $options);
        return $pdo;
    } catch (PDOException $e) {
        http_response_code(500);
        die(json_encode([
            'success' => false,
            'error'   => 'Koneksi database gagal: ' . $e->getMessage()
        ]));
    }
}

/**
 * Set header CORS dan JSON untuk semua response API
 */
function setApiHeaders(): void {
    header('Content-Type: application/json; charset=utf-8');
    header('Access-Control-Allow-Origin: ' . CORS_ORIGIN);
    header('Access-Control-Allow-Methods: GET, POST, DELETE, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type, X-Requested-With');
    
    // Handle preflight OPTIONS request
    if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
        http_response_code(200);
        exit();
    }
}

/**
 * Kirim response JSON sukses
 */
function sendSuccess(mixed $data, string $message = 'OK', int $code = 200): void {
    http_response_code($code);
    echo json_encode([
        'success' => true,
        'message' => $message,
        'data'    => $data,
        'ts'      => date('c')
    ], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit();
}

/**
 * Kirim response JSON error
 */
function sendError(string $message, int $code = 400): void {
    http_response_code($code);
    echo json_encode([
        'success' => false,
        'error'   => $message,
        'ts'      => date('c')
    ], JSON_UNESCAPED_UNICODE);
    exit();
}

/**
 * Ambil body JSON dari request
 */
function getJsonBody(): array {
    $raw = file_get_contents('php://input');
    if (empty($raw)) return [];
    $data = json_decode($raw, true);
    return is_array($data) ? $data : [];
}
