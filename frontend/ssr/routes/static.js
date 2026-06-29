/**
 * Fully-static SSR pages: FAQ, About (/ueber-uns), Contact (/kontakt).
 */
const { FAQS, BRAND } = require("../../src/data/site");
const {
  SITE_ORIGIN,
  esc,
  renderShell,
  renderBreadcrumbs,
  breadcrumbSchema,
} = require("../shell");

function renderFAQ(buildAssets) {
  const body = `
<main id="main" style="padding:2rem;">
${renderBreadcrumbs([{ label: "FAQ" }])}
<h1>Häufig gestellte Fragen</h1>
${FAQS.map((f) => `<details open><summary><h2 style="display:inline">${esc(f.q)}</h2></summary><p>${esc(f.a)}</p></details>`).join("")}
</main>`;
  return renderShell({
    ...buildAssets,
    title: "FAQ — Häufige Fragen | Noir Hamburg Premium Escort",
    description: "Antworten auf häufige Fragen zum Buchungsprozess, Diskretion, Verfügbarkeit und Zahlungsmodalitäten bei Noir Hamburg.",
    canonical: `${SITE_ORIGIN}/faq`,
    jsonLd: [
      {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: FAQS.map((f) => ({
          "@type": "Question",
          name: f.q,
          acceptedAnswer: { "@type": "Answer", text: f.a },
        })),
      },
      breadcrumbSchema([{ label: "FAQ" }]),
    ],
    bodyContent: body,
  });
}

function renderAbout(buildAssets) {
  const body = `
<main id="main" style="padding:2rem;">
${renderBreadcrumbs([{ label: "Über uns" }])}
<h1>Über uns</h1>
<p>Noir Hamburg ist eine kleine, kuratierte Plattform für Menschen, die einen feinen ästhetischen Anspruch, intellektuelle Neugier und ein klares Verständnis von Diskretion teilen.</p>
<p>Gegründet 2014 in Hamburg, haben wir uns über die Jahre einen Namen als verlässlicher Vermittler für anspruchsvolle Klienten erarbeitet.</p>
<h2>Unsere Prinzipien</h2>
<ul><li>Sorgfältige Auswahl</li><li>Verbindliche Diskretion</li><li>Persönliche Betreuung</li><li>Verlässliche Pünktlichkeit</li></ul>
<p><a href="/kontakt">Kontakt aufnehmen</a></p>
</main>`;
  return renderShell({
    ...buildAssets,
    title: "Über uns — Die Philosophie von Noir Hamburg",
    description: "Noir Hamburg ist eine kleine, kuratierte Premium-Begleitagentur in Hamburg. Lernen Sie unsere Werte, Standards und unser Verständnis von Diskretion kennen.",
    canonical: `${SITE_ORIGIN}/ueber-uns`,
    jsonLd: [breadcrumbSchema([{ label: "Über uns" }])],
    bodyContent: body,
  });
}

function renderContact(buildAssets) {
  const body = `
<main id="main" style="padding:2rem;">
${renderBreadcrumbs([{ label: "Kontakt" }])}
<h1>Kontakt</h1>
<p>Wir antworten persönlich, vertraulich und meist innerhalb weniger Stunden.</p>
<p>Telefon: <a href="tel:${BRAND.phone}">${BRAND.phone}</a></p>
<p>E-Mail: <a href="mailto:${BRAND.email}">${BRAND.email}</a></p>
<p>WhatsApp: <a href="${BRAND.whatsappUrl}">${BRAND.phone}</a></p>
</main>`;
  return renderShell({
    ...buildAssets,
    title: "Kontakt — Diskrete Buchung | Noir Hamburg",
    description: "Nehmen Sie diskret Kontakt zu Noir Hamburg auf. Wir antworten persönlich und vertraulich – per E-Mail, Telefon oder WhatsApp.",
    canonical: `${SITE_ORIGIN}/kontakt`,
    jsonLd: [breadcrumbSchema([{ label: "Kontakt" }])],
    bodyContent: body,
  });
}

module.exports = { renderFAQ, renderAbout, renderContact };
