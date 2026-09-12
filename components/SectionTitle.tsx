import Reveal from './Reveal';

export default function SectionTitle({
  kicker,
  title,
  subtitle,
}: {
  kicker: string;
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="mx-auto mb-12 max-w-3xl text-center">
      <Reveal>
        <span className="inline-block rounded-full border border-karate-gold/40 bg-karate-gold/10 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.25em] text-karate-gold">
          {kicker}
        </span>
      </Reveal>
      <Reveal delay={120}>
        <h2 className="mt-4 font-display text-4xl tracking-wide text-white sm:text-5xl">{title}</h2>
      </Reveal>
      {subtitle && (
        <Reveal delay={220}>
          <p className="mt-3 text-stone-400">{subtitle}</p>
        </Reveal>
      )}
    </div>
  );
}
