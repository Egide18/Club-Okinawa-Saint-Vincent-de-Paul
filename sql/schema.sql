-- Schéma miroir Vercel Postgres — Club Okinawa Saint-Vincent-de-Paul
-- Créer une base "Vercel Postgres" puis exécuter ce script (ou laisser l'app créer les tables via ensureSchema()).

CREATE TABLE IF NOT EXISTS gallery_items (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL CHECK (type IN ('image','video')),
  url TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by TEXT
);

CREATE TABLE IF NOT EXISTS inscriptions (
  id TEXT PRIMARY KEY,
  data JSONB NOT NULL,
  status TEXT DEFAULT 'en_attente',
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_inscriptions_status ON inscriptions(status);

CREATE TABLE IF NOT EXISTS contact_messages (
  id TEXT PRIMARY KEY,
  data JSONB NOT NULL,
  lu BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS login_logs (
  id TEXT PRIMARY KEY,
  data JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_login_logs_created ON login_logs(created_at DESC);

CREATE TABLE IF NOT EXISTS app_settings (
  id TEXT PRIMARY KEY,
  data JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS admin_users (
  id TEXT PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Compte admin initial (hash bcrypt à remplacer par le vôtre : npm run seed:admin)
-- INSERT INTO admin_users (id, username, password_hash)
-- VALUES ('admin-primary', 'sensei.admin', '$2a$12$...')
-- ON CONFLICT (id) DO NOTHING;
