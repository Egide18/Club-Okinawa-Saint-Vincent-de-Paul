import bcrypt from 'bcryptjs';
import * as jose from 'jose';
import { cookies } from 'next/headers';

const SESSION_COOKIE = 'okinawa_admin_session';
const SESSION_MAX_AGE = 60 * 60 * 8; // 8h

function getSecret(): Uint8Array {
  const s = process.env.SESSION_SECRET;
  if (!s || s.length < 16) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('SESSION_SECRET manquant ou trop court (32+ caractères requis).');
    }
    return new TextEncoder().encode('dev-only-secret-change-me-in-production-32c');
  }
  return new TextEncoder().encode(s);
}

export interface SessionPayload {
  sub: string; // username admin
  iat: number;
  exp: number;
}

export async function createSession(username: string): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  return new jose.SignJWT({ sub: username })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt(now)
    .setExpirationTime(now + SESSION_MAX_AGE)
    .sign(getSecret());
}

export async function verifySession(token: string | undefined | null): Promise<SessionPayload | null> {
  if (!token) return null;
  try {
    const { payload } = await jose.jwtVerify(token, getSecret());
    return payload as unknown as SessionPayload;
  } catch {
    return null;
  }
}

export async function getSession(): Promise<SessionPayload | null> {
  const store = cookies();
  return verifySession(store.get(SESSION_COOKIE)?.value);
}

export function setSessionCookie(token: string) {
  const store = cookies();
  store.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: SESSION_MAX_AGE,
  });
}

export function clearSessionCookie() {
  const store = cookies();
  store.delete(SESSION_COOKIE);
}

export const SESSION_COOKIE_NAME = SESSION_COOKIE;

/** Vérifie le mot de passe saisi contre le hash bcrypt stocké en base / env. */
export async function verifyPassword(plain: string, hash: string): Promise<boolean> {
  if (!plain || !hash) return false;
  try {
    return await bcrypt.compare(plain, hash);
  } catch {
    return false;
  }
}

export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, 12);
}

/* ─── Rate limiting anti-brute-force (mémoire, par IP) ─── */
const attempts = new Map<string, { count: number; lockedUntil: number }>();
const MAX_ATTEMPTS = 5;
const LOCK_MS = 15 * 60 * 1000;

export function checkRateLimit(ip: string): { allowed: boolean; retryAfterSec: number } {
  const now = Date.now();
  const entry = attempts.get(ip);
  if (entry && entry.lockedUntil > now) {
    return { allowed: false, retryAfterSec: Math.ceil((entry.lockedUntil - now) / 1000) };
  }
  if (entry && entry.lockedUntil <= now && entry.count >= MAX_ATTEMPTS) {
    attempts.delete(ip);
  }
  return { allowed: true, retryAfterSec: 0 };
}

export function recordFailedAttempt(ip: string) {
  const now = Date.now();
  const entry = attempts.get(ip) ?? { count: 0, lockedUntil: 0 };
  entry.count += 1;
  if (entry.count >= MAX_ATTEMPTS) entry.lockedUntil = now + LOCK_MS;
  attempts.set(ip, entry);
}

export function resetAttempts(ip: string) {
  attempts.delete(ip);
}
