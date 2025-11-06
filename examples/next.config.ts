import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  // basePath only needed for production GitHub Pages deployment
  basePath: process.env.NODE_ENV === 'production' ? '/chartlite' : '',
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
