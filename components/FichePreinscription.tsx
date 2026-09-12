import { ClubBadge, DrcFlag } from './Emblems';

export interface FicheData {
  code?: string;
  nom: string;
  postnom?: string;
  prenom: string;
  dateNaissance: string;
  age: number;
  isMinor: boolean;
  responsable?: { nom: string; prenom: string; adresse: string; telephone: string } | null;
  urgence?: { nom: string; prenom: string; adresse: string; telephone: string } | null;
  photo?: string | null;
  status: string;
  createdAt: string;
}

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' });

/** Document officiel — conçu pour l'écran, l'impression et l'export PDF. */
export default function FichePreinscription({ fiche }: { fiche: FicheData }) {
  const contact = fiche.isMinor ? fiche.responsable : fiche.urgence;
  const code = (fiche.code || '—').toUpperCase();

  return (
    <div id="fiche-print" className="fiche-sheet font-poppins mx-auto w-full max-w-[210mm] px-6 py-8 sm:px-12">
      {/* ── En-tête officiel ── */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
        <div style={{ paddingTop: 6 }}>
          <ClubBadge size={92} />
        </div>

        <div style={{ flex: 1, textAlign: 'center', color: '#111' }}>
          <p style={{ fontSize: 13, fontWeight: 700 }}>République Démocratique du Congo</p>
          <p style={{ fontSize: 12, fontWeight: 600 }}>Ministère des Sports et Loisirs</p>
          <p style={{ fontSize: 12, fontWeight: 600 }}>Fédération Congolaise de KARATE</p>
          <p style={{ fontSize: 12, fontWeight: 600 }}>Ville-Province de Kinshasa</p>
          <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: 1, marginTop: 4 }}>
            KARATE SHOTOKAN ET FULL-CONTACT
          </p>
          <p style={{ fontSize: 14, fontWeight: 800, color: '#1d4ed8', marginTop: 4 }}>
            CLUB OKINAWA SAINT-VINCENT DE PAUL
          </p>
          <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: 2, marginTop: 4 }}>
            OMNI MODO CHRISTUS ANNUNCIETUR
          </p>
          <p style={{ fontSize: 10, fontStyle: 'italic' }}>
            « Que de toutes manières le Christ soit annoncé »
          </p>
          <p style={{ fontSize: 12, fontWeight: 800, letterSpacing: 3, marginTop: 6 }}>
            SECRETARIAT GENERAL
          </p>
        </div>

        <div style={{ paddingTop: 6 }}>
          <DrcFlag width={104} />
        </div>
      </div>

      <div className="fiche-rule-double" style={{ marginTop: 16 }} />

      {/* ── Titre + code ── */}
      <div style={{ textAlign: 'center', marginTop: 16 }}>
        <h1 style={{ fontSize: 20, fontWeight: 800, letterSpacing: 1, color: '#111' }}>
          FICHE DE PRÉ-INSCRIPTION
        </h1>
        <p style={{ fontSize: 11, color: '#444', marginTop: 2 }}>Saison sportive — Karaté Shotokan &amp; Full-Contact</p>
        <div
          style={{
            display: 'inline-block',
            marginTop: 10,
            border: '2px solid #1e3a8a',
            borderRadius: 8,
            padding: '6px 22px',
            background: '#eff6ff',
          }}
        >
          <span style={{ fontSize: 11, fontWeight: 600, color: '#1e3a8a', letterSpacing: 2 }}>CODE DE PRÉ-INSCRIPTION</span>
          <div style={{ fontSize: 30, fontWeight: 800, letterSpacing: 6, color: '#111' }}>{code}</div>
        </div>
      </div>

      {/* ── Identité + photo ── */}
      <div style={{ display: 'flex', gap: 20, marginTop: 20, alignItems: 'flex-start' }}>
        <table style={{ flex: 1, fontSize: 12.5, borderCollapse: 'collapse' }}>
          <tbody>
            <Row k="Nom" v={fiche.nom} />
            {fiche.postnom ? <Row k="Post-nom" v={fiche.postnom} /> : null}
            <Row k="Prénom" v={fiche.prenom} />
            <Row k="Date de naissance" v={fmtDate(fiche.dateNaissance)} />
            <Row k="Âge au" v={`${fiche.age} ans — ${fiche.isMinor ? 'Mineur(e)' : 'Majeur(e)'}`} k2="jour de la demande" />
            <Row k="Date de la demande" v={fmtDate(fiche.createdAt)} />
          </tbody>
        </table>

        <div style={{ textAlign: 'center', flexShrink: 0 }}>
          <div
            style={{
              width: 128,
              height: 152,
              border: '2px solid #1e3a8a',
              borderRadius: 6,
              overflow: 'hidden',
              background: '#f3f4f6',
            }}
          >
            {fiche.photo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={fiche.photo} alt="Photo du candidat" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <div style={{ fontSize: 11, color: '#888', paddingTop: 60 }}>Photo</div>
            )}
          </div>
          <p style={{ fontSize: 10, color: '#555', marginTop: 4 }}>Photo du candidat</p>
        </div>
      </div>

      {/* ── Responsable / urgence ── */}
      <div style={{ marginTop: 16 }}>
        <h2
          style={{
            fontSize: 13,
            fontWeight: 800,
            letterSpacing: 1,
            color: '#fff',
            background: '#1e3a8a',
            padding: '6px 12px',
            borderRadius: 4,
          }}
        >
          {fiche.isMinor ? 'RESPONSABLE LÉGAL (CANDIDAT MINEUR)' : 'PERSONNE À CONTACTER EN CAS D’URGENCE'}
        </h2>
        <table style={{ width: '100%', fontSize: 12.5, borderCollapse: 'collapse', marginTop: 8 }}>
          <tbody>
            <Row k="Nom" v={contact?.nom || '—'} />
            <Row k="Prénom" v={contact?.prenom || '—'} />
            <Row k="Adresse" v={contact?.adresse || '—'} />
            <Row k="N° de téléphone" v={contact?.telephone || '—'} />
          </tbody>
        </table>
      </div>

      {/* ── Signatures ── */}
      <div style={{ display: 'flex', gap: 24, marginTop: 28, fontSize: 12 }}>
        <div style={{ flex: 1, textAlign: 'center' }}>
          <p style={{ fontWeight: 700 }}>Le Candidat / Parent (lu et approuvé)</p>
          <p style={{ color: '#666', fontSize: 11 }}>(Signature précédée de la mention manuscrite)</p>
          <div style={{ height: 70 }} />
          <div style={{ borderTop: '1px solid #999', margin: '0 24px' }} />
        </div>
        <div style={{ flex: 1, textAlign: 'center' }}>
          <p style={{ fontWeight: 700 }}>Le Secrétariat Général</p>
          <p style={{ color: '#666', fontSize: 11 }}>(Signature et cachet du club)</p>
          <div style={{ height: 70 }} />
          <div style={{ borderTop: '1px solid #999', margin: '0 24px' }} />
        </div>
      </div>

      {/* ── Pied ── */}
      <div style={{ marginTop: 24, borderTop: '1px solid #ddd', paddingTop: 8, fontSize: 10, color: '#555', textAlign: 'center' }}>
        <p>
          Document délivré par le Club Okinawa Saint-Vincent-de-Paul — vérifiable au secrétariat muni du code
          ci-dessus. La pré-inscription sera confirmée après dépôt du dossier complet (pièce d’identité, certificat
          médical, preuve de paiement) et validation du staff technique.
        </p>
        <p style={{ marginTop: 4 }}>
          Fiche N° <strong>{code}</strong> — générée le {fmtDate(fiche.createdAt)} — Réf. {fiche.dateNaissance.slice(0, 4)}/
          {String(fiche.age).padStart(2, '0')}
        </p>
      </div>
    </div>
  );
}

function Row({ k, v, k2 }: { k: string; v: string; k2?: string }) {
  return (
    <tr>
      <td
        style={{
          fontWeight: 700,
          color: '#333',
          width: 190,
          padding: '6px 10px',
          border: '1px solid #d4d4d4',
          background: '#f8fafc',
          verticalAlign: 'top',
        }}
      >
        {k}
        {k2 ? <span style={{ display: 'block', fontSize: 10, fontWeight: 500, color: '#777' }}>{k2}</span> : null}
      </td>
      <td style={{ padding: '6px 10px', border: '1px solid #d4d4d4', fontWeight: 600 }}>{v}</td>
    </tr>
  );
}
