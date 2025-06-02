'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { OptimizedImage } from '@/components/ui/optimized-image';
import { convertToProxyUrl } from '@/lib/utils/image-proxy';
import { Search, Filter, Edit, Trash2, FileVideo, File, Image, Calendar, User, Tag, FileText, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';
import { 
  getMediaListAction, 
  deleteMediaAction, 
  updateMediaAction 
} from '@/lib/actions/media-actions';
import { getMediaCategoriesAction } from '@/lib/actions/media-category-actions';

interface MediaItem {
  id: string;
  originalName: string;
  fileName: string;
  url: string;
  mimeType: string;
  fileSize: number;
  width?: number;
  height?: number;
  categoryId: string;
  uploadedBy: string;
  tags: string[];
  altText?: string;
  description?: string;
  isSanitized?: boolean;
  createdAt: Date;
  updatedAt: Date;
  category: {
    id: string;
    name: string;
    slug: string;
    color?: string;
  };
  uploader: {
    id: string;
    name?: string;
    email: string;
  };
}

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

interface EditFormData {
  altText: string;
  description: string;
  tags: string[];
  categoryId: string;
}

export function MediaGrid() {
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [categories, setCategories] = useState<MediaCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedMimeType, setSelectedMimeType] = useState<string>('all');
  const [editingMedia, setEditingMedia] = useState<MediaItem | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editFormData, setEditFormData] = useState<EditFormData>({
    altText: '',
    description: '',
    tags: [],
    categoryId: ''
  });
  const [submitting, setSubmitting] = useState(false);

  // データ取得
  const fetchData = async () => {
    try {
      setLoading(true);
      const [mediaResponse, categoriesData] = await Promise.all([
        getMediaListAction({
          categoryId: selectedCategory === 'all' ? undefined : selectedCategory,
          search: searchTerm || undefined,
          mimeType: selectedMimeType === 'all' ? undefined : selectedMimeType,
          limit: 50
        }),
        getMediaCategoriesAction()
      ]);

      setMediaItems(mediaResponse.media);
      setCategories(categoriesData);
    } catch (error) {
      console.error('Media fetch error:', error);
      toast.error('メディアの取得に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedCategory, selectedMimeType]);

  // 検索の実行
  const handleSearch = () => {
    fetchData();
  };

  // 編集ダイアログを開く
  const openEditDialog = (media: MediaItem) => {
    setEditingMedia(media);
    setEditFormData({
      altText: media.altText || '',
      description: media.description || '',
      tags: media.tags,
      categoryId: media.categoryId
    });
    setEditDialogOpen(true);
  };

  // メディア更新
  const handleUpdate = async () => {
    if (!editingMedia) return;

    try {
      setSubmitting(true);
      const result = await updateMediaAction(editingMedia.id, {
        altText: editFormData.altText || undefined,
        description: editFormData.description || undefined,
        tags: editFormData.tags,
        categoryId: editFormData.categoryId
      });

      if (result.success) {
        toast.success('メディア情報を更新しました');
        setEditDialogOpen(false);
        setEditingMedia(null);
        await fetchData();
      } else {
        toast.error(result.error || 'メディアの更新に失敗しました');
      }
    } catch (error) {
      console.error('Update media error:', error);
      toast.error('メディアの更新に失敗しました');
    } finally {
      setSubmitting(false);
    }
  };

  // メディア削除
  const handleDelete = async (media: MediaItem) => {
    try {
      const result = await deleteMediaAction(media.id);

      if (result.success) {
        toast.success('メディアを削除しました');
        await fetchData();
      } else {
        toast.error(result.error || 'メディアの削除に失敗しました');
      }
    } catch (error) {
      console.error('Delete media error:', error);
      toast.error('メディアの削除に失敗しました');
    }
  };

  // ファイルサイズフォーマット
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // ファイルタイプアイコン
  const getFileIcon = (mimeType: string) => {
    if (mimeType === 'image/svg+xml') {
      return <Image className="h-4 w-4 text-green-500" />;
    } else if (mimeType.startsWith('image/')) {
      return <Image className="h-4 w-4 text-blue-500" />;
    } else if (mimeType.startsWith('video/')) {
      return <FileVideo className="h-4 w-4 text-purple-500" />;
    } else {
      return <File className="h-4 w-4 text-gray-500" />;
    }
  };

  // 日付フォーマット
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('ja-JP', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(date));
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex gap-4 mb-6">
          <div className="h-10 w-64 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-10 w-32 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-10 w-32 bg-gray-200 rounded animate-pulse"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="border rounded-lg p-4 animate-pulse">
              <div className="aspect-video bg-gray-200 rounded mb-3"></div>
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-3 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* フィルター・検索 */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Label htmlFor="search" className="sr-only">検索</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="search"
                  placeholder="ファイル名、説明、タグで検索..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="flex gap-2">
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="カテゴリを選択" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">
                    <div className="flex items-center gap-2">
                      <Filter className="h-3 w-3" />
                      すべてのカテゴリ
                    </div>
                  </SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded"
                          style={{ backgroundColor: category.color || '#6366f1' }}
                        />
                        {category.name} ({category._count.media})
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedMimeType} onValueChange={setSelectedMimeType}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="形式" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">すべて</SelectItem>
                  <SelectItem value="image">画像</SelectItem>
                  <SelectItem value="video">動画</SelectItem>
                </SelectContent>
              </Select>

              <Button onClick={handleSearch} variant="outline">
                検索
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 結果表示 */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600">
          {mediaItems.length} 件のメディアファイル
          {selectedCategory !== 'all' && categories.find(c => c.id === selectedCategory) && 
            ` (カテゴリ: ${categories.find(c => c.id === selectedCategory)?.name})`
          }
        </p>
      </div>

      {/* メディアグリッド */}
      {mediaItems.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Image className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p className="text-gray-500 mb-2">メディアファイルが見つかりません</p>
            <p className="text-sm text-gray-400">
              {searchTerm || selectedCategory !== 'all' || selectedMimeType !== 'all'
                ? '検索条件を変更してお試しください'
                : 'メディアをアップロードしてください'
              }
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {mediaItems.map((media) => (
            <Card key={media.id} className="group hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                {/* プレビュー */}
                <div className="aspect-video bg-gray-100 rounded-lg mb-3 relative overflow-hidden">
                  {media.mimeType === 'image/svg+xml' ? (
                    <img
                      src={convertToProxyUrl(media.url)}
                      alt={media.altText || media.originalName}
                      className="w-full h-full object-contain p-2"
                    />
                  ) : media.mimeType.startsWith('image/') ? (
                    <OptimizedImage
                      src={convertToProxyUrl(media.url)}
                      alt={media.altText || media.originalName}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      {getFileIcon(media.mimeType)}
                      <span className="ml-2 text-sm text-gray-600">
                        {media.mimeType.split('/')[1].toUpperCase()}
                      </span>
                    </div>
                  )}
                  
                  {/* アクションボタン */}
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => openEditDialog(media)}
                      className="h-8 w-8 p-0"
                    >
                      <Edit className="h-3 w-3" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          size="sm"
                          variant="destructive"
                          className="h-8 w-8 p-0"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>メディアを削除しますか？</AlertDialogTitle>
                          <AlertDialogDescription>
                            「{media.originalName}」を完全に削除します。この操作は元に戻せません。
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>キャンセル</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDelete(media)}>
                            削除
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>

                  {/* カテゴリバッジ */}
                  <div className="absolute bottom-2 left-2">
                    <Badge 
                      variant="secondary" 
                      className="text-xs"
                      style={{ 
                        backgroundColor: media.category.color || '#6366f1',
                        color: 'white'
                      }}
                    >
                      {media.category.name}
                    </Badge>
                  </div>
                </div>

                {/* メタデータ */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    {getFileIcon(media.mimeType)}
                    <h4 className="font-medium text-sm truncate flex-1" title={media.originalName}>
                      {media.originalName}
                    </h4>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <span>{formatFileSize(media.fileSize)}</span>
                    {media.width && media.height && (
                      <span>• {media.width}×{media.height}</span>
                    )}
                  </div>

                  {media.altText && (
                    <p className="text-xs text-gray-600 line-clamp-2" title={media.altText}>
                      {media.altText}
                    </p>
                  )}

                  {media.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {media.tags.slice(0, 3).map((tag, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                      {media.tags.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{media.tags.length - 3}
                        </Badge>
                      )}
                    </div>
                  )}

                  <div className="flex items-center gap-2 text-xs text-gray-400 pt-2 border-t">
                    <Calendar className="h-3 w-3" />
                    <span>{formatDate(media.createdAt)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* 編集ダイアログ */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>メディア情報を編集</DialogTitle>
            <DialogDescription>
              {editingMedia?.originalName}
            </DialogDescription>
          </DialogHeader>
          
          {editingMedia && (
            <div className="space-y-4">
              {/* プレビュー */}
              <div className="flex gap-4">
                <div className="w-32 h-24 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                  {editingMedia.mimeType === 'image/svg+xml' ? (
                    <img
                      src={convertToProxyUrl(editingMedia.url)}
                      alt={editingMedia.altText || editingMedia.originalName}
                      className="w-full h-full object-contain p-1"
                    />
                  ) : editingMedia.mimeType.startsWith('image/') ? (
                    <OptimizedImage
                      src={convertToProxyUrl(editingMedia.url)}
                      alt={editingMedia.altText || editingMedia.originalName}
                      width={128}
                      height={96}
                      className="object-cover w-full h-full"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      {getFileIcon(editingMedia.mimeType)}
                    </div>
                  )}
                </div>
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2">
                    {getFileIcon(editingMedia.mimeType)}
                    <span className="font-medium">{editingMedia.originalName}</span>
                  </div>
                  <div className="text-sm text-gray-500">
                    <div>サイズ: {formatFileSize(editingMedia.fileSize)}</div>
                    {editingMedia.width && editingMedia.height && (
                      <div>解像度: {editingMedia.width}×{editingMedia.height}px</div>
                    )}
                    <div>形式: {editingMedia.mimeType}</div>
                  </div>
                </div>
              </div>

              {/* 編集フォーム */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-category">カテゴリ</Label>
                  <Select value={editFormData.categoryId} onValueChange={(value) => setEditFormData(prev => ({ ...prev, categoryId: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="カテゴリを選択" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          <div className="flex items-center gap-2">
                            <div 
                              className="w-3 h-3 rounded"
                              style={{ backgroundColor: category.color || '#6366f1' }}
                            />
                            {category.name}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-altText">Alt Text</Label>
                  <Input
                    id="edit-altText"
                    value={editFormData.altText}
                    onChange={(e) => setEditFormData(prev => ({ ...prev, altText: e.target.value }))}
                    placeholder="画像の説明"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-tags">タグ</Label>
                <Input
                  id="edit-tags"
                  value={editFormData.tags.join(', ')}
                  onChange={(e) => setEditFormData(prev => ({ 
                    ...prev, 
                    tags: e.target.value.split(',').map(tag => tag.trim()).filter(Boolean)
                  }))}
                  placeholder="タグ（カンマ区切り）"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-description">説明</Label>
                <Textarea
                  id="edit-description"
                  value={editFormData.description}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="詳細な説明"
                  rows={3}
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              キャンセル
            </Button>
            <Button onClick={handleUpdate} disabled={submitting}>
              {submitting ? '更新中...' : '更新'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}