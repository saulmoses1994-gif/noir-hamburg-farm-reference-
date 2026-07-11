import Link from 'next/link'
import Header from '@/components/site/Header'
import Footer from '@/components/site/Footer'
import Breadcrumbs from '@/components/site/Breadcrumbs'
import JsonLd from '@/components/site/JsonLd'
import { pick, t, localePath } from '@/lib/i18n'
import { siteUrl, breadcrumbSchema } from '@/lib/seo'

// Server component. Renders the /blog list (or filtered by ?category=...).
// Pagination is intentionally omitted: with <=13 posts we always render all.
// Filter chips are <Link>s so the URL stays shareable and SEO-crawlable.
export default function BlogListBody({ lang, posts, categories, activeCategory }) {
  const isEn = lang === 'en'
  const blogHref = localePath(lang, '/blog')
  const homeHref = lang === 'en' ? '/en' : '/'

  const jsonLd = [
    breadcrumbSchema([
      { name: t(lang, 'crumb.home'), url: homeHref },
      { name: t(lang, 'crumb.blog'), url: blogHref },
    ]),
    {
      '@context': 'https://schema.org',
      '@type': 'Blog',
      name: t(lang, 'blog.list.metaTitle'),
      url: `${siteUrl()}${blogHref}`,
      inLanguage: isEn ? 'en' : 'de-DE',
      blogPost: posts.slice(0, 20).map((p) => ({
        '@type': 'BlogPosting',
        headline: pick(p, 'title', lang),
        url: `${siteUrl()}${localePath(lang, `/blog/${p.slug}`)}`,
        datePublished: p.created_at,
        image: p.cover_image || undefined,
        articleSection: p.category || undefined,
      })),
    },
  ]

  const dateFmt = (d) => {
    if (!d) return ''
    try {
      return new Date(d).toLocaleDateString(isEn ? 'en-US' : 'de-DE', {
        year: 'numeric', month: 'long', day: 'numeric',
      })
    } catch { return '' }
  }

  const chipHref = (cat) => (cat ? `${blogHref}?category=${encodeURIComponent(cat)}` : blogHref)

  return (
    <>
      <Header lang={lang} currentPath={blogHref} />
      <main id="main">
        <JsonLd data={jsonLd} />

        <section className="px-6 md:px-12 lg:px-16 pt-12 pb-8" data-testid="blog-list">
          <Breadcrumbs items={[{ label: t(lang, 'crumb.home'), href: homeHref }, { label: t(lang, 'crumb.blog') }]} />
          <div className="mt-8 max-w-3xl">
            <span className="overline">{t(lang, 'blog.list.overline')}</span>
            <h1 className="font-heading text-5xl lg:text-7xl font-light tracking-tighter leading-none mt-4">
              {t(lang, 'blog.list.title1')} <em className="italic accent-text">{t(lang, 'blog.list.title2')}</em>
            </h1>
            <p className="mt-6 text-lg font-light text-[#6B5F5F] leading-relaxed">
              {t(lang, 'blog.list.intro')}
            </p>
          </div>
        </section>

        <section className="px-6 md:px-12 lg:px-16 py-6 border-y border-[#1A1414]/8 sticky top-[68px] z-30 backdrop-blur-xl bg-white/85">
          <div className="flex flex-wrap items-center gap-3">
            <span className="overline mr-2">{t(lang, 'blog.categories.label')}</span>
            <Link
              href={blogHref}
              scroll={false}
              className={`text-xs uppercase tracking-[0.15em] py-1 px-3 border ${!activeCategory ? 'border-[#8B1538] text-[#8B1538]' : 'border-[#1A1414]/15 text-[#6B5F5F] hover:text-[#1A1414]'}`}
            >
              {t(lang, 'blog.categories.all')}
            </Link>
            {categories.map((c) => (
              <Link
                key={c}
                href={chipHref(c)}
                scroll={false}
                data-testid={`blog-cat-${c}`}
                className={`text-xs uppercase tracking-[0.15em] py-1 px-3 border ${activeCategory === c ? 'border-[#8B1538] text-[#8B1538]' : 'border-[#1A1414]/15 text-[#6B5F5F] hover:text-[#1A1414]'}`}
              >
                {c}
              </Link>
            ))}
          </div>
        </section>

        <section className="px-6 md:px-12 lg:px-16 py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 lg:gap-16">
            {posts.map((p) => {
              const ttl = pick(p, 'title', lang)
              const exc = pick(p, 'excerpt', lang)
              return (
                <Link
                  key={p.id || p.slug}
                  href={localePath(lang, `/blog/${p.slug}`)}
                  className="group block"
                  data-testid={`blog-card-${p.slug}`}
                >
                  <div className="editorial-image h-[420px] bg-[#F2EAE4]">
                    {p.cover_image && (
                      <img src={p.cover_image} alt={ttl} loading="lazy" className="w-full h-full object-cover" />
                    )}
                  </div>
                  <span className="overline mt-5 block accent-text">{p.category}</span>
                  <h2 className="font-heading text-2xl lg:text-3xl mt-3 group-hover:accent-text transition-colors leading-tight">{ttl}</h2>
                  {exc && (
                    <p className="mt-3 text-sm font-light text-[#6B5F5F] leading-relaxed line-clamp-3">{exc}</p>
                  )}
                  {p.created_at && (
                    <div className="mt-3 text-[11px] font-mono uppercase tracking-[0.18em] text-[#6B5F5F]/80">{dateFmt(p.created_at)}</div>
                  )}
                </Link>
              )
            })}
            {posts.length === 0 && (
              <div className="md:col-span-3 text-center py-20 text-[#6B5F5F]">
                <p className="font-heading text-2xl">{t(lang, 'blog.empty')}</p>
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer lang={lang} />
    </>
  )
}
