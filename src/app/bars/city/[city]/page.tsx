import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';
import { getBarsByCity, getCitiesWithCounts } from '@/lib/supabase';
import { createClient } from '@supabase/supabase-js';
import type { Bar } from '@/lib/supabase';
import { toUrlSlug, formatBarType } from '@/lib/utils';
import { BarDirectorySidebar, BarDirectorySidebarPromo } from '@/components/BarDirectorySidebar';

/**
 * Normalise a Supabase bar photo URL.
 * Replaces the wpcomstaging CDN host with barmagazine.com so Google
 * credits the production domain, not the staging origin.
 */
function normalisePhotoUrl(url: string): string {
  if (!url) return url;
  return url.replace(
    /https:\/\/i[0-9]\.wp\.com\/romanzelenka-wjgek\.wpcomstaging\.com\//g,
    'https://i0.wp.com/barmagazine.com/'
  ).replace(
    /https:\/\/romanzelenka-wjgek\.wpcomstaging\.com\//g,
    'https://barmagazine.com/'
  );
}

export const revalidate = 300;
export const dynamicParams = true;

const SITE_URL = 'https://barmagazine.com';

// ---------------------------------------------------------------------------
// Static params — pre-build ALL active city pages
// ---------------------------------------------------------------------------
export async function generateStaticParams() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  const { data } = await supabase
    .from('bars')
    .select('city')
    .eq('is_active', true);
  if (!data) return [];
  const uniqueCities = Array.from(new Set(data.map(b => b.city)));
  return uniqueCities.map(city => ({ city: toUrlSlug(city) }));
}

