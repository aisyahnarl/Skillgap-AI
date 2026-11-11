import { NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import { z } from 'zod';
import { query } from '../../lib/db';
import { signJWT } from '../../lib/jwt';
import { authService, type UserProfile } from '../../services/auth-service';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = loginSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ success: false, message: 'Format email atau password tidak valid.' }, { status: 400 });
    }

    const { email, password } = parsed.data;
    let authenticatedUser: UserProfile & { id?: number | string } | null = null;

    // 1. Coba verifikasi via basis data PostgreSQL
    const dbResult = await query(
      'SELECT id, name, email, password, role, jenjang FROM users WHERE email = $1',
      [email.toLowerCase()]
    );

    if (dbResult && dbResult.rows.length > 0) {
      const row = dbResult.rows[0];
      const match = await bcrypt.compare(password, row.password);
      if (match) {
        authenticatedUser = {
          id: row.id,
          name: row.name,
          email: row.email,
          role: row.role,
          jenjang: row.jenjang,
        };
      }
    }

    // 2. Fallback ke authService jika DB offline atau belum dimigrasikan
    if (!authenticatedUser) {
      const localUser = authService.login(email, password);
      if (localUser) {
        authenticatedUser = localUser;
      }
    }

    if (!authenticatedUser) {
      return NextResponse.json(
        { success: false, message: 'Email atau password salah.' },
        { status: 401 }
      );
    }

    // 3. Terbitkan Signed JWT Token (HMAC-SHA256) sesuai FR-01 & NFR-01
    const token = await signJWT({
      id: authenticatedUser.id,
      email: authenticatedUser.email,
      name: authenticatedUser.name,
      role: authenticatedUser.role,
      jenjang: authenticatedUser.jenjang,
    });

    const isSecure = process.env.NODE_ENV === 'production';
    const response = NextResponse.json({
      success: true,
      message: 'Login berhasil.',
      token,
      user: {
        id: authenticatedUser.id,
        name: authenticatedUser.name,
        email: authenticatedUser.email,
        role: authenticatedUser.role,
        jenjang: authenticatedUser.jenjang,
      },
    });

    // Pasang signed cookie HTTP
    response.cookies.set('session', token, {
      path: '/',
      httpOnly: false, // Memungkinkan client reading bila diperlukan
      secure: isSecure,
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60,
    });

    response.cookies.set('session-role', encodeURIComponent(authenticatedUser.role), {
      path: '/',
      secure: isSecure,
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60,
    });

    return response;
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    console.error('[API Login Error]:', errorMsg);
    return NextResponse.json(
      { success: false, message: 'Terjadi kesalahan internal server saat login.' },
      { status: 500 }
    );
  }
}
