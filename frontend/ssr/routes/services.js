/**
 * Services list + detail SSR renderers (data-driven from src/data/site).
 *
 * Detail pages pull extended editorial content and per-service FAQs from
 * src/data/serviceContent.js and merge related-services/related-models
 * link blocks for internal-linking authority.
 */
const { SERVICES, LOCATIONS } = require("../../src/data/site");
const { SERVICE_CONTENT, RELATED_SERVICES } = require("../../src/data/serviceContent");
const {
  esc,
  escAttr,
  navTo,
  renderShell,
  renderBreadcrumbs,
  breadcrumbSchema,
  t,
} = require("../shell");
const { getSettings } = require("../settings");
const { backendJSON } = require("../backend");

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

async function renderServiceDetail(slug, buildAssets, lang = "de") {
  const s = SERVICES.find((x) => x.slug === slug);
  if (!s) return null;
  const svcImg = (getSettings().service_images || {})[slug] || s.image;

  const isEn = lang === "en";
  const tagline = isEn ? s.taglineEn : s.tagline;
  const longCopy = isEn ? s.longCopyEn : s.longCopy;
  const keypoints = isEn ? s.keypointsEn : s.keypoints;
  const metaTitle = isEn ? s.metaTitleEn : s.metaTitle;
  const metaDescription = isEn ? s.metaDescriptionEn : s.metaDescription;

  const extra = SERVICE_CONTENT[slug] || { sections: [], faqs: [] };
  const relatedSlugs = RELATED_SERVICES[slug] || [];
  const relatedServices = relatedSlugs
    .map((sl) => SERVICES.find((x) => x.slug === sl))
    .filter(Boolean);

  // Featured/first models — internal linking block.
  let models = [];
  try { models = (await backendJSON("/api/models")).slice(0, 4); } catch (e) { /* noop */ }

  const sectionsHtml = extra.sections.map((sec) => `
<section>
<h2>${esc(isEn ? sec.h2En : sec.h2)}</h2>
${(isEn ? sec.bodyEn : sec.body).map((p) => `<p>${esc(p)}</p>`).join("")}
</section>`).join("");

  const faqsHtml = extra.faqs.length ? `
<section>
<h2>${esc(isEn ? `FAQ — ${s.title}` : `Häufige Fragen zu ${s.title}`)}</h2>
${extra.faqs.map((f) => `<details><summary><strong>${esc(isEn ? f.qEn : f.q)}</strong></summary><p>${esc(isEn ? f.aEn : f.a)}</p></details>`).join("")}
</section>` : "";

  const relatedServicesHtml = relatedServices.length ? `
<section>
<h2>${esc(isEn ? "Related services" : "Verwandte Services")}</h2>
<ul>${relatedServices.map((r) => `<li><a href="${navTo(`/services/${r.slug}`, lang)}"><strong>${esc(r.title)}</strong> — ${esc(isEn ? r.descriptionEn : r.description)}</a></li>`).join("")}</ul>
</section>` : "";

  const modelsHtml = models.length ? `
<section>
<h2>${esc(isEn ? "Available companions" : "Verfügbare Damen")}</h2>
<ul>${models.map((m) => `<li><a href="${navTo(`/models/${m.slug}`, lang)}"><strong>${esc(m.name)}</strong>, ${m.age} ${esc(t("model.years", lang))} — ${esc(m.short_tagline || "")}</a></li>`).join("")}</ul>
<p><a href="${navTo("/models", lang)}">${esc(t("cta.allModels", lang))}</a></p>
</section>` : "";

  const areasHtml = `
<section>
<h2>${esc(isEn ? `${s.shortLabel} in Hamburg — service areas` : `${s.shortLabel} in Hamburg — Servicegebiete`)}</h2>
<ul>${LOCATIONS.slice(0, 12).map((l) => `<li><a href="${navTo(`/escort/${l.slug}`, lang)}">${esc(s.shortLabel)} ${esc(l.name)}</a></li>`).join("")}</ul>
</section>`;

  const body = `
<main id="main" style="padding:2rem;">
${renderBreadcrumbs([{ label: t("crumb.services", lang), to: "/services" }, { label: s.title }], lang)}
<article>
<h1>${esc(s.h1)}</h1>
<p><em>${esc(tagline)}</em></p>
${svcImg ? `<img src="${escAttr(svcImg)}" alt="${escAttr(s.title)} — ${esc(isEn ? "Noir Hamburg premium escort service" : "Noir Hamburg Premium Escort Service")}" width="800" loading="eager"/>` : ""}
<p>${esc(longCopy)}</p>
${sectionsHtml}
<section>
<h2>${esc(t("sec.characteristics", lang))}</h2>
<ul>${keypoints.map((k) => `<li>${esc(k)}</li>`).join("")}</ul>
</section>
${faqsHtml}
${relatedServicesHtml}
${modelsHtml}
${areasHtml}
<p><a href="${navTo("/kontakt", lang)}">${esc(t("cta.bookNow", lang))}</a> · <a href="${navTo("/models", lang)}">${esc(t("cta.discoverModels", lang))}</a></p>
</article>
</main>`;

  const jsonLd = [
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
  ];
  if (extra.faqs.length) {
    jsonLd.push({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: extra.faqs.map((f) => ({
        "@type": "Question",
        name: isEn ? f.qEn : f.q,
        acceptedAnswer: { "@type": "Answer", text: isEn ? f.aEn : f.a },
      })),
    });
  }

  return renderShell({
    ...buildAssets,
    lang,
    title: metaTitle,
    description: metaDescription,
    canonicalPath: `/services/${s.slug}`,
    ogImage: svcImg,
    jsonLd,
    bodyContent: body,
  });
}

module.exports = { renderServicesList, renderServiceDetail };
