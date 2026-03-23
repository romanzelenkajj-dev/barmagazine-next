import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';
import { getBarsByCity, getCitiesWithCounts } from '@/lib/supabase';
import type { Bar } from '@/lib/supabase';
import { toUrlSlug, formatBarType } from '@/lib/utils';
import { CollapsibleBarList } from '@/components/CollapsibleBarList';

export const revalidate = 300;

const SITE_URL = 'https://barmagazine.com';

// ---------------------------------------------------------------------------
// Static params — pre-build all city pages at build time
// ---------------------------------------------------------------------------
export async function generateStaticParams() {
  const cities = await getCitiesWithCounts();
  return cities.map(c => ({ city: toUrlSlug(c.city) }));
}

// ---------------------------------------------------------------------------
// Metadata
// ---------------------------------------------------------------------------
export async function generateMetadata({
  params,
}: {
  params: { city: string };
}): Promise<Metadata> {
  // Resolve exact city name from slug
  const allCities = await getCitiesWithCounts();
  const match = allCities.find(c => toUrlSlug(c.city) === params.city);

  if (!match) return {};

  const cityName = match.city;
  const countryName = match.country;
  const bars = await getBarsByCity(cityName);

  const description =
    `Discover the best bars in ${cityName}, ${countryName}. ` +
    `From cocktail bars and speakeasies to hotel bars and wine bars — ` +
    `curated by BarMagazine.`;

  const title = `Best Bars in ${cityName}, ${countryName} `;
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
}: {
  params: { city: string };
}) {
  // Resolve the real city name from slug, matching case-insensitively
  const allCities = await getCitiesWithCounts();
  const match = allCities.find(c => toUrlSlug(c.city) === params.city);

  if (!match) notFound();

  const cityName = match.city;
  const countryName = match.country;
  const bars = await getBarsByCity(cityName);

  if (bars.length === 0) notFound();

  // Sort: photo bars first, then text-only
  const sorted = [...bars].sort((a, b) => {
    const aPhoto = a.photos && a.photos.length > 0 ? 1 : 0;
    const bPhoto = b.photos && b.photos.length > 0 ? 1 : 0;
    if (aPhoto !== bPhoto) return bPhoto - aPhoto;
    return a.name.localeCompare(b.name);
  });

  // Bar types breakdown for subtitle
  const types = Array.from(new Set(bars.map(b => b.type))).sort();

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
        ...(bar.photos?.[0] && { image: bar.photos[0] }),
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

      {/* Breadcrumb */}
      <nav className="bar-breadcrumb">
        <Link href="/">Home</Link>
        <span className="bar-breadcrumb-sep">/</span>
        <Link href="/bars">Bar Directory</Link>
        <span className="bar-breadcrumb-sep">/</span>
        <Link href={`/bars/country/${toUrlSlug(countryName)}`}>{countryName}</Link>
        <span className="bar-breadcrumb-sep">/</span>
        <span>{cityName}</span>
      </nav>

      {/* Hero */}
      <div className="directory-hero">
        <div className="directory-hero-inner">
          <div className="directory-hero-badge">{bars.length} Bars</div>
          <h1>Best Bars in {cityName}</h1>
          <p>
            Explore {bars.length === 1 ? 'the top bar' : `the ${bars.length} best bars`} in {cityName},{' '}
            {countryName} — handpicked by BarMagazine.
            {types.length > 0 && ` Featuring ${types.slice(0, 3).map(t => formatBarType(t).toLowerCase() + 's').join(', ')}${types.length > 3 ? ' and more' : ''}.`}
          </p>
        </div>
      </div>

      {/* Results count */}
      <div className="directory-results-bar">
        <span className="directory-count">
          {bars.length} {bars.length === 1 ? 'bar' : 'bars'} in {cityName}
        </span>
        <Link href={`/bars/country/${toUrlSlug(countryName)}`} className="directory-count" style={{ marginLeft: '1rem', opacity: 0.6 }}>
          All bars in {countryName} →
        </Link>
      </div>

      {/* Bar grid — only bars with photos */}
      <BarPhotoGrid bars={sorted} />

      {/* Text-only bars — collapsed by default */}
      <CollapsibleBarList
        bars={sorted.filter(b => !b.photos || b.photos.length === 0)}
        hasPhotoBars={sorted.some(b => b.photos && b.photos.length > 0)}
      />

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
    </>
  );
}

// ---------------------------------------------------------------------------
// Photo-only grid — server component
// ---------------------------------------------------------------------------
function BarPhotoGrid({ bars }: { bars: Bar[] }) {
  const photoBars = bars.filter(b => b.photos && b.photos.length > 0);

  if (photoBars.length === 0) return null;

  return (
    <div className="directory-grid">
      {photoBars.map(bar => (
        <BarCard key={bar.id} bar={bar} />
      ))}
    </div>
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
        <span className="bar-dir-type">{formatBarType(bar.type)}</span>
      </div>
    </Link>
  );
}
