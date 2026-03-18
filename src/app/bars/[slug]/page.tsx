import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getBarBySlug } from '@/lib/supabase';
import type { Metadata } from 'next';

export const revalidate = 300;

const SITE_URL = 'https://barmagazine.com';

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const bar = await getBarBySlug(params.slug);
  if (!bar) return {};

  const title = `${bar.name} — ${bar.city}`;
  const description = bar.short_excerpt || bar.description || `${bar.name} is a ${bar.type.toLowerCase()} in ${bar.city}, ${bar.country}. Discover it on Bar Magazine.`;

  return {
    title,
    description,
    alternates: { canonical: `${SITE_URL}/bars/${bar.slug}` },
    openGraph: {
      title,
      description,
      type: 'website',
      url: `${SITE_URL}/bars/${bar.slug}`,
      siteName: 'Bar Magazine',
      images: bar.photos?.[0] ? [{ url: bar.photos[0] }] : [],
    },
  };
}

export default async function BarProfilePage({ params }: { params: { slug: string } }) {
  const bar = await getBarBySlug(params.slug);
  if (!bar) notFound();

  const isPaid = bar.tier === 'featured' || bar.tier === 'premium';
  const hasImage = bar.photos && bar.photos.length > 0;
  const hasMultiplePhotos = bar.photos && bar.photos.length > 1;
  const hasContact = bar.website || bar.instagram || bar.phone || bar.email;

  // JSON-LD structured data
  const jsonLd: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'BarOrPub',
    name: bar.name,
    description: bar.short_excerpt || bar.description || `${bar.name} is a ${bar.type.toLowerCase()} in ${bar.city}, ${bar.country}.`,
    url: `${SITE_URL}/bars/${bar.slug}`,
    ...(bar.address && { address: { '@type': 'PostalAddress', streetAddress: bar.address, addressLocality: bar.city, addressCountry: bar.country } }),
    ...(bar.lat && bar.lng && { geo: { '@type': 'GeoCoordinates', latitude: bar.lat, longitude: bar.lng } }),
    ...(hasImage && { image: bar.photos[0] }),
    ...(bar.website && { sameAs: bar.website }),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* Breadcrumb */}
      <nav className="bar-breadcrumb">
        <Link href="/bars">Bar Directory</Link>
        <span className="bar-breadcrumb-sep">/</span>
        <span>{bar.name}</span>
      </nav>

      {/* Hero */}
      <div className={`bar-profile-hero${hasImage ? '' : ' bar-profile-hero--no-image'}`}>
        {hasImage && (
          <div className="bar-profile-hero-img">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={bar.photos[0]} alt={bar.name} />
          </div>
        )}
        <div className="bar-profile-hero-content">
          <div className="bar-profile-hero-badges">
            <span className="bar-profile-type">{bar.type}</span>
            {isPaid && <span className="bar-dir-badge">{bar.tier === 'premium' ? 'Premium' : 'Featured'}</span>}
            {bar.is_verified && <span className="bar-profile-verified" title="Verified">&#10003; Verified</span>}
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

      {/* Content */}
      <div className="bar-profile-layout">
        <div className="bar-profile-main">
          {/* About */}
          {(bar.description || bar.short_excerpt) && (
            <section className="bar-profile-section">
              <h2>About</h2>
              <p>{bar.description || bar.short_excerpt}</p>
            </section>
          )}

          {/* Photo Gallery (premium/featured) */}
          {hasMultiplePhotos && (
            <section className="bar-profile-section">
              <h2>Photos</h2>
              <div className="bar-profile-gallery">
                {bar.photos.slice(1).map((photo, i) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img key={i} src={photo} alt={`${bar.name} photo ${i + 2}`} loading="lazy" />
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
                Read the full Bar Magazine feature
              </Link>
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

          {/* Address & Map placeholder */}
          {bar.address && (
            <div className="bar-profile-info-card">
              <h3>Location</h3>
              <p className="bar-profile-address">{bar.address}</p>
              {bar.lat && bar.lng && (
                <a
                  href={`https://www.google.com/maps?q=${bar.lat},${bar.lng}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bar-profile-map-link"
                >
                  Open in Google Maps
                </a>
              )}
            </div>
          )}

          {/* Upgrade CTA for free bars */}
          {bar.tier === 'free' && (
            <div className="bar-profile-upgrade">
              <p>Is this your bar?</p>
              <Link href="/add-your-bar">Claim &amp; Upgrade</Link>
            </div>
          )}
        </aside>
      </div>
    </>
  );
}
