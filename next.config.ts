import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    unoptimized: true,
  },
  experimental: {
    optimizePackageImports: ['@next/font'],
  },
};

export default nextConfig;
