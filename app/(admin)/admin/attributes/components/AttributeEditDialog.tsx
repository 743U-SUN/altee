"use client";

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { LogoUploader } from './LogoUploader';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface ProductAttribute {
  id: number;
  name: string;
  slug: string;
  type: 'MANUFACTURER' | 'SERIES' | 'MODEL';
  category?: string;
  description?: string;
  logoUrl?: string;
  website?: string;
  isActive: boolean;
  createdAt: string;
}

interface AttributeEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  attribute: ProductAttribute | null;
  onSuccess: () => void;
}

export function AttributeEditDialog({
  open,
  onOpenChange,
  attribute,
  onSuccess,
}: AttributeEditDialogProps) {
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    type: '',
    category: 'all',
    description: '',
    logoUrl: '',
    website: '',
    isActive: true,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // 属性データをフォームに設定
  useEffect(() => {
    if (attribute) {
      setFormData({
        name: attribute.name || '',
        slug: attribute.slug || '',
        type: attribute.type || '',
        category: attribute.category || 'all',
        description: attribute.description || '',
        logoUrl: attribute.logoUrl || '',
        website: attribute.website || '',
        isActive: attribute.isActive,
      });
    }
  }, [attribute]);

  // フォームリセット
  const resetForm = () => {
    setFormData({
      name: '',
      slug: '',
      type: '',
      category: 'all',
      description: '',
      logoUrl: '',
      website: '',
      isActive: true,
    });
    setError('');
  };

  // ダイアログが閉じられた時の処理
  const handleOpenChange = (open: boolean) => {
    if (!open) {
      resetForm();
    }
    onOpenChange(open);
  };

  // 名前からスラッグを自動生成
  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

  // 名前変更時にスラッグを自動更新
  const handleNameChange = (name: string) => {
    setFormData(prev => ({
      ...prev,
      name,
      slug: generateSlug(name),
    }));
  };

  // フォーム送信
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!attribute) return;

    setLoading(true);
    setError('');

    try {
      const response = await fetch(`/api/admin/attributes/${attribute.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          category: formData.category === 'all' ? null : formData.category || null,
          description: formData.description || null,
          logoUrl: formData.logoUrl || null,
          website: formData.website || null,
        }),
      });

      if (response.ok) {
        onSuccess();
        handleOpenChange(false);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to update attribute');
      }
    } catch (error) {
      setError('Network error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (!attribute) return null;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>属性を編集</DialogTitle>
          <DialogDescription>
            {attribute.name} の情報を編集します
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="text-red-600 text-sm bg-red-50 p-2 rounded">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="name">名前 *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="例: Logicool, G Pro シリーズ"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="slug">スラッグ *</Label>
            <Input
              id="slug"
              value={formData.slug}
              onChange={(e) => setFormData(prev => ({...prev, slug: e.target.value}))}
              placeholder="例: logicool, g-pro-series"
              required
            />
            <p className="text-xs text-gray-500">
              URLやAPIで使用される一意識別子
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="type">タイプ *</Label>
            <Select
              value={formData.type}
              onValueChange={(value) => setFormData(prev => ({...prev, type: value}))}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="属性のタイプを選択" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="MANUFACTURER">メーカー</SelectItem>
                <SelectItem value="SERIES">シリーズ</SelectItem>
                <SelectItem value="MODEL">モデル</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">カテゴリ</Label>
            <Select
              value={formData.category}
              onValueChange={(value) => setFormData(prev => ({...prev, category: value}))}
            >
              <SelectTrigger>
                <SelectValue placeholder="対象カテゴリ（任意）" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">すべてのカテゴリ</SelectItem>
                <SelectItem value="mouse">マウス</SelectItem>
                <SelectItem value="keyboard">キーボード</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">説明</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({...prev, description: e.target.value}))}
              placeholder="属性の説明を入力"
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label>ロゴ</Label>
            <LogoUploader
              currentLogoUrl={formData.logoUrl}
              attributeName={formData.name}
              onLogoUpdate={(newLogoUrl) => setFormData(prev => ({...prev, logoUrl: newLogoUrl}))}
              disabled={loading}
            />
            <div className="mt-2">
              <Label htmlFor="logoUrl" className="text-xs text-gray-500">または直接URLを入力:</Label>
              <Input
                id="logoUrl"
                type="url"
                value={formData.logoUrl}
                onChange={(e) => setFormData(prev => ({...prev, logoUrl: e.target.value}))}
                placeholder="https://example.com/logo.png"
                className="mt-1"
                disabled={loading}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="website">公式サイト</Label>
            <Input
              id="website"
              type="url"
              value={formData.website}
              onChange={(e) => setFormData(prev => ({...prev, website: e.target.value}))}
              placeholder="https://example.com"
            />
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="isActive"
              checked={formData.isActive}
              onCheckedChange={(checked) => setFormData(prev => ({...prev, isActive: checked}))}
            />
            <Label htmlFor="isActive">有効</Label>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={loading}
            >
              キャンセル
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? '更新中...' : '更新'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}