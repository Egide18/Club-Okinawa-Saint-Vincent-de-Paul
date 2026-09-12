import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { deleteGalleryItem } from '@/lib/store';
import { removeFile } from '@/lib/blob';

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Non autorisé.' }, { status: 401 });
  const removed = await deleteGalleryItem(params.id);
  if (!removed) return NextResponse.json({ error: 'Élément introuvable.' }, { status: 404 });
  await removeFile(removed.url);
  return NextResponse.json({ ok: true });
}
