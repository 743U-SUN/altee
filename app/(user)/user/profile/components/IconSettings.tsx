'use client';

import { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Upload, Loader2, Camera, Trash2, Info } from 'lucide-react';
import { toast } from 'sonner';

interface IconSettingsProps {
  currentIconUrl?: string;
  userId: string;
  onIconUpdate?: (newIconUrl: string) => void;
}

export function IconSettings({ currentIconUrl, userId, onIconUpdate }: IconSettingsProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp']
    },
    maxSize: 5 * 1024 * 1024, // 5MB
    multiple: false,
    disabled: isUploading,
    onDrop: async (acceptedFiles) => {
      const file = acceptedFiles[0];
      if (!file) return;

      // プレビューURLを設定
      const preview = URL.createObjectURL(file);
      setPreviewUrl(preview);

      try {
        setIsUploading(true);
        
        // FormDataを作成してAPIに送信
        const formData = new FormData();
        formData.append('file', file);
        formData.append('userId', userId);

        const response = await fetch('/api/upload/icon', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ error: 'レスポンスの解析に失敗' }));
          throw new Error(errorData.error || 'アップロードに失敗しました');
        }

        const result = await response.json();
        
        // 成功時の処理
        onIconUpdate?.(result.url);
        toast.success('プロフィール画像を更新しました');
      } catch (error) {
        console.error('Upload error:', error);
        toast.error(error instanceof Error ? error.message : 'アップロードに失敗しました');
        setPreviewUrl(null);
      } finally {
        setIsUploading(false);
      }
    },
    onDropRejected: (fileRejections) => {
      const rejection = fileRejections[0];
      if (rejection.errors[0]?.code === 'file-too-large') {
        toast.error('ファイルサイズは5MB以下にしてください');
      } else if (rejection.errors[0]?.code === 'file-invalid-type') {
        toast.error('画像ファイルのみアップロード可能です');
      } else {
        toast.error('無効なファイルです');
      }
    }
  });

  const handleRemoveIcon = async () => {
    try {
      setIsUploading(true);
      
      const response = await fetch('/api/upload/icon', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId }),
      });

      if (!response.ok) {
        throw new Error('削除に失敗しました');
      }

      onIconUpdate?.('');
      setPreviewUrl(null);
      toast.success('プロフィール画像を削除しました');
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('削除に失敗しました');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="py-4">
      <div className="mb-4">
        <p className="text-gray-600">
          プロフィールアイコンを設定します。プロフィール画面やコメントなどで表示されます。
        </p>
        <div className="flex items-start gap-2 mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <Info className="h-4 w-4 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-700 space-y-1">
            <p>• アップロードされた画像は自動的にWebP形式に変換され、400×400px以内にリサイズされます</p>
            <p>• 正方形の画像を推奨します（円形にクロップされて表示されます）</p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {/* 現在のアイコンがある場合のプレビューカード */}
        {(currentIconUrl || previewUrl) && (
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex gap-4">
              {/* アバター画像 */}
              <div>
                <Avatar className="h-24 w-24">
                  <AvatarImage 
                    src={previewUrl || currentIconUrl || undefined} 
                    alt="プロフィール画像" 
                  />
                  <AvatarFallback>
                    <Camera className="h-10 w-10 text-gray-400" />
                  </AvatarFallback>
                </Avatar>
              </div>

              {/* 情報と削除ボタン */}
              <div className="flex-1 flex flex-col justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-700">現在のプロフィール画像</p>
                  <p className="text-sm text-gray-500 mt-1">この画像があなたのプロフィールで表示されます</p>
                </div>
                
                <div className="flex justify-end">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleRemoveIcon}
                    disabled={isUploading}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    {isUploading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        <Trash2 className="h-4 w-4 mr-1.5" />
                        削除
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* アップロード領域 */}
        <div
          {...getRootProps()}
          className={`w-full p-8 border-2 border-dashed rounded-lg ${
            isDragActive 
              ? 'border-primary bg-primary/10' 
              : 'border-gray-300 hover:border-primary hover:bg-primary/5'
          } flex items-center justify-center cursor-pointer transition-colors ${
            isUploading ? 'pointer-events-none opacity-50' : ''
          }`}
        >
          <input {...getInputProps()} />
          <div className="text-center">
            {isUploading ? (
              <>
                <Loader2 className="h-8 w-8 mx-auto mb-2 text-gray-400 animate-spin" />
                <p className="text-sm text-gray-600">アップロード中...</p>
              </>
            ) : (
              <>
                <Upload className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                <p className="text-sm text-gray-600 mb-1">
                  {isDragActive ? 'ドロップしてアップロード' : 'クリックまたはドラッグして画像をアップロード'}
                </p>
                <p className="text-xs text-gray-500">
                  {currentIconUrl || previewUrl ? '新しい画像に置き換える' : '画像を選択してください'}
                </p>
              </>
            )}
          </div>
        </div>

        {/* 説明テキスト */}
        <div className="space-y-2 text-sm text-gray-500">
          <p>• 正方形の画像を推奨します（推奨サイズ: 400×400px）</p>
          <p>• JPG、PNG、GIF、WebP形式に対応（最大5MB）</p>
        </div>
      </div>
    </div>
  );
}