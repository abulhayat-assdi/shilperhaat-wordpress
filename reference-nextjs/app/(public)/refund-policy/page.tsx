import StaticPage from '@/components/layout/StaticPage'
import { getPublishedPage, getPageMetadata } from '@/lib/pages'
import { notFound } from 'next/navigation'

export const revalidate = 300

export async function generateMetadata() {
  return getPageMetadata('refund-policy')
}

export default async function RefundPolicyPage() {
  const page = await getPublishedPage('refund-policy')
  if (!page) notFound()
  return <StaticPage title={page.title} subtitle={page.subtitle} sections={page.sections} />
}
