import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';
import { getBarsByCountry, getCountriesWithCounts } from '@/lib/supabase';
import { createClient } from '@supabase/supabase-js';
import type { Bar } from '@/lib/supabase';
import { toUrlSlug, fromUrlSlug, formatBarType } from '@/lib/utils';
import { BarDirectorySidebar, BarDirectorySidebarPromo } from '@/components/BarDirectorySidebar';

export const revalidate = 300;
// On-demand ISR for countries not pre-built (e.g. countries with only free-tier bars)
export const dynamicParams = true;

const SITE_URL = 'https://barmagazine.com';

// ---------------------------------------------------------------------------
// Static params — only pre-build country pages that have top10 or featured bars.
// ---------------------------------------------------------------------------
export async function generateStaticParams() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  const { data } = await supabase
    .from('bars')
    .select('country')
    .eq('is_active', true)
    .in('tier', ['top10', 'featured']);
  if (!data) return [];
  const uniqueCountries = Array.from(new Set(data.map(b => b.country)));
  return uniqueCountries.map(country => ({ country: toUrlSlug(country) }));
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
    const allCountries = await getCountriesWithCounts();
    const match = allCountries.find(c => toUrlSlug(c.country) === params.country);
    if (!match) return {};
  }

  const cities = Array.from(new Set(bars.map(b => b.city))).sort();
  const cityCount = cities.length;
  const description =
    `Discover the best bars in ${countryName} — ` +
    `spanning ${cityCount} ${cityCount === 1 ? 'city' : 'cities'} including ` +
    `${cities.slice(0, 3).join(', ')}${cities.length > 3 ? ' and more' : ''}. ` +
    `Curated by BarMagazine.`;

  const currentYear = new Date().getFullYear();
  const title = `${bars.length} Best Bars in ${countryName} (${currentYear} Guide)`;
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
  const allCountries = await getCountriesWithCounts();
  const match = allCountries.find(c => toUrlSlug(c.country) === params.country);

  if (!match) notFound();

  const countryName = match.country;
  const bars = await getBarsByCountry(countryName);

  if (bars.length === 0) notFound();

  const cities = Array.from(new Set(bars.map(b => b.city))).sort();
  const cityCount = cities.length;

  // Sort: Featured+Top10 with photo → Featured+Top10 no photo → Featured with photo →
  //       Featured no photo → Top10 with photo → Top10 no photo → Free with photo → Free no photo
  const tierRank = (bar: Bar): number => {
    const isFeatured = bar.tier === 'featured' || !!bar.wp_article_slug;
    const isTop10 = bar.tier === 'top10';
    const hasPhoto = bar.photos && bar.photos.length > 0;
    if (isFeatured && isTop10)  return hasPhoto ? 0 : 1;
    if (isFeatured)             return hasPhoto ? 2 : 3;
    if (isTop10)                return hasPhoto ? 4 : 5;
    return hasPhoto ? 6 : 7;
  };

  const sorted = [...bars].sort((a, b) => {
    const rankDiff = tierRank(a) - tierRank(b);
    if (rankDiff !== 0) return rankDiff;
    return a.name.localeCompare(b.name);
  });

  // JSON-LD — BreadcrumbList
  const breadcrumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
      { '@type': 'ListItem', position: 2, name: 'Bar Directory', item: `${SITE_URL}/bars` },
      { '@type': 'ListItem', position: 3, name: countryName, item: `${SITE_URL}/bars/country/${params.country}` },
    ],
  };

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
        <span>{countryName}</span>
      </nav>

      {/* Two-column layout: 3fr main + 1fr sidebar — matches /bars and city pages */}
      <div className="directory-outer-with-sidebar">

        {/* Row 1 left: Hero */}
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

        {/* Row 1 right: Promo sidebar */}
        <BarDirectorySidebarPromo />

        {/* Row 2 left: results bar + card grid + CTA */}
        <div className="directory-page-body">

          {/* Results count */}
          <div className="directory-results-bar">
            <span className="directory-count">{bars.length} bars in {countryName}</span>
          </div>

          {/* Unified bar grid — same dark card design as city pages */}
          <CountryBarGrid bars={sorted} />

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

        </div>{/* end directory-page-body */}

        {/* Row 2 right: sticky sidebar */}
        <BarDirectorySidebar />

      </div>{/* end directory-outer-with-sidebar */}
    </>
  );
}

// ---------------------------------------------------------------------------
// Deterministic dark colour from bar name — 8 rich dark palettes
// ---------------------------------------------------------------------------
const PLACEHOLDER_COLOURS = [
  'linear-gradient(135deg, #0a0f1e 0%, #0d1530 100%)',
  'linear-gradient(135deg, #0a1a0e 0%, #0d2412 100%)',
  'linear-gradient(135deg, #1a0a0e 0%, #240d12 100%)',
  'linear-gradient(135deg, #0e0a1a 0%, #140d24 100%)',
  'linear-gradient(135deg, #1a100a 0%, #24160d 100%)',
  'linear-gradient(135deg, #0a1a1a 0%, #0d2424 100%)',
  'linear-gradient(135deg, #151515 0%, #1e1e1e 100%)',
  'linear-gradient(135deg, #0f0a1a 0%, #160d24 100%)',
];
function barColour(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = (hash * 31 + name.charCodeAt(i)) >>> 0;
  return PLACEHOLDER_COLOURS[hash % PLACEHOLDER_COLOURS.length];
}

// ---------------------------------------------------------------------------
// Unified bar grid — same dark card design as city pages
// ---------------------------------------------------------------------------
function CountryBarGrid({ bars }: { bars: Bar[] }) {
  if (bars.length === 0) return null;
  return (
    <div className="directory-grid">
      {bars.map(bar => (
        <CountryBarCard key={bar.id} bar={bar} />
      ))}
    </div>
  );
}

function CountryBarCard({ bar }: { bar: Bar }) {
  const imageUrl = bar.photos?.[0] ?? null;
  const isFeatured = bar.tier === 'featured' || !!bar.wp_article_slug;
  const isTop10 = bar.tier === 'top10';

  return (
    <Link href={`/bars/${bar.slug}`} className="city-bar-card">
      <div className="bar-dir-featured-visual">
        {imageUrl
          ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={imageUrl} alt={bar.name} loading="lazy" />
          ) : (
            <div className="bar-dir-featured-placeholder" style={{ background: barColour(bar.name) }}>
              <span>{bar.name.replace(/([a-z])([A-Z])/g, '$1 $2').split(/\s+/).filter(Boolean).map((w: string) => w[0]).join('').toUpperCase().slice(0, 4)}</span>
            </div>
          )
        }
        <div className="bar-dir-featured-overlay" />
        {/* TOP 10 badge */}
        {isTop10 && (
          <div className="bar-dir-top10-badge-corner">
            <svg width="9" height="9" viewBox="0 0 24 24" fill="currentColor" style={{ display: 'inline', marginRight: 3, verticalAlign: 'middle' }}>
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
            TOP 10
          </div>
        )}
        {/* FEATURED badge */}
        {isFeatured && (
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
    </Link>
  );
}
