import { notFound } from "next/navigation";
import { getAdminProduct, getDeviceCategories } from "@/lib/actions/admin-product-actions";
import { ProductEditForm } from "../components/ProductEditForm";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default async function AdminProductPage({
  params,
}: {
  params: { productId: string };
}) {
  const [product, categories] = await Promise.all([
    getAdminProduct(params.productId).catch(() => null),
    getDeviceCategories(),
  ]);

  if (!product) {
    notFound();
  }

  return (
    <div className="container py-8">
      <div className="mb-6">
        <Button variant="ghost" asChild>
          <Link href="/admin/devices">
            <ArrowLeft className="mr-2 h-4 w-4" />
            商品一覧に戻る
          </Link>
        </Button>
      </div>

      <div className="mb-8">
        <h1 className="text-3xl font-bold">商品を編集</h1>
        <p className="text-muted-foreground mt-2">
          商品情報の編集とPA-APIを使用した情報更新
        </p>
      </div>

      <ProductEditForm product={product} categories={categories} />
    </div>
  );
}
