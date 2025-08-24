import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // Improve HMR stability
    optimizePackageImports: ['lucide-react', 'recharts'],
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
};

export default nextConfig;
