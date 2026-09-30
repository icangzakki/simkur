<?php
/**
 * SIMKUR API - Health Check & Status
 * Endpoint: GET /api/health.php
 * 
 * Digunakan oleh frontend untuk mengecek apakah
 * API dan database bisa diakses.
 */

require_once __DIR__ . '/config.php';
setApiHeaders();

$result = [
    'api'      => 'ok',
    'database' => 'unknown',
    'tables'   => [],
    'version'  => '1.0.0',
    'server'   => 'SIMKUR Pi4 API',
    'ts'       => date('c'),
];

try {
    $db = getDB();
    
    // Cek koneksi
    $db->query('SELECT 1');
    $result['database'] = 'connected';
    
    // Cek tabel ada
    $stmt = $db->query("SHOW TABLES");
    $result['tables'] = $stmt->fetchAll(PDO::FETCH_COLUMN);
    
    // Hitung jumlah record per tabel
    $counts = [];
    foreach ($result['tables'] as $table) {
        $c = $db->query("SELECT COUNT(*) FROM `$table`")->fetchColumn();
        $counts[$table] = (int)$c;
    }
    $result['record_counts'] = $counts;
    
    sendSuccess($result, 'API berjalan normal');
    
} catch (PDOException $e) {
    $result['database'] = 'error';
    $result['db_error'] = $e->getMessage();
    http_response_code(500);
    echo json_encode(['success' => false, 'data' => $result], JSON_UNESCAPED_UNICODE);
}
