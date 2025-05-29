"use server";

import { auth } from "@/auth";
import { db } from "@/lib/prisma";
import { Prisma, Product } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { fetchProductFromPAAPI } from "@/lib/services/amazon/pa-api";
import { fetchProductFromAmazonUrl } from "@/lib/services/amazon/og-metadata";
import { extractASIN } from "@/lib/utils/amazon/url-parser";

/**
 * 管理者権限チェック
 */
async function checkAdminAuth() {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") {
    throw new Error("Unauthorized: Admin access required");
  }
  return session.user;
}

/**
 * 商品一覧の取得（管理者用）
 */
export async function getAdminProducts(
  page = 1,
  limit = 20,
  categoryId?: string,
  searchQuery?: string
) {
  try {
    await checkAdminAuth();

    const skip = (page - 1) * limit;
    const where: Prisma.ProductWhereInput = {};

    if (categoryId) {
      where.categoryId = categoryId;
    }

    if (searchQuery) {
      where.OR = [
        { title: { contains: searchQuery, mode: "insensitive" } },
        { description: { contains: searchQuery, mode: "insensitive" } },
        { asin: { contains: searchQuery, mode: "insensitive" } },
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
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      db.product.count({ where }),
    ]);

    // Decimal型をstring型に変換
    const serializedProducts = products.map(product => ({
      ...product,
      price: product.price ? product.price.toString() : null,
    }));

    return {
      products: serializedProducts,
      total,
      pages: Math.ceil(total / limit),
      currentPage: page,
    };
  } catch (error) {
    console.error("Error fetching admin products:", error);
    throw error;
  }
}

/**
 * 商品の詳細取得（管理者用）
 */
export async function getAdminProduct(productId: string) {
  try {
    await checkAdminAuth();

    const product = await db.product.findUnique({
      where: { id: productId },
      include: {
        category: true,
        userDevices: {
          include: {
            user: {
              select: {
                id: true,
                handle: true,
                name: true,
                image: true,
              },
            },
          },
        },
      },
    });

    if (!product) {
      throw new Error("Product not found");
    }

    // Decimal型をstring型に変換
    const serializedProduct = {
      ...product,
      price: product.price ? product.price.toString() : null,
    };

    return serializedProduct;
  } catch (error) {
    console.error("Error fetching admin product:", error);
    throw error;
  }
}

/**
 * Amazon URLから商品情報を取得（PA-API優先、OGメタデータフォールバック）
 */
export async function fetchProductFromAmazon(amazonUrl: string) {
  try {
    await checkAdminAuth();

    const asin = await extractASIN(amazonUrl);
    if (!asin) {
      throw new Error("Invalid Amazon URL: ASIN not found");
    }

    // まずPA-APIで試行
    try {
      console.log('Trying PA-API for ASIN:', asin);
      const productData = await fetchProductFromPAAPI(asin);
      
      // PA-API成功時はデータを変換して返す
      return {
        title: productData.title,
        description: productData.description || '',
        imageUrl: productData.imageUrl || '/images/no-image.svg',
        asin: asin,
        amazonUrl: `https://www.amazon.co.jp/dp/${asin}`,
        source: 'PA-API',
      };
    } catch (paApiError) {
      console.log('PA-API failed, falling back to OG metadata:', paApiError.message);
      
      // PA-API失敗時はOGメタデータでフォールバック
      try {
        const ogData = await fetchProductFromAmazonUrl(amazonUrl);
        
        return {
          title: ogData.title,
          description: ogData.description || '',
          imageUrl: ogData.imageUrl,
          asin: ogData.asin,
          amazonUrl: `https://www.amazon.co.jp/dp/${ogData.asin}`,
          source: 'OG-metadata',
        };
      } catch (ogError) {
        console.error('Both PA-API and OG metadata failed:', ogError);
        throw new Error(`商品情報の取得に失敗しました: PA-APIエラー (${paApiError.message}), OGメタデータエラー (${ogError.message})`);
      }
    }
  } catch (error) {
    console.error("Error fetching product from Amazon:", error);
    throw error;
  }
}

/**
 * 商品の作成（管理者用）
 */
