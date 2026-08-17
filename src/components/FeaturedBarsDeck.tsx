'use client';

import { useCallback, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';

export interface DeckCard {
  href: string;
  title: string;
  img: string | null;
  tag?: string;
}

const FLY_MS = 380;
const SWIPE_DISTANCE = 70; // px past which release commits the swipe
const SWIPE_VELOCITY = 0.45; // px/ms flick threshold

/**
 * Fun Radio-style swipeable card deck.
 * - The top card tracks the pointer 1:1 while dragging (with rotation).
 * - The cards behind grow toward the front IN SYNC with the drag progress.
 * - On release past the threshold (or a quick flick) the card flies off and
 *   the next card finishes its promotion; otherwise everything springs back.
 * - Cards are keyed by href so promotion animates the SAME element between
 *   deck positions instead of snapping.
 * - Tap (no movement) opens the card; arrows and dots also advance the deck.
 */
export function FeaturedBarsDeck({ cards }: { cards: DeckCard[] }) {
  const router = useRouter();
  const [index, setIndex] = useState(0);
  const [drag, setDrag] = useState<{ dx: number; active: boolean }>({ dx: 0, active: false });
  const [leaving, setLeaving] = useState<{ dir: 1 | -1 } | null>(null);

  const pointer = useRef<{ id: number; startX: number; startT: number; lastX: number; lastT: number } | null>(null);
  const moved = useRef(false);

  const count = cards.length;

  const commit = useCallback(
    (dir: 1 | -1, target?: number) => {
      if (leaving) return;
      setLeaving({ dir });
      setTimeout(() => {
        setIndex(i => (target !== undefined ? target : (i + dir + count) % count));
        setLeaving(null);
        setDrag({ dx: 0, active: false });
      }, FLY_MS);
    },
    [leaving, count],
  );

  if (count === 0) return null;

  const cardAt = (offset: number) => cards[(index + offset + count) % count];

  const onPointerDown = (e: React.PointerEvent) => {
    if (leaving) return;
    pointer.current = { id: e.pointerId, startX: e.clientX, startT: e.timeStamp, lastX: e.clientX, lastT: e.timeStamp };
    moved.current = false;
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    setDrag({ dx: 0, active: true });
  };

  const onPointerMove = (e: React.PointerEvent) => {
    const p = pointer.current;
    if (!p || p.id !== e.pointerId || leaving) return;
    const dx = e.clientX - p.startX;
    if (Math.abs(dx) > 6) moved.current = true;
    p.lastX = e.clientX;
    p.lastT = e.timeStamp;
    setDrag({ dx, active: true });
  };

  const endDrag = (e: React.PointerEvent) => {
    const p = pointer.current;
    if (!p || p.id !== e.pointerId) return;
    pointer.current = null;
    const dx = e.clientX - p.startX;
    const dt = Math.max(1, e.timeStamp - p.startT);
    const velocity = Math.abs(dx) / dt;
    if (Math.abs(dx) > SWIPE_DISTANCE || (Math.abs(dx) > 24 && velocity > SWIPE_VELOCITY)) {
      // keep current dx while the fly-out transition takes over
      setDrag({ dx, active: false });
      commit(dx < 0 ? 1 : -1);
    } else {
      setDrag({ dx: 0, active: false });
    }
  };

  // 0 → 1: how far the current gesture has progressed toward a swipe
  const progress = leaving ? 1 : Math.min(1, Math.abs(drag.dx) / 160);

  // Visual parameters for a deck position, blended toward the position in
  // front of it by `progress` so back cards rise WHILE you drag.
  const backStyle = (offset: 1 | 2): React.CSSProperties => {
    const from = { y: offset * 14, s: 1 - offset * 0.05, o: offset === 2 ? 0.55 : 0.85 };
    const to = { y: (offset - 1) * 14, s: 1 - (offset - 1) * 0.05, o: offset === 2 ? 0.85 : 1 };
    const y = from.y + (to.y - from.y) * progress;
    const s = from.s + (to.s - from.s) * progress;
    const o = from.o + (to.o - from.o) * progress;
    return {
      zIndex: 3 - offset,
      opacity: o,
      transform: `translateY(${y}px) scale(${s})`,
      transition: drag.active ? 'none' : `transform ${FLY_MS}ms cubic-bezier(0.16, 1, 0.3, 1), opacity ${FLY_MS}ms ease`,
    };
  };

  const topStyle: React.CSSProperties = leaving
    ? {
        zIndex: 4,
        transform: `translateX(${leaving.dir * -115}%) rotate(${leaving.dir * -14}deg)`,
        opacity: 0.4,
        transition: `transform ${FLY_MS}ms cubic-bezier(0.3, 0.7, 0.4, 1), opacity ${FLY_MS}ms ease`,
      }
    : {
        zIndex: 4,
        transform: `translateX(${drag.dx}px) rotate(${drag.dx / 22}deg)`,
        opacity: 1,
        transition: drag.active ? 'none' : `transform ${FLY_MS}ms cubic-bezier(0.16, 1, 0.3, 1)`,
      };

  // Render the 3 visible deck slots, keyed by card href so React keeps the
  // same DOM node as a card moves from slot to slot (making CSS transitions
  // carry the promotion animation).
  const slots: { card: DeckCard; role: 0 | 1 | 2 }[] = [
    { card: cardAt(2), role: 2 },
    { card: cardAt(1), role: 1 },
    { card: cardAt(0), role: 0 },
  ];

  return (
    <div className="deck-wrapper">
      <div className="deck-stack">
        {slots.map(({ card, role }) =>
          role === 0 ? (
            <div
              key={card.href}
              className="deck-card deck-card-top"
              style={topStyle}
              onPointerDown={onPointerDown}
              onPointerMove={onPointerMove}
              onPointerUp={endDrag}
              onPointerCancel={endDrag}
              onClick={() => {
                if (!moved.current && !leaving) router.push(card.href);
              }}
              role="link"
              tabIndex={0}
              aria-label={card.title}
              onKeyDown={e => {
                if (e.key === 'Enter') router.push(card.href);
              }}
            >
              {card.img && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={card.img} alt={card.title} draggable={false} />
              )}
              <div className="deck-card-overlay">
                {card.tag && <span className="deck-card-tag">{card.tag}</span>}
                <h3 className="deck-card-title">{card.title}</h3>
                <span className="deck-card-cta">
                  Read more
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
                </span>
              </div>
            </div>
          ) : (
            <div key={card.href} className="deck-card deck-card-back" style={backStyle(role as 1 | 2)} aria-hidden="true">
              {card.img && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={card.img} alt="" loading="lazy" draggable={false} />
              )}
              <div className="deck-card-overlay deck-card-overlay-back">
                {card.tag && <span className="deck-card-tag">{card.tag}</span>}
                <h3 className="deck-card-title">{card.title}</h3>
              </div>
            </div>
          ),
        )}
      </div>

      <div className="deck-controls">
        <button className="deck-arrow" onClick={() => commit(-1)} aria-label="Previous bar">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M15 18l-6-6 6-6"/></svg>
        </button>
        <div className="deck-dots" role="tablist" aria-label="Featured bars">
          {cards.map((c, i) => (
            <button
              key={c.href}
              className={`deck-dot${i === index ? ' active' : ''}`}
              aria-label={`Go to card ${i + 1}`}
              onClick={() => {
                if (i !== index && !leaving) commit(i > index ? 1 : -1, i);
              }}
            />
          ))}
        </div>
        <button className="deck-arrow" onClick={() => commit(1)} aria-label="Next bar">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M9 18l6-6-6-6"/></svg>
        </button>
      </div>
    </div>
  );
}
