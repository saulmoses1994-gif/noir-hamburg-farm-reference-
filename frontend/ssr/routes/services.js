/**
 * Services list + detail SSR renderers.
 *
 * Content is read from the SEO CMS cache (ssr/content.js), which reflects the
 * MongoDB `service_content` collection with a bundled fallback. Admin edits
 * flow to public HTML on the next SSG build.
 */
const { LOCATIONS, SERVICES } = require("../../src/data/site");
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
const { getServiceContent, getAllServiceContent } = require("../content");
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
  const isEn = lang === "en";
  const services = getAllServiceContent();

  const body = `
<main id="main" style="padding:2rem;">
${renderBreadcrumbs([{ label: t("crumb.services", lang) }], lang)}
<h1>${esc(h1ByLang[lang])}</h1>
<p>${esc(leadByLang[lang])}</p>
${services.map((s) => `
<article><h2><a href="${navTo(`/services/${s.slug}`, lang)}">${esc(s.title)}</a></h2>
<p><em>${esc(isEn ? (s.tagline_en || s.tagline) : s.tagline)}</em></p>
<p>${esc(isEn ? (s.description_en || s.description) : s.description)}</p>
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
  const s = getServiceContent(slug);
  if (!s) return null;
  const svcImg = (getSettings().service_images || {})[slug] || s.image;

  const isEn = lang === "en";
  const tagline = isEn ? (s.tagline_en || s.tagline) : s.tagline;
  const longCopy = isEn ? (s.long_copy_en || s.long_copy) : s.long_copy;
  const keypoints = isEn ? (s.keypoints_en && s.keypoints_en.length ? s.keypoints_en : s.keypoints) : s.keypoints;
  const metaTitle = isEn ? (s.meta_title_en || s.meta_title) : s.meta_title;
  const metaDescription = isEn ? (s.meta_description_en || s.meta_description) : s.meta_description;
  const altText = isEn ? (s.image_alt_en || s.image_alt) : s.image_alt;
  const defaultAlt = isEn ? "Noir Hamburg premium escort service" : "Noir Hamburg Premium Escort Service";
  const relatedServices = (s.related_services || [])
    .map((sl) => getServiceContent(sl))
    .filter(Boolean);

  // Featured/first models — internal linking block.
  let models = [];
  try { models = (await backendJSON("/api/models")).slice(0, 4); } catch (e) { /* noop */ }

  const sectionsHtml = (s.sections || []).map((sec) => `
<section>
<h2>${esc(isEn ? (sec.h2_en || sec.h2) : sec.h2)}</h2>
${((isEn ? (sec.body_en && sec.body_en.length ? sec.body_en : sec.body) : sec.body) || []).map((p) => `<p>${esc(p)}</p>`).join("")}
</section>`).join("");

  const faqsHtml = (s.faqs || []).length ? `
<section>
<h2>${esc(isEn ? `FAQ — ${s.title}` : `Häufige Fragen zu ${s.title}`)}</h2>
${s.faqs.map((f) => `<details><summary><strong>${esc(isEn ? (f.q_en || f.q) : f.q)}</strong></summary><p>${esc(isEn ? (f.a_en || f.a) : f.a)}</p></details>`).join("")}
</section>` : "";

  const relatedServicesHtml = relatedServices.length ? `
<section>
<h2>${esc(isEn ? "Related services" : "Verwandte Services")}</h2>
<ul>${relatedServices.map((r) => `<li><a href="${navTo(`/services/${r.slug}`, lang)}"><strong>${esc(r.title)}</strong> — ${esc(isEn ? (r.description_en || r.description) : r.description)}</a></li>`).join("")}</ul>
</section>` : "";

  const modelsHtml = models.length ? `
<section>
<h2>${esc(isEn ? "Available companions" : "Verfügbare Damen")}</h2>
<ul>${models.map((m) => `<li><a href="${navTo(`/models/${m.slug}`, lang)}"><strong>${esc(m.name)}</strong>, ${m.age} ${esc(t("model.years", lang))} — ${esc(m.short_tagline || "")}</a></li>`).join("")}</ul>
<p><a href="${navTo("/models", lang)}">${esc(t("cta.allModels", lang))}</a></p>
</section>` : "";

  const areasHtml = `
<section>
<h2>${esc(isEn ? `${s.short_label} in Hamburg — service areas` : `${s.short_label} in Hamburg — Servicegebiete`)}</h2>
<ul>${LOCATIONS.slice(0, 12).map((l) => `<li><a href="${navTo(`/escort/${l.slug}`, lang)}">${esc(s.short_label)} ${esc(l.name)}</a></li>`).join("")}</ul>
</section>`;

  const body = `
<main id="main" style="padding:2rem;">
${renderBreadcrumbs([{ label: t("crumb.services", lang), to: "/services" }, { label: s.title }], lang)}
<article>
<h1>${esc(s.h1)}</h1>
<p><em>${esc(tagline)}</em></p>
${svcImg ? `<img src="${escAttr(svcImg)}" alt="${escAttr(altText || `${s.title} — ${defaultAlt}`)}" width="800" loading="eager"/>` : ""}
<p>${esc(longCopy)}</p>
${sectionsHtml}
<section>
<h2>${esc(t("sec.characteristics", lang))}</h2>
<ul>${(keypoints || []).map((k) => `<li>${esc(k)}</li>`).join("")}</ul>
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
      provider: {
        "@type": "LocalBusiness",
        name: "Noir Hamburg",
        areaServed: "Hamburg",
        address: {
          "@type": "PostalAddress",
          streetAddress: "Pinneberger Chaussee 50",
          addressLocality: "Hamburg",
          postalCode: "22523",
          addressCountry: "DE",
        },
        telephone: "+49 177 9681205",
        email: "support@noir-hamburg.com",
        url: "https://noir-hamburg.com",
      },
      areaServed: { "@type": "City", name: "Hamburg" },
      serviceType: s.short_label,
    },
    breadcrumbSchema([{ label: t("crumb.services", lang), to: "/services" }, { label: s.title }], lang),
  ];
  if ((s.faqs || []).length) {
    jsonLd.push({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: s.faqs.map((f) => ({
        "@type": "Question",
        name: isEn ? (f.q_en || f.q) : f.q,
        acceptedAnswer: { "@type": "Answer", text: isEn ? (f.a_en || f.a) : f.a },
      })),
    });
  }

  return renderShell({
    ...buildAssets,
    lang,
    title: metaTitle || `${s.title} | Noir Hamburg`,
    description: metaDescription || (isEn ? s.description_en : s.description),
    canonicalPath: `/services/${s.slug}`,
    ogImage: svcImg,
    jsonLd,
    bodyContent: body,
  });
}

module.exports = { renderServicesList, renderServiceDetail };
