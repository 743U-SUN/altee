"use server";

import { db } from "@/lib/prisma";
import type { Product, DeviceCategory } from "@/lib/generated/prisma";
import { unstable_cache } from "next/cache";

/**
 * 公開商品一覧の取得（キャッシュ付き）
 */
export const getPublicProducts = unstable_cache(
  async (
    categorySlug?: string,
    searchQuery?: string,
    page = 1,
    limit = 12
  ) => {
    try {
      const skip = (page - 1) * limit;
      const where: any = {};

      if (categorySlug) {
        where.category = {
          slug: categorySlug,
        };
      }

      if (searchQuery) {
        where.OR = [
          { name: { contains: searchQuery, mode: "insensitive" } },
          { description: { contains: searchQuery, mode: "insensitive" } },
        ];
      }

      const [products, total] = await Promise.all([
        db.product.findMany({
          where,
          include: {
            category: true,
            _count: {
              select: { userDevices: true },
            },
          },
          orderBy: [
            { userDevices: { _count: "desc" } }, // 人気順
            { createdAt: "desc" },
          ],
          skip,
          take: limit,
        }),
        db.product.count({ where }),
      ]);

      return {
        products,
        total,
        pages: Math.ceil(total / limit),
        currentPage: page,
      };
    } catch (error) {
      console.error("Error fetching public products:", error);
      return {
        products: [],
        total: 0,
        pages: 0,
        currentPage: 1,
      };
    }
  },
  ["public-products"],
  {
    revalidate: 300, // 5分間キャッシュ
    tags: ["products"],
  }
);

/**
 * 公開カテゴリ一覧の取得（キャッシュ付き）
 */
export const getPublicCategories = unstable_cache(
  async () => {
    try {
      const categories = await db.deviceCategory.findMany({
        orderBy: { id: "asc" },
        include: {
          _count: {
            select: { products: true },
          },
        },
      });

      return categories;
    } catch (error) {
      console.error("Error fetching public categories:", error);
      return [];
    }
  },
  ["public-categories"],
  {
    revalidate: 3600, // 1時間キャッシュ
    tags: ["categories"],
  }
);

/**
 * 人気商品の取得（トップページ用）
 */
export const getPopularProducts = unstable_cache(
  async (limit = 6) => {
    try {
      const products = await db.product.findMany({
        include: {
          category: true,
          _count: {
            select: { userDevices: true },
          },
        },
        orderBy: {
          userDevices: {
            _count: "desc",
          },
        },
        take: limit,
      });

      return products;
    } catch (error) {
      console.error("Error fetching popular products:", error);
      return [];
    }
  },
  ["popular-products"],
  {
    revalidate: 600, // 10分間キャッシュ
    tags: ["products"],
  }
);

/**
 * カテゴリ別商品統計の取得
 */
export const getCategoryStatistics = unstable_cache(
  async () => {
    try {
      const categories = await db.deviceCategory.findMany({
        include: {
          products: {
            include: {
              _count: {
                select: { userDevices: true },
              },
            },
          },
        },
        orderBy: { id: "asc" },
      });

      return categories.map((category) => ({
        id: category.id.toString(), // numberをstringに変換
        name: category.name,
        slug: category.slug,
        description: category.description,
        totalProducts: category.products.length,
        totalUsers: category.products.reduce(
          (sum, product) => sum + product._count.userDevices,
          0
        ),
      }));
    } catch (error) {
      console.error("Error fetching category statistics:", error);
      return [];
    }
  },
  ["category-statistics"],
  {
    revalidate: 1800, // 30分間キャッシュ
    tags: ["categories", "products"],
  }
);

/**
 * 商品詳細の取得（公開版）
 */
export const getPublicProduct = unstable_cache(
  async (productId: number) => {
    try {
      const product = await db.product.findUnique({
        where: { id: productId },
        include: {
          category: true,
          _count: {
            select: { userDevices: true },
          },
        },
      });

      return product;
    } catch (error) {
      console.error("Error fetching public product:", error);
      return null;
    }
  },
  ["public-product"],
  {
    revalidate: 300, // 5分間キャッシュ
    tags: ["products"],
  }
);
