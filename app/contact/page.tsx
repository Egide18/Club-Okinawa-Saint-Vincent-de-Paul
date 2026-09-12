import type { Metadata } from 'next';
import { MapPin, Clock, Mail, MessageCircle } from 'lucide-react';
import { getSettings } from '@/lib/store';
import ContactForm from '@/components/ContactForm';
import Reveal from '@/components/Reveal';
import KarateArt from '@/components/KarateArt';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Contact & WhatsApp',
  description: 'Contactez le Club Okinawa Saint-Vincent-de-Paul : formulaire, WhatsApp, adresse du dojo et horaires.',
};

export default async function ContactPage() {
  const s = await getSettings();
  const waLink = `https://wa.me/${s.whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent('Bonjour Club Okinawa SVP ! 🥋')}`;

  const infos = [
    { icon: MapPin, title: 'Adresse du dojo', text: s.adresseClub },
    { icon: Clock, title: 'Horaires', text: s.horairesClub },
    { icon: Mail, title: 'E-mail', text: s.emailClub },
  ];

  return (
    <>
      <section className="themed dojo-bg relative overflow-hidden pb-12 pt-36">
        <div className="kanji-ghost right-8 top-28 text-[9rem]">連絡</div>
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <Reveal>
            <span className="inline-block rounded-full border border-karate-gold/40 bg-karate-gold/10 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.25em] text-karate-gold">
              Parlons-nous
            </span>
          </Reveal>
          <Reveal delay={120}>
            <h1 className="mt-4 font-display text-5xl tracking-wide text-white sm:text-6xl">
              CONTACT <span className="text-karate-gold">& WHATSAPP</span>
            </h1>
          </Reveal>
          <Reveal delay={220}>
            <p className="mt-3 max-w-2xl text-stone-300">
              Une question sur les inscriptions, les horaires ou les compétitions ? Écrivez-nous — réponse rapide
              garantie, ou discutez en direct sur WhatsApp.
            </p>
          </Reveal>
        </div>
      </section>

      <section className="themed dojo-bg relative pb-24">
        <KarateArt variant="punch" className="pointer-events-none absolute -left-16 top-32 h-96 w-96" opacity={0.1} />
        <div className="mx-auto grid max-w-6xl gap-8 px-4 sm:px-6 lg:grid-cols-[340px_1fr]">
          <div className="space-y-4">
            {infos.map((info, i) => (
              <Reveal key={info.title} delay={i * 100} variant="left">
                <div className="flex items-start gap-4 rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur">
                  <span className="rounded-xl bg-karate-red/15 p-2.5 ring-1 ring-karate-red/30">
                    <info.icon className="h-5 w-5 text-karate-red" />
                  </span>
                  <div>
                    <h3 className="font-semibold text-white">{info.title}</h3>
                    <p className="text-sm text-stone-400">{info.text}</p>
                  </div>
                </div>
              </Reveal>
            ))}
            <Reveal delay={300} variant="left">
              <a
                href={waLink}
                target="_blank"
                rel="noopener noreferrer"
                className="block rounded-2xl border border-[#25D366]/40 bg-gradient-to-br from-[#25D366]/20 to-transparent p-5 transition hover:border-[#25D366] hover:shadow-lg hover:shadow-[#25D366]/20"
              >
                <div className="flex items-center gap-3">
                  <span className="rounded-full bg-[#25D366] p-3">
                    <MessageCircle className="h-6 w-6 text-white" />
                  </span>
                  <div>
                    <p className="font-bold text-white">WhatsApp direct</p>
                    <p className="text-sm text-stone-300">Cliquez pour discuter avec le club</p>
                  </div>
                </div>
              </a>
            </Reveal>
          </div>

          <Reveal variant="right" delay={150}>
            <ContactForm whatsapp={s.whatsapp} />
          </Reveal>
        </div>
      </section>
    </>
  );
}
