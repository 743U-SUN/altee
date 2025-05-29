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
      // Amazon画像用の設定（具体的なドメインのみ）
      {
        protocol: 'https',
        hostname: 'm.media-amazon.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images-na.ssl-images-amazon.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images-fe.ssl-images-amazon.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images-eu.ssl-images-amazon.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images-cn.ssl-images-amazon.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'ws-fe.amazon-adsystem.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'ir-jp.amazon-adsystem.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'i.ebayimg.com',
        pathname: '/**',
      },
      // より多くの具体的なAmazonドメイン
      {
        protocol: 'https',
        hostname: 'images-amazon.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'ecx.images-amazon.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.media-amazon.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'ws-ap.amazon-adsystem.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'ir-ap.amazon-adsystem.com',
        pathname: '/**',
      },
      // Amazon.co.jpの直接的な画像URL
      {
        protocol: 'https',
        hostname: 'amazon.co.jp',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'www.amazon.co.jp',
        pathname: '/**',
      },
      // その他のAmazonドメイン
      {
        protocol: 'https',
        hostname: 'a0.awsstatic.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 's3.amazonaws.com',
        pathname: '/**',
      },
      // 一般的なAmazon CDNドメイン
      {
        protocol: 'https',
        hostname: 'images.media-amazon.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'cc0.eorzeaimages.com',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;