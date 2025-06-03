'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2 } from 'lucide-react'
import { Suspense, lazy } from 'react'
import { MarkdownSkeleton } from './MarkdownSkeleton'
import { ErrorBoundary } from './ErrorBoundary'

// Dynamic import for markdown renderer
const MarkdownRenderer = lazy(() => 
  import('./MarkdownRenderer').then(mod => ({ default: mod.MarkdownRenderer }))
)

interface MarkdownPreviewProps {
  content: string
  isLoading?: boolean
}

export function MarkdownPreview({ content, isLoading }: MarkdownPreviewProps) {
  if (isLoading) {
    return <MarkdownSkeleton />
  }

  if (!content.trim()) {
    return (
      <Card className="h-full flex flex-col">
        <CardHeader>
          <CardTitle className="text-sm font-medium">Preview</CardTitle>
        </CardHeader>
        <CardContent className="flex-1 flex items-center justify-center">
          <div className="text-muted-foreground text-center">
            <p>No content to preview</p>
            <p className="text-xs mt-1">Start typing in the editor to see the preview</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle className="text-sm font-medium">Preview</CardTitle>
      </CardHeader>
      
      <CardContent className="flex-1 overflow-auto">
        <ErrorBoundary>
          <Suspense fallback={<MarkdownSkeleton />}>
            <MarkdownRenderer content={content} />
          </Suspense>
        </ErrorBoundary>
      </CardContent>
    </Card>
  )
}