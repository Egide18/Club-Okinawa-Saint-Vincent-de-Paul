/**
 * Emblèmes 100 % CSS (aucune image externe) :
 * - ClubBadge : médaillon officiel du club
 * - DrcFlag : drapeau de la République Démocratique du Congo
 * Nets à l'écran, à l'impression et dans le PDF généré.
 */

export function ClubBadge({ size = 96 }: { size?: number }) {
  return (
    <div
      aria-label="Logo du Club Okinawa Saint-Vincent-de-Paul"
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        background: 'radial-gradient(circle at 35% 30%, #e01b36 0%, #8f0b21 55%, #3d050e 100%)',
        border: `${Math.max(3, size * 0.045)}px solid #d4a017`,
        boxShadow: '0 0 0 2px #fff, 0 0 0 3.5px #1e3a8a, 0 4px 14px rgba(0,0,0,.25)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#fff',
        fontFamily: 'Poppins, sans-serif',
        flexShrink: 0,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Reflet */}
      <div
        style={{
          position: 'absolute',
          top: '-30%',
          left: '-30%',
          width: '70%',
          height: '70%',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255,255,255,.35) 0%, transparent 70%)',
        }}
      />
      <div style={{ fontSize: size * 0.1, fontWeight: 700, letterSpacing: size * 0.02, color: '#f5d76e', lineHeight: 1 }}>
        OKINAWA
      </div>
      <div style={{ fontSize: size * 0.24, fontWeight: 800, lineHeight: 1.05, letterSpacing: 1 }}>
        空手
      </div>
      <div
        style={{
          marginTop: 2,
          fontSize: size * 0.075,
          fontWeight: 700,
          letterSpacing: size * 0.015,
          background: '#111',
          color: '#f5d76e',
          padding: '1px 6px',
          borderRadius: 3,
          lineHeight: 1.4,
        }}
      >
        SVP • KIN
      </div>
    </div>
  );
}

export function DrcFlag({ width = 120 }: { width?: number }) {
  const height = (width * 2) / 3;
  return (
    <div
      role="img"
      aria-label="Drapeau de la République Démocratique du Congo"
      style={{
        width,
        height,
        flexShrink: 0,
        position: 'relative',
        overflow: 'hidden',
        borderRadius: 3,
        boxShadow: '0 0 0 1px rgba(0,0,0,.2), 0 4px 14px rgba(0,0,0,.25)',
        background:
          'linear-gradient(to bottom right, transparent 0%, transparent 41.5%, #f7d618 41.5%, #f7d618 44.5%, #ce1126 44.5%, #ce1126 57%, #f7d618 57%, #f7d618 60%, transparent 60%, transparent 100%), #007fff',
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: height * 0.08,
          left: width * 0.06,
          color: '#f7d618',
          fontSize: height * 0.34,
          lineHeight: 1,
          fontFamily: 'Poppins, sans-serif',
        }}
      >
        ★
      </div>
    </div>
  );
}
