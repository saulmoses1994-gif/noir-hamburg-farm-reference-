/**
 * Home (/ and /en) SSR renderer.
 */
const { SERVICES, LOCATIONS, FAQS, BRAND } = require("../../src/data/site");
const {
  esc,
  navTo,
  renderShell,
  t,
} = require("../shell");
const { backendJSON } = require("../backend");

async function renderHome(buildAssets, lang = "de") {
  let models = [];
  let posts = [];
  try {
    models = (await backendJSON("/api/models")).slice(0, 8);
    posts = await backendJSON("/api/blog?limit=3");
  } catch (e) {
    console.warn("home fetch fail:", e.message);
  }

  const body = `
<main id="main" role="main" style="padding:2rem;">
<section>
<p style="color:#8B1538;text-transform:uppercase;letter-spacing:0.2em;font-size:0.75rem;">${esc(t("home.eyebrow", lang))}</p>
<h1>${esc(t("home.h1.welcome", lang))} <em>${esc(t("home.h1.brand", lang))}</em></h1>
<p>${esc(t("home.lead", lang))}</p>
<p><a href="${navTo("/models", lang)}">${esc(t("cta.discoverModels", lang))}</a> · <a href="${BRAND.whatsappUrl}">${esc(t("cta.whatsapp", lang))}</a> · <a href="${navTo("/kontakt", lang)}">${esc(t("nav.contact", lang))}</a></p>
</section>
<section>
<h2>${esc(t("sec.ourModels", lang))}</h2>
<ul>${models.map((m) => `<li><a href="${navTo(`/models/${m.slug}`, lang)}"><strong>${esc(m.name)}</strong>, ${m.age} ${esc(t("model.years", lang))} — ${esc(m.short_tagline || "Premium")}</a></li>`).join("")}</ul>
<p><a href="${navTo("/models", lang)}">${esc(t("cta.allModels", lang))}</a></p>
</section>
<section>
<h2>${esc(t("sec.whatWeOffer", lang))}</h2>
<ul>${SERVICES.map((s) => `<li><a href="${navTo(`/services/${s.slug}`, lang)}"><strong>${esc(s.title)}</strong> — ${esc(lang === "en" ? s.descriptionEn : s.description)}</a></li>`).join("")}</ul>
</section>
<section>
<h2>${esc(t("sec.hamburgRegion", lang))}</h2>
<ul>${LOCATIONS.map((l) => `<li><a href="${navTo(`/escort/${l.slug}`, lang)}">Escort ${esc(l.name)}</a></li>`).join("")}</ul>
</section>
<section>
<h2>${esc(t("sec.fromMagazine", lang))}</h2>
${posts.map((p) => `<article><h3><a href="${navTo(`/blog/${p.slug}`, lang)}">${esc(p.title)}</a></h3><p>${esc(p.excerpt)}</p></article>`).join("")}
<p><a href="${navTo("/blog", lang)}">${esc(t("cta.allPosts", lang))}</a></p>
</section>
<section>
<h2>${esc(t("sec.faq", lang))}</h2>
${FAQS.slice(0, 4).map((f) => `<details><summary><strong>${esc(lang === "en" ? f.qEn : f.q)}</strong></summary><p>${esc(lang === "en" ? f.aEn : f.a)}</p></details>`).join("")}
</section>
</main>`;

  const titleByLang = {
    de: "Noir Hamburg — Premium Escort Hamburg | Diskrete Begleitung von höchster Eleganz",
    en: "Noir Hamburg — Premium Escort Hamburg | Discreet Companionship of the Highest Elegance",
  };
  const descByLang = {
    de: "Noir Hamburg ist die Premium-Begleitagentur für anspruchsvolle Herren in Hamburg. Diskret, gebildet, hanseatisch elegant. Buchen Sie Ihre persönliche Begleitung.",
    en: "Noir Hamburg is the premium companion agency for discerning gentlemen in Hamburg. Discreet, well-educated, hanseatic elegance. Book your personal companion.",
  };

  return renderShell({
    ...buildAssets,
    lang,
    title: titleByLang[lang] || titleByLang.de,
    description: descByLang[lang] || descByLang.de,
    canonicalPath: "/",
    ogImage: "https://images.unsplash.com/photo-1533392151650-269f96231f65?auto=format&fit=crop&w=1200&q=85",
    jsonLd: [
      {
        "@context": "https://schema.org",
        "@type": "LocalBusiness",
        name: "Noir Hamburg",
        description: "Premium Escort Agency Hamburg",
        address: { "@type": "PostalAddress", addressLocality: "Hamburg", addressCountry: "DE" },
        areaServed: "Hamburg",
        telephone: BRAND.phone,
        email: BRAND.email,
      },
      {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: FAQS.map((f) => ({
          "@type": "Question",
          name: lang === "en" ? f.qEn : f.q,
          acceptedAnswer: { "@type": "Answer", text: lang === "en" ? f.aEn : f.a },
        })),
      },
    ],
    bodyContent: body,
  });
}

module.exports = { renderHome };
