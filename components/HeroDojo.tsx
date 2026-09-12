'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ChevronRight, Play } from 'lucide-react';

/**
 * Hero : karatéka entrant dans le dojo (silhouette animée traversant l'écran),
 * slogan du club + paragraphe modifiable depuis l'admin.
 */
export default function HeroDojo({ slogan, paragraphe }: { slogan: string; paragraphe: string }) {
  return (
    <section className="dojo-bg relative flex min-h-[100svh] items-center overflow-hidden">
      {/* Fond photo dojo */}
      <div
        className="absolute inset-0 -z-10 animate-ken-burns bg-cover bg-center"
        style={{ backgroundImage: "url('/images/dojo-4k.jpg')" }}
      />
      <div className="absolute inset-0 -z-10 bg-gradient-to-r from-black/90 via-black/60 to-black/30" />
      <div className="absolute inset-0 -z-10 bg-gradient-to-t from-dojo-950 via-transparent to-black/60" />

      {/* Kanji décoratif */}
      <div className="kanji-ghost right-6 top-24 hidden text-[12rem] md:block lg:text-[16rem]">押忍</div>

      {/* ── Karatéka entrant dans le dojo ── */}
      <motion.div
        className="pointer-events-none absolute bottom-[8%] left-0 hidden sm:block"
        initial={{ x: '-15vw', opacity: 0 }}
        animate={{ x: ['-15vw', '22vw', '22vw'], opacity: [0, 1, 1] }}
        transition={{ duration: 9, times: [0, 0.45, 1], ease: 'easeInOut' }}
      >
        {/* silhouette qui marche : balancement */}
        <motion.svg viewBox="0 0 120 120" className="h-40 w-40 opacity-80 drop-shadow-[0_0_25px_rgba(200,16,46,0.6)] lg:h-56 lg:w-56"
          animate={{ y: [0, -6, 0], rotate: [0, 1.5, 0] }}
          transition={{ duration: 1.1, repeat: Infinity, ease: 'easeInOut' }}
        >
          <defs>
            <linearGradient id="hero-gi" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f5efe4" />
              <stop offset="100%" stopColor="#8a8175" />
            </linearGradient>
          </defs>
          {/* tête */}
          <circle cx="60" cy="14" r="9" fill="url(#hero-gi)" />
          {/* corps gi */}
          <path d="M48 26h24l4 34h-32z" fill="url(#hero-gi)" />
          {/* ceinture noire */}
          <rect x="46" y="56" width="28" height="6" rx="2" fill="#111" />
          <path d="M62 62l-3 14 4 1 4-14z" fill="#111" />
          {/* jambes en marche */}
          <motion.path d="M50 62l-10 30 7 2 11-30z" fill="#e8e0d0"
            animate={{ rotate: [0, 8, 0, -8, 0] }} transition={{ duration: 1.1, repeat: Infinity }} style={{ transformOrigin: '52px 62px' }} />
          <motion.path d="M66 62l12 28 7-2-11-28z" fill="#d8d0c0"
            animate={{ rotate: [0, -8, 0, 8, 0] }} transition={{ duration: 1.1, repeat: Infinity }} style={{ transformOrigin: '66px 62px' }} />
          {/* bras */}
          <path d="M48 28L32 52l6 4 14-22z" fill="url(#hero-gi)" />
          <path d="M70 28l14 10 4-6-12-10z" fill="url(#hero-gi)" />
        </motion.svg>
      </motion.div>

      {/* Torii stylisé à droite */}
      <motion.svg
        viewBox="0 0 200 160"
        className="pointer-events-none absolute -right-8 bottom-0 hidden h-72 w-96 opacity-40 lg:block"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 0.4, y: 0 }}
        transition={{ duration: 1.6, delay: 0.8 }}
      >
        <path d="M20 30h160l-8-14H28z" fill="#c8102e" />
        <rect x="40" y="30" width="12" height="120" fill="#8f0b21" />
        <rect x="148" y="30" width="12" height="120" fill="#8f0b21" />
        <rect x="52" y="70" width="96" height="8" fill="#c8102e" />
      </motion.svg>

      {/* Contenu */}
      <div className="mx-auto w-full max-w-7xl px-4 pt-28 sm:px-6">
        <div className="max-w-2xl">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="inline-flex items-center gap-2 rounded-full border border-karate-gold/40 bg-black/50 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.25em] text-karate-gold backdrop-blur"
          >
            <span className="h-2 w-2 animate-pulse rounded-full bg-karate-red" />
            Dojo • Karaté • Full Contact
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 34 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.15 }}
            className="mt-5 font-display text-5xl leading-[1.02] tracking-wide text-white sm:text-7xl"
          >
            CLUB OKINAWA
            <br />
            <span className="bg-gradient-to-r from-karate-red via-karate-gold to-karate-gold bg-clip-text text-transparent">
              SAINT-VINCENT-DE-PAUL
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="gold-underline mt-4 inline-block pb-2 font-display text-2xl tracking-[0.2em] text-karate-gold sm:text-3xl"
          >
            {slogan}
          </motion.p>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.45 }}
            className="mt-4 max-w-xl leading-relaxed text-stone-300"
          >
            {paragraphe}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="mt-8 flex flex-wrap gap-3"
          >
            <Link href="/pre-inscription" className="btn-karate animate-pulse-glow">
              S’inscrire au club <ChevronRight className="h-4 w-4" />
            </Link>
            <Link
              href="/galerie"
              className="inline-flex items-center gap-2 rounded-xl border border-white/25 bg-white/5 px-6 py-3 font-semibold text-white backdrop-blur transition hover:bg-white/15"
            >
              <Play className="h-4 w-4" /> Voir la galerie
            </Link>
          </motion.div>
        </div>
      </div>

      {/* Indicateur scroll */}
      <motion.div
        className="absolute bottom-6 left-1/2 -translate-x-1/2 text-center text-stone-400"
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 1.8, repeat: Infinity }}
      >
        <div className="mx-auto h-10 w-6 rounded-full border-2 border-stone-500 p-1">
          <div className="h-2 w-2 animate-bounce rounded-full bg-karate-gold" />
        </div>
        <span className="mt-1 block text-[11px] uppercase tracking-[0.3em]">Défiler</span>
      </motion.div>
    </section>
  );
}
