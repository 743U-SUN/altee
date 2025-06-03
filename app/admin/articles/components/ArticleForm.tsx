'use client';

import { useState, useEffect, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { toast } from 'sonner';
import slugify from 'slugify';
import { 
  createArticleAction, 
  updateArticleAction, 
  getAuthorsAction,
  saveDraftArticleAction 
} from '@/lib/actions/article-actions';

import { Button } from '@/components/ui/button';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

import MarkdownEditor from './MarkdownEditor';
import CategorySelector from './CategorySelector';
import TagSelector from './TagSelector';
import MediaUploader from './MediaUploader';
import DatePicker from './DatePicker';

// バリデーションスキーマ
const formSchema = z.object({
  title: z.string().min(1, 'タイトルは必須です').max(100, 'タイトルは100文字以内で入力してください'),
  slug: z.string().min(1, 'スラッグは必須です').max(100, 'スラッグは100文字以内で入力してください')
    .regex(/^[a-z0-9-]+$/, 'スラッグは小文字のアルファベット、数字、ハイフンのみが使用できます'),
  content: z.string().min(1, '本文は必須です'),
  excerpt: z.string().max(200, '抜粋は200文字以内で入力してください').optional(),
  featuredImage: z.string().optional(),
  status: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED'] as const),
  publishedAt: z.date().optional(),
  authorId: z.string().min(1, '著者は必須です'),
  categories: z.array(z.string()).min(1, '少なくとも1つのカテゴリを選択してください'),
  tags: z.array(z.string()).optional(),
  autoGenerateSlug: z.boolean().default(true)
});

type FormValues = z.infer<typeof formSchema>;

interface ArticleFormProps {
  initialData?: any;
}

export default function ArticleForm({ initialData }: ArticleFormProps) {
  const router = useRouter();
  const isEditMode = !!initialData;
  const [isPending, startTransition] = useTransition();
  const [authors, setAuthors] = useState<any[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
  
  // フォームの初期値設定
  const defaultValues: FormValues = {
    title: initialData?.title || '',
    slug: initialData?.slug || '',
    content: initialData?.content || '',
    excerpt: initialData?.excerpt || '',
    featuredImage: initialData?.featuredImage || '',
    status: initialData?.status || 'DRAFT',
    publishedAt: initialData?.publishedAt ? new Date(initialData.publishedAt) : undefined,
    authorId: initialData?.authorId || '',
    categories: initialData?.categories?.map((c: any) => c.categoryId) || [],
    tags: initialData?.tags?.map((t: any) => t.tagId) || [],
    autoGenerateSlug: !initialData
  };

  // フォーム設定
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues,
    mode: 'onChange' as const
  });

  // 初期データの取得
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        // 著者一覧を取得
        const authorsResult = await getAuthorsAction();
        if (authorsResult.success && authorsResult.data) {
          setAuthors(authorsResult.data);
        } else {
          toast.error('著者データの取得に失敗しました');
        }
      } catch (error) {
        console.error('Error fetching initial data:', error);
        toast.error('データの取得に失敗しました');
      } finally {
        setIsLoadingData(false);
      }
    };

    fetchInitialData();
  }, []);

  // タイトル変更時のスラッグ自動生成
  useEffect(() => {
    const subscription = form.watch((values, { name }) => {
      if ((name === 'title' || name === 'autoGenerateSlug') && values.autoGenerateSlug && values.title) {
        const slug = slugify(values.title, {
          lower: true,
          strict: true
        });
        form.setValue('slug', slug, {
          shouldValidate: true
        });
      }
    });
    
    return () => subscription.unsubscribe();
  }, [form]);

  // フォーム送信処理
  const onSubmit = async (data: FormValues) => {
    startTransition(async () => {
      try {
        // データの整形
        const formattedData = {
          title: data.title,
          slug: data.slug,
          content: data.content,
          excerpt: data.excerpt || undefined,
          featuredImage: data.featuredImage || undefined,
          status: data.status,
          authorId: data.authorId,
          categories: data.categories,
          tags: data.tags || [],
          publishedAt: data.publishedAt instanceof Date ? data.publishedAt.toISOString() : undefined,
        };
        
        let result;
        if (isEditMode) {
          result = await updateArticleAction({
            id: initialData.id,
            ...formattedData
          });
        } else {
          result = await createArticleAction(formattedData);
        }
        
        if (result.success) {
          toast.success(isEditMode ? '記事を更新しました' : '記事を作成しました');
          router.push('/admin/articles');
          router.refresh();
        } else {
          throw new Error(result.error || '記事の保存に失敗しました');
        }
      } catch (error) {
        console.error('記事保存エラー:', error);
        toast.error('記事の保存に失敗しました: ' + (error instanceof Error ? error.message : '不明なエラー'));
      }
    });
  };

  // プレビュー表示
  const handlePreview = async () => {
    startTransition(async () => {
      try {
        // 下書き保存してからプレビューに進む
        if (initialData?.id) {
          router.push(`/admin/articles/preview/${initialData.id}`);
        } else {
          const formData = form.getValues();
          const draftData = {
            title: formData.title,
            slug: formData.slug,
            content: formData.content,
            excerpt: formData.excerpt || undefined,
            featuredImage: formData.featuredImage || undefined,
            authorId: formData.authorId,
            categories: formData.categories,
            tags: formData.tags || [],
            publishedAt: formData.publishedAt instanceof Date ? formData.publishedAt.toISOString() : undefined,
          };
          
          const result = await saveDraftArticleAction(draftData);
          
          if (result.success && result.data) {
            router.push(`/admin/articles/preview/${result.data.id}`);
          } else {
            throw new Error(result.error || '下書き保存に失敗しました');
          }
        }
      } catch (error) {
        console.error('下書き保存エラー:', error);
        toast.error('プレビューのための下書き保存に失敗しました');
      }
    });
  };

  if (isLoadingData) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          {/* メインコンテンツ */}
          <div className="space-y-6 md:col-span-3">
            {/* タイトル */}
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>タイトル</FormLabel>
                  <FormControl>
                    <Input placeholder="記事のタイトル" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* スラッグ */}
            <div className="flex items-end gap-4">
              <div className="flex-1">
                <FormField
                  control={form.control}
                  name="slug"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>スラッグ</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="article-slug" 
                          {...field} 
                          disabled={form.watch('autoGenerateSlug')}
                        />
                      </FormControl>
                      <FormDescription>
                        URLに使用されます: /article/{field.value}
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="autoGenerateSlug"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center space-x-2">
                    <FormControl>
                      <Checkbox 
                        checked={field.value} 
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <FormLabel className="text-sm font-normal">
                      自動生成
                    </FormLabel>
                  </FormItem>
                )}
              />
            </div>
            
            {/* 本文エディタ */}
            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>本文</FormLabel>
                  <FormControl>
                    <MarkdownEditor
                      value={field.value}
                      onChange={field.onChange}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* 抜粋 */}
            <FormField
              control={form.control}
              name="excerpt"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>抜粋</FormLabel>
                  <FormControl>
                    <Input placeholder="記事の抜粋（省略可）" {...field} />
                  </FormControl>
                  <FormDescription>
                    記事一覧などで表示される短い説明です。入力しない場合は本文から自動生成されます。
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          {/* サイドバー */}
          <div className="space-y-6">
            {/* 公開設定 */}
            <div className="rounded-lg border p-4">
              <h3 className="text-lg font-medium mb-4">公開設定</h3>
              
              {/* ステータス */}
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem className="mb-4">
                    <FormLabel>ステータス</FormLabel>
                    <FormControl>
                      <select
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        value={field.value}
                        onChange={field.onChange}
                      >
                        <option value="DRAFT">下書き</option>
                        <option value="PUBLISHED">公開</option>
                        <option value="ARCHIVED">アーカイブ</option>
                      </select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {/* 公開日時 */}
              <FormField
                control={form.control}
                name="publishedAt"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>公開日時</FormLabel>
                    <FormControl>
                      <DatePicker
                        date={field.value}
                        setDate={field.onChange}
                      />
                    </FormControl>
                    <FormDescription>
                      未設定の場合、公開時の日時が使用されます
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            {/* 著者 */}
            <div className="rounded-lg border p-4">
              <h3 className="text-lg font-medium mb-4">著者</h3>
              <FormField
                control={form.control}
                name="authorId"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <select
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        value={field.value}
                        onChange={field.onChange}
                      >
                        <option value="">著者を選択</option>
                        {authors.map((author) => (
                          <option key={author.id} value={author.id}>
                            {author.user?.name || author.id}
                          </option>
                        ))}
                      </select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            {/* カテゴリ */}
            <div className="rounded-lg border p-4">
              <h3 className="text-lg font-medium mb-4">カテゴリ</h3>
              <FormField
                control={form.control}
                name="categories"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <CategorySelector
                        selected={field.value}
                        onChange={field.onChange}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            {/* タグ */}
            <div className="rounded-lg border p-4">
              <h3 className="text-lg font-medium mb-4">タグ</h3>
              <FormField
                control={form.control}
                name="tags"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <TagSelector
                        selected={field.value || []}
                        onChange={field.onChange}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            {/* アイキャッチ画像 */}
            <div className="rounded-lg border p-4">
              <h3 className="text-lg font-medium mb-4">アイキャッチ画像</h3>
              <FormField
                control={form.control}
                name="featuredImage"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <MediaUploader
                        value={field.value || ''}
                        onChange={field.onChange}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
        </div>
        
        <Separator />
        
        {/* アクションボタン */}
        <div className="flex justify-between">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push('/admin/articles')}
          >
            キャンセル
          </Button>
          
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={handlePreview}
              disabled={isPending}
            >
              プレビュー
            </Button>
            
            {isEditMode && form.watch('status') !== 'PUBLISHED' && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="default">公開する</Button>
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
                    <AlertDialogAction
                      onClick={() => {
                        form.setValue('status', 'PUBLISHED');
                        if (!form.getValues('publishedAt')) {
                          form.setValue('publishedAt', new Date());
                        }
                        form.handleSubmit(onSubmit)();
                      }}
                    >
                      公開する
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
            
            <Button 
              type="submit" 
              disabled={isPending}
            >
              {isPending ? '保存中...' : isEditMode ? '更新' : '保存'}
            </Button>
          </div>
        </div>
      </form>
    </Form>
  );
}