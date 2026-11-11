import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyJWT, type JWTPayload } from './app/lib/jwt';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isProtectedRoute =
    pathname.startsWith('/dashboard') ||
    pathname.startsWith('/assessment') ||
    pathname.startsWith('/list');
  const isAdminRoute = pathname.startsWith('/admin');
  const isLecturerRoute = pathname.startsWith('/lecturer');
  const isCounselorRoute = pathname.startsWith('/counselor');

  // Hanya periksa rute terproteksi
  if (!isProtectedRoute && !isAdminRoute && !isLecturerRoute && !isCounselorRoute) {
    return NextResponse.next();
  }

  const sessionCookie = request.cookies.get('session')?.value;
  const authHeader = request.headers.get('authorization');
  const token = (authHeader && authHeader.toLowerCase().startsWith('bearer '))
    ? authHeader.slice(7).trim()
    : sessionCookie;

  if (!token) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Verifikasi tanda tangan kriptografis JWT (HMAC-SHA256)
  // Tidak menerima token mentah/cookie tidak bertanda tangan (FR-01, NFR-01)
  const userPayload: JWTPayload | null = await verifyJWT(token);

  if (!userPayload) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('error', 'session_expired');
    loginUrl.searchParams.set('redirect', pathname);
    const response = NextResponse.redirect(loginUrl);
    response.cookies.delete('session');
    response.cookies.delete('session-role');
    return response;
  }

  // Peran diambil HANYA dari payload JWT yang telah terverifikasi secara kriptografis
  const role = userPayload.role;

  // RBAC Server-Side Enforcement (FR-01, NFR-01)
  if (isAdminRoute && role !== 'Admin') {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  if (isLecturerRoute && role !== 'Dosen' && role !== 'Admin') {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  if (isCounselorRoute && role !== 'Guru BK' && role !== 'Admin') {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // Teruskan request dengan header data user yang sudah diverifikasi
  const response = NextResponse.next();
  response.headers.set('x-user-role', role);
  response.headers.set('x-user-email', userPayload.email);
  return response;
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/assessment/:path*',
    '/list/:path*',
    '/admin/:path*',
    '/lecturer/:path*',
    '/counselor/:path*',
  ],
};
