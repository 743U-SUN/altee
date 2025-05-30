"use client";

import { Product, DeviceCategory } from "@/lib/generated/prisma";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Edit, ExternalLink, RefreshCw, Trash2, Users } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { deleteProduct, refreshProductFromAmazon } from "@/lib/actions/admin-product-actions";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { DeviceIcon } from "@/components/devices/DeviceIcon";
import { convertToProxyUrl } from "@/lib/utils/image-proxy";

interface ProductCardProps {
  product: Product & {
    category: DeviceCategory;
    _count: {
      userDevices: number;
    };
  };
}

export function ProductCard({ product }: ProductCardProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refreshProductFromAmazon(product.id.toString());
      toast.success("商品情報を更新しました");
      router.refresh();
    } catch (error) {
      toast.error("商品情報の更新に失敗しました");
      console.error(error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const result = await deleteProduct(product.id.toString());
      toast.success(result.message || "商品を削除しました");
      router.refresh();
    } catch (error) {
      toast.error("商品の削除に失敗しました");
      console.error(error);
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  return (
    <>
      <Card>
        <CardHeader className="space-y-2">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <DeviceIcon category={product.category.slug} className="h-5 w-5" />
              <Badge variant="secondary">{product.category.name}</Badge>
            </div>
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Users className="h-4 w-4" />
              <span>{product._count.userDevices}</span>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <div className="space-y-3">
            <div className="aspect-square relative overflow-hidden rounded-lg bg-muted">
              {product.imageUrl?.includes('localhost:9000') ? (
                // MinIO画像の場合はプロキシ経由で表示
                <img
                  src={convertToProxyUrl(product.imageUrl)}
                  alt={product.name || '商品画像'}
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    e.currentTarget.src = '/images/no-image.svg';
                  }}
                />
              ) : (
                // 外部画像の場合はNext.js Imageを使用
                <Image
                  src={product.imageUrl || '/images/no-image.svg'}
                  alt={product.name || '商品画像'}
                  fill
                  className="object-contain"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  onError={(e) => {
                    e.currentTarget.src = '/images/no-image.svg';
                  }}
                />
              )}
            </div>

            <div>
              <h3 className="font-semibold line-clamp-2">{product.name}</h3>
              <p className="text-xs text-muted-foreground mt-1">ASIN: {product.asin}</p>
            </div>

            {product.description && (
              <p className="text-sm text-muted-foreground line-clamp-2">
                {product.description}
              </p>
            )}
          </div>
        </CardContent>

        <CardFooter className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            asChild
            className="flex-1"
          >
            <Link href={`/admin/devices/${product.id.toString()}`}>
              <Edit className="mr-2 h-4 w-4" />
              編集
            </Link>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="flex-1"
          >
            {isRefreshing ? (
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="mr-2 h-4 w-4" />
            )}
            更新
          </Button>

          <div className="flex gap-2 w-full">
            <Button
              variant="outline"
              size="sm"
              asChild
              className="flex-1"
            >
              <a
                href={product.amazonUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                <ExternalLink className="mr-2 h-4 w-4" />
                Amazon
              </a>
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowDeleteDialog(true)}
              disabled={isDeleting}
              className="flex-1"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              削除
            </Button>
          </div>
        </CardFooter>
      </Card>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>商品を削除しますか？</AlertDialogTitle>
            <AlertDialogDescription>
              「{product.name}」を削除します。この操作は取り消すことができません。
              {product._count.userDevices > 0 && (
                <span className="block mt-2 p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded border text-sm">
                  ⚠️ 注意: この商品は現在{product._count.userDevices}人のユーザーが使用中です。削除すると、これらのユーザーの使用リストからも自動的に削除されます。
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>キャンセル</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={isDeleting}>
              削除
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
