'use client'

import { useState, useEffect, useCallback } from 'react'
import { createStorageAdapter } from '../lib/storage-adapter'
import { StorageAdapter } from '../types'

interface UseMarkdownStorageReturn {
  content: string
  setContent: (content: string) => void
  save: () => Promise<void>
  load: () => Promise<void>
  clear: () => Promise<void>
  isLoading: boolean
  isSaving: boolean
  error: string | null
}

export function useMarkdownStorage(
  autoSave = true,
  debounceMs = 1000
): UseMarkdownStorageReturn {
  const [content, setContentState] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [adapter] = useState<StorageAdapter>(() => createStorageAdapter())
  const [saveTimeoutId, setSaveTimeoutId] = useState<NodeJS.Timeout | null>(null)

  const setContent = useCallback((newContent: string) => {
    setContentState(newContent)
    setError(null)

    if (autoSave) {
      if (saveTimeoutId) {
        clearTimeout(saveTimeoutId)
      }

      const timeoutId = setTimeout(() => {
        save()
      }, debounceMs)

      setSaveTimeoutId(timeoutId)
    }
  }, [autoSave, debounceMs, saveTimeoutId])

  const save = useCallback(async () => {
    try {
      setIsSaving(true)
      setError(null)
      await adapter.save(content)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save')
    } finally {
      setIsSaving(false)
    }
  }, [adapter, content])

  const load = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      const loadedContent = await adapter.load()
      setContentState(loadedContent)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load')
    } finally {
      setIsLoading(false)
    }
  }, [adapter])

  const clear = useCallback(async () => {
    try {
      setError(null)
      await adapter.clear()
      setContentState('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to clear')
    }
  }, [adapter])

  useEffect(() => {
    load()
  }, [load])

  useEffect(() => {
    return () => {
      if (saveTimeoutId) {
        clearTimeout(saveTimeoutId)
      }
    }
  }, [saveTimeoutId])

  return {
    content,
    setContent,
    save,
    load,
    clear,
    isLoading,
    isSaving,
    error
  }
}