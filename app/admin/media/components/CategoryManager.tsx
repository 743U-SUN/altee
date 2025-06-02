'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { FolderOpen, Plus, Edit, Trash2, Shield, GripVertical, Info } from 'lucide-react';
import { toast } from 'sonner';
import {
  getMediaCategoriesAction,
  createMediaCategoryAction,
  updateMediaCategoryAction,
  deleteMediaCategoryAction,
  initializeSystemCategoriesAction
} from '@/lib/actions/media-category-actions';

interface MediaCategory {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  color: string | null;
  isSystem: boolean;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
  _count: {
    media: number;
  };
}

interface CategoryFormData {
  name: string;
  description: string;
  slug: string;
  color: string;
}

const DEFAULT_COLORS = [
  '#6366f1', // indigo
  '#10b981', // emerald
  '#8b5cf6', // violet
  '#f59e0b', // amber
  '#ef4444', // red
  '#3b82f6', // blue
  '#06b6d4', // cyan
  '#84cc16', // lime
  '#f97316', // orange
  '#6b7280', // gray
];

export function CategoryManager() {
  const [categories, setCategories] = useState<MediaCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<MediaCategory | null>(null);
  const [formData, setFormData] = useState<CategoryFormData>({
    name: '',
    description: '',
    slug: '',
    color: DEFAULT_COLORS[0]
  });
  const [submitting, setSubmitting] = useState(false);

  // カテゴリ一覧を取得
  const fetchCategories = async () => {
    try {
      setLoading(true);
      const categoriesData = await getMediaCategoriesAction();
      setCategories(categoriesData);
    } catch (error) {
      console.error('Categories fetch error:', error);
      toast.error('カテゴリの取得に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // フォームリセット
  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      slug: '',
      color: DEFAULT_COLORS[0]
    });
  };

  // slug自動生成
  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

  // 名前変更時のslug自動更新
  const handleNameChange = (name: string) => {
    setFormData(prev => ({
      ...prev,
      name,
      slug: prev.slug === generateSlug(prev.name) || !prev.slug ? generateSlug(name) : prev.slug
    }));
  };

  // カテゴリ作成
  const handleCreate = async () => {
    if (!formData.name.trim()) {
      toast.error('カテゴリ名を入力してください');
      return;
    }

    try {
      setSubmitting(true);
      const result = await createMediaCategoryAction({
        name: formData.name.trim(),
        description: formData.description.trim() || undefined,
        slug: formData.slug.trim() || undefined,
        color: formData.color
      });

      if (result.success) {
        toast.success('カテゴリを作成しました');
        setCreateDialogOpen(false);
        resetForm();
        await fetchCategories();
      } else {
        toast.error(result.error || 'カテゴリの作成に失敗しました');
      }
    } catch (error) {
      console.error('Create category error:', error);
      toast.error('カテゴリの作成に失敗しました');
    } finally {
      setSubmitting(false);
    }
  };

  // カテゴリ編集
  const handleEdit = async () => {
    if (!editingCategory || !formData.name.trim()) {
      toast.error('カテゴリ名を入力してください');
      return;
    }

    try {
      setSubmitting(true);
      const result = await updateMediaCategoryAction(editingCategory.id, {
        name: formData.name.trim(),
        description: formData.description.trim() || undefined,
        slug: formData.slug.trim() || undefined,
        color: formData.color
      });

      if (result.success) {
        toast.success('カテゴリを更新しました');
        setEditDialogOpen(false);
        setEditingCategory(null);
        resetForm();
        await fetchCategories();
      } else {
        toast.error(result.error || 'カテゴリの更新に失敗しました');
      }
    } catch (error) {
      console.error('Update category error:', error);
      toast.error('カテゴリの更新に失敗しました');
    } finally {
      setSubmitting(false);
    }
  };

  // カテゴリ削除
  const handleDelete = async (category: MediaCategory) => {
    try {
      const result = await deleteMediaCategoryAction(category.id);

      if (result.success) {
        toast.success('カテゴリを削除しました');
        await fetchCategories();
      } else {
        toast.error(result.error || 'カテゴリの削除に失敗しました');
      }
    } catch (error) {
      console.error('Delete category error:', error);
      toast.error('カテゴリの削除に失敗しました');
    }
  };

  // 編集ダイアログを開く
  const openEditDialog = (category: MediaCategory) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      description: category.description || '',
      slug: category.slug,
      color: category.color || DEFAULT_COLORS[0]
    });
    setEditDialogOpen(true);
  };

  // システムカテゴリを初期化
  const handleInitializeSystemCategories = async () => {
    try {
      const result = await initializeSystemCategoriesAction();
      if (result.success) {
        toast.success('システムカテゴリを初期化しました');
        await fetchCategories();
      } else {
        toast.error(result.error || 'システムカテゴリの初期化に失敗しました');
      }
    } catch (error) {
      console.error('Initialize system categories error:', error);
      toast.error('システムカテゴリの初期化に失敗しました');
    }
  };

  if (loading) {
    return (
      <div className="grid gap-4">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="border rounded-lg p-4 animate-pulse">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-6 w-6 bg-gray-200 rounded"></div>
                <div>
                  <div className="h-5 w-24 bg-gray-200 rounded mb-1"></div>
                  <div className="h-4 w-48 bg-gray-200 rounded"></div>
                </div>
              </div>
              <div className="flex gap-2">
                <div className="h-8 w-16 bg-gray-200 rounded"></div>
                <div className="h-8 w-16 bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ヘッダーとアクション */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">カテゴリ一覧 ({categories.length})</h3>
          <p className="text-sm text-gray-600">
            メディアファイルを整理するためのカテゴリを管理します
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleInitializeSystemCategories}
            size="sm"
            title="不足しているシステムカテゴリのみを作成します（既存データは保護されます）"
          >
            システムカテゴリ初期化
          </Button>
          <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm}>
                <Plus className="h-4 w-4 mr-2" />
                新規作成
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>新しいカテゴリを作成</DialogTitle>
                <DialogDescription>
                  メディアファイル分類用の新しいカテゴリを作成します
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="create-name">カテゴリ名 *</Label>
                  <Input
                    id="create-name"
                    value={formData.name}
                    onChange={(e) => handleNameChange(e.target.value)}
                    placeholder="例: プロモーション画像"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="create-slug">Slug</Label>
                  <Input
                    id="create-slug"
                    value={formData.slug}
                    onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                    placeholder="例: promotion-images"
                  />
                  <p className="text-xs text-gray-500">URLで使用されます。空白の場合は自動生成されます。</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="create-description">説明</Label>
                  <Textarea
                    id="create-description"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="カテゴリの用途や説明"
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label>カラー</Label>
                  <div className="flex gap-2 flex-wrap">
                    {DEFAULT_COLORS.map((color) => (
                      <button
                        key={color}
                        type="button"
                        className={`w-8 h-8 rounded border-2 ${
                          formData.color === color ? 'border-gray-900' : 'border-gray-300'
                        }`}
                        style={{ backgroundColor: color }}
                        onClick={() => setFormData(prev => ({ ...prev, color }))}
                      />
                    ))}
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
                  キャンセル
                </Button>
                <Button onClick={handleCreate} disabled={submitting}>
                  {submitting ? '作成中...' : '作成'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* システムカテゴリがない場合の案内 */}
      {categories.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <FolderOpen className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p className="text-gray-500 mb-4">カテゴリがまだ作成されていません</p>
            <div className="flex items-center justify-center gap-2 text-sm text-blue-600 mb-4">
              <Info className="h-4 w-4" />
              <span>まず「システムカテゴリ初期化」をクリックして基本カテゴリを作成することをお勧めします（既存データは影響を受けません）</span>
            </div>
            <Button onClick={handleInitializeSystemCategories}>
              システムカテゴリを初期化
            </Button>
          </CardContent>
        </Card>
      )}

      {/* カテゴリ一覧 */}
      <div className="grid gap-4">
        {categories.map((category) => (
          <Card key={category.id}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <GripVertical className="h-4 w-4 text-gray-400" />
                    <div 
                      className="w-6 h-6 rounded border"
                      style={{ backgroundColor: category.color || '#6366f1' }}
                    />
                  </div>
                  
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold">{category.name}</h4>
                      {category.isSystem && (
                        <Badge variant="secondary">
                          <Shield className="h-3 w-3 mr-1" />
                          システム
                        </Badge>
                      )}
                      <Badge variant="outline">
                        {category._count.media} ファイル
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600">
                      {category.description || '説明なし'}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      slug: {category.slug}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openEditDialog(category)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  
                  {!category.isSystem && category._count.media === 0 && (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="outline" size="sm">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>カテゴリを削除しますか？</AlertDialogTitle>
                          <AlertDialogDescription>
                            「{category.name}」カテゴリを完全に削除します。この操作は元に戻せません。
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>キャンセル</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDelete(category)}>
                            削除
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  )}
                  
                  {(category.isSystem || category._count.media > 0) && (
                    <Button
                      variant="outline"
                      size="sm"
                      disabled
                      title={
                        category.isSystem 
                          ? 'システムカテゴリは削除できません'
                          : 'メディアファイルが存在するため削除できません'
                      }
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* 編集ダイアログ */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>カテゴリを編集</DialogTitle>
            <DialogDescription>
              カテゴリの情報を編集します
              {editingCategory?.isSystem && (
                <Badge variant="secondary" className="ml-2">
                  <Shield className="h-3 w-3 mr-1" />
                  システムカテゴリ
                </Badge>
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">カテゴリ名 *</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="例: プロモーション画像"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-slug">Slug</Label>
              <Input
                id="edit-slug"
                value={formData.slug}
                onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                placeholder="例: promotion-images"
                disabled={editingCategory?.isSystem}
              />
              {editingCategory?.isSystem && (
                <p className="text-xs text-orange-600">システムカテゴリのslugは変更できません</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-description">説明</Label>
              <Textarea
                id="edit-description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="カテゴリの用途や説明"
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label>カラー</Label>
              <div className="flex gap-2 flex-wrap">
                {DEFAULT_COLORS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    className={`w-8 h-8 rounded border-2 ${
                      formData.color === color ? 'border-gray-900' : 'border-gray-300'
                    }`}
                    style={{ backgroundColor: color }}
                    onClick={() => setFormData(prev => ({ ...prev, color }))}
                  />
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              キャンセル
            </Button>
            <Button onClick={handleEdit} disabled={submitting}>
              {submitting ? '更新中...' : '更新'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}