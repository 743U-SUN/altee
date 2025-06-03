'use server'

import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { ArticleStatus } from '@prisma/client'

// Validation schemas
const createArticleSchema = z.object({
  title: z.string().min(1, 'タイトルは必須です'),
  content: z.string().min(1, '内容は必須です'),
  excerpt: z.string().optional(),
  slug: z.string().min(1, 'スラッグは必須です'),
  categories: z.array(z.string()).min(1, 'カテゴリーは必須です'),
  tags: z.array(z.string()).optional(),
  status: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']).default('DRAFT'),
  featuredImage: z.string().optional(),
  authorId: z.string().min(1, '著者は必須です'),
  publishedAt: z.string().optional(),
})

const updateArticleSchema = createArticleSchema.partial().extend({
  id: z.string().min(1),
})

// Create article
export async function createArticleAction(data: z.infer<typeof createArticleSchema>) {
  try {
    const session = await auth()
    if (!session?.user || session.user.role !== 'admin') {
      throw new Error('Unauthorized')
    }

    const validated = createArticleSchema.parse(data)
    const { categories, tags, ...articleData } = validated

    const article = await prisma.article.create({
      data: {
        ...articleData,
        status: articleData.status as ArticleStatus,
        publishedAt: validated.publishedAt ? new Date(validated.publishedAt) : 
                     validated.status === 'PUBLISHED' ? new Date() : null,
        categories: {
          create: categories.map(categoryId => ({
            categoryId
          }))
        },
        tags: tags ? {
          create: tags.map(tagId => ({
            tagId
          }))
        } : undefined,
      },
      include: {
        author: {
          include: {
            user: true
          }
        },
        categories: {
          include: {
            category: true
          }
        },
        tags: {
          include: {
            tag: true
          }
        }
      },
    })

    revalidatePath('/admin/articles')
    revalidatePath('/article')
    
    return { success: true, data: article }
  } catch (error) {
    console.error('Error creating article:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to create article' 
    }
  }
}

// Update article
export async function updateArticleAction(data: z.infer<typeof updateArticleSchema>) {
  try {
    const session = await auth()
    if (!session?.user || session.user.role !== 'admin') {
      throw new Error('Unauthorized')
    }

    const validated = updateArticleSchema.parse(data)
    const { id, categories, tags, ...updateData } = validated

    // First, delete existing relationships
    await prisma.$transaction([
      prisma.articleCategory.deleteMany({
        where: { articleId: id }
      }),
      prisma.articleTag.deleteMany({
        where: { articleId: id }
      })
    ])

    // Then update the article with new relationships
    const article = await prisma.article.update({
      where: { id },
      data: {
        ...updateData,
        status: updateData.status as ArticleStatus | undefined,
        publishedAt: updateData.publishedAt ? new Date(updateData.publishedAt) : 
                     updateData.status === 'PUBLISHED' ? new Date() : undefined,
        categories: categories ? {
          create: categories.map(categoryId => ({
            categoryId
          }))
        } : undefined,
        tags: tags ? {
          create: tags.map(tagId => ({
            tagId
          }))
        } : undefined,
      },
      include: {
        author: {
          include: {
            user: true
          }
        },
        categories: {
          include: {
            category: true
          }
        },
        tags: {
          include: {
            tag: true
          }
        }
      },
    })

    revalidatePath('/admin/articles')
    revalidatePath(`/admin/articles/edit/${id}`)
    revalidatePath('/article')
    
    return { success: true, data: article }
  } catch (error) {
    console.error('Error updating article:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to update article' 
    }
  }
}

// Delete article
export async function deleteArticleAction(id: string) {
  try {
    const session = await auth()
    if (!session?.user || session.user.role !== 'admin') {
      throw new Error('Unauthorized')
    }

    await prisma.article.delete({
      where: { id },
    })

    revalidatePath('/admin/articles')
    revalidatePath('/article')
    
    return { success: true }
  } catch (error) {
    console.error('Error deleting article:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to delete article' 
    }
  }
}

// Update article status
export async function updateArticleStatusAction(id: string, status: ArticleStatus) {
  try {
    const session = await auth()
    if (!session?.user || session.user.role !== 'admin') {
      throw new Error('Unauthorized')
    }

    const article = await prisma.article.update({
      where: { id },
      data: {
        status,
        publishedAt: status === ArticleStatus.PUBLISHED ? new Date() : undefined,
      },
    })

    revalidatePath('/admin/articles')
    revalidatePath('/article')
    
    return { success: true, data: article }
  } catch (error) {
    console.error('Error updating article status:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to update article status' 
    }
  }
}

