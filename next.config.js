/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  compress: true,
  poweredByHeader: false,
  headers: async () => [
    {
      source: '/:path*',
      headers: [
        {
          key: 'X-Content-Type-Options',
          value: 'nosniff',
        },
        {
          key: 'X-Frame-Options',
          value: 'DENY',
        },
        {
          key: 'X-XSS-Protection',
          value: '1; mode=block',
        },
        {
          key: 'Referrer-Policy',
          value: 'strict-origin-when-cross-origin',
        },
        {
          key: 'Permissions-Policy',
          value: 'geolocation=(self), camera=(), microphone=(), payment=()',
        },
      ],
    },
    {
      source: '/api/health',
      headers: [
        {
          key: 'Cache-Control',
          value: 'no-store',
        },
      ],
    },
  ],
  redirects: async () => [
    {
      source: '/dashboard',
      destination: '/dashboard/overview',
      permanent: true,
    },
  ],
  rewrites: async () => ({
    beforeFiles: [
      {
        source: '/l/:slug',
        destination: '/visit/:slug',
      },
    ],
  }),
  typescript: {
    tsconfigPath: './tsconfig.json',
  },
  experimental: {
    optimizePackageImports: ['recharts', 'leaflet'],
  },
};

module.exports = nextConfig;
