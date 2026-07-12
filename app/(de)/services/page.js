import Link from 'next/link'
import Header from '@/components/site/Header'
import Footer from '@/components/site/Footer'
import Breadcrumbs from '@/components/site/Breadcrumbs'
import JsonLd from '@/components/site/JsonLd'
import { listServiceContent } from '@/lib/service-content'
import { buildMetadata, breadcrumbSchema, siteUrl } from '@/lib/seo'
import { pick } from '@/lib/i18n'

export const dynamic = 'force-dynamic'

export async function generateMetadata() {
  return buildMetadata({
    title: 'Escort Services Hamburg — Premium Begleitung | Noir Hamburg',
    description: 'Acht sorgfältig definierte Servicearten von Noir Hamburg: Luxury, VIP, Business, Dinner, Hotel, Event, Travel und Girlfriend Experience.',
    path: '/services',
    lang: 'de',
  })
}

export default async function ServicesList() {
  const lang = 'de'
  const services = await listServiceContent()
  const jsonLd = [
    breadcrumbSchema([{ name: 'Home', url: '/' }, { name: 'Services', url: '/services' }]),
    {
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      itemListElement: services.map((s, i) => ({
        '@type': 'ListItem', position: i + 1, name: s.title,
        url: `${siteUrl()}/services/${s.slug}`,
      })),
    },
  ]
  return (
    <>
      <Header lang={lang} currentPath="/services" />
      <main id="main">
        <JsonLd data={jsonLd} />
        <section className="px-6 md:px-12 lg:px-16 pt-12 pb-8">
          <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Services' }]} />
          <div className="mt-8 max-w-3xl">
            <span className="overline">Service-Portfolio</span>
            <h1 className="font-heading text-5xl lg:text-7xl font-light tracking-tighter leading-none mt-4">
              Escort <em className="italic accent-text">Services</em>
            </h1>
            <p className="mt-6 text-lg font-light text-[#6B5F5F] leading-relaxed">
              Acht sorgfältig definierte Begleitarten – damit jede Begegnung ihren angemessenen Rahmen findet.
            </p>
          </div>
        </section>
        <section className="px-6 md:px-12 lg:px-16 pb-32">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-[#1A1414]/5">
            {services.map((s, i) => (
              <Link key={s.slug} href={`/services/${s.slug}`} className="bg-white hover:bg-[#FBF7F4] transition-colors duration-500 group block relative overflow-hidden">
                <div className="aspect-[16/10] overflow-hidden">
                  {s.image && <img src={s.image} alt={pick(s, 'image_alt', lang) || s.title} className="w-full h-full object-cover opacity-100 group-hover:scale-105 transition-transform duration-1000" loading="lazy" />}
                </div>
                <div className="p-8 lg:p-12">
                  <span className="overline accent-text">0{i + 1}</span>
                  <h2 className="font-heading text-3xl lg:text-4xl mt-3">{s.title}</h2>
                  <p className="font-heading italic text-[#6B5F5F] mt-1">{pick(s, 'tagline', lang)}</p>
                  <p className="mt-5 text-sm font-light text-[#6B5F5F] leading-relaxed">{pick(s, 'description', lang)}</p>
                  <div className="mt-8 inline-flex items-center gap-2 text-xs font-mono uppercase tracking-[0.2em] accent-text">Details ansehen →</div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </main>
      <Footer lang={lang} />
    </>
  )
}
