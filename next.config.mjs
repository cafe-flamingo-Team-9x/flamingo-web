


/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    authInterrupts: true, // keep your experimental feature
  },

  webpack: (config) => {
    config.module.rules.push({
      test: /\.css$/,
      use: ['style-loader', 'css-loader'],
    });
    return config;
  },

  // ✅ Add this to allow Cloudinary images
  images: {
    domains: ['res.cloudinary.com'],
  },
};

export default nextConfig;
