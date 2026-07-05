/**
 * Areas list (/areas), Area detail (/escort/:slug), /escort-hamburg umbrella.
 */
const { SERVICES, LOCATIONS } = require("../../src/data/site");
const { AREA_CONTENT, GENERIC_AREA_FAQS } = require("../../src/data/areaContent");
const {
  esc,
  escAttr,
  navTo,
  renderShell,
  renderBreadcrumbs,
  breadcrumbSchema,
  englishComingSoonBanner,
  t,
} = require("../shell");
const { backendJSON } = require("../backend");

function renderAreasList(buildAssets, lang = "de") {
  const titleByLang = {
    de: "Hamburg Areas — Premium Escort in der ganzen Metropolregion | Noir Hamburg",
    en: "Hamburg Areas — Premium Escort across the Metropolitan Region | Noir Hamburg",
  };
  const descByLang = {
    de: "Premium Escort in Hamburg und Umland: HafenCity, Blankenese, Harvestehude, Eppendorf, Altona und weitere Stadtteile.",
    en: "Premium escort in Hamburg and the surrounding region: HafenCity, Blankenese, Harvestehude, Eppendorf, Altona and further districts.",
  };
  const leadByLang = {
    de: "Wir begleiten Sie in der gesamten Metropolregion Hamburg.",
    en: "We accompany you throughout the entire Hamburg metropolitan region.",
  };

  const body = `
<main id="main" style="padding:2rem;">
${renderBreadcrumbs([{ label: t("crumb.areas", lang) }], lang)}
<h1>Hamburg Areas</h1>
<p>${esc(leadByLang[lang])}</p>
${LOCATIONS.map((l) => `
<article><h2><a href="${navTo(`/escort/${l.slug}`, lang)}">${esc(l.title)}</a></h2>
<p>${esc(lang === "en" ? l.introEn : l.intro)}</p></article>`).join("")}
</main>`;
  return renderShell({
    ...buildAssets,
    lang,
    title: titleByLang[lang] || titleByLang.de,
    description: descByLang[lang] || descByLang.de,
    canonicalPath: "/areas",
    jsonLd: [breadcrumbSchema([{ label: t("crumb.areas", lang) }], lang)],
    bodyContent: body,
  });
}

async function renderAreaDetail(slug, buildAssets, lang = "de") {
  const l = LOCATIONS.find((x) => x.slug === slug);
  if (!l) return null;
  const nearby = LOCATIONS.filter((x) => x.slug !== l.slug).slice(0, 6);
  const intro = lang === "en" ? l.introEn : l.intro;
  const description = lang === "en" ? l.descriptionEn : l.description;
  const isEn = lang === "en";
  const extra = AREA_CONTENT[slug] || { bodyExtra: [], bodyExtraEn: [] };
  const bodyExtra = isEn ? (extra.bodyExtraEn || []) : (extra.bodyExtra || []);

  // Fetch a few featured models — internal-linking block.
  let models = [];
  try { models = (await backendJSON("/api/models")).slice(0, 4); } catch (e) { /* noop */ }

  // Compose per-area FAQ from generic templates + area-specific extras.
  const areaFaqs = (extra.faqs || GENERIC_AREA_FAQS).map((f) => ({
    q: (isEn ? f.qEn : f.q).replace(/\{name\}/g, l.name),
    a: (isEn ? f.aEn : f.a).replace(/\{name\}/g, l.name),
  }));

  const titleByLang = {
    de: `${l.title} — Premium Begleitung in ${l.name} | Noir Hamburg`,
    en: `${l.title} — Premium Companionship in ${l.name} | Noir Hamburg`,
  };
  const descByLang = {
    de: `${l.title}: ${l.intro} Diskrete Begleitung in ${l.name} – exklusiv vermittelt durch Noir Hamburg.`,
    en: `${l.title}: ${l.introEn} Discreet companionship in ${l.name} — exclusively arranged by Noir Hamburg.`,
  };

  const body = `
<main id="main" style="padding:2rem;">
${renderBreadcrumbs([{ label: t("crumb.areas", lang), to: "/areas" }, { label: l.name }], lang)}
<article>
<h1>${esc(l.title)}</h1>
<p><em>${esc(intro)}</em></p>
${l.image ? `<img src="${escAttr(l.image)}" alt="${escAttr(l.title)} — ${esc(isEn ? "Noir Hamburg premium escort" : "Noir Hamburg Premium Begleitung")}" width="800" loading="eager"/>` : ""}
<p>${esc(description)}</p>
${bodyExtra.map((p) => `<p>${esc(p)}</p>`).join("")}
${(l.landmarks || []).length > 0 ? `<h2>${esc(t("sec.popularAddresses", lang))}</h2><ul>${l.landmarks.map((lm) => `<li>${esc(lm)}</li>`).join("")}</ul>` : ""}
<h2>${esc(t("sec.popularServices", lang))}</h2>
<ul>${SERVICES.slice(0, 5).map((s) => `<li><a href="${navTo(`/services/${s.slug}`, lang)}"><strong>${esc(s.title)}</strong> — ${esc(isEn ? s.descriptionEn : s.description)}</a></li>`).join("")}</ul>
${models.length ? `<h2>${esc(isEn ? "Our companions" : "Unsere Damen")}</h2><ul>${models.map((m) => `<li><a href="${navTo(`/models/${m.slug}`, lang)}"><strong>${esc(m.name)}</strong>, ${m.age} ${esc(t("model.years", lang))} — ${esc(m.short_tagline || "")}</a></li>`).join("")}</ul>` : ""}
<h2>${esc(t("sec.nearby", lang))}</h2>
<ul>${nearby.map((n) => `<li><a href="${navTo(`/escort/${n.slug}`, lang)}">Escort ${esc(n.name)}</a></li>`).join("")}</ul>
${areaFaqs.length ? `<h2>${esc(isEn ? `FAQ — Escort in ${l.name}` : `Häufige Fragen — Escort in ${l.name}`)}</h2>${areaFaqs.map((f) => `<details><summary><strong>${esc(f.q)}</strong></summary><p>${esc(f.a)}</p></details>`).join("")}` : ""}
<p><a href="${navTo("/kontakt", lang)}">${esc(t("cta.bookInArea", lang, { name: l.name }))}</a></p>
</article>
</main>`;
  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "Place",
      name: `Escort ${l.name}`,
      description: description,
      address: { "@type": "PostalAddress", addressLocality: l.name, addressCountry: "DE" },
    },
    breadcrumbSchema([{ label: t("crumb.areas", lang), to: "/areas" }, { label: l.name }], lang),
  ];
  if (areaFaqs.length) {
    jsonLd.push({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: areaFaqs.map((f) => ({
        "@type": "Question",
        name: f.q,
        acceptedAnswer: { "@type": "Answer", text: f.a },
      })),
    });
  }
  return renderShell({
    ...buildAssets,
    lang,
    title: titleByLang[lang] || titleByLang.de,
    description: descByLang[lang] || descByLang.de,
    canonicalPath: `/escort/${l.slug}`,
    ogImage: l.image,
    jsonLd,
    bodyContent: body,
  });
}

