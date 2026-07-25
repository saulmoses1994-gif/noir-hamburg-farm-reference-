import Link from 'next/link'
import Header from '@/components/site/Header'
import Footer from '@/components/site/Footer'
import Breadcrumbs from '@/components/site/Breadcrumbs'
import JsonLd from '@/components/site/JsonLd'
import { pick, t, localePath } from '@/lib/i18n'
import { siteUrl, breadcrumbSchema } from '@/lib/seo'
import { optimizeImageUrl } from '@/lib/cloudinary'
import { buildResponsiveImage } from '@/lib/responsive-image'
import { ensureFormattedHtml } from '@/lib/render-content'

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

export default function BlogDetailBody({ lang, post, relatedPosts = [], relatedServices = [], relatedLocations = [], relatedModels = [], counterpartHref = null }) {
  const isEn = lang === 'en'
  // MULTILINGUAL SPLIT: DE and EN pages are now fully separate URLs, so we
  // read the language-appropriate fields DIRECTLY \u2014 no cross-language
  // fallback. The EN route already refuses to render when EN content is
  // missing (returns 404), so we can safely trust that title_en/content_en
  // are present when lang==='en'.
  const title = (isEn ? post.title_en : post.title) || ''
  const excerpt = (isEn ? post.excerpt_en : post.excerpt) || ''
  const rawContent = ensureFormattedHtml((isEn ? post.content_en : post.content) || '')

  const { html: content, toc } = decorateH2s(rawContent)

  // Per-article FAQs \u2014 language-locked, same principle as above.
  const articleFaqs = (post.faqs || [])
    .map((f) => ({
      q: (isEn ? f.q_en : f.q) || '',
      a: (isEn ? f.a_en : f.a) || '',
    }))
    .filter((f) => f.q && f.a)

  // Blog URL for THIS article — EN uses slug_en, DE uses the DE slug.
  // Never crosses language boundaries.
  const articleSlug = isEn ? (post.slug_en || post.slug) : post.slug
  const detailPath = isEn ? `/en/blog/${articleSlug}` : `/blog/${articleSlug}`
  const blogHref = localePath(lang, '/blog')
  const homeHref = lang === 'en' ? '/en' : '/'
  const contactHref = localePath(lang, '/kontakt')
  const modelsHref = localePath(lang, '/models')

  // ─────────────────────────────────────────────────────────────────
  //  Structured data (JSON-LD) — one BlogPosting + one BreadcrumbList
  //  + one FAQPage (only when a visible FAQ block is rendered below).
  //  All URLs are absolute HTTPS; all dates are strict ISO 8601. The
  //  entire block is server-rendered — no client-side hydration copy.
  // ─────────────────────────────────────────────────────────────────
  const siteBase = siteUrl()
  const articleUrlAbs = `${siteBase}${detailPath}`
  // Ensure the cover-image URL is absolute HTTPS. Cloudinary and Pexels
  // fallbacks are already absolute; a bare path (e.g. /uploads/foo.jpg)
  // would otherwise get emitted as a relative URL in structured data.
  const toAbs = (u) => {
    if (!u) return undefined
    if (/^https?:\/\//i.test(u)) return u.replace(/^http:/, 'https:')
    return `${siteBase}${u.startsWith('/') ? u : `/${u}`}`
  }
  const imageAbs = toAbs(post.cover_image)
  // ISO 8601 dates — Mongo stores timestamps that can be Date objects or
  // ISO strings depending on how they were serialised across the wire.
  const toIsoDate = (d) => {
    if (!d) return undefined
    try { return new Date(d).toISOString() } catch { return undefined }
  }
  const datePublished = toIsoDate(post.created_at)
  const dateModified  = toIsoDate(post.updated_at || post.created_at)
  const articleSection = (isEn ? (post.category_en || post.category) : post.category) || undefined

  // FAQPage schema must exactly match the visible FAQ text — strip any
  // HTML markup from admin-entered rich text and collapse whitespace.
  const stripHtmlForSchema = (s) => {
    if (!s) return ''
    return String(s)
      .replace(/<[^>]+>/g, '')     // drop tags
      .replace(/&nbsp;/gi, ' ')
      .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"').replace(/&#39;/g, "'")
      .replace(/\s+/g, ' ')
      .trim()
  }

  const jsonLd = [
    // 1) BlogPosting — the article itself. Dynamically populated from the
    //    admin-panel data; nothing hard-coded per article.
    {
      '@context': 'https://schema.org',
      '@type': 'BlogPosting',
      headline: title,
      description: excerpt || undefined,
      image: imageAbs ? [imageAbs] : undefined,
      datePublished,
      dateModified,
      author: {
        '@type': 'Organization',
        name: 'Noir Hamburg',
        url: siteBase,
      },
      publisher: {
        '@type': 'Organization',
        name: 'Noir Hamburg',
        url: siteBase,
      },
      inLanguage: isEn ? 'en' : 'de',
      articleSection,
      mainEntityOfPage: { '@type': 'WebPage', '@id': articleUrlAbs },
    },
    // 2) BreadcrumbList — three items, localised, final item includes both
    //    headline and absolute article URL (per SEO spec).
    breadcrumbSchema([
      { name: t(lang, 'crumb.home'), url: homeHref },
      { name: t(lang, 'crumb.blog'), url: blogHref },
      { name: title, url: detailPath },
    ]),
    // 3) FAQPage — emitted ONLY when a visible FAQ section renders below
    //    (articleFaqs.length > 0). Text values are stripped of HTML so the
    //    schema matches what the user sees, not what's stored in the DB.
    ...(articleFaqs.length
      ? [{
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: articleFaqs.map((f) => ({
            '@type': 'Question',
            name: stripHtmlForSchema(f.q),
            acceptedAnswer: { '@type': 'Answer', text: stripHtmlForSchema(f.a) },
          })),
        }]
      : []),
  ]

  const dateFmt = (d) => {
    if (!d) return ''
    try {
      return new Date(d).toLocaleDateString(isEn ? 'en-US' : 'de', {
        year: 'numeric', month: 'long', day: 'numeric',
      })
    } catch { return '' }
  }

  return (
    <>
      <Header lang={lang} currentPath={detailPath} counterpartOverride={counterpartHref || (isEn ? '/blog' : '/en/blog')} />
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
          {/* MULTILINGUAL: language switcher — appears only when a real
              counterpart exists in the other language. `counterpartHref` is
              resolved server-side by the page component (null when there's
              no EN twin, which is the case for DE-only articles). Uses
              flag emoji (unicode, no image dependency) to keep the switcher
              visually consistent with the header UI. rel="alternate" +
              hreflang give crawlers an extra signal on top of the <link>
              tag in <head>. */}
          {counterpartHref && (
            <div className="mt-4 text-sm" data-testid="blog-lang-switcher">
              {isEn ? (
                <Link href={counterpartHref} hrefLang="de" rel="alternate" className="text-[#6B5F5F] hover:accent-text">
                  🇬🇧 English<span className="mx-2 text-[#B8AFAF]">|</span><span className="accent-text hover:underline">🇩🇪 Deutsch</span>
                </Link>
              ) : (
                <Link href={counterpartHref} hrefLang="en" rel="alternate" className="text-[#6B5F5F] hover:accent-text">
                  <span className="accent-text hover:underline">🇩🇪 Deutsch</span><span className="mx-2 text-[#B8AFAF]">|</span>🇬🇧 English
                </Link>
              )}
            </div>
          )}
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

          {post.cover_image && (() => {
            // PERF (Pass B, CWV 2026-07): Blog LCP cover.
            // The container renders at h-[60vh] within max-w-6xl (1152 px). On
            // mobile the image spans full viewport minus px-6 padding; on md+
            // it grows to px-12 padding; on lg+ it caps at the 6xl max-width.
            // The `sizes` attribute below reflects those breakpoints exactly
            // so the browser picks the smallest srcSet candidate that still
            // satisfies the physical pixel demand (DPR-aware).
            //
            // Widths chosen so a Pixel-class 412 CSS × 3 DPR = 1236 physical
            // picks 1200w (~90 KB) instead of the old fixed 1600w (~200 KB).
            //
            // Intrinsic width/height = 1600×1067 (3:2 crop) reserves the
            // correct aspect ratio in the layout tree before the pixels
            // arrive, eliminating CLS.
            const img = buildResponsiveImage({
              url: post.cover_image,
              ar: '3/2',
              crop: 'fill',
              class: 'cover',
              baseWidth: 900,
              sizes: '(max-width: 767px) calc(100vw - 48px), (max-width: 1023px) calc(100vw - 96px), (max-width: 1279px) calc(100vw - 128px), 1152px',
            })
            return (
              <div className="editorial-image h-[60vh] mb-16 max-w-6xl mx-auto">
                <img
                  src={img.src}
                  srcSet={img.srcSet}
                  sizes={img.sizes}
                  width={img.width}
                  height={img.height}
                  alt={title}
                  loading="eager"
                  fetchPriority="high"
                  className="w-full h-full object-cover"
                />
              </div>
            )
          })()}

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
                      <span aria-hidden="true" className="accent-text text-2xl group-open:rotate-45 transition-transform">+</span>
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
                        {/* Below-fold model tile: lazy + async decode. Cloudinary
                            transform crops to 3:4 with c_fill+g_auto so the
                            intrinsic w/h reserves the exact aspect box (no CLS). */}
                        <img
                          src={optimizeImageUrl(m.cover_image, { w: 600, ar: '3/4', crop: 'fill' })}
                          srcSet={`${optimizeImageUrl(m.cover_image, { w: 300, ar: '3/4', crop: 'fill' })} 300w, ${optimizeImageUrl(m.cover_image, { w: 450, ar: '3/4', crop: 'fill' })} 450w, ${optimizeImageUrl(m.cover_image, { w: 600, ar: '3/4', crop: 'fill' })} 600w, ${optimizeImageUrl(m.cover_image, { w: 900, ar: '3/4', crop: 'fill' })} 900w`}
                          sizes="(max-width: 767px) calc(100vw - 48px), (max-width: 1023px) 45vw, 288px"
                          width={600}
                          height={800}
                          alt={m.name}
                          loading="lazy"
                          decoding="async"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
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
                {relatedPosts.map((p) => {
                  // MULTILINGUAL: EN articles link to /en/blog/{slug_en},
                  // DE articles link to /blog/{slug}. Never crosses languages.
                  // Titles + alt text also read the language-appropriate field.
                  const relSlug = isEn ? p.slug_en : p.slug
                  const relTitle = isEn ? p.title_en : p.title
                  const relHref = isEn ? `/en/blog/${relSlug}` : `/blog/${relSlug}`
                  return (
                    <Link
                      key={p.slug}
                      href={relHref}
                      className="group block"
                      data-testid={`blog-related-post-${p.slug}`}
                    >
                      {p.cover_image && (
                        <div className="editorial-image aspect-[4/3] overflow-hidden mb-4">
                          {/* Below-fold related-article thumb: lazy + async decode.
                              Container is aspect-[4/3]; intrinsic 800×600 reserves
                              the box before pixels arrive. */}
                          <img
                            src={optimizeImageUrl(p.cover_image, { w: 600, ar: '4/3', crop: 'fill' })}
                            srcSet={`${optimizeImageUrl(p.cover_image, { w: 300, ar: '4/3', crop: 'fill' })} 300w, ${optimizeImageUrl(p.cover_image, { w: 450, ar: '4/3', crop: 'fill' })} 450w, ${optimizeImageUrl(p.cover_image, { w: 600, ar: '4/3', crop: 'fill' })} 600w, ${optimizeImageUrl(p.cover_image, { w: 800, ar: '4/3', crop: 'fill' })} 800w`}
                            sizes="(max-width: 767px) calc(100vw - 48px), (max-width: 1023px) 45vw, 288px"
                            width={800}
                            height={600}
                            alt={relTitle}
                            loading="lazy"
                            decoding="async"
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        </div>
                      )}
                      <span className="overline text-[10px] accent-text">{p.category}</span>
                      <h3 className="font-heading text-xl mt-2 group-hover:accent-text">{relTitle}</h3>
                    </Link>
                  )
                })}
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
