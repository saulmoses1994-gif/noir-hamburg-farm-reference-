import Link from 'next/link'
import Header from '@/components/site/Header'
import Footer from '@/components/site/Footer'
import Breadcrumbs from '@/components/site/Breadcrumbs'
import JsonLd from '@/components/site/JsonLd'
import { pick, t, localePath } from '@/lib/i18n'
import { siteUrl, breadcrumbSchema } from '@/lib/seo'

// Reusable body for the CMS-driven /p/[slug] custom pages.
// EN fallback follows rule (a): if _en fields are empty, we render DE and
// show a small "EN preview" banner above the article.
export default function PageDetailBody({ lang, page, relatedServices = [], relatedLocations = [] }) {
  const isEn = lang === 'en'
  const title = pick(page, 'title', lang) || ''
  const h1 = pick(page, 'h1', lang) || title
  const intro = pick(page, 'intro', lang) || ''
  const content = pick(page, 'content', lang) || ''
  const enFallback = isEn && !page.content_en
  const detailPath = localePath(lang, `/p/${page.slug}`)
  const homeHref = lang === 'en' ? '/en' : '/'

  const jsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      name: title,
      description: pick(page, 'meta_description', lang) || intro || undefined,
      url: `${siteUrl()}${detailPath}`,
      inLanguage: isEn && page.content_en ? 'en' : 'de-DE',
      image: page.hero_image || undefined,
    },
    breadcrumbSchema([
      { name: t(lang, 'crumb.home'), url: homeHref },
      { name: title },
    ]),
  ]

  return (
    <>
      <Header lang={lang} currentPath={detailPath} />
      <main id="main">
        <JsonLd data={jsonLd} />

        {page.hero_image ? (
          <section className="relative h-[55vh] flex items-end" data-testid="page-hero">
            <div className="absolute inset-0">
              <img src={page.hero_image} alt={title} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#1A1414] via-[#1A1414]/55 to-transparent" />
            </div>
            <div className="relative z-10 px-6 md:px-12 lg:px-16 pb-12 max-w-4xl text-white">
              <Breadcrumbs
                dark
                items={[{ label: t(lang, 'crumb.home'), href: homeHref }, { label: title }]}
              />
              <h1 className="font-heading text-5xl lg:text-7xl font-semibold mt-6 text-white">{h1}</h1>
              {intro && <p className="font-heading italic text-xl text-white/80 mt-4 max-w-3xl">{intro}</p>}
            </div>
          </section>
        ) : (
          <section className="px-6 md:px-12 lg:px-16 pt-12 pb-4">
            <Breadcrumbs items={[{ label: t(lang, 'crumb.home'), href: homeHref }, { label: title }]} />
            <h1 className="font-heading text-4xl lg:text-6xl font-semibold mt-6">{h1}</h1>
            {intro && <p className="text-[#6B5F5F] mt-4 max-w-3xl text-lg">{intro}</p>}
          </section>
        )}

        <article className="px-6 md:px-12 lg:px-16 py-16">
          {enFallback && (
            <div className="max-w-3xl mb-8 p-4 border-l-4 border-[#8B1538] bg-[#FAF5F2] text-sm text-[#4A3F3F]" data-testid="en-fallback-note">
              <strong className="text-[#8B1538]">{t(lang, 'page.enFallbackTitle')}</strong>{' '}
              {t(lang, 'page.enFallback')}
            </div>
          )}
          <div
            className="prose-noir max-w-3xl"
            dangerouslySetInnerHTML={{ __html: content }}
            data-testid="page-content"
          />
        </article>

        {(relatedServices.length > 0 || relatedLocations.length > 0) && (
          <section className="px-6 md:px-12 lg:px-16 py-12 bg-[#FBF7F4]">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-5xl">
              {relatedServices.length > 0 && (
                <div>
                  <span className="overline">{t(lang, 'page.relatedServices')}</span>
                  <ul className="mt-4 space-y-2">
                    {relatedServices.map((s) => (
                      <li key={s.slug}>
                        <Link
                          href={localePath(lang, `/services/${s.slug}`)}
                          className="font-heading text-xl link-underline hover:accent-text inline-flex items-center gap-2"
                        >
                          <span className="accent-text">→</span> {pick(s, 'title', lang) || s.title}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {relatedLocations.length > 0 && (
                <div>
                  <span className="overline">{t(lang, 'page.relatedLocations')}</span>
                  <ul className="mt-4 space-y-2">
                    {relatedLocations.map((l) => (
                      <li key={l.slug}>
                        <Link
                          href={localePath(lang, `/escort/${l.slug}`)}
                          className="font-heading text-xl link-underline hover:accent-text inline-flex items-center gap-2"
                        >
                          <span className="accent-text">→</span> {pick(l, 'name', lang) || l.name || l.title}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </section>
        )}
      </main>
      <Footer lang={lang} />
    </>
  )
}
