'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Images, ClipboardList, Mails, ScrollText, Settings as SettingsIcon,
  LogOut, Plus, Trash2, CheckCircle2, XCircle, Eye, Upload, Link2, Loader2,
  Smartphone, Monitor, Tablet, Search, RefreshCw, KeyRound, Save, FileText, X,
  ShieldCheck, ExternalLink,
} from 'lucide-react';
import type { GalleryItem, Inscription, ContactMessage, LoginLog, SiteSettings } from '@/lib/store';

/* ═══════════════ Helpers ═══════════════ */

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });

function DeviceBadge({ type, model }: { type?: string; model?: string }) {
  const Icon = type === 'mobile' ? Smartphone : type === 'tablet' ? Tablet : Monitor;
  return (
    <span className="inline-flex max-w-full items-center gap-1.5 rounded-lg bg-white/8 px-2 py-1 text-xs text-stone-300 ring-1 ring-white/10">
      <Icon className="h-3.5 w-3.5 shrink-0 text-karate-gold" />
      <span className="truncate">{model || type || 'Inconnu'}</span>
    </span>
  );
}

const TABS = [
  { id: 'overview', label: 'Vue d’ensemble', icon: LayoutDashboard },
  { id: 'gallery', label: 'Galerie', icon: Images },
  { id: 'inscriptions', label: 'Inscriptions', icon: ClipboardList },
  { id: 'messages', label: 'Messages', icon: Mails },
  { id: 'logs', label: 'Logs connexion', icon: ScrollText },
  { id: 'settings', label: 'Réglages', icon: SettingsIcon },
] as const;

type TabId = (typeof TABS)[number]['id'];

const FILE_LABELS: Record<string, string> = {
  identite: 'Carte d’identité',
  lettreParents: 'Lettre des parents',
  photoPasseport: 'Photo passeport',
  certificatMedical: 'Certificat médical',
  preuvePaiement: 'Preuve de paiement',
};

/* ═══════════════ Page ═══════════════ */

export default function DashboardPage() {
  const router = useRouter();
  const [tab, setTab] = useState<TabId>('overview');
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(true);

  const [gallery, setGallery] = useState<GalleryItem[]>([]);
  const [inscriptions, setInscriptions] = useState<Inscription[]>([]);
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [logs, setLogs] = useState<LoginLog[]>([]);
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [toast, setToast] = useState<{ ok: boolean; msg: string } | null>(null);

  const notify = (ok: boolean, msg: string) => {
    setToast({ ok, msg });
    setTimeout(() => setToast(null), 3500);
  };

  const loadAll = useCallback(async () => {
    try {
      const [me, g, i, m, l, s] = await Promise.all([
        fetch('/api/auth/me').then((r) => r.json()),
        fetch('/api/gallery', { cache: 'no-store' }).then((r) => r.json()),
        fetch('/api/inscriptions', { cache: 'no-store' }).then((r) => r.json()),
        fetch('/api/contact', { cache: 'no-store' }).then((r) => r.json()),
        fetch('/api/logs', { cache: 'no-store' }).then((r) => r.json()),
        fetch('/api/settings', { cache: 'no-store' }).then((r) => r.json()),
      ]);
      if (!me.authenticated) {
        router.push('/admin/login?next=/admin/dashboard');
        return;
      }
      setUsername(me.username || '');
      if (g.items) setGallery(g.items);
      if (i.items) setInscriptions(i.items);
      if (m.items) setMessages(m.items);
      if (l.items) setLogs(l.items);
      if (s.settings) setSettings(s.settings);
    } catch {
      notify(false, 'Erreur de chargement des données.');
    }
    setLoading(false);
  }, [router]);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  async function logout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/admin/login');
    router.refresh();
  }

  const pendingIns = inscriptions.filter((i) => i.status === 'en_attente').length;
  const unreadMsg = messages.filter((m) => !m.lu).length;

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-dojo-950">
        <Loader2 className="h-10 w-10 animate-spin text-karate-gold" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dojo-950">
      {/* Barre supérieure */}
      <header className="sticky top-0 z-40 border-b border-white/10 bg-dojo-900/90 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <span className="rounded-xl bg-karate-red/15 p-2 ring-1 ring-karate-red/40">
              <ShieldCheck className="h-5 w-5 text-karate-red" />
            </span>
            <div>
              <p className="font-display text-lg leading-none tracking-wider text-white">TABLEAU DE BORD</p>
              <p className="text-xs text-stone-500">Connecté : <strong className="text-karate-gold">{username}</strong></p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={loadAll} className="rounded-xl border border-white/15 p-2.5 text-stone-300 transition hover:bg-white/10" title="Actualiser">
              <RefreshCw className="h-4 w-4" />
            </button>
            <a href="/" target="_blank" className="hidden items-center gap-1.5 rounded-xl border border-white/15 px-4 py-2.5 text-sm font-semibold text-stone-300 transition hover:bg-white/10 sm:inline-flex">
              <ExternalLink className="h-4 w-4" /> Voir le site
            </a>
            <button onClick={logout} className="inline-flex items-center gap-1.5 rounded-xl bg-karate-red px-4 py-2.5 text-sm font-bold text-white transition hover:bg-karate-darkred">
              <LogOut className="h-4 w-4" /> <span className="hidden sm:inline">Déconnexion</span>
            </button>
          </div>
        </div>
        {/* Onglets */}
        <nav className="mx-auto flex max-w-7xl gap-1 overflow-x-auto px-4 pb-3 sm:px-6">
          {TABS.map((t) => {
            const badge = t.id === 'inscriptions' ? pendingIns : t.id === 'messages' ? unreadMsg : 0;
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`relative flex shrink-0 items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
                  tab === t.id ? 'bg-karate-red text-white shadow-lg shadow-karate-red/30' : 'text-stone-400 hover:bg-white/5 hover:text-white'
                }`}
              >
                <t.icon className="h-4 w-4" /> {t.label}
                {badge > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-karate-gold px-1 text-[11px] font-bold text-dojo-950">
                    {badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <AnimatePresence mode="wait">
          <motion.div key={tab} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.25 }}>
            {tab === 'overview' && <Overview gallery={gallery} inscriptions={inscriptions} messages={messages} logs={logs} go={setTab} />}
            {tab === 'gallery' && <GalleryManager items={gallery} setItems={setGallery} notify={notify} />}
            {tab === 'inscriptions' && <InscriptionsManager items={inscriptions} setItems={setInscriptions} notify={notify} />}
            {tab === 'messages' && <MessagesManager items={messages} setItems={setMessages} notify={notify} />}
            {tab === 'logs' && <LogsViewer logs={logs} />}
            {tab === 'settings' && settings && <SettingsManager settings={settings} setSettings={setSettings} notify={notify} username={username} />}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 12 }}
            className={`fixed bottom-6 left-1/2 z-[80] flex -translate-x-1/2 items-center gap-2 rounded-2xl border px-5 py-3 text-sm font-semibold shadow-2xl ${
              toast.ok ? 'border-emerald-500/40 bg-emerald-950/95 text-emerald-200' : 'border-red-500/40 bg-red-950/95 text-red-200'
            }`}
          >
            {toast.ok ? <CheckCircle2 className="h-5 w-5" /> : <XCircle className="h-5 w-5" />} {toast.msg}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ═══════════════ Vue d'ensemble ═══════════════ */

