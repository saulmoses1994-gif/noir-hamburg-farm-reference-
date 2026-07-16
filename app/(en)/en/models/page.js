import Link from 'next/link'
import Header from '@/components/site/Header'
import Footer from '@/components/site/Footer'
import Breadcrumbs from '@/components/site/Breadcrumbs'
import JsonLd from '@/components/site/JsonLd'
import { listPublicModels } from '@/lib/models'
import { buildMetadata, breadcrumbSchema, siteUrl } from '@/lib/seo'
import { pick } from '@/lib/i18n'

export const dynamic = 'force-dynamic'

export async function generateMetadata() {
  return buildMetadata({
    title: 'Models — Premium Escort Hamburg | Noir Hamburg',
    description: 'Handpicked companion models from Noir Hamburg. Discreet, stylish ladies for business, dinner, events and travel in Hamburg.',
    path: '/models',
    lang: 'en',
  })
}

export default async function ModelsListEn() {
  const lang = 'en'
  const models = await listPublicModels()
  const jsonLd = [
    breadcrumbSchema([{ name: 'Home', url: '/en' }, { name: 'Models', url: '/en/models' }]),
    { '@context': 'https://schema.org', '@type': 'ItemList',
      itemListElement: models.map((m, i) => ({ '@type': 'ListItem', position: i + 1, name: m.name, url: `${siteUrl()}/en/models/${m.slug}` })) },
  ]
  return (
    <>
      <Header lang={lang} currentPath="/en/models" />
      <main id="main">
        <JsonLd data={jsonLd} />
        <section className="px-6 md:px-12 lg:px-16 pt-12 pb-8">
          <Breadcrumbs items={[{ label: 'Home', href: '/en' }, { label: 'Models' }]} />
          <div className="mt-8 max-w-3xl">
            <span className="overline">Our companions</span>
            <h1 className="font-heading text-4xl sm:text-5xl lg:text-7xl font-light tracking-tighter leading-[1.05] mt-4">
              Models <em className="italic accent-text">Hamburg</em>
            </h1>
            <p className="mt-6 text-base sm:text-lg font-light text-[#6B5F5F] leading-relaxed">
              Handpicked companionship for discerning gentlemen — from the first coffee to the stylish dinner.
            </p>
          </div>
        </section>
        <section className="px-6 md:px-12 lg:px-16 pb-24 md:pb-32">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {models.map((m) => {
              const hour = Array.isArray(m.prices) ? m.prices.find((p) => p.unit === 'hour') : null
              const hourPrice = hour
                ? new Intl.NumberFormat('en-US', { style: 'currency', currency: hour.currency || 'EUR', maximumFractionDigits: 0 }).format(hour.amount)
                : null
              return (
                <Link key={m.slug} href={`/en/models/${m.slug}`} className="group block">
                  <div className="aspect-[3/4] bg-[#F2EAE4] overflow-hidden editorial-image relative">
                    {m.cover_image && <img src={m.cover_image} alt={m.name} className="w-full h-full object-cover" loading="lazy" />}
                    {m.featured && <span className="absolute top-4 left-4 px-2 py-0.5 bg-white/90 backdrop-blur text-[10px] font-mono uppercase tracking-[0.2em] accent-text rounded-full">Featured</span>}
                    {hourPrice && (
                      <span
                        className="absolute bottom-3 right-3 px-3 py-1.5 bg-[#1A1414]/85 backdrop-blur text-white text-[11px] font-mono tracking-widest rounded-full"
                        data-testid={`model-price-${m.slug}`}
                      >
                        from {hourPrice} <span className="text-white/70">· 1 hr</span>
                      </span>
                    )}
                  </div>
                  <div className="pt-5">
                    <div className="flex items-baseline justify-between gap-3 flex-wrap">
                      <h2 className="font-heading text-2xl group-hover:accent-text transition-colors">{m.name}</h2>
                      <div className="text-xs font-mono text-[#6B5F5F]">{m.age ? `${m.age} y.` : ''}{m.height_cm ? ` · ${m.height_cm} cm` : ''}</div>
                    </div>
                    {pick(m, 'short_tagline', lang) && <p className="font-heading italic text-[#6B5F5F] mt-1 text-sm">{pick(m, 'short_tagline', lang)}</p>}
                  </div>
                </Link>
              )
            })}
          </div>
        </section>
      </main>
      <Footer lang={lang} />
    </>
  )
}
