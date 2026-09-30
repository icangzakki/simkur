-- ============================================================
-- SIMKUR Database Schema
-- SMKN 1 Banjarmasin - Sistem Informasi Manajemen Kurikulum
-- Target: MySQL/MariaDB di Raspberry Pi 4 via aaPanel
-- ============================================================

CREATE DATABASE IF NOT EXISTS `simkur_db`
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE `simkur_db`;

-- ============================================================
-- 1. TABEL: teachers (Master Guru & GTK)
-- ============================================================
CREATE TABLE IF NOT EXISTS `teachers` (
  `id`          VARCHAR(50) NOT NULL,
  `name`        VARCHAR(150) NOT NULL,
  `nip`         VARCHAR(50) DEFAULT NULL,
  `department`  VARCHAR(100) DEFAULT NULL,
  `subject`     TEXT DEFAULT NULL,
  `is_active`   TINYINT(1) DEFAULT 1,
  `updated_at`  DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `synced_at`   DATETIME DEFAULT NULL,
  PRIMARY KEY (`id`),
  INDEX `idx_department` (`department`),
  INDEX `idx_nip` (`nip`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 2. TABEL: classes (Master Rombel/Kelas)
-- ============================================================
CREATE TABLE IF NOT EXISTS `classes` (
  `id`           VARCHAR(50) NOT NULL,
  `name`         VARCHAR(100) NOT NULL,
  `grade`        VARCHAR(20) DEFAULT NULL,     -- X, XI, XII
  `department`   VARCHAR(100) DEFAULT NULL,
  `homeroom_teacher_id` VARCHAR(50) DEFAULT NULL,
  `total_students` INT DEFAULT 0,
  `updated_at`   DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_grade` (`grade`),
  INDEX `idx_department` (`department`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 3. TABEL: subjects (Master Mata Pelajaran)
-- ============================================================
CREATE TABLE IF NOT EXISTS `subjects` (
  `id`          VARCHAR(50) NOT NULL,
  `name`        VARCHAR(200) NOT NULL,
  `code`        VARCHAR(50) DEFAULT NULL,
  `category`    VARCHAR(100) DEFAULT NULL,   -- Umum, Kejuruan, dll
  `hours_per_week` INT DEFAULT 0,
  `updated_at`  DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 4. TABEL: rooms (Master Ruang)
-- ============================================================
CREATE TABLE IF NOT EXISTS `rooms` (
  `id`          VARCHAR(50) NOT NULL,
  `name`        VARCHAR(100) NOT NULL,
  `type`        VARCHAR(50) DEFAULT NULL,    -- Teori, Lab, Praktik
  `capacity`    INT DEFAULT 0,
  `floor`       VARCHAR(20) DEFAULT NULL,
  `updated_at`  DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 5. TABEL: schedules (Jadwal Pelajaran)
-- ============================================================
CREATE TABLE IF NOT EXISTS `schedules` (
  `id`          VARCHAR(50) NOT NULL,
  `class_id`    VARCHAR(50) DEFAULT NULL,
  `subject_id`  VARCHAR(50) DEFAULT NULL,
  `teacher_id`  VARCHAR(50) DEFAULT NULL,
  `room_id`     VARCHAR(50) DEFAULT NULL,
  `day`         VARCHAR(20) DEFAULT NULL,    -- Senin, Selasa, ...
  `time_start`  VARCHAR(10) DEFAULT NULL,   -- 07:00
  `time_end`    VARCHAR(10) DEFAULT NULL,   -- 08:30
  `semester`    VARCHAR(50) DEFAULT NULL,
  `data_json`   JSON DEFAULT NULL,          -- Data tambahan
  `updated_at`  DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_class` (`class_id`),
  INDEX `idx_teacher` (`teacher_id`),
  INDEX `idx_day` (`day`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 6. TABEL: agendas (Agenda Kurikulum)
-- ============================================================
CREATE TABLE IF NOT EXISTS `agendas` (
  `id`          VARCHAR(50) NOT NULL,
  `title`       VARCHAR(300) NOT NULL,
  `description` TEXT DEFAULT NULL,
  `date`        DATE DEFAULT NULL,
  `type`        VARCHAR(100) DEFAULT NULL,
  `status`      VARCHAR(50) DEFAULT 'upcoming',
  `created_by`  VARCHAR(100) DEFAULT NULL,
  `data_json`   JSON DEFAULT NULL,
  `updated_at`  DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_date` (`date`),
  INDEX `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 7. TABEL: documents (Dokumen Kurikulum)
-- ============================================================
CREATE TABLE IF NOT EXISTS `documents` (
  `id`          VARCHAR(50) NOT NULL,
  `title`       VARCHAR(300) NOT NULL,
  `type`        VARCHAR(100) DEFAULT NULL,   -- SK, Modul, Silabus, dll
  `url`         TEXT DEFAULT NULL,
  `description` TEXT DEFAULT NULL,
  `uploaded_by` VARCHAR(100) DEFAULT NULL,
  `upload_date` DATE DEFAULT NULL,
  `data_json`   JSON DEFAULT NULL,
  `updated_at`  DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 8. TABEL: teacher_admin (Status Administrasi Guru)
-- ============================================================
CREATE TABLE IF NOT EXISTS `teacher_admin` (
  `id`              VARCHAR(50) NOT NULL,
  `teacher_id`      VARCHAR(50) NOT NULL,
  `prota`           TINYINT(1) DEFAULT 0,
  `prosem`          TINYINT(1) DEFAULT 0,
  `modul_ajar`      TINYINT(1) DEFAULT 0,
  `rps`             TINYINT(1) DEFAULT 0,
  `capaian_pembelajaran` TINYINT(1) DEFAULT 0,
  `atp`             TINYINT(1) DEFAULT 0,
  `jurnal_mengajar` TINYINT(1) DEFAULT 0,
  `absensi_siswa`   TINYINT(1) DEFAULT 0,
  `penilaian`       TINYINT(1) DEFAULT 0,
  `completion_pct`  DECIMAL(5,2) DEFAULT 0.00,
  `data_json`       JSON DEFAULT NULL,
  `updated_at`      DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_teacher` (`teacher_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 9. TABEL: guru_journals (Jurnal Mengajar Guru)
-- ============================================================
CREATE TABLE IF NOT EXISTS `guru_journals` (
  `id`          VARCHAR(50) NOT NULL,
  `teacher_id`  VARCHAR(50) NOT NULL,
  `class_id`    VARCHAR(50) DEFAULT NULL,
  `subject_id`  VARCHAR(50) DEFAULT NULL,
  `date`        DATE NOT NULL,
  `meeting_no`  INT DEFAULT NULL,
  `topic`       TEXT DEFAULT NULL,
  `activities`  TEXT DEFAULT NULL,
  `attendance_present` INT DEFAULT 0,
  `attendance_absent`  INT DEFAULT 0,
  `notes`       TEXT DEFAULT NULL,
  `data_json`   JSON DEFAULT NULL,
  `updated_at`  DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_teacher` (`teacher_id`),
  INDEX `idx_date` (`date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 10. TABEL: guru_documents (Upload Dokumen oleh Guru)
-- ============================================================
CREATE TABLE IF NOT EXISTS `guru_documents` (
  `id`          VARCHAR(50) NOT NULL,
  `teacher_id`  VARCHAR(50) NOT NULL,
  `doc_type`    VARCHAR(100) DEFAULT NULL,  -- prota, prosem, modul_ajar
  `filename`    VARCHAR(300) DEFAULT NULL,
  `url`         TEXT DEFAULT NULL,
  `file_size`   INT DEFAULT 0,
  `upload_date` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `status`      VARCHAR(50) DEFAULT 'uploaded',
  `data_json`   JSON DEFAULT NULL,
  `updated_at`  DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_teacher` (`teacher_id`),
  INDEX `idx_doc_type` (`doc_type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 11. TABEL: guru_attendance (Absensi/Kehadiran Guru)
-- ============================================================
CREATE TABLE IF NOT EXISTS `guru_attendance` (
  `id`          VARCHAR(50) NOT NULL,
  `teacher_id`  VARCHAR(50) NOT NULL,
  `date`        DATE NOT NULL,
  `status`      VARCHAR(20) DEFAULT 'hadir',  -- hadir, sakit, izin, alfa
  `time_in`     TIME DEFAULT NULL,
  `time_out`    TIME DEFAULT NULL,
  `notes`       TEXT DEFAULT NULL,
  `data_json`   JSON DEFAULT NULL,
  `updated_at`  DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_teacher` (`teacher_id`),
  INDEX `idx_date` (`date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 12. TABEL: supervisi_program (Program Supervisi)
-- ============================================================
CREATE TABLE IF NOT EXISTS `supervisi_program` (
  `id`          VARCHAR(50) NOT NULL,
  `title`       VARCHAR(300) NOT NULL,
  `semester`    VARCHAR(50) DEFAULT NULL,
  `supervisor`  VARCHAR(150) DEFAULT NULL,
  `status`      VARCHAR(50) DEFAULT 'planned',
  `data_json`   JSON DEFAULT NULL,
  `updated_at`  DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 13. TABEL: supervisi_sesi (Sesi Supervisi)
-- ============================================================
CREATE TABLE IF NOT EXISTS `supervisi_sesi` (
  `id`          VARCHAR(50) NOT NULL,
  `program_id`  VARCHAR(50) DEFAULT NULL,
  `teacher_id`  VARCHAR(50) DEFAULT NULL,
  `date`        DATE DEFAULT NULL,
  `class_id`    VARCHAR(50) DEFAULT NULL,
  `subject_id`  VARCHAR(50) DEFAULT NULL,
  `score`       DECIMAL(5,2) DEFAULT NULL,
  `notes`       TEXT DEFAULT NULL,
  `data_json`   JSON DEFAULT NULL,
  `updated_at`  DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_program` (`program_id`),
  INDEX `idx_teacher` (`teacher_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 14. TABEL: supervisi_rtl (Rencana Tindak Lanjut Supervisi)
-- ============================================================
CREATE TABLE IF NOT EXISTS `supervisi_rtl` (
  `id`          VARCHAR(50) NOT NULL,
  `sesi_id`     VARCHAR(50) DEFAULT NULL,
  `teacher_id`  VARCHAR(50) DEFAULT NULL,
  `problem`     TEXT DEFAULT NULL,
  `solution`    TEXT DEFAULT NULL,
  `deadline`    DATE DEFAULT NULL,
  `status`      VARCHAR(50) DEFAULT 'pending',
  `data_json`   JSON DEFAULT NULL,
  `updated_at`  DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_teacher` (`teacher_id`),
  INDEX `idx_sesi` (`sesi_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 15. TABEL: supervisi_manajerial
-- ============================================================
CREATE TABLE IF NOT EXISTS `supervisi_manajerial` (
  `id`          VARCHAR(50) NOT NULL,
  `title`       VARCHAR(300) DEFAULT NULL,
  `category`    VARCHAR(100) DEFAULT NULL,
  `date`        DATE DEFAULT NULL,
  `score`       DECIMAL(5,2) DEFAULT NULL,
  `notes`       TEXT DEFAULT NULL,
  `data_json`   JSON DEFAULT NULL,
  `updated_at`  DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 16. TABEL: users (Auth - gantikan auth_users.js di masa depan)
-- Saat ini auth masih di auth_users.js (hardcoded), tabel ini untuk referensi
-- ============================================================
CREATE TABLE IF NOT EXISTS `users` (
  `id`          INT AUTO_INCREMENT,
  `nip`         VARCHAR(50) NOT NULL UNIQUE,
  `name`        VARCHAR(150) NOT NULL,
  `role`        VARCHAR(50) DEFAULT 'guru',
  `department`  VARCHAR(100) DEFAULT NULL,
  `is_active`   TINYINT(1) DEFAULT 1,
  `last_login`  DATETIME DEFAULT NULL,
  `created_at`  DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_nip` (`nip`),
  INDEX `idx_role` (`role`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- Konfirmasi pembuatan tabel
-- ============================================================
SELECT 
  TABLE_NAME AS 'Tabel',
  TABLE_ROWS AS 'Baris',
  CREATE_TIME AS 'Dibuat'
FROM information_schema.TABLES
WHERE TABLE_SCHEMA = 'simkur_db'
ORDER BY TABLE_NAME;
