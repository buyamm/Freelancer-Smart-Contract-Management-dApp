/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  webpack: (config) => {
    config.resolve.fallback = {
      fs: false,
      net: false,
      tls: false,
    };
    return config;
  },
  async redirects() {
    // Redirect to mock page in development
    if (process.env.NODE_ENV === 'development') {
      return [
        {
          source: '/',
          destination: '/mock',
          permanent: false,
        },
      ]
    }
    return []
  },
}

module.exports = nextConfig;