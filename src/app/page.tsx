import Link from 'next/link';
import { getPosts, getPostsByCategory, getFeaturedImageUrl, getFeaturedImageData, stripHtml, getPostCategories } from '@/lib/wordpress';
import { formatCardTitle, toUrlSlug } from '@/lib/utils';
import { NewsletterForm } from '@/components/NewsletterForm';
import { HomeCategoryGrid } from '@/components/HomeCategoryGrid';
import { getCitiesWithCounts } from '@/lib/supabase';

export const revalidate = 300;

const CATEGORY_SLUGS = ['bars', 'people', 'cocktails', 'awards-events', 'brands', 'events'] as const;

// Top cities to feature in the Browse by City section on the homepage.
// These are the highest-traffic commercial queries for the Bar Directory.
const FEATURED_CITIES = [
  'New York', 'London', 'Tokyo', 'Paris', 'Singapore',
  'Hong Kong', 'Los Angeles', 'Miami', 'Barcelona', 'Berlin',
  'Sydney', 'Dubai', 'Mexico City', 'Chicago', 'San Francisco',
  'Las Vegas', 'New Orleans', 'Austin', 'Denver', 'Seattle',
  'Toronto', 'Melbourne', 'Amsterdam', 'Bangkok', 'Seoul',
];

export default async function HomePage() {
  // Fetch all data in parallel: latest posts, bars for Featured Bars, all 6 category sets, and city counts
  const [result, barsResult, citiesData, ...categoryResults] = await Promise.all([
    getPosts(1, 7),
    getPostsByCategory('bars', 1, 12),
    getCitiesWithCounts(),
    ...CATEGORY_SLUGS.map(slug => getPostsByCategory(slug, 1, 6)),
  ]);

  // Build city list: prefer FEATURED_CITIES order, fall back to top cities by bar count
  const cityMap = new Map(citiesData.map(c => [c.city, c]));
  const featuredCityData = FEATURED_CITIES
    .map(name => cityMap.get(name))
    .filter(Boolean) as { city: string; count: number; country: string }[];
  // Add any top cities not in the featured list (up to 25 total)
  const extraCities = citiesData
    .filter(c => !FEATURED_CITIES.includes(c.city))
    .slice(0, Math.max(0, 25 - featuredCityData.length));
  const homepageCities = [...featuredCityData, ...extraCities].slice(0, 25);
  const posts = result.data;
  const barsPosts = barsResult.data;

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

      {/* E) BROWSE BY CITY — internal links to all 25 priority city pages */}
      {homepageCities.length > 0 && (
        <div className="city-directory-section">
          <div className="section-bar">
            <h2>Browse Bars by City</h2>
            <Link href="/bars" className="section-link">View All Cities &rarr;</Link>
          </div>
          <div className="city-directory-grid">
            {homepageCities.map(({ city, count }) => (
              <Link
                key={city}
                href={`/bars/city/${toUrlSlug(city)}`}
                className="city-directory-card"
              >
                <span className="city-directory-name">{city}</span>
                <span className="city-directory-count">{count} {count === 1 ? 'bar' : 'bars'}</span>
              </Link>
            ))}
          </div>
        </div>
      )}

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

      {/* F) NEWSLETTER BANNER */}
      <div className="newsletter-strip">
        <h2>Stay in the Mix</h2>
        <p>Get the latest cocktail trends, bar openings, and industry insights delivered to your inbox.</p>
        <NewsletterForm className="newsletter-form" />
      </div>
    </>
  );
}

