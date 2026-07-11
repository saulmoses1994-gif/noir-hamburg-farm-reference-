import Link from 'next/link'
import Header from '@/components/site/Header'
import Footer from '@/components/site/Footer'
import Breadcrumbs from '@/components/site/Breadcrumbs'
import JsonLd from '@/components/site/JsonLd'
import { pick, t, localePath } from '@/lib/i18n'
import { siteUrl, breadcrumbSchema } from '@/lib/seo'

// Slugify for Table-of-Contents anchors — must match the one applied to
// the article HTML when we inject `id` attributes onto <h2> headings.
function slugifyToc(s) {
  return String(s)
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .slice(0, 60)
}

// Adds `id` attributes to every <h2> in the article HTML so the TOC links
// resolve to real anchors. Returns { html, toc }.
function decorateH2s(rawHtml) {
  const toc = []
  const html = String(rawHtml || '').replace(
    /<h2([^>]*)>([\s\S]*?)<\/h2>/gi,
    (m, attrs, inner) => {
      const text = inner.replace(/<[^>]+>/g, '').trim()
      if (!text) return m
      const id = slugifyToc(text)
      toc.push({ id, text })
      const hasId = /\bid=/i.test(attrs)
      return hasId ? m : `<h2${attrs} id="${id}">${inner}</h2>`
    },
  )
  return { html, toc }
}

