"use client";

import { useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import PrimaryBanner from './primaryBanner';
import PrimaryImages from './primaryImages';

export default function Primary() {
  const params = useParams();
  const handle = params.handle as string;
  const [hasBanners, setHasBanners] = useState<boolean | null>(null);

  // バナーの有無をチェック
  useEffect(() => {
    const checkBanners = async () => {
      try {
        const response = await fetch(`/api/users/${handle}/banners`);
        if (response.ok) {
          const data = await response.json();
          setHasBanners(data.banners && data.banners.length > 0);
        } else {
          setHasBanners(false);
        }
      } catch (error) {
        console.error('Failed to check banners:', error);
        setHasBanners(false);
      }
    };

    if (handle) {
      checkBanners();
    }
  }, [handle]);

  // ローディング中は既存のレイアウトを表示
  if (hasBanners === null) {
    return (
      <div className="h-full flex flex-col">
        <div className="h-[16vh] flex-shrink-0">
          <PrimaryBanner handle={handle} />
        </div>
        <div className="h-[84vh] md:h-[calc(84vh-4rem)] flex-1">
          <PrimaryImages handle={handle} />
        </div>
      </div>
    );
  }

  // バナーがある場合
  if (hasBanners) {
    return (
      <div className="h-full flex flex-col">
        {/* Header Section - 16% */}
        <div className="h-[16vh] flex-shrink-0">
          <PrimaryBanner handle={handle} />
        </div>
        
        {/* Main Section - 84% */}
        <div className="h-[84vh] md:h-[calc(84vh-4rem)] flex-1">
          <PrimaryImages handle={handle} />
        </div>
      </div>
    );
  }

  // バナーがない場合 - 画像エリアを100%に
  return (
    <div className="h-full">
      <PrimaryImages handle={handle} />
    </div>
  );
}
