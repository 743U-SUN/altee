"use client"

import { BookOpen, Book, GraduationCap, Utensils, Settings } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"

export function AdminMobileFooterNav() {
  const pathname = usePathname()
  
  // 記事用ナビゲーション項目
  const adminNavItems = [
    {
      title: "記事ホーム",
      url: "/admin",
      icon: BookOpen,
    },
    {
      title: "ブログ",
      url: "/blog",
      icon: Book,
    },
    {
      title: "法律",
      url: "/law",
      icon: GraduationCap,
    },
    {
      title: "料理",
      url: "/cooking",
      icon: Utensils,
    },
    {
      title: "設定",
      url: "/settings",
      icon: Settings,
    },
  ]
  
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background md:hidden">
      <div className="flex justify-around items-center h-16 bg-amber-50">
        {adminNavItems.map((item) => (
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