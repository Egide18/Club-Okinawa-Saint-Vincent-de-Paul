'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, FileText } from 'lucide-react';
import Reveal from './Reveal';

/** Retrouver sa fiche officielle grâce au code à 8 caractères. */
export default function CodeLookup() {
  const router = useRouter();
  const [code, setCode] = useState('');

  return (
    <Reveal variant="zoom">
      <div className="keep-dark rounded-3xl border border-blue-500/30 bg-gradient-to-b from-blue-950/80 to-dojo-900 p-6 text-center shadow-xl sm:p-8">
        <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600/20 ring-1 ring-blue-500/40">
          <FileText className="h-6 w-6 text-blue-400" />
        </span>
        <h2 className="mt-3 font-display text-2xl tracking-wide text-white">DÉJÀ PRÉ-INSCRIT ?</h2>
        <p className="mt-1 text-sm text-stone-400">
          Saisissez votre code personnel à 8 caractères pour retrouver, imprimer ou télécharger votre fiche officielle.
        </p>
        <form
          className="mx-auto mt-5 flex max-w-md gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            if (code.trim().length === 8) router.push(`/pre-inscription/${code.trim().toUpperCase()}`);
          }}
        >
          <input
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 8))}
            placeholder="Ex. K7P2QX9M"
            className="input-dark text-center font-mono text-xl font-bold tracking-[0.3em]"
            maxLength={8}
            aria-label="Code de pré-inscription"
          />
          <button
            type="submit"
            disabled={code.trim().length !== 8}
            className="shrink-0 rounded-xl bg-blue-700 px-5 font-bold text-white transition hover:bg-blue-600 disabled:opacity-40"
            aria-label="Rechercher ma fiche"
          >
            <Search className="h-5 w-5" />
          </button>
        </form>
      </div>
    </Reveal>
  );
}
