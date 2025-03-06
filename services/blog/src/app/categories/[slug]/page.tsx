import React from "react";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";
import { PaginatedResult, PostFrontmatter } from "@/types";
import { Container, Section } from "@/components/layout/Container";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { PostList } from "@/components/blog/PostList";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { TagCloud } from "@/components/blog/TagCloud";

// 動的メタデータの生成
export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const category = await prisma.category.findUnique({
    where: { slug: params.slug },
  });

  if (!category) {
    return {
      title: "カテゴリが見つかりません",
      description: "お探しのカテゴリは見つかりませんでした。",
    };
  }

  return {
    title: category.name,
    description: category.description || `${category.name}に関する記事一覧です。`,
  };
}

// 静的パラメータの生成
export async function generateStaticParams() {
  const categories = await prisma.category.findMany({
    select: { slug: true },
  });

  return categories.map((category: { slug: string }) => ({
    slug: category.slug,
  }));
}

export const revalidate = 60; // 1分ごとに再検証

interface CategoryDetailPageProps {
  params: { slug: string };
  searchParams: { page?: string };
}

/**
 * カテゴリ詳細ページ
 */
export default async function CategoryDetailPage({
  params,
  searchParams,
}: CategoryDetailPageProps) {
  // カテゴリのパラメータの型を明示的に定義
  type CategoryType = {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    createdAt: Date;
    updatedAt: Date;
  };
  const currentPage = Number(searchParams.page) || 1;
  const pageSize = 9;

  // カテゴリの取得
  const category: CategoryType | null = await prisma.category.findUnique({
    where: { slug: params.slug },
  });

  // カテゴリが見つからない場合は404ページを表示
  if (!category) {
    notFound();
  }

  // カテゴリに関連するタグの取得
  const relatedTags = await prisma.tag.findMany({
    where: {
      posts: {
        some: {
          status: "PUBLISHED",
          categories: {
            some: {
              id: category.id,
            },
          },
        },
      },
    },
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
    take: 20,
  });

  // 投稿の総数を取得
  const totalPosts = await prisma.post.count({
    where: {
      status: "PUBLISHED",
      categories: {
        some: {
          id: category.id,
        },
      },
    },
  });

  // カテゴリに関連する投稿の取得（ページネーション付き）
  const posts = await prisma.post.findMany({
    where: {
      status: "PUBLISHED",
      categories: {
        some: {
          id: category.id,
        },
      },
    },
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

  return (
    <>
      <Header />
      
      <main>
        <Section className="bg-accent/30 py-12">
          <Container>
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="text-3xl font-bold tracking-tight mb-4">{category.name}</h1>
              {category.description && (
                <p className="text-lg text-muted-foreground">{category.description}</p>
              )}
              <p className="mt-2">
                <span className="badge bg-primary text-white rounded-full px-3 py-1 text-sm">
                  {totalPosts}件の記事
                </span>
              </p>
            </div>
          </Container>
        </Section>

        <Section>
          <Container>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* メインコンテンツ */}
              <div className="md:col-span-2">
                <PostList
                  posts={paginatedPosts}
                  variant="grid"
                  columns={2}
                  showImage={true}
                  showExcerpt={true}
                  baseUrl={`/categories/${params.slug}`}
                />
              </div>
              
              {/* サイドバー */}
              <div className="space-y-8">
                {/* 関連タグ */}
                {relatedTags.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle>関連タグ</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <TagCloud tags={relatedTags} variant="default" />
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </Container>
        </Section>
      </main>
      
      <Footer />
    </>
  );
}