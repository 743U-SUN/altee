'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { toast } from 'sonner';
import slugify from 'slugify';

import { Button } from '@/components/ui/button';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

import { ArticleStatus } from '@prisma/client';
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
  status: z.enum([ArticleStatus.DRAFT, ArticleStatus.PUBLISHED, ArticleStatus.ARCHIVED]),
  publishedAt: z.date().optional(),
  authorId: z.string().min(1, '著者は必須です'),
  categories: z.array(z.string()).min(1, '少なくとも1つのカテゴリを選択してください'),
  tags: z.array(z.string()).optional(),
  autoGenerateSlug: z.boolean().default(true)
});

type FormValues = z.infer<typeof formSchema>;

interface ArticleFormProps {
  initialData?: any;
  authors: any[];
}

export default function ArticleForm({ initialData, authors }: ArticleFormProps) {
  const router = useRouter();
  const isEditMode = !!initialData;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previewId, setPreviewId] = useState<string | null>(null);
  
  // フォームの初期値設定
  const defaultValues: Partial<FormValues> = {
    title: initialData?.title || '',
    slug: initialData?.slug || '',
    content: initialData?.content || '',
    excerpt: initialData?.excerpt || '',
    featuredImage: initialData?.featuredImage || '',
    status: initialData?.status || ArticleStatus.DRAFT,
    publishedAt: initialData?.publishedAt ? new Date(initialData.publishedAt) : undefined,
    authorId: initialData?.authorId || '',
    categories: initialData?.categories?.map((c: any) => c.categoryId) || [],
    tags: initialData?.tags?.map((t: any) => t.tagId) || [],
    autoGenerateSlug: !initialData
  };

  // フォーム設定
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
    mode: 'onChange'
  });

  // タイトル変更時のスラッグ自動生成
  useEffect(() => {
    const titleValue = form.watch('title');
    const autoGenerateSlug = form.watch('autoGenerateSlug');
    
    if (autoGenerateSlug && titleValue) {
      const slug = slugify(titleValue, {
        lower: true,
        strict: true
      });
      form.setValue('slug', slug, {
        shouldValidate: true
      });
    }
  }, [form.watch('title'), form.watch('autoGenerateSlug'), form]);

  // フォーム送信処理
  const onSubmit = async (data: FormValues) => {
    try {
      setIsSubmitting(true);
      
      // スラッグが重複しないかチェック
      if (!isEditMode) {
        // ここでスラッグの重複チェックのAPIを呼び出す
      }
      
      // カテゴリとタグのデータ整形
      const formattedData = {
        ...data,
        categories: data.categories.map(categoryId => ({ categoryId })),
        tags: data.tags?.map(tagId => ({ tagId })) || []
      };
      
      delete formattedData.autoGenerateSlug;
      
      // API呼び出し
      const url = isEditMode ? `/api/articles/${initialData.id}` : '/api/articles';
      const method = isEditMode ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formattedData)
      });
      
      if (!response.ok) {
        throw new Error('記事の保存に失敗しました');
      }
      
      const savedArticle = await response.json();
      
      toast.success(isEditMode ? '記事を更新しました' : '記事を作成しました');
      
      // 保存後のリダイレクト
      router.push('/admin/articles');
      router.refresh();
    } catch (error) {
      console.error('記事保存エラー:', error);
      toast.error('記事の保存に失敗しました: ' + (error instanceof Error ? error.message : '不明なエラー'));
    } finally {
      setIsSubmitting(false);
    }
  };

  // プレビュー表示
  const handlePreview = async () => {
    // 下書き保存してからプレビューに進む
    if (initialData?.id) {
      setPreviewId(initialData.id);
    } else {
      try {
        const formData = form.getValues();
        const response = await fetch('/api/articles/draft', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            ...formData,
            categories: formData.categories.map(categoryId => ({ categoryId })),
            tags: formData.tags?.map(tagId => ({ tagId })) || []
          })
        });
        
        if (!response.ok) {
          throw new Error('下書き保存に失敗しました');
        }
        
        const draftArticle = await response.json();
        setPreviewId(draftArticle.id);
      } catch (error) {
        console.error('下書き保存エラー:', error);
        toast.error('プレビューのための下書き保存に失敗しました');
        return;
      }
    }
    
    // プレビューページに移動
    if (previewId) {
      router.push(`/admin/articles/preview/${previewId}`);
    }
  };

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
                        <option value={ArticleStatus.DRAFT}>下書き</option>
                        <option value={ArticleStatus.PUBLISHED}>公開</option>
                        <option value={ArticleStatus.ARCHIVED}>アーカイブ</option>
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
                            {author.user.name}
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
              disabled={isSubmitting}
            >
              プレビュー
            </Button>
            
            {isEditMode && form.watch('status') !== ArticleStatus.PUBLISHED && (
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
                        form.setValue('status', ArticleStatus.PUBLISHED);
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
              disabled={isSubmitting}
            >
              {isSubmitting ? '保存中...' : isEditMode ? '更新' : '保存'}
            </Button>
          </div>
        </div>
      </form>
    </Form>
  );
}
