import StaticPage from '@/components/layout/StaticPage'
import { getPublishedPage, getPageMetadata } from '@/lib/pages'
import { notFound } from 'next/navigation'

export const revalidate = 300

export async function generateMetadata() {
  return getPageMetadata('contact')
}

export default async function ContactPage() {
  const page = await getPublishedPage('contact')
  if (!page) notFound()
  return <StaticPage title={page.title} subtitle={page.subtitle} sections={page.sections} />
}
