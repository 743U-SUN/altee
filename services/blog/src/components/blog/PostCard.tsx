import React from "react";
import Link from "next/link";
import Image from "next/image";
import { PostFrontmatter } from "@/types";
import { formatDate, formatRelativeTime } from "@/lib/date";
import { truncate } from "@/lib/utils";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { UserAvatar } from "@/components/ui/Avatar";

interface PostCardProps {
  post: PostFrontmatter;
  variant?: "default" | "compact" | "featured";
  showImage?: boolean;
  showAuthor?: boolean;
  showExcerpt?: boolean;
  showCategories?: boolean;
  showTags?: boolean;
  imageAspectRatio?: "square" | "video" | "wide";
  className?: string;
}

/**
 * ブログ記事カードコンポーネント
 * 様々な表示バリエーションに対応
 */
export function PostCard({
  post,
  variant = "default",
  showImage = true,
  showAuthor = true,
  showExcerpt = true,
  showCategories = true,
  showTags = false,
  imageAspectRatio = "video",
  className = "",
}: PostCardProps) {
  // 投稿が新しいかどうかを判断（7日以内の投稿を「新着」とする）
  const isNew = post.publishedAt
    ? new Date().getTime() - new Date(post.publishedAt).getTime() <
      7 * 24 * 60 * 60 * 1000
    : false;

  // アスペクト比に応じたクラス
  const imageAspectClasses = {
    square: "aspect-square",
    video: "aspect-video",
    wide: "aspect-[21/9]",
  };

  // バリアントに応じたスタイル設定
  const variantStyles = {
    default: "",
    compact: "h-full",
    featured: "md:grid md:grid-cols-2 gap-6 h-full",
  };

  // サンプル画像URL（実際の実装では適切な画像URLを使用）
  const imageUrl = `/images/posts/${post.slug}.jpg`;
  // フォールバック用のデフォルト画像
  const defaultImageUrl = "/images/post-placeholder.jpg";

  return (
    <Card className={`overflow-hidden ${variantStyles[variant]} ${className}`}>
      {/* 記事の画像（表示する場合） */}
      {showImage && variant !== "featured" && (
        <Link href={`/posts/${post.slug}`} className="block overflow-hidden">
          <div
            className={`relative w-full ${imageAspectClasses[imageAspectRatio]} bg-muted overflow-hidden group`}
          >
            <Image
              src={imageUrl}
              alt={post.title}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              priority={post.featured}
              onError={(e) => {
                // 画像読み込みエラー時にデフォルト画像を表示
                const target = e.target as HTMLImageElement;
                target.src = defaultImageUrl;
              }}
            />
            {isNew && (
              <div className="absolute top-2 right-2 z-10">
                <Badge variant="success" size="sm">
                  New
                </Badge>
              </div>
            )}
            {post.featured && (
              <div className="absolute top-2 left-2 z-10">
                <Badge variant="warning" size="sm">
                  注目
                </Badge>
              </div>
            )}
          </div>
        </Link>
      )}

      <div className="flex flex-col h-full">
        {/* カテゴリ表示 */}
        {showCategories && post.categories && post.categories.length > 0 && (
          <div className="px-6 pt-6 pb-0 flex flex-wrap gap-2">
            {post.categories.slice(0, 2).map((category) => (
              <Link key={category.id} href={`/categories/${category.slug}`}>
                <Badge variant="secondary" interactive={true}>
                  {category.name}
                </Badge>
              </Link>
            ))}
            {post.categories.length > 2 && (
              <Badge variant="outline" size="sm">
                +{post.categories.length - 2}
              </Badge>
            )}
          </div>
        )}

        <CardHeader>
          <CardTitle>
            <Link
              href={`/posts/${post.slug}`}
              className="hover:text-primary transition-colors"
            >
              {post.title}
            </Link>
          </CardTitle>
        </CardHeader>

        {/* 抜粋表示 */}
        {showExcerpt && post.excerpt && (
          <CardContent>
            <p className="text-muted-foreground">
              {truncate(post.excerpt, variant === "compact" ? 80 : 120)}
            </p>
          </CardContent>
        )}

        <CardFooter className="mt-auto">
          {/* 著者情報表示 */}
          {showAuthor && post.author && (
            <div className="flex items-center justify-between w-full text-sm text-muted-foreground">
              <div className="flex items-center space-x-2">
                <UserAvatar
                  src={post.author.image}
                  name={post.author.name || "匿名"}
                  size="sm"
                />
                <span>{post.author.name || "匿名"}</span>
              </div>
              <time dateTime={post.publishedAt?.toString() || post.createdAt.toString()}>
                {formatDate(post.publishedAt || post.createdAt)}
              </time>
            </div>
          )}

          {/* 著者情報を表示しない場合は日付のみ表示 */}
          {(!showAuthor || !post.author) && (
            <div className="flex items-center justify-between w-full text-sm text-muted-foreground">
              <span>{post.viewCount} views</span>
              <time dateTime={post.publishedAt?.toString() || post.createdAt.toString()}>
                {formatDate(post.publishedAt || post.createdAt)}
              </time>
            </div>
          )}
        </CardFooter>

        {/* タグ表示 */}
        {showTags && post.tags && post.tags.length > 0 && (
          <div className="px-6 pt-0 pb-6 flex flex-wrap gap-2">
            {post.tags.map((tag) => (
              <Link key={tag.id} href={`/tags/${tag.slug}`}>
                <Badge variant="outline" interactive={true} size="sm">
                  #{tag.name}
                </Badge>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* featured バリアント用の画像（右側に配置） */}
      {showImage && variant === "featured" && (
        <Link href={`/posts/${post.slug}`} className="block overflow-hidden">
          <div
            className={`relative w-full h-full min-h-[250px] bg-muted overflow-hidden group`}
          >
            <Image
              src={imageUrl}
              alt={post.title}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, 50vw"
              priority={true}
              onError={(e) => {
                // 画像読み込みエラー時にデフォルト画像を表示
                const target = e.target as HTMLImageElement;
                target.src = defaultImageUrl;
              }}
            />
            {isNew && (
              <div className="absolute top-2 right-2 z-10">
                <Badge variant="success" size="sm">
                  New
                </Badge>
              </div>
            )}
            {post.featured && (
              <div className="absolute top-2 left-2 z-10">
                <Badge variant="warning" size="sm">
                  注目
                </Badge>
              </div>
            )}
          </div>
        </Link>
      )}
    </Card>
  );
}