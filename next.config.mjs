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



    basePath: process.env.NODE_ENV === "production" ? "/prgminer" : "",
    assetPrefix: process.env.NODE_ENV === "production" ? "/prgminer" : "",

    // Disable automatic rewrites as we're using basePath
    async rewrites() {
        return [];
    },


}

export default nextConfig;

