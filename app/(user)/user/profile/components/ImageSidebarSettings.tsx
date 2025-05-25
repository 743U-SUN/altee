'use client';

import { useState, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload, X, Images, Loader2, GripVertical, Info, Trash2, Save, Link, FileText } from 'lucide-react';
import { toast } from 'sonner';

interface SidebarImage {
  id: string;
  imgUrl: string;
  url?: string | null;
  alt?: string | null;
  sortOrder: number;
}

interface ImageSidebarSettingsProps {
  userId: string;
}

export function ImageSidebarSettings({ userId }: ImageSidebarSettingsProps) {
  const [sidebarImages, setSidebarImages] = useState<SidebarImage[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isDeletingId, setIsDeletingId] = useState<string | null>(null);
  const [isSavingId, setIsSavingId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [tempUrls, setTempUrls] = useState<{ [key: string]: string }>({});
  const [tempAlts, setTempAlts] = useState<{ [key: string]: string }>({});

  // サイドバー画像を取得
  const fetchSidebarImages = async () => {
    try {
      const response = await fetch(`/api/upload/image-sidebar?userId=${userId}`);
      if (!response.ok) throw new Error('画像の取得に失敗しました');
      
      const data = await response.json();
      setSidebarImages(data.images);
      
      // URL・Alt入力欄の初期値を設定
      const urls: { [key: string]: string } = {};
      const alts: { [key: string]: string } = {};
      data.images.forEach((img: SidebarImage) => {
        urls[img.id] = img.url || '';
        alts[img.id] = img.alt || '';
      });
      setTempUrls(urls);
      setTempAlts(alts);
    } catch (error) {
      console.error('Sidebar fetch error:', error);
      toast.error('画像の取得に失敗しました');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSidebarImages();
  }, [userId]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp']
    },
    maxSize: 2 * 1024 * 1024, // 10MB
    multiple: false,
    disabled: sidebarImages.length >= 3 || isUploading,
    onDrop: async (acceptedFiles) => {
      const file = acceptedFiles[0];
      if (!file) return;

      try {
        setIsUploading(true);
        
        const formData = new FormData();
        formData.append('file', file);
        formData.append('userId', userId);
        formData.append('sortOrder', sidebarImages.length.toString());

        const response = await fetch('/api/upload/image-sidebar', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ error: 'レスポンスの解析に失敗' }));
          throw new Error(errorData.error || 'アップロードに失敗しました');
        }

        const result = await response.json();
        
        // 新しい画像を追加
        const newImage: SidebarImage = {
          id: result.id,
          imgUrl: result.url,
          url: null,
          alt: file.name.split('.')[0],
          sortOrder: result.sortOrder
        };
        
        setSidebarImages(prev => [...prev, newImage]);
        setTempUrls(prev => ({ ...prev, [result.id]: '' }));
        setTempAlts(prev => ({ ...prev, [result.id]: file.name.split('.')[0] }));
        
        toast.success('サイドバー画像を追加しました');
        
      } catch (error) {
        console.error('Sidebar upload error:', error);
        toast.error(error instanceof Error ? error.message : 'アップロードに失敗しました');
      } finally {
        setIsUploading(false);
      }
    },
    onDropRejected: (fileRejections) => {
      const rejection = fileRejections[0];
      if (rejection.errors[0]?.code === 'file-too-large') {
        toast.error('ファイルサイズは2MB以下にしてください');
      } else if (rejection.errors[0]?.code === 'file-invalid-type') {
        toast.error('画像ファイルのみアップロード可能です');
      } else {
        toast.error('無効なファイルです');
      }
    }
  });

  const handleDeleteImage = async (imageId: string) => {
    try {
      setIsDeletingId(imageId);
      
      const response = await fetch('/api/upload/image-sidebar', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId, imageId }),
      });

      if (!response.ok) {
        throw new Error('削除に失敗しました');
      }

      // 画像を削除して並び順を更新
      setSidebarImages(prev => {
        const filtered = prev.filter(img => img.id !== imageId);
        return filtered.map((img, index) => ({
          ...img,
          sortOrder: index
        }));
      });
      
      // URL・Alt入力の一時データも削除
      setTempUrls(prev => {
        const newUrls = { ...prev };
        delete newUrls[imageId];
        return newUrls;
      });
      setTempAlts(prev => {
        const newAlts = { ...prev };
        delete newAlts[imageId];
        return newAlts;
      });
      
      toast.success('サイドバー画像を削除しました');
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('削除に失敗しました');
    } finally {
      setIsDeletingId(null);
    }
  };

  const handleSaveData = async (imageId: string) => {
    try {
      setIsSavingId(imageId);
      
      const response = await fetch('/api/upload/image-sidebar', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          imageId,
          url: tempUrls[imageId] || null,
          alt: tempAlts[imageId] || null
        }),
      });

      if (!response.ok) {
        throw new Error('保存に失敗しました');
      }

      // ローカルのデータを更新
      setSidebarImages(prev =>
        prev.map(img =>
          img.id === imageId ? { 
            ...img, 
            url: tempUrls[imageId] || null,
            alt: tempAlts[imageId] || null
          } : img
        )
      );

      toast.success('保存しました');
    } catch (error) {
      console.error('Save error:', error);
      toast.error('保存に失敗しました');
    } finally {
      setIsSavingId(null);
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

    const newImages = [...sidebarImages];
    const [draggedItem] = newImages.splice(draggedIndex, 1);
    newImages.splice(dropIndex, 0, draggedItem);

    // 並び順を更新
    const updatedImages = newImages.map((img, index) => ({
      ...img,
      sortOrder: index
    }));

    setSidebarImages(updatedImages);
    setDraggedIndex(null);

    // APIで並び順を更新
    try {
      const response = await fetch('/api/upload/image-sidebar', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          images: updatedImages.map(img => ({
            id: img.id,
            sortOrder: img.sortOrder
          }))
        }),
      });

      if (!response.ok) {
        throw new Error('並び順の更新に失敗しました');
      }

      toast.success('並び順を更新しました');
    } catch (error) {
      console.error('Sort update error:', error);
      toast.error('並び順の更新に失敗しました');
      // エラー時は元に戻す
      fetchSidebarImages();
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
    <div className="py-4">
      <div className="mb-4">
        <p className="text-gray-600">
          サイドバーに表示する画像を設定します。最大3枚まで登録できます。
        </p>
        <div className="flex items-start gap-2 mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <Info className="h-4 w-4 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-700 space-y-1">
            <p>• アップロードされた画像は自動的にWebP形式に変換され、500×1000px以内にリサイズされます</p>
            <p>• 各画像にリンクURLと説明文を設定できます</p>
            <p>• ドラッグ&ドロップで並び順を変更できます</p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {/* 画像一覧 - 統一された縦並びレイアウト */}
        <div className="space-y-4">
          {sidebarImages.map((image, index) => (
            <div
              key={image.id}
              draggable
              onDragStart={() => handleDragStart(index)}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, index)}
              className={`bg-white rounded-lg border ${
                draggedIndex === index ? 'opacity-50 border-primary' : 'border-gray-200'
              } p-4 cursor-move`}
            >
              <div className="flex gap-4">
                {/* 画像とドラッグハンドル */}
                <div className="flex items-start gap-2">
                  <div className="pt-8">
                    <GripVertical className="h-5 w-5 text-gray-400" />
                  </div>
                  <div className="relative">
                    <img
                      src={image.imgUrl}
                      alt={image.alt || `サイドバー画像 ${index + 1}`}
                      className="w-20 h-40 object-cover rounded-lg"
                    />
                    <div className="absolute top-2 left-2 bg-black/60 text-white text-xs px-2 py-1 rounded">
                      {index + 1}
                    </div>
                  </div>
                </div>

                {/* 入力欄と操作ボタン */}
                <div className="flex-1 space-y-3">
                  {/* Alt説明文 */}
                  <div>
                    <Label htmlFor={`alt-${image.id}`} className="text-sm font-medium mb-1.5 flex items-center gap-1.5">
                      <FileText className="h-3.5 w-3.5" />
                      説明文（Alt）
                    </Label>
                    <Input
                      id={`alt-${image.id}`}
                      type="text"
                      placeholder="画像の説明を入力"
                      value={tempAlts[image.id] || ''}
                      onChange={(e) => setTempAlts(prev => ({ ...prev, [image.id]: e.target.value }))}
                      className="w-full"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      画像の内容を説明するテキスト（アクセシビリティ向上のため）
                    </p>
                  </div>

                  {/* URL入力 */}
                  <div>
                    <Label htmlFor={`url-${image.id}`} className="text-sm font-medium mb-1.5 flex items-center gap-1.5">
                      <Link className="h-3.5 w-3.5" />
                      リンクURL
                    </Label>
                    <Input
                      id={`url-${image.id}`}
                      type="url"
                      placeholder="https://example.com"
                      value={tempUrls[image.id] || ''}
                      onChange={(e) => setTempUrls(prev => ({ ...prev, [image.id]: e.target.value }))}
                      className="w-full"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      画像クリック時のリンク先URL（任意）
                    </p>
                  </div>

                  {/* 操作ボタン */}
                  <div className="flex justify-between">
                    <Button
                      size="sm"
                      onClick={() => handleSaveData(image.id)}
                      disabled={isSavingId === image.id}
                    >
                      {isSavingId === image.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <>
                          <Save className="h-4 w-4 mr-1.5" />
                          保存
                        </>
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteImage(image.id)}
                      disabled={isDeletingId === image.id}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      {isDeletingId === image.id ? (
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
          ))}
          
          {/* アップロード領域 */}
          {sidebarImages.length < 3 && (
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
                      {isDragActive ? 'ドロップしてアップロード' : 'クリックまたはドラッグして画像を追加'}
                    </p>
                    <p className="text-xs text-gray-500">
                      残り{3 - sidebarImages.length}枚追加可能
                    </p>
                  </>
                )}
              </div>
            </div>
          )}
        </div>

        {/* 説明テキスト */}
        <div className="space-y-2 text-sm text-gray-500">
          <p>• 最大3枚まで画像を追加できます（推奨サイズ: 500×1000px）</p>
          <p>• JPG、PNG、GIF、WebP形式に対応（最大2MB）</p>
        </div>
      </div>
    </div>
  );
}