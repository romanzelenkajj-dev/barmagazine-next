import { BarPlaceholder } from '@/components/BarPlaceholder';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getBarBySlug, getBarsByCity, getBars } from '@/lib/supabase';
import { getSeoCities, typePageForType, TYPE_PAGES } from '@/lib/seo-cities';
import type { Bar, MenuSection } from '@/lib/supabase';
import { formatBarType, toUrlSlug } from '@/lib/utils';
import { hasSlug, safeHref } from '@/lib/safe-slug';
import type { Metadata } from 'next';
import { BarProfileClient } from '@/components/BarProfileClient';
import { BarSectionChips } from '@/components/BarSectionChips';
import { MenuCollapse } from '@/components/MenuCollapse';
import { BarDirectorySidebarPromo, BarDirectorySidebar } from '@/components/BarDirectorySidebar';
import { Top10FooterBlock } from '@/components/Top10FooterBlock';
import BarGallery from '@/components/BarGallery';
import { AccoladeBadges } from '@/components/AccoladeBadges';
import { HighlightedText } from '@/components/HighlightedText';
import { awardStrings, hasFiftyBest } from '@/lib/accolades';

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
  const allPriority = [...bars, ...featuredBars].filter(hasSlug);
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


  // Fetch nearby bars (same city, exclude current bar).
  // Always fill up to 4 cards: photographed bars lead, photo-less bars top
  // up the remainder — the old photo-only filter left a city with one
  // photographed bar showing one lonely card in a four-card row. Photo-less
  // cards fall back to the BarPlaceholder visual. Within each group the
  // prior ordering holds: top10 first, then the query's name order.
  const cityBars = await getBarsByCity(bar.city);
  const otherCityBars = cityBars.filter(b => b.id !== bar.id);
  const barHasPhoto = (b: Bar) => !!(b.photos && b.photos.length > 0);
  const tierFirst = (bars: Bar[]) => [
    ...bars.filter(b => b.tier === 'top10'),
    ...bars.filter(b => b.tier !== 'top10'),
  ];
  const nearbyBars = [
    ...tierFirst(otherCityBars.filter(barHasPhoto)),
    ...tierFirst(otherCityBars.filter(b => !barHasPhoto(b))),
  ].slice(0, 4);

  // SEO cross-links: the city guide and the type-by-city guide, where those
  // pages exist. Keeps the programmatic pages from being orphans (every bar
  // in a qualifying city links up to them).
  const seoCities = await getSeoCities();
  const seoCity = seoCities.find(c => c.city === bar.city) ?? null;
  const seoTypeDef = typePageForType(bar.type);
  const seoType = seoCity && seoTypeDef ? seoCity.typeSlugs.find(t => t.slug === seoTypeDef.slug) ?? null : null;

  // Secondary style tags: the curated subtypes, minus the primary type
  // (already shown as the main badge). Each links to its type-city guide
  // when the union threshold makes one exist, which wires the new pages
  // into internal linking from every tagged profile. Cards and nearby rows
  // deliberately keep showing only the primary type.
  const subtypeTags = (bar.subtypes ?? [])
    .filter(st => st !== bar.type)
    .map(st => {
      const def = TYPE_PAGES.find(t => t.type === st);
      const cityEntry = def && seoCity ? seoCity.typeSlugs.find(t => t.slug === def.slug) ?? null : null;
      return { label: st, href: cityEntry && seoCity ? `/best-bars/${seoCity.slug}/${cityEntry.slug}` : null };
    });

  const isPremium = bar.tier === 'premium';
  const isFeatured = bar.tier === 'featured';
  const isTop10 = bar.tier === 'top10';
  const isPaid = isPremium || isFeatured || isTop10;
  const hasImage = bar.photos && bar.photos.length > 0;
  const hasGallery = bar.photos && bar.photos.length > 1;
  const hasFullMenu = isPaid && bar.menu_sections && bar.menu_sections.length > 0;
  // WhatsApp link: strip everything but digits for wa.me
  const waDigits = bar.whatsapp ? bar.whatsapp.replace(/[^0-9]/g, '') : null;
  const reserveHref = bar.reservation_url || (waDigits ? `https://wa.me/${waDigits}` : null);
  // Mirrors the Plan Your Visit render condition exactly, so the jump chip
  // can never point at a section that did not render.
  // Free-tier since Aug 2026: practical visit info (hours, address, phone,
  // WhatsApp, reserve) renders for every bar that has the data. Menu and
  // gallery remain the paid differentiators.
  const hasVisit = !!(bar.opening_hours || bar.address || bar.phone || waDigits || reserveHref);

  // One renderer for both halves of the menu (open head, collapsed tail), so
  // they cannot drift apart in markup.
  const renderMenuSection = (section: MenuSection, si: number) => (
    <div key={si} className="bar-v2-menu-section">
      <h3 className="bar-v2-menu-section-title">{section.title}</h3>
      {section.note && <p className="bar-v2-menu-section-note">{section.note}</p>}
      <ul className="bar-v2-menu-items">
        {section.items.map((item, ii) => (
          <li key={ii} className="bar-v2-menu-item">
            <div className="bar-v2-menu-item-head">
              <span className="bar-v2-menu-item-name">{item.name}</span>
              <span className="bar-v2-menu-item-dots" aria-hidden="true" />
              {item.price && <span className="bar-v2-menu-item-price">{item.price}</span>}
            </div>
            {item.ingredients && <p className="bar-v2-menu-item-ingredients">{item.ingredients}</p>}
            {item.ingredients_alt && <p className="bar-v2-menu-item-ingredients bar-v2-menu-item-ingredients--alt">{item.ingredients_alt}</p>}
          </li>
        ))}
      </ul>
    </div>
  );
  const directionsHref = bar.lat && bar.lng
    ? `https://www.google.com/maps/dir/?api=1&destination=${bar.lat},${bar.lng}`
    : bar.address
      ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${bar.name} ${bar.address} ${bar.city}`)}`
      : null;

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
    // Awards as schema.org/award strings. Deliberately NOT aggregateRating or
    // Review: Google's review-snippet guidelines forbid marking up ratings
    // aggregated from other sites, and an award is not a rating.
    ...(awardStrings(bar.accolades).length && { award: awardStrings(bar.accolades) }),
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
    // Menu structured data: link to the bar's own menu, plus signature serves
    // as MenuItems so Google can surface them in rich results.
    ...((bar.menu_url || (isPaid && (bar.menu_highlights?.length || bar.menu_sections?.length))) && {
      hasMenu: {
        '@type': 'Menu',
        ...(bar.menu_url && { url: bar.menu_url }),
        // Full menu (paid tiers with menu_sections) takes precedence over the
        // signature-serves-only section so Google sees the complete card.
        ...(hasFullMenu
          ? {
              hasMenuSection: bar.menu_sections!.map(section => ({
                '@type': 'MenuSection',
                name: section.title,
                ...(section.note && { description: section.note }),
                hasMenuItem: section.items.map(h => ({
                  '@type': 'MenuItem',
                  name: h.name,
                  ...(h.ingredients && { description: h.ingredients }),
                  ...(h.price && { offers: { '@type': 'Offer', price: h.price.replace(/[^0-9.,]/g, ''), priceCurrency: h.price.includes('€') ? 'EUR' : h.price.includes('$') ? 'USD' : undefined } }),
                })),
              })),
            }
          : isPaid && bar.menu_highlights?.length
            ? {
                hasMenuSection: {
                  '@type': 'MenuSection',
                  name: 'Signature serves',
                  hasMenuItem: bar.menu_highlights.map(h => ({
                    '@type': 'MenuItem',
                    name: h.name,
                    ...(h.ingredients && { description: h.ingredients }),
                  })),
                },
              }
            : {}),
      },
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
            <div className="bar-v2-photo-placeholder">
              <BarPlaceholder name={bar.name} type={bar.type} size="hero" />
            </div>
          )}
          {/* All badges overlaid at bottom-left of hero photo */}
          {(isTop10 || isFeatured || isPremium || bar.wp_article_slug || bar.type || subtypeTags.length > 0) && (
            <div className="bar-v2-hero-badges">
              {isTop10 && <span className="bar-v2-badge bar-v2-badge--top10">★ TOP 10</span>}
              {(isFeatured || isPremium || bar.wp_article_slug) && <span className="bar-v2-badge bar-v2-badge--featured">{isPremium ? 'Premium' : 'Featured'}</span>}
              {bar.type && <span className="bar-v2-badge bar-v2-badge--type">{formatBarType(bar.type)}</span>}
              {subtypeTags.map(tag =>
                tag.href ? (
                  <Link key={tag.label} href={tag.href} className="bar-v2-badge bar-v2-badge--subtype">
                    {formatBarType(tag.label)}
                  </Link>
                ) : (
                  <span key={tag.label} className="bar-v2-badge bar-v2-badge--subtype">
                    {formatBarType(tag.label)}
                  </span>
                )
              )}
            </div>
          )}
        </div>

        {/* Photo attribution. Under the image, never overlaid on it and clear
            of .bar-v2-hero-badges, which are absolutely positioned INSIDE the
            hero. Singular/plural follows the actual photo count, since the
            credit covers the whole set on multi-photo bars. */}
        {hasImage && bar.photo_credit && bar.photo_credit.trim() && (
          <p className="bar-v2-photo-credit">
            {bar.photos.length > 1 ? 'Photos' : 'Photo'}: {bar.photo_credit.trim()}
          </p>
        )}

        {/* Jump chips — only when the page is long enough to need them */}
        <BarSectionChips hasMenu={!!hasFullMenu} hasPhotos={!!hasGallery} hasVisit={hasVisit} />

        {/* Bar Info */}
        <div className="bar-v2-info">
          <div className="bar-v2-info-main">
            <h1>{bar.name}</h1>
            <p className="bar-v2-place">{bar.city}{bar.city !== bar.country ? `, ${bar.country}` : ''}</p>
            {/* Placement "A": name → location → tiles. Renders nothing when the
                bar has no accolades. Identical on free and paid listings. */}
            <AccoladeBadges accolades={bar.accolades} />
            <p className="bar-v2-description">
              {/* Bolding is computed at render time; the stored text stays
                  plain. The fallback keeps the no-em-dash copy rule. */}
              <HighlightedText
                text={bar.description || `${bar.name} is a ${formatBarType(bar.type).toLowerCase()} in ${bar.city}, ${bar.country}. Discover it on BarMagazine, the global bar directory.`}
              />
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
            {isPaid && reserveHref && (
              <a href={reserveHref} target="_blank" rel="noopener noreferrer" className="bar-v2-btn bar-v2-btn--reserve">
                Reserve a Table
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
              </a>
            )}
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
            {bar.menu_url && (
              <a href={bar.menu_url} target="_blank" rel="noopener noreferrer" className="bar-v2-btn bar-v2-btn--secondary">
                View Menu
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 19.5A2.5 2.5 0 016.5 17H20M4 19.5A2.5 2.5 0 006.5 22H20V2H6.5A2.5 2.5 0 004 4.5v15z" /></svg>
              </a>
            )}
            {/* Every unclaimed bar is claimable — tier does not matter.
                Nothing is claimed yet, and even the paid tiers (only two bars
                actually pay) have no owner account, so hiding the button on
                them just blocked the very owners most likely to want in.
                `owner_id` is the one real "already spoken for" signal; the
                pill disappears the moment a claim completes. */}
            {!bar.owner_id ? (
              <Link href={`/claim-your-bar?bar=${encodeURIComponent(bar.slug)}`} className="bar-v2-btn bar-v2-btn--claim">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>
                Is this your bar? Claim it
              </Link>
            ) : (
              /* The successor problem: when a manager leaves, the next one
                 finds a listing that is "taken" with no visible way in. */
              <p className="bar-v2-owner-note">
                This listing is managed by its owner. Ownership changes:{' '}
                contact <a href="mailto:office@barmagazine.com">office@barmagazine.com</a>.
              </p>
            )}
          </div>
        </div>

        {/* Signature Serves — featured/premium/top10 tiers only */}
        {isPaid && bar.menu_highlights && bar.menu_highlights.length > 0 && (
          <div className="bar-v2-serves">
            <h2>Signature Serves</h2>
            <ul className="bar-v2-serves-list">
              {bar.menu_highlights.map((h, i) => (
                <li key={i} className="bar-v2-serve">
                  <div className="bar-v2-serve-head">
                    <span className="bar-v2-serve-name">{h.name}</span>
                    {h.price && <span className="bar-v2-serve-price">{h.price}</span>}
                  </div>
                  {h.ingredients && <p className="bar-v2-serve-ingredients">{h.ingredients}</p>}
                </li>
              ))}
            </ul>
            {bar.menu_url && (
              <a href={bar.menu_url} target="_blank" rel="noopener noreferrer" className="bar-v2-serves-menu-link">
                View the full menu on {bar.name}&rsquo;s site
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
              </a>
            )}
          </div>
        )}

        {/* Full Menu — paid tiers with menu_sections: BarMagazine as the bar's website */}
        {hasFullMenu && (
          <div className="bar-v2-menu" id="menu">
            <h2>The Menu</h2>
            <div className="bar-v2-menu-sections">
              {bar.menu_sections!.slice(0, 2).map(renderMenuSection)}
            </div>
            {bar.menu_sections!.length > 2 && (
              /* Sections beyond the second collapse. They are server-rendered
                 children of a client wrapper, so the full menu stays in the
                 HTML for search engines and the schema.org markup built from
                 it stays truthful — hidden, not removed. */
              <MenuCollapse>
                <div className="bar-v2-menu-sections">
                  {bar.menu_sections!.slice(2).map((section, si) => renderMenuSection(section, si + 2))}
                </div>
              </MenuCollapse>
            )}
            <p className="bar-v2-menu-disclaimer">Menu and prices are provided by the bar and may change seasonally.</p>
          </div>
        )}

        {/* Plan Your Visit — paid tiers: hours, directions, call, WhatsApp, reserve */}
        {hasVisit && (
          <div className="bar-v2-visit" id="visit">
            <h2>Plan Your Visit</h2>
            <div className="bar-v2-visit-grid">
              {bar.opening_hours && (
                <div className="bar-v2-visit-block">
                  <span className="bar-v2-visit-label">Opening hours</span>
                  <span className="bar-v2-visit-value">{bar.opening_hours}</span>
                </div>
              )}
              {bar.address && (
                <div className="bar-v2-visit-block">
                  <span className="bar-v2-visit-label">Find us</span>
                  <span className="bar-v2-visit-value">{bar.address}</span>
                </div>
              )}
            </div>
            <div className="bar-v2-visit-actions">
              {reserveHref && (
                <a href={reserveHref} target="_blank" rel="noopener noreferrer" className="bar-v2-btn bar-v2-btn--reserve">
                  Reserve a Table
                </a>
              )}
              {waDigits && (
                <a href={`https://wa.me/${waDigits}`} target="_blank" rel="noopener noreferrer" className="bar-v2-btn bar-v2-btn--secondary">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                  WhatsApp
                </a>
              )}
              {bar.phone && (
                <a href={`tel:${bar.phone}`} className="bar-v2-btn bar-v2-btn--secondary">
                  Call {bar.phone}
                </a>
              )}
              {directionsHref && (
                <a href={directionsHref} target="_blank" rel="noopener noreferrer" className="bar-v2-btn bar-v2-btn--secondary">
                  Get Directions
                </a>
              )}
            </div>
          </div>
        )}

        {/* Gallery */}
        {hasGallery && (
          <div className="bar-v2-gallery" id="photos">
            <h2>Photos</h2>
            <BarGallery photos={bar.photos.slice(1)} barName={bar.name} />
          </div>
        )}

        {/* Nearby Bars */}
        {(seoCity || seoType) && (
          <div className="bar-v2-guide-links">
            {seoCity && (
              <Link href={`/best-bars/${seoCity.slug}`} className="bar-v2-guide-link">
                Best bars in {bar.city}
              </Link>
            )}
            {seoCity && seoType && (
              <Link href={`/best-bars/${seoCity.slug}/${seoType.slug}`} className="bar-v2-guide-link">
                Best {seoType.plural} in {bar.city}
              </Link>
            )}
          </div>
        )}

        {nearbyBars.length > 0 && (
          <div className="bar-v2-nearby">
            <h2>More Bars in {bar.city}</h2>
            <div className="bar-v2-nearby-grid">
              {nearbyBars.filter(hasSlug).map(nb => (
                <Link key={nb.id} href={safeHref('/bars', nb.slug)} className="bar-dir-featured-card">
                  <div className="bar-dir-featured-visual">
                    {nb.photos && nb.photos.length > 0
                      ? <img src={nb.photos[0]} alt={nb.name} loading="lazy" />
                      : (
                        <BarPlaceholder name={nb.name} type={nb.type} />
                      )
                    }
                    {(nb.tier === 'top10' || nb.tier === 'featured' || nb.tier === 'premium' || nb.wp_article_slug || hasFiftyBest(nb.accolades)) && (
                      <div className="bar-dir-visual-pills">
                        {nb.tier === 'top10' && <span className="bar-dir-badge-pill bar-dir-badge-pill--top10">★ TOP 10</span>}
                        {(nb.tier === 'featured' || nb.tier === 'premium' || nb.wp_article_slug) && <span className="bar-dir-badge-pill bar-dir-badge-pill--featured">Featured</span>}
                        {hasFiftyBest(nb.accolades) && (
                          <span className="bar-dir-badge-pill bar-dir-badge-pill--50best">50 Best</span>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="bar-dir-featured-body">

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
              <Link href="/feature-your-bar" className="bar-v2-btn bar-v2-btn--primary">
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
