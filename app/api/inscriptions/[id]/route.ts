import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { getInscription, updateInscriptionStatus, type InscriptionStatus } from '@/lib/store';

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Non autorisé.' }, { status: 401 });
  const ins = await getInscription(params.id);
  if (!ins) return NextResponse.json({ error: 'Introuvable.' }, { status: 404 });
  return NextResponse.json({ item: ins });
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Non autorisé.' }, { status: 401 });
  const body = await req.json().catch(() => ({}));
  const status = body.status as InscriptionStatus;
  if (!['en_attente', 'validee', 'rejetee'].includes(status)) {
    return NextResponse.json({ error: 'Statut invalide.' }, { status: 400 });
  }
  const updated = await updateInscriptionStatus(params.id, status);
  if (!updated) return NextResponse.json({ error: 'Introuvable.' }, { status: 404 });
  return NextResponse.json({ item: updated });
}
