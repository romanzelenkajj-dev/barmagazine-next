import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';
import { getBarsByCountry, getCountriesWithCounts } from '@/lib/supabase';
import type { Bar } from '@/lib/supabase';
import { toUrlSlug, fromUrlSlug } from '@/lib/utils';

export const revalidate = 300;

const SITE_URL = 'https://barmagazine.com';

// ---------------------------------------------------------------------------
// Static params — pre-build all country pages at build time
// ---------------------------------------------------------------------------
export async function generateStaticParams() {
  const countries = await getCountriesWithCounts();
  return countries.map(c => ({ country: toUrlSlug(c.country) }));
}

// ---------------------------------------------------------------------------
// Metadata
// ---------------------------------------------------------------------------
export async function generateMetadata({
  params,
}: {
  params: { country: string };
}): Promise<Metadata> {
  const countryName = fromUrlSlug(params.country);
  const bars = await getBarsByCountry(countryName);

  if (bars.length === 0) {
    // Try a case-insensitive match via slug comparison
    const allCountries = await getCountriesWithCounts();
    const match = allCountries.find(c => toUrlSlug(c.country) === params.country);
    if (!match) return {};
  }

  const cities = Array.from(new Set(bars.map(b => b.city))).sort();
  const cityCount = cities.length;
  const description =
    `Discover the ${bars.length} best bars in ${countryName} — ` +
    `spanning ${cityCount} ${cityCount === 1 ? 'city' : 'cities'} including ` +
    `${cities.slice(0, 3).join(', ')}${cities.length > 3 ? ' and more' : ''}. ` +
    `Curated by BarMagazine.`;

  const title = `Best Bars in ${countryName} | BarMagazine`;
  const canonical = `${SITE_URL}/bars/country/${params.country}`;

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
export default async function CountryPage({
  params,
}: {
  params: { country: string };
}) {
  // Resolve the real country name from slug, matching case-insensitively
  const allCountries = await getCountriesWithCounts();
  const match = allCountries.find(c => toUrlSlug(c.country) === params.country);

  if (!match) notFound();

  const countryName = match.country;
  const bars = await getBarsByCountry(countryName);

  if (bars.length === 0) notFound();

  const cities = Array.from(new Set(bars.map(b => b.city))).sort();
  const cityCount = cities.length;

  // Sort: photo bars first, then text-only
  const sorted = [...bars].sort((a, b) => {
    const aPhoto = a.photos && a.photos.length > 0 ? 1 : 0;
    const bPhoto = b.photos && b.photos.length > 0 ? 1 : 0;
    if (aPhoto !== bPhoto) return bPhoto - aPhoto;
    return a.name.localeCompare(b.name);
  });

  // JSON-LD — ItemList schema
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: `Best Bars in ${countryName}`,
    description: `Curated list of the best bars in ${countryName} by BarMagazine.`,
    url: `${SITE_URL}/bars/country/${params.country}`,
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
            addressLocality: bar.city,
            addressCountry: countryName,
          },
        }),
        ...(bar.photos?.[0] && { image: bar.photos[0] }),
      },
    })),
    creator: {
      '@type': 'SoftwareApplication',
      name: 'Perplexity Computer',
      url: 'https://www.perplexity.ai/computer',
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Breadcrumb */}
      <nav className="bar-breadcrumb">
        <Link href="/">Home</Link>
        <span className="bar-breadcrumb-sep">/</span>
        <Link href="/bars">Bar Directory</Link>
        <span className="bar-breadcrumb-sep">/</span>
        <span>{countryName}</span>
      </nav>

      {/* Hero */}
      <div className="directory-hero">
        <div className="directory-hero-inner">
          <div className="directory-hero-badge">{bars.length} Bars</div>
          <h1>Best Bars in {countryName}</h1>
          <p>
            {bars.length} curated bars across {cityCount}{' '}
            {cityCount === 1 ? 'city' : 'cities'} in {countryName}
          </p>
          {/* City quick-links */}
          {cities.length > 0 && (
            <div className="directory-hero-stats">
              {cities.slice(0, 6).map(city => (
                <Link
                  key={city}
                  href={`/bars/city/${toUrlSlug(city)}`}
                  className="directory-hero-stat"
                >
                  <span className="directory-hero-stat-count">
                    {bars.filter(b => b.city === city).length}
                  </span>
                  <span className="directory-hero-stat-label">{city}</span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Results count */}
      <div className="directory-results-bar">
        <span className="directory-count">{bars.length} bars in {countryName}</span>
      </div>

      {/* Bar grid */}
      <BarGrid bars={sorted} />

      {/* CTA */}
      <div className="directory-cta">
        <div className="directory-cta-inner">
          <div className="directory-cta-icon">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M12 2v20M2 12h20" />
            </svg>
          </div>
          <h2>List Your Bar in {countryName}</h2>
          <p>
            Join the BarMagazine directory and reach cocktail enthusiasts worldwide.
            Free basic listing, or upgrade for premium visibility.
          </p>
          <div className="directory-cta-actions">
            <Link href="/claim-your-bar" className="directory-cta-btn">List Your Bar</Link>
          </div>
        </div>
      </div>
    </>
  );
}

// ---------------------------------------------------------------------------
// Shared bar grid — server component (no client state needed for static pages)
// ---------------------------------------------------------------------------
function BarGrid({ bars }: { bars: Bar[] }) {
  const photoBars = bars.filter(b => b.photos && b.photos.length > 0);
  const textBars = bars.filter(b => !b.photos || b.photos.length === 0);

  return (
    <>
      {photoBars.length > 0 && (
        <div className="directory-grid">
          {photoBars.map(bar => (
            <BarCard key={bar.id} bar={bar} />
          ))}
        </div>
      )}

      {textBars.length > 0 && (
        <div className="directory-list-section">
          {photoBars.length > 0 && (
            <div className="directory-section-label directory-section-label--all">
              More Bars
            </div>
          )}
          <div className="directory-list">
            {textBars.map(bar => (
              <Link key={bar.id} href={`/bars/${bar.slug}`} className="directory-list-item">
                <div className="directory-list-name">{bar.name}</div>
                <div className="directory-list-location">
                  {bar.city}{bar.city !== bar.country ? `, ${bar.country}` : ''}
                </div>
                <div className="directory-list-type">{bar.type}</div>
                <svg className="directory-list-arrow" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </Link>
            ))}
          </div>
        </div>
      )}
    </>
  );
}

function BarCard({ bar }: { bar: Bar }) {
  const imageUrl = bar.photos?.[0] || null;
  return (
    <Link href={`/bars/${bar.slug}`} className="bar-dir-card">
      <div className="bar-dir-card-visual">
        {imageUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={imageUrl} alt={bar.name} loading="lazy" />
        )}
      </div>
      <div className="bar-dir-card-body">
        <h3>{bar.name}</h3>
        <div className="bar-dir-card-meta">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
            <circle cx="12" cy="10" r="3" />
          </svg>
          <span>{bar.city}{bar.city !== bar.country ? `, ${bar.country}` : ''}</span>
        </div>
        <span className="bar-dir-type">{bar.type}</span>
      </div>
    </Link>
  );
}
