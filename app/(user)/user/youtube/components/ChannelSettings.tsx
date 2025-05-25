'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Save, Youtube, Info, Play } from 'lucide-react';
import { toast } from 'sonner';

interface YoutubeVideo {
  id: string;
  url: string;
  thumbnailUrl?: string;
  title?: string;
  description?: string;
  publishedAt?: string;
}

interface YoutubeSettings {
  id?: string;
  channelId?: string;
  displayCount: number;
  lastFetchedAt?: string;
}

interface ChannelSettingsProps {
  userId: string;
}

const DISPLAY_COUNT_OPTIONS = [
  { value: '2', label: '2件' },
  { value: '4', label: '4件' },
  { value: '6', label: '6件' },
  { value: '8', label: '8件' },
  { value: '10', label: '10件' },
  { value: '12', label: '12件' },
  { value: '15', label: '15件' },
];

export function ChannelSettings({ userId }: ChannelSettingsProps) {
  const [settings, setSettings] = useState<YoutubeSettings>({ displayCount: 8 });
  const [videos, setVideos] = useState<YoutubeVideo[]>([]);
  const [channelId, setChannelId] = useState('');
  const [displayCount, setDisplayCount] = useState('8');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isFetching, setIsFetching] = useState(false);

  // 設定と動画を取得
  const fetchData = async () => {
    try {
      const response = await fetch(`/api/youtube/settings?userId=${userId}`);
      if (response.ok) {
        const data = await response.json();
        setSettings(data.settings || { displayCount: 8 });
        setVideos(data.videos || []);
        setChannelId(data.settings?.channelId || '');
        setDisplayCount(data.settings?.displayCount?.toString() || '8');
      }
    } catch (error) {
      console.error('YouTube設定の取得に失敗:', error);
      toast.error('設定の取得に失敗しました');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [userId]);

  // チャンネルIDからYouTube動画を取得
  const handleSaveAndFetch = async () => {
    if (!channelId.trim()) {
      toast.error('チャンネルIDを入力してください');
      return;
    }

    try {
      setIsSaving(true);
      setIsFetching(true);

      const response = await fetch('/api/youtube/fetch', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          channelId: channelId.trim(),
          displayCount: parseInt(displayCount),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'レスポンスの解析に失敗' }));
        throw new Error(errorData.error || '動画の取得に失敗しました');
      }

      const result = await response.json();
      setSettings(result.settings);
      setVideos(result.videos);
      
      toast.success(`${result.videos.length}件の動画を取得しました`);
    } catch (error) {
      console.error('YouTube動画の取得に失敗:', error);
      toast.error(error instanceof Error ? error.message : '動画の取得に失敗しました');
    } finally {
      setIsSaving(false);
      setIsFetching(false);
    }
  };

  // 表示数のみを更新
  const handleUpdateDisplayCount = async () => {
    try {
      setIsSaving(true);

      const response = await fetch('/api/youtube/settings', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          displayCount: parseInt(displayCount),
        }),
      });

      if (!response.ok) {
        throw new Error('設定の更新に失敗しました');
      }

      const result = await response.json();
      setSettings(result.settings);
      
      toast.success('表示数を更新しました');
    } catch (error) {
      console.error('設定の更新に失敗:', error);
      toast.error('設定の更新に失敗しました');
    } finally {
      setIsSaving(false);
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
          YouTubeチャンネルIDを設定して、最新の動画を自動取得します。
        </p>
        <div className="flex items-start gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <Info className="h-4 w-4 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-700 space-y-1">
            <p>• チャンネルIDはYouTubeチャンネルのURLから取得できます</p>
            <p>• 例: https://www.youtube.com/channel/<strong>UCvPA5InlbO2NCV8uFNMVBew</strong></p>
            <p>• 最後に取得してから12時間経過すると自動的に更新されます</p>
          </div>
        </div>
      </div>

      {/* 設定フォーム */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="channelId" className="flex items-center gap-2">
            <Youtube className="h-4 w-4" />
            チャンネルID
          </Label>
          <Input
            id="channelId"
            type="text"
            placeholder="UCvPA5InlbO2NCV8uFNMVBew"
            value={channelId}
            onChange={(e) => setChannelId(e.target.value)}
            className="font-mono"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="displayCount">表示動画数</Label>
          <Select value={displayCount} onValueChange={setDisplayCount}>
            <SelectTrigger id="displayCount">
              <SelectValue placeholder="表示数を選択" />
            </SelectTrigger>
            <SelectContent>
              {DISPLAY_COUNT_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* 操作ボタン */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Button
          onClick={handleSaveAndFetch}
          disabled={isSaving || !channelId.trim()}
          className="flex-1"
        >
          {isFetching ? (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          ) : (
            <Save className="h-4 w-4 mr-2" />
          )}
          保存して動画を取得
        </Button>
        
        {settings.channelId && (
          <Button
            variant="outline"
            onClick={handleUpdateDisplayCount}
            disabled={isSaving}
            className="flex-1"
          >
            {isSaving && !isFetching ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            表示数のみ更新
          </Button>
        )}
      </div>

      {/* 最後の取得時間 */}
      {settings.lastFetchedAt && (
        <div className="text-sm text-gray-500">
          最後の取得: {new Date(settings.lastFetchedAt).toLocaleString('ja-JP')}
        </div>
      )}

      {/* 動画一覧 */}
      {videos.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-medium flex items-center gap-2">
            <Play className="h-5 w-5" />
            取得済み動画 ({videos.length}件)
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {videos.slice(0, parseInt(displayCount)).map((video) => (
              <div
                key={video.id}
                className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
              >
                {video.thumbnailUrl && (
                  <img
                    src={video.thumbnailUrl}
                    alt={video.title || '動画サムネイル'}
                    className="w-full h-32 object-cover"
                  />
                )}
                <div className="p-3">
                  <h4 className="font-medium text-sm overflow-hidden" style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                    {video.title || 'タイトル不明'}
                  </h4>
                  {video.publishedAt && (
                    <p className="text-xs text-gray-500 mt-2">
                      {new Date(video.publishedAt).toLocaleDateString('ja-JP')}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
          
          {videos.length > parseInt(displayCount) && (
            <p className="text-sm text-gray-500 text-center">
              {videos.length - parseInt(displayCount)}件の動画が非表示になっています
            </p>
          )}
        </div>
      )}
    </div>
  );
}
