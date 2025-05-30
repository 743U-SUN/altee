'use client';

import { useState, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Plus, Search, Edit, Trash2 } from 'lucide-react';
import { SeriesCreateDialog } from './SeriesCreateDialog';
import { SeriesEditDialog } from './SeriesEditDialog';
import { useToast } from '@/hooks/use-toast';

interface Manufacturer {
  id: number;
  name: string;
  slug: string;
  isActive: boolean;
}

interface Series {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  isActive: boolean;
  manufacturer: Manufacturer;
  _count: {
    products: number;
  };
}

interface SeriesManagerProps {
  manufacturers: Manufacturer[];
  isLoading: boolean;
}

export function SeriesManager({ manufacturers, isLoading }: SeriesManagerProps) {
  const { toast } = useToast();
  const [series, setSeries] = useState<Series[]>([]);
  const [filteredSeries, setFilteredSeries] = useState<Series[]>([]);
  const [isLoadingSeries, setIsLoadingSeries] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedManufacturer, setSelectedManufacturer] = useState<string>('');
  const [selectedSeries, setSelectedSeries] = useState<Series | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  useEffect(() => {
    fetchSeries();
  }, []);

  useEffect(() => {
    filterSeries();
  }, [series, searchQuery, selectedManufacturer]);

  const fetchSeries = async () => {
    try {
      const response = await fetch('/api/admin/series');
      if (!response.ok) throw new Error('Failed to fetch series');
      const data = await response.json();
      setSeries(data);
    } catch (error) {
      console.error('Error fetching series:', error);
      toast({
        title: 'エラー',
        description: 'シリーズの取得に失敗しました',
        variant: 'destructive',
      });
    } finally {
      setIsLoadingSeries(false);
    }
  };

  const filterSeries = () => {
    let filtered = series;

    if (searchQuery) {
      filtered = filtered.filter(
        (s) =>
          s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          s.slug.toLowerCase().includes(searchQuery.toLowerCase()) ||
          s.manufacturer.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (selectedManufacturer && selectedManufacturer !== 'all') {
      filtered = filtered.filter(
        (s) => s.manufacturer.id.toString() === selectedManufacturer
      );
    }

    setFilteredSeries(filtered);
  };

  const handleCreateSuccess = () => {
    fetchSeries();
    setIsCreateDialogOpen(false);
  };

  const handleEditSuccess = () => {
    fetchSeries();
    setIsEditDialogOpen(false);
    setSelectedSeries(null);
  };

  const handleEdit = (series: Series) => {
    setSelectedSeries(series);
    setIsEditDialogOpen(true);
  };

  const handleDelete = async (series: Series) => {
    if (series._count.products > 0) {
      toast({
        title: 'エラー',
        description: `このシリーズには ${series._count.products} 件の商品が関連付けられています。先に商品を削除または更新してください。`,
        variant: 'destructive',
      });
      return;
    }

    if (!confirm(`「${series.name}」を削除しますか？この操作は取り消せません。`)) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/series/${series.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || '削除に失敗しました');
      }

      toast({
        title: '成功',
        description: 'シリーズを削除しました',
      });

      fetchSeries();
    } catch (error) {
      console.error('Error deleting series:', error);
      toast({
        title: 'エラー',
        description: error instanceof Error ? error.message : 'シリーズの削除に失敗しました',
        variant: 'destructive',
      });
    }
  };

  if (isLoading || isLoadingSeries) {
    return (
      <div className="space-y-6">
        <div className="flex gap-4">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* フィルター */}
      <div className="flex gap-4 items-center">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="シリーズ名で検索..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        <Select value={selectedManufacturer} onValueChange={setSelectedManufacturer}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="メーカーで絞り込み" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">全てのメーカー</SelectItem>
            {manufacturers
              .filter((m) => m.isActive)
              .map((manufacturer) => (
                <SelectItem key={manufacturer.id} value={manufacturer.id.toString()}>
                  {manufacturer.name}
                </SelectItem>
              ))}
          </SelectContent>
        </Select>

        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          シリーズを追加
        </Button>
      </div>

      {/* テーブル */}
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>シリーズ名</TableHead>
              <TableHead>メーカー</TableHead>
              <TableHead>スラッグ</TableHead>
              <TableHead>商品数</TableHead>
              <TableHead>ステータス</TableHead>
              <TableHead className="text-right">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredSeries.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                  {searchQuery || selectedManufacturer
                    ? '条件に一致するシリーズが見つかりません'
                    : 'シリーズが登録されていません'}
                </TableCell>
              </TableRow>
            ) : (
              filteredSeries.map((series) => (
                <TableRow key={series.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{series.name}</div>
                      {series.description && (
                        <div className="text-sm text-gray-500 truncate max-w-xs">
                          {series.description}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{series.manufacturer.name}</Badge>
                  </TableCell>
                  <TableCell>
                    <code className="text-sm bg-gray-100 px-2 py-1 rounded">
                      {series.slug}
                    </code>
                  </TableCell>
                  <TableCell>{series._count.products}</TableCell>
                  <TableCell>
                    <Badge variant={series.isActive ? 'default' : 'secondary'}>
                      {series.isActive ? '有効' : '無効'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex gap-2 justify-end">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(series)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(series)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* ダイアログ */}
      <SeriesCreateDialog
        manufacturers={manufacturers}
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onSuccess={handleCreateSuccess}
      />

      {selectedSeries && (
        <SeriesEditDialog
          series={selectedSeries}
          manufacturers={manufacturers}
          open={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
          onSuccess={handleEditSuccess}
        />
      )}
    </div>
  );
}