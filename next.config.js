/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'barmagazine.com',
      },
      {
        protocol: 'https',
        hostname: 'i0.wp.com',
      },
      {
        protocol: 'https',
        hostname: 'i1.wp.com',
      },
      {
        protocol: 'https',
        hostname: 'i2.wp.com',
      },
      {
        protocol: 'https',
        hostname: 'secure.gravatar.com',
      },
      {
        protocol: 'https',
        hostname: 'romanzelenka-wjgek.wpcomstaging.com',
      },
    ],
  },
  // Redirect old sub-category slugs to their parent grouped pages
  async redirects() {
    return [
      // --- Existing category redirects ---
      { source: '/category/spirits', destination: '/category/brands', permanent: true },
      { source: '/category/wines', destination: '/category/brands', permanent: true },
      { source: '/category/mocktails', destination: '/category/cocktails', permanent: true },
      { source: '/category/interviews', destination: '/category/people', permanent: true },
      { source: '/category/books', destination: '/category/people', permanent: true },

      // --- Missing category redirects (404s Google is indexing) ---
      { source: '/category/news', destination: '/category/events', permanent: true },
      { source: '/category/features', destination: '/', permanent: true },

      // --- Old WordPress pages that no longer exist ---
      { source: '/trending', destination: '/', permanent: true },
      { source: '/about', destination: '/work-with-us', permanent: true },
      { source: '/contact', destination: '/work-with-us', permanent: true },

      // --- Author pages → homepage (no author pages in new site) ---
      { source: '/author/:slug', destination: '/', permanent: true },

      // --- Old WordPress paths ---
      { source: '/feed', destination: '/', permanent: true },
      { source: '/wp-login.php', destination: '/', permanent: false },
      { source: '/wp-admin', destination: '/', permanent: false },
      { source: '/homepage', destination: '/', permanent: true },

      // --- Old WordPress tag pages ---
      { source: '/tag/:slug', destination: '/', permanent: true },

      // --- Events sub-pages (old structure had /events/slug) ---
      { source: '/events/:slug', destination: '/:slug', permanent: true },

      // --- Trailing slash normalization for categories ---
      { source: '/category/spirits/', destination: '/category/brands', permanent: true },
      { source: '/category/wines/', destination: '/category/brands', permanent: true },
      { source: '/category/mocktails/', destination: '/category/cocktails', permanent: true },
      { source: '/category/interviews/', destination: '/category/people', permanent: true },
      { source: '/category/books/', destination: '/category/people', permanent: true },
      { source: '/category/news/', destination: '/category/events', permanent: true },
      { source: '/category/features/', destination: '/', permanent: true },
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
