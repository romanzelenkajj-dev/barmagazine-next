import { HighlightedText } from '@/components/HighlightedText';
import { formatHoursForCountry } from '@/lib/format-hours';
import { BarPlaceholder } from '@/components/BarPlaceholder';
import { notFound } from 'next/navigation';
import { level2Bars } from '@/lib/city-levels';
import Link from 'next/link';
import type { Metadata } from 'next';
import { getBarsForCity } from '@/lib/city-index';
import { displayType } from '@/lib/bar-type';
import { hasSlug, safeHref } from '@/lib/safe-slug';
import { TOP10_CITIES } from '@/lib/top10-cities';
import { splitHighlight } from '@/lib/menu-highlight';
import {
  getSeoCities,
  resolveSeoCity,
  composeCityIntro,
  composeCityDescription,
  sortSeoBars,
} from '@/lib/seo-cities';

/**
 * /best-bars/[city] — programmatic SEO landing pages.
 *
 * One real, server-rendered page per city that has a curated set of
 * top10-tier bars. Targets the evergreen "best bars in <city>" query with
 * unique crawlable content (the enriched descriptions + signature serves),
 * schema.org ItemList markup, and cross-links into the profiles, the full
 * city directory, and the editorial Top 10 article where one exists.
 */

export const revalidate = 3600;
export const dynamicParams = true;

const SITE_URL = 'https://barmagazine.com';

export async function generateStaticParams() {
  // Every city with MIN_CITY_BARS active bars gets a page; the rest 404.
  // 63 cities today against the 23 the top10 tier alone produced.
  const cities = await getSeoCities();
  return cities.map(c => ({ city: c.slug }));
}

/**
 * The Level 2 list for a city, shared by the metadata and the page so the
 * number in the title and the length of the list can never disagree.
 */
async function level2ForCity(match: Awaited<ReturnType<typeof resolveSeoCity>>) {
  const all = await getBarsForCity(match!.key);
  return level2Bars(all, sortSeoBars);
}

export async function generateMetadata({ params }: { params: { city: string } }): Promise<Metadata> {
  const match = await resolveSeoCity(params.city);
  if (!match) return {};
  const year = new Date().getFullYear();
  // NOTE: no "| BarMagazine" suffix here — the root layout's title template
  // (`%s | BarMagazine`) appends it; including it here doubles the suffix.
  // The real number when the list is a real selection. Level 2 targets the
  // head term ("best bars in new york"); the Top 10 ARTICLE owns "top 10 bars
  // in new york", so the two stop competing. When too few bars qualify and
  // the page falls back, the number is left out, because it would not mean
  // anything.
  const level = await level2ForCity(match);
  const title = level.fellBack
    ? `The Best Bars in ${match.city} (${year})`
    : `The ${level.all.length} Best Bars in ${match.city} (${year})`;
  const description = composeCityDescription(match);
  return {
    title,
    description,
    alternates: { canonical: `${SITE_URL}/best-bars/${params.city}` },
    robots: { index: true, follow: true },
    openGraph: {
      // OG titles don't get the layout template — brand it explicitly.
      title: `${title} | BarMagazine`,
      description, type: 'website',
      url: `${SITE_URL}/best-bars/${params.city}`,
      siteName: 'BarMagazine',
    },
  };
}

