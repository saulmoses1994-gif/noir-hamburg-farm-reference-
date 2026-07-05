import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import PublicLayout from "@/components/layout/PublicLayout";
import Breadcrumbs from "@/components/Breadcrumbs";
import { useSEO, breadcrumbSchema } from "@/lib/seo";
import { api } from "@/lib/api";
import { BLOG_CATEGORIES, SERVICES, LOCATIONS } from "@/data/site";
import { useI18n } from "@/lib/i18n";

export function BlogList() {
  const [posts, setPosts] = useState([]);
  const [cat, setCat] = useState("");
  const { lang, t, to } = useI18n();
  const isEn = lang === "en";

  useEffect(() => {
    const url = cat ? `/blog?category=${encodeURIComponent(cat)}` : "/blog";
    api.get(url).then((r) => setPosts(r.data)).catch(() => {});
  }, [cat]);

  useSEO({
    title: isEn
      ? "Magazine — Noir Hamburg | Lifestyle, Hamburg Guide & Travel Recommendations"
      : "Magazin — Noir Hamburg | Lifestyle, Hamburg Guide & Reiseempfehlungen",
    description: isEn
      ? "The Noir Hamburg Magazine: restaurants, hotels, travel, lifestyle and Hamburg insider knowledge for discerning connoisseurs."
      : "Das Noir Hamburg Magazin: Restaurants, Hotels, Reisen, Lifestyle und Hamburg-Insider-Wissen für anspruchsvolle Genießer.",
  });

  return (
    <PublicLayout>
      <section className="px-6 md:px-12 lg:px-16 pt-12 pb-8" data-testid="blog-list">
        <Breadcrumbs items={[{ label: t("crumb.blog") }]} />
        <div className="mt-8 max-w-3xl">
          <span className="overline">{isEn ? "Journal" : "Journal"}</span>
          <h1 className="font-heading text-5xl lg:text-7xl font-light tracking-tighter leading-none mt-4">
            Noir <em className="italic accent-text">{isEn ? "Magazine" : "Magazin"}</em>
          </h1>
          <p className="mt-6 text-lg font-light text-[#6B5F5F] leading-relaxed">
            {isEn
              ? "Stories, recommendations and insider knowledge from Hamburg's premium lifestyle."
              : "Geschichten, Empfehlungen und Insider-Wissen aus dem Hamburger Premium-Lifestyle."}
          </p>
        </div>
      </section>

      <section className="px-6 md:px-12 lg:px-16 py-6 border-y border-[#1A1414]/8 sticky top-[68px] z-30 backdrop-blur-xl bg-[#FFFFFF]/85">
        <div className="flex flex-wrap items-center gap-3">
          <span className="overline mr-2">{isEn ? "Categories" : "Kategorien"}</span>
          <button onClick={() => setCat("")} className={`text-xs uppercase tracking-[0.15em] py-1 px-3 border ${!cat ? "border-[#8B1538] text-[#8B1538]" : "border-[#1A1414]/15 text-[#6B5F5F] hover:text-[#1A1414]"}`}>{isEn ? "All" : "Alle"}</button>
          {BLOG_CATEGORIES.map((c) => (
            <button
              key={c}
              onClick={() => setCat(c)}
              className={`text-xs uppercase tracking-[0.15em] py-1 px-3 border ${cat === c ? "border-[#8B1538] text-[#8B1538]" : "border-[#1A1414]/15 text-[#6B5F5F] hover:text-[#1A1414]"}`}
              data-testid={`blog-cat-${c}`}
            >
              {c}
            </button>
          ))}
        </div>
      </section>

      <section className="px-6 md:px-12 lg:px-16 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 lg:gap-16">
          {posts.map((p) => {
            const ttl = isEn && p.title_en ? p.title_en : p.title;
            const exc = isEn && p.excerpt_en ? p.excerpt_en : p.excerpt;
            return (
              <Link key={p.id} to={to(`/blog/${p.slug}`)} className="group block" data-testid={`blog-card-${p.slug}`}>
                <div className="editorial-image h-[420px]">
                  <img src={p.cover_image} alt={ttl} loading="lazy" />
                </div>
                <span className="overline mt-5 block accent-text">{p.category}</span>
                <h2 className="font-heading text-2xl lg:text-3xl mt-3 group-hover:accent-text transition-colors leading-tight">{ttl}</h2>
                <p className="mt-3 text-sm font-light text-[#6B5F5F] leading-relaxed line-clamp-3">{exc}</p>
              </Link>
            );
          })}
          {posts.length === 0 && (
            <div className="md:col-span-3 text-center py-20 text-[#6B5F5F]">
              <p className="font-heading text-2xl">{isEn ? "No articles in this category." : "Keine Beiträge in dieser Kategorie."}</p>
            </div>
          )}
        </div>
      </section>
    </PublicLayout>
  );
}

