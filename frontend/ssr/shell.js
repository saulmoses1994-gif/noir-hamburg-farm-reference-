/**
 * Shared HTML primitives for SSR pages:
 *   - HTML escapers
 *   - <head> + meta + hreflang + JSON-LD assembly
 *   - <header>, <footer>, breadcrumb helpers (lang-aware)
 *
 * Every route renderer calls `renderShell(...)` to produce its final HTML.
 * Site content (BRAND, NAV, SERVICES, LOCATIONS, FAQS) is sourced from
 * `src/data/site.js` — the same module the React SPA uses, so there is
 * exactly one source of truth.
 *
 * Bilingual support (Feb 2026): each renderer accepts a `lang` ("de" | "en")
 * and a `canonicalPath` (lang-neutral, e.g. "/models" or "/models/aurelia").
 * `renderShell` produces:
 *   - <html lang="…">
 *   - canonical pointing at the current-language URL
 *   - hreflang alternates pointing at the OTHER-language URL (+ x-default = DE)
 */
const { BRAND, NAV, SERVICES, LOCATIONS } = require("../src/data/site");
const { t, localizePath } = require("../src/data/i18n");
const { getSettings } = require("./settings");

const SITE_ORIGIN =
  process.env.SITE_URL || "https://noir-hamburg.com";

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

// Translate a NAV entry's `to` (a DE path) into the current-language URL.
function navTo(toDe, lang) {
  return lang === "en" ? localizePath(toDe, "en") : toDe;
}

function renderHeaderNav(lang) {
  const otherLang = lang === "en" ? "de" : "en";
  // SSR header links land on the equivalent path; the "/" link uses lang root.
  const homeHref = lang === "en" ? "/en" : "/";
  return `<header role="banner" style="padding:1rem 2rem;border-bottom:1px solid #eee;">
<a href="${homeHref}" style="font-family:'Playfair Display',serif;font-size:1.5rem;color:#1A1414;text-decoration:none;">Noir <em style="color:#8B1538;">Hamburg</em></a>
<nav role="navigation" aria-label="${esc(lang === "en" ? "Main navigation" : "Hauptnavigation")}" style="margin-top:1rem;">
${NAV.map((n) => {
    // Translate label via i18n key derived from path.
    const key = n.to === "/" ? "nav.home"
      : n.to === "/models" ? "nav.models"
      : n.to === "/escort-hamburg" ? "nav.escortHamburg"
      : n.to === "/services" ? "nav.services"
      : n.to === "/areas" ? "nav.areas"
      : n.to === "/blog" ? "nav.blog"
      : n.to === "/faq" ? "nav.faq"
      : n.to === "/ueber-uns" ? "nav.about"
      : n.to === "/kontakt" ? "nav.contact"
      : null;
    const label = key ? t(key, lang) : n.label;
    return `<a href="${navTo(n.to, lang)}" style="margin-right:1rem;color:#1A1414;font-size:0.9rem;">${esc(label)}</a>`;
  }).join("")}
<a href="${otherLang === "en" ? localizePath("/", "en") : "/"}" style="margin-left:1rem;padding:0.25rem 0.6rem;border:1px solid #8B1538;color:#8B1538;font-size:0.75rem;text-decoration:none;letter-spacing:0.1em;" aria-label="${esc(t("lang.switchLabel", lang))}">${esc(t("lang.switch", lang))}</a>
</nav>
</header>`;
}