// ---------------------------------------------------------------------------
// Metadata
// ---------------------------------------------------------------------------
export async function generateMetadata({
  params,
}: {
  params: { city: string };
}): Promise<Metadata> {
  const allCities = await getCitiesWithCounts();
  const match = allCities.find(c => toUrlSlug(c.city) === params.city);
  if (!match) return {};

  const cityName = match.city;
  const countryName = match.country;
  const bars = await getBarsByCity(cityName);
  const barCount = bars.length;
  const currentYear = new Date().getFullYear();

  const description =
    `Discover the ${barCount} best bars in ${cityName}, ${countryName}. ` +
    `From cocktail bars and speakeasies to hotel bars and wine bars — ` +
    `curated by BarMagazine.`;

  const title = `${barCount} Best Bars in ${cityName} (${currentYear} Guide)`;
  const canonical = `${SITE_URL}/bars/city/${params.city}`;

  return {
    title,
    description,
    alternates: { canonical },
    robots: { index: true, follow: true },
    openGraph: {
      title,
      description,
      type: 'website',
      url: canonical,
      siteName: 'BarMagazine',
    },
  };
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------
export default async function CityPage({
  params,
  searchParams,
}: {
  params: { city: string };
  searchParams?: { view?: string };
}) {
  const allCities = await getCitiesWithCounts();
  const match = allCities.find(c => toUrlSlug(c.city) === params.city);
  if (!match) notFound();

  const cityName = match.city;
  const countryName = match.country;
  const bars = await getBarsByCity(cityName);
  if (bars.length === 0) notFound();

  // Determine view mode: ?view=top10 means Top 10 bars appear first (sidebar link)
  const isTop10View = searchParams?.view === 'top10';

  // Default sort priority (paid first):
  //   0 — Featured AND Top 10 (paid + editorial)
  //   1 — Featured only (paid)
  //   2 — Top 10 only (editorial)
  //   3 — Bars with photos
  //   4 — Bars without photos
  //
  // Top 10 view sort priority (?view=top10):
  //   0 — Top 10 AND Featured
  //   1 — Top 10 only
  //   2 — Featured only
  //   3 — Bars with photos
  //   4 — Bars without photos
  // Within every tier, bars with photos rank above bars without photos.
  // 8 buckets total (0–7), alphabetical within each bucket.
  const tierRank = (b: Bar) => {
    const isTop10 = b.tier === 'top10';
    const isFeatured = b.tier === 'featured' || !!b.wp_article_slug;
    const p = !!(b.photos && b.photos.length > 0) ? 0 : 1; // 0 = has photo, 1 = no photo
    if (isTop10View) {
      // Top 10 view: editorial first
      if (isTop10 && isFeatured) return 0 + p;  // 0 or 1
      if (isTop10)               return 2 + p;  // 2 or 3
      if (isFeatured)            return 4 + p;  // 4 or 5
      return 6 + p;                             // 6 or 7
    } else {
      // Default view: paid (featured) first
      if (isTop10 && isFeatured) return 0 + p;  // 0 or 1
      if (isFeatured)            return 2 + p;  // 2 or 3
      if (isTop10)               return 4 + p;  // 4 or 5
      return 6 + p;                             // 6 or 7
    }
  };
  const sorted = [...bars].sort((a, b) => {
    const rankDiff = tierRank(a) - tierRank(b);
    if (rankDiff !== 0) return rankDiff;
    return a.name.localeCompare(b.name);
  });

  // Bar types for hero subtitle
  const types = Array.from(new Set(bars.map(b => b.type))).sort();

  // Nearby Cities — other cities in the same country
  const nearbyCities = allCities
    .filter(c => c.country === countryName && c.city !== cityName)
    .sort((a, b) => b.count - a.count)
    .slice(0, 8);

  // JSON-LD — BreadcrumbList
  const breadcrumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
      { '@type': 'ListItem', position: 2, name: 'Bar Directory', item: `${SITE_URL}/bars` },
      { '@type': 'ListItem', position: 3, name: countryName, item: `${SITE_URL}/bars/country/${toUrlSlug(countryName)}` },
      { '@type': 'ListItem', position: 4, name: cityName, item: `${SITE_URL}/bars/city/${params.city}` },
    ],
  };

  // JSON-LD — ItemList schema
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: `Best Bars in ${cityName}`,
    description: `Curated list of the best bars in ${cityName}, ${countryName} by BarMagazine.`,
    url: `${SITE_URL}/bars/city/${params.city}`,
    numberOfItems: bars.length,
    itemListElement: sorted.slice(0, 50).map((bar, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      item: {
        '@type': 'BarOrPub',
        name: bar.name,
        url: `${SITE_URL}/bars/${bar.slug}`,
        ...(bar.address && {
          address: {
            '@type': 'PostalAddress',
            streetAddress: bar.address,
            addressLocality: cityName,
            addressCountry: countryName,
          },
        }),
        ...(bar.photos?.[0] && { image: normalisePhotoUrl(bar.photos[0]) }),
      },
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />

      {/* Breadcrumb — full width above the sidebar grid */}
      <nav className="bar-breadcrumb">
        <Link href="/">Home</Link>
        <span className="bar-breadcrumb-sep">/</span>
        <Link href="/bars">Bar Directory</Link>
        <span className="bar-breadcrumb-sep">/</span>
        <Link href={`/bars/country/${toUrlSlug(countryName)}`}>{countryName}</Link>
        <span className="bar-breadcrumb-sep">/</span>
        <span>{cityName}</span>
      </nav>

      {/* Two-column layout: 3fr main + 1fr sidebar — matches /bars page */}
      <div className="directory-outer-with-sidebar">

        {/* Row 1 left: Hero */}
        <div className="directory-hero">
          <div className="directory-hero-inner">
            <div className="directory-hero-badge">{bars.length} Bars</div>
            <h1>Best Bars in {cityName}</h1>
            <p>
              Explore {bars.length === 1 ? 'the top bar' : `the ${bars.length} best bars`} in {cityName},{' '}
              {countryName} — handpicked by the BarMagazine editorial team.
              {types.length > 0 && (
                <>
                  {' '}Our curated list covers {types.slice(0, 3).map(t => formatBarType(t).toLowerCase() + 's').join(', ')}
                  {types.length > 3 ? ` and ${types.length - 3} more bar type${types.length - 3 > 1 ? 's' : ''}` : ''},{' '}
                  ranging from intimate neighbourhood spots to world-renowned cocktail destinations.
                </>
              )}
              {' '}Whether you are a local looking for your next favourite haunt or a visitor planning a bar crawl,
              this guide covers the essential {cityName} bars you should not miss.
            </p>
            {types.length > 1 && (
              <div className="directory-hero-types">
                {types.map(t => (
                  <span key={t} className="directory-hero-type-tag">{formatBarType(t)}</span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Row 1 right: Promo sidebar */}
        <BarDirectorySidebarPromo />

        {/* Row 2 left: results bar + card grid + nearby cities + CTA */}
        <div className="directory-page-body">

          {/* Results count */}
          <div className="directory-results-bar">
            <span className="directory-count">
              {bars.length} {bars.length === 1 ? 'bar' : 'bars'} in {cityName}
            </span>
            <Link href={`/bars/country/${toUrlSlug(countryName)}`} className="directory-count" style={{ marginLeft: '1rem', opacity: 0.6 }}>
              All bars in {countryName} →
            </Link>
          </div>

          {/* Bar grid — unified card layout for all bars */}
          <CityBarGrid bars={sorted} />

          {/* Nearby Cities */}
          {nearbyCities.length > 0 && (
            <div className="nearby-cities-section">
              <div className="nearby-cities-header">
                <h2>More Cities in {countryName}</h2>
                <Link href={`/bars/country/${toUrlSlug(countryName)}`} className="nearby-cities-all">
                  All {countryName} bars &rarr;
                </Link>
              </div>
              <div className="nearby-cities-grid">
                {nearbyCities.map(({ city, count }) => (
                  <Link
                    key={city}
                    href={`/bars/city/${toUrlSlug(city)}`}
                    className="nearby-city-card"
                  >
                    <span className="nearby-city-name">{city}</span>
                    <span className="nearby-city-count">{count} {count === 1 ? 'bar' : 'bars'}</span>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* CTA */}
          <div className="directory-cta">
            <div className="directory-cta-inner">
              <div className="directory-cta-icon">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M12 2v20M2 12h20" />
                </svg>
              </div>
              <h2>List Your Bar in {cityName}</h2>
              <p>
                Join the BarMagazine directory and reach cocktail enthusiasts worldwide.
                Free basic listing, or upgrade for premium visibility.
              </p>
              <div className="directory-cta-actions">
                <Link href="/claim-your-bar" className="directory-cta-btn">List Your Bar</Link>
              </div>
            </div>
          </div>

        </div>{/* end directory-page-body */}

        {/* Row 2 right: sticky sidebar */}
        <BarDirectorySidebar />

      </div>{/* end directory-outer-with-sidebar */}
    </>
  );
}

// ---------------------------------------------------------------------------
// Unified bar grid — same card design as /bars for every bar
// ---------------------------------------------------------------------------
function CityBarGrid({ bars }: { bars: Bar[] }) {
  if (bars.length === 0) return null;

  return (
    <div className="directory-grid">
      {bars.map(bar => (
        <CityBarCard key={bar.id} bar={bar} />
      ))}
    </div>
  );
}

function CityBarCard({ bar }: { bar: Bar }) {
  // Use the raw URL for the img tag — normalisePhotoUrl is only needed for JSON-LD/SEO.
  // Many photos are still hosted on the staging CDN and the normalised production URL returns 404.
  const imageUrl = bar.photos?.[0] ?? null;

  return (
    <Link href={`/bars/${bar.slug}`} className="city-bar-card">
      {/* Photo area — fixed height, name/location/type overlaid at bottom */}
      <div className="bar-dir-featured-visual">
        {imageUrl
          ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={imageUrl} alt={bar.name} loading="lazy" />
          ) : (
            <div className="bar-dir-featured-placeholder">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.3">
                <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" /><polyline points="9 22 9 12 15 12 15 22" />
              </svg>
              <span>{bar.name.slice(0, 2).toUpperCase()}</span>
            </div>
          )
        }
        <div className="bar-dir-featured-overlay" />
        {/* TOP 10 badge */}
        {bar.tier === 'top10' && (
          <div className="bar-dir-top10-badge-corner">
            <svg width="9" height="9" viewBox="0 0 24 24" fill="currentColor" style={{ display: 'inline', marginRight: 3, verticalAlign: 'middle' }}>
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
            TOP 10
          </div>
        )}
        {/* FEATURED badge — shown for featured bars, including those that are also top10 */}
        {(bar.tier === 'featured' || bar.wp_article_slug) && (
          <div className="bar-dir-featured-badge-corner">Featured</div>
        )}
        <div className="bar-dir-featured-content">
          <h3>{bar.name}</h3>
          <span className="bar-dir-featured-location">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ display: 'inline', marginRight: 3, verticalAlign: 'middle' }}>
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" /><circle cx="12" cy="10" r="3" />
            </svg>
            {bar.city}{bar.city !== bar.country ? `, ${bar.country}` : ''}
          </span>
          {bar.type && (
            <span className="bar-dir-featured-type">{formatBarType(bar.type)}</span>
          )}
        </div>
      </div>
      {/* No description shown on city page cards — photo + overlay only, matching /bars page design */}
    </Link>
  );
}
