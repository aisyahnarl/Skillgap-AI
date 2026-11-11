-- ==============================================================================
-- SKILLGAP.AI — POSTGRESQL 17 PRODUCTION DATABASE SCHEMA (skillgap_db)
-- Arsitektur Basis Data Relasional Terintegrasi:
-- 1. users                  : Data akun & kredensial berhashing bcrypt
-- 2. user_profiles          : Data profil akademik & portofolio pengguna
-- 3. assessments            : Data hasil asesmen skill gap & evaluasi rapor
-- 4. uploaded_documents     : Metadata & penyimpanan berkas CV/portofolio (PDF/DOCX)
-- 5. user_roadmaps          : Pelacakan progres personal learning roadmap
-- 6. counselor_validations  : Validasi & catatan bimbingan Dosen / Guru BK
-- 7. competencies           : Master katalog standar kompetensi industri & SKKNI
-- 8. sus_evaluations        : Rekam jejak pengujian usability SUS (Brooke 1996)
-- ==============================================================================

-- 1. Tabel Users (Multi-Role: Mahasiswa, Pelajar, Dosen, Guru BK, Admin)
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'Mahasiswa', -- Admin, Mahasiswa, Pelajar, Dosen, Guru BK
    jenjang VARCHAR(100) NOT NULL DEFAULT 'Mahasiswa',
    birth_date DATE,
    age INT,
    parental_consent BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Tabel User Profiles (Detail Profil Akademik & Portofolio)
