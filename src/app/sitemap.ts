import type { MetadataRoute } from 'next';

const WP_API = 'https://public-api.wordpress.com/wp/v2/sites/romanzelenka-wjgek.wpcomstaging.com';
const SITE_URL = 'https://barmagazine.com';

// Category slugs used in navigation
const CATEGORY_SLUGS = [
  'cocktails', 'spirits', 'wines', 'mocktails', 'bars',
  'news', 'features', 'interviews', 'people', 'awards', 'brands', 'events',
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

  return [...staticPages, ...categoryPages, ...articlePages];
}
