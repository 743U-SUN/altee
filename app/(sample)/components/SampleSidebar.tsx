"use client"

import React from 'react';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { LayoutTemplateIcon } from "lucide-react"
import {
  SidebarContent,
  SidebarHeader,
} from "@/components/ui/sidebar"

interface SampleSidebarProps {
  className?: string;
}

export const SampleSidebar: React.FC<SampleSidebarProps> = ({
  className
}) => {
  return (
    <div className={cn("flex flex-col h-full overflow-x-hidden bg-cyan-50", className)}>
      {/* ヘッダー部分：サンプル用アイコンと名前を表示 */}
      <SidebarHeader className="border-b p-4">
        <div className="flex items-center gap-3">
          <Avatar className="bg-cyan-200">
            <AvatarImage src="/vercel.svg" alt="Sample" />
            <AvatarFallback>
              <LayoutTemplateIcon className="h-5 w-5" />
            </AvatarFallback>
          </Avatar>
          <div className="text-foreground text-base font-medium">
            サンプルセクション
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="flex-1 overflow-y-auto p-4">
        <div className="flex flex-col gap-4">
          <p className="text-lg font-medium text-cyan-800">サンプル用サイドバー</p>
          <p className="text-sm text-cyan-600">幅: 360px</p>
          <div className="rounded-md bg-cyan-100 p-3 shadow-sm">
            <p className="text-cyan-700">サンプルに特化したサイドバーメニューがここに表示されます</p>
          </div>
        </div>
      </SidebarContent>
    </div>
  );
}