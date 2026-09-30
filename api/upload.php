<?php
/**
 * SIMKUR API - File Upload Handler
 * SMKN 1 Banjarmasin
 *
 * Endpoint: POST /api/upload.php
 * Menerima upload foto/dokumen dari browser, simpan ke /www/wwwroot/simkur/uploads/
 *
 * Response sukses:
 * {
 *   "success": true,
 *   "url": "/uploads/jurnal/2026/09/foto_abc123.jpg",
 *   "filename": "foto_abc123.jpg",
 *   "size_kb": 85
 * }
 */

require_once __DIR__ . '/config.php';

setApiHeaders();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendError('Hanya method POST yang diizinkan.', 405);
}

// ─── Konfigurasi Upload ───────────────────────────────────────
// UPLOAD_BASE_DIR & UPLOAD_BASE_URL diambil dari config.php (SERVER_MODE)
const MAX_FILE_SIZE_MB = 5;   // Maks 5MB per file

// Tipe file yang diizinkan
const ALLOWED_TYPES = [
    // Gambar (foto jurnal)
    'image/jpeg'  => 'jpg',
    'image/jpg'   => 'jpg',
    'image/png'   => 'png',
    'image/webp'  => 'webp',
    'image/gif'   => 'gif',
    // Dokumen guru
    'application/pdf'                                                        => 'pdf',
    'application/msword'                                                     => 'doc',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'=> 'docx',
    'application/vnd.ms-excel'                                               => 'xls',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'      => 'xlsx',
];

// ─── Validasi request ─────────────────────────────────────────
$type      = $_POST['type']      ?? 'jurnal';   // 'jurnal' | 'dokumen' | 'supervisi'
$teacherId = $_POST['teacher_id'] ?? '';
$date      = $_POST['date']       ?? date('Y-m-d');

// Whitelist type folder
$allowedTypes = ['jurnal', 'dokumen', 'supervisi', 'agenda', 'misc'];
if (!in_array($type, $allowedTypes, true)) {
    $type = 'misc';
}

// ─── Cek ada file yang diupload ────────────────────────────────
if (empty($_FILES['file']) || $_FILES['file']['error'] === UPLOAD_ERR_NO_FILE) {
    // Coba terima base64 (dari app.js yang pakai compressImage → data URL)
    $base64Input = $_POST['base64'] ?? '';
    if (!empty($base64Input)) {
        handleBase64Upload($base64Input, $type, $teacherId, $date);
    }
    sendError('Tidak ada file yang diupload.', 400);
}

$file = $_FILES['file'];

// ─── Cek error upload ─────────────────────────────────────────
if ($file['error'] !== UPLOAD_ERR_OK) {
    $errors = [
        UPLOAD_ERR_INI_SIZE   => 'File terlalu besar (melebihi batas server).',
        UPLOAD_ERR_FORM_SIZE  => 'File terlalu besar.',
        UPLOAD_ERR_PARTIAL    => 'Upload tidak lengkap.',
        UPLOAD_ERR_NO_TMP_DIR => 'Folder sementara tidak tersedia.',
        UPLOAD_ERR_CANT_WRITE => 'Gagal menulis file ke disk.',
    ];
    sendError($errors[$file['error']] ?? 'Upload error: ' . $file['error'], 500);
}

// ─── Validasi ukuran ──────────────────────────────────────────
$maxBytes = MAX_FILE_SIZE_MB * 1024 * 1024;
if ($file['size'] > $maxBytes) {
    sendError("Ukuran file melebihi " . MAX_FILE_SIZE_MB . "MB. Ukuran Anda: " . round($file['size']/1024) . "KB", 400);
}

// ─── Validasi tipe MIME ───────────────────────────────────────
$finfo    = finfo_open(FILEINFO_MIME_TYPE);
$mimeType = finfo_file($finfo, $file['tmp_name']);
finfo_close($finfo);

if (!isset(ALLOWED_TYPES[$mimeType])) {
    sendError("Tipe file tidak diizinkan: $mimeType. Gunakan JPG, PNG, PDF, DOC, atau XLS.", 400);
}

$ext = ALLOWED_TYPES[$mimeType];

// ─── Buat folder tujuan ───────────────────────────────────────
$year  = date('Y', strtotime($date));
$month = date('m', strtotime($date));
$subDir = "$type/$year/$month/";
$destDir = UPLOAD_BASE_DIR . $subDir;

if (!is_dir($destDir)) {
    if (!mkdir($destDir, 0755, true)) {
        sendError("Gagal membuat folder upload: $destDir", 500);
    }
}

// ─── Generate nama file unik ──────────────────────────────────
$safeTeacherId = preg_replace('/[^a-zA-Z0-9_\-]/', '', $teacherId) ?: 'guru';
$uniqueId      = substr(md5(uniqid($safeTeacherId, true)), 0, 10);
$filename      = "{$type}_{$safeTeacherId}_{$uniqueId}.{$ext}";
$destPath      = $destDir . $filename;
$publicUrl     = UPLOAD_BASE_URL . $subDir . $filename;

// ─── Pindahkan file ───────────────────────────────────────────
if (!move_uploaded_file($file['tmp_name'], $destPath)) {
    sendError('Gagal menyimpan file ke server.', 500);
}

// ─── Response sukses ──────────────────────────────────────────
$sizeKb = round(filesize($destPath) / 1024, 1);
sendSuccess([
    'url'      => $publicUrl,
    'filename' => $filename,
    'size_kb'  => $sizeKb,
    'type'     => $mimeType,
    'path'     => $destPath,
], "File berhasil diupload ({$sizeKb} KB)");


// ─────────────────────────────────────────────────────────────
// Handler untuk Base64 upload (dari compressImage di app.js)
// ─────────────────────────────────────────────────────────────
function handleBase64Upload(string $base64, string $type, string $teacherId, string $date): void {
    // Format: data:image/jpeg;base64,/9j/4AAQ...
    if (!preg_match('/^data:(image\/\w+);base64,(.+)$/s', $base64, $m)) {
        sendError('Format base64 tidak valid.', 400);
    }

    $mimeType  = $m[1];
    $imageData = base64_decode($m[2]);

    if (!$imageData) {
        sendError('Gagal decode base64.', 400);
    }

    $extMap = ['image/jpeg' => 'jpg', 'image/png' => 'png', 'image/webp' => 'webp'];
    $ext    = $extMap[$mimeType] ?? 'jpg';

    $year  = date('Y', strtotime($date));
    $month = date('m', strtotime($date));
    $subDir  = "$type/$year/$month/";
    $destDir = UPLOAD_BASE_DIR . $subDir;

    if (!is_dir($destDir)) {
        mkdir($destDir, 0755, true);
    }

    $safeTeacherId = preg_replace('/[^a-zA-Z0-9_\-]/', '', $teacherId) ?: 'guru';
    $uniqueId      = substr(md5(uniqid($safeTeacherId, true)), 0, 10);
    $filename      = "{$type}_{$safeTeacherId}_{$uniqueId}.{$ext}";
    $destPath      = $destDir . $filename;
    $publicUrl     = UPLOAD_BASE_URL . $subDir . $filename;

    if (file_put_contents($destPath, $imageData) === false) {
        sendError('Gagal menyimpan base64 ke file.', 500);
    }

    $sizeKb = round(filesize($destPath) / 1024, 1);
    sendSuccess([
        'url'      => $publicUrl,
        'filename' => $filename,
        'size_kb'  => $sizeKb,
        'type'     => $mimeType,
        'method'   => 'base64',
    ], "Foto berhasil disimpan ({$sizeKb} KB)");
}
