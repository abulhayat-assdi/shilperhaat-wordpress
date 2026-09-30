export interface BlogPost {
  id: string
  slug: string
  title: string
  excerpt: string
  content: string  // HTML
  coverImage: string
  author: string
  publishedAt: string  // ISO string
  updatedAt: string
  category: string
  tags: string[]
  isPublished: boolean
  readTime: number  // minutes
}

// Serialize a Prisma BlogPost row (Date fields) to the plain-JSON shape
export function serializeBlogPost(p: {
  id: string
  slug: string
  title: string
  excerpt: string
  content: string
  coverImage: string
  author: string
  category: string
  tags: string[]
  isPublished: boolean
  readTime: number
  publishedAt: Date
  updatedAt: Date
}): BlogPost {
  return {
    id: p.id,
    slug: p.slug,
    title: p.title,
    excerpt: p.excerpt,
    content: p.content,
    coverImage: p.coverImage,
    author: p.author,
    publishedAt: p.publishedAt.toISOString(),
    updatedAt: p.updatedAt.toISOString(),
    category: p.category,
    tags: p.tags,
    isPublished: p.isPublished,
    readTime: p.readTime,
  }
}

export function ensureUniqueSlug(
  slug: string,
  existingPosts: BlogPost[],
  excludeId?: string
): string {
  const taken = new Set(
    existingPosts.filter((p) => p.id !== excludeId).map((p) => p.slug)
  )
  if (!taken.has(slug)) return slug
  let counter = 2
  while (taken.has(`${slug}-${counter}`)) counter++
  return `${slug}-${counter}`
}

export function generateSlug(title: string): string {
  const ascii = title
    .toLowerCase()
    .replace(/[^\x00-\x7F]/g, '') // remove non-ASCII (Bengali chars)
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
  if (ascii.length >= 4) return ascii
  // Fallback: use timestamp when title is entirely non-ASCII
  return 'post-' + Date.now().toString(36)
}


export function estimateReadTime(content: string): number {
  const text = content.replace(/<[^>]+>/g, ' ')
  const words = text.trim().split(/\s+/).filter(Boolean).length
  const minutes = Math.round(words / 200)
  return Math.max(1, minutes)
}
