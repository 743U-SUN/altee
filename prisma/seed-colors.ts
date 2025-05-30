import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const colors = [
  { name: 'ブラック', nameEn: 'Black', hexCode: '#000000', sortOrder: 1 },
  { name: 'ホワイト', nameEn: 'White', hexCode: '#FFFFFF', sortOrder: 2 },
  { name: 'シルバー', nameEn: 'Silver', hexCode: '#C0C0C0', sortOrder: 3 },
  { name: 'グレー', nameEn: 'Gray', hexCode: '#808080', sortOrder: 4 },
  { name: 'レッド', nameEn: 'Red', hexCode: '#FF0000', sortOrder: 5 },
  { name: 'ブルー', nameEn: 'Blue', hexCode: '#0000FF', sortOrder: 6 },
  { name: 'グリーン', nameEn: 'Green', hexCode: '#00FF00', sortOrder: 7 },
  { name: 'イエロー', nameEn: 'Yellow', hexCode: '#FFFF00', sortOrder: 8 },
  { name: 'ピンク', nameEn: 'Pink', hexCode: '#FFC0CB', sortOrder: 9 },
  { name: 'パープル', nameEn: 'Purple', hexCode: '#800080', sortOrder: 10 },
  { name: 'オレンジ', nameEn: 'Orange', hexCode: '#FFA500', sortOrder: 11 },
  { name: 'ブラウン', nameEn: 'Brown', hexCode: '#A52A2A', sortOrder: 12 },
  { name: 'ゴールド', nameEn: 'Gold', hexCode: '#FFD700', sortOrder: 13 },
  { name: 'ローズゴールド', nameEn: 'Rose Gold', hexCode: '#B76E79', sortOrder: 14 },
  { name: 'スペースグレー', nameEn: 'Space Gray', hexCode: '#4A4A4A', sortOrder: 15 },
];

async function main() {
  console.log('🎨 カラーデータの投入を開始します...');

  for (const color of colors) {
    try {
      await prisma.color.upsert({
        where: { nameEn: color.nameEn },
        update: {
          name: color.name,
          hexCode: color.hexCode,
          sortOrder: color.sortOrder,
        },
        create: {
          name: color.name,
          nameEn: color.nameEn,
          hexCode: color.hexCode,
          sortOrder: color.sortOrder,
          isActive: true,
        },
      });
      console.log(`✅ カラー「${color.name}」を作成/更新しました`);
    } catch (error) {
      console.error(`❌ カラー「${color.name}」の作成/更新に失敗しました:`, error);
    }
  }

  console.log('✨ カラーデータの投入が完了しました！');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });