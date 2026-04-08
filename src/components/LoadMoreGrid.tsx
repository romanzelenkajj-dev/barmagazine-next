'use client';

import { useState } from 'react';
import Link from 'next/link';
import { cleanTitle } from '@/lib/utils';

interface Post {
  id: number;
  slug: string;
  date: string;
  title: { rendered: string };
  excerpt: { rendered: string };
  content: { rendered: string };
  meta?: { bold_title?: string };
  _embedded?: {
    'wp:featuredmedia'?: { source_url: string; media_details: { sizes: { medium_large?: { source_url: string }; large?: { source_url: string } } } }[];
    'wp:term'?: { name: string }[][];
  };
}

/**
 * Rewrite any staging-domain URLs in a string to the production domain.
 * This mirrors the server-side sanitizeResponse() in wordpress.ts and
 * is needed because LoadMoreGrid fetches from the WP API directly on
 * the client side ("Load More" button).
 */
function sanitizeUrl(url: string): string {
  if (!url) return url;
  return url
    .replace(
      /https:\/\/i[0-9]\.wp\.com\/romanzelenka-wjgek\.wpcomstaging\.com\/wp-content\/uploads\//g,
      'https://i0.wp.com/barmagazine.com/wp-content/uploads/'
    )
    .replace(
      /https:\/\/romanzelenka-wjgek\.wpcomstaging\.com\/wp-content\/uploads\//g,
      'https://i0.wp.com/barmagazine.com/wp-content/uploads/'
    )
    .replace(
      /https:\/\/romanzelenka-wjgek\.wpcomstaging\.com\//g,
      'https://barmagazine.com/'
    );
}

function getImage(post: Post): string | null {
  const media = post._embedded?.['wp:featuredmedia']?.[0];
  if (!media) return null;
  const raw = media.media_details?.sizes?.medium_large?.source_url || media.media_details?.sizes?.large?.source_url || media.source_url || null;
  return raw ? sanitizeUrl(raw) : null;
}

function strip(html: string): string {
  let text = html.replace(/<[^>]*>/g, '').trim();
  text = text
    .replace(/&#8217;/g, "'")
    .replace(/&#8216;/g, "'")
    .replace(/&#8220;/g, '"')
    .replace(/&#8221;/g, '"')
    .replace(/&#8211;/g, '\u2013')
    .replace(/&#8212;/g, '\u2014')
    .replace(/&#038;/g, '&')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&#039;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/&#8230;/g, '\u2026')
    .replace(/&#\d+;/g, '');
  return text;
}

function truncate(text: string, maxLen: number): string {
  if (text.length <= maxLen) return text;
  const t = text.slice(0, maxLen);
  const s = t.lastIndexOf(' ');
  return (s > maxLen * 0.6 ? t.slice(0, s) : t) + '\u2026';
}

export function LoadMoreGrid({
  initialPosts,
  totalPages,
  fetchUrl,
}: {
  initialPosts: Post[];
  totalPages: number;
  fetchUrl: string;
}) {
  const [posts, setPosts] = useState<Post[]>(initialPosts);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const hasMore = page < totalPages;

  const loadMore = async () => {
    setLoading(true);
    try {
      const nextPage = page + 1;
      const res = await fetch(`${fetchUrl}&page=${nextPage}&_embed=true`);
      if (res.ok) {
        const newPosts: Post[] = await res.json();
        setPosts(prev => [...prev, ...newPosts]);
        setPage(nextPage);
      }
    } catch (e) {
      console.error('Failed to load more posts', e);
    }
    setLoading(false);
  };

  return (
    <>
      <div className="article-grid">
        {posts.map(post => {
          const imageUrl = getImage(post);
          const excerpt = truncate(strip(post.excerpt.rendered), 120);

          return (
            <Link key={post.id} href={`/${post.slug}`} className="article-card">
              <div className="article-card-img">
                {imageUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={imageUrl} alt={strip(post.title.rendered)} loading="lazy" />
                )}
              </div>
              <div className="article-card-body">
                <h3
                  className="article-card-title"
                  dangerouslySetInnerHTML={{ __html: cleanTitle(post.title.rendered) }}
                />
                <p className="article-card-excerpt">{excerpt}</p>
              </div>
            </Link>
          );
        })}
      </div>

      {hasMore && (
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: 40 }}>
          <button
            className="load-more-btn"
            onClick={loadMore}
            disabled={loading}
          >
            {loading ? 'Loading...' : 'Load More'}
          </button>
        </div>
      )}
    </>
  );
}
