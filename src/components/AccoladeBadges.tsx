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
          // Full awarding-body name here, never the tile's abbreviation —
          // "TOTC SPIRITED 2026" is a layout, not a name. The source keeps
          // every tile traceable to its citation.
          title={[`${tile.org} ${tile.year}`, tile.title, tile.source].filter(Boolean).join(' — ')}
          aria-label={[`${tile.org} ${tile.year}`, tile.title].filter(Boolean).join(' — ')}
        >
          {/* jbf is a two-line tile (empty region); the flex centering
              keeps its lines vertically balanced. */}
          {tile.region && <span className="acc-tile-region">{tile.region}</span>}
          <span className="acc-tile-main">{tile.main}</span>
          <span className="acc-tile-year">{tile.year}</span>
        </span>
      ))}
    </div>
  );
}
