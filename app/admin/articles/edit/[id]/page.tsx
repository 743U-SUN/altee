'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { ChevronLeft, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import ArticleForm from '../../components/ArticleForm';
import { toast } from 'sonner';
import { getArticleByIdAction } from '@/lib/actions/article-actions';

// 記事データの型定義
interface ArticleData {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string | null;
  featuredImage: string | null;
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  publishedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  authorId: string;
  author: {
    id: string;
    user: {
      id: string;
      name: string | null;
    };
  };
  categories: {
    articleId: string;
    categoryId: string;
    category: {
      id: string;
      name: string;
    };
  }[];
  tags: {
    articleId: string;
    tagId: string;
    tag: {
      id: string;
      name: string;
      slug: string;
    };
  }[];
}

export default function EditArticlePage() {
  const params = useParams();
  const router = useRouter();
  const articleId = params.id as string;
  
  const [article, setArticle] = useState<ArticleData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // 記事の取得
  useEffect(() => {
    const fetchData = async () => {
      try {
        // 記事データの取得
        const result = await getArticleByIdAction(articleId);
        
        if (result.success && result.data) {
          setArticle(result.data);
        } else {
          throw new Error(result.error || '記事の取得に失敗しました');
        }
      } catch (error) {
        console.error('データ取得エラー:', error);
        setError(error instanceof Error ? error.message : '不明なエラーが発生しました');
        toast.error(error instanceof Error ? error.message : '不明なエラーが発生しました');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [articleId]);
  
  // エラー状態の表示
  if (error) {
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
              <h1 className="text-2xl font-bold tracking-tight">記事の編集</h1>
            </div>
          </div>
        </div>
        
        <Separator className="mb-6" />
        
        <div className="flex flex-col items-center justify-center py-12 gap-4">
          <p className="text-destructive text-lg">{error}</p>
          <Button onClick={() => router.push('/admin/articles')}>
            記事一覧に戻る
          </Button>
        </div>
      </div>
    );
  }
  
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
            <h1 className="text-2xl font-bold tracking-tight">記事の編集</h1>
          </div>
          {!loading && article && (
            <p className="text-muted-foreground">
              「{article.title}」を編集しています。
            </p>
          )}
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
        <ArticleForm initialData={article} />
      )}
    </div>
  );
}