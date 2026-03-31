import Link from 'next/link';
import { getPosts, getPostsByCategory, getFeaturedImageUrl, getFeaturedImageData, getPostCategories, stripHtml, truncateAtWord } from '@/lib/wordpress';
import { formatCardTitle } from '@/lib/utils';
import { NewsletterForm } from '@/components/NewsletterForm';
import { HomeCategoryGrid } from '@/components/HomeCategoryGrid';

export const revalidate = 300;

export default async function HomePage() {
  const [result, barsResult] = await Promise.all([
    getPosts(1, 7),
    getPostsByCategory('bars', 1, 12),
  ]);
  const posts = result.data;
  const barsPosts = barsResult.data;

  const hero = posts[0];
  const cardPosts = posts.slice(1, 7);
  const heroImgFull = hero ? getFeaturedImageData(hero, 'full') : null;
  const heroImgMedium = hero ? getFeaturedImageData(hero, 'medium_large') : null;
  const heroImgLarge = hero ? getFeaturedImageData(hero, 'large') : null;

  return (
    <>
      {/* A) SINGLE FULL-WIDTH HERO */}
      {hero && (
        <Link href={`/${hero.slug}`} className="hero">
          {heroImgFull && (
            // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
            <img
              src={heroImgFull.url}
              srcSet={[
                heroImgMedium && `${heroImgMedium.url} ${heroImgMedium.width}w`,
                heroImgLarge && `${heroImgLarge.url} ${heroImgLarge.width}w`,
                `${heroImgFull.url} ${heroImgFull.width}w`,
              ].filter(Boolean).join(', ')}
              sizes="100vw"
              alt={stripHtml(hero.title.rendered)}
              width={heroImgFull.width}
              height={heroImgFull.height}
              // @ts-expect-error fetchPriority is valid HTML
              fetchpriority="high"
              decoding="sync"
              loading="eager"
            />
          )}
          <div className="hero-overlay" />
          <span className="hero-cat">
            {getPostCategories(hero)[0]?.name || 'Latest'}
          </span>
          <div className="hero-content">
            <h1 className="hero-title" dangerouslySetInnerHTML={{ __html: formatCardTitle(hero.title.rendered, hero.meta?.bold_title) }} />
          </div>
        </Link>
      )}

      {/* B) SECTION BAR + C) MIXED CARD GRID — now with working category filter */}
      <HomeCategoryGrid initialPosts={JSON.stringify(cardPosts)} />

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

      {/* E) FEATURED BARS (from WP bars category) */}
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

      {/* F) NEWSLETTER BANNER */}
      <div className="newsletter-strip">
        <h2>Stay in the Mix</h2>
        <p>Get the latest cocktail trends, bar openings, and industry insights delivered to your inbox.</p>
        <NewsletterForm className="newsletter-form" />
      </div>
    </>
  );
}
