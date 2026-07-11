import { notFound } from 'next/navigation'
import BlogEditor from '@/components/admin/BlogEditor'
import { getAnyBlog } from '@/lib/blog'

export const dynamic = 'force-dynamic'

export default async function AdminBlogEdit({ params }) {
  const { slug } = await params
  const doc = await getAnyBlog(slug)
  if (!doc) notFound()
  return <BlogEditor mode="edit" initial={doc} />
}
