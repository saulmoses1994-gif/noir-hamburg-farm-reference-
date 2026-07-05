/**
 * Blog list (/blog), blog post (/blog/:slug), CMS page (/p/:slug) SSR.
 */
const {
  esc,
  escAttr,
  stripHtml,
  navTo,
  renderShell,
  renderBreadcrumbs,
  breadcrumbSchema,
  englishComingSoonBanner,
  t,
} = require("../shell");
const { backendJSON } = require("../backend");

async function renderBlogList(buildAssets, lang = "de") {
  let posts = [];
  try { posts = await backendJSON("/api/blog"); } catch (e) { /* empty */ }

  const titleByLang = {
    de: "Magazin — Noir Hamburg | Lifestyle, Hamburg Guide & Reiseempfehlungen",
    en: "Magazine — Noir Hamburg | Lifestyle, Hamburg Guide & Travel Recommendations",
  };
  const descByLang = {
    de: "Das Noir Hamburg Magazin: Restaurants, Hotels, Reisen, Lifestyle und Hamburg-Insider-Wissen für anspruchsvolle Genießer.",
    en: "The Noir Hamburg Magazine: restaurants, hotels, travel, lifestyle and Hamburg insider knowledge for discerning connoisseurs.",
  };
  const h1ByLang = { de: "Noir Magazin", en: "Noir Magazine" };
  const leadByLang = {
    de: "Geschichten, Empfehlungen und Insider-Wissen aus dem Hamburger Premium-Lifestyle.",
    en: "Stories, recommendations and insider knowledge from Hamburg's premium lifestyle.",
  };

  const body = `
<main id="main" style="padding:2rem;">
${renderBreadcrumbs([{ label: t("crumb.blog", lang) }], lang)}
<h1>${esc(h1ByLang[lang])}</h1>
<p>${esc(leadByLang[lang])}</p>
${posts.map((p) => {
  const title = lang === "en" && p.title_en ? p.title_en : p.title;
  const exc = lang === "en" && p.excerpt_en ? p.excerpt_en : p.excerpt;
  return `<article><h2><a href="${navTo(`/blog/${p.slug}`, lang)}">${esc(title)}</a></h2><p><strong>${esc(p.category)}</strong></p><p>${esc(exc)}</p></article>`;
}).join("")}
</main>`;
  return renderShell({
    ...buildAssets,
    lang,
    title: titleByLang[lang] || titleByLang.de,
    description: descByLang[lang] || descByLang.de,
    canonicalPath: "/blog",
    jsonLd: [breadcrumbSchema([{ label: t("crumb.blog", lang) }], lang)],
    bodyContent: body,
  });
}

