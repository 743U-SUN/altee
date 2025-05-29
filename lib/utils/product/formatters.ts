import type { Product, DeviceCategory } from '@/lib/generated/prisma';
import type { DisplayDevice } from '@/types/device';

/**
 * 商品を表示用にフォーマット
 */
export function formatPublicProductForDisplay(product: Product & {
  category: DeviceCategory;
  _count?: { userDevices: number };
}): DisplayDevice {
  return {
    id: `product-${product.id}`,
    title: product.name,
    description: product.description || undefined,
    imageUrl: product.imageUrl,
    affiliateUrl: product.adminAffiliateUrl || product.amazonUrl,
    category: product.category.slug,
    attributes: (product.attributes as Record<string, any>) || {},
    sourceType: 'official' as const,
    userCount: product._count?.userDevices || 0,
    productId: product.id,
  };
}
