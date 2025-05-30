"use client";

import { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from '@/components/ui/button';
import { Upload, X, Image, Info } from 'lucide-react';
import { toast } from 'sonner';

interface LogoUploaderProps {
  value?: string;
  onChange: (value: string) => void;
  manufacturerName?: string;
  disabled?: boolean;
}

export function LogoUploader({ 
  value, 
  onChange, 
  manufacturerName,
  disabled 
}: LogoUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp'],
      'image/svg+xml': ['.svg']
    },
    maxSize: 5 * 1024 * 1024, // 5MB
    multiple: false,
    disabled: disabled || isUploading,
    onDrop: async (acceptedFiles) => {
      const file = acceptedFiles[0];
      if (!file) return;

      if (!manufacturerName) {
        toast.error('メーカー名を入力してからロゴをアップロードしてください');
        return;
      }

      // ファイル名の事前チェック（スペースや特殊文字の警告）
      if (/[\s\u3000]/.test(file.name)) {
        console.warn('ファイル名にスペースが含まれています:', file.name);
        // 警告は出すが、サーバー側で適切に処理されるので続行
      }

      const preview = URL.createObjectURL(file);
      setPreviewUrl(preview);

      try {
        setIsUploading(true);
        
        const formData = new FormData();
        formData.append('file', file);
        formData.append('attributeName', manufacturerName);

        const response = await fetch('/api/upload/attribute-logo', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ error: 'レスポンスの解析に失敗' }));
          throw new Error(errorData.error || 'アップロードに失敗しました');
        }

        const result = await response.json();
        onChange(result.url);
        toast.success('ロゴを更新しました');
        
      } catch (error) {
        console.error('Logo upload error:', error);
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

  const handleRemoveLogo = async () => {
    if (!value) return;

    try {
      setIsUploading(true);
      
      const response = await fetch('/api/upload/attribute-logo', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ logoUrl: value }),
      });

      if (!response.ok) {
        throw new Error('削除に失敗しました');
      }

      onChange('');
      setPreviewUrl(null);
      toast.success('ロゴを削除しました');
    } catch (error) {
      console.error('Logo delete error:', error);
      toast.error('削除に失敗しました');
    } finally {
      setIsUploading(false);
    }
  };

  const displayLogoUrl = previewUrl || value;

  return (
    <div className="space-y-3">
      {/* 説明 */}
      <div className="flex items-center gap-2 p-2 bg-blue-50 border border-blue-200 rounded-lg">
        <Info className="h-4 w-4 text-blue-600 flex-shrink-0" />
        <p className="text-xs text-blue-700">
          ロゴは200×200px以内にリサイズされ、WebP形式に変換されます（最大5MB）
        </p>
      </div>

      {/* ロゴプレビュー */}
      <div className="flex items-center gap-3">
        <div className="w-16 h-16 bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 overflow-hidden flex-shrink-0">
          {displayLogoUrl ? (
            <img
              src={displayLogoUrl}
              alt="属性ロゴ"
              className="w-full h-full object-contain"
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <Image className="h-6 w-6 text-gray-400" />
            </div>
          )}
        </div>

        {/* アップロード領域 */}
        <div className="flex-1">
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-3 text-center cursor-pointer transition-colors
              ${isDragActive 
                ? 'border-primary bg-primary/10' 
                : 'border-gray-300 hover:border-primary hover:bg-primary/5'
              }
              ${(disabled || isUploading) ? 'pointer-events-none opacity-50' : ''}
            `}
          >
            <input {...getInputProps()} />
            <Upload className="h-5 w-5 mx-auto mb-1 text-gray-400" />
            <p className="text-xs text-gray-600 mb-1">
              {isDragActive
                ? 'ファイルをドロップ'
                : 'ロゴをアップロード'
              }
            </p>
            <p className="text-xs text-gray-500">
              SVG, PNG, JPG (最大5MB)
            </p>
          </div>
        </div>
      </div>

      {/* 削除ボタン */}
      {displayLogoUrl && (
        <Button
          variant="outline"
          size="sm"
          onClick={handleRemoveLogo}
          disabled={disabled || isUploading}
          className="text-red-600 hover:text-red-700 hover:bg-red-50"
        >
          <X className="h-3 w-3 mr-1" />
          ロゴを削除
        </Button>
      )}
      
      {/* アップロード状況 */}
      {isUploading && (
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-primary"></div>
          ロゴを変換してアップロード中...
        </div>
      )}
    </div>
  );
}