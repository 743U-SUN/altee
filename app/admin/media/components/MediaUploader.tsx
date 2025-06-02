'use client';

import { useState, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { OptimizedImage } from '@/components/ui/optimized-image';
import { convertToProxyUrl } from '@/lib/utils/image-proxy';
import { Upload, X, Image, FileVideo, File, CheckCircle, AlertCircle, Info } from 'lucide-react';
import { toast } from 'sonner';
import { uploadMediaAction } from '@/lib/actions/media-actions';
import { getMediaCategoriesAction } from '@/lib/actions/media-category-actions';

interface MediaCategory {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  color: string | null;
  _count: {
    media: number;
  };
}

interface UploadFile {
  file: File;
  id: string;
  preview?: string;
  status: 'waiting' | 'uploading' | 'success' | 'error';
  progress: number;
  error?: string;
  result?: {
    id: string;
    url: string;
    fileName: string;
  };
}

export function MediaUploader() {
  const [categories, setCategories] = useState<MediaCategory[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');
  const [uploadFiles, setUploadFiles] = useState<UploadFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [altText, setAltText] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState('');

  // カテゴリ一覧を取得
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const categoriesData = await getMediaCategoriesAction();
        setCategories(categoriesData);
        // デフォルトで最初のカテゴリを選択
        if (categoriesData.length > 0) {
          setSelectedCategoryId(categoriesData[0].id);
        }
      } catch (error) {
        console.error('Categories fetch error:', error);
        toast.error('カテゴリの取得に失敗しました');
      }
    };

    fetchCategories();
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp', '.svg'],
      'video/*': ['.mp4', '.webm', '.mov']
    },
    maxSize: 50 * 1024 * 1024, // 50MB
    multiple: true,
    onDrop: async (acceptedFiles, rejectedFiles) => {
      // 拒否されたファイルのエラー表示
      rejectedFiles.forEach((rejection) => {
        const error = rejection.errors[0];
        if (error?.code === 'file-too-large') {
          toast.error(`${rejection.file.name}: ファイルサイズが制限を超えています（50MB以下）`);
        } else if (error?.code === 'file-invalid-type') {
          toast.error(`${rejection.file.name}: サポートされていないファイル形式です`);
        } else {
          toast.error(`${rejection.file.name}: 無効なファイルです`);
        }
      });

      // 受け入れられたファイルを追加
      const newFiles: UploadFile[] = acceptedFiles.map((file) => ({
        file,
        id: Math.random().toString(36).substr(2, 9),
        preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined,
        status: 'waiting',
        progress: 0
      }));

      setUploadFiles(prev => [...prev, ...newFiles]);
    }
  });

  const removeFile = (fileId: string) => {
    setUploadFiles(prev => {
      const file = prev.find(f => f.id === fileId);
      if (file?.preview) {
        URL.revokeObjectURL(file.preview);
      }
      return prev.filter(f => f.id !== fileId);
    });
  };

  const uploadFile = async (uploadFile: UploadFile) => {
    if (!selectedCategoryId) {
      throw new Error('カテゴリが選択されていません');
    }

    // ステータス更新
    setUploadFiles(prev => prev.map(f => 
      f.id === uploadFile.id 
        ? { ...f, status: 'uploading', progress: 0 }
        : f
    ));

    try {
      const formData = new FormData();
      formData.append('file', uploadFile.file);
      formData.append('categoryId', selectedCategoryId);
      formData.append('altText', altText);
      formData.append('description', description);
      formData.append('tags', tags);

      // プログレス更新（疑似的）
      const progressInterval = setInterval(() => {
        setUploadFiles(prev => prev.map(f => 
          f.id === uploadFile.id && f.status === 'uploading'
            ? { ...f, progress: Math.min(f.progress + 10, 90) }
            : f
        ));
      }, 200);

      const result = await uploadMediaAction(formData);

      clearInterval(progressInterval);

      if (result.success && result.media) {
        setUploadFiles(prev => prev.map(f => 
          f.id === uploadFile.id 
            ? { 
                ...f, 
                status: 'success', 
                progress: 100,
                result: result.media
              }
            : f
        ));
        toast.success(`${uploadFile.file.name} のアップロードが完了しました`);
      } else {
        throw new Error(result.error || 'アップロードに失敗しました');
      }

    } catch (error) {
      setUploadFiles(prev => prev.map(f => 
        f.id === uploadFile.id 
          ? { 
              ...f, 
              status: 'error', 
              progress: 0,
              error: error instanceof Error ? error.message : 'アップロードに失敗しました'
            }
          : f
      ));
      throw error;
    }
  };

  const uploadAllFiles = async () => {
    if (uploadFiles.length === 0) {
      toast.error('アップロードするファイルを選択してください');
      return;
    }

    if (!selectedCategoryId) {
      toast.error('カテゴリを選択してください');
      return;
    }

    setIsUploading(true);

    try {
      const waitingFiles = uploadFiles.filter(f => f.status === 'waiting');
      
      // 並列アップロード（最大3ファイル同時）
      const uploadPromises = waitingFiles.map(file => uploadFile(file));
      await Promise.allSettled(uploadPromises);

      const successCount = uploadFiles.filter(f => f.status === 'success').length;
      const errorCount = uploadFiles.filter(f => f.status === 'error').length;

      if (successCount > 0) {
        toast.success(`${successCount}件のファイルをアップロードしました。一覧ページで確認できます。`);
      }
      if (errorCount > 0) {
        toast.error(`${errorCount}件のファイルでエラーが発生しました`);
      }

    } catch (error) {
      console.error('Upload error:', error);
      toast.error('アップロード処理でエラーが発生しました');
    } finally {
      setIsUploading(false);
    }
  };

  const clearCompletedFiles = () => {
    setUploadFiles(prev => {
      // プレビューURLを解放
      prev.forEach(file => {
        if (file.preview && (file.status === 'success' || file.status === 'error')) {
          URL.revokeObjectURL(file.preview);
        }
      });
      return prev.filter(f => f.status === 'waiting' || f.status === 'uploading');
    });
  };

  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) {
      return <Image className="h-8 w-8 text-blue-500" />;
    } else if (file.type.startsWith('video/')) {
      return <FileVideo className="h-8 w-8 text-purple-500" />;
    } else {
      return <File className="h-8 w-8 text-gray-500" />;
    }
  };

  const getStatusIcon = (status: UploadFile['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'error':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      default:
        return null;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-6">
      {/* メインアップロードフォーム */}
      <Card>
        <CardHeader>
          <CardTitle>メディアアップロード</CardTitle>
          <CardDescription>
            ファイルを選択してメタデータを入力後、アップロードボタンを押してください
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* 1. ファイル選択エリア */}
          <div className="space-y-2">
            <Label className="text-base font-semibold">1. ファイル選択</Label>
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
              <p className="font-medium mb-1">
                {isDragActive
                  ? 'ファイルをここにドロップ'
                  : 'クリックまたはドラッグしてファイルをアップロード'
                }
              </p>
              <p className="text-sm text-gray-500 mb-2">
                JPG, PNG, GIF, WebP, SVG, MP4, WebM, MOV（最大50MB）
              </p>
              {uploadFiles.length > 0 && (
                <p className="text-sm text-blue-600 font-medium">
                  {uploadFiles.length}件のファイルが選択されています
                </p>
              )}
            </div>
          </div>

          {/* 2. カテゴリ選択 */}
          <div className="space-y-2">
            <Label htmlFor="category" className="text-base font-semibold">2. カテゴリ選択 *</Label>
            <Select value={selectedCategoryId} onValueChange={setSelectedCategoryId}>
              <SelectTrigger>
                <SelectValue placeholder="メディアのカテゴリを選択してください" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded"
                        style={{ backgroundColor: category.color || '#6366f1' }}
                      />
                      {category.name} ({category._count.media}件)
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* 3. メタデータ入力 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="altText" className="text-base font-semibold">3. Alt Text（画像説明）</Label>
              <Input
                id="altText"
                value={altText}
                onChange={(e) => setAltText(e.target.value)}
                placeholder="画像の内容を説明してください"
              />
              <p className="text-xs text-gray-500">アクセシビリティ向上のため推奨</p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="tags" className="text-base font-semibold">4. タグ</Label>
              <Input
                id="tags"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="検索用タグ（カンマ区切り）"
              />
              <p className="text-xs text-gray-500">例: アイコン, ロゴ, ブランド</p>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-base font-semibold">5. 詳細説明</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="ファイルの用途や詳細な説明を入力してください"
              rows={3}
            />
          </div>

          {/* 6. アップロードボタン */}
          <div className="space-y-2">
            <Label className="text-base font-semibold">6. アップロード実行</Label>
            <div className="flex gap-3">
              <Button
                onClick={uploadAllFiles}
                disabled={isUploading || uploadFiles.length === 0 || !selectedCategoryId}
                className="flex-1"
                size="lg"
              >
                {isUploading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    アップロード中...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-2" />
                    {uploadFiles.length > 0 ? `${uploadFiles.length}件をアップロード` : 'ファイルを選択してください'}
                  </>
                )}
              </Button>
              {uploadFiles.length > 0 && (
                <Button
                  variant="outline"
                  onClick={clearCompletedFiles}
                  disabled={isUploading}
                >
                  選択をクリア
                </Button>
              )}
            </div>
            {!selectedCategoryId && uploadFiles.length > 0 && (
              <p className="text-sm text-red-600">カテゴリを選択してください</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* アップロードファイル一覧 */}
      {uploadFiles.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>選択されたファイル ({uploadFiles.length}件)</CardTitle>
                <CardDescription>
                  アップロード予定のファイル一覧とプレビュー
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={clearCompletedFiles}
                  disabled={isUploading}
                  size="sm"
                >
                  完了分をクリア
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {uploadFiles.map((uploadFile) => (
                <div key={uploadFile.id} className="border rounded-lg p-4">
                  <div className="flex items-start gap-4">
                    {/* プレビューまたはアイコン */}
                    <div className="w-16 h-16 flex-shrink-0">
                      {uploadFile.preview ? (
                        <OptimizedImage
                          src={uploadFile.preview}
                          alt={uploadFile.file.name}
                          width={64}
                          height={64}
                          className="w-full h-full object-cover rounded"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-100 rounded">
                          {getFileIcon(uploadFile.file)}
                        </div>
                      )}
                    </div>

                    {/* ファイル情報 */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-medium truncate">{uploadFile.file.name}</p>
                        {getStatusIcon(uploadFile.status)}
                        <Badge variant={
                          uploadFile.status === 'success' ? 'default' :
                          uploadFile.status === 'error' ? 'destructive' :
                          uploadFile.status === 'uploading' ? 'secondary' :
                          'outline'
                        }>
                          {uploadFile.status === 'waiting' && '待機中'}
                          {uploadFile.status === 'uploading' && 'アップロード中'}
                          {uploadFile.status === 'success' && '完了'}
                          {uploadFile.status === 'error' && 'エラー'}
                        </Badge>
                      </div>
                      
                      <p className="text-sm text-gray-500 mb-2">
                        {formatFileSize(uploadFile.file.size)} • {uploadFile.file.type}
                      </p>

                      {/* プログレスバー */}
                      {(uploadFile.status === 'uploading' || uploadFile.status === 'success') && (
                        <Progress value={uploadFile.progress} className="h-2 mb-2" />
                      )}

                      {/* エラーメッセージ */}
                      {uploadFile.error && (
                        <p className="text-sm text-red-600">{uploadFile.error}</p>
                      )}

                      {/* 成功時の結果 */}
                      {uploadFile.result && (
                        <p className="text-sm text-green-600">
                          アップロード完了: {uploadFile.result.fileName}
                        </p>
                      )}
                    </div>

                    {/* 削除ボタン */}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFile(uploadFile.id)}
                      disabled={uploadFile.status === 'uploading'}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}