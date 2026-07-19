import Link from 'next/link'
import Header from '@/components/site/Header'
import Footer from '@/components/site/Footer'
import JsonLd from '@/components/site/JsonLd'
import { listServiceContent } from '@/lib/service-content'
import { buildMetadata, siteUrl, organizationSchema } from '@/lib/seo'
import { getSettings } from '@/lib/settings'
import { pick } from '@/lib/i18n'
import { resolveHomeHero } from '@/lib/home_hero'

export const dynamic = 'force-dynamic'

export async function generateMetadata() {
  return buildMetadata({
    title: 'Noir Hamburg — Premium Escort Hamburg | Diskrete Begleitagentur',
    description: 'Noir Hamburg — Premium Escort Agentur in Hamburg. Diskrete, stilvolle Begleitung für Business, Dinner, Events und Reisen.',
    path: '/',
    lang: 'de',
  })
}

export default async function Home() {
  const lang = 'de'
  const [services, hero, settings] = await Promise.all([listServiceContent(), resolveHomeHero(), getSettings().catch(() => ({}))])
  const jsonLd = [
    organizationSchema(settings),
    { '@context': 'https://schema.org', '@type': 'WebSite', '@id': `${siteUrl()}/#website`, name: 'Noir Hamburg', url: siteUrl(), inLanguage: 'de', publisher: { '@id': `${siteUrl()}/#organization` } },
  ]
  return (
    <>
      <Header lang={lang} currentPath="/" />
      <main id="main">
        <JsonLd data={jsonLd} />
        <section className="px-6 md:px-12 lg:px-16 pt-10 md:pt-16 lg:pt-24 pb-12 md:pb-16" data-testid="home-hero">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-10 lg:gap-16 items-center max-w-7xl">
            <div className="lg:col-span-7 order-2 lg:order-1">
              <span className="overline">Premium Escort Hamburg</span>
              <h1 className="font-heading text-4xl sm:text-5xl lg:text-7xl font-light tracking-tighter leading-[1.05] mt-4">
                Noir <em className="italic accent-text">Hamburg</em>
              </h1>
              <p className="mt-5 md:mt-6 text-base sm:text-lg font-light text-[#6B5F5F] max-w-2xl leading-relaxed">
                Diskrete, stilvolle Begleitung für anspruchsvolle Kunden in Hamburg. Qualität statt Quantität — persönlich, individuell, professionell.
              </p>
              <div className="mt-8 md:mt-10 flex gap-3 flex-wrap">
                <Link href="/services" className="btn-primary min-h-[48px] inline-flex items-center">Services entdecken</Link>
                <Link href="/models" className="btn-ghost min-h-[48px] inline-flex items-center">Models</Link>
              </div>
            </div>
            {hero && (
              <div className="lg:col-span-5 order-1 lg:order-2" data-testid="home-hero-image">
                <div className="editorial-image aspect-[4/5] sm:aspect-[3/4] bg-[#F2EAE4] overflow-hidden">
                  <img
                    src={hero.image}
                    alt={hero.alt}
                    fetchPriority="high"
                    className="w-full h-full object-cover object-[center_20%]"
                  />
                </div>
              </div>
            )}
          </div>
        </section>
        <section className="px-6 md:px-12 lg:px-16 py-12 md:py-16 border-t border-[#1A1414]/8">
          <div className="flex items-baseline justify-between mb-8 md:mb-10 gap-4">
            <div>
              <span className="overline">Service-Portfolio</span>
              <h2 className="font-heading text-2xl sm:text-3xl md:text-4xl lg:text-5xl mt-3 leading-tight">Unsere Escort Services</h2>
            </div>
            <Link href="/services" className="text-xs font-mono uppercase tracking-[0.2em] accent-text hover:opacity-70 whitespace-nowrap">Alle ansehen →</Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px bg-[#1A1414]/5">
            {services.map((s) => (
              <Link key={s.slug} href={`/services/${s.slug}`} className="bg-white hover:bg-[#FBF7F4] transition-colors p-6 md:p-8 block group">
                <span className="overline">{s.short_label}</span>
                <h3 className="font-heading text-xl md:text-2xl mt-3 group-hover:accent-text transition-colors leading-tight">{s.title}</h3>
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
