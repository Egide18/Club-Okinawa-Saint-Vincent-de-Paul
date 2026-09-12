import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';

/** Indique au dashboard quel moteur de stockage est actif. */
export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Non autorisé.' }, { status: 401 });
  return NextResponse.json({
    blob: Boolean(process.env.BLOB_READ_WRITE_TOKEN),
    postgres: Boolean(process.env.POSTGRES_URL),
    firebase: Boolean(process.env.FIREBASE_SERVICE_ACCOUNT_JSON),
  });
}
