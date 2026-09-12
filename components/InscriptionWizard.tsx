'use client';

import { useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BookOpenCheck, CheckCircle2, AlertTriangle, Upload, FileCheck2, Pencil,
  ChevronRight, ChevronLeft, Send, Loader2, IdCard, LetterText, Camera, Stethoscope, Receipt,
} from 'lucide-react';

/* ─── Étape 1 : instructions obligatoires ─── */
const INSTRUCTIONS = [
  {
    icon: IdCard,
    title: '1. Carte d’identité',
    text: 'Fournir la carte d’identité sous format image ou fichier (JPG, JPEG, PNG, PDF) — 5 Mo maximum par téléversement.',
  },
  {
    icon: LetterText,
    title: '2. Lettre d’adhésion des parents',
    text: 'Fournir une lettre de demande libre d’adhésion rédigée par les parents pour les mineurs (7 à 17 ans). Optionnelle pour les adultes (18 ans et plus).',
  },
  {
    icon: Camera,
    title: '3. Photo passeport',
    text: 'Fournir une photo d’identité / passeport (JPG, JPEG, PNG, PDF) — 5 Mo maximum par téléversement.',
  },
  {
    icon: Stethoscope,
    title: '4. Certificat médical',
    text: 'Fournir un certificat médical d’aptitude physique autorisant l’adhérent(e), établi par un médecin compétent (JPG, JPEG, PNG, PDF).',
  },
  {
    icon: Receipt,
    title: '5. Preuve de paiement',
    text: 'Fournir une preuve de paiement (capture d’écran du transfert / reçu).',
  },
];

const FILE_INPUTS = [
  { key: 'identite', label: 'Carte d’identité *', hint: 'JPG, JPEG, PNG ou PDF — max 5 Mo' },
  { key: 'lettreParents', label: 'Lettre des parents', hint: 'Obligatoire 7–17 ans • optionnelle 18+ ans' },
  { key: 'photoPasseport', label: 'Photo passeport *', hint: 'JPG, JPEG, PNG ou PDF — max 5 Mo' },
  { key: 'certificatMedical', label: 'Certificat médical *', hint: 'JPG, JPEG, PNG ou PDF — max 5 Mo' },
  { key: 'preuvePaiement', label: 'Preuve de paiement *', hint: 'Capture d’écran / reçu' },
] as const;

type FileKey = (typeof FILE_INPUTS)[number]['key'];

interface FormState {
  nom: string; postnom: string; prenom: string; dateNaissance: string;
  sexe: string; nationalite: string; adresse: string; telephone: string; email: string;
  parentNom: string; parentTelephone: string; parentLien: string;
  categorie: string; niveau: string; antecedentsMedicaux: string;
  personneUrgence: string; telUrgence: string; consentRgpd: boolean;
}

const EMPTY: FormState = {
  nom: '', postnom: '', prenom: '', dateNaissance: '', sexe: '', nationalite: '',
  adresse: '', telephone: '', email: '', parentNom: '', parentTelephone: '', parentLien: '',
  categorie: '', niveau: '', antecedentsMedicaux: '', personneUrgence: '', telUrgence: '',
  consentRgpd: false,
};

function calcAge(iso: string): number | null {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(+d)) return null;
  const now = new Date();
  let age = now.getFullYear() - d.getFullYear();
  const m = now.getMonth() - d.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < d.getDate())) age--;
  return age;
}

