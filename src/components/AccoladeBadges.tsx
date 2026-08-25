import { badgesFor } from '@/lib/accolades';

/**
 * Award badges.
 *
 * Markup and class names come from the approved mockup: an `.acc` chip with an
 * `.org` half and a `.val` half, tiered by `acc--top | acc--rank | acc--win |
 * acc--soft`.
 *
 * These render identically on free and paid listings. They are editorial —
 * the moment a badge can be bought it stops being a credential.
 */
export function AccoladeBadges({
  accolades,
  limit = 3,
  short = false,
  className = '',
}: {
  accolades: unknown;
  /** 3 on the profile, 1–2 on a card. */
  limit?: number;
  /** Shorten known org names — cards only. */
  short?: boolean;
  className?: string;
}) {
  const { badges, overflow } = badgesFor(accolades, { limit, short });

  // A bar with no accolades renders no row at all: no empty state, no
  // placeholder, no reserved space.
  if (badges.length === 0) return null;

  return (
    <div className={`acc-row ${className}`.trim()}>
      {badges.map(badge => (
        <span
          key={badge.key}
          className={`acc ${badge.tier}`}
          // Not shown, but keeps every badge traceable to its citation.
          title={badge.source ? `${badge.org} — source: ${badge.source}` : undefined}
        >
          <span className="org">{badge.org}</span>
          <span className="val">{badge.value}</span>
        </span>
      ))}
      {overflow > 0 && <span className="acc--more">+{overflow} more</span>}
    </div>
  );
}
