/**
 * デバイス関連のバリデーションスキーマ
 */

import { z } from 'zod';

// デバイス一覧取得フィルタ
export const getDevicesFilterSchema = z.object({
  category: z.string().default('all'),
  deviceType: z.enum(['all', 'OFFICIAL', 'CUSTOM']).default('all'),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

// 公式商品からデバイス作成
export const createDeviceFromProductSchema = z.object({
  productId: z.number().int().positive(),
  note: z.string().max(1000).optional(),
});

// Amazon URLからデバイス作成
export const createDeviceFromUrlSchema = z.object({
  amazonUrl: z.string().url().refine(
    (url) => {
      try {
        const parsedUrl = new URL(url);
        return ['amazon.co.jp', 'amazon.com', 'amazon.jp', 'amzn.to', 'amzn.asia']
          .some(domain => parsedUrl.hostname.includes(domain));
      } catch {
        return false;
      }
    },
    { message: '有効なAmazon URLを入力してください' }
  ),
  category: z.enum(['mouse', 'keyboard']).optional(),
  userAssociateId: z.string().max(20).optional(),
  note: z.string().max(1000).optional(),
});

// デバイス更新
export const updateDeviceSchema = z.object({
  note: z.string().max(1000).optional(),
});

// カテゴリ定義
export const deviceCategorySchema = z.enum(['mouse', 'keyboard']);
export type DeviceCategory = z.infer<typeof deviceCategorySchema>;

// デバイスタイプ定義
export const deviceTypeSchema = z.enum(['OFFICIAL', 'CUSTOM']);
export type DeviceType = z.infer<typeof deviceTypeSchema>;

// フォームスキーマ（クライアントサイド用）
export const addDeviceFromProductFormSchema = z.object({
  productId: z.string().transform(Number).pipe(z.number().int().positive()),
  note: z.string().max(1000).optional(),
});

export const addDeviceFromUrlFormSchema = z.object({
  amazonUrl: z.string().url('有効なURLを入力してください').refine(
    (url) => {
      try {
        const parsedUrl = new URL(url);
        return ['amazon.co.jp', 'amazon.com', 'amazon.jp', 'amzn.to', 'amzn.asia']
          .some(domain => parsedUrl.hostname.includes(domain));
      } catch {
        return false;
      }
    },
    { message: '有効なAmazon URLを入力してください' }
  ),
  category: deviceCategorySchema.optional(),
  note: z.string().max(1000, 'メモは1000文字以内で入力してください').optional(),
});

export const editDeviceFormSchema = z.object({
  note: z.string().max(1000, 'メモは1000文字以内で入力してください').optional(),
});
