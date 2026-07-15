import { notFound } from 'next/navigation'
import { getPublicModel, listPublicModels } from '@/lib/models'
import { getBrand } from '@/lib/brand'
import { buildMetadata } from '@/lib/seo'
import { pick } from '@/lib/i18n'
import { ModelDetailBody } from '@/app/(de)/models/[slug]/page'

export const dynamic = 'force-dynamic'
export const dynamicParams = true

export async function generateStaticParams() {
  try { const ms = await listPublicModels(); return ms.map((m) => ({ slug: m.slug })) } catch { return [] }
}

export async function generateMetadata({ params }) {
  const { slug } = await params
  const m = await getPublicModel(slug)
  if (!m) return { title: 'Model not found' }
  return buildMetadata({
    title: pick(m, 'meta_title', 'en') || `${m.name} — Escort Hamburg | Noir Hamburg`,
    description: pick(m, 'meta_description', 'en') || pick(m, 'bio', 'en'),
    image: m.cover_image, imageAlt: m.name,
    path: `/models/${slug}`, lang: 'en',
  })
}

export default async function ModelDetailEn({ params }) {
  const { slug } = await params
  const [m, brand] = await Promise.all([getPublicModel(slug), getBrand('en')])
  if (!m) notFound()
  return <ModelDetailBody m={m} lang="en" slug={slug} brand={brand} />
}
