from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
import psycopg2
import bcrypt

app = FastAPI()

# Konfigurasi CORS agar Next.js (port 3000/3001) diizinkan mengirim data ke FastAPI (port 8000)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001", "http://127.0.0.1:3000", "http://127.0.0.1:3001"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ⚠️ PENTING: Ganti "password_anda" dengan password PostgreSQL di laptop Anda
# dan pastikan nama databasenya benar (misal: skillgap_db)
DATABASE_URL = "postgresql://postgres:12345678@localhost:5432/skillgap_db"

def get_db_connection():
    return psycopg2.connect(DATABASE_URL)

# Skema Data (Payload) yang dikirim dari form Register
class RegisterUser(BaseModel):
    name: str
    email: str
    password: str
    role: str
    jenjang: str
    birthDate: Optional[str] = None
    age: Optional[int] = None
    parentalConsent: Optional[bool] = False

# Skema Data (Payload) yang dikirim dari form Login
class LoginUser(BaseModel):
    email: str
    password: str

# ==========================================
# ENDPOINT REGISTER
# ==========================================
@app.post("/api/register")
def register_user(user: RegisterUser):
    conn = get_db_connection()
    cursor = conn.cursor()

    try:
        # 1. Cek apakah email sudah terdaftar di database
        cursor.execute("SELECT id FROM users WHERE email = %s", (user.email,))
        if cursor.fetchone():
            raise HTTPException(status_code=400, detail="Email sudah terdaftar")

        # 2. Hash Password agar aman di database
        hashed_password = bcrypt.hashpw(user.password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

        # 3. Simpan data ke tabel users di PostgreSQL
        insert_query = """
            INSERT INTO users (name, email, password, role, jenjang, birth_date, age, parental_consent)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s) RETURNING id, name, email
        """
        cursor.execute(insert_query, (
            user.name, 
            user.email, 
            hashed_password, 
            user.role, 
            user.jenjang, 
            user.birthDate, 
            user.age, 
            user.parentalConsent
        ))
        
        new_user = cursor.fetchone()
        conn.commit()

        # 4. Beri respon sukses ke Next.js
        return {
            "message": "Registrasi berhasil", 
            "user": {"id": new_user[0], "name": new_user[1], "email": new_user[2]}
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
        cursor.execute("SELECT id, name, email, password, role, jenjang FROM users WHERE email = %s", (user.email,))
        db_user = cursor.fetchone()

        # 2. Jika email tidak ditemukan
        if not db_user:
            raise HTTPException(status_code=400, detail="Email atau password salah")

        # 3. Jika email ada, cocokkan passwordnya
        stored_password = db_user[3] # Index 3 adalah kolom password (hasil hash)
        
        # bcrypt.checkpw mencocokkan password ketikan user dengan password acak di database
        if not bcrypt.checkpw(user.password.encode('utf-8'), stored_password.encode('utf-8')):
            raise HTTPException(status_code=400, detail="Email atau password salah")

        # 4. Jika sukses, kembalikan data user
        return {
            "message": "Login berhasil",
            "user": {
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
class AssessmentInput(BaseModel):
    user_id: int
    target_career: str
    match_score: int
    skill_gap: int
    student_goal: Optional[str] = None
    report_grades: Optional[dict] = None
    primary_skills: Optional[list] = None
    full_report: Optional[dict] = None

@app.post("/api/assessments")
def create_assessment(data: AssessmentInput):
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        import json
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
            SELECT id, target_career, match_score, skill_gap, student_goal, submitted_at 
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
                    "submitted_at": str(r[5])
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
# ENDPOINT UPLOAD DOKUMEN / CV
# ==========================================
class DocumentInput(BaseModel):
    user_id: int
    file_name: str
    file_type: str
    file_size: Optional[int] = 0
    file_url: Optional[str] = None
    extracted_skills: Optional[str] = None

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

# ==========================================
# ENDPOINT PROGRES ROADMAP BELAJAR
# ==========================================
class RoadmapProgressInput(BaseModel):
    user_id: int
    progress_percentage: int
    current_phase: Optional[str] = "Phase 1"
    status: Optional[str] = "In Progress"
    tasks_data: Optional[dict] = None

@app.post("/api/roadmaps/progress")
def update_roadmap_progress(data: RoadmapProgressInput):
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        import json
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