'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Quote, ChevronLeft, ChevronRight } from 'lucide-react';

/** Slider de citations / textes défilants. */
export default function TextSlider({ textes }: { textes: string[] }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused || textes.length < 2) return;
    const t = setInterval(() => setIndex((i) => (i + 1) % textes.length), 5000);
    return () => clearInterval(t);
  }, [paused, textes.length]);

  if (textes.length === 0) return null;

  return (
    <div
      className="relative mx-auto max-w-3xl text-center"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <Quote className="mx-auto h-10 w-10 rotate-180 text-karate-red/70" />
      <div className="mt-4 min-h-[120px]">
        <AnimatePresence mode="wait">
          <motion.blockquote
            key={index}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -24 }}
            transition={{ duration: 0.5 }}
            className="font-display text-2xl leading-snug tracking-wide text-white sm:text-3xl"
          >
            {textes[index]}
          </motion.blockquote>
        </AnimatePresence>
      </div>
      <div className="mt-6 flex items-center justify-center gap-4">
        <button
          onClick={() => setIndex((index - 1 + textes.length) % textes.length)}
          className="rounded-full border border-white/20 p-2 text-stone-300 transition hover:border-karate-gold hover:text-karate-gold"
          aria-label="Texte précédent"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <div className="flex gap-2">
          {textes.map((_, i) => (
            <button
              key={i}
              onClick={() => setIndex(i)}
              aria-label={`Aller au texte ${i + 1}`}
              className={`h-2 rounded-full transition-all ${i === index ? 'w-8 bg-karate-gold' : 'w-2 bg-white/20 hover:bg-white/40'}`}
            />
          ))}
        </div>
        <button
          onClick={() => setIndex((index + 1) % textes.length)}
          className="rounded-full border border-white/20 p-2 text-stone-300 transition hover:border-karate-gold hover:text-karate-gold"
          aria-label="Texte suivant"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}
