import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  serverExternalPackages: ['sql.js'],
  poweredByHeader: false,
};

export default nextConfig;
