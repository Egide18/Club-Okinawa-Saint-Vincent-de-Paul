'use client';

import { useEffect, useRef, type ReactNode } from 'react';

/** Révélation animée au scroll (IntersectionObserver). */
export default function Reveal({
  children,
  variant = 'up',
  delay = 0,
  className = '',
  as: Tag = 'div',
}: {
  children: ReactNode;
  variant?: 'up' | 'left' | 'right' | 'zoom';
  delay?: number;
  className?: string;
  as?: 'div' | 'section' | 'article' | 'li' | 'h2' | 'p';
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            el.classList.add('visible');
            obs.disconnect();
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const variantClass =
    variant === 'left' ? 'reveal-left' : variant === 'right' ? 'reveal-right' : variant === 'zoom' ? 'reveal-zoom' : '';

  return (
    // @ts-expect-error polymorphisme simple
    <Tag ref={ref} className={`reveal ${variantClass} ${className}`} style={{ transitionDelay: `${delay}ms` }}>
      {children}
    </Tag>
  );
}
