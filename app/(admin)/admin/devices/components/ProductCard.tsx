"use client";

import { Product, DeviceCategory } from "@prisma/client";
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

interface ProductCardProps {
  product: Product & {
    category: DeviceCategory;
    _count: {
      UserDevice: number;
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
      await refreshProductFromAmazon(product.id);
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
    if (product._count.UserDevice > 0) {
      toast.error(`この商品は${product._count.UserDevice}人のユーザーが使用しているため削除できません`);
      return;
    }

    setIsDeleting(true);
    try {
      await deleteProduct(product.id);
      toast.success("商品を削除しました");
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
              <span>{product._count.UserDevice}</span>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <div className="space-y-3">
            <div className="aspect-square relative overflow-hidden rounded-lg bg-muted">
              <Image
                src={product.imageUrl}
                alt={product.title}
                fill
                className="object-contain"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
            </div>

            <div>
              <h3 className="font-semibold line-clamp-2">{product.title}</h3>
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
            <Link href={`/admin/devices/${product.id}`}>
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
              disabled={product._count.UserDevice > 0 || isDeleting}
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
              「{product.title}」を削除します。この操作は取り消すことができません。
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
