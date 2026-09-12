import type { Metadata } from 'next';
import PreInscriptionWizard from '@/components/PreInscriptionWizard';
import CodeLookup from '@/components/CodeLookup';
import Reveal from '@/components/Reveal';
import KarateArt from '@/components/KarateArt';

export const metadata: Metadata = {
  title: 'Pré-inscription au club',
  description: 'Déposez votre pré-inscription au Club Okinawa Saint-Vincent-de-Paul et recevez votre fiche officielle avec code personnel.',
};

export default function PreInscriptionPage() {
  return (
    <>
      <section className="themed dojo-bg relative overflow-hidden pb-12 pt-36">
        <div className="kanji-ghost right-8 top-28 text-[9rem]">入会</div>
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <Reveal>
            <span className="inline-block rounded-full border border-karate-gold/40 bg-karate-gold/10 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.25em] text-karate-gold">
              Devenez membre
            </span>
          </Reveal>
          <Reveal delay={120}>
            <h1 className="mt-4 font-display text-5xl tracking-wide text-white sm:text-6xl">
              PRÉ-INSCRIPTION <span className="text-karate-gold">AU CLUB</span>
            </h1>
          </Reveal>
          <Reveal delay={220}>
            <p className="mt-3 max-w-2xl text-stone-300">
              Trois étapes : lisez les instructions, remplissez le formulaire, vérifiez puis soumettez.
              Vous recevez aussitôt votre fiche officielle avec un code personnel à 8 caractères.
            </p>
          </Reveal>
        </div>
      </section>

      <section className="themed dojo-bg relative pb-24">
        <KarateArt variant="kata" className="pointer-events-none absolute -right-16 top-24 h-96 w-96" opacity={0.1} />
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <PreInscriptionWizard />
          <div className="mx-auto mt-12 max-w-3xl">
            <CodeLookup />
          </div>
        </div>
      </section>
    </>
  );
}
