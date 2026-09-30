import { requirePageAccess } from '@/lib/auth'
import BlogManagerClient from './BlogManagerClient'

export default async function AdminBlogPage() {
  await requirePageAccess('blog')
  return <BlogManagerClient />
}
