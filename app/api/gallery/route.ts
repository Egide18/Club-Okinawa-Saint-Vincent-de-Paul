import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { addGalleryItem, listGallery } from '@/lib/store';
import { saveFile } from '@/lib/blob';
import { checkGalleryFile, sanitizeText } from '@/lib/validation';

export async function GET() {
  const items = await listGallery();
  return NextResponse.json({ items });
}

/** Upload admin (image ou vidéo) directement dans la galerie. */
export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Non autorisé.' }, { status: 401 });

  try {
    const form = await req.formData();
    const file = form.get('file') as File | null;
    const title = sanitizeText(form.get('title'), 120) || 'Sans titre';
    const description = sanitizeText(form.get('description'), 500);
    const externalUrl = sanitizeText(form.get('url'), 500);

    // Cas 1 : URL externe (ex. vidéo hébergée)
    if (!file && externalUrl) {
      if (!/^https:\/\//.test(externalUrl)) {
        return NextResponse.json({ error: 'URL invalide (https requise).' }, { status: 400 });
      }
      const type = /(\.mp4|\.webm|youtube|youtu\.be|vimeo)/i.test(externalUrl) ? 'video' : 'image';
      const item = await addGalleryItem({ type, url: externalUrl, title, description, createdBy: session.sub });
      return NextResponse.json({ item }, { status: 201 });
    }

    if (!file || typeof file === 'string') {
      return NextResponse.json({ error: 'Fichier manquant.' }, { status: 400 });
    }

    const check = checkGalleryFile(file);
    if (!check.ok) return NextResponse.json({ error: check.error }, { status: 400 });

    const type = file.type.startsWith('video/') ? 'video' : 'image';
    const url = await saveFile('galerie', file);
    const item = await addGalleryItem({ type, url, title, description, createdBy: session.sub });
    return NextResponse.json({ item }, { status: 201 });
  } catch (e) {
    console.error('[gallery POST]', e);
    return NextResponse.json({ error: 'Échec de l’envoi. Réessayez.' }, { status: 500 });
  }
}
