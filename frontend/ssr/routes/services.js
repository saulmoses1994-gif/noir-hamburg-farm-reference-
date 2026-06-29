/**
 * Services list + detail SSR renderers (data-driven from src/data/site).
 */
const { SERVICES, LOCATIONS } = require("../../src/data/site");
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

function renderServicesList(buildAssets, lang = "de") {
  const titleByLang = {
    de: "Escort Services Hamburg — Premium Begleitung | Noir Hamburg",
    en: "Escort Services Hamburg — Premium Companionship | Noir Hamburg",
  };
  const descByLang = {
    de: "Acht sorgfältig definierte Servicearten von Noir Hamburg: Luxury, VIP, Business, Dinner, Hotel, Event, Travel und Girlfriend Experience.",
    en: "Eight carefully defined service categories from Noir Hamburg: Luxury, VIP, Business, Dinner, Hotel, Event, Travel and Girlfriend Experience.",
  };
  const h1ByLang = { de: "Escort Services Hamburg", en: "Escort Services Hamburg" };
  const leadByLang = {
    de: "Acht sorgfältig definierte Begleitarten – damit jede Begegnung ihren angemessenen Rahmen findet.",
    en: "Eight carefully defined companion categories — so every encounter finds its proper setting.",
  };

  const body = `
<main id="main" style="padding:2rem;">
${renderBreadcrumbs([{ label: t("crumb.services", lang) }], lang)}
<h1>${esc(h1ByLang[lang])}</h1>
<p>${esc(leadByLang[lang])}</p>
${SERVICES.map((s) => `
<article><h2><a href="${navTo(`/services/${s.slug}`, lang)}">${esc(s.title)}</a></h2>
<p><em>${esc(lang === "en" ? s.taglineEn : s.tagline)}</em></p>
<p>${esc(lang === "en" ? s.descriptionEn : s.description)}</p>
<p><a href="${navTo(`/services/${s.slug}`, lang)}">${esc(t("cta.viewDetails", lang))}</a></p></article>`).join("")}
</main>`;
  return renderShell({
    ...buildAssets,
    lang,
    title: titleByLang[lang] || titleByLang.de,
    description: descByLang[lang] || descByLang.de,
    canonicalPath: "/services",
    jsonLd: [breadcrumbSchema([{ label: t("crumb.services", lang) }], lang)],
    bodyContent: body,
  });
}

function renderServiceDetail(slug, buildAssets, lang = "de") {
  const s = SERVICES.find((x) => x.slug === slug);
  if (!s) return null;
  const tagline = lang === "en" ? s.taglineEn : s.tagline;
  const longCopy = lang === "en" ? s.longCopyEn : s.longCopy;
  const keypoints = lang === "en" ? s.keypointsEn : s.keypoints;
  const metaTitle = lang === "en" ? s.metaTitleEn : s.metaTitle;
  const metaDescription = lang === "en" ? s.metaDescriptionEn : s.metaDescription;
  const body = `
<main id="main" style="padding:2rem;">
${renderBreadcrumbs([{ label: t("crumb.services", lang), to: "/services" }, { label: s.title }], lang)}
<article>
<h1>${esc(s.h1)}</h1>
<p><em>${esc(tagline)}</em></p>
${s.image ? `<img src="${escAttr(s.image)}" alt="${escAttr(s.title)}" width="800" loading="eager"/>` : ""}
<p>${esc(longCopy)}</p>
<h2>${esc(t("sec.characteristics", lang))}</h2>
<ul>${keypoints.map((k) => `<li>${esc(k)}</li>`).join("")}</ul>
<h2>${esc(t("sec.availableIn", lang))}</h2>
<ul>${LOCATIONS.slice(0, 10).map((l) => `<li><a href="${navTo(`/escort/${l.slug}`, lang)}">Escort ${esc(l.name)}</a></li>`).join("")}</ul>
<p><a href="${navTo("/kontakt", lang)}">${esc(t("cta.bookNow", lang))}</a> · <a href="${navTo("/models", lang)}">${esc(t("cta.discoverModels", lang))}</a></p>
</article>
</main>`;
  return renderShell({
    ...buildAssets,
    lang,
    title: metaTitle,
    description: metaDescription,
    canonicalPath: `/services/${s.slug}`,
    ogImage: s.image,
    jsonLd: [
      {
        "@context": "https://schema.org",
        "@type": "Service",
        name: s.title,
        description: metaDescription,
        provider: { "@type": "LocalBusiness", name: "Noir Hamburg", areaServed: "Hamburg" },
        areaServed: { "@type": "City", name: "Hamburg" },
        serviceType: s.shortLabel,
      },
      breadcrumbSchema([{ label: t("crumb.services", lang), to: "/services" }, { label: s.title }], lang),
    ],
    bodyContent: body,
  });
}

module.exports = { renderServicesList, renderServiceDetail };
