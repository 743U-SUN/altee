'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

export function MarkdownSkeleton() {
  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle className="text-sm font-medium">Preview</CardTitle>
      </CardHeader>
      
      <CardContent className="flex-1 space-y-4">
        {/* 見出し風スケルトン */}
        <div className="space-y-2">
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-px w-full" />
        </div>
        
        {/* 段落風スケルトン */}
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-4 w-4/5" />
        </div>
        
        {/* リスト風スケルトン */}
        <div className="space-y-2">
          <Skeleton className="h-6 w-1/2" />
          <div className="ml-4 space-y-1">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-4 w-4/5" />
          </div>
        </div>
        
        {/* コードブロック風スケルトン */}
        <div className="space-y-2">
          <Skeleton className="h-5 w-1/3" />
          <div className="bg-muted rounded-lg p-4 space-y-2">
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-4/5" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        </div>
        
        {/* テーブル風スケルトン */}
        <div className="space-y-2">
          <Skeleton className="h-5 w-1/4" />
          <div className="border border-border rounded-lg overflow-hidden">
            <div className="bg-muted p-2 flex gap-2">
              <Skeleton className="h-4 flex-1" />
              <Skeleton className="h-4 flex-1" />
              <Skeleton className="h-4 flex-1" />
            </div>
            <div className="p-2 space-y-2">
              <div className="flex gap-2">
                <Skeleton className="h-4 flex-1" />
                <Skeleton className="h-4 flex-1" />
                <Skeleton className="h-4 flex-1" />
              </div>
              <div className="flex gap-2">
                <Skeleton className="h-4 flex-1" />
                <Skeleton className="h-4 flex-1" />
                <Skeleton className="h-4 flex-1" />
              </div>
            </div>
          </div>
        </div>
        
        {/* 追加の段落 */}
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>
      </CardContent>
    </Card>
  )
}