// Get articles
export async function getArticlesAction(params?: {
  page?: number
  limit?: number
  status?: string
  categoryId?: string
  authorId?: string
  search?: string
}) {
  try {
    const session = await auth()
    if (!session?.user || session.user.role !== 'admin') {
      throw new Error('Unauthorized')
    }

    const page = params?.page || 1
    const limit = params?.limit || 10
    const skip = (page - 1) * limit

    const where: any = {}
    if (params?.status) where.status = params.status
    if (params?.categoryId) {
      where.categories = {
        some: {
          categoryId: params.categoryId
        }
      }
    }
    if (params?.authorId) where.authorId = params.authorId
    if (params?.search) {
      where.OR = [
        { title: { contains: params.search, mode: 'insensitive' } },
        { content: { contains: params.search, mode: 'insensitive' } },
      ]
    }

    const [articles, total] = await Promise.all([
      prisma.article.findMany({
        where,
        include: {
          author: {
            include: {
              user: true
            }
          },
          categories: {
            include: {
              category: true
            }
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.article.count({ where }),
    ])

    return { 
      success: true, 
      data: articles,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      }
    }
  } catch (error) {
    console.error('Error fetching articles:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to fetch articles' 
    }
  }
}

// Get single article
export async function getArticleByIdAction(id: string) {
  try {
    const session = await auth()
    if (!session?.user || session.user.role !== 'admin') {
      throw new Error('Unauthorized')
    }

    const article = await prisma.article.findUnique({
      where: { id },
      include: {
        author: {
          include: {
            user: true
          }
        },
        categories: {
          include: {
            category: true
          }
        },
        tags: {
          include: {
            tag: true
          }
        }
      },
    })

    if (!article) {
      throw new Error('Article not found')
    }

    return { success: true, data: article }
  } catch (error) {
    console.error('Error fetching article:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to fetch article' 
    }
  }
}

// Get authors
export async function getAuthorsAction() {
  try {
    const session = await auth()
    if (!session?.user || session.user.role !== 'admin') {
      throw new Error('Unauthorized')
    }

    const authors = await prisma.author.findMany({
      include: {
        user: true
      },
      orderBy: { 
        user: {
          name: 'asc'
        }
      },
    })

    return { success: true, data: authors }
  } catch (error) {
    console.error('Error fetching authors:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to fetch authors' 
    }
  }
}

// Get categories
export async function getCategoriesAction() {
  try {
    const session = await auth()
    if (!session?.user || session.user.role !== 'admin') {
      throw new Error('Unauthorized')
    }

    const categories = await prisma.category.findMany({
      orderBy: { name: 'asc' },
    })

    return { success: true, data: categories }
  } catch (error) {
    console.error('Error fetching categories:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to fetch categories' 
    }
  }
}

// Save draft
export async function saveDraftArticleAction(data: Omit<z.infer<typeof createArticleSchema>, 'status'>) {
  try {
    const session = await auth()
    if (!session?.user || session.user.role !== 'admin') {
      throw new Error('Unauthorized')
    }

    const draftData = {
      ...data,
      status: 'DRAFT' as const,
    }

    return createArticleAction(draftData)
  } catch (error) {
    console.error('Error saving draft:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to save draft' 
    }
  }
}

// Article media upload wrapper function
export async function uploadArticleMediaAction(formData: FormData) {
  const { uploadMediaAction } = await import('./media-actions')
  return uploadMediaAction(formData)
}

// Get tags
export async function getTagsAction() {
  try {
    const session = await auth()
    if (!session?.user || session.user.role !== 'admin') {
      throw new Error('Unauthorized')
    }

    const tags = await prisma.tag.findMany({
      orderBy: { name: 'asc' },
    })

    return { success: true, data: tags }
  } catch (error) {
    console.error('Error fetching tags:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to fetch tags' 
    }
  }
}

// Create tag
export async function createTagAction(data: {
  name: string
  slug: string
  description?: string
}) {
  try {
    const session = await auth()
    if (!session?.user || session.user.role !== 'admin') {
      throw new Error('Unauthorized')
    }

    const tag = await prisma.tag.create({
      data: {
        name: data.name,
        slug: data.slug,
        description: data.description || null,
      },
    })

    revalidatePath('/admin/articles')
    
    return { success: true, data: tag }
  } catch (error) {
    console.error('Error creating tag:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to create tag' 
    }
  }
}

// Get or create articles media category
export async function getOrCreateArticlesMediaCategoryAction() {
  try {
    const session = await auth()
    if (!session?.user || session.user.role !== 'admin') {
      throw new Error('Unauthorized')
    }

    // Check if articles category exists (by slug or name)
    let category = await prisma.mediaCategory.findFirst({
      where: {
        OR: [
          { slug: 'articles' },
          { name: '記事用画像' }
        ]
      }
    })

    // If not, create it
    if (!category) {
      // Get the next sort order
      const lastCategory = await prisma.mediaCategory.findFirst({
        orderBy: { sortOrder: 'desc' }
      })
      const nextSortOrder = (lastCategory?.sortOrder || 0) + 1

      try {
        category = await prisma.mediaCategory.create({
          data: {
            name: '記事用画像',
            slug: 'articles',
            description: 'ブログ記事やニュースで使用する画像',
            color: '#10b981',
            isSystem: true,
            sortOrder: nextSortOrder
          }
        })
      } catch (createError: any) {
        // If creation fails due to unique constraint, try to find the existing one
        if (createError.code === 'P2002') {
          category = await prisma.mediaCategory.findFirst({
            where: {
              OR: [
                { slug: 'articles' },
                { name: '記事用画像' }
              ]
            }
          })
          if (!category) {
            throw new Error('Failed to create or find articles category')
          }
        } else {
          throw createError
        }
      }
    }

    return { 
      success: true, 
      categoryId: category.id 
    }
  } catch (error) {
    console.error('Error getting/creating articles category:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to get/create articles category' 
    }
  }
}