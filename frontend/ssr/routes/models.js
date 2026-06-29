/**
 * Model listing (/models) + detail (/models/:slug) SSR renderers.
 */
const { SERVICES, LOCATIONS } = require("../../src/data/site");
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

async function renderModels(buildAssets) {
  let models = [];
  try {
    models = await backendJSON("/api/models");
  } catch (e) {
    /* fall through with empty list */
  }
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
    ...buildAssets,
    title: "Models — Premium Escort Hamburg | Noir Hamburg",
    description: "Entdecken Sie das aktuelle Roster von Noir Hamburg — sorgfältig ausgewählte Persönlichkeiten für anspruchsvolle Begleitung in Hamburg und Umland.",
    canonical: `${SITE_ORIGIN}/models`,
    jsonLd: [
      breadcrumbSchema([{ label: "Models" }]),
      models.length
        ? {
            "@context": "https://schema.org",
            "@type": "ItemList",
            itemListElement: models.slice(0, 30).map((m, i) => ({
              "@type": "ListItem",
              position: i + 1,
              url: `${SITE_ORIGIN}/models/${m.slug}`,
              name: m.name,
              image: m.cover_image,
            })),
          }
        : null,
    ],
    bodyContent: body,
  });
}

async function renderModelDetail(slug, buildAssets) {
  let m;
  try {
    m = await backendJSON(`/api/models/${slug}`);
  } catch (e) {
    return null;
  }
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
    ...buildAssets,
    title: `${m.name} — Escort Hamburg | Noir Hamburg`,
    description: `${m.name}, ${m.age} Jahre – ${m.short_tagline || "Premium Begleitung in Hamburg"}. Diskret, gebildet, hanseatisch elegant.`,
    canonical: `${SITE_ORIGIN}/models/${m.slug}`,
    ogImage: m.cover_image,
    jsonLd: [
      {
        "@context": "https://schema.org",
        "@type": "Person",
        name: m.name,
        description: stripHtml(m.bio),
        knowsLanguage: m.languages,
        image: m.cover_image,
        nationality: m.nationality,
      },
      breadcrumbSchema([{ label: "Models", to: "/models" }, { label: m.name }]),
    ],
    bodyContent: body,
  });
}

module.exports = { renderModels, renderModelDetail };
