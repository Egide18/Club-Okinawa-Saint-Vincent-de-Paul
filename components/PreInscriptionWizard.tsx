'use client';

import { useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BookOpenCheck, CheckCircle2, AlertTriangle, Upload, FileCheck2, Pencil,
  ChevronRight, ChevronLeft, Send, Loader2, Camera, Users, PhoneCall, Cake,
  BadgeCheck, Printer,
} from 'lucide-react';

/* ─── Étape 1 : instructions obligatoires ─── */
const INSTRUCTIONS = [
  {
    icon: Cake,
    title: '1. Candidats âgés de 7 ans et plus',
    text: 'La date de naissance est vérifiée automatiquement : l’âge minimum est de 7 ans. Les candidats de moins de 18 ans sont considérés comme mineurs.',
  },
  {
    icon: Users,
    title: '2. Candidat mineur : identité du responsable',
    text: 'Si le candidat a moins de 18 ans, fournissez l’identité complète du responsable : nom, prénom, adresse et numéro de téléphone.',
  },
  {
    icon: PhoneCall,
    title: '3. Candidat majeur : contact d’urgence',
    text: 'Si le candidat a 18 ans ou plus, indiquez la personne à contacter en cas d’urgence : nom et prénom, adresse, numéro de téléphone.',
  },
  {
    icon: Camera,
    title: '4. Photo du candidat',
    text: 'Joignez une photo récente du candidat en format JPG, JPEG ou PNG — 5 Mo maximum.',
  },
  {
    icon: BadgeCheck,
    title: '5. Fiche officielle et code',
    text: 'Après validation, vous recevez une fiche de pré-inscription officielle dotée d’un code unique à 8 caractères, à imprimer ou télécharger en PDF et à conserver.',
  },
];

interface FormState {
  nom: string; postnom: string; prenom: string; dateNaissance: string;
  respNom: string; respPrenom: string; respAdresse: string; respTelephone: string;
  urgNom: string; urgPrenom: string; urgAdresse: string; urgTelephone: string;
  consentRgpd: boolean;
}

