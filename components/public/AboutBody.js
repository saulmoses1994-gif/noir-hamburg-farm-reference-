import Link from 'next/link'
import Header from '@/components/site/Header'
import Footer from '@/components/site/Footer'
import Breadcrumbs from '@/components/site/Breadcrumbs'
import JsonLd from '@/components/site/JsonLd'
import { t, localePath } from '@/lib/i18n'
import { siteUrl, breadcrumbSchema } from '@/lib/seo'
import {
  ABOUT_DEFAULT_HTML_DE,
  ABOUT_DEFAULT_HTML_EN,
  ADVANTAGES_DE,
  ADVANTAGES_EN,
} from '@/lib/about_defaults'

const FALLBACK_ABOUT_IMAGE =
  'https://images.pexels.com/photos/19923619/pexels-photo-19923619.jpeg?auto=compress&cs=tinysrgb&w=1200'

export default function AboutBody({ lang, settings = {} }) {
  const isEn = lang === 'en'
  const path = localePath(lang, '/ueber-uns')
  const homeHref = isEn ? '/en' : '/'
  const contactHref = localePath(lang, '/kontakt')
  const aboutImage = settings.about_image || FALLBACK_ABOUT_IMAGE

  // Rule (a): if the EN long-form field is empty, fall back to the DE version.
  // Bundled default HTML is used when both CMS fields are empty.
  const cmsContent = isEn
    ? (settings.about_content_en || settings.about_content || '')
    : (settings.about_content || '')
  const content = cmsContent || (isEn ? ABOUT_DEFAULT_HTML_EN : ABOUT_DEFAULT_HTML_DE)
  const enFallback = isEn && !settings.about_content_en && !!settings.about_content

  const advantages = isEn ? ADVANTAGES_EN : ADVANTAGES_DE

  const jsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'AboutPage',
      name: t(lang, 'about.metaTitle'),
      description: t(lang, 'about.metaDesc'),
      url: `${siteUrl()}${path}`,
      inLanguage: isEn && (settings.about_content_en || !settings.about_content) ? 'en' : 'de-DE',
      about: {
        '@type': 'Organization',
        name: 'Noir Hamburg',
        url: siteUrl(),
      },
    },
    breadcrumbSchema([
      { name: t(lang, 'crumb.home'), url: homeHref },
      { name: t(lang, 'about.crumb') },
    ]),
  ]

  return (
    <>
      <Header lang={lang} currentPath={path} />
      <main id="main">
        <JsonLd data={jsonLd} />

        <section className="px-6 md:px-12 lg:px-16 pt-12 pb-8" data-testid="about-page">
          <Breadcrumbs items={[{ label: t(lang, 'crumb.home'), href: homeHref }, { label: t(lang, 'about.crumb') }]} />
          <div className="mt-8 max-w-3xl">
            <span className="overline">{t(lang, 'about.overline')}</span>
            <h1 className="font-heading text-5xl lg:text-7xl font-light tracking-tighter leading-none mt-4">
              {t(lang, 'about.h1a')} <em className="italic accent-text">{t(lang, 'about.h1b')}</em>
            </h1>
          </div>
        </section>

        <section className="px-6 md:px-12 lg:px-16 py-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            <div className="lg:col-span-7">
              {enFallback && (
                <div className="mb-6 p-4 border-l-4 border-[#8B1538] bg-[#FAF5F2] text-sm text-[#4A3F3F]" data-testid="en-fallback-note">
                  <strong className="text-[#8B1538]">{t(lang, 'page.enFallbackTitle')}</strong>{' '}
                  {t(lang, 'page.enFallback')}
                </div>
              )}
              <div
                className="prose-noir"
                data-testid="about-content"
                dangerouslySetInnerHTML={{ __html: content }}
              />
            </div>
            <aside className="lg:col-span-4 lg:col-start-9">
              <div className="editorial-image h-[60vh] bg-[#F2EAE4]">
                <img src={aboutImage} alt="Hamburg Editorial" data-testid="about-editorial-image" className="w-full h-full object-cover" />
              </div>
            </aside>
          </div>
        </section>

        <section className="px-6 md:px-12 lg:px-16 py-20 bg-[#FBF7F4]">
          <h2 className="font-heading text-3xl lg:text-4xl mb-12">{t(lang, 'about.principles')}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
            {advantages.map((a, i) => (
              <div key={i} className="border-t border-[#1A1414]/15 pt-6" data-testid={`about-advantage-${i}`}>
                <div className="font-mono text-xs accent-text mb-4">0{i + 1}</div>
                <h3 className="font-heading text-2xl mb-3">{a.title}</h3>
                <p className="text-sm font-light text-[#6B5F5F] leading-relaxed">{a.text}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="px-6 md:px-12 lg:px-16 py-20 text-center">
          <h2 className="font-heading text-4xl lg:text-5xl max-w-3xl mx-auto">
            {t(lang, 'about.cta.h1a')} <em className="italic accent-text">{t(lang, 'about.cta.h1b')}</em>.
          </h2>
          <div className="mt-10">
            <Link href={contactHref} className="btn-primary" data-testid="about-cta">{t(lang, 'about.cta.action')}</Link>
          </div>
        </section>
      </main>
      <Footer lang={lang} />
    </>
  )
}
