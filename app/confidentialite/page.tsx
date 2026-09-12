import type { Metadata } from 'next';
import Reveal from '@/components/Reveal';

export const metadata: Metadata = {
  title: 'Politique de confidentialité (RGPD)',
  description: 'Politique de confidentialité et protection des données du Club Okinawa Saint-Vincent-de-Paul.',
};

export default function Confidentialite() {
  return (
    <section className="dojo-bg relative pb-24 pt-36">
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <Reveal>
          <h1 className="font-display text-5xl tracking-wide text-white">CONFIDENTIALITÉ <span className="text-karate-gold">& RGPD</span></h1>
          <p className="mt-2 text-sm text-stone-500">Dernière mise à jour : 12 septembre 2026</p>
        </Reveal>
        <Reveal delay={150}>
          <article className="mt-8 space-y-6 rounded-3xl border border-white/10 bg-white/[0.03] p-6 text-sm leading-relaxed text-stone-300 sm:p-10">
            <div>
              <h2 className="font-display text-2xl tracking-wider text-karate-gold">1. RESPONSABLE DU TRAITEMENT</h2>
              <p className="mt-2">Club Okinawa Saint-Vincent-de-Paul — contact@okinawa-svp.club. Le club est responsable des traitements décrits ci-dessous.</p>
            </div>
            <div>
              <h2 className="font-display text-2xl tracking-wider text-karate-gold">2. DONNÉES COLLECTÉES</h2>
              <ul className="mt-2 list-disc space-y-1 pl-5">
                <li><strong>Inscription :</strong> identité, date de naissance, coordonnées, responsable légal (mineurs), catégorie sportive, pièces justificatives (identité, lettre, photo, certificat médical, preuve de paiement).</li>
                <li><strong>Contact :</strong> nom, e-mail, téléphone, sujet et contenu du message.</li>
                <li><strong>Données techniques automatiques :</strong> adresse IP, type d’appareil et modèle de téléphone (déduit du navigateur), système d’exploitation, date et heure — collectées sur les formulaires et les connexions admin à des fins de sécurité.</li>
                <li><strong>Cookies :</strong> session d’administration (strictement nécessaire) et préférence de consentement.</li>
              </ul>
            </div>
            <div>
              <h2 className="font-display text-2xl tracking-wider text-karate-gold">3. FINALITÉS & BASES LÉGALES</h2>
              <ul className="mt-2 list-disc space-y-1 pl-5">
                <li>Gestion des inscriptions et des dossiers d’adhérents — <em>consentement + mesures précontractuelles</em>.</li>
                <li>Réponse aux demandes de contact — <em>consentement</em>.</li>
                <li>Sécurité (journal des connexions admin, lutte anti-fraude) — <em>intérêt légitime</em>.</li>
              </ul>
            </div>
            <div>
              <h2 className="font-display text-2xl tracking-wider text-karate-gold">4. HÉBERGEMENT & SOUS-TRAITANTS</h2>
              <p className="mt-2">
                Données hébergées sur <strong>Vercel</strong> (Postgres + Blob, région Europe). Copie des
                inscriptions sur <strong>Google Firebase</strong> (Firestore). Ces prestataires agissent comme
                sous-traitants et ne peuvent utiliser vos données à d’autres fins. Aucune revente ou cession à
                des tiers à des fins commerciales.
              </p>
            </div>
            <div>
              <h2 className="font-display text-2xl tracking-wider text-karate-gold">5. DURÉES DE CONSERVATION</h2>
              <ul className="mt-2 list-disc space-y-1 pl-5">
                <li>Dossiers d’inscription : durée de l’adhésion + 3 ans, puis archivage ou suppression.</li>
                <li>Messages de contact : 3 ans maximum.</li>
                <li>Journaux de connexion : 12 mois maximum.</li>
                <li>Cookies de consentement : 6 mois.</li>
              </ul>
            </div>
            <div>
              <h2 className="font-display text-2xl tracking-wider text-karate-gold">6. VOS DROITS</h2>
              <p className="mt-2">
                Vous disposez des droits d’accès, de rectification, d’effacement, de limitation, d’opposition et
                de portabilité sur vos données, ainsi que du droit de retirer votre consentement à tout moment.
                Pour les exercer : <strong>contact@okinawa-svp.club</strong> (réponse sous 1 mois). Vous pouvez
                également saisir l’autorité de protection des données compétente.
              </p>
            </div>
            <div>
              <h2 className="font-display text-2xl tracking-wider text-karate-gold">7. SÉCURITÉ</h2>
              <p className="mt-2">
                Mots de passe chiffrés (bcrypt), sessions JWT en cookies httpOnly, chiffrement TLS, contrôle
                d’accès au tableau de bord, validation des fichiers (type et taille), en-têtes de sécurité
                (CSP, anti-clickjacking). Les médias de la galerie sont protégés contre le téléchargement.
              </p>
            </div>
            <div>
              <h2 className="font-display text-2xl tracking-wider text-karate-gold">8. MINEURS</h2>
              <p className="mt-2">
                L’inscription des mineurs (7–17 ans) requiert l’autorisation écrite d’un parent ou tuteur légal
                (lettre d’adhésion). Les parents peuvent demander à tout moment l’accès ou la suppression des
                données de leur enfant.
              </p>
            </div>
          </article>
        </Reveal>
      </div>
    </section>
  );
}
