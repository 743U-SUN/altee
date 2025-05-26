/**
 * Next.js Imageコンポーネントのラッパー
 * 開発環境と本番環境で自動的に最適化を切り替える
 */

import Image, { ImageProps } from 'next/image';
import { cn } from '@/lib/utils';

interface OptimizedImageProps extends Omit<ImageProps, 'unoptimized'> {
  /**
   * 強制的に最適化を無効にする場合はtrue
   * 通常は環境に応じて自動設定されるので不要
   */
  forceUnoptimized?: boolean;
}

export const OptimizedImage: React.FC<OptimizedImageProps> = ({
  className,
  forceUnoptimized = false,
  ...props
}) => {
  // 開発環境またはforceUnoptimizedがtrueの場合は最適化を無効化
  const shouldUnoptimize = process.env.NODE_ENV === 'development' || forceUnoptimized;

  return (
    <Image
      {...props}
      className={cn(className)}
      unoptimized={shouldUnoptimize}
    />
  );
};

// デフォルトエクスポートも提供
export default OptimizedImage;