function renderEscortHamburg(buildAssets, lang = "de") {
  const titleByLang = {
    de: "Escort Hamburg — Premium Begleitagentur | Noir Hamburg",
    en: "Escort Hamburg — Premium Companion Agency | Noir Hamburg",
  };
  const descByLang = {
    de: "Escort Hamburg auf höchstem Niveau: Diskret, gebildet, hanseatisch elegant. Sorgfältig ausgewählte Models für anspruchsvolle Herren in Hamburg und Umland.",
    en: "Escort Hamburg at the highest level: discreet, well-educated, hanseatic elegance. Carefully selected companions for discerning gentlemen in Hamburg and surroundings.",
  };
  const introByLang = {
    de: "Hamburg ist eine Stadt der feinen Kontraste: maritime Weltläufigkeit und hanseatische Zurückhaltung, Reichtum ohne Pomp, Kultur ohne Eile. Wer hier um Begleitung bittet, sucht keine Bühne – er sucht eine Persönlichkeit.",
    en: "Hamburg is a city of fine contrasts: maritime worldliness and hanseatic restraint, wealth without ostentation, culture without haste. Those who seek companionship here are not looking for a stage — they are looking for a personality.",
  };

  const body = `
<main id="main" style="padding:2rem;">
${renderBreadcrumbs([{ label: t("crumb.escortHamburg", lang) }], lang)}
<h1>Escort Hamburg</h1>
<p>${esc(introByLang[lang])}</p>
<h2>${esc(t("sec.whatWeOffer", lang))}</h2>
<ul>${SERVICES.map((s) => `<li><a href="${navTo(`/services/${s.slug}`, lang)}"><strong>${esc(s.title)}</strong> — ${esc(lang === "en" ? s.descriptionEn : s.description)}</a></li>`).join("")}</ul>
<h2>${esc(t("sec.hamburgRegion", lang))}</h2>
<ul>${LOCATIONS.map((l) => `<li><a href="${navTo(`/escort/${l.slug}`, lang)}">Escort ${esc(l.name)}</a></li>`).join("")}</ul>
<p><a href="${navTo("/models", lang)}">${esc(t("cta.discoverModels", lang))}</a> · <a href="${navTo("/kontakt", lang)}">${esc(t("cta.sendRequest", lang))}</a></p>
</main>`;
  return renderShell({
    ...buildAssets,
    lang,
    title: titleByLang[lang] || titleByLang.de,
    description: descByLang[lang] || descByLang.de,
    canonicalPath: "/escort-hamburg",
    jsonLd: [breadcrumbSchema([{ label: t("crumb.escortHamburg", lang) }], lang)],
    bodyContent: body,
  });
}

module.exports = { renderAreasList, renderAreaDetail, renderEscortHamburg };
