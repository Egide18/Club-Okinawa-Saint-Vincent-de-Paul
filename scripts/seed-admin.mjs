/**
 * Génère un hash bcrypt du mot de passe admin.
 * Usage : npm run seed:admin -- MonMotDePasseSuperSecret
 * Puis coller le hash dans ADMIN_PASSWORD_HASH (.env / Vercel).
 */
import bcrypt from 'bcryptjs';

const plain = process.argv[2];
if (!plain || plain.length < 8) {
  console.error('Usage : npm run seed:admin -- <mot-de-passe-8-caracteres-min>');
  process.exit(1);
}
const hash = await bcrypt.hash(plain, 12);
const b64 = Buffer.from(hash, 'utf8').toString('base64');
console.log('\n── Pour le dashboard Vercel (valeur brute) ──');
console.log(`ADMIN_PASSWORD_HASH=${hash}\n`);
console.log('── Pour un fichier .env local (base64, évite l’expansion des $) ──');
console.log(`ADMIN_PASSWORD_HASH_B64=${b64}\n`);
console.log('Astuce : définissez aussi ADMIN_USERNAME (ex. sensei.admin) et SESSION_SECRET.\n');
