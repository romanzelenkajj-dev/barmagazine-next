import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getBarBySlug } from '@/lib/supabase';
import type { Metadata } from 'next';

export const revalidate = 300;

const SITE_URL = 'https://barmagazine.com';

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const bar = await getBarBySlug(params.slug);
  if (!bar) return {};

  const title = `${bar.name} | ${bar.type} in ${bar.city}, ${bar.country} | BarMagazine`;
  const description = bar.description || `${bar.name} is a ${bar.type.toLowerCase()} located in ${bar.city}, ${bar.country}. Discover it on BarMagazine — the global bar directory.`;

  return {
    title,
    description,
    alternates: { canonical: `${SITE_URL}/bars/${bar.slug}` },
    robots: { index: false, follow: false },
    openGraph: {
      title,
      description,
      type: 'website',
      url: `${SITE_URL}/bars/${bar.slug}`,
      siteName: 'BarMagazine',
      images: bar.photos?.[0] ? [{ url: bar.photos[0] }] : [],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: bar.photos?.[0] ? [bar.photos[0]] : [],
    },
  };
}

export default async function BarProfilePage({ params }: { params: { slug: string } }) {
  const bar = await getBarBySlug(params.slug);
  if (!bar) notFound();

  const isPremium = bar.tier === 'premium';
  const isFeatured = bar.tier === 'featured';
  const isPaid = isPremium || isFeatured;
  const hasImage = bar.photos && bar.photos.length > 0;
  const hasMultiplePhotos = bar.photos && bar.photos.length > 1;
  // For bars with editorial articles, short_excerpt is article text — don't show as "About"
  const hasDescription = bar.wp_article_slug ? bar.description : (bar.description || bar.short_excerpt);
  const hasRichContent = hasDescription || hasMultiplePhotos;

  // JSON-LD structured data — BarOrNightclub
  const jsonLd: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'BarOrNightclub',
    name: bar.name,
    description: bar.description || `${bar.name} is a ${bar.type.toLowerCase()} in ${bar.city}, ${bar.country}.`,
    url: `${SITE_URL}/bars/${bar.slug}`,
    ...(bar.address && {
      address: {
        '@type': 'PostalAddress',
        streetAddress: bar.address,
        addressLocality: bar.city,
        addressCountry: bar.country,
      },
    }),
    containedInPlace: {
      '@type': 'City',
      name: bar.city,
      containedInPlace: {
        '@type': 'Country',
        name: bar.country,
      },
    },
    ...(bar.lat && bar.lng && { geo: { '@type': 'GeoCoordinates', latitude: bar.lat, longitude: bar.lng } }),
    ...(hasImage && { image: bar.photos }),
    ...(bar.phone && { telephone: bar.phone }),
    ...(bar.email && { email: bar.email }),
    ...(bar.instagram && {
      sameAs: [`https://instagram.com/${bar.instagram.replace('@', '')}`],
    }),
    ...(bar.tier === 'premium' && { priceRange: '$$$' }),
    ...(bar.tier === 'featured' && { priceRange: '$$' }),
    isPartOf: {
      '@type': 'WebSite',
      name: 'BarMagazine Bar Directory',
      url: `${SITE_URL}/bars`,
    },
  };

  // BreadcrumbList JSON-LD
  const breadcrumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Bar Directory',
        item: `${SITE_URL}/bars`,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: bar.name,
        item: `${SITE_URL}/bars/${bar.slug}`,
      },
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

      {/* Photo with overlay badges */}
      {hasImage ? (
        <div className="bar-profile-photo">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={bar.photos[0]} alt={bar.name} />
          <div className="bar-profile-photo-badges">
            <span className="bar-profile-photo-badge">{bar.type}</span>
            {isPaid && <span className="bar-profile-photo-badge bar-profile-photo-badge--featured">{isPremium ? 'Premium' : 'Featured'}</span>}
            {bar.is_verified && <span className="bar-profile-photo-badge">&#10003; Verified</span>}
          </div>
        </div>
      ) : (
        <div className="bar-profile-hero bar-profile-hero--no-image">
          <div className="bar-profile-hero--no-image-badges">
            <span className="bar-profile-type">{bar.type}</span>
            {isPaid && <span className={`bar-profile-tier-badge${isPremium ? ' bar-profile-tier-badge--premium' : ''}`}>{isPremium ? 'Premium' : 'Featured'}</span>}
          </div>
          <span className="bar-profile-decorative-initial" aria-hidden="true">{bar.name.charAt(0)}</span>
        </div>
      )}

      {/* Bar name + location — on page background */}
      <div className="bar-profile-heading">
        <h1>{bar.name}</h1>
        <div className="bar-profile-heading-location">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
            <circle cx="12" cy="10" r="3" />
          </svg>
          <span>{bar.city}, {bar.country}</span>
        </div>
      </div>

      {/* Contact bar */}
      {(bar.address || bar.website || bar.instagram) && (
        <div className="bar-profile-quick-info">
          {bar.address && (
            <div className="bar-profile-qi-item">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
              <span>{bar.address}</span>
            </div>
          )}
          {bar.website && (
            <a href={bar.website} target="_blank" rel="noopener noreferrer" className="bar-profile-qi-item bar-profile-qi-link">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <path d="M2 12h20M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" />
              </svg>
              <span>{bar.website.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '')}</span>
            </a>
          )}
          {bar.instagram && (
            <a href={`https://instagram.com/${bar.instagram.replace('@', '')}`} target="_blank" rel="noopener noreferrer" className="bar-profile-qi-item bar-profile-qi-link">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="2" y="2" width="20" height="20" rx="5" />
                <circle cx="12" cy="12" r="5" />
                <circle cx="17.5" cy="6.5" r="1.5" fill="currentColor" stroke="none" />
              </svg>
              <span>@{bar.instagram.replace('@', '')}</span>
            </a>
          )}
        </div>
      )}

      {/* Action row: article link + claim CTA side by side */}
      <div className="bar-profile-actions">
        {bar.wp_article_slug && (
          <Link href={`/${bar.wp_article_slug}`} className="bar-profile-article-btn">
            Read the BarMagazine Feature
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
          </Link>
        )}
        {bar.tier === 'free' && (
          <Link href="/claim-your-bar" className="bar-profile-claim-btn">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>
            Is this your bar?
          </Link>
        )}
      </div>

      {/* Rich content: About, Gallery (only for bars with descriptions/photos) */}
      {hasRichContent && (
        <div className="bar-profile-content">
          {hasDescription && (
            <section className="bar-profile-section">
              <h2>About</h2>
              <p>{hasDescription}</p>
            </section>
          )}

          {hasMultiplePhotos && (
            <section className="bar-profile-section">
              <h2>Photos</h2>
              <div className="bar-profile-gallery">
                {bar.photos.slice(1).map((photo, i) => (
                  <div key={i} className="bar-profile-gallery-item">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={photo} alt={`${bar.name} photo ${i + 2}`} loading="lazy" />
                    <div className="bar-profile-gallery-zoom" aria-hidden="true">
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="11" cy="11" r="8" />
                        <path d="M21 21l-4.35-4.35M11 8v6M8 11h6" />
                      </svg>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </>
  );
}
