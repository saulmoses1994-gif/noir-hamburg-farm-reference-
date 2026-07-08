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
  const settings = getSettings();
  const FALLBACK_ABOUT_IMAGE = "https://images.pexels.com/photos/19923619/pexels-photo-19923619.jpeg?auto=compress&cs=tinysrgb&w=1200";
  const aboutImage = settings.about_image || FALLBACK_ABOUT_IMAGE;
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
<p>Noir Hamburg ist eine kleine, kuratierte Plattform für Menschen, die einen feinen ästhetischen Anspruch, intellektuelle Neugier und ein klares Verständnis von Diskretion teilen — auf beiden Seiten der Begegnung.</p>
<p>Gegründet 2025 in Hamburg, haben wir uns über die Jahre einen Namen als verlässlicher Vermittler für anspruchsvolle Klienten erarbeitet, die ihre Privatsphäre ebenso schätzen wie die Qualität ihrer Begegnungen.</p>
<p>Unsere Models sind keine zufällig gewählten Profile. Jede Persönlichkeit wird in einem persönlichen Gespräch aufgenommen und genießt unser uneingeschränktes Vertrauen. Wir arbeiten ausnahmslos mit Menschen zusammen, die ihre Tätigkeit selbstbestimmt und mit Stolz ausüben.</p>

<h2>Eine hanseatische Institution seit 2025</h2>
<p>Noir Hamburg entstand aus einer einfachen Beobachtung: In einer Stadt mit dem kulturellen und wirtschaftlichen Rang Hamburgs fehlte eine Begleitagentur mit hanseatischen Standards. Zu viele Vermittlungen waren anonym, industriell, austauschbar. Zu wenig Beratung, zu wenig Persönlichkeit, zu viel Kompromiss bei der Auswahl. Wir gründeten unsere Agentur, um genau das Gegenteil zu tun.</p>
<p>In den ersten Jahren begleiteten wir zwei bis drei Damen — alle persönliche Bekannte, alle mit der stillen Souveränität, die diese Arbeit erst zu einer Kunst macht. Über die Zeit ist unser Kreis auf vierzehn Damen und ein festes Netzwerk internationaler Kolleginnen gewachsen. Was sich nicht geändert hat: dass wir jede Dame persönlich kennen und ihr uneingeschränkt vertrauen.</p>

<h2>Was uns von einer klassischen Agentur unterscheidet</h2>
<p>Wir vermitteln keine Stunden — wir vermitteln Abende. Ein guter Abend beginnt lange bevor die Dame Ihr Hotel betritt: bei der Auswahl der passenden Persönlichkeit, bei der Beratung zu Restaurant und Kleidung, bei der ruhigen Klärung aller Erwartungen. Wenn diese Vorarbeit stimmt, braucht der Abend selbst kaum noch Regie. Er läuft von selbst — das ist unser Ideal.</p>
<p>Deshalb funktionieren wir bewusst nicht nach dem Prinzip "möglichst viele Buchungen möglichst schnell". Wir nehmen uns Zeit für die Beratung, empfehlen aktiv gegen unpassende Anfragen und sagen "nein", wenn eine Buchung uns oder unserer Dame nicht dienlich ist. Diese Zurückhaltung ist das eigentliche Fundament unseres Rufs.</p>

<h2>Die Auswahl unserer Damen</h2>
<p>Bevor eine Dame auf Noir Hamburg erscheint, treffen wir sie mindestens zwei Mal persönlich. Beim ersten Gespräch klären wir Beweggründe, Erwartungen und Lebenssituation. Beim zweiten — meist gemeinsam bei einem entspannten Abendessen — beobachten wir das, was sich im Formular nie erfassen lässt: wie sie sich in der Öffentlichkeit bewegt, wie sie mit Personal umgeht, wie sie ein Gespräch führt.</p>
<p>Fachliche Kriterien — Bildung, Sprachen, gepflegte Erscheinung — sind selbstverständlich. Aber sie sind nicht das Wesentliche. Das Wesentliche ist die stille Selbstverständlichkeit, mit der eine Dame in einem Sternerestaurant sitzt, ein Kunstwerk deutet oder mit einem CEO über internationale Politik spricht. Diese Selbstverständlichkeit lässt sich nicht trainieren — sie ist da oder nicht.</p>

