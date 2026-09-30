<?php
/**
 * SIMKUR API - Generic CRUD Handler
 * SMKN 1 Banjarmasin
 * 
 * Handles semua collection: teachers, classes, subjects, rooms,
 * schedules, agendas, documents, teacher_admin, guru_journals,
 * guru_documents, guru_attendance, supervisi_program, supervisi_sesi,
 * supervisi_rtl, supervisi_manajerial
 * 
 * Usage:
 *   GET    /api/crud.php?collection=teachers
 *   GET    /api/crud.php?collection=teachers&id=T-001
 *   POST   /api/crud.php?collection=teachers       (body: JSON data)
 *   DELETE /api/crud.php?collection=teachers&id=T-001
 */

require_once __DIR__ . '/config.php';

setApiHeaders();

// Daftar tabel yang diizinkan (whitelist - KEAMANAN PENTING!)
const ALLOWED_TABLES = [
    'teachers', 'classes', 'subjects', 'rooms', 'schedules',
    'agendas', 'documents', 'teacher_admin', 'guru_journals',
    'guru_documents', 'guru_attendance', 'supervisi_program',
    'supervisi_sesi', 'supervisi_rtl', 'supervisi_manajerial'
];

// Validasi collection
$collection = $_GET['collection'] ?? '';
if (empty($collection) || !in_array($collection, ALLOWED_TABLES, true)) {
    sendError("Collection '$collection' tidak valid atau tidak diizinkan.", 400);
}

$method = $_SERVER['REQUEST_METHOD'];
$id     = $_GET['id'] ?? null;

try {
    $db = getDB();

    switch ($method) {
        // ─────────────────────────────────────────────
        // GET: Ambil semua data atau satu dokumen by ID
        // ─────────────────────────────────────────────
        case 'GET':
            if ($id !== null) {
                // Ambil satu dokumen
                $stmt = $db->prepare("SELECT * FROM `$collection` WHERE `id` = ?");
                $stmt->execute([$id]);
                $row = $stmt->fetch();
                if (!$row) {
                    sendError("Data dengan id '$id' tidak ditemukan.", 404);
                }
                // Decode data_json jika ada
                if (isset($row['data_json'])) {
                    $row['data_json'] = json_decode($row['data_json'], true);
                }
                sendSuccess($row);
            } else {
                // Ambil semua dokumen
                $stmt = $db->query("SELECT * FROM `$collection` ORDER BY `updated_at` DESC");
                $rows = $stmt->fetchAll();
                // Decode data_json untuk setiap baris
                foreach ($rows as &$row) {
                    if (isset($row['data_json'])) {
                        $row['data_json'] = json_decode($row['data_json'], true);
                    }
                }
                sendSuccess($rows, 'OK', 200);
            }
            break;

        // ─────────────────────────────────────────────
        // POST: Insert atau Update (upsert by id)
        // ─────────────────────────────────────────────
        case 'POST':
            $body = getJsonBody();
            if (empty($body)) {
                sendError('Request body kosong atau bukan JSON valid.', 400);
            }

            // Auto-generate id jika tidak ada
            if (empty($body['id'])) {
                $body['id'] = $collection . '_' . uniqid();
            }

            // Pisahkan data_json (field tambahan yang tidak ada kolomnya)
            // ambil semua key yang diketahui per tabel
            $knownCols = getKnownColumns($collection);
            $mainData  = [];
            $extraData = [];

            foreach ($body as $key => $value) {
                if (in_array($key, $knownCols, true)) {
                    $mainData[$key] = $value;
                } else {
                    $extraData[$key] = $value;
                }
            }

            // Simpan field ekstra ke data_json
            if (!empty($extraData)) {
                $mainData['data_json'] = json_encode($extraData, JSON_UNESCAPED_UNICODE);
            }

            $mainData['updated_at'] = date('Y-m-d H:i:s');

            // Build upsert query
            $cols        = array_keys($mainData);
            $placeholders = array_map(fn($c) => ":$c", $cols);
            $updates      = array_map(fn($c) => "`$c` = VALUES(`$c`)", $cols);

            $sql = "INSERT INTO `$collection` (`" . implode('`, `', $cols) . "`) "
                 . "VALUES (" . implode(', ', $placeholders) . ") "
                 . "ON DUPLICATE KEY UPDATE " . implode(', ', $updates);

            $stmt = $db->prepare($sql);
            $stmt->execute($mainData);

            sendSuccess(['id' => $body['id']], 'Data berhasil disimpan.', 200);
            break;

        // ─────────────────────────────────────────────
        // DELETE: Hapus dokumen by ID
        // ─────────────────────────────────────────────
        case 'DELETE':
            if ($id === null) {
                sendError('Parameter id wajib untuk DELETE.', 400);
            }
            $stmt = $db->prepare("DELETE FROM `$collection` WHERE `id` = ?");
            $stmt->execute([$id]);
            $affected = $stmt->rowCount();
            if ($affected === 0) {
                sendError("Data dengan id '$id' tidak ditemukan.", 404);
            }
            sendSuccess(['id' => $id, 'deleted' => true], 'Data berhasil dihapus.');
            break;

        default:
            sendError("Method '$method' tidak diizinkan.", 405);
    }

} catch (PDOException $e) {
    sendError('Database error: ' . $e->getMessage(), 500);
} catch (Throwable $e) {
    sendError('Server error: ' . $e->getMessage(), 500);
}

// ─────────────────────────────────────────────────────────────
// Helper: Daftar kolom diketahui per tabel (hindari SQL injection)
// ─────────────────────────────────────────────────────────────
function getKnownColumns(string $table): array {
    $cols = [
        'teachers'           => ['id','name','nip','department','subject','is_active','updated_at','synced_at'],
        'classes'            => ['id','name','grade','department','homeroom_teacher_id','total_students','updated_at'],
        'subjects'           => ['id','name','code','category','hours_per_week','updated_at'],
        'rooms'              => ['id','name','type','capacity','floor','updated_at'],
        'schedules'          => ['id','class_id','subject_id','teacher_id','room_id','day','time_start','time_end','semester','data_json','updated_at'],
        'agendas'            => ['id','title','description','date','type','status','created_by','data_json','updated_at'],
        'documents'          => ['id','title','type','url','description','uploaded_by','upload_date','data_json','updated_at'],
        'teacher_admin'      => ['id','teacher_id','prota','prosem','modul_ajar','rps','capaian_pembelajaran','atp','jurnal_mengajar','absensi_siswa','penilaian','completion_pct','data_json','updated_at'],
        'guru_journals'      => ['id','teacher_id','class_id','subject_id','date','meeting_no','topic','activities','attendance_present','attendance_absent','notes','data_json','updated_at'],
        'guru_documents'     => ['id','teacher_id','doc_type','filename','url','file_size','upload_date','status','data_json','updated_at'],
        'guru_attendance'    => ['id','teacher_id','date','status','time_in','time_out','notes','data_json','updated_at'],
        'supervisi_program'  => ['id','title','semester','supervisor','status','data_json','updated_at'],
        'supervisi_sesi'     => ['id','program_id','teacher_id','date','class_id','subject_id','score','notes','data_json','updated_at'],
        'supervisi_rtl'      => ['id','sesi_id','teacher_id','problem','solution','deadline','status','data_json','updated_at'],
        'supervisi_manajerial' => ['id','title','category','date','score','notes','data_json','updated_at'],
    ];
    return $cols[$table] ?? ['id', 'updated_at'];
}
