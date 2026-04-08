import type { MetadataRoute } from 'next';
import { getBars, getCountriesWithCounts, getCitiesWithCounts } from '@/lib/supabase';
import { toUrlSlug } from '@/lib/utils';
import { WP_API } from '@/lib/wordpress';
const SITE_URL = 'https://barmagazine.com';

// Category slugs that exist in WordPress and have dedicated/redirected pages
// Removed: news, features (don't exist in WP, were causing 404s)
// spirits/wines redirect to brands; mocktails redirects to cocktails;
// interviews/books redirect to people (handled in next.config.js)
const CATEGORY_SLUGS = [
  'cocktails', 'people', 'awards', 'brands', 'events', 'bars',
];

interface WPPostSitemap {
  slug: string;
  modified: string;
}

async function fetchAllPostSlugs(): Promise<WPPostSitemap[]> {
  const allPosts: WPPostSitemap[] = [];
  let page = 1;
  const perPage = 100;

  while (true) {
    try {
      const res = await fetch(
        `${WP_API}/posts?per_page=${perPage}&page=${page}&_fields=slug,modified`,
        { next: { revalidate: 3600 } } // refresh sitemap data hourly
      );
      if (!res.ok) break;

      const posts: WPPostSitemap[] = await res.json();
      if (posts.length === 0) break;

      allPosts.push(...posts);
      const totalPages = parseInt(res.headers.get('X-WP-TotalPages') || '1');
      if (page >= totalPages) break;
      page++;
    } catch {
      break;
    }
  }

  return allPosts;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: SITE_URL,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${SITE_URL}/work-with-us`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${SITE_URL}/add-your-bar`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.4,
    },
    {
      url: `${SITE_URL}/privacy`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.2,
    },
    {
      url: `${SITE_URL}/terms`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.2,
    },
  ];

  // Category pages
  const categoryPages: MetadataRoute.Sitemap = CATEGORY_SLUGS.map((slug) => ({
    url: `${SITE_URL}/category/${slug}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: 0.8,
  }));

  // All article pages from WordPress
  const posts = await fetchAllPostSlugs();
  const articlePages: MetadataRoute.Sitemap = posts.map((post) => ({
    url: `${SITE_URL}/${post.slug}`,
    lastModified: new Date(post.modified),
    changeFrequency: 'weekly' as const,
    priority: 0.6,
  }));

  // All bar profile pages from Supabase
  // Exclude bars that have a WordPress article — those are already in articlePages
  const { bars } = await getBars({ perPage: 1000 });
  const articleSlugs = new Set(posts.map(p => p.slug));
  const barPages: MetadataRoute.Sitemap = bars
    .filter(bar => !bar.wp_article_slug || !articleSlugs.has(bar.wp_article_slug))
    .map((bar) => ({
      url: `${SITE_URL}/bars/${bar.slug}`,
      lastModified: new Date(bar.updated_at || bar.created_at),
      changeFrequency: 'weekly' as const,
      priority: bar.tier === 'top10' ? 0.9 : bar.tier === 'premium' ? 0.8 : bar.tier === 'featured' ? 0.7 : 0.6,
    }));

  // /bars directory listing page
  const directoryPage: MetadataRoute.Sitemap = [{
    url: `${SITE_URL}/bars`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: 0.9,
  }];

  // Country and city landing pages
  const countries = await getCountriesWithCounts();
  const countryPages: MetadataRoute.Sitemap = countries.map((c) => ({
    url: `${SITE_URL}/bars/country/${toUrlSlug(c.country)}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  const cities = await getCitiesWithCounts();
  const cityPages: MetadataRoute.Sitemap = cities.map((c) => ({
    url: `${SITE_URL}/bars/city/${toUrlSlug(c.city)}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }));

  return [...staticPages, ...categoryPages, ...articlePages, ...directoryPage, ...barPages, ...countryPages, ...cityPages];
}
