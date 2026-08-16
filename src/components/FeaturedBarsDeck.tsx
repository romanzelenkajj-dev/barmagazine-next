'use client';

import { useRef, useState } from 'react';
import Link from 'next/link';

export interface DeckCard {
  href: string;
  title: string;
  img: string | null;
  tag?: string;
}

/**
 * Fun Radio-style swipeable card deck: the top card can be swiped/dragged
 * aside to reveal the next one. Falls back to arrows + dots for non-touch.
 * One tap/click (without drag) opens the card's link.
 */
export function FeaturedBarsDeck({ cards }: { cards: DeckCard[] }) {
  const [index, setIndex] = useState(0);
  const [dx, setDx] = useState(0);
  const [leaving, setLeaving] = useState<{ dir: 1 | -1 } | null>(null);
  const dragging = useRef(false);
  const startX = useRef(0);
  const moved = useRef(false);

  const count = cards.length;
  if (count === 0) return null;

  const advance = (dir: 1 | -1, target?: number) => {
    if (leaving) return;
    setLeaving({ dir });
    setTimeout(() => {
      setIndex(i => (target !== undefined ? target : (i + dir + count) % count));
      setLeaving(null);
      setDx(0);
    }, 320);
  };

  const onPointerDown = (e: React.PointerEvent) => {
    if (leaving) return;
    dragging.current = true;
    moved.current = false;
    startX.current = e.clientX;
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragging.current || leaving) return;
    const delta = e.clientX - startX.current;
    if (Math.abs(delta) > 6) moved.current = true;
    setDx(delta);
  };

  const onPointerUp = () => {
    if (!dragging.current) return;
    dragging.current = false;
    if (Math.abs(dx) > 80) {
      advance(dx < 0 ? 1 : -1);
    } else {
      setDx(0);
    }
  };

  const cardAt = (offset: number) => cards[(index + offset + count) % count];

  return (
    <div className="deck-wrapper">
      <div className="deck-stack">
        {/* back cards (rendered first = behind) */}
        {[2, 1].map(offset => {
          const card = cardAt(offset);
          return (
            <div
              key={`${card.href}-${offset}`}
              className="deck-card deck-card-back"
              style={{
                transform: `translateY(${offset * 14}px) scale(${1 - offset * 0.05})`,
                opacity: offset === 2 ? 0.55 : 0.85,
              }}
              aria-hidden="true"
            >
              {card.img && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={card.img ?? undefined} alt="" loading="lazy" draggable={false} />
              )}
            </div>
          );
        })}

        {/* top card — draggable */}
        <Link
          href={cardAt(0).href}
          className={`deck-card deck-card-top${leaving ? ' deck-leaving' : ''}`}
          style={{
            transform: leaving
              ? `translateX(${leaving.dir * -110}%) rotate(${leaving.dir * -8}deg)`
              : `translateX(${dx}px) rotate(${dx / 30}deg)`,
            transition: dragging.current ? 'none' : 'transform 0.32s cubic-bezier(0.16, 1, 0.3, 1)',
          }}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
          onClick={e => {
            if (moved.current) e.preventDefault();
          }}
          draggable={false}
        >
          {cardAt(0).img && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={cardAt(0).img ?? undefined} alt={cardAt(0).title} draggable={false} />
          )}
          <div className="deck-card-overlay">
            {cardAt(0).tag && <span className="deck-card-tag">{cardAt(0).tag}</span>}
            <h3 className="deck-card-title">{cardAt(0).title}</h3>
            <span className="deck-card-cta">
              Read more
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
            </span>
          </div>
        </Link>
      </div>

      <div className="deck-controls">
        <button className="deck-arrow" onClick={() => advance(-1)} aria-label="Previous bar">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M15 18l-6-6 6-6"/></svg>
        </button>
        <div className="deck-dots" role="tablist" aria-label="Featured bars">
          {cards.map((c, i) => (
            <button
              key={c.href}
              className={`deck-dot${i === index ? ' active' : ''}`}
              aria-label={`Go to card ${i + 1}`}
              onClick={() => {
                if (i !== index && !leaving) advance(i > index ? 1 : -1, i);
              }}
            />
          ))}
        </div>
        <button className="deck-arrow" onClick={() => advance(1)} aria-label="Next bar">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M9 18l6-6-6-6"/></svg>
        </button>
      </div>
    </div>
  );
}
