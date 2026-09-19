import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isDashboardRoute = pathname.startsWith('/dashboard');
  const isProtectedRoute = pathname.startsWith('/dashboard') || pathname.startsWith('/assessment') || pathname.startsWith('/list');
  const isAdminRoute = pathname.startsWith('/admin');
  const isLecturerRoute = pathname.startsWith('/lecturer');
  const isCounselorRoute = pathname.startsWith('/counselor');

  const sessionCookie = request.cookies.get('session')?.value;
  const roleCookie = request.cookies.get('session-role')?.value;

  if ((isProtectedRoute || isAdminRoute || isLecturerRoute || isCounselorRoute) && sessionCookie !== 'valid') {
    const loginUrl = new URL('/login', request.url);
    return NextResponse.redirect(loginUrl);
  }

  const decodedRole = roleCookie ? decodeURIComponent(roleCookie) : '';

  if (isAdminRoute && decodedRole !== 'Admin') {
    const dashboardUrl = new URL('/dashboard', request.url);
    return NextResponse.redirect(dashboardUrl);
  }

  if (isLecturerRoute && decodedRole !== 'Dosen' && decodedRole !== 'Admin') {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  if (isCounselorRoute && decodedRole !== 'Guru BK' && decodedRole !== 'Admin') {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  if (isDashboardRoute && sessionCookie && sessionCookie !== 'valid') {
    const loginUrl = new URL('/login', request.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/assessment/:path*', '/list/:path*', '/admin/:path*', '/lecturer/:path*', '/counselor/:path*'],
};
