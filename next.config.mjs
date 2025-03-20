/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    experimental: {
        serverActions: {
            allowedOrigins: ["kaabil.net", "localhost"],
        }
    },
    staticPageGenerationTimeout: 300,
    images: {
        unoptimized: true,
        domains: ['kaabil.net'],
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'kaabil.net',
                pathname: '/prgminer/**',
            },
        ],
    },
    eslint: {
        ignoreDuringBuilds: true,
    },
    env: {
        PORT: process.env.PORT || "3008", // Ensure it's a string
    },

    serverRuntimeConfig: {
        customServer: true
    },

    // Fix for the 404 errors
    basePath: process.env.NODE_ENV === "production" ? "/prgminer" : "",
    assetPrefix: process.env.NODE_ENV === "production" ? "/prgminer" : "",

    // Disable automatic rewrites as we're using basePath
    async rewrites() {
        return [];
    },

    // Add trailing slashes to ensure consistent path handling
    trailingSlash: true,

    // Ensure output is properly configured
    output: 'standalone',
    
    // Configure headers for CORS and caching
    async headers() {
        return [
            {
                source: '/:path*',
                headers: [
                    {
                        key: 'Access-Control-Allow-Origin',
                        value: '*',
                    },
                    {
                        key: 'Cache-Control',
                        value: 'public, max-age=3600',
                    },
                ],
            },
        ];
    },
}

export default nextConfig;

