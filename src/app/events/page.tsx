import { getPostsByCategory } from '@/lib/wordpress';
import { LoadMoreGrid } from '@/components/LoadMoreGrid';
import { BarPlaceholder } from '@/components/BarPlaceholder';
import { upcomingEvents } from '@/lib/events';
import Link from 'next/link';
import type { Metadata } from 'next';

export const revalidate = 300;

export const metadata: Metadata = {
  title: 'Events',
  description: 'Bar industry events, cocktail competitions, award ceremonies, and trade shows worldwide.',
  alternates: { canonical: 'https://barmagazine.com/events' },
};

/**
 * /events — the landing surface for the paid Event Promotion package.
 *
 * Promoted events (config-driven, src/lib/events.ts) render as city-guide
 * style cards on top; past events drop off automatically after their end
 * date via upcomingEvents(). The magazine's event coverage keeps its grid
 * below, so the page has substance while the promoted list is short.
 * Indexable, unlike the partner collections.
 */
export default async function EventsPage() {
  const upcoming = upcomingEvents();
  const result = await getPostsByCategory('events', 1, 12);
  const fetchUrl = `/api/wp-posts?categories=202&per_page=12`;

  return (
    <div className="category-header-wrapper">
      <div className="category-header">
        <h1>Events</h1>
        <div className="category-header-line" />
      </div>

      {upcoming.length > 0 && (
        <div className="best-bars-page" style={{ paddingTop: 0, paddingBottom: 8 }}>
          <ol className="best-bars-list">
            {upcoming.map((event, i) => (
              <li key={event.slug} className="best-bars-item">
                <Link href={event.articleUrl} className="best-bars-card">
                  <div className="best-bars-visual">
                    {event.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={event.image} alt={event.title} loading={i < 2 ? 'eager' : 'lazy'} />
                    ) : (
                      <BarPlaceholder name={event.title} type={null} />
                    )}
                  </div>
                  <div className="best-bars-body">
                    <div className="best-bars-badges">
                      <span className="bar-dir-badge-pill bar-dir-badge-pill--type">{event.city}</span>
                    </div>
                    <h2 className="best-bars-name">{event.title}</h2>
                    <p className="best-bars-serve">
                      <strong>{event.dateRange}</strong>
                    </p>
                    <p className="best-bars-desc">{event.blurb}</p>
                    <span className="best-bars-more">
                      Read more
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
                    </span>
                  </div>
                </Link>
              </li>
            ))}
          </ol>
        </div>
      )}

      <LoadMoreGrid
        initialPosts={result.data as any}
        totalPages={result.totalPages}
        fetchUrl={fetchUrl}
      />

      {result.data.length === 0 && upcoming.length === 0 && (
        <div style={{ textAlign: 'center', padding: '80px 20px', color: 'var(--text-tertiary)' }}>
          <p style={{ fontSize: 16 }}>No articles found in this category yet.</p>
        </div>
      )}
    </div>
  );
}
