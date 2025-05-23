// 全ユーザー一覧を表示するスクリプト

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function listUsers() {
  try {
    console.log('📋 全ユーザー一覧\n')
    
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        isActive: true
      },
      orderBy: { createdAt: 'desc' }
    })
    
    if (users.length === 0) {
      console.log('ユーザーが見つかりません')
      return
    }
    
    console.log(`合計 ${users.length} 人のユーザー:\n`)
    
    users.forEach((user, index) => {
      console.log(`${index + 1}. ${user.email}`)
      console.log(`   ID: ${user.id}`)
      console.log(`   名前: ${user.name || '未設定'}`)
      console.log(`   役割: ${user.role} ${user.role === 'admin' ? '👑' : '👤'}`)
      console.log(`   状態: ${user.isActive ? '✅ アクティブ' : '❌ 無効'}`)
      console.log(`   作成日: ${user.createdAt.toLocaleDateString('ja-JP')}`)
      console.log('')
    })
    
    const adminCount = users.filter(u => u.role === 'admin').length
    console.log(`管理者: ${adminCount}人`)
    console.log(`一般ユーザー: ${users.length - adminCount}人`)
    
  } catch (error) {
    console.error('エラーが発生しました:', error)
  } finally {
    await prisma.$disconnect()
  }
}

listUsers()
