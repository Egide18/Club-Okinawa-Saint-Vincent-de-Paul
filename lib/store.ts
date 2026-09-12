/**
 * Couche de persistance hybride :
 * - En production Vercel (POSTGRES_URL défini) → Vercel Postgres.
 * - En local / sans Postgres → fichiers JSON (data/*.json, /tmp sur Vercel).
 *
 * Schéma SQL miroir : sql/schema.sql
 */
import fs from 'node:fs';
import path from 'node:path';
import { sql } from '@vercel/postgres';

/* ═══════════════ Types ═══════════════ */

export interface GalleryItem {
  id: string;
  type: 'image' | 'video';
  url: string;
  title: string;
  description?: string;
  createdAt: string;
  createdBy?: string;
}

export type InscriptionStatus = 'en_attente' | 'validee' | 'rejetee';

export interface InscriptionFiles {
  identite?: string;
  lettreParents?: string;
  photoPasseport?: string;
  certificatMedical?: string;
  preuvePaiement?: string;
}

/** Identité du responsable légal (mineur) ou du contact d'urgence (majeur). */
export interface ContactIdentite {
  nom: string;
  prenom: string;
  adresse: string;
  telephone: string;
}

export interface Inscription {
  id: string;
  /** Code de pré-inscription à 8 caractères (ex. K7P2QX9M). */
  code?: string;
  type?: 'pre-inscription' | 'inscription';
  // Identité du candidat
  nom: string;
  postnom?: string;
  prenom: string;
  dateNaissance: string;
  age: number;
  sexe?: 'M' | 'F';
  nationalite?: string;
  adresse?: string;
  telephone?: string;
  email?: string;
  // Responsable (mineurs) — ancien format conservé pour compatibilité
  parentNom?: string;
  parentTelephone?: string;
  parentLien?: string;
  // Pré-inscription : responsable légal (mineur) OU contact d'urgence (majeur)
  responsable?: ContactIdentite;
  urgence?: ContactIdentite;
  // Sport (ancien format)
  categorie?: string;
  niveau?: string;
  antecedentsMedicaux?: string;
  personneUrgence?: string;
  telUrgence?: string;
  // Photo du candidat (pré-inscription)
  photo?: string;
  photoName?: string;
  // Fichiers (ancien format)
  files?: InscriptionFiles;
  fileNames?: Record<string, string>;
  // Meta
  status: InscriptionStatus;
  consentRgpd: boolean;
  createdAt: string;
  deviceType?: string;
  phoneModel?: string;
  ip?: string;
  firebaseCopy?: boolean;
}

/** Génère un code de pré-inscription unique à 8 caractères (sans caractères ambigus). */
export function generatePreCode(): string {
  const alphabet = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
  let code = '';
  // crypto disponible côté serveur Node
  const bytes = new Uint8Array(8);
  crypto.getRandomValues(bytes);
  for (let i = 0; i < 8; i++) code += alphabet[bytes[i] % alphabet.length];
  return code;
}

export interface ContactMessage {
  id: string;
  nom: string;
  email: string;
  telephone?: string;
  sujet: string;
  message: string;
  lu: boolean;
  createdAt: string;
  deviceType?: string;
  phoneModel?: string;
  ip?: string;
}

export interface LoginLog {
  id: string;
  username: string;
  success: boolean;
  ip: string;
  deviceType: string;
  phoneModel: string;
  os: string;
  browser: string;
  userAgent: string;
  createdAt: string;
}

export interface SiteSettings {
  slogan: string;
  paragrapheAccueil: string;
  histoireSensei: string;
  hymne: string;
  historiqueClub: string;
  senseiNom: string;
  senseiGrade: string;
  whatsapp: string;
  emailClub: string;
  adresseClub: string;
  horairesClub: string;
  stats: { combats: number; victoires: number; titres: number; athletes: number };
  partenaires: { nom: string; logo: string }[];
  sliderTextes: string[];
  updatedAt: string;
}

export interface AdminCredentials {
  username: string;
  passwordHash: string;
  updatedAt: string;
}

/* ═══════════════ Backend detection ═══════════════ */

