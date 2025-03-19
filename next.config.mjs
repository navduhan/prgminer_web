/** @type {import('next').NextConfig} */
const nextConfig = {
   
    reactStrictMode: true,
    experimental: {
        serverActions: {
            allowedOrigins: [
                "https://kaabil.net",
                "https://bioinfo.usu.edu",
                "http://localhost:3008"
                
            ],
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
        basePath: process.env.NODE_ENV === "production" ? "/PRGminer" : "",
    },

    basePath: process.env.NODE_ENV === "production" ? "/PRGminer" : "",

    async rewrites() {
        return [
            {
                source: "/PRGminer/api/:path*",
                destination: "/api/:path*",
            },
            {
                source: "/PRGminer/:path*",
                destination: "/:path*",
            },
        ];
    },
}

export default nextConfig;

