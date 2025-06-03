'use client';

import { useState, useEffect, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';
import { Edit, Eye, Trash2, Filter, Search, MoreHorizontal, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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

import { getArticlesAction, deleteArticleAction, updateArticleStatusAction } from '@/lib/actions/article-actions';

// ArticleStatus型の定義
type ArticleStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';

interface Article {
  id: string;
  title: string;
  slug: string;
  status: ArticleStatus;
  publishedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  author: {
    user: {
      name: string | null;
      id: string;
      email: string;
    };
    id: string;
  };
  categories: {
    category: {
      name: string;
      id: string;
    };
    categoryId: string;
    articleId: string;
  }[];
}

interface ArticleListProps {
  initialArticles?: Article[];
}

export default function ArticleList({ initialArticles = [] }: ArticleListProps) {
  const router = useRouter();
  const [articles, setArticles] = useState<Article[]>(initialArticles);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<ArticleStatus | 'ALL'>('ALL');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [pageSize] = useState(10);
  const [isPending, startTransition] = useTransition();
  
  // 記事一覧の取得
  const fetchArticles = async () => {
    try {
      setLoading(true);
      
      const params: any = {
        page,
        limit: pageSize,
      };
      
      if (searchTerm) {
        params.search = searchTerm;
      }
      
      if (statusFilter !== 'ALL') {
        params.status = statusFilter;
      }
      
      const result = await getArticlesAction(params);
      
      if (!result.success) {
        throw new Error(result.error || '記事の取得に失敗しました');
      }
      
      setArticles(result.data || []);
      setTotalPages(result.pagination?.totalPages || 1);
    } catch (error) {
      console.error('記事取得エラー:', error);
      toast.error('記事の取得に失敗しました');
    } finally {
      setLoading(false);
    }
  };
  
  // 初回読み込みと検索/フィルター変更時
  useEffect(() => {
    fetchArticles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, statusFilter]);
  
  // 記事削除処理
  const handleDeleteArticle = async (id: string) => {
    startTransition(async () => {
      try {
        const result = await deleteArticleAction(id);
        
        if (!result.success) {
          throw new Error(result.error || '記事の削除に失敗しました');
        }
        
        // 削除成功後、一覧を更新
        setArticles(articles.filter(article => article.id !== id));
        toast.success('記事を削除しました');
      } catch (error) {
        console.error('記事削除エラー:', error);
        toast.error('記事の削除に失敗しました');
      }
    });
  };
  
  // ステータス変更処理
  const handleChangeStatus = async (id: string, status: ArticleStatus) => {
    startTransition(async () => {
      try {
        const result = await updateArticleStatusAction(id, status);
        
        if (!result.success) {
          throw new Error(result.error || 'ステータスの変更に失敗しました');
        }
        
        // ステータス変更成功後、一覧を更新
        setArticles(
          articles.map(article => 
            article.id === id ? { ...article, status } : article
          )
        );
        
        toast.success('ステータスを変更しました');
      } catch (error) {
        console.error('ステータス変更エラー:', error);
        toast.error('ステータスの変更に失敗しました');
      }
    });
  };
  
  // 検索実行
  const handleSearch = () => {
    setPage(1); // 検索時にページを1に戻す
    fetchArticles();
  };
  
  // ステータスに応じたバッジ表示
  const getStatusBadge = (status: ArticleStatus) => {
    switch (status) {
      case 'PUBLISHED':
        return <Badge variant="default">公開中</Badge>;
      case 'DRAFT':
        return <Badge variant="outline">下書き</Badge>;
      case 'ARCHIVED':
        return <Badge variant="secondary">アーカイブ</Badge>;
      default:
        return null;
    }
  };
  
  return (
    <div className="space-y-4">
      {/* 検索&フィルター */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="記事を検索"
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          />
        </div>
        <div className="flex gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="w-[150px]">
                <Filter className="h-4 w-4 mr-2" />
                {statusFilter === 'ALL' 
                  ? 'すべて' 
                  : statusFilter === 'PUBLISHED' 
                    ? '公開中'
                    : statusFilter === 'DRAFT'
                      ? '下書き'
                      : 'アーカイブ'
                }
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => setStatusFilter('ALL')}>
                すべて
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter('PUBLISHED')}>
                公開中
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter('DRAFT')}>
                下書き
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter('ARCHIVED')}>
                アーカイブ
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button onClick={handleSearch} disabled={isPending}>検索</Button>
        </div>
      </div>
      
      {/* 記事テーブル */}
      <div className="overflow-x-auto rounded-md border">
        <table className="w-full divide-y divide-border">
          <thead className="bg-secondary">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                ステータス
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                タイトル
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                カテゴリ
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                著者
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                公開日
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                更新日
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                アクション
              </th>
            </tr>
          </thead>
          <tbody className="bg-background divide-y divide-border">
            {loading || isPending ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center">
                  <div className="flex justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                </td>
              </tr>
            ) : articles.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">
                  記事がありません
                </td>
              </tr>
            ) : (
              articles.map((article) => (
                <tr key={article.id}>
                  <td className="px-4 py-3 whitespace-nowrap">
                    {getStatusBadge(article.status)}
                  </td>
                  <td className="px-4 py-3">
                    <div className="line-clamp-1 font-medium">{article.title}</div>
                    <div className="text-xs text-muted-foreground">{article.slug}</div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {article.categories.map((cat, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {cat.category.name}
                        </Badge>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    {article.author.user.name || 'Unknown'}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm">
                    {article.publishedAt
                      ? format(article.publishedAt, 'yyyy/MM/dd HH:mm', { locale: ja })
                      : '-'}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm">
                    {format(new Date(article.updatedAt), 'yyyy/MM/dd HH:mm', { locale: ja })}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => router.push(`/admin/articles/edit/${article.id}`)}
                        title="編集"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => router.push(`/admin/articles/preview/${article.id}`)}
                        title="プレビュー"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            title="その他"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {article.status !== 'PUBLISHED' && (
                            <DropdownMenuItem
                              onClick={() => handleChangeStatus(article.id, 'PUBLISHED')}
                              disabled={isPending}
                            >
                              公開する
                            </DropdownMenuItem>
                          )}
                          {article.status !== 'DRAFT' && (
                            <DropdownMenuItem
                              onClick={() => handleChangeStatus(article.id, 'DRAFT')}
                              disabled={isPending}
                            >
                              下書きに戻す
                            </DropdownMenuItem>
                          )}
                          {article.status !== 'ARCHIVED' && (
                            <DropdownMenuItem
                              onClick={() => handleChangeStatus(article.id, 'ARCHIVED')}
                              disabled={isPending}
                            >
                              アーカイブする
                            </DropdownMenuItem>
                          )}
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <DropdownMenuItem
                                className="text-destructive"
                                onSelect={(e) => e.preventDefault()}
                              >
                                削除する
                              </DropdownMenuItem>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>
                                  記事を削除しますか？
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                  この操作は元に戻せません。記事「{article.title}」が完全に削除されます。
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>キャンセル</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDeleteArticle(article.id)}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                  disabled={isPending}
                                >
                                  削除する
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      
      {/* ページネーション */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          全{articles.length}件（{page} / {totalPages}ページ）
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(Math.max(1, page - 1))}
            disabled={page === 1 || loading || isPending}
          >
            前へ
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(Math.min(totalPages, page + 1))}
            disabled={page === totalPages || loading || isPending}
          >
            次へ
          </Button>
        </div>
      </div>
    </div>
  );
}