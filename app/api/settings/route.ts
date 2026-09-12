import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { getSettings, updateSettings } from '@/lib/store';
import { sanitizeText } from '@/lib/validation';

export async function GET() {
  const s = await getSettings();
  return NextResponse.json({ settings: s });
}

export async function PATCH(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Non autorisé.' }, { status: 401 });
  try {
    const body = await req.json().catch(() => ({}));
    const patch: Record<string, unknown> = {};
    for (const k of [
      'slogan', 'paragrapheAccueil', 'histoireSensei', 'hymne', 'historiqueClub',
      'senseiNom', 'senseiGrade', 'whatsapp', 'emailClub', 'adresseClub', 'horairesClub',
    ]) {
      if (typeof body[k] === 'string') patch[k] = sanitizeText(body[k], 5000);
    }
    if (body.stats && typeof body.stats === 'object') {
      const st: Record<string, number> = {};
      for (const k of ['combats', 'victoires', 'titres', 'athletes']) {
        const n = Number(body.stats[k]);
        if (Number.isFinite(n) && n >= 0 && n <= 1000000) st[k] = Math.floor(n);
      }
      if (Object.keys(st).length) patch.stats = st;
    }
    if (Array.isArray(body.partenaires)) {
      patch.partenaires = body.partenaires.slice(0, 12).map((p: any) => ({
        nom: sanitizeText(p?.nom, 100),
        logo: sanitizeText(p?.logo, 500),
      }));
    }
    if (Array.isArray(body.sliderTextes)) {
      patch.sliderTextes = body.sliderTextes.slice(0, 10).map((t: unknown) => sanitizeText(t, 300));
    }
    const updated = await updateSettings(patch as any);
    return NextResponse.json({ settings: updated });
  } catch (e) {
    console.error('[settings PATCH]', e);
    return NextResponse.json({ error: 'Erreur serveur.' }, { status: 500 });
  }
}
