'use client';

/**
 * Silhouettes de karatéka en SVG animé (décor de fond des sections).
 * Variantes : kick (coup de pied), kata (position), punch (coup de poing).
 */
export default function KarateArt({
  variant = 'kick',
  className = '',
  opacity = 0.14,
}: {
  variant?: 'kick' | 'kata' | 'punch';
  className?: string;
  opacity?: number;
}) {
  const paths: Record<string, string> = {
    // Coup de pied sauté — silhouette stylisée
    kick: 'M62 8c5 0 9 4 9 9s-4 9-9 9-9-4-9-9 4-9 9-9zm-4 24l6 2 22-8 4 6-20 10 8 26 18 30 8-4-12-30-4-22 14-4 2-8-22 4-8-2-6-14-8 2 4 12-16 6-22-14 2-8 20 12zm-6 50l-8 30 8 4 12-28-12-6z',
    // Position kiba-dachi
    kata: 'M60 6c5 0 9 4 9 9s-4 9-9 9-9-4-9-9 4-9 9-9zm-30 22l12-4 10 8v14l-16 6-14 22-10 26 8 4 12-24 14-20 14 2 12 18 10 26 8-4-8-28-14-22-12-6v-12l8-8 14 2 2-8-20-4-8-6-8 4-16 2-2 6z',
    // Coup de poing avancé
    punch: 'M58 8c5 0 9 4 9 9s-4 9-9 9-9-4-9-9 4-9 9-9zm-34 20l16-2 12 6 24-4 2 8-22 6-8 8 4 16-6 24-16 20 6 6 18-18 8-26 12-2 16 8 8 20 8-2-6-24-18-10-14-2-8-12 2-12-14-2-16 4-2 6z',
  };

  return (
    <svg
      viewBox="0 0 120 120"
      className={`pointer-events-none select-none ${className}`}
      style={{ opacity }}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={`kg-${variant}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#c8102e" />
          <stop offset="100%" stopColor="#d4a017" />
        </linearGradient>
      </defs>
      <g className="origin-center animate-kata">
        <path d={paths[variant]} fill={`url(#kg-${variant})`} />
      </g>
      {/* Cercles d'énergie */}
      <circle cx="60" cy="60" r="54" fill="none" stroke="currentColor" strokeOpacity="0.25" strokeWidth="1" strokeDasharray="6 8" className="animate-[spin_40s_linear_infinite] text-karate-gold" style={{ transformOrigin: '60px 60px' }} />
      <circle cx="60" cy="60" r="44" fill="none" stroke="currentColor" strokeOpacity="0.18" strokeWidth="1" className="text-karate-red" />
    </svg>
  );
}
