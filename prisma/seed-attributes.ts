import { PrismaClient, AttributeType } from '../lib/generated/prisma';

const prisma = new PrismaClient();

async function seedAttributes() {
  console.log('🌱 Seeding ProductAttributes...');

  // 主要なメーカーデータ
  const manufacturers = [
    {
      name: 'Logicool',
      slug: 'logicool',
      type: AttributeType.MANUFACTURER,
      description: 'ゲーミング・オフィス用デバイスの大手メーカー',
      website: 'https://www.logicool.co.jp/',
    },
    {
      name: 'Razer',
      slug: 'razer',
      type: AttributeType.MANUFACTURER,
      description: 'ゲーミングデバイス専門メーカー',
      website: 'https://www.razer.com/',
    },
    {
      name: 'Apple',
      slug: 'apple',
      type: AttributeType.MANUFACTURER,
      description: 'Mac・iPhone用デバイス',
      website: 'https://www.apple.com/',
    },
    {
      name: 'Microsoft',
      slug: 'microsoft',
      type: AttributeType.MANUFACTURER,
      description: 'Surface・Xbox用デバイス',
      website: 'https://www.microsoft.com/',
    },
    {
      name: 'SteelSeries',
      slug: 'steelseries',
      type: AttributeType.MANUFACTURER,
      description: 'プロゲーマー向けデバイス',
      website: 'https://steelseries.com/',
    },
    {
      name: 'Corsair',
      slug: 'corsair',
      type: AttributeType.MANUFACTURER,
      description: 'ゲーミング・エンスージアスト向けデバイス',
      website: 'https://www.corsair.com/',
    },
    {
      name: 'HyperX',
      slug: 'hyperx',
      type: AttributeType.MANUFACTURER,
      description: 'ゲーミングデバイス専門ブランド',
      website: 'https://www.hyperxgaming.com/',
    },
    {
      name: 'ASUS',
      slug: 'asus',
      type: AttributeType.MANUFACTURER,
      description: 'ROGブランドのゲーミングデバイス',
      website: 'https://www.asus.com/',
    },
    {
      name: 'BenQ',
      slug: 'benq',
      type: AttributeType.MANUFACTURER,
      description: 'ゲーミングモニター・デバイス',
      website: 'https://www.benq.com/',
    },
    {
      name: 'Finalmouse',
      slug: 'finalmouse',
      type: AttributeType.MANUFACTURER,
      description: '軽量ゲーミングマウス専門',
      website: 'https://finalmouse.com/',
    },
  ];

  // メーカーを作成
  for (const manufacturer of manufacturers) {
    await prisma.productAttribute.upsert({
      where: { slug: manufacturer.slug },
      update: manufacturer,
      create: manufacturer,
    });
    console.log(`✅ Created/Updated manufacturer: ${manufacturer.name}`);
  }

  console.log('🎉 ProductAttributes seeding completed!');
}

async function main() {
  try {
    await seedAttributes();
  } catch (error) {
    console.error('❌ Error seeding data:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();