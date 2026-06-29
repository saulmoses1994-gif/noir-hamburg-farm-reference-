/* eslint-disable no-console */
/**
 * Noir Hamburg SSR server.
 *
 * Goal: serve full HTML (title, meta, schemas, headings, links, body content)
 *       for every public route so Googlebot, Bingbot, social-card crawlers and
 *       users on a slow connection see real content without executing JS.
 *
 * Strategy:
 *   1. Pre-built React bundle is in ./build/
 *   2. For each known public route, fetch data from FastAPI (localhost:8001/api)
 *      and render a full HTML document via template strings.
 *   3. The rendered HTML embeds the React bundle scripts/links from build/
 *      index.html so users still get the full interactive SPA after first paint.
 *   4. /admin/* and unknown routes return the unmodified SPA shell.
 *   5. Static assets, /robots.txt, /sitemap.xml are served directly.
 */
const express = require("express");
const fs = require("fs");
const path = require("path");
const http = require("http");

const PORT = parseInt(process.env.PORT || "3000", 10);
const BACKEND = process.env.SSR_BACKEND_URL || "http://localhost:8001";
const SITE_ORIGIN = process.env.SITE_URL || "https://client-portal-385.preview.emergentagent.com";
const BUILD_DIR = path.join(__dirname, "build");

if (!fs.existsSync(BUILD_DIR)) {
  console.error("ERR: build/ folder not found. Run `yarn build` first.");
  process.exit(1);
}

const TEMPLATE = fs.readFileSync(path.join(BUILD_DIR, "index.html"), "utf8");

// Extract <head>...</head> assets (script + css link tags) from the React build,
// so the SSR-rendered pages still load the SPA after first paint.
const headAssetsMatch = TEMPLATE.match(/<head>([\s\S]*?)<\/head>/i);
const bodyScriptsMatch = TEMPLATE.match(/<body[^>]*>([\s\S]*?)<\/body>/i);

// Build the body scripts that React needs to mount on top of SSR.
// We strip:
//   - the <div id="root"> placeholder (SSR provides its own)
//   - <noscript>You need to enable JavaScript...</noscript> (legacy CRA boilerplate;
//     misleading for SEO crawlers because real HTML *is* present without JS)
const reactScripts = (bodyScriptsMatch ? bodyScriptsMatch[1] : "")
  .replace(/<div id="root">[\s\S]*?<\/div>/i, "")
  .replace(/<noscript>[\s\S]*?<\/noscript>/gi, "");

