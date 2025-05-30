"use client";

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { OptimizedImage } from '@/components/ui/optimized-image';
import { 
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, Edit, Trash2 } from 'lucide-react';
import { AttributeCreateDialog } from './AttributeCreateDialog';
import { AttributeEditDialog } from './AttributeEditDialog';

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

export function AttributeManager() {
  const [attributes, setAttributes] = useState<ProductAttribute[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('ALL');
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingAttribute, setEditingAttribute] = useState<ProductAttribute | null>(null);

  // 属性一覧を取得
  const fetchAttributes = async () => {
    try {
      const response = await fetch('/api/admin/attributes');
      if (response.ok) {
        const data = await response.json();
        setAttributes(data);
      }
    } catch (error) {
      console.error('Failed to fetch attributes:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttributes();
  }, []);

  // フィルタリング
  const filteredAttributes = attributes.filter(attr => {
    const matchesSearch = attr.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         attr.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === 'ALL' || attr.type === selectedType;
    return matchesSearch && matchesType;
  });

  // 編集ダイアログを開く
  const handleEdit = (attribute: ProductAttribute) => {
    setEditingAttribute(attribute);
    setEditDialogOpen(true);
  };

  // 削除処理
  const handleDelete = async (id: number) => {
    if (!confirm('この属性を削除しますか？')) return;

    try {
      const response = await fetch(`/api/admin/attributes/${id}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        await fetchAttributes();
      }
    } catch (error) {
      console.error('Failed to delete attribute:', error);
    }
  };

  // タイプ別の色分け
  const getTypeColor = (type: string) => {
    switch (type) {
      case 'MANUFACTURER': return 'bg-blue-100 text-blue-800';
      case 'SERIES': return 'bg-green-100 text-green-800';
      case 'MODEL': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // タイプ別の日本語表示
  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'MANUFACTURER': return 'メーカー';
      case 'SERIES': return 'シリーズ';
      case 'MODEL': return 'モデル';
      default: return type;
    }
  };

  if (loading) {
    return <div className="flex justify-center p-8">読み込み中...</div>;
  }

  return (
    <div className="space-y-6">
      {/* 統計カード */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">総属性数</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{attributes.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">メーカー</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {attributes.filter(a => a.type === 'MANUFACTURER').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">シリーズ</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {attributes.filter(a => a.type === 'SERIES').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">モデル</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {attributes.filter(a => a.type === 'MODEL').length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 操作バー */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>属性一覧</CardTitle>
              <CardDescription>
                商品に関連する属性を管理します
              </CardDescription>
            </div>
            <Button onClick={() => setCreateDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              新しい属性を追加
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* フィルター */}
          <div className="flex gap-4 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="属性名や説明で検索..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2"
            >
              <option value="ALL">すべてのタイプ</option>
              <option value="MANUFACTURER">メーカー</option>
              <option value="SERIES">シリーズ</option>
              <option value="MODEL">モデル</option>
            </select>
          </div>

          {/* 属性テーブル */}
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>名前</TableHead>
                <TableHead>タイプ</TableHead>
                <TableHead>説明</TableHead>
                <TableHead>ステータス</TableHead>
                <TableHead className="text-right">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAttributes.map((attribute) => (
                <TableRow key={attribute.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      {attribute.logoUrl && (
                        <div className="w-6 h-6 flex items-center justify-center">
                          <OptimizedImage
                            src={attribute.logoUrl}
                            alt={attribute.name}
                            width={24}
                            height={24}
                            className="object-contain"
                            onError={() => {
                              console.error('Logo load error:', attribute.logoUrl);
                            }}
                            onLoad={() => {
                              console.log('Logo loaded successfully:', attribute.logoUrl);
                            }}
                          />
                        </div>
                      )}
                      {attribute.name}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={getTypeColor(attribute.type)}>
                      {getTypeLabel(attribute.type)}
                    </Badge>
                  </TableCell>
                  <TableCell className="max-w-xs truncate">
                    {attribute.description || '-'}
                  </TableCell>
                  <TableCell>
                    <Badge variant={attribute.isActive ? 'default' : 'secondary'}>
                      {attribute.isActive ? '有効' : '無効'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(attribute)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(attribute.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {filteredAttributes.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              {searchTerm || selectedType !== 'ALL' 
                ? '検索条件に一致する属性が見つかりません' 
                : '属性がまだ登録されていません'}
            </div>
          )}
        </CardContent>
      </Card>

      {/* ダイアログ */}
      <AttributeCreateDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onSuccess={fetchAttributes}
      />
      
      <AttributeEditDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        attribute={editingAttribute}
        onSuccess={fetchAttributes}
      />
    </div>
  );
}