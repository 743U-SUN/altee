"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { UnifiedDeviceCard } from "@/components/devices/UnifiedDeviceCard";
import { DeviceComparison } from "@/components/devices/DeviceComparison";
import { Pagination } from "@/components/ui/pagination";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatPublicProductForDisplay } from "@/lib/utils/product/formatters";
import { getFavoriteStatus } from "@/lib/actions/favorite-actions";
import { Scale, X } from "lucide-react";
import type { Product, DeviceCategory } from "@/lib/generated/prisma";
import { useSession } from "next-auth/react";

interface ProductGridProps {
  products: (Product & {
    category: DeviceCategory;
    _count: {
      userDevices: number;  // UserDeviceからuserDevicesに変更
    };
  })[];
  totalPages: number;
  currentPage: number;
}

export function ProductGrid({ products, totalPages, currentPage }: ProductGridProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session } = useSession();
  const [selectedProducts, setSelectedProducts] = useState<Set<string>>(new Set());
  const [showComparison, setShowComparison] = useState(false);
  const [favoriteStatus, setFavoriteStatus] = useState<Record<number, boolean>>({});

  // お気に入り状態を取得
  useEffect(() => {
    const fetchFavoriteStatus = async () => {
      if (!session?.user) return;
      
      const productIds = products.map(p => p.id);
      const status = await getFavoriteStatus(productIds);
      setFavoriteStatus(status);
    };
    
    fetchFavoriteStatus();
  }, [products, session]);

  // 商品を表示用に変換
  const displayProducts = products.map(formatPublicProductForDisplay);

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", page.toString());
    router.push(`/device?${params.toString()}`);
  };

  const toggleSelection = (productId: string) => {
    const newSelection = new Set(selectedProducts);
    if (newSelection.has(productId)) {
      newSelection.delete(productId);
    } else {
      newSelection.add(productId);
    }
    setSelectedProducts(newSelection);
  };

  const clearSelection = () => {
    setSelectedProducts(new Set());
  };

  const handleFavoriteToggle = (productId: number, isFavorited: boolean) => {
    setFavoriteStatus(prev => ({
      ...prev,
      [productId]: isFavorited
    }));
  };

  const productsToCompare = displayProducts.filter((product) =>
    selectedProducts.has(product.id)
  );

  if (products.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">商品が見つかりませんでした。</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 比較機能 */}
      {selectedProducts.size > 0 && (
        <div className="flex items-center justify-between bg-muted p-4 rounded-lg">
          <div className="flex items-center gap-2">
            <Badge variant="secondary">{selectedProducts.size}個選択中</Badge>
            <Button variant="ghost" size="sm" onClick={clearSelection}>
              <X className="h-4 w-4 mr-1" />
              選択解除
            </Button>
          </div>
          <Button
            onClick={() => setShowComparison(true)}
            disabled={selectedProducts.size < 2}
          >
            <Scale className="h-4 w-4 mr-2" />
            比較する（{Math.min(selectedProducts.size, 5)}個）
          </Button>
        </div>
      )}

      {/* 商品グリッド */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {displayProducts.map((product) => (
          <div key={product.id} className="relative">
            <UnifiedDeviceCard
              device={product}
              selectable={true}
              selected={selectedProducts.has(product.id)}
              onSelectionChange={(selected) => toggleSelection(product.id)}
              showFavorite={!!session?.user}
              initialFavorited={favoriteStatus[product.productId!] || false}
              onFavoriteToggle={(isFavorited) => handleFavoriteToggle(product.productId!, isFavorited)}
            />
            {/* 使用者数バッジ */}
            <div className="absolute top-2 left-2 z-10">
              <Badge variant="secondary" className="bg-background/80 backdrop-blur">
                {product.userCount}人が使用中
              </Badge>
            </div>
          </div>
        ))}
      </div>

      {/* ページネーション */}
      {totalPages > 1 && (
        <div className="flex justify-center">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </div>
      )}

      {/* 比較ダイアログ */}
      <DeviceComparison
        devices={productsToCompare.slice(0, 5)}
        open={showComparison}
        onOpenChange={setShowComparison}
      />
    </div>
  );
}
