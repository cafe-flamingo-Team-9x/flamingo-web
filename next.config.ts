import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    authInterrupts: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lywrplxajfgqnauwdphc.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
      {
        protocol: "https",
        hostname: "encrypted-tbn0.gstatic.com",
      },
    ],
  },
  webpack: (config) => {
    config.module.rules.push({
      test: /\.css$/, // preserve existing ability to handle vendor CSS via style-loader
      use: ["style-loader", "css-loader"],
    });
    return config;
  },
};

export default nextConfig;