function renderFooter(lang) {
  const s = getSettings();
  const isEn = lang === "en";

  // Curated SEO-friendly anchor labels for the footer navigation.
  const svcLinks = [
    { slug: "luxury-escort-hamburg",   label: isEn ? "Luxury Escort Hamburg"    : "Luxus Escort Hamburg" },
    { slug: "vip-escort-hamburg",      label: isEn ? "VIP Escort Hamburg"       : "VIP Escort Hamburg" },
    { slug: "business-escort-hamburg", label: isEn ? "Business Escort Hamburg"  : "Business Escort Hamburg" },
    { slug: "hotel-escort-hamburg",    label: isEn ? "Hotel Escort Hamburg"     : "Hotel Escort Hamburg" },
    { slug: "dinner-companion-hamburg",label: isEn ? "Dinner Companion Hamburg" : "Dinner Escort Hamburg" },
  ];
  const areaLinks = [
    { slug: "st-pauli",   label: "Escort St. Pauli" },
    { slug: "hafencity",  label: "Escort HafenCity" },
    { slug: "eppendorf",  label: "Escort Eppendorf" },
    { slug: "winterhude", label: "Escort Winterhude" },
    { slug: "altona",     label: "Escort Altona" },
    { slug: "blankenese", label: "Escort Blankenese" },
  ];

  return `<footer role="contentinfo" style="padding:2rem;background:#1A1414;color:#fff;margin-top:3rem;">
<h3>${esc(s.business_name)}</h3>
<p>${esc(t("misc.footerTagline", lang))}</p>
<p>${esc(t("misc.callUs", lang))}: <a href="tel:${esc(s.phone)}" style="color:#E5A5B5;">${esc(s.phone)}</a> · ${esc(t("misc.emailUs", lang))}: <a href="mailto:${esc(s.email)}" style="color:#E5A5B5;">${esc(s.email)}</a></p>
<p><a href="${navTo("/kontakt", lang)}" style="color:#E5A5B5;">${esc(isEn ? "Contact Noir Hamburg →" : "Kontakt Noir Hamburg →")}</a></p>

<nav aria-label="${esc(isEn ? "Escort Services" : "Escort Services")}"><h3>${esc(isEn ? "Escort Services" : "Escort Services")}</h3><ul>
<li><a href="${navTo("/models", lang)}" style="color:#fff;">${esc(isEn ? "Escort Hamburg — All Models" : "Escort Hamburg — Alle Models")}</a></li>
${svcLinks.map((sv) => `<li><a href="${navTo(`/services/${sv.slug}`, lang)}" style="color:#fff;">${esc(sv.label)}</a></li>`).join("")}
<li><a href="${navTo("/services", lang)}" style="color:#fff;">${esc(isEn ? "All Escort Services →" : "Alle Escort Services →")}</a></li>
</ul></nav>

<nav aria-label="${esc(isEn ? "Escort Hamburg by Area" : "Escort Hamburg nach Stadtteil")}"><h3>${esc(isEn ? "Escort Hamburg by Area" : "Escort Hamburg nach Stadtteil")}</h3><ul>
${areaLinks.map((a) => `<li><a href="${navTo(`/escort/${a.slug}`, lang)}" style="color:#fff;">${esc(a.label)}</a></li>`).join("")}
<li><a href="${navTo("/areas", lang)}" style="color:#fff;">${esc(isEn ? "All Hamburg areas →" : "Alle Hamburg-Stadtteile →")}</a></li>
</ul></nav>

<nav aria-label="${esc(isEn ? "Information" : "Informationen")}"><h3>${esc(isEn ? "Information" : "Informationen")}</h3><ul>
<li><a href="${navTo("/blog", lang)}" style="color:#fff;">${esc(isEn ? "Magazine" : "Magazin")}</a></li>
<li><a href="${navTo("/faq", lang)}" style="color:#fff;">FAQ</a></li>
<li><a href="${navTo("/ueber-uns", lang)}" style="color:#fff;">${esc(isEn ? "About Noir Hamburg" : "Über Noir Hamburg")}</a></li>
<li><a href="${navTo("/kontakt", lang)}" style="color:#fff;">${esc(isEn ? "Contact" : "Kontakt")}</a></li>
<li><a href="${navTo("/p/diskretion", lang)}" style="color:#fff;">${esc(isEn ? "Discretion Promise" : "Diskretion")}</a></li>
<li><a href="${navTo("/impressum", lang)}" style="color:#fff;">${esc(isEn ? "Imprint" : "Impressum")}</a></li>
</ul></nav>

<p style="margin-top:1.5rem;font-size:0.75rem;text-transform:uppercase;letter-spacing:0.15em;color:#888;">${esc(isEn ? "Featured on" : "Verzeichnis-Partner")}</p>
<a href="https://www.eurogirlsescort.com" target="_blank" rel="noopener noreferrer nofollow" title="EuroGirlsEscort.com"><img src="https://www.eurogirlsescort.com/dist/images/banners/120X60.jpg" alt="EuroGirlsEscort.com" title="EuroGirlsEscort.com" width="120" height="60" loading="lazy"/></a>
</footer>`;
}

