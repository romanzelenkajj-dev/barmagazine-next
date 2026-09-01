import { HighlightedText } from '@/components/HighlightedText';
import { BarPlaceholder } from '@/components/BarPlaceholder';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';
import { formatBarType } from '@/lib/utils';
import { hasSlug, safeHref } from '@/lib/safe-slug';
import {
  getSeoCities,
  resolveSeoCity,
  getSeoCityBars,
  typePageBySlug,
  composeTypeIntro,
  composeTypeDescription,
  MIN_TYPE_BARS,
} from '@/lib/seo-cities';

/**
 * /best-bars/[city]/[type] — type-by-city SEO pages ("best speakeasies in
 * Tokyo"). Generated only where the city itself qualifies AND the type has
 * MIN_TYPE_BARS active venues there; everything else 404s so no thin
 * doorway page can exist. URLs use plural type slugs (cocktail-bars,
 * speakeasies, rooftop-bars, hotel-bars, pubs) and are canonical.
 */

export const revalidate = 3600;
export const dynamicParams = true;

const SITE_URL = 'https://barmagazine.com';

export async function generateStaticParams() {
  const cities = await getSeoCities();
  return cities.flatMap(c => c.typeSlugs.map(t => ({ city: c.slug, type: t.slug })));
}

async function resolveCombo(citySlug: string, typeSlug: string) {
  const t = typePageBySlug(typeSlug);
  if (!t) return null;
  const city = await resolveSeoCity(citySlug);
  if (!city) return null;
  const entry = city.typeSlugs.find(x => x.slug === typeSlug);
  if (!entry || entry.count < MIN_TYPE_BARS) return null;
  return { city, t, count: entry.count };
}

export async function generateMetadata({ params }: { params: { city: string; type: string } }): Promise<Metadata> {
  const combo = await resolveCombo(params.city, params.type);
  if (!combo) return {};
  const bars = await getSeoCityBars(combo.city.city, combo.t.type);
  const topName = bars[0]?.name ?? null;
  const year = new Date().getFullYear();
  const title = `The Best ${combo.t.plural
    .split(' ')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')} in ${combo.city.city} (${year})`;
  const description = composeTypeDescription(combo.city, combo.t, bars.length, topName);
  const url = `${SITE_URL}/best-bars/${params.city}/${params.type}`;
  return {
    title,
    description,
    alternates: { canonical: url },
    robots: { index: true, follow: true },
    openGraph: {
      title: `${title} | BarMagazine`,
      description,
      type: 'website',
      url,
      siteName: 'BarMagazine',
    },
  };
}