<h2>Diskretion in der täglichen Praxis</h2>
<p>Diskretion ist bei uns nicht ein Versprechen auf einer Website — sie ist ein System aus vielen kleinen, konsequent umgesetzten Regeln. Kommunikation läuft verschlüsselt. Kontaktdaten sind nur zwei Personen in unserem Team zugänglich. Rechnungen tragen neutrale Bezeichnungen. Modelnamen sind Künstlernamen; die bürgerliche Identität kennen nur wir. Auf Wunsch arbeiten wir mit von unserem Anwalt vorbereiteten NDAs auf Deutsch und Englisch.</p>
<p>Für Kunden aus dem öffentlichen Leben — Vorstände, Sportler, Kulturschaffende — treffen wir zusätzliche Vorkehrungen: separate Telefonleitungen, verzögerte Rückrufe an neutralen Standorten, keine schriftlichen Bestätigungen mit vollem Namen. Diese Detailarbeit ist unsichtbar, aber sie macht den Unterschied zwischen einer diskreten Agentur und einer Agentur, die Diskretion behauptet.</p>

<h2>Für wen wir arbeiten</h2>
<p>Unsere Kunden sind Unternehmerinnen und Unternehmer, Anwältinnen, Ärzte, Kreative, internationale Geschäftsreisende. Was sie eint, ist selten das Einkommen — es ist die Erwartung an Verlässlichkeit, Diskretion und Kultiviertheit. Sie erwarten nicht das größte Modelportfolio; sie erwarten die passende Begleitung für einen konkreten Abend.</p>
<p>Ein wesentlicher Teil unserer Anfragen kommt heute über Empfehlungen bestehender Kunden. Das ist das größte Kompliment, das eine Agentur wie unsere sich wünschen kann — und die eigentliche Erklärung, warum wir seit über zehn Jahren nicht wachsen wollen, sondern wachsen dürfen.</p>

<h2>Unsere Prinzipien im Überblick</h2>
<ul><li><strong>Sorgfältige Auswahl</strong> — jede Dame persönlich kennengelernt und mindestens zwei Mal getroffen</li><li><strong>Verbindliche Diskretion</strong> — verschlüsselte Kommunikation, minimale Datenspeicherung, NDA auf Wunsch</li><li><strong>Persönliche Betreuung</strong> — echte Menschen, keine Callcenter, keine Bots</li><li><strong>Verlässliche Pünktlichkeit</strong> — bestätigte Termine werden eingehalten, Ausnahmen sind Ausnahmen</li></ul>`,
    en: `
<p>Noir Hamburg is a small, curated platform for people who share a fine aesthetic sensibility, intellectual curiosity and a clear understanding of discretion — on both sides of the encounter.</p>
<p>Founded in Hamburg in 2025, we have built a reputation over the years as a reliable agency for discerning clients who value their privacy as much as the quality of their encounters.</p>
<p>Our models are not randomly chosen profiles. Every personality is welcomed into our circle through a personal conversation and enjoys our unconditional trust. We work exclusively with people who pursue their profession self-determined and with pride.</p>

<h2>A Hanseatic institution since 2025</h2>
<p>Noir Hamburg was born from a simple observation: in a city with the cultural and economic rank of Hamburg, a companion agency with hanseatic standards was missing. Too many services were anonymous, industrial, interchangeable. Too little consultation, too little personality, too much compromise in the selection. We founded our agency to do exactly the opposite.</p>
<p>In the first years we represented two or three ladies — all personal acquaintances, all with the quiet self-assurance that turns this work into an art. Over time our circle has grown to fourteen ladies and a firm network of international colleagues. What has not changed: that we know every lady personally and trust her unconditionally.</p>

<h2>What sets us apart from a classical agency</h2>
<p>We do not book hours — we book evenings. A good evening begins long before the lady enters your hotel: in choosing the right personality, in advising on restaurant and dress, in the calm clarification of all expectations. When this groundwork is right, the evening itself hardly needs direction. It runs on its own — that is our ideal.</p>
<p>That is why we deliberately do not operate on the principle of "as many bookings as possible, as quickly as possible". We take time for consultation, actively advise against unsuitable enquiries, and say "no" when a booking does not serve us or our lady. This restraint is the actual foundation of our reputation.</p>

<h2>The selection of our ladies</h2>
<p>Before a lady appears on Noir Hamburg, we meet her at least twice in person. In the first conversation we clarify motives, expectations and life situation. In the second — usually together over a relaxed dinner — we observe what a form can never capture: how she moves in public, how she deals with staff, how she leads a conversation.</p>
<p>Professional criteria — education, languages, groomed appearance — are self-evident. But they are not the essential thing. The essential thing is the quiet naturalness with which a lady sits in a Michelin-starred restaurant, interprets a work of art or speaks with a CEO about international politics. This naturalness cannot be trained — either it is there, or it is not.</p>

