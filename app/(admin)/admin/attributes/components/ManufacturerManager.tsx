'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  Plus, 
  Search, 
  MoreVertical, 
  Edit, 
  Trash2, 
  ExternalLink,
  Building2
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { ManufacturerCreateDialog } from './ManufacturerCreateDialog';
import { ManufacturerEditDialog } from './ManufacturerEditDialog';
import { Skeleton } from '@/components/ui/skeleton';
import Image from 'next/image';

interface Manufacturer {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  logoUrl: string | null;
  website: string | null;
  isActive: boolean;
  _count?: {
    products: number;
    series: number;
  };
}

export function ManufacturerManager() {
  const router = useRouter();
  const { toast } = useToast();
  const [manufacturers, setManufacturers] = useState<Manufacturer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingManufacturer, setEditingManufacturer] = useState<Manufacturer | null>(null);

  // メーカー一覧を取得
  const fetchManufacturers = async () => {
    try {
      const response = await fetch('/api/admin/manufacturers');
      if (!response.ok) throw new Error('Failed to fetch');
      const data = await response.json();
      setManufacturers(data);
    } catch (error) {
      toast({
        title: 'エラー',
        description: 'メーカー情報の取得に失敗しました',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchManufacturers();
  }, []);

  // 削除処理
  const handleDelete = async (id: number) => {
    if (!confirm('このメーカーを削除してもよろしいですか？関連する商品への影響にご注意ください。')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/manufacturers/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete');

      toast({
        title: '成功',
        description: 'メーカーを削除しました',
      });
      
      fetchManufacturers();
    } catch (error) {
      toast({
        title: 'エラー',
        description: 'メーカーの削除に失敗しました',
        variant: 'destructive',
      });
    }
  };

  // フィルタリング
  const filteredManufacturers = manufacturers.filter(manufacturer =>
    manufacturer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    manufacturer.slug.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* ヘッダー */}
      <div className="flex items-center justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="メーカー名で検索..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button onClick={() => setShowCreateDialog(true)}>
          <Plus className="mr-2 h-4 w-4" />
          メーカーを追加
        </Button>
      </div>

      {/* テーブル */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ロゴ</TableHead>
              <TableHead>メーカー名</TableHead>
              <TableHead>スラッグ</TableHead>
              <TableHead>商品数</TableHead>
              <TableHead>シリーズ数</TableHead>
              <TableHead>ステータス</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredManufacturers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground">
                  メーカーが登録されていません
                </TableCell>
              </TableRow>
            ) : (
              filteredManufacturers.map((manufacturer) => (
                <TableRow key={manufacturer.id}>
                  <TableCell>
                    {manufacturer.logoUrl ? (
                      <div className="relative h-8 w-16">
                        <Image
                          src={manufacturer.logoUrl}
                          alt={manufacturer.name}
                          fill
                          className="object-contain"
                        />
                      </div>
                    ) : (
                      <Building2 className="h-8 w-8 text-muted-foreground" />
                    )}
                  </TableCell>
                  <TableCell className="font-medium">
                    {manufacturer.name}
                    {manufacturer.website && (
                      <a
                        href={manufacturer.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="ml-2 inline-flex text-blue-600 hover:text-blue-800"
                      >
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    )}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {manufacturer.slug}
                  </TableCell>
                  <TableCell>{manufacturer._count?.products || 0}</TableCell>
                  <TableCell>{manufacturer._count?.series || 0}</TableCell>
                  <TableCell>
                    <Badge variant={manufacturer.isActive ? 'default' : 'secondary'}>
                      {manufacturer.isActive ? '有効' : '無効'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => setEditingManufacturer(manufacturer)}
                        >
                          <Edit className="mr-2 h-4 w-4" />
                          編集
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDelete(manufacturer.id)}
                          className="text-destructive"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          削除
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* ダイアログ */}
      <ManufacturerCreateDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onSuccess={() => {
          setShowCreateDialog(false);
          fetchManufacturers();
        }}
      />

      {editingManufacturer && (
        <ManufacturerEditDialog
          manufacturer={editingManufacturer}
          open={!!editingManufacturer}
          onOpenChange={(open) => !open && setEditingManufacturer(null)}
          onSuccess={() => {
            setEditingManufacturer(null);
            fetchManufacturers();
          }}
        />
      )}
    </div>
  );
}