"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { NavUser } from "@/components/nav-user"
import { OptimizedImage } from "@/components/ui/optimized-image"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { SidebarConfig } from "./types"

// モバイルシート用のサイドバーコンテンツ
function MobileSheetContent({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col h-full pb-[72px] overflow-x-hidden">
      {children}
    </div>
  )
}

export function BaseSidebarLayout({ 
  children, 
  config 
}: { 
  children: React.ReactNode;
  config: SidebarConfig;
}) {
  const pathname = usePathname()
  const { isMobile, openMobile, setOpenMobile } = useSidebar()

  // モバイル向けのシート（ドロワー）
  const mobileSheet = (
    <Sheet open={openMobile} onOpenChange={setOpenMobile}>
      <SheetContent 
        side="left" 
        className="p-0 w-[85%] max-w-[350px] sm:max-w-sm overflow-x-hidden"
      >
        <SheetHeader className="px-4 py-3 border-b">
          <SheetTitle>{config.sheetTitle}</SheetTitle>
        </SheetHeader>
        <MobileSheetContent>
          {children}
        </MobileSheetContent>
      </SheetContent>
    </Sheet>
  )
  
  // モバイル表示の場合は空の div を返し、代わりに上記の Sheet を使用する
  if (isMobile) {
    return (
      <div data-testid="mobile-sidebar-placeholder">
        {mobileSheet}
      </div>
    );
  }
  
  // デスクトップ表示の場合は通常のサイドバーを表示
  return (
    <Sidebar
      collapsible="icon"
      className="overflow-hidden *:data-[sidebar=sidebar]:flex-row"
    >
      {/* ファーストサイドバー - 共通のアイコンとナビゲーション */}
      <Sidebar
        collapsible="none"
        className="w-[calc(var(--sidebar-width-icon)+1px)]! border-r"
      >
        <SidebarHeader>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton size="lg" asChild className="md:h-8 md:p-0">
                <Link href={config.headerLogo.href}>
                  {config.headerLogo.customElement ? (
                    <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center">
                      {config.headerLogo.customElement}
                    </div>
                  ) : config.headerLogo.title === "Altee" ? (
                    <>
                      <div className={`flex aspect-square size-8 items-center justify-center ${config.headerLogo.className || 'rounded-lg'}`}>
                        <OptimizedImage 
                          src="/altee-logo.svg"
                          alt="Altee"
                          width={32}
                          height={32}
                          priority
                        />
                      </div>
                      {config.headerLogo.title && (
                        <div className="grid flex-1 text-left text-sm leading-tight">
                          <span className="truncate font-medium">{config.headerLogo.title}</span>
                          {config.headerLogo.subtitle && (
                            <span className="truncate text-xs">{config.headerLogo.subtitle}</span>
                          )}
                        </div>
                      )}
                    </>
                  ) : (
                    <>
                      <div className={`bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center ${config.headerLogo.className || 'rounded-lg'}`}>
                        {config.headerLogo.icon && <config.headerLogo.icon className="size-4" />}
                      </div>
                      {config.headerLogo.title && (
                        <div className="grid flex-1 text-left text-sm leading-tight">
                          <span className="truncate font-medium">{config.headerLogo.title}</span>
                          {config.headerLogo.subtitle && (
                            <span className="truncate text-xs">{config.headerLogo.subtitle}</span>
                          )}
                        </div>
                      )}
                    </>
                  )}
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupContent className="px-1.5 md:px-0">
              <SidebarMenu>
                {config.navItems.map((item) => (
                  <SidebarMenuItem key={item.id || item.url}>
                    <SidebarMenuButton
                      tooltip={{
                        children: item.title,
                        hidden: false,
                      }}
                      asChild
                      isActive={pathname.includes(item.url)}
                      className="px-2.5 md:px-2"
                    >
                      <Link href={item.url}>
                        <item.icon />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter>
          <NavUser />
        </SidebarFooter>
      </Sidebar>

      {/* セカンドサイドバー - 各セクション用のサイドバー */}
      <Sidebar collapsible="none" className="hidden flex-1 md:flex overflow-x-hidden">
        {children}
      </Sidebar>
    </Sidebar>
  )
}