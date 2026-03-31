'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import { formatCardTitle } from '@/lib/utils';

/* ── Types (matching WP REST shape) ── */
interface WPCategory { id: number; name: string; slug: string }
interface WPMediaSize { source_url: string; width: number; height: number }
interface WPPost {
  id: number;
  slug: string;
  title: { rendered: string };
  excerpt: { rendered: string };
  meta?: { bold_title?: string };
  _embedded?: {
    'wp:featuredmedia'?: Array<{
      source_url: string;
      media_details?: { sizes?: Record<string, WPMediaSize> };
    }>;
    'wp:term'?: Array<WPCategory[]>;
  };
}

/* ── Helpers ── */
function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, '').replace(/&[^;]+;/g, m => {
    const el = typeof document !== 'undefined' ? document.createElement('span') : null;
    if (el) { el.innerHTML = m; return el.textContent || m; }
    return m.replace('&amp;', '&').replace('&lt;', '<').replace('&gt;', '>').replace('&#8217;', "'").replace('&#8216;', "'").replace('&#8220;', '"').replace('&#8221;', '"');
  }).trim();
}

function truncateAtWord(text: string, maxLen: number): string {
  if (text.length <= maxLen) return text;
  const cut = text.slice(0, maxLen);
  const lastSpace = cut.lastIndexOf(' ');
  return (lastSpace > 0 ? cut.slice(0, lastSpace) : cut) + '…';
}

function getImgUrl(post: WPPost, size: string): string | null {
  const media = post._embedded?.['wp:featuredmedia']?.[0];
  if (!media) return null;
  const s = media.media_details?.sizes?.[size];
  return s?.source_url || media.source_url || null;
}

function getCategory(post: WPPost): string {
  const terms = post._embedded?.['wp:term']?.[0];
  if (!terms || terms.length === 0) return 'Latest';
  const filtered = terms.filter(t => t.slug !== 'uncategorized');
  return filtered[0]?.name || terms[0]?.name || 'Latest';
}

/* formatCardTitle imported from @/lib/utils — handles pipe markers and bold_title */

/* ── Category map (slug → WP category ID) ── */
const CATEGORIES: { label: string; slug: string; id: number }[] = [
  { label: 'Bars', slug: 'bars', id: 63 },
  { label: 'People', slug: 'people', id: 199 },
  { label: 'Cocktails', slug: 'cocktails', id: 8 },
  { label: 'Awards', slug: 'awards', id: 200 },
  { label: 'Brands', slug: 'brands', id: 201 },
  { label: 'Events', slug: 'events', id: 202 },
];

/* ── WP API base ── */
const WP_API = 'https://public-api.wordpress.com/wp/v2/sites/romanzelenka-wjgek.wpcomstaging.com';

interface Props {
  initialPosts: string; // JSON-serialized WPPost[]
}

export function HomeCategoryGrid({ initialPosts }: Props) {
  const [selectedCategory, setSelectedCategory] = useState('');
  const [posts, setPosts] = useState<WPPost[]>(() => {
    try { return JSON.parse(initialPosts); } catch { return []; }
  });
  const [isLoading, setIsLoading] = useState(false);
  const allPosts = JSON.parse(initialPosts) as WPPost[];

  const fetchCategory = useCallback(async (categoryId: number) => {
    setIsLoading(true);
    try {
      const res = await fetch(
        `${WP_API}/posts?per_page=6&page=1&categories=${categoryId}&_embed=wp:featuredmedia,wp:term`
      );
      if (!res.ok) throw new Error('Failed to fetch');
      const data: WPPost[] = await res.json();
      setPosts(data);
    } catch {
      setPosts([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleChange = (value: string) => {
    setSelectedCategory(value);
    if (!value) {
      setPosts(allPosts);
      return;
    }
    const cat = CATEGORIES.find(c => c.slug === value);
    if (cat) fetchCategory(cat.id);
  };

  return (
    <>
      {/* Section bar with working filter */}
      <div className="section-bar">
        <h2>Featured Content You Might Like</h2>
        <select
          className="filter-select"
          aria-label="Filter content"
          value={selectedCategory}
          onChange={e => handleChange(e.target.value)}
        >
          <option value="">All Categories</option>
          {CATEGORIES.map(c => (
            <option key={c.slug} value={c.slug}>{c.label}</option>
          ))}
        </select>
      </div>

      {/* Card grid */}
      <div className="cards-grid">
        {isLoading ? (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '3rem 0', color: 'var(--color-muted, #888)' }}>
            Loading…
          </div>
        ) : posts.length === 0 ? (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '3rem 0', color: 'var(--color-muted, #888)' }}>
            No articles found in this category.
          </div>
        ) : (
          posts.map((post, i) => {
            const isBleed = i % 3 === 1;
            const cat = getCategory(post);
            const imgUrl = getImgUrl(post, 'large');
            const formattedTitle = formatCardTitle(post.title.rendered, post.meta?.bold_title);
            const excerpt = truncateAtWord(stripHtml(post.excerpt.rendered), 120);

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
                    <span className="card-tag">{cat}</span>
                  </div>
                  <div className="card-body">
                    <h3 dangerouslySetInnerHTML={{ __html: formattedTitle }} />
                    <p className="card-excerpt">{excerpt}</p>
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
                    <span className="card-tag">{cat}</span>
                  </div>
                  <h3 dangerouslySetInnerHTML={{ __html: formattedTitle }} />
                  <p className="card-excerpt">{excerpt}</p>
                </div>
              </Link>
            );
          })
        )}
      </div>
    </>
  );
}