const EMPTY: FormState = {
  nom: '', postnom: '', prenom: '', dateNaissance: '',
  respNom: '', respPrenom: '', respAdresse: '', respTelephone: '',
  urgNom: '', urgPrenom: '', urgAdresse: '', urgTelephone: '',
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

export default function PreInscriptionWizard() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [approved, setApproved] = useState(false);
  const [form, setForm] = useState<FormState>(EMPTY);
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoError, setPhotoError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{ ok: boolean; code?: string; message: string; details?: string[] } | null>(null);
  const photoRef = useRef<HTMLInputElement | null>(null);

  const age = useMemo(() => calcAge(form.dateNaissance), [form.dateNaissance]);
  const isMinor = age !== null && age < 18;
  const ageValid = age !== null && age >= 7 && age <= 100;

  const set = (k: keyof FormState, v: string | boolean) => setForm((f) => ({ ...f, [k]: v }));

  const onPhoto = (f: File | undefined) => {
    setPhotoError('');
    if (photoPreview) URL.revokeObjectURL(photoPreview);
    setPhoto(null);
    setPhotoPreview(null);
    if (!f) return;
    const allowed = ['image/jpeg', 'image/jpg', 'image/png'];
    const ext = (f.name.split('.').pop() || '').toLowerCase();
    if (f.size > 5 * 1024 * 1024) {
      setPhotoError(`La photo dépasse 5 Mo (${(f.size / 1048576).toFixed(1)} Mo).`);
      return;
    }
    if (!allowed.includes(f.type) || !['jpg', 'jpeg', 'png'].includes(ext)) {
      setPhotoError('Format refusé. Photo acceptée : JPG, JPEG ou PNG.');
      return;
    }
    setPhoto(f);
    setPhotoPreview(URL.createObjectURL(f));
  };

  const missing = useMemo(() => {
    const miss: string[] = [];
    if (!form.nom.trim()) miss.push('Nom du candidat');
    if (!form.prenom.trim()) miss.push('Prénom du candidat');
    if (!ageValid) miss.push('Date de naissance valide (7 ans minimum)');
    if (ageValid && isMinor) {
      if (!form.respNom.trim() || !form.respPrenom.trim()) miss.push('Nom et prénom du responsable');
      if (!form.respAdresse.trim()) miss.push('Adresse du responsable');
      if (!form.respTelephone.trim()) miss.push('Téléphone du responsable');
    }
    if (ageValid && !isMinor) {
      if (!form.urgNom.trim() || !form.urgPrenom.trim()) miss.push('Nom et prénom du contact d’urgence');
      if (!form.urgAdresse.trim()) miss.push('Adresse du contact d’urgence');
      if (!form.urgTelephone.trim()) miss.push('Téléphone du contact d’urgence');
    }
    if (!photo) miss.push('Photo du candidat');
    if (!form.consentRgpd) miss.push('Consentement RGPD');
    return miss;
  }, [form, photo, ageValid, isMinor]);

  async function handleSubmit() {
    setSubmitting(true);
    setResult(null);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, String(v)));
      if (photo) fd.append('photo', photo);
      const res = await fetch('/api/inscriptions', { method: 'POST', body: fd });
      const data = await res.json();
      if (res.ok) {
        setResult({ ok: true, code: data.code, message: data.message || 'Pré-inscription enregistrée !' });
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

  const goFiche = () => {
    if (result?.code) router.push(`/pre-inscription/${result.code}`);
  };

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
            <div className="rounded-3xl border border-karate-gold/30 bg-gradient-to-b from-white/10 to-transparent p-6 sm:p-10">
              <div className="flex items-center gap-3">
                <span className="rounded-xl bg-karate-gold/15 p-3"><BookOpenCheck className="h-6 w-6 text-karate-gold" /></span>
                <h2 className="font-display text-3xl tracking-wide text-white">INSTRUCTIONS OBLIGATOIRES</h2>
              </div>
              <p className="mt-3 text-sm text-stone-400">
                Lisez attentivement les instructions avant d’accéder au formulaire de pré-inscription.
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
                  « Lu et approuvé » — j’ai lu les instructions ci-dessus et je m’engage à fournir des informations exactes.
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
            <h2 className="font-display text-3xl tracking-wide text-white">FORMULAIRE DE PRÉ-INSCRIPTION</h2>
            <p className="mt-1 text-sm text-stone-400">Les champs marqués * sont obligatoires.</p>

            {/* Identité du candidat */}
            <h3 className="mb-3 mt-8 font-display text-xl tracking-widest text-karate-gold">— IDENTITÉ DU CANDIDAT</h3>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Field label="Nom *"><input className="input-dark" value={form.nom} onChange={(e) => set('nom', e.target.value)} placeholder="Ex. Ilunga" autoComplete="family-name" /></Field>
              <Field label="Post-nom"><input className="input-dark" value={form.postnom} onChange={(e) => set('postnom', e.target.value)} placeholder="Ex. Mbuyi" /></Field>
              <Field label="Prénom *"><input className="input-dark" value={form.prenom} onChange={(e) => set('prenom', e.target.value)} placeholder="Ex. Grâce" autoComplete="given-name" /></Field>
              <Field label="Date de naissance *">
                <input type="date" className="input-dark" value={form.dateNaissance} onChange={(e) => set('dateNaissance', e.target.value)} max={new Date().toISOString().slice(0, 10)} />
                {age !== null && (
                  <span className={`mt-1 block text-xs font-semibold ${ageValid ? 'text-karate-gold' : 'text-red-400'}`}>
                    {age} ans{ageValid ? (isMinor ? ' — mineur(e)' : ' — majeur(e)') : ' — âge non admis (7 ans minimum)'}
                  </span>
                )}
              </Field>
            </div>

            {/* Bloc conditionnel */}
            {ageValid && isMinor && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
                <h3 className="mb-3 mt-8 font-display text-xl tracking-widest text-karate-gold">— RESPONSABLE LÉGAL (CANDIDAT MINEUR)</h3>
                <div className="grid gap-4 rounded-2xl border border-karate-gold/25 bg-karate-gold/5 p-4 sm:grid-cols-2">
                  <Field label="Nom du responsable *"><input className="input-dark" value={form.respNom} onChange={(e) => set('respNom', e.target.value)} placeholder="Nom" /></Field>
                  <Field label="Prénom du responsable *"><input className="input-dark" value={form.respPrenom} onChange={(e) => set('respPrenom', e.target.value)} placeholder="Prénom" /></Field>
                  <Field label="Adresse du responsable *"><input className="input-dark" value={form.respAdresse} onChange={(e) => set('respAdresse', e.target.value)} placeholder="Commune, avenue, n°…" /></Field>
                  <Field label="N° de téléphone du responsable *"><input className="input-dark" value={form.respTelephone} onChange={(e) => set('respTelephone', e.target.value)} placeholder="+243…" inputMode="tel" /></Field>
                </div>
              </motion.div>
            )}

            {ageValid && !isMinor && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
                <h3 className="mb-3 mt-8 font-display text-xl tracking-widest text-karate-gold">— PERSONNE À CONTACTER EN CAS D’URGENCE</h3>
                <div className="grid gap-4 rounded-2xl border border-karate-gold/25 bg-karate-gold/5 p-4 sm:grid-cols-2">
                  <Field label="Nom *"><input className="input-dark" value={form.urgNom} onChange={(e) => set('urgNom', e.target.value)} placeholder="Nom" /></Field>
                  <Field label="Prénom *"><input className="input-dark" value={form.urgPrenom} onChange={(e) => set('urgPrenom', e.target.value)} placeholder="Prénom" /></Field>
                  <Field label="Adresse *"><input className="input-dark" value={form.urgAdresse} onChange={(e) => set('urgAdresse', e.target.value)} placeholder="Commune, avenue, n°…" /></Field>
                  <Field label="N° de téléphone *"><input className="input-dark" value={form.urgTelephone} onChange={(e) => set('urgTelephone', e.target.value)} placeholder="+243…" inputMode="tel" /></Field>
                </div>
              </motion.div>
            )}

            {/* Photo */}
            <h3 className="mb-3 mt-8 font-display text-xl tracking-widest text-karate-gold">— PHOTO DU CANDIDAT *</h3>
            {photoError && (
              <div className="mb-4 rounded-xl border border-red-500/40 bg-red-500/10 p-3 text-sm text-red-300">
                {photoError}
              </div>
            )}
            <div className={`flex flex-col items-start gap-4 rounded-2xl border p-4 sm:flex-row sm:items-center ${photo ? 'border-emerald-500/40 bg-emerald-500/5' : 'border-white/15 bg-white/5'}`}>
              <div className="h-28 w-24 shrink-0 overflow-hidden rounded-xl border border-white/15 bg-black/30">
                {photoPreview ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={photoPreview} alt="Aperçu de la photo du candidat" className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full items-center justify-center text-stone-500">
                    <Camera className="h-8 w-8" />
                  </div>
                )}
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-white">Photo d’identité récente</p>
                <p className="text-xs text-stone-500">JPG, JPEG ou PNG — 5 Mo maximum</p>
                <input
                  ref={photoRef}
                  type="file"
                  accept=".jpg,.jpeg,.png,image/jpeg,image/png"
                  className="hidden"
                  onChange={(e) => onPhoto(e.target.files?.[0])}
                />
                <button
                  type="button"
                  onClick={() => photoRef.current?.click()}
                  className="mt-3 inline-flex items-center gap-2 rounded-xl border border-white/20 px-4 py-2 text-sm font-semibold text-stone-200 transition hover:border-karate-gold hover:text-karate-gold"
                >
                  <Upload className="h-4 w-4" /> {photo ? 'Remplacer la photo' : 'Choisir la photo'}
                </button>
                {photo && (
                  <p className="mt-2 flex items-center gap-1.5 text-xs text-emerald-400">
                    <FileCheck2 className="h-4 w-4" /> {photo.name} ({(photo.size / 1048576).toFixed(2)} Mo)
                  </p>
                )}
              </div>
            </div>

            {/* RGPD */}
            <label className="mt-6 flex cursor-pointer items-start gap-3 rounded-2xl border border-white/15 bg-white/5 p-4">
              <input type="checkbox" checked={form.consentRgpd} onChange={(e) => set('consentRgpd', e.target.checked)} className="mt-1 h-5 w-5 shrink-0 accent-red-600" />
              <span className="text-sm text-stone-300">
                J’accepte que les données de cette pré-inscription soient collectées et conservées par
                le Club Okinawa SVP (base Vercel + copie Firebase), conformément à la <a href="/confidentialite" target="_blank" className="underline decoration-karate-gold/60 hover:text-karate-gold">politique de confidentialité</a>. *
              </span>
            </label>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <button onClick={() => setStep(1)} className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/20 px-6 py-3 font-semibold text-stone-200 transition hover:bg-white/10">
                <ChevronLeft className="h-4 w-4" /> Instructions
              </button>
              <button onClick={() => { setStep(3); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="btn-karate flex-1">
                Voir le récapitulatif <ChevronRight className="h-4 w-4" />
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
                Relisez chaque élément. Vous pouvez modifier tout élément manquant avant de valider.
              </p>

              <div className="mt-6 flex gap-4 rounded-2xl border border-white/10 bg-black/30 p-5">
                <div className="h-28 w-24 shrink-0 overflow-hidden rounded-xl border border-white/15 bg-white/5">
                  {photoPreview ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={photoPreview} alt="Photo du candidat" className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full items-center justify-center text-xs text-stone-500">Sans photo</div>
                  )}
                </div>
                <dl className="grid flex-1 gap-2 text-sm sm:grid-cols-2">
                  <Row k="Nom" v={form.nom || '—'} />
                  <Row k="Post-nom" v={form.postnom || '—'} />
                  <Row k="Prénom" v={form.prenom || '—'} />
                  <Row k="Naissance / âge" v={form.dateNaissance ? `${form.dateNaissance} (${age} ans)` : '—'} />
                </dl>
              </div>

              <div className="mt-4 rounded-2xl border border-white/10 bg-black/30 p-5">
                <div className="flex items-center justify-between">
                  <h3 className="font-display text-xl tracking-widest text-karate-gold">
                    {isMinor ? 'RESPONSABLE LÉGAL' : 'CONTACT D’URGENCE'}
                  </h3>
                  <button onClick={() => setStep(2)} className="inline-flex items-center gap-1 text-sm font-semibold text-stone-300 hover:text-karate-gold">
                    <Pencil className="h-4 w-4" /> Modifier
                  </button>
                </div>
                <dl className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
                  {isMinor ? (
                    <>
                      <Row k="Nom" v={form.respNom || '—'} />
                      <Row k="Prénom" v={form.respPrenom || '—'} />
                      <Row k="Adresse" v={form.respAdresse || '—'} />
                      <Row k="Téléphone" v={form.respTelephone || '—'} />
                    </>
                  ) : (
                    <>
                      <Row k="Nom" v={form.urgNom || '—'} />
                      <Row k="Prénom" v={form.urgPrenom || '—'} />
                      <Row k="Adresse" v={form.urgAdresse || '—'} />
                      <Row k="Téléphone" v={form.urgTelephone || '—'} />
                    </>
                  )}
                </dl>
              </div>

              {missing.length > 0 && (
                <div className="mt-4 flex items-start gap-2 rounded-xl border border-amber-500/40 bg-amber-500/10 p-4 text-sm text-amber-200">
                  <AlertTriangle className="h-5 w-5 shrink-0" />
                  <span>Éléments manquants : <strong>{missing.join(' • ')}</strong>.</span>
                </div>
              )}

              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <button onClick={() => setStep(2)} className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/20 px-6 py-3 font-semibold text-stone-200 transition hover:bg-white/10">
                  <ChevronLeft className="h-4 w-4" /> Modifier
                </button>
                <button onClick={handleSubmit} disabled={submitting} className="btn-gold flex-1 disabled:opacity-50">
                  {submitting ? <><Loader2 className="h-4 w-4 animate-spin" /> Envoi en cours…</> : <><Send className="h-4 w-4" /> Soumettre ma pré-inscription</>}
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
            onClick={() => { if (!result.ok) setResult(null); }}
          >
            <motion.div
              initial={{ scale: 0.9, y: 24 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 10 }}
              onClick={(e) => e.stopPropagation()}
              className={`keep-dark w-full max-w-md rounded-3xl border p-8 text-center shadow-2xl ${
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
                {result.ok ? 'PRÉ-INSCRIPTION ENREGISTRÉE' : 'DOSSIER INCOMPLET'}
              </h3>
              <p className="mt-2 text-sm text-stone-300">{result.message}</p>

              {result.ok && result.code && (
                <div className="mt-4 rounded-2xl border border-karate-gold/50 bg-black/40 p-4">
                  <p className="text-xs font-bold uppercase tracking-[0.25em] text-karate-gold">Votre code personnel</p>
                  <p className="mt-1 font-mono text-4xl font-black tracking-[0.25em] text-white">{result.code}</p>
                  <p className="mt-1 text-xs text-stone-400">Conservez-le : il donne accès à votre fiche officielle.</p>
                </div>
              )}

              {result.details && result.details.length > 0 && (
                <ul className="mt-3 max-h-40 space-y-1 overflow-auto rounded-xl bg-black/30 p-3 text-left text-xs text-red-200">
                  {result.details.map((d, i) => <li key={i}>• {d}</li>)}
                </ul>
              )}
              {result.ok ? (
                <button onClick={goFiche} className="btn-gold mt-6 w-full">
                  <Printer className="h-4 w-4" /> Voir / imprimer ma fiche officielle
                </button>
              ) : (
                <button
                  onClick={() => { setResult(null); setStep(2); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                  className="btn-karate mt-6 w-full"
                >
                  Vérifier les champs manquants
                </button>
              )}
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
