'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Cookie } from 'lucide-react';

const KEY = 'okinawa_cookie_consent';

export default function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const check = () => {
      try {
        if (!localStorage.getItem(KEY)) setVisible(true);
      } catch {
        setVisible(true);
      }
    };
    check();
    window.addEventListener('okinawa:cookies-reset', check);
    return () => window.removeEventListener('okinawa:cookies-reset', check);
  }, []);

  const choose = (value: 'accepted' | 'refused') => {
    try {
      localStorage.setItem(KEY, JSON.stringify({ value, at: new Date().toISOString() }));
    } catch { /* mode privé */ }
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="print-hidden fixed inset-x-0 bottom-0 z-[60] p-3 sm:p-5" role="dialog" aria-label="Consentement cookies">
      <div className="themed mx-auto flex max-w-4xl flex-col gap-4 rounded-2xl border border-white/15 bg-dojo-900/95 p-5 shadow-2xl shadow-black/60 backdrop-blur-xl sm:flex-row sm:items-center">
        <div className="flex items-start gap-3">
          <span className="rounded-xl bg-karate-gold/15 p-2.5">
            <Cookie className="h-5 w-5 text-karate-gold" />
          </span>
          <p className="text-sm leading-relaxed text-stone-300">
            Nous utilisons des cookies <strong className="text-white">strictement nécessaires</strong> (session
            admin, mémorisation de ce choix). Avec votre accord, nous mesurons la fréquentation pour améliorer
            le site. Voir notre{' '}
            <Link href="/confidentialite" className="underline decoration-karate-gold/60 underline-offset-2 hover:text-karate-gold">
              politique de confidentialité
            </Link>
            .
          </p>
        </div>
        <div className="flex shrink-0 gap-2">
          <button
            onClick={() => choose('refused')}
            className="flex-1 rounded-xl border border-white/20 px-4 py-2.5 text-sm font-semibold text-stone-200 transition hover:bg-white/10 sm:flex-none"
          >
            Refuser
          </button>
          <button onClick={() => choose('accepted')} className="flex-1 rounded-xl bg-karate-gold px-4 py-2.5 text-sm font-bold text-dojo-950 transition hover:brightness-110 sm:flex-none">
            Accepter
          </button>
        </div>
      </div>
    </div>
  );
}
