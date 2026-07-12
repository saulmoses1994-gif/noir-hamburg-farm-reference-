import { notFound } from 'next/navigation'
import BlogDetailBody from '@/components/public/BlogDetailBody'
import { getPublicBlog, listPublicBlog } from '@/lib/blog'
import { listPublicModels } from '@/lib/models'
import { listServiceContent, listAreaContent } from '@/lib/service-content'
import { buildMetadata } from '@/lib/seo'
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
  if (!p) return { title: t('en', 'blog.detail.notFoundTitle') }
  const lang = 'en'
  const title = pick(p, 'meta_title', lang) || `${pick(p, 'title', lang)} | Noir Hamburg`
  const description = pick(p, 'meta_description', lang) || pick(p, 'excerpt', lang) || ''
  return buildMetadata({
    title,
    description,
    image: p.cover_image,
    imageAlt: pick(p, 'title', lang),
    path: `/blog/${slug}`,
    lang,
  })
}

export default async function BlogDetailPageEn({ params }) {
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
      lang="en"
      post={post}
      relatedPosts={relatedPosts}
      relatedServices={relatedServices}
      relatedLocations={relatedLocations}
      relatedModels={relatedModels}
    />
  )
}
