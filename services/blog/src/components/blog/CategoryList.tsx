import React from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/Badge";

interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  _count?: {
    posts: number;
  };
}

interface CategoryListProps {
  categories: Category[];
  variant?: "default" | "compact" | "grid";
  showCount?: boolean;
  className?: string;
}

/**
 * カテゴリ一覧コンポーネント
 */
export function CategoryList({
  categories,
  variant = "default",
  showCount = true,
  className = "",
}: CategoryListProps) {
  if (!categories || categories.length === 0) {
    return <div className="text-muted-foreground">カテゴリがありません</div>;
  }

  // コンパクト表示（リスト形式）
  if (variant === "compact") {
    return (
      <ul className={`space-y-2 ${className}`}>
        {categories.map((category) => (
          <li key={category.id} className="flex items-center justify-between">
            <Link href={`/categories/${category.slug}`} className="hover:underline">
              <Badge className="bg-accent/50 hover:bg-accent text-primary hover:text-primary">
                {category.name}
                {showCount && category._count && (
                  <span className="ml-1 text-xs text-muted-foreground">
                    ({category._count.posts})
                  </span>
                )}
              </Badge>
            </Link>
          </li>
        ))}
      </ul>
    );
  }

  // グリッド表示
  if (variant === "grid") {
    return (
      <div className={`grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 ${className}`}>
        {categories.map((category) => (
          <Link
            key={category.id}
            href={`/categories/${category.slug}`}
            className="bg-card hover:bg-accent/50 border rounded-md p-4 text-center transition-colors"
          >
            <Badge className="mb-2 bg-primary/10 text-primary px-2 py-1">
              {showCount && category._count && (
                <span className="text-xs font-normal">
                  {category._count.posts}件
                </span>
              )}
            </Badge>
            <h3 className="font-medium text-lg">{category.name}</h3>
            {category.description && (
              <p className="text-sm text-muted-foreground mt-2">
                {category.description}
              </p>
            )}
          </Link>
        ))}
      </div>
    );
  }

  // デフォルト表示（横並びバッジ）
  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {categories.map((category) => (
        <Link key={category.id} href={`/categories/${category.slug}`}>
          <Badge className="bg-accent/50 hover:bg-accent text-primary hover:text-primary">
            {category.name}
            {showCount && category._count && (
              <span className="ml-1 text-xs text-muted-foreground">
                ({category._count.posts})
              </span>
            )}
          </Badge>
        </Link>
      ))}
    </div>
  );
}