import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 デバイス管理システムの初期データを投入します...');

  // デバイスカテゴリーの作成
  const mouseCategory = await prisma.deviceCategory.upsert({
    where: { slug: 'mouse' },
    update: {},
    create: {
      name: 'マウス',
      slug: 'mouse',
      description: 'ゲーミングマウス・一般マウス'
    }
  });

  const keyboardCategory = await prisma.deviceCategory.upsert({
    where: { slug: 'keyboard' },
    update: {},
    create: {
      name: 'キーボード',
      slug: 'keyboard',
      description: 'ゲーミングキーボード・一般キーボード'
    }
  });

  console.log('✅ カテゴリーを作成しました:', { mouseCategory, keyboardCategory });

  // サンプル商品データの作成（開発環境用）
  if (process.env.NODE_ENV === 'development') {
    const sampleProducts = [
      {
        name: 'Logicool G Pro X Superlight',
        description: 'プロゲーマー向けの超軽量ワイヤレスゲーミングマウス',
        categoryId: mouseCategory.id,
        amazonUrl: 'https://www.amazon.co.jp/dp/B08NWQ8JRF',
        asin: 'B08NWQ8JRF',
        adminAffiliateUrl: `https://www.amazon.co.jp/dp/B08NWQ8JRF?tag=${process.env.ADMIN_AMAZON_ASSOCIATE_ID || 'default-22'}`,
        imageUrl: 'https://m.media-amazon.com/images/I/51ueVbfdGaL._AC_SL1000_.jpg',
        price: 16280,
        attributes: {
          dpi_max: 25600,
          dpi_min: 100,
          weight: 63,
          width: 63.5,
          depth: 125,
          height: 40,
          connection_type: 'wireless',
          sensor_type: 'HERO 25K',
          buttons: 5,
          programmable_buttons: 5,
          onboard_memory: true,
          wireless_charging: false,
          shape: 'symmetric',
          polling_rate: [125, 250, 500, 1000]
        }
      },
      {
        name: 'Razer DeathAdder V3',
        description: 'エルゴノミックデザインの高性能ゲーミングマウス',
        categoryId: mouseCategory.id,
        amazonUrl: 'https://www.amazon.co.jp/dp/B0B7CQWVX6',
        asin: 'B0B7CQWVX6',
        adminAffiliateUrl: `https://www.amazon.co.jp/dp/B0B7CQWVX6?tag=${process.env.ADMIN_AMAZON_ASSOCIATE_ID || 'default-22'}`,
        imageUrl: 'https://m.media-amazon.com/images/I/51QzW2BhyeL._AC_SL1000_.jpg',
        price: 23980,
        attributes: {
          dpi_max: 30000,
          dpi_min: 100,
          weight: 59,
          width: 68,
          depth: 128,
          height: 44,
          connection_type: 'wireless',
          sensor_type: 'Focus Pro 30K',
          buttons: 5,
          programmable_buttons: 5,
          onboard_memory: true,
          wireless_charging: false,
          shape: 'ergonomic',
          polling_rate: [125, 500, 1000, 2000, 4000, 8000]
        }
      },
      {
        name: 'Wooting 60HE',
        description: 'Rapid Trigger対応の革新的なゲーミングキーボード',
        categoryId: keyboardCategory.id,
        amazonUrl: 'https://www.amazon.co.jp/dp/B0BF65VZKZ',
        asin: 'B0BF65VZKZ',
        adminAffiliateUrl: `https://www.amazon.co.jp/dp/B0BF65VZKZ?tag=${process.env.ADMIN_AMAZON_ASSOCIATE_ID || 'default-22'}`,
        imageUrl: 'https://m.media-amazon.com/images/I/61GtRxMkV6L._AC_SL1000_.jpg',
        price: 29800,
        attributes: {
          layout: '60',
          key_arrangement: 'us',
          width: 302,
          depth: 102,
          height: 38,
          weight: 625,
          polling_rate: [125, 250, 500, 1000],
          switch_type: 'magnetic',
          key_stroke: 4.0,
          actuation_point: 0.1,
          rapid_trigger: true,
          rapid_trigger_min: 0.1,
          connection_type: 'wired'
        }
      },
      {
        name: 'Logicool G PRO X TKL',
        description: 'プロゲーマー向けテンキーレスゲーミングキーボード',
        categoryId: keyboardCategory.id,
        amazonUrl: 'https://www.amazon.co.jp/dp/B0BN5JHLWM',
        asin: 'B0BN5JHLWM',
        adminAffiliateUrl: `https://www.amazon.co.jp/dp/B0BN5JHLWM?tag=${process.env.ADMIN_AMAZON_ASSOCIATE_ID || 'default-22'}`,
        imageUrl: 'https://m.media-amazon.com/images/I/61Q9xz8JjSL._AC_SL1500_.jpg',
        price: 18480,
        attributes: {
          layout: 'tkl',
          key_arrangement: 'jp',
          width: 361,
          depth: 153,
          height: 34,
          weight: 980,
          polling_rate: [125, 250, 500, 1000],
          switch_type: 'mechanical',
          key_stroke: 3.7,
          actuation_point: 1.9,
          rapid_trigger: false,
          connection_type: 'wired'
        }
      }
    ];

    for (const productData of sampleProducts) {
      const product = await prisma.product.upsert({
        where: { asin: productData.asin },
        update: {},
        create: productData
      });
      console.log('✅ サンプル商品を作成しました:', product.name);
    }
  }

  console.log('🎉 初期データの投入が完了しました！');
}

main()
  .catch((e) => {
    console.error('❌ エラーが発生しました:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
