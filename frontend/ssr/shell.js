/**
 * Shared HTML primitives for SSR pages:
 *   - HTML escapers
 *   - <head> + meta + JSON-LD assembly
 *   - <header>, <footer>, breadcrumb helpers
 *
 * Every route renderer calls `renderShell(...)` to produce its final HTML.
 * Site content (BRAND, NAV, SERVICES, LOCATIONS, FAQS) is sourced from
 * `src/data/site.js` — the same module the React SPA uses, so there is
 * exactly one source of truth.
 */
const { BRAND, NAV, SERVICES, LOCATIONS } = require("../src/data/site");

const SITE_ORIGIN =
  process.env.SITE_URL || "https://client-portal-385.preview.emergentagent.com";

const esc = (s) =>
  String(s || "").replace(/[&<>"']/g, (c) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  }[c]));
const escAttr = (s) => esc(s);
const stripHtml = (s) => String(s || "").replace(/<[^>]+>/g, "");

function renderHeaderNav() {
  return `<header role="banner" style="padding:1rem 2rem;border-bottom:1px solid #eee;">
<a href="/" style="font-family:'Playfair Display',serif;font-size:1.5rem;color:#1A1414;text-decoration:none;">Noir <em style="color:#8B1538;">Hamburg</em></a>
<nav role="navigation" aria-label="Hauptnavigation" style="margin-top:1rem;">
${NAV.map((n) => `<a href="${n.to}" style="margin-right:1rem;color:#1A1414;font-size:0.9rem;">${esc(n.label)}</a>`).join("")}
</nav>
</header>`;
}

function renderFooter() {
  return `<footer role="contentinfo" style="padding:2rem;background:#1A1414;color:#fff;margin-top:3rem;">
<h2>Noir Hamburg</h2>
<p>Premium-Begleitagentur in Hamburg und Umland.</p>
<p>Telefon: <a href="tel:${BRAND.phone}" style="color:#E5A5B5;">${BRAND.phone}</a> · E-Mail: <a href="mailto:${BRAND.email}" style="color:#E5A5B5;">${BRAND.email}</a></p>
<nav aria-label="Services"><h3>Services</h3><ul>${SERVICES.map((s) => `<li><a href="/services/${s.slug}" style="color:#fff;">${esc(s.title)}</a></li>`).join("")}</ul></nav>
<nav aria-label="Hamburg Areas"><h3>Hamburg Areas</h3><ul>${LOCATIONS.map((l) => `<li><a href="/escort/${l.slug}" style="color:#fff;">Escort ${esc(l.name)}</a></li>`).join("")}</ul></nav>
</footer>`;
}

function renderBreadcrumbs(items) {
  const links = [
    `<a href="/">Home</a>`,
    ...items.map((it, i) =>
      i === items.length - 1
        ? `<span aria-current="page">${esc(it.label)}</span>`
        : `<a href="${escAttr(it.to)}">${esc(it.label)}</a>`,
    ),
  ];
  return `<nav aria-label="Breadcrumb"><ol style="display:flex;gap:0.5rem;list-style:none;padding:1rem 2rem;">${links.map((l) => `<li>${l} ›</li>`).join("")}</ol></nav>`;
}

function breadcrumbSchema(items) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: `${SITE_ORIGIN}/` },
      ...items.map((it, i) => ({
        "@type": "ListItem",
        position: i + 2,
        name: it.label,
        ...(it.to ? { item: `${SITE_ORIGIN}${it.to}` } : {}),
      })),
    ],
  };
}

/**
 * Build the full HTML document for a single SSR route.
 * The caller passes per-page metadata (title/description/canonical/JSON-LD)
 * and the rendered <main> body; we wrap it with the shared head + nav + footer.
 */
function renderShell({ title, description, canonical, ogImage, jsonLd = [], bodyContent, reactHeadAssets, reactScripts }) {
  const canonicalAbs = canonical || SITE_ORIGIN + "/";
  const ldScripts = jsonLd
    .filter(Boolean)
    .map((entry) => `<script type="application/ld+json">${JSON.stringify(entry)}</script>`)
    .join("\n");

  return `<!doctype html>
<html lang="de">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<meta name="theme-color" content="#8B1538" />
<title>${esc(title)}</title>
<meta name="description" content="${escAttr(description)}" />
<meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1" />
<meta name="language" content="de" />
<meta name="geo.region" content="DE-HH" />
<meta name="geo.placename" content="Hamburg" />
<link rel="canonical" href="${escAttr(canonicalAbs)}" />
<link rel="alternate" hreflang="de-DE" href="${escAttr(canonicalAbs)}" />
<link rel="alternate" hreflang="x-default" href="${escAttr(canonicalAbs)}" />
<meta property="og:site_name" content="Noir Hamburg" />
<meta property="og:type" content="website" />
<meta property="og:locale" content="de_DE" />
<meta property="og:title" content="${escAttr(title)}" />
<meta property="og:description" content="${escAttr(description)}" />
<meta property="og:url" content="${escAttr(canonicalAbs)}" />
${ogImage ? `<meta property="og:image" content="${escAttr(ogImage)}" />` : ""}
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="${escAttr(title)}" />
<meta name="twitter:description" content="${escAttr(description)}" />
${ogImage ? `<meta name="twitter:image" content="${escAttr(ogImage)}" />` : ""}
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500&family=DM+Sans:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
<script type="application/ld+json">
{
  "@context":"https://schema.org","@type":"Organization","@id":"${SITE_ORIGIN}/#org",
  "name":"Noir Hamburg","url":"${SITE_ORIGIN}",
  "email":"${BRAND.email}","telephone":"${BRAND.phone}",
  "areaServed":{"@type":"City","name":"Hamburg"}
}
</script>
<script type="application/ld+json">
{"@context":"https://schema.org","@type":"WebSite","@id":"${SITE_ORIGIN}/#website",
 "url":"${SITE_ORIGIN}","name":"Noir Hamburg","inLanguage":"de-DE",
 "publisher":{"@id":"${SITE_ORIGIN}/#org"}}
</script>
${ldScripts}
${reactHeadAssets}
</head>
<body>
<div id="seo-content">
${renderHeaderNav()}
${bodyContent}
${renderFooter()}
</div>
<div id="root"></div>
${reactScripts}
<script>
/* When React mounts and renders into #root, hide the SEO content to avoid a
   double-render. Crawlers parse the static seo-content above and ignore the
   inline script. */
(function(){
  var observer = new MutationObserver(function(){
    var root = document.getElementById('root');
    if (root && root.childNodes.length > 0) {
      var seo = document.getElementById('seo-content');
      if (seo) seo.style.display = 'none';
      observer.disconnect();
    }
  });
  observer.observe(document.getElementById('root'), { childList: true });
})();
</script>
</body>
</html>`;
}

module.exports = {
  SITE_ORIGIN,
  esc,
  escAttr,
  stripHtml,
  renderHeaderNav,
  renderFooter,
  renderBreadcrumbs,
  breadcrumbSchema,
  renderShell,
};
