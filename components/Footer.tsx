'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Swords, MapPin, Mail, Clock, Phone, ShieldCheck } from 'lucide-react';

export default function Footer() {
  const pathname = usePathname();
  if (pathname.startsWith('/admin')) return null;
  const year = new Date().getFullYear();

  return (
    <footer className="relative overflow-hidden border-t border-white/10 bg-black">
      <div className="kanji-ghost right-4 top-6 text-[10rem]">空手</div>
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-2 lg:grid-cols-4">
        {/* Identité */}
        <div>
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-karate-red to-black ring-2 ring-karate-gold/70">
              <Swords className="h-5 w-5 text-karate-gold" />
            </span>
            <div className="font-display text-xl tracking-wider">
              OKINAWA <span className="text-karate-gold">SVP</span>
            </div>
          </div>
          <p className="mt-4 text-sm leading-relaxed text-stone-400">
            Club de karaté & full contact — discipline, respect, victoire. Perpétuer l’héritage des maîtres
            d’Okinawa, former des champions et des citoyens debout.
          </p>
        </div>

        {/* Navigation */}
        <div>
          <h3 className="font-display text-lg tracking-widest text-karate-gold">NAVIGATION</h3>
          <ul className="mt-4 space-y-2 text-sm">
            {[
              ['/', 'Accueil'],
              ['/a-propos', 'À propos & Sensei'],
              ['/galerie', 'Galerie'],
              ['/inscription', 'Inscription'],
              ['/contact', 'Contact'],
            ].map(([href, label]) => (
              <li key={href}>
                <Link href={href} className="text-stone-400 transition hover:text-karate-gold">
                  → {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h3 className="font-display text-lg tracking-widest text-karate-gold">DOJO</h3>
          <ul className="mt-4 space-y-3 text-sm text-stone-400">
            <li className="flex gap-2">
              <MapPin className="h-4 w-4 shrink-0 text-karate-red" /> Saint-Vincent-de-Paul — Dojo principal
            </li>
            <li className="flex gap-2">
              <Clock className="h-4 w-4 shrink-0 text-karate-red" /> Lun – Sam : 16h00 – 20h00
            </li>
            <li className="flex gap-2">
              <Mail className="h-4 w-4 shrink-0 text-karate-red" /> contact@okinawa-svp.club
            </li>
            <li className="flex gap-2">
              <Phone className="h-4 w-4 shrink-0 text-karate-red" /> WhatsApp via la page Contact
            </li>
          </ul>
        </div>

        {/* Légal */}
        <div>
          <h3 className="font-display text-lg tracking-widest text-karate-gold">CONFORMITÉ</h3>
          <ul className="mt-4 space-y-2 text-sm">
            <li>
              <Link href="/mentions-legales" className="text-stone-400 transition hover:text-karate-gold">
                Mentions légales
              </Link>
            </li>
            <li>
              <Link href="/confidentialite" className="text-stone-400 transition hover:text-karate-gold">
                Politique de confidentialité (RGPD)
              </Link>
            </li>
            <li>
              <button
                onClick={() => {
                  localStorage.removeItem('okinawa_cookie_consent');
                  window.dispatchEvent(new Event('okinawa:cookies-reset'));
                }}
                className="text-stone-400 transition hover:text-karate-gold"
              >
                Gérer les cookies
              </button>
            </li>
          </ul>
          <p className="mt-4 flex items-start gap-2 text-xs leading-relaxed text-stone-500">
            <ShieldCheck className="h-4 w-4 shrink-0 text-emerald-500" />
            Données hébergées sur Vercel (UE). Les médias de la galerie sont protégés contre le téléchargement.
          </p>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-4 py-5 text-xs text-stone-500 sm:flex-row sm:px-6">
          <span>© {year} Club Okinawa Saint-Vincent-de-Paul. Tous droits réservés.</span>
          <span className="font-display tracking-[0.25em] text-stone-600">押忍 — OSU ! 🥋</span>
        </div>
      </div>
    </footer>
  );
}
