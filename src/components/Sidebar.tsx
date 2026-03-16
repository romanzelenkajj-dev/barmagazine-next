import Link from 'next/link';
import { format } from 'date-fns';
import type { WPPost } from '@/lib/wordpress';
import { getFeaturedImageUrl, stripHtml } from '@/lib/wordpress';

export function Sidebar({ relatedPosts }: { relatedPosts: WPPost[] }) {
  return (
    <aside className="sidebar">
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
                  <h4 dangerouslySetInnerHTML={{ __html: post.title.rendered }} />
                  <span className="related-date">
                    {format(new Date(post.date), 'MMM d, yyyy')}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {/* Newsletter */}
      <div className="sidebar-newsletter">
        <h3>Stay in the Mix</h3>
        <p>Get the latest cocktail trends, bar openings, and industry insights delivered to your inbox.</p>
        <input type="email" placeholder="Your email address" />
        <button>Subscribe</button>
      </div>

      {/* Trending Tags */}
      <div className="sidebar-card">
        <h3>Trending Topics</h3>
        <div className="tag-cloud">
          {['Cocktails', 'Best Bars', 'Spirits', 'Whiskey', 'Gin', 'Mezcal', 'Low ABV', 'Bar Design'].map(tag => (
            <Link key={tag} href={`/search?q=${encodeURIComponent(tag)}`} className="tag-pill">
              {tag}
            </Link>
          ))}
        </div>
      </div>
    </aside>
  );
}
