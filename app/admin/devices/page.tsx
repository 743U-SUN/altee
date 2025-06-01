import { Suspense } from "react";
import { getAdminProducts, getDeviceCategories } from "@/lib/actions/admin-product-actions";
import { ProductList } from "./components/ProductList";
import { ProductListHeader } from "./components/ProductListHeader";
import { ProductListSkeleton } from "./components/ProductListSkeleton";
import { ProductUpdateStatus } from "./components/ProductUpdateStatus";

export default async function AdminDevicesPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; category?: string; search?: string }>;
}) {
  const resolvedSearchParams = await searchParams;
  const currentPage = Number(resolvedSearchParams.page) || 1;
  const categoryId = resolvedSearchParams.category;
  const searchQuery = resolvedSearchParams.search;

  const [productsData, categories] = await Promise.all([
    getAdminProducts(currentPage, 20, categoryId, searchQuery),
    getDeviceCategories(),
  ]);

  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">デバイス管理</h1>
        <p className="text-muted-foreground mt-2">
          公式商品の管理とAmazon PA-APIを使用した商品情報の更新
        </p>
      </div>

      <ProductListHeader categories={categories} />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Suspense fallback={<ProductListSkeleton />}>
            <ProductList
              products={productsData.products}
              totalPages={productsData.pages}
              currentPage={productsData.currentPage}
            />
          </Suspense>
        </div>
        
        <div>
          <ProductUpdateStatus />
        </div>
      </div>
    </div>
  );
}