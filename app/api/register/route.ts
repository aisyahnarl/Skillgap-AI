import { NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import { z } from 'zod';
import { query } from '../../lib/db';
import { signJWT } from '../../lib/jwt';
import { authService, type UserProfile, type UserRole } from '../../services/auth-service';

const registerSchema = z.object({
  name: z.string().min(2, 'Nama minimal 2 karakter'),
  email: z.string().email('Format email tidak valid'),
  password: z.string().min(8, 'Password minimal 8 karakter'),
  role: z.enum(['Admin', 'Mahasiswa', 'Pelajar', 'Dosen', 'Guru BK']),
  jenjang: z.string().min(1),
  birthDate: z.string().optional().nullable(),
  age: z.number().optional().nullable(),
  parentalConsent: z.boolean().optional().default(false),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = registerSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, message: parsed.error.issues[0]?.message ?? 'Data registrasi tidak valid' },
        { status: 400 }
      );
    }

    const { name, email, password, role, jenjang, birthDate, age, parentalConsent } = parsed.data;

    // 1. Cek duplikasi email di PostgreSQL
    const checkResult = await query('SELECT id FROM users WHERE email = $1', [email.toLowerCase()]);
    if (checkResult && checkResult.rows.length > 0) {
      return NextResponse.json({ success: false, message: 'Email sudah terdaftar di sistem' }, { status: 400 });
    }

    // 2. Hash Password dengan Bcrypt
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    let createdUser: UserProfile & { id?: number | string } = {
      name,
      email: email.toLowerCase(),
      role: role as UserRole,
      jenjang,
      birthDate: birthDate ?? undefined,
      age: age ?? undefined,
      parentalConsent,
    };

    // 3. Simpan ke database PostgreSQL jika koneksi aktif
    const insertResult = await query(
      `INSERT INTO users (name, email, password, role, jenjang, birth_date, age, parental_consent)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING id, name, email, role, jenjang`,
      [
        name,
        email.toLowerCase(),
        hashedPassword,
        role,
        jenjang,
        birthDate || null,
        age || null,
        parentalConsent || false,
      ]
    );

    if (insertResult && insertResult.rows.length > 0) {
      createdUser.id = insertResult.rows[0].id;
    } else {
      // Fallback ke penyimpanan memori lokal
      authService.createUser({
        ...createdUser,
        password,
      });
    }

    // 4. Terbitkan Signed JWT Token (HMAC-SHA256)
    const token = await signJWT({
      id: createdUser.id,
      email: createdUser.email,
      name: createdUser.name,
      role: createdUser.role,
      jenjang: createdUser.jenjang,
    });

    const isSecure = process.env.NODE_ENV === 'production';
    const response = NextResponse.json({
      success: true,
      message: 'Registrasi berhasil',
      token,
      user: {
        id: createdUser.id,
        name: createdUser.name,
        email: createdUser.email,
        role: createdUser.role,
        jenjang: createdUser.jenjang,
      },
    }, { status: 201 });

    // Set signed session cookies
    response.cookies.set('session', token, {
      path: '/',
      secure: isSecure,
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60,
    });

    response.cookies.set('session-role', encodeURIComponent(createdUser.role), {
      path: '/',
      secure: isSecure,
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60,
    });

    return response;
  } catch (error: any) {
    console.error('[API Register Error]:', error);
    return NextResponse.json(
      { success: false, message: 'Terjadi kesalahan server saat mendaftarkan akun.' },
      { status: 500 }
    );
  }
}
