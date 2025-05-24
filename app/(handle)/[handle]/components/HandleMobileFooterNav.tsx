"use client"

import { BookOpen, Book, GraduationCap, Utensils, Settings, Home, MonitorPlay, Info } from "lucide-react"
import Link from "next/link"
import { usePathname, useParams } from "next/navigation"

export function HandleMobileFooterNav() {
  const pathname = usePathname()
  const params = useParams()
  
  // 現在のhandleパラメータを取得
  const handle = params.handle as string

  // フッターナビゲーション項目のベース定義
  const handleNavItemsBase = [
    {
      id: "video",
      title: "video",
      path: "videos",
      icon: MonitorPlay,
    },
    {
      id: "info",
      title: "info",
      path: "info",
      icon: Info,
    },
  ]
  
  // 動的URLを構築
  const handleNavItems = handleNavItemsBase.map(item => ({
    ...item,
    url: `/${handle}/${item.path}`
  }))

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background md:hidden">
      <div className="flex justify-around items-center h-16 bg-slate-50">
        {handleNavItems.map((item) => (
          <Link
            key={item.title}
            href={item.url}
          >
            <item.icon className="h-5 w-5 mb-1" />
            <span className="text-xs">{item.title}</span>
          </Link>
        ))}
      </div>
    </div>
  )
}