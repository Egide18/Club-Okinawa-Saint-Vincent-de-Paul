'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * Écran de chargement affiché 3 secondes avant l'accueil
 * (une fois par session, animation adaptée de Uiverse.io — Nawsome).
 */
export default function SplashLoader() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined;
    try {
      if (!sessionStorage.getItem('okinawa_splash_seen')) {
        setVisible(true);
        timer = setTimeout(() => {
          setVisible(false);
          try {
            sessionStorage.setItem('okinawa_splash_seen', '1');
          } catch { /* ignore */ }
        }, 3000);
      }
    } catch {
      setVisible(true);
      timer = setTimeout(() => setVisible(false), 3000);
    }
    return () => clearTimeout(timer);
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          exit={{ opacity: 0, transition: { duration: 0.5 } }}
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-dojo-950"
          role="status"
          aria-label="Chargement du site"
        >
          <div className="splash-scope relative h-44 w-60" aria-hidden="true">
            <div className="loader" />
            <div className="loader" />
            <div className="loader" />
          </div>

          <p className="mt-10 font-display text-3xl tracking-[0.2em] text-white">
            OKINAWA <span className="text-karate-gold">SVP</span>
          </p>
          <p className="mt-1 text-xs font-semibold uppercase tracking-[0.35em] text-stone-400">
            Karaté • Full-Contact
          </p>

          <div className="splash-bar mt-8 h-1.5 w-52 rounded-full" aria-hidden="true" />
          <p className="mt-3 text-xs text-stone-500">Entrée dans le dojo…</p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
