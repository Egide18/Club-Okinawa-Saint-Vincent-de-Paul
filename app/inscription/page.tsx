import type { Metadata } from 'next';
import InscriptionWizard from '@/components/InscriptionWizard';
import Reveal from '@/components/Reveal';
import KarateArt from '@/components/KarateArt';

export const metadata: Metadata = {
  title: 'Inscription au club',
  description: 'Déposez votre dossier d’inscription au Club Okinawa Saint-Vincent-de-Paul : instructions, formulaire et pièces justificatives.',
};

export default function InscriptionPage() {
  return (
    <>
      <section className="dojo-bg relative overflow-hidden pb-12 pt-36">
        <div className="kanji-ghost right-8 top-28 text-[9rem]">入会</div>
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <Reveal>
            <span className="inline-block rounded-full border border-karate-gold/40 bg-karate-gold/10 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.25em] text-karate-gold">
              Devenez membre
            </span>
          </Reveal>
          <Reveal delay={120}>
            <h1 className="mt-4 font-display text-5xl tracking-wide text-white sm:text-6xl">
              INSCRIPTION <span className="text-karate-gold">AU CLUB</span>
            </h1>
          </Reveal>
          <Reveal delay={220}>
            <p className="mt-3 max-w-2xl text-stone-300">
              Trois étapes : lisez les instructions, remplissez le formulaire, vérifiez puis soumettez votre
              candidature. Réponse du club sous quelques jours.
            </p>
          </Reveal>
        </div>
      </section>

      <section className="dojo-bg relative pb-24">
        <KarateArt variant="kata" className="pointer-events-none absolute -right-16 top-24 h-96 w-96" opacity={0.1} />
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <InscriptionWizard />
        </div>
      </section>
    </>
  );
}
