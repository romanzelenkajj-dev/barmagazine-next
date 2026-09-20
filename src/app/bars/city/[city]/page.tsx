import { DirectoryBarCard } from '@/components/DirectoryBarCard';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';
import { getCityIndex, getBarsForCity } from '@/lib/city-index';
import type { Bar } from '@/lib/supabase';
import { subdivisionName, cityLabel } from '@/lib/city-location';
import { toUrlSlug, formatBarType } from '@/lib/utils';
import { hasSlug } from '@/lib/safe-slug';
import { getCityIntro } from '@/lib/city-intros';
import { isIndexableCity } from '@/lib/seo-cities';
import { meritBand } from '@/lib/city-levels';
import { BarDirectorySidebar, BarDirectorySidebarPromo } from '@/components/BarDirectorySidebar';

/**
 * Normalise a Supabase bar photo URL.
 * CDN image URLs MUST keep the staging domain as the origin because
 * barmagazine.com now points to Vercel, not WordPress.
 * Raw (non-CDN) upload URLs are wrapped with the CDN.
 * Non-upload URLs are rewritten to barmagazine.com.
 */
function normalisePhotoUrl(url: string): string {
  if (!url) return url;
  // Already on CDN with staging domain → leave as-is
  if (url.match(/https:\/\/i[0-9]\.wp\.com\/romanzelenka-wjgek\.wpcomstaging\.com\//)) {
    return url;
  }
  // Raw upload URL → wrap with CDN (keep staging domain)
  if (url.includes('romanzelenka-wjgek.wpcomstaging.com/wp-content/uploads/')) {
    return url.replace(
      'https://romanzelenka-wjgek.wpcomstaging.com/',
      'https://i0.wp.com/romanzelenka-wjgek.wpcomstaging.com/'
    );
  }
  // Non-upload staging URL → production domain
  return url.replace(
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
  // One page per city ENTRY, not per city string: same-name cities are
  // separate entries with qualified slugs (portland-or, portland-me), and
  // two spellings of one city are one entry. See src/lib/city-keys.ts.
  const index = await getCityIndex();
  return index.entries.map(e => ({ city: e.slug }));
}

// ---------------------------------------------------------------------------
// Metadata
// ---------------------------------------------------------------------------
export async function generateMetadata({
  params,
}: {
  params: { city: string };
}): Promise<Metadata> {
  const index = await getCityIndex();
  const match = index.resolve(params.city);
  if (!match) return {};

  const cityName = match.city;
  const countryName = match.country;
  // A same-name city carries its qualifier in the title too, or the two
  // Portlands would share one title. Everything else keeps the bare name.
  const titleName = match.qualified ? cityLabel(cityName, countryName, subdivisionName(match.state, countryName)) : cityName;

  // NO BAR COUNT HERE, deliberately. Google holds a meta description for
  // weeks while this page revalidates every 300 seconds, so a number in it
  // is stale more often than it is accurate: a cached "the 8 best" against
  // a page now showing twelve is worse than no number at all. It also
  // removes the singular/plural branch ("The 1 best cocktail bars in
  // Detroit"). The live count still belongs in on-page copy, which
  // regenerates with the data.
  // NO "BEST BARS IN X" AND NO TYPE PHRASE HERE (task 83). This page was
  // claiming both of its siblings' phrases at once: the title said "Best
  // Cocktail Bars in Bangkok", which is /best-bars/bangkok/cocktail-bars at
  // position 7.3, and the H1 said "Best Bars in Bangkok", which is
  // /best-bars/bangkok. Google consolidated the three onto this one, the
  // weakest of them, and ranked it at 38.6 for 0.7% CTR while the pages
  // built to win those phrases earned nothing.
  //
  // What this page actually is: the bars WE hold in a city, all of them,
  // which is a directory and not a selection. The copy says that and stops
  // competing.
  const description =
    `The bars BarMagazine lists in ${cityLabel(cityName, countryName, subdivisionName(match.state, countryName))}: ` +
    `addresses, opening hours, signature serves and the awards each one holds. ` +
    `Browse the full city directory.`;

  const title = `${titleName} Bar Directory`;
  const canonical = `${SITE_URL}/bars/city/${params.city}`;

  return {
    title,
    description,
    alternates: { canonical },
    // A city with one or two bars is a thin page. It stays live and
    // followable so a crawler still reaches the profiles through it, but it
    // is not itself an index candidate until the city fills out. See
    // MIN_INDEXABLE_CITY_BARS.
    robots: { index: isIndexableCity(match.count), follow: true },
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
  const index = await getCityIndex();
  const match = index.resolve(params.city);
  if (!match) notFound();

  const cityName = match.city;
  const countryName = match.country;
  const bars = await getBarsForCity(match);

  // "Nashville, Tennessee", not "Nashville, United States". See
  // src/lib/city-location.ts for the rule and why the country is wrong here.
  // The state is the stored column (bars.state) via the city entry, never a
  // re-derivation from the addresses.
  const locationLabel = cityLabel(cityName, countryName, subdivisionName(match.state, countryName));
  // The heading of a same-name city carries its qualifier (see generateMetadata).
  const headingName = match.qualified ? locationLabel : cityName;
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
  // Paid, editorial pick, article, everything else. `isFeatured` used to mean
  // "featured tier OR has an article", so the top slot the two paying bars buy
  // was being shared with 15 bars that pay nothing. Having an article is still
  // a ranking signal, one bucket lower and under its own name.
  // The tier bucket only. Merit band and photo are separate keys below, so a
  // photo reorders bars inside a band and never lifts one across it.
  const tierRank = (b: Bar) => {
    const isTop10 = b.tier === 'top10';
    const isPaid = b.tier === 'featured' || b.tier === 'premium';
    const hasArticle = !!b.wp_article_slug;
    if (isTop10View) {
      if (isTop10)    return 0;
      if (isPaid)     return 1;
      if (hasArticle) return 2;
      return 3;
    }
    // Default view: the paid tier leads the regular list, which is what it buys.
    if (isPaid)     return 0;
    if (isTop10)    return 1;
    if (hasArticle) return 2;
    return 3;
  };
  const hasPhoto = (b: Bar) => (b.photos && b.photos.length > 0 ? 0 : 1);
  const sorted = [...bars].sort((a, b) => {
    const rankDiff = tierRank(a) - tierRank(b);
    if (rankDiff !== 0) return rankDiff;
    const band = meritBand(a) - meritBand(b);
    if (band !== 0) return band;
    const photo = hasPhoto(a) - hasPhoto(b);
    if (photo !== 0) return photo;
    return a.name.localeCompare(b.name);
  });

  // Bar types for hero subtitle
  const types = Array.from(new Set(bars.map(b => b.type))).sort();

  // Approved editorial intro for the top cities; template copy otherwise.
  const cityIntro = getCityIntro(params.city);


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
    // Same rule as the title and the H1: the structured data is what Google
    // reads, so leaving the old phrase here would undo the change.
    name: `${headingName} Bar Directory`,
    description: `The bars BarMagazine lists in ${locationLabel}.`,
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
          <div className="directory-hero-bg">
            {/* Use first bar photo as city hero background, fallback to generic */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={sorted.find(b => b.photos?.[0])?.photos?.[0] || '/images/directory-hero.jpg'} alt="" />
          </div>
          <div className="directory-hero-inner">
            <h1>{headingName} Bar Directory</h1>
            {/* The live count sits here, in on-page copy that regenerates on
                the 300s revalidate, and NOT in the title or meta description:
                Google holds those for weeks, so a cached number is stale more
                often than it is right. That rule predates task 83 (see the
                comment in generateMetadata) and this keeps to it. */}
            {cityIntro ? (
              <p>{cityIntro}</p>
            ) : (
              <p>
                Browse the {bars.length} bars BarMagazine lists in {locationLabel},
                with addresses, opening hours and signature serves.
                {types.length > 0 && (
                  <>
                    {' '}Our curated list covers {types.slice(0, 3).map(t => formatBarType(t).toLowerCase() + 's').join(', ')}
                    {types.length > 3 ? ` and ${types.length - 3} more bar type${types.length - 3 > 1 ? 's' : ''}` : ''},{' '}
                    ranging from intimate neighborhood spots to world-renowned cocktail destinations.
                  </>
                )}
                {' '}Whether you are a local looking for your next favorite haunt or a visitor planning a bar crawl,
                this guide covers the essential {cityName} bars you should not miss.
              </p>
            )}
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

          {/* Nearby Cities — removed by design */}

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
                <Link href="/feature-your-bar" className="directory-cta-btn">List Your Bar</Link>
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
      {bars.filter(hasSlug).map(bar => (
        <DirectoryBarCard key={bar.id} bar={bar} />
      ))}
    </div>
  );
}