function renderBreadcrumbs(items, lang) {
  const homeHref = lang === "en" ? "/en" : "/";
  const links = [
    `<a href="${homeHref}">${esc(t("crumb.home", lang))}</a>`,
    ...items.map((it, i) =>
      i === items.length - 1
        ? `<span aria-current="page">${esc(it.label)}</span>`
        : `<a href="${escAttr(navTo(it.to, lang))}">${esc(it.label)}</a>`,
    ),
  ];
  return `<nav aria-label="Breadcrumb"><ol style="display:flex;gap:0.5rem;list-style:none;padding:1rem 2rem;">${links.map((l) => `<li>${l} ›</li>`).join("")}</ol></nav>`;
}

function breadcrumbSchema(items, lang) {
  const homeAbs = lang === "en" ? `${SITE_ORIGIN}/en` : `${SITE_ORIGIN}/`;
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: t("crumb.home", lang), item: homeAbs },
      ...items.map((it, i) => ({
        "@type": "ListItem",
        position: i + 2,
        name: it.label,
        ...(it.to ? { item: `${SITE_ORIGIN}${navTo(it.to, lang)}` } : {}),
      })),
    ],
  };
}

/**
 * Build the full HTML document for a single SSR route.
 *
 * @param {object} opts
 * @param {string} opts.lang             "de" | "en"
 * @param {string} opts.canonicalPath    lang-neutral path, e.g. "/models" or
 *                                       "/models/aurelia" — used to compute
 *                                       canonical + hreflang alternates.
 */
