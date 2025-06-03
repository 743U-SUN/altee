'use client'

import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertCircle } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { memo } from 'react'

interface MarkdownEditorProps {
  content: string
  onChange: (content: string) => void
  error: string | null
}

export const MarkdownEditor = memo(function MarkdownEditor({ 
  content, 
  onChange, 
  error 
}: MarkdownEditorProps) {
  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">Markdown Editor</CardTitle>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        <Textarea
          value={content}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Type your markdown here..."
          className="flex-1 resize-none font-mono"
          style={{ minHeight: '400px' }}
        />
        
        <div className="text-xs text-muted-foreground">
          Supports GitHub-flavored Markdown, including tables, task lists, and emoji :smile:
        </div>
      </CardContent>
    </Card>
  )
})