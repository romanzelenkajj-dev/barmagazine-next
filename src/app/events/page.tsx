import type { Metadata } from 'next';
import Link from 'next/link';
import { getPosts, getFeaturedImageUrl, stripHtml } from '@/lib/wordpress';
import { formatCardTitle } from '@/lib/utils';

export const revalidate = 300;

export const metadata: Metadata = {
  title: 'Events | Bar Magazine',
  description: 'Bar industry events, cocktail competitions, award ceremonies, and trade shows worldwide.',
};

// Events category (202)
const EVENTS_CATEGORY = 202;

export default async function EventsPage() {
  const { data: posts } = await getPosts(1, 20, EVENTS_CATEGORY);

  return (
    <div style={{ marginTop: 'var(--gap)' }}>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 32, fontWeight: 700, letterSpacing: '-0.02em', marginBottom: 8 }}>
          Events
        </h1>
        <p style={{ fontSize: 15, color: 'var(--text-secondary)' }}>
          Bar industry events, cocktail competitions, and trade shows from around the world.
        </p>
      </div>

      <div className="article-grid">
        {posts.map((post) => {
          const imgUrl = getFeaturedImageUrl(post, 'large');
          const author = post._embedded?.author?.[0];
          const authorName = author?.name && author.name !== 'BarMagazine' ? author.name : null;
          const date = new Date(post.date).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          });
          const formattedTitle = formatCardTitle(post.title.rendered, post.meta?.bold_title);

          return (
            <Link key={post.id} href={`/${post.slug}`} className="article-card">
              <div className="article-card-img">
                {imgUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={imgUrl} alt={stripHtml(post.title.rendered)} loading="lazy" />
                )}
              </div>
              <div className="article-card-body">
                <h3
                  className="article-card-title"
                  dangerouslySetInnerHTML={{ __html: formattedTitle }}
                />
                <div className="article-card-meta">
                  {authorName && <span>{authorName}</span>}
                  {authorName && <span className="dot">·</span>}
                  <span>{date}</span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {posts.length === 0 && (
        <div style={{
          background: 'var(--bg-card)',
          borderRadius: 'var(--radius)',
          padding: 48,
          textAlign: 'center',
        }}>
          <p style={{ fontSize: 15, color: 'var(--text-secondary)' }}>
            No events articles yet. Check back soon.
          </p>
        </div>
      )}

      {/* Submit Event CTA */}
      <div style={{
        background: 'var(--bg-accent)',
        borderRadius: 'var(--radius)',
        padding: '48px 32px',
        textAlign: 'center',
        marginTop: 48,
      }}>
        <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>Have an event to submit?</h2>
        <p style={{ fontSize: 14, color: 'var(--text-secondary)', maxWidth: 500, margin: '0 auto 20px' }}>
          We&apos;re always looking for industry events to feature. Submit your event and reach the global bar community.
        </p>
        <a
          href="mailto:office@barmagazine.com?subject=Event Submission"
          style={{
            display: 'inline-block',
            padding: '14px 32px',
            background: 'var(--text-primary)',
            color: '#fff',
            borderRadius: 100,
            fontSize: 14,
            fontWeight: 600,
          }}
        >
          Submit Event
        </a>
      </div>
    </div>
  );
}