function renderShell({
  lang = "de",
  title,
  description,
  canonicalPath,
  ogImage,
  jsonLd = [],
  bodyContent,
  reactHeadAssets,
  reactScripts,
  preloadImage,  // optional URL — emitted as <link rel="preload" as="image">
                 // to prioritise fetching the LCP image.
  bootstrapData, // optional plain object serialised into window.__NOIR_INITIAL__.
                 // Home.jsx reads this as initial state to avoid the hero
                 // flashing to the fallback image between hydration and API load.
}) {
  const dePath = localizePath(canonicalPath || "/", "de");
  const enPath = localizePath(canonicalPath || "/", "en");
  const canonicalAbs = SITE_ORIGIN + (lang === "en" ? enPath : dePath);
  const deAbs = SITE_ORIGIN + dePath;
  const enAbs = SITE_ORIGIN + enPath;

  const ldScripts = jsonLd
    .filter(Boolean)
    .map((entry) => `<script type="application/ld+json">${JSON.stringify(entry)}</script>`)
    .join("\n");

  const htmlLang = lang === "en" ? "en-DE" : "de-DE";
  const s = getSettings();

  return `<!doctype html>
<html lang="${lang === "en" ? "en" : "de"}">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<meta name="theme-color" content="#8B1538" />
<title>${esc(title)}</title>
<meta name="description" content="${escAttr(description)}" />
<meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1" />
<meta name="language" content="${lang === "en" ? "en" : "de"}" />
<meta name="geo.region" content="DE-HH" />
<meta name="geo.placename" content="Hamburg" />
<link rel="canonical" href="${escAttr(canonicalAbs)}" />
<link rel="alternate" hreflang="de-DE" href="${escAttr(deAbs)}" />
<link rel="alternate" hreflang="en" href="${escAttr(enAbs)}" />
<link rel="alternate" hreflang="x-default" href="${escAttr(deAbs)}" />
<meta property="og:site_name" content="Noir Hamburg" />
<meta property="og:type" content="website" />
<meta property="og:locale" content="${htmlLang.replace("-", "_")}" />
<meta property="og:title" content="${escAttr(title)}" />
<meta property="og:description" content="${escAttr(description)}" />
<meta property="og:url" content="${escAttr(canonicalAbs)}" />
${ogImage ? `<meta property="og:image" content="${escAttr(ogImage)}" />
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />
<meta property="og:image:alt" content="${escAttr(title)}" />` : ""}
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="${escAttr(title)}" />
<meta name="twitter:description" content="${escAttr(description)}" />
${ogImage ? `<meta name="twitter:image" content="${escAttr(ogImage)}" />
<meta name="twitter:image:alt" content="${escAttr(title)}" />` : ""}
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link rel="preconnect" href="https://images.unsplash.com" />
${preloadImage ? `<link rel="preload" as="image" href="${escAttr(preloadImage)}" fetchpriority="high" />` : ""}
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500&family=DM+Sans:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
<script type="application/ld+json">
{
  "@context":"https://schema.org","@type":"Organization","@id":"${SITE_ORIGIN}/#org",
  "name":"${esc(s.business_name)}","url":"${SITE_ORIGIN}",
  "email":"${esc(s.email)}","telephone":"${esc(s.phone)}",
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
${renderHeaderNav(lang)}
${bodyContent}
${renderFooter(lang)}
</div>
<div id="root"></div>
${bootstrapData ? `<script>window.__NOIR_INITIAL__=${JSON.stringify(bootstrapData).replace(/</g, "\\u003c")};</script>` : ""}
${reactScripts}
<script>
/* Hide the pre-rendered #seo-content div for two reasons:
   1. URL mismatch — nginx may have served the wrong static file (e.g.
      /index.html as SPA fallback when the specific route file is missing).
      In that case the baked SEO content is for the WRONG URL and would
      show homepage HTML on a service page. Detect via canonical mismatch
      and hide immediately, before React even loads.
   2. Once React mounts and renders into #root, hide anyway to avoid a
      double-render (React's content is the source of truth for users;
      the seo-content was only needed for crawlers on first byte).
*/
(function(){
  var seo = document.getElementById('seo-content');
  if (!seo) return;

  // Fast path — URL mismatch check. Runs before React script downloads
  // so users on prod nginx never see the wrong baked content flash.
  try {
    var canonical = document.querySelector('link[rel="canonical"]');
    if (canonical) {
      // Compare pathnames only (strip origin, trailing slash, query, hash).
      var canonHref = canonical.getAttribute('href') || '';
      var canonPath = canonHref.replace(/^https?:\/\/[^/]+/, '').replace(/\/+$/, '') || '/';
      var currPath  = window.location.pathname.replace(/\/+$/, '') || '/';
      if (canonPath !== currPath) {
        seo.style.display = 'none';
        return;
      }
    }
  } catch (_) { /* fall through to MutationObserver */ }

  // Slow path — hide once React finishes hydrating.
  var observer = new MutationObserver(function(){
    var root = document.getElementById('root');
    if (root && root.childNodes.length > 0) {
      seo.style.display = 'none';
      observer.disconnect();
    }
  });
  var root = document.getElementById('root');
  if (root) observer.observe(root, { childList: true });
})();
</script>
</body>
</html>`;
}

// Small banner shown on EN long-form pages where editorial body copy is still
// only available in German. Returns "" for DE.
function englishComingSoonBanner(lang) {
  if (lang !== "en") return "";
  return `<aside style="margin:1rem 2rem;padding:0.75rem 1rem;border-left:3px solid #8B1538;background:#FAF5F2;font-size:0.875rem;color:#4A3F3F;"><strong>EN preview.</strong> ${esc(t("misc.englishComingSoon", "en"))}</aside>`;
}

module.exports = {
  SITE_ORIGIN,
  esc,
  escAttr,
  stripHtml,
  navTo,
  renderHeaderNav,
  renderFooter,
  renderBreadcrumbs,
  breadcrumbSchema,
  renderShell,
  englishComingSoonBanner,
  t,
};
