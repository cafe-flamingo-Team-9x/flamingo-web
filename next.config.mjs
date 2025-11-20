/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'lywrplxajfgqnauwdphc.supabase.co',
                pathname: '/storage/v1/object/public/**',
            },
            {
                protocol: 'https',
                hostname: 'encrypted-tbn0.gstatic.com',
            },
        ],
    },
    webpack: (config) => {
        config.module.rules.push({
            test: /\.css$/,
            use: ['style-loader', 'css-loader'],
        });
        return config;
    },
};

export default nextConfig;
