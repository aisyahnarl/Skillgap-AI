from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
import psycopg2
import bcrypt
import os
import json

app = FastAPI(
    title="SkillGap.AI Core Backend API",
    description="Layanan RESTful API Terintegrasi untuk Autentikasi, Asesmen Skill Gap, Dokumen, dan Roadmap Belajar",
    version="1.0.0",
)

# Konfigurasi CORS agar Next.js (port 3000/3001) & antarmuka Mobile diizinkan mengirim data ke FastAPI (port 8000)
cors_origins_env = os.environ.get("CORS_ORIGINS", "")
allowed_origins = [
    "http://localhost:3000",
    "http://localhost:3001",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:3001",
]
if cors_origins_env:
    allowed_origins.extend([orig.strip() for orig in cors_origins_env.split(",") if orig.strip()])

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins if allowed_origins else ["*"],
    allow_origin_regex=r"https?://.*" if not cors_origins_env else None,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Konfigurasi Database URL (Mendukung environment variable atau default lokal)
DATABASE_URL = os.environ.get(
    "DATABASE_URL",
    "postgresql://postgres:12345678@localhost:5432/skillgap_db"
)

def get_db_connection():
    try:
        return psycopg2.connect(DATABASE_URL)
    except psycopg2.OperationalError as e:
        raise HTTPException(
            status_code=503,
            detail=f"Koneksi PostgreSQL gagal. Pastikan PostgreSQL berjalan dan database 'skillgap_db' tersedia. Error: {str(e)}"
        )


# ==========================================
# INISIALISASI OTOMATIS BASIS DATA (STARTUP)
# ==========================================
@app.on_event("startup")
def init_db():
    """Membuat 5 tabel relasional secara otomatis jika belum ada di database."""
    try:
        conn = psycopg2.connect(DATABASE_URL)
        cursor = conn.cursor()

        # 1. Tabel Users
        cursor.execute("""
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
        """)

        # 2. Tabel Assessments
        cursor.execute("""
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
                validation_status VARCHAR(50) DEFAULT 'review',
                submitted_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );
        """)

        # 3. Tabel Uploaded Documents
        cursor.execute("""
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
        """)

        # 4. Tabel User Roadmaps
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS user_roadmaps (
                id SERIAL PRIMARY KEY,
                user_id INT REFERENCES users(id) ON DELETE CASCADE,
                progress_percentage INT DEFAULT 0,
                current_phase VARCHAR(100) DEFAULT 'Phase 1',
                status VARCHAR(50) DEFAULT 'In Progress',
                tasks_data JSONB,
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );
        """)

        # 5. Tabel Counselor Validations
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS counselor_validations (
                id SERIAL PRIMARY KEY,
                assessment_id INT REFERENCES assessments(id) ON DELETE CASCADE,
                validator_id INT REFERENCES users(id) ON DELETE SET NULL,
                validator_role VARCHAR(50) NOT NULL DEFAULT 'Dosen',
                status VARCHAR(50) DEFAULT 'Approved',
                feedback_notes TEXT,
                validated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );
        """)

        conn.commit()
        cursor.close()
        conn.close()
        print("[SkillGap.AI] Inisialisasi basis data PostgreSQL berhasil (5 tabel aktif).")
    except Exception as e:
        print(f"[SkillGap.AI] Catatan: PostgreSQL belum aktif atau credentials berbeda ({e}). Mode fallback siap.")


# ==========================================
# ENDPOINT STATUS & HEALTHCHECK
# ==========================================
@app.get("/")
def read_root():
    return {
        "app": "SkillGap.AI Backend Service",
        "status": "Online",
        "docs_url": "/docs",
        "redoc_url": "/redoc",
        "database": "PostgreSQL 17 (skillgap_db)",
        "features": [
            "Bcrypt Auth (/api/register, /api/login)",
            "Assessment Skill Gap (/api/assessments)",
            "Document CV Management (/api/documents)",
            "Learning Roadmap Progress (/api/roadmaps)",
            "Counselor Validation (/api/validations)"
        ]
    }


# ==========================================
# SKEMA DATA (PYDANTIC SCHEMAS)
# ==========================================
class RegisterUser(BaseModel):
    name: str
    email: str
    password: str
    role: str
    jenjang: str
    birthDate: Optional[str] = None
    age: Optional[int] = None
    parentalConsent: Optional[bool] = False

class LoginUser(BaseModel):
    email: str
    password: str

class AssessmentInput(BaseModel):
    user_id: int
    target_career: str
    match_score: int
    skill_gap: int
    student_goal: Optional[str] = None
    report_grades: Optional[dict] = None
    primary_skills: Optional[list] = None
    full_report: Optional[dict] = None

class DocumentInput(BaseModel):
    user_id: int
    file_name: str
    file_type: str
    file_size: Optional[int] = 0
    file_url: Optional[str] = None
    extracted_skills: Optional[str] = None

