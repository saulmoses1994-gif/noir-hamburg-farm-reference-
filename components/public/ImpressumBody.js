import Header from '@/components/site/Header'
import Footer from '@/components/site/Footer'
import Breadcrumbs from '@/components/site/Breadcrumbs'
import JsonLd from '@/components/site/JsonLd'
import { t, localePath } from '@/lib/i18n'
import { siteUrl, breadcrumbSchema } from '@/lib/seo'
import { IMPRESSUM_DEFAULT_HTML } from '@/lib/impressum_default'

export default function ImpressumBody({ lang, settings = {} }) {
  const isEn = lang === 'en'
  const path = localePath(lang, '/impressum')
  const homeHref = isEn ? '/en' : '/'

  // Legal boilerplate stays German (Impressum is a DE legal requirement).
  // Prefer the EN CMS field when populated, otherwise the DE CMS field, and
  // finally the bundled default so the page is never empty.
  const cmsContent = isEn
    ? (settings.impressum_content_en || settings.impressum_content || '')
    : (settings.impressum_content || '')
  const content = cmsContent || IMPRESSUM_DEFAULT_HTML

  const jsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      name: t(lang, 'impressum.metaTitle'),
      description: t(lang, 'impressum.metaDesc'),
      url: `${siteUrl()}${path}`,
      inLanguage: 'de',
    },
    breadcrumbSchema([
      { name: t(lang, 'crumb.home'), url: homeHref },
      { name: t(lang, 'impressum.crumb') },
    ]),
  ]

  return (
    <>
      <Header lang={lang} currentPath={path} />
      <main id="main">
        <JsonLd data={jsonLd} />

        <section className="px-6 md:px-12 lg:px-16 pt-12 pb-24" data-testid="impressum-page">
          <Breadcrumbs items={[{ label: t(lang, 'crumb.home'), href: homeHref }, { label: t(lang, 'impressum.crumb') }]} />
          <div className="mt-8 max-w-3xl">
            <span className="overline">{t(lang, 'impressum.overline')}</span>
            <h1 className="font-heading text-5xl lg:text-6xl font-light tracking-tighter leading-none mt-4">
              {t(lang, 'impressum.h1')}
            </h1>
          </div>
          <div
            className="prose-noir mt-12 max-w-2xl"
            data-testid="impressum-content"
            dangerouslySetInnerHTML={{ __html: content }}
          />
        </section>
      </main>
      <Footer lang={lang} />
    </>
  )
}