// Extract only <link rel="stylesheet"> and <script src> tags from the built head.
// CRA's production build minifies the head onto a single line which contains many
// other tags (title, meta, link rel=preconnect, inline scripts). We tokenise the
// head and keep ONLY the asset tags so we don't duplicate <title>/<meta> that the
// SSR template already emits.
function extractAssetTags(headHtml) {
  const tags = [];
  // Match self-closing or void link tags and external script tags individually.
  const tagRegex = /<(link|script)\b[^>]*?(?:\/>|>(?:[\s\S]*?<\/\1>)?)/gi;
  let m;
  while ((m = tagRegex.exec(headHtml)) !== null) {
    const tag = m[0];
    if (/<link\b[^>]+rel=["']stylesheet/i.test(tag)) tags.push(tag);
    else if (/<script\b[^>]+src=/i.test(tag)) tags.push(tag);
  }
  return tags.join("\n");
}
const reactHeadAssets = extractAssetTags(headAssetsMatch ? headAssetsMatch[1] : "");

// ---------- HTTP helpers ----------
function backendJSON(reqPath) {
  return new Promise((resolve, reject) => {
    const req = http.get(`${BACKEND}${reqPath}`, (res) => {
      let data = "";
      res.on("data", (c) => (data += c));
      res.on("end", () => {
        if (res.statusCode >= 400) return reject(new Error(`upstream ${res.statusCode}`));
        try { resolve(JSON.parse(data)); } catch (e) { reject(e); }
      });
    });
    req.on("error", reject);
    req.setTimeout(8000, () => req.destroy(new Error("timeout")));
  });
}

function backendRaw(reqPath) {
  return new Promise((resolve, reject) => {
    const req = http.get(`${BACKEND}${reqPath}`, (res) => {
      let data = "";
      res.on("data", (c) => (data += c));
      res.on("end", () => resolve({ status: res.statusCode, body: data, contentType: res.headers["content-type"] }));
    });
    req.on("error", reject);
    req.setTimeout(8000, () => req.destroy(new Error("timeout")));
  });
}

// ---------- HTML escapers ----------
const esc = (s) => String(s || "").replace(/[&<>"']/g, (c) =>
  ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])
);
const escAttr = (s) => esc(s);
const stripHtml = (s) => String(s || "").replace(/<[^>]+>/g, "");

// ---------- Site data (mirrors /app/frontend/src/data/site.js) ----------
const SERVICES = require("./ssr-data").SERVICES;
const LOCATIONS = require("./ssr-data").LOCATIONS;
const FAQS = require("./ssr-data").FAQS;
const NAV = require("./ssr-data").NAV;
const BRAND = require("./ssr-data").BRAND;

// ---------- Page builder ----------
function renderShell({ title, description, canonical, ogImage, jsonLd = [], bodyContent }) {
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
    ...items.map((it, i) => i === items.length - 1
      ? `<span aria-current="page">${esc(it.label)}</span>`
      : `<a href="${escAttr(it.to)}">${esc(it.label)}</a>`),
  ];
  return `<nav aria-label="Breadcrumb"><ol style="display:flex;gap:0.5rem;list-style:none;padding:1rem 2rem;">${links.map((l) => `<li>${l} ›</li>`).join("")}</ol></nav>`;
}

function breadcrumbSchema(items) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Home", "item": `${SITE_ORIGIN}/` },
      ...items.map((it, i) => ({
        "@type": "ListItem",
        "position": i + 2,
        "name": it.label,
        ...(it.to ? { "item": `${SITE_ORIGIN}${it.to}` } : {}),
      })),
    ],
  };
}

// ---------- Route renderers ----------
async function renderHome() {
  let models = [];
  let posts = [];
  try {
    models = (await backendJSON("/api/models")).slice(0, 8);
    posts = (await backendJSON("/api/blog?limit=3"));
  } catch (e) { console.warn("home fetch fail:", e.message); }

  const body = `
<main id="main" role="main" style="padding:2rem;">
<section>
<p style="color:#8B1538;text-transform:uppercase;letter-spacing:0.2em;font-size:0.75rem;">Premium · Hamburg seit 2014</p>
<h1>Herzlich Willkommen bei <em>Noir Hamburg</em></h1>
<p>Ihre vertrauenswürdige Premium-Begleitagentur in Hamburg und Umland — ehrlich, diskret und stilvoll. Wir vermitteln charmante, gebildete Persönlichkeiten für unvergessliche Begegnungen.</p>
<p><a href="/models">Models entdecken</a> · <a href="${BRAND.whatsappUrl}">WhatsApp</a> · <a href="/kontakt">Kontakt</a></p>
</section>
<section>
<h2>Unsere Escort Damen</h2>
<ul>${models.map((m) => `<li><a href="/models/${m.slug}"><strong>${esc(m.name)}</strong>, ${m.age} Jahre — ${esc(m.short_tagline || "Premium Begleitung")}</a></li>`).join("")}</ul>
<p><a href="/models">Alle Models ansehen</a></p>
</section>
<section>
<h2>Was wir bieten</h2>
<ul>${SERVICES.map((s) => `<li><a href="/services/${s.slug}"><strong>${esc(s.title)}</strong> — ${esc(s.description)}</a></li>`).join("")}</ul>
</section>
<section>
<h2>Hamburg & Umland</h2>
<ul>${LOCATIONS.map((l) => `<li><a href="/escort/${l.slug}">Escort ${esc(l.name)}</a></li>`).join("")}</ul>
</section>
<section>
<h2>Aktuelles aus dem Magazin</h2>
${posts.map((p) => `<article><h3><a href="/blog/${p.slug}">${esc(p.title)}</a></h3><p>${esc(p.excerpt)}</p></article>`).join("")}
<p><a href="/blog">Alle Beiträge</a></p>
</section>
<section>
<h2>Häufige Fragen</h2>
${FAQS.slice(0, 4).map((f) => `<details><summary><strong>${esc(f.q)}</strong></summary><p>${esc(f.a)}</p></details>`).join("")}
</section>
</main>`;

  return renderShell({
    title: "Noir Hamburg — Premium Escort Hamburg | Diskrete Begleitung von höchster Eleganz",
    description: "Noir Hamburg ist die Premium-Begleitagentur für anspruchsvolle Herren in Hamburg. Diskret, gebildet, hanseatisch elegant. Buchen Sie Ihre persönliche Begleitung.",
    canonical: `${SITE_ORIGIN}/`,
    ogImage: "https://images.unsplash.com/photo-1533392151650-269f96231f65?auto=format&fit=crop&w=1200&q=85",
    jsonLd: [
      {
        "@context": "https://schema.org", "@type": "LocalBusiness",
        "name": "Noir Hamburg", "description": "Premium Escort Agency Hamburg",
        "address": { "@type": "PostalAddress", "addressLocality": "Hamburg", "addressCountry": "DE" },
        "areaServed": "Hamburg", "telephone": BRAND.phone, "email": BRAND.email,
      },
      {
        "@context": "https://schema.org", "@type": "FAQPage",
        "mainEntity": FAQS.map((f) => ({
          "@type": "Question", "name": f.q,
          "acceptedAnswer": { "@type": "Answer", "text": f.a },
        })),
      },
    ],
    bodyContent: body,
  });
}

async function renderModels() {
  let models = [];
  try { models = await backendJSON("/api/models"); } catch (e) {}
  const body = `
<main id="main" style="padding:2rem;">
${renderBreadcrumbs([{ label: "Models" }])}
<h1>Unsere Models</h1>
<p>Eine sorgfältig kuratierte Auswahl an Persönlichkeiten – jede mit eigener Geschichte, Bildung und unverkennbarem Stil.</p>
<ul>
${models.map((m) => `<li><a href="/models/${m.slug}"><strong>${esc(m.name)}</strong>, ${m.age} Jahre, ${m.height_cm || ""}cm — ${esc(m.short_tagline || "")}</a><br/>Sprachen: ${(m.languages || []).map(esc).join(", ")}<br/>Verfügbar in: ${(m.locations || []).map(esc).join(", ")}</li>`).join("")}
</ul>
</main>`;
  return renderShell({
    title: "Models — Premium Escort Hamburg | Noir Hamburg",
    description: "Entdecken Sie das aktuelle Roster von Noir Hamburg — sorgfältig ausgewählte Persönlichkeiten für anspruchsvolle Begleitung in Hamburg und Umland.",
    canonical: `${SITE_ORIGIN}/models`,
    jsonLd: [
      breadcrumbSchema([{ label: "Models" }]),
      models.length ? {
        "@context": "https://schema.org", "@type": "ItemList",
        "itemListElement": models.slice(0, 30).map((m, i) => ({
          "@type": "ListItem", "position": i + 1,
          "url": `${SITE_ORIGIN}/models/${m.slug}`, "name": m.name, "image": m.cover_image,
        })),
      } : null,
    ],
    bodyContent: body,
  });
}

