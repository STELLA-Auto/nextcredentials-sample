import 'dotenv/config';

/** @type {import('next').NextConfig} */
const nextConfig = {
    env: {
        AUTH0_DOMAIN: process.env.AUTH0_DOMAIN,
        AUTH0_CLIENT_ID: process.env.AUTH0_CLIENT_ID,
        AUTH0_CLIENT_SECRET: process.env.AUTH0_CLIENT_SECRET,
        AUTH0_CONNECTION: process.env.AUTH0_CONNECTION,
        NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
        NEXTAUTH_URL: process.env.NEXTAUTH_URL,
    }
};

export default nextConfig;
