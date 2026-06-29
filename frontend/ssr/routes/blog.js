/**
 * Blog list (/blog), blog post (/blog/:slug), CMS page (/p/:slug) SSR.
 */
const {
  SITE_ORIGIN,
  esc,
  escAttr,
  stripHtml,
  renderShell,
  renderBreadcrumbs,
  breadcrumbSchema,
} = require("../shell");
const { backendJSON } = require("../backend");

async function renderBlogList(buildAssets) {
  let posts = [];
  try { posts = await backendJSON("/api/blog"); } catch (e) { /* empty list */ }
  const body = `
<main id="main" style="padding:2rem;">
${renderBreadcrumbs([{ label: "Blog" }])}
<h1>Noir Magazin</h1>
<p>Geschichten, Empfehlungen und Insider-Wissen aus dem Hamburger Premium-Lifestyle.</p>
${posts.map((p) => `<article><h2><a href="/blog/${p.slug}">${esc(p.title)}</a></h2><p><strong>${esc(p.category)}</strong></p><p>${esc(p.excerpt)}</p></article>`).join("")}
</main>`;
  return renderShell({
    ...buildAssets,
    title: "Magazin — Noir Hamburg | Lifestyle, Hamburg Guide & Reiseempfehlungen",
    description: "Das Noir Hamburg Magazin: Restaurants, Hotels, Reisen, Lifestyle und Hamburg-Insider-Wissen für anspruchsvolle Genießer.",
    canonical: `${SITE_ORIGIN}/blog`,
    jsonLd: [breadcrumbSchema([{ label: "Blog" }])],
    bodyContent: body,
  });
}

async function renderBlogDetail(slug, buildAssets) {
  let p;
  try { p = await backendJSON(`/api/blog/${slug}`); } catch (e) { return null; }
  const body = `
<main id="main" style="padding:2rem;">
${renderBreadcrumbs([{ label: "Blog", to: "/blog" }, { label: p.title }])}
<article>
<p style="text-transform:uppercase;color:#8B1538;">${esc(p.category)}</p>
<h1>${esc(p.title)}</h1>
${p.cover_image ? `<img src="${escAttr(p.cover_image)}" alt="${escAttr(p.title)}" width="800" loading="eager"/>` : ""}
${p.content}
</article>
</main>`;
  return renderShell({
    ...buildAssets,
    title: p.meta_title || `${p.title} | Noir Hamburg`,
    description: p.meta_description || p.excerpt,
    canonical: `${SITE_ORIGIN}/blog/${p.slug}`,
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
      breadcrumbSchema([{ label: "Blog", to: "/blog" }, { label: p.title }]),
    ],
    bodyContent: body,
  });
}

async function renderPageDetail(slug, buildAssets) {
  let p;
  try { p = await backendJSON(`/api/pages/${slug}`); } catch (e) { return null; }
  const body = `
<main id="main" style="padding:2rem;">
${renderBreadcrumbs([{ label: p.title }])}
<article>
<h1>${esc(p.h1 || p.title)}</h1>
${p.intro ? `<p><em>${esc(p.intro)}</em></p>` : ""}
${p.hero_image ? `<img src="${escAttr(p.hero_image)}" alt="${escAttr(p.title)}" width="800"/>` : ""}
${p.content}
</article>
</main>`;
  return renderShell({
    ...buildAssets,
    title: p.meta_title || `${p.title} | Noir Hamburg`,
    description: p.meta_description || p.intro || stripHtml(p.content).slice(0, 160),
    canonical: `${SITE_ORIGIN}/p/${p.slug}`,
    ogImage: p.hero_image,
    jsonLd: [breadcrumbSchema([{ label: p.title }])],
    bodyContent: body,
  });
}

module.exports = { renderBlogList, renderBlogDetail, renderPageDetail };
