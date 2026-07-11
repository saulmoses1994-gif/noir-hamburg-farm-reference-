import { notFound } from 'next/navigation'
import AreaDetailBody from '@/components/public/AreaDetailBody'
import { getAreaContent, listAreaContent, listServiceContent } from '@/lib/service-content'
import { listPublicModelsByLocation } from '@/lib/models'
import { getSettings } from '@/lib/settings'
import { buildMetadata } from '@/lib/seo'
import { pick, t } from '@/lib/i18n'

export const revalidate = 300
export const dynamicParams = true

export async function generateStaticParams() {
  try {
    const areas = await listAreaContent()
    return areas.map((a) => ({ slug: a.slug }))
  } catch {
    return []
  }
}

export async function generateMetadata({ params }) {
  const { slug } = await params
  const a = await getAreaContent(slug)
  if (!a) return { title: t('en', 'area.notFound') }
  const lang = 'en'
  const title = pick(a, 'meta_title', lang) || `${a.title} \u2014 Premium Companionship in ${a.name} | Noir Hamburg`
  const description = pick(a, 'meta_description', lang) ||
    `${a.title}: ${pick(a, 'intro', lang) || ''} Discreet companionship in ${a.name} \u2014 exclusively arranged by Noir Hamburg.`
  return buildMetadata({
    title,
    description,
    image: a.image,
    imageAlt: pick(a, 'image_alt', lang) || a.title,
    path: `/escort/${slug}`,
    lang,
  })
}

export default async function AreaDetailPageEn({ params }) {
  const { slug } = await params
  const area = await getAreaContent(slug)
  if (!area) notFound()

  const [allAreas, allServices, models, settings] = await Promise.all([
    listAreaContent().catch(() => []),
    listServiceContent().catch(() => []),
    listPublicModelsByLocation(slug, { limit: 6 }).catch(() => []),
    getSettings().catch(() => ({})),
  ])

  const nearby = allAreas.filter((a) => a.slug !== slug).slice(0, 6)

  return (
    <AreaDetailBody
      lang="en"
      area={area}
      services={allServices}
      models={models}
      nearby={nearby}
      settings={settings}
    />
  )
}
