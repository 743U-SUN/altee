"use client"

import React from 'react';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Home, Zap, Info, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  SidebarContent,
  SidebarHeader,
} from "@/components/ui/sidebar"
import Link from "next/link"

interface HomeSidebarProps {
  className?: string;
}

export const HomeSidebar: React.FC<HomeSidebarProps> = ({
  className
}) => {
  return (
    <div className={cn("flex flex-col h-full overflow-x-hidden bg-gray-50", className)}>
      {/* ヘッダー部分：Home用アイコンと名前を表示 */}
      <SidebarHeader className="border-b p-4">
        <div className="flex items-center gap-3">
          <Avatar className="bg-gray-200">
            <AvatarImage src="/altee-logo.svg" alt="Altee" />
            <AvatarFallback>
              <Home className="h-5 w-5" />
            </AvatarFallback>
          </Avatar>
          <div className="text-foreground text-base font-medium">
            Alteeアプリケーション
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="flex-1 overflow-y-auto p-4">
        <div className="flex flex-col gap-6">
          {/* クイックアクセス */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-gray-800 flex items-center gap-2">
              <Zap className="h-4 w-4" />
              クイックアクセス
            </h3>
            <div className="space-y-2">
              <Button 
                asChild
                variant="ghost" 
                size="sm" 
                className="w-full justify-start text-gray-700 hover:bg-gray-100"
              >
                <Link href="/admin">管理者ダッシュボード</Link>
              </Button>
              <Button 
                asChild
                variant="ghost" 
                size="sm" 
                className="w-full justify-start text-gray-700 hover:bg-gray-100"
              >
                <Link href="/user">ユーザーダッシュボード</Link>
              </Button>
              <Button 
                asChild
                variant="ghost" 
                size="sm" 
                className="w-full justify-start text-gray-700 hover:bg-gray-100"
              >
                <Link href="/device">デバイスカタログ</Link>
              </Button>
            </div>
          </div>

          {/* 最新情報 */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-gray-800 flex items-center gap-2">
              <Info className="h-4 w-4" />
              お知らせ
            </h3>
            <Card className="border-gray-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">統一レイアウト完了</CardTitle>
                <CardDescription className="text-xs">
                  全セクションでBaseLayoutを使用
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-xs text-gray-600">
                  Admin、User、Article、Deviceの全セクションが統一されたレイアウトになりました。
                </p>
              </CardContent>
            </Card>
          </div>

          {/* アプリケーション情報 */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-gray-800">アプリ情報</h3>
            <div className="rounded-md bg-gray-100 p-3 shadow-sm">
              <p className="text-sm text-gray-700 font-medium">Altee v1.0</p>
              <p className="text-xs text-gray-600 mt-1">
                Next.js 15 + Prisma + BaseLayout
              </p>
              <div className="flex items-center gap-1 mt-2">
                <ExternalLink className="h-3 w-3 text-gray-500" />
                <span className="text-xs text-gray-500">多機能プラットフォーム</span>
              </div>
            </div>
          </div>
        </div>
      </SidebarContent>
    </div>
  );
}