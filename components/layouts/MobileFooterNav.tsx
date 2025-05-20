"use client"

import { Command, FileText, Settings, PieChart, User } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"

export function MobileFooterNav() {
  const pathname = usePathname()
  
  // ナビゲーション項目
  const navItems = [
    {
      title: "Home",
      url: "/template",
      icon: Command,
    },
    {
      title: "Dashboard",
      url: "/template/dashboard",
      icon: PieChart,
    },
    {
      title: "Documents",
      url: "/template/documents",
      icon: FileText,
    },
    {
      title: "Profile",
      url: "/template/profile",
      icon: User,
    },
    {
      title: "Settings",
      url: "/template/settings",
      icon: Settings,
    },
  ]
  
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background md:hidden">
      <div className="flex justify-around items-center h-16">
        {navItems.map((item) => (
          <Link
            key={item.title}
            href={item.url}
            className={`flex flex-col items-center justify-center h-full w-full ${
              pathname === item.url || (item.url !== "/template" && pathname.includes(item.url))
                ? "text-primary"
                : "text-muted-foreground"
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