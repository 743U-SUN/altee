'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { ChevronLeft, Edit, Globe, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import PreviewRenderer from '../../components/PreviewRenderer';
import { getArticleByIdAction, updateArticleStatusAction } from '@/lib/actions/article-actions';
// ArticleStatus型の定義
type ArticleStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';

// 記事データの型定義
interface ArticleData {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string | null;
  featuredImage: string | null;
  status: ArticleStatus;
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

export default function PreviewArticlePage() {
  const params = useParams();
  const router = useRouter();
  const articleId = params.id as string;
  
  const [article, setArticle] = useState<ArticleData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [publishing, setPublishing] = useState(false);
  
  // 記事データの取得
  useEffect(() => {
    const fetchArticle = async () => {
      try {
        const result = await getArticleByIdAction(articleId);
        
        if (result.success && result.data) {
          setArticle(result.data);
        } else {
          throw new Error(result.error || '記事の取得に失敗しました');
        }
      } catch (error) {
        console.error('記事取得エラー:', error);
        setError(error instanceof Error ? error.message : '不明なエラーが発生しました');
        toast.error(error instanceof Error ? error.message : '不明なエラーが発生しました');
      } finally {
        setLoading(false);
      }
    };
    
    fetchArticle();
  }, [articleId]);
  
  // 記事の公開
  const handlePublish = async () => {
    try {
      setPublishing(true);
      
      const result = await updateArticleStatusAction(articleId, 'PUBLISHED');
      
      if (result.success) {
        toast.success('記事を公開しました');
        
        // 記事データを再取得
        const articleResult = await getArticleByIdAction(articleId);
        if (articleResult.success && articleResult.data) {
          setArticle(articleResult.data);
        }
      } else {
        throw new Error(result.error || '記事の公開に失敗しました');
      }
    } catch (error) {
      console.error('記事公開エラー:', error);
      toast.error(error instanceof Error ? error.message : '記事の公開に失敗しました');
    } finally {
      setPublishing(false);
    }
  };
  
  // 公開ページへのリンク取得
  const getPublicLink = () => {
    if (!article || !article.slug) return '';
    return `/article/${article.slug}`;
  };
  
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
              <h1 className="text-2xl font-bold tracking-tight">記事のプレビュー</h1>
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
            <h1 className="text-2xl font-bold tracking-tight">記事のプレビュー</h1>
          </div>
          {!loading && article && (
            <p className="text-muted-foreground">
              「{article.title}」のプレビューを表示しています。
            </p>
          )}
        </div>
        
        {!loading && article && (
          <div className="flex gap-2">
            <Button variant="outline" asChild>
              <Link href={`/admin/articles/edit/${article.id}`}>
                <Edit className="mr-2 h-4 w-4" />
                編集
              </Link>
            </Button>
            
            {article.status === 'PUBLISHED' ? (
              <Button variant="default" asChild>
                <Link href={getPublicLink()} target="_blank">
                  <Globe className="mr-2 h-4 w-4" />
                  公開ページを表示
                </Link>
              </Button>
            ) : (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button disabled={publishing}>
                    {publishing ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        公開中...
                      </>
                    ) : (
                      <>
                        <Globe className="mr-2 h-4 w-4" />
                        公開する
                      </>
                    )}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>記事を公開しますか？</AlertDialogTitle>
                    <AlertDialogDescription>
                      この操作により記事が公開され、一般に閲覧可能になります。
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>キャンセル</AlertDialogCancel>
                    <AlertDialogAction onClick={handlePublish}>
                      公開する
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>
        )}
      </div>
      
      <Separator className="mb-8" />
      
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-muted-foreground">読み込み中...</p>
          </div>
        </div>
      ) : article ? (
        <div className="mb-8 bg-background rounded-lg border shadow-sm">
          <PreviewRenderer article={article} />
        </div>
      ) : null}
    </div>
  );
}