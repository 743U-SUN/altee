export type TabType = 'edit' | 'preview'

export interface MarkdownDocument {
  content: string
  lastModified: Date
  id?: string
}

export interface StorageAdapter {
  save(content: string): Promise<void>
  load(): Promise<string>
  clear(): Promise<void>
}

export interface MarkdownProcessorOptions {
  enableGfm: boolean
  enableEmoji: boolean
  enableSyntaxHighlight: boolean
  syntaxTheme: string
}

export interface DatabaseDocument extends MarkdownDocument {
  id: string
  title: string
  userId: string
  createdAt: Date
  updatedAt: Date
}

export interface ServerActionsInterface {
  createDocument: (content: string, title?: string) => Promise<DatabaseDocument>
  updateDocument: (id: string, content: string) => Promise<DatabaseDocument>
  getDocument: (id: string) => Promise<DatabaseDocument | null>
  deleteDocument: (id: string) => Promise<void>
  listDocuments: () => Promise<DatabaseDocument[]>
}