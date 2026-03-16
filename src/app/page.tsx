import Link from 'next/link';
import { format } from 'date-fns';
import { getPosts, getPostsByCategory, getFeaturedImageUrl, getPostCategories, stripHtml, estimateReadTime } from '@/lib/wordpress';
import { ArticleCard } from '@/components/ArticleCard';

export const revalidate = 300;

export default async function HomePage() {
  const [latestResult, barsResult, cocktailsResult] = await Promise.all([
    getPosts(1, 9),
    getPostsByCategory('bars', 1, 6),
    getPostsByCategory('cocktails', 1, 6),
  ]);

  const latest = latestResult.data;
  const bars = barsResult.data;
  const cocktails = cocktailsResult.data;

  // Hero: first 3 posts
  const heroMain = latest[0];
  const heroSide = latest.slice(1, 3);
  const gridPosts = latest.slice(3, 9);

  return (
    <>
      {/* HERO SECTION */}
      {heroMain && (
        <div className="hero-grid">
          <Link href={`/${heroMain.slug}`} className="hero-card hero-main" style={{ minHeight: 480 }}>
            {getFeaturedImageUrl(heroMain, 'full') && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={getFeaturedImageUrl(heroMain, 'full')!}
                alt={stripHtml(heroMain.title.rendered)}
                style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
              />
            )}
            <div className="hero-overlay" />
            <div className="hero-content">
              <span className="hero-cat">
                {getPostCategories(heroMain)[0]?.name || 'Latest'}
              </span>
              <h1 className="hero-title" dangerouslySetInnerHTML={{ __html: heroMain.title.rendered }} />
              <div className="hero-meta">
                <span>{format(new Date(heroMain.date), 'MMM d, yyyy')}</span>
                <span className="dot" />
                <span>{estimateReadTime(heroMain.content.rendered)} min read</span>
              </div>
            </div>
          </Link>

          <div className="hero-side">
            {heroSide.map(post => (
              <Link key={post.id} href={`/${post.slug}`} className="hero-card" style={{ position: 'relative' }}>
                {getFeaturedImageUrl(post, 'large') && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={getFeaturedImageUrl(post, 'large')!}
                    alt={stripHtml(post.title.rendered)}
                    style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                )}
                <div className="hero-overlay" />
                <div className="hero-content">
                  <span className="hero-cat">
                    {getPostCategories(post)[0]?.name || 'Latest'}
                  </span>
                  <h2 className="hero-title" dangerouslySetInnerHTML={{ __html: post.title.rendered }} />
                  <div className="hero-meta">
                    <span>{format(new Date(post.date), 'MMM d, yyyy')}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* LATEST ARTICLES */}
      <div className="section-header">
        <h2 className="section-title">Latest Articles</h2>
        <Link href="/category/features" className="section-link">View All &rarr;</Link>
      </div>
      <div className="article-grid">
        {gridPosts.map(post => (
          <ArticleCard key={post.id} post={post} />
        ))}
      </div>

      {/* BARS SECTION */}
      {bars.length > 0 && (
        <>
          <div className="section-header">
            <h2 className="section-title">Bars</h2>
            <Link href="/category/bars" className="section-link">View All &rarr;</Link>
          </div>
          <div className="article-grid">
            {bars.slice(0, 3).map(post => (
              <ArticleCard key={post.id} post={post} />
            ))}
          </div>
        </>
      )}

      {/* NEWSLETTER */}
      <div className="newsletter-strip">
        <h2>Stay in the Mix</h2>
        <p>Get the latest cocktail trends, bar openings, and industry insights delivered weekly.</p>
        <div className="newsletter-form">
          <input type="email" placeholder="Your email address" />
          <button>Subscribe</button>
        </div>
      </div>

      {/* COCKTAILS SECTION */}
      {cocktails.length > 0 && (
        <>
          <div className="section-header">
            <h2 className="section-title">Cocktails</h2>
            <Link href="/category/cocktails" className="section-link">View All &rarr;</Link>
          </div>
          <div className="article-grid">
            {cocktails.slice(0, 3).map(post => (
              <ArticleCard key={post.id} post={post} />
            ))}
          </div>
        </>
      )}
    </>
  );
}
