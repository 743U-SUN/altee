import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DeviceIcon } from "@/components/devices/DeviceIcon";
import { ArrowRight, Package, Users } from "lucide-react";

interface CategoryOverviewProps {
  categories: Array<{
    id: string;
    name: string;
    slug: string;
    description: string | null;
    totalProducts: number;
    totalUsers: number;
  }>;
}

export function CategoryOverview({ categories }: CategoryOverviewProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">カテゴリ別商品</h2>
        <Link
          href="/device"
          className="text-sm text-muted-foreground hover:text-primary transition-colors"
        >
          すべて見る
          <ArrowRight className="inline-block ml-1 h-4 w-4" />
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((category) => (
          <Link
            key={category.id}
            href={`/device?category=${category.slug}`}
            className="block group"
          >
            <Card className="h-full transition-all hover:shadow-lg hover:-translate-y-1">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10 text-primary">
                      <DeviceIcon category={category.slug} className="h-6 w-6" />
                    </div>
                    <CardTitle className="text-lg">{category.name}</CardTitle>
                  </div>
                  <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
              </CardHeader>
              <CardContent>
                {category.description && (
                  <p className="text-sm text-muted-foreground mb-4">
                    {category.description}
                  </p>
                )}
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-1">
                    <Package className="h-4 w-4 text-muted-foreground" />
                    <span>{category.totalProducts}商品</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span>{category.totalUsers}人が使用</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
