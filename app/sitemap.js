import { listServiceContent, listAreaContent } from '@/lib/service-content'
import { listPublicModels } from '@/lib/models'
import { listPublicBlog } from '@/lib/blog'
import { listPublicPages } from '@/lib/pages'

const BASE = process.env.NEXT_PUBLIC_SITE_URL || 'https://noir-hamburg.de'

export default async function sitemap() {
  const [services, areas, models, blog, pages] = await Promise.all([
    listServiceContent().catch(() => []),
    listAreaContent().catch(() => []),
    listPublicModels().catch(() => []),
    listPublicBlog().catch(() => []),
    listPublicPages().catch(() => []),
  ])

  const staticDE = [
    '', '/models', '/services', '/escort-hamburg', '/areas',
    '/blog', '/faq', '/ueber-uns', '/kontakt', '/impressum', '/p/diskretion',
  ]
  const staticEN = [
    '/en', '/en/models', '/en/services', '/en/escort-hamburg', '/en/areas',
    '/en/blog', '/en/faq', '/en/about', '/en/contact', '/en/imprint', '/en/p/diskretion',
  ]

  const staticEntries = staticDE.map((p) => {
    const dePath = p || '/'
    const enSlug = { '/ueber-uns': '/about', '/kontakt': '/contact', '/impressum': '/imprint' }[dePath] || dePath
    const enPath = `/en${enSlug === '/' ? '' : enSlug}`
    return {
      url: `${BASE}${dePath}`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: dePath === '/' ? 1 : 0.7,
      alternates: {
        languages: {
          'de-DE': `${BASE}${dePath}`,
          en: `${BASE}${enPath}`,
          'x-default': `${BASE}${dePath}`,
        },
      },
    }
  })

  const serviceEntries = services.map((s) => ({
    url: `${BASE}/services/${s.slug}`,
    lastModified: s.updated_at ? new Date(s.updated_at) : new Date(),
    changeFrequency: 'weekly',
    priority: 0.8,
    alternates: {
      languages: {
        'de-DE': `${BASE}/services/${s.slug}`,
        en: `${BASE}/en/services/${s.slug}`,
        'x-default': `${BASE}/services/${s.slug}`,
      },
    },
  }))

  const areaEntries = areas.map((a) => ({
    url: `${BASE}/escort/${a.slug}`,
    lastModified: a.updated_at ? new Date(a.updated_at) : new Date(),
    changeFrequency: 'weekly',
    priority: 0.7,
    alternates: {
      languages: {
        'de-DE': `${BASE}/escort/${a.slug}`,
        en: `${BASE}/en/escort/${a.slug}`,
        'x-default': `${BASE}/escort/${a.slug}`,
      },
    },
  }))

  const modelEntries = models.map((m) => ({
    url: `${BASE}/models/${m.slug}`,
    lastModified: m.updated_at ? new Date(m.updated_at) : new Date(),
    changeFrequency: 'weekly',
    priority: 0.8,
    alternates: {
      languages: {
        'de-DE': `${BASE}/models/${m.slug}`,
        en: `${BASE}/en/models/${m.slug}`,
        'x-default': `${BASE}/models/${m.slug}`,
      },
    },
  }))

  const blogEntries = blog.map((b) => ({
    url: `${BASE}/blog/${b.slug}`,
    lastModified: b.updated_at ? new Date(b.updated_at) : new Date(),
    changeFrequency: 'monthly',
    priority: 0.6,
    alternates: {
      languages: {
        'de-DE': `${BASE}/blog/${b.slug}`,
        en: `${BASE}/en/blog/${b.slug}`,
        'x-default': `${BASE}/blog/${b.slug}`,
      },
    },
  }))

  const pageEntries = pages.map((p) => ({
    url: `${BASE}/p/${p.slug}`,
    lastModified: p.updated_at ? new Date(p.updated_at) : new Date(),
    changeFrequency: 'monthly',
    priority: 0.5,
    alternates: {
      languages: {
        'de-DE': `${BASE}/p/${p.slug}`,
        en: `${BASE}/en/p/${p.slug}`,
        'x-default': `${BASE}/p/${p.slug}`,
      },
    },
  }))

  return [...staticEntries, ...serviceEntries, ...areaEntries, ...modelEntries, ...blogEntries, ...pageEntries]
}
