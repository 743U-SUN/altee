"use client"

import React from 'react';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Monitor, Search, Star, TrendingUp } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  SidebarContent,
  SidebarHeader,
} from "@/components/ui/sidebar"

interface DeviceSidebarProps {
  className?: string;
}

export const DeviceSidebar: React.FC<DeviceSidebarProps> = ({
  className
}) => {
  return (
    <div className={cn("flex flex-col h-full overflow-x-hidden bg-blue-50", className)}>
      {/* ヘッダー部分：デバイス用アイコンと名前を表示 */}
      <SidebarHeader className="border-b p-4">
        <div className="flex items-center gap-3">
          <Avatar className="bg-blue-200">
            <AvatarImage src="/vercel.svg" alt="Device" />
            <AvatarFallback>
              <Monitor className="h-5 w-5" />
            </AvatarFallback>
          </Avatar>
          <div className="text-foreground text-base font-medium">
            デバイスカタログ
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="flex-1 overflow-y-auto p-4">
        <div className="flex flex-col gap-6">
          {/* 検索機能 */}
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-blue-800 flex items-center gap-2">
              <Search className="h-4 w-4" />
              商品検索
            </h3>
            <div className="flex gap-2">
              <Input 
                placeholder="デバイス名で検索..." 
                className="text-sm"
              />
              <Button size="sm" variant="outline">
                検索
              </Button>
            </div>
          </div>

          {/* 人気カテゴリ */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-blue-800 flex items-center gap-2">
              <Star className="h-4 w-4" />
              人気カテゴリ
            </h3>
            <div className="space-y-2">
              {['キーボード', 'マウス', 'マイク', 'ヘッドホン'].map((category) => (
                <Button 
                  key={category}
                  variant="ghost" 
                  size="sm" 
                  className="w-full justify-start text-blue-700 hover:bg-blue-100"
                >
                  {category}
                </Button>
              ))}
            </div>
          </div>

          {/* 注目商品 */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-blue-800 flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              今週の注目
            </h3>
            <div className="rounded-md bg-blue-100 p-3 shadow-sm">
              <p className="text-sm text-blue-700 font-medium">配信者に人気のデバイス</p>
              <p className="text-xs text-blue-600 mt-1">プロが愛用する高品質機材をチェック</p>
            </div>
          </div>

          {/* フィルタオプション */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-blue-800">価格帯</h3>
            <div className="space-y-2">
              {['〜10,000円', '10,000〜30,000円', '30,000円〜'].map((price) => (
                <Button 
                  key={price}
                  variant="ghost" 
                  size="sm" 
                  className="w-full justify-start text-blue-700 hover:bg-blue-100"
                >
                  {price}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </SidebarContent>
    </div>
  );
}