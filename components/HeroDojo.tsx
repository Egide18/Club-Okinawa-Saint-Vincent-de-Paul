'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ChevronRight, Play } from 'lucide-react';

/**
 * Hero : dojo cinématique (fond 4K, torii, kanjis),
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
