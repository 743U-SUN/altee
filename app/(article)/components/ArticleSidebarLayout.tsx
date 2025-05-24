"use client"

import * as React from "react"
import { BookOpen, Book, GraduationCap, Utensils, Settings } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { NavUser } from "@/components/nav-user"
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

// 記事用ナビゲーションアイテム
const articleNavItems = [
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
    title: "記事設定",
    url: "/article/settings",
    icon: Settings,
  },
];

const userData = {
  name: "username",
  email: "user@example.com",
  avatar: "/avatars/user.jpg",
};

// モバイルシート用のサイドバーコンテンツ
function MobileSheetContent({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col h-full pb-[72px] overflow-x-hidden">
      {children}
    </div>
  )
}

export function ArticleSidebarLayout({ children }: { children: React.ReactNode }) {
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
          <SheetTitle>記事セクション</SheetTitle>
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
      {/* ファーストサイドバー - 記事専用のアイコンとナビゲーション */}
      <Sidebar
        collapsible="none"
        className="w-[calc(var(--sidebar-width-icon)+1px)]! border-r"
      >
        <SidebarHeader>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton size="lg" asChild className="md:h-8 md:p-0">
                <Link href="/article">
                  <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                    <BookOpen className="size-4" />
                  </div>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-medium">記事セクション</span>
                    <span className="truncate text-xs">コンテンツ</span>
                  </div>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupContent className="px-1.5 md:px-0">
              <SidebarMenu>
                {articleNavItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
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

      {/* セカンドサイドバー - 記事用のサイドバー */}
      <Sidebar collapsible="none" className="hidden flex-1 md:flex overflow-x-hidden">
        {children}
      </Sidebar>
    </Sidebar>
  )
}