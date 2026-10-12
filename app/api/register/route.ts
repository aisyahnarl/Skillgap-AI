import { NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import { Pool } from 'pg';

// Membuat koneksi ke database PostgreSQL
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // Tambahkan baris di bawah ini jika menggunakan database online (seperti Supabase/Neon) yang butuh SSL
  // ssl: { rejectUnauthorized: false } 
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, password, role, jenjang, birthDate, age, parentalConsent } = body;

    // 1. Validasi sederhana di sisi server
    if (!name || !email || !password) {
      return NextResponse.json({ error: 'Nama, email, dan password wajib diisi' }, { status: 400 });
    }

    // 2. Cek apakah email sudah terdaftar di database
    const checkUserQuery = 'SELECT * FROM users WHERE email = $1';
    const existingUser = await pool.query(checkUserQuery, [email]);
    
    if (existingUser.rows.length > 0) {
      return NextResponse.json({ error: 'Email sudah terdaftar' }, { status: 400 });
    }

    // 3. Enkripsi (Hash) Password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // 4. Simpan data ke database
    // Sesuaikan nama tabel 'users' dan kolom-kolomnya dengan struktur database Anda
    const insertQuery = `
      INSERT INTO users (name, email, password, role, jenjang, birth_date, age, parental_consent)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING id, name, email
    `;
    
    const values = [
      name, 
      email, 
      hashedPassword, 
      role, 
      jenjang, 
      birthDate ? birthDate : null, 
      age ? age : null, 
      parentalConsent ? parentalConsent : false
    ];

    const result = await pool.query(insertQuery, values);
    const newUser = result.rows[0];

    // 5. Kembalikan respon sukses
    return NextResponse.json({ 
      message: 'Registrasi berhasil',
      user: newUser
    }, { status: 201 });

  } catch (error: any) {
    console.error('Error saat registrasi:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan internal server' }, 
      { status: 500 }
    );
  }
}