async function renderModelDetail(slug) {
  let m;
  try { m = await backendJSON(`/api/models/${slug}`); } catch (e) { return null; }
  const relServices = SERVICES.filter((s) => (m.services || []).includes(s.slug));
  const relLocs = LOCATIONS.filter((l) => (m.locations || []).includes(l.slug));
  const body = `
<main id="main" style="padding:2rem;">
${renderBreadcrumbs([{ label: "Models", to: "/models" }, { label: m.name }])}
<article>
<h1>${esc(m.name)}</h1>
<p><strong>${esc(m.short_tagline || "")}</strong></p>
${m.cover_image ? `<img src="${escAttr(m.cover_image)}" alt="${escAttr(m.name)} — Escort Hamburg" width="600" loading="eager"/>` : ""}
<dl>
<dt>Alter</dt><dd>${m.age} Jahre</dd>
<dt>Größe</dt><dd>${m.height_cm || "–"} cm</dd>
<dt>Nationalität</dt><dd>${esc(m.nationality || "")}</dd>
<dt>Sprachen</dt><dd>${(m.languages || []).map(esc).join(", ")}</dd>
<dt>Haar / Augen</dt><dd>${esc(m.hair_color || "")} / ${esc(m.eye_color || "")}</dd>
</dl>
<h2>Über ${esc(m.name)}</h2>
<p>${esc(m.bio)}</p>
<h2>Services</h2>
<ul>${relServices.map((s) => `<li><a href="/services/${s.slug}">${esc(s.title)}</a></li>`).join("")}</ul>
<h2>Verfügbar in</h2>
<ul>${relLocs.map((l) => `<li><a href="/escort/${l.slug}">Escort ${esc(l.name)}</a></li>`).join("")}</ul>
<p><a href="/kontakt?model=${escAttr(m.slug)}">${esc(m.name)} buchen</a></p>
</article>
</main>`;
  return renderShell({
    title: `${m.name} — Escort Hamburg | Noir Hamburg`,
    description: `${m.name}, ${m.age} Jahre – ${m.short_tagline || "Premium Begleitung in Hamburg"}. Diskret, gebildet, hanseatisch elegant.`,
    canonical: `${SITE_ORIGIN}/models/${m.slug}`,
    ogImage: m.cover_image,
    jsonLd: [
      {
        "@context": "https://schema.org", "@type": "Person",
        "name": m.name, "description": stripHtml(m.bio),
        "knowsLanguage": m.languages, "image": m.cover_image, "nationality": m.nationality,
      },
      breadcrumbSchema([{ label: "Models", to: "/models" }, { label: m.name }]),
    ],
    bodyContent: body,
  });
}

function renderServicesList() {
  const body = `
<main id="main" style="padding:2rem;">
${renderBreadcrumbs([{ label: "Services" }])}
<h1>Escort Services Hamburg</h1>
<p>Acht sorgfältig definierte Begleitarten – damit jede Begegnung ihren angemessenen Rahmen findet.</p>
${SERVICES.map((s) => `
<article><h2><a href="/services/${s.slug}">${esc(s.title)}</a></h2>
<p><em>${esc(s.tagline)}</em></p>
<p>${esc(s.description)}</p>
<p><a href="/services/${s.slug}">Details ansehen</a></p></article>`).join("")}
</main>`;
  return renderShell({
    title: "Escort Services Hamburg — Premium Begleitung | Noir Hamburg",
    description: "Acht sorgfältig definierte Servicearten von Noir Hamburg: Luxury, VIP, Business, Dinner, Hotel, Event, Travel und Girlfriend Experience.",
    canonical: `${SITE_ORIGIN}/services`,
    jsonLd: [breadcrumbSchema([{ label: "Services" }])],
    bodyContent: body,
  });
}

