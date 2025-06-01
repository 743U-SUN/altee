"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, X } from "lucide-react";
import { DeviceIcon } from "@/components/devices/DeviceIcon";
import { useState } from "react";
import type { DeviceCategory } from "@/lib/generated/prisma";

interface ProductFiltersProps {
  categories: (DeviceCategory & {
    _count: {
      products: number;
    };
  })[];
  currentCategory?: string;
  currentSearch?: string;
}

export function ProductFilters({
  categories,
  currentCategory,
  currentSearch,
}: ProductFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [searchInput, setSearchInput] = useState(currentSearch || "");

  const handleCategoryChange = (categorySlug: string | null) => {
    const params = new URLSearchParams(searchParams);
    if (categorySlug) {
      params.set("category", categorySlug);
    } else {
      params.delete("category");
    }
    params.delete("page"); // カテゴリ変更時はページをリセット
    router.push(`${pathname}?${params.toString()}`);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams);
    if (searchInput) {
      params.set("search", searchInput);
    } else {
      params.delete("search");
    }
    params.delete("page"); // 検索時はページをリセット
    router.push(`${pathname}?${params.toString()}`);
  };

  const clearFilters = () => {
    router.push(pathname);
    setSearchInput("");
  };

  const hasFilters = currentCategory || currentSearch;

  return (
    <div className="space-y-6">
      {/* 検索 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">商品を検索</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSearch} className="space-y-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="search"
                placeholder="商品名で検索..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button type="submit" className="w-full" size="sm">
              検索
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* カテゴリフィルタ */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">カテゴリ</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <Button
            variant={!currentCategory ? "default" : "ghost"}
            className="w-full justify-start"
            onClick={() => handleCategoryChange(null)}
          >
            すべてのカテゴリ
          </Button>

          {categories.map((category) => (
            <Button
              key={category.id}
              variant={currentCategory === category.slug ? "default" : "ghost"}
              className="w-full justify-start"
              onClick={() => handleCategoryChange(category.slug)}
            >
              <DeviceIcon category={category.slug} className="mr-2 h-4 w-4" />
              <span className="flex-1 text-left">{category.name}</span>
              <Badge variant="secondary" className="ml-2">
                {category._count.products}
              </Badge>
            </Button>
          ))}
        </CardContent>
      </Card>

      {/* フィルタクリア */}
      {hasFilters && (
        <Button
          variant="outline"
          className="w-full"
          onClick={clearFilters}
        >
          <X className="mr-2 h-4 w-4" />
          フィルタをクリア
        </Button>
      )}
    </div>
  );
}