export async function createProduct(data: {
  categoryId: string;
  title: string;
  description?: string;
  imageUrl: string;
  amazonUrl: string;
  asin: string;
  attributes?: Record<string, any>;
}) {
  try {
    await checkAdminAuth();

    // ASINの重複チェック
    const existingProduct = await db.product.findUnique({
      where: { asin: data.asin },
    });

    if (existingProduct) {
      throw new Error("Product with this ASIN already exists");
    }

    const product = await db.product.create({
      data: {
        categoryId: data.categoryId,
        title: data.title,
        description: data.description,
        imageUrl: data.imageUrl,
        amazonUrl: data.amazonUrl,
        asin: data.asin,
        attributes: data.attributes || {},
      },
      include: {
        category: true,
      },
    });

    // Decimal型をstring型に変換
    const serializedProduct = {
      ...product,
      price: product.price ? product.price.toString() : null,
    };

    revalidatePath("/admin/devices");
    return serializedProduct;
  } catch (error) {
    console.error("Error creating product:", error);
    throw error;
  }
}

/**
 * 商品の更新（管理者用）
 */
export async function updateProduct(
  productId: string,
  data: {
    categoryId?: string;
    title?: string;
    description?: string;
    imageUrl?: string;
    amazonUrl?: string;
    attributes?: Record<string, any>;
  }
) {
  try {
    await checkAdminAuth();

    const product = await db.product.update({
      where: { id: productId },
      data,
      include: {
        category: true,
      },
    });

    // Decimal型をstring型に変換
    const serializedProduct = {
      ...product,
      price: product.price ? product.price.toString() : null,
    };

    revalidatePath("/admin/devices");
    revalidatePath(`/admin/devices/${productId}`);
    return serializedProduct;
  } catch (error) {
    console.error("Error updating product:", error);
    throw error;
  }
}

/**
 * 商品の削除（管理者用）
 */
export async function deleteProduct(productId: string) {
  try {
    await checkAdminAuth();

    // 関連するuserDevicesのチェック
    const relatedDevices = await db.userDevice.count({
      where: { productId },
    });

    if (relatedDevices > 0) {
      throw new Error(
        `Cannot delete product: ${relatedDevices} users are using this product`
      );
    }

    await db.product.delete({
      where: { id: productId },
    });

    revalidatePath("/admin/devices");
    return { success: true };
  } catch (error) {
    console.error("Error deleting product:", error);
    throw error;
  }
}

/**
 * PA-APIを使用した商品情報の更新
 */
export async function refreshProductFromAmazon(productId: string) {
  try {
    await checkAdminAuth();

    const product = await db.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      throw new Error("Product not found");
    }

    // PA-APIから最新情報を取得
    const updatedData = await fetchProductFromPAAPI(product.asin);

    // 商品情報を更新
    const updatedProduct = await db.product.update({
      where: { id: productId },
      data: {
        title: updatedData.title,
        description: updatedData.description,
        imageUrl: updatedData.imageUrl,
        attributes: {
          ...(product.attributes as Record<string, any>),
          ...updatedData.attributes,
        },
      },
      include: {
        category: true,
      },
    });

    // Decimal型をstring型に変換
    const serializedProduct = {
      ...updatedProduct,
      price: updatedProduct.price ? updatedProduct.price.toString() : null,
    };

    revalidatePath("/admin/devices");
    revalidatePath(`/admin/devices/${productId}`);
    return serializedProduct;
  } catch (error) {
    console.error("Error refreshing product from Amazon:", error);
    throw error;
  }
}

/**
 * バッチ更新処理（全商品の情報更新）
 */
export async function batchUpdateProducts() {
  try {
    await checkAdminAuth();

    const products = await db.product.findMany();
    const results = {
      success: 0,
      failed: 0,
      errors: [] as Array<{ productId: string; error: string }>,
    };

    for (const product of products) {
      try {
        await refreshProductFromAmazon(product.id);
        results.success++;
      } catch (error) {
        results.failed++;
        results.errors.push({
          productId: product.id,
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }

    revalidatePath("/admin/devices");
    return results;
  } catch (error) {
    console.error("Error in batch update:", error);
    throw error;
  }
}

/**
 * カテゴリ一覧の取得
 */
export async function getDeviceCategories() {
  try {
    await checkAdminAuth();

    const categories = await db.deviceCategory.findMany({
      orderBy: { name: "asc" },
      include: {
        _count: {
          select: { products: true },
        },
      },
    });

    return categories;
  } catch (error) {
    console.error("Error fetching device categories:", error);
    throw error;
  }
}
