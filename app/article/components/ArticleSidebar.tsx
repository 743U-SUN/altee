"use client"

import React from 'react';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { FileTextIcon } from "lucide-react"
import {
  SidebarContent,
  SidebarHeader,
} from "@/components/ui/sidebar"

interface ArticleSidebarProps {
  className?: string;
}

export const ArticleSidebar: React.FC<ArticleSidebarProps> = ({
  className
}) => {
  return (
    <div className={cn("flex flex-col h-full overflow-x-hidden bg-amber-50", className)}>
      {/* ヘッダー部分：記事用アイコンと名前を表示 */}
      <SidebarHeader className="border-b p-4">
        <div className="flex items-center gap-3">
          <Avatar className="bg-amber-200">
            <AvatarImage src="/vercel.svg" alt="Article" />
            <AvatarFallback>
              <FileTextIcon className="h-5 w-5" />
            </AvatarFallback>
          </Avatar>
          <div className="text-foreground text-base font-medium">
            記事セクション
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="flex-1 overflow-y-auto p-4">
        <div className="flex flex-col gap-4">
          <p className="text-lg font-medium text-amber-800">記事用サイドバー</p>
          <p className="text-sm text-amber-600">幅: 480px</p>
          <div className="rounded-md bg-amber-100 p-3 shadow-sm">
            <p className="text-amber-700">記事に特化したサイドバーメニューがここに表示されます</p>
          </div>
        </div>
      </SidebarContent>
    </div>
  );
}