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
  const hasContact = bar.website || bar.instagram || bar.phone || bar.email;
  // For bars with editorial articles, short_excerpt is article text — don't show as "About"
  // Only show About section for bars that have a genuine bar description (not article excerpts)
  const hasDescription = bar.wp_article_slug ? bar.description : (bar.description || bar.short_excerpt);

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

      {/* Hero */}
      <div className={`bar-profile-hero${hasImage ? '' : ' bar-profile-hero--no-image'}${isPremium ? ' bar-profile-hero--premium' : ''}`}>
        {hasImage && (
          <div className="bar-profile-hero-img">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={bar.photos[0]} alt={bar.name} />
          </div>
        )}
        {!hasImage && (
          <span className="bar-profile-decorative-initial" aria-hidden="true">
            {bar.name.charAt(0)}
          </span>
        )}
        <div className="bar-profile-hero-content">
          <div className="bar-profile-hero-badges">
            <span className="bar-profile-type">{bar.type}</span>
            {isPaid && (
              <span className={`bar-profile-tier-badge${isPremium ? ' bar-profile-tier-badge--premium' : ''}`}>
                {isPremium ? (
                  <>
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>
                    Premium Listing
                  </>
                ) : 'Featured'}
              </span>
            )}
            {bar.is_verified && <span className="bar-profile-verified">&#10003; Verified</span>}
          </div>
          <h1>{bar.name}</h1>
          <div className="bar-profile-location">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
            <span>{bar.city}, {bar.country}</span>
          </div>
        </div>
      </div>

      {/* Quick Info Bar */}
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

      {/* Content */}
      <div className="bar-profile-layout">
        <div className="bar-profile-main">
          {/* About — only show for bars with genuine descriptions, not article excerpts */}
          {hasDescription && (
            <section className="bar-profile-section">
              <h2>About</h2>
              <p>{hasDescription}</p>
            </section>
          )}

          {/* Photo Gallery (premium/featured) */}
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

          {/* Editorial Article Link */}
          {bar.wp_article_slug && (
            <section className="bar-profile-section">
              <h2>Read More</h2>
              <Link href={`/${bar.wp_article_slug}`} className="bar-profile-article-link">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 19.5A2.5 2.5 0 016.5 17H20" />
                  <path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" />
                </svg>
                Read the full BarMagazine feature
              </Link>
            </section>
          )}

          {/* No content placeholder for free/basic listings */}
          {!hasDescription && !hasMultiplePhotos && !bar.wp_article_slug && (
            <section className="bar-profile-section">
              <div className="bar-profile-empty-content">
                <div className="bar-profile-empty-icon" aria-hidden="true">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M8 2h8l2 6H6L8 2z" />
                    <path d="M6 8c0 0-2 2-2 6s2 6 2 6h12s2-2 2-6-2-6-2-6" />
                    <path d="M12 12v4M10 14h4" />
                  </svg>
                </div>
                <h3>Claim this profile to showcase your bar</h3>
                <p>Add photos, a description, contact details, and more. Get discovered by bar enthusiasts around the world.</p>
                <Link href="/add-your-bar" className="bar-profile-upgrade-inline">Get Listed &rarr;</Link>
              </div>
            </section>
          )}
        </div>

        {/* Sidebar */}
        <aside className="bar-profile-sidebar">
          {/* Contact Info */}
          {hasContact && (
            <div className="bar-profile-info-card">
              <h3>Contact</h3>
              <ul className="bar-profile-info-list">
                {bar.website && (
                  <li>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10" />
                      <path d="M2 12h20M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" />
                    </svg>
                    <a href={bar.website} target="_blank" rel="noopener noreferrer">
                      {bar.website.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '')}
                    </a>
                  </li>
                )}
                {bar.instagram && (
                  <li>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="2" y="2" width="20" height="20" rx="5" />
                      <circle cx="12" cy="12" r="5" />
                      <circle cx="17.5" cy="6.5" r="1.5" fill="currentColor" stroke="none" />
                    </svg>
                    <a href={`https://instagram.com/${bar.instagram.replace('@', '')}`} target="_blank" rel="noopener noreferrer">
                      @{bar.instagram.replace('@', '')}
                    </a>
                  </li>
                )}
                {bar.phone && (
                  <li>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z" />
                    </svg>
                    <a href={`tel:${bar.phone}`}>{bar.phone}</a>
                  </li>
                )}
                {bar.email && (
                  <li>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                      <path d="M22 6l-10 7L2 6" />
                    </svg>
                    <a href={`mailto:${bar.email}`}>{bar.email}</a>
                  </li>
                )}
              </ul>
            </div>
          )}

          {/* Address & Map */}
          {bar.address && (
            <div className="bar-profile-info-card">
              <h3>Location</h3>
              <p className="bar-profile-address">{bar.address}</p>
              {bar.lat && bar.lng && (
                <>
                  <div className="bar-profile-map-placeholder">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={`https://maps.googleapis.com/maps/api/staticmap?center=${bar.lat},${bar.lng}&zoom=15&size=400x200&scale=2&markers=color:red%7C${bar.lat},${bar.lng}&style=feature:all|element:labels|visibility:on&style=feature:poi|visibility:off&key=`}
                      alt={`Map of ${bar.name}`}
                      className="bar-profile-map-img"
                      onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                    />
                    <div className="bar-profile-map-fallback">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
                        <circle cx="12" cy="10" r="3" />
                      </svg>
                    </div>
                  </div>
                  <a
                    href={`https://www.google.com/maps?q=${bar.lat},${bar.lng}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bar-profile-map-link"
                  >
                    Open in Google Maps
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3" />
                    </svg>
                  </a>
                </>
              )}
            </div>
          )}

          {/* Upgrade CTA for free bars */}
          {bar.tier === 'free' && (
            <div className="bar-profile-upgrade">
              <div className="bar-profile-upgrade-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
              </div>
              <p>Is this your bar?</p>
              <span className="bar-profile-upgrade-sub">Add photos, contact details, and more</span>
              <Link href="/add-your-bar">Get Listed</Link>
            </div>
          )}
        </aside>
      </div>
    </>
  );
}
