'use client';

import { useCallback, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Play, Image as ImageIcon, ShieldAlert, Loader2 } from 'lucide-react';
import type { GalleryItem } from '@/lib/store';
import Reveal from './Reveal';

/**
 * Galerie protégée contre le téléchargement :
 * - clic droit désactivé, glisser-déposer bloqué
 * - vidéos : controlsList="nodownload", pas de Picture-in-Picture
 * - overlay transparent interceptant les interactions directes
 * - filigrane du club sur chaque média
 */
export default function GalleryGrid({ initialItems }: { initialItems: GalleryItem[] }) {
  const [items, setItems] = useState(initialItems);
  const [filter, setFilter] = useState<'all' | 'image' | 'video'>('all');
  const [lightbox, setLightbox] = useState<GalleryItem | null>(null);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/gallery', { cache: 'no-store' });
      const data = await res.json();
      if (data.items) setItems(data.items);
    } catch { /* repli sur initialItems */ }
    setLoading(false);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    // Bloquer le menu contextuel sur toute la galerie
    const block = (e: MouseEvent) => {
      if ((e.target as HTMLElement).closest?.('[data-gallery]')) e.preventDefault();
    };
    const blockKeys = (e: KeyboardEvent) => {
      if (lightbox && e.key === 'Escape') setLightbox(null);
    };
    document.addEventListener('contextmenu', block);
    document.addEventListener('keydown', blockKeys);
    return () => {
      document.removeEventListener('contextmenu', block);
      document.removeEventListener('keydown', blockKeys);
    };
  }, [lightbox]);

  const filtered = items.filter((i) => filter === 'all' || i.type === filter);

  return (
    <div data-gallery>
      {/* Filtres */}
      <div className="mb-8 flex flex-wrap items-center justify-center gap-2">
        {(
          [
            ['all', 'Tout'],
            ['image', 'Photos'],
            ['video', 'Vidéos'],
          ] as const
        ).map(([v, label]) => (
          <button
            key={v}
            onClick={() => setFilter(v)}
            className={`rounded-full px-5 py-2 text-sm font-semibold transition ${
              filter === v
                ? 'bg-karate-red text-white shadow-lg shadow-karate-red/40'
                : 'border border-white/15 bg-white/5 text-stone-300 hover:border-karate-gold/50 hover:text-white'
            }`}
          >
            {label}
          </button>
        ))}
        {loading && <Loader2 className="h-4 w-4 animate-spin text-karate-gold" />}
      </div>

      <p className="mx-auto mb-8 flex max-w-xl items-center justify-center gap-2 text-center text-xs text-stone-500">
        <ShieldAlert className="h-4 w-4 shrink-0 text-karate-gold" />
        Médias protégés © Club Okinawa SVP — toute reproduction ou téléchargement est interdite.
      </p>

      {filtered.length === 0 ? (
        <div className="mx-auto max-w-md rounded-2xl border border-dashed border-white/15 bg-white/5 p-10 text-center">
          <ImageIcon className="mx-auto h-10 w-10 text-stone-600" />
          <p className="mt-3 text-stone-400">Aucun média pour le moment. Revenez bientôt.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((item, idx) => (
            <Reveal key={item.id} variant="zoom" delay={(idx % 3) * 100}>
              <article
                className="protected-media card-hover group cursor-pointer overflow-hidden rounded-2xl border border-white/10 bg-dojo-900"
                onClick={() => setLightbox(item)}
                onDragStart={(e) => e.preventDefault()}
              >
                <div className="lock-interaction keep-dark relative aspect-[4/3] overflow-hidden bg-black">
                  {item.type === 'image' ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={item.url}
                      alt={item.title}
                      loading="lazy"
                      draggable={false}
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  ) : (
                    <video
                      src={item.url}
                      className="h-full w-full object-cover"
                      muted
                      playsInline
                      preload="metadata"
                      controlsList="nodownload noplaybackrate"
                      disablePictureInPicture
                      onContextMenu={(e) => e.preventDefault()}
                    />
                  )}
                  {/* Filigrane */}
                  <span className="pointer-events-none absolute bottom-2 right-3 select-none font-display text-sm tracking-[0.2em] text-white/50 drop-shadow">
                    OKINAWA SVP ©
                  </span>
                  {item.type === 'video' && (
                    <span className="absolute inset-0 flex items-center justify-center">
                      <span className="rounded-full bg-karate-red/90 p-4 shadow-xl shadow-black/50 transition group-hover:scale-110">
                        <Play className="h-6 w-6 fill-white text-white" />
                      </span>
                    </span>
                  )}
                  {/* Bouclier anti-interaction directe */}
                  <span className="shield" />
                </div>
                <div className="p-4">
                  <h3 className="truncate font-semibold text-white">{item.title}</h3>
                  <p className="mt-0.5 text-xs text-stone-500">
                    {item.type === 'video' ? 'Vidéo' : 'Photo'} •{' '}
                    {new Date(item.createdAt).toLocaleDateString('fr-FR')}
                  </p>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      )}

      {/* Lightbox */}
      <AnimatePresence>
        {lightbox && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="keep-dark fixed inset-0 z-[70] flex items-center justify-center bg-black/90 p-4 backdrop-blur-sm"
            onClick={() => setLightbox(null)}
          >
            <button
              className="absolute right-4 top-4 rounded-full border border-white/20 bg-white/10 p-2.5 text-white transition hover:bg-karate-red"
              aria-label="Fermer"
            >
              <X className="h-5 w-5" />
            </button>
            <motion.div
              initial={{ scale: 0.92, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 10 }}
              className="protected-media w-full max-w-4xl overflow-hidden rounded-2xl border border-white/15 bg-dojo-900"
              onClick={(e) => e.stopPropagation()}
              onDragStart={(e) => e.preventDefault()}
            >
              <div className="relative bg-black">
                {lightbox.type === 'image' ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={lightbox.url} alt={lightbox.title} draggable={false} className="max-h-[70vh] w-full object-contain" />
                ) : (
                  <video
                    src={lightbox.url}
                    controls
                    autoPlay
                    playsInline
                    controlsList="nodownload noplaybackrate"
                    disablePictureInPicture
                    onContextMenu={(e) => e.preventDefault()}
                    className="max-h-[70vh] w-full"
                  />
                )}
                <span className="pointer-events-none absolute bottom-3 right-4 select-none font-display text-lg tracking-[0.25em] text-white/60 drop-shadow-lg">
                  OKINAWA SVP ©
                </span>
              </div>
              <div className="p-5">
                <h3 className="font-display text-2xl tracking-wide text-white">{lightbox.title}</h3>
                {lightbox.description && <p className="mt-1 text-sm text-stone-400">{lightbox.description}</p>}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
