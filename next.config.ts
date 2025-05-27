import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // サーバーサイドで使用する外部パッケージ（Next.js 15+の新しい設定）
  serverExternalPackages: ['sharp'],
  // 画像最適化の設定
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '9000',
        pathname: '/**',
      },
      {
        protocol: 'http',
        hostname: 'minio',
        port: '9000', 
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
