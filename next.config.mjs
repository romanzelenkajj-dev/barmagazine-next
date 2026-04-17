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
      // NOTE: romanzelenka-wjgek.wpcomstaging.com removed — all image URLs
      // are now rewritten to barmagazine.com via sanitizeResponse() in wordpress.ts
    ],
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
      // /category/latest — users click "Latest" nav link expecting this path
      { source: '/category/latest', destination: '/', permanent: true },

      // Broken bar slugs — old URLs with accented/garbled characters redirected to clean ASCII slugs
      { source: '/bars/m%C3%A9lange-by-cali-sober', destination: '/bars/melange-by-cali-sober', permanent: true },
      { source: '/bars/mlange-by-cali-sober', destination: '/bars/melange-by-cali-sober', permanent: true },
      { source: '/bars/caf%C3%A9-de-nadie', destination: '/bars/cafe-de-nadie', permanent: true },
      { source: '/bars/caf%C3%A9-la-trova', destination: '/bars/cafe-la-trova', permanent: true },
      { source: '/bars/comp%C3%A8re-lapin', destination: '/bars/compere-lapin', permanent: true },
      { source: '/bars/deux-fr%C3%A8res', destination: '/bars/deux-freres', permanent: true },
      { source: '/bars/m%C3%ADrate', destination: '/bars/mirate', permanent: true },
      { source: '/bars/virt%C3%B9', destination: '/bars/virtu', permanent: true },
      { source: '/bars/alqu-mico', destination: '/bars/alquimico', permanent: true },
      { source: '/bars/bar-des-prs', destination: '/bars/bar-des-pres', permanent: true },
      { source: '/bars/bar-le-mal-ncessaire', destination: '/bars/bar-le-mal-necessaire', permanent: true },
      { source: '/bars/bootlegger-cocktail-bar-cuisine-montral', destination: '/bars/bootlegger-cocktail-bar-cuisine-montreal', permanent: true },
      { source: '/bars/caf-de-la-paix', destination: '/bars/cafe-de-la-paix', permanent: true },
      { source: '/bars/caf-pacifico', destination: '/bars/cafe-pacifico', permanent: true },
      { source: '/bars/barmnster', destination: '/bars/barmunster', permanent: true },
      { source: '/bars/florera-atlntico', destination: '/bars/floreria-atlantico', permanent: true },
      { source: '/bars/kw%C3%A3nt', destination: '/bars/kwant', permanent: true },

      // Old WordPress pages
      { source: '/trending', destination: '/', permanent: true },
      { source: '/about', destination: '/work-with-us', permanent: true },
      { source: '/contact', destination: '/work-with-us', permanent: true },
      { source: '/homepage', destination: '/', permanent: true },

      // FIX: intuitive URLs that were returning 404 — users type these, external sites link to them
      { source: '/bar-directory', destination: '/bars', permanent: true },
      { source: '/list-your-bar', destination: '/claim-your-bar', permanent: true },
      { source: '/cocktails', destination: '/category/cocktails', permanent: true },
      { source: '/privacy-policy', destination: '/privacy', permanent: true },
      { source: '/advertise', destination: '/work-with-us', permanent: true },

      // Specific bar pages that 404 — redirect to bar directory
      { source: '/bars/the-dead-rabbit', destination: '/bars', permanent: true },

      // /home and /home/ → homepage
      { source: '/home', destination: '/', permanent: true },
      { source: '/home/', destination: '/', permanent: true },

      // Category pages that 404 — redirect to closest equivalent
      { source: '/category/wine', destination: '/category/brands', permanent: true },
      { source: '/category/wine/', destination: '/category/brands', permanent: true },
      { source: '/category/interview', destination: '/category/people', permanent: true },
      { source: '/category/interview/', destination: '/category/people', permanent: true },

      // Paginated article pages → canonical article URL
      { source: '/:slug/2', destination: '/:slug', permanent: true },
      { source: '/:slug/3', destination: '/:slug', permanent: true },
      { source: '/:slug/4', destination: '/:slug', permanent: true },
      { source: '/:slug/5', destination: '/:slug', permanent: true },

      // Author pages (no equivalent in new site)
      { source: '/author/:slug', destination: '/', permanent: true },

      // Tag pages (no equivalent in new site)
      { source: '/tag/:slug', destination: '/', permanent: true },

      // Specific /events/* redirects — MUST come before the /events/:slug catch-all below
      { source: '/events/the-worlds-50-best-bars-2025-live-from-hong-kong', destination: '/worlds-50-best-bars-2025-bar-leone-tops-the-list', permanent: true },
      { source: '/events/the-worlds-50-best-bars-2025-live-from-hong-kong/', destination: '/worlds-50-best-bars-2025-bar-leone-tops-the-list', permanent: true },

      // Old event sub-pages → article slugs
      { source: '/events/:slug', destination: '/:slug', permanent: true },

      // Article URL fixes — truncated slugs shared in the wild
      // BCA 2026: people shared /bartenders-choice-awards-2026 (truncated from the full slug)
      { source: '/bartenders-choice-awards-2026', destination: '/bartenders-choice-awards-2026-all-the-winners', permanent: true },

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
      // Sitemap index — replaces the Next.js auto-generated /sitemap.xml
      // with a proper <sitemapindex> referencing all three sub-sitemaps.
      {
        source: '/sitemap.xml',
        destination: '/api/sitemap-index',
      },
      // Articles sub-sitemap (WordPress posts + static pages + category pages)
      {
        source: '/sitemap-articles.xml',
        destination: '/api/sitemap-articles',
      },
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
