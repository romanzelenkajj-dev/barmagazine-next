import Link from 'next/link';
import type { WPPost } from '@/lib/wordpress';
import { getFeaturedImageUrl, stripHtml } from '@/lib/wordpress';
import { cleanTitle } from '@/lib/utils';
import { NewsletterForm } from './NewsletterForm';

export function Sidebar({ relatedPosts }: { relatedPosts: WPPost[] }) {
  return (
    <aside className="sidebar">
      {/* Ad: Flavour Blaster */}
      <a href="https://flavourblaster.com/BARMAGAZINE" target="_blank" rel="noopener noreferrer sponsored" className="ad-banner">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/banners/flavour-blaster.jpg" alt="Flavour Blaster" width={1026} height={1026} loading="eager" />
      </a>

      {/* Newsletter */}
      <div className="sidebar-newsletter">
        <h3>Stay in the Mix</h3>
        <p>Get the latest cocktail trends, bar openings, and industry insights delivered to your inbox.</p>
        <NewsletterForm />
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
