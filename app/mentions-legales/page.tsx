import type { Metadata } from 'next';
import Reveal from '@/components/Reveal';

export const metadata: Metadata = {
  title: 'Mentions légales',
  description: 'Mentions légales du site du Club Okinawa Saint-Vincent-de-Paul.',
};

export default function MentionsLegales() {
  return (
    <section className="dojo-bg relative pb-24 pt-36">
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <Reveal>
          <h1 className="font-display text-5xl tracking-wide text-white">MENTIONS LÉGALES</h1>
          <p className="mt-2 text-sm text-stone-500">Dernière mise à jour : 12 septembre 2026</p>
        </Reveal>
        <Reveal delay={150}>
          <article className="prose-dark mt-8 space-y-6 rounded-3xl border border-white/10 bg-white/[0.03] p-6 text-sm leading-relaxed text-stone-300 sm:p-10">
            <div>
              <h2 className="font-display text-2xl tracking-wider text-karate-gold">1. ÉDITEUR DU SITE</h2>
              <p className="mt-2">
                Club Okinawa Saint-Vincent-de-Paul — association sportive (club de karaté & full contact).<br />
                Adresse : Saint-Vincent-de-Paul — Dojo principal.<br />
                E-mail : contact@okinawa-svp.club<br />
                Directeur de la publication : le Sensei fondateur, en qualité de responsable du club.
              </p>
            </div>
            <div>
              <h2 className="font-display text-2xl tracking-wider text-karate-gold">2. HÉBERGEMENT</h2>
              <p className="mt-2">
                Site hébergé par <strong>Vercel Inc.</strong> (340 S Lemon Ave #4133, Walnut, CA 91789, USA) —
                infrastructure et région de déploiement Europe (Paris). Base de données : Vercel Postgres.
                Stockage des fichiers : Vercel Blob. Copie des dossiers d’inscription : Google Firebase
                (Firestore, Union européenne / États-Unis selon configuration du projet).
              </p>
            </div>
            <div>
              <h2 className="font-display text-2xl tracking-wider text-karate-gold">3. PROPRIÉTÉ INTELLECTUELLE</h2>
              <p className="mt-2">
                L’ensemble des contenus du site (textes, logo, photographies, vidéos, hymne) est la propriété
                exclusive du Club Okinawa Saint-Vincent-de-Paul, sauf mention contraire. Les médias de la
                galerie sont techniquement protégés contre le téléchargement ; toute reproduction, diffusion ou
                extraction sans autorisation écrite est interdite et passible de poursuites.
              </p>
            </div>
            <div>
              <h2 className="font-display text-2xl tracking-wider text-karate-gold">4. DONNÉES PERSONNELLES</h2>
              <p className="mt-2">
                Les traitements de données (inscriptions, contact, journaux de connexion) sont décrits dans la{' '}
                <a href="/confidentialite" className="underline decoration-karate-gold/60 hover:text-karate-gold">
                  politique de confidentialité
                </a>
                . Pour exercer vos droits (accès, rectification, suppression), contactez : contact@okinawa-svp.club.
              </p>
            </div>
            <div>
              <h2 className="font-display text-2xl tracking-wider text-karate-gold">5. COOKIES</h2>
              <p className="mt-2">
                Le site utilise des cookies strictement nécessaires (session d’administration, mémorisation du
                consentement) et, avec votre accord, des mesures d’audience. Vous pouvez modifier votre choix à
                tout moment via le lien « Gérer les cookies » dans le pied de page.
              </p>
            </div>
            <div>
              <h2 className="font-display text-2xl tracking-wider text-karate-gold">6. RESPONSABILITÉ</h2>
              <p className="mt-2">
                Le club s’efforce d’assurer l’exactitude des informations publiées mais ne saurait être tenu
                responsable des erreurs, omissions ou indisponibilités temporaires. Les liens externes (dont
                WhatsApp) relèvent de la responsabilité de leurs éditeurs respectifs.
              </p>
            </div>
          </article>
        </Reveal>
      </div>
    </section>
  );
}
