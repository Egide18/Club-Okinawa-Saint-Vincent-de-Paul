'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Menu, X, Swords } from 'lucide-react';

const LINKS = [
  { href: '/', label: 'Accueil' },
  { href: '/a-propos', label: 'À propos' },
  { href: '/galerie', label: 'Galerie' },
  { href: '/inscription', label: 'Inscription' },
  { href: '/contact', label: 'Contact' },
];

export default function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => setOpen(false), [pathname]);

  if (pathname.startsWith('/admin')) return null;

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-dojo-950/90 shadow-lg shadow-black/40 backdrop-blur-xl' : 'bg-gradient-to-b from-black/70 to-transparent'
      }`}
    >
      <nav className="mx-auto flex h-[72px] max-w-7xl items-center justify-between px-4 sm:px-6">
        {/* Logo */}
        <Link href="/" className="group flex items-center gap-3">
          <span className="relative flex h-11 w-11 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-karate-red via-karate-darkred to-black ring-2 ring-karate-gold/70 transition-transform group-hover:rotate-12">
            <Swords className="h-5 w-5 text-karate-gold" />
          </span>
          <span className="leading-tight">
            <span className="block font-display text-xl tracking-wider text-white">
              OKINAWA <span className="text-karate-gold">SVP</span>
            </span>
            <span className="block text-[11px] font-medium uppercase tracking-[0.22em] text-stone-400">
              Karaté • Full Contact
            </span>
          </span>
        </Link>

        {/* Desktop */}
        <ul className="hidden items-center gap-1 lg:flex">
          {LINKS.map((l) => (
            <li key={l.href}>
              <Link
                href={l.href}
                className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
                  pathname === l.href
                    ? 'bg-karate-red/15 text-karate-gold'
                    : 'text-stone-200 hover:bg-white/5 hover:text-white'
                }`}
              >
                {l.label}
              </Link>
            </li>
          ))}
          <li className="ml-3">
            <Link href="/inscription" className="btn-karate !px-5 !py-2.5 text-sm">
              Rejoindre le club
            </Link>
          </li>
        </ul>

        {/* Mobile */}
        <button
          className="rounded-lg p-2 text-white hover:bg-white/10 lg:hidden"
          onClick={() => setOpen(!open)}
          aria-label={open ? 'Fermer le menu' : 'Ouvrir le menu'}
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </nav>

      {/* Panneau mobile */}
      <div
        className={`overflow-hidden border-t border-white/10 bg-dojo-950/95 backdrop-blur-xl transition-all duration-300 lg:hidden ${
          open ? 'max-h-[420px]' : 'max-h-0 border-t-0'
        }`}
      >
        <ul className="space-y-1 px-4 py-4">
          {LINKS.map((l) => (
            <li key={l.href}>
              <Link
                href={l.href}
                className={`block rounded-lg px-4 py-3 font-semibold transition ${
                  pathname === l.href ? 'bg-karate-red/15 text-karate-gold' : 'text-stone-200 hover:bg-white/5'
                }`}
              >
                {l.label}
              </Link>
            </li>
          ))}
          <li className="pt-2">
            <Link href="/inscription" className="btn-karate w-full">
              Rejoindre le club
            </Link>
          </li>
        </ul>
      </div>
    </header>
  );
}