class RoadmapProgressInput(BaseModel):
    user_id: int
    progress_percentage: int
    current_phase: Optional[str] = "Phase 1"
    status: Optional[str] = "In Progress"
    tasks_data: Optional[dict] = None

class ValidationInput(BaseModel):
    assessment_id: int
    validator_id: Optional[int] = None
    validator_role: str = "Dosen"
    status: Optional[str] = "Approved"
    feedback_notes: Optional[str] = None


# ==========================================
# ENDPOINT REGISTER
# ==========================================
@app.post("/api/register")
def register_user(user: RegisterUser):
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        # 1. Cek apakah email sudah terdaftar
        cursor.execute("SELECT id FROM users WHERE email = %s", (user.email.lower(),))
        if cursor.fetchone():
            raise HTTPException(status_code=400, detail="Email sudah terdaftar")

        # 2. Hash Password dengan bcrypt
        hashed_password = bcrypt.hashpw(user.password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

        # 3. Simpan data ke tabel users
        insert_query = """
            INSERT INTO users (name, email, password, role, jenjang, birth_date, age, parental_consent)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s) RETURNING id, name, email, role, jenjang
        """
        cursor.execute(insert_query, (
            user.name, 
            user.email.lower(), 
            hashed_password, 
            user.role, 
            user.jenjang, 
            user.birthDate, 
            user.age, 
            user.parentalConsent
        ))
        
        new_user = cursor.fetchone()
        conn.commit()

        return {
            "status": "success",
            "message": "Registrasi berhasil", 
            "user": {
                "id": new_user[0],
                "name": new_user[1],
                "email": new_user[2],
                "role": new_user[3],
                "jenjang": new_user[4]
            }
        }
    except HTTPException:
        raise
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        cursor.close()
        conn.close()


# ==========================================
# ENDPOINT LOGIN
# ==========================================
@app.post("/api/login")
def login_user(user: LoginUser):
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        # 1. Cari user di database berdasarkan email
        cursor.execute("SELECT id, name, email, password, role, jenjang FROM users WHERE email = %s", (user.email.lower(),))
        db_user = cursor.fetchone()

        if not db_user:
            raise HTTPException(status_code=400, detail="Email atau password salah")

        stored_password = db_user[3]
        if not bcrypt.checkpw(user.password.encode('utf-8'), stored_password.encode('utf-8')):
            raise HTTPException(status_code=400, detail="Email atau password salah")

        return {
            "status": "success",
            "message": "Login berhasil",
            "user": {
                "id": db_user[0],
                "name": db_user[1],
                "email": db_user[2],
                "role": db_user[4],
                "jenjang": db_user[5]
            }
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        cursor.close()
        conn.close()


# ==========================================
# ENDPOINT DASHBOARD
# ==========================================
@app.get("/api/dashboard")
def get_dashboard_data():
    return {
        "status": "success",
        "message": "Selamat datang! Ini adalah data real-time dari FastAPI.",
        "stats": {
            "total_courses": 5,
            "completed": 2
        }
    }


# ==========================================
# ENDPOINT ASSESSMENTS (Skill Gap & Minat)
# ==========================================
@app.post("/api/assessments")
def create_assessment(data: AssessmentInput):
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        query = """
            INSERT INTO assessments (user_id, target_career, match_score, skill_gap, student_goal, report_grades, primary_skills, full_report)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
            RETURNING id, target_career, match_score, skill_gap, submitted_at
        """
        cursor.execute(query, (
            data.user_id,
            data.target_career,
            data.match_score,
            data.skill_gap,
            data.student_goal,
            json.dumps(data.report_grades) if data.report_grades else None,
            json.dumps(data.primary_skills) if data.primary_skills else None,
            json.dumps(data.full_report) if data.full_report else None,
        ))
        res = cursor.fetchone()
        conn.commit()
        return {
            "status": "success",
            "message": "Hasil asesmen berhasil disimpan di PostgreSQL",
            "data": {
                "id": res[0],
                "target": res[1],
                "match_score": res[2],
                "skill_gap": res[3],
                "submitted_at": str(res[4])
            }
        }
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        cursor.close()
        conn.close()

@app.get("/api/assessments/user/{user_id}")
def get_user_assessments(user_id: int):
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("""
            SELECT id, target_career, match_score, skill_gap, student_goal, submitted_at, full_report 
            FROM assessments 
            WHERE user_id = %s 
            ORDER BY submitted_at DESC
        """, (user_id,))
        rows = cursor.fetchall()
        return {
            "status": "success",
            "total": len(rows),
            "data": [
                {
                    "id": r[0],
                    "target_career": r[1],
                    "match_score": r[2],
                    "skill_gap": r[3],
                    "student_goal": r[4],
                    "submitted_at": str(r[5]),
                    "full_report": r[6]
                }
                for r in rows
            ]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        cursor.close()
        conn.close()


# ==========================================
# ENDPOINT DOKUMEN & CV
# ==========================================
@app.post("/api/documents")
def save_uploaded_document(doc: DocumentInput):
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        query = """
            INSERT INTO uploaded_documents (user_id, file_name, file_type, file_size, file_url, extracted_skills)
            VALUES (%s, %s, %s, %s, %s, %s)
            RETURNING id, file_name, file_type, uploaded_at
        """
        cursor.execute(query, (
            doc.user_id,
            doc.file_name,
            doc.file_type,
            doc.file_size,
            doc.file_url,
            doc.extracted_skills
        ))
        res = cursor.fetchone()
        conn.commit()
        return {
            "status": "success",
            "message": "Dokumen/CV berhasil dicatat di database",
            "data": {"id": res[0], "file_name": res[1], "file_type": res[2], "uploaded_at": str(res[3])}
        }
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        cursor.close()
        conn.close()

@app.get("/api/documents/user/{user_id}")
def get_user_documents(user_id: int):
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("""
            SELECT id, file_name, file_type, file_size, file_url, extracted_skills, uploaded_at 
            FROM uploaded_documents 
            WHERE user_id = %s 
            ORDER BY uploaded_at DESC
        """, (user_id,))
        rows = cursor.fetchall()
        return {
            "status": "success",
            "total": len(rows),
            "data": [
                {
                    "id": r[0],
                    "file_name": r[1],
                    "file_type": r[2],
                    "file_size": r[3],
                    "file_url": r[4],
                    "extracted_skills": r[5],
                    "uploaded_at": str(r[6])
                }
                for r in rows
            ]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        cursor.close()
        conn.close()


# ==========================================
# ENDPOINT ROADMAP BELAJAR
# ==========================================
@app.post("/api/roadmaps/progress")
def update_roadmap_progress(data: RoadmapProgressInput):
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        query = """
            INSERT INTO user_roadmaps (user_id, progress_percentage, current_phase, status, tasks_data, updated_at)
            VALUES (%s, %s, %s, %s, %s, CURRENT_TIMESTAMP)
            RETURNING id, progress_percentage, status
        """
        cursor.execute(query, (
            data.user_id,
            data.progress_percentage,
            data.current_phase,
            data.status,
            json.dumps(data.tasks_data) if data.tasks_data else None
        ))
        res = cursor.fetchone()
        conn.commit()
        return {
            "status": "success",
            "message": "Progres roadmap belajar berhasil diperbarui",
            "data": {"id": res[0], "progress": res[1], "status": res[2]}
        }
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        cursor.close()
        conn.close()

@app.get("/api/roadmaps/user/{user_id}")
def get_user_roadmap(user_id: int):
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("""
            SELECT id, progress_percentage, current_phase, status, tasks_data, updated_at 
            FROM user_roadmaps 
            WHERE user_id = %s 
            ORDER BY updated_at DESC LIMIT 1
        """, (user_id,))
        row = cursor.fetchone()
        if not row:
            return {"status": "success", "data": None}
        return {
            "status": "success",
            "data": {
                "id": row[0],
                "progress_percentage": row[1],
                "current_phase": row[2],
                "status": row[3],
                "tasks_data": row[4],
                "updated_at": str(row[5])
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        cursor.close()
        conn.close()


# ==========================================
# ENDPOINT VALIDASI PEMBIMBING (DOSEN & GURU BK)
# ==========================================
@app.post("/api/validations")
def create_counselor_validation(val: ValidationInput):
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        query = """
            INSERT INTO counselor_validations (assessment_id, validator_id, validator_role, status, feedback_notes, validated_at)
            VALUES (%s, %s, %s, %s, %s, CURRENT_TIMESTAMP)
            RETURNING id, assessment_id, status, validated_at
        """
        cursor.execute(query, (
            val.assessment_id,
            val.validator_id,
            val.validator_role,
            val.status,
            val.feedback_notes
        ))
        res = cursor.fetchone()
        conn.commit()
        return {
            "status": "success",
            "message": "Catatan bimbingan dan validasi berhasil disimpan",
            "data": {
                "id": res[0],
                "assessment_id": res[1],
                "status": res[2],
                "validated_at": str(res[3])
            }
        }
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        cursor.close()
        conn.close()

@app.get("/api/validations/assessment/{assessment_id}")
def get_assessment_validations(assessment_id: int):
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("""
            SELECT cv.id, cv.assessment_id, cv.validator_id, u.name as validator_name, 
                   cv.validator_role, cv.status, cv.feedback_notes, cv.validated_at 
            FROM counselor_validations cv
            LEFT JOIN users u ON cv.validator_id = u.id
            WHERE cv.assessment_id = %s 
            ORDER BY cv.validated_at DESC
        """, (assessment_id,))
        rows = cursor.fetchall()
        return {
            "status": "success",
            "total": len(rows),
            "data": [
                {
                    "id": r[0],
                    "assessment_id": r[1],
                    "validator_id": r[2],
                    "validator_name": r[3] or "Pembimbing Akademik",
                    "validator_role": r[4],
                    "status": r[5],
                    "feedback_notes": r[6],
                    "validated_at": str(r[7])
                }
                for r in rows
            ]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        cursor.close()
        conn.close()
