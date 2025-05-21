'use client';

import { useState, useCallback } from 'react';
import Image from 'next/image';
import { useDropzone } from 'react-dropzone';
import { toast } from 'sonner';
import { Upload, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface MediaUploaderProps {
  value: string;
  onChange: (value: string) => void;
}

export default function MediaUploader({ value, onChange }: MediaUploaderProps) {
  const [uploading, setUploading] = useState(false);
  
  // ファイルアップロード処理
  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;
    
    const file = acceptedFiles[0];
    
    // 10MBを超えるファイルはアップロードしない
    if (file.size > 10 * 1024 * 1024) {
      toast.error('ファイルサイズが大きすぎます（最大10MB）');
      return;
    }
    
    // 許可されるファイル形式
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('この形式のファイルはサポートされていません（JPEG, PNG, GIF, WEBPのみ）');
      return;
    }
    
    try {
      setUploading(true);
      
      // FormDataの作成
      const formData = new FormData();
      formData.append('file', file);
      
      // APIリクエスト
      const response = await fetch('/api/media/upload', {
        method: 'POST',
        body: formData
      });
      
      if (!response.ok) {
        throw new Error('アップロードに失敗しました');
      }
      
      const data = await response.json();
      onChange(data.url);
      toast.success('アップロード完了');
    } catch (error) {
      console.error('アップロードエラー:', error);
      toast.error('アップロードに失敗しました');
    } finally {
      setUploading(false);
    }
  }, [onChange]);
  
  // ドロップゾーン設定
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp']
    },
    maxFiles: 1,
    disabled: uploading
  });
  
  // 画像の削除
  const handleRemove = () => {
    onChange('');
  };
  
  return (
    <div className="space-y-4">
      {value ? (
        <div className="relative w-full aspect-video rounded-md overflow-hidden border">
          <Image
            src={value}
            alt="アイキャッチ画像"
            fill
            className="object-cover"
          />
          <Button
            type="button"
            variant="destructive"
            size="icon"
            className="absolute top-2 right-2 h-8 w-8"
            onClick={handleRemove}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-md p-6 cursor-pointer transition-colors flex flex-col items-center justify-center min-h-[150px] ${
            isDragActive ? 'border-primary bg-primary/5' : 'border-border'
          }`}
        >
          <input {...getInputProps()} />
          
          {uploading ? (
            <div className="flex flex-col items-center text-center">
              <Loader2 className="h-10 w-10 text-primary animate-spin mb-2" />
              <p className="text-sm text-muted-foreground">アップロード中...</p>
            </div>
          ) : (
            <div className="flex flex-col items-center text-center">
              <Upload className="h-10 w-10 text-muted-foreground mb-2" />
              <p className="text-sm font-medium mb-1">
                {isDragActive ? 'ファイルをドロップ' : '画像をドラッグ＆ドロップまたはクリック'}
              </p>
              <p className="text-xs text-muted-foreground">
                JPEG, PNG, GIF, WEBP（最大10MB）
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
