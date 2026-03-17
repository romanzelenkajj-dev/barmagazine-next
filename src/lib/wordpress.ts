// WordPress.com public API — use the wpcomstaging.com address (primary site URL after DNS move)
const WP_API = 'https://public-api.wordpress.com/wp/v2/sites/romanzelenka-wjgek.wpcomstaging.com';

// ---------- Types ----------
export interface WPPost {
  id: number;
  date: string;
  slug: string;
  title: { rendered: string };
  content: { rendered: string };
  excerpt: { rendered: string };
  featured_media: number;
  categories: number[];
  tags: number[];
  meta?: {
    bold_title?: string;
    [key: string]: unknown;
  };
  _embedded?: {
    'wp:featuredmedia'?: WPMedia[];
    'wp:term'?: WPCategory[][];
    author?: WPAuthor[];
  };
}

export interface WPCategory {
  id: number;
  name: string;
  slug: string;
  count: number;
  parent: number;
}

export interface WPMedia {
  id: number;
  source_url: string;
  alt_text: string;
  media_details: {
    width: number;
    height: number;
    sizes: {
      thumbnail?: { source_url: string };
      medium?: { source_url: string };
      medium_large?: { source_url: string };
      large?: { source_url: string };
      full?: { source_url: string };
    };
  };
}

export interface WPAuthor {
  id: number;
  name: string;
  avatar_urls: { [key: string]: string };
}

export interface WPTag {
  id: number;
  name: string;
  slug: string;
  count: number;
}

// ---------- Fetch helpers ----------
async function fetchWithRetry(url: string, retries = 5, delay = 2000): Promise<Response> {
  for (let i = 0; i < retries; i++) {
    try {
      const res = await fetch(url, { next: { revalidate: 300 } });
      if (res.ok || res.status < 500) return res;
    } catch (e) {
      if (i >= retries - 1) throw e;
    }
    if (i < retries - 1) await new Promise(r => setTimeout(r, delay * (i + 1)));
  }
  return fetch(url, { next: { revalidate: 300 } });
}

async function wpFetch<T>(endpoint: string, params: Record<string, string | number> = {}, fallback?: T): Promise<T> {
  const url = new URL(`${WP_API}${endpoint}`);
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, String(v)));

  try {
    const res = await fetchWithRetry(url.toString());
    if (!res.ok) {
      console.warn(`WP API error: ${res.status} on ${endpoint}`);
      if (fallback !== undefined) return fallback;
      throw new Error(`WP API error: ${res.status} on ${endpoint}`);
    }
    return res.json();
  } catch (e) {
    console.warn(`WP API fetch failed on ${endpoint}:`, e);
    if (fallback !== undefined) return fallback;
    throw e;
  }
}

async function wpFetchWithTotal<T>(endpoint: string, params: Record<string, string | number> = {}): Promise<{ data: T; total: number; totalPages: number }> {
  const url = new URL(`${WP_API}${endpoint}`);
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, String(v)));

  try {
    const res = await fetchWithRetry(url.toString());
    if (!res.ok) {
      console.warn(`WP API error: ${res.status} on ${endpoint}, returning empty`);
      return { data: [] as unknown as T, total: 0, totalPages: 0 };
    }
    return {
      data: await res.json(),
      total: parseInt(res.headers.get('X-WP-Total') || '0'),
      totalPages: parseInt(res.headers.get('X-WP-TotalPages') || '0'),
    };
  } catch (e) {
    console.warn(`WP API fetch failed on ${endpoint}:`, e);
    return { data: [] as unknown as T, total: 0, totalPages: 0 };
  }
}

// ---------- Posts ----------
export async function getPosts(page = 1, perPage = 12, categoryId?: number, categoryIds?: number[]) {
  const params: Record<string, string | number> = {
    page,
    per_page: perPage,
    _embed: 'true',
  };
  if (categoryIds && categoryIds.length > 0) {
    params.categories = categoryIds.join(',');
  } else if (categoryId) {
    params.categories = categoryId;
  }
  return wpFetchWithTotal<WPPost[]>('/posts', params);
}

export async function getPostsByMultipleCategories(categoryIds: number[], page = 1, perPage = 12) {
  return getPosts(page, perPage, undefined, categoryIds);
}

export async function getPostBySlug(slug: string): Promise<WPPost | null> {
  const posts = await wpFetch<WPPost[]>('/posts', { slug, _embed: 'true' }, []);
  return posts[0] || null;
}

