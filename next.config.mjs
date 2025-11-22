/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: [],
  output: 'export',
  basePath: '/snapshoot',
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
