import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getBarBySlug, getBarsByCity, getBars } from '@/lib/supabase';
import type { Bar } from '@/lib/supabase';
import { formatBarType, toUrlSlug } from '@/lib/utils';
import type { Metadata } from 'next';
import { BarProfileClient } from '@/components/BarProfileClient';
import { BarDirectorySidebarPromo, BarDirectorySidebar } from '@/components/BarDirectorySidebar';
import { Top10FooterBlock } from '@/components/Top10FooterBlock';

export const revalidate = 300;
// Allow slugs not pre-built at deploy time to be rendered on-demand (ISR)
// This means new bars added to the DB are immediately accessible without a redeploy
export const dynamicParams = true;

// ---------------------------------------------------------------------------
// Static params — only pre-build top-tier bars (top10 + featured) at build
// time. Free-tier bars are rendered on-demand via ISR (dynamicParams = true)
// already set above). This keeps build times short as the directory grows.
// ---------------------------------------------------------------------------
export async function generateStaticParams() {
  const { bars } = await getBars({ tier: 'top10', perPage: 500 });
  const { bars: featuredBars } = await getBars({ tier: 'featured', perPage: 200 });
  const allPriority = [...bars, ...featuredBars];
  return allPriority.map(bar => ({ slug: bar.slug }));
}

const SITE_URL = 'https://barmagazine.com';

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const bar = await getBarBySlug(params.slug);
  if (!bar) return {};

  const title = `${bar.name} | ${formatBarType(bar.type)} in ${bar.city}, ${bar.country}`;
  const description = bar.description || `${bar.name} is a ${formatBarType(bar.type).toLowerCase()} located in ${bar.city}, ${bar.country}. Discover it on BarMagazine — the global bar directory.`;

  return {
    title,
    description,
    alternates: { canonical: `${SITE_URL}/bars/${bar.slug}` },
    robots: { index: true, follow: true },
    openGraph: {
      title,
      description,
      type: 'website',
      url: `${SITE_URL}/bars/${bar.slug}`,
      siteName: 'BarMagazine',
      images: bar.photos?.[0] ? [{ url: bar.photos[0].startsWith('/') ? `${SITE_URL}${bar.photos[0]}` : bar.photos[0], width: 1200, height: 630, alt: bar.name }] : [{ url: `${SITE_URL}/og-bars.jpg`, width: 1200, height: 630, alt: 'BarMagazine' }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: bar.photos?.[0] ? [bar.photos[0].startsWith('/') ? `${SITE_URL}${bar.photos[0]}` : bar.photos[0]] : [`${SITE_URL}/og-bars.jpg`],
    },
  };
}

