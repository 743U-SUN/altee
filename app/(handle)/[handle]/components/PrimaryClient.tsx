"use client";

import PrimaryBannerClient from './PrimaryBannerClient';
import PrimaryImages from './primaryImages';
import { UserImageBanner } from '../types/handle-types';

interface PrimaryClientProps {
  handle: string;
  hasBanners: boolean;
  banners: UserImageBanner[];
}

export default function PrimaryClient({ handle, hasBanners, banners }: PrimaryClientProps) {
  // バナーがある場合
  if (hasBanners) {
    return (
      <div className="h-full flex flex-col">
        {/* Header Section - 16% */}
        <div className="h-[16vh] flex-shrink-0">
          <PrimaryBannerClient banners={banners} />
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