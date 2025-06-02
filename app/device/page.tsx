import { Suspense, lazy } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import {
  getPublicProducts,
  getPublicCategories,
  getPopularProducts,
  getCategoryStatistics,
} from "@/lib/actions/public-product-actions";
import { ProductGridSkeleton } from "./components/ProductGridSkeleton";

// 重いコンポーネントを遅延ロード
const ProductGrid = lazy(() => import("./components/ProductGrid").then(module => ({ default: module.ProductGrid })));
const ProductFilters = lazy(() => import("./components/ProductFilters").then(module => ({ default: module.ProductFilters })));
const CategoryOverview = lazy(() => import("./components/CategoryOverview").then(module => ({ default: module.CategoryOverview })));
const PopularProducts = lazy(() => import("./components/PopularProducts").then(module => ({ default: module.PopularProducts })));

// スケルトンローダー
const ProductFiltersSkeleton = () => (
  <div className="space-y-4">
    <Skeleton className="h-6 w-24" />
    <div className="space-y-3">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="space-y-2">
          <Skeleton className="h-4 w-20" />
          <div className="space-y-1">
            {[...Array(3)].map((_, j) => (
              <Skeleton key={j} className="h-6 w-full" />
            ))}
          </div>
        </div>
      ))}
    </div>
  </div>
);

const PopularProductsSkeleton = () => (
  <div className="space-y-4">
    <Skeleton className="h-6 w-32" />
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="border rounded-lg p-4">
          <Skeleton className="h-48 w-full mb-4" />
          <Skeleton className="h-4 w-3/4 mb-2" />
          <Skeleton className="h-3 w-1/2" />
        </div>
      ))}
    </div>
  </div>
);

const CategoryOverviewSkeleton = () => (
  <div className="space-y-4">
    <Skeleton className="h-6 w-40" />
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="border rounded-lg p-6">
          <Skeleton className="h-12 w-12 mb-4" />
          <Skeleton className="h-5 w-24 mb-2" />
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-3 w-16" />
        </div>
      ))}
    </div>
  </div>
);

export default async function DeviceCatalogPage({
  searchParams,
}: {
  searchParams: { page?: string; category?: string; search?: string };
}) {
  const currentPage = Number(searchParams.page) || 1;
  const categorySlug = searchParams.category;
  const searchQuery = searchParams.search;

  // 並列でデータを取得
  const [productsData, categories, popularProducts, categoryStats] = await Promise.all([
    getPublicProducts(categorySlug, searchQuery, currentPage),
    getPublicCategories(),
    !categorySlug && !searchQuery ? getPopularProducts() : Promise.resolve([]),
    !categorySlug && !searchQuery ? getCategoryStatistics() : Promise.resolve([]),
  ]);

  const isFiltered = !!categorySlug || !!searchQuery;

  return (
    <div className="space-y-8">
      {/* ヒーローセクション（フィルタなしの場合のみ） */}
      {!isFiltered && (
        <>
          <div className="text-center space-y-4 py-8">
            <h1 className="text-4xl font-bold">
              配信者・VTuber向けデバイスカタログ
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              プロが使用している高品質なデバイスを厳選。
              あなたの配信環境を次のレベルへ。
            </p>
          </div>

          {/* 人気商品 */}
          {popularProducts.length > 0 && (
            <Suspense fallback={<PopularProductsSkeleton />}>
              <PopularProducts products={popularProducts} />
            </Suspense>
          )}

          {/* カテゴリ概要 */}
          {categoryStats.length > 0 && (
            <Suspense fallback={<CategoryOverviewSkeleton />}>
              <CategoryOverview categories={categoryStats} />
            </Suspense>
          )}

          <div className="border-t pt-8">
            <h2 className="text-2xl font-bold mb-6">すべての商品</h2>
          </div>
        </>
      )}

      {/* フィルタとメインコンテンツ */}
      <div className="grid gap-8 lg:grid-cols-4">
        {/* サイドバーフィルタ */}
        <div className="lg:col-span-1">
          <Suspense fallback={<ProductFiltersSkeleton />}>
            <ProductFilters
              categories={categories}
              currentCategory={categorySlug}
              currentSearch={searchQuery}
            />
          </Suspense>
        </div>

        {/* 商品グリッド */}
        <div className="lg:col-span-3">
          {isFiltered && (
            <div className="mb-6">
              <h2 className="text-2xl font-bold">
                {categorySlug
                  ? categories.find((c) => c.slug === categorySlug)?.name
                  : "検索結果"}
              </h2>
              <p className="text-muted-foreground mt-1">
                {productsData.total}件の商品が見つかりました
              </p>
            </div>
          )}

          <Suspense fallback={<ProductGridSkeleton />}>
            <ProductGrid
              products={productsData.products}
              totalPages={productsData.pages}
              currentPage={productsData.currentPage}
            />
          </Suspense>
        </div>
      </div>
    </div>
  );
}