'use client';

import { useEffect, useState } from 'react';

/**
 * Previous / next buttons for the article-mentions row on a profile
 * (Roman, 2026-09-15). The row itself is a server-rendered scroll-snap
 * track that scrolls by touch, wheel and arrow keys without this; the
 * buttons are the desktop affordance and nothing more. Each click moves
 * one card; previous is disabled at the start, next at the end. Rendered
 * only when the row has more than three cards; hidden by CSS below 1100px.
 */
export function MentionsArrows({ trackId }: { trackId: string }) {
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);

  useEffect(() => {
    const el = document.getElementById(trackId);
    if (!el) return;
    // "At the end" means the last card is fully in view, not that
    // scrollLeft hit its maximum: with mandatory snap the track may never
    // rest at the exact maximum, and the button would never disable.
    const update = () => {
      setAtStart(el.scrollLeft <= 1);
      const last = el.lastElementChild as HTMLElement | null;
      const trackRight = el.getBoundingClientRect().right;
      setAtEnd(last ? last.getBoundingClientRect().right <= trackRight + 2 : true);
    };
    update();
    el.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    return () => {
      el.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
    };
  }, [trackId]);

  const step = (dir: -1 | 1) => {
    const el = document.getElementById(trackId);
    if (!el) return;
    const card = el.querySelector('li');
    const gap = parseFloat(getComputedStyle(el).columnGap) || 16;
    const width = (card ? card.getBoundingClientRect().width : el.clientWidth / 3) + gap;
    el.scrollBy({ left: dir * width, behavior: 'smooth' });
  };

  return (
    <div className="bar-v2-mentions-arrows">
      <button type="button" className="bar-v2-mentions-arrow" aria-label="Previous articles" disabled={atStart} onClick={() => step(-1)}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6" /></svg>
      </button>
      <button type="button" className="bar-v2-mentions-arrow" aria-label="Next articles" disabled={atEnd} onClick={() => step(1)}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 6l6 6-6 6" /></svg>
      </button>
    </div>
  );
}
