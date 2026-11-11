/**
 * SkillGap.AI — Signed JWT (JSON Web Token) Implementation using Web Crypto API.
 * Kompatibel dengan Edge Runtime (middleware.ts), Node.js (API routes), dan browser.
 * Menggantikan cookie demo 'session=valid' dengan token bertanda tangan kriptografis HMAC-SHA256 (FR-01, NFR-01).
 */

export interface JWTPayload {
  id?: number | string;
  email: string;
  name: string;
  role: 'Admin' | 'Mahasiswa' | 'Pelajar' | 'Dosen' | 'Guru BK';
  jenjang?: string;
  iat?: number;
  exp?: number;
  [key: string]: unknown;
}

const DEFAULT_JWT_SECRET = process.env.JWT_SECRET || 'skillgap-jwt-hmac-sha256-production-secret-key-2026';
const DEFAULT_EXPIRATION = 7 * 24 * 60 * 60; // 7 hari dalam detik

function base64UrlEncode(str: string): string {
  const bytes = new TextEncoder().encode(str);
  return bytesToBase64Url(bytes);
}

function bytesToBase64Url(bytes: Uint8Array): string {
  let binary = '';
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]!);
  }
  const base64 = typeof btoa !== 'undefined' ? btoa(binary) : Buffer.from(binary, 'binary').toString('base64');
  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function base64UrlDecode(base64Url: string): string {
  let base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
  while (base64.length % 4) {
    base64 += '=';
  }
  const binary = typeof atob !== 'undefined' ? atob(base64) : Buffer.from(base64, 'base64').toString('binary');
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return new TextDecoder().decode(bytes);
}

function base64UrlToBytes(base64Url: string): Uint8Array {
  let base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
  while (base64.length % 4) {
    base64 += '=';
  }
  const binary = typeof atob !== 'undefined' ? atob(base64) : Buffer.from(base64, 'base64').toString('binary');
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

async function getCryptoKey(secret: string, usage: 'sign' | 'verify'): Promise<CryptoKey> {
  const enc = new TextEncoder();
  return await crypto.subtle.importKey(
    'raw',
    enc.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    [usage]
  );
}

/**
 * Membuat token JWT bertanda tangan HMAC-SHA256
 */
export async function signJWT(
  payload: JWTPayload,
  secret: string = DEFAULT_JWT_SECRET,
  expiresInSeconds: number = DEFAULT_EXPIRATION
): Promise<string> {
  const header = {
    alg: 'HS256',
    typ: 'JWT',
  };

  const now = Math.floor(Date.now() / 1000);
  const fullPayload: JWTPayload = {
    ...payload,
    iat: payload.iat ?? now,
    exp: payload.exp ?? now + expiresInSeconds,
  };

  const encodedHeader = base64UrlEncode(JSON.stringify(header));
  const encodedPayload = base64UrlEncode(JSON.stringify(fullPayload));
  const dataToSign = `${encodedHeader}.${encodedPayload}`;

  const key = await getCryptoKey(secret, 'sign');
  const signatureBytes = await crypto.subtle.sign(
    'HMAC',
    key,
    new TextEncoder().encode(dataToSign)
  );

  const encodedSignature = bytesToBase64Url(new Uint8Array(signatureBytes));
  return `${dataToSign}.${encodedSignature}`;
}

/**
 * Memverifikasi keabsahan tanda tangan JWT dan masa berlakunya (expiration)
 */
export async function verifyJWT(
  token: string,
  secret: string = DEFAULT_JWT_SECRET
): Promise<JWTPayload | null> {
  if (!token || typeof token !== 'string') return null;

  const parts = token.split('.');
  if (parts.length !== 3) return null;

  const [headerB64, payloadB64, signatureB64] = parts;
  if (!headerB64 || !payloadB64 || !signatureB64) return null;

  try {
    const key = await getCryptoKey(secret, 'verify');
    const dataToVerify = `${headerB64}.${payloadB64}`;
    const signatureBytes = base64UrlToBytes(signatureB64);

    const isValid = await crypto.subtle.verify(
      'HMAC',
      key,
      signatureBytes,
      new TextEncoder().encode(dataToVerify)
    );

    if (!isValid) return null;

    const payloadJson = base64UrlDecode(payloadB64);
    const payload = JSON.parse(payloadJson) as JWTPayload;

    // Verifikasi Expiration (exp)
    const now = Math.floor(Date.now() / 1000);
    if (payload.exp && payload.exp < now) {
      return null; // Token kedaluwarsa
    }

    return payload;
  } catch {
    return null;
  }
}

/**
 * Decode payload tanpa verifikasi (berguna untuk sinkronisasi client-side cepat)
 */
export function decodeJWTPayload(token: string): JWTPayload | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3 || !parts[1]) return null;
    const payloadJson = base64UrlDecode(parts[1]);
    return JSON.parse(payloadJson) as JWTPayload;
  } catch {
    return null;
  }
}
