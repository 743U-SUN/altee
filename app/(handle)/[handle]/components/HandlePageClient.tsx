"use client";

import { useEffect } from 'react';
import Primary from './primary';
import Secondary from './secondary';
import { UserProfileData } from '../types';

interface HandlePageClientProps {
  handle: string;
  userData: UserProfileData;
}

export default function HandlePageClient({ handle, userData }: HandlePageClientProps) {
  // ページアクセス時にYouTube動画の自動更新をチェック
  useEffect(() => {
    const checkYouTubeUpdate = async () => {
      try {
        // バックグラウンドで自動更新APIを呼び出し
        const response = await fetch('/api/youtube/auto-update', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ handle }),
        });
        
        if (response.ok) {
          const result = await response.json();
          // 成功時のみ簡潔にログ出力
          if (result.success && result.videoCount > 0) {
            console.log(`YouTube動画を${result.videoCount}件自動更新しました`);
          }
        }
      } catch (error) {
        // エラーハンドリング（ページには影響させない）
        // console.log('YouTube動画の更新チェックでエラー:', error);
      }
    };

    if (handle) {
      checkYouTubeUpdate();
    }
  }, [handle]);

  return (
    <div className="@container -m-4">
      <div className="flex flex-col @[824px]:flex-row @[824px]:items-start gap-4">
        {/* Primary Component - 768px以上ではsticky */}
        <div className="w-full h-[calc(100vh-11rem)] @[824px]:h-[calc(100vh-5rem)] @[824px]:w-[400px] @[824px]:sticky @[824px]:top-0 flex-shrink-0">
          <Primary />
        </div>
        
        {/* Secondary Component - メインコンテンツ */}
        <div className="flex-1">
          <Secondary userData={userData} />
        </div>
      </div>
    </div>
  );
}