function renderServiceDetail(slug) {
  const s = SERVICES.find((x) => x.slug === slug);
  if (!s) return null;
  const body = `
<main id="main" style="padding:2rem;">
${renderBreadcrumbs([{ label: "Services", to: "/services" }, { label: s.title }])}
<article>
<h1>${esc(s.h1)}</h1>
<p><em>${esc(s.tagline)}</em></p>
${s.image ? `<img src="${escAttr(s.image)}" alt="${escAttr(s.title)}" width="800" loading="eager"/>` : ""}
<p>${esc(s.longCopy)}</p>
<h2>Charakteristika</h2>
<ul>${s.keypoints.map((k) => `<li>${esc(k)}</li>`).join("")}</ul>
<h2>Verfügbar in</h2>
<ul>${LOCATIONS.slice(0, 10).map((l) => `<li><a href="/escort/${l.slug}">Escort ${esc(l.name)}</a></li>`).join("")}</ul>
<p><a href="/kontakt">Termin anfragen</a> · <a href="/models">Models ansehen</a></p>
</article>
</main>`;
  return renderShell({
    title: s.metaTitle, description: s.metaDescription,
    canonical: `${SITE_ORIGIN}/services/${s.slug}`, ogImage: s.image,
    jsonLd: [
      {
        "@context": "https://schema.org", "@type": "Service", "name": s.title,
        "description": s.metaDescription,
        "provider": { "@type": "LocalBusiness", "name": "Noir Hamburg", "areaServed": "Hamburg" },
        "areaServed": { "@type": "City", "name": "Hamburg" }, "serviceType": s.shortLabel,
      },
      breadcrumbSchema([{ label: "Services", to: "/services" }, { label: s.title }]),
    ],
    bodyContent: body,
  });
}

function renderAreasList() {
  const body = `
<main id="main" style="padding:2rem;">
${renderBreadcrumbs([{ label: "Hamburg Areas" }])}
<h1>Hamburg Areas</h1>
<p>Wir begleiten Sie in der gesamten Metropolregion Hamburg.</p>
${LOCATIONS.map((l) => `
<article><h2><a href="/escort/${l.slug}">${esc(l.title)}</a></h2>
<p>${esc(l.intro)}</p></article>`).join("")}
</main>`;
  return renderShell({
    title: "Hamburg Areas — Premium Escort in der ganzen Metropolregion | Noir Hamburg",
    description: "Premium Escort in Hamburg und Umland: HafenCity, Blankenese, Harvestehude, Eppendorf, Altona und weitere Stadtteile.",
    canonical: `${SITE_ORIGIN}/areas`,
    jsonLd: [breadcrumbSchema([{ label: "Hamburg Areas" }])],
    bodyContent: body,
  });
}

function renderAreaDetail(slug) {
  const l = LOCATIONS.find((x) => x.slug === slug);
  if (!l) return null;
  const nearby = LOCATIONS.filter((x) => x.slug !== l.slug).slice(0, 6);
  const body = `
<main id="main" style="padding:2rem;">
${renderBreadcrumbs([{ label: "Hamburg Areas", to: "/areas" }, { label: l.name }])}
<article>
<h1>${esc(l.title)}</h1>
<p><em>${esc(l.intro)}</em></p>
${l.image ? `<img src="${escAttr(l.image)}" alt="${escAttr(l.title)}" width="800" loading="eager"/>` : ""}
<p>${esc(l.description)}</p>
${(l.landmarks || []).length > 0 ? `<h2>Beliebte Adressen</h2><ul>${l.landmarks.map((lm) => `<li>${esc(lm)}</li>`).join("")}</ul>` : ""}
<h2>Beliebte Services</h2>
<ul>${SERVICES.slice(0, 5).map((s) => `<li><a href="/services/${s.slug}">${esc(s.title)}</a></li>`).join("")}</ul>
<h2>In der Nähe</h2>
<ul>${nearby.map((n) => `<li><a href="/escort/${n.slug}">Escort ${esc(n.name)}</a></li>`).join("")}</ul>
<p><a href="/kontakt">In ${esc(l.name)} buchen</a></p>
</article>
</main>`;
  return renderShell({
    title: `${l.title} — Premium Begleitung in ${l.name} | Noir Hamburg`,
    description: `${l.title}: ${l.intro} Diskrete Begleitung in ${l.name} – exklusiv vermittelt durch Noir Hamburg.`,
    canonical: `${SITE_ORIGIN}/escort/${l.slug}`, ogImage: l.image,
    jsonLd: [
      {
        "@context": "https://schema.org", "@type": "Place", "name": `Escort ${l.name}`,
        "description": l.description,
        "address": { "@type": "PostalAddress", "addressLocality": l.name, "addressCountry": "DE" },
      },
      breadcrumbSchema([{ label: "Hamburg Areas", to: "/areas" }, { label: l.name }]),
    ],
    bodyContent: body,
  });
}

