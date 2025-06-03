'use client';

import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import ArticleForm from '../components/ArticleForm';

export default function CreateArticlePage() {
  
  return (
    <div className="container py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/admin/articles">
                <ChevronLeft className="h-4 w-4" />
              </Link>
            </Button>
            <h1 className="text-2xl font-bold tracking-tight">新規記事作成</h1>
          </div>
          <p className="text-muted-foreground">
            新しい記事を作成します。
          </p>
        </div>
      </div>
      
      <Separator className="mb-6" />
      
      <ArticleForm />
    </div>
  );
}