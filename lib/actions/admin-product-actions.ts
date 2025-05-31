"use server";

import { auth } from "@/auth";
import { db } from "@/lib/prisma";
import { Prisma, Product } from "@/lib/generated/prisma";
import { revalidatePath } from "next/cache";
import { fetchProductFromPAAPI } from "@/lib/services/amazon/pa-api";
import { fetchProductFromAmazonUrl } from "@/lib/services/amazon/og-metadata";
import { extractASIN } from "@/lib/utils/amazon/url-parser";
import { cacheImageToMinio } from "@/lib/services/image-cache";
import { deleteFile } from "@/lib/minio";

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
      where.categoryId = parseInt(categoryId);
    }

    if (searchQuery) {
      where.OR = [
        { name: { contains: searchQuery, mode: "insensitive" } },
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
      where: { id: parseInt(productId) },
      include: {
        category: true,
        manufacturer: true,
        series: true,
        mouseAttributes: true,
        keyboardAttributes: true,
        productColors: {
          include: {
            color: true,
          },
          orderBy: {
            color: {
              sortOrder: 'asc',
            },
          },
        },
        userDevices: {
          include: {
            user: {
              select: {
                id: true,
                handle: true,
                name: true,
                iconUrl: true,
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
      
      // PA-APIデータの存在チェック
      if (!productData || typeof productData !== 'object') {
        throw new Error('PA-APIからのデータ取得に失敗しました');
      }
      
      // PA-API成功時はデータを変換して返す
      return {
        title: productData.title || 'Amazon商品',
        description: productData.description || '',
        imageUrl: productData.imageUrl || '/images/no-image.svg',
        asin: asin,
        amazonUrl: `https://www.amazon.co.jp/dp/${asin}`,
        source: 'PA-API',
      };
    } catch (paApiError) {
      console.log('PA-API failed, falling back to OG metadata:', (paApiError as Error).message);
      
      // PA-API失敗時はOGメタデータでフォールバック
      try {
        const ogData = await fetchProductFromAmazonUrl(amazonUrl);
        
        // OGデータの存在チェック
        if (!ogData || typeof ogData !== 'object') {
          throw new Error('OGメタデータの取得に失敗しました');
        }
        
        return {
          title: ogData.title || 'Amazon商品',
          description: ogData.description || '',
          imageUrl: ogData.imageUrl || '/images/no-image.svg',
          asin: ogData.asin || asin,
          amazonUrl: `https://www.amazon.co.jp/dp/${ogData.asin || asin}`,
          source: 'OG-metadata',
        };
      } catch (ogError) {
        console.error('Both PA-API and OG metadata failed:', ogError);
        throw new Error(`商品情報の取得に失敗しました: PA-APIエラー (${(paApiError as Error).message}), OGメタデータエラー (${(ogError as Error).message})`);
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
  manufacturerId?: number;
  seriesId?: number;
  defaultColorId?: number;
  mouseAttributes?: Record<string, any>;
  keyboardAttributes?: Record<string, any>;
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

    // 画像をMinIOにキャッシュ
    let cachedImageUrl = data.imageUrl;
    if (data.imageUrl && !data.imageUrl.startsWith('/') && !data.imageUrl.includes('localhost:9000')) {
      try {
        cachedImageUrl = await cacheImageToMinio(data.imageUrl);
        console.log('Product image cached:', cachedImageUrl);
      } catch (error) {
        console.error('Failed to cache product image:', error);
        // エラー時は元のURLをそのまま使用
      }
    }

    const product = await db.product.create({
      data: {
        categoryId: parseInt(data.categoryId),
        name: data.title,  // titleをnameにマッピング
        description: data.description,
        imageUrl: cachedImageUrl,
        amazonUrl: data.amazonUrl,
        adminAffiliateUrl: data.amazonUrl, // 管理者用URLも設定
        asin: data.asin,
        manufacturerId: data.manufacturerId,
        seriesId: data.seriesId,
        // 属性は別テーブルで作成
        mouseAttributes: data.mouseAttributes ? {
          create: data.mouseAttributes
        } : undefined,
        keyboardAttributes: data.keyboardAttributes ? {
          create: data.keyboardAttributes
        } : undefined,
      },
      include: {
        category: true,
        manufacturer: true,
        series: true,
        mouseAttributes: true,
        keyboardAttributes: true,
      },
    });

    // デフォルトカラーが指定されている場合、ProductColorを作成
    if (data.defaultColorId) {
      await db.productColor.create({
        data: {
          productId: product.id,
          colorId: data.defaultColorId,
          isDefault: true,
          imageUrl: cachedImageUrl, // 商品画像をカラー画像としても使用
        },
      });
    }

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
    categoryId?: number;
    name?: string;
    description?: string;
    imageUrl?: string;
    amazonUrl?: string;
    attributes?: Record<string, any>;
  }
) {
  try {
    await checkAdminAuth();

    const product = await db.product.update({
      where: { id: parseInt(productId) },
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
 * MinIOのURLからオブジェクト名を抽出
 */
function extractMinioObjectName(url: string): string | null {
  if (!url) return null;
  
  // MinIOのURLパターンを判定
  const isMinioUrl = url.includes('localhost:9000') || 
                     url.includes('minio:9000') || 
                     url.includes(process.env.NEXT_PUBLIC_MINIO_ENDPOINT || '');
  
  if (!isMinioUrl) {
    return null;
  }
  
  // URLパターン: http://endpoint/bucket-name/path/to/file.webp
  const bucketName = process.env.MINIO_BUCKET_NAME || 'altee-uploads';
  const match = url.match(new RegExp(`\/${bucketName}\/(.+)$`));
  return match ? match[1] : null;
}

/**
 * 商品の削除（管理者用）
 */
export async function deleteProduct(productId: string) {
  try {
    await checkAdminAuth();

    // 削除対象の商品情報を取得（画像URLを含む）
    const product = await db.product.findUnique({
      where: { id: parseInt(productId) },
      include: {
        productColors: true,
      },
    });

    if (!product) {
      throw new Error("Product not found");
    }

    // 関連するUserDeviceの数をカウント
    const relatedDevices = await db.userDevice.count({
      where: { productId: parseInt(productId) },
    });

    // 削除対象の画像URLを収集
    const imagesToDelete: string[] = [];
    
    // メイン画像
    if (product.imageUrl) {
      const objectName = extractMinioObjectName(product.imageUrl);
      if (objectName) {
        imagesToDelete.push(objectName);
      }
    }

    // カラー設定画像
    for (const productColor of product.productColors) {
      if (productColor.imageUrl) {
        const objectName = extractMinioObjectName(productColor.imageUrl);
        if (objectName) {
          imagesToDelete.push(objectName);
        }
      }
    }

    // トランザクションで商品と関連データを削除
    await db.$transaction(async (tx) => {
      // 関連するユーザーデバイスを削除
      if (relatedDevices > 0) {
        await tx.userDevice.deleteMany({
          where: { productId: parseInt(productId) },
        });
      }

      // 商品カラー設定を削除
      await tx.productColor.deleteMany({
        where: { productId: parseInt(productId) },
      });

      // 商品を削除
      await tx.product.delete({
        where: { id: parseInt(productId) },
      });
    });

    // MinIOから画像ファイルを削除
    const deletedImages: string[] = [];
    const failedDeletes: string[] = [];

    for (const objectName of imagesToDelete) {
      try {
        await deleteFile(objectName);
        deletedImages.push(objectName);
        console.log(`Deleted image from MinIO: ${objectName}`);
      } catch (error) {
        console.error(`Failed to delete image from MinIO: ${objectName}`, error);
        failedDeletes.push(objectName);
      }
    }

    revalidatePath("/admin/devices");
    
    let message = relatedDevices > 0 
      ? `商品を削除し、${relatedDevices}人のユーザーの使用リストからも削除しました` 
      : "商品を削除しました";
    
    if (deletedImages.length > 0) {
      message += `（画像ファイル${deletedImages.length}件も削除）`;
    }
    
    if (failedDeletes.length > 0) {
      message += `（画像ファイル${failedDeletes.length}件の削除に失敗）`;
    }

    return { 
      success: true, 
      message,
      deletedImages: deletedImages.length,
      failedDeletes: failedDeletes.length
    };
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
      where: { id: parseInt(productId) },
    });

    if (!product) {
      throw new Error("Product not found");
    }

    // PA-APIから最新情報を取得
    const updatedData = await fetchProductFromPAAPI(product.asin);

    // 商品情報を更新
    const updatedProduct = await db.product.update({
      where: { id: parseInt(productId) },
      data: {
        name: updatedData.title,
        description: updatedData.description,
        imageUrl: updatedData.imageUrl,
        attributes: product.attributes as any,
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
        await refreshProductFromAmazon(product.id.toString());
        results.success++;
      } catch (error) {
        results.failed++;
        results.errors.push({
          productId: product.id.toString(),
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

/**
 * カテゴリに関連する属性を取得
 */
export async function getAttributesByCategory(categorySlug: string) {
  try {
    const attributes = await db.productAttribute.findMany({
      where: {
        OR: [
          { category: categorySlug },
          { category: null }, // 全カテゴリ共通の属性
        ],
        isActive: true,
      },
      orderBy: [
        { type: 'asc' },
        { name: 'asc' },
      ],
    });

    return attributes;
  } catch (error) {
    console.error("Error fetching attributes by category:", error);
    return [];
  }
}

/**
 * 商品データをCSV形式でエクスポート
 */
export async function exportProductsAsCSV(categoryId?: string) {
  try {
    await checkAdminAuth();

    const where: Prisma.ProductWhereInput = categoryId
      ? { categoryId: parseInt(categoryId) }
      : {};

    const products = await db.product.findMany({
      where,
      include: {
        category: true,
        manufacturer: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    // CSVユーティリティをインポート
    const { exportProductsToCSV } = await import('@/lib/utils/csv/product-csv');
    
    const csv = await exportProductsToCSV(products);
    return { success: true, csv };
  } catch (error) {
    console.error("Error exporting products:", error);
    return { success: false, error: "CSVエクスポートに失敗しました" };
  }
}

/**
 * CSVファイルから商品データをインポート
 */
export async function importProductsFromCSV(csvContent: string) {
  try {
    await checkAdminAuth();

    // CSVユーティリティをインポート
    const { parseProductsFromCSV } = await import('@/lib/utils/csv/product-csv');
    
    const { valid, errors } = await parseProductsFromCSV(csvContent);

    if (errors.length > 0) {
      return { 
        success: false, 
        errors,
        message: `${errors.length}件のエラーが発生しました` 
      };
    }

    // カテゴリとメーカーのマッピングを事前に取得
    const categories = await db.deviceCategory.findMany();
    const manufacturers = await db.productAttribute.findMany({
      where: { type: 'MANUFACTURER' },
    });

    const categoryMap = new Map(categories.map(c => [c.slug, c.id]));
    const manufacturerMap = new Map(manufacturers.map(m => [m.name.toLowerCase(), m.id]));

    // 商品を一括作成
    const createdProducts = [];
    const importErrors: Array<{ row: number; error: string }> = [];

    for (let i = 0; i < valid.length; i++) {
      const productData = valid[i];
      
      try {
        // カテゴリIDを取得
        const categoryId = categoryMap.get(productData.category);
        if (!categoryId) {
          importErrors.push({ 
            row: i + 2, 
            error: `カテゴリ '${productData.category}' が見つかりません` 
          });
          continue;
        }

        // メーカーIDを取得（オプション）
        let manufacturerId = null;
        if (productData.manufacturer) {
          manufacturerId = manufacturerMap.get(productData.manufacturer.toLowerCase());
        }

        // 既存のASINチェック
        const existing = await db.product.findUnique({
          where: { asin: productData.asin },
        });

        if (existing) {
          importErrors.push({ 
            row: i + 2, 
            error: `ASIN '${productData.asin}' は既に登録されています` 
          });
          continue;
        }

        // 商品作成
        const product = await db.product.create({
          data: {
            name: productData.name,
            description: productData.description,
            categoryId,
            manufacturerId,
            amazonUrl: productData.amazonUrl,
            adminAffiliateUrl: productData.amazonUrl, // 後でアフィリエイトIDを付加
            asin: productData.asin,
            imageUrl: productData.imageUrl,
            price: productData.price,
            attributes: productData.attributes,
            isActive: productData.isActive,
          },
        });

        createdProducts.push(product);
      } catch (error) {
        importErrors.push({ 
          row: i + 2, 
          error: error instanceof Error ? error.message : '商品の作成に失敗しました' 
        });
      }
    }

    revalidatePath("/admin/devices");

    return {
      success: true,
      created: createdProducts.length,
      errors: importErrors,
      message: `${createdProducts.length}件の商品を作成しました${
        importErrors.length > 0 ? `（${importErrors.length}件のエラー）` : ''
      }`,
    };
  } catch (error) {
    console.error("Error importing products:", error);
    return { 
      success: false, 
      error: "CSVインポートに失敗しました",
      errors: []
    };
  }
}

/**
 * 画像をMinIOにキャッシュ（Server Action版）
 */
export async function cacheImageAction(imageUrl: string) {
  try {
    await checkAdminAuth();
    const cachedUrl = await cacheImageToMinio(imageUrl);
    return cachedUrl;
  } catch (error) {
    console.error("Error caching image:", error);
    throw error;
  }
}