export async function getPostsByCategory(categorySlug: string, page = 1, perPage = 12) {
  const cats = await wpFetch<WPCategory[]>('/categories', { slug: categorySlug }, []);
  if (!cats[0]) return { data: [] as WPPost[], total: 0, totalPages: 0 };
  return getPosts(page, perPage, cats[0].id);
}

// ---------- Categories ----------
export async function getCategories() {
  return wpFetch<WPCategory[]>('/categories', { per_page: 50 }, []);
}

export async function getCategoryBySlug(slug: string): Promise<WPCategory | null> {
  const cats = await wpFetch<WPCategory[]>('/categories', { slug }, []);
  return cats[0] || null;
}

// ---------- Media ----------
export async function getMedia(id: number) {
  return wpFetch<WPMedia>(`/media/${id}`);
}

// ---------- Tags ----------
export async function getTags(perPage = 20) {
  return wpFetch<WPTag[]>('/tags', { per_page: perPage, orderby: 'count', order: 'desc' }, []);
}

// ---------- Search ----------
export async function searchPosts(query: string, perPage = 10) {
  return wpFetch<WPPost[]>('/posts', { search: query, per_page: perPage, _embed: 'true' }, []);
}

// ---------- Helpers ----------
export function getFeaturedImageUrl(post: WPPost, size: 'thumbnail' | 'medium' | 'medium_large' | 'large' | 'full' = 'large'): string | null {
  const media = post._embedded?.['wp:featuredmedia']?.[0];
  if (!media) return null;
  const url = media.media_details?.sizes?.[size]?.source_url || media.source_url || null;
  return url ? rewriteImageUrl(url) : null;
}

export function getPostCategories(post: WPPost): WPCategory[] {
  return post._embedded?.['wp:term']?.[0] || [];
}

export function getPostAuthor(post: WPPost): WPAuthor | null {
  return post._embedded?.author?.[0] || null;
}

export function stripHtml(html: string): string {
  let text = html.replace(/<[^>]*>/g, '').trim();
  // Decode HTML entities
  text = text
    .replace(/&#8217;/g, "'")
    .replace(/&#8216;/g, "'")
    .replace(/&#8220;/g, '"')
    .replace(/&#8221;/g, '"')
    .replace(/&#8211;/g, '–')
    .replace(/&#8212;/g, '—')
    .replace(/&#038;/g, '&')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&#039;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/&#8230;/g, '…')
    .replace(/&#\d+;/g, '');
  return text;
}

export function truncateAtWord(text: string, maxLen: number): string {
  if (text.length <= maxLen) return text;
  const truncated = text.slice(0, maxLen);
  const lastSpace = truncated.lastIndexOf(' ');
  return (lastSpace > maxLen * 0.6 ? truncated.slice(0, lastSpace) : truncated) + '…';
}

export function estimateReadTime(content: string): number {
  const words = stripHtml(content).split(/\s+/).length;
  return Math.max(1, Math.ceil(words / 250));
}

// ---------- Image URL helpers ----------
/**
 * Rewrite barmagazine.com/wp-content/uploads/* URLs to use the WordPress.com CDN
 * (i0.wp.com) so images keep working after DNS points barmagazine.com to Vercel.
 */
export function rewriteImageUrl(url: string): string {
  if (!url) return url;
  // Already on wp.com CDN
  if (url.includes('i0.wp.com') || url.includes('i1.wp.com') || url.includes('i2.wp.com')) return url;
  // Rewrite barmagazine.com/wp-content/ to CDN
  if (url.includes('barmagazine.com/wp-content/')) {
    return url.replace('https://barmagazine.com/', 'https://i0.wp.com/barmagazine.com/');
  }
  return url;
}

/**
 * Rewrite all image URLs inside HTML content.
 */
export function rewriteContentImageUrls(html: string): string {
  if (!html) return html;
  return html.replace(
    /https:\/\/barmagazine\.com\/wp-content\/uploads\/([^"'\s)]+)/g,
    'https://i0.wp.com/barmagazine.com/wp-content/uploads/$1'
  );
}

// Category ID map (from the live site)
export const CATEGORY_MAP: Record<string, number> = {
  'bar-tour': 6,
  'bars': 63,
  'blog': 1,
  'books': 5,
  'cocktails': 8,
  'features': 40,
  'flavours': 44,
  'interviews': 4,
  'mocktails': 64,
  'news': 52,
  'spirits': 59,
  'wines': 41,
};
