import Link from 'next/link';
import { getPosts, getPostsByCategory, getFeaturedImageUrl, getFeaturedImageData, stripHtml, getPostCategories } from '@/lib/wordpress';
import { formatCardTitle } from '@/lib/utils';
import { NewsletterForm } from '@/components/NewsletterForm';
import { Top10FooterBlock } from '@/components/Top10FooterBlock';
import { HomeCategoryGrid } from '@/components/HomeCategoryGrid';
import { getBarArticleSlugs } from '@/lib/supabase';
export const revalidate = 300;

const CATEGORY_SLUGS = ['bars', 'people', 'cocktails', 'awards-events', 'brands', 'events'] as const;

export default async function HomePage() {
  // Fetch all data in parallel: latest posts, bars for Featured Bars, all 6 category sets
  const [result, barsResult, barArticleSlugs, ...categoryResults] = await Promise.all([
    getPosts(1, 7),
    getPostsByCategory('bars', 1, 30), // fetch more so we have enough after filtering
    getBarArticleSlugs(),
    ...CATEGORY_SLUGS.map(slug => getPostsByCategory(slug, 1, 6)),
  ]);

  const posts = result.data;
  // Only show bar articles that have a matching listing in the Bar Directory
  const allBarsPosts = barsResult.data;
  const barsPosts = allBarsPosts
    .filter((post: { slug: string }) => barArticleSlugs.has(post.slug))
    .slice(0, 12);

  const hero = posts[0];
  const cardPosts = posts.slice(1, 7);
  const heroImgFull = hero ? getFeaturedImageData(hero, 'full') : null;
  const heroImgMedium = hero ? getFeaturedImageData(hero, 'medium_large') : null;
  const heroImgLarge = hero ? getFeaturedImageData(hero, 'large') : null;

  // Build pre-fetched category map: { bars: [...], people: [...], ... }
  // Note: categoryResults starts at index 0 of the spread (after result, barsResult, citiesData)
  const categoryData: Record<string, unknown[]> = {};
  CATEGORY_SLUGS.forEach((slug, i) => {
    categoryData[slug] = categoryResults[i].data;
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
            <Link href={`/${hero.slug}`} className="hero-btn">
              Read the Story
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
            </Link>
          </div>

          {/* Right 2/3 \u2014 featured image */}
          <Link href={`/${hero.slug}`} className="hero-image-col">
            {heroImgFull && (
              // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
              <img
                src={heroImgFull.url}
                srcSet={[
                  heroImgMedium && `${heroImgMedium.url} ${heroImgMedium.width}w`,
                  heroImgLarge && `${heroImgLarge.url} ${heroImgLarge.width}w`,
                  `${heroImgFull.url} ${heroImgFull.width}w`,
                ].filter(Boolean).join(', ')}
                sizes="66vw"
                alt={stripHtml(hero.title.rendered)}
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

      {/* B) SECTION BAR + C) MIXED CARD GRID \u2014 instant category switching */}
      <HomeCategoryGrid
        initialPosts={JSON.stringify(cardPosts)}
        categoryData={JSON.stringify(categoryData)}
      />

      {/* D) CTA BANNER + AD */}
      <div className="cta-row">
        <div className="cta-banner">
          <h2>Want to add your bar?</h2>
          <p>Join the BarMagazine directory and reach thousands of cocktail enthusiasts and industry professionals.</p>
          <Link href="/claim-your-bar" className="cta-submit" style={{ display: 'inline-block', textDecoration: 'none' }}>Get Listed</Link>
        </div>
        <a href="https://flavourblaster.com/BARMAGAZINE" target="_blank" rel="noopener noreferrer sponsored" className="cta-ad">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/banners/flavour-blaster.jpg" alt="Flavour Blaster" width={1026} height={1026} />
        </a>
      </div>

      {/* Browse by City section removed — city links live in the Bar Directory sidebar */}

      {/* F) FEATURED BARS (from WP bars category) */}
      {barsPosts.length > 0 && (
        <div className="bars-wrapper">
          <div className="section-bar">
            <h2>Featured Bars</h2>
            <Link href="/category/bars" className="section-link">View All &rarr;</Link>
          </div>
          <div className="bars-grid-scroll">
            {barsPosts.map(post => {
              const imgUrl = getFeaturedImageUrl(post, 'medium_large') || getFeaturedImageUrl(post, 'large');
              return (
                <Link key={post.id} href={`/${post.slug}`} className="bar-card">
                  <div className="bar-img">
                    {imgUrl && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={imgUrl} alt={stripHtml(post.title.rendered)} />
                    )}
                  </div>
                  <h4 dangerouslySetInnerHTML={{ __html: formatCardTitle(post.title.rendered, post.meta?.bold_title) }} />

                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* F) NEWSLETTER + TOP 10 BANNER */}
      <div className="newsletter-top10-strip">
        <div className="newsletter-top10-left">
          <h2>Stay in the Mix</h2>
          <p>Get the latest cocktail trends, bar openings, and industry insights delivered to your inbox.</p>
          <NewsletterForm className="newsletter-form" />
        </div>
        <div className="newsletter-top10-right">
          <Top10FooterBlock />
        </div>
      </div>
    </>
  );
}

