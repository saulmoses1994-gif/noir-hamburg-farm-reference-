import { notFound } from 'next/navigation'
import BlogDetailBody from '@/components/public/BlogDetailBody'
import { getPublicBlog, listPublicBlog, hasEnBlogContent } from '@/lib/blog'
import { listPublicModels } from '@/lib/models'
import { listServiceContent, listAreaContent } from '@/lib/service-content'
import { buildMetadata, resolveArticleTitle } from '@/lib/seo'
import { t } from '@/lib/i18n'

// PERF: ISR — CMS PUT handlers call revalidatePath() so edits propagate promptly.
export const revalidate = 300
export const dynamicParams = true

export async function generateStaticParams() {
  try {
    const posts = await listPublicBlog()
    return posts.map((p) => ({ slug: p.slug }))
  } catch { return [] }
}

export async function generateMetadata({ params }) {
  const { slug } = await params
  const p = await getPublicBlog(slug)
  if (!p) return { title: t('de', 'blog.detail.notFoundTitle') }
  const lang = 'de'
  // DE page renders DE fields directly — no `pick(lang)` fallback here.
  const title = resolveArticleTitle(p.title, p.meta_title)
  const description = p.meta_description || p.excerpt || ''
  // MULTILINGUAL SEO: emit hreflang=EN alternate only when a real EN
  // counterpart exists (title_en + content_en + slug_en). Otherwise this
  // page is the sole indexable version.
  const hasEnAlternate = hasEnBlogContent(p) && !!p.slug_en
  return buildMetadata({
    title,
    description,
    image: p.cover_image,
    imageAlt: p.title,
    path: `/blog/${slug}`,
    lang,
    hasEnAlternate,
    enPath: hasEnAlternate ? `/en/blog/${p.slug_en}` : undefined,
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

  // Related posts: same category, and language-scoped — DE page shows any
  // DE-published post in the same category. Slug used for the link is the
  // DE slug (renders under /blog/{de-slug}).
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
      // Language-switcher target: the EN URL of *this* article, when it exists.
      counterpartHref={hasEnBlogContent(post) && post.slug_en ? `/en/blog/${post.slug_en}` : null}
    />
  )
}
