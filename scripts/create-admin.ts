#!/usr/bin/env tsx
/**
 * 管理者ユーザー作成スクリプト
 * 
 * 使用方法:
 * npm install -g tsx  # グローバルにtsxをインストール（初回のみ）
 * npx tsx scripts/create-admin.ts <email>
 * 
 * 例:
 * npx tsx scripts/create-admin.ts your-email@example.com
 * 
 * 全ユーザー表示:
 * npx tsx scripts/create-admin.ts --list
 */

import { PrismaClient } from '@/lib/generated/prisma';

const prisma = new PrismaClient();

async function createAdmin() {
  const email = process.argv[2];
  
  if (!email) {
    console.error('❌ メールアドレスを指定してください。');
    console.log('使用方法: npx tsx scripts/create-admin.ts <email>');
    console.log('全ユーザー表示: npx tsx scripts/create-admin.ts --list');
    process.exit(1);
  }

  console.log(`🔍 メールアドレス \"${email}\" のユーザーを検索中...`);

  try {
    // ユーザーを検索
    const user = await prisma.user.findUnique({
      where: { email: email },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true
      }
    });

    if (!user) {
      console.error(`❌ メールアドレス \"${email}\" のユーザーが見つかりませんでした。`);
      console.log('💡 まず一度ログインしてユーザーを作成してください。');
      process.exit(1);
    }

    console.log('👤 ユーザー情報:');
    console.log(`   ID: ${user.id}`);
    console.log(`   Name: ${user.name}`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Current Role: ${user.role}`);
    console.log(`   Created: ${user.createdAt.toISOString()}`);

    if (user.role === 'admin') {
      console.log('✅ このユーザーは既に管理者です。');
      return;
    }

    // 管理者に昇格
    const updatedUser = await prisma.user.update({
      where: { email: email },
      data: { role: 'admin' },
      select: {
        id: true,
        email: true,
        name: true,
        role: true
      }
    });

    console.log('🎉 ユーザーを管理者に昇格させました！');
    console.log('👑 Updated User Info:');
    console.log(`   ID: ${updatedUser.id}`);
    console.log(`   Name: ${updatedUser.name}`);
    console.log(`   Email: ${updatedUser.email}`);
    console.log(`   Role: ${updatedUser.role}`);

    console.log('\\n📝 次の手順:');
    console.log('1. ブラウザで一度ログアウトしてください');
    console.log('2. 再度ログインしてください');
    console.log('3. http://localhost:3000/admin/devices にアクセスしてください');

  } catch (error) {
    console.error('❌ エラーが発生しました:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// 全ユーザーを表示する関数
async function listAllUsers() {
  console.log('📋 データベース内の全ユーザー:');
  
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true
      },
      orderBy: { createdAt: 'desc' }
    });

    if (users.length === 0) {
      console.log('📭 ユーザーが見つかりませんでした。まず一度ログインしてください。');
      return;
    }

    console.log(`\\n👥 ${users.length} 人のユーザーが見つかりました:\\n`);
    
    users.forEach((user, index) => {
      const isAdmin = user.role === 'admin' ? '👑' : '👤';
      console.log(`${index + 1}. ${isAdmin} ${user.name || 'No Name'}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Role: ${user.role}`);
      console.log(`   ID: ${user.id}`);
      console.log(`   Created: ${user.createdAt.toISOString()}`);
      console.log('');
    });

    console.log('💡 管理者にしたいユーザーのメールアドレスをコピーして、次のコマンドを実行してください:');
    console.log('   npx tsx scripts/create-admin.ts <email>');

  } catch (error) {
    console.error('❌ エラーが発生しました:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// メイン処理
async function main() {
  const command = process.argv[2];

  if (command === '--list' || command === '-l') {
    await listAllUsers();
  } else {
    await createAdmin();
  }
}

main().catch((error) => {
  console.error('❌ スクリプト実行エラー:', error);
  process.exit(1);
});
