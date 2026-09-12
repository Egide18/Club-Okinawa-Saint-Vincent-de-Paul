import Link from 'next/link';
import { Swords, Medal, Users, HeartHandshake, ChevronRight, MapPin, Clock } from 'lucide-react';
import { getSettings } from '@/lib/store';
import HeroDojo from '@/components/HeroDojo';
import SplashLoader from '@/components/SplashLoader';
import TextSlider from '@/components/TextSlider';
import PartnersSlider from '@/components/PartnersSlider';
import Reveal from '@/components/Reveal';
import SectionTitle from '@/components/SectionTitle';
import CountUp from '@/components/CountUp';
import KarateArt from '@/components/KarateArt';

export const dynamic = 'force-dynamic';

const DISCIPLINES = [
  {
    icon: Swords,
    title: 'Karaté Shotokan',
    text: 'Kihon, kata et kumite dans la pure tradition d’Okinawa. De la ceinture blanche à la ceinture noire et au-delà.',
  },
  {
    icon: Medal,
    title: 'Full Contact',
    text: 'Boxe américaine, cardio, technique de poings-pieds et préparation aux compétitions officielles.',
  },
  {
    icon: Users,
    title: 'Enfants & Adultes',
    text: 'Sections dès 7 ans, cours ados et adultes, self-défense : chacun progresse à son rythme dans le respect.',
  },
  {
    icon: HeartHandshake,
    title: 'Valeurs du dojo',
    text: 'Respect, discipline, humilité et persévérance — le code moral du bushido au cœur de chaque entraînement.',
  },
];

export default async function HomePage() {
  const settings = await getSettings();

  return (
    <>
      <SplashLoader />
      <HeroDojo slogan={settings.slogan} paragraphe={settings.paragrapheAccueil} />

      {/* ─── Chiffres clés ─── */}
      <section className="themed dojo-bg relative border-y border-white/10 bg-dojo-900/60 py-14">
        <div className="kanji-ghost left-6 top-2 text-[7rem]">力</div>
        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-6 px-4 sm:px-6 lg:grid-cols-4">
          {[
            ['Combats du Sensei', settings.stats.combats, '+'],
            ['Victoires', settings.stats.victoires, ''],
            ['Titres remportés', settings.stats.titres, ''],
            ['Athlètes formés', settings.stats.athletes, '+'],
          ].map(([label, value, suffix], i) => (
            <Reveal key={label as string} delay={i * 120} variant="zoom" className="text-center">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur transition hover:border-karate-gold/40">
                <CountUp
                  target={value as number}
                  suffix={suffix as string}
                  className="font-display text-4xl text-karate-gold sm:text-5xl"
                />
                <p className="mt-1 text-sm font-medium uppercase tracking-wider text-stone-400">{label}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ─── Disciplines ─── */}
      <section className="themed dojo-bg relative py-20">
        <KarateArt variant="kata" className="absolute -left-10 top-10 h-72 w-72 animate-float-slow" />
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <SectionTitle
            kicker="Nos disciplines"
            title="FORGÉ PAR LA TRADITION"
            subtitle="Deux arts, une même exigence : l'excellence martiale et humaine."
          />
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {DISCIPLINES.map((d, i) => (
              <Reveal key={d.title} delay={i * 110} variant="up">
                <article className="card-hover h-full rounded-2xl border border-white/10 bg-gradient-to-b from-white/10 to-white/[0.02] p-6">
                  <span className="inline-flex rounded-xl bg-karate-red/15 p-3 ring-1 ring-karate-red/30">
                    <d.icon className="h-6 w-6 text-karate-red" />
                  </span>
                  <h3 className="mt-4 font-display text-2xl tracking-wide text-white">{d.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-stone-400">{d.text}</p>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Slider de textes ─── */}
      <section className="slash-band relative bg-gradient-to-r from-karate-darkred via-dojo-800 to-karate-darkred py-24">
        <KarateArt variant="punch" className="absolute right-4 top-6 h-56 w-56" opacity={0.2} />
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <Reveal>
            <TextSlider textes={settings.sliderTextes} />
          </Reveal>
        </div>
      </section>

      {/* ─── Appel à l'inscription ─── */}
      <section className="themed dojo-bg relative py-20">
        <KarateArt variant="kick" className="absolute -right-8 bottom-0 h-80 w-80 animate-float-slow" />
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 sm:px-6 lg:grid-cols-2">
          <Reveal variant="left">
            <span className="inline-block rounded-full border border-karate-red/50 bg-karate-red/10 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.25em] text-red-400">
              Rejoignez le dojo
            </span>
            <h2 className="mt-4 font-display text-4xl leading-tight tracking-wide text-white sm:text-5xl">
              VOTRE PREMIÈRE CEINTURE
              <br />
              <span className="text-karate-gold">COMMENCE ICI</span>
            </h2>
            <p className="mt-4 leading-relaxed text-stone-300">
              Enfants dès 7 ans, ados et adultes : les pré-inscriptions sont ouvertes toute l’année.
              Remplissez le formulaire en quelques minutes, recevez votre fiche officielle avec code
              personnel, puis finalisez votre dossier au secrétariat du club.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/pre-inscription" className="btn-karate">
                Faire ma pré-inscription <ChevronRight className="h-4 w-4" />
              </Link>
              <Link
                href="/a-propos"
                className="inline-flex items-center gap-2 rounded-xl border border-white/20 px-6 py-3 font-semibold text-stone-200 transition hover:bg-white/10"
              >
                Découvrir le Sensei
              </Link>
            </div>
          </Reveal>
          <Reveal variant="right" delay={150}>
            <div className="space-y-4">
              {[
                [MapPin, 'Dojo principal', settings.adresseClub],
                [Clock, 'Entraînements', settings.horairesClub],
                [Users, 'Encadrement', 'Sensei & instructeurs diplômés'],
              ].map(([Icon, title, text], i) => {
                const I = Icon as typeof MapPin;
                return (
                  <div key={i} className="flex items-start gap-4 rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur transition hover:border-karate-gold/40">
                    <span className="rounded-xl bg-karate-gold/15 p-2.5">
                      <I className="h-5 w-5 text-karate-gold" />
                    </span>
                    <div>
                      <h3 className="font-semibold text-white">{title as string}</h3>
                      <p className="text-sm text-stone-400">{text as string}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ─── Partenaires ─── */}
      <section className="themed border-t border-white/10 bg-black/40 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <Reveal>
            <h2 className="mb-8 text-center font-display text-3xl tracking-[0.2em] text-stone-300">
              NOS PARTENAIRES <span className="text-karate-gold">AFFILIÉS</span>
            </h2>
          </Reveal>
          <PartnersSlider partenaires={settings.partenaires} />
        </div>
      </section>
    </>
  );
}
