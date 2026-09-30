import StaticPage from '@/components/layout/StaticPage'
import { getPublishedPage, getPageMetadata } from '@/lib/pages'
import { notFound } from 'next/navigation'

export const revalidate = 300

export async function generateMetadata() {
  return getPageMetadata('support')
}

export default async function SupportPage() {
  const page = await getPublishedPage('support')
  if (!page) notFound()
  return <StaticPage title={page.title} subtitle={page.subtitle} sections={page.sections} />
}
