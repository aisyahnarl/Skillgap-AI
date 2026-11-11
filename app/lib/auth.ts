import { verifyJWT, signJWT, decodeJWTPayload, getJwtSecret, type JWTPayload } from './jwt';

export { verifyJWT, signJWT, decodeJWTPayload, getJwtSecret };
export type { JWTPayload };

/**
 * Ekstraksi token sesi dari request headers (Cookie 'session' atau 'Authorization: Bearer <token>')
 */
export function extractTokenFromRequest(request: Request): string | null {
  // 1. Cek Authorization Header
  const authHeader = request.headers.get('authorization');
  if (authHeader && authHeader.toLowerCase().startsWith('bearer ')) {
    return authHeader.slice(7).trim();
  }

  // 2. Cek Cookie 'session'
  const cookieHeader = request.headers.get('cookie') ?? '';
  const match = cookieHeader.match(/(?:^|;\s*)session=([^;]+)/);
  if (match && match[1]) {
    return decodeURIComponent(match[1]);
  }

  return null;
}

/**
 * Verifikasi sesi asinkron menggunakan tanda tangan JWT kriptografis (HMAC-SHA256).
 * Memenuhi spesifikasi FR-01 dan NFR-01 (RBAC di server tanpa dapat dipalsukan).
 */
export async function getVerifiedUser(request: Request): Promise<JWTPayload | null> {
  const token = extractTokenFromRequest(request);
  if (!token) return null;

  // Verifikasi tanda tangan kriptografis token JWT
  const verified = await verifyJWT(token);
  if (verified) return verified;

  // Dukungan sesi transisi testing/dev
  if (token === 'valid' && process.env.NODE_ENV !== 'production') {
    const cookieHeader = request.headers.get('cookie') ?? '';
    const roleMatch = cookieHeader.match(/(?:^|;\s*)session-role=([^;]+)/);
    const role = (roleMatch && roleMatch[1] ? decodeURIComponent(roleMatch[1]) : 'Mahasiswa') as JWTPayload['role'];
    return {
      email: 'demo@skillgap.ai',
      name: 'Demo User',
      role,
      jenjang: 'Mahasiswa',
    };
  }

  return null;
}

/**
 * Memeriksa apakah request memiliki sesi yang valid (JWT bertanda tangan atau token testing).
 */
export function hasSession(request: Request): boolean {
  const token = extractTokenFromRequest(request);
  if (!token) return false;

  // Sesi testing development
  if (token === 'valid' && process.env.NODE_ENV !== 'production') {
    return true;
  }

  // Cek struktur JWT 3 segmen
  const parts = token.split('.');
  if (parts.length === 3) {
    const payload = decodeJWTPayload(token);
    if (!payload) return false;
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) return false;
    return true;
  }
  return false;
}

/**
 * Memeriksa apakah request memiliki otorisasi Admin di server berdasarkan token JWT atau sesi testing.
 */
export function hasAdminSession(request: Request): boolean {
  const token = extractTokenFromRequest(request);
  if (!token) return false;

  if (token === 'valid' && process.env.NODE_ENV !== 'production') {
    const cookieHeader = request.headers.get('cookie') ?? '';
    return decodeURIComponent(cookieHeader).includes('session-role=Admin');
  }

  const payload = decodeJWTPayload(token);
  if (!payload) return false;
  if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) return false;
  return payload.role === 'Admin';
}
