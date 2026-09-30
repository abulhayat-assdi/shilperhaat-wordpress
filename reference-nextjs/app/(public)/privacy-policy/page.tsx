import StaticPage from '@/components/layout/StaticPage'
import { getPublishedPage, getPageMetadata } from '@/lib/pages'
import { notFound } from 'next/navigation'

export const revalidate = 300

export async function generateMetadata() {
  return getPageMetadata('privacy-policy')
}

export default async function PrivacyPolicyPage() {
  const page = await getPublishedPage('privacy-policy')
  if (!page) notFound()
  return <StaticPage title={page.title} subtitle={page.subtitle} sections={page.sections} />
}
