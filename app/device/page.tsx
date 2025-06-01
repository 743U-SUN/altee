import { Suspense } from "react";
import {
  getPublicProducts,
  getPublicCategories,
  getPopularProducts,
  getCategoryStatistics,
} from "@/lib/actions/public-product-actions";
import { ProductGrid } from "./components/ProductGrid";
import { ProductFilters } from "./components/ProductFilters";
import { CategoryOverview } from "./components/CategoryOverview";
import { PopularProducts } from "./components/PopularProducts";
import { ProductGridSkeleton } from "./components/ProductGridSkeleton";

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
            <PopularProducts products={popularProducts} />
          )}

          {/* カテゴリ概要 */}
          {categoryStats.length > 0 && (
            <CategoryOverview categories={categoryStats} />
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
          <ProductFilters
            categories={categories}
            currentCategory={categorySlug}
            currentSearch={searchQuery}
          />
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