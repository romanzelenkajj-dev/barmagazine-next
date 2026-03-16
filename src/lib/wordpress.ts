const WP_API = 'https://barmagazine.com/wp-json/wp/v2';

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
async function wpFetch<T>(endpoint: string, params: Record<string, string | number> = {}): Promise<T> {
  const url = new URL(`${WP_API}${endpoint}`);
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, String(v)));

  const res = await fetch(url.toString(), { next: { revalidate: 300 } }); // cache 5 min
  if (!res.ok) throw new Error(`WP API error: ${res.status} on ${endpoint}`);
  return res.json();
}

async function wpFetchWithTotal<T>(endpoint: string, params: Record<string, string | number> = {}): Promise<{ data: T; total: number; totalPages: number }> {
  const url = new URL(`${WP_API}${endpoint}`);
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, String(v)));

  const res = await fetch(url.toString(), { next: { revalidate: 300 } });
  if (!res.ok) throw new Error(`WP API error: ${res.status} on ${endpoint}`);

  return {
    data: await res.json(),
    total: parseInt(res.headers.get('X-WP-Total') || '0'),
    totalPages: parseInt(res.headers.get('X-WP-TotalPages') || '0'),
  };
}

// ---------- Posts ----------
export async function getPosts(page = 1, perPage = 12, categoryId?: number) {
  const params: Record<string, string | number> = {
    page,
    per_page: perPage,
    _embed: 'true',
  };
  if (categoryId) params.categories = categoryId;
  return wpFetchWithTotal<WPPost[]>('/posts', params);
}

export async function getPostBySlug(slug: string): Promise<WPPost | null> {
  const posts = await wpFetch<WPPost[]>('/posts', { slug, _embed: 'true' });
  return posts[0] || null;
}

export async function getPostsByCategory(categorySlug: string, page = 1, perPage = 12) {
  const cats = await wpFetch<WPCategory[]>('/categories', { slug: categorySlug });
  if (!cats[0]) return { data: [] as WPPost[], total: 0, totalPages: 0 };
  return getPosts(page, perPage, cats[0].id);
}

// ---------- Categories ----------
export async function getCategories() {
  return wpFetch<WPCategory[]>('/categories', { per_page: 50 });
}

export async function getCategoryBySlug(slug: string): Promise<WPCategory | null> {
  const cats = await wpFetch<WPCategory[]>('/categories', { slug });
  return cats[0] || null;
}

// ---------- Media ----------
export async function getMedia(id: number) {
  return wpFetch<WPMedia>(`/media/${id}`);
}

// ---------- Tags ----------
export async function getTags(perPage = 20) {
  return wpFetch<WPTag[]>('/tags', { per_page: perPage, orderby: 'count', order: 'desc' });
}

// ---------- Search ----------
export async function searchPosts(query: string, perPage = 10) {
  return wpFetch<WPPost[]>('/posts', { search: query, per_page: perPage, _embed: 'true' });
}

// ---------- Helpers ----------
export function getFeaturedImageUrl(post: WPPost, size: 'thumbnail' | 'medium' | 'medium_large' | 'large' | 'full' = 'large'): string | null {
  const media = post._embedded?.['wp:featuredmedia']?.[0];
  if (!media) return null;
  return media.media_details?.sizes?.[size]?.source_url || media.source_url || null;
}

export function getPostCategories(post: WPPost): WPCategory[] {
  return post._embedded?.['wp:term']?.[0] || [];
}

export function getPostAuthor(post: WPPost): WPAuthor | null {
  return post._embedded?.author?.[0] || null;
}

export function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, '').trim();
}

export function estimateReadTime(content: string): number {
  const words = stripHtml(content).split(/\s+/).length;
  return Math.max(1, Math.ceil(words / 250));
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
