"use client";

import { useState, useEffect } from 'react';
import { OptimizedImage } from '@/components/ui/optimized-image';

interface UserImageBanner {
  id: string;
  url?: string;
  imgUrl: string;
  alt?: string;
  sortOrder: number;
}

interface PrimaryBannerProps {
  handle: string;
}

export default function PrimaryBanner({ handle }: PrimaryBannerProps) {
  const [banners, setBanners] = useState<UserImageBanner[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  // バナーデータを取得
  useEffect(() => {
    const fetchBanners = async () => {
      try {
        const response = await fetch(`/api/users/${handle}/banners`);
        if (response.ok) {
          const data = await response.json();
          setBanners(data.banners || []);
        }
      } catch (error) {
        console.error('Failed to fetch banners:', error);
      } finally {
        setLoading(false);
      }
    };

    if (handle) {
      fetchBanners();
    }
  }, [handle]);

  // オートプレイ機能
  useEffect(() => {
    if (banners.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => 
        prevIndex === banners.length - 1 ? 0 : prevIndex + 1
      );
    }, 6000); // 5秒間隔で切り替え

    return () => clearInterval(interval);
  }, [banners.length]);

  if (loading) {
    return (
      <div className="w-[64%] h-full flex items-center">
        <div className="w-full rounded-lg bg-gray-100 animate-pulse" style={{ aspectRatio: '3/1' }}>
          <div className="w-full h-full bg-gray-200 rounded-lg" />
        </div>
      </div>
    );
  }

  if (banners.length === 0) {
    return null;
  }

  const handleBannerClick = (banner: UserImageBanner) => {
    if (banner.url) {
      window.open(banner.url, '_blank');
    }
  };

  return (
    <div className="w-[64%] pl-4 h-full flex items-center">
      {/* バナー画像 */}
      <div 
        className="w-full relative rounded-lg overflow-hidden"
        style={{ aspectRatio: '3/1' }}
      >
        {banners.map((banner, index) => (
          <div
            key={banner.id}
            className={`absolute inset-0 transition-opacity duration-500 ${
              index === currentIndex ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <OptimizedImage
              src={banner.imgUrl}
              alt={banner.alt || `バナー ${index + 1}`}
              fill
              className={`object-cover rounded-lg ${
                banner.url ? 'cursor-pointer hover:scale-105 transition-transform duration-300' : ''
              }`}
              onClick={() => handleBannerClick(banner)}
              priority={index === 0}
              sizes="(max-width: 768px) 100vw, 400px"
            />
          </div>
        ))}
        {/* インディケーター（複数のバナーがある場合のみ表示） */}
        {banners.length > 1 && (
          <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2">
            <div className="flex space-x-2">
              {banners.map((_, index) => (
                <button
                  key={index}
                  className={`w-2 h-2 rounded-full transition-colors duration-200 ${
                    index === currentIndex ? 'bg-white' : 'bg-white/50'
                  }`}
                  onClick={() => setCurrentIndex(index)}
                />
              ))}
            </div>
          </div>
        )}

        {/* 前後の矢印（複数のバナーがある場合のみ表示） */}
        {banners.length > 1 && (
          <>
            <button
              className="absolute left-0 top-1/2 transform -translate-y-1/2 bg-black/20 hover:bg-black/40 text-white p-2 rounded-full transition-colors duration-200"
              onClick={() => 
                setCurrentIndex(currentIndex === 0 ? banners.length - 1 : currentIndex - 1)
              }
            >
              <svg
                className="w-4 h-4"
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
              className="absolute right-0 top-1/2 transform -translate-y-1/2 bg-black/20 hover:bg-black/40 text-white p-2 rounded-full transition-colors duration-200"
              onClick={() => 
                setCurrentIndex(currentIndex === banners.length - 1 ? 0 : currentIndex + 1)
              }
            >
              <svg
                className="w-4 h-4"
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
  );
}
