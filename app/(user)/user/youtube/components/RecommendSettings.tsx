'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Plus, GripVertical, Info, Trash2, Youtube, Link } from 'lucide-react';
import { toast } from 'sonner';

interface RecommendVideo {
  id: string;
  url: string;
  thumbnailUrl?: string;
  title?: string;
  description?: string;
  sortOrder: number;
}

interface RecommendSettingsProps {
  userId: string;
}

export function RecommendSettings({ userId }: RecommendSettingsProps) {
  const [videos, setVideos] = useState<RecommendVideo[]>([]);
  const [newVideoUrl, setNewVideoUrl] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [isDeletingId, setIsDeletingId] = useState<string | null>(null);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  // おすすめ動画を取得
  const fetchRecommendVideos = async () => {
    try {
      const response = await fetch(`/api/youtube/recommend?userId=${userId}`);
      if (response.ok) {
        const data = await response.json();
        setVideos(data.videos || []);
      }
    } catch (error) {
      console.error('おすすめ動画の取得に失敗:', error);
      toast.error('おすすめ動画の取得に失敗しました');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRecommendVideos();
  }, [userId]);

  // YouTube URLからビデオIDを抽出
  const extractVideoId = (url: string): string | null => {
    const patterns = [
      /(?:https?:\/\/)?(?:www\.)?youtube\.com\/watch\?v=([^&]+)/,
      /(?:https?:\/\/)?(?:www\.)?youtu\.be\/([^?]+)/,
      /(?:https?:\/\/)?(?:www\.)?youtube\.com\/embed\/([^?]+)/,
    ];
    
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) return match[1];
    }
    return null;
  };

  // URLの検証
  const isValidYouTubeUrl = (url: string): boolean => {
    return extractVideoId(url) !== null;
  };

  // 新しい動画を追加
  const handleAddVideo = async () => {
    if (!newVideoUrl.trim()) {
      toast.error('YouTube URLを入力してください');
      return;
    }

    if (!isValidYouTubeUrl(newVideoUrl)) {
      toast.error('有効なYouTube URLを入力してください');
      return;
    }

    if (videos.length >= 5) {
      toast.error('おすすめ動画は最大5つまでです');
      return;
    }

    try {
      setIsAdding(true);

      const response = await fetch('/api/youtube/recommend', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          url: newVideoUrl.trim(),
          sortOrder: videos.length,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'レスポンスの解析に失敗' }));
        throw new Error(errorData.error || '動画の追加に失敗しました');
      }

      const result = await response.json();
      setVideos(prev => [...prev, result.video]);
      setNewVideoUrl('');
      
      toast.success('おすすめ動画を追加しました');
    } catch (error) {
      console.error('動画の追加に失敗:', error);
      toast.error(error instanceof Error ? error.message : '動画の追加に失敗しました');
    } finally {
      setIsAdding(false);
    }
  };

  // 動画を削除
  const handleDeleteVideo = async (videoId: string) => {
    try {
      setIsDeletingId(videoId);

      const response = await fetch('/api/youtube/recommend', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId, videoId }),
      });

      if (!response.ok) {
        throw new Error('削除に失敗しました');
      }

      // 動画を削除して並び順を更新
      setVideos(prev => {
        const filtered = prev.filter(video => video.id !== videoId);
        return filtered.map((video, index) => ({
          ...video,
          sortOrder: index
        }));
      });

      toast.success('おすすめ動画を削除しました');
    } catch (error) {
      console.error('削除に失敗:', error);
      toast.error('削除に失敗しました');
    } finally {
      setIsDeletingId(null);
    }
  };

  // ドラッグ&ドロップで並び替え
  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = async (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    
    if (draggedIndex === null || draggedIndex === dropIndex) {
      setDraggedIndex(null);
      return;
    }

    const newVideos = [...videos];
    const [draggedItem] = newVideos.splice(draggedIndex, 1);
    newVideos.splice(dropIndex, 0, draggedItem);

    // 並び順を更新
    const updatedVideos = newVideos.map((video, index) => ({
      ...video,
      sortOrder: index
    }));

    setVideos(updatedVideos);
    setDraggedIndex(null);

    // APIで並び順を更新
    try {
      const response = await fetch('/api/youtube/recommend', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          videos: updatedVideos.map(video => ({
            id: video.id,
            sortOrder: video.sortOrder
          }))
        }),
      });

      if (!response.ok) {
        throw new Error('並び順の更新に失敗しました');
      }

      toast.success('並び順を更新しました');
    } catch (error) {
      console.error('並び順の更新に失敗:', error);
      toast.error('並び順の更新に失敗しました');
      // エラー時は元に戻す
      fetchRecommendVideos();
    }
  };

  if (isLoading) {
    return (
      <div className="py-4 flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="py-4 space-y-6">
      <div className="mb-4">
        <p className="text-gray-600 mb-2">
          おすすめのYouTube動画を追加します。最大5つまで登録できます。
        </p>
        <div className="flex items-start gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <Info className="h-4 w-4 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-700 space-y-1">
            <p>• YouTubeの動画URLを入力すると、タイトルとサムネイルを自動取得します</p>
            <p>• ドラッグ&ドロップで並び順を変更できます</p>
            <p>• プロフィールページでカード形式で表示されます</p>
          </div>
        </div>
      </div>

      {/* 新しい動画を追加 */}
      {videos.length < 5 && (
        <div className="space-y-4 p-4 border border-gray-200 rounded-lg bg-gray-50">
          <h3 className="font-medium flex items-center gap-2">
            <Plus className="h-4 w-4" />
            新しい動画を追加
          </h3>
          
          <div className="flex gap-3">
            <div className="flex-1">
              <Label htmlFor="videoUrl" className="flex items-center gap-2 mb-2">
                <Link className="h-4 w-4" />
                YouTube URL
              </Label>
              <Input
                id="videoUrl"
                type="url"
                placeholder="https://www.youtube.com/watch?v=..."
                value={newVideoUrl}
                onChange={(e) => setNewVideoUrl(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddVideo();
                  }
                }}
              />
            </div>
            <div className="flex items-end">
              <Button
                onClick={handleAddVideo}
                disabled={isAdding || !newVideoUrl.trim()}
              >
                {isAdding ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <Plus className="h-4 w-4 mr-2" />
                    追加
                  </>
                )}
              </Button>
            </div>
          </div>
          
          <p className="text-sm text-gray-500">
            残り{5 - videos.length}件追加可能
          </p>
        </div>
      )}

      {/* 動画一覧 */}
      {videos.length > 0 && (
        <div className="space-y-4">
          <h3 className="font-medium flex items-center gap-2">
            <Youtube className="h-4 w-4" />
            おすすめ動画一覧 ({videos.length}/5)
          </h3>
          
          <div className="space-y-3">
            {videos.map((video, index) => (
              <div
                key={video.id}
                draggable
                onDragStart={() => handleDragStart(index)}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, index)}
                className={`bg-white rounded-lg border ${
                  draggedIndex === index ? 'opacity-50 border-primary' : 'border-gray-200'
                } p-4 cursor-move hover:shadow-sm transition-shadow`}
              >
                <div className="flex gap-4">
                  {/* ドラッグハンドルと番号 */}
                  <div className="flex items-center gap-2">
                    <div className="flex flex-col items-center">
                      <GripVertical className="h-5 w-5 text-gray-400" />
                      <span className="text-xs text-gray-500 bg-gray-100 rounded-full w-6 h-6 flex items-center justify-center">
                        {index + 1}
                      </span>
                    </div>
                  </div>

                  {/* サムネイル */}
                  {video.thumbnailUrl && (
                    <div className="flex-shrink-0">
                      <img
                        src={video.thumbnailUrl}
                        alt={video.title || '動画サムネイル'}
                        className="w-32 h-18 object-cover rounded"
                      />
                    </div>
                  )}

                  {/* 動画情報 */}
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-sm mb-2 overflow-hidden" style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                      {video.title || 'タイトル不明'}
                    </h4>
                    <p className="text-xs text-gray-500 truncate">
                      {video.url}
                    </p>
                  </div>

                  {/* 削除ボタン */}
                  <div className="flex items-center">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteVideo(video.id)}
                      disabled={isDeletingId === video.id}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      {isDeletingId === video.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {videos.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <Youtube className="h-12 w-12 mx-auto mb-4 text-gray-300" />
          <p>まだおすすめ動画が登録されていません</p>
          <p className="text-sm">上のフォームからYouTube URLを追加してください</p>
        </div>
      )}
    </div>
  );
}
