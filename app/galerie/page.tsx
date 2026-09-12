import type { Metadata } from 'next';
import { listGallery } from '@/lib/store';
import GalleryGrid from '@/components/GalleryGrid';
import Reveal from '@/components/Reveal';
import KarateArt from '@/components/KarateArt';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Galerie photos & vidéos',
  description: 'Photos et vidéos protégées du Club Okinawa Saint-Vincent-de-Paul : entraînements, katas, compétitions.',
};

export default async function GaleriePage() {
  const items = await listGallery();

  return (
    <>
      <section className="themed dojo-bg relative overflow-hidden pb-14 pt-36">
        <div className="kanji-ghost right-8 top-28 text-[9rem]">写真</div>
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <Reveal>
            <span className="inline-block rounded-full border border-karate-gold/40 bg-karate-gold/10 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.25em] text-karate-gold">
              En images
            </span>
          </Reveal>
          <Reveal delay={120}>
            <h1 className="mt-4 font-display text-5xl tracking-wide text-white sm:text-6xl">
              GALERIE <span className="text-karate-gold">DU DOJO</span>
            </h1>
          </Reveal>
          <Reveal delay={220}>
            <p className="mt-3 max-w-2xl text-stone-300">
              Entraînements, katas, passages de grades et compétitions — plongez dans la vie du club.
            </p>
          </Reveal>
        </div>
      </section>

      <section className="themed dojo-bg relative pb-24">
        <KarateArt variant="kick" className="pointer-events-none absolute -left-16 top-40 h-96 w-96" opacity={0.1} />
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <GalleryGrid initialItems={items} />
        </div>
      </section>
    </>
  );
}