const usePostgres = Boolean(process.env.POSTGRES_URL);
const isVercel = Boolean(process.env.VERCEL);
const DATA_DIR = isVercel ? path.join('/tmp', 'okinawa-data') : path.join(process.cwd(), 'data');

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
}

function jsonPath(name: string) {
  return path.join(DATA_DIR, `${name}.json`);
}

function readJson<T>(name: string, fallback: T): T {
  try {
    ensureDataDir();
    if (!fs.existsSync(jsonPath(name))) {
      // Sur Vercel (/tmp vide), tenter de copier le seed embarqué
      const seed = path.join(process.cwd(), 'data', `${name}.json`);
      if (isVercel && fs.existsSync(seed)) {
        fs.copyFileSync(seed, jsonPath(name));
      } else {
        return fallback;
      }
    }
    return JSON.parse(fs.readFileSync(jsonPath(name), 'utf8')) as T;
  } catch {
    return fallback;
  }
}

function writeJson(name: string, value: unknown) {
  ensureDataDir();
  const tmp = jsonPath(name) + '.tmp';
  fs.writeFileSync(tmp, JSON.stringify(value, null, 2));
  fs.renameSync(tmp, jsonPath(name));
}

export function newId(prefix = ''): string {
  return `${prefix}${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;
}

/* ═══════════════ Postgres schema ═══════════════ */

let schemaReady = false;

export async function ensureSchema(): Promise<void> {
  if (!usePostgres || schemaReady) return;
  await sql`CREATE TABLE IF NOT EXISTS gallery_items (
    id TEXT PRIMARY KEY, type TEXT NOT NULL, url TEXT NOT NULL,
    title TEXT NOT NULL, description TEXT, created_at TIMESTAMPTZ DEFAULT NOW(), created_by TEXT
  )`;
  await sql`CREATE TABLE IF NOT EXISTS inscriptions (
    id TEXT PRIMARY KEY, data JSONB NOT NULL, status TEXT DEFAULT 'en_attente',
    created_at TIMESTAMPTZ DEFAULT NOW()
  )`;
  await sql`CREATE TABLE IF NOT EXISTS contact_messages (
    id TEXT PRIMARY KEY, data JSONB NOT NULL, lu BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
  )`;
  await sql`CREATE TABLE IF NOT EXISTS login_logs (
    id TEXT PRIMARY KEY, data JSONB NOT NULL, created_at TIMESTAMPTZ DEFAULT NOW()
  )`;
  await sql`CREATE TABLE IF NOT EXISTS app_settings (
    id TEXT PRIMARY KEY, data JSONB NOT NULL, updated_at TIMESTAMPTZ DEFAULT NOW()
  )`;
  await sql`CREATE TABLE IF NOT EXISTS admin_users (
    id TEXT PRIMARY KEY, username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL, updated_at TIMESTAMPTZ DEFAULT NOW()
  )`;
  // Seed admin depuis les variables d'environnement si table vide
  const existing = await sql`SELECT id FROM admin_users LIMIT 1`;
  if (existing.rows.length === 0 && process.env.ADMIN_USERNAME && process.env.ADMIN_PASSWORD_HASH) {
    await sql`INSERT INTO admin_users (id, username, password_hash)
      VALUES ('admin-primary', ${process.env.ADMIN_USERNAME}, ${process.env.ADMIN_PASSWORD_HASH})`;
  }
  schemaReady = true;
}

/* ═══════════════ Galerie ═══════════════ */

export async function listGallery(): Promise<GalleryItem[]> {
  if (usePostgres) {
    await ensureSchema();
    const { rows } = await sql`SELECT * FROM gallery_items ORDER BY created_at DESC`;
    return rows.map((r) => ({
      id: r.id, type: r.type, url: r.url, title: r.title,
      description: r.description ?? undefined,
      createdAt: new Date(r.created_at).toISOString(), createdBy: r.created_by ?? undefined,
    }));
  }
  const items = readJson<GalleryItem[]>('gallery', []);
  return items.sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
}

export async function addGalleryItem(item: Omit<GalleryItem, 'id' | 'createdAt'> & { id?: string }): Promise<GalleryItem> {
  const full: GalleryItem = {
    ...item,
    id: item.id ?? newId('gal-'),
    createdAt: new Date().toISOString(),
  };
  if (usePostgres) {
    await ensureSchema();
    await sql`INSERT INTO gallery_items (id, type, url, title, description, created_by)
      VALUES (${full.id}, ${full.type}, ${full.url}, ${full.title}, ${full.description ?? null}, ${full.createdBy ?? null})`;
    return full;
  }
  const items = readJson<GalleryItem[]>('gallery', []);
  items.push(full);
  writeJson('gallery', items);
  return full;
}

export async function deleteGalleryItem(id: string): Promise<GalleryItem | null> {
  if (usePostgres) {
    await ensureSchema();
    const { rows } = await sql`SELECT * FROM gallery_items WHERE id = ${id}`;
    if (rows.length === 0) return null;
    await sql`DELETE FROM gallery_items WHERE id = ${id}`;
    const r = rows[0];
    return { id: r.id, type: r.type, url: r.url, title: r.title, createdAt: new Date(r.created_at).toISOString() };
  }
  const items = readJson<GalleryItem[]>('gallery', []);
  const idx = items.findIndex((i) => i.id === id);
  if (idx === -1) return null;
  const [removed] = items.splice(idx, 1);
  writeJson('gallery', items);
  return removed;
}

/* ═══════════════ Inscriptions ═══════════════ */

export async function listInscriptions(): Promise<Inscription[]> {
  if (usePostgres) {
    await ensureSchema();
    const { rows } = await sql`SELECT data FROM inscriptions ORDER BY created_at DESC`;
    return rows.map((r) => r.data as Inscription);
  }
  const items = readJson<Inscription[]>('inscriptions', []);
  return items.sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
}

export async function getInscription(id: string): Promise<Inscription | null> {
  const all = await listInscriptions();
  return all.find((i) => i.id === id) ?? null;
}

export async function getInscriptionByCode(code: string): Promise<Inscription | null> {
  const normalized = code.trim().toUpperCase();
  if (!/^[A-Z0-9]{8}$/.test(normalized)) return null;
  const all = await listInscriptions();
  return all.find((i) => (i.code || '').toUpperCase() === normalized) ?? null;
}

export async function isPreCodeTaken(code: string): Promise<boolean> {
  const all = await listInscriptions();
  return all.some((i) => (i.code || '').toUpperCase() === code.toUpperCase());
}

export async function addInscription(ins: Inscription): Promise<Inscription> {
  if (usePostgres) {
    await ensureSchema();
    await sql`INSERT INTO inscriptions (id, data, status) VALUES (${ins.id}, ${JSON.stringify(ins)}, ${ins.status})`;
    return ins;
  }
  const items = readJson<Inscription[]>('inscriptions', []);
  items.push(ins);
  writeJson('inscriptions', items);
  return ins;
}

export async function updateInscriptionStatus(id: string, status: InscriptionStatus): Promise<Inscription | null> {
  if (usePostgres) {
    await ensureSchema();
    const { rows } = await sql`SELECT data FROM inscriptions WHERE id = ${id}`;
    if (rows.length === 0) return null;
    const updated = { ...(rows[0].data as Inscription), status };
    await sql`UPDATE inscriptions SET data = ${JSON.stringify(updated)}, status = ${status} WHERE id = ${id}`;
    return updated;
  }
  const items = readJson<Inscription[]>('inscriptions', []);
  const found = items.find((i) => i.id === id);
  if (!found) return null;
  found.status = status;
  writeJson('inscriptions', items);
  return found;
}

/* ═══════════════ Messages de contact ═══════════════ */

export async function listMessages(): Promise<ContactMessage[]> {
  if (usePostgres) {
    await ensureSchema();
    const { rows } = await sql`SELECT data FROM contact_messages ORDER BY created_at DESC`;
    return rows.map((r) => r.data as ContactMessage);
  }
  const items = readJson<ContactMessage[]>('messages', []);
  return items.sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
}

export async function addMessage(msg: ContactMessage): Promise<ContactMessage> {
  if (usePostgres) {
    await ensureSchema();
    await sql`INSERT INTO contact_messages (id, data, lu) VALUES (${msg.id}, ${JSON.stringify(msg)}, ${msg.lu})`;
    return msg;
  }
  const items = readJson<ContactMessage[]>('messages', []);
  items.push(msg);
  writeJson('messages', items);
  return msg;
}

export async function markMessageRead(id: string, lu: boolean): Promise<boolean> {
  if (usePostgres) {
    await ensureSchema();
    const { rows } = await sql`SELECT data FROM contact_messages WHERE id = ${id}`;
    if (rows.length === 0) return false;
    const updated = { ...(rows[0].data as ContactMessage), lu };
    await sql`UPDATE contact_messages SET data = ${JSON.stringify(updated)}, lu = ${lu} WHERE id = ${id}`;
    return true;
  }
  const items = readJson<ContactMessage[]>('messages', []);
  const found = items.find((m) => m.id === id);
  if (!found) return false;
  found.lu = lu;
  writeJson('messages', items);
  return true;
}

export async function deleteMessage(id: string): Promise<boolean> {
  if (usePostgres) {
    await ensureSchema();
    await sql`DELETE FROM contact_messages WHERE id = ${id}`;
    return true;
  }
  const items = readJson<ContactMessage[]>('messages', []);
  const filtered = items.filter((m) => m.id !== id);
  if (filtered.length === items.length) return false;
  writeJson('messages', filtered);
  return true;
}

/* ═══════════════ Logs de connexion ═══════════════ */

export async function listLogs(limit = 200): Promise<LoginLog[]> {
  if (usePostgres) {
    await ensureSchema();
    const { rows } = await sql`SELECT data FROM login_logs ORDER BY created_at DESC LIMIT ${limit}`;
    return rows.map((r) => r.data as LoginLog);
  }
  const items = readJson<LoginLog[]>('login_logs', []);
  return items.sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt)).slice(0, limit);
}

export async function addLog(log: LoginLog): Promise<void> {
  if (usePostgres) {
    await ensureSchema();
    await sql`INSERT INTO login_logs (id, data) VALUES (${log.id}, ${JSON.stringify(log)})`;
    // Purge : garder 1000 derniers
    await sql`DELETE FROM login_logs WHERE id NOT IN (SELECT id FROM login_logs ORDER BY created_at DESC LIMIT 1000)`;
    return;
  }
  const items = readJson<LoginLog[]>('login_logs', []);
  items.push(log);
  writeJson('login_logs', items.slice(-1000));
}

/* ═══════════════ Réglages du site ═══════════════ */

export const DEFAULT_SETTINGS: SiteSettings = {
  slogan: 'Discipline • Respect • Victoire',
  paragrapheAccueil:
    "Depuis sa fondation, le Club Okinawa Saint-Vincent-de-Paul forme des karatékas d'exception dans la pure tradition d'Okinawa, berceau du karaté. Ici, chaque entraînement forge le corps, chaque kata élève l'esprit. Rejoignez une famille où l'excellence martiale rencontre les valeurs humaines.",
  histoireSensei:
    "Fondateur et instructeur principal du club, le Sensei a consacré sa vie aux arts martiaux. Formé à l'école traditionnelle d'Okinawa, il a parcouru les plus grands tatamis d'Afrique et du monde avant de revenir transmettre son savoir aux jeunes générations. Sa pédagogie exigeante et bienveillante a forgé des champions — et surtout des femmes et des hommes debout.",
  hymne:
    "Debout, enfants d'Okinawa !\nLe poing levé vers le ciel,\nDiscipline dans nos cœurs,\nHonneur dans nos âmes.\n\nSaint-Vincent-de-Paul nous guide,\nLe dojo est notre maison,\nKaratékas, forts et unis,\nVers la victoire, marchons ! 🥋",
  historiqueClub:
    "Fondé sous le patronage de Saint-Vincent-de-Paul, notre club perpétue l'héritage des maîtres d'Okinawa. D'un petit dojo de quartier à une académie reconnue, nous avons formé des centaines d'athlètes, remporté des titres régionaux et nationaux, et surtout bâti une communauté soudée par le respect et la persévérance. Le karaté et le full contact y sont enseignés avec la même exigence : celle de l'excellence.",
  senseiNom: 'Sensei Fondateur',
  senseiGrade: 'Ceinture Noire 5ᵉ Dan — Karaté Shotokan',
  whatsapp: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '243000000000',
  emailClub: 'contact@okinawa-svp.club',
  adresseClub: 'Saint-Vincent-de-Paul — Dojo principal',
  horairesClub: 'Lun – Sam : 16h00 – 20h00',
  stats: { combats: 120, victoires: 98, titres: 15, athletes: 450 },
  partenaires: [
    { nom: 'Fédération Nationale de Karaté', logo: '' },
    { nom: 'Ligue Provinciale Full Contact', logo: '' },
    { nom: 'Dojo Okinawa International', logo: '' },
    { nom: 'Académie des Sports de Combat', logo: '' },
  ],
  sliderTextes: [
    '« Le karaté commence et se termine par le respect. » — Gichin Funakoshi',
    '« La victoire appartient au plus persévérant. » — Devise du club',
    '« Le dojo est un lieu où l’on polit l’esprit. »',
    '« Tombe sept fois, relève-toi huit. » — Proverbe japonais',
  ],
  updatedAt: new Date().toISOString(),
};

export async function getSettings(): Promise<SiteSettings> {
  if (usePostgres) {
    await ensureSchema();
    const { rows } = await sql`SELECT data FROM app_settings WHERE id = 'site'`;
    if (rows.length === 0) return DEFAULT_SETTINGS;
    return { ...DEFAULT_SETTINGS, ...(rows[0].data as Partial<SiteSettings>) };
  }
  const stored = readJson<Partial<SiteSettings>>('settings', {});
  return { ...DEFAULT_SETTINGS, ...stored };
}

export async function updateSettings(patch: Partial<SiteSettings>): Promise<SiteSettings> {
  const current = await getSettings();
  const updated: SiteSettings = { ...current, ...patch, updatedAt: new Date().toISOString() };
  if (usePostgres) {
    await ensureSchema();
    await sql`INSERT INTO app_settings (id, data) VALUES ('site', ${JSON.stringify(updated)})
      ON CONFLICT (id) DO UPDATE SET data = ${JSON.stringify(updated)}, updated_at = NOW()`;
    return updated;
  }
  writeJson('settings', updated);
  return updated;
}

/* ═══════════════ Compte admin (base de données) ═══════════════ */

export async function getAdminCredentials(): Promise<AdminCredentials | null> {
  if (usePostgres) {
    await ensureSchema();
    const { rows } = await sql`SELECT username, password_hash, updated_at FROM admin_users LIMIT 1`;
    if (rows.length === 0) return null;
    return {
      username: rows[0].username,
      passwordHash: rows[0].password_hash,
      updatedAt: new Date(rows[0].updated_at).toISOString(),
    };
  }
  const stored = readJson<AdminCredentials | null>('admin', null);
  if (stored?.username && stored?.passwordHash) return stored;
  // Repli : variables d'environnement (puis persiste en base locale).
  // Le hash bcrypt contient des `$` que les parseurs .env étendent comme des
  // variables : préférez ADMIN_PASSWORD_HASH_B64 (base64) dans les fichiers .env.
  // Sur le dashboard Vercel, le hash brut fonctionne tel quel.
  let hash = process.env.ADMIN_PASSWORD_HASH || '';
  if (process.env.ADMIN_PASSWORD_HASH_B64) {
    try {
      hash = Buffer.from(process.env.ADMIN_PASSWORD_HASH_B64, 'base64').toString('utf8').trim();
    } catch { /* repli sur brut */ }
  }
  if (process.env.ADMIN_USERNAME && hash && hash.startsWith('$2')) {
    const creds: AdminCredentials = {
      username: process.env.ADMIN_USERNAME,
      passwordHash: hash,
      updatedAt: new Date().toISOString(),
    };
    try {
      writeJson('admin', creds);
    } catch { /* FS read-only : on garde le repli env */ }
    return creds;
  }
  return null;
}

export async function updateAdminCredentials(username: string, passwordHash: string): Promise<AdminCredentials> {
  const creds: AdminCredentials = { username, passwordHash, updatedAt: new Date().toISOString() };
  if (usePostgres) {
    await ensureSchema();
    await sql`DELETE FROM admin_users`;
    await sql`INSERT INTO admin_users (id, username, password_hash) VALUES ('admin-primary', ${username}, ${passwordHash})`;
    return creds;
  }
  writeJson('admin', creds);
  return creds;
}
