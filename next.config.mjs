/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: [],
  output: 'export',
  // GitHub Pages 배포 시에만 basePath 적용 (개발 환경에서는 제외)
  basePath: process.env.NODE_ENV === 'production' ? '/snapshoot' : '',
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
