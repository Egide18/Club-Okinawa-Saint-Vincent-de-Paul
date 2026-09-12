# 🥋 Club Okinawa Saint-Vincent-de-Paul

Site officiel du club de **karaté & full contact** — Next.js 14, responsive, sécurisé, déployé sur **Vercel**.

## ✨ Fonctionnalités

| Page | Contenu |
|---|---|
| **Accueil** | Écran de chargement 3 s, karatéka animé entrant dans le dojo, slogan + paragraphe modifiables, slider de textes, chiffres clés, slider auto des partenaires |
| **À propos** | Portrait & histoire du Sensei, stats de carrière avec **comptage animé**, grade/ceinture, historique du club, hymne |
| **Galerie** | Photos & vidéos **protégées contre le téléchargement** (clic droit bloqué, `nodownload`, filigrane, lightbox) |
| **Pré-inscription** | Instructions + case « **Lu et approuvé** » → formulaire (identité, âge vérifié, responsable si mineur / urgence si majeur, photo JPG/PNG ≤ 5 Mo) → **vérification** → **fiche officielle imprimable / PDF** avec **code unique à 8 caractères**, consultable via le code |
| **Contact** | Formulaire + bouton **WhatsApp** relié au numéro du club |
| **Admin** | Connexion glassmorphisme sur fond **Matrix**, mot de passe **bcrypt**, tableau de bord : galerie (upload direct), pré-inscriptions (codes, photos, fiches), messages, **logs de connexion** (date/heure/IP/appareil), réglages du site |

**Thème jour/nuit** : bascule Soleil/Lune dans la navigation, mémorisé localement, respecte le réglage du système au premier passage.

Conformité : **RGPD** (consentements, droits, durées), bandeau **cookies**, **mentions légales**, footer complet, collecte du **type de téléphone** (mobile/tablette/desktop + modèle).

## 🛠️ Stack

- **Next.js 14** (App Router) + Tailwind + Framer Motion
- **Base** : Vercel Postgres en prod (`POSTGRES_URL`), sinon JSON local (`data/`)
- **Fichiers** : Vercel Blob en prod (`BLOB_READ_WRITE_TOKEN`), sinon `public/uploads/`
- **Copie cloud inscriptions** : Firebase Firestore (`FIREBASE_SERVICE_ACCOUNT_JSON`, optionnel)
- **Auth** : JWT (jose) en cookie httpOnly + bcrypt + rate-limit anti-brute-force

## 🚀 Lancement local

```bash
npm install
cp .env.example .env
# 1. Générer le hash admin :
npm run seed:admin -- MonMotDePasseSecret
# 2. Renseigner .env : ADMIN_USERNAME, ADMIN_PASSWORD_HASH, SESSION_SECRET (32+ caractères)
npm run dev
```

- Site : http://localhost:3000
- Admin : http://localhost:3000/admin/login

## ☁️ Déploiement Vercel

1. Poussez le repo sur GitHub, puis **Import Project** dans Vercel.
2. Créez un stockage **Vercel Postgres** et **Vercel Blob** (onglet Storage) — les variables `POSTGRES_URL…` et `BLOB_READ_WRITE_TOKEN` sont injectées automatiquement.
3. Ajoutez les variables d’environnement :
   - `ADMIN_USERNAME` (ex. `sensei.admin`)
   - `ADMIN_PASSWORD_HASH` (généré via `npm run seed:admin`)
   - `SESSION_SECRET` (chaîne aléatoire 32+ caractères)
   - `NEXT_PUBLIC_WHATSAPP_NUMBER` (ex. `243812345678`)
   - `FIREBASE_SERVICE_ACCOUNT_JSON` (optionnel — copie Firestore des inscriptions)
4. **Deploy**. Les tables Postgres sont créées automatiquement au premier appel (`ensureSchema`, voir `sql/schema.sql`).

> Le compte admin est **unique**, stocké en base, mot de passe chiffré. Modifiable depuis l’onglet *Réglages → Sécurité* du dashboard. Aucune inscription publique n’existe sur la page de connexion.

## 🔒 Sécurité

- bcrypt (12 rounds), JWT HS256 httpOnly/secure/sameSite, rate-limit login (5 essais → 15 min)
- Validation serveur : types MIME + extensions + tailles (docs 5 Mo, galerie 100 Mo)
- En-têtes : CSP, X-Frame-Options, nosniff, Referrer-Policy, Permissions-Policy
- Journalisation de chaque tentative de connexion (succès/échec, IP, appareil)

## 📁 Structure

```
app/            pages + routes API
components/     Navbar, Footer, HeroDojo, GalleryGrid, InscriptionWizard…
lib/            auth, store (Postgres/JSON), blob, firebase, device, validation
sql/schema.sql  schéma Vercel Postgres miroir
scripts/        seed-admin (hash bcrypt)
```

Osu ! 🥋
