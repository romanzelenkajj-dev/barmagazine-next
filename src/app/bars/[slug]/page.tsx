import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getBarBySlug, getBarsByCity } from '@/lib/supabase';
import { formatBarType } from '@/lib/utils';
import type { Metadata } from 'next';
import { BarProfileClient } from '@/components/BarProfileClient';

export const revalidate = 300;

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

  // Fetch nearby bars (same city, exclude current bar)
  const cityBars = await getBarsByCity(bar.city);
  const nearbyBars = cityBars
    .filter(b => b.id !== bar.id && b.photos && b.photos.length > 0)
    .slice(0, 4);

  const isPremium = bar.tier === 'premium';
  const isFeatured = bar.tier === 'featured';
  const isPaid = isPremium || isFeatured;
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
    ...(hasImage && { image: bar.photos }),
    ...(bar.phone && { telephone: bar.phone }),
    ...(bar.email && { email: bar.email }),
    ...(bar.instagram && { sameAs: [`https://instagram.com/${bar.instagram.replace('@', '')}`] }),
    ...(bar.tier === 'premium' && { priceRange: '$$$' }),
    ...(bar.tier === 'featured' && { priceRange: '$$' }),
    isPartOf: { '@type': 'WebSite', name: 'BarMagazine Bar Directory', url: `${SITE_URL}/bars` },
  };

  const breadcrumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Bar Directory', item: `${SITE_URL}/bars` },
      { '@type': 'ListItem', position: 2, name: bar.name, item: `${SITE_URL}/bars/${bar.slug}` },
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
        <span>{bar.name}</span>
      </nav>

      {/* ═══ V2 LAYOUT: Photo hero on top, map at bottom ═══ */}
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
            <div className="bar-v2-photo-placeholder">
              <span className="bar-v2-initial">{bar.name.charAt(0)}</span>
            </div>
          )}
          <div className="bar-v2-badges">
            <span className="bar-v2-badge">{formatBarType(bar.type)}</span>
            {(isPaid || bar.wp_article_slug) && <span className="bar-v2-badge bar-v2-badge--featured">{isPremium ? 'Premium' : 'Featured'}</span>}
          </div>
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
            {bar.tier === 'free' && !bar.wp_article_slug && (
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
                <Link key={nb.id} href={`/bars/${nb.slug}`} className="bar-v2-nearby-card">
                  <div className="bar-v2-nearby-img">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={nb.photos[0]} alt={nb.name} loading="lazy" />
                  </div>
                  <div className="bar-v2-nearby-body">
                    <h3>{nb.name}</h3>
                    <span>{formatBarType(nb.type)}</span>
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
      </div>
    </>
  );
}