async function renderBlogDetail(slug, buildAssets, lang = "de") {
  let p;
  try { p = await backendJSON(`/api/blog/${slug}`); } catch (e) { return null; }

  // EN fields fall back to German originals when missing.
  const isEn = lang === "en";
  const title = isEn && p.title_en ? p.title_en : p.title;
  const content = isEn && p.content_en ? p.content_en : p.content;
  const excerpt = isEn && p.excerpt_en ? p.excerpt_en : p.excerpt;
  const metaTitle = isEn && p.meta_title_en ? p.meta_title_en : p.meta_title;
  const metaDesc = isEn && p.meta_description_en ? p.meta_description_en : p.meta_description;
  const enFallback = isEn && !p.content_en;

  // Fetch related content in parallel so the article ends with a strong
  // internal-linking block (services, areas, other articles, models).
  const { SERVICES, LOCATIONS } = require("../../src/data/site");
  const relatedServices = SERVICES.filter((s) => (p.related_services || []).includes(s.slug));
  const relatedLocations = LOCATIONS.filter((l) => (p.related_locations || []).includes(l.slug));
  const [relatedPosts, featuredModels] = await Promise.all([
    backendJSON(`/api/blog?category=${encodeURIComponent(p.category || "")}`).catch(() => []),
    backendJSON("/api/models?featured=true").catch(() => []),
  ]);
  const otherPosts = relatedPosts.filter((r) => r.slug !== p.slug).slice(0, 3);
  const relModels = (featuredModels || []).slice(0, 3);

  // Build a Table of Contents by injecting `id` attributes into <h2> tags and
  // collecting anchor entries.
  const slugifyToc = (s) =>
    String(s).toLowerCase().replace(/[^\w\s-]/g, "").trim().replace(/\s+/g, "-").slice(0, 60);
  const toc = [];
  const contentWithAnchors = String(content || "").replace(
    /<h2([^>]*)>([\s\S]*?)<\/h2>/gi,
    (m, attrs, inner) => {
      const text = inner.replace(/<[^>]+>/g, "").trim();
      if (!text) return m;
      const id = slugifyToc(text);
      toc.push({ id, text });
      return /\bid=/.test(attrs) ? m : `<h2${attrs} id="${id}">${inner}</h2>`;
    },
  );
  const tocHtml = toc.length >= 3
    ? `<aside><h2>${esc(isEn ? "Table of Contents" : "Inhaltsverzeichnis")}</h2><ol>${toc.map((it) => `<li><a href="#${escAttr(it.id)}">${esc(it.text)}</a></li>`).join("")}</ol></aside>`
    : "";

  const linkList = (label, items, hrefFn, labelFn) =>
    items.length > 0
      ? `<aside><h2>${esc(label)}</h2><ul>${items.map((it) => `<li><a href="${navTo(hrefFn(it), lang)}">${esc(labelFn(it))}</a></li>`).join("")}</ul></aside>`
      : "";

  // Per-article FAQ block (rendered + emitted as FAQPage JSON-LD).
  const articleFaqs = (p.faqs || [])
    .map((f) => ({
      q: (isEn && f.q_en ? f.q_en : f.q) || "",
      a: (isEn && f.a_en ? f.a_en : f.a) || "",
    }))
    .filter((f) => f.q && f.a);
  const faqHtml = articleFaqs.length
    ? `<section><h2>${esc(isEn ? "Frequently asked questions" : "Häufige Fragen")}</h2>${articleFaqs.map((f) => `<details><summary><strong>${esc(f.q)}</strong></summary><p>${esc(f.a)}</p></details>`).join("")}</section>`
    : "";

  // Top CTA (above the article) — send readers to booking/contact early.
  const topCtaHtml = `<p style="margin:1rem 0;"><a href="${navTo("/kontakt", lang)}"><strong>${esc(isEn ? "Contact / Booking →" : "Kontakt / Buchung →")}</strong></a> · <a href="${navTo("/models", lang)}">${esc(isEn ? "Escort Hamburg — All Models" : "Escort Hamburg — Alle Models")}</a></p>`;

  // Bottom CTA (below related blocks) — the final "no dead end" nudge.
  const bottomCtaHtml = `<section style="margin-top:2rem;padding:1.5rem;background:#FBF7F4;border-left:4px solid #8B1538;"><h2>${esc(isEn ? "Contact Noir Hamburg" : "Kontakt Noir Hamburg")}</h2><p>${esc(isEn ? "Discreet, personal, seven days a week. Reach out via WhatsApp, e-mail or our contact form." : "Diskret, persönlich, sieben Tage die Woche. Kontaktieren Sie uns per WhatsApp, E-Mail oder Kontaktformular.")}</p><p><a href="${navTo("/kontakt", lang)}"><strong>${esc(isEn ? "Book your evening →" : "Ihren Abend buchen →")}</strong></a></p></section>`;

  const body = `
<main id="main" style="padding:2rem;">
${renderBreadcrumbs([{ label: t("crumb.blog", lang), to: "/blog" }, { label: title }], lang)}
${enFallback ? englishComingSoonBanner(lang) : ""}
${topCtaHtml}
${tocHtml}
<article>
<p style="text-transform:uppercase;color:#8B1538;">${esc(p.category)}</p>
<h1>${esc(title)}</h1>
${p.cover_image ? `<img src="${escAttr(p.cover_image)}" alt="${escAttr(title)}" width="800" loading="eager"/>` : ""}
${contentWithAnchors}
</article>

${faqHtml}

${linkList(isEn ? "Related Escort Services" : "Verwandte Escort Services", relatedServices,
    (s) => `/services/${s.slug}`, (s) => s.title)}
${linkList(isEn ? "Escort Hamburg by Area" : "Escort Hamburg nach Stadtteil", relatedLocations,
    (l) => `/escort/${l.slug}`, (l) => `Escort ${l.name} — ${isEn ? "premium companionship" : "Premium Begleitung"}`)}
${linkList(isEn ? "Suggested Escort Hamburg Models" : "Passende Hamburger Escort Models", relModels,
    (m) => `/models/${m.slug}`, (m) => `${m.name} — Escort ${m.cities?.[0] || "Hamburg"}`)}
${linkList(isEn ? "Related articles" : "Verwandte Artikel", otherPosts,
    (a) => `/blog/${a.slug}`, (a) => (isEn && a.title_en ? a.title_en : a.title))}

${bottomCtaHtml}
<p><a href="${navTo("/blog", lang)}">← ${esc(isEn ? "Back to the Magazine" : "Zurück zum Magazin")}</a></p>
</main>`;
  const jsonLdBlocks = [
      {
        "@context": "https://schema.org",
        "@type": "Article",
        headline: title,
        image: p.cover_image,
        datePublished: p.created_at,
        dateModified: p.updated_at || p.created_at,
        author: { "@type": "Organization", name: "Noir Hamburg" },
        publisher: { "@type": "Organization", name: "Noir Hamburg" },
        inLanguage: isEn && p.content_en ? "en" : "de-DE",
        articleSection: p.category,
      },
      breadcrumbSchema([{ label: t("crumb.blog", lang), to: "/blog" }, { label: title }], lang),
  ];
  if (articleFaqs.length) {
    jsonLdBlocks.push({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: articleFaqs.map((f) => ({
        "@type": "Question",
        name: f.q,
        acceptedAnswer: { "@type": "Answer", text: f.a },
      })),
    });
  }
  return renderShell({
    ...buildAssets,
    lang,
    title: metaTitle || `${title} | Noir Hamburg`,
    description: metaDesc || excerpt,
    canonicalPath: `/blog/${p.slug}`,
    ogImage: p.cover_image,
    jsonLd: jsonLdBlocks,
    bodyContent: body,
  });
}

async function renderPageDetail(slug, buildAssets, lang = "de") {
  let p;
  try { p = await backendJSON(`/api/pages/${slug}`); } catch (e) { return null; }
  const body = `
<main id="main" style="padding:2rem;">
${renderBreadcrumbs([{ label: p.title }], lang)}
${englishComingSoonBanner(lang)}
<article>
<h1>${esc(p.h1 || p.title)}</h1>
${p.intro ? `<p><em>${esc(p.intro)}</em></p>` : ""}
${p.hero_image ? `<img src="${escAttr(p.hero_image)}" alt="${escAttr(p.title)}" width="800"/>` : ""}
${p.content}
</article>
</main>`;
  return renderShell({
    ...buildAssets,
    lang,
    title: p.meta_title || `${p.title} | Noir Hamburg`,
    description: p.meta_description || p.intro || stripHtml(p.content).slice(0, 160),
    canonicalPath: `/p/${p.slug}`,
    ogImage: p.hero_image,
    jsonLd: [breadcrumbSchema([{ label: p.title }], lang)],
    bodyContent: body,
  });
}

module.exports = { renderBlogList, renderBlogDetail, renderPageDetail };
