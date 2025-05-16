/** @type {import('next').NextConfig} */
const nextConfig = {
  // Skip validation completely during build
  typescript: {
    ignoreBuildErrors: true,
  },
  // Skip ESLint checking during build
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Run in development mode
  reactStrictMode: false,
  // Configure API proxy
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:5000/api/:path*',
      },
    ];
  },
};

module.exports = nextConfig; 