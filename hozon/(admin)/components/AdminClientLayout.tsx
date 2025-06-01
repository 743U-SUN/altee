"use client"

import { usePathname } from "next/navigation"
import { AdminSidebarLayout } from "./AdminSidebarLayout"
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

export default function AdminClientLayout({
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
    if (pathname.includes("/blog")) {
      return "ブログ"
    } else if (pathname.includes("/law")) {
      return "法律"
    } else if (pathname.includes("/cooking")) {
      return "料理"
    } else if (pathname.includes("/settings")) {
      return "設定"
    } else {
      return "Dashboard"
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
      <AdminSidebarLayout>
        {sidebar}
      </AdminSidebarLayout>
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
                <BreadcrumbLink href="/admin">Admin</BreadcrumbLink>
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