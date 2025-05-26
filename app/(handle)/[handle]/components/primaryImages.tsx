"use client";

import { useState, useEffect } from 'react';
import { OptimizedImage } from '@/components/ui/optimized-image';

interface UserImageCarousel {
  id: string;
  url?: string;
  imgUrl: string;
  alt?: string;
  sortOrder: number;
}

interface PrimaryImagesProps {
  handle: string;
}

export default function PrimaryImages({ handle }: PrimaryImagesProps) {
  const [images, setImages] = useState<UserImageCarousel[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  // 画像データを取得
  useEffect(() => {
    const fetchImages = async () => {
      try {
        const response = await fetch(`/api/users/${handle}/carousel`);
        if (response.ok) {
          const data = await response.json();
          // sortOrderでソート
          const sortedImages = (data.images || []).sort((a: UserImageCarousel, b: UserImageCarousel) => 
            a.sortOrder - b.sortOrder
          );
          setImages(sortedImages);
        }
      } catch (error) {
        console.error('Failed to fetch carousel images:', error);
      } finally {
        setLoading(false);
      }
    };

    if (handle) {
      fetchImages();
    }
  }, [handle]);

  if (loading) {
    return (
      <div className="w-full h-full p-4 flex justify-center">
        <div className="w-auto h-full bg-gray-100 animate-pulse rounded-lg" style={{ aspectRatio: '9/16' }}>
          <div className="w-full h-full bg-gray-200 rounded-lg" />
        </div>
      </div>
    );
  }

  if (images.length === 0) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <p className="text-gray-400 text-sm">画像が登録されていません</p>
      </div>
    );
  }

  const handleImageClick = (image: UserImageCarousel) => {
    if (image.url) {
      window.open(image.url, '_blank');
    }
  };

  const currentImage = images[currentIndex];

  // 1つの画像の場合：中央寄せ
  if (images.length === 1) {
    return (
      <div className="w-full h-full p-4 flex justify-center items-center">
        <div className="relative w-auto h-full max-w-full" style={{ aspectRatio: '9/16' }}>
          <OptimizedImage
            src={currentImage.imgUrl}
            alt={currentImage.alt || 'ユーザー画像'}
            fill
            className={`object-contain rounded-lg ${
              currentImage.url ? 'cursor-pointer hover:scale-105 transition-transform duration-300' : ''
            }`}
            onClick={() => handleImageClick(currentImage)}
            priority
            sizes="(max-width: 768px) 80vw, 300px"
          />
        </div>
      </div>
    );
  }

  // 複数の画像の場合：右側にボタン
  return (
    <div className="w-full h-full p-4 md:pr-0 flex">
      {/* メイン画像 */}
      <div className="flex justify-center items-center" style={{ width: 'calc(100% - 48px)' }}>
        <div className="relative w-auto h-full max-w-full" style={{ aspectRatio: '9/16' }}>
          <OptimizedImage
            src={currentImage.imgUrl}
            alt={currentImage.alt || `ユーザー画像 ${currentIndex + 1}`}
            fill
            className={`object-contain rounded-lg transition-opacity duration-300 ${
              currentImage.url ? 'cursor-pointer hover:scale-105 transition-transform duration-300' : ''
            }`}
            onClick={() => handleImageClick(currentImage)}
            priority={currentIndex === 0}
            sizes="(max-width: 768px) 80vw, 300px"
          />
        </div>
      </div>

      {/* 右側の番号ボタン */}
      <div className="flex flex-col justify-center space-y-1.5 w-12 items-center">
        {images.map((_, index) => (
          <button
            key={index}
            className={`w-8 h-8 rounded-md border-2 font-medium text-xs transition-all duration-200 ${
              index === currentIndex
                ? 'bg-gray-500 text-white border-gray-500 scale-110'
                : 'bg-white text-gray-600 border-gray-300 hover:border-blue-400 hover:text-blue-600'
            }`}
            onClick={() => setCurrentIndex(index)}
          >
            {index + 1}
          </button>
        ))}
      </div>
    </div>
  );
}
