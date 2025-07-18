"use client"

import React from 'react';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { 
  FileTextIcon, 
  UserIcon,
  LinkIcon,
  YoutubeIcon,
  InfoIcon,
  MonitorIcon,
  Settings,
  LayoutDashboard,
  Heart
} from "lucide-react"
import {
  SidebarContent,
  SidebarHeader,
  SidebarMenuItem,
  SidebarMenu,
  SidebarMenuButton,
} from "@/components/ui/sidebar"

interface UserSidebarProps {
  className?: string;
}

// メニュー項目
const menuItems = [
  {
    title: "ダッシュボードTOP",
    icon: LayoutDashboard,
    href: "/user",
  },
  {
    title: "プロフィール設定",
    icon: UserIcon,
    href: "/user/profile",
  },
  {
    title: "リンク設定",
    icon: LinkIcon,
    href: "/user/links",
  },
  {
    title: "Youtube設定",
    icon: YoutubeIcon,
    href: "/user/youtube",
  },
  {
    title: "インフォ設定",
    icon: InfoIcon,
    href: "/user/info",
  },
  {
    title: "デバイス設定",
    icon: MonitorIcon,
    href: "/user/devices",
  },
  {
    title: "お気に入り",
    icon: Heart,
    href: "/user/favorites",
  },
  {
    title: "アカウント設定",
    icon: Settings,
    href: "/user/account",
  },
];

export const UserSidebar: React.FC<UserSidebarProps> = ({
  className
}) => {
  return (
    <div className={cn("flex flex-col h-full overflow-x-hidden bg-zinc-800", className)}>
      {/* ヘッダー */}
      <SidebarHeader className="border-b p-4">
        <div className="flex items-center gap-3">
          <Avatar className="bg-slate-200">
            <AvatarImage src="/vercel.svg" alt="User" />
            <AvatarFallback>
              <FileTextIcon className="h-5 w-5" />
            </AvatarFallback>
          </Avatar>
          <div className="text-foreground text-base font-medium">
            User
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="flex-1 overflow-y-auto p-4">
        <SidebarMenu>
          {menuItems.map((item, index) => (
            <SidebarMenuItem key={index}>
              <SidebarMenuButton asChild className=" text-slate-50 hover:bg-neutral-300">
                <a href={item.href}>
                  {item.icon && <item.icon />}
                  <span>{item.title}</span>
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
    </div>
  );
}