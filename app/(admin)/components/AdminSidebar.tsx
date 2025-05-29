"use client"

import React from 'react';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { 
  FileTextIcon, 
  UserIcon,
  LinkIcon,
  Settings,
  LayoutDashboard,
  Package
} from "lucide-react"
import {
  SidebarContent,
  SidebarHeader,
  SidebarMenuItem,
  SidebarMenu,
  SidebarMenuButton,
} from "@/components/ui/sidebar"

interface AdminSidebarProps {
  className?: string;
}

// メニュー項目
const menuItems = [
  {
    title: "ダッシュボードTOP",
    icon: LayoutDashboard,
    href: "/admin",
  },
  {
    title: "Users",
    icon: UserIcon,
    href: "/admin/users",
  },
  {
    title: "デバイス管理",
    icon: Package,
    href: "/admin/devices",
  },
  {
    title: "リンク設定",
    icon: LinkIcon,
    href: "/admin/links",
  },
  {
    title: "アカウント設定",
    icon: Settings,
    href: "/admin/account",
  },
];

export const AdminSidebar: React.FC<AdminSidebarProps> = ({
  className
}) => {
  return (
    <div className={cn("flex flex-col h-full overflow-x-hidden bg-gray-600", className)}>
      {/* ヘッダー */}
      <SidebarHeader className="border-b p-4">
        <div className="flex items-center gap-3">
          <Avatar className="bg-slate-200">
            <AvatarImage src="/vercel.svg" alt="Admin" />
            <AvatarFallback>
              <FileTextIcon className="h-5 w-5" />
            </AvatarFallback>
          </Avatar>
          <div className="text-foreground text-base font-medium">
            Admin
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