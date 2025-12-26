import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ['whatsapp-web.js', 'puppeteer'],
  turbopack: {},
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals = config.externals || [];
      config.externals.push('whatsapp-web.js', 'puppeteer');
    }
    return config;
  },
  env: {
    DATABASE_URL: process.env.DATABASE_URL,
  }
};

export default nextConfig;