export default async function BestTypeCityPage({ params }: { params: { city: string; type: string } }) {
  const combo = await resolveCombo(params.city, params.type);
  if (!combo) notFound();

  const { city, t } = combo;
  const bars = await getSeoCityBars(city.city, t.type);
  if (bars.length < MIN_TYPE_BARS) notFound();

  const year = new Date().getFullYear();
  const intro = composeTypeIntro(city, t, combo.count, bars[0]?.name ?? null, bars.length);
  const siblingTypes = city.typeSlugs.filter(x => x.slug !== t.slug);
  const url = `${SITE_URL}/best-bars/${params.city}/${params.type}`;

  const itemListLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: `The Best ${t.plural} in ${city.city}`,
    description: composeTypeDescription(city, t, bars.length, bars[0]?.name ?? null),
    numberOfItems: bars.length,
    itemListOrder: 'https://schema.org/ItemListUnordered',
    itemListElement: bars.map((bar, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      item: {
        '@type': 'BarOrNightclub',
        name: bar.name,
        url: `${SITE_URL}/bars/${bar.slug}`,
        ...(bar.address && {
          address: { '@type': 'PostalAddress', streetAddress: bar.address, addressLocality: bar.city, addressCountry: bar.country },
        }),
        ...(bar.short_excerpt && { description: bar.short_excerpt }),
      },
    })),
  };

  const breadcrumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
      { '@type': 'ListItem', position: 2, name: 'Bar Directory', item: `${SITE_URL}/bars` },
      { '@type': 'ListItem', position: 3, name: `Best Bars in ${city.city}`, item: `${SITE_URL}/best-bars/${params.city}` },
      { '@type': 'ListItem', position: 4, name: `Best ${t.plural} in ${city.city}`, item: url },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />

      <div className="best-bars-page">
        <header className="best-bars-hero">
          <span className="best-bars-kicker">BarMagazine&rsquo;s pick &middot; {year}</span>
          <h1>The {bars.length} Best {t.plural
            .split(' ')
            .map(w => w.charAt(0).toUpperCase() + w.slice(1))
            .join(' ')} in {city.city}</h1>
          <p className="best-bars-intro">{intro}</p>
          <div className="best-bars-hero-links">
            <Link href={`/best-bars/${params.city}`} className="best-bars-hero-link best-bars-hero-link--primary">
              All the best bars in {city.city}
            </Link>
            <Link href={`/bars/city/${params.city}`} className="best-bars-hero-link">
              Browse every {city.city} bar
            </Link>
          </div>
        </header>

        <ol className="best-bars-list">
          {bars.filter(hasSlug).map((bar, i) => (
            <li key={bar.id} className="best-bars-item">
              <Link href={safeHref('/bars', bar.slug)} className="best-bars-card">
                <span className="best-bars-rank">{i + 1}</span>
                <div className="best-bars-visual">
                  {bar.photos && bar.photos.length > 0 ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={bar.photos[0]} alt={bar.name} loading={i < 2 ? 'eager' : 'lazy'} />
                  ) : (
                    <BarPlaceholder name={bar.name} type={bar.type} />
                  )}
                </div>
                <div className="best-bars-body">
                  <div className="best-bars-badges">
                    {bar.tier === 'top10' && <span className="bar-dir-badge-pill bar-dir-badge-pill--top10">&#9733; TOP 10</span>}
                    {bar.type && <span className="bar-dir-badge-pill bar-dir-badge-pill--type">{formatBarType(bar.type)}</span>}
                  </div>
                  <h2 className="best-bars-name">{bar.name}</h2>
                  {(bar.description || bar.short_excerpt) && (
                    <p className="best-bars-desc"><HighlightedText text={bar.description || bar.short_excerpt || ''} /></p>
                  )}
                  {bar.menu_highlights && bar.menu_highlights.length > 0 && (
                    <p className="best-bars-serve">
                      <strong>Order this:</strong> {bar.menu_highlights[0].name}
                      {bar.menu_highlights[0].ingredients ? ` (${bar.menu_highlights[0].ingredients})` : ''}
                    </p>
                  )}
                  <div className="best-bars-meta">
                    {bar.address && <span className="best-bars-address">{bar.address}</span>}
                    {bar.opening_hours && <span className="best-bars-hours">{bar.opening_hours}</span>}
                  </div>
                  <span className="best-bars-more">
                    Full profile
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
                  </span>
                </div>
              </Link>
            </li>
          ))}
        </ol>

        <div className="best-bars-outro">
          <h2>More of {city.city}</h2>
          <p>
            These are the {t.plural} specifically. The full {city.city} guide ranks the best bars of every
            style, and the directory lists all {city.count} with a map and filters.
          </p>
          <Link href={`/best-bars/${params.city}`} className="bar-v2-btn bar-v2-btn--primary">
            Best bars in {city.city}
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
          </Link>
        </div>

        {siblingTypes.length > 0 && (
          <div className="best-bars-cities">
            <h2>{city.city} by bar style</h2>
            <div className="best-bars-cities-grid">
              {siblingTypes.map(x => (
                <Link key={x.slug} href={`/best-bars/${params.city}/${x.slug}`} className="best-bars-city-link">
                  Best {x.plural}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
