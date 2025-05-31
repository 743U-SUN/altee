"use client"

import * as React from "react"
import { BookOpen, Book, GraduationCap, Utensils, Settings, MonitorPlay, Info, User } from "lucide-react"
import Link from "next/link"
import { usePathname, useParams } from "next/navigation"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { convertToProxyUrl } from "@/lib/utils/image-proxy"
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

// ナビゲーションアイテムのベース定義
const handleNavItemsBase = [
  {
    id: "video",
    title: "video",
    path: "video",
    icon: MonitorPlay,
  },
  {
    id: "info",
    title: "info",
    path: "info",
    icon: Info,
  },
];

// User型定義
type User = {
  id: string;
  name?: string | null;
  characterName?: string | null;
  iconUrl?: string | null;
  handle?: string | null;
};

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

export function HandleSidebarLayout({ children, user }: { children: React.ReactNode; user?: User }) {
  const pathname = usePathname()
  const params = useParams()
  const { isMobile, openMobile, setOpenMobile } = useSidebar()
  
  // 現在のhandleパラメータを取得
  const handle = params.handle as string
  
  // 動的URLを構築
  const handleNavItems = handleNavItemsBase.map(item => ({
    ...item,
    url: `/${handle}/${item.path}`
  }))

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
      {/* ファーストサイドバー - 　アイコンとナビゲーション */}
      <Sidebar
        collapsible="none"
        className="w-[calc(var(--sidebar-width-icon)+1px)]! border-r"
      >
        <SidebarHeader>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton size="lg" asChild className="md:h-8 md:p-0">
                <Link href={`/${handle}`}>
                  <Avatar className="h-8 w-8 rounded-lg">
                    <AvatarImage 
                      src={user?.iconUrl ? convertToProxyUrl(user.iconUrl) : undefined} 
                      alt={user?.characterName || user?.name || 'User'}
                      className="object-cover"
                    />
                    <AvatarFallback className="rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                      {user?.characterName ? user.characterName.charAt(0).toUpperCase() : 
                       user?.name ? user.name.charAt(0).toUpperCase() : 
                       <User className="size-4" />}
                    </AvatarFallback>
                  </Avatar>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupContent className="px-1.5 md:px-0">
              <SidebarMenu>
                {handleNavItems.map((item) => (
                  <SidebarMenuItem key={item.id}>
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