import type { CustomProductData, DisplayDevice } from '@/types/device';

/**
 * ユーザーデバイスを表示用にフォーマット
 */
export function formatDevicesForDisplay(devices: any[]): DisplayDevice[] {
  return devices.map(device => {
    if (device.deviceType === 'OFFICIAL' && device.product) {
      // 公式商品の場合
      let imageUrl = device.product.imageUrl;
      let colorImageUrl: string | undefined;

      // カラー選択がある場合、そのカラーの画像を使用
      if (device.color && device.product.productColors) {
        const colorVariant = device.product.productColors.find(
          (pc: any) => pc.colorId === device.color.id
        );
        
        if (colorVariant?.imageUrl) {
          colorImageUrl = colorVariant.imageUrl;
          imageUrl = colorVariant.imageUrl; // メイン画像もカラー画像に置き換え
        }
      }

      return {
        id: `official-${device.id}`,
        title: device.product.name,
        description: device.product.description,
        imageUrl,
        affiliateUrl: device.product.adminAffiliateUrl || device.product.amazonUrl,
        category: device.product.category.slug,
        attributes: device.product.attributes || {},
        sourceType: 'official' as const,
        note: device.note,
        userCount: device.product._count?.userDevices || 0,
        color: device.color,
        colorImageUrl,
      };
    } else if (device.deviceType === 'CUSTOM' && device.customProductData) {
      // カスタム商品の場合
      const customData = device.customProductData as CustomProductData;
      return {
        id: `custom-${device.id}`,
        title: customData.title,
        description: customData.description,
        imageUrl: customData.imageUrl,
        affiliateUrl: customData.userAffiliateUrl || customData.amazonUrl,
        category: customData.category,
        attributes: customData.attributes || {},
        sourceType: 'custom' as const,
        note: device.note,
      };
    } else {
      // フォールバック（エラーケース）
      return {
        id: `unknown-${device.id}`,
        title: 'Unknown Device',
        description: 'データが正しく読み込まれませんでした',
        imageUrl: '/images/no-image.png',
        affiliateUrl: '#',
        category: 'unknown',
        attributes: {},
        sourceType: 'custom' as const,
        note: device.note,
      };
    }
  });
}
