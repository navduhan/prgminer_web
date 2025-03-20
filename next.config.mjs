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

    publicRuntimeConfig: {
        basePath: process.env.NODE_ENV === "production" ? "/prgminer" : "",
    },

    basePath: process.env.NODE_ENV === "production" ? "/prgminer" : "",

    async rewrites() {
        return [
            {
                source: "/prgminer/api/:path*",
                destination: "/api/:path*",
            },
            {
                source: "/prgminer/:path*",
                destination: "/:path*",
            },
        ];
    },
}

export default nextConfig;

