import React from "react";
import Link from "next/link";
import { PostFrontmatter } from "@/types";
import { PostCard } from "@/components/blog/PostCard";
import { GridContainer } from "@/components/layout/Container";
import { Button } from "@/components/ui/Button";

interface FeaturedPostsProps {
  posts: PostFrontmatter[];
  title?: string;
  description?: string;
  showViewAll?: boolean;
  viewAllLink?: string;
  viewAllText?: string;
  limit?: number;
  layout?: "grid" | "slider" | "hero";
  className?: string;
}

/**
 * 注目記事を表示するコンポーネント
 * トップページなどで使用
 */
export function FeaturedPosts({
  posts,
  title = "注目の記事",
  description,
  showViewAll = true,
  viewAllLink = "/posts",
  viewAllText = "すべての記事を見る",
  limit = 4,
  layout = "grid",
  className = "",
}: FeaturedPostsProps) {
  if (!posts.length) {
    return null;
  }

  // 表示する投稿数を制限
  const displayPosts = posts.slice(0, limit);

  // heroレイアウト（大きな最初の記事 + 小さな記事のグリッド）
  if (layout === "hero" && posts.length >= 3) {
    const heroPost = displayPosts[0];
    const remainingPosts = displayPosts.slice(1);
    
    return (
      <div className={className}>
        {/* セクションヘッダー */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8">
          <div>
            {title && <h2 className="text-3xl font-bold tracking-tight mb-2">{title}</h2>}
            {description && <p className="text-muted-foreground">{description}</p>}
          </div>
          {showViewAll && (
            <div className="mt-4 md:mt-0">
              <Button variant="outline" asChild>
                <Link href={viewAllLink}>{viewAllText}</Link>
              </Button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* メイン記事 */}
          <div className="md:col-span-2">
            <PostCard
              post={heroPost}
              variant="featured"
              showImage={true}
              showAuthor={true}
              showExcerpt={true}
              showCategories={true}
            />
          </div>
          
          {/* サブ記事 */}
          <div className="md:col-span-1 space-y-6">
            {remainingPosts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                variant="compact"
                showImage={false}
                showAuthor={false}
                showExcerpt={false}
                showCategories={true}
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // グリッドレイアウト（デフォルト）
  return (
    <div className={className}>
      {/* セクションヘッダー */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8">
        <div>
          {title && <h2 className="text-3xl font-bold tracking-tight mb-2">{title}</h2>}
          {description && <p className="text-muted-foreground">{description}</p>}
        </div>
        {showViewAll && (
          <div className="mt-4 md:mt-0">
            <Button variant="outline" asChild>
              <Link href={viewAllLink}>{viewAllText}</Link>
            </Button>
          </div>
        )}
      </div>

      {/* 記事グリッド */}
      <GridContainer cols={displayPosts.length >= 3 ? 3 : (displayPosts.length === 2 ? 2 : 1)}>
        {displayPosts.map((post) => (
          <PostCard
            key={post.id}
            post={post}
            variant="default"
            showImage={true}
            showAuthor={true}
            showExcerpt={true}
            showCategories={true}
            className="h-full"
          />
        ))}
      </GridContainer>
    </div>
  );
}