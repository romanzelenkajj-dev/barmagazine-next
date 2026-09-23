import Link from 'next/link';
import { BarPlaceholder } from './BarPlaceholder';
import { CardStatusPills } from './CardStatusPills';
import { statusPill } from '@/lib/bar-status';
import { hasFiftyBest } from '@/lib/accolades';
import { placeLine } from '@/lib/city-location';
import { safeHref } from '@/lib/safe-slug';
import { isLongCardName } from '@/lib/card-name-fit';

/**
 * The directory bar card: the one rendered on /bars/city/<slug>, and since
 * 2026-09-15 (Roman, queue task 21) also the "Nearby in <city>" card on a
 * profile, so the two cannot drift. 16:10 visual with the photo or the
 * placeholder, the status pills on the photo (CardStatusPills owns the
 * rules), the name, one location line.
 *
 * `locationLine` is the only knob: the city page leaves it unset and gets
 * placeLine ("Nashville, Tennessee"); the nearby block passes
 * "<street or venue>, <distance>".
 */
/** Every Bar row satisfies this; the nearby block builds one by hand. */
export interface DirectoryCardBar {
  slug: string;
  name: string;
  photos: string[] | null;
  type?: string | null;
  tier: string | null;
  wp_article_slug: string | null;
  accolades: unknown;
  city?: string;
  country?: string;
  state?: string | null;
  /** Drives the "Temporarily closed" pill; absent reads as open. */
  status?: string | null;
}

export function DirectoryBarCard({ bar, locationLine, rankPill }: {
  bar: DirectoryCardBar;
  locationLine?: string | null;
  /** A rank ("No. 1") as a small black pill in the photo's top-left corner,
      the award hubs' addition (task 112). Same family as the status pills. */
  rankPill?: string | null;
}) {
  const imageUrl = bar.photos?.[0] ?? null;
  const isTop10 = bar.tier === 'top10';
  // Featured is the PAID subscription and nothing else. This used to read
  // `tier === 'featured' || wp_article_slug`, which put the badge on every
  // bar we had written about: 15 bars wearing a badge two bars pay for, two
  // of them showing Top 10 and Featured side by side as though our editorial
  // picks were advertising. Having an article is a real editorial signal and
  // still ranks, under its own name.
  const isFeatured = bar.tier === 'featured';
  const location =
    locationLine ??
    (bar.city && bar.country ? placeLine({ city: bar.city, country: bar.country, state: bar.state }) : null);

  return (
    <Link href={safeHref('/bars', bar.slug)} className="bar-dir-featured-card">
      <div className="bar-dir-featured-visual">
        {imageUrl
          ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={imageUrl} alt={bar.name} loading="lazy" />
          ) : (
            <BarPlaceholder name={bar.name} type={bar.type} />
          )
        }
        {rankPill && <span className="bar-dir-badge-pill bar-dir-rank-pill">{rankPill}</span>}
        {/* Status sits on the photo, matching the profile hero. The body is
            left for identity: name and location. */}
        <CardStatusPills top10={isTop10} fiftyBest={hasFiftyBest(bar.accolades)} featured={isFeatured} status={statusPill(bar)} />
      </div>
      <div className="bar-dir-featured-body">
        {/* The name box is always two lines tall so that every location line
            in a row lands on the same baseline. A name that would need a
            third line renders one size down instead of being clamped. */}
        <h3 className={`bar-dir-featured-name${isLongCardName(bar.name) ? ' bar-dir-featured-name--long' : ''}`}>
          {bar.name}
        </h3>
        {location && (
          <span className="bar-dir-featured-location">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" /><circle cx="12" cy="10" r="3" />
            </svg>
            {location}
          </span>
        )}
      </div>
    </Link>
  );
}