export default async function BarProfilePage({ params }: { params: { slug: string } }) {
  const bar = await getBarBySlug(params.slug);
  if (!bar) notFound();

// Deterministic dark colour from bar name
const PLACEHOLDER_COLOURS_SLUG = [
  'linear-gradient(135deg, #0a0f1e 0%, #0d1530 100%)',
  'linear-gradient(135deg, #0a1a0e 0%, #0d2412 100%)',
  'linear-gradient(135deg, #1a0a0e 0%, #240d12 100%)',
  'linear-gradient(135deg, #0e0a1a 0%, #140d24 100%)',
  'linear-gradient(135deg, #1a100a 0%, #24160d 100%)',
  'linear-gradient(135deg, #0a1a1a 0%, #0d2424 100%)',
  'linear-gradient(135deg, #151515 0%, #1e1e1e 100%)',
  'linear-gradient(135deg, #0f0a1a 0%, #160d24 100%)',
];
function barColourSlug(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = (hash * 31 + name.charCodeAt(i)) >>> 0;
  return PLACEHOLDER_COLOURS_SLUG[hash % PLACEHOLDER_COLOURS_SLUG.length];
}

  // Fetch nearby bars (same city, exclude current bar)
  // Priority: top10 bars first (with or without photo), then other bars with photos
  const cityBars = await getBarsByCity(bar.city);
  const otherCityBars = cityBars.filter(b => b.id !== bar.id);
  const top10CityBars = otherCityBars.filter(b => b.tier === 'top10');
  const otherCityBarsWithPhoto = otherCityBars.filter(b => b.tier !== 'top10' && b.photos && b.photos.length > 0);
  const nearbyBars = [...top10CityBars, ...otherCityBarsWithPhoto].slice(0, 4);

  const isPremium = bar.tier === 'premium';
  const isFeatured = bar.tier === 'featured';
  const isTop10 = bar.tier === 'top10';
  const isPaid = isPremium || isFeatured || isTop10;
  const hasImage = bar.photos && bar.photos.length > 0;
  const hasGallery = bar.photos && bar.photos.length > 2;

  // JSON-LD structured data
  const jsonLd: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'BarOrNightclub',
    name: bar.name,
    description: bar.description || `${bar.name} is a ${formatBarType(bar.type).toLowerCase()} in ${bar.city}, ${bar.country}.`,
    url: `${SITE_URL}/bars/${bar.slug}`,
    ...(bar.address && {
      address: { '@type': 'PostalAddress', streetAddress: bar.address, addressLocality: bar.city, addressCountry: bar.country },
    }),
    containedInPlace: {
      '@type': 'City', name: bar.city,
      containedInPlace: { '@type': 'Country', name: bar.country },
    },
    ...(bar.lat && bar.lng && { geo: { '@type': 'GeoCoordinates', latitude: bar.lat, longitude: bar.lng } }),
    // FIX: ensure all image URLs are absolute — relative paths break Google's schema validator
    ...(hasImage && { image: bar.photos.map((p: string) => p.startsWith('/') ? `${SITE_URL}${p}` : p) }),
    ...(bar.phone && { telephone: bar.phone }),
    ...(bar.email && { email: bar.email }),
    ...(bar.instagram && { sameAs: [`https://instagram.com/${bar.instagram.replace('@', '')}`] }),
    ...(bar.tier === 'premium' && { priceRange: '$$$' }),
    ...(bar.tier === 'featured' && { priceRange: '$$' }),
    ...(bar.tier === 'top10' && { priceRange: '$$' }),
    // openingHours: when you add an opening_hours column to the bars table in Supabase,
    // store it as an array of strings in schema.org format, e.g.:
    // ["Mo-Fr 17:00-02:00", "Sa-Su 15:00-03:00"]
    // It will automatically appear in Google search results (rich results).
    ...((bar as Bar & { opening_hours?: string[] }).opening_hours?.length && {
      openingHours: (bar as Bar & { opening_hours?: string[] }).opening_hours,
    }),
    isPartOf: { '@type': 'WebSite', name: 'BarMagazine Bar Directory', url: `${SITE_URL}/bars` },
  };

  const breadcrumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
      { '@type': 'ListItem', position: 2, name: 'Bar Directory', item: `${SITE_URL}/bars` },
      { '@type': 'ListItem', position: 3, name: bar.country, item: `${SITE_URL}/bars/country/${toUrlSlug(bar.country)}` },
      { '@type': 'ListItem', position: 4, name: bar.city, item: `${SITE_URL}/bars/city/${toUrlSlug(bar.city)}` },
      { '@type': 'ListItem', position: 5, name: bar.name, item: `${SITE_URL}/bars/${bar.slug}` },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />

      {/* Breadcrumb */}
      <nav className="bar-breadcrumb">
        <Link href="/bars">Bar Directory</Link>
        <span className="bar-breadcrumb-sep">/</span>
        <Link href={`/bars/country/${toUrlSlug(bar.country)}`}>{bar.country}</Link>
        <span className="bar-breadcrumb-sep">/</span>
        <Link href={`/bars/city/${toUrlSlug(bar.city)}`}>{bar.city}</Link>
        <span className="bar-breadcrumb-sep">/</span>
        <span>{bar.name}</span>
      </nav>

      {/* ═══ V2 LAYOUT: 3/4 main + 1/4 sidebar ═══ */}
      <div className="bar-profile-outer">
      <div className="bar-v2">
        {/* Hero Photo — full width */}
        <div className="bar-v2-hero">
          {hasImage ? (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={bar.photos[0]} alt={bar.name} />
              <div className="bar-v2-photo-overlay" />
            </>
          ) : (
            <div className="bar-v2-photo-placeholder" style={{ background: barColourSlug(bar.name) }}>
              <span className="bar-v2-hero-acronym">
                {bar.name.replace(/([a-z])([A-Z])/g, '$1 $2').split(/\s+/).filter(Boolean).map((w: string) => w[0]).join('').toUpperCase().slice(0, 5)}
              </span>
            </div>
          )}
          {/* All badges overlaid at bottom-left of hero photo */}
          {(isTop10 || isFeatured || isPremium || bar.wp_article_slug || bar.type) && (
            <div className="bar-v2-hero-badges">
              {isTop10 && <span className="bar-v2-badge bar-v2-badge--top10">★ TOP 10</span>}
              {(isFeatured || isPremium || bar.wp_article_slug) && <span className="bar-v2-badge bar-v2-badge--featured">{isPremium ? 'Premium' : 'Featured'}</span>}
              {bar.type && <span className="bar-v2-badge bar-v2-badge--type">{formatBarType(bar.type)}</span>}
            </div>
          )}
        </div>

        {/* Bar Info */}
        <div className="bar-v2-info">
          <div className="bar-v2-info-main">
            <h1>{bar.name}</h1>
            <p className="bar-v2-description">
              {bar.description || `${bar.name} is a ${formatBarType(bar.type).toLowerCase()} in ${bar.city}, ${bar.country}. Discover it on BarMagazine — the global bar directory.`}
            </p>
            <div className="bar-v2-details">
              {bar.address && (
                <div className="bar-v2-detail">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" /><circle cx="12" cy="10" r="3" /></svg>
                  <span>{bar.address}</span>
                </div>
              )}
              {bar.website && (
                <a href={bar.website} target="_blank" rel="noopener noreferrer" className="bar-v2-detail bar-v2-detail--link">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><path d="M2 12h20M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" /></svg>
                  <span>{bar.website.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '')}</span>
                </a>
              )}
              {bar.instagram && (
                <a href={`https://instagram.com/${bar.instagram.replace('@', '')}`} target="_blank" rel="noopener noreferrer" className="bar-v2-detail bar-v2-detail--link">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="2" width="20" height="20" rx="5" /><circle cx="12" cy="12" r="5" /><circle cx="17.5" cy="6.5" r="1.5" fill="currentColor" stroke="none" /></svg>
                  <span>@{bar.instagram.replace('@', '')}</span>
                </a>
              )}
              {bar.phone && (
                <a href={`tel:${bar.phone}`} className="bar-v2-detail bar-v2-detail--link">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" /></svg>
                  <span>{bar.phone}</span>
                </a>
              )}
              {(bar as Bar & { opening_hours?: string }).opening_hours && (
                <div className="bar-v2-detail">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
                  <span>{(bar as Bar & { opening_hours?: string }).opening_hours}</span>
                </div>
              )}
            </div>
          </div>

          <div className="bar-v2-actions">
            {bar.wp_article_slug && (
              <Link href={`/${bar.wp_article_slug}`} className="bar-v2-btn bar-v2-btn--primary">
                Read the BarMagazine Feature
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
              </Link>
            )}
            {bar.website && (
              <a href={bar.website} target="_blank" rel="noopener noreferrer" className="bar-v2-btn bar-v2-btn--secondary">
                Visit Website
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3" /></svg>
              </a>
            )}
            {(bar.tier === 'free') && !bar.wp_article_slug && (
              <Link href="/claim-your-bar" className="bar-v2-btn bar-v2-btn--claim">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>
                Is this your bar? Claim it
              </Link>
            )}
          </div>
        </div>

        {/* Gallery */}
        {hasGallery && (
          <div className="bar-v2-gallery">
            <h2>Photos</h2>
            <div className="bar-v2-gallery-grid">
              {bar.photos.slice(1).map((photo, i) => (
                <div key={i} className="bar-v2-gallery-item">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={photo} alt={`${bar.name} photo ${i + 2}`} loading="lazy" />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Nearby Bars */}
        {nearbyBars.length > 0 && (
          <div className="bar-v2-nearby">
            <h2>More Bars in {bar.city}</h2>
            <div className="bar-v2-nearby-grid">
              {nearbyBars.map(nb => (
                <Link key={nb.id} href={`/bars/${nb.slug}`} className="bar-dir-featured-card">
                  <div className="bar-dir-featured-visual">
                    {nb.photos && nb.photos.length > 0
                      ? <img src={nb.photos[0]} alt={nb.name} loading="lazy" />
                      : (
                        <div className="bar-dir-featured-placeholder" style={{ background: barColourSlug(nb.name) }}>
                          <span>{nb.name.replace(/([a-z])([A-Z])/g, '$1 $2').split(/\s+/).filter(Boolean).map((w: string) => w[0]).join('').toUpperCase().slice(0, 4)}</span>
                        </div>
                      )
                    }
                  </div>
                  <div className="bar-dir-featured-body">
                    <div className="bar-dir-featured-badges">
                      {nb.tier === 'top10' && <span className="bar-dir-badge-pill bar-dir-badge-pill--top10">★ TOP 10</span>}
                      {(nb.tier === 'featured' || nb.tier === 'premium' || nb.wp_article_slug) && <span className="bar-dir-badge-pill bar-dir-badge-pill--featured">Featured</span>}
                      {nb.type && <span className="bar-dir-badge-pill bar-dir-badge-pill--type">{formatBarType(nb.type)}</span>}
                    </div>
                    <h3 className="bar-dir-featured-name">{nb.name}</h3>
                    <span className="bar-dir-featured-location">
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" /><circle cx="12" cy="10" r="3" />
                      </svg>
                      {nb.city}{nb.city !== nb.country ? `, ${nb.country}` : ''}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* CTA Banner — only for free/non-featured bars */}
        {!isPaid && !bar.wp_article_slug && (
          <div className="bar-v2-cta">
            <div className="bar-v2-cta-inner">
              <div>
                <h3>Get your bar featured on BarMagazine</h3>
                <p>Boost visibility with a premium listing, feature article, and social media coverage.</p>
              </div>
              <Link href="/claim-your-bar" className="bar-v2-btn bar-v2-btn--primary">
                List Your Bar
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
              </Link>
            </div>
          </div>
        )}

        {/* Location Map — bottom of page */}
        {bar.lat && bar.lng && (
          <div className="bar-v2-location">
            <h2>Location</h2>
            <div className="bar-v2-location-map">
              <BarProfileClient lat={bar.lat} lng={bar.lng} name={bar.name} />
            </div>
          </div>
        )}
        {/* Mobile-only Top 10 box — shown below map on mobile, hidden on desktop (sidebar shows it) */}
        <div className="bar-v2-mobile-top10">
          <Top10FooterBlock />
        </div>
      </div>{/* end bar-v2 */}

      {/* Sidebar: promo + ad + top10 */}
      <div className="bar-profile-sidebar">
        <BarDirectorySidebarPromo />
        <BarDirectorySidebar />
      </div>

      </div>{/* end bar-profile-outer */}
    </>
  );
}
