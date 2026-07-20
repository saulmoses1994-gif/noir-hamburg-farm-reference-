import { listServiceContent, listAreaContent } from '@/lib/service-content'
import { listPublicModels } from '@/lib/models'
import { listPublicBlog } from '@/lib/blog'
import { listPublicPages } from '@/lib/pages'

// CRITICAL: sitemap MUST be regenerated on every request, otherwise it's
// baked at build time with a snapshot of the DB and stays out of date until
// the next deploy. That was the root cause of SEMrush's persistent "hreflang
// conflicts" — the production sitemap only contained the 20 static routes
// while search engines and SEMrush kept discovering the DB-driven detail
// URLs (models, services, blog, /p/*) via internal crawling and comparing
// them against a stale sitemap.
// PERF: switched from 'force-dynamic' to ISR — CMS PUT handlers all call
// revalidatePath('/sitemap.xml') when content changes, so a 5-minute cache
// window can never serve a stale sitemap after a real edit.
export const revalidate = 300

const BASE = process.env.NEXT_PUBLIC_SITE_URL || 'https://noir-hamburg.com'

// Slug pairs where the EN URL differs from the DE URL.
const EN_SLUG_MAP = { '/ueber-uns': '/about', '/kontakt': '/contact', '/impressum': '/imprint' }

// Language codes must match on-page hreflang tags exactly. We emit language-
// only codes (`de`, `en`) to prevent SEMrush "language mismatch" warnings.
// URL construction uses NO trailing slash on the homepage — we align with the
// canonical tag emitted by `lib/seo.js` (`${SITE_URL}${path === '/' ? '' : path}`)
// so that SEMrush sees the same absolute URL in both places.
function abs(path) {
  return `${BASE}${path === '/' ? '' : path}`
}

function alternates(dePath, enPath, { hasEnAlternate = true } = {}) {
  const languages = { de: abs(dePath) }
  if (hasEnAlternate) languages.en = abs(enPath)
  languages['x-default'] = abs(dePath)
  return { languages }
}

// Emit the DE URL always. Emit the EN URL only when the EN counterpart is
// indexable — otherwise Google would fetch the noindex page and treat the
// hreflang chain as broken.
function pair(dePath, enPath, opts = {}) {
  const { changeFrequency = 'weekly', priority = 0.7, lastModified, hasEnAlternate = true } = opts
  const lm = lastModified || new Date()
  const alts = alternates(dePath, enPath, { hasEnAlternate })
  const entries = [{ url: abs(dePath), lastModified: lm, changeFrequency, priority, alternates: alts }]
  if (hasEnAlternate) {
    entries.push({ url: abs(enPath), lastModified: lm, changeFrequency, priority, alternates: alts })
  }
  return entries
}

// Helper predicates: does a CMS doc actually have real localized copy?
const hasEnModel = (m) => !!(m.meta_title_en || m.meta_description_en || m.bio_en)
const hasEnBlog = (b) => !!(b.title_en || b.meta_title_en || b.content_en || b.excerpt_en)
const hasEnPage = (p) => !!(p.title_en || p.meta_title_en || p.content_en || p.intro_en)

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
    { priority: 0.8, lastModified: m.updated_at ? new Date(m.updated_at) : new Date(), hasEnAlternate: hasEnModel(m) },
  ))

  const blogEntries = blog.flatMap((b) => pair(
    `/blog/${b.slug}`, `/en/blog/${b.slug}`,
    { priority: 0.6, changeFrequency: 'monthly', lastModified: b.updated_at ? new Date(b.updated_at) : new Date(), hasEnAlternate: hasEnBlog(b) },
  ))

  const pageEntries = pages.flatMap((p) => pair(
    `/p/${p.slug}`, `/en/p/${p.slug}`,
    { priority: 0.5, changeFrequency: 'monthly', lastModified: p.updated_at ? new Date(p.updated_at) : new Date(), hasEnAlternate: hasEnPage(p) },
  ))

  return [...staticEntries, ...serviceEntries, ...areaEntries, ...modelEntries, ...blogEntries, ...pageEntries]
}