function renderEscortHamburg() {
  const body = `
<main id="main" style="padding:2rem;">
${renderBreadcrumbs([{ label: "Escort Hamburg" }])}
<h1>Escort Hamburg</h1>
<p>Hamburg ist eine Stadt der feinen Kontraste: maritime Weltläufigkeit und hanseatische Zurückhaltung, Reichtum ohne Pomp, Kultur ohne Eile. Wer hier um Begleitung bittet, sucht keine Bühne – er sucht eine Persönlichkeit.</p>
<h2>Wofür Sie uns rufen können</h2>
<ul>${SERVICES.map((s) => `<li><a href="/services/${s.slug}"><strong>${esc(s.title)}</strong> — ${esc(s.description)}</a></li>`).join("")}</ul>
<h2>Hamburg & Umland</h2>
<ul>${LOCATIONS.map((l) => `<li><a href="/escort/${l.slug}">Escort ${esc(l.name)}</a></li>`).join("")}</ul>
<p><a href="/models">Models entdecken</a> · <a href="/kontakt">Anfrage senden</a></p>
</main>`;
  return renderShell({
    title: "Escort Hamburg — Premium Begleitagentur | Noir Hamburg",
    description: "Escort Hamburg auf höchstem Niveau: Diskret, gebildet, hanseatisch elegant. Sorgfältig ausgewählte Models für anspruchsvolle Herren in Hamburg und Umland.",
    canonical: `${SITE_ORIGIN}/escort-hamburg`,
    jsonLd: [breadcrumbSchema([{ label: "Escort Hamburg" }])],
    bodyContent: body,
  });
}

async function renderBlogList() {
  let posts = [];
  try { posts = await backendJSON("/api/blog"); } catch (e) {}
  const body = `
<main id="main" style="padding:2rem;">
${renderBreadcrumbs([{ label: "Blog" }])}
<h1>Noir Magazin</h1>
<p>Geschichten, Empfehlungen und Insider-Wissen aus dem Hamburger Premium-Lifestyle.</p>
${posts.map((p) => `<article><h2><a href="/blog/${p.slug}">${esc(p.title)}</a></h2><p><strong>${esc(p.category)}</strong></p><p>${esc(p.excerpt)}</p></article>`).join("")}
</main>`;
  return renderShell({
    title: "Magazin — Noir Hamburg | Lifestyle, Hamburg Guide & Reiseempfehlungen",
    description: "Das Noir Hamburg Magazin: Restaurants, Hotels, Reisen, Lifestyle und Hamburg-Insider-Wissen für anspruchsvolle Genießer.",
    canonical: `${SITE_ORIGIN}/blog`,
    jsonLd: [breadcrumbSchema([{ label: "Blog" }])],
    bodyContent: body,
  });
}

async function renderBlogDetail(slug) {
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
    title: p.meta_title || `${p.title} | Noir Hamburg`,
    description: p.meta_description || p.excerpt,
    canonical: `${SITE_ORIGIN}/blog/${p.slug}`, ogImage: p.cover_image,
    jsonLd: [
      {
        "@context": "https://schema.org", "@type": "Article", "headline": p.title,
        "image": p.cover_image, "datePublished": p.created_at,
        "dateModified": p.updated_at || p.created_at,
        "author": { "@type": "Organization", "name": "Noir Hamburg" },
        "publisher": { "@type": "Organization", "name": "Noir Hamburg" },
        "inLanguage": "de-DE", "articleSection": p.category,
      },
      breadcrumbSchema([{ label: "Blog", to: "/blog" }, { label: p.title }]),
    ],
    bodyContent: body,
  });
}