export default function InscriptionWizard() {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [approved, setApproved] = useState(false);
  const [form, setForm] = useState<FormState>(EMPTY);
  const [files, setFiles] = useState<Partial<Record<FileKey, File>>>({});
  const [fileErrors, setFileErrors] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{ ok: boolean; message: string; details?: string[] } | null>(null);
  const fileRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const age = useMemo(() => calcAge(form.dateNaissance), [form.dateNaissance]);
  const isMinor = age !== null && age < 18;

  const set = (k: keyof FormState, v: string | boolean) => setForm((f) => ({ ...f, [k]: v }));

  const onFile = (key: FileKey, f: File | undefined) => {
    setFileErrors([]);
    if (!f) {
      setFiles((prev) => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
      return;
    }
    const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
    const ext = (f.name.split('.').pop() || '').toLowerCase();
    if (f.size > 5 * 1024 * 1024) {
      setFileErrors([`« ${f.name} » dépasse 5 Mo (${(f.size / 1048576).toFixed(1)} Mo).`]);
      return;
    }
    if (!allowed.includes(f.type) || !['jpg', 'jpeg', 'png', 'pdf'].includes(ext)) {
      setFileErrors([`« ${f.name} » : format refusé. Acceptés : JPG, JPEG, PNG, PDF.`]);
      return;
    }
    setFiles((prev) => ({ ...prev, [key]: f }));
  };

  const missingForReview = useMemo(() => {
    const miss: string[] = [];
    if (!files.identite) miss.push('Carte d’identité');
    if (!files.photoPasseport) miss.push('Photo passeport');
    if (!files.certificatMedical) miss.push('Certificat médical');
    if (!files.preuvePaiement) miss.push('Preuve de paiement');
    if (isMinor && !files.lettreParents) miss.push('Lettre des parents (mineur)');
    return miss;
  }, [files, isMinor]);

  const canSubmit =
    form.nom.trim() && form.prenom.trim() && form.dateNaissance && form.sexe &&
    form.adresse.trim() && form.telephone.trim() && form.categorie &&
    form.consentRgpd && missingForReview.length === 0 &&
    (!isMinor || (form.parentNom.trim() && form.parentTelephone.trim()));

  async function handleSubmit() {
    setSubmitting(true);
    setResult(null);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, String(v)));
      (Object.keys(files) as FileKey[]).forEach((k) => {
        if (files[k]) fd.append(k, files[k]!);
      });
      const res = await fetch('/api/inscriptions', { method: 'POST', body: fd });
      const data = await res.json();
      if (res.ok) {
        setResult({ ok: true, message: data.message || 'Inscription validée !' });
        setForm(EMPTY);
        setFiles({});
      } else {
        setResult({
          ok: false,
          message: data.error || 'Veuillez vérifier les champs manquants.',
          details: data.details,
        });
      }
    } catch {
      setResult({ ok: false, message: 'Erreur réseau. Vérifiez votre connexion puis réessayez.' });
    }
    setSubmitting(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  return (
    <div>
      {/* Indicateur d'étapes */}
      <ol className="mx-auto mb-10 flex max-w-2xl items-center justify-center gap-2 text-xs font-bold uppercase tracking-wider sm:text-sm">
        {['Instructions', 'Formulaire', 'Vérification'].map((label, i) => {
          const n = (i + 1) as 1 | 2 | 3;
          const active = step === n;
          const done = step > n;
          return (
            <li key={label} className="flex items-center gap-2">
              <span
                className={`flex h-9 w-9 items-center justify-center rounded-full ring-2 transition ${
                  done ? 'bg-emerald-600 ring-emerald-500 text-white'
                  : active ? 'bg-karate-red ring-karate-gold text-white'
                  : 'bg-white/5 ring-white/15 text-stone-500'
                }`}
              >
                {done ? <CheckCircle2 className="h-5 w-5" /> : n}
              </span>
              <span className={active || done ? 'text-white' : 'text-stone-500'}>{label}</span>
              {i < 2 && <span className="mx-1 h-px w-6 bg-white/15 sm:w-12" />}
            </li>
          );
        })}
      </ol>

      <AnimatePresence mode="wait">
        {/* ═══════ ÉTAPE 1 : INSTRUCTIONS ═══════ */}
        {step === 1 && (
          <motion.section
            key="s1" initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }}
            className="mx-auto max-w-3xl"
          >
            <div className="rounded-3xl border border-karate-gold/30 bg-gradient-to-b from-white/8 to-transparent p-6 sm:p-10">
              <div className="flex items-center gap-3">
                <span className="rounded-xl bg-karate-gold/15 p-3"><BookOpenCheck className="h-6 w-6 text-karate-gold" /></span>
                <h2 className="font-display text-3xl tracking-wide text-white">INSTRUCTIONS OBLIGATOIRES</h2>
              </div>
              <p className="mt-3 text-sm text-stone-400">
                Lisez attentivement la liste des pièces à fournir avant d’accéder au formulaire d’inscription.
              </p>
              <ul className="mt-6 space-y-4">
                {INSTRUCTIONS.map((ins) => (
                  <li key={ins.title} className="flex gap-4 rounded-2xl border border-white/10 bg-black/30 p-4 transition hover:border-karate-gold/40">
                    <span className="h-fit rounded-xl bg-karate-red/15 p-2.5 ring-1 ring-karate-red/30">
                      <ins.icon className="h-5 w-5 text-karate-red" />
                    </span>
                    <div>
                      <h3 className="font-bold text-white">{ins.title}</h3>
                      <p className="mt-1 text-sm leading-relaxed text-stone-400">{ins.text}</p>
                    </div>
                  </li>
                ))}
              </ul>

              <label className={`mt-6 flex cursor-pointer items-start gap-3 rounded-2xl border p-4 transition ${approved ? 'border-emerald-500/50 bg-emerald-500/10' : 'border-white/15 bg-white/5 hover:border-white/30'}`}>
                <input
                  type="checkbox"
                  checked={approved}
                  onChange={(e) => setApproved(e.target.checked)}
                  className="mt-1 h-5 w-5 shrink-0 accent-emerald-500"
                />
                <span className="text-sm font-semibold text-white">
                  « Lu et approuvé » — j’ai lu les instructions ci-dessus et je m’engage à fournir un dossier complet.
                </span>
              </label>

              <button
                disabled={!approved}
                onClick={() => { setStep(2); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                className="btn-karate mt-6 w-full disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none"
              >
                Accéder au formulaire <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </motion.section>
        )}

        {/* ═══════ ÉTAPE 2 : FORMULAIRE ═══════ */}
        {step === 2 && (
          <motion.section
            key="s2" initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }}
            className="mx-auto max-w-4xl rounded-3xl border border-white/10 bg-white/[0.03] p-6 sm:p-10"
          >
            <h2 className="font-display text-3xl tracking-wide text-white">FORMULAIRE D’INSCRIPTION</h2>
            <p className="mt-1 text-sm text-stone-400">Les champs marqués * sont obligatoires.</p>

            {/* Identité */}
            <h3 className="mb-3 mt-8 font-display text-xl tracking-widest text-karate-gold">— IDENTITÉ</h3>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <Field label="Nom *"><input className="input-dark" value={form.nom} onChange={(e) => set('nom', e.target.value)} placeholder="Ex. Ilunga" /></Field>
              <Field label="Post-nom"><input className="input-dark" value={form.postnom} onChange={(e) => set('postnom', e.target.value)} placeholder="Ex. Mbuyi" /></Field>
              <Field label="Prénom *"><input className="input-dark" value={form.prenom} onChange={(e) => set('prenom', e.target.value)} placeholder="Ex. Grâce" /></Field>
              <Field label="Date de naissance *">
                <input type="date" className="input-dark" value={form.dateNaissance} onChange={(e) => set('dateNaissance', e.target.value)} max={new Date().toISOString().slice(0, 10)} />
                {age !== null && <span className={`mt-1 block text-xs ${age < 7 ? 'text-red-400' : 'text-karate-gold'}`}>{age} ans{isMinor ? ' — mineur(e)' : ' — majeur(e)'}</span>}
              </Field>
              <Field label="Sexe *">
                <select className="input-dark" value={form.sexe} onChange={(e) => set('sexe', e.target.value)}>
                  <option value="">— Choisir —</option>
                  <option value="M">Masculin</option>
                  <option value="F">Féminin</option>
                </select>
              </Field>
              <Field label="Nationalité"><input className="input-dark" value={form.nationalite} onChange={(e) => set('nationalite', e.target.value)} placeholder="Ex. Congolaise" /></Field>
            </div>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <Field label="Adresse complète *"><input className="input-dark" value={form.adresse} onChange={(e) => set('adresse', e.target.value)} placeholder="Commune, avenue, n°…" /></Field>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Téléphone *"><input className="input-dark" value={form.telephone} onChange={(e) => set('telephone', e.target.value)} placeholder="+243…" inputMode="tel" /></Field>
                <Field label="E-mail"><input type="email" className="input-dark" value={form.email} onChange={(e) => set('email', e.target.value)} placeholder="vous@exemple.com" /></Field>
              </div>
            </div>

            {/* Responsable mineur */}
            {isMinor && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
                <h3 className="mb-3 mt-8 font-display text-xl tracking-widest text-karate-gold">— RESPONSABLE LÉGAL (MINEUR)</h3>
                <div className="grid gap-4 rounded-2xl border border-karate-gold/25 bg-karate-gold/5 p-4 sm:grid-cols-3">
                  <Field label="Nom du parent/tuteur *"><input className="input-dark" value={form.parentNom} onChange={(e) => set('parentNom', e.target.value)} /></Field>
                  <Field label="Téléphone du parent *"><input className="input-dark" value={form.parentTelephone} onChange={(e) => set('parentTelephone', e.target.value)} inputMode="tel" /></Field>
                  <Field label="Lien de parenté"><input className="input-dark" value={form.parentLien} onChange={(e) => set('parentLien', e.target.value)} placeholder="Père, mère, tuteur…" /></Field>
                </div>
              </motion.div>
            )}

            {/* Sport & santé */}
            <h3 className="mb-3 mt-8 font-display text-xl tracking-widest text-karate-gold">— SPORT & SANTÉ</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Catégorie *">
                <select className="input-dark" value={form.categorie} onChange={(e) => set('categorie', e.target.value)}>
                  <option value="">— Choisir —</option>
                  <option value="Karaté">🥋 Karaté</option>
                  <option value="Full Contact">🥊 Full Contact</option>
                  <option value="Karaté + Full Contact">🥋🥊 Karaté + Full Contact</option>
                </select>
              </Field>
              <Field label="Niveau actuel"><input className="input-dark" value={form.niveau} onChange={(e) => set('niveau', e.target.value)} placeholder="Débutant, ceinture jaune…" /></Field>
              <Field label="Antécédents médicaux"><textarea className="input-dark" rows={2} value={form.antecedentsMedicaux} onChange={(e) => set('antecedentsMedicaux', e.target.value)} placeholder="Allergies, asthme, blessures…" /></Field>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Contact d’urgence"><input className="input-dark" value={form.personneUrgence} onChange={(e) => set('personneUrgence', e.target.value)} placeholder="Nom" /></Field>
                <Field label="Tél. d’urgence"><input className="input-dark" value={form.telUrgence} onChange={(e) => set('telUrgence', e.target.value)} inputMode="tel" /></Field>
              </div>
            </div>

            {/* Fichiers */}
            <h3 className="mb-3 mt-8 font-display text-xl tracking-widest text-karate-gold">— PIÈCES À TÉLÉVERSER (MAX 5 MO)</h3>
            {fileErrors.length > 0 && (
              <div className="mb-4 rounded-xl border border-red-500/40 bg-red-500/10 p-3 text-sm text-red-300">
                {fileErrors.map((e) => <p key={e}>⚠️ {e}</p>)}
              </div>
            )}
            <div className="grid gap-4 sm:grid-cols-2">
              {FILE_INPUTS.map((fi) => {
                const f = files[fi.key];
                return (
                  <div key={fi.key} className={`rounded-2xl border p-4 transition ${f ? 'border-emerald-500/40 bg-emerald-500/5' : 'border-white/15 bg-white/5'}`}>
                    <p className="text-sm font-semibold text-white">{fi.label}</p>
                    <p className="text-xs text-stone-500">{fi.hint}</p>
                    <input
                      ref={(el) => { fileRefs.current[fi.key] = el; }}
                      type="file"
                      accept=".jpg,.jpeg,.png,.pdf,image/jpeg,image/png,application/pdf"
                      className="hidden"
                      onChange={(e) => onFile(fi.key, e.target.files?.[0])}
                    />
                    <div className="mt-3 flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => fileRefs.current[fi.key]?.click()}
                        className="inline-flex items-center gap-2 rounded-xl border border-white/20 px-4 py-2 text-sm font-semibold text-stone-200 transition hover:border-karate-gold hover:text-karate-gold"
                      >
                        <Upload className="h-4 w-4" /> {f ? 'Remplacer' : 'Choisir un fichier'}
                      </button>
                      {f && (
                        <span className="flex min-w-0 items-center gap-1.5 text-xs text-emerald-400">
                          <FileCheck2 className="h-4 w-4 shrink-0" />
                          <span className="truncate">{f.name} ({(f.size / 1048576).toFixed(2)} Mo)</span>
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* RGPD */}
            <label className="mt-6 flex cursor-pointer items-start gap-3 rounded-2xl border border-white/15 bg-white/5 p-4">
              <input type="checkbox" checked={form.consentRgpd} onChange={(e) => set('consentRgpd', e.target.checked)} className="mt-1 h-5 w-5 shrink-0 accent-red-600" />
              <span className="text-sm text-stone-300">
                J’accepte que mes données personnelles et pièces justificatives soient collectées et conservées par
                le Club Okinawa SVP aux fins de gestion de mon inscription (base Vercel + copie Firebase),
                conformément à la <a href="/confidentialite" target="_blank" className="underline decoration-karate-gold/60 hover:text-karate-gold">politique de confidentialité</a>. *
              </span>
            </label>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <button onClick={() => setStep(1)} className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/20 px-6 py-3 font-semibold text-stone-200 transition hover:bg-white/10">
                <ChevronLeft className="h-4 w-4" /> Instructions
              </button>
              <button onClick={() => { setStep(3); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="btn-karate flex-1">
                S’inscrire — voir le récapitulatif <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </motion.section>
        )}

        {/* ═══════ ÉTAPE 3 : REVIEW ═══════ */}
        {step === 3 && (
          <motion.section
            key="s3" initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }}
            className="mx-auto max-w-3xl"
          >
            <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 sm:p-10">
              <h2 className="font-display text-3xl tracking-wide text-white">VÉRIFIEZ VOTRE DOSSIER</h2>
              <p className="mt-1 text-sm text-stone-400">
                Relisez chaque élément. Vous pouvez modifier ou remplacer tout élément manquant avant de valider.
              </p>

              {/* Résumé infos */}
              <div className="mt-6 rounded-2xl border border-white/10 bg-black/30 p-5">
                <div className="flex items-center justify-between">
                  <h3 className="font-display text-xl tracking-widest text-karate-gold">INFORMATIONS</h3>
                  <button onClick={() => setStep(2)} className="inline-flex items-center gap-1 text-sm font-semibold text-stone-300 hover:text-karate-gold">
                    <Pencil className="h-4 w-4" /> Modifier
                  </button>
                </div>
                <dl className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
                  <Row k="Nom complet" v={`${form.nom} ${form.postnom} ${form.prenom}`.trim() || '—'} />
                  <Row k="Naissance / âge" v={form.dateNaissance ? `${form.dateNaissance} (${age} ans)` : '—'} />
                  <Row k="Sexe" v={form.sexe === 'M' ? 'Masculin' : form.sexe === 'F' ? 'Féminin' : '—'} />
                  <Row k="Téléphone" v={form.telephone || '—'} />
                  <Row k="Catégorie" v={form.categorie || '—'} />
                  <Row k="Adresse" v={form.adresse || '—'} />
                  {isMinor && <Row k="Parent / tuteur" v={`${form.parentNom} — ${form.parentTelephone}`.trim() || '—'} />}
                </dl>
              </div>

              {/* Liste des fichiers */}
              <div className="mt-4 rounded-2xl border border-white/10 bg-black/30 p-5">
                <h3 className="font-display text-xl tracking-widest text-karate-gold">ÉLÉMENTS TÉLÉVERSÉS</h3>
                <ul className="mt-3 space-y-2">
                  {FILE_INPUTS.map((fi) => {
                    const f = files[fi.key];
                    return (
                      <li key={fi.key} className={`flex items-center justify-between gap-3 rounded-xl border px-4 py-3 text-sm ${f ? 'border-emerald-500/30 bg-emerald-500/5' : 'border-red-500/30 bg-red-500/5'}`}>
                        <span className="flex min-w-0 items-center gap-2">
                          {f ? <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-400" /> : <AlertTriangle className="h-5 w-5 shrink-0 text-red-400" />}
                          <span className="truncate text-stone-200">
                            <strong>{fi.label.replace(' *', '')}</strong>
                            {f ? ` — ${f.name}` : ' — manquant'}
                          </span>
                        </span>
                        <button onClick={() => setStep(2)} className="shrink-0 text-xs font-bold uppercase tracking-wider text-karate-gold hover:underline">
                          {f ? 'Remplacer' : 'Ajouter'}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>

              {missingForReview.length > 0 && (
                <div className="mt-4 flex items-start gap-2 rounded-xl border border-amber-500/40 bg-amber-500/10 p-4 text-sm text-amber-200">
                  <AlertTriangle className="h-5 w-5 shrink-0" />
                  <span>Éléments manquants : <strong>{missingForReview.join(' • ')}</strong>. Retournez au formulaire pour les ajouter.</span>
                </div>
              )}

              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <button onClick={() => setStep(2)} className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/20 px-6 py-3 font-semibold text-stone-200 transition hover:bg-white/10">
                  <ChevronLeft className="h-4 w-4" /> Modifier le dossier
                </button>
                <button onClick={handleSubmit} disabled={submitting} className="btn-gold flex-1 disabled:opacity-50">
                  {submitting ? <><Loader2 className="h-4 w-4 animate-spin" /> Envoi en cours…</> : <><Send className="h-4 w-4" /> Soumettre ma candidature</>}
                </button>
              </div>
            </div>
          </motion.section>
        )}
      </AnimatePresence>

      {/* ═══════ Notification ═══════ */}
      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[70] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
            onClick={() => setResult(null)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 24 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 10 }}
              onClick={(e) => e.stopPropagation()}
              className={`w-full max-w-md rounded-3xl border p-8 text-center shadow-2xl ${
                result.ok ? 'border-emerald-500/40 bg-gradient-to-b from-emerald-950 to-dojo-950' : 'border-red-500/40 bg-gradient-to-b from-red-950/80 to-dojo-950'
              }`}
            >
              {result.ok ? (
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', delay: 0.15 }}>
                  <CheckCircle2 className="mx-auto h-16 w-16 text-emerald-400" />
                </motion.div>
              ) : (
                <AlertTriangle className="mx-auto h-16 w-16 text-red-400" />
              )}
              <h3 className={`mt-4 font-display text-3xl tracking-wide ${result.ok ? 'text-emerald-300' : 'text-red-300'}`}>
                {result.ok ? 'INSCRIPTION VALIDÉE ! 🥋' : 'DOSSIER INCOMPLET'}
              </h3>
              <p className="mt-2 text-sm text-stone-300">{result.message}</p>
              {result.details && result.details.length > 0 && (
                <ul className="mt-3 max-h-40 space-y-1 overflow-auto rounded-xl bg-black/30 p-3 text-left text-xs text-red-200">
                  {result.details.map((d, i) => <li key={i}>• {d}</li>)}
                </ul>
              )}
              <button
                onClick={() => { setResult(null); if (result.ok) { setStep(1); setApproved(false); } else { setStep(2); } window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                className={result.ok ? 'btn-gold mt-6 w-full' : 'btn-karate mt-6 w-full'}
              >
                {result.ok ? 'Parfait, merci !' : 'Vérifier les champs manquants'}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-stone-400">{label}</span>
      {children}
    </label>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="rounded-lg bg-white/5 px-3 py-2">
      <dt className="text-[11px] font-bold uppercase tracking-wider text-stone-500">{k}</dt>
      <dd className="truncate text-stone-200">{v}</dd>
    </div>
  );
}
