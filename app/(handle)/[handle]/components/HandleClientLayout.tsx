"use client"

import { usePathname } from "next/navigation"
import { HandleSidebarLayout } from "./HandleSidebarLayout"
import { Separator } from "@/components/ui/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import Link from "next/link"
import { Mail, Bell, Gift } from "lucide-react"

type User = {
  id: string;
  name?: string | null;
  characterName?: string | null;
  iconUrl?: string | null;
  handle?: string | null;
};

export default function HandleClientLayout({
  children,
  sidebarWidth = "360px",
  sidebar,
  mobileFooter,
  user,
}: {
  children: React.ReactNode;
  sidebarWidth?: string;
  sidebar?: React.ReactNode;
  mobileFooter?: React.ReactNode;
  user?: User;
}) {
  const pathname = usePathname()
  
  // pathnameから[handle]を抽出
  const getHandle = () => {
    const pathSegments = pathname.split('/').filter(segment => segment)
    return pathSegments[0] || ''
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
      <HandleSidebarLayout user={user}>
        {sidebar}
      </HandleSidebarLayout>
      <SidebarInset className="rounded-xl shadow-sm flex flex-col h-[calc(100vh-1rem)]">
        <header className="bg-background sticky top-0 flex shrink-0 items-center gap-2 border-b p-4 rounded-t-xl z-10">
          <SidebarTrigger className="-ml-1" />
          <Separator
            orientation="vertical"
            className="mr-2 data-[orientation=vertical]:h-4"
          />
          
          {/* ユーザー情報表示 */}
          <div className="flex items-center gap-2 flex-1">
            {user && (
              <Link href={`/${getHandle()}`} className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                <Avatar className="h-8 w-8 rounded-md">
                  <AvatarImage src={user.iconUrl || undefined} alt={user.characterName || user.name || 'User'} />
                  <AvatarFallback className="rounded-md">
                    {user.characterName ? user.characterName.charAt(0).toUpperCase() : 'NoName'}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium line-clamp-1">
                  {user.characterName || user.name || 'Unknown User'}
                </span>
              </Link>
            )}
          </div>
          
          {/* アイコングループ */}
          <div className="flex items-center gap-2">
            <Mail className="h-5 w-5 text-muted-foreground" />
            <Bell className="h-5 w-5 text-muted-foreground" />
            <Gift className="h-5 w-5 text-muted-foreground" />
          </div>
        </header>
        <div className="flex-1 overflow-hidden">
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