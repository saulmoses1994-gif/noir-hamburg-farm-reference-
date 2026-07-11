import Link from 'next/link'
import Header from '@/components/site/Header'
import Footer from '@/components/site/Footer'
import Breadcrumbs from '@/components/site/Breadcrumbs'
import JsonLd from '@/components/site/JsonLd'
import { t, localePath, pick } from '@/lib/i18n'
import { siteUrl, breadcrumbSchema } from '@/lib/seo'

// /areas list page. Big editorial grid of all Hamburg districts.
export default function AreasBody({ lang, areas = [], settings = {} }) {
  const isEn = lang === 'en'
  const path = localePath(lang, '/areas')
  const homeHref = isEn ? '/en' : '/'
  const areaImages = settings.area_images || {}

  const jsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      name: t(lang, 'areas.metaTitle'),
      description: t(lang, 'areas.metaDesc'),
      url: `${siteUrl()}${path}`,
      inLanguage: isEn ? 'en' : 'de-DE',
      hasPart: areas.map((a) => ({
        '@type': 'Place',
        name: a.name,
        url: `${siteUrl()}${localePath(lang, `/escort/${a.slug}`)}`,
      })),
    },
    breadcrumbSchema([
      { name: t(lang, 'crumb.home'), url: homeHref },
      { name: t(lang, 'areas.crumb') },
    ]),
  ]

  return (
    <>
      <Header lang={lang} currentPath={path} />
      <main id="main">
        <JsonLd data={jsonLd} />

        <section className="px-6 md:px-12 lg:px-16 pt-12 pb-8" data-testid="areas-list">
          <Breadcrumbs items={[{ label: t(lang, 'crumb.home'), href: homeHref }, { label: t(lang, 'areas.crumb') }]} />
          <div className="mt-8 max-w-3xl">
            <span className="overline">{t(lang, 'areas.overline')}</span>
            <h1 className="font-heading text-5xl lg:text-7xl font-light tracking-tighter leading-none mt-4">
              {t(lang, 'areas.h1a')} <em className="italic accent-text">{t(lang, 'areas.h1b')}</em>
            </h1>
            <p className="mt-6 text-lg font-light text-[#6B5F5F] leading-relaxed">
              {t(lang, 'areas.intro')}
            </p>
          </div>
        </section>

        <section className="px-6 md:px-12 lg:px-16 pb-32">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-[#1A1414]/5">
            {areas.map((a) => {
              const img = areaImages[a.slug] || a.image
              const intro = pick(a, 'intro', lang) || ''
              return (
                <Link
                  key={a.slug}
                  href={localePath(lang, `/escort/${a.slug}`)}
                  className="bg-white hover:bg-[#FBF7F4] transition-colors duration-500 group block"
                  data-testid={`area-card-${a.slug}`}
                >
                  <div className="aspect-[4/3] overflow-hidden bg-[#F2EAE4]">
                    {img && (
                      <img
                        src={img}
                        alt={a.title || a.name}
                        loading="lazy"
                        className="w-full h-full object-cover opacity-100 group-hover:scale-105 transition-transform duration-1000"
                      />
                    )}
                  </div>
                  <div className="p-8">
                    <h2 className="font-heading text-2xl">{a.title || a.name}</h2>
                    {intro && <p className="text-sm font-light text-[#6B5F5F] mt-2 leading-relaxed">{intro}</p>}
                    <div className="mt-5 inline-flex items-center gap-2 text-xs font-mono uppercase tracking-[0.2em] accent-text">
                      {t(lang, 'areas.more')} →
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        </section>
      </main>
      <Footer lang={lang} />
    </>
  )
}
