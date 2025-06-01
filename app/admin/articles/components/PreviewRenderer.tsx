'use client';

import { format } from 'date-fns';
import { ja } from 'date-fns/locale';
import ReactMarkdown from 'react-markdown';
import rehypeSanitize from 'rehype-sanitize';
import remarkGfm from 'remark-gfm';
import { Badge } from '@/components/ui/badge';
import { ArticleStatus } from '@prisma/client';
import { OptimizedImage } from '@/components/ui/optimized-image';
import { convertToProxyUrl } from '@/lib/utils/image-proxy';

// マークダウンプレビュースタイル
const previewStyles = `
  .article-content {
    max-width: 768px;
    margin: 0 auto;
  }
  
  .article-content h1 {
    font-size: 2rem;
    font-weight: bold;
    margin-top: 2rem;
    margin-bottom: 1rem;
    padding-bottom: 0.5rem;
    border-bottom: 1px solid var(--border);
  }
  
  .article-content h2 {
    font-size: 1.5rem;
    font-weight: bold;
    margin-top: 1.5rem;
    margin-bottom: 0.75rem;
  }
  
  .article-content h3 {
    font-size: 1.25rem;
    font-weight: bold;
    margin-top: 1.25rem;
    margin-bottom: 0.5rem;
  }
  
  .article-content p {
    margin-bottom: 1rem;
    line-height: 1.8;
  }
  
  .article-content ul, .article-content ol {
    margin-left: 1.5rem;
    margin-bottom: 1rem;
  }
  
  .article-content li {
    margin-bottom: 0.5rem;
  }
  
  .article-content pre {
    background-color: var(--secondary);
    padding: 1rem;
    border-radius: 0.25rem;
    overflow-x: auto;
    margin-bottom: 1rem;
  }
  
  .article-content code {
    font-family: monospace;
    background-color: var(--secondary);
    padding: 0.2rem 0.4rem;
    border-radius: 0.2rem;
  }
  
  .article-content blockquote {
    border-left: 4px solid var(--border);
    padding-left: 1rem;
    font-style: italic;
    margin-bottom: 1rem;
  }
  
  .article-content img {
    max-width: 100%;
    height: auto;
    margin: 1rem 0;
    border-radius: 0.25rem;
  }
  
  .article-content table {
    width: 100%;
    border-collapse: collapse;
    margin-bottom: 1rem;
  }
  
  .article-content th, .article-content td {
    border: 1px solid var(--border);
    padding: 0.5rem;
  }
  
  .article-content th {
    background-color: var(--secondary);
    font-weight: bold;
  }
  
  .article-content a {
    color: var(--primary);
    text-decoration: underline;
  }
  
  .article-content hr {
    border: 0;
    border-top: 1px solid var(--border);
    margin: 2rem 0;
  }
`;

interface PreviewRendererProps {
  article: {
    title: string;
    slug: string;
    content: string;
    excerpt?: string | null;
    featuredImage?: string | null;
    status: ArticleStatus;
    publishedAt?: string | null;
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
        slug: string;
      };
    }[];
    tags: {
      tag: {
        name: string;
        slug: string;
      };
    }[];
  };
}

export default function PreviewRenderer({ article }: PreviewRendererProps) {
  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return '未公開';
    return format(new Date(dateString), 'yyyy年MM月dd日 HH:mm', { locale: ja });
  };
  
  return (
    <>
      <style jsx global>{previewStyles}</style>
      
      <article className="max-w-4xl mx-auto py-8 px-4">
        {/* ステータスバッジ */}
        <div className="mb-4 flex justify-center">
          {article.status === ArticleStatus.PUBLISHED ? (
            <Badge variant="default" className="px-3 py-1 text-sm">公開済み</Badge>
          ) : article.status === ArticleStatus.DRAFT ? (
            <Badge variant="secondary" className="px-3 py-1 text-sm">下書き</Badge>
          ) : (
            <Badge variant="outline" className="px-3 py-1 text-sm">アーカイブ</Badge>
          )}
        </div>
        
        {/* アイキャッチ画像 */}
        {article.featuredImage && (
          <div className="w-full aspect-video relative mb-8 overflow-hidden rounded-lg">
            <OptimizedImage
              src={convertToProxyUrl(article.featuredImage)}
              alt={article.title}
              fill
              className="object-cover"
              priority
            />
          </div>
        )}
        
        {/* 記事ヘッダー */}
        <header className="mb-8 text-center">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
            {article.title}
          </h1>
          
          <div className="flex flex-wrap justify-center gap-2 mb-4">
            {article.categories.map((cat, index) => (
              <Badge key={index} variant="secondary" className="text-sm">
                {cat.category.name}
              </Badge>
            ))}
          </div>
          
          <div className="text-sm text-muted-foreground flex flex-wrap justify-center gap-x-4">
            <span>著者: {article.author.user.name}</span>
            <span>公開日: {formatDate(article.publishedAt)}</span>
            <span>更新日: {formatDate(article.updatedAt)}</span>
          </div>
        </header>
        
        {/* 抜粋 */}
        {article.excerpt && (
          <div className="mb-8">
            <div className="bg-secondary/50 rounded-lg p-4 italic">
              {article.excerpt}
            </div>
          </div>
        )}
        
        {/* 記事本文 */}
        <div className="article-content">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeSanitize]}
          >
            {article.content}
          </ReactMarkdown>
        </div>
        
        {/* タグ */}
        {article.tags.length > 0 && (
          <div className="mt-8 pt-4 border-t">
            <div className="flex flex-wrap gap-2">
              {article.tags.map((tag, index) => (
                <Badge key={index} variant="outline" className="text-sm">
                  #{tag.tag.name}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </article>
    </>
  );
}