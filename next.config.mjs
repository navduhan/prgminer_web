/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    experimental: {
        serverActions: {
            allowedOrigins: ["*"],
        }
    },
    staticPageGenerationTimeout: 300,
    images: {
        unoptimized: true,
        domains: ['kaabil.net'],
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
}

export default nextConfig;

