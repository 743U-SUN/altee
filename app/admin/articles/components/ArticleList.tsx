'use client';

import { useState, useEffect } from 'react';
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

import { ArticleStatus } from '@prisma/client';

interface Article {
  id: string;
  title: string;
  slug: string;
  status: ArticleStatus;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
  author: {
    user: {
      name: string;
    };
  };
  categories: {
    category: {
      name: string;
    };
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
  
  // 記事一覧の取得
  const fetchArticles = async () => {
    try {
      setLoading(true);
      
      // クエリパラメータの構築
      const params = new URLSearchParams();
      params.append('page', page.toString());
      params.append('pageSize', pageSize.toString());
      
      if (searchTerm) {
        params.append('search', searchTerm);
      }
      
      if (statusFilter !== 'ALL') {
        params.append('status', statusFilter);
      }
      
      const response = await fetch(`/api/articles?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error('記事の取得に失敗しました');
      }
      
      const data = await response.json();
      setArticles(data.articles);
      setTotalPages(data.pagination.totalPages);
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
    try {
      const response = await fetch(`/api/articles/${id}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        throw new Error('記事の削除に失敗しました');
      }
      
      // 削除成功後、一覧を更新
      setArticles(articles.filter(article => article.id !== id));
      toast.success('記事を削除しました');
    } catch (error) {
      console.error('記事削除エラー:', error);
      toast.error('記事の削除に失敗しました');
    }
  };
  
  // ステータス変更処理
  const handleChangeStatus = async (id: string, status: ArticleStatus) => {
    try {
      const response = await fetch(`/api/articles/${id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status })
      });
      
      if (!response.ok) {
        throw new Error('ステータスの変更に失敗しました');
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
  };
  
  // 検索実行
  const handleSearch = () => {
    setPage(1); // 検索時にページを1に戻す
    fetchArticles();
  };
  
  // ステータスに応じたバッジ表示
  const getStatusBadge = (status: ArticleStatus) => {
    switch (status) {
      case ArticleStatus.PUBLISHED:
        return <Badge variant="default">公開中</Badge>;
      case ArticleStatus.DRAFT:
        return <Badge variant="outline">下書き</Badge>;
      case ArticleStatus.ARCHIVED:
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
                  : statusFilter === ArticleStatus.PUBLISHED 
                    ? '公開中'
                    : statusFilter === ArticleStatus.DRAFT
                      ? '下書き'
                      : 'アーカイブ'
                }
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => setStatusFilter('ALL')}>
                すべて
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter(ArticleStatus.PUBLISHED)}>
                公開中
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter(ArticleStatus.DRAFT)}>
                下書き
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter(ArticleStatus.ARCHIVED)}>
                アーカイブ
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button onClick={handleSearch}>検索</Button>
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
            {loading ? (
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
                    {article.author.user.name}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm">
                    {article.publishedAt
                      ? format(new Date(article.publishedAt), 'yyyy/MM/dd HH:mm', { locale: ja })
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
                          {article.status !== ArticleStatus.PUBLISHED && (
                            <DropdownMenuItem
                              onClick={() => handleChangeStatus(article.id, ArticleStatus.PUBLISHED)}
                            >
                              公開する
                            </DropdownMenuItem>
                          )}
                          {article.status !== ArticleStatus.DRAFT && (
                            <DropdownMenuItem
                              onClick={() => handleChangeStatus(article.id, ArticleStatus.DRAFT)}
                            >
                              下書きに戻す
                            </DropdownMenuItem>
                          )}
                          {article.status !== ArticleStatus.ARCHIVED && (
                            <DropdownMenuItem
                              onClick={() => handleChangeStatus(article.id, ArticleStatus.ARCHIVED)}
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
            disabled={page === 1 || loading}
          >
            前へ
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(Math.min(totalPages, page + 1))}
            disabled={page === totalPages || loading}
          >
            次へ
          </Button>
        </div>
      </div>
    </div>
  );
}