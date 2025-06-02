"use client"

import Link from "next/link"
import { OptimizedImage } from "@/components/ui/optimized-image"
import { HeaderNavUser } from "@/components/header-nav-user"
import { Separator } from "@/components/ui/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { LayoutConfig } from "./types"

export default function BaseClientLayout({
  children,
  config,
  sidebar,
  mobileFooter,
  SidebarLayoutComponent,
}: {
  children: React.ReactNode;
  config: LayoutConfig;
  sidebar?: React.ReactNode;
  mobileFooter?: React.ReactNode;
  SidebarLayoutComponent: React.ComponentType<{children: React.ReactNode}>;
}) {
  
  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": config.sidebarWidth,
          "--bg-color": config.backgroundColor || "var(--sidebar)",
        } as React.CSSProperties
      }
      className="bg-[var(--bg-color)] p-2"
    >
      <SidebarLayoutComponent>
        {sidebar}
      </SidebarLayoutComponent>
      <SidebarInset className="rounded-xl shadow-sm flex flex-col h-[calc(100vh-1rem)]">
        <header className="bg-background sticky top-0 flex shrink-0 items-center justify-between gap-2 border-b p-4 rounded-t-xl z-10">
          <div className="flex items-center gap-2">
            <SidebarTrigger className="-ml-1" />
            <Separator
              orientation="vertical"
              className="mr-2 data-[orientation=vertical]:h-4"
            />
            <Link href="/">
              <OptimizedImage 
                src="/altee-logo-bar.svg"
                alt="Altee"
                width={120}
                height={32}
                priority
                forceUnoptimized
              />
            </Link>
          </div>
          <HeaderNavUser />
        </header>
        <div className="flex-1 overflow-auto">
          <div className="flex flex-col gap-4 bg-background rounded-b-xl py-4 px-4 h-full">
            {children}
          </div>
        </div>
      </SidebarInset>
      
      {/* モバイルフッターナビゲーション */}
      {mobileFooter}
    </SidebarProvider>
  )
}