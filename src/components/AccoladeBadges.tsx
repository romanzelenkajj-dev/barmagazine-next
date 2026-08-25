import { tilesFor, MAX_TILES } from '@/lib/accolades';

/**
 * Accolade tiles — placement "A": name → location → tiles.
 *
 * Identical on bar profiles and directory cards. Never beside the name: names
 * vary in length, which staggers the tiles from card to card, the exact
 * problem this fixed-size tile exists to solve.
 *
 * Renders identically on free and paid listings. They are editorial — a badge
 * that can be bought stops being a credential.
 */
export function AccoladeBadges({
  accolades,
  limit = MAX_TILES,
  className = '',
}: {
  accolades: unknown;
  limit?: number;
  className?: string;
}) {
  const tiles = tilesFor(accolades, limit);

  // No accolades renders nothing at all: no empty state, no reserved space.
  if (tiles.length === 0) return null;

  return (
    <div className={`acc-tiles ${className}`.trim()}>
      {tiles.map(tile => (
        <span
          key={tile.key}
          className={`acc-tile acc-tile--${tile.tier}`}
          // Not shown, but keeps every tile traceable to its citation.
          title={tile.source ? `${tile.region} ${tile.main} ${tile.year} — ${tile.source}` : undefined}
        >
          <span className="acc-tile-region">{tile.region}</span>
          <span className="acc-tile-main">{tile.main}</span>
          <span className="acc-tile-year">{tile.year}</span>
        </span>
      ))}
    </div>
  );
}
