export interface PageSection {
  id: string
  title: string
  content: string
  order: number
}

export interface PageContent {
  id: string
  slug: string
  title: string
  subtitle: string
  sections: PageSection[]
  metaTitle: string
  metaDescription: string
  isPublished: boolean
  updatedAt: string
}
