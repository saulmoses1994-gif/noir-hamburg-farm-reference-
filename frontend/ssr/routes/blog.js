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
${posts.map((p) => `<article><h2><a href="${navTo(`/blog/${p.slug}`, lang)}">${esc(p.title)}</a></h2><p><strong>${esc(p.category)}</strong></p><p>${esc(p.excerpt)}</p></article>`).join("")}
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
  const body = `
<main id="main" style="padding:2rem;">
${renderBreadcrumbs([{ label: t("crumb.blog", lang), to: "/blog" }, { label: p.title }], lang)}
${englishComingSoonBanner(lang)}
<article>
<p style="text-transform:uppercase;color:#8B1538;">${esc(p.category)}</p>
<h1>${esc(p.title)}</h1>
${p.cover_image ? `<img src="${escAttr(p.cover_image)}" alt="${escAttr(p.title)}" width="800" loading="eager"/>` : ""}
${p.content}
</article>
</main>`;
  return renderShell({
    ...buildAssets,
    lang,
    title: p.meta_title || `${p.title} | Noir Hamburg`,
    description: p.meta_description || p.excerpt,
    canonicalPath: `/blog/${p.slug}`,
    ogImage: p.cover_image,
    jsonLd: [
      {
        "@context": "https://schema.org",
        "@type": "Article",
        headline: p.title,
        image: p.cover_image,
        datePublished: p.created_at,
        dateModified: p.updated_at || p.created_at,
        author: { "@type": "Organization", name: "Noir Hamburg" },
        publisher: { "@type": "Organization", name: "Noir Hamburg" },
        inLanguage: "de-DE",
        articleSection: p.category,
      },
      breadcrumbSchema([{ label: t("crumb.blog", lang), to: "/blog" }, { label: p.title }], lang),
    ],
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
