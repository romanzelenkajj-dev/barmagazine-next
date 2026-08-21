'use client';

import { useCallback, useEffect, useState } from 'react';

/**
 * Gallery grid with a full-screen lightbox.
 * Receives the photos to show in the grid (already sliced by the caller)
 * plus the bar name for alt text. Keyboard: Esc closes, arrows navigate.
 */
export default function BarGallery({ photos, barName }: { photos: string[]; barName: string }) {
  const [open, setOpen] = useState<number | null>(null);

  const close = useCallback(() => setOpen(null), []);
  const prev = useCallback(
    () => setOpen(o => (o === null ? null : (o + photos.length - 1) % photos.length)),
    [photos.length]
  );
  const next = useCallback(
    () => setOpen(o => (o === null ? null : (o + 1) % photos.length)),
    [photos.length]
  );

  useEffect(() => {
    if (open === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
      else if (e.key === 'ArrowLeft') prev();
      else if (e.key === 'ArrowRight') next();
    };
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, close, prev, next]);

  return (
    <>
      <div className="bar-v2-gallery-grid">
        {photos.map((photo, i) => (
          <button
            key={i}
            type="button"
            className="bar-v2-gallery-item bar-v2-gallery-item--btn"
            onClick={() => setOpen(i)}
            aria-label={`View photo ${i + 2} of ${barName} full screen`}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={photo} alt={`${barName} photo ${i + 2}`} loading="lazy" />
          </button>
        ))}
      </div>

      {open !== null && (
        <div
          className="bar-v2-lightbox"
          role="dialog"
          aria-modal="true"
          aria-label={`${barName} photo viewer`}
          onClick={close}
        >
          <button
            type="button"
            className="bar-v2-lightbox-close"
            onClick={close}
            aria-label="Close photo viewer"
          >
            &times;
          </button>
          {photos.length > 1 && (
            <button
              type="button"
              className="bar-v2-lightbox-nav bar-v2-lightbox-nav--prev"
              onClick={e => { e.stopPropagation(); prev(); }}
              aria-label="Previous photo"
            >
              &#8249;
            </button>
          )}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={photos[open]}
            alt={`${barName} photo ${open + 2}`}
            className="bar-v2-lightbox-img"
            onClick={e => e.stopPropagation()}
          />
          {photos.length > 1 && (
            <button
              type="button"
              className="bar-v2-lightbox-nav bar-v2-lightbox-nav--next"
              onClick={e => { e.stopPropagation(); next(); }}
              aria-label="Next photo"
            >
              &#8250;
            </button>
          )}
          <div className="bar-v2-lightbox-count" onClick={e => e.stopPropagation()}>
            {open + 1} / {photos.length}
          </div>
        </div>
      )}
    </>
  );
}
