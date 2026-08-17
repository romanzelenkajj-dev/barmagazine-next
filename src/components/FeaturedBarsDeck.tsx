'use client';

import { useCallback, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';

export interface DeckCard {
  href: string;
  title: string;
  img: string | null;
  tag?: string;
}

const FLY_MS = 500;
const SWIPE_DISTANCE = 70;
const SWIPE_VELOCITY = 0.45;

// Card tones rotate like Fun Radio's deck — solid colored cards make the
// stacked edges behind the top card clearly readable as "more cards".
const TONES = [
  { bg: '#EDBBBB', fg: '#1A1A1A' }, // brand blush
  { bg: '#F3E9DC', fg: '#1A1A1A' }, // butter
  { bg: '#FFFFFF', fg: '#1A1A1A' }, // white
  { bg: '#DCE5DD', fg: '#1A1A1A' }, // sage
  { bg: '#E8DED2', fg: '#1A1A1A' }, // sand
];

// Deck geometry (matches funradio: back cards peek ABOVE the top card)
const ROLES = [
  { y: 0, s: 1, o: 1 }, // top
  { y: -18, s: 0.96, o: 0.95 }, // behind 1
  { y: -32, s: 0.925, o: 0.7 }, // behind 2
  { y: -46, s: 0.89, o: 0 }, // hidden
];

const SPRING = 'cubic-bezier(0.34, 1.56, 0.64, 1)';

export function FeaturedBarsDeck({ cards }: { cards: DeckCard[] }) {
  const router = useRouter();
  const [index, setIndex] = useState(0);
  const [drag, setDrag] = useState<{ dx: number; active: boolean }>({ dx: 0, active: false });
  const [leaving, setLeaving] = useState<{ dir: 1 | -1 } | null>(null);

  const pointer = useRef<{ id: number; startX: number; startT: number } | null>(null);
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
  const toneAt = (offset: number) => TONES[((index + offset) % count) % TONES.length];

  const onPointerDown = (e: React.PointerEvent) => {
    if (leaving) return;
    pointer.current = { id: e.pointerId, startX: e.clientX, startT: e.timeStamp };
    moved.current = false;
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    setDrag({ dx: 0, active: true });
  };

  const onPointerMove = (e: React.PointerEvent) => {
    const p = pointer.current;
    if (!p || p.id !== e.pointerId || leaving) return;
    const dx = e.clientX - p.startX;
    if (Math.abs(dx) > 6) moved.current = true;
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
      setDrag({ dx, active: false });
      commit(dx < 0 ? 1 : -1);
    } else {
      setDrag({ dx: 0, active: false });
    }
  };

  const progress = leaving ? 1 : Math.min(1, Math.abs(drag.dx) / 160);

  const roleStyle = (role: 1 | 2 | 3): React.CSSProperties => {
    const from = ROLES[role];
    const to = ROLES[role - 1];
    const y = from.y + (to.y - from.y) * progress;
    const s = from.s + (to.s - from.s) * progress;
    const o = from.o + (to.o - from.o) * progress;
    return {
      zIndex: 6 - role,
      opacity: o,
      transform: `translateY(${y}px) scale(${s})`,
      transition: drag.active ? 'none' : `transform ${FLY_MS}ms ${SPRING}, opacity ${FLY_MS * 0.8}ms ease`,
    };
  };

  const topStyle: React.CSSProperties = leaving
    ? {
        zIndex: 6,
        transform: `translateX(${leaving.dir * -115}%) rotate(${leaving.dir * -12}deg)`,
        opacity: 0.3,
        transition: `transform ${FLY_MS}ms cubic-bezier(0.3, 0.7, 0.4, 1), opacity ${FLY_MS}ms ease`,
      }
    : {
        zIndex: 6,
        transform: `translateX(${drag.dx}px) rotate(${drag.dx / 22}deg)`,
        opacity: 1,
        transition: drag.active ? 'none' : `transform ${FLY_MS}ms ${SPRING}`,
      };

  // Every slot renders the IDENTICAL card markup — only transforms differ —
  // so promotion never reflows text or reveals extra elements mid-swipe.
  const renderCard = (card: DeckCard, tone: { bg: string; fg: string }, pos: number) => (
    <>
      <header className="deck-card-head">
        <span className="deck-chip">{card.tag || 'Featured bar'}</span>
        <span className="deck-counter">{pos + 1}/{count}</span>
      </header>
      <div className="deck-card-media">
        {card.img && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={card.img} alt={card.title} draggable={false} loading="lazy" />
        )}
      </div>
      <h3 className="deck-card-name" style={{ color: tone.fg }}>{card.title}</h3>
      <footer className="deck-card-foot">
        <span className="deck-chip deck-chip--cat">Bars</span>
        <span className="deck-read-pill">
          Read more
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
        </span>
      </footer>
    </>
  );

  const slots = [3, 2, 1, 0] as const;

  return (
    <div className="deck-wrapper">
      <div className="deck-stack">
        {slots.map(role => {
          const card = cardAt(role);
          const tone = toneAt(role);
          const pos = (index + role) % count;
          return role === 0 ? (
            <article
              key={card.href}
              className="deck-card deck-card-top"
              style={{ ...topStyle, background: tone.bg }}
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
              {renderCard(card, tone, pos)}
            </article>
          ) : (
            <article key={card.href} className="deck-card" style={{ ...roleStyle(role), background: tone.bg }} aria-hidden="true">
              {renderCard(card, tone, pos)}
            </article>
          );
        })}
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
