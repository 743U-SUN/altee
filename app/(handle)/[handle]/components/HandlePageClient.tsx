"use client";

import PrimaryClient from './PrimaryClient';
import Secondary from './secondary';
import { UserProfileData } from '../types';
import { UserImageBanner } from '../types/handle-types';
import type { UserPageBackground, PatternType } from '@/types/background';

// パターンスタイルを動的に生成
function getPatternStyle(patternType: PatternType, size: number) {
  const baseSize = size * 10; // 基本サイズ
  
  switch (patternType) {
    case "dots":
      return {
        backgroundImage: `radial-gradient(circle, currentColor ${size}px, transparent ${size}px)`,
        backgroundSize: `${baseSize}px ${baseSize}px`
      };
    case "stripes-vertical":
      return {
        backgroundImage: `repeating-linear-gradient(
          90deg,
          currentColor,
          currentColor ${size * 2}px,
          transparent ${size * 2}px,
          transparent ${baseSize}px
        )`
      };
    case "stripes-horizontal":
      return {
        backgroundImage: `repeating-linear-gradient(
          0deg,
          currentColor,
          currentColor ${size * 2}px,
          transparent ${size * 2}px,
          transparent ${baseSize}px
        )`
      };
    case "stripes-diagonal":
      return {
        backgroundImage: `repeating-linear-gradient(
          45deg,
          currentColor,
          currentColor ${size * 2}px,
          transparent ${size * 2}px,
          transparent ${baseSize * 1.414}px
        )`
      };
    case "stripes-diagonal-reverse":
      return {
        backgroundImage: `repeating-linear-gradient(
          -45deg,
          currentColor,
          currentColor ${size * 2}px,
          transparent ${size * 2}px,
          transparent ${baseSize * 1.414}px
        )`
      };
    case "geometric":
      return {
        backgroundImage: `
          linear-gradient(45deg, currentColor 25%, transparent 25%, transparent 75%, currentColor 75%, currentColor),
          linear-gradient(45deg, currentColor 25%, transparent 25%, transparent 75%, currentColor 75%, currentColor)
        `,
        backgroundSize: `${baseSize * 2}px ${baseSize * 2}px`,
        backgroundPosition: `0 0, ${baseSize}px ${baseSize}px`
      };
    case "grid":
      return {
        backgroundImage: `
          linear-gradient(currentColor 1px, transparent 1px),
          linear-gradient(90deg, currentColor 1px, transparent 1px)
        `,
        backgroundSize: `${baseSize * 2}px ${baseSize * 2}px`
      };
    case "grid-bold":
      return {
        backgroundImage: `
          linear-gradient(currentColor ${size * 10}px, transparent ${size * 10}px),
          linear-gradient(90deg, currentColor ${size * 10}px, transparent ${size * 10}px)
        `,
        backgroundSize: `${baseSize * 4}px ${baseSize * 4}px`
      };
    default:
      return {};
  }
}

interface HandlePageClientProps {
  userData: UserProfileData;
  banners: UserImageBanner[];
  backgroundSettings: UserPageBackground | null;
}

export default function HandlePageClient({ userData, banners, backgroundSettings }: HandlePageClientProps) {
  const hasBanners = banners.length > 0;

  // 背景クラスの生成
  const getBackgroundClasses = () => {
    if (!backgroundSettings) return "relative";
    
    if (backgroundSettings.backgroundType === "pattern" && backgroundSettings.patternType) {
      return "relative";
    }
    
    return "relative";
  };
  
  // 背景スタイルの生成
  const getBackgroundStyle = () => {
    if (!backgroundSettings) {
      return { backgroundColor: "#ffffff" };
    }
    
    return {
      backgroundColor: backgroundSettings.backgroundColor
    };
  };

  return (
    <div className={`@container -m-4 ${getBackgroundClasses()}`} style={getBackgroundStyle()}>
      {/* パターンオーバーレイ */}
      {backgroundSettings?.backgroundType === "pattern" && backgroundSettings.patternType && (
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            color: `${backgroundSettings.patternColor}${Math.round((backgroundSettings.patternOpacity || 0.1) * 255).toString(16).padStart(2, '0')}`,
            ...getPatternStyle(backgroundSettings.patternType, backgroundSettings.patternSize || 1.0)
          }}
        />
      )}
      
      <div className="flex flex-col @[824px]:flex-row @[824px]:items-start gap-4 relative z-10">
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