async function renderPageDetail(slug) {
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
    title: p.meta_title || `${p.title} | Noir Hamburg`,
    description: p.meta_description || p.intro || stripHtml(p.content).slice(0, 160),
    canonical: `${SITE_ORIGIN}/p/${p.slug}`, ogImage: p.hero_image,
    jsonLd: [breadcrumbSchema([{ label: p.title }])],
    bodyContent: body,
  });
}

function renderFAQ() {
  const body = `
<main id="main" style="padding:2rem;">
${renderBreadcrumbs([{ label: "FAQ" }])}
<h1>Häufig gestellte Fragen</h1>
${FAQS.map((f) => `<details open><summary><h2 style="display:inline">${esc(f.q)}</h2></summary><p>${esc(f.a)}</p></details>`).join("")}
</main>`;
  return renderShell({
    title: "FAQ — Häufige Fragen | Noir Hamburg Premium Escort",
    description: "Antworten auf häufige Fragen zum Buchungsprozess, Diskretion, Verfügbarkeit und Zahlungsmodalitäten bei Noir Hamburg.",
    canonical: `${SITE_ORIGIN}/faq`,
    jsonLd: [{
      "@context": "https://schema.org", "@type": "FAQPage",
      "mainEntity": FAQS.map((f) => ({
        "@type": "Question", "name": f.q,
        "acceptedAnswer": { "@type": "Answer", "text": f.a },
      })),
    }, breadcrumbSchema([{ label: "FAQ" }])],
    bodyContent: body,
  });
}

function renderAbout() {
  const body = `
<main id="main" style="padding:2rem;">
${renderBreadcrumbs([{ label: "Über uns" }])}
<h1>Über uns</h1>
<p>Noir Hamburg ist eine kleine, kuratierte Plattform für Menschen, die einen feinen ästhetischen Anspruch, intellektuelle Neugier und ein klares Verständnis von Diskretion teilen.</p>
<p>Gegründet 2014 in Hamburg, haben wir uns über die Jahre einen Namen als verlässlicher Vermittler für anspruchsvolle Klienten erarbeitet.</p>
<h2>Unsere Prinzipien</h2>
<ul><li>Sorgfältige Auswahl</li><li>Verbindliche Diskretion</li><li>Persönliche Betreuung</li><li>Verlässliche Pünktlichkeit</li></ul>
<p><a href="/kontakt">Kontakt aufnehmen</a></p>
</main>`;
  return renderShell({
    title: "Über uns — Die Philosophie von Noir Hamburg",
    description: "Noir Hamburg ist eine kleine, kuratierte Premium-Begleitagentur in Hamburg. Lernen Sie unsere Werte, Standards und unser Verständnis von Diskretion kennen.",
    canonical: `${SITE_ORIGIN}/ueber-uns`,
    jsonLd: [breadcrumbSchema([{ label: "Über uns" }])],
    bodyContent: body,
  });
}

function renderContact() {
  const body = `
<main id="main" style="padding:2rem;">
${renderBreadcrumbs([{ label: "Kontakt" }])}
<h1>Kontakt</h1>
<p>Wir antworten persönlich, vertraulich und meist innerhalb weniger Stunden.</p>
<p>Telefon: <a href="tel:${BRAND.phone}">${BRAND.phone}</a></p>
<p>E-Mail: <a href="mailto:${BRAND.email}">${BRAND.email}</a></p>
<p>WhatsApp: <a href="${BRAND.whatsappUrl}">${BRAND.phone}</a></p>
</main>`;
  return renderShell({
    title: "Kontakt — Diskrete Buchung | Noir Hamburg",
    description: "Nehmen Sie diskret Kontakt zu Noir Hamburg auf. Wir antworten persönlich und vertraulich – per E-Mail, Telefon oder WhatsApp.",
    canonical: `${SITE_ORIGIN}/kontakt`,
    jsonLd: [breadcrumbSchema([{ label: "Kontakt" }])],
    bodyContent: body,
  });
}

