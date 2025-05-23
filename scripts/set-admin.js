// ユーザーを管理者に設定するスクリプト

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function setUserAsAdmin(email: string) {
  try {
    console.log(`ユーザー ${email} を管理者に設定中...`)
    
    // ユーザーを検索
    const user = await prisma.user.findUnique({
      where: { email }
    })
    
    if (!user) {
      console.error(`ユーザー ${email} が見つかりません`)
      return
    }
    
    console.log('現在のユーザー情報:')
    console.log('ID:', user.id)
    console.log('Email:', user.email)
    console.log('Name:', user.name)
    console.log('Current Role:', user.role)
    
    // 管理者権限を設定
    const updatedUser = await prisma.user.update({
      where: { email },
      data: { role: 'admin' }
    })
    
    console.log('\n✅ 更新完了！')
    console.log('新しいRole:', updatedUser.role)
    
  } catch (error) {
    console.error('エラーが発生しました:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// コマンドライン引数からEmailを取得
const email = process.argv[2]

if (!email) {
  console.error('使用方法: node set-admin.js <email>')
  console.error('例: node set-admin.js user@example.com')
  process.exit(1)
}

setUserAsAdmin(email)
