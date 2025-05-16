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
        destination: 'https://habitvault-pd08.onrender.com/api/:path*',
      },
    ];
  },
};

module.exports = nextConfig; 