export function BlogDetail() {
  const { slug } = useParams();
  const [post, setPost] = useState(null);
  const [relatedPosts, setRelatedPosts] = useState([]);
  const [relatedModels, setRelatedModels] = useState([]);
  const { lang, t, to } = useI18n();
  const isEn = lang === "en";

  useEffect(() => {
    api.get(`/blog/${slug}`).then((r) => setPost(r.data)).catch(() => setPost(false));
  }, [slug]);

  // Once the post is loaded, fetch other articles in the same category and a
  // handful of featured models — cheap parallel calls that power the internal
  // linking block at the bottom of every article.
  useEffect(() => {
    if (!post || !post.slug) return;
    const p1 = api.get(`/blog?category=${encodeURIComponent(post.category || "")}`)
      .then((r) => setRelatedPosts((r.data || []).filter((p) => p.slug !== post.slug).slice(0, 3)))
      .catch(() => setRelatedPosts([]));
    const p2 = api.get("/models?featured=true")
      .then((r) => setRelatedModels((r.data || []).slice(0, 3)))
      .catch(() => setRelatedModels([]));
    return () => { p1?.catch?.(() => {}); p2?.catch?.(() => {}); };
  }, [post]);

  const title = post ? (isEn && post.title_en ? post.title_en : post.title) : "";
  const excerpt = post ? (isEn && post.excerpt_en ? post.excerpt_en : post.excerpt) : "";
  const rawContent = post ? (isEn && post.content_en ? post.content_en : post.content) : "";
  const metaTitle = post ? (isEn && post.meta_title_en ? post.meta_title_en : post.meta_title) : "";
  const metaDesc = post ? (isEn && post.meta_description_en ? post.meta_description_en : post.meta_description) : "";
  const enFallback = post && isEn && !post.content_en;

  // Normalise per-article FAQs (each entry: {q, a, q_en?, a_en?}).
  const articleFaqs = (post?.faqs || [])
    .map((f) => ({
      q: (isEn && f.q_en ? f.q_en : f.q) || "",
      a: (isEn && f.a_en ? f.a_en : f.a) || "",
    }))
    .filter((f) => f.q && f.a);

  // Build a Table of Contents by adding `id` attributes to every <h2> in the
  // article HTML and collecting anchor text + slug for the sidebar TOC.
  const slugifyToc = (s) =>
    String(s).toLowerCase().replace(/[^\w\s-]/g, "").trim().replace(/\s+/g, "-").slice(0, 60);
  const toc = [];
  const content = rawContent.replace(
    /<h2([^>]*)>([\s\S]*?)<\/h2>/gi,
    (m, attrs, inner) => {
      const text = inner.replace(/<[^>]+>/g, "").trim();
      if (!text) return m;
      const id = slugifyToc(text);
      toc.push({ id, text });
      // Preserve existing attrs unless an id already exists.
      const hasId = /\bid=/.test(attrs);
      return hasId ? m : `<h2${attrs} id="${id}">${inner}</h2>`;
    },
  );

  useSEO({
    title: metaTitle || (post ? `${title} | Noir Hamburg` : ""),
    description: metaDesc || excerpt,
    image: post?.cover_image,
    jsonLd: post ? [
      {
        "@context": "https://schema.org",
        "@type": "Article",
        "headline": title,
        "image": post.cover_image,
        "datePublished": post.created_at,
        "dateModified": post.updated_at || post.created_at,
        "author": { "@type": "Organization", "name": "Noir Hamburg" },
        "publisher": { "@type": "Organization", "name": "Noir Hamburg" },
        "inLanguage": isEn && post.content_en ? "en" : "de-DE",
        "articleSection": post.category,
      },
      breadcrumbSchema([
        { label: t("crumb.blog"), to: "/blog" },
        { label: title },
      ]),
      ...(articleFaqs.length ? [{
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": articleFaqs.map((f) => ({
          "@type": "Question",
          "name": f.q,
          "acceptedAnswer": { "@type": "Answer", "text": f.a },
        })),
      }] : []),
    ] : null,
  });

  if (post === false) return <PublicLayout><div className="px-6 py-32 text-center text-[#6B5F5F]">{isEn ? "Article not found." : "Artikel nicht gefunden."}</div></PublicLayout>;
  if (!post) return <PublicLayout><div className="px-6 py-32 text-center text-[#6B5F5F]">{t("misc.loading")}</div></PublicLayout>;

  const relatedServices = SERVICES.filter((s) => post.related_services?.includes(s.slug));
  const relatedLocations = LOCATIONS.filter((l) => post.related_locations?.includes(l.slug));

  return (
    <PublicLayout>
      <section className="px-6 md:px-12 lg:px-16 pt-8 pb-4">
        <Breadcrumbs items={[{ label: t("crumb.blog"), to: "/blog" }, { label: title }]} />
        {/* Top CTA — never leave the reader without a next step */}
        <div className="mt-4 flex flex-wrap gap-3 text-sm" data-testid="blog-cta-top">
          <Link to={to("/kontakt")} className="text-[#8B1538] hover:underline font-semibold" data-testid="blog-cta-contact-top">
            {isEn ? "Contact / Booking →" : "Kontakt / Buchung →"}
          </Link>
          <span className="text-[#6B5F5F]">·</span>
          <Link to={to("/models")} className="text-[#3F3838] hover:accent-text" data-testid="blog-cta-models-top">
            {isEn ? "Escort Hamburg — All Models" : "Escort Hamburg — Alle Models"}
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
            <div className="overline mt-8">{new Date(post.created_at).toLocaleDateString(isEn ? "en-GB" : "de-DE", { year: "numeric", month: "long", day: "numeric" })}</div>
          )}
        </header>

        {post.cover_image && (
          <div className="editorial-image h-[60vh] mb-16 max-w-6xl mx-auto">
            <img src={post.cover_image} alt={title} loading="eager" fetchpriority="high" />
          </div>
        )}

        {enFallback && (
          <div className="max-w-3xl mx-auto mb-8 p-4 border-l-4 border-[#8B1538] bg-[#FAF5F2] text-sm text-[#4A3F3F]" data-testid="en-fallback-note">
            <strong className="text-[#8B1538]">EN preview.</strong> {t("misc.englishComingSoon")}
          </div>
        )}

        {toc.length >= 3 && (
          <aside className="max-w-3xl mx-auto mb-12 p-6 bg-[#FBF7F4] border-l-4 border-[#8B1538] rounded-r-lg" data-testid="blog-toc">
            <div className="overline text-[10px] mb-3">{isEn ? "Table of Contents" : "Inhaltsverzeichnis"}</div>
            <ol className="space-y-2 list-decimal list-inside marker:accent-text marker:font-mono marker:text-xs">
              {toc.map((item) => (
                <li key={item.id} className="text-sm text-[#3F3838]">
                  <a href={`#${item.id}`} className="hover:accent-text underline decoration-transparent hover:decoration-[#8B1538] transition-colors" data-testid={`toc-${item.id}`}>{item.text}</a>
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

        {/* Middle CTA — View Models */}
        <div className="max-w-3xl mx-auto mt-16 flex flex-wrap gap-4 justify-center" data-testid="blog-cta-middle">
          <Link to={to("/models")} className="btn-primary" data-testid="blog-cta-view-models">
            {isEn ? "View our Escort Hamburg Models" : "Unsere Escort Hamburg Models ansehen"} <ArrowRight size={14} />
          </Link>
        </div>

        {/* Per-article FAQ */}
        {articleFaqs.length > 0 && (
          <div className="max-w-3xl mx-auto mt-16" data-testid="blog-faq">
            <span className="overline">{isEn ? "Questions" : "Fragen"}</span>
            <h2 className="font-heading text-2xl lg:text-3xl text-[#1A1414] mt-3 mb-6">
              {isEn ? "Frequently asked questions" : "Häufige Fragen"}
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
                <span className="overline mb-4 block">{isEn ? "Related Services" : "Verwandte Services"}</span>
                <ul className="space-y-3">
                  {relatedServices.map((s) => (
                    <li key={s.slug}>
                      <Link to={to(`/services/${s.slug}`)} className="font-heading text-xl link-underline hover:accent-text">{s.title}</Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {relatedLocations.length > 0 && (
              <div>
                <span className="overline mb-4 block">{isEn ? "Related Areas" : "Verwandte Orte"}</span>
                <ul className="space-y-3">
                  {relatedLocations.map((l) => (
                    <li key={l.slug}>
                      <Link to={to(`/escort/${l.slug}`)} className="font-heading text-xl link-underline hover:accent-text">{l.name}</Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Related models — 3 featured profiles that give the reader a natural
            next click, without breaking the editorial rhythm. */}
        {relatedModels.length > 0 && (
          <div className="max-w-5xl mx-auto mt-16" data-testid="blog-related-models">
            <span className="overline mb-6 block">{isEn ? "Meet Our Models" : "Unsere Models"}</span>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {relatedModels.map((m) => (
                <Link key={m.slug} to={to(`/models/${m.slug}`)} className="group block" data-testid={`blog-related-model-${m.slug}`}>
                  {m.cover_image && (
                    <div className="editorial-image aspect-[3/4] overflow-hidden mb-4">
                      <img src={m.cover_image} alt={m.name} loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    </div>
                  )}
                  <h3 className="font-heading text-xl group-hover:accent-text">{m.name}</h3>
                  <p className="text-xs font-light text-[#6B5F5F] mt-1">{isEn && m.short_tagline_en ? m.short_tagline_en : m.short_tagline}</p>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Related articles — same category, drives session depth and reduces
            bounce. Powered by /api/blog?category=…. */}
        {relatedPosts.length > 0 && (
          <div className="max-w-5xl mx-auto mt-16" data-testid="blog-related-articles">
            <span className="overline mb-6 block">{isEn ? "More from the Magazine" : "Weitere Artikel"}</span>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {relatedPosts.map((p) => (
                <Link key={p.slug} to={to(`/blog/${p.slug}`)} className="group block" data-testid={`blog-related-post-${p.slug}`}>
                  {p.cover_image && (
                    <div className="editorial-image aspect-[4/3] overflow-hidden mb-4">
                      <img src={p.cover_image} alt={p.title} loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    </div>
                  )}
                  <span className="overline text-[10px] accent-text">{p.category}</span>
                  <h3 className="font-heading text-xl mt-2 group-hover:accent-text">{isEn && p.title_en ? p.title_en : p.title}</h3>
                </Link>
              ))}
            </div>
          </div>
        )}

        <div className="max-w-3xl mx-auto mt-16 text-center space-y-6" data-testid="blog-cta-bottom">
          <div className="p-8 bg-[#FBF7F4] border-l-4 border-[#8B1538] text-left">
            <h2 className="font-heading text-2xl md:text-3xl text-[#1A1414] mb-3">{isEn ? "Contact Noir Hamburg" : "Kontakt Noir Hamburg"}</h2>
            <p className="text-[#3F3838] leading-relaxed mb-5">
              {isEn ? "Discreet, personal, seven days a week. Reach out via WhatsApp, e-mail or our contact form." : "Diskret, persönlich, sieben Tage die Woche. Kontaktieren Sie uns per WhatsApp, E-Mail oder Kontaktformular."}
            </p>
            <div className="flex flex-wrap gap-3">
              <Link to={to("/kontakt")} className="btn-primary" data-testid="blog-cta-contact">
                {isEn ? "Contact / Booking" : "Kontakt / Buchung"} <ArrowRight size={14} />
              </Link>
              <Link to={to("/models")} className="btn-ghost" data-testid="blog-cta-models-bottom">
                {isEn ? "View Models" : "Models ansehen"}
              </Link>
            </div>
          </div>
          <Link to={to("/blog")} className="btn-ghost inline-block">← {isEn ? "Back to the Magazine" : "Zurück zum Magazin"}</Link>
        </div>
      </article>
    </PublicLayout>
  );
}
