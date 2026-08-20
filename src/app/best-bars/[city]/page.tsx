import { BarPlaceholder } from '@/components/BarPlaceholder';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';
import { getTop10Cities, getTop10BarsByCity } from '@/lib/supabase';
import { toUrlSlug, formatBarType } from '@/lib/utils';
import { hasSlug, safeHref } from '@/lib/safe-slug';
import { TOP10_CITIES } from '@/lib/top10-cities';

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
  const cities = await getTop10Cities();
  return cities.map(c => ({ city: toUrlSlug(c.city) }));
}

async function resolveCity(citySlug: string) {
  const cities = await getTop10Cities();
  return cities.find(c => toUrlSlug(c.city) === citySlug) || null;
}

export async function generateMetadata({ params }: { params: { city: string } }): Promise<Metadata> {
  const match = await resolveCity(params.city);
  if (!match) return {};
  const year = new Date().getFullYear();
  // NOTE: no "| BarMagazine" suffix here — the root layout's title template
  // (`%s | BarMagazine`) appends it; including it here doubles the suffix.
  const title = `The ${match.count} Best Bars in ${match.city} (${year})`;
  const description = `The ${match.count} best cocktail bars in ${match.city} right now — hand-picked by BarMagazine, with signature drinks, addresses and opening hours for every bar.`;
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
  const match = await resolveCity(params.city);
  if (!match) notFound();

  const bars = await getTop10BarsByCity(match.city);
  if (bars.length === 0) notFound();

  const year = new Date().getFullYear();
  const editorial = TOP10_CITIES.find(c => c.dirSlug === params.city && c.articleSlug);
  const otherCities = (await getTop10Cities()).filter(c => c.city !== match.city);

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
          <h1>The {bars.length} Best Bars in {match.city}</h1>
          <p className="best-bars-intro">
            {match.city} has one of the world&rsquo;s great drinking scenes — and these are the {bars.length} bars
            we&rsquo;d send you to first. Every pick below is on BarMagazine&rsquo;s curated top tier for {match.city},
            {match.country !== match.city ? ` ${match.country},` : ''} with verified addresses, opening hours and the
            signature drinks worth ordering. Tap any bar for its full profile.
          </p>
          <div className="best-bars-hero-links">
            {editorial?.articleSlug && (
              <Link href={`/${editorial.articleSlug}`} className="best-bars-hero-link best-bars-hero-link--primary">
                Read the full Top 10 {match.city} feature
              </Link>
            )}
            <Link href={`/bars/city/${params.city}`} className="best-bars-hero-link">
              Browse every {match.city} bar
            </Link>
          </div>
        </header>

        <ol className="best-bars-list">
          {bars.filter(hasSlug).map((bar, i) => (
            <li key={bar.id} className="best-bars-item">
              <Link href={safeHref('/bars', bar.slug)} className="best-bars-card">
                <span className="best-bars-rank">{i + 1}</span>
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
                    <span className="bar-dir-badge-pill bar-dir-badge-pill--top10">&#9733; TOP 10</span>
                    {bar.type && <span className="bar-dir-badge-pill bar-dir-badge-pill--type">{formatBarType(bar.type)}</span>}
                  </div>
                  <h2 className="best-bars-name">{bar.name}</h2>
                  {(bar.description || bar.short_excerpt) && (
                    <p className="best-bars-desc">{bar.description || bar.short_excerpt}</p>
                  )}
                  {bar.menu_highlights && bar.menu_highlights.length > 0 && (
                    <p className="best-bars-serve">
                      <strong>Order this:</strong> {bar.menu_highlights[0].name}
                      {bar.menu_highlights[0].ingredients ? ` — ${bar.menu_highlights[0].ingredients}` : ''}
                    </p>
                  )}
                  <div className="best-bars-meta">
                    {bar.address && <span className="best-bars-address">{bar.address}</span>}
                    {bar.opening_hours && <span className="best-bars-hours">{bar.opening_hours}</span>}
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
            These {bars.length} are the starting point — the full BarMagazine directory covers every listed bar in
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
                <Link key={c.city} href={`/best-bars/${toUrlSlug(c.city)}`} className="best-bars-city-link">
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
