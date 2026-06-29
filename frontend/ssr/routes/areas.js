/**
 * Areas list (/areas) + Area detail (/escort/:slug) + /escort-hamburg umbrella.
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

function renderAreasList(buildAssets) {
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
    ...buildAssets,
    title: "Hamburg Areas — Premium Escort in der ganzen Metropolregion | Noir Hamburg",
    description: "Premium Escort in Hamburg und Umland: HafenCity, Blankenese, Harvestehude, Eppendorf, Altona und weitere Stadtteile.",
    canonical: `${SITE_ORIGIN}/areas`,
    jsonLd: [breadcrumbSchema([{ label: "Hamburg Areas" }])],
    bodyContent: body,
  });
}

function renderAreaDetail(slug, buildAssets) {
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
    ...buildAssets,
    title: `${l.title} — Premium Begleitung in ${l.name} | Noir Hamburg`,
    description: `${l.title}: ${l.intro} Diskrete Begleitung in ${l.name} – exklusiv vermittelt durch Noir Hamburg.`,
    canonical: `${SITE_ORIGIN}/escort/${l.slug}`,
    ogImage: l.image,
    jsonLd: [
      {
        "@context": "https://schema.org",
        "@type": "Place",
        name: `Escort ${l.name}`,
        description: l.description,
        address: { "@type": "PostalAddress", addressLocality: l.name, addressCountry: "DE" },
      },
      breadcrumbSchema([{ label: "Hamburg Areas", to: "/areas" }, { label: l.name }]),
    ],
    bodyContent: body,
  });
}

function renderEscortHamburg(buildAssets) {
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
    ...buildAssets,
    title: "Escort Hamburg — Premium Begleitagentur | Noir Hamburg",
    description: "Escort Hamburg auf höchstem Niveau: Diskret, gebildet, hanseatisch elegant. Sorgfältig ausgewählte Models für anspruchsvolle Herren in Hamburg und Umland.",
    canonical: `${SITE_ORIGIN}/escort-hamburg`,
    jsonLd: [breadcrumbSchema([{ label: "Escort Hamburg" }])],
    bodyContent: body,
  });
}

module.exports = { renderAreasList, renderAreaDetail, renderEscortHamburg };
