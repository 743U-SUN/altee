'use client';

import { useState, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ReactMarkdown from 'react-markdown';
import rehypeSanitize from 'rehype-sanitize';
import remarkGfm from 'remark-gfm';

// MdEditorをクライアントサイドのみでimport
const MdEditor = dynamic(() => import('@uiw/react-md-editor'), {
  ssr: false,
  loading: () => <div className="h-96 w-full rounded-md border border-input bg-background animate-pulse" />
});

// Markdownプレビューをカスタマイズするためのスタイル
const previewStyles = `
  .markdown-preview {
    padding: 1rem;
    min-height: 300px;
    border: 1px solid var(--border);
    border-radius: 0.5rem;
    background-color: var(--background);
  }
  
  .markdown-preview h1 {
    font-size: 1.875rem;
    font-weight: bold;
    margin-top: 1.5rem;
    margin-bottom: 1rem;
    padding-bottom: 0.5rem;
    border-bottom: 1px solid var(--border);
  }
  
  .markdown-preview h2 {
    font-size: 1.5rem;
    font-weight: bold;
    margin-top: 1.25rem;
    margin-bottom: 0.75rem;
  }
  
  .markdown-preview h3 {
    font-size: 1.25rem;
    font-weight: bold;
    margin-top: 1rem;
    margin-bottom: 0.5rem;
  }
  
  .markdown-preview p {
    margin-bottom: 1rem;
    line-height: 1.6;
  }
  
  .markdown-preview ul, .markdown-preview ol {
    margin-left: 1.5rem;
    margin-bottom: 1rem;
  }
  
  .markdown-preview li {
    margin-bottom: 0.25rem;
  }
  
  .markdown-preview pre {
    background-color: var(--secondary);
    padding: 1rem;
    border-radius: 0.25rem;
    overflow-x: auto;
    margin-bottom: 1rem;
  }
  
  .markdown-preview code {
    font-family: monospace;
    background-color: var(--secondary);
    padding: 0.2rem 0.4rem;
    border-radius: 0.2rem;
  }
  
  .markdown-preview blockquote {
    border-left: 4px solid var(--border);
    padding-left: 1rem;
    font-style: italic;
    margin-bottom: 1rem;
  }
  
  .markdown-preview img {
    max-width: 100%;
    height: auto;
    margin: 1rem 0;
    border-radius: 0.25rem;
  }
  
  .markdown-preview table {
    width: 100%;
    border-collapse: collapse;
    margin-bottom: 1rem;
  }
  
  .markdown-preview th, .markdown-preview td {
    border: 1px solid var(--border);
    padding: 0.5rem;
  }
  
  .markdown-preview th {
    background-color: var(--secondary);
    font-weight: bold;
  }
  
  .markdown-preview a {
    color: var(--primary);
    text-decoration: underline;
  }
`;

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
}

export default function MarkdownEditor({ value, onChange }: MarkdownEditorProps) {
  const [activeTab, setActiveTab] = useState<string>('write');
  
  const handleEditorChange = useCallback((value?: string) => {
    onChange(value || '');
  }, [onChange]);
  
  return (
    <>
      <style jsx global>{previewStyles}</style>
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-2">
          <TabsTrigger value="write">編集</TabsTrigger>
          <TabsTrigger value="preview">プレビュー</TabsTrigger>
        </TabsList>
        
        <TabsContent value="write" className="mt-0">
          <div data-color-mode="light">
            <MdEditor
              value={value}
              onChange={handleEditorChange}
              preview="edit"
              height={400}
              toolbarHeight={48}
              className="rounded-md border border-input bg-background"
              enableScroll
            />
          </div>
        </TabsContent>
        
        <TabsContent value="preview" className="mt-0">
          <div className="markdown-preview">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeSanitize]}
            >
              {value || '_プレビューするコンテンツがありません_'}
            </ReactMarkdown>
          </div>
        </TabsContent>
      </Tabs>
    </>
  );
}
