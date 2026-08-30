import { notFound, permanentRedirect } from 'next/navigation'
import BlogDetailBody from '@/components/public/BlogDetailBody'
import { getPublicBlog, getPublicBlogByEnSlug, listPublicBlog, hasEnBlogContent } from '@/lib/blog'
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
    // Only pre-render EN pages for posts that actually have EN content and
    // an EN slug — skipping the rest avoids thin/duplicate EN URLs.
    return posts
      .filter((p) => p.slug_en && hasEnBlogContent(p))
      .map((p) => ({ slug: p.slug_en }))
  } catch { return [] }
}

// Fetch helper: try slug_en first, then fall back to a legacy DE slug lookup.
// The legacy lookup exists solely so we can 301 old indexed /en/blog/{de-slug}
// URLs to their new /en/blog/{slug_en} destinations.
async function findPostForEnRoute(paramSlug) {
  const byEn = await getPublicBlogByEnSlug(paramSlug)
  if (byEn) return { post: byEn, isEnSlug: true }
  const byDe = await getPublicBlog(paramSlug)
  if (byDe) return { post: byDe, isEnSlug: false }
  return { post: null, isEnSlug: false }
}

export async function generateMetadata({ params }) {
  const { slug } = await params
  const { post, isEnSlug } = await findPostForEnRoute(slug)
  if (!post || !hasEnBlogContent(post)) return { title: t('en', 'blog.detail.notFoundTitle') }
  // Legacy slug → use the canonical EN URL in metadata (browser will follow
  // the 301 anyway; this just keeps social crawlers on the canonical).
  const canonicalSlug = post.slug_en || slug
  const title = resolveArticleTitle(post.title_en, post.meta_title_en)
  const description = post.meta_description_en || post.excerpt_en || ''
  // OG fallback: prefer EN OG fields → EN meta_* → same for description.
  const ogTitle = (post.og_title_en || '').trim() || title
  const ogDescription = (post.og_description_en || '').trim() || description
  const coverAlt = (post.cover_image_alt_en || '').trim() || post.title_en
  const authorName = (post.author || '').trim() || 'Noir Hamburg'
  const toIso = (v) => { try { return v ? new Date(v).toISOString() : undefined } catch { return undefined } }
  // EN category / tags fall back to the DE values when a language-specific
  // translation was not authored — better than emitting nothing.
  const section = post.category_en || post.category || undefined
  const rawTags = Array.isArray(post.tags_en) && post.tags_en.length
    ? post.tags_en
    : (Array.isArray(post.tags) ? post.tags : [])
  const tags = rawTags.filter(Boolean)
  return buildMetadata({
    title,
    description,
    ogTitle,
    ogDescription,
    image: post.cover_image,
    imageAlt: coverAlt,
    path: `/blog/${canonicalSlug}`,       // buildMetadata will apply /en prefix
    lang: 'en',
    hasEnAlternate: true,
    enPath: `/en/blog/${canonicalSlug}`,
    // Also emit the DE alternate for a proper hreflang pair.
    dePath: `/blog/${post.slug}`,
    // Article OpenGraph — see DE page for full rationale.
    ogType: 'article',
    publishedTime: toIso(post.created_at),
    modifiedTime: toIso(post.updated_at || post.created_at),
    authors: [authorName],
    section,
    tags: tags.length ? tags : undefined,
  })
}

export default async function BlogDetailPageEn({ params }) {
  const { slug } = await params
  const { post, isEnSlug } = await findPostForEnRoute(slug)

  // Not a known slug in EITHER language → hard 404.
  if (!post) notFound()

  // No EN copy → the article should not exist in English. Do NOT redirect to
  // the DE URL here (per user's Fix 2 rule); return 404 so search engines
  // don't index a thin/duplicated EN URL.
  if (!hasEnBlogContent(post)) notFound()

  // Legacy DE slug matched but the canonical EN URL is different → 301.
  // Preserves any SEO value that accrued on the old /en/blog/{de-slug} URL.
  if (!isEnSlug && post.slug_en && post.slug_en !== slug) {
    permanentRedirect(`/en/blog/${post.slug_en}`)
  }

  const [allPosts, allServices, allAreas, allModels] = await Promise.all([
    listPublicBlog().catch(() => []),
    listServiceContent().catch(() => []),
    listAreaContent().catch(() => []),
    listPublicModels().catch(() => []),
  ])

  // Related posts: same category, but ONLY those that also have EN copy.
  // Guarantees language-locked internal linking (EN articles link only to
  // other EN articles that actually exist in English).
  const relatedPosts = allPosts
    .filter((p) => p.slug !== post.slug && p.category === post.category && hasEnBlogContent(p) && p.slug_en)
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
      counterpartHref={`/blog/${post.slug}`}
    />
  )
}
