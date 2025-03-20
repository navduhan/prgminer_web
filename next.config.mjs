/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true, 
    basePath: process.env.NODE_ENV === "production" ? "/prgminer" : "",
    assetPrefix: process.env.NODE_ENV === "production" ? "/prgminer/" : "",

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
    

    publicRuntimeConfig: {
        basePath: "/prgminer",
    },




}

export default nextConfig;

