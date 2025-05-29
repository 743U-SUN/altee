import Link from "next/link";
import { UnifiedDeviceCard } from "@/components/devices/UnifiedDeviceCard";
import { formatPublicProductForDisplay } from "@/lib/utils/product/formatters";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, ArrowRight } from "lucide-react";
import type { Product, DeviceCategory } from "@/lib/generated/prisma";

interface PopularProductsProps {
  products: (Product & {
    category: DeviceCategory;
    _count: {
      userDevices: number;  // UserDeviceからuserDevicesに変更
    };
  })[];
}

export function PopularProducts({ products }: PopularProductsProps) {
  const displayProducts = products.map(formatPublicProductForDisplay);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-6 w-6 text-primary" />
          <h2 className="text-2xl font-bold">人気のデバイス</h2>
        </div>
        <Link
          href="/device"
          className="text-sm text-muted-foreground hover:text-primary transition-colors"
        >
          すべて見る
          <ArrowRight className="inline-block ml-1 h-4 w-4" />
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {displayProducts.map((product, index) => (
          <div key={product.id} className="relative">
            <UnifiedDeviceCard device={product} compact={true} />
            {/* ランキングバッジ */}
            <div className="absolute -top-2 -left-2 z-10">
              <Badge 
                variant="default" 
                className="rounded-full h-8 w-8 p-0 flex items-center justify-center font-bold"
              >
                {index + 1}
              </Badge>
            </div>
            {/* 使用者数バッジ */}
            <div className="absolute top-2 right-2 z-10">
              <Badge variant="secondary" className="bg-background/80 backdrop-blur">
                {product.userCount}人が使用
              </Badge>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
