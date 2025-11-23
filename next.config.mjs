/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: [],
  output: 'export',
  basePath: process.env.NODE_ENV === 'production' ? '/snapshoot' : '',
  images: {
    unoptimized: true,
  },
  webpack: (config, { isServer }) => {
    // @apps-in-toss/web-framework를 선택적 의존성으로 처리
    config.resolve.fallback = {
      ...config.resolve.fallback,
      '@apps-in-toss/web-framework': false,
    };

    return config;
  },
};

export default nextConfig;
