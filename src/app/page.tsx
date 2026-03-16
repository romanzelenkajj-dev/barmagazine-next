import Link from 'next/link';
import { format } from 'date-fns';
import { getPosts, getPostsByCategory, getFeaturedImageUrl, getPostCategories, stripHtml, truncateAtWord, estimateReadTime } from '@/lib/wordpress';
import { formatCardTitle } from '@/lib/utils';

export const revalidate = 300;

export default async function HomePage() {
  const [result, barsResult] = await Promise.all([
    getPosts(1, 7),
    getPostsByCategory('bars', 1, 6),
  ]);
  const posts = result.data;
  const barsPosts = barsResult.data;

  const hero = posts[0];
  const cardPosts = posts.slice(1, 7);

  return (
    <>
      {/* A) SINGLE FULL-WIDTH HERO */}
      {hero && (
        <Link href={`/${hero.slug}`} className="hero">
          {getFeaturedImageUrl(hero, 'full') && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={getFeaturedImageUrl(hero, 'full')!}
              alt={stripHtml(hero.title.rendered)}
            />
          )}
          <div className="hero-overlay" />
          <div className="hero-content">
            <span className="hero-cat">
              {getPostCategories(hero)[0]?.name || 'Latest'}
            </span>
            <h1 className="hero-title" dangerouslySetInnerHTML={{ __html: hero.title.rendered }} />
            <p className="hero-excerpt">
              {truncateAtWord(stripHtml(hero.excerpt.rendered), 160)}
            </p>
            <span className="hero-read">
              Read Article &rarr;
            </span>
          </div>
        </Link>
      )}

      {/* B) SECTION BAR */}
      <div className="section-bar">
        <h2>Featured Content You Might Like</h2>
        <select className="filter-select" aria-label="Filter content">
          <option>All Categories</option>
          <option>Bars</option>
          <option>People</option>
          <option>Cocktails</option>
          <option>Awards</option>
          <option>Brands</option>
          <option>Events</option>
        </select>
      </div>

      {/* C) MIXED CARD GRID */}
      <div className="cards-grid">
        {cardPosts.map((post, i) => {
          const isBleed = i % 3 === 1;
          const cat = getPostCategories(post)[0];
          const imgUrl = getFeaturedImageUrl(post, 'large');
          const formattedTitle = formatCardTitle(post.title.rendered);
          const excerpt = truncateAtWord(stripHtml(post.excerpt.rendered), 120);
          const dateStr = format(new Date(post.date), 'MMM d, yyyy');
          const readTime = estimateReadTime(post.content.rendered);

          if (isBleed) {
            return (
              <Link key={post.id} href={`/${post.slug}`} className="card card-bleed">
                {imgUrl && (
                  <div className="card-bleed-bg">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={imgUrl} alt={stripHtml(post.title.rendered)} />
                  </div>
                )}
                <div className="card-bleed-overlay" />
                <div className="card-top">
                  <span className="card-tag">{cat?.name || 'Latest'}</span>
                </div>
                <div className="card-body">
                  <h3 dangerouslySetInnerHTML={{ __html: formattedTitle }} />
                  <p className="card-excerpt">{excerpt}</p>
                  <div className="card-meta">
                    <span>{dateStr}</span>
                    <span className="dot" />
                    <span>{readTime} min read</span>
                  </div>
                </div>
              </Link>
            );
          }

          return (
            <Link key={post.id} href={`/${post.slug}`} className="card">
              {imgUrl && (
                <div className="card-img-top">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={imgUrl} alt={stripHtml(post.title.rendered)} />
                </div>
              )}
              <div className="card-body">
                <div className="card-tags">
                  <span className="card-tag">{cat?.name || 'Latest'}</span>
                </div>
                <h3 dangerouslySetInnerHTML={{ __html: formattedTitle }} />
                <p className="card-excerpt">{excerpt}</p>
                <div className="card-meta">
                  <span>{dateStr}</span>
                  <span className="dot" />
                  <span>{readTime} min read</span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* D) CTA BANNER */}
      <div className="cta-banner">
        <h2>Add Your Bar</h2>
        <p>Join the Bar Magazine directory and reach thousands of cocktail enthusiasts and industry professionals.</p>
        <div className="cta-form">
          <input type="text" className="cta-input" placeholder="Your bar name" />
          <button className="cta-submit">Get Listed</button>
        </div>
      </div>

      {/* E) FEATURED BARS (from WP bars category) */}
      {barsPosts.length > 0 && (
        <div className="bars-wrapper">
          <div className="section-bar">
            <h2>Featured Bars</h2>
            <Link href="/category/bars" className="section-link">View All &rarr;</Link>
          </div>
          <div className="bars-grid-scroll" style={{ marginTop: 16 }}>
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
                  <h4 dangerouslySetInnerHTML={{ __html: post.title.rendered }} />
                  <span className="bar-city">{format(new Date(post.date), 'MMM d, yyyy')}</span>
                  <br />
                  <span className="bar-link">Read more</span>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </>
  );
}
