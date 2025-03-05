import React from "react";
import { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { Container, Section } from "@/components/layout/Container";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { CategoryList } from "@/components/blog/CategoryList";

export const metadata: Metadata = {
  title: "カテゴリ一覧",
  description: "すべてのカテゴリを表示します。",
};

export const revalidate = 3600; // 1時間ごとに再検証

/**
 * カテゴリ一覧ページ
 */
export default async function CategoriesPage() {
  // すべてのカテゴリを投稿数と共に取得
  const categories = await prisma.category.findMany({
    include: {
      _count: {
        select: {
          posts: true,
        },
      },
    },
    orderBy: [
      {
        posts: {
          _count: "desc",
        },
      },
      {
        name: "asc",
      },
    ],
  });

  return (
    <>
      <Header />
      
      <main>
        <Section>
          <Container>
            <div className="max-w-4xl mx-auto">
              <h1 className="text-3xl font-bold tracking-tight mb-8">カテゴリ一覧</h1>
              <p className="text-lg text-muted-foreground mb-12">
                興味のあるカテゴリを選択して、関連する記事をご覧ください。
              </p>
              
              {categories.length > 0 ? (
                <CategoryList categories={categories} variant="grid" />
              ) : (
                <p className="text-center py-12">カテゴリがありません。</p>
              )}
            </div>
          </Container>
        </Section>
      </main>
      
      <Footer />
    </>
  );
}