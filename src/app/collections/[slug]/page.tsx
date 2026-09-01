import { HighlightedText } from '@/components/HighlightedText';
import { BarPlaceholder } from '@/components/BarPlaceholder';
import { AccoladeBadges } from '@/components/AccoladeBadges';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';
import { displayType } from '@/lib/bar-type';
import { hasSlug, safeHref } from '@/lib/safe-slug';
import { supabase } from '@/lib/supabase';
import type { Bar } from '@/lib/supabase';
import { COLLECTIONS, collectionBySlug } from '@/lib/collections';

/**
 * /collections/[slug] — partner group pages ("the bars of Conrad Hotels &
 * Resorts"), driven entirely by the config in src/lib/collections.ts. Styled
 * with the best-bars classes so it reads as a native city-guide sibling.
 *
 * NOINDEX for now: these are sales collateral that goes public per-partner
 * when a deal signs; until then they must not leak into search.
 */

export const revalidate = 3600;
export const dynamicParams = false;

const SITE_URL = 'https://barmagazine.com';

export async function generateStaticParams() {
  return COLLECTIONS.map(c => ({ slug: c.slug }));
}

async function collectionBars(barSlugs: string[]): Promise<Bar[]> {
  const { data, error } = await supabase
    .from('bars')
    .select('*')
    .eq('is_active', true)
    .in('slug', barSlugs);
  if (error || !data) return [];
  // Config order is display order.
  const rows = data as Bar[];
  return barSlugs
    .map(slug => rows.find(b => b.slug === slug))
    .filter((b): b is Bar => !!b);
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const collection = collectionBySlug(params.slug);
  if (!collection) return {};
  return {
    title: `The Bars of ${collection.name} | BarMagazine`,
    description: collection.intro.slice(0, 160),
    robots: { index: false, follow: true },
  };
}

export default async function CollectionPage({ params }: { params: { slug: string } }) {
  const collection = collectionBySlug(params.slug);
  if (!collection) notFound();

  const bars = await collectionBars(collection.barSlugs);
  if (bars.length === 0) notFound();

  const breadcrumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
      { '@type': 'ListItem', position: 2, name: 'Bar Directory', item: `${SITE_URL}/bars` },
      { '@type': 'ListItem', position: 3, name: collection.name, item: `${SITE_URL}/collections/${collection.slug}` },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />

      <div className="best-bars-page">
        <header className="best-bars-hero">
          <span className="best-bars-kicker">Partner collection</span>
          <h1>The Bars of {collection.name}</h1>
          {collection.heroImage && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={collection.heroImage}
              alt={collection.name}
              style={{ width: '100%', borderRadius: 12, margin: '18px 0 6px' }}
            />
          )}
          <p className="best-bars-intro">{collection.intro}</p>
        </header>

        <ol className="best-bars-list">
          {bars.filter(hasSlug).map((bar, i) => (
            <li key={bar.id} className="best-bars-item">
              <Link href={safeHref('/bars', bar.slug)} className="best-bars-card">
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
                    {displayType(bar) && <span className="bar-dir-badge-pill bar-dir-badge-pill--type">{displayType(bar)}</span>}
                  </div>
                  <h2 className="best-bars-name">{bar.name}</h2>
                  <AccoladeBadges accolades={bar.accolades} limit={3} />
                  {(bar.description || bar.short_excerpt) && (
                    <p className="best-bars-desc"><HighlightedText text={bar.description || bar.short_excerpt || ''} /></p>
                  )}
                  <div className="best-bars-meta">
                    {bar.address && <span className="best-bars-address">{bar.address}</span>}
                    {bar.city && <span className="best-bars-hours">{bar.city}, {bar.country}</span>}
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
          <h2>More from the directory</h2>
          <p>
            Every bar here is independently listed in the BarMagazine directory, with
            addresses, opening hours and the signature drinks worth ordering.
          </p>
          <Link href="/bars" className="bar-v2-btn bar-v2-btn--primary">
            Browse all bars
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
          </Link>
        </div>
      </div>
    </>
  );
}
