/** Validation centralisée des formulaires + fichiers (sécurité). */

export const MAX_FILE_BYTES = 5 * 1024 * 1024; // 5 Mo
export const ALLOWED_DOC_MIMES = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
export const ALLOWED_DOC_EXTS = ['jpg', 'jpeg', 'png', 'pdf'];
export const ALLOWED_GALLERY_IMAGE = ['image/jpeg', 'image/png', 'image/webp'];
export const ALLOWED_GALLERY_VIDEO = ['video/mp4', 'video/webm'];
export const MAX_PHOTO_BYTES = 5 * 1024 * 1024; // 5 Mo par photo
export const MAX_VIDEO_BYTES = 50 * 1024 * 1024; // 50 Mo par vidéo

export function extOf(name: string): string {
  return (name.split('.').pop() || '').toLowerCase();
}

export interface FileCheck {
  ok: boolean;
  error?: string;
}

export const ALLOWED_PHOTO_MIMES = ['image/jpeg', 'image/jpg', 'image/png'];
export const ALLOWED_PHOTO_EXTS = ['jpg', 'jpeg', 'png'];

/** Photo du candidat : JPG/JPEG/PNG, 5 Mo max. */
export function checkPhotoFile(file: File): FileCheck {
  if (file.size > MAX_FILE_BYTES) {
    return { ok: false, error: `La photo dépasse 5 Mo (${(file.size / 1048576).toFixed(1)} Mo).` };
  }
  if (!ALLOWED_PHOTO_MIMES.includes(file.type) || !ALLOWED_PHOTO_EXTS.includes(extOf(file.name))) {
    return { ok: false, error: `"${file.name}" : format refusé. Photo acceptée : JPG, JPEG ou PNG.` };
  }
  return { ok: true };
}

export function checkDocumentFile(file: File): FileCheck {
  if (file.size > MAX_FILE_BYTES) {
    return { ok: false, error: `"${file.name}" dépasse 5 Mo (${(file.size / 1048576).toFixed(1)} Mo).` };
  }
  if (!ALLOWED_DOC_MIMES.includes(file.type) || !ALLOWED_DOC_EXTS.includes(extOf(file.name))) {
    return { ok: false, error: `"${file.name}" : format refusé. Acceptés : JPG, JPEG, PNG, PDF.` };
  }
  return { ok: true };
}

export function checkGalleryFile(file: File): FileCheck {
  const isImage = ALLOWED_GALLERY_IMAGE.includes(file.type);
  const isVideo = ALLOWED_GALLERY_VIDEO.includes(file.type);
  if (!isImage && !isVideo) {
    return { ok: false, error: `"${file.name}" : format refusé (photos JPG/PNG/WebP, vidéos MP4/WebM).` };
  }
  if (isImage && file.size > MAX_PHOTO_BYTES) {
    return { ok: false, error: `Photo trop lourde (${(file.size / 1048576).toFixed(1)} Mo) : 5 Mo maximum par photo.` };
  }
  if (isVideo && file.size > MAX_VIDEO_BYTES) {
    return { ok: false, error: `Vidéo trop lourde (${(file.size / 1048576).toFixed(0)} Mo) : 50 Mo maximum par vidéo.` };
  }
  return { ok: true };
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE_RE = /^[+\d][\d\s.\-()]{5,20}$/;

export function isEmail(v: string): boolean {
  return EMAIL_RE.test(v.trim());
}

export function isPhone(v: string): boolean {
  return PHONE_RE.test(v.trim());
}

export function sanitizeText(v: unknown, max = 2000): string {
  if (typeof v !== 'string') return '';
  return v.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '').trim().slice(0, max);
}

export function ageFromBirthdate(iso: string): number | null {
  const d = new Date(iso);
  if (Number.isNaN(+d)) return null;
  const now = new Date();
  let age = now.getFullYear() - d.getFullYear();
  const m = now.getMonth() - d.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < d.getDate())) age--;
  return age;
}
