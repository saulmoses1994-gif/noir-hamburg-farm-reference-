import Link from 'next/link'
import { notFound } from 'next/navigation'
import Header from '@/components/site/Header'
import Footer from '@/components/site/Footer'
import Breadcrumbs from '@/components/site/Breadcrumbs'
import JsonLd from '@/components/site/JsonLd'
import { getServiceContent, listServiceContent } from '@/lib/service-content'
import { buildMetadata, breadcrumbSchema, siteUrl } from '@/lib/seo'
import { pick } from '@/lib/i18n'

export const revalidate = 300
export const dynamicParams = true

export async function generateStaticParams() {
  try {
    const services = await listServiceContent()
    return services.map((s) => ({ slug: s.slug }))
  } catch { return [] }
}

export async function generateMetadata({ params }) {
  const { slug } = await params
  const s = await getServiceContent(slug)
  if (!s) return { title: 'Service nicht gefunden' }
  return buildMetadata({
    title: s.meta_title || s.title,
    description: s.meta_description || s.description,
    image: s.image,
    imageAlt: s.image_alt || s.title,
    path: `/services/${slug}`,
    lang: 'de',
  })
}

export default async function ServiceDetail({ params }) {
  const { slug } = await params
  const lang = 'de'
  const s = await getServiceContent(slug)
  if (!s) notFound()

  const sections = s.sections || []
  const faqs = s.faqs || []
  const keypoints = pick(s, 'keypoints', lang) || []

  const jsonLd = [
    {
      '@context': 'https://schema.org', '@type': 'Service',
      name: s.title,
      description: pick(s, 'meta_description', lang) || pick(s, 'description', lang),
      provider: { '@type': 'LocalBusiness', name: 'Noir Hamburg', areaServed: 'Hamburg' },
      areaServed: { '@type': 'City', name: 'Hamburg' },
      serviceType: s.short_label, image: s.image,
      url: `${siteUrl()}/services/${slug}`,
    },
    breadcrumbSchema([
      { name: 'Home', url: '/' },
      { name: 'Services', url: '/services' },
      { name: s.title },
    ]),
    ...(faqs.length ? [{
      '@context': 'https://schema.org', '@type': 'FAQPage',
      mainEntity: faqs.map((f) => ({
        '@type': 'Question', name: pick(f, 'q', lang),
        acceptedAnswer: { '@type': 'Answer', text: pick(f, 'a', lang) },
      })),
    }] : []),
  ]

  const heroAlt = pick(s, 'image_alt', lang) || `${s.title} — Noir Hamburg Premium Escort Service`
  const tagline = pick(s, 'tagline', lang)

  return (
    <>
      <Header lang={lang} currentPath={`/services/${slug}`} />
      <main id="main">
        <JsonLd data={jsonLd} />
        <section className="relative h-[60vh] flex items-end">
          <div className="absolute inset-0">
            {s.image && <img src={s.image} alt={heroAlt} className="w-full h-full object-cover" />}
            <div className="absolute inset-0 bg-gradient-to-t from-[#1A1414] via-[#1A1414]/60 to-transparent" />
          </div>
          <div className="relative z-10 px-6 md:px-12 lg:px-16 pb-12 max-w-4xl text-white">
            <Breadcrumbs items={[{ label: 'Services', href: '/services' }, { label: s.title }]} dark />
            <span className="overline block mt-6 mb-4 text-[#E5A5B5]">{s.short_label}</span>
            <h1 className="font-heading text-5xl lg:text-7xl font-semibold tracking-tight leading-tight text-white">{s.h1}</h1>
            {tagline && <p className="font-heading italic text-xl text-white/80 mt-4">{tagline}</p>}
          </div>
        </section>

        <section className="px-6 md:px-12 lg:px-16 py-24">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            <div className="lg:col-span-8">
              {tagline && <h2 className="font-heading text-3xl lg:text-4xl mb-8">{tagline}</h2>}
              <p className="text-base lg:text-lg font-light text-[#3F3838] leading-relaxed">{pick(s, 'long_copy', lang)}</p>

              {sections.map((sec, i) => (
                <div key={i} className="mt-14">
                  <h2 className="font-heading text-2xl lg:text-3xl text-[#1A1414] mb-5">{pick(sec, 'h2', lang)}</h2>
                  <div className="space-y-4 text-[#3F3838] leading-relaxed">
                    {(pick(sec, 'body', lang) || []).map((p, j) => <p key={j}>{p}</p>)}
                  </div>
                </div>
              ))}

              {keypoints.length > 0 && (
                <div className="mt-16">
                  <span className="overline">Merkmale</span>
                  <ul className="mt-6 space-y-4">
                    {keypoints.map((k) => (
                      <li key={k} className="flex gap-4 items-start border-t border-[#1A1414]/8 pt-4">
                        <span className="accent-text font-mono text-xs mt-1">·</span>
                        <span className="text-base font-light text-[#1A1414]">{k}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {faqs.length > 0 && (
                <div className="mt-16">
                  <span className="overline">Fragen</span>
                  <h2 className="font-heading text-2xl lg:text-3xl text-[#1A1414] mt-3 mb-6">Häufige Fragen zu {s.title}</h2>
                  <div className="space-y-3">
                    {faqs.map((f, i) => (
                      <details key={i} className="bg-white border border-[#1A1414]/8 rounded-lg group">
                        <summary className="cursor-pointer p-5 list-none flex items-center justify-between gap-4">
                          <span className="font-heading text-lg text-[#1A1414]">{pick(f, 'q', lang)}</span>
                          <span aria-hidden="true" className="accent-text text-2xl group-open:rotate-45 transition-transform">+</span>
                        </summary>
                        <div className="px-5 pb-5 text-sm text-[#6B5F5F] leading-relaxed">{pick(f, 'a', lang)}</div>
                      </details>
                    ))}
                  </div>
                </div>
              )}

              <div className="mt-16 flex gap-4 flex-wrap">
                <Link href="/kontakt" className="btn-primary">Termin buchen →</Link>
                <a href="https://wa.me/4940000000000" target="_blank" rel="noreferrer nofollow" className="btn-whatsapp">WhatsApp</a>
                <Link href="/models" className="btn-ghost">Models entdecken</Link>
              </div>
            </div>

            <aside className="lg:col-span-4 space-y-10">
              <div>
                <span className="overline mb-3 block">Verwandte Services</span>
                <ul className="space-y-3">
                  {(s.related_services || []).slice(0, 5).map((sl) => (
                    <li key={sl}><Link href={`/services/${sl}`} className="font-heading text-xl hover:accent-text transition-colors capitalize">{sl.replace(/-/g, ' ')}</Link></li>
                  ))}
                </ul>
              </div>
            </aside>
          </div>
        </section>
      </main>
      <Footer lang={lang} />
    </>
  )
}
