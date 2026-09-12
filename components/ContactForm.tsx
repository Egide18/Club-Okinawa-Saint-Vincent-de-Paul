'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Loader2, CheckCircle2, AlertTriangle, MessageCircle } from 'lucide-react';

export default function ContactForm({ whatsapp }: { whatsapp: string }) {
  const [form, setForm] = useState({ nom: '', email: '', telephone: '', sujet: '', message: '', consentRgpd: false });
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<{ ok: boolean; message: string; details?: string[] } | null>(null);

  const waLink = `https://wa.me/${whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent('Bonjour Club Okinawa SVP ! 🥋')}`;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSending(true);
    setResult(null);
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (res.ok) {
        setResult({ ok: true, message: 'Message envoyé. Le club vous répondra dans les meilleurs délais.' });
        setForm({ nom: '', email: '', telephone: '', sujet: '', message: '', consentRgpd: false });
      } else {
        setResult({ ok: false, message: data.error || 'Veuillez vérifier le formulaire.', details: data.details });
      }
    } catch {
      setResult({ ok: false, message: 'Erreur réseau. Réessayez ou contactez-nous sur WhatsApp.' });
    }
    setSending(false);
  }

  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 sm:p-8">
      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className={`mb-5 flex items-start gap-3 rounded-2xl border p-4 text-sm ${
              result.ok ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-200' : 'border-red-500/40 bg-red-500/10 text-red-200'
            }`}
          >
            {result.ok ? <CheckCircle2 className="h-5 w-5 shrink-0" /> : <AlertTriangle className="h-5 w-5 shrink-0" />}
            <div>
              <p className="font-semibold">{result.message}</p>
              {result.details?.map((d, i) => <p key={i} className="text-xs">• {d}</p>)}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <form onSubmit={submit} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-stone-400">Nom complet *</span>
            <input className="input-dark" value={form.nom} onChange={(e) => setForm({ ...form, nom: e.target.value })} placeholder="Votre nom" required />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-stone-400">E-mail *</span>
            <input type="email" className="input-dark" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="vous@exemple.com" required />
          </label>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-stone-400">Téléphone</span>
            <input className="input-dark" value={form.telephone} onChange={(e) => setForm({ ...form, telephone: e.target.value })} placeholder="+243…" inputMode="tel" />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-stone-400">Sujet *</span>
            <select className="input-dark" value={form.sujet} onChange={(e) => setForm({ ...form, sujet: e.target.value })} required>
              <option value="">— Choisir —</option>
              <option>Pré-inscription & dossiers</option>
              <option>Horaires & tarifs</option>
              <option>Compétitions</option>
              <option>Partenariat</option>
              <option>Autre demande</option>
            </select>
          </label>
        </div>
        <label className="block">
          <span className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-stone-400">Message * (min. 10 caractères)</span>
          <textarea className="input-dark" rows={5} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} placeholder="Bonjour, je souhaite…" required minLength={10} />
        </label>
        <label className="flex cursor-pointer items-start gap-3 text-sm text-stone-300">
          <input type="checkbox" checked={form.consentRgpd} onChange={(e) => setForm({ ...form, consentRgpd: e.target.checked })} className="mt-1 h-5 w-5 shrink-0 accent-red-600" required />
          <span>J’accepte que mes données soient utilisées pour traiter ma demande, conformément à la <a href="/confidentialite" target="_blank" className="underline decoration-karate-gold/60 hover:text-karate-gold">politique de confidentialité</a>. *</span>
        </label>
        <div className="flex flex-col gap-3 sm:flex-row">
          <button type="submit" disabled={sending} className="btn-karate flex-1 disabled:opacity-50">
            {sending ? <><Loader2 className="h-4 w-4 animate-spin" /> Envoi…</> : <><Send className="h-4 w-4" /> Envoyer le message</>}
          </button>
          <a href={waLink} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#25D366] px-6 py-3 font-bold text-white shadow-lg shadow-[#25D366]/30 transition hover:brightness-110">
            <MessageCircle className="h-5 w-5" /> Discuter sur WhatsApp
          </a>
        </div>
      </form>
    </div>
  );
}