CREATE TABLE IF NOT EXISTS user_profiles (
    id SERIAL PRIMARY KEY,
    user_id INT UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    school_or_univ VARCHAR(255),
    major VARCHAR(255),
    current_grade_or_semester VARCHAR(50),
    career_aspiration VARCHAR(255),
    bio TEXT,
    portfolio_url TEXT,
    linkedin_url TEXT,
    github_url TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Tabel Assessments (Hasil Diagnosis Gap, Minat, dan Rapor Pelajar)
CREATE TABLE IF NOT EXISTS assessments (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    target_career VARCHAR(255) NOT NULL,
    match_score INT NOT NULL,
    skill_gap INT NOT NULL,
    student_goal VARCHAR(100), -- 'kuliah' atau 'kerja' untuk pelajar
    school VARCHAR(255),
    major VARCHAR(255),
    report_grades JSONB, -- Nilai rapor mapel sekolah { "Matematika": 88, ... }
    primary_skills JSONB, -- Skill yang dipilih oleh pengguna
    skill_levels JSONB, -- Tingkat kemahiran per skill
    questionnaire JSONB, -- Respons kuesioner kesiapan belajar skala Likert 1-5
    full_report JSONB, -- Laporan lengkap hasil pemetaan AI & sertifikasi
    validation_status VARCHAR(50) DEFAULT 'review', -- 'valid', 'review', 'pending'
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Tabel Uploaded Documents (Log & Penyimpanan Berkas CV / Portofolio)
CREATE TABLE IF NOT EXISTS uploaded_documents (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    file_name VARCHAR(255) NOT NULL,
    file_hash VARCHAR(64), -- SHA-256 hash untuk deteksi berkas dan caching per-hash
    file_path TEXT NOT NULL, -- Lokasi file fisik di storage server / blob / public/uploads/cv/
    file_url TEXT NOT NULL, -- URL akses dokumen
    file_type VARCHAR(50) NOT NULL, -- 'pdf', 'docx', 'doc', 'txt'
    file_size INT DEFAULT 0, -- Ukuran berkas dalam byte
    extracted_text TEXT, -- Teks/ringkasan hasil ekstraksi LLM / parser
    extracted_skills JSONB, -- Daftar skill yang diidentifikasi oleh LLM / NLP engine
    cosine_similarity NUMERIC(6, 4), -- Skor kemiripan vektor terhadap target career
    match_score INT DEFAULT 0, -- Skor kesesuaian terkalibrasi 0-100
    extraction_source VARCHAR(50) DEFAULT 'llm', -- 'llm' atau 'rule_based_fallback'
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. Tabel User Roadmaps (Pelacakan Progres Belajar Personal)
CREATE TABLE IF NOT EXISTS user_roadmaps (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    assessment_id INT REFERENCES assessments(id) ON DELETE SET NULL,
    progress_percentage INT DEFAULT 0,
    current_phase VARCHAR(100) DEFAULT 'PHASE 1',
    status VARCHAR(50) DEFAULT 'In Progress', -- 'In Progress', 'Completed', 'On Hold'
    tasks_data JSONB, -- Task checklist per fase
    phases_data JSONB, -- Deskripsi lengkap tiap fase pembelajaran
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. Tabel Counselor Validations (Validasi & Catatan Bimbingan Dosen / Guru BK)
CREATE TABLE IF NOT EXISTS counselor_validations (
    id SERIAL PRIMARY KEY,
    assessment_id INT REFERENCES assessments(id) ON DELETE CASCADE,
    validator_id INT REFERENCES users(id) ON DELETE SET NULL,
    validator_name VARCHAR(255),
    validator_role VARCHAR(50) NOT NULL DEFAULT 'Dosen', -- 'Dosen' atau 'Guru BK'
    status VARCHAR(50) DEFAULT 'Approved', -- 'Approved', 'Needs Revision', 'Pending'
    feedback_notes TEXT,
    recommendation_notes TEXT,
    validated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. Tabel Master Kompetensi Industri (Katalog Kompetensi & Standar SKKNI)
CREATE TABLE IF NOT EXISTS competencies (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    demand_weight INT NOT NULL DEFAULT 80,
    target_level VARCHAR(50) NOT NULL DEFAULT 'Menengah',
    roles JSONB NOT NULL,
    certifications JSONB NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 8. Tabel Usability SUS Evaluations (Evaluasi Skala Usabilitas Sistem)
CREATE TABLE IF NOT EXISTS sus_evaluations (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE SET NULL,
    user_name VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL,
    scores JSONB NOT NULL, -- Nilai 10 item kuesioner SUS
    calculated_score NUMERIC(5, 2) NOT NULL, -- Skor SUS 0 - 100
    grade VARCHAR(50) NOT NULL, -- 'Excellent', 'Good', 'Marginal'
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ==============================================================================
-- INDEKS PERFORMA & OPTIMASI KUERI (NFR-02 & NFR-07)
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_assessments_user_id ON assessments(user_id);
CREATE INDEX IF NOT EXISTS idx_assessments_submitted_at ON assessments(submitted_at DESC);
CREATE INDEX IF NOT EXISTS idx_documents_user_id ON uploaded_documents(user_id);
CREATE INDEX IF NOT EXISTS idx_documents_file_hash ON uploaded_documents(file_hash);
CREATE INDEX IF NOT EXISTS idx_roadmaps_user_id ON user_roadmaps(user_id);
CREATE INDEX IF NOT EXISTS idx_validations_assessment_id ON counselor_validations(assessment_id);
CREATE INDEX IF NOT EXISTS idx_sus_user_id ON sus_evaluations(user_id);

-- ==============================================================================
-- DATA AWAL PENGUJIAN AKUN STANDAR (SEED DATA)
-- Password default: 'password123' untuk user, 'admin123' untuk admin (Bcrypt salt rounds 10)
-- ==============================================================================
INSERT INTO users (name, email, password, role, jenjang)
VALUES 
    ('Admin SkillGap', 'admin@skillgap.ai', '$2a$10$7jS8.8h1k2vYd/0K7QoV..XoKj9i3k5rJ6wVqO4qYf1.t0Ym2gR2K', 'Admin', 'Administrator'),
    ('Nadia A.', 'nadia@email.com', '$2a$10$7jS8.8h1k2vYd/0K7QoV..XoKj9i3k5rJ6wVqO4qYf1.t0Ym2gR2K', 'Mahasiswa', 'Mahasiswa'),
    ('Fajar Pratama', 'fajar@pelajar.id', '$2a$10$7jS8.8h1k2vYd/0K7QoV..XoKj9i3k5rJ6wVqO4qYf1.t0Ym2gR2K', 'Pelajar', 'Pelajar SMA-SMK Sederajat'),
    ('Dr. Hendra Wijaya, M.Kom', 'hendra@univ.ac.id', '$2a$10$7jS8.8h1k2vYd/0K7QoV..XoKj9i3k5rJ6wVqO4qYf1.t0Ym2gR2K', 'Dosen', 'Dosen Pembimbing'),
    ('Siti Rahmawati, S.Pd', 'siti.bk@sekolah.sch.id', '$2a$10$7jS8.8h1k2vYd/0K7QoV..XoKj9i3k5rJ6wVqO4qYf1.t0Ym2gR2K', 'Guru BK', 'Guru BK')
ON CONFLICT (email) DO UPDATE SET
    name = EXCLUDED.name,
    role = EXCLUDED.role,
    jenjang = EXCLUDED.jenjang;
