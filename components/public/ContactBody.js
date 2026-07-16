import Link from 'next/link'
import Header from '@/components/site/Header'
import Footer from '@/components/site/Footer'
import Breadcrumbs from '@/components/site/Breadcrumbs'
import JsonLd from '@/components/site/JsonLd'
import ContactForm from '@/components/public/ContactForm'
import { t, localePath, pick } from '@/lib/i18n'
import { siteUrl, breadcrumbSchema } from '@/lib/seo'

// Server component that hosts the (client) ContactForm and the sidebar of
// direct-contact channels. Renders SSR-first so the hero + JSON-LD are
// present in the raw HTML.
export default function ContactBody({ lang, services = [], settings = {} }) {
  const path = localePath(lang, '/kontakt')
  const homeHref = lang === 'en' ? '/en' : '/'
  const phone = settings.phone || '+49 40 0000 0000'
  const email = settings.email || 'kontakt@noir-hamburg.com'
  const waNumber = (settings.whatsapp_number || '4940000000000').replace(/[^\d]/g, '')
  const waHref = `https://wa.me/${waNumber}`

  const serviceOptions = services.map((s) => ({
    slug: s.slug,
    label: pick(s, 'title', lang) || s.title,
  }))

  const jsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'ContactPage',
      name: t(lang, 'contact.metaTitle'),
      description: t(lang, 'contact.metaDesc'),
      url: `${siteUrl()}${path}`,
      inLanguage: lang === 'en' ? 'en' : 'de-DE',
      mainEntity: {
        '@type': 'Organization',
        name: 'Noir Hamburg',
        telephone: phone,
        email,
        url: siteUrl(),
      },
    },
    breadcrumbSchema([
      { name: t(lang, 'crumb.home'), url: homeHref },
      { name: t(lang, 'contact.crumb') },
    ]),
  ]

  return (
    <>
      <Header lang={lang} currentPath={path} />
      <main id="main">
        <JsonLd data={jsonLd} />

        <section className="px-6 md:px-12 lg:px-16 pt-8 md:pt-12 pb-8" data-testid="contact-page">
          <Breadcrumbs items={[{ label: t(lang, 'crumb.home'), href: homeHref }, { label: t(lang, 'contact.crumb') }]} />
          <div className="mt-8 max-w-3xl">
            <span className="overline">{t(lang, 'contact.overline')}</span>
            <h1 className="font-heading text-4xl sm:text-5xl lg:text-7xl font-light tracking-tighter leading-[1.05] mt-4">
              {t(lang, 'contact.h1a')} <em className="italic accent-text">{t(lang, 'contact.h1b')}</em>
            </h1>
            <p className="mt-6 text-base sm:text-lg font-light text-[#6B5F5F] leading-relaxed">
              {t(lang, 'contact.intro')}
            </p>
          </div>
        </section>

        <section className="px-6 md:px-12 lg:px-16 py-8 md:py-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 md:gap-12">
            <ContactForm lang={lang} services={serviceOptions} />
            <aside className="lg:col-span-4 lg:col-start-9 space-y-8">
              <div>
                <span className="overline mb-4 block">{t(lang, 'contact.direct.title')}</span>
                <div className="space-y-5 mt-4">
                  <a href={waHref} target="_blank" rel="noreferrer" className="flex items-center gap-4 group" data-testid="direct-whatsapp">
                    <span className="w-10 h-10 border border-[#1A1414]/15 group-hover:border-[#8B1538] flex items-center justify-center accent-text">✉</span>
                    <div>
                      <div className="overline text-[10px]">{t(lang, 'contact.direct.whatsapp')}</div>
                      <div className="text-lg font-light group-hover:accent-text">{phone}</div>
                    </div>
                  </a>
                  <a href={`tel:${phone.replace(/\s+/g,'')}`} className="flex items-center gap-4 group" data-testid="direct-phone">
                    <span className="w-10 h-10 border border-[#1A1414]/15 group-hover:border-[#8B1538] flex items-center justify-center accent-text">☎</span>
                    <div>
                      <div className="overline text-[10px]">{t(lang, 'contact.direct.phone')}</div>
                      <div className="text-lg font-light group-hover:accent-text">{phone}</div>
                    </div>
                  </a>
                  <a href={`mailto:${email}`} className="flex items-center gap-4 group" data-testid="direct-email">
                    <span className="w-10 h-10 border border-[#1A1414]/15 group-hover:border-[#8B1538] flex items-center justify-center accent-text">@</span>
                    <div>
                      <div className="overline text-[10px]">{t(lang, 'contact.direct.email')}</div>
                      <div className="text-lg font-light group-hover:accent-text">{email}</div>
                    </div>
                  </a>
                </div>
              </div>
              <div className="thin-divider" />
              <div className="text-sm font-light text-[#6B5F5F] leading-relaxed">
                <span className="overline accent-text mb-3 block">{t(lang, 'contact.privacy.title')}</span>
                {t(lang, 'contact.privacy.body')}{' '}
                <Link href={localePath(lang, '/p/diskretion')} className="underline decoration-[#8B1538]/40 hover:decoration-[#8B1538]">
                  {t(lang, 'contact.form.consentLink')} →
                </Link>
              </div>
            </aside>
          </div>
        </section>
      </main>
      <Footer lang={lang} />
    </>
  )
}
