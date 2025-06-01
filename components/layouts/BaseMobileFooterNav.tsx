"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { MobileFooterConfig } from "./types"

export function BaseMobileFooterNav({ config }: { config: MobileFooterConfig }) {
  
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background md:hidden">
      <div className={`flex justify-around items-center h-16 ${config.backgroundColor}`}>
        {config.navItems.map((item) => (
          <Link
            key={item.title}
            href={item.url}
            className="flex flex-col items-center justify-center"
          >
            <item.icon className="h-5 w-5 mb-1" />
            <span className="text-xs">{item.title}</span>
          </Link>
        ))}
      </div>
    </div>
  )
}