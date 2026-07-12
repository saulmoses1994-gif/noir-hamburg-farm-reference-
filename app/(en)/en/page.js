import Link from 'next/link'
import Header from '@/components/site/Header'
import Footer from '@/components/site/Footer'
import JsonLd from '@/components/site/JsonLd'
import { listServiceContent } from '@/lib/service-content'
import { buildMetadata, siteUrl } from '@/lib/seo'
import { pick } from '@/lib/i18n'
import { resolveHomeHero } from '@/lib/home_hero'

export const dynamic = 'force-dynamic'

export async function generateMetadata() {
  return buildMetadata({
    title: 'Noir Hamburg — Premium Escort Agency Hamburg',
    description: 'Noir Hamburg — premium escort agency in Hamburg. Discreet, stylish companionship for business, dinner, events and travel.',
    path: '/',
    lang: 'en',
  })
}

export default async function HomeEn() {
  const lang = 'en'
  const [services, hero] = await Promise.all([listServiceContent(), resolveHomeHero()])
  const jsonLd = [
    { '@context': 'https://schema.org', '@type': 'Organization', name: 'Noir Hamburg', url: siteUrl(), logo: `${siteUrl()}/logo.png` },
    { '@context': 'https://schema.org', '@type': 'WebSite', name: 'Noir Hamburg', url: siteUrl(), inLanguage: 'en' },
  ]
  return (
    <>
      <Header lang={lang} currentPath="/en" />
      <main id="main">
        <JsonLd data={jsonLd} />
        <section className="px-6 md:px-12 lg:px-16 pt-16 lg:pt-24 pb-16" data-testid="home-hero">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-center max-w-7xl">
            <div className="lg:col-span-7 order-1">
              <span className="overline">Premium Escort Hamburg</span>
              <h1 className="font-heading text-5xl lg:text-7xl font-light tracking-tighter leading-none mt-4">
                Noir <em className="italic accent-text">Hamburg</em>
              </h1>
              <p className="mt-6 text-lg font-light text-[#6B5F5F] max-w-2xl leading-relaxed">
                Discreet, stylish companionship for discerning gentlemen in Hamburg. Quality over quantity — personal, individual, professional.
              </p>
              <div className="mt-10 flex gap-4 flex-wrap">
                <Link href="/en/services" className="btn-primary">Explore services</Link>
                <Link href="/en/models" className="btn-ghost">Models</Link>
              </div>
            </div>
            {hero && (
              <div className="lg:col-span-5 order-2" data-testid="home-hero-image">
                <div className="editorial-image aspect-[3/4] bg-[#F2EAE4] overflow-hidden">
                  <img src={hero.image} alt={hero.alt} fetchPriority="high" className="w-full h-full object-cover" />
                </div>
              </div>
            )}
          </div>
        </section>
        <section className="px-6 md:px-12 lg:px-16 py-16 border-t border-[#1A1414]/8">
          <div className="flex items-baseline justify-between mb-10">
            <div>
              <span className="overline">Service Portfolio</span>
              <h2 className="font-heading text-4xl lg:text-5xl mt-3">Our Escort Services</h2>
            </div>
            <Link href="/en/services" className="text-xs font-mono uppercase tracking-[0.2em] accent-text hover:opacity-70">View all →</Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-px bg-[#1A1414]/5">
            {services.map((s) => (
              <Link key={s.slug} href={`/en/services/${s.slug}`} className="bg-white hover:bg-[#FBF7F4] transition-colors p-8 block group">
                <span className="overline">{s.short_label}</span>
                <h3 className="font-heading text-2xl mt-3 group-hover:accent-text transition-colors">{s.title}</h3>
                <p className="mt-3 text-sm font-light text-[#6B5F5F] leading-relaxed line-clamp-3">{pick(s, 'description', lang)}</p>
              </Link>
            ))}
          </div>
        </section>
      </main>
      <Footer lang={lang} />
    </>
  )
}
