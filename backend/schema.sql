-- ==========================================================
-- SKILLGAP.AI — POSTGRESQL 17 DATABASE SCHEMA (skillgap_db)
-- Arsitektur Basis Data Relasional 5 Tabel Terintegrasi
-- ==========================================================

-- Pastikan database 'skillgap_db' telah dibuat:
-- CREATE DATABASE skillgap_db;

-- 1. Tabel Users (Multi-Role: Mahasiswa, Pelajar, Dosen, Guru BK, Admin)
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'Mahasiswa',
    jenjang VARCHAR(100) NOT NULL DEFAULT 'Mahasiswa',
    birth_date DATE,
    age INT,
    parental_consent BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Tabel Assessments (Hasil Diagnosis Gap & Minat)
CREATE TABLE IF NOT EXISTS assessments (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    target_career VARCHAR(255) NOT NULL,
    match_score INT NOT NULL,
    skill_gap INT NOT NULL,
    student_goal TEXT,
    report_grades JSONB,
    primary_skills JSONB,
    full_report JSONB,
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Tabel Uploaded Documents (Log Portofolio & CV)
CREATE TABLE IF NOT EXISTS uploaded_documents (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    file_name VARCHAR(255) NOT NULL,
    file_type VARCHAR(50) NOT NULL,
    file_size INT DEFAULT 0,
    file_url TEXT,
    extracted_skills TEXT,
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Tabel User Roadmaps (Pelacakan Progres Belajar 4 Fase)
CREATE TABLE IF NOT EXISTS user_roadmaps (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    progress_percentage INT DEFAULT 0,
    current_phase VARCHAR(100) DEFAULT 'Phase 1',
    status VARCHAR(50) DEFAULT 'In Progress',
    tasks_data JSONB,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. Tabel Counselor Validations (Validasi & Catatan Bimbingan Dosen / Guru BK)
CREATE TABLE IF NOT EXISTS counselor_validations (
    id SERIAL PRIMARY KEY,
    assessment_id INT REFERENCES assessments(id) ON DELETE CASCADE,
    validator_id INT REFERENCES users(id) ON DELETE SET NULL,
    validator_role VARCHAR(50) NOT NULL DEFAULT 'Dosen',
    status VARCHAR(50) DEFAULT 'Approved',
    feedback_notes TEXT,
    validated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indeks Performa untuk Kueri Skalabilitas Tinggi
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_assessments_user_id ON assessments(user_id);
CREATE INDEX IF NOT EXISTS idx_roadmaps_user_id ON user_roadmaps(user_id);
CREATE INDEX IF NOT EXISTS idx_documents_user_id ON uploaded_documents(user_id);
CREATE INDEX IF NOT EXISTS idx_validations_assessment_id ON counselor_validations(assessment_id);

-- Data Awal Pengujian Akun Standar (Seed Data)
INSERT INTO users (name, email, password, role, jenjang)
VALUES 
    ('Nadia A.', 'nadia@email.com', '$2b$12$K890VbNZZw8Y7r6R5g2b0.31eW4hFv6u7s5x9y8z0a1b2c3d4e5f6', 'Mahasiswa', 'Perguruan Tinggi (Mahasiswa)'),
    ('Ayu Lestari', 'ayu@smk.sch.id', '$2b$12$K890VbNZZw8Y7r6R5g2b0.31eW4hFv6u7s5x9y8z0a1b2c3d4e5f6', 'Pelajar', 'Pelajar SMA-SMK Sederajat'),
    ('Dr. Budi Santoso, M.Kom.', 'budi.dosen@univ.ac.id', '$2b$12$K890VbNZZw8Y7r6R5g2b0.31eW4hFv6u7s5x9y8z0a1b2c3d4e5f6', 'Dosen', 'Dosen Pembimbing'),
    ('Siti Rahayu, S.Pd., Kons.', 'siti.bk@smk.sch.id', '$2b$12$K890VbNZZw8Y7r6R5g2b0.31eW4hFv6u7s5x9y8z0a1b2c3d4e5f6', 'Guru BK', 'Guru BK'),
    ('System Administrator', 'admin@skillgap.ai', '$2b$12$K890VbNZZw8Y7r6R5g2b0.31eW4hFv6u7s5x9y8z0a1b2c3d4e5f6', 'Admin', 'Administrator Sistem')
ON CONFLICT (email) DO NOTHING;
