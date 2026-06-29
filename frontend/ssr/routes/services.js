/**
 * Services list + detail SSR renderers (data-driven from src/data/site).
 */
const { SERVICES, LOCATIONS } = require("../../src/data/site");
const {
  SITE_ORIGIN,
  esc,
  escAttr,
  renderShell,
  renderBreadcrumbs,
  breadcrumbSchema,
} = require("../shell");

function renderServicesList(buildAssets) {
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
    ...buildAssets,
    title: "Escort Services Hamburg — Premium Begleitung | Noir Hamburg",
    description: "Acht sorgfältig definierte Servicearten von Noir Hamburg: Luxury, VIP, Business, Dinner, Hotel, Event, Travel und Girlfriend Experience.",
    canonical: `${SITE_ORIGIN}/services`,
    jsonLd: [breadcrumbSchema([{ label: "Services" }])],
    bodyContent: body,
  });
}

function renderServiceDetail(slug, buildAssets) {
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
    ...buildAssets,
    title: s.metaTitle,
    description: s.metaDescription,
    canonical: `${SITE_ORIGIN}/services/${s.slug}`,
    ogImage: s.image,
    jsonLd: [
      {
        "@context": "https://schema.org",
        "@type": "Service",
        name: s.title,
        description: s.metaDescription,
        provider: { "@type": "LocalBusiness", name: "Noir Hamburg", areaServed: "Hamburg" },
        areaServed: { "@type": "City", name: "Hamburg" },
        serviceType: s.shortLabel,
      },
      breadcrumbSchema([{ label: "Services", to: "/services" }, { label: s.title }]),
    ],
    bodyContent: body,
  });
}

module.exports = { renderServicesList, renderServiceDetail };
