import { notFound } from 'next/navigation'
import BlogDetailBody from '@/components/public/BlogDetailBody'
import { getPublicBlog, listPublicBlog } from '@/lib/blog'
import { listPublicModels } from '@/lib/models'
import { listServiceContent, listAreaContent } from '@/lib/service-content'
import { buildMetadata, resolveArticleTitle } from '@/lib/seo'
import { pick, t } from '@/lib/i18n'

export const dynamic = 'force-dynamic'
export const dynamicParams = true

export async function generateStaticParams() {
  try {
    const posts = await listPublicBlog()
    return posts.map((p) => ({ slug: p.slug }))
  } catch {
    return []
  }
}

export async function generateMetadata({ params }) {
  const { slug } = await params
  const p = await getPublicBlog(slug)
  if (!p) return { title: t('de', 'blog.detail.notFoundTitle') }
  const lang = 'de'
  // Guard against duplicate title tags: if the authored meta_title doesn't
  // relate to this article's actual title (author copy-paste mistake), fall
  // back to `${title} | Noir Hamburg`. Fixes SEMrush's duplicate-title error
  // where a policy meta was pasted into a blog article's meta_title field.
  const title = resolveArticleTitle(pick(p, 'title', lang), pick(p, 'meta_title', lang))
  const description = pick(p, 'meta_description', lang) || pick(p, 'excerpt', lang) || ''
  // Suppress the EN hreflang alternate when the EN version has no real
  // content — the /en/blog/{slug} route is noindexed in that case and
  // pointing to it would create a "hreflang → noindex" conflict.
  const hasEnAlternate = !!(p.title_en || p.meta_title_en || p.content_en || p.excerpt_en)
  return buildMetadata({
    title,
    description,
    image: p.cover_image,
    imageAlt: pick(p, 'title', lang),
    path: `/blog/${slug}`,
    lang,
    hasEnAlternate,
  })
}

export default async function BlogDetailPage({ params }) {
  const { slug } = await params
  const post = await getPublicBlog(slug)
  if (!post) notFound()

  const [allPosts, allServices, allAreas, allModels] = await Promise.all([
    listPublicBlog().catch(() => []),
    listServiceContent().catch(() => []),
    listAreaContent().catch(() => []),
    listPublicModels().catch(() => []),
  ])

  const relatedPosts = allPosts
    .filter((p) => p.slug !== post.slug && p.category === post.category)
    .slice(0, 3)
  const relatedServices = allServices.filter((s) => (post.related_services || []).includes(s.slug))
  const relatedLocations = allAreas.filter((a) => (post.related_locations || []).includes(a.slug))
  const relatedModels = allModels.filter((m) => m.featured).slice(0, 3)

  return (
    <BlogDetailBody
      lang="de"
      post={post}
      relatedPosts={relatedPosts}
      relatedServices={relatedServices}
      relatedLocations={relatedLocations}
      relatedModels={relatedModels}
    />
  )
}
