/**
 * Fully-static SSR pages: FAQ, About (DE: /ueber-uns, EN: /en/about),
 * Contact (DE: /kontakt, EN: /en/contact).
 */
const { FAQS, BRAND } = require("../../src/data/site");
const {
  esc,
  renderShell,
  renderBreadcrumbs,
  breadcrumbSchema,
  englishComingSoonBanner,
  t,
} = require("../shell");
const { getSettings } = require("../settings");

function renderFAQ(buildAssets, lang = "de") {
  const titleByLang = {
    de: "FAQ — Häufige Fragen | Noir Hamburg Premium Escort",
    en: "FAQ — Frequently Asked Questions | Noir Hamburg Premium Escort",
  };
  const descByLang = {
    de: "Antworten auf häufige Fragen zum Buchungsprozess, Diskretion, Verfügbarkeit und Zahlungsmodalitäten bei Noir Hamburg.",
    en: "Answers to common questions about bookings, discretion, availability and payment with Noir Hamburg.",
  };

  const body = `
<main id="main" style="padding:2rem;">
${renderBreadcrumbs([{ label: t("crumb.faq", lang) }], lang)}
<h1>${esc(t("sec.faqH1", lang))}</h1>
${FAQS.map((f) => `<details open><summary><h2 style="display:inline">${esc(lang === "en" ? f.qEn : f.q)}</h2></summary><p>${esc(lang === "en" ? f.aEn : f.a)}</p></details>`).join("")}
</main>`;
  return renderShell({
    ...buildAssets,
    lang,
    title: titleByLang[lang] || titleByLang.de,
    description: descByLang[lang] || descByLang.de,
    canonicalPath: "/faq",
    jsonLd: [
      {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: FAQS.map((f) => ({
          "@type": "Question",
          name: lang === "en" ? f.qEn : f.q,
          acceptedAnswer: { "@type": "Answer", text: lang === "en" ? f.aEn : f.a },
        })),
      },
      breadcrumbSchema([{ label: t("crumb.faq", lang) }], lang),
    ],
    bodyContent: body,
  });
}

function renderAbout(buildAssets, lang = "de") {
  const titleByLang = {
    de: "Über uns — Die Philosophie von Noir Hamburg",
    en: "About — The Philosophy of Noir Hamburg",
  };
  const descByLang = {
    de: "Noir Hamburg ist eine kleine, kuratierte Premium-Begleitagentur in Hamburg. Lernen Sie unsere Werte, Standards und unser Verständnis von Diskretion kennen.",
    en: "Noir Hamburg is a small, curated premium companion agency in Hamburg. Discover our values, our standards and our understanding of discretion.",
  };
  const bodyByLang = {
    de: `
<p>Noir Hamburg ist eine kleine, kuratierte Plattform für Menschen, die einen feinen ästhetischen Anspruch, intellektuelle Neugier und ein klares Verständnis von Diskretion teilen.</p>
<p>Gegründet 2014 in Hamburg, haben wir uns über die Jahre einen Namen als verlässlicher Vermittler für anspruchsvolle Klienten erarbeitet.</p>
<h2>Unsere Prinzipien</h2>
<ul><li>Sorgfältige Auswahl</li><li>Verbindliche Diskretion</li><li>Persönliche Betreuung</li><li>Verlässliche Pünktlichkeit</li></ul>`,
    en: `
<p>Noir Hamburg is a small, curated platform for people who share a fine aesthetic sensibility, intellectual curiosity and a clear understanding of discretion.</p>
<p>Founded in Hamburg in 2014, we have built a reputation over the years as a reliable agency for discerning clients.</p>
<h2>Our Principles</h2>
<ul><li>Careful Selection</li><li>Binding Discretion</li><li>Personal Attention</li><li>Reliable Punctuality</li></ul>`,
  };

  const body = `
<main id="main" style="padding:2rem;">
${renderBreadcrumbs([{ label: t("crumb.about", lang) }], lang)}
<h1>${esc(t("sec.about", lang))}</h1>
${bodyByLang[lang] || bodyByLang.de}
<p><a href="${lang === "en" ? "/en/contact" : "/kontakt"}">${esc(t("cta.contactUs", lang))}</a></p>
</main>`;
  return renderShell({
    ...buildAssets,
    lang,
    title: titleByLang[lang] || titleByLang.de,
    description: descByLang[lang] || descByLang.de,
    canonicalPath: "/ueber-uns",
    jsonLd: [breadcrumbSchema([{ label: t("crumb.about", lang) }], lang)],
    bodyContent: body,
  });
}

function renderContact(buildAssets, lang = "de") {
  const titleByLang = {
    de: "Kontakt — Diskrete Buchung | Noir Hamburg",
    en: "Contact — Discreet Booking | Noir Hamburg",
  };
  const descByLang = {
    de: "Nehmen Sie diskret Kontakt zu Noir Hamburg auf. Wir antworten persönlich und vertraulich – per E-Mail, Telefon oder WhatsApp.",
    en: "Get in touch with Noir Hamburg discreetly. We respond personally and confidentially — by email, phone or WhatsApp.",
  };

  const body = `
<main id="main" style="padding:2rem;">
${renderBreadcrumbs([{ label: t("crumb.contact", lang) }], lang)}
<h1>${esc(t("sec.contact", lang))}</h1>
<p>${esc(t("misc.contactLead", lang))}</p>
<p>${esc(t("misc.callUs", lang))}: <a href="tel:${esc(getSettings().phone)}">${esc(getSettings().phone)}</a></p>
<p>${esc(t("misc.emailUs", lang))}: <a href="mailto:${esc(getSettings().email)}">${esc(getSettings().email)}</a></p>
<p>WhatsApp: <a href="${getSettings().whatsappUrl}">${esc(getSettings().phone)}</a></p>
</main>`;
  return renderShell({
    ...buildAssets,
    lang,
    title: titleByLang[lang] || titleByLang.de,
    description: descByLang[lang] || descByLang.de,
    canonicalPath: "/kontakt",
    jsonLd: [breadcrumbSchema([{ label: t("crumb.contact", lang) }], lang)],
    bodyContent: body,
  });
}

module.exports = { renderFAQ, renderAbout, renderContact };
