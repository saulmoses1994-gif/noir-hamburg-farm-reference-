import { listServiceContent, listAreaContent } from '@/lib/service-content'
import { listPublicModels } from '@/lib/models'
import { listPublicBlog } from '@/lib/blog'
import { listPublicPages } from '@/lib/pages'

const BASE = process.env.NEXT_PUBLIC_SITE_URL || 'https://noir-hamburg.com'

// Slug pairs where the EN URL differs from the DE URL.
const EN_SLUG_MAP = { '/ueber-uns': '/about', '/kontakt': '/contact', '/impressum': '/imprint' }

// Language codes must match on-page hreflang tags exactly. We emit language-
// only codes (`de`, `en`) to prevent SEMrush "language mismatch" warnings.
function alternates(dePath, enPath) {
  return {
    languages: {
      de: `${BASE}${dePath}`,
      en: `${BASE}${enPath}`,
      'x-default': `${BASE}${dePath}`,
    },
  }
}

// Emit BOTH the DE and EN URL as their own `<url>` entries (each with the same
// reciprocal alternates). This satisfies Google/SEMrush's requirement that
// every hreflang-referenced URL exists as its own sitemap entry.
function pair(dePath, enPath, { changeFrequency = 'weekly', priority = 0.7, lastModified } = {}) {
  const alts = alternates(dePath, enPath)
  const lm = lastModified || new Date()
  return [
    { url: `${BASE}${dePath}`, lastModified: lm, changeFrequency, priority, alternates: alts },
    { url: `${BASE}${enPath}`, lastModified: lm, changeFrequency, priority, alternates: alts },
  ]
}

export default async function sitemap() {
  const [services, areas, models, blog, pages] = await Promise.all([
    listServiceContent().catch(() => []),
    listAreaContent().catch(() => []),
    listPublicModels().catch(() => []),
    listPublicBlog().catch(() => []),
    listPublicPages().catch(() => []),
  ])

  const staticDePaths = [
    { de: '/', priority: 1 },
    { de: '/models', priority: 0.7 },
    { de: '/services', priority: 0.7 },
    { de: '/escort-hamburg', priority: 0.7 },
    { de: '/areas', priority: 0.7 },
    { de: '/blog', priority: 0.7 },
    { de: '/faq', priority: 0.7 },
    { de: '/ueber-uns', priority: 0.7 },
    { de: '/kontakt', priority: 0.7 },
    { de: '/impressum', priority: 0.5 },
    { de: '/p/diskretion', priority: 0.5 },
  ]

  const staticEntries = staticDePaths.flatMap(({ de, priority }) => {
    const enSlug = EN_SLUG_MAP[de] || de
    const enPath = `/en${enSlug === '/' ? '' : enSlug}`
    return pair(de, enPath, { priority })
  })

  const serviceEntries = services.flatMap((s) => pair(
    `/services/${s.slug}`, `/en/services/${s.slug}`,
    { priority: 0.8, lastModified: s.updated_at ? new Date(s.updated_at) : new Date() },
  ))

  const areaEntries = areas.flatMap((a) => pair(
    `/escort/${a.slug}`, `/en/escort/${a.slug}`,
    { priority: 0.7, lastModified: a.updated_at ? new Date(a.updated_at) : new Date() },
  ))

  const modelEntries = models.flatMap((m) => pair(
    `/models/${m.slug}`, `/en/models/${m.slug}`,
    { priority: 0.8, lastModified: m.updated_at ? new Date(m.updated_at) : new Date() },
  ))

  const blogEntries = blog.flatMap((b) => pair(
    `/blog/${b.slug}`, `/en/blog/${b.slug}`,
    { priority: 0.6, changeFrequency: 'monthly', lastModified: b.updated_at ? new Date(b.updated_at) : new Date() },
  ))

  const pageEntries = pages.flatMap((p) => pair(
    `/p/${p.slug}`, `/en/p/${p.slug}`,
    { priority: 0.5, changeFrequency: 'monthly', lastModified: p.updated_at ? new Date(p.updated_at) : new Date() },
  ))

  return [...staticEntries, ...serviceEntries, ...areaEntries, ...modelEntries, ...blogEntries, ...pageEntries]
}
