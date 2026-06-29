/**
 * Model listing (/models, /en/models) + detail (/models/:slug, /en/models/:slug).
 */
const { SERVICES, LOCATIONS } = require("../../src/data/site");
const {
  SITE_ORIGIN,
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

async function renderModels(buildAssets, lang = "de") {
  let models = [];
  try {
    models = await backendJSON("/api/models");
  } catch (e) { /* fall through */ }

  const titleByLang = {
    de: "Models — Premium Escort Hamburg | Noir Hamburg",
    en: "Models — Premium Escort Hamburg | Noir Hamburg",
  };
  const descByLang = {
    de: "Entdecken Sie das aktuelle Roster von Noir Hamburg — sorgfältig ausgewählte Persönlichkeiten für anspruchsvolle Begleitung in Hamburg und Umland.",
    en: "Discover the current Noir Hamburg roster — carefully selected personalities for discerning companionship in Hamburg and the surrounding region.",
  };
  const h1ByLang = { de: "Unsere Models", en: "Our Companions" };
  const leadByLang = {
    de: "Eine sorgfältig kuratierte Auswahl an Persönlichkeiten – jede mit eigener Geschichte, Bildung und unverkennbarem Stil.",
    en: "A carefully curated selection of personalities — each with her own story, education and unmistakable style.",
  };

  const body = `
<main id="main" style="padding:2rem;">
${renderBreadcrumbs([{ label: t("crumb.models", lang) }], lang)}
<h1>${esc(h1ByLang[lang])}</h1>
<p>${esc(leadByLang[lang])}</p>
${englishComingSoonBanner(lang)}
<ul>
${models.map((m) => `<li><a href="${navTo(`/models/${m.slug}`, lang)}"><strong>${esc(m.name)}</strong>, ${m.age} ${esc(t("model.years", lang))}, ${m.height_cm || ""}cm — ${esc(m.short_tagline || "")}</a><br/>${esc(t("model.languages", lang))}: ${(m.languages || []).map(esc).join(", ")}<br/>${esc(t("model.availableIn", lang))}: ${(m.locations || []).map(esc).join(", ")}</li>`).join("")}
</ul>
</main>`;
  return renderShell({
    ...buildAssets,
    lang,
    title: titleByLang[lang] || titleByLang.de,
    description: descByLang[lang] || descByLang.de,
    canonicalPath: "/models",
    jsonLd: [
      breadcrumbSchema([{ label: t("crumb.models", lang) }], lang),
      models.length
        ? {
            "@context": "https://schema.org",
            "@type": "ItemList",
            itemListElement: models.slice(0, 30).map((m, i) => ({
              "@type": "ListItem",
              position: i + 1,
              url: `${SITE_ORIGIN}${navTo(`/models/${m.slug}`, lang)}`,
              name: m.name,
              image: m.cover_image,
            })),
          }
        : null,
    ],
    bodyContent: body,
  });
}

async function renderModelDetail(slug, buildAssets, lang = "de") {
  let m;
  try { m = await backendJSON(`/api/models/${slug}`); } catch (e) { return null; }
  const relServices = SERVICES.filter((s) => (m.services || []).includes(s.slug));
  const relLocs = LOCATIONS.filter((l) => (m.locations || []).includes(l.slug));

  const titleByLang = {
    de: `${m.name} — Escort Hamburg | Noir Hamburg`,
    en: `${m.name} — Escort Hamburg | Noir Hamburg`,
  };
  const descByLang = {
    de: `${m.name}, ${m.age} Jahre – ${m.short_tagline || "Premium Begleitung in Hamburg"}. Diskret, gebildet, hanseatisch elegant.`,
    en: `${m.name}, ${m.age} years old — ${m.short_tagline || "premium companionship in Hamburg"}. Discreet, well-educated, hanseatic elegance.`,
  };

  const body = `
<main id="main" style="padding:2rem;">
${renderBreadcrumbs([{ label: t("crumb.models", lang), to: "/models" }, { label: m.name }], lang)}
${englishComingSoonBanner(lang)}
<article>
<h1>${esc(m.name)}</h1>
<p><strong>${esc(m.short_tagline || "")}</strong></p>
${m.cover_image ? `<img src="${escAttr(m.cover_image)}" alt="${escAttr(m.name)} — Escort Hamburg" width="600" loading="eager"/>` : ""}
<dl>
<dt>${esc(lang === "en" ? "Age" : "Alter")}</dt><dd>${m.age} ${esc(t("model.years", lang))}</dd>
<dt>${esc(t("model.height", lang))}</dt><dd>${m.height_cm || "–"} cm</dd>
<dt>${esc(t("model.nationality", lang))}</dt><dd>${esc(m.nationality || "")}</dd>
<dt>${esc(t("model.languages", lang))}</dt><dd>${(m.languages || []).map(esc).join(", ")}</dd>
<dt>${esc(t("model.hairEyes", lang))}</dt><dd>${esc(m.hair_color || "")} / ${esc(m.eye_color || "")}</dd>
</dl>
<h2>${esc(t("sec.aboutPerson", lang, { name: m.name }))}</h2>
<p>${esc(m.bio)}</p>
<h2>${esc(t("sec.services", lang))}</h2>
<ul>${relServices.map((s) => `<li><a href="${navTo(`/services/${s.slug}`, lang)}">${esc(s.title)}</a></li>`).join("")}</ul>
<h2>${esc(t("sec.availableIn", lang))}</h2>
<ul>${relLocs.map((l) => `<li><a href="${navTo(`/escort/${l.slug}`, lang)}">Escort ${esc(l.name)}</a></li>`).join("")}</ul>
<p><a href="${navTo("/kontakt", lang)}?model=${escAttr(m.slug)}">${esc(t("cta.bookModel", lang, { name: m.name }))}</a></p>
</article>
</main>`;
  return renderShell({
    ...buildAssets,
    lang,
    title: titleByLang[lang] || titleByLang.de,
    description: descByLang[lang] || descByLang.de,
    canonicalPath: `/models/${m.slug}`,
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
      breadcrumbSchema([{ label: t("crumb.models", lang), to: "/models" }, { label: m.name }], lang),
    ],
    bodyContent: body,
  });
}

module.exports = { renderModels, renderModelDetail };
