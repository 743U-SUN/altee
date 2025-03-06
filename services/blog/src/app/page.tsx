import React from "react";
import Image from "next/image";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Container, Section, HeroContainer } from "@/components/layout/Container";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { FeaturedPosts } from "@/components/blog/FeaturedPosts";
import { PostList } from "@/components/blog/PostList";
import { CategoryList } from "@/components/blog/CategoryList";
import { TagCloud } from "@/components/blog/TagCloud";
import { Button } from "@/components/ui/Button";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";

export const revalidate = 60; // 1分ごとに再検証

/**
 * ホームページ
 */
export default async function Home() {
  // 特集記事を取得（featured=trueの記事）
  const featuredPosts = await prisma.post.findMany({
    where: {
      status: "PUBLISHED",
      featured: true,
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
    take: 5,
  });

  // 最新記事を取得
  const latestPosts = await prisma.post.findMany({
    where: {
      status: "PUBLISHED",
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
    take: 6,
  });

  // カテゴリーを取得
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

  // タグを取得
  const tags = await prisma.tag.findMany({
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

  return (
    <>
      <Header />
      
      <main>
        {/* ヒーローセクション */}
        <HeroContainer className="bg-accent">
          <Container>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <div className="order-2 md:order-1">
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-4">
                  最新の技術情報を<br />お届けします
                </h1>
                <p className="text-xl text-muted-foreground mb-6">
                  プログラミング、Web開発、AI、デザインなど、さまざまな技術トピックを扱うブログです。
                </p>
                <div className="flex flex-wrap gap-4">
                  {/* ButtonLink コンポーネントを使用 */}
                  <ButtonLink href="/posts" size="lg">
                    記事一覧を見る
                  </ButtonLink>
                  <ButtonLink href="/categories" variant="outline" size="lg">
                    カテゴリから探す
                  </ButtonLink>
                </div>
              </div>
              <div className="order-1 md:order-2 flex justify-center">
                <div className="relative w-full max-w-md aspect-square">
                  <Image
                    src="/images/hero-image.jpg"
                    alt="ブログのヒーロー画像"
                    fill
                    className="object-cover rounded-lg shadow-lg"
                    priority
                  />
                </div>
              </div>
            </div>
          </Container>
        </HeroContainer>

        {/* 特集記事セクション */}
        {featuredPosts.length > 0 && (
          <Section>
            <Container>
              <FeaturedPosts
                posts={featuredPosts}
                title="注目の記事"
                description="編集部が厳選した記事をご紹介します"
                layout="hero"
              />
            </Container>
          </Section>
        )}

        {/* 最新記事セクション */}
        <Section className="bg-background">
          <Container>
            <h2 className="text-3xl font-bold tracking-tight mb-8">最新の記事</h2>
            <PostList
              posts={latestPosts}
              variant="grid"
              columns={3}
              showImage={true}
              showExcerpt={true}
              className="mb-8"
            />
            <div className="flex justify-center">
              {/* ButtonLink コンポーネントを使用 */}
              <ButtonLink href="/posts">
                すべての記事を見る
              </ButtonLink>
            </div>
          </Container>
        </Section>

        {/* カテゴリとタグセクション */}
        <Section className="bg-accent/50">
          <Container>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              {/* カテゴリリスト */}
              <Card>
                <CardHeader>
                  <CardTitle>カテゴリ</CardTitle>
                </CardHeader>
                <CardContent>
                  <CategoryList categories={categories} variant="compact" />
                  <div className="mt-4 text-right">
                    <Link href="/categories" className="text-primary hover:underline text-sm">
                      すべてのカテゴリを見る →
                    </Link>
                  </div>
                </CardContent>
              </Card>

              {/* タグクラウド */}
              <Card>
                <CardHeader>
                  <CardTitle>人気のタグ</CardTitle>
                </CardHeader>
                <CardContent>
                  <TagCloud tags={tags} variant="default" showCount={true} />
                  <div className="mt-4 text-right">
                    <Link href="/tags" className="text-primary hover:underline text-sm">
                      すべてのタグを見る →
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </div>
          </Container>
        </Section>

        {/* CTAセクション */}
        <Section>
          <Container size="md" className="text-center">
            <h2 className="text-3xl font-bold tracking-tight mb-4">ニュースレターを購読する</h2>
            <p className="text-xl text-muted-foreground mb-8">
              最新の記事やお得な情報を定期的にお届けします。
            </p>
            <form className="flex flex-col sm:flex-row gap-2 max-w-md mx-auto">
              <input
                type="email"
                placeholder="メールアドレス"
                className="flex-1 px-4 py-2 rounded-md border border-input"
                required
              />
              <Button type="submit">購読する</Button>
            </form>
          </Container>
        </Section>
      </main>

      <Footer />
    </>
  );
}