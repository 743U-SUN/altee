"use client"

import { usePathname } from "next/navigation"
import { SidebarLayout } from "@/components/layouts/SidebarLayout"
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

// 共通のClient Layoutをプロパティで拡張できるように
export default function SampleClientLayout({
  children,
  sidebarWidth = "360px",
  sidebar,
  mobileFooter,
}: {
  children: React.ReactNode;
  sidebarWidth?: string;
  sidebar?: React.ReactNode;
  mobileFooter?: React.ReactNode;
}) {
  const pathname = usePathname()
  
  // パスに基づいてページ名を取得
  const getPageName = () => {
    if (pathname.includes("/experiments")) {
      return "実験"
    } else if (pathname.includes("/goals")) {
      return "目標"
    } else if (pathname.includes("/stats")) {
      return "統計"
    } else if (pathname.includes("/settings")) {
      return "設定"
    } else {
      return "サンプル"
    }
  }
  
  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": sidebarWidth,
          "--bg-color": "var(--sidebar)",
        } as React.CSSProperties
      }
      className="bg-[var(--bg-color)] p-2"
    >
      <SidebarLayout variant="sample">
        {sidebar}
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
                <BreadcrumbLink href="/sample">サンプル</BreadcrumbLink>
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
      {mobileFooter}
    </SidebarProvider>
  )
}