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
<ul>
${models.map((m) => {
  const cheapest = (m.prices || []).length > 0 ? Math.min(...m.prices.map((p) => p.amount)) : null;
  const currency = (m.prices || [])[0]?.currency || "EUR";
  const priceLine = cheapest != null
    ? `<br/><strong>${lang === "en" ? "From" : "Ab"} ${cheapest.toLocaleString(lang === "en" ? "en-GB" : "de-DE")} ${esc(currency)}</strong>`
    : "";
  return `<li><a href="${navTo(`/models/${m.slug}`, lang)}"><strong>${esc(m.name)}</strong>, ${m.age} ${esc(t("model.years", lang))}, ${m.height_cm || ""}cm — ${esc(m.short_tagline || "")}</a><br/>${esc(t("model.languages", lang))}: ${(m.languages || []).map(esc).join(", ")}<br/>${esc(t("model.availableIn", lang))}: ${(m.locations || []).map(esc).join(", ")}${priceLine}</li>`;
}).join("")}
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

  // EN fields fall back to the German originals when missing. We only show the
  // inline "translation pending" notice when EN was requested AND the admin
  // has not yet supplied an English bio for this record.
  const isEn = lang === "en";
  const bio = isEn && m.bio_en ? m.bio_en : m.bio;
  const shortTagline = isEn && m.short_tagline_en ? m.short_tagline_en : (m.short_tagline || "");
  const enFallback = isEn && !m.bio_en;

  const titleByLang = {
    de: m.meta_title || `${m.name} — Escort Hamburg | Noir Hamburg`,
    en: m.meta_title_en || m.meta_title || `${m.name} — Escort Hamburg | Noir Hamburg`,
  };
  const descByLang = {
    de: m.meta_description || `${m.name}, ${m.age} Jahre – ${m.short_tagline || "Premium Begleitung in Hamburg"}. Diskret, gebildet, hanseatisch elegant.`,
    en: m.meta_description_en || m.meta_description || `${m.name}, ${m.age} years old — ${shortTagline || "premium companionship in Hamburg"}. Discreet, well-educated, hanseatic elegance.`,
  };

  const body = `
<main id="main" style="padding:2rem;">
${renderBreadcrumbs([{ label: t("crumb.models", lang), to: "/models" }, { label: m.name }], lang)}
${enFallback ? englishComingSoonBanner(lang) : ""}
<article>
<h1>${esc(m.name)}</h1>
<p><strong>${esc(shortTagline)}</strong></p>
${m.cover_image ? `<img src="${escAttr(m.cover_image)}" alt="${escAttr(m.name)} — Escort Hamburg" width="600" loading="eager"/>` : ""}
<dl>
<dt>${esc(lang === "en" ? "Age" : "Alter")}</dt><dd>${m.age} ${esc(t("model.years", lang))}</dd>
<dt>${esc(t("model.height", lang))}</dt><dd>${m.height_cm || "–"} cm</dd>
<dt>${esc(t("model.nationality", lang))}</dt><dd>${esc(m.nationality || "")}</dd>
<dt>${esc(t("model.languages", lang))}</dt><dd>${(m.languages || []).map(esc).join(", ")}</dd>
<dt>${esc(t("model.hairEyes", lang))}</dt><dd>${esc(m.hair_color || "")} / ${esc(m.eye_color || "")}</dd>
${(isEn ? m.availability_en : m.availability) ? `<dt>${esc(isEn ? "Availability" : "Verfügbarkeit")}</dt><dd>${esc(isEn ? m.availability_en : m.availability)}</dd>` : ""}
</dl>
<h2>${esc(t("sec.aboutPerson", lang, { name: m.name }))}</h2>
<p>${esc(bio)}</p>
${(isEn ? m.personality_en : m.personality) ? `<h2>${esc(isEn ? "Personality" : "Persönlichkeit")}</h2><p>${esc(isEn ? m.personality_en : m.personality)}</p>` : ""}
${(m.interests || []).length ? `<h2>${esc(isEn ? "Interests" : "Interessen")}</h2><ul>${m.interests.map((i) => `<li>${esc(i)}</li>`).join("")}</ul>` : ""}
${(m.prices || []).length > 0 ? `
<h2>${esc(lang === "en" ? "Rates" : "Tarife")}</h2>
<dl>${m.prices.map((p) => {
  const unitKey = `price.unit.${p.unit || "hour"}`;
  const unitText = t(unitKey, lang);
  return `<dt>${esc(p.label)}</dt><dd><strong>${Number(p.amount).toLocaleString(lang === "en" ? "en-GB" : "de-DE")} ${esc(p.currency || "EUR")}</strong>${unitText ? ` <span>${esc(unitText)}</span>` : ""}</dd>`;
}).join("")}</dl>
<p><em>${esc(lang === "en" ? "Travel expenses and additional services on request." : "Reisekosten und Zusatzleistungen auf Anfrage.")}</em></p>
` : ""}
<h2>${esc(t("sec.services", lang))}</h2>
<ul>${relServices.map((s) => `<li><a href="${navTo(`/services/${s.slug}`, lang)}">${esc(s.title)}</a></li>`).join("")}</ul>
<h2>${esc(t("sec.availableIn", lang))}</h2>
<ul>${relLocs.map((l) => `<li><a href="${navTo(`/escort/${l.slug}`, lang)}">Escort ${esc(l.name)}</a></li>`).join("")}</ul>

<h2>${esc(lang === "en" ? `Frequently asked questions about ${m.name}` : `Häufig gestellte Fragen zu ${m.name}`)}</h2>
${(() => {
  const langs = (m.languages || []).slice(0, 3).join(", ");
  const cities = (m.locations || []).slice(0, 3)
    .map((s) => s.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())).join(", ");
  const svs = relServices.slice(0, 3).map((sv) => sv.title).join(", ");
  const cheapest = (m.prices || []).length > 0 ? Math.min(...m.prices.map((p) => p.amount)) : null;
  const cur = (m.prices || [])[0]?.currency || "EUR";
  const faqs = lang === "en" ? [
    { q: `Where can I meet ${m.name} in Hamburg?`,
      a: `${m.name} is available for bookings ${cities ? `across ${cities} ` : ""}and, on request, throughout the greater Hamburg metropolitan area. Outcall to your hotel, private residence or event location is standard.` },
    { q: `What languages does ${m.name} speak?`,
      a: `${m.name} speaks ${langs || "German and English"} fluently — an important detail if your evening involves international guests or a business setting.` },
    { q: `Which occasions is ${m.name} best suited for?`,
      a: `${m.name} is especially recommended for ${svs || "dinner engagements, business receptions and cultural events"}. She moves with equal ease through gala evenings, private dinners and multi-day travel.` },
    { q: `How do I book ${m.name}?`,
      a: `Send a discreet enquiry via our contact form or WhatsApp with your preferred date, duration and occasion. ${cheapest ? `Rates start at ${cheapest.toLocaleString("en-GB")} ${cur} for a single hour, ` : ""}with tiered packages for longer engagements. Confirmation is usually within a few hours.` },
  ] : [
    { q: `Wo kann ich ${m.name} in Hamburg treffen?`,
      a: `${m.name} ist ${cities ? `in ${cities} ` : ""}und auf Anfrage in der gesamten Metropolregion Hamburg buchbar. Outcall zu Ihrem Hotel, Ihrem privaten Rahmen oder Ihrem Event ist selbstverständlich.` },
    { q: `Welche Sprachen spricht ${m.name}?`,
      a: `${m.name} spricht ${langs || "Deutsch und Englisch"} fließend — wichtig, wenn Ihr Abend internationale Gäste oder einen geschäftlichen Rahmen einbezieht.` },
    { q: `Für welche Anlässe eignet sich ${m.name} besonders?`,
      a: `${m.name} empfehlen wir vor allem für ${svs || "Dinner-Verabredungen, Geschäftsempfänge und kulturelle Ereignisse"}. Sie bewegt sich mit gleicher Selbstverständlichkeit auf Gala-Abenden, in privaten Dinner-Runden und auf mehrtägigen Reisen.` },
    { q: `Wie buche ich ${m.name}?`,
      a: `Senden Sie eine diskrete Anfrage über unser Kontaktformular oder per WhatsApp mit Ihrem Wunschtermin, der gewünschten Dauer und dem Anlass. ${cheapest ? `Die Tarife beginnen bei ${cheapest.toLocaleString("de-DE")} ${cur} für eine Stunde, ` : ""}mit gestaffelten Paketen für längere Buchungen. Die Bestätigung erfolgt in der Regel innerhalb weniger Stunden.` },
  ];
  m._faqs = faqs;  // stash for the JSON-LD builder below
  return faqs.map((f) => `<details><summary><strong>${esc(f.q)}</strong></summary><p>${esc(f.a)}</p></details>`).join("");
})()}

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
        description: stripHtml(bio),
        knowsLanguage: m.languages,
        image: m.cover_image,
        nationality: m.nationality,
      },
      // FAQPage rich-snippet schema for the per-model Q&A block above.
      {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: (m._faqs || []).map((f) => ({
          "@type": "Question",
          name: f.q,
          acceptedAnswer: { "@type": "Answer", text: f.a },
        })),
      },
      breadcrumbSchema([{ label: t("crumb.models", lang), to: "/models" }, { label: m.name }], lang),
    ],
    bodyContent: body,
  });
}

module.exports = { renderModels, renderModelDetail };