function Overview({ gallery, inscriptions, messages, logs, go }: {
  gallery: GalleryItem[]; inscriptions: Inscription[]; messages: ContactMessage[]; logs: LoginLog[]; go: (t: TabId) => void;
}) {
  const cards = [
    { label: 'Médias galerie', value: gallery.length, icon: Images, tab: 'gallery' as TabId, color: 'text-sky-400' },
    { label: 'Inscriptions en attente', value: inscriptions.filter((i) => i.status === 'en_attente').length, icon: ClipboardList, tab: 'inscriptions' as TabId, color: 'text-amber-400' },
    { label: 'Messages non lus', value: messages.filter((m) => !m.lu).length, icon: Mails, tab: 'messages' as TabId, color: 'text-emerald-400' },
    { label: 'Connexions journalisées', value: logs.length, icon: ScrollText, tab: 'logs' as TabId, color: 'text-violet-400' },
  ];
  return (
    <div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => (
          <button key={c.label} onClick={() => go(c.tab)} className="card-hover rounded-2xl border border-white/10 bg-white/5 p-6 text-left">
            <c.icon className={`h-7 w-7 ${c.color}`} />
            <p className="mt-3 font-display text-5xl text-white">{c.value}</p>
            <p className="mt-1 text-sm text-stone-400">{c.label}</p>
          </button>
        ))}
      </div>
      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
          <h3 className="font-display text-xl tracking-wider text-karate-gold">DERNIÈRES INSCRIPTIONS</h3>
          <ul className="mt-3 space-y-2 text-sm">
            {inscriptions.slice(0, 5).map((i) => (
              <li key={i.id} className="flex items-center justify-between rounded-xl bg-black/30 px-3 py-2">
                <span className="truncate text-stone-200">{i.nom} {i.prenom} <span className="text-stone-500">• {i.categorie}</span></span>
                <StatusPill status={i.status} />
              </li>
            ))}
            {inscriptions.length === 0 && <li className="text-stone-500">Aucune inscription pour le moment.</li>}
          </ul>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
          <h3 className="font-display text-xl tracking-wider text-karate-gold">DERNIÈRES CONNEXIONS</h3>
          <ul className="mt-3 space-y-2 text-sm">
            {logs.slice(0, 5).map((l) => (
              <li key={l.id} className="flex items-center justify-between gap-2 rounded-xl bg-black/30 px-3 py-2">
                <span className="truncate text-stone-200">{l.username} <span className="text-stone-500">• {l.ip}</span></span>
                <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-bold ${l.success ? 'bg-emerald-500/15 text-emerald-400' : 'bg-red-500/15 text-red-400'}`}>
                  {l.success ? 'OK' : 'Échec'}
                </span>
              </li>
            ))}
            {logs.length === 0 && <li className="text-stone-500">Aucun log pour le moment.</li>}
          </ul>
        </div>
      </div>
    </div>
  );
}

function StatusPill({ status }: { status: Inscription['status'] }) {
  const map = {
    en_attente: 'bg-amber-500/15 text-amber-400',
    validee: 'bg-emerald-500/15 text-emerald-400',
    rejetee: 'bg-red-500/15 text-red-400',
  } as const;
  const label = { en_attente: 'En attente', validee: 'Validée', rejetee: 'Rejetée' }[status];
  return <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-bold ${map[status]}`}>{label}</span>;
}

/* ═══════════════ Galerie (upload direct) ═══════════════ */

function GalleryManager({ items, setItems, notify }: {
  items: GalleryItem[]; setItems: (v: GalleryItem[]) => void; notify: (ok: boolean, msg: string) => void;
}) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [url, setUrl] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [mode, setMode] = useState<'file' | 'url'>('file');

  async function upload() {
    if (!title.trim()) return notify(false, 'Donnez un titre au média.');
    if (mode === 'file' && !file) return notify(false, 'Choisissez un fichier image ou vidéo.');
    if (mode === 'url' && !/^https:\/\//.test(url)) return notify(false, 'URL invalide (https requise).');
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('title', title);
      fd.append('description', description);
      if (mode === 'file' && file) fd.append('file', file);
      if (mode === 'url') fd.append('url', url);
      const res = await fetch('/api/gallery', { method: 'POST', body: fd });
      const data = await res.json();
      if (res.ok) {
        setItems([data.item, ...items]);
        setTitle(''); setDescription(''); setUrl(''); setFile(null);
        notify(true, 'Média ajouté à la galerie. 🥋');
      } else notify(false, data.error || 'Échec de l’envoi.');
    } catch {
      notify(false, 'Erreur réseau.');
    }
    setUploading(false);
  }

  async function remove(id: string) {
    if (!confirm('Supprimer définitivement ce média ?')) return;
    const res = await fetch(`/api/gallery/${id}`, { method: 'DELETE' });
    if (res.ok) {
      setItems(items.filter((i) => i.id !== id));
      notify(true, 'Média supprimé.');
    } else notify(false, 'Suppression impossible.');
  }

  return (
    <div>
      <div className="rounded-2xl border border-karate-gold/25 bg-gradient-to-b from-karate-gold/8 to-transparent p-6">
        <h3 className="flex items-center gap-2 font-display text-2xl tracking-wider text-white">
          <Plus className="h-5 w-5 text-karate-gold" /> AJOUTER UN MÉDIA
        </h3>
        <div className="mt-4 flex gap-2">
          <button onClick={() => setMode('file')} className={`rounded-xl px-4 py-2 text-sm font-semibold ${mode === 'file' ? 'bg-karate-red text-white' : 'border border-white/15 text-stone-300'}`}>
            <Upload className="mr-1 inline h-4 w-4" /> Fichier
          </button>
          <button onClick={() => setMode('url')} className={`rounded-xl px-4 py-2 text-sm font-semibold ${mode === 'url' ? 'bg-karate-red text-white' : 'border border-white/15 text-stone-300'}`}>
            <Link2 className="mr-1 inline h-4 w-4" /> URL externe
          </button>
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <input className="input-dark" placeholder="Titre * (ex. Kata Heian Shodan)" value={title} onChange={(e) => setTitle(e.target.value)} />
          <input className="input-dark" placeholder="Description (optionnelle)" value={description} onChange={(e) => setDescription(e.target.value)} />
        </div>
        <div className="mt-3">
          {mode === 'file' ? (
            <label className="block cursor-pointer rounded-2xl border border-dashed border-white/25 bg-black/30 p-6 text-center transition hover:border-karate-gold/60">
              <Upload className="mx-auto h-8 w-8 text-karate-gold" />
              <p className="mt-2 text-sm text-stone-300">{file ? <strong className="text-white">{file.name}</strong> : 'Cliquez pour choisir une image (JPG/PNG/WebP) ou vidéo (MP4/WebM)'}</p>
              <p className="text-xs text-stone-500">Max 100 Mo — stocké sur Vercel Blob en production</p>
              <input type="file" accept="image/jpeg,image/png,image/webp,video/mp4,video/webm" className="hidden" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
            </label>
          ) : (
            <input className="input-dark" placeholder="https://… (MP4, YouTube…)" value={url} onChange={(e) => setUrl(e.target.value)} />
          )}
        </div>
        <button onClick={upload} disabled={uploading} className="btn-karate mt-4 disabled:opacity-50">
          {uploading ? <><Loader2 className="h-4 w-4 animate-spin" /> Envoi en cours…</> : <><Plus className="h-4 w-4" /> Publier dans la galerie</>}
        </button>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => (
          <article key={item.id} className="overflow-hidden rounded-2xl border border-white/10 bg-white/5">
            <div className="relative aspect-video bg-black">
              {item.type === 'image' ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={item.url} alt={item.title} className="h-full w-full object-cover" loading="lazy" />
              ) : (
                <video src={item.url} className="h-full w-full object-cover" muted preload="metadata" />
              )}
              <span className="absolute left-2 top-2 rounded-lg bg-black/70 px-2 py-0.5 text-xs font-bold text-white">
                {item.type === 'video' ? '🎬 Vidéo' : '📷 Photo'}
              </span>
            </div>
            <div className="flex items-center justify-between gap-2 p-4">
              <div className="min-w-0">
                <p className="truncate font-semibold text-white">{item.title}</p>
                <p className="text-xs text-stone-500">{fmtDate(item.createdAt)}</p>
              </div>
              <button onClick={() => remove(item.id)} className="rounded-xl border border-red-500/40 p-2.5 text-red-400 transition hover:bg-red-500/15" title="Supprimer">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </article>
        ))}
      </div>
      {items.length === 0 && <p className="mt-6 text-center text-stone-500">Galerie vide — ajoutez votre premier média ci-dessus.</p>}
    </div>
  );
}

