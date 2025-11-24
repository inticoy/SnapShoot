/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: [],
  output: 'export',
  basePath: process.env.NODE_ENV === 'production' ? '/snapshoot' : '',
  assetPrefix: process.env.NODE_ENV === 'production' ? '/snapshoot' : '',
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
