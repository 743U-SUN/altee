import { StorageAdapter } from '../types'

const STORAGE_KEY = 'mdpreview-content'

export class LocalStorageAdapter implements StorageAdapter {
  async save(content: string): Promise<void> {
    if (typeof window === 'undefined') {
      throw new Error('LocalStorage is not available on server side')
    }
    
    const document = {
      content,
      lastModified: new Date().toISOString()
    }
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(document))
  }

  async load(): Promise<string> {
    if (typeof window === 'undefined') {
      return ''
    }
    
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) {
      return ''
    }
    
    try {
      const document = JSON.parse(stored)
      return document.content || ''
    } catch {
      return ''
    }
  }

  async clear(): Promise<void> {
    if (typeof window === 'undefined') {
      return
    }
    
    localStorage.removeItem(STORAGE_KEY)
  }
}

export class DatabaseAdapter implements StorageAdapter {
  async save(content: string): Promise<void> {
    throw new Error('DatabaseAdapter not implemented yet. Use server actions.')
  }

  async load(): Promise<string> {
    throw new Error('DatabaseAdapter not implemented yet. Use server actions.')
  }

  async clear(): Promise<void> {
    throw new Error('DatabaseAdapter not implemented yet. Use server actions.')
  }
}

export function createStorageAdapter(): StorageAdapter {
  return new LocalStorageAdapter()
}