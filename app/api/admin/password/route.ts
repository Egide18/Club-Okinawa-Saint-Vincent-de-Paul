import { NextRequest, NextResponse } from 'next/server';
import { getSession, hashPassword, verifyPassword } from '@/lib/auth';
import { getAdminCredentials, updateAdminCredentials } from '@/lib/store';
import { sanitizeText } from '@/lib/validation';

/** Changement du mot de passe admin (compte unique en base). */
export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Non autorisé.' }, { status: 401 });
  try {
    const body = await req.json().catch(() => ({}));
    const current = typeof body.current === 'string' ? body.current : '';
    const next = typeof body.next === 'string' ? body.next : '';
    const username = sanitizeText(body.username, 80) || session.sub;

    if (next.length < 8) {
      return NextResponse.json({ error: 'Le nouveau mot de passe doit contenir au moins 8 caractères.' }, { status: 400 });
    }
    const creds = await getAdminCredentials();
    if (!creds || !(await verifyPassword(current, creds.passwordHash))) {
      return NextResponse.json({ error: 'Mot de passe actuel incorrect.' }, { status: 403 });
    }
    await updateAdminCredentials(username, await hashPassword(next));
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error('[admin password]', e);
    return NextResponse.json({ error: 'Erreur serveur.' }, { status: 500 });
  }
}
