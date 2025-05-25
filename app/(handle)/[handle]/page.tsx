"use client"

import { useEffect } from 'react';
import { useParams } from 'next/navigation';

export default function HandlePage() {
  const params = useParams();
  const handle = params.handle as string;

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
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">ダッシュボードTOP</h1>
      <p>ダッシュボードのメインページです。</p>
      <p className="text-sm text-gray-500 mt-4">
        ハンドル: {handle}
      </p>
    </div>
  );
}