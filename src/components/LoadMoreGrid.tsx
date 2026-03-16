'use client';

import { useState } from 'react';
import Link from 'next/link';
import { format } from 'date-fns';

interface Post {
  id: number;
  slug: string;
  date: string;
  title: { rendered: string };
  excerpt: { rendered: string };
  content: { rendered: string };
  _embedded?: {
    'wp:featuredmedia'?: { source_url: string; media_details: { sizes: { medium_large?: { source_url: string }; large?: { source_url: string } } } }[];
    'wp:term'?: { name: string }[][];
  };
}

function getImage(post: Post): string | null {
  const media = post._embedded?.['wp:featuredmedia']?.[0];
  if (!media) return null;
  return media.media_details?.sizes?.medium_large?.source_url || media.media_details?.sizes?.large?.source_url || media.source_url || null;
}

function getCat(post: Post): string {
  return post._embedded?.['wp:term']?.[0]?.[0]?.name || 'Article';
}

function strip(html: string): string {
  return html.replace(/<[^>]*>/g, '').trim();
}

function readTime(content: string): number {
  return Math.max(1, Math.ceil(strip(content).split(/\s+/).length / 250));
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
          const categoryName = getCat(post);
          const excerpt = strip(post.excerpt.rendered);
          const rt = readTime(post.content.rendered);

          return (
            <Link key={post.id} href={`/${post.slug}`} className="article-card">
              <div className="article-card-img">
                {imageUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={imageUrl} alt={strip(post.title.rendered)} loading="lazy" />
                )}
              </div>
              <div className="article-card-body">
                <div className="article-card-cat">{categoryName}</div>
                <h3
                  className="article-card-title"
                  dangerouslySetInnerHTML={{ __html: post.title.rendered }}
                />
                <p className="article-card-excerpt">{excerpt}</p>
                <div className="article-card-meta">
                  <span>{format(new Date(post.date), 'MMM d, yyyy')}</span>
                  <span className="dot" />
                  <span>{rt} min read</span>
                </div>
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
