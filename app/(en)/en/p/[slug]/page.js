import { notFound } from 'next/navigation'
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

export async function generateMetadata({ params }) {
  const { slug } = await params
  const p = await getPublicPageWithAlias(slug)
  if (!p) return { title: t('en', 'page.notFound') }
  const lang = 'en'
  const title = pick(p, 'meta_title', lang) || `${pick(p, 'title', lang)} | Noir Hamburg`
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
