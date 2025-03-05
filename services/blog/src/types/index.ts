import { Post, User, Category, Tag, Comment, Media, PostStatus, CommentStatus, Analytics, SEO } from "@prisma/client";

// 基本的な型定義
export type { Post, User, Category, Tag, Comment, Media, PostStatus, CommentStatus, Analytics, SEO };

// 拡張型定義
export type PostWithRelations = Post & {
  author?: User | null;
  categories?: Category[];
  tags?: Tag[];
  comments?: Comment[];
  media?: Media[];
  analytics?: Analytics | null;
  seo?: SEO | null;
};

export type CategoryWithPosts = Category & {
  posts: Post[];
  _count?: {
    posts: number;
  };
};

export type TagWithPosts = Tag & {
  posts: Post[];
  _count?: {
    posts: number;
  };
};

export type CommentWithAuthor = Comment & {
  author?: User | null;
  replies?: CommentWithAuthor[];
};

// フロントエンド用の簡略化された型
export type PostFrontmatter = {
  id: string;
  title: string;
  slug: string;
  excerpt?: string | null;
  status: PostStatus;
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
  status?: PostStatus;
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