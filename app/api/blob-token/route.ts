import { NextRequest, NextResponse } from 'next/server';
import { handleUpload, type HandleUploadBody } from '@vercel/blob/client';
import { getSession } from '@/lib/auth';

/**
 * Upload direct navigateur → Vercel Blob (sans passer par le serveur).
 * Indispensable pour les vidéos jusqu'à 50 Mo (les fonctions serverless
 * Vercel n'acceptent que ~4,5 Mo de corps de requête).
 * Réservé à l'administrateur connecté.
 */
export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Non autorisé.' }, { status: 401 });
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return NextResponse.json({ error: 'Stockage Blob non configuré.' }, { status: 503 });
  }

  const body = (await req.json()) as HandleUploadBody;
  try {
    const result = await handleUpload({
      body,
      request: req,
      onBeforeGenerateToken: async () => ({
        allowedContentTypes: [
          'image/jpeg',
          'image/png',
          'image/webp',
          'video/mp4',
          'video/webm',
        ],
        addRandomSuffix: true,
        tokenPayload: JSON.stringify({ by: session.sub }),
      }),
      onUploadCompleted: async () => {},
    });
    return NextResponse.json(result);
  } catch (e) {
    console.error('[blob-token]', e);
    return NextResponse.json({ error: 'Échec de la préparation de l’envoi.' }, { status: 500 });
  }
}
