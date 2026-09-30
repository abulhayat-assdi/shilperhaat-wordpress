import StaticPage from '@/components/layout/StaticPage'
import { getPublishedPage, getPageMetadata } from '@/lib/pages'
import { notFound } from 'next/navigation'

export const revalidate = 300

export async function generateMetadata() {
  return getPageMetadata('shipping-info')
}

export default async function ShippingInfoPage() {
  const page = await getPublishedPage('shipping-info')
  if (!page) notFound()
  return <StaticPage title={page.title} subtitle={page.subtitle} sections={page.sections} />
}
