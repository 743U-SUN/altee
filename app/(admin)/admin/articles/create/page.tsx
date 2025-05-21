'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ChevronLeft, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import ArticleForm from '../components/ArticleForm';
import { toast } from 'sonner';

export default function CreateArticlePage() {
  const [authors, setAuthors] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // 著者一覧の取得
  useEffect(() => {
    const fetchAuthors = async () => {
      try {
        const response = await fetch('/api/authors');
        if (!response.ok) {
          throw new Error('著者の取得に失敗しました');
        }
        const data = await response.json();
        setAuthors(data);
      } catch (error) {
        console.error('著者取得エラー:', error);
        toast.error('著者の取得に失敗しました');
      } finally {
        setLoading(false);
      }
    };
    
    fetchAuthors();
  }, []);
  
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
      
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-muted-foreground">読み込み中...</p>
          </div>
        </div>
      ) : (
        <ArticleForm authors={authors} />
      )}
    </div>
  );
}