export default async function BestBarsCityPage({ params }: { params: { city: string } }) {
  const match = await resolveSeoCity(params.city);
  if (!match) notFound();

  // Cities with a curated top10 set keep exactly that set (the original 23
  // pages are unchanged in substance); everywhere else lists the ranked
  // best, capped, with the full dump one click away at /bars/city.
  // Level 2: every bar that qualifies, however many that is, with the curated
  // ten at the top in tier order. A bar that does not qualify has not fallen
  // off the site, it is on Level 3 at /bars/city/<slug>. See
  // src/lib/city-levels.ts for the qualification order and why a broad
  // editorial source does not qualify a bar.
  const level = await level2ForCity(match);
  const bars = level.all;
  if (bars.length === 0) notFound();

  const year = new Date().getFullYear();
  const editorial = TOP10_CITIES.find(c => c.dirSlug === params.city && c.articleSlug);
  const otherCities = (await getSeoCities()).filter(c => c.slug !== match.slug);
  const intro = composeCityIntro(match, bars.length);

  const itemListLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: `The ${bars.length} Best Bars in ${match.city}`,
    description: `BarMagazine's pick of the ${bars.length} best cocktail bars in ${match.city}, ${match.country}.`,
    numberOfItems: bars.length,
    itemListOrder: 'https://schema.org/ItemListUnordered',
    itemListElement: bars.map((bar, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      item: {
        '@type': 'BarOrNightclub',
        name: bar.name,
        url: `${SITE_URL}/bars/${bar.slug}`,
        ...(bar.address && {
          address: { '@type': 'PostalAddress', streetAddress: bar.address, addressLocality: bar.city, addressCountry: bar.country },
        }),
        ...(bar.short_excerpt && { description: bar.short_excerpt }),
      },
    })),
  };

  const breadcrumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
      { '@type': 'ListItem', position: 2, name: 'Bar Directory', item: `${SITE_URL}/bars` },
      { '@type': 'ListItem', position: 3, name: `Best Bars in ${match.city}`, item: `${SITE_URL}/best-bars/${params.city}` },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />

      <div className="best-bars-page">
        <header className="best-bars-hero">
          <span className="best-bars-kicker">BarMagazine&rsquo;s pick &middot; {year}</span>
          {/* No number on a fallback page, matching the title. */}
          <h1>The {level.fellBack ? '' : `${bars.length} `}Best Bars in {match.city}</h1>
          <p className="best-bars-intro">{intro}</p>
          <div className="best-bars-hero-links">
            {editorial?.articleSlug && (
              <Link href={`/${editorial.articleSlug}`} className="best-bars-hero-link best-bars-hero-link--primary">
                Read the full Top 10 {match.city} feature
              </Link>
            )}
            <Link href={`/bars/city/${params.city}`} className="best-bars-hero-link">
              Browse every {match.city} bar
            </Link>
            {match.typeSlugs.map(t => (
              <Link key={t.slug} href={`/best-bars/${params.city}/${t.slug}`} className="best-bars-hero-link">
                Best {t.plural} in {match.city}
              </Link>
            ))}
          </div>
        </header>

        <ol className="best-bars-list">
          {bars.filter(hasSlug).map((bar, i) => (
            <li key={bar.id} className="best-bars-item">
              <Link href={safeHref('/bars', bar.slug)} className="best-bars-card">
                <div className="best-bars-visual">
                  {bar.photos && bar.photos.length > 0 ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={bar.photos[0]} alt={bar.name} loading={i < 2 ? 'eager' : 'lazy'} />
                  ) : (
                    <BarPlaceholder name={bar.name} type={bar.type} />
                  )}
                </div>
                <div className="best-bars-body">
                  <div className="best-bars-badges">
                    {bar.tier === 'top10' && <span className="bar-dir-badge-pill bar-dir-badge-pill--top10">&#9733; TOP 10</span>}
                    {displayType(bar) && <span className="bar-dir-badge-pill bar-dir-badge-pill--type">{displayType(bar)}</span>}
                  </div>
                  <h2 className="best-bars-name">{bar.name}</h2>
                  {(bar.description || bar.short_excerpt) && (
                    <p className="best-bars-desc"><HighlightedText text={bar.description || bar.short_excerpt || ''} /></p>
                  )}
                  {bar.menu_highlights && bar.menu_highlights.length > 0 && (() => {
                    const serve = splitHighlight(bar.menu_highlights[0]);
                    return (
                      <div className="best-bars-order">
                        <span className="best-bars-order-label">Order this</span>
                        <span className="best-bars-order-name">{serve.name}</span>
                        {serve.ingredients && <span className="best-bars-order-ingredients">{serve.ingredients}</span>}
                      </div>
                    );
                  })()}
                  <div className="best-bars-meta">
                    {bar.address && <span className="best-bars-address">{bar.address}</span>}
                    {bar.opening_hours && <span className="best-bars-hours">{formatHoursForCountry(bar.opening_hours, bar.country)}</span>}
                  </div>
                  <span className="best-bars-more">
                    Full profile
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
                  </span>
                </div>
              </Link>
            </li>
          ))}
        </ol>

        <div className="best-bars-outro">
          <h2>Explore the whole {match.city} scene</h2>
          <p>
            These {bars.length} are the starting point. The full BarMagazine directory covers every listed bar in
            {' '}{match.city}, with a map, filters by bar type, and new openings as we verify them.
          </p>
          <Link href={`/bars/city/${params.city}`} className="bar-v2-btn bar-v2-btn--primary">
            All bars in {match.city}
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
          </Link>
        </div>

        {otherCities.length > 0 && (
          <div className="best-bars-cities">
            <h2>Best bars in other cities</h2>
            <div className="best-bars-cities-grid">
              {otherCities.map(c => (
                <Link key={c.slug} href={`/best-bars/${c.slug}`} className="best-bars-city-link">
                  {c.city}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
