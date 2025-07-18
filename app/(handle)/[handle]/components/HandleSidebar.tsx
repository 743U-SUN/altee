"use client"

import React from 'react';
import { cn } from '@/lib/utils';
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
import Image from 'next/image';
import Link from 'next/link';
import { OptimizedImage } from '@/components/ui/optimized-image';
import { convertToProxyUrl } from '@/lib/utils/image-proxy';

// UserImageSidebarの型定義
type UserImageSidebar = {
  id: string;
  url?: string | null;
  imgUrl: string;
  alt?: string | null;
  sortOrder: number;
};

interface HandleSidebarProps {
  className?: string;
  imageSidebars?: UserImageSidebar[];
}

export const HandleSidebar: React.FC<HandleSidebarProps> = ({
  className,
  imageSidebars = []
}) => {
  return (
    <div className={cn("flex flex-col h-full overflow-x-hidden bg-gray-600", className)}>
      <SidebarContent className="flex-1 overflow-y-auto p-4">
        {/* サイドバー画像を上から順番に表示 */}
        {imageSidebars.length > 0 && (
          <div className="space-y-3">
            {imageSidebars.map((image, index) => {
              const imageElement = (
                <div 
                  key={image.id}
                  className="relative w-full rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-200 flex justify-center"
                >
                  <OptimizedImage
                    src={convertToProxyUrl(image.imgUrl)}
                    alt={image.alt || 'サイドバー画像'}
                    width={320}
                    height={0}
                    style={{ height: 'auto' }}
                    className="max-w-full h-auto object-contain hover:scale-105 transition-transform duration-200"
                    sizes="(max-width: 320px) 100vw, 320px"
                    priority={index === 0} // 最初の画像にpriorityを設定
                    onError={() => {
                      console.error('画像の読み込みに失敗:', image.imgUrl);
                    }}
                    onLoad={() => {
                      console.log('画像の読み込み成功:', image.imgUrl);
                    }}
                  />
                </div>
              );

              // URLが設定されている場合はリンクとして表示
              if (image.url) {
                return (
                  <Link 
                    key={image.id}
                    href={image.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block cursor-pointer"
                  >
                    {imageElement}
                  </Link>
                );
              }

              return imageElement;
            })}
          </div>
        )}
      </SidebarContent>
    </div>
  );
}