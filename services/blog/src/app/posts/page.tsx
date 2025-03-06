import React from "react";
import { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { PaginatedResult, PostFrontmatter } from "@/types";
import { Container, Section } from "@/components/layout/Container";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { PostList } from "@/components/blog/PostList";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { CategoryList } from "@/components/blog/CategoryList";
import { TagCloud } from "@/components/blog/TagCloud";

export const metadata: Metadata = {
  title: "記事一覧",
  description: "ブログの全記事一覧です。",
};

export const revalidate = 60; // 1分ごとに再検証

interface PostsPageProps {
  searchParams: {
    page?: string;
    category?: string;
    tag?: string;
    q?: string;
  };
}

/**
 * 記事一覧ページ
 */
export default async function PostsPage({ searchParams }: PostsPageProps) {
  // ページネーションと検索パラメータの取得
  const currentPage = Number(searchParams.page) || 1;
  const pageSize = 12;
  const categorySlug = searchParams.category;
  const tagSlug = searchParams.tag;
  const searchQuery = searchParams.q;

  // 検索条件の構築
  const where: any = {
    status: "PUBLISHED",
  };

  // カテゴリによるフィルタリング
  if (categorySlug) {
    where.categories = {
      some: {
        slug: categorySlug,
      },
    };
  }

  // タグによるフィルタリング
  if (tagSlug) {
    where.tags = {
      some: {
        slug: tagSlug,
      },
    };
  }

  // 検索キーワードによるフィルタリング
  if (searchQuery) {
    where.OR = [
      { title: { contains: searchQuery, mode: "insensitive" } },
      { content: { contains: searchQuery, mode: "insensitive" } },
    ];
  }

  // 投稿の総数を取得
  const totalPosts = await prisma.post.count({ where });

  // 投稿データを取得（ページネーション付き）
  const posts = await prisma.post.findMany({
    where,
    include: {
      author: {
        select: {
          id: true,
          name: true,
          image: true,
        },
      },
      categories: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },
      tags: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },
    },
    orderBy: {
      publishedAt: "desc",
    },
    skip: (currentPage - 1) * pageSize,
    take: pageSize,
  });

  // PaginatedResult形式にデータを整形
  const paginatedPosts: PaginatedResult<PostFrontmatter> = {
    data: posts as PostFrontmatter[],
    meta: {
      total: totalPosts,
      pageCount: Math.ceil(totalPosts / pageSize),
      currentPage,
      perPage: pageSize,
    },
  };

  // カテゴリデータを取得
  const categories = await prisma.category.findMany({
    include: {
      _count: {
        select: {
          posts: true,
        },
      },
    },
    orderBy: {
      posts: {
        _count: "desc",
      },
    },
    take: 10,
  });

  // タグデータを取得
  const tags = await prisma.tag.findMany({
    include: {
      _count: {
        select: {
          posts: true,
        },
      },
      // posts関連を空配列として追加
      posts: {
        where: {
          status: "PUBLISHED"
        },
        select: {
          id: true
        },
        take: 0 // 実際のデータは取得せず型のみ満たす
      }
    },
    orderBy: {
      posts: {
        _count: "desc",
      },
    },
    take: 20,
  });

  // 検索条件に応じたベースURLを生成
  let baseUrl = "/posts";
  const urlParams = new URLSearchParams();
  
  if (categorySlug) urlParams.append("category", categorySlug);
  if (tagSlug) urlParams.append("tag", tagSlug);
  if (searchQuery) urlParams.append("q", searchQuery);
  
  const queryString = urlParams.toString();
  if (queryString) baseUrl += `?${queryString}`;

  // ページタイトルの生成
  let pageTitle = "記事一覧";
  if (categorySlug) {
    const category = await prisma.category.findUnique({
      where: { slug: categorySlug },
    });
    if (category) pageTitle = `${category.name}の記事`;
  } else if (tagSlug) {
    const tag = await prisma.tag.findUnique({
      where: { slug: tagSlug },
    });
    if (tag) pageTitle = `#${tag.name}の記事`;
  } else if (searchQuery) {
    pageTitle = `"${searchQuery}"の検索結果`;
  }

  return (
    <>
      <Header />
      
      <main>
        <Section>
          <Container>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* メインコンテンツ */}
              <div className="md:col-span-2">
                <h1 className="text-3xl font-bold tracking-tight mb-6">{pageTitle}</h1>
                
                {/* 検索結果のサマリー表示 */}
                {(categorySlug || tagSlug || searchQuery) && (
                  <div className="bg-accent/30 rounded-lg p-4 mb-6">
                    <p className="text-sm text-muted-foreground">
                      {totalPosts}件の記事が見つかりました
                      {categorySlug && " - カテゴリ: " + categorySlug}
                      {tagSlug && " - タグ: #" + tagSlug}
                      {searchQuery && ` - 検索: "${searchQuery}"`}
                    </p>
                  </div>
                )}
                
                {/* 記事リスト */}
                <PostList
                  posts={paginatedPosts}
                  variant="default"
                  showImage={true}
                  showExcerpt={true}
                  baseUrl={baseUrl}
                />
              </div>
              
              {/* サイドバー */}
              <div className="space-y-8">
                {/* カテゴリリスト */}
                <Card>
                  <CardHeader>
                    <CardTitle>カテゴリ</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CategoryList categories={categories} variant="compact" />
                  </CardContent>
                </Card>
                
                {/* タグクラウド */}
                <Card>
                  <CardHeader>
                    <CardTitle>人気のタグ</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <TagCloud tags={tags} variant="default" />
                  </CardContent>
                </Card>
              </div>
            </div>
          </Container>
        </Section>
      </main>
      
      <Footer />
    </>
  );
}