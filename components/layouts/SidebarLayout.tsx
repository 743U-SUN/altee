"use client"

import * as React from "react"
import { Command, FileText, Settings, PieChart, User, BookOpen, LayoutTemplate, Book, GraduationCap, Utensils, FlaskRound, Target, BarChart4 } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
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

// テンプレート用ナビゲーションアイテム
const templateNavItems = [
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
];

// 記事用ナビゲーションアイテム
const articleNavItems = [
  {
    title: "ブログ",
    url: "/article/blog",
    icon: Book,
  },
  {
    title: "法律",
    url: "/article/law",
    icon: GraduationCap,
  },
  {
    title: "料理",
    url: "/article/cooking",
    icon: Utensils,
  },
  {
    title: "記事設定",
    url: "/article/settings",
    icon: Settings,
  },
];

// サンプル用ナビゲーションアイテム
const sampleNavItems = [
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
    title: "サンプル設定",
    url: "/sample/settings",
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

export function SidebarLayout({ children, variant = 'default' }: { children: React.ReactNode, variant?: 'default' | 'article' | 'sample' }) {
  const pathname = usePathname()
  const { isMobile, openMobile, setOpenMobile } = useSidebar()

  // バリアントに基づいてロゴアイコンを取得する関数
  const getLogoIcon = () => {
    switch (variant) {
      case 'article':
        return <BookOpen className="size-4" />
      case 'sample':
        return <LayoutTemplate className="size-4" />
      default:
        return <Command className="size-4" />
    }
  }

  // バリアントに基づいてロゴテキストを取得する関数
  const getLogoText = () => {
    switch (variant) {
      case 'article':
        return "Article"
      case 'sample':
        return "Sample"
      default:
        return "Template"
    }
  }

  // バリアントに基づいてナビゲーションアイテムを取得する関数
  const getNavItems = () => {
    switch (variant) {
      case 'article':
        return articleNavItems
      case 'sample':
        return sampleNavItems
      default:
        return templateNavItems
    }
  }

  // 現在のナビゲーションアイテム
  const currentNavItems = getNavItems()

  // モバイル向けのシート（ドロワー）
  const mobileSheet = (
    <Sheet open={openMobile} onOpenChange={setOpenMobile}>
      <SheetContent 
        side="left" 
        className="p-0 w-[85%] max-w-[350px] sm:max-w-sm overflow-x-hidden"
      >
        <SheetHeader className="px-4 py-3 border-b">
          <SheetTitle>{getLogoText()}</SheetTitle>
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
      {/* ファーストサイドバー - アイコンのみ表示 */}
      <Sidebar
        collapsible="none"
        className="w-[calc(var(--sidebar-width-icon)+1px)]! border-r"
      >
        <SidebarHeader>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton size="lg" asChild className="md:h-8 md:p-0">
                <Link href="/">
                  <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                    {getLogoIcon()}
                  </div>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-medium">{getLogoText()}</span>
                    <span className="truncate text-xs">
                      {variant === 'article' ? "コンテンツ" : 
                       variant === 'sample' ? "サンプル" : "Dashboard"}
                    </span>
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
                {currentNavItems.map((item) => (
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
          <NavUser user={userData} />
        </SidebarFooter>
      </Sidebar>

      {/* セカンドサイドバー - ページによって内容が変わる */}
      <Sidebar collapsible="none" className="hidden flex-1 md:flex overflow-x-hidden">
        {children}
      </Sidebar>
    </Sidebar>
  )
}