import { listAllBlog } from '@/lib/blog'
import BlogListClient from '@/components/admin/BlogListClient'

export const dynamic = 'force-dynamic'

export default async function AdminBlogList() {
  const posts = await listAllBlog()
  const categories = Array.from(new Set(posts.map((p) => p.category).filter(Boolean))).sort()
  return <BlogListClient posts={posts} categories={categories} />
}