// ---------- Express app ----------
const app = express();

// Static assets from build/static, favicon, manifest, etc.
app.use("/static", express.static(path.join(BUILD_DIR, "static"), { maxAge: "1y", immutable: true }));
app.get("/favicon.ico", (req, res) => res.sendFile(path.join(BUILD_DIR, "favicon.ico")));
app.get("/manifest.json", (req, res) => res.sendFile(path.join(BUILD_DIR, "manifest.json")));
app.get("/robots.txt", (req, res) => res.sendFile(path.join(BUILD_DIR, "robots.txt")));

// sitemap proxied from backend
app.get("/sitemap.xml", async (req, res) => {
  try {
    const r = await backendRaw("/api/sitemap.xml");
    res.set("Content-Type", "application/xml").status(r.status).send(r.body);
  } catch (e) {
    res.status(502).send("sitemap upstream error");
  }
});

// SSR routes
const send = (res, html) => res.set("Content-Type", "text/html; charset=utf-8").send(html);
const send404 = (res, html) => res.set("Content-Type", "text/html; charset=utf-8").status(404).send(html);

app.get("/", async (req, res) => { try { send(res, await renderHome()); } catch (e) { console.error(e); send(res, TEMPLATE); } });
app.get("/models", async (req, res) => { try { send(res, await renderModels()); } catch (e) { console.error(e); send(res, TEMPLATE); } });
app.get("/models/:slug", async (req, res) => {
  try {
    const html = await renderModelDetail(req.params.slug);
    if (!html) return send404(res, TEMPLATE);
    send(res, html);
  } catch (e) { console.error(e); send(res, TEMPLATE); }
});
app.get("/services", (req, res) => send(res, renderServicesList()));
app.get("/services/:slug", (req, res) => {
  const html = renderServiceDetail(req.params.slug);
  if (!html) return send404(res, TEMPLATE);
  send(res, html);
});
app.get("/areas", (req, res) => send(res, renderAreasList()));
app.get("/escort/:slug", (req, res) => {
  const html = renderAreaDetail(req.params.slug);
  if (!html) return send404(res, TEMPLATE);
  send(res, html);
});
app.get("/escort-hamburg", (req, res) => send(res, renderEscortHamburg()));
app.get("/blog", async (req, res) => { try { send(res, await renderBlogList()); } catch (e) { send(res, TEMPLATE); } });
app.get("/blog/:slug", async (req, res) => {
  try {
    const html = await renderBlogDetail(req.params.slug);
    if (!html) return send404(res, TEMPLATE);
    send(res, html);
  } catch (e) { send(res, TEMPLATE); }
});
app.get("/p/:slug", async (req, res) => {
  try {
    const html = await renderPageDetail(req.params.slug);
    if (!html) return send404(res, TEMPLATE);
    send(res, html);
  } catch (e) { send(res, TEMPLATE); }
});
app.get("/faq", (req, res) => send(res, renderFAQ()));
app.get("/ueber-uns", (req, res) => send(res, renderAbout()));
app.get("/kontakt", (req, res) => send(res, renderContact()));

// Admin + anything else → SPA shell (React handles routing client-side)
app.get("*", (req, res) => send(res, TEMPLATE));

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Noir Hamburg SSR server listening on 0.0.0.0:${PORT}`);
  console.log(`Backend: ${BACKEND}`);
  console.log(`Site origin: ${SITE_ORIGIN}`);
});
