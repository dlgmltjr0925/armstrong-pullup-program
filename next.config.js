/** @type {import('next').NextConfig} */
const withPWA = require('next-pwa')({
  dest: 'public',
});

const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  serverRuntimeConfig: {
    PROJECT_ROOT: __dirname,
  },
  env: {
    host: 'localhost',
    port: '3000',
  },
  basePath: process.env.NEXT_PUBLIC_BASE_PATH,
};

module.exports = withPWA(nextConfig);
