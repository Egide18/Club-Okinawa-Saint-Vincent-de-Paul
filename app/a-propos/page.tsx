import type { Metadata } from 'next';
import { Trophy, Swords, Medal, GraduationCap, Landmark, Music4 } from 'lucide-react';
import { getSettings } from '@/lib/store';
import Reveal from '@/components/Reveal';
import SectionTitle from '@/components/SectionTitle';
import CountUp from '@/components/CountUp';
import KarateArt from '@/components/KarateArt';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'À propos — Le Sensei & le club',
  description: 'Histoire du Sensei fondateur, palmarès, historique du club et hymne officiel.',
};

export default async function AProposPage() {
  const s = await getSettings();

  const stats = [
    { icon: Swords, label: 'Combats en carrière', value: s.stats.combats, suffix: '+' },
    { icon: Trophy, label: 'Victoires', value: s.stats.victoires, suffix: '' },
    { icon: Medal, label: 'Titres & distinctions', value: s.stats.titres, suffix: '' },
    { icon: GraduationCap, label: 'Athlètes formés', value: s.stats.athletes, suffix: '+' },
  ];

  return (
    <>
      {/* ─── En-tête ─── */}
      <section className="dojo-bg relative overflow-hidden pb-16 pt-36">
        <div
          className="absolute inset-0 -z-10 bg-cover bg-center opacity-30"
          style={{ backgroundImage: "url('/images/dojo-4k.jpg')" }}
        />
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-black/70 via-dojo-950/80 to-dojo-950" />
        <div className="kanji-ghost right-8 top-28 text-[10rem]">先生</div>
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <Reveal>
            <span className="inline-block rounded-full border border-karate-gold/40 bg-karate-gold/10 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.25em] text-karate-gold">
              À propos
            </span>
          </Reveal>
          <Reveal delay={120}>
            <h1 className="mt-4 font-display text-5xl tracking-wide text-white sm:text-6xl">
              LE SENSEI <span className="text-karate-gold">&</span> LE CLUB
            </h1>
          </Reveal>
          <Reveal delay={220}>
            <p className="mt-3 max-w-2xl text-stone-300">
              L’homme, la voie et la maison : découvrez celui qui a fondé le club, son palmarès, l’histoire du
              dojo et notre hymne.
            </p>
          </Reveal>
        </div>
      </section>

      {/* ─── Sensei ─── */}
      <section className="dojo-bg relative py-16">
        <KarateArt variant="kata" className="absolute -left-12 top-16 h-80 w-80" />
        <div className="mx-auto grid max-w-6xl items-start gap-10 px-4 sm:px-6 lg:grid-cols-[380px_1fr]">
          <Reveal variant="left">
            <figure className="overflow-hidden rounded-3xl border border-karate-gold/30 shadow-2xl shadow-black/60">
              <div className="relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/images/sensei.jpg"
                  alt={`Portrait de ${s.senseiNom}`}
                  className="aspect-[3/4] w-full object-cover"
                />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 to-transparent p-5 pt-14">
                  <p className="font-display text-2xl tracking-wide text-white">{s.senseiNom}</p>
                  <p className="text-sm font-semibold text-karate-gold">{s.senseiGrade}</p>
                </div>
              </div>
            </figure>
          </Reveal>

          <div>
            <Reveal variant="right">
              <span className="inline-block rounded-full bg-karate-red/15 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.25em] text-red-400 ring-1 ring-karate-red/40">
                Fondateur & instructeur principal
              </span>
              <h2 className="mt-4 font-display text-4xl tracking-wide text-white">{s.senseiNom.toUpperCase()}</h2>
              <p className="mt-1 font-semibold text-karate-gold">🥋 {s.senseiGrade}</p>
            </Reveal>
            <Reveal delay={140} variant="right">
              <p className="mt-5 whitespace-pre-line leading-relaxed text-stone-300">{s.histoireSensei}</p>
            </Reveal>

            {/* Statistiques animées */}
            <div className="mt-8 grid grid-cols-2 gap-4">
              {stats.map((st, i) => (
                <Reveal key={st.label} delay={i * 100} variant="zoom">
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-5 text-center backdrop-blur transition hover:border-karate-gold/50">
                    <st.icon className="mx-auto h-6 w-6 text-karate-red" />
                    <CountUp target={st.value} suffix={st.suffix} className="mt-2 block font-display text-4xl text-karate-gold" />
                    <p className="mt-1 text-xs font-medium uppercase tracking-wider text-stone-400">{st.label}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─── Historique du club ─── */}
      <section className="slash-band relative bg-gradient-to-br from-dojo-800 via-dojo-900 to-black py-24">
        <div className="kanji-ghost left-8 top-8 text-[8rem]">歴史</div>
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <Reveal>
            <div className="flex items-center justify-center gap-3">
              <Landmark className="h-7 w-7 text-karate-gold" />
              <h2 className="font-display text-4xl tracking-wide text-white sm:text-5xl">HISTORIQUE DU CLUB</h2>
            </div>
          </Reveal>
          <Reveal delay={150}>
            <div className="relative mt-8 rounded-3xl border border-white/10 bg-black/40 p-8 backdrop-blur sm:p-10">
              <span className="absolute -top-5 left-8 rounded-full bg-karate-red px-4 py-1 font-display text-lg tracking-widest text-white shadow-lg">
                ⛩ DEPUIS LA FONDATION
              </span>
              <p className="whitespace-pre-line leading-loose text-stone-200">{s.historiqueClub}</p>
              {/* Frise */}
              <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-3">
                {[
                  ['I', 'La fondation', 'Un dojo, une vision.'],
                  ['II', 'La croissance', 'Des champions formés.'],
                  ['III', 'Aujourd’hui', 'Une famille unie.'],
                ].map(([num, title, text]) => (
                  <div key={num} className="rounded-2xl border border-karate-gold/25 bg-karate-gold/5 p-4 text-center">
                    <span className="font-display text-3xl text-karate-gold">{num}</span>
                    <p className="mt-1 font-semibold text-white">{title}</p>
                    <p className="text-xs text-stone-400">{text}</p>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ─── Hymne ─── */}
      <section className="dojo-bg relative py-20">
        <KarateArt variant="punch" className="absolute -right-10 top-10 h-72 w-72 animate-float-slow" />
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <SectionTitle kicker="Fierté du dojo" title="HYMNE DU CLUB" subtitle="Chanté d'une seule voix avant chaque grande compétition." />
          <Reveal variant="zoom">
            <div className="relative overflow-hidden rounded-3xl border border-karate-gold/30 bg-gradient-to-b from-karate-darkred/40 to-black/60 p-10 text-center shadow-2xl shadow-karate-red/10">
              <Music4 className="mx-auto h-8 w-8 text-karate-gold" />
              <p className="mt-6 whitespace-pre-line font-display text-2xl leading-relaxed tracking-wide text-white sm:text-3xl">
                {s.hymne}
              </p>
              <div className="mx-auto mt-6 h-1 w-32 rounded bg-gradient-to-r from-karate-red to-karate-gold" />
              <p className="mt-4 text-sm uppercase tracking-[0.3em] text-stone-400">Osu ! 🥋</p>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
