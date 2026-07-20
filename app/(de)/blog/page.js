import BlogListBody from '@/components/public/BlogListBody'
import { listPublicBlog } from '@/lib/blog'
import { buildMetadata } from '@/lib/seo'
import { t } from '@/lib/i18n'

// PERF: switched from 'force-dynamic' to ISR — CMS PUT handlers already call revalidatePath()
export const revalidate = 300

export async function generateMetadata({ searchParams }) {
  const lang = 'de'
  const sp = (await searchParams) || {}
  // Faceted filter URLs (e.g. `/blog?category=Escort+Advice`) must NOT be
  // indexed as separate pages. They return 200 but their hreflang tags point
  // to the canonical `/blog` — so SEMrush was flagging them as "No self-
  // referencing hreflang" (11 URLs, one per category). Adding `noindex, follow`
  // tells crawlers this is a filter variant of `/blog`, resolving the error
  // while still allowing them to follow links onward.
  const noindex = !!sp.category || !!sp.page
  return buildMetadata({
    title: t(lang, 'blog.list.metaTitle'),
    description: t(lang, 'blog.list.metaDesc'),
    path: '/blog',
    lang,
    noindex,
  })
}

export default async function BlogListPage({ searchParams }) {
  const sp = (await searchParams) || {}
  const activeCategory = typeof sp.category === 'string' ? sp.category : ''
  const all = await listPublicBlog()
  // Derive category chip list dynamically from the published set (rule from
  // the plan: only render chips for categories that have >=1 published post).
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
      lang="de"
      posts={posts}
      categories={categories}
      activeCategory={activeCategory}
    />
  )
}
