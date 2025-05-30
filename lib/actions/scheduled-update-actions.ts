"use server";

import { db } from "@/lib/prisma";
import { fetchProductFromPAAPI } from "@/lib/services/amazon/pa-api";
import { fetchProductFromAmazonUrl } from "@/lib/services/amazon/og-metadata";
import type { CustomProductData } from "@/types/device";

/**
 * 更新が必要な商品を取得
 */
export async function getProductsNeedingUpdate(
  hoursThreshold = 24 * 7 // デフォルトは1週間
) {
  const thresholdDate = new Date();
  thresholdDate.setHours(thresholdDate.getHours() - hoursThreshold);

  // 公式商品で更新が必要なもの
  const officialProducts = await db.product.findMany({
    where: {
      updatedAt: {
        lt: thresholdDate,
      },
    },
    orderBy: {
      updatedAt: "asc", // 最も古いものから
    },
    take: 50, // 一度に処理する最大数
  });

  // カスタム商品で更新が必要なもの
  const customDevices = await db.userDevice.findMany({
    where: {
      deviceType: "CUSTOM",
      updatedAt: {
        lt: thresholdDate,
      },
    },
    orderBy: {
      updatedAt: "asc",
    },
    take: 50,
  });

  return {
    officialProducts,
    customDevices,
  };
}

/**
 * 公式商品の情報を更新
 */
export async function updateOfficialProductInfo(productId: string) {
  try {
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
        updatedAt: new Date(), // 明示的に更新日時を設定
      },
    });

    return {
      success: true,
      product: updatedProduct,
    };
  } catch (error) {
    console.error(`Error updating product ${productId}:`, error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * カスタム商品の情報を更新
 */
export async function updateCustomDeviceInfo(deviceId: string) {
  try {
    const device = await db.userDevice.findUnique({
      where: { id: parseInt(deviceId) },
    });

    if (!device || device.deviceType !== "CUSTOM") {
      throw new Error("Custom device not found");
    }

    const customData = device.customProductData as unknown as CustomProductData;
    if (!customData?.amazonUrl) {
      throw new Error("No Amazon URL found");
    }

    // OGメタデータから最新情報を取得
    const updatedInfo = await fetchProductFromAmazonUrl(customData.amazonUrl);

    // カスタムデータを更新
    const updatedCustomData: CustomProductData = {
      ...customData,
      title: updatedInfo.title,
      description: updatedInfo.description,
      imageUrl: updatedInfo.imageUrl,
      // ASINやカテゴリなどは変更しない
    };

    // デバイス情報を更新
    const updatedDevice = await db.userDevice.update({
      where: { id: parseInt(deviceId) },
      data: {
        customProductData: updatedCustomData as any,
        updatedAt: new Date(),
      },
    });

    return {
      success: true,
      device: updatedDevice,
    };
  } catch (error) {
    console.error(`Error updating device ${deviceId}:`, error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * 定期更新のメインプロセス
 */
export async function runScheduledUpdate() {
  try {
    console.log("Starting scheduled product update...");

    // 更新が必要な商品を取得
    const { officialProducts, customDevices } = await getProductsNeedingUpdate();

    const results = {
      official: {
        total: officialProducts.length,
        success: 0,
        failed: 0,
        errors: [] as Array<{ id: string; error: string }>,
      },
      custom: {
        total: customDevices.length,
        success: 0,
        failed: 0,
        errors: [] as Array<{ id: string; error: string }>,
      },
    };

    // 公式商品の更新
    for (const product of officialProducts) {
      const result = await updateOfficialProductInfo(product.id.toString());
      if (result.success) {
        results.official.success++;
      } else {
        results.official.failed++;
        results.official.errors.push({
          id: product.id.toString(),
          error: result.error || "Unknown error",
        });
      }

      // レート制限対策として少し待機
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    // カスタム商品の更新
    for (const device of customDevices) {
      const result = await updateCustomDeviceInfo(device.id.toString());
      if (result.success) {
        results.custom.success++;
      } else {
        results.custom.failed++;
        results.custom.errors.push({
          id: device.id.toString(),
          error: result.error || "Unknown error",
        });
      }

      // レート制限対策として少し待機
      await new Promise((resolve) => setTimeout(resolve, 500));
    }

    console.log("Scheduled update completed:", results);
    return results;
  } catch (error) {
    console.error("Error in scheduled update:", error);
    throw error;
  }
}

/**
 * 更新統計情報を取得
 */
export async function getUpdateStatistics() {
  const now = new Date();
  const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const [
    totalProducts,
    updatedLastDay,
    updatedLastWeek,
    notUpdatedMonth,
    totalCustomDevices,
    customUpdatedLastDay,
    customUpdatedLastWeek,
    customNotUpdatedMonth,
  ] = await Promise.all([
    // 公式商品の統計
    db.product.count(),
    db.product.count({
      where: { updatedAt: { gte: oneDayAgo } },
    }),
    db.product.count({
      where: { updatedAt: { gte: oneWeekAgo } },
    }),
    db.product.count({
      where: { updatedAt: { lt: oneMonthAgo } },
    }),
    // カスタム商品の統計
    db.userDevice.count({
      where: { deviceType: "CUSTOM" },
    }),
    db.userDevice.count({
      where: {
        deviceType: "CUSTOM",
        updatedAt: { gte: oneDayAgo },
      },
    }),
    db.userDevice.count({
      where: {
        deviceType: "CUSTOM",
        updatedAt: { gte: oneWeekAgo },
      },
    }),
    db.userDevice.count({
      where: {
        deviceType: "CUSTOM",
        updatedAt: { lt: oneMonthAgo },
      },
    }),
  ]);

  return {
    official: {
      total: totalProducts,
      updatedLastDay,
      updatedLastWeek,
      notUpdatedMonth,
    },
    custom: {
      total: totalCustomDevices,
      updatedLastDay: customUpdatedLastDay,
      updatedLastWeek: customUpdatedLastWeek,
      notUpdatedMonth: customNotUpdatedMonth,
    },
  };
}
