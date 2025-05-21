"use client"

import React from 'react';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { FileTextIcon } from "lucide-react"
import {
  SidebarContent,
  SidebarHeader,
} from "@/components/ui/sidebar"

interface AdminSidebarProps {
  className?: string;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({
  className
}) => {
  return (
    <div className={cn("flex flex-col h-full overflow-x-hidden bg-gray-600", className)}>
      {/* ヘッダー */}
      <SidebarHeader className="border-b p-4">
        <div className="flex items-center gap-3">
          <Avatar className="bg-amber-200">
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
        <div className="flex flex-col gap-4">
          <p className="text-lg font-medium text-gray-300">記事用サイドバー</p>
          <p className="text-sm text-gray-200">幅: 480px</p>
          <div className="rounded-md bg-amber-100 p-3 shadow-sm">
            <p className="text-amber-700">記事に特化したサイドバーメニューがここに表示されます</p>
          </div>
        </div>
      </SidebarContent>
    </div>
  );
}