/* ═══════════════ Inscriptions ═══════════════ */

function InscriptionsManager({ items, setItems, notify }: {
  items: Inscription[]; setItems: (v: Inscription[]) => void; notify: (ok: boolean, msg: string) => void;
}) {
  const [filter, setFilter] = useState<'all' | Inscription['status']>('all');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<Inscription | null>(null);

  const filtered = items.filter((i) =>
    (filter === 'all' || i.status === filter) &&
    (!search || `${i.nom} ${i.postnom} ${i.prenom} ${i.telephone}`.toLowerCase().includes(search.toLowerCase()))
  );

  async function setStatus(id: string, status: Inscription['status']) {
    const res = await fetch(`/api/inscriptions/${id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status }),
    });
    const data = await res.json();
    if (res.ok) {
      setItems(items.map((i) => (i.id === id ? data.item : i)));
      if (selected?.id === id) setSelected(data.item);
      notify(true, status === 'validee' ? 'Candidature validée ✅' : status === 'rejetee' ? 'Candidature rejetée.' : 'Statut mis à jour.');
    } else notify(false, data.error || 'Échec.');
  }

  return (
    <div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-500" />
          <input className="input-dark pl-10" placeholder="Rechercher nom, téléphone…" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <div className="flex gap-2">
          {(['all', 'en_attente', 'validee', 'rejetee'] as const).map((f) => (
            <button key={f} onClick={() => setFilter(f)} className={`rounded-xl px-3 py-2 text-sm font-semibold ${filter === f ? 'bg-karate-red text-white' : 'border border-white/15 text-stone-300'}`}>
              {f === 'all' ? 'Toutes' : f === 'en_attente' ? 'En attente' : f === 'validee' ? 'Validées' : 'Rejetées'}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-4 overflow-x-auto rounded-2xl border border-white/10">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead>
            <tr className="border-b border-white/10 bg-white/5 text-xs uppercase tracking-wider text-stone-400">
              <th className="px-4 py-3">Candidat</th>
              <th className="px-4 py-3">Âge / Cat.</th>
              <th className="px-4 py-3">Appareil</th>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Statut</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((i) => (
              <tr key={i.id} className="border-b border-white/5 transition hover:bg-white/5">
                <td className="px-4 py-3">
                  <p className="font-semibold text-white">{i.nom} {i.postnom} {i.prenom}</p>
                  <p className="text-xs text-stone-500">{i.telephone}{i.email ? ` • ${i.email}` : ''}</p>
                </td>
                <td className="px-4 py-3 text-stone-300">{i.age} ans<br /><span className="text-xs text-stone-500">{i.categorie}</span></td>
                <td className="px-4 py-3"><DeviceBadge type={i.deviceType} model={i.phoneModel} /></td>
                <td className="whitespace-nowrap px-4 py-3 text-xs text-stone-400">{fmtDate(i.createdAt)}</td>
                <td className="px-4 py-3"><StatusPill status={i.status} /></td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-1.5">
                    <button onClick={() => setSelected(i)} className="rounded-lg border border-white/15 p-2 text-stone-300 hover:bg-white/10" title="Voir le dossier"><Eye className="h-4 w-4" /></button>
                    <button onClick={() => setStatus(i.id, 'validee')} className="rounded-lg border border-emerald-500/40 p-2 text-emerald-400 hover:bg-emerald-500/15" title="Valider"><CheckCircle2 className="h-4 w-4" /></button>
                    <button onClick={() => setStatus(i.id, 'rejetee')} className="rounded-lg border border-red-500/40 p-2 text-red-400 hover:bg-red-500/15" title="Rejeter"><XCircle className="h-4 w-4" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && <p className="p-6 text-center text-stone-500">Aucune inscription trouvée.</p>}
      </div>

      {/* Détail dossier */}
      <AnimatePresence>
        {selected && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[70] overflow-y-auto bg-black/70 p-4 backdrop-blur-sm" onClick={() => setSelected(null)}>
            <motion.div initial={{ y: 30, scale: 0.98 }} animate={{ y: 0, scale: 1 }} exit={{ y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="mx-auto my-8 w-full max-w-2xl rounded-3xl border border-white/15 bg-dojo-900 p-6 sm:p-8">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-display text-3xl tracking-wide text-white">DOSSIER CANDIDAT</h3>
                  <p className="text-sm text-stone-400">{selected.nom} {selected.postnom} {selected.prenom} — {selected.age} ans ({selected.sexe === 'M' ? 'M' : 'F'})</p>
                </div>
                <button onClick={() => setSelected(null)} className="rounded-xl border border-white/15 p-2 text-stone-300 hover:bg-white/10"><X className="h-5 w-5" /></button>
              </div>

              <div className="mt-5 grid gap-2 text-sm sm:grid-cols-2">
                <Info k="Naissance" v={selected.dateNaissance} />
                <Info k="Nationalité" v={selected.nationalite || '—'} />
                <Info k="Téléphone" v={selected.telephone} />
                <Info k="E-mail" v={selected.email || '—'} />
                <Info k="Adresse" v={selected.adresse} />
                <Info k="Catégorie" v={`${selected.categorie}${selected.niveau ? ` (${selected.niveau})` : ''}`} />
                {selected.parentNom && <Info k="Parent/tuteur" v={`${selected.parentNom} — ${selected.parentTelephone} ${selected.parentLien ? `(${selected.parentLien})` : ''}`} />}
                {selected.antecedentsMedicaux && <Info k="Santé" v={selected.antecedentsMedicaux} />}
                {(selected.personneUrgence || selected.telUrgence) && <Info k="Urgence" v={`${selected.personneUrgence || ''} ${selected.telUrgence || ''}`} />}
                <Info k="Soumis le" v={fmtDate(selected.createdAt)} />
                <Info k="IP / Appareil" v={`${selected.ip || '?'} • ${selected.phoneModel || selected.deviceType || '?'}`} />
              </div>

              <h4 className="mt-6 font-display text-xl tracking-widest text-karate-gold">PIÈCES JUSTIFICATIVES</h4>
              <ul className="mt-3 space-y-2">
                {Object.entries(FILE_LABELS).map(([key, label]) => {
                  const fileUrl = (selected.files as Record<string, string | undefined>)[key];
                  return (
                    <li key={key} className="flex items-center justify-between gap-2 rounded-xl border border-white/10 bg-black/30 px-4 py-2.5 text-sm">
                      <span className="flex items-center gap-2 text-stone-200">
                        <FileText className="h-4 w-4 text-karate-gold" /> {label}
                        {selected.fileNames?.[key] && <span className="hidden text-xs text-stone-500 sm:inline">({selected.fileNames[key]})</span>}
                      </span>
                      {fileUrl ? (
                        <a href={fileUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 font-bold text-karate-gold hover:underline">
                          Ouvrir <ExternalLink className="h-3.5 w-3.5" />
                        </a>
                      ) : <span className="text-xs font-bold text-red-400">Manquant</span>}
                    </li>
                  );
                })}
              </ul>

              <div className="mt-6 flex flex-col gap-2 sm:flex-row">
                <button onClick={() => setStatus(selected.id, 'validee')} className="flex-1 rounded-xl bg-emerald-600 px-4 py-3 text-sm font-bold text-white hover:bg-emerald-500">✅ Valider la candidature</button>
                <button onClick={() => setStatus(selected.id, 'rejetee')} className="flex-1 rounded-xl bg-red-700 px-4 py-3 text-sm font-bold text-white hover:bg-red-600">❌ Rejeter</button>
                <button onClick={() => setStatus(selected.id, 'en_attente')} className="rounded-xl border border-white/20 px-4 py-3 text-sm font-bold text-stone-300 hover:bg-white/10">En attente</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Info({ k, v }: { k: string; v: string }) {
  return (
    <div className="rounded-xl bg-white/5 px-3 py-2">
      <p className="text-[11px] font-bold uppercase tracking-wider text-stone-500">{k}</p>
      <p className="text-stone-200">{v}</p>
    </div>
  );
}

/* ═══════════════ Messages ═══════════════ */

function MessagesManager({ items, setItems, notify }: {
  items: ContactMessage[]; setItems: (v: ContactMessage[]) => void; notify: (ok: boolean, msg: string) => void;
}) {
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const [open, setOpen] = useState<ContactMessage | null>(null);

  const filtered = items.filter((m) => filter === 'all' || !m.lu);

  async function toggleRead(m: ContactMessage) {
    const res = await fetch('/api/contact', {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: m.id, lu: !m.lu }),
    });
    if (res.ok) {
      setItems(items.map((x) => (x.id === m.id ? { ...x, lu: !x.lu } : x)));
      if (open?.id === m.id) setOpen({ ...m, lu: !m.lu });
    }
  }

  async function remove(id: string) {
    if (!confirm('Supprimer ce message ?')) return;
    const res = await fetch(`/api/contact?id=${id}`, { method: 'DELETE' });
    if (res.ok) {
      setItems(items.filter((x) => x.id !== id));
      setOpen(null);
      notify(true, 'Message supprimé.');
    }
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[380px_1fr]">
      <div>
        <div className="mb-3 flex gap-2">
          <button onClick={() => setFilter('all')} className={`rounded-xl px-3 py-2 text-sm font-semibold ${filter === 'all' ? 'bg-karate-red text-white' : 'border border-white/15 text-stone-300'}`}>Tous ({items.length})</button>
          <button onClick={() => setFilter('unread')} className={`rounded-xl px-3 py-2 text-sm font-semibold ${filter === 'unread' ? 'bg-karate-red text-white' : 'border border-white/15 text-stone-300'}`}>Non lus ({items.filter((m) => !m.lu).length})</button>
        </div>
        <ul className="max-h-[60vh] space-y-2 overflow-y-auto pr-1">
          {filtered.map((m) => (
            <li key={m.id}>
              <button onClick={() => setOpen(m)} className={`w-full rounded-2xl border p-4 text-left transition ${open?.id === m.id ? 'border-karate-gold/60 bg-karate-gold/5' : m.lu ? 'border-white/10 bg-white/5' : 'border-karate-red/40 bg-karate-red/5'} hover:border-karate-gold/40`}>
                <div className="flex items-center justify-between gap-2">
                  <p className="truncate font-bold text-white">{m.nom}</p>
                  {!m.lu && <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-karate-red" />}
                </div>
                <p className="truncate text-sm text-karate-gold">{m.sujet}</p>
                <p className="mt-1 line-clamp-2 text-xs text-stone-400">{m.message}</p>
                <p className="mt-2 text-[11px] text-stone-500">{fmtDate(m.createdAt)}</p>
              </button>
            </li>
          ))}
          {filtered.length === 0 && <li className="rounded-2xl border border-white/10 p-6 text-center text-sm text-stone-500">Aucun message.</li>}
        </ul>
      </div>

      <div className="min-h-[300px] rounded-2xl border border-white/10 bg-white/5 p-6">
        {open ? (
          <div>
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="font-display text-2xl tracking-wide text-white">{open.sujet}</h3>
                <p className="text-sm text-stone-400">De <strong className="text-white">{open.nom}</strong> • {open.email}{open.telephone ? ` • ${open.telephone}` : ''}</p>
              </div>
              <button onClick={() => setOpen(null)} className="rounded-xl border border-white/15 p-2 text-stone-300 hover:bg-white/10 lg:hidden"><X className="h-4 w-4" /></button>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              <DeviceBadge type={open.deviceType} model={open.phoneModel} />
              <span className="rounded-lg bg-white/8 px-2 py-1 text-xs text-stone-400 ring-1 ring-white/10">IP : {open.ip || '?'}</span>
              <span className="rounded-lg bg-white/8 px-2 py-1 text-xs text-stone-400 ring-1 ring-white/10">{fmtDate(open.createdAt)}</span>
            </div>
            <p className="mt-4 whitespace-pre-line rounded-2xl bg-black/30 p-5 text-sm leading-relaxed text-stone-200">{open.message}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              <a href={`mailto:${open.email}?subject=${encodeURIComponent('Re: ' + open.sujet)}`} className="rounded-xl bg-karate-gold px-4 py-2.5 text-sm font-bold text-dojo-950 hover:brightness-110">Répondre par e-mail</a>
              <button onClick={() => toggleRead(open)} className="rounded-xl border border-white/20 px-4 py-2.5 text-sm font-semibold text-stone-200 hover:bg-white/10">
                {open.lu ? 'Marquer non lu' : 'Marquer comme lu'}
              </button>
              <button onClick={() => remove(open.id)} className="rounded-xl border border-red-500/40 px-4 py-2.5 text-sm font-semibold text-red-400 hover:bg-red-500/15">Supprimer</button>
            </div>
          </div>
        ) : (
          <p className="flex h-full items-center justify-center text-sm text-stone-500">← Sélectionnez un message pour le lire.</p>
        )}
      </div>
    </div>
  );
}

/* ═══════════════ Logs de connexion ═══════════════ */

function LogsViewer({ logs }: { logs: LoginLog[] }) {
  const [onlyFailures, setOnlyFailures] = useState(false);
  const filtered = logs.filter((l) => !onlyFailures || !l.success);
  return (
    <div>
      <div className="flex items-center justify-between">
        <p className="text-sm text-stone-400">
          Journal des tentatives de connexion — date, heure, utilisateur, adresse IP et appareil. Conservé 12 mois.
        </p>
        <label className="flex shrink-0 cursor-pointer items-center gap-2 text-sm text-stone-300">
          <input type="checkbox" checked={onlyFailures} onChange={(e) => setOnlyFailures(e.target.checked)} className="h-4 w-4 accent-red-600" />
          Échecs uniquement
        </label>
      </div>
      <div className="mt-4 overflow-x-auto rounded-2xl border border-white/10">
        <table className="w-full min-w-[820px] text-left text-sm">
          <thead>
            <tr className="border-b border-white/10 bg-white/5 text-xs uppercase tracking-wider text-stone-400">
              <th className="px-4 py-3">Date & heure</th>
              <th className="px-4 py-3">Utilisateur</th>
              <th className="px-4 py-3">Résultat</th>
              <th className="px-4 py-3">Adresse IP</th>
              <th className="px-4 py-3">Appareil / téléphone</th>
              <th className="px-4 py-3">Navigateur</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((l) => (
              <tr key={l.id} className="border-b border-white/5 hover:bg-white/5">
                <td className="whitespace-nowrap px-4 py-2.5 text-xs text-stone-300">{fmtDate(l.createdAt)}</td>
                <td className="px-4 py-2.5 font-semibold text-white">{l.username}</td>
                <td className="px-4 py-2.5">
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${l.success ? 'bg-emerald-500/15 text-emerald-400' : 'bg-red-500/15 text-red-400'}`}>
                    {l.success ? 'Succès' : 'Échec'}
                  </span>
                </td>
                <td className="px-4 py-2.5 font-mono text-xs text-stone-300">{l.ip}</td>
                <td className="px-4 py-2.5"><DeviceBadge type={l.deviceType} model={`${l.phoneModel} • ${l.os}`} /></td>
                <td className="px-4 py-2.5 text-xs text-stone-400">{l.browser}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && <p className="p-6 text-center text-stone-500">Aucun log.</p>}
      </div>
    </div>
  );
}

