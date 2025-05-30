/**
 * 既存のデータを新しいデータベース構造に移行するスクリプト
 * 
 * 実行手順:
 * 1. prisma migrate dev でマイグレーションを作成
 * 2. このスクリプトを実行して既存データを移行
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function migrateData() {
  console.log('データ移行を開始します...');

  try {
    // トランザクションで実行
    await prisma.$transaction(async (tx) => {
      // 1. ProductAttributeからManufacturerテーブルへ移行
      console.log('メーカー情報を移行中...');
      const manufacturers = await tx.productAttribute.findMany({
        where: { type: 'MANUFACTURER' },
      });

      for (const mfr of manufacturers) {
        await tx.manufacturer.create({
          data: {
            name: mfr.name,
            slug: mfr.slug,
            description: mfr.description,
            logoUrl: mfr.logoUrl,
            website: mfr.website,
            isActive: mfr.isActive,
            createdAt: mfr.createdAt,
            updatedAt: mfr.updatedAt,
          },
        });
      }
      console.log(`${manufacturers.length}件のメーカー情報を移行しました`);

      // 2. ProductAttributeからSeriesテーブルへ移行
      console.log('シリーズ情報を移行中...');
      const series = await tx.productAttribute.findMany({
        where: { type: 'SERIES' },
      });

      // シリーズ名からメーカーを推測する簡易マッピング
      const manufacturerMap = new Map<string, number>();
      const allManufacturers = await tx.manufacturer.findMany();
      allManufacturers.forEach(m => {
        manufacturerMap.set(m.name.toLowerCase(), m.id);
      });

      for (const s of series) {
        // シリーズ名からメーカーを推測（例: "G Pro シリーズ" -> Logicool）
        let manufacturerId = 1; // デフォルト値
        
        // より精密なマッピングが必要な場合は手動で調整
        if (s.name.includes('G Pro') || s.name.includes('G')) {
          const logicool = allManufacturers.find(m => m.name === 'Logicool');
          if (logicool) manufacturerId = logicool.id;
        } else if (s.name.includes('DeathAdder') || s.name.includes('Viper')) {
          const razer = allManufacturers.find(m => m.name === 'Razer');
          if (razer) manufacturerId = razer.id;
        }

        await tx.series.create({
          data: {
            name: s.name,
            slug: s.slug,
            description: s.description,
            manufacturerId: manufacturerId,
            isActive: s.isActive,
            createdAt: s.createdAt,
            updatedAt: s.updatedAt,
          },
        });
      }
      console.log(`${series.length}件のシリーズ情報を移行しました`);

      // 3. 既存のProduct.attributesをカテゴリ別テーブルへ移行
      console.log('商品属性を移行中...');
      const products = await tx.product.findMany({
        include: { category: true },
      });

      let mouseCount = 0;
      let keyboardCount = 0;

      for (const product of products) {
        if (!product.attributes || typeof product.attributes !== 'object') {
          continue;
        }

        const attrs = product.attributes as any;

        if (product.category.slug === 'mouse') {
          // マウス属性の移行
          await tx.mouseAttributes.create({
            data: {
              productId: product.id,
              dpiMin: attrs.dpi_min ? parseInt(attrs.dpi_min) : null,
              dpiMax: attrs.dpi_max ? parseInt(attrs.dpi_max) : null,
              weight: attrs.weight ? parseInt(attrs.weight) : null,
              length: attrs.length ? parseFloat(attrs.length) : null,
              width: attrs.width ? parseFloat(attrs.width) : null,
              height: attrs.height ? parseFloat(attrs.height) : null,
              buttons: attrs.buttons ? parseInt(attrs.buttons) : null,
              connectionType: attrs.connection_type ? 
                (attrs.connection_type.toUpperCase() as any) : null,
              pollingRate: attrs.polling_rate ? parseInt(attrs.polling_rate) : null,
              batteryLife: attrs.battery_life ? parseInt(attrs.battery_life) : null,
              sensor: attrs.sensor || null,
              rgb: attrs.rgb === true || attrs.rgb === 'true',
              software: attrs.software || null,
            },
          });
          mouseCount++;
        } else if (product.category.slug === 'keyboard') {
          // キーボード属性の移行
          let layout = null;
          if (attrs.layout) {
            switch (attrs.layout) {
              case 'full': layout = 'FULL'; break;
              case 'tkl': layout = 'TKL'; break;
              case '60': layout = 'SIXTY'; break;
              case '65': layout = 'SIXTYFIVE'; break;
              case '75': layout = 'SEVENTYFIVE'; break;
            }
          }

          let switchType = null;
          if (attrs.switch_type) {
            switch (attrs.switch_type) {
              case 'mechanical': switchType = 'MECHANICAL'; break;
              case 'optical': switchType = 'OPTICAL'; break;
              case 'magnetic': switchType = 'MAGNETIC'; break;
              case 'membrane': switchType = 'MEMBRANE'; break;
            }
          }

          await tx.keyboardAttributes.create({
            data: {
              productId: product.id,
              layout: layout as any,
              switchType: switchType as any,
              actuationPoint: attrs.actuation_point ? 
                parseFloat(attrs.actuation_point) : null,
              connectionType: attrs.connection_type ? 
                (attrs.connection_type.toUpperCase() as any) : null,
              rapidTrigger: attrs.rapid_trigger === true || 
                            attrs.rapid_trigger === 'true',
              rgb: attrs.rgb === true || attrs.rgb === 'true',
              software: attrs.software || null,
              keycaps: attrs.keycaps || null,
              hotSwap: attrs.hot_swap === true || attrs.hot_swap === 'true',
            },
          });
          keyboardCount++;
        }
      }

      console.log(`${mouseCount}件のマウス属性を移行しました`);
      console.log(`${keyboardCount}件のキーボード属性を移行しました`);

      // 4. Product.manufacturerIdを新しいManufacturerテーブルのIDに更新
      console.log('商品のメーカー参照を更新中...');
      const productsWithMfr = await tx.product.findMany({
        where: { manufacturerId: { not: null } },
        include: { manufacturer: true },
      });

      for (const product of productsWithMfr) {
        if (product.manufacturer) {
          const newMfr = await tx.manufacturer.findUnique({
            where: { name: product.manufacturer.name },
          });
          
          if (newMfr) {
            await tx.product.update({
              where: { id: product.id },
              data: { manufacturerId: newMfr.id },
            });
          }
        }
      }
      console.log(`${productsWithMfr.length}件の商品のメーカー参照を更新しました`);
    });

    console.log('データ移行が完了しました！');
  } catch (error) {
    console.error('データ移行中にエラーが発生しました:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// スクリプトを実行
migrateData().catch(console.error);