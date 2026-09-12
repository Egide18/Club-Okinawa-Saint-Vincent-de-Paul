import type { Metadata } from 'next';
import './globals.css';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import CookieBanner from '@/components/CookieBanner';
import ThemeProvider from '@/components/ThemeProvider';

// Thème sombre (version d'origine) par défaut ; le mode jour ne s'active
// que si le visiteur l'a explicitement choisi (mémorisé localement).
const THEME_INIT = `(function(){try{if(localStorage.getItem('okinawa_theme')==='light'){document.documentElement.classList.add('light');}}catch(e){}})();`;

export const metadata: Metadata = {
  title: {
    default: 'Club Okinawa Saint-Vincent-de-Paul — Karaté & Full Contact',
    template: '%s | Club Okinawa SVP',
  },
  description:
    "Club de karaté et full contact Saint-Vincent-de-Paul : discipline, respect, victoire. Inscriptions, galerie, sensei fondateur et actualités du dojo.",
  keywords: ['karaté', 'full contact', 'club', 'dojo', 'Okinawa', 'Saint-Vincent-de-Paul', 'arts martiaux'],
  openGraph: {
    title: 'Club Okinawa Saint-Vincent-de-Paul',
    description: 'Discipline • Respect • Victoire — Rejoignez le dojo.',
    type: 'website',
    locale: 'fr_FR',
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT }} />
      </head>
      <body>
        <ThemeProvider>
          <Navbar />
          <main className="min-h-screen">{children}</main>
          <Footer />
          <CookieBanner />
        </ThemeProvider>
      </body>
    </html>
  );
}
