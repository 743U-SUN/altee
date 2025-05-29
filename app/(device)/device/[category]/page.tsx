import { notFound, redirect } from "next/navigation";
import { getPublicCategories } from "@/lib/actions/public-product-actions";

export default async function CategoryPage({
  params,
}: {
  params: { category: string };
}) {
  const categories = await getPublicCategories();
  const category = categories.find((c) => c.slug === params.category);

  if (!category) {
    notFound();
  }

  // メインのデバイスページにカテゴリパラメータ付きでリダイレクト
  redirect(`/device?category=${params.category}`);
}
