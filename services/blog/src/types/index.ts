// 型をPrismaClienからインポートせず、独自に定義する
import { Prisma } from "@prisma/client";

// 拡張型定義
export type PostWithRelations = {
  id: string;
  title: string;
  slug: string;
  content: string | null;
  status: string;
  featured: boolean;
  publishedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  viewCount: number;
  author?: {
    id: string;
    name: string | null;
    image: string | null;
  } | null;
  categories?: {
    id: string;
    name: string;
    slug: string;
  }[];
  tags?: {
    id: string;
    name: string;
    slug: string;
  }[];
  media?: any[];
  analytics?: any | null;
  seo?: any | null;
};

export type CategoryWithPosts = {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  posts: any[];
  _count?: {
    posts: number;
  };
};

export type TagWithPosts = {
  id: string;
  name: string;
  slug: string;
  posts: any[];
  _count?: {
    posts: number;
  };
};

export type CommentWithAuthor = {
  id: string;
  content: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
  author?: any | null;
  replies?: any[];
};

// フロントエンド用の簡略化された型
export type PostFrontmatter = {
  id: string;
  title: string;
  slug: string;
  excerpt?: string | null;
  status: string;
  featured: boolean;
  publishedAt?: Date | null;
  createdAt: Date;
  author?: {
    id: string;
    name?: string | null;
    image?: string | null;
  } | null;
  categories?: {
    id: string;
    name: string;
    slug: string;
  }[];
  tags?: {
    id: string;
    name: string;
    slug: string;
  }[];
  viewCount: number;
};

// ページネーション用の型
export type PaginatedResult<T> = {
  data: T[];
  meta: {
    total: number;
    pageCount: number;
    currentPage: number;
    perPage: number;
  };
};

// APIレスポンス型
export type ApiResponse<T = unknown> = {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
};

// 検索パラメータ型
export type SearchParams = {
  q?: string;
  category?: string;
  tag?: string;
  page?: number;
  limit?: number;
  sort?: 'latest' | 'oldest' | 'popular';
  status?: string;
};

// メディアアップロード用の型
export type UploadedFile = {
  id: string;
  filename: string;
  originalName: string;
  path: string;
  mimetype: string;
  size: number;
  url: string;
};