/* ═══════════════ Réglages + sécurité compte ═══════════════ */

function SettingsManager({ settings, setSettings, notify, username }: {
  settings: SiteSettings; setSettings: (v: SiteSettings) => void; notify: (ok: boolean, msg: string) => void; username: string;
}) {
  const [draft, setDraft] = useState<SiteSettings>(settings);
  const [saving, setSaving] = useState(false);
  const [pw, setPw] = useState({ current: '', next: '', confirm: '', username });
  const [pwLoading, setPwLoading] = useState(false);

  useEffect(() => setDraft(settings), [settings]);

  async function save() {
    setSaving(true);
    try {
      const res = await fetch('/api/settings', {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(draft),
      });
      const data = await res.json();
      if (res.ok) {
        setSettings(data.settings);
        notify(true, 'Réglages enregistrés. ✨');
      } else notify(false, data.error || 'Échec.');
    } catch {
      notify(false, 'Erreur réseau.');
    }
    setSaving(false);
  }

  async function changePassword() {
    if (pw.next !== pw.confirm) return notify(false, 'La confirmation ne correspond pas.');
    if (pw.next.length < 8) return notify(false, '8 caractères minimum.');
    setPwLoading(true);
    try {
      const res = await fetch('/api/admin/password', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ current: pw.current, next: pw.next, username: pw.username }),
      });
      const data = await res.json();
      if (res.ok) {
        setPw({ current: '', next: '', confirm: '', username: pw.username });
        notify(true, 'Identifiants mis à jour (mot de passe chiffré).');
      } else notify(false, data.error || 'Échec.');
    } catch {
      notify(false, 'Erreur réseau.');
    }
    setPwLoading(false);
  }

  const input = (label: string, key: keyof SiteSettings, textarea = false, rows = 3) => (
    <label className="block">
      <span className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-stone-400">{label}</span>
      {textarea ? (
        <textarea className="input-dark" rows={rows} value={String(draft[key] ?? '')} onChange={(e) => setDraft({ ...draft, [key]: e.target.value })} />
      ) : (
        <input className="input-dark" value={String(draft[key] ?? '')} onChange={(e) => setDraft({ ...draft, [key]: e.target.value })} />
      )}
    </label>
  );

  return (
    <div className="space-y-6">
      {/* Contenus */}
      <section className="rounded-2xl border border-white/10 bg-white/5 p-6">
        <h3 className="font-display text-2xl tracking-wider text-karate-gold">CONTENUS DU SITE</h3>
        <div className="mt-4 grid gap-4">
          {input('Slogan (accueil)', 'slogan')}
          {input('Paragraphe d’accueil (modifiable)', 'paragrapheAccueil', true, 4)}
          <div className="grid gap-4 sm:grid-cols-2">
            {input('Nom du Sensei', 'senseiNom')}
            {input('Grade du Sensei', 'senseiGrade')}
          </div>
          {input('Histoire du Sensei', 'histoireSensei', true, 5)}
          {input('Historique du club', 'historiqueClub', true, 5)}
          {input('Hymne du club', 'hymne', true, 6)}
        </div>
      </section>

      {/* Stats */}
      <section className="rounded-2xl border border-white/10 bg-white/5 p-6">
        <h3 className="font-display text-2xl tracking-wider text-karate-gold">STATISTIQUES (COMPTAGE ANIMÉ)</h3>
        <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {(['combats', 'victoires', 'titres', 'athletes'] as const).map((k) => (
            <label key={k} className="block">
              <span className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-stone-400">
                {k === 'combats' ? 'Combats' : k === 'victoires' ? 'Victoires' : k === 'titres' ? 'Titres' : 'Athlètes'}
              </span>
              <input type="number" min={0} className="input-dark" value={draft.stats[k]}
                onChange={(e) => setDraft({ ...draft, stats: { ...draft.stats, [k]: Math.max(0, Number(e.target.value) || 0) } })} />
            </label>
          ))}
        </div>
      </section>

      {/* Partenaires + slider */}
      <section className="rounded-2xl border border-white/10 bg-white/5 p-6">
        <h3 className="font-display text-2xl tracking-wider text-karate-gold">PARTENAIRES & SLIDER</h3>
        <div className="mt-4 space-y-2">
          {draft.partenaires.map((p, i) => (
            <div key={i} className="flex gap-2">
              <input className="input-dark flex-1" placeholder="Nom du partenaire" value={p.nom}
                onChange={(e) => { const arr = [...draft.partenaires]; arr[i] = { ...arr[i], nom: e.target.value }; setDraft({ ...draft, partenaires: arr }); }} />
              <input className="input-dark flex-1" placeholder="URL du logo (optionnel)" value={p.logo}
                onChange={(e) => { const arr = [...draft.partenaires]; arr[i] = { ...arr[i], logo: e.target.value }; setDraft({ ...draft, partenaires: arr }); }} />
              <button onClick={() => setDraft({ ...draft, partenaires: draft.partenaires.filter((_, j) => j !== i) })}
                className="rounded-xl border border-red-500/40 p-2.5 text-red-400 hover:bg-red-500/15"><Trash2 className="h-4 w-4" /></button>
            </div>
          ))}
          <button onClick={() => setDraft({ ...draft, partenaires: [...draft.partenaires, { nom: '', logo: '' }] })}
            className="rounded-xl border border-dashed border-white/25 px-4 py-2 text-sm font-semibold text-stone-300 hover:border-karate-gold/60">
            + Ajouter un partenaire
          </button>
        </div>
        <div className="mt-4 space-y-2">
          <p className="text-xs font-bold uppercase tracking-wider text-stone-400">Textes du slider d’accueil</p>
          {draft.sliderTextes.map((t, i) => (
            <div key={i} className="flex gap-2">
              <input className="input-dark flex-1" value={t}
                onChange={(e) => { const arr = [...draft.sliderTextes]; arr[i] = e.target.value; setDraft({ ...draft, sliderTextes: arr }); }} />
              <button onClick={() => setDraft({ ...draft, sliderTextes: draft.sliderTextes.filter((_, j) => j !== i) })}
                className="rounded-xl border border-red-500/40 p-2.5 text-red-400 hover:bg-red-500/15"><Trash2 className="h-4 w-4" /></button>
            </div>
          ))}
          <button onClick={() => setDraft({ ...draft, sliderTextes: [...draft.sliderTextes, ''] })}
            className="rounded-xl border border-dashed border-white/25 px-4 py-2 text-sm font-semibold text-stone-300 hover:border-karate-gold/60">
            + Ajouter un texte
          </button>
        </div>
      </section>

      {/* Coordonnées */}
      <section className="rounded-2xl border border-white/10 bg-white/5 p-6">
        <h3 className="font-display text-2xl tracking-wider text-karate-gold">COORDONNÉES</h3>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {input('WhatsApp (chiffres, indicatif inclus)', 'whatsapp')}
          {input('E-mail du club', 'emailClub')}
          {input('Adresse du club', 'adresseClub')}
          {input('Horaires', 'horairesClub')}
        </div>
      </section>

      <button onClick={save} disabled={saving} className="btn-gold w-full sm:w-auto disabled:opacity-50">
        {saving ? <><Loader2 className="h-4 w-4 animate-spin" /> Enregistrement…</> : <><Save className="h-4 w-4" /> Enregistrer tous les réglages</>}
      </button>

      {/* Sécurité du compte */}
      <section className="rounded-2xl border border-karate-red/30 bg-karate-red/5 p-6">
        <h3 className="flex items-center gap-2 font-display text-2xl tracking-wider text-white">
          <KeyRound className="h-5 w-5 text-karate-red" /> SÉCURITÉ DU COMPTE ADMIN
        </h3>
        <p className="mt-1 text-sm text-stone-400">Compte unique stocké en base de données, mot de passe chiffré (bcrypt). Aucune inscription publique n’existe.</p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-stone-400">Nom d’utilisateur</span>
            <input className="input-dark" value={pw.username} onChange={(e) => setPw({ ...pw, username: e.target.value })} />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-stone-400">Mot de passe actuel *</span>
            <input type="password" className="input-dark" value={pw.current} onChange={(e) => setPw({ ...pw, current: e.target.value })} autoComplete="current-password" />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-stone-400">Nouveau mot de passe * (8+ caractères)</span>
            <input type="password" className="input-dark" value={pw.next} onChange={(e) => setPw({ ...pw, next: e.target.value })} autoComplete="new-password" />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-stone-400">Confirmer le nouveau *</span>
            <input type="password" className="input-dark" value={pw.confirm} onChange={(e) => setPw({ ...pw, confirm: e.target.value })} autoComplete="new-password" />
          </label>
        </div>
        <button onClick={changePassword} disabled={pwLoading} className="btn-karate mt-4 disabled:opacity-50">
          {pwLoading ? <><Loader2 className="h-4 w-4 animate-spin" /> Mise à jour…</> : 'Mettre à jour les identifiants'}
        </button>
      </section>
    </div>
  );
}
