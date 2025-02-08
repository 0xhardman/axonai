/** @type {import('next').NextConfig} */
const BE_API = process.env.NEXT_PUBLIC_BE_API
const nextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${BE_API}/:path*`,
      }
    ];
  },
  eslint: {
    ignoreDuringBuilds: true,

  },
}

module.exports = nextConfig
