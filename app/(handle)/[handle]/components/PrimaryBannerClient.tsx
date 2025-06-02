"use client";

import { useState, useEffect } from 'react';
import { OptimizedImage } from '@/components/ui/optimized-image';
import { convertToProxyUrl } from '@/lib/utils/image-proxy';
import { UserImageBanner } from '../types/handle-types';

interface PrimaryBannerClientProps {
  banners: UserImageBanner[];
}

export default function PrimaryBannerClient({ banners }: PrimaryBannerClientProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  // オートプレイ機能
  useEffect(() => {
    if (banners.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => 
        prevIndex === banners.length - 1 ? 0 : prevIndex + 1
      );
    }, 6000); // 6秒間隔で切り替え

    return () => clearInterval(interval);
  }, [banners.length]);


  if (banners.length === 0) {
    return null;
  }

  const handleBannerClick = (banner: UserImageBanner) => {
    if (banner.url) {
      window.open(banner.url, '_blank');
    }
  };

  return (
    <div className="w-full h-full p-4">
      {/* 高さと幅の両方の制約を考慮して3:1の比率を保つ */}
      <div className="h-full flex items-start justify-start">
        <div 
          className="relative rounded-lg overflow-hidden"
          style={{ 
            // 高さは親要素の80%を最大とする
            height: '80%',
            // アスペクト比3:1を保つ
            aspectRatio: '3/1',
            // 幅は親要素の80%を最大とする
            maxWidth: '80%'
          }}
        >
          {/* カルーセル画像 */}
          {banners.map((banner, index) => (
            <div
              key={banner.id}
              className={`absolute inset-0 transition-opacity duration-500 ${
                index === currentIndex ? 'opacity-100' : 'opacity-0'
              }`}
            >
              <OptimizedImage
                src={convertToProxyUrl(banner.imgUrl)}
                alt={banner.alt || `バナー ${index + 1}`}
                fill
                className={`object-cover ${
                  banner.url ? 'cursor-pointer hover:scale-105 transition-transform duration-300' : ''
                }`}
                onClick={() => handleBannerClick(banner)}
                priority={index === 0}
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px"
              />
            </div>
          ))}
          
          {/* インディケーター（複数のバナーがある場合のみ表示） */}
          {banners.length > 1 && (
            <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 z-10">
              <div className="flex space-x-2 bg-black/20 px-2 py-1 rounded-full">
                {banners.map((_, index) => (
                  <button
                    key={index}
                    className={`w-2 h-2 rounded-full transition-all duration-200 ${
                      index === currentIndex 
                        ? 'bg-white w-6' 
                        : 'bg-white/50 hover:bg-white/70'
                    }`}
                    onClick={() => setCurrentIndex(index)}
                    aria-label={`バナー ${index + 1} に移動`}
                  />
                ))}
              </div>
            </div>
          )}

          {/* 前後の矢印（複数のバナーがある場合のみ表示） */}
          {banners.length > 1 && (
            <>
              <button
                className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white p-2 rounded-full transition-all duration-200 z-10"
                onClick={() => 
                  setCurrentIndex(currentIndex === 0 ? banners.length - 1 : currentIndex - 1)
                }
                aria-label="前のバナー"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </button>
              <button
                className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white p-2 rounded-full transition-all duration-200 z-10"
                onClick={() => 
                  setCurrentIndex(currentIndex === banners.length - 1 ? 0 : currentIndex + 1)
                }
                aria-label="次のバナー"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
