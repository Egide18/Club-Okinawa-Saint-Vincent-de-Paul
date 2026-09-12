'use client';

import { ShieldCheck } from 'lucide-react';

/** Bandeau défilant automatique des partenaires affiliés (logos + noms). */
export default function PartnersSlider({ partenaires }: { partenaires: { nom: string; logo: string }[] }) {
  if (partenaires.length === 0) return null;
  const doubled = [...partenaires, ...partenaires];

  return (
    <div className="relative overflow-hidden" aria-label="Partenaires affiliés">
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-gradient-to-r from-dojo-950 to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-l from-dojo-950 to-transparent" />
      <div className="marquee-track gap-6 py-2">
        {doubled.map((p, i) => (
          <div
            key={`${p.nom}-${i}`}
            className="flex w-64 shrink-0 items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-5 py-4 backdrop-blur transition hover:border-karate-gold/50"
          >
            {p.logo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={p.logo} alt={`Logo ${p.nom}`} className="h-11 w-11 rounded-full object-cover ring-1 ring-white/20" loading="lazy" />
            ) : (
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-karate-red/30 to-karate-gold/20 ring-1 ring-karate-gold/40">
                <ShieldCheck className="h-5 w-5 text-karate-gold" />
              </span>
            )}
            <span className="text-sm font-semibold leading-snug text-stone-200">{p.nom}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
