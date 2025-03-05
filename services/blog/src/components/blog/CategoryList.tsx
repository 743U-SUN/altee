import React from "react";
import Link from "next/link";
import { CategoryWithPosts } from "@/types";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/utils";

interface CategoryListProps {
  categories: CategoryWithPosts[];
  variant?: "default" | "compact" | "grid" | "inline";
  className?: string;
}

/**
 * カテゴリリストコンポーネント
 * 様々な表示バリエーションに対応
 */
export function CategoryList({
  categories,
  variant = "default",
  className = "",
}: CategoryListProps) {
  // カテゴリがない場合
  if (!categories.length) {
    return <p className="text-center text-muted-foreground py-4">カテゴリがありません。</p>;
  }

  // インラインバリアント（バッジのリスト）
  if (variant === "inline") {
    return (
      <div className={cn("flex flex-wrap gap-2", className)}>
        {categories.map((category) => (
          <Link key={category.id} href={`/categories/${category.slug}`}>
            <Badge variant="secondary" interactive={true}>
              {category.name}
              {category._count?.posts !== undefined && (
                <span className="ml-1 text-xs">({category._count.posts})</span>
              )}
            </Badge>
          </Link>
        ))}
      </div>
    );
  }

  // コンパクトバリアント（シンプルなリスト）
  if (variant === "compact") {
    return (
      <ul className={cn("space-y-1", className)}>
        {categories.map((category) => (
          <li key={category.id}>
            <Link
              href={`/categories/${category.slug}`}
              className="text-sm hover:text-primary transition-colors flex items-center justify-between"
            >
              <span>{category.name}</span>
              {category._count?.posts !== undefined && (
                <Badge variant="secondary" size="sm">
                  {category._count.posts}
                </Badge>
              )}
            </Link>
          </li>
        ))}
      </ul>
    );
  }

  // グリッドバリアント
  if (variant === "grid") {
    return (
      <div className={cn("grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4", className)}>
        {categories.map((category) => (
          <CategoryCard key={category.id} category={category} />
        ))}
      </div>
    );
  }

  // デフォルトバリアント（カードのリスト）
  return (
    <div className={cn("space-y-4", className)}>
      {categories.map((category) => (
        <CategoryCard key={category.id} category={category} />
      ))}
    </div>
  );
}

interface CategoryCardProps {
  category: CategoryWithPosts;
  className?: string;
}

/**
 * カテゴリカードコンポーネント
 */
function CategoryCard({ category, className = "" }: CategoryCardProps) {
  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardHeader>
        <CardTitle>
          <Link
            href={`/categories/${category.slug}`}
            className="hover:text-primary transition-colors"
          >
            {category.name}
          </Link>
        </CardTitle>
      </CardHeader>
      {category.description && (
        <CardContent>
          <p className="text-sm text-muted-foreground">{category.description}</p>
        </CardContent>
      )}
      <CardFooter>
        <div className="flex items-center justify-between w-full text-sm">
          <Badge variant="secondary">
            {category._count?.posts || category.posts.length} 記事
          </Badge>
          <Link
            href={`/categories/${category.slug}`}
            className="text-primary hover:underline"
          >
            すべて見る →
          </Link>
        </div>
      </CardFooter>
    </Card>
  );
}