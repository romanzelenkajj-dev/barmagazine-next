import { recordLine } from '@/lib/record-line';
import Link from 'next/link';
import { DirectoryBarCard } from './DirectoryBarCard';
import type { Bar } from '@/lib/supabase';
import type { SeoCity } from '@/lib/seo-cities';
import {
  type RegionCombo,
  composeRegionDescription,
  regionCityTypeLinks,
  regionHref,
  countryRegion,
} from '@/lib/seo-regions';
import { toUrlSlug } from '@/lib/utils';

const SITE_URL = 'https://barmagazine.com';

const titleCase = (s: string) => s.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

/**
 * The country-by-type and US-state-by-type page body (Roman, 2026-09-16):
 * the city-by-type layout with the directory card grid, links down to the
 * city-by-type pages inside the region, sibling types, and for a country
 * page the state pages inside it. Both routes render this.
 */
export function RegionTypePage({
  combo,
  bars,
  cities,
  siblings,
  statePages,
}: {
  combo: RegionCombo;
  bars: Bar[];
  cities: SeoCity[];
  /** Other type pages for the same region. */
  siblings: RegionCombo[];
  /** For a country page: the state-by-type pages of the same type inside it. */
  statePages: RegionCombo[];
}) {
  const { region, type: t } = combo;
  const year = new Date().getFullYear();
  const url = `${SITE_URL}${regionHref(region, t.slug)}`;
  const cityLinks = regionCityTypeLinks(cities, combo);
  const topName = bars[0]?.name ?? null;
  // The band line names no bar (task 114): counts and records only. The
  // hand-written region intros stay in src/lib/region-intros.ts, unused by
  // the band.
  const intro = recordLine(bars, t.plural);
  const heading = `Best ${titleCase(t.plural)} in ${region.displayName}`;
  const countryPage = `/bars/country/${toUrlSlug(region.country)}`;
  const countryCombo = region.kind === 'us-state' ? { region: countryRegion(region.country), type: t } : null;

  const itemListLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: heading,
    description: composeRegionDescription(combo, bars),
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

  const crumbs = [
    { name: 'Home', item: SITE_URL },
    { name: 'Bar Directory', item: `${SITE_URL}/bars` },
    { name: region.country, item: `${SITE_URL}${countryPage}` },
    ...(region.kind === 'us-state' ? [{ name: region.name, item: url }] : []),
    { name: titleCase(t.plural), item: url },
  ];
  const breadcrumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: crumbs.map((c, i) => ({ '@type': 'ListItem', position: i + 1, name: c.name, item: c.item })),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />

      <div className="best-bars-page">
        <header className="best-bars-hero">
          <span className="best-bars-kicker">BarMagazine&rsquo;s pick &middot; {year}</span>
          <h1>{heading}</h1>
          {intro && <p className="best-bars-intro">{intro}</p>}
          <div className="best-bars-hero-links">
            {countryCombo && (
              <Link href={regionHref(countryCombo.region, t.slug)} className="best-bars-hero-link best-bars-hero-link--primary">
                Best {t.plural} in {countryCombo.region.displayName}
              </Link>
            )}
            <Link href={countryPage} className="best-bars-hero-link">
              Browse every bar in {region.displayName}
            </Link>
          </div>
        </header>

        <div className="directory-grid">
          {bars.map(bar => (
            <DirectoryBarCard key={bar.id} bar={bar} />
          ))}
        </div>

        {cityLinks.length > 0 && (
          <div className="best-bars-cities">
            <h2>{titleCase(t.plural)} by city</h2>
            <div className="best-bars-cities-grid">
              {cityLinks.map(c => (
                <Link key={c.slug} href={`/best-bars/${c.slug}/${t.slug}`} className="best-bars-city-link">
                  {c.city} ({c.count})
                </Link>
              ))}
            </div>
          </div>
        )}

        {statePages.length > 0 && (
          <div className="best-bars-cities">
            <h2>{titleCase(t.plural)} by state</h2>
            <div className="best-bars-cities-grid">
              {statePages.map(s => (
                <Link key={s.region.slug} href={regionHref(s.region, t.slug)} className="best-bars-city-link">
                  {s.region.name} ({s.count})
                </Link>
              ))}
            </div>
          </div>
        )}

        {siblings.length > 0 && (
          <div className="best-bars-cities">
            <h2>{region.displayName.charAt(0).toUpperCase() + region.displayName.slice(1)} by bar style</h2>
            <div className="best-bars-cities-grid">
              {siblings.map(s => (
                <Link key={s.type.slug} href={regionHref(region, s.type.slug)} className="best-bars-city-link">
                  Best {s.type.plural} ({s.count})
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
