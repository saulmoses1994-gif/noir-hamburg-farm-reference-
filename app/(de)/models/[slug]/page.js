import Link from 'next/link'
import { notFound } from 'next/navigation'
import Header from '@/components/site/Header'
import Footer from '@/components/site/Footer'
import Breadcrumbs from '@/components/site/Breadcrumbs'
import JsonLd from '@/components/site/JsonLd'
import { getPublicModel, listPublicModels } from '@/lib/models'
import { buildMetadata, breadcrumbSchema, siteUrl } from '@/lib/seo'
import { pick, t, translateAttribute } from '@/lib/i18n'

export const dynamic = 'force-dynamic'
export const dynamicParams = true

export async function generateStaticParams() {
  try { const ms = await listPublicModels(); return ms.map((m) => ({ slug: m.slug })) } catch { return [] }
}

export async function generateMetadata({ params }) {
  const { slug } = await params
  const m = await getPublicModel(slug)
  if (!m) return { title: 'Model nicht gefunden' }
  return buildMetadata({
    title: m.meta_title || `${m.name} — Escort Hamburg | Noir Hamburg`,
    description: m.meta_description || pick(m, 'bio', 'de'),
    image: m.cover_image, imageAlt: m.name,
    path: `/models/${slug}`, lang: 'de',
  })
}

function ModelDetailBody({ m, lang, slug }) {
  const jsonLd = [
    { '@context': 'https://schema.org', '@type': 'Person',
      name: m.name, description: pick(m, 'bio', lang),
      image: m.cover_image, url: `${siteUrl()}${lang === 'en' ? '/en' : ''}/models/${slug}`,
      nationality: m.nationality || undefined, knowsLanguage: m.languages || undefined },
    breadcrumbSchema([
      { name: t(lang, 'crumb.home'), url: lang === 'en' ? '/en' : '/' },
      { name: t(lang, 'crumb.models'), url: lang === 'en' ? '/en/models' : '/models' },
      { name: m.name },
    ]),
  ]
  const homeHref = lang === 'en' ? '/en' : '/'
  const modelsHref = lang === 'en' ? '/en/models' : '/models'
  const contactHref = lang === 'en' ? '/en/contact' : '/kontakt'
  const yearsLabel = t(lang, 'model.ageUnit')

  return (
    <>
      <Header lang={lang} currentPath={`${lang === 'en' ? '/en' : ''}/models/${slug}`} />
      <main id="main">
        <JsonLd data={jsonLd} />
        <section className="px-6 md:px-12 lg:px-16 pt-12 pb-8">
          <Breadcrumbs items={[{ label: t(lang, 'crumb.home'), href: homeHref }, { label: t(lang, 'crumb.models'), href: modelsHref }, { label: m.name }]} />
        </section>
        <section className="px-6 md:px-12 lg:px-16 pb-16 grid grid-cols-1 lg:grid-cols-12 gap-12">
          <div className="lg:col-span-7">
            {m.cover_image && <div className="aspect-[3/4] overflow-hidden bg-[#F2EAE4] mb-3"><img src={m.cover_image} alt={m.name} className="w-full h-full object-cover" /></div>}
            {(m.gallery || []).length > 0 && (
              <div className="grid grid-cols-3 gap-3 mt-3">
                {m.gallery.map((g, i) => (
                  <div key={i} className="aspect-[3/4] overflow-hidden bg-[#F2EAE4]"><img src={g} alt={`${m.name} ${i + 1}`} className="w-full h-full object-cover" loading="lazy" /></div>
                ))}
              </div>
            )}
          </div>
          <div className="lg:col-span-5">
            <span className="overline">{t(lang, 'model.overline')}</span>
            <h1 className="font-heading text-5xl lg:text-6xl font-semibold tracking-tight mt-3">{m.name}</h1>
            {pick(m, 'short_tagline', lang) && (<p className="font-heading italic text-xl text-[#6B5F5F] mt-2">{pick(m, 'short_tagline', lang)}</p>)}

            <dl className="mt-8 grid grid-cols-2 gap-y-3 gap-x-6 text-sm">
              {m.age && (<><dt className="overline">{t(lang, 'model.age')}</dt><dd>{m.age} {yearsLabel}</dd></>)}
              {m.height_cm && (<><dt className="overline">{t(lang, 'model.height')}</dt><dd>{m.height_cm} cm</dd></>)}
              {m.measurements && (<><dt className="overline">{t(lang, 'model.measurements')}</dt><dd>{m.measurements}</dd></>)}
              {m.dress_size && (<><dt className="overline">{t(lang, 'model.dress')}</dt><dd>{m.dress_size}</dd></>)}
              {m.hair_color && (<><dt className="overline">{t(lang, 'model.hair')}</dt><dd>{translateAttribute(m.hair_color, lang)}</dd></>)}
              {m.eye_color && (<><dt className="overline">{t(lang, 'model.eyes')}</dt><dd>{translateAttribute(m.eye_color, lang)}</dd></>)}
              {m.nationality && (<><dt className="overline">{t(lang, 'model.nationality')}</dt><dd>{translateAttribute(m.nationality, lang)}</dd></>)}
              {(m.languages || []).length > 0 && (<><dt className="overline">{t(lang, 'model.languages')}</dt><dd>{m.languages.map((l) => translateAttribute(l, lang)).join(', ')}</dd></>)}
            </dl>

            {pick(m, 'bio', lang) && (
              <div className="mt-10">
                <span className="overline">{t(lang, 'model.about')} {m.name.split(' ')[0]}</span>
                <p className="mt-3 text-base font-light text-[#3F3838] leading-relaxed whitespace-pre-line">{pick(m, 'bio', lang)}</p>
              </div>
            )}

            {(m.prices || []).length > 0 && (
              <div className="mt-10">
                <span className="overline">{t(lang, 'model.prices')}</span>
                <ul className="mt-3 divide-y divide-[#1A1414]/8">
                  {m.prices.map((p, i) => (
                    <li key={i} className="flex justify-between py-3">
                      <span>{translateAttribute(p.label, lang)}</span>
                      <span className="font-mono">{p.amount?.toLocaleString(lang === 'en' ? 'en-US' : 'de-DE')} €</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="mt-10 flex gap-3 flex-wrap">
              <Link href={contactHref} className="btn-primary">{t(lang, 'cta.bookNowArrow')}</Link>
              <a href="https://wa.me/4940000000000" target="_blank" rel="noreferrer nofollow" className="btn-whatsapp">{t(lang, 'cta.whatsapp')}</a>
            </div>

            {(m.services || []).length > 0 && (
              <div className="mt-10">
                <span className="overline">{t(lang, 'model.services')}</span>
                <div className="flex flex-wrap gap-2 mt-3">
                  {m.services.map((s) => (
                    <Link key={s} href={`${lang === 'en' ? '/en' : ''}/services/${s}`} className="px-3 py-1 border border-[#1A1414]/15 rounded-full text-xs font-mono uppercase tracking-[0.15em] hover:accent-text hover:border-[#8B1538]/40">{s.replace(/-/g, ' ')}</Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer lang={lang} />
    </>
  )
}

export default async function ModelDetail({ params }) {
  const { slug } = await params
  const m = await getPublicModel(slug)
  if (!m) notFound()
  return <ModelDetailBody m={m} lang="de" slug={slug} />
}

export { ModelDetailBody }
