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
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Plus, Search, Edit, Trash2, GripVertical } from 'lucide-react';
import { ColorCreateDialog } from './ColorCreateDialog';
import { ColorEditDialog } from './ColorEditDialog';
import { useToast } from '@/hooks/use-toast';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface Color {
  id: number;
  name: string;
  nameEn: string;
  hexCode: string | null;
  sortOrder: number;
  isActive: boolean;
  _count?: {
    productColors: number;
  };
}

interface SortableColorRowProps {
  color: Color;
  onEdit: (color: Color) => void;
  onDelete: (color: Color) => void;
}

function SortableColorRow({ color, onEdit, onDelete }: SortableColorRowProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: color.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <TableRow ref={setNodeRef} style={style}>
      <TableCell>
        <button
          className="cursor-grab active:cursor-grabbing"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="h-4 w-4 text-gray-400" />
        </button>
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-3">
          {color.hexCode && (
            <div
              className="w-6 h-6 rounded border border-gray-300"
              style={{ backgroundColor: color.hexCode }}
            />
          )}
          <div>
            <div className="font-medium">{color.name}</div>
            <div className="text-sm text-gray-500">{color.nameEn}</div>
          </div>
        </div>
      </TableCell>
      <TableCell>
        {color.hexCode ? (
          <code className="text-sm bg-gray-100 px-2 py-1 rounded">
            {color.hexCode}
          </code>
        ) : (
          <span className="text-gray-400">-</span>
        )}
      </TableCell>
      <TableCell>{color._count?.productColors || 0}</TableCell>
      <TableCell>
        <Badge variant={color.isActive ? 'default' : 'secondary'}>
          {color.isActive ? '有効' : '無効'}
        </Badge>
      </TableCell>
      <TableCell className="text-right">
        <div className="flex gap-2 justify-end">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onEdit(color)}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onDelete(color)}
            className="text-red-600 hover:text-red-700"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
}

export function ColorManager() {
  const { toast } = useToast();
  const [colors, setColors] = useState<Color[]>([]);
  const [filteredColors, setFilteredColors] = useState<Color[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedColor, setSelectedColor] = useState<Color | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    fetchColors();
  }, []);

  useEffect(() => {
    filterColors();
  }, [colors, searchQuery]);

  const fetchColors = async () => {
    try {
      const response = await fetch('/api/admin/colors');
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || `Failed to fetch colors: ${response.status}`);
      }
      const data = await response.json();
      setColors(data);
    } catch (error) {
      console.error('Error fetching colors:', error);
      toast({
        title: 'エラー',
        description: error instanceof Error ? error.message : 'カラーの取得に失敗しました',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filterColors = () => {
    let filtered = colors;

    if (searchQuery) {
      filtered = filtered.filter(
        (c) =>
          c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          c.nameEn.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredColors(filtered);
  };

  const handleCreateSuccess = () => {
    fetchColors();
    setIsCreateDialogOpen(false);
  };

  const handleEditSuccess = () => {
    fetchColors();
    setIsEditDialogOpen(false);
    setSelectedColor(null);
  };

  const handleEdit = (color: Color) => {
    setSelectedColor(color);
    setIsEditDialogOpen(true);
  };

  const handleDelete = async (color: Color) => {
    if (color._count && color._count.productColors > 0) {
      toast({
        title: 'エラー',
        description: `このカラーは ${color._count.productColors} 件の商品に使用されています。先に商品との関連を解除してください。`,
        variant: 'destructive',
      });
      return;
    }

    if (!confirm(`「${color.name}」を削除しますか？この操作は取り消せません。`)) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/colors/${color.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || '削除に失敗しました');
      }

      toast({
        title: '成功',
        description: 'カラーを削除しました',
      });

      fetchColors();
    } catch (error) {
      console.error('Error deleting color:', error);
      toast({
        title: 'エラー',
        description: error instanceof Error ? error.message : 'カラーの削除に失敗しました',
        variant: 'destructive',
      });
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = colors.findIndex((c) => c.id === active.id);
      const newIndex = colors.findIndex((c) => c.id === over.id);

      const newColors = arrayMove(colors, oldIndex, newIndex).map((color, index) => ({
        ...color,
        sortOrder: index,
      }));

      setColors(newColors);

      // サーバーに並び順を保存
      try {
        const response = await fetch('/api/admin/colors/reorder', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            colors: newColors.map((c) => ({ id: c.id, sortOrder: c.sortOrder })),
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to save order');
        }
      } catch (error) {
        console.error('Error saving order:', error);
        toast({
          title: 'エラー',
          description: '並び順の保存に失敗しました',
          variant: 'destructive',
        });
        fetchColors(); // エラー時は元に戻す
      }
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex gap-4">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-10 w-32" />
        </div>
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  const colorIds = filteredColors.map((c) => c.id);

  return (
    <div className="space-y-6">
      {/* フィルター */}
      <div className="flex gap-4 items-center">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="カラー名で検索..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          カラーを追加
        </Button>
      </div>

      {/* テーブル */}
      <div className="border rounded-lg">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-10"></TableHead>
                <TableHead>カラー名</TableHead>
                <TableHead>カラーコード</TableHead>
                <TableHead>使用商品数</TableHead>
                <TableHead>ステータス</TableHead>
                <TableHead className="text-right">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredColors.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                    {searchQuery
                      ? '条件に一致するカラーが見つかりません'
                      : 'カラーが登録されていません'}
                  </TableCell>
                </TableRow>
              ) : (
                <SortableContext
                  items={colorIds}
                  strategy={verticalListSortingStrategy}
                >
                  {filteredColors.map((color) => (
                    <SortableColorRow
                      key={color.id}
                      color={color}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                    />
                  ))}
                </SortableContext>
              )}
            </TableBody>
          </Table>
        </DndContext>
      </div>

      <div className="text-sm text-gray-500">
        ※ ドラッグ＆ドロップで並び順を変更できます
      </div>

      {/* ダイアログ */}
      <ColorCreateDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onSuccess={handleCreateSuccess}
      />

      {selectedColor && (
        <ColorEditDialog
          color={selectedColor}
          open={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
          onSuccess={handleEditSuccess}
        />
      )}
    </div>
  );
}