import Link from 'next/link'
import Header from '@/components/site/Header'
import Footer from '@/components/site/Footer'
import Breadcrumbs from '@/components/site/Breadcrumbs'
import JsonLd from '@/components/site/JsonLd'
import { pick, t, localePath } from '@/lib/i18n'
import { siteUrl, breadcrumbSchema } from '@/lib/seo'
import GENERIC_AREA_FAQS from '@/lib/generic_area_faqs_seed.json'

// Resolves per-area FAQs. Preference: CMS-authored faqs → generic seed with
// {name} placeholders substituted. Never emits an empty question or answer.
function resolveFaqs(area, lang) {
  const rawList = Array.isArray(area.faqs) && area.faqs.length ? area.faqs : null
  if (rawList) {
    return rawList
      .map((f) => {
        const q = (lang === 'en' && f.q_en ? f.q_en : f.q) || ''
        const a = (lang === 'en' && f.a_en ? f.a_en : f.a) || ''
        return { q: q.replace(/\{name\}/g, area.name), a: a.replace(/\{name\}/g, area.name) }
      })
      .filter((f) => f.q && f.a)
  }
  return GENERIC_AREA_FAQS
    .map((f) => {
      const q = (lang === 'en' ? f.qEn : f.q) || ''
      const a = (lang === 'en' ? f.aEn : f.a) || ''
      return { q: q.replace(/\{name\}/g, area.name), a: a.replace(/\{name\}/g, area.name) }
    })
    .filter((f) => f.q && f.a)
}

export default function AreaDetailBody({ lang, area, services = [], models = [], nearby = [], settings = null }) {
  const isEn = lang === 'en'
  const detailPath = localePath(lang, `/escort/${area.slug}`)
  const homeHref = lang === 'en' ? '/en' : '/'
  const areasHref = localePath(lang, '/areas')
  const contactHref = localePath(lang, '/kontakt')

  const intro = pick(area, 'intro', lang) || ''
  const description = pick(area, 'description', lang) || ''
  // body_extra_en falls back to body_extra when empty (rule (a)).
  const bodyExtra = (isEn && Array.isArray(area.body_extra_en) && area.body_extra_en.length
    ? area.body_extra_en
    : (Array.isArray(area.body_extra) ? area.body_extra : []))
  const heroImage = (settings?.area_images && settings.area_images[area.slug]) || area.image
  const heroAlt = pick(area, 'image_alt', lang) || area.title || area.name
  const faqs = resolveFaqs(area, lang)

  const jsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'Place',
      name: `Escort ${area.name}`,
      description,
      image: heroImage || undefined,
      url: `${siteUrl()}${detailPath}`,
      address: { '@type': 'PostalAddress', addressLocality: area.name, addressCountry: 'DE' },
    },
    breadcrumbSchema([
      { name: t(lang, 'crumb.home'), url: homeHref },
      { name: t(lang, 'crumb.areas'), url: areasHref },
      { name: area.name },
    ]),
    ...(faqs.length
      ? [{
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: faqs.map((f) => ({
            '@type': 'Question',
            name: f.q,
            acceptedAnswer: { '@type': 'Answer', text: f.a },
          })),
        }]
      : []),
  ]

  const bookLabel = t(lang, 'area.bookInArea').replace(/\{name\}/g, area.name)

  return (
    <>
      <Header lang={lang} currentPath={detailPath} />
      <main id="main">
        <JsonLd data={jsonLd} />

        <section className="relative h-[60vh] flex items-end" data-testid="area-hero">
          <div className="absolute inset-0">
            {heroImage && (
              <img src={heroImage} alt={heroAlt} className="w-full h-full object-cover" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-[#1A1414] via-[#1A1414]/60 to-transparent" />
          </div>
          <div className="relative z-10 px-6 md:px-12 lg:px-16 pb-12 max-w-4xl text-white">
            <Breadcrumbs
              dark
              items={[
                { label: t(lang, 'crumb.home'), href: homeHref },
                { label: t(lang, 'crumb.areas'), href: areasHref },
                { label: area.name },
              ]}
            />
            <span className="overline block mt-6 mb-4 text-[#E5A5B5]">{t(lang, 'area.overline')} {area.name}</span>
            <h1 className="font-heading text-5xl lg:text-7xl font-semibold tracking-tight leading-tight text-white">
              {area.title}
            </h1>
            {intro && (
              <p className="font-heading italic text-xl text-white/80 mt-4">{intro}</p>
            )}
          </div>
        </section>

        <section className="px-6 md:px-12 lg:px-16 py-24">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            <div className="lg:col-span-7">
              <h2 className="font-heading text-3xl lg:text-4xl mb-8">
                {t(lang, 'area.companionsHeading')} {area.name}
              </h2>
              {description && (
                <p className="text-base lg:text-lg font-light text-[#3F3838] leading-relaxed">{description}</p>
              )}

              {bodyExtra.length > 0 && (
                <div className="mt-8 space-y-5 text-[#3F3838] leading-relaxed" data-testid="area-body-extra">
                  {bodyExtra.map((p, i) => (<p key={i}>{p}</p>))}
                </div>
              )}

              {Array.isArray(area.landmarks) && area.landmarks.length > 0 && (
                <div className="mt-12">
                  <span className="overline mb-4 block">{t(lang, 'area.popularAddresses')}</span>
                  <div className="flex flex-wrap gap-2">
                    {area.landmarks.map((lm) => (
                      <span key={lm} className="text-xs font-mono uppercase tracking-[0.15em] py-2 px-3 border border-[#1A1414]/15">{lm}</span>
                    ))}
                  </div>
                </div>
              )}

              {faqs.length > 0 && (
                <div className="mt-14" data-testid="area-faq">
                  <span className="overline">{t(lang, 'sec.questions')}</span>
                  <h2 className="font-heading text-2xl lg:text-3xl text-[#1A1414] mt-3 mb-6">
                    {t(lang, 'area.faqHeading')} {area.name}
                  </h2>
                  <div className="space-y-3">
                    {faqs.map((f, i) => (
                      <details key={i} className="bg-white border border-[#1A1414]/8 rounded-lg group" data-testid={`area-faq-${i}`}>
                        <summary className="cursor-pointer p-5 list-none flex items-center justify-between gap-4">
                          <span className="font-heading text-lg text-[#1A1414]">{f.q}</span>
                          <span className="accent-text text-2xl group-open:rotate-45 transition-transform">+</span>
                        </summary>
                        <div className="px-5 pb-5 text-sm text-[#6B5F5F] leading-relaxed">{f.a}</div>
                      </details>
                    ))}
                  </div>
                </div>
              )}

              <div className="mt-12 flex gap-4 flex-wrap">
                <Link href={contactHref} className="btn-primary" data-testid="area-contact-btn">
                  {bookLabel} →
                </Link>
              </div>
            </div>

            <aside className="lg:col-span-4 lg:col-start-9 space-y-10">
              {services.length > 0 && (
                <div>
                  <span className="overline mb-3 block">{t(lang, 'area.popularServices')}</span>
                  <ul className="space-y-3">
                    {services.slice(0, 5).map((s) => (
                      <li key={s.slug}>
                        <Link
                          href={localePath(lang, `/services/${s.slug}`)}
                          className="font-heading text-xl hover:accent-text transition-colors block py-1"
                        >
                          {pick(s, 'title', lang) || s.title}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {nearby.length > 0 && (
                <div>
                  <span className="overline mb-3 block">{t(lang, 'area.nearby')}</span>
                  <div className="flex flex-wrap gap-2">
                    {nearby.map((l) => (
                      <Link
                        key={l.slug}
                        href={localePath(lang, `/escort/${l.slug}`)}
                        className="text-xs font-mono uppercase tracking-[0.15em] py-2 px-3 border border-[#1A1414]/15 hover:border-[#8B1538] hover:text-[#8B1538]"
                      >
                        {l.name}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </aside>
          </div>
        </section>

        {models.length > 0 && (
          <section className="px-6 md:px-12 lg:px-16 py-20 border-t border-[#1A1414]/8">
            <h2 className="font-heading text-3xl mb-12">
              {t(lang, 'area.modelsHeading')} {area.name}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-10">
              {models.map((m) => (
                <Link
                  key={m.slug}
                  href={localePath(lang, `/models/${m.slug}`)}
                  className="group block"
                  data-testid={`area-model-${m.slug}`}
                >
                  {m.cover_image && (
                    <div className="aspect-[3/4] editorial-image bg-[#F2EAE4] overflow-hidden">
                      <img src={m.cover_image} alt={m.name} loading="lazy" className="w-full h-full object-cover" />
                    </div>
                  )}
                  <div className="pt-4">
                    <h3 className="font-heading text-xl group-hover:accent-text transition-colors">{m.name}</h3>
                    {pick(m, 'short_tagline', lang) && (
                      <p className="font-heading italic text-[#6B5F5F] mt-1 text-sm">{pick(m, 'short_tagline', lang)}</p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </main>
      <Footer lang={lang} />
    </>
  )
}
