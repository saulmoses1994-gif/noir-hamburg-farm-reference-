import BlogListBody from '@/components/public/BlogListBody'
import { listPublicBlog } from '@/lib/blog'
import { buildMetadata } from '@/lib/seo'
import { t } from '@/lib/i18n'

export const dynamic = 'force-dynamic'

export async function generateMetadata({ searchParams }) {
  const lang = 'en'
  const sp = (await searchParams) || {}
  // See DE counterpart — noindex filter variants so SEMrush stops flagging
  // them as "No self-referencing hreflang".
  const noindex = !!sp.category || !!sp.page
  return buildMetadata({
    title: t(lang, 'blog.list.metaTitle'),
    description: t(lang, 'blog.list.metaDesc'),
    path: '/blog',
    lang,
    noindex,
  })
}

export default async function BlogListPageEn({ searchParams }) {
  const sp = (await searchParams) || {}
  const activeCategory = typeof sp.category === 'string' ? sp.category : ''
  const all = await listPublicBlog()
  const counts = {}
  for (const p of all) {
    if (p.category) counts[p.category] = (counts[p.category] || 0) + 1
  }
  const categories = Object.keys(counts)
    .filter((c) => counts[c] > 0)
    .sort((a, b) => a.localeCompare(b))

  const posts = activeCategory
    ? all.filter((p) => p.category === activeCategory)
    : all

  return (
    <BlogListBody
      lang="en"
      posts={posts}
      categories={categories}
      activeCategory={activeCategory}
    />
  )
}
