import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { listLogs } from '@/lib/store';

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Non autorisé.' }, { status: 401 });
  const items = await listLogs();
  return NextResponse.json({ items });
}
