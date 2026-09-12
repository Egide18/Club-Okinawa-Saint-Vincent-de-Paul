import { NextRequest, NextResponse } from 'next/server';
import {
  checkRateLimit,
  createSession,
  recordFailedAttempt,
  resetAttempts,
  setSessionCookie,
  verifyPassword,
} from '@/lib/auth';
import { addLog, getAdminCredentials, newId } from '@/lib/store';
import { getClientIp, parseUserAgent } from '@/lib/device';
import { sanitizeText } from '@/lib/validation';

export async function POST(req: NextRequest) {
  try {
    const ip = getClientIp(req.headers);
    const { allowed, retryAfterSec } = checkRateLimit(ip);
    if (!allowed) {
      return NextResponse.json(
        { error: `Trop de tentatives. Réessayez dans ${Math.ceil(retryAfterSec / 60)} minute(s).` },
        { status: 429 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const username = sanitizeText(body.username, 80);
    const password = typeof body.password === 'string' ? body.password.slice(0, 200) : '';

    if (!username || !password) {
      return NextResponse.json({ error: 'Nom d’utilisateur et mot de passe requis.' }, { status: 400 });
    }

    const creds = await getAdminCredentials();
    const ok = creds !== null && username === creds.username && (await verifyPassword(password, creds.passwordHash));

    // Journal de connexion (succès comme échec)
    const device = parseUserAgent(req.headers.get('user-agent'));
    await addLog({
      id: newId('log-'),
      username,
      success: ok,
      ip,
      deviceType: device.deviceType,
      phoneModel: device.phoneModel,
      os: device.os,
      browser: device.browser,
      userAgent: device.raw.slice(0, 300),
      createdAt: new Date().toISOString(),
    });

    if (!ok) {
      recordFailedAttempt(ip);
      // Message volontairement générique (anti-énumération)
      return NextResponse.json({ error: 'Identifiants incorrects.' }, { status: 401 });
    }

    resetAttempts(ip);
    const token = await createSession(creds!.username);
    setSessionCookie(token);
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error('[login]', e);
    return NextResponse.json({ error: 'Erreur serveur. Réessayez plus tard.' }, { status: 500 });
  }
}
