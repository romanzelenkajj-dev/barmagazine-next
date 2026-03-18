import Link from 'next/link';
import type { WPPost } from '@/lib/wordpress';
import { getFeaturedImageUrl, stripHtml } from '@/lib/wordpress';
import { cleanTitle } from '@/lib/utils';

export function Sidebar({ relatedPosts }: { relatedPosts: WPPost[] }) {
  return (
    <aside className="sidebar">
      {/* Ad: Flavour Blaster */}
      <a href="https://flavourblaster.com/BARMAGAZINE" target="_blank" rel="noopener noreferrer sponsored" className="ad-banner" style={{ marginBottom: 24 }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/banners/flavour-blaster.jpg" alt="Flavour Blaster" width={1026} height={1026} loading="lazy" />
      </a>

      {/* Newsletter */}
      <div className="sidebar-newsletter">
        <h3>Stay in the Mix</h3>
        <p>Get the latest cocktail trends, bar openings, and industry insights delivered to your inbox.</p>
        <form method="post" action="https://romanzelenka-wjgek.wpcomstaging.com/">
          <input type="hidden" name="_mc4wp_form_id" value="84" />
          <input type="hidden" name="_mc4wp_timestamp" value="" />
          <input type="hidden" name="_mc4wp_honeypot" value="" />
          <input type="email" name="EMAIL" required placeholder="Your email address" />
          <button type="submit">Subscribe</button>
        </form>
      </div>

      {/* Related Articles */}
      {relatedPosts.length > 0 && (
        <div className="sidebar-card">
          <h3>Related Articles</h3>
          {relatedPosts.slice(0, 4).map(post => {
            const thumb = getFeaturedImageUrl(post, 'thumbnail');
            return (
              <Link key={post.id} href={`/${post.slug}`} className="related-item">
                <div className="related-thumb">
                  {thumb && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={thumb} alt={stripHtml(post.title.rendered)} />
                  )}
                </div>
                <div className="related-info">
                  <h4>{cleanTitle(post.title.rendered)}</h4>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </aside>
  );
}
