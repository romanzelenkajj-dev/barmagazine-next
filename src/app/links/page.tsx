import type { Metadata } from 'next';
import { getTop10SeriesLinks } from '@/lib/wordpress';

export const metadata: Metadata = {
  title: 'Links | BarMagazine',
  description: 'BarMagazine — Cocktails · Bars · Culture',
};

// ISR: regenerate at most once a minute so a newly published Top-10
// article appears as the featured link without a manual edit/redeploy.
export const revalidate = 60;

/**
 * Link-in-bio page. Standalone layout (no main nav/footer) — the page is
 * a self-contained landing surface usable as a profile link from social
 * bios.
 *
 * The "Latest" + "Top 10 Series" sections are DYNAMIC: they're built from
 * WordPress posts whose slug matches /^top-10-bars-in-.+-\d{4}$/, newest
 * first (newest → featured, the rest → series, capped). The "Guides" and
 * "Explore" sections below remain hand-curated and are intentionally left
 * exactly as they were. If WP is unreachable the dynamic sections degrade
 * gracefully (the static "All Top 10 Lists" archive link still renders).
 */
const ESCAPE_STYLES = `
  html, body {
    margin: 0 !important;
    padding: 0 !important;
    background: #1A1A1A !important;
  }
  .nav, .nav-wrapper, .nav-spacer, footer, .footer { display: none !important; }
  .container { all: unset !important; }
`;

const LINKS_STYLES = `
  .bm-links-page {
    background: #1A1A1A;
    color: #FAF9F7;
    min-height: 100vh;
    padding: 56px 20px 80px 20px;
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    box-sizing: border-box;
  }
  .bm-links-inner {
    max-width: 440px;
    margin: 0 auto;
  }
  .bm-links-logo {
    display: block;
    margin: 0 auto 12px auto;
    height: 36px;
    width: auto;
  }
  .bm-links-tagline {
    text-align: center;
    color: rgba(250, 249, 247, 0.55);
    font-size: 13px;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    margin: 0 0 40px 0;
  }
  .bm-links-section-label {
    color: rgba(250, 249, 247, 0.45);
    font-size: 11px;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    margin: 28px 0 10px 0;
    padding-left: 4px;
  }
  .bm-link {
    display: block;
    padding: 18px 20px;
    margin-bottom: 10px;
    background: transparent;
    color: #FAF9F7;
    border: 1px solid rgba(250, 249, 247, 0.2);
    border-radius: 12px;
    text-decoration: none;
    font-size: 16px;
    font-weight: 500;
    text-align: left;
    transition: background 0.18s ease, border-color 0.18s ease;
  }
  .bm-link:hover {
    background: rgba(250, 249, 247, 0.06);
    border-color: rgba(250, 249, 247, 0.4);
    color: #FAF9F7;
  }
  .bm-link-arrow {
    float: right;
    color: rgba(250, 249, 247, 0.4);
  }
  .bm-link-featured {
    background: #A02020;
    border-color: #A02020;
    color: #FFF;
    font-weight: 600;
  }
  .bm-link-featured:hover {
    background: #B32525;
    border-color: #B32525;
    color: #FFF;
  }
  .bm-link-featured .bm-link-arrow { color: rgba(255,255,255,0.65); }
  .bm-link-eyebrow {
    display: block;
    font-size: 11px;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    opacity: 0.7;
    margin-bottom: 4px;
    font-weight: 500;
  }
  .bm-links-footer {
    text-align: center;
    color: rgba(250, 249, 247, 0.4);
    font-size: 12px;
    margin-top: 56px;
  }
  .bm-links-footer a {
    color: rgba(250, 249, 247, 0.55);
    text-decoration: none;
    margin: 0 8px;
  }
  .bm-links-footer a:hover { color: #FAF9F7; }
`;

export default async function LinksPage() {
  const { featured, series } = await getTop10SeriesLinks(6);

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: ESCAPE_STYLES }} />
      <style dangerouslySetInnerHTML={{ __html: LINKS_STYLES }} />
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          width: '100vw',
          height: '100vh',
          margin: 0,
          padding: 0,
          overflowY: 'auto',
          overflowX: 'hidden',
          zIndex: 100000,
          background: '#1A1A1A',
        }}
      >
        <div className="bm-links-page">
          <div className="bm-links-inner">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img className="bm-links-logo" src="https://barmagazine.com/logo-white.png" alt="BarMagazine" />
            <p className="bm-links-tagline">Cocktails · Bars · Culture</p>

            {featured && (
              <>
                <div className="bm-links-section-label">Latest</div>
                <a className="bm-link bm-link-featured" href={featured.url}>
                  <span className="bm-link-eyebrow">New article</span>
                  {featured.title}
                  <span className="bm-link-arrow">→</span>
                </a>
              </>
            )}

            <div className="bm-links-section-label">Top 10 Series</div>

            {series.map((post) => (
              <a className="bm-link" href={post.url} key={post.slug}>
                {post.title}
                <span className="bm-link-arrow">→</span>
              </a>
            ))}

            <a className="bm-link" href="https://barmagazine.com/category/awards">
              All Top 10 Lists
              <span className="bm-link-arrow">→</span>
            </a>

            <div className="bm-links-section-label">Guides</div>

            <a className="bm-link" href="https://barmagazine.com/how-to-price-a-cocktail">
              How to Price a Cocktail
              <span className="bm-link-arrow">→</span>
            </a>

            <div className="bm-links-section-label">Explore</div>

            <a className="bm-link" href="https://barmagazine.com/bars">
              Bar Directory
              <span className="bm-link-arrow">→</span>
            </a>

            <a className="bm-link" href="https://barmagazine.com/claim-your-bar">
              List Your Bar
              <span className="bm-link-arrow">→</span>
            </a>

            <div className="bm-links-footer">
              <a href="https://barmagazine.com/">barmagazine.com</a>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
