import React from "react";
import Link from "next/link";
import Image from "next/image";
import { formatDate } from "@/lib/date";
import { Button } from "@/components/ui/Button";
import { PostFrontmatter } from "@/types";

// PostFrontmatterのメディア対応拡張
interface PostWithMedia extends PostFrontmatter {
  media?: {
    path: string;
  }[];
}

interface FeaturedPostsProps {
  posts: PostWithMedia[];
  title?: string;
  description?: string;
  layout?: "default" | "hero";
  className?: string;
}

/**
 * 特集記事コンポーネント
 */
export function FeaturedPosts({
  posts,
  title,
  description,
  layout = "default",
  className = "",
}: FeaturedPostsProps) {
  if (!posts || posts.length === 0) {
    return null;
  }
  
  // 画像ソース取得用ヘルパー関数
  const getImageSrc = (post: PostWithMedia) => {
    return post.media?.[0]?.path || `/images/posts/${post.slug}.jpg`;
  };

  if (layout === "hero" && posts.length > 0) {
    const mainPost = posts[0];
    const otherPosts = posts.slice(1);

    return (
      <div className={className}>
        {title && (
          <div className="mb-8 text-center">
            <h2 className="text-3xl font-bold tracking-tight mb-2">{title}</h2>
            {description && (
              <p className="text-lg text-muted-foreground">{description}</p>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* メイン記事 */}
          <div className="lg:col-span-7">
            <div className="group relative h-full">
              <div className="relative aspect-video overflow-hidden rounded-lg mb-4">
                <Image
                  src={getImageSrc(mainPost)}
                  alt={mainPost.title}
                  fill
                  className="object-cover transition-transform group-hover:scale-105"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = "/images/post-placeholder.jpg";
                  }}
                />
              </div>
              <div className="space-y-2">
                {mainPost.categories?.[0] && (
                  <span className="text-sm font-medium text-primary">
                    {mainPost.categories[0].name}
                  </span>
                )}
                <h3 className="text-2xl font-bold tracking-tight">
                  {mainPost.title}
                </h3>
                {mainPost.excerpt && (
                  <p className="text-muted-foreground line-clamp-2">
                    {mainPost.excerpt}
                  </p>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    {formatDate(
                      mainPost.publishedAt || mainPost.createdAt
                    )}
                  </span>
                  <Button asChild className="mt-2">
                    <Link href={`/posts/${mainPost.slug}`}>
                      続きを読む
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* サブ記事 */}
          <div className="lg:col-span-5">
            <div className="space-y-6">
              {otherPosts.slice(0, 3).map((post) => (
                <div key={post.id} className="group flex gap-4">
                  <div className="relative w-24 h-24 flex-shrink-0 overflow-hidden rounded-md">
                    <Image
                      src={getImageSrc(post)}
                      alt={post.title}
                      fill
                      className="object-cover transition-transform group-hover:scale-105"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = "/images/post-placeholder.jpg";
                      }}
                    />
                  </div>
                  <div className="flex-1">
                    <div className="space-y-1">
                      {post.categories?.[0] && (
                        <span className="text-xs font-medium text-primary">
                          {post.categories[0].name}
                        </span>
                      )}
                      <h4 className="font-medium line-clamp-2">
                        <Link
                          href={`/posts/${post.slug}`}
                          className="hover:underline"
                        >
                          {post.title}
                        </Link>
                      </h4>
                      <div className="text-xs text-muted-foreground">
                        {formatDate(post.publishedAt || post.createdAt)}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              {otherPosts.length > 3 && (
                <Button asChild className="w-full">
                  <Link href="/posts">
                    もっと見る
                  </Link>
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // デフォルトレイアウト
  return (
    <div className={className}>
      {title && (
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-bold tracking-tight mb-2">{title}</h2>
          {description && (
            <p className="text-lg text-muted-foreground">{description}</p>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {posts.map((post) => (
          <div key={post.id} className="group relative">
            <div className="relative aspect-video overflow-hidden rounded-lg mb-4">
              <Image
                src={getImageSrc(post)}
                alt={post.title}
                fill
                className="object-cover transition-transform group-hover:scale-105"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = "/images/post-placeholder.jpg";
                }}
              />
            </div>
            <div className="space-y-2">
              {post.categories?.[0] && (
                <span className="text-sm font-medium text-primary">
                  {post.categories[0].name}
                </span>
              )}
              <h3 className="text-xl font-bold tracking-tight">{post.title}</h3>
              {post.excerpt && (
                <p className="text-muted-foreground line-clamp-2">{post.excerpt}</p>
              )}
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  {formatDate(post.publishedAt || post.createdAt)}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}