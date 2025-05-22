'use client';

import { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload, X, Camera } from 'lucide-react';
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
          throw new Error('アップロードに失敗しました');
        }

        const result = await response.json();
        
        // 成功時の処理
        onIconUpdate?.(result.url);
        toast.success('プロフィール画像を更新しました');
      } catch (error) {
        console.error('Upload error:', error);
        toast.error('アップロードに失敗しました');
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
      <p className="text-gray-600 mb-4">
        プロフィールアイコンを設定します。JPG、PNG、GIF、WebP形式の画像をアップロードできます（最大5MB）。
      </p>
      <div className="space-y-4">
        <div className="flex items-center gap-6">
          <Avatar className="h-24 w-24">
            <AvatarImage 
              src={previewUrl || currentIconUrl || undefined} 
              alt="プロフィール画像" 
            />
            <AvatarFallback>
              <Camera className="h-10 w-10 text-gray-400" />
            </AvatarFallback>
          </Avatar>
          
          <div className="flex flex-col gap-4">
            <div>
              <p className="text-sm text-gray-500">現在のアイコン</p>
              <p className="text-sm text-gray-400 mt-1">推奨サイズ: 400x400px</p>
            </div>
            
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors min-w-[200px]
                ${isDragActive 
                  ? 'border-primary bg-primary/10' 
                  : 'border-gray-300 hover:border-primary hover:bg-primary/5'
                }
                ${isUploading ? 'pointer-events-none opacity-50' : ''}
              `}
            >
              <input {...getInputProps()} />
              <Upload className="h-6 w-6 mx-auto mb-2 text-gray-400" />
              <p className="text-sm text-gray-600">
                {isDragActive
                  ? 'ファイルをここにドロップ'
                  : 'クリックまたはドラッグして画像をアップロード'
                }
              </p>
            </div>
            
            {(currentIconUrl || previewUrl) && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleRemoveIcon}
                disabled={isUploading}
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <X className="h-4 w-4 mr-2" />
                画像を削除
              </Button>
            )}
          </div>
        </div>
        
        {isUploading && (
          <div className="text-sm text-gray-500">
            アップロード中...
          </div>
        )}
      </div>
    </div>
  );
}