import Link from 'next/link'
import Header from '@/components/site/Header'
import Footer from '@/components/site/Footer'
import Breadcrumbs from '@/components/site/Breadcrumbs'
import JsonLd from '@/components/site/JsonLd'
import { t, localePath, pick } from '@/lib/i18n'
import { siteUrl, breadcrumbSchema } from '@/lib/seo'
import { optimizeImageUrl } from '@/lib/cloudinary'

const FALLBACK_HERO =
  'https://images.pexels.com/photos/31222489/pexels-photo-31222489.jpeg?auto=compress&cs=tinysrgb&w=2400'

// Landing hub at /escort-hamburg. Combines hero + hanseatic prose + services
// grid + reach grid + closing CTA. All copy comes from the i18n dictionary.
export default function EscortHamburgBody({ lang, services = [], areas = [], settings = {}, hub = null }) {
  const isEn = lang === 'en'
  const path = localePath(lang, '/escort-hamburg')
  const homeHref = isEn ? '/en' : '/'
  const contactHref = localePath(lang, '/kontakt')
  const modelsHref = localePath(lang, '/models')
  const heroImage = settings.escort_hamburg_image || FALLBACK_HERO

  // Hub CMS content selectors
  const hubLong = hub ? (isEn ? hub.long_copy_en : hub.long_copy) : null
  const hubSections = hub ? (hub.sections || []) : []
  const hubFaqs = hub ? (hub.faqs || []) : []
  const hubMetaTitle = hub ? (isEn ? hub.meta_title_en : hub.meta_title) : t(lang, 'hub.metaTitle')
  const hubMetaDesc = hub ? (isEn ? hub.meta_description_en : hub.meta_description) : t(lang, 'hub.metaDesc')

  const renderInline = (text) => {
    if (!text) return null
    const parts = []
    const re = /\[([^\]]+)\]\(([^)]+)\)/g
    let last = 0, m
    while ((m = re.exec(text)) !== null) {
      if (m.index > last) parts.push(text.slice(last, m.index))
      parts.push(<Link key={parts.length} href={m[2]} className="underline hover:accent-text">{m[1]}</Link>)
      last = m.index + m[0].length
    }
    if (last < text.length) parts.push(text.slice(last))
    return parts
  }

  const jsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'Service',
      name: hubMetaTitle,
      description: hubMetaDesc,
      url: `${siteUrl()}${path}`,
      inLanguage: isEn ? 'en' : 'de',
      areaServed: { '@type': 'City', name: 'Hamburg' },
      provider: { '@type': 'Organization', name: 'Noir Hamburg', url: siteUrl() },
    },
    breadcrumbSchema([
      { name: t(lang, 'crumb.home'), url: homeHref },
      { name: t(lang, 'hub.crumb') },
    ]),
    ...(hubFaqs.length ? [{
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: hubFaqs.map((f) => ({
        '@type': 'Question',
        name: isEn ? (f.q_en || f.q) : f.q,
        acceptedAnswer: { '@type': 'Answer', text: isEn ? (f.a_en || f.a) : f.a },
      })),
    }] : []),
  ]

  return (
    <>
      <Header lang={lang} currentPath={path} />
      <main id="main">
        <JsonLd data={jsonLd} />

        <section className="relative w-full aspect-[64/45] lg:aspect-[21/9] flex items-end" data-testid="escort-hamburg-page">
          <div className="absolute inset-0">
            {/*
              Responsive hero:
              - Mobile (default):  aspect 64:45 ≈ 1.42 (25 % taller than 16:9).
              - Desktop (lg+):     aspect 21:9  ≈ 2.33 (24 % shorter than 16:9)
                                   — a cinematic ultra-wide banner that leaves
                                   enough vertical room to show face + corset
                                   + hands, using `g_face` gravity so the
                                   head is never cropped.
              Cloudinary applies q_auto:best + e_improve + e_sharpen per size
              to squeeze the most quality out of the current source without
              blowing up file weight.
            */}
            <picture>
              <source
                media="(min-width: 1024px)"
                srcSet={`${optimizeImageUrl(heroImage, { w: 1280, ar: '21/9', crop: 'fill', gravity: 'face', quality: 'auto:best', sharpen: 60, improve: true })} 1280w, ${optimizeImageUrl(heroImage, { w: 1600, ar: '21/9', crop: 'fill', gravity: 'face', quality: 'auto:best', sharpen: 80, improve: true })} 1600w, ${optimizeImageUrl(heroImage, { w: 1920, ar: '21/9', crop: 'fill', gravity: 'face', quality: 'auto:best', sharpen: 80, improve: true })} 1920w, ${optimizeImageUrl(heroImage, { w: 2400, ar: '21/9', crop: 'fill', gravity: 'face', quality: 'auto:best', sharpen: 100, improve: true })} 2400w`}
                sizes="100vw"
              />
              <img
                src={optimizeImageUrl(heroImage, { w: 1200, ar: '64/45', crop: 'fill', quality: 'auto:best', sharpen: 60, improve: true })}
                srcSet={`${optimizeImageUrl(heroImage, { w: 480, ar: '64/45', crop: 'fill', quality: 'auto:best', sharpen: 50, improve: true })} 480w, ${optimizeImageUrl(heroImage, { w: 720, ar: '64/45', crop: 'fill', quality: 'auto:best', sharpen: 60, improve: true })} 720w, ${optimizeImageUrl(heroImage, { w: 960, ar: '64/45', crop: 'fill', quality: 'auto:best', sharpen: 60, improve: true })} 960w, ${optimizeImageUrl(heroImage, { w: 1200, ar: '64/45', crop: 'fill', quality: 'auto:best', sharpen: 60, improve: true })} 1200w`}
                sizes="100vw"
                width={2400}
                height={1029}
                alt={t(lang, 'hub.heroH1a') + ' ' + t(lang, 'hub.heroH1b')}
                loading="eager"
                fetchPriority="high"
                decoding="async"
                className="w-full h-full object-cover"
                data-testid="escort-hamburg-hero-image"
              />
            </picture>
            <div className="absolute inset-0 bg-gradient-to-t from-[#1A1414] via-[#1A1414]/50 to-[#1A1414]/25" />
          </div>
          <div className="relative z-10 px-6 md:px-12 lg:px-16 pb-16 max-w-5xl text-white">
            <Breadcrumbs
              dark
              items={[{ label: t(lang, 'crumb.home'), href: homeHref }, { label: t(lang, 'hub.crumb') }]}
            />
            <span className="overline block mt-6 mb-4 text-[#E5A5B5]">{t(lang, 'hub.heroOverline')}</span>
            <h1 className="font-heading text-5xl lg:text-8xl font-semibold tracking-tight leading-tight text-white">
              {t(lang, 'hub.heroH1a')} <em className="italic accent-text">{t(lang, 'hub.heroH1b')}</em>
            </h1>
          </div>
        </section>

        <section className="px-6 md:px-12 lg:px-16 py-24">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            <div className="lg:col-span-5">
              <span className="overline">{t(lang, 'hub.section2Overline')}</span>
              <h2 className="font-heading text-3xl lg:text-5xl font-light tracking-tight leading-tight mt-4">
                {t(lang, 'hub.section2Title')}
              </h2>
            </div>
            <div className="lg:col-span-6 lg:col-start-7 space-y-6 text-base lg:text-lg font-light text-[#6B5F5F] leading-relaxed">
              <p>{hubLong || t(lang, 'hub.section2P1')}</p>
              {!hubLong && (<><p>{t(lang, 'hub.section2P2')}</p><p>{t(lang, 'hub.section2P3')}</p></>)}
            </div>
          </div>
        </section>

        {hubSections.length > 0 && (
          <section className="px-6 md:px-12 lg:px-16 py-24 bg-[#FBF7F4]" data-testid="hub-longform">
            <div className="max-w-4xl mx-auto space-y-14">
              {hubSections.map((s, i) => {
                const h2 = isEn ? (s.h2_en || s.h2) : s.h2
                const bodyArr = isEn ? (s.body_en || s.body || []) : (s.body || [])
                const paragraphs = Array.isArray(bodyArr) ? bodyArr : [bodyArr]
                return (
                  <div key={i} data-testid={`hub-section-${i}`}>
                    <h2 className="font-heading text-2xl lg:text-3xl font-light tracking-tight leading-tight mb-5">{h2}</h2>
                    <div className="space-y-4 text-base lg:text-lg font-light text-[#3A3232] leading-relaxed">
                      {paragraphs.filter(Boolean).map((p, j) => (<p key={j}>{renderInline(p)}</p>))}
                    </div>
                  </div>
                )
              })}
            </div>
          </section>
        )}

        <section className="px-6 md:px-12 lg:px-16 py-20 bg-[#FBF7F4]">
          <div>
            <span className="overline">{t(lang, 'hub.servicesOverline')}</span>
            <h2 className="font-heading text-3xl lg:text-5xl font-light tracking-tight leading-tight mt-4">
              {t(lang, 'hub.servicesTitle')}
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-px bg-[#1A1414]/5 mt-16" data-testid="hub-services-grid">
            {services.map((s) => (
              <Link
                key={s.slug}
                href={localePath(lang, `/services/${s.slug}`)}
                className="bg-[#FBF7F4] hover:bg-[#F2EAE4] transition-colors duration-500 p-6 group"
                data-testid={`hub-service-${s.slug}`}
              >
                <h3 className="font-heading text-xl group-hover:accent-text">{pick(s, 'title', lang) || s.title}</h3>
                <p className="text-xs font-light text-[#6B5F5F] mt-2 line-clamp-2">{pick(s, 'description', lang) || pick(s, 'tagline', lang) || ''}</p>
                <div className="mt-4 text-xs font-mono uppercase tracking-[0.2em] inline-flex items-center gap-2 group-hover:accent-text">
                  {t(lang, 'hub.details')} →
                </div>
              </Link>
            ))}
          </div>
        </section>

        {hubFaqs.length > 0 && (
          <section className="px-6 md:px-12 lg:px-16 py-24" data-testid="hub-faqs">
            <div className="max-w-4xl mx-auto">
              <span className="overline">FAQ</span>
              <h2 className="font-heading text-3xl lg:text-5xl font-light tracking-tight leading-tight mt-4 mb-10">
                {isEn ? 'Frequently Asked Questions' : 'Häufig gestellte Fragen'}
              </h2>
              <div className="divide-y divide-[#1A1414]/10">
                {hubFaqs.map((f, i) => (
                  <div key={i} className="py-6" data-testid={`hub-faq-${i}`}>
                    <h3 className="font-heading text-xl mb-3">{isEn ? (f.q_en || f.q) : f.q}</h3>
                    <div className="text-base lg:text-lg font-light text-[#3A3232] leading-relaxed">
                      {renderInline(isEn ? (f.a_en || f.a) : f.a)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        <section className="px-6 md:px-12 lg:px-16 py-20">
          <div>
            <span className="overline">{t(lang, 'hub.reachOverline')}</span>
            <h2 className="font-heading text-3xl lg:text-5xl font-light tracking-tight leading-tight mt-4">
              {t(lang, 'hub.reachTitle')}
            </h2>
            <p className="mt-4 text-[#6B5F5F]">{t(lang, 'hub.reachDesc')}</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-x-8 gap-y-4 mt-12" data-testid="hub-areas-grid">
            {areas.map((a) => (
              <Link
                key={a.slug}
                href={localePath(lang, `/escort/${a.slug}`)}
                className="text-sm font-light text-[#1A1414] hover:accent-text border-b border-[#1A1414]/8 py-2 link-underline"
                data-testid={`hub-area-${a.slug}`}
              >
                {pick(a, 'name', lang) || a.name}
              </Link>
            ))}
          </div>
        </section>

        <section className="px-6 md:px-12 lg:px-16 py-32 text-center">
          <h2 className="font-heading text-4xl lg:text-6xl max-w-3xl mx-auto">
            {t(lang, 'hub.finalH1a')} <em className="italic accent-text">{t(lang, 'hub.finalH1b')}</em>
          </h2>
          <div className="mt-10 flex gap-4 justify-center flex-wrap">
            <Link href={contactHref} className="btn-primary" data-testid="hub-cta-contact">{t(lang, 'hub.enquire')} →</Link>
            <Link href={modelsHref} className="btn-ghost" data-testid="hub-cta-models">{t(lang, 'hub.viewModels')}</Link>
          </div>
        </section>
      </main>
      <Footer lang={lang} />
    </>
  )
}
