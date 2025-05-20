"use client"

import { LayoutTemplate, FlaskRound, Target, BarChart4, Settings } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"

export function SampleMobileFooterNav() {
  const pathname = usePathname()
  
  // サンプル用ナビゲーション項目
  const sampleNavItems = [
    {
      title: "サンプルホーム",
      url: "/sample",
      icon: LayoutTemplate,
    },
    {
      title: "実験",
      url: "/sample/experiments",
      icon: FlaskRound,
    },
    {
      title: "目標",
      url: "/sample/goals",
      icon: Target,
    },
    {
      title: "統計",
      url: "/sample/stats",
      icon: BarChart4,
    },
    {
      title: "設定",
      url: "/sample/settings",
      icon: Settings,
    },
  ]
  
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background md:hidden">
      <div className="flex justify-around items-center h-16 bg-cyan-50">
        {sampleNavItems.map((item) => (
          <Link
            key={item.title}
            href={item.url}
            className={`flex flex-col items-center justify-center h-full w-full ${
              pathname === item.url || (item.url !== "/sample" && pathname.includes(item.url))
                ? "text-cyan-700"
                : "text-cyan-500"
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