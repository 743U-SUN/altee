import React from "react";
import { PostFrontmatter, PaginatedResult } from "@/types";
import { Pagination } from "@/components/ui/Pagination";
import { PostCard } from "@/components/blog/PostCard";
import { GridContainer } from "@/components/layout/Container";

interface PostListProps {
  posts: PostFrontmatter[] | PaginatedResult<PostFrontmatter>;
  variant?: "default" | "compact" | "grid" | "list";
  showImage?: boolean;
  showAuthor?: boolean;
  showExcerpt?: boolean;
  showCategories?: boolean;
  showTags?: boolean;
  columns?: 1 | 2 | 3 | 4;
  baseUrl?: string;
  noResults?: React.ReactNode;
  className?: string;
}

/**
 * 記事リストコンポーネント
 * 様々な表示バリエーションに対応
 */
export function PostList({
  posts,
  variant = "default",
  showImage = true,
  showAuthor = true,
  showExcerpt = true,
  showCategories = true,
  showTags = false,
  columns = 3,
  baseUrl = "/posts",
  noResults = <p className="text-center text-muted-foreground py-8">投稿が見つかりませんでした。</p>,
  className = "",
}: PostListProps) {
  // ページネーション関連の情報を保持
  const pagination = isPaginatedResult(posts) ? posts.meta : null;
  // 表示する投稿の配列
  const postItems = isPaginatedResult(posts) ? posts.data : posts;

  // 投稿がない場合
  if (!postItems.length) {
    return <>{noResults}</>;
  }

  // 表示バリアントに応じたスタイルを設定
  const getCardVariant = (variant: string) => {
    switch (variant) {
      case "compact":
        return "compact";
      case "list":
        return "default";
      default:
        return "default";
    }
  };

  return (
    <div className={className}>
      {/* グリッドまたはリスト表示 */}
      {variant === "grid" || variant === "default" ? (
        <GridContainer cols={columns}>
          {postItems.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              variant={getCardVariant(variant)}
              showImage={showImage}
              showAuthor={showAuthor}
              showExcerpt={showExcerpt}
              showCategories={showCategories}
              showTags={showTags}
              className="h-full"
            />
          ))}
        </GridContainer>
      ) : (
        <div className="space-y-6">
          {postItems.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              variant={getCardVariant(variant)}
              showImage={showImage}
              showAuthor={showAuthor}
              showExcerpt={showExcerpt}
              showCategories={showCategories}
              showTags={showTags}
            />
          ))}
        </div>
      )}

      {/* ページネーション表示 */}
      {pagination && pagination.pageCount > 1 && (
        <div className="mt-10">
          <Pagination
            totalItems={pagination.total}
            currentPage={pagination.currentPage}
            pageSize={pagination.perPage}
            baseUrl={baseUrl}
          />
        </div>
      )}
    </div>
  );
}

/**
 * 渡されたデータがページネーション形式かどうかをチェックする型ガード関数
 */
function isPaginatedResult(
  data: PostFrontmatter[] | PaginatedResult<PostFrontmatter>
): data is PaginatedResult<PostFrontmatter> {
  return (data as PaginatedResult<PostFrontmatter>).meta !== undefined;
}