import React from "react";
import Link from "next/link";
import { getPageRange } from "@/lib/utils";

/**
 * ページネーションコンポーネントのプロパティ型定義
 */
interface PaginationProps {
  totalItems: number;
  currentPage: number;
  pageSize: number;
  siblingCount?: number;
  className?: string;
  baseUrl: string;
}

/**
 * ページネーションコンポーネント
 * 複数ページにわたるコンテンツのナビゲーションを提供
 */
export function Pagination({
  totalItems,
  currentPage,
  pageSize,
  siblingCount = 1,
  className = "",
  baseUrl,
}: PaginationProps) {
  // 総ページ数を計算
  const totalPages = Math.ceil(totalItems / pageSize);
  
  // 表示するページ番号の配列を取得
  const pages = getPageRange(currentPage, totalPages, 5);
  
  // ページが1ページしかない場合はページネーションを表示しない
  if (totalPages <= 1) {
    return null;
  }

  // URLを生成する関数
  const getPageUrl = (page: number) => {
    if (page === 1) {
      // 最初のページは ?page=1 を付けない
      return baseUrl.includes("?") ? baseUrl : `${baseUrl}`;
    }
    // クエリパラメータがすでに存在するかどうかを確認
    const separator = baseUrl.includes("?") ? "&" : "?";
    return `${baseUrl}${separator}page=${page}`;
  };

  return (
    <nav
      role="navigation"
      aria-label="ページネーション"
      className={`flex items-center justify-center space-x-1 ${className}`}
    >
      {/* 前のページボタン */}
      <PaginationLink
        href={getPageUrl(currentPage - 1)}
        disabled={currentPage <= 1}
        aria-label="前のページへ"
      >
        <ChevronLeftIcon className="h-4 w-4" />
        <span className="sr-only">前のページ</span>
      </PaginationLink>

      {/* 最初のページへのリンク（現在のページが4以上の場合に表示） */}
      {currentPage > 3 && (
        <>
          <PaginationLink href={getPageUrl(1)}>1</PaginationLink>
          {currentPage > 4 && (
            <PaginationEllipsis />
          )}
        </>
      )}

      {/* ページ番号のリスト */}
      {pages.map((page) => (
        <PaginationLink
          key={page}
          href={getPageUrl(page)}
          isActive={page === currentPage}
        >
          {page}
        </PaginationLink>
      ))}

      {/* 最後のページへのリンク（現在のページが最後から3ページ以上前の場合に表示） */}
      {currentPage < totalPages - 2 && (
        <>
          {currentPage < totalPages - 3 && (
            <PaginationEllipsis />
          )}
          <PaginationLink href={getPageUrl(totalPages)}>
            {totalPages}
          </PaginationLink>
        </>
      )}

      {/* 次のページボタン */}
      <PaginationLink
        href={getPageUrl(currentPage + 1)}
        disabled={currentPage >= totalPages}
        aria-label="次のページへ"
      >
        <ChevronRightIcon className="h-4 w-4" />
        <span className="sr-only">次のページ</span>
      </PaginationLink>
    </nav>
  );
}

/**
 * ページネーションリンクのプロパティ型定義
 */
interface PaginationLinkProps extends React.ComponentProps<typeof Link> {
  isActive?: boolean;
  disabled?: boolean;
}

/**
 * ページネーションリンクコンポーネント
 */
function PaginationLink({
  children,
  isActive,
  disabled,
  className,
  ...props
}: PaginationLinkProps) {
  // 非アクティブのスタイル
  if (disabled) {
    return (
      <span
        className={`flex h-9 w-9 items-center justify-center rounded-md border border-input bg-background text-sm text-muted-foreground opacity-50 cursor-not-allowed ${className}`}
      >
        {children}
      </span>
    );
  }

  // アクティブページのスタイル
  if (isActive) {
    return (
      <span
        className={`flex h-9 w-9 items-center justify-center rounded-md bg-primary text-primary-foreground text-sm font-medium ${className}`}
      >
        {children}
      </span>
    );
  }

  // 通常のページリンクスタイル
  return (
    <Link
      {...props}
      className={`flex h-9 w-9 items-center justify-center rounded-md border border-input bg-background text-sm hover:bg-accent hover:text-accent-foreground ${className}`}
    >
      {children}
    </Link>
  );
}

/**
 * ページネーション省略記号コンポーネント
 */
function PaginationEllipsis({ className }: { className?: string }) {
  return (
    <span
      className={`flex h-9 w-9 items-center justify-center text-sm text-muted-foreground ${className}`}
    >
      ...
    </span>
  );
}

/**
 * 左向き矢印アイコン
 */
function ChevronLeftIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M15 18l-6-6 6-6" />
    </svg>
  );
}

/**
 * 右向き矢印アイコン
 */
function ChevronRightIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M9 18l6-6-6-6" />
    </svg>
  );
}