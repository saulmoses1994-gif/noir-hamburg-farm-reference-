import Link from 'next/link'
import { notFound } from 'next/navigation'
import Header from '@/components/site/Header'
import Footer from '@/components/site/Footer'
import Breadcrumbs from '@/components/site/Breadcrumbs'
import JsonLd from '@/components/site/JsonLd'
import { getPublicModel, listPublicModels } from '@/lib/models'
import { buildMetadata, breadcrumbSchema, siteUrl } from '@/lib/seo'
import { pick } from '@/lib/i18n'

export const revalidate = 300
export const dynamicParams = true

export async function generateStaticParams() {
  try { const ms = await listPublicModels(); return ms.map((m) => ({ slug: m.slug })) } catch { return [] }
}

export async function generateMetadata({ params }) {
  const { slug } = await params
  const m = await getPublicModel(slug)
  if (!m) return { title: 'Model not found' }
  return buildMetadata({
    title: pick(m, 'meta_title', 'en') || `${m.name} — Escort Hamburg | Noir Hamburg`,
    description: pick(m, 'meta_description', 'en') || pick(m, 'bio', 'en'),
    image: m.cover_image,
    imageAlt: m.name,
    path: `/models/${slug}`,
    lang: 'en',
  })
}

export default async function ModelDetailEn({ params }) {
  const { slug } = await params
  const lang = 'en'
  const m = await getPublicModel(slug)
  if (!m) notFound()

  const jsonLd = [
    { '@context': 'https://schema.org', '@type': 'Person',
      name: m.name, description: pick(m, 'bio', lang), image: m.cover_image,
      url: `${siteUrl()}/en/models/${slug}`,
      nationality: m.nationality || undefined, knowsLanguage: m.languages || undefined },
    breadcrumbSchema([{ name: 'Home', url: '/en' }, { name: 'Models', url: '/en/models' }, { name: m.name }]),
  ]

  return (
    <>
      <Header lang={lang} currentPath={`/en/models/${slug}`} />
      <main id="main">
        <JsonLd data={jsonLd} />
        <section className="px-6 md:px-12 lg:px-16 pt-12 pb-8">
          <Breadcrumbs items={[{ label: 'Home', href: '/en' }, { label: 'Models', href: '/en/models' }, { label: m.name }]} />
        </section>
        <section className="px-6 md:px-12 lg:px-16 pb-16 grid grid-cols-1 lg:grid-cols-12 gap-12">
          <div className="lg:col-span-7">
            {m.cover_image && <div className="aspect-[3/4] overflow-hidden bg-[#F2EAE4] mb-3"><img src={m.cover_image} alt={m.name} className="w-full h-full object-cover" /></div>}
            {(m.gallery || []).length > 0 && (
              <div className="grid grid-cols-3 gap-3 mt-3">
                {m.gallery.map((g, i) => <div key={i} className="aspect-[3/4] overflow-hidden bg-[#F2EAE4]"><img src={g} alt={`${m.name} ${i + 1}`} className="w-full h-full object-cover" loading="lazy" /></div>)}
              </div>
            )}
          </div>
          <div className="lg:col-span-5">
            <span className="overline">Model</span>
            <h1 className="font-heading text-5xl lg:text-6xl font-semibold tracking-tight mt-3">{m.name}</h1>
            {pick(m, 'short_tagline', lang) && <p className="font-heading italic text-xl text-[#6B5F5F] mt-2">{pick(m, 'short_tagline', lang)}</p>}

            <dl className="mt-8 grid grid-cols-2 gap-y-3 gap-x-6 text-sm">
              {m.age && (<><dt className="overline">Age</dt><dd>{m.age} years</dd></>)}
              {m.height_cm && (<><dt className="overline">Height</dt><dd>{m.height_cm} cm</dd></>)}
              {m.measurements && (<><dt className="overline">Measurements</dt><dd>{m.measurements}</dd></>)}
              {m.dress_size && (<><dt className="overline">Dress</dt><dd>{m.dress_size}</dd></>)}
              {m.hair_color && (<><dt className="overline">Hair</dt><dd>{m.hair_color}</dd></>)}
              {m.eye_color && (<><dt className="overline">Eyes</dt><dd>{m.eye_color}</dd></>)}
              {m.nationality && (<><dt className="overline">Nationality</dt><dd>{m.nationality}</dd></>)}
              {(m.languages || []).length > 0 && (<><dt className="overline">Languages</dt><dd>{m.languages.join(', ')}</dd></>)}
            </dl>

            {pick(m, 'bio', lang) && <div className="mt-10"><span className="overline">About {m.name.split(' ')[0]}</span><p className="mt-3 text-base font-light text-[#3F3838] leading-relaxed whitespace-pre-line">{pick(m, 'bio', lang)}</p></div>}
            {(m.prices || []).length > 0 && (
              <div className="mt-10"><span className="overline">Rates</span>
                <ul className="mt-3 divide-y divide-[#1A1414]/8">
                  {m.prices.map((p, i) => <li key={i} className="flex justify-between py-3"><span>{p.label}</span><span className="font-mono">{p.amount?.toLocaleString('en-US')} €</span></li>)}
                </ul>
              </div>
            )}
            <div className="mt-10 flex gap-3 flex-wrap">
              <Link href="/en/contact" className="btn-primary">Book now →</Link>
              <a href="https://wa.me/4940000000000" target="_blank" rel="noreferrer nofollow" className="btn-whatsapp">WhatsApp</a>
            </div>
          </div>
        </section>
      </main>
      <Footer lang={lang} />
    </>
  )
}
