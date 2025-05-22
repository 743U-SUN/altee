import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // FormDataのサイズ制限を設定（デフォルト: 1MB）
    serverComponentsExternalPackages: ['sharp'],
  },
  // APIルートのボディサイズ制限
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
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
