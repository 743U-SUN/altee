"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, RefreshCw, Search, TrendingUp, Download, Upload } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useState, useTransition } from "react";
import { AddProductDialog } from "./AddProductDialog";
import { CSVImportDialog } from "./CSVImportDialog";
import { batchUpdateProducts, exportProductsAsCSV } from "@/lib/actions/admin-product-actions";
import { toast } from "sonner";
import type { DeviceCategory } from "@/lib/generated/prisma";

interface ProductListHeaderProps {
  categories: (DeviceCategory & {
    _count: {
      products: number;
    };
  })[];
}

export function ProductListHeader({ categories }: ProductListHeaderProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [isBatchUpdating, setIsBatchUpdating] = useState(false);
  const [searchQuery, setSearchQuery] = useState(searchParams.get("search") || "");

  const handleCategoryChange = (value: string) => {
    const params = new URLSearchParams(searchParams);
    if (value === "all") {
      params.delete("category");
    } else {
      params.set("category", value);
    }
    params.delete("page"); // カテゴリ変更時はページをリセット
    router.push(`/admin/devices?${params.toString()}`);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(() => {
      const params = new URLSearchParams(searchParams);
      if (searchQuery) {
        params.set("search", searchQuery);
      } else {
        params.delete("search");
      }
      params.delete("page"); // 検索時はページをリセット
      router.push(`/admin/devices?${params.toString()}`);
    });
  };

  const handleBatchUpdate = async () => {
    setIsBatchUpdating(true);
    try {
      const result = await batchUpdateProducts();
      toast.success(
        `バッチ更新が完了しました: 成功 ${result.success}件, 失敗 ${result.failed}件`
      );
      if (result.failed > 0) {
        console.error("Batch update errors:", result.errors);
      }
      router.refresh();
    } catch (error) {
      toast.error("バッチ更新中にエラーが発生しました");
      console.error(error);
    } finally {
      setIsBatchUpdating(false);
    }
  };

  const handleExport = async () => {
    try {
      const categoryId = searchParams.get("category");
      const result = await exportProductsAsCSV(categoryId || undefined);
      
      if (result.success && result.csv) {
        // CSVファイルをダウンロード
        const blob = new Blob([result.csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `products_${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
        
        toast.success('商品データをエクスポートしました');
      } else {
        toast.error(result.error || 'エクスポートに失敗しました');
      }
    } catch (error) {
      toast.error('エクスポート中にエラーが発生しました');
      console.error(error);
    }
  };

  return (
    <div className="mb-6 space-y-4">
      <div className="flex flex-col sm:flex-row gap-4">
        {/* 検索フォーム */}
        <form onSubmit={handleSearch} className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              placeholder="商品名、説明、ASINで検索..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
              disabled={isPending}
            />
          </div>
        </form>

        {/* カテゴリフィルタ */}
        <Select
          value={searchParams.get("category") || "all"}
          onValueChange={handleCategoryChange}
        >
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="カテゴリを選択" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">すべてのカテゴリ</SelectItem>
            {categories.map((category) => (
              <SelectItem key={category.id} value={category.id.toString()}>
                {category.name} ({category._count.products})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* アクションボタン */}
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleExport}
            title="CSV形式でエクスポート"
          >
            <Download className="mr-2 h-4 w-4" />
            エクスポート
          </Button>

          <Button
            variant="outline"
            onClick={() => setIsImportDialogOpen(true)}
            title="CSV形式でインポート"
          >
            <Upload className="mr-2 h-4 w-4" />
            インポート
          </Button>

          <Link href="/admin/devices/promotion">
            <Button variant="outline">
              <TrendingUp className="mr-2 h-4 w-4" />
              昇格候補
            </Button>
          </Link>

          <Button
            variant="outline"
            onClick={handleBatchUpdate}
            disabled={isBatchUpdating}
          >
            {isBatchUpdating ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                更新中...
              </>
            ) : (
              <>
                <RefreshCw className="mr-2 h-4 w-4" />
                一括更新
              </>
            )}
          </Button>

          <Button onClick={() => setIsAddDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            商品を追加
          </Button>
        </div>
      </div>

      {/* 追加ダイアログ */}
      <AddProductDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        categories={categories}
      />

      {/* インポートダイアログ */}
      <CSVImportDialog
        open={isImportDialogOpen}
        onOpenChange={setIsImportDialogOpen}
      />
    </div>
  );
}
