import React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";

// 修正された型定義
interface TagWithCount {
  id: string;
  name: string;
  slug: string;
  posts?: Array<any> | { length: number } | undefined;
  _count?: {
    posts: number;
  };
}

// 安全にタグの投稿数を取得するヘルパー関数
function getTagPostCount(tag: TagWithCount): number {
  if (tag._count?.posts !== undefined) {
    return tag._count.posts;
  }
  
  if (tag.posts && 'length' in tag.posts) {
    return tag.posts.length;
  }
  
  return 0;
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
  if (!tags || tags.length === 0) {
    return <p className="text-center text-muted-foreground py-4">タグがありません。</p>;
  }

  // タグを投稿数順にソート
  const sortedTags = [...tags].sort((a, b) => {
    return getTagPostCount(b) - getTagPostCount(a);
  });

  // 表示するタグ数を制限
  const displayTags = maxTags > 0 ? sortedTags.slice(0, maxTags) : sortedTags;

  // 人気度に基づいてタグのサイズを計算
  const getTagSize = (count: number) => {
    if (sortedTags.length <= 1) return "sm"; // タグが1つしかない場合
    
    const counts = sortedTags.map(t => getTagPostCount(t));
    const max = Math.max(...counts);
    const min = Math.min(...counts);
    
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
          const count = getTagPostCount(tag);
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
          const count = getTagPostCount(tag);
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
        const count = getTagPostCount(tag);
        
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