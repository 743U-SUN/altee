'use client';

import { useState, useCallback, useTransition, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { toast } from 'sonner';
import { Upload, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { OptimizedImage } from '@/components/ui/optimized-image';
import { convertToProxyUrl } from '@/lib/utils/image-proxy';
import { uploadArticleMediaAction, getOrCreateArticlesMediaCategoryAction } from '@/lib/actions/article-actions';

interface MediaUploaderProps {
  value: string;
  onChange: (value: string) => void;
}

export default function MediaUploader({ value, onChange }: MediaUploaderProps) {
  const [isPending, startTransition] = useTransition();
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [isLoadingCategory, setIsLoadingCategory] = useState(true);
  
  // 記事用カテゴリの取得または作成
  useEffect(() => {
    const initializeCategory = async () => {
      try {
        setIsLoadingCategory(true);
        const result = await getOrCreateArticlesMediaCategoryAction();
        
        if (result.success && result.categoryId) {
          setCategoryId(result.categoryId);
        } else {
          toast.error('カテゴリの初期化に失敗しました');
          console.error('Category initialization failed:', result.error);
        }
      } catch (error) {
        console.error('Error initializing category:', error);
        toast.error('カテゴリの初期化中にエラーが発生しました');
      } finally {
        setIsLoadingCategory(false);
      }
    };
    
    initializeCategory();
  }, []);
  
  // ファイルアップロード処理
  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;
    
    const file = acceptedFiles[0];
    
    // カテゴリIDがまだ取得できていない場合はエラー
    if (!categoryId) {
      toast.error('カテゴリがまだ初期化されていません。少し待ってから再度お試しください。');
      return;
    }
    
    // 10MBを超えるファイルはアップロードしない
    if (file.size > 10 * 1024 * 1024) {
      toast.error('ファイルサイズが大きすぎます（最大10MB）');
      return;
    }
    
    // 許可されるファイル形式
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('この形式のファイルはサポートされていません（JPEG, PNG, GIF, WEBP, SVGのみ）');
      return;
    }
    
    startTransition(async () => {
      try {
        // FormDataの作成
        const formData = new FormData();
        formData.append('file', file);
        formData.append('categoryId', categoryId); // 動的に取得したカテゴリIDを使用
        formData.append('altText', file.name);
        
        // Server Actionを使用
        const result = await uploadArticleMediaAction(formData);
        
        if (result.success && result.media) {
          onChange(result.media.url);
          toast.success('アップロード完了');
        } else {
          throw new Error(result.error || 'アップロードに失敗しました');
        }
      } catch (error) {
        console.error('アップロードエラー:', error);
        toast.error(error instanceof Error ? error.message : 'アップロードに失敗しました');
      }
    });
  }, [onChange, categoryId]);
  
  // ドロップゾーン設定
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp', '.svg']
    },
    maxFiles: 1,
    disabled: isPending || isLoadingCategory
  });
  
  // 画像の削除
  const handleRemove = () => {
    onChange('');
  };
  
  return (
    <div className="space-y-4">
      {value ? (
        <div className="relative w-full aspect-video rounded-md overflow-hidden border">
          <OptimizedImage
            src={convertToProxyUrl(value)}
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
          } ${isLoadingCategory || !categoryId ? 'opacity-50' : ''}`}
        >
          <input {...getInputProps()} />
          
          {isLoadingCategory ? (
            <div className="flex flex-col items-center text-center">
              <Loader2 className="h-10 w-10 text-muted-foreground animate-spin mb-2" />
              <p className="text-sm text-muted-foreground">カテゴリを初期化中...</p>
            </div>
          ) : isPending ? (
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
                JPEG, PNG, GIF, WEBP, SVG（最大10MB）
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                画像は自動的にWebP形式に変換されます
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}