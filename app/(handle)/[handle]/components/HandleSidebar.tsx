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
  LayoutDashboard
} from "lucide-react"
import {
  SidebarContent,
  SidebarHeader,
  SidebarMenuItem,
  SidebarMenu,
  SidebarMenuButton,
} from "@/components/ui/sidebar"

interface HandleSidebarProps {
  className?: string;
}

// メニュー項目
const menuItems = [
  {
    title: "ダッシュボードTOP",
    icon: LayoutDashboard,
    href: "app/[handle]/videos",
  },
  {
    title: "プロフィール設定",
    icon: UserIcon,
    href: "/[handle]/profile",
  },
  {
    title: "リンク設定",
    icon: LinkIcon,
    href: "/[handle]/links",
  },
  {
    title: "Youtube設定",
    icon: YoutubeIcon,
    href: "/[handle]/youtube",
  },
  {
    title: "インフォ設定",
    icon: InfoIcon,
    href: "/[handle]/info",
  },
  {
    title: "デバイス設定",
    icon: MonitorIcon,
    href: "/[handle]/device",
  },
  {
    title: "アカウント設定",
    icon: Settings,
    href: "/[handle]/account",
  },
];

export const HandleSidebar: React.FC<HandleSidebarProps> = ({
  className
}) => {
  return (
    <div className={cn("flex flex-col h-full overflow-x-hidden bg-gray-600", className)}>
      {/* ヘッダー */}
      <SidebarHeader className="border-b p-4">
        <div className="flex items-center gap-3">
          <Avatar className="bg-slate-200">
            <AvatarImage src="/vercel.svg" alt="Handle" />
            <AvatarFallback>
              <FileTextIcon className="h-5 w-5" />
            </AvatarFallback>
          </Avatar>
          <div className="text-foreground text-base font-medium">
            Handle
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="flex-1 overflow-y-auto p-4">
        <SidebarMenu>
          {menuItems.map((item, index) => (
            <SidebarMenuItem key={index}>
              <SidebarMenuButton asChild>
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