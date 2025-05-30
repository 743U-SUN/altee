'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useDropzone } from 'react-dropzone';
import { Upload, Link, Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { fetchProductFromAmazon, cacheImageAction } from '@/lib/actions/admin-product-actions';
import { OptimizedImage } from '@/components/ui/optimized-image';
import { convertToProxyUrl } from '@/lib/utils/image-proxy';

interface ColorImageManagerProps {
  colorId: number;
  colorName: string;
  imageUrl: string | null;
  onImageUpdate: (colorId: number, imageUrl: string) => void;
  productId: number;
}

export function ColorImageManager({
  colorId,
  colorName,
  imageUrl,
  onImageUpdate,
  productId,
}: ColorImageManagerProps) {
  const [amazonUrl, setAmazonUrl] = useState('');
  const [isLoadingAmazon, setIsLoadingAmazon] = useState(false);
  const [isUploadingFile, setIsUploadingFile] = useState(false);
  const [currentImageUrl, setCurrentImageUrl] = useState(imageUrl);

  // Amazon URLから画像を取得
  const handleAmazonFetch = async () => {
    if (!amazonUrl.trim()) {
      toast.error('Amazon URLを入力してください');
      return;
    }

    setIsLoadingAmazon(true);
    try {
      // Amazon URLから商品情報を取得
      const productData = await fetchProductFromAmazon(amazonUrl);
      
      if (!productData.imageUrl) {
        throw new Error('画像URLが取得できませんでした');
      }

      // 画像をMinIOにキャッシュ
      let cachedImageUrl = productData.imageUrl;
      if (productData.imageUrl && !productData.imageUrl.startsWith('/') && !productData.imageUrl.includes('localhost:9000')) {
        try {
          cachedImageUrl = await cacheImageAction(productData.imageUrl);
        } catch (error) {
          console.error('Failed to cache color image:', error);
          // エラー時は元のURLをそのまま使用
        }
      }

      // 画像URLを保存
      setCurrentImageUrl(cachedImageUrl);
      onImageUpdate(colorId, cachedImageUrl);
      
      toast.success(`${colorName}の画像を取得しました`);
      setAmazonUrl(''); // 入力をクリア
    } catch (error) {
      console.error('Error fetching from Amazon:', error);
      toast.error('Amazon URLからの画像取得に失敗しました');
    } finally {
      setIsLoadingAmazon(false);
    }
  };

  // ファイルアップロード
  const handleFileUpload = async (file: File) => {
    setIsUploadingFile(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('productId', productId.toString());
      formData.append('colorId', colorId.toString());

      const response = await fetch('/api/upload/product-color', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Upload failed');

      const { url } = await response.json();
      
      setCurrentImageUrl(url);
      onImageUpdate(colorId, url);
      
      toast.success(`${colorName}の画像をアップロードしました`);
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('画像のアップロードに失敗しました');
    } finally {
      setIsUploadingFile(false);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp'],
    },
    maxSize: 5 * 1024 * 1024, // 5MB
    multiple: false,
    disabled: isUploadingFile,
    onDrop: (acceptedFiles) => {
      const file = acceptedFiles[0];
      if (file) {
        handleFileUpload(file);
      }
    },
  });

  return (
    <div className="space-y-4">
      <Label className="text-base font-medium">{colorName}の画像</Label>
      
      {/* 現在の画像プレビュー */}
      {currentImageUrl && (
        <div className="relative w-32 h-32 rounded-lg overflow-hidden border-2 border-gray-200">
          <OptimizedImage
            src={convertToProxyUrl(currentImageUrl)}
            alt={`${colorName} variant`}
            fill
            className="object-cover"
            sizes="128px"
          />
        </div>
      )}

      <Tabs defaultValue="amazon" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="amazon">Amazon URLから取得</TabsTrigger>
          <TabsTrigger value="upload">画像をアップロード</TabsTrigger>
        </TabsList>

        {/* Amazon URL入力タブ */}
        <TabsContent value="amazon" className="space-y-3">
          <div className="space-y-2">
            <Label htmlFor={`amazon-url-${colorId}`}>
              {colorName}カラーのAmazon商品URL
            </Label>
            <div className="flex gap-2">
              <Input
                id={`amazon-url-${colorId}`}
                placeholder="https://www.amazon.co.jp/dp/..."
                value={amazonUrl}
                onChange={(e) => setAmazonUrl(e.target.value)}
                disabled={isLoadingAmazon}
              />
              <Button
                onClick={handleAmazonFetch}
                disabled={isLoadingAmazon || !amazonUrl.trim()}
              >
                {isLoadingAmazon ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    取得中...
                  </>
                ) : (
                  <>
                    <Link className="mr-2 h-4 w-4" />
                    画像を取得
                  </>
                )}
              </Button>
            </div>
            <p className="text-xs text-gray-500">
              例: https://www.amazon.co.jp/dp/B08TW46KBZ (ホワイトカラーのURL)
            </p>
          </div>

          {/* Amazon画像取得のヒント */}
          <div className="rounded-lg bg-blue-50 p-3 space-y-1">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-4 w-4 text-blue-600 mt-0.5" />
              <div className="text-sm text-blue-800">
                <p className="font-medium">ヒント</p>
                <ul className="list-disc list-inside space-y-0.5 text-xs mt-1">
                  <li>Amazonの商品ページでカラーバリエーションを選択</li>
                  <li>URLが変わったらそのURLをコピー</li>
                  <li>各カラーごとに異なるURLから画像を取得できます</li>
                </ul>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* ファイルアップロードタブ */}
        <TabsContent value="upload" className="space-y-3">
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
              ${isDragActive ? 'border-primary bg-primary/10' : 'border-gray-300 hover:border-primary'}
              ${isUploadingFile ? 'pointer-events-none opacity-50' : ''}
            `}
          >
            <input {...getInputProps()} />
            {isUploadingFile ? (
              <div className="space-y-2">
                <Loader2 className="h-8 w-8 mx-auto animate-spin text-gray-400" />
                <p className="text-sm text-gray-600">アップロード中...</p>
              </div>
            ) : (
              <div className="space-y-2">
                <Upload className="h-8 w-8 mx-auto text-gray-400" />
                <p className="text-sm text-gray-600">
                  {isDragActive
                    ? 'ここにドロップ'
                    : 'クリックまたはドラッグ&ドロップ'}
                </p>
                <p className="text-xs text-gray-500">
                  JPEG, PNG, GIF, WebP（最大5MB）
                </p>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* 成功メッセージ */}
      {currentImageUrl && (
        <div className="flex items-center gap-2 text-sm text-green-600">
          <CheckCircle className="h-4 w-4" />
          画像が設定されています
        </div>
      )}
    </div>
  );
}