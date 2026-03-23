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
      { source: '/category/spirits', destination: '/category/brands', permanent: true },
      { source: '/category/wines', destination: '/category/brands', permanent: true },
      { source: '/category/mocktails', destination: '/category/cocktails', permanent: true },
      { source: '/category/interviews', destination: '/category/people', permanent: true },
      { source: '/category/books', destination: '/category/people', permanent: true },
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
