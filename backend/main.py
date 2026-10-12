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
    allow_origins=["http://localhost:3001"], # URL Next.js Anda
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