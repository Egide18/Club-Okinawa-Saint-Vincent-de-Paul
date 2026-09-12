import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { addMessage, deleteMessage, listMessages, markMessageRead, newId } from '@/lib/store';
import { getClientIp, parseUserAgent } from '@/lib/device';
import { isEmail, isPhone, sanitizeText } from '@/lib/validation';

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Non autorisé.' }, { status: 401 });
  const items = await listMessages();
  return NextResponse.json({ items });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const nom = sanitizeText(body.nom, 120);
    const email = sanitizeText(body.email, 120);
    const telephone = sanitizeText(body.telephone, 30);
    const sujet = sanitizeText(body.sujet, 150);
    const message = sanitizeText(body.message, 3000);
    const consent = body.consentRgpd === true;

    const errors: string[] = [];
    if (!nom) errors.push('Le nom est requis.');
    if (!isEmail(email)) errors.push('E-mail invalide.');
    if (telephone && !isPhone(telephone)) errors.push('Téléphone invalide.');
    if (!sujet) errors.push('Le sujet est requis.');
    if (message.length < 10) errors.push('Le message doit contenir au moins 10 caractères.');
    if (!consent) errors.push('Le consentement RGPD est obligatoire.');
    if (errors.length > 0) {
      return NextResponse.json({ error: 'Veuillez vérifier le formulaire.', details: errors }, { status: 400 });
    }

    const device = parseUserAgent(req.headers.get('user-agent'));
    const msg = await addMessage({
      id: newId('msg-'),
      nom,
      email,
      telephone: telephone || undefined,
      sujet,
      message,
      lu: false,
      createdAt: new Date().toISOString(),
      deviceType: device.deviceType,
      phoneModel: device.phoneModel,
      ip: getClientIp(req.headers),
    });
    return NextResponse.json({ ok: true, id: msg.id }, { status: 201 });
  } catch (e) {
    console.error('[contact POST]', e);
    return NextResponse.json({ error: 'Erreur serveur.' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Non autorisé.' }, { status: 401 });
  const body = await req.json().catch(() => ({}));
  if (!body.id) return NextResponse.json({ error: 'ID manquant.' }, { status: 400 });
  const ok = await markMessageRead(String(body.id), body.lu !== false);
  return NextResponse.json({ ok });
}

export async function DELETE(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Non autorisé.' }, { status: 401 });
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'ID manquant.' }, { status: 400 });
  const ok = await deleteMessage(id);
  return NextResponse.json({ ok });
}
