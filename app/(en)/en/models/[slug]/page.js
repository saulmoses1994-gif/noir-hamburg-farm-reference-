import { notFound } from 'next/navigation'
import { getPublicModel, listPublicModels } from '@/lib/models'
import { getBrand } from '@/lib/brand'
import { buildMetadata } from '@/lib/seo'
import { pick } from '@/lib/i18n'
import { ModelDetailBody } from '@/app/(de)/models/[slug]/page'

// PERF: switched from 'force-dynamic' to ISR — CMS PUT handlers already call revalidatePath()
export const revalidate = 300
export const dynamicParams = true

export async function generateStaticParams() {
  try { const ms = await listPublicModels(); return ms.map((m) => ({ slug: m.slug })) } catch { return [] }
}

export async function generateMetadata({ params }) {
  const { slug } = await params
  const m = await getPublicModel(slug)
  if (!m) return { title: 'Model not found' }

  // Detect whether real EN content actually exists for this model. If none of
  // the localized fields have been filled in, we must not tell Google this is
  // a proper English page — that would create a duplicate-title/language-
  // mismatch error against the DE original. Instead, noindex the EN variant
  // and let the DE version be the sole indexable one via the hreflang chain.
  const noindex = !(m.meta_title_en || m.meta_description_en || m.bio_en)
  return buildMetadata({
    // Use a language-differentiating fallback so DE and EN never collide on
    // the same string when meta_title_en is empty.
    title: pick(m, 'meta_title', 'en') || `${m.name} — Escort in Hamburg | Noir Hamburg`,
    description: pick(m, 'meta_description', 'en') || pick(m, 'bio', 'en'),
    image: m.cover_image, imageAlt: m.name,
    path: `/models/${slug}`, lang: 'en',
    noindex,
  })
}

export default async function ModelDetailEn({ params }) {
  const { slug } = await params
  const [m, brand] = await Promise.all([getPublicModel(slug), getBrand('en')])
  if (!m) notFound()
  return <ModelDetailBody m={m} lang="en" slug={slug} brand={brand} />
}
