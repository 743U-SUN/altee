"use client";

import Image, { ImageProps } from 'next/image';

interface OptimizedImageProps extends ImageProps {
  forceUnoptimized?: boolean;
}

export function OptimizedImage({ forceUnoptimized, ...props }: OptimizedImageProps) {
  // 開発環境では画像最適化を無効化
  const unoptimized = forceUnoptimized || process.env.NODE_ENV === 'development';
  
  return <Image {...props} unoptimized={unoptimized} />;
}
