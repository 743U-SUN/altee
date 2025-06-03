'use client'

import { Suspense } from 'react'
import { TabNavigation } from './TabNavigation'
import { MarkdownEditor } from './MarkdownEditor'
import { MarkdownPreview } from './MarkdownPreview'
import { MarkdownSkeleton } from './MarkdownSkeleton'
import { ErrorBoundary } from './ErrorBoundary'
import { useMarkdownStorage } from '../hooks/useMarkdownStorage'
import { useTabState } from '../hooks/useTabState'
import { Button } from '@/components/ui/button'
import { Trash2, Download, Upload, Save, Loader2 } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'

function MarkdownWorkspaceContent() {
  const { currentTab, setCurrentTab } = useTabState()
  const { 
    content, 
    setContent, 
    save, 
    clear, 
    isLoading, 
    isSaving, 
    error 
  } = useMarkdownStorage()

  const handleExport = () => {
    const blob = new Blob([content], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'document.md'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handleImport = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.md,.txt'
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (file) {
        const reader = new FileReader()
        reader.onload = (e) => {
          const text = e.target?.result as string
          setContent(text)
        }
        reader.readAsText(file)
      }
    }
    input.click()
  }

  return (
    <div className="min-h-screen">
      {/* Fixed header */}
      <div className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
        <div className="flex flex-col p-4 space-y-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">Markdown Preview</h1>
            <div className="flex items-center gap-2">
              <Button 
                onClick={save} 
                disabled={isSaving}
                variant="default" 
                size="sm"
                className="flex items-center gap-2"
              >
                {isSaving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                {isSaving ? 'Saving...' : 'Save'}
              </Button>
              <Button onClick={handleImport} variant="outline" size="sm">
                <Upload className="h-4 w-4 mr-2" />
                Import
              </Button>
              <Button onClick={handleExport} variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
              <Button onClick={clear} variant="outline" size="sm">
                <Trash2 className="h-4 w-4 mr-2" />
                Clear
              </Button>
            </div>
          </div>

          <TabNavigation 
            currentTab={currentTab} 
            onTabChange={setCurrentTab} 
          />
        </div>
      </div>

      {/* Content area */}
      <div className="p-4">
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="min-h-[calc(100vh-200px)]">
          {currentTab === 'edit' ? (
            <MarkdownEditor
              content={content}
              onChange={setContent}
              error={error}
            />
          ) : (
            <MarkdownPreview
              content={content}
              isLoading={isLoading}
            />
          )}
        </div>
      </div>
    </div>
  )
}

export function MarkdownWorkspace() {
  return (
    <ErrorBoundary>
      <Suspense fallback={<MarkdownSkeleton />}>
        <MarkdownWorkspaceContent />
      </Suspense>
    </ErrorBoundary>
  )
}