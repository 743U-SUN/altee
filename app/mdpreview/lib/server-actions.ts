'use server'

import { DatabaseDocument } from '../types'

export async function createDocument(
  content: string, 
  title?: string
): Promise<DatabaseDocument> {
  throw new Error('Server actions not implemented yet. Implement with your database of choice.')
}

export async function updateDocument(
  id: string, 
  content: string
): Promise<DatabaseDocument> {
  throw new Error('Server actions not implemented yet. Implement with your database of choice.')
}

export async function getDocument(id: string): Promise<DatabaseDocument | null> {
  throw new Error('Server actions not implemented yet. Implement with your database of choice.')
}

export async function deleteDocument(id: string): Promise<void> {
  throw new Error('Server actions not implemented yet. Implement with your database of choice.')
}

export async function listDocuments(): Promise<DatabaseDocument[]> {
  throw new Error('Server actions not implemented yet. Implement with your database of choice.')
}