import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // Improve HMR stability
    optimizePackageImports: ['lucide-react', 'recharts'],
  },
  // Configure for production deployment
  output: 'standalone',
  // Disable linting and type checking during build for deployment
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  // Reduce memory usage and improve performance
  webpack: (config, { dev }) => {
    if (dev) {
      config.watchOptions = {
        ...config.watchOptions,
        poll: 1000,
        aggregateTimeout: 300,
      };
    }
    return config;
  },
  // Environment variables
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1',
  },
};

export default nextConfig;
