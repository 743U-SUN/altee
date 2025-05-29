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
import { Plus, RefreshCw, Search, TrendingUp } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useState, useTransition } from "react";
import { AddProductDialog } from "./AddProductDialog";
import { batchUpdateProducts } from "@/lib/actions/admin-product-actions";
import { toast } from "sonner";
import type { DeviceCategory } from "@prisma/client";

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
              <SelectItem key={category.id} value={category.id}>
                {category.name} ({category._count.products})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* アクションボタン */}
        <div className="flex gap-2">
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
    </div>
  );
}
