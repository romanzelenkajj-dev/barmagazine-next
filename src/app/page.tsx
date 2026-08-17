import Link from 'next/link';
import { getPosts, getPostsByCategory, getFeaturedImageUrl, getFeaturedImageData, getPostCategories } from '@/lib/wordpress';
import { formatCardTitle, cleanTitle } from '@/lib/utils';
import { NewsletterForm } from '@/components/NewsletterForm';
import { HomeCategoryGrid } from '@/components/HomeCategoryGrid';
import { FeaturedBarsDeck } from '@/components/FeaturedBarsDeck';
import { getBarArticleSlugs, getBars } from '@/lib/supabase';
import { Top10Ticker } from '@/components/Top10Ticker';
import { hasSlug, safeHref } from '@/lib/safe-slug';
export const revalidate = 300;

const CATEGORY_SLUGS = ['bars', 'people', 'cocktails', 'awards', 'brands', 'events'] as const;

export default async function HomePage() {
  // Fetch all data in parallel: latest posts, bars for Featured Bars, all 6 category sets.
  // We fetch 1 extra per set so the grid can filter out the hero article client-side
  // and still render the full 6-card count.
  const [result, barsResult, barArticleSlugs, top10Result, ...categoryResults] = await Promise.all([
    getPosts(1, 16), // extra so the grid stays full after hero + deck dedupe
    getPostsByCategory('bars', 1, 30), // fetch more so we have enough after filtering
    getBarArticleSlugs(),
    getBars({ tier: 'top10', perPage: 40 }).catch(() => ({ bars: [] })),
    // 'bars' fetches extra so its tab stays populated after deck dedupe
    ...CATEGORY_SLUGS.map(slug => getPostsByCategory(slug, 1, slug === 'bars' ? 18 : 7)),
  ]);
  const top10Bars = (top10Result.bars || []).map((b: { name: string; city: string; slug: string }) => ({
    name: b.name,
    city: b.city,
    slug: b.slug,
  }));

  const posts = result.data.filter(hasSlug);
  // Only show bar articles that have a matching listing in the Bar Directory
  const allBarsPosts = barsResult.data;
  const barsPosts = allBarsPosts
    .filter(hasSlug)
    .filter((post: { slug: string }) => barArticleSlugs.has(post.slug))
    .slice(0, 12);

  // Deck posts are selected FIRST so every other homepage list can exclude
  // them — an article shown as a Featured Bars card must not repeat below.
  const deckPosts = barsPosts.slice(0, 8);
  const deckIds = new Set(deckPosts.map((p: { id: number }) => p.id));

  const hero = posts[0];
  const cardPosts = posts
    .slice(1)
    .filter((p: { id: number }) => !deckIds.has(p.id))
    .slice(0, 7);
  const heroImgFull = hero ? getFeaturedImageData(hero, 'full') : null;
  const heroImgMedium = hero ? getFeaturedImageData(hero, 'medium_large') : null;
  const heroImgLarge = hero ? getFeaturedImageData(hero, 'large') : null;

  // Build pre-fetched category map: { bars: [...], people: [...], ... }
  // Note: categoryResults starts at index 0 of the spread (after result, barsResult, citiesData)
  const categoryData: Record<string, unknown[]> = {};
  CATEGORY_SLUGS.forEach((slug, i) => {
    categoryData[slug] = categoryResults[i].data.filter(
      (p: { id: number }) => !deckIds.has(p.id),
    );
  });

  return (
    <>
      {/* A) TWO-COLUMN HERO */}
      {hero && (
        <section className="hero">
          {/* Left 1/3 \u2014 title + CTA on white */}
          <div className="hero-title-col">
            {(() => { const cats = getPostCategories(hero); return cats[0] ? <span className="hero-tag">{cats[0].name}</span> : null; })()}
            <h1 className="hero-title" dangerouslySetInnerHTML={{ __html: formatCardTitle(hero.title.rendered, hero.meta?.bold_title) }} />
            <Link href={safeHref('/', hero.slug)} className="hero-btn">
              Read the Story
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
            </Link>
          </div>

          {/* Right 2/3 \u2014 featured image */}
          <Link href={safeHref('/', hero.slug)} className="hero-image-col">
            {heroImgFull && (
              // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
              <img
                src={heroImgFull.url}
                srcSet={[
                  heroImgMedium && `${heroImgMedium.url} ${heroImgMedium.width}w`,
                  heroImgLarge && `${heroImgLarge.url} ${heroImgLarge.width}w`,
                  `${heroImgFull.url} ${heroImgFull.width}w`,
                ].filter(Boolean).join(', ')}
                sizes="60vw"
                alt={cleanTitle(hero.title.rendered)}
                width={heroImgFull.width}
                height={heroImgFull.height}
                // @ts-expect-error fetchPriority is valid HTML
                fetchpriority="high"
                decoding="sync"
                loading="eager"
              />
            )}
          </Link>
        </section>
      )}

      {/* B) TOP 10 BARS RUNNING TICKER — right under the hero: bar discovery is the core product */}
      <Top10Ticker bars={top10Bars} />

      {/* C) FEATURED BARS SPLIT SECTION.
          Desktop: two columns - left stacks the "Want to add your bar?" CTA
          and the "Stay in the Mix" newsletter; right stacks the swipe deck
          and the Flavour Blaster ad (no dead space around the deck).
          Mobile: single column - the deck comes first on the bare background,
          CTA / newsletter / ad follow below it. */}
      {barsPosts.length > 0 && (
        <div className="home-split">
          <div className="home-split-side">
            <div className="cta-banner">
              <h2>Want to add your bar?</h2>
              <p>Join the BarMagazine directory and reach thousands of cocktail enthusiasts and industry professionals.</p>
              <Link href="/feature-your-bar" className="cta-submit" style={{ display: 'inline-block', textDecoration: 'none' }}>Get Listed</Link>
            </div>
            <div className="home-newsletter">
              <h2>Stay in the Mix</h2>
              <p>Get the latest cocktail trends, bar openings, and industry insights delivered to your inbox.</p>
              <NewsletterForm className="newsletter-form" />
            </div>
          </div>
          <div className="home-split-main">
            <FeaturedBarsDeck
              cards={deckPosts
                .filter(hasSlug)
                .map(post => ({
                  href: safeHref('/', post.slug),
                  title: cleanTitle(post.title.rendered),
                  img:
                    getFeaturedImageUrl(post, 'medium_large') ||
                    getFeaturedImageUrl(post, 'large') ||
                    null,
                  tag: 'Featured bar',
                }))}
            />
            <a href="https://flavourblaster.com/BARMAGAZINE" target="_blank" rel="noopener noreferrer sponsored" className="cta-ad">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/banners/flavour-blaster.jpg" alt="Flavour Blaster" width={1026} height={1026} loading="lazy" />
            </a>
          </div>
        </div>
      )}

      {/* D) SECTION BAR + MIXED CARD GRID - instant category switching */}
      <HomeCategoryGrid
        initialPosts={JSON.stringify(cardPosts)}
        categoryData={JSON.stringify(categoryData)}
        heroId={hero?.id}
      />
    </>
  );
}

