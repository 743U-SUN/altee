import { Suspense } from 'react';
import Link from 'next/link';
import { Plus, List } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import ArticleList from './components/ArticleList';

export const metadata = {
  title: '記事管理 | 管理パネル',
  description: '記事の管理、作成、編集を行います。',
};

export default function ArticlesPage() {
  return (
    <div className="container py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">記事管理</h1>
          <p className="text-muted-foreground">
            記事の管理、作成、編集を行います。
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/articles/create">
            <Plus className="mr-2 h-4 w-4" />
            新規記事作成
          </Link>
        </Button>
      </div>
      
      <Separator className="mb-6" />
      
      <Suspense fallback={<ArticleListSkeleton />}>
        <ArticleList />
      </Suspense>
    </div>
  );
}

function ArticleListSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row gap-4">
        <Skeleton className="h-10 w-full" />
        <div className="flex gap-2">
          <Skeleton className="h-10 w-[150px]" />
          <Skeleton className="h-10 w-16" />
        </div>
      </div>
      
      <div className="overflow-x-auto rounded-md border">
        <table className="w-full divide-y divide-border">
          <thead className="bg-secondary">
            <tr>
              <th className="px-4 py-3 text-left">
                <Skeleton className="h-4 w-20" />
              </th>
              <th className="px-4 py-3 text-left">
                <Skeleton className="h-4 w-24" />
              </th>
              <th className="px-4 py-3 text-left">
                <Skeleton className="h-4 w-20" />
              </th>
              <th className="px-4 py-3 text-left">
                <Skeleton className="h-4 w-16" />
              </th>
              <th className="px-4 py-3 text-left">
                <Skeleton className="h-4 w-16" />
              </th>
              <th className="px-4 py-3 text-left">
                <Skeleton className="h-4 w-16" />
              </th>
              <th className="px-4 py-3 text-right">
                <Skeleton className="h-4 w-20 ml-auto" />
              </th>
            </tr>
          </thead>
          <tbody className="bg-background divide-y divide-border">
            {Array.from({ length: 5 }).map((_, index) => (
              <tr key={index}>
                <td className="px-4 py-3">
                  <Skeleton className="h-6 w-16" />
                </td>
                <td className="px-4 py-3">
                  <Skeleton className="h-6 w-full max-w-[200px] mb-1" />
                  <Skeleton className="h-4 w-3/4 max-w-[150px]" />
                </td>
                <td className="px-4 py-3">
                  <Skeleton className="h-6 w-16" />
                </td>
                <td className="px-4 py-3">
                  <Skeleton className="h-6 w-20" />
                </td>
                <td className="px-4 py-3">
                  <Skeleton className="h-6 w-24" />
                </td>
                <td className="px-4 py-3">
                  <Skeleton className="h-6 w-24" />
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex justify-end gap-2">
                    <Skeleton className="h-8 w-8 rounded-md" />
                    <Skeleton className="h-8 w-8 rounded-md" />
                    <Skeleton className="h-8 w-8 rounded-md" />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <div className="flex items-center justify-between">
        <Skeleton className="h-4 w-32" />
        <div className="flex gap-2">
          <Skeleton className="h-8 w-16" />
          <Skeleton className="h-8 w-16" />
        </div>
      </div>
    </div>
  );
}
