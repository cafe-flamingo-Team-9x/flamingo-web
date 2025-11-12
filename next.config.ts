import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  experimental: {
    authInterrupts: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lywrplxajfgqnauwdphc.supabase.co',
      },
    ],
  },
};

export default nextConfig;
