import React from "react";
import Link from "next/link";
import Image from "next/image";
import { formatDate } from "@/lib/date";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { UserAvatar } from "@/components/ui/Avatar";
import { PostFrontmatter } from "@/types";

// PostFrontmatterのメディア対応拡張
interface PostWithMedia extends PostFrontmatter {
  media?: {
    path: string;
  }[];
}

interface PostCardProps {
  post: PostWithMedia;
  variant?: "default" | "compact" | "featured";
  showImage?: boolean;
  showExcerpt?: boolean;
  showAuthor?: boolean;
  showDate?: boolean;
  showReadingTime?: boolean;
  showCategories?: boolean;
  showTags?: boolean;
  className?: string;
}

/**
 * 記事カードコンポーネント
 */
export function PostCard({
  post,
  variant = "default",
  showImage = true,
  showExcerpt = true,
  showAuthor = true,
  showDate = true,
  showReadingTime = false,
  showCategories = true,
  showTags = false,
  className = "",
}: PostCardProps) {
  if (!post) {
    return null;
  }

  const publishDate = post.publishedAt || post.createdAt;
  const imageUrl = post.media?.[0]?.path || `/images/posts/${post.slug}.jpg`;
  const defaultImageUrl = "/images/post-placeholder.jpg";

  // 投稿URLの生成
  const postUrl = `/posts/${post.slug}`;

  // カテゴリバッジのレンダリング関数
  const renderCategories = () => {
    if (!showCategories || !post.categories || post.categories.length === 0) return null;
    
    return (
      <div className="mb-2">
        <Link href={`/categories/${post.categories[0].slug}`}>
          <Badge className="bg-primary/10 text-primary hover:bg-primary/20">
            {post.categories[0].name}
          </Badge>
        </Link>
      </div>
    );
  };

  // タグバッジのレンダリング関数
  const renderTags = () => {
    if (!showTags || !post.tags || post.tags.length === 0) return null;
    
    return (
      <div className="mb-4 flex flex-wrap gap-1">
        <Badge className="bg-accent/50 text-foreground">
          #{post.tags[0].name}
        </Badge>
        {post.tags.length > 1 && (
          <Badge className="bg-accent/50 text-foreground">
            +{post.tags.length - 1}
          </Badge>
        )}
      </div>
    );
  };

  // 著者情報のレンダリング関数
  const renderAuthor = () => {
    if (!showAuthor || !post.author) return null;
    
    return (
      <div className="flex items-center gap-2 mb-2">
        <UserAvatar
          src={post.author.image}
          name={post.author.name || "匿名"}
          size="sm"
        />
        <span className="text-sm font-medium">
          {post.author.name || "匿名"}
        </span>
      </div>
    );
  };

  // 日付情報のレンダリング関数
  const renderDateInfo = () => {
    if (!showDate && !showReadingTime) return null;
    
    return (
      <div className="flex items-center text-xs text-muted-foreground">
        {showDate && (
          <time dateTime={publishDate.toISOString()}>
            {formatDate(publishDate)}
          </time>
        )}
        {showDate && showReadingTime && <span className="mx-1">•</span>}
        {showReadingTime && <span>7分で読めます</span>}
      </div>
    );
  };

  // 特集記事表示
  if (variant === "featured") {
    return (
      <Card className={cn("overflow-hidden h-full", className)}>
        <div className="grid grid-cols-1 md:grid-cols-2 h-full">
          {/* 画像部分 */}
          {showImage && (
            <div className="relative h-full min-h-[200px]">
              <Link href={postUrl}>
                <div className="relative h-full">
                  <Image
                    src={imageUrl}
                    alt={post.title}
                    fill
                    className="object-cover transition-transform hover:scale-105"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = defaultImageUrl;
                    }}
                  />
                </div>
              </Link>
            </div>
          )}

          {/* テキスト部分 */}
          <div className="p-6 flex flex-col h-full">
            {renderCategories()}

            <h3 className="text-2xl font-bold tracking-tight mb-2">
              <Link
                href={postUrl}
                className="hover:underline decoration-primary decoration-2 underline-offset-4"
              >
                {post.title}
              </Link>
            </h3>

            {showExcerpt && post.excerpt && (
              <p className="text-muted-foreground line-clamp-3 mb-4">
                {post.excerpt}
              </p>
            )}

            {renderTags()}

            <div className="mt-auto">
              {renderAuthor()}
              {renderDateInfo()}
            </div>
          </div>
        </div>
      </Card>
    );
  }

  // コンパクト表示
  if (variant === "compact") {
    return (
      <div className={cn("flex gap-4", className)}>
        {showImage && (
          <Link href={postUrl} className="flex-shrink-0">
            <div className="relative w-20 h-20 overflow-hidden rounded-md">
              <Image
                src={imageUrl}
                alt={post.title}
                fill
                className="object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = defaultImageUrl;
                }}
              />
            </div>
          </Link>
        )}

        <div className="flex-1 min-w-0">
          {renderCategories()}

          <h3 className="font-medium line-clamp-2 mb-1">
            <Link href={postUrl} className="hover:underline">
              {post.title}
            </Link>
          </h3>

          {renderDateInfo()}
        </div>
      </div>
    );
  }

  // デフォルト表示
  return (
    <Card className={cn("overflow-hidden h-full", className)}>
      {showImage && (
        <Link href={postUrl}>
          <div className="relative aspect-video overflow-hidden">
            <Image
              src={imageUrl}
              alt={post.title}
              fill
              className="object-cover transition-transform hover:scale-105"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = defaultImageUrl;
              }}
            />
          </div>
        </Link>
      )}

      <CardContent className="p-4 flex flex-col h-full">
        {renderCategories()}

        <h3 className="text-xl font-bold tracking-tight mb-2">
          <Link
            href={postUrl}
            className="hover:underline decoration-primary decoration-2 underline-offset-4"
          >
            {post.title}
          </Link>
        </h3>

        {showExcerpt && post.excerpt && (
          <p className="text-muted-foreground line-clamp-2 mb-4">
            {post.excerpt}
          </p>
        )}

        <div className="mt-auto">
          {renderAuthor()}
          {renderDateInfo()}
        </div>
      </CardContent>
    </Card>
  );
}