import Link from 'next/link';
import { getPosts, getPostsByCategory, getFeaturedImageUrl, getPostCategories, stripHtml, truncateAtWord, estimateReadTime } from '@/lib/wordpress';
import { formatCardTitle } from '@/lib/utils';

export const revalidate = 300;

export default async function HomePage() {
  const [result, barsResult] = await Promise.all([
    getPosts(1, 7),
    getPostsByCategory('bars', 1, 6),
  ]);
  const posts = result.data;
  // Filter out articles/events from bars category — only keep actual bar profiles
  const articleSlugs = new Set([
    'ibg-flair-challenge-2026-highlights-indias-rising-talent',
    'top-10-bars-in-dubai-2025',
    'inside-pop-city-x-pony-full-menu-experience',
    'tres-monos-named-best-bar-in-south-america',
    'diageo-tales-of-the-cocktail-unite-for-world-class-u-s',
    'bar-leone-shanghai-opens-this-november',
    'athens-bar-show-2025-celebrates-15-years-of-innovation',
    'mr-lyan-brings-seed-library-to-new-york-this-fall',
    'bar-leone-expands-with-second-location-in-shanghai',
    'best-bars-in-southeast-asia',
    'global-bar-exchange-2025-26-by-woodford-reserve',
    'nz-bar-con-2025-brings-global-energy-to-auckland',
    'the-opposites-celebrates-one-year-in-hong-kong',
    'world-class-global-final-2025-heads-to-toronto',
    'montana-by-antinori-caporale-opens-in-hong-kong',
    'zest-seoul-takes-over-balis-sunset-park-rooftop',
    'almanac-brings-slow-drinks-to-philadelphia',
    'advocatuur-opens-at-rosewood-amsterdam',
    'the-pinnacle-guide-sets-a-global-standard-for-cocktail-bars',
    'herbs-taverne-to-open-in-sydney-with-a-bold-take-on-negronis',
    'montana-bar-to-open-in-hong-kong-in-summer-2025',
    'global-cocktail-menu-database-empowers-bartenders-worldwide',
    'rhum-fest-paris-2025',
    'the-return-of-the-blue-cocktail-era',
    'zurich-bar-show-2025-spotlight-on-swiss-bar-culture',
    'american-craft-spirits-convention-2025-heads-to-tucson',
    'camp-runamok-bartender-retreat-in-bourbon-country',
    'arizona-cocktail-weekend-2025',
    'diageo-reveals-2025-socialising-trends',
    'enter-the-2025-cointreau-margarita-challenge',
    'campari-academy-brings-hands-on-education-to-bcb-berlin-2024',
    'iain-mcpherson-named-altos-bartenders-bartender-2024',
    'lillet-and-emily-in-paris',
    'bar-world-100-2024-a-toast-to-global-mixology-leaders',
    'celebrating-national-bourbon-day-on-june-14th',
    'bcb-bar-convent-brooklyn',
    'world-class-global-finals',
    'signature-ice',
    'bars-without-bartenders',
    'eco-totes',
    'enter-the-usbg-prosecco-doc-national-cocktail-competition',
    'the-bols-cocktail-battle-2024',
    'shake-it-up-las-vegas',
    'the-seychelles-bar-sustainability-project',
    'danico-bars-xplorer-series',
    'visiting-bar-luminary-series',
    'dante-in-beverly-hills',
    'bcb-heads-to-singapore',
    'the-first-krug-ambassadorship-in-the-region',
    'cocktail-balance',
    'adrian-michalcik',
    'mr-black-crafting-the-perfect-coffee-liqueur-blend',
    'advanced-bartending-with-the-cocktail-balance-2-0-by-stanisl',
    'room-207-is-new-yorks-next-cocktail-tourism-destination',
  ]);
  const barsPosts = barsResult.data.filter((p: any) => !articleSlugs.has(p.slug));

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
            <h1 className="hero-title" dangerouslySetInnerHTML={{ __html: formatCardTitle(hero.title.rendered, hero.meta?.bold_title) }} />
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
          const formattedTitle = formatCardTitle(post.title.rendered, post.meta?.bold_title);
          const excerpt = truncateAtWord(stripHtml(post.excerpt.rendered), 120);
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
        <Link href="/add-your-bar" className="cta-submit" style={{ display: 'inline-block', textDecoration: 'none' }}>Get Listed</Link>
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
    </>
  );
}