<h2>Discretion in daily practice</h2>
<p>Discretion is not a promise on a website for us — it is a system of many small, consistently applied rules. Communication is encrypted. Contact details are accessible only to two people in our team. Invoices carry neutral labels. Model names are stage names; only we know the civil identity. On request we work with NDAs prepared by our lawyer, in German and English.</p>
<p>For clients from public life — executives, athletes, cultural figures — we take additional precautions: separate phone lines, delayed callbacks from neutral locations, no written confirmations with full names. This detail work is invisible, but it makes the difference between a discreet agency and an agency that claims discretion.</p>

<h2>Who we work for</h2>
<p>Our clients are entrepreneurs, lawyers, doctors, creatives, international business travellers. What unites them is rarely income — it is the expectation of reliability, discretion and refinement. They do not expect the largest model portfolio; they expect the right companion for a concrete evening.</p>
<p>A significant part of our enquiries today come through referrals from existing clients. That is the greatest compliment an agency like ours can hope for — and the actual explanation of why, for over ten years, we have not wanted to grow, but have been allowed to grow.</p>

<h2>Our principles at a glance</h2>
<ul><li><strong>Careful selection</strong> — every lady personally met and vetted at least twice</li><li><strong>Binding discretion</strong> — encrypted communication, minimal data storage, NDA on request</li><li><strong>Personal attention</strong> — real people, no call centres, no bots</li><li><strong>Reliable punctuality</strong> — confirmed appointments are kept, exceptions are exceptions</li></ul>`,
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
    ogImage: aboutImage,
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

function renderImpressum(buildAssets, lang = "de") {
  const titleByLang = {
    de: "Impressum | Noir Hamburg",
    en: "Imprint | Noir Hamburg",
  };
  const descByLang = {
    de: "Impressum von Noir Hamburg gemäß § 5 TMG — Anbieteradresse, Kontakt, Bildrechte und Jugendschutzbeauftragter.",
    en: "Legal imprint of Noir Hamburg per § 5 TMG — company address, contact, image credits and youth-protection officer.",
  };
  const crumbLabel = lang === "en" ? "Imprint" : "Impressum";
  const legalHeadingsDe = {
    tmg: "Angaben gemäß § 5 TMG",
    contact: "Kontakt",
    images: "Bildrechte",
    jsb: "Jugendschutzbeauftragter",
  };
  const legalHeadingsEn = {
    tmg: "Information per § 5 TMG",
    contact: "Contact",
    images: "Image credits",
    jsb: "Youth-protection officer",
  };
  const H = lang === "en" ? legalHeadingsEn : legalHeadingsDe;

  const body = `
<main id="main" style="padding:2rem;">
${renderBreadcrumbs([{ label: crumbLabel }], lang)}
<h1>${lang === "en" ? "Imprint" : "Impressum"}</h1>
<h2>${esc(H.tmg)}</h2>
<address>
<strong>Noir Hamburg</strong><br/>
Pinneberger Chaussee 50<br/>
22523 Hamburg
</address>
<h2>${esc(H.contact)}</h2>
<p>E-Mail: <a href="mailto:support@noir-hamburg.com">support@noir-hamburg.com</a></p>
<h2>${esc(H.images)}</h2>
<p>© Noir Hamburg und unter Lizenz von Pixabay / Unsplash / Shutterstock.com</p>
<h2>${esc(H.jsb)}</h2>
<address>
<strong>Jochen Jüngst, LL.M.</strong><br/>
Tel.: <a href="tel:+494087408606">+49 40 874 086 06</a><br/>
Fax: 040 – 874 087 00<br/>
E-Mail: <a href="mailto:info@juengst-legal.de">info@juengst-legal.de</a><br/>
Web: <a href="https://www.juengst-legal.de" rel="noopener noreferrer">www.juengst-legal.de</a>
</address>
</main>`;
  return renderShell({
    ...buildAssets,
    lang,
    title: titleByLang[lang] || titleByLang.de,
    description: descByLang[lang] || descByLang.de,
    canonicalPath: lang === "en" ? "/en/imprint" : "/impressum",
    jsonLd: [breadcrumbSchema([{ label: crumbLabel }], lang)],
    bodyContent: body,
  });
}

module.exports = { renderFAQ, renderAbout, renderContact, renderImpressum };
