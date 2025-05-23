'use client'

import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  ServiceManager,
  IconManager
} from './components'

export default function AdminLinksPage() {
  const [activeTab, setActiveTab] = useState('services')

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* ヘッダー */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">リンク管理</h1>
        <p className="text-gray-600">
          SNSサービスの設定とアイコンの管理を行います
        </p>
      </div>

      {/* タブナビゲーション */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="services">サービス管理</TabsTrigger>
          <TabsTrigger value="icons">アイコン管理</TabsTrigger>
        </TabsList>

        {/* サービス管理タブ */}
        <TabsContent value="services" className="space-y-6">
          <ServiceManager />
        </TabsContent>

        {/* アイコン管理タブ */}
        <TabsContent value="icons" className="space-y-6">
          <IconManager />
        </TabsContent>
      </Tabs>
    </div>
  )
}
