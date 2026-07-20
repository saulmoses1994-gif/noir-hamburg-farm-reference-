import { notFound, permanentRedirect } from 'next/navigation'
import PageDetailBody from '@/components/public/PageDetailBody'
import { getPublicPageWithAlias, listPublicPages } from '@/lib/pages'
import { listServiceContent, listAreaContent } from '@/lib/service-content'
import { buildMetadata } from '@/lib/seo'
import { pick, t } from '@/lib/i18n'

export const dynamic = 'force-dynamic'
export const dynamicParams = true

export async function generateStaticParams() {
  try {
    const pages = await listPublicPages()
    return pages.map((p) => ({ slug: p.slug }))
  } catch {
    return []
  }
}

// Detect whether real EN copy exists for this CMS page. If any localized
// field is filled in, we treat the page as bilingual and render normally.
// Otherwise we 301-redirect the visitor to the DE canonical URL — SEMrush
// then sees a single indexable URL per document, closing the hreflang
// conflict class caused by returning 200 on a content-less EN slug.
function hasEnContent(p) {
  return !!(p && (p.title_en || p.meta_title_en || p.content_en || p.intro_en))
}

export async function generateMetadata({ params }) {
  const { slug } = await params
  const p = await getPublicPageWithAlias(slug)
  if (!p) return { title: t('en', 'page.notFound') }
  if (!hasEnContent(p)) {
    // The page render will 301 to the DE URL; return minimal metadata for
    // the (very rare) case the redirect is bypassed by a crawler.
    return { robots: { index: false, follow: true } }
  }
  const lang = 'en'
  const title = pick(p, 'meta_title', lang) || `${pick(p, 'title', lang)} — EN | Noir Hamburg`
  const description = pick(p, 'meta_description', lang) || pick(p, 'intro', lang) || ''
  return buildMetadata({
    title,
    description,
    image: p.hero_image,
    imageAlt: pick(p, 'title', lang),
    path: `/p/${slug}`,
    lang,
  })
}

export default async function PageDetailEn({ params }) {
  const { slug } = await params
  const page = await getPublicPageWithAlias(slug)
  if (!page) notFound()

  // 301 to the DE canonical when no EN translation exists. This is a
  // permanent redirect so SEMrush/Google stop crawling the EN slug entirely
  // — much cleaner than a noindex+canonical dance which some crawlers still
  // interpret as a hreflang conflict.
  if (!hasEnContent(page)) {
    permanentRedirect(`/p/${page.slug}`)
  }

  const [services, areas] = await Promise.all([
    listServiceContent().catch(() => []),
    listAreaContent().catch(() => []),
  ])

  const relatedServices = services.filter((s) => (page.related_services || []).includes(s.slug))
  const relatedLocations = areas.filter((a) => (page.related_locations || []).includes(a.slug))

  return (
    <PageDetailBody
      lang="en"
      page={page}
      relatedServices={relatedServices}
      relatedLocations={relatedLocations}
    />
  )
}
