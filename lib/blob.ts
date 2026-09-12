/**
 * Stockage des fichiers :
 * - Si BLOB_READ_WRITE_TOKEN présent → Vercel Blob (public, prod).
 * - Sinon → écriture locale dans public/uploads (dev / repli).
 */
import fs from 'node:fs';
import path from 'node:path';
import { put, del } from '@vercel/blob';

const useBlob = Boolean(process.env.BLOB_READ_WRITE_TOKEN);

export async function saveFile(folder: string, file: File): Promise<string> {
  const safeName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, '_').slice(0, 80);
  const key = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}-${safeName}`;

  if (useBlob) {
    const blob = await put(key, file, { access: 'public', addRandomSuffix: false });
    return blob.url;
  }

  const dir = path.join(process.cwd(), 'public', 'uploads', folder);
  fs.mkdirSync(dir, { recursive: true });
  const buffer = Buffer.from(await file.arrayBuffer());
  fs.writeFileSync(path.join(dir, path.basename(key)), buffer);
  return `/uploads/${folder}/${path.basename(key)}`;
}

export async function removeFile(url: string): Promise<void> {
  try {
    if (useBlob && url.startsWith('http')) {
      await del(url);
      return;
    }
    if (url.startsWith('/uploads/')) {
      const p = path.join(process.cwd(), 'public', url);
      if (fs.existsSync(p)) fs.unlinkSync(p);
    }
  } catch {
    // Suppression best-effort
  }
}
