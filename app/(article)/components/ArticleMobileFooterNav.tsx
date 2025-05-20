"use client"

import { BookOpen, Book, GraduationCap, Utensils, Settings } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"

export function ArticleMobileFooterNav() {
  const pathname = usePathname()
  
  // 記事用ナビゲーション項目
  const articleNavItems = [
    {
      title: "記事ホーム",
      url: "/article",
      icon: BookOpen,
    },
    {
      title: "ブログ",
      url: "/article/blog",
      icon: Book,
    },
    {
      title: "法律",
      url: "/article/law",
      icon: GraduationCap,
    },
    {
      title: "料理",
      url: "/article/cooking",
      icon: Utensils,
    },
    {
      title: "設定",
      url: "/article/settings",
      icon: Settings,
    },
  ]
  
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background md:hidden">
      <div className="flex justify-around items-center h-16 bg-amber-50">
        {articleNavItems.map((item) => (
          <Link
            key={item.title}
            href={item.url}
            className={`flex flex-col items-center justify-center h-full w-full ${
              pathname === item.url || (item.url !== "/article" && pathname.includes(item.url))
                ? "text-amber-700"
                : "text-amber-500"
            }`}
          >
            <item.icon className="h-5 w-5 mb-1" />
            <span className="text-xs">{item.title}</span>
          </Link>
        ))}
      </div>
    </div>
  )
}