"use client"

import { usePathname } from "next/navigation"
import { SidebarLayout } from "./SidebarLayout"
import { MobileFooterNav } from "./MobileFooterNav"
import { SecondSidebar } from "./SecondSidebar"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  
  // パスに基づいてページ名を取得
  const getPageName = () => {
    if (pathname.includes("/dashboard")) {
      return "Dashboard"
    } else if (pathname.includes("/documents")) {
      return "Documents"
    } else if (pathname.includes("/profile")) {
      return "Profile"
    } else if (pathname.includes("/settings")) {
      return "Settings"
    } else if (pathname.includes("/article")) {
      return "Article"
    } else if (pathname.includes("/sample")) {
      return "Sample"
    } else {
      return "Home"
    }
  }
  
  // パスに基づいてサイドバーの幅を決定
  const getSidebarWidth = () => {
    if (pathname.includes("/article")) {
      return "480px"
    }
    return "360px"
  }
  
  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": getSidebarWidth(),
          "--bg-color": "var(--sidebar)",
        } as React.CSSProperties
      }
      className="bg-[var(--bg-color)] p-2"
    >
      <SidebarLayout>
        <SecondSidebar />
      </SidebarLayout>
      <SidebarInset className="rounded-xl shadow-sm flex flex-col h-[calc(100vh-1rem)]">
        <header className="bg-background sticky top-0 flex shrink-0 items-center gap-2 border-b p-4 rounded-t-xl z-10">
          <SidebarTrigger className="-ml-1" />
          <Separator
            orientation="vertical"
            className="mr-2 data-[orientation=vertical]:h-4"
          />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem className="hidden md:block">
                <BreadcrumbLink href="/template">Template</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem>
                <BreadcrumbPage>{getPageName()}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </header>
        <div className="flex-1 overflow-auto">
          <div className="flex flex-col gap-4 bg-background rounded-b-xl py-4 px-4 h-full">
            {children}
          </div>
        </div>
      </SidebarInset>
      
      {/* モバイルフッターナビゲーション */}
      <MobileFooterNav />
    </SidebarProvider>
  )
}