export default function BlogDetailBody({ lang, post, relatedPosts = [], relatedServices = [], relatedLocations = [], relatedModels = [] }) {
  const isEn = lang === 'en'
  const title = pick(post, 'title', lang) || ''
  const excerpt = pick(post, 'excerpt', lang) || ''
  const rawContent = pick(post, 'content', lang) || ''
  // Show the "EN preview" banner when the reader is on the EN twin but only
  // German long-form content exists (rule (a) fallback).
  const enFallback = isEn && !post.content_en

  const { html: content, toc } = decorateH2s(rawContent)

  // Normalise per-article FAQs to the active language.
  const articleFaqs = (post.faqs || [])
    .map((f) => ({
      q: (isEn && f.q_en ? f.q_en : f.q) || '',
      a: (isEn && f.a_en ? f.a_en : f.a) || '',
    }))
    .filter((f) => f.q && f.a)

  const detailPath = localePath(lang, `/blog/${post.slug}`)
  const blogHref = localePath(lang, '/blog')
  const homeHref = lang === 'en' ? '/en' : '/'
  const contactHref = localePath(lang, '/kontakt')
  const modelsHref = localePath(lang, '/models')

  const jsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: title,
      description: excerpt || undefined,
      image: post.cover_image || undefined,
      datePublished: post.created_at,
      dateModified: post.updated_at || post.created_at,
      author: { '@type': 'Organization', name: 'Noir Hamburg' },
      publisher: { '@type': 'Organization', name: 'Noir Hamburg' },
      inLanguage: isEn && post.content_en ? 'en' : 'de-DE',
      articleSection: post.category || undefined,
      mainEntityOfPage: { '@type': 'WebPage', '@id': `${siteUrl()}${detailPath}` },
    },
    breadcrumbSchema([
      { name: t(lang, 'crumb.home'), url: homeHref },
      { name: t(lang, 'crumb.blog'), url: blogHref },
      { name: title },
    ]),
    ...(articleFaqs.length
      ? [{
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: articleFaqs.map((f) => ({
            '@type': 'Question',
            name: f.q,
            acceptedAnswer: { '@type': 'Answer', text: f.a },
          })),
        }]
      : []),
  ]

  const dateFmt = (d) => {
    if (!d) return ''
    try {
      return new Date(d).toLocaleDateString(isEn ? 'en-US' : 'de-DE', {
        year: 'numeric', month: 'long', day: 'numeric',
      })
    } catch { return '' }
  }

  return (
    <>
      <Header lang={lang} currentPath={detailPath} />
      <main id="main">
        <JsonLd data={jsonLd} />

        <section className="px-6 md:px-12 lg:px-16 pt-8 pb-4">
          <Breadcrumbs items={[
            { label: t(lang, 'crumb.home'), href: homeHref },
            { label: t(lang, 'crumb.blog'), href: blogHref },
            { label: title },
          ]} />
          <div className="mt-4 flex flex-wrap gap-3 text-sm" data-testid="blog-cta-top">
            <Link href={contactHref} className="text-[#8B1538] hover:underline font-semibold" data-testid="blog-cta-contact-top">
              {t(lang, 'blog.detail.contactTop')}
            </Link>
            <span className="text-[#6B5F5F]">·</span>
            <Link href={modelsHref} className="text-[#3F3838] hover:accent-text" data-testid="blog-cta-models-top">
              {t(lang, 'blog.detail.modelsTop')}
            </Link>
          </div>
        </section>

        <article className="px-6 md:px-12 lg:px-16 pb-20">
          <header className="max-w-4xl mx-auto text-center py-12 md:py-20">
            <span className="overline accent-text">{post.category}</span>
            <h1 className="font-heading text-4xl sm:text-5xl lg:text-7xl font-light tracking-tighter leading-tight mt-6">
              {title}
            </h1>
            {post.created_at && (
              <div className="overline mt-8">{dateFmt(post.created_at)}</div>
            )}
          </header>

          {post.cover_image && (
            <div className="editorial-image h-[60vh] mb-16 max-w-6xl mx-auto">
              <img src={post.cover_image} alt={title} loading="eager" fetchpriority="high" className="w-full h-full object-cover" />
            </div>
          )}

          {enFallback && (
            <div className="max-w-3xl mx-auto mb-8 p-4 border-l-4 border-[#8B1538] bg-[#FAF5F2] text-sm text-[#4A3F3F]" data-testid="en-fallback-note">
              <strong className="text-[#8B1538]">{t(lang, 'blog.detail.enFallbackTitle')}</strong>{' '}
              {t(lang, 'blog.detail.enFallback')}
            </div>
          )}

          {toc.length >= 3 && (
            <aside className="max-w-3xl mx-auto mb-12 p-6 bg-[#FBF7F4] border-l-4 border-[#8B1538] rounded-r-lg" data-testid="blog-toc">
              <div className="overline text-[10px] mb-3">{t(lang, 'blog.detail.toc')}</div>
              <ol className="space-y-2 list-decimal list-inside marker:accent-text marker:font-mono marker:text-xs">
                {toc.map((item) => (
                  <li key={item.id} className="text-sm text-[#3F3838]">
                    <a
                      href={`#${item.id}`}
                      className="hover:accent-text underline decoration-transparent hover:decoration-[#8B1538] transition-colors"
                      data-testid={`toc-${item.id}`}
                    >
                      {item.text}
                    </a>
                  </li>
                ))}
              </ol>
            </aside>
          )}

          <div
            className="prose-noir max-w-3xl mx-auto"
            dangerouslySetInnerHTML={{ __html: content }}
            data-testid="blog-content"
          />

          <div className="max-w-3xl mx-auto mt-16 flex flex-wrap gap-4 justify-center" data-testid="blog-cta-middle">
            <Link href={modelsHref} className="btn-primary" data-testid="blog-cta-view-models">
              {t(lang, 'blog.detail.viewModelsCta')} →
            </Link>
          </div>

          {articleFaqs.length > 0 && (
            <div className="max-w-3xl mx-auto mt-16" data-testid="blog-faq">
              <span className="overline">{t(lang, 'blog.detail.faqOverline')}</span>
              <h2 className="font-heading text-2xl lg:text-3xl text-[#1A1414] mt-3 mb-6">
                {t(lang, 'blog.detail.faqTitle')}
              </h2>
              <div className="space-y-3">
                {articleFaqs.map((f, i) => (
                  <details key={i} className="bg-white border border-[#1A1414]/8 rounded-lg group" data-testid={`blog-faq-${i}`}>
                    <summary className="cursor-pointer p-5 list-none flex items-center justify-between gap-4">
                      <span className="font-heading text-lg text-[#1A1414]">{f.q}</span>
                      <span className="accent-text text-2xl group-open:rotate-45 transition-transform">+</span>
                    </summary>
                    <div className="px-5 pb-5 text-sm text-[#6B5F5F] leading-relaxed">{f.a}</div>
                  </details>
                ))}
              </div>
            </div>
          )}

          <div className="max-w-3xl mx-auto mt-20 thin-divider" />

          {(relatedServices.length > 0 || relatedLocations.length > 0) && (
            <div className="max-w-3xl mx-auto mt-12 grid grid-cols-1 md:grid-cols-2 gap-12">
              {relatedServices.length > 0 && (
                <div>
                  <span className="overline mb-4 block">{t(lang, 'blog.detail.relatedServices')}</span>
                  <ul className="space-y-3">
                    {relatedServices.map((s) => (
                      <li key={s.slug}>
                        <Link
                          href={localePath(lang, `/services/${s.slug}`)}
                          className="font-heading text-xl link-underline hover:accent-text"
                        >
                          {pick(s, 'title', lang) || s.title}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {relatedLocations.length > 0 && (
                <div>
                  <span className="overline mb-4 block">{t(lang, 'blog.detail.relatedAreas')}</span>
                  <ul className="space-y-3">
                    {relatedLocations.map((l) => (
                      <li key={l.slug}>
                        <Link
                          href={localePath(lang, `/escort/${l.slug}`)}
                          className="font-heading text-xl link-underline hover:accent-text"
                        >
                          {pick(l, 'name', lang) || l.name || l.title}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {relatedModels.length > 0 && (
            <div className="max-w-5xl mx-auto mt-16" data-testid="blog-related-models">
              <span className="overline mb-6 block">{t(lang, 'blog.detail.relatedModels')}</span>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {relatedModels.map((m) => (
                  <Link
                    key={m.slug}
                    href={localePath(lang, `/models/${m.slug}`)}
                    className="group block"
                    data-testid={`blog-related-model-${m.slug}`}
                  >
                    {m.cover_image && (
                      <div className="editorial-image aspect-[3/4] overflow-hidden mb-4">
                        <img src={m.cover_image} alt={m.name} loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      </div>
                    )}
                    <h3 className="font-heading text-xl group-hover:accent-text">{m.name}</h3>
                    {pick(m, 'short_tagline', lang) && (
                      <p className="text-xs font-light text-[#6B5F5F] mt-1">{pick(m, 'short_tagline', lang)}</p>
                    )}
                  </Link>
                ))}
              </div>
            </div>
          )}

          {relatedPosts.length > 0 && (
            <div className="max-w-5xl mx-auto mt-16" data-testid="blog-related-articles">
              <span className="overline mb-6 block">{t(lang, 'blog.detail.relatedArticles')}</span>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {relatedPosts.map((p) => (
                  <Link
                    key={p.slug}
                    href={localePath(lang, `/blog/${p.slug}`)}
                    className="group block"
                    data-testid={`blog-related-post-${p.slug}`}
                  >
                    {p.cover_image && (
                      <div className="editorial-image aspect-[4/3] overflow-hidden mb-4">
                        <img src={p.cover_image} alt={pick(p, 'title', lang)} loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      </div>
                    )}
                    <span className="overline text-[10px] accent-text">{p.category}</span>
                    <h3 className="font-heading text-xl mt-2 group-hover:accent-text">{pick(p, 'title', lang)}</h3>
                  </Link>
                ))}
              </div>
            </div>
          )}

          <div className="max-w-3xl mx-auto mt-16 text-center space-y-6" data-testid="blog-cta-bottom">
            <div className="p-8 bg-[#FBF7F4] border-l-4 border-[#8B1538] text-left">
              <h2 className="font-heading text-2xl md:text-3xl text-[#1A1414] mb-3">
                {t(lang, 'blog.detail.contactBoxTitle')}
              </h2>
              <p className="text-[#3F3838] leading-relaxed mb-5">
                {t(lang, 'blog.detail.contactBoxBody')}
              </p>
              <div className="flex flex-wrap gap-3">
                <Link href={contactHref} className="btn-primary" data-testid="blog-cta-contact">
                  {t(lang, 'blog.detail.contactBoxAction')} →
                </Link>
                <Link href={modelsHref} className="btn-ghost" data-testid="blog-cta-models-bottom">
                  {t(lang, 'blog.detail.contactBoxSecondary')}
                </Link>
              </div>
            </div>
            <Link href={blogHref} className="btn-ghost inline-block">
              {t(lang, 'blog.detail.backToMag')}
            </Link>
          </div>
        </article>
      </main>
      <Footer lang={lang} />
    </>
  )
}
