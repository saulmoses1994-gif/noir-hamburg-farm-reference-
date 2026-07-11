import Link from 'next/link'
import Header from '@/components/site/Header'
import Footer from '@/components/site/Footer'
import Breadcrumbs from '@/components/site/Breadcrumbs'
import JsonLd from '@/components/site/JsonLd'
import { t, localePath, pick } from '@/lib/i18n'
import { siteUrl, breadcrumbSchema } from '@/lib/seo'

const FALLBACK_HERO =
  'https://images.pexels.com/photos/31222489/pexels-photo-31222489.jpeg?auto=compress&cs=tinysrgb&w=2400'

// Landing hub at /escort-hamburg. Combines hero + hanseatic prose + services
// grid + reach grid + closing CTA. All copy comes from the i18n dictionary.
export default function EscortHamburgBody({ lang, services = [], areas = [], settings = {} }) {
  const isEn = lang === 'en'
  const path = localePath(lang, '/escort-hamburg')
  const homeHref = isEn ? '/en' : '/'
  const contactHref = localePath(lang, '/kontakt')
  const modelsHref = localePath(lang, '/models')
  const heroImage = settings.escort_hamburg_image || FALLBACK_HERO

  const jsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      name: t(lang, 'hub.metaTitle'),
      description: t(lang, 'hub.metaDesc'),
      url: `${siteUrl()}${path}`,
      inLanguage: isEn ? 'en' : 'de-DE',
      about: { '@type': 'Place', name: 'Hamburg', address: { '@type': 'PostalAddress', addressLocality: 'Hamburg', addressCountry: 'DE' } },
    },
    breadcrumbSchema([
      { name: t(lang, 'crumb.home'), url: homeHref },
      { name: t(lang, 'hub.crumb') },
    ]),
  ]

  return (
    <>
      <Header lang={lang} currentPath={path} />
      <main id="main">
        <JsonLd data={jsonLd} />

        <section className="relative h-[70vh] flex items-end" data-testid="escort-hamburg-page">
          <div className="absolute inset-0">
            <img src={heroImage} alt="Hamburg" className="w-full h-full object-cover" data-testid="escort-hamburg-hero-image" />
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
              <p>{t(lang, 'hub.section2P1')}</p>
              <p>{t(lang, 'hub.section2P2')}</p>
              <p>{t(lang, 'hub.section2P3')}</p>
            </div>
          </div>
        </section>

        <section className="px-6 md:px-12 lg:px-16 py-20 bg-[#FBF7F4]">
          <div>
            <span className="overline">{t(lang, 'hub.servicesOverline')}</span>
            <h2 className="font-heading text-3xl lg:text-5xl font-light tracking-tight leading-tight mt-4">
              {t(lang, 'hub.servicesTitle')}
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-px bg-[#1A1414]/5 mt-16" data-testid="hub-services-grid">
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
