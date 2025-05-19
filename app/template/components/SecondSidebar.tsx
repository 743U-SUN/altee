"use client"

import React from 'react';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

import {
  SidebarContent,
  SidebarHeader,
} from "@/components/ui/sidebar"

interface SecondSidebarProps {
  className?: string;
}

export const SecondSidebar: React.FC<SecondSidebarProps> = ({
  className
}) => {
  return (
    <div className={cn("flex flex-col h-full overflow-x-hidden bg-blue-100", className)}>
      {/* ヘッダー部分：ユーザーアイコンと名前を表示 */}
      <SidebarHeader className="border-b p-4">
        <div className="flex items-center gap-3">
          <Avatar>
            <AvatarImage src="/vercel.svg" alt="User" />
            <AvatarFallback>UN</AvatarFallback>
          </Avatar>
          <div className="text-foreground text-base font-medium">
            SecondSidebar
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="flex-1 overflow-y-auto p-4">
        <div className="flex items-center justify-center h-full">
          <p className="text-lg font-medium text-gray-600">セカンドサイドバーエリア</p>
        </div>
      </SidebarContent>
    </div>
  );
};