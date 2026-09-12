/**
 * Copie cloud des inscriptions vers Firebase (Firestore).
 * Actif uniquement si FIREBASE_SERVICE_ACCOUNT_JSON est défini.
 * Échec silencieux : l'inscription reste valide en base principale (Vercel).
 */
import type { Inscription } from './store';

let cachedDb: unknown = null;
let attempted = false;

async function getDb(): Promise<any | null> {
  if (attempted) return cachedDb as any;
  attempted = true;
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (!raw) return null;
  try {
    const admin = await import('firebase-admin');
    const creds = JSON.parse(raw);
    if (admin.apps.length === 0) {
      admin.initializeApp({ credential: admin.credential.cert(creds) });
    }
    cachedDb = admin.firestore();
    return cachedDb as any;
  } catch (e) {
    console.error('[firebase] initialisation impossible :', (e as Error).message);
    return null;
  }
}

/** Enregistre une copie de l'inscription dans Firestore. Retourne true si copié. */
export async function copyInscriptionToFirebase(ins: Inscription): Promise<boolean> {
  try {
    const db = await getDb();
    if (!db) return false;
    await db.collection('inscriptions').doc(ins.id).set({
      ...ins,
      firebaseCopiedAt: new Date().toISOString(),
    });
    return true;
  } catch (e) {
    console.error('[firebase] copie inscription échouée :', (e as Error).message);
    return false;
  }
}
