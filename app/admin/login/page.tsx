'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Swords, User, Lock, Eye, EyeOff, Loader2, ShieldCheck, AlertTriangle } from 'lucide-react';
import MatrixBackground from '@/components/MatrixBackground';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get('next') || '/admin/dashboard';
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: username.trim(), password }),
      });
      const data = await res.json();
      if (res.ok) {
        router.push(next);
        router.refresh();
      } else {
        setError(data.error || 'Échec de la connexion.');
      }
    } catch {
      setError('Erreur réseau. Vérifiez votre connexion.');
    }
    setLoading(false);
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#050304] p-4">
      {/* ── Fond Matrix (pattern Uiverse teinté club) ── */}
      <MatrixBackground />

      {/* ── Carte glassmorphisme clair (style iPhone) ── */}
      <motion.div
        initial={{ opacity: 0, y: 36, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="glass-light relative w-full max-w-md rounded-[28px] p-8 sm:p-10"
      >
        {/* Reflet supérieur */}
        <div className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-white/70 to-transparent" />

        <div className="text-center">
          <motion.span
            initial={{ scale: 0, rotate: -30 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', delay: 0.2 }}
            className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-white/25 shadow-lg ring-2 ring-white/50 backdrop-blur"
          >
            <Swords className="h-7 w-7 text-white drop-shadow" />
          </motion.span>
          <h1 className="mt-4 font-display text-3xl tracking-wider text-white drop-shadow-lg">
            OKINAWA <span className="text-amber-200">SVP</span>
          </h1>
          <p className="mt-1 text-sm font-medium uppercase tracking-[0.25em] text-white/75">
            Espace d’administration
          </p>
        </div>

        {error && (
          <motion.p
            initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
            className="mt-5 flex items-start gap-2 rounded-2xl border border-red-200/40 bg-red-500/25 p-3 text-sm font-medium text-white backdrop-blur"
          >
            <AlertTriangle className="h-5 w-5 shrink-0" /> {error}
          </motion.p>
        )}

        <form onSubmit={submit} className="mt-6 space-y-4">
          <label className="block">
            <span className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-white/85">
              Nom d’utilisateur
            </span>
            <span className="relative block">
              <User className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-white/60" />
              <input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="glass-input w-full rounded-2xl py-3.5 pl-11 pr-4 font-medium backdrop-blur placeholder:font-normal"
                placeholder="ex. sensei.admin"
                autoComplete="username"
                required
              />
            </span>
          </label>

          <label className="block">
            <span className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-white/85">
              Mot de passe
            </span>
            <span className="relative block">
              <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-white/60" />
              <input
                type={show ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="glass-input w-full rounded-2xl py-3.5 pl-11 pr-12 font-medium backdrop-blur"
                placeholder="••••••••••"
                autoComplete="current-password"
                required
              />
              <button
                type="button"
                onClick={() => setShow(!show)}
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1 text-white/70 transition hover:bg-white/20 hover:text-white"
                aria-label={show ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
              >
                {show ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </span>
          </label>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-2xl bg-white/90 py-3.5 font-bold uppercase tracking-wider text-dojo-950 shadow-xl shadow-black/30 backdrop-blur transition hover:bg-white active:scale-[0.98] disabled:opacity-60"
          >
            {loading ? (
              <span className="inline-flex items-center gap-2"><Loader2 className="h-5 w-5 animate-spin" /> Vérification…</span>
            ) : (
              'Se connecter'
            )}
          </button>
        </form>

        <p className="mt-5 flex items-start gap-2 text-center text-xs leading-relaxed text-white/70">
          <ShieldCheck className="h-4 w-4 shrink-0" />
          Accès strictement réservé à l’administrateur. Chaque tentative est journalisée (date, heure, adresse IP,
          appareil). Aucune inscription n’est possible sur cette page.
        </p>
      </motion.div>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center bg-dojo-950 text-stone-400">Chargement…</div>}>
      <LoginForm />
    </Suspense>
  );
}
