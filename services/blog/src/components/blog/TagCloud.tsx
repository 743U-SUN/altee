// src/components/blog/TagCloud.tsx の一部を修正
// interfaceを更新して_countを持つタグ型にも対応するようにする

import React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";

// 修正された型定義
interface TagWithCount {
  id: string;
  name: string;
  slug: string;
  posts?: any[]; // 任意のプロパティに変更
  _count?: {
    posts: number;
  };
}

interface TagCloudProps {
  tags: TagWithCount[];
  variant?: "default" | "bubble" | "list";
  maxTags?: number;
  showCount?: boolean;
  className?: string;
}

/**
 * タグクラウドコンポーネント
 * 様々な表示バリエーションに対応
 */
export function TagCloud({
  tags,
  variant = "default",
  maxTags = 0, // 0は全て表示
  showCount = true,
  className = "",
}: TagCloudProps) {
  // タグがない場合
  if (!tags.length) {
    return <p className="text-center text-muted-foreground py-4">タグがありません。</p>;
  }

  // タグを投稿数順にソート
  const sortedTags = [...tags].sort((a, b) => {
    // 投稿数の取得方法を修正
    const countA = a._count?.posts ?? a.posts?.length ?? 0;
    const countB = b._count?.posts ?? b.posts?.length ?? 0;
    return countB - countA;
  });

  // 表示するタグ数を制限
  const displayTags = maxTags > 0 ? sortedTags.slice(0, maxTags) : sortedTags;

  // 人気度に基づいてタグのサイズを計算
  const getTagSize = (count: number) => {
    const max = Math.max(...sortedTags.map(t => t._count?.posts ?? t.posts?.length ?? 0));
    const min = Math.min(...sortedTags.map(t => t._count?.posts ?? t.posts?.length ?? 0));
    
    // サイズを3段階で返す (min=xs, middle=sm, max=base)
    if (max === min) return "sm"; // 全て同じ数の場合
    
    const range = max - min;
    const third = range / 3;
    
    if (count <= min + third) return "xs";
    if (count <= min + third * 2) return "sm";
    return "base";
  };

  // リストバリアント
  if (variant === "list") {
    return (
      <ul className={cn("space-y-1", className)}>
        {displayTags.map((tag) => {
          // 投稿数の取得方法を修正
          const count = tag._count?.posts ?? tag.posts?.length ?? 0;
          return (
            <li key={tag.id} className="flex items-center justify-between">
              <Link
                href={`/tags/${tag.slug}`}
                className="text-sm hover:text-primary transition-colors"
              >
                #{tag.name}
              </Link>
              {showCount && (
                <Badge className="text-xs">
                  {count}
                </Badge>
              )}
            </li>
          );
        })}
      </ul>
    );
  }

  // バブルバリアント（サイズの違いを強調）
  if (variant === "bubble") {
    return (
      <div className={cn("flex flex-wrap gap-3", className)}>
        {displayTags.map((tag) => {
          // 投稿数の取得方法を修正
          const count = tag._count?.posts ?? tag.posts?.length ?? 0;
          const size = getTagSize(count);
          
          return (
            <Link key={tag.id} href={`/tags/${tag.slug}`}>
              <Badge
                className={cn(
                  "transition-all hover:scale-110",
                  {
                    "text-xs px-2 py-0.5": size === "xs",
                    "text-sm px-2.5 py-0.5": size === "sm",
                    "text-base px-3 py-1": size === "base",
                  }
                )}
              >
                #{tag.name}
                {showCount && <span className="ml-1">({count})</span>}
              </Badge>
            </Link>
          );
        })}
      </div>
    );
  }

  // デフォルトバリアント
  return (
    <div className={cn("flex flex-wrap gap-2", className)}>
      {displayTags.map((tag) => {
        // 投稿数の取得方法を修正
        const count = tag._count?.posts ?? tag.posts?.length ?? 0;
        
        return (
          <Link key={tag.id} href={`/tags/${tag.slug}`}>
            <Badge className="border border-input bg-background cursor-pointer">
              #{tag.name}
              {showCount && <span className="ml-1 text-xs">({count})</span>}
            </Badge>
          </Link>
        );
      })}
    </div>
  );
}