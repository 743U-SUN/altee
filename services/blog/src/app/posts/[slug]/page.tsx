import React from "react";
import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/date";
import { calculateReadingTime } from "@/lib/utils";
import { Container, Section } from "@/components/layout/Container";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Badge } from "@/components/ui/Badge";
import { UserAvatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { PostList } from "@/components/blog/PostList";
import { siteConfig } from "@/config/site";
import type { Prisma } from "@prisma/client";

// 型定義
interface PostWithRelations {
  id: string;
  title: string;
  slug: string;
  content: string | null;
  status: string;
  publishedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  viewCount: number;
  author: {
    id: string;
    name: string | null;
    image: string | null;
    email: string;
  } | null;
  categories: {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    createdAt: Date;
    updatedAt: Date;
  }[];
  tags: {
    id: string;
    name: string;
    slug: string;
    createdAt: Date;
    updatedAt: Date;
  }[];
  media: {
    id: string;
    filename: string;
    originalName: string;
    path: string;
    mimetype: string;
    size: number;
    alt: string | null;
    caption: string | null;
    createdAt: Date;
    updatedAt: Date;
    postId: string | null;
  }[];
}

// 動的メタデータの生成
export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const post = await prisma.post.findUnique({
    where: { slug: params.slug },
    include: {
      author: {
        select: {
          name: true,
        },
      },
      seo: true,
    },
  });

  if (!post) {
    return {
      title: "記事が見つかりません",
      description: "お探しの記事は見つかりませんでした。",
    };
  }

  // SEO情報があればそれを使用、なければタイトルと抜粋から生成
  const title = post.seo?.metaTitle || post.title;
  const description = post.seo?.metaDescription || post.excerpt || `${post.title}の記事です。`;
  const ogImage = post.seo?.ogImage || siteConfig.ogImage;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "article",
      publishedTime: post.publishedAt?.toISOString(),
      modifiedTime: post.updatedAt.toISOString(),
      authors: [post.author?.name || siteConfig.author.name],
      images: [ogImage],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
    },
  };
}

// 静的パラメータの生成
export async function generateStaticParams() {
  const posts = await prisma.post.findMany({
    where: { status: "PUBLISHED" },
    select: { slug: true },
  });

  return posts.map((post: { slug: string }) => ({
    slug: post.slug,
  }));
}

export const revalidate = 60; // 1分ごとに再検証

/**
 * 記事詳細ページ
 */
export default async function PostDetailPage({ params }: { params: { slug: string } }) {
  // 記事データの取得
  const post = await prisma.post.findUnique({
    where: {
      slug: params.slug,
      status: "PUBLISHED",
    },
    include: {
      author: true,
      categories: true,
      tags: true,
      media: true,
    },
  }) as PostWithRelations | null;

  // 記事が見つからない場合は404ページを表示
  if (!post) {
    notFound();
  }

  // 関連記事の取得（同じカテゴリの他の記事）
  const categoryIds = post.categories.map((cat) => cat.id);
  const relatedPosts = await prisma.post.findMany({
    where: {
      id: {
        not: post.id,
      },
      status: "PUBLISHED",
      categories: {
        some: {
          id: {
            in: categoryIds,
          },
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
    },
    orderBy: {
      publishedAt: "desc",
    },
    take: 3,
  });

  // 閲覧数のインクリメント（非同期で実行）
  const updateViewCount = async () => {
    await prisma.post.update({
      where: { id: post.id },
      data: { viewCount: { increment: 1 } },
    });
  };
  updateViewCount().catch(console.error);

  // 読了時間の計算
  const readingTime = calculateReadingTime(post.content || "");

  // 投稿日時
  const publishDate = post.publishedAt || post.createdAt;

  // アイキャッチ画像URL（記事に紐づいたメディアがあればそれを使用、なければデフォルト画像）
  const featuredImage = post.media?.find((m) => m.mimetype.startsWith("image/"));
  const imageUrl = featuredImage ? `/uploads/${featuredImage.filename}` : `/images/posts/${post.slug}.jpg`;
  const defaultImageUrl = "/images/post-placeholder.jpg";

  return (
    <>
      <Header />
      
      <main>
        {/* 記事ヘッダー */}
        <Section className="bg-accent/30 py-12">
          <Container size="lg">
            <div className="max-w-3xl mx-auto">
              {/* カテゴリ表示 */}
              {post.categories.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {post.categories.map((category) => (
                    <Link key={category.id} href={`/categories/${category.slug}`}>
                      <Badge>{category.name}</Badge>
                    </Link>
                  ))}
                </div>
              )}
              
              {/* タイトル */}
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight mb-4">
                {post.title}
              </h1>
              
              {/* 投稿メタ情報 */}
              <div className="flex items-center gap-4 text-sm text-muted-foreground mb-8">
                <time dateTime={publishDate.toISOString()}>
                  {formatDate(publishDate)}
                </time>
                <span>•</span>
                <span>{readingTime}分で読めます</span>
                <span>•</span>
                <span>{post.viewCount} views</span>
              </div>
              
              {/* 著者情報 */}
              {post.author && (
                <div className="flex items-center gap-2 mb-8">
                  <UserAvatar
                    src={post.author.image}
                    name={post.author.name || "匿名"}
                    size="md"
                  />
                  <div>
                    <div className="font-medium">{post.author.name || "匿名"}</div>
                    <div className="text-xs text-muted-foreground">
                      {post.author.email}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </Container>
        </Section>
        
        {/* アイキャッチ画像 */}
        <Section className="py-8">
          <Container size="lg">
            <div className="max-w-4xl mx-auto">
              <div className="relative aspect-video rounded-lg overflow-hidden mb-8">
                <Image
                  src={imageUrl}
                  alt={post.title}
                  fill
                  className="object-cover"
                  priority
                  onError={(e) => {
                    // 画像読み込みエラー時にデフォルト画像を表示
                    const target = e.target as HTMLImageElement;
                    target.src = defaultImageUrl;
                  }}
                />
              </div>
            </div>
          </Container>
        </Section>
        
        {/* 記事本文 */}
        <Section className="py-8">
          <Container size="lg">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* メインコンテンツ */}
              <div className="lg:col-span-8 lg:col-start-3">
                {/* 記事の本文 */}
                <div className="blog-content" dangerouslySetInnerHTML={{ __html: post.content || "" }} />
                
                {/* タグ */}
                {post.tags.length > 0 && (
                  <div className="mt-8 pt-4 border-t">
                    <h3 className="text-lg font-medium mb-2">タグ</h3>
                    <div className="flex flex-wrap gap-2">
                      {post.tags.map((tag) => (
                        <Link key={tag.id} href={`/tags/${tag.slug}`}>
                          <Badge>#{tag.name}</Badge>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* シェアボタン - ButtonLink を使用 */}
                <div className="mt-8 pt-4 border-t">
                  <h3 className="text-lg font-medium mb-2">この記事をシェア</h3>
                  <div className="flex gap-2">
                    <ButtonLink
                      href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(post.title)}&url=${encodeURIComponent(
                        `${siteConfig.url}/posts/${post.slug}`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      X/Twitter
                    </ButtonLink>
                    <ButtonLink
                      href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
                        `${siteConfig.url}/posts/${post.slug}`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Facebook
                    </ButtonLink>
                    <ButtonLink
                      href={`https://b.hatena.ne.jp/entry/${encodeURIComponent(
                        `${siteConfig.url}/posts/${post.slug}`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      はてなブックマーク
                    </ButtonLink>
                  </div>
                </div>
              </div>
            </div>
          </Container>
        </Section>
        
        {/* 関連記事 */}
        {relatedPosts.length > 0 && (
          <Section className="bg-accent/30 py-12">
            <Container>
              <h2 className="text-2xl font-bold tracking-tight mb-8">関連記事</h2>
              <PostList
                posts={relatedPosts}
                variant="grid"
                columns={3}
                showImage={true}
                showExcerpt={false}
              />
            </Container>
          </Section>
        )}
      </main>
      
      <Footer />
    </>
  );}