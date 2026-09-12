'use client';

import { useMemo } from 'react';

/**
 * Pluie de caractères façon Matrix en fond de page
 * (adapté de Uiverse.io — whoisyourdeadie/foolish-rabbit-13,
 * teinté aux couleurs du club). Délais déterministes (pas de
 * désynchronisation d'hydratation).
 */
export default function MatrixBackground({ columns = 44 }: { columns?: number }) {
  const cols = useMemo(() => {
    const durations = [2.3, 2.4, 2.5, 2.6, 2.7, 2.8, 2.9, 3, 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8, 3.9, 4, 4.1, 4.2, 4.3, 4.4];
    return Array.from({ length: columns }, (_, i) => ({
      left: `${(i / columns) * 100}%`,
      animationDuration: `${durations[i % durations.length]}s`,
      animationDelay: `-${(1.5 + ((i * 37) % 26) / 10).toFixed(1)}s`,
      opacity: 0.55 + ((i * 13) % 45) / 100,
    }));
  }, [columns]);

  return (
    <div className="matrix-container" aria-hidden="true">
      <div className="matrix-pattern">
        {cols.map((c, i) => (
          <div
            key={i}
            className="matrix-column"
            style={{
              left: c.left,
              animationDuration: c.animationDuration,
              animationDelay: c.animationDelay,
              opacity: c.opacity,
            }}
          />
        ))}
      </div>
      {/* Voile pour la lisibilité du formulaire */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(5,3,4,0.25)_0%,rgba(5,3,4,0.82)_75%)]" />
    </div>
  );
}
