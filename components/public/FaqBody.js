import Link from 'next/link'
import Header from '@/components/site/Header'
import Footer from '@/components/site/Footer'
import Breadcrumbs from '@/components/site/Breadcrumbs'
import JsonLd from '@/components/site/JsonLd'
import { t, localePath } from '@/lib/i18n'
import { siteUrl, breadcrumbSchema } from '@/lib/seo'
import { FAQS_DEFAULT } from '@/lib/faqs_default'

// Shared /faq body. FAQs live in a bundled module (site-wide constant, not
// CMS-managed) — matches the reference SPA. FAQPage JSON-LD emits all Q&A
// in the active locale for schema.org indexing.
export default function FaqBody({ lang }) {
  const isEn = lang === 'en'
  const path = localePath(lang, '/faq')
  const homeHref = isEn ? '/en' : '/'
  const contactHref = localePath(lang, '/kontakt')

  const q = (f) => (isEn ? f.qEn : f.q)
  const a = (f) => (isEn ? f.aEn : f.a)

  const jsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      name: t(lang, 'faq.metaTitle'),
      url: `${siteUrl()}${path}`,
      inLanguage: isEn ? 'en' : 'de',
      mainEntity: FAQS_DEFAULT.map((f) => ({
        '@type': 'Question',
        name: q(f),
        acceptedAnswer: { '@type': 'Answer', text: a(f) },
      })),
    },
    breadcrumbSchema([
      { name: t(lang, 'crumb.home'), url: homeHref },
      { name: t(lang, 'faq.crumb') },
    ]),
  ]

  return (
    <>
      <Header lang={lang} currentPath={path} />
      <main id="main">
        <JsonLd data={jsonLd} />

        <section className="px-6 md:px-12 lg:px-16 pt-12 pb-8" data-testid="faq-page">
          <Breadcrumbs items={[{ label: t(lang, 'crumb.home'), href: homeHref }, { label: t(lang, 'faq.crumb') }]} />
          <div className="mt-8 max-w-3xl">
            <span className="overline">{t(lang, 'faq.overline')}</span>
            <h1 className="font-heading text-5xl lg:text-7xl font-light tracking-tighter leading-none mt-4">
              {t(lang, 'faq.h1a')} <em className="italic accent-text">{t(lang, 'faq.h1b')}</em>
            </h1>
            <p className="mt-6 text-lg font-light text-[#6B5F5F] leading-relaxed">
              {t(lang, 'faq.intro')}
            </p>
          </div>
        </section>

        <section className="px-6 md:px-12 lg:px-16 py-12">
          <div className="max-w-4xl space-y-px bg-[#1A1414]/5">
            {FAQS_DEFAULT.map((f, i) => (
              <details
                key={i}
                className="bg-white group"
                open={i === 0}
                data-testid={`faq-item-${i}`}
              >
                <summary className="cursor-pointer p-8 list-none flex items-center justify-between gap-6">
                  <span className="font-heading text-2xl">{q(f)}</span>
                  <span aria-hidden="true" className="accent-text text-2xl group-open:rotate-45 transition-transform">+</span>
                </summary>
                <div className="px-8 pb-8 text-base font-light text-[#6B5F5F] leading-relaxed">{a(f)}</div>
              </details>
            ))}
          </div>
        </section>

        <section className="px-6 md:px-12 lg:px-16 py-20 text-center border-t border-[#1A1414]/8">
          <h2 className="font-heading text-3xl lg:text-4xl max-w-3xl mx-auto">
            {t(lang, 'faq.cta.h1a')} <em className="italic accent-text">{t(lang, 'faq.cta.h1b')}</em>.
          </h2>
          <div className="mt-10">
            <Link href={contactHref} className="btn-primary" data-testid="faq-cta">{t(lang, 'faq.cta.action')} →</Link>
          </div>
        </section>
      </main>
      <Footer lang={lang} />
    </>
  )
}
