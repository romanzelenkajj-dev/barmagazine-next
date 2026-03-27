/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true,
  },
  // 301 redirects: old WordPress URLs → new Next.js equivalents
  async redirects() {
    return [
      // Sub-category consolidations
      { source: '/category/spirits', destination: '/category/brands', permanent: true },
      { source: '/category/wines', destination: '/category/brands', permanent: true },
      { source: '/category/mocktails', destination: '/category/cocktails', permanent: true },
      { source: '/category/interviews', destination: '/category/people', permanent: true },
      { source: '/category/books', destination: '/category/people', permanent: true },

      // Categories that don't exist in WordPress
      { source: '/category/news', destination: '/category/events', permanent: true },
      { source: '/category/features', destination: '/', permanent: true },

      // Old WordPress pages
      { source: '/trending', destination: '/', permanent: true },
      { source: '/about', destination: '/work-with-us', permanent: true },
      { source: '/contact', destination: '/work-with-us', permanent: true },
      { source: '/homepage', destination: '/', permanent: true },

      // Author pages (no equivalent in new site)
      { source: '/author/:slug', destination: '/', permanent: true },

      // Tag pages (no equivalent in new site)
      { source: '/tag/:slug', destination: '/', permanent: true },

      // Old event sub-pages → article slugs
      { source: '/events/:slug', destination: '/:slug', permanent: true },

      // WordPress infrastructure paths
      { source: '/feed', destination: '/', permanent: true },
      { source: '/wp-login.php', destination: '/', permanent: false },
      { source: '/wp-admin', destination: '/', permanent: false },
    ];
  },
  // Prevent browsers from caching stale favicons
  async headers() {
    return [
      {
        source: '/favicon.ico',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=86400, must-revalidate' },
        ],
      },
      {
        source: '/favicon-:size.png',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=86400, must-revalidate' },
        ],
      },
      {
        source: '/apple-touch-icon.png',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=86400, must-revalidate' },
        ],
      },
    ];
  },
  // Proxy /wp-content/uploads/* to WordPress.com CDN so old image URLs still work
  async rewrites() {
    return [
      {
        source: '/sitemap-news.xml',
        destination: '/api/sitemap-news',
      },
      {
        source: '/sitemap-bars.xml',
        destination: '/api/sitemap-bars',
      },
      {
        source: '/partner',
        destination: '/partner.html',
      },
      {
        source: '/wp-content/uploads/:path*',
        destination: 'https://i0.wp.com/barmagazine.com/wp-content/uploads/:path*',
      },
    ];
  },
};

export default nextConfig;
