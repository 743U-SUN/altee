"use client";

import PrimaryClient from './PrimaryClient';
import Secondary from './secondary';
import { UserProfileData } from '../types';
import { UserImageBanner } from '../types/handle-types';

interface HandlePageClientProps {
  userData: UserProfileData;
  banners: UserImageBanner[];
}

export default function HandlePageClient({ userData, banners }: HandlePageClientProps) {
  const hasBanners = banners.length > 0;

  return (
    <div className="@container -m-4">
      <div className="flex flex-col @[824px]:flex-row @[824px]:items-start gap-4">
        {/* Primary Component - 824px以上ではsticky */}
        <div className="w-full h-[calc(100vh-11rem)] @[824px]:h-[calc(100vh-5rem)] @[824px]:w-[520px] @[824px]:sticky @[824px]:top-0 flex-shrink-0">
          <PrimaryClient handle={userData.handle!} hasBanners={hasBanners} banners={banners} />
        </div>
        
        {/* Secondary Component - メインコンテンツ */}
        <div className="flex-1">
          <Secondary userData={userData} />
        </div>
      </div>
    </div>
  );
}
