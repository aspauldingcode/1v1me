/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: (() => {
          const base = process.env.BACKEND_URL || 'http://localhost:8080/api';
          return base.replace(/\/$/, '') + '/:path*';
        })(),
      },
    ]
  },
}

module.exports = nextConfig

