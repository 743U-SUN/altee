'use client';

import { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload, X, Image, Info } from 'lucide-react';
import { toast } from 'sonner';

interface BannerSettingsProps {
  currentBannerUrl?: string;
  userId: string;
  onBannerUpdate?: (newBannerUrl: string) => void;
}

export function BannerSettings({ currentBannerUrl, userId, onBannerUpdate }: BannerSettingsProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp']
    },
    maxSize: 8 * 1024 * 1024, // 8MB
    multiple: false,
    onDrop: async (acceptedFiles) => {
      const file = acceptedFiles[0];
      if (!file) return;

      console.log('ファイル情報:', {
        name: file.name,
        size: file.size,
        type: file.type,
        lastModified: file.lastModified
      });

      // プレビューURLを設定
      const preview = URL.createObjectURL(file);
      setPreviewUrl(preview);

      try {
        setIsUploading(true);
        
        // FormDataを作成してAPIに送信
        const formData = new FormData();
        formData.append('file', file);
        formData.append('userId', userId);
        
        console.log('FormData作成完了:', {
          hasFile: formData.has('file'),
          hasUserId: formData.has('userId'),
          userId: formData.get('userId')
        });

        console.log('アップロード開始...');
        const response = await fetch('/api/upload/banner', {
          method: 'POST',
          body: formData,
        });
        
        console.log('レスポンス状態:', response.status, response.statusText);

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ error: 'レスポンスの解析に失敗' }));
          console.error('アップロードエラー:', errorData);
          throw new Error(errorData.error || 'アップロードに失敗しました');
        }

        const result = await response.json();
        console.log('アップロード成功:', result);
        
        // 成功時の処理
        onBannerUpdate?.(result.url);
        toast.success('バナー画像を更新しました');
        
        // アップロード詳細をログに表示（開発時のみ）
        if (result.details) {
          console.log('バナーアップロード詳細:', result.details);
        }
      } catch (error) {
        console.error('Banner upload error:', error);
        toast.error('アップロードに失敗しました');
        setPreviewUrl(null);
      } finally {
        setIsUploading(false);
      }
    },
    onDropRejected: (fileRejections) => {
      const rejection = fileRejections[0];
      if (rejection.errors[0]?.code === 'file-too-large') {
        toast.error('ファイルサイズは8MB以下にしてください');
      } else if (rejection.errors[0]?.code === 'file-invalid-type') {
        toast.error('画像ファイルのみアップロード可能です');
      } else {
        toast.error('無効なファイルです');
      }
    }
  });

  const handleRemoveBanner = async () => {
    try {
      setIsUploading(true);
      
      const response = await fetch('/api/upload/banner', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId }),
      });

      if (!response.ok) {
        throw new Error('削除に失敗しました');
      }

      onBannerUpdate?.('');
      setPreviewUrl(null);
      toast.success('バナー画像を削除しました');
    } catch (error) {
      console.error('Banner delete error:', error);
      toast.error('削除に失敗しました');
    } finally {
      setIsUploading(false);
    }
  };

  const displayBannerUrl = previewUrl || currentBannerUrl;

  return (
    <div className="py-4">
      <div className="mb-4">
        <p className="text-gray-600">
          プロフィールバナーを設定します。JPG、PNG、GIF、WebP形式の画像をアップロードできます（最大8MB）。
        </p>
        <div className="flex items-center gap-2 mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <Info className="h-4 w-4 text-blue-600 flex-shrink-0" />
          <p className="text-sm text-blue-700">
            アップロードされた画像は自動的にWebP形式に変換され、600×200px以内にリサイズされます。
          </p>
        </div>
      </div>
      
      <div className="space-y-4">
        {/* バナープレビュー */}
        <div className="w-full">
          <p className="text-sm text-gray-500 mb-2">現在のバナー</p>
          <div className="relative w-full h-40 bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 overflow-hidden">
            {displayBannerUrl ? (
              <img
                src={displayBannerUrl}
                alt="バナー画像"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <Image className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                  <p className="text-sm text-gray-500">バナー画像なし</p>
                  <p className="text-xs text-gray-400 mt-1">推奨サイズ: 600×200px</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* アップロード領域 */}
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
            ${isDragActive 
              ? 'border-primary bg-primary/10' 
              : 'border-gray-300 hover:border-primary hover:bg-primary/5'
            }
            ${isUploading ? 'pointer-events-none opacity-50' : ''}
          `}
        >
          <input {...getInputProps()} />
          <Upload className="h-8 w-8 mx-auto mb-3 text-gray-400" />
          <p className="text-sm text-gray-600 mb-1">
            {isDragActive
              ? 'ファイルをここにドロップ'
              : 'クリックまたはドラッグしてバナー画像をアップロード'
            }
          </p>
          <p className="text-xs text-gray-500">
            WebP形式に自動変換されます（最大8MB）
          </p>
        </div>

        {/* 操作ボタン */}
        <div className="flex gap-3">
          {displayBannerUrl && (
            <Button
              variant="outline"
              onClick={handleRemoveBanner}
              disabled={isUploading}
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <X className="h-4 w-4 mr-2" />
              バナーを削除
            </Button>
          )}
        </div>
        
        {/* アップロード状況 */}
        {isUploading && (
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
            バナー画像を変換してアップロード中...
          </div>
        )}

        {/* バナーのガイドライン */}
        <div className="mt-4 p-4 bg-gray-50 rounded-lg border">
          <h4 className="text-sm font-medium text-gray-900 mb-2">バナー画像のガイドライン</h4>
          <ul className="text-xs text-gray-600 space-y-1">
            <li>• 推奨サイズ: 600×200px（3:1の比率）</li>
            <li>• ファイル形式: JPG、PNG、GIF、WebP</li>
            <li>• ファイルサイズ: 最大8MB</li>
            <li>• 自動的にWebP形式に変換されます</li>
            <li>• 文字やロゴは画像の中央部分に配置することを推奨</li>
          </ul>
        </div>
      </div>
    </div>
  );
}