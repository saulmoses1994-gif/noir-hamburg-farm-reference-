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
const { getSettings } = require("../settings");

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
<p><a href="${navTo("/models", lang)}">${esc(t("cta.discoverModels", lang))}</a> · <a href="${getSettings().whatsappUrl}">${esc(t("cta.whatsapp", lang))}</a> · <a href="${navTo("/kontakt", lang)}">${esc(t("nav.contact", lang))}</a></p>
</section>

<section>
<h2>${esc(lang === "en" ? "Why choose a professional escort agency in Hamburg?" : "Warum eine professionelle Escort Agentur in Hamburg wählen?")}</h2>
<p>${esc(lang === "en"
  ? "Hamburg is one of Europe's most demanding cities — hanseatic, cosmopolitan, with an exceptionally high standard in culture, gastronomy and business. Anyone choosing an escort agency here should not rely on random matchmaking, but on established experience and a team that understands the city."
  : "Hamburg ist eine der anspruchsvollsten Städte Europas — hanseatisch, weltoffen, mit einem außergewöhnlich hohen Standard in Kultur, Gastronomie und Business. Wer sich hier für eine Escort Agentur entscheidet, sollte nicht auf zufällige Vermittlung setzen, sondern auf gewachsene Erfahrung und ein Team, das die Stadt versteht.")}</p>
<p>${esc(lang === "en"
  ? "Since 2014, Noir Hamburg has accompanied gentlemen and ladies of rank to private dinner engagements, business receptions at the Elbphilharmonie, exclusive art openings in HafenCity and discreet weekends between Blankenese and Winterhude. Our matchmaking is personal, hand-picked and discreet — never automated."
  : "Seit 2014 begleitet Noir Hamburg Herren und Damen von Rang zu privaten Dinner-Verabredungen, geschäftlichen Empfängen an der Elbphilharmonie, exklusiven Kunstvernissagen in der HafenCity und diskreten Wochenenden zwischen Blankenese und Winterhude. Unsere Vermittlung ist persönlich, handverlesen und diskret — nie automatisiert.")}</p>
</section>

<section>
<h2>${esc(lang === "en" ? "Luxury escort service in Hamburg — at the highest level" : "Luxus Escort Service in Hamburg — auf höchstem Niveau")}</h2>
<p>${esc(lang === "en"
  ? "A luxury escort in Hamburg differs in every detail: the ladies wear Chanel, Dior or bespoke German ateliers. They speak at least two languages fluently, hold academic degrees or artistic careers, and carry themselves with the quiet self-assurance of a real lady — not a rehearsed role."
  : "Ein Luxus Escort in Hamburg unterscheidet sich in jedem Detail: die Damen tragen Kleider von Chanel, Dior oder maßgeschneiderte deutsche Ateliers. Sie sprechen mindestens zwei Sprachen fließend, verfügen über akademische Bildung oder eine künstlerische Karriere und bewegen sich mit der stillen Selbstsicherheit einer echten Dame — nicht mit einer einstudierten Rolle.")}</p>
<p>${esc(lang === "en"
  ? "We work exclusively with women we know personally and whose personality, sophistication and discretion we can guarantee. For every occasion — from a quiet dinner in the Fischereihafen to a multi-day trip to Sylt or Cortina — we find the right companion. No catalogue, no mass production, but tailored matchmaking."
  : "Wir arbeiten ausschließlich mit Frauen, die wir persönlich kennen und deren Persönlichkeit, Kultiviertheit und Diskretion wir garantieren können. Für jeden Anlass — vom stillen Abendessen im Fischereihafen bis zur mehrtägigen Reise nach Sylt oder Cortina — finden wir die passende Begleitung. Kein Katalog, keine Massenware, sondern maßgeschneiderte Vermittlung.")}</p>
</section>

<section>
<h2>${esc(lang === "en" ? "Discretion and privacy in Hamburg" : "Diskretion und Privatsphäre in Hamburg")}</h2>
<p>${esc(lang === "en"
  ? "For us, discretion is not a marketing phrase but a way of working. All enquiries are encrypted, we store no unnecessary data, and neither your companion nor any third party learn more than is strictly required for the evening. NDAs on request — written and countersigned."
  : "Diskretion ist bei uns keine Marketing-Formel, sondern Arbeitsweise. Alle Anfragen laufen verschlüsselt, wir speichern keine unnötigen Daten, und selbstverständlich erfahren weder Ihre Begleitung noch Dritte mehr, als für den Abend zwingend erforderlich ist. NDAs auf Wunsch — schriftlich, gegengezeichnet.")}</p>
<p>${esc(lang === "en"
  ? "Professionalism begins for us long before the booking: in the selection of our ladies, in an honest consultation, in transparent rates without hidden extras, and in availability seven days a week — including short-notice requests. Once you have experienced our agency, you understand why clients return to us after ten years."
  : "Professionalität beginnt für uns lange vor der Buchung: bei der Auswahl unserer Damen, bei der ehrlichen Beratung im Vorgespräch, bei transparenten Tarifen ohne versteckte Zusätze, und bei einer Erreichbarkeit sieben Tage die Woche — auch für kurzfristige Wünsche. Wenn Sie unsere Agentur einmal getestet haben, verstehen Sie, warum Kunden nach zehn Jahren immer wieder zu uns zurückkehren.")}</p>
<p>${esc(lang === "en"
  ? "In practice this means: no SMS to your private number without your explicit consent, no calendar entries on business phones, no photo exchange you cannot recall later. We understand the confidentiality expected by hanseatic gentlemen — and work to that standard."
  : "Konkret bedeutet das: keine SMS an Ihre Privatnummer ohne Ihre ausdrückliche Freigabe, keine Kalendereinträge auf Diensttelefonen, kein Foto-Austausch, den Sie später nicht mehr zurückholen können. Wir verstehen die Vertraulichkeit hanseatischer Herren — und arbeiten nach diesem Maßstab.")}</p>
</section>

<section>
<h2>${esc(lang === "en" ? "VIP & Business companionship in Hamburg" : "VIP & Business Begleitung in Hamburg")}</h2>
<p>${esc(lang === "en"
  ? "For public figures, international investors and executives we offer a class of their own: VIP Escort and Business Escort Hamburg. These ladies are not merely presentable but boardroom-ready — familiar with Hanseatic etiquette, with board dinner codes, and with the international manners expected among CEOs, lawyers and diplomats."
  : "Für Persönlichkeiten des öffentlichen Lebens, internationale Investoren und Geschäftsführer bieten wir eine eigene Klasse der Begleitung: VIP Escort und Business Escort Hamburg. Diese Damen sind nicht nur präsentabel, sondern konferenzfähig — vertraut mit hanseatischer Etikette, mit Board-Dinner-Codes und mit dem international üblichen Umgang unter CEOs, Anwälten und Diplomaten.")}</p>
<p>${esc(lang === "en"
  ? "Whether a discreet dinner at the Vier Jahreszeiten, a reception at the Elbphilharmonie, or a multi-day delegation from Sylt to Dubai — your companion carries herself with poise, speaks at least English and German fluently, and understands when to entertain and when to step elegantly back. On request with a business background, an academic degree or an artistic career."
  : "Ob ein diskretes Dinner im Vier Jahreszeiten, ein Empfang in der Elbphilharmonie oder eine mehrtägige Delegation von Sylt bis Dubai — Ihre Begleitung tritt souverän auf, spricht mindestens Englisch und Deutsch fließend und versteht, wann sie unterhält und wann sie sich elegant zurücknimmt. Auf Wunsch mit wirtschaftlichem Hintergrund, akademischem Grad oder künstlerischer Karriere.")}</p>
<p>${esc(lang === "en"
  ? "For leadership figures we apply an extended confidentiality tier: no public profiles, no joint photographs, no intermediate contact outside your dedicated handler. Bookings are coordinated exclusively between you and one permanent contact — on request under NDA."
  : "Für Führungspersönlichkeiten gilt bei uns eine erweiterte Vertraulichkeitsstufe: keine öffentlichen Profile, keine gemeinsamen Fotos, kein Zwischenkontakt außerhalb Ihres Ansprechpartners. Buchungen werden ausschließlich zwischen Ihnen und einem festen Betreuer koordiniert — auf Wunsch mit NDA.")}</p>
<p><a href="${navTo("/services/vip-escort-hamburg", lang)}">${esc(lang === "en" ? "VIP Escort Hamburg" : "VIP Escort Hamburg")}</a> · <a href="${navTo("/services/business-escort-hamburg", lang)}">${esc(lang === "en" ? "Business Escort Hamburg" : "Business Escort Hamburg")}</a> · <a href="${navTo("/services/dinner-companion-hamburg", lang)}">${esc(lang === "en" ? "Dinner Companion" : "Dinner Companion")}</a> · <a href="${navTo("/services/travel-companion-hamburg", lang)}">${esc(lang === "en" ? "Travel Companion" : "Travel Companion")}</a></p>
</section>

<section>
<h2>${esc(lang === "en" ? "Why clients trust us" : "Warum Kunden uns vertrauen")}</h2>
<p>${esc(lang === "en"
  ? "Five pillars that separate a random matchmaking service from a lasting relationship — and that explain why a significant part of our clientele has been returning to us for many years."
  : "Fünf Grundpfeiler, die den Unterschied zwischen einer beliebigen Vermittlung und einer gewachsenen Beziehung ausmachen — und die erklären, warum ein wesentlicher Teil unserer Kunden seit vielen Jahren immer wieder zu uns zurückkehrt.")}</p>
<dl>
<dt><strong>${esc(lang === "en" ? "1. Absolute discretion" : "1. Absolute Diskretion")}</strong></dt>
<dd>${esc(lang === "en"
  ? "Encrypted communication, minimal data storage and — on request — written non-disclosure agreements. Neither your companion nor any third party learn more than the evening itself requires."
  : "Verschlüsselte Kommunikation, minimale Datenspeicherung und — auf Wunsch — schriftliche Geheimhaltungsvereinbarungen. Weder Ihre Begleitung noch Dritte erfahren mehr, als der Abend selbst erfordert.")}</dd>
<dt><strong>${esc(lang === "en" ? "2. Uncompromising privacy" : "2. Kompromissloser Datenschutz")}</strong></dt>
<dd>${esc(lang === "en"
  ? "No newsletter, no retargeting, no third-party analytics trackers on sensitive pages. Your contact details are accessible only to the two staff members who personally handle your booking."
  : "Kein Newsletter, kein Retargeting, keine Analytics-Tracker Dritter auf sensiblen Seiten. Ihre Kontaktdaten sind nur den zwei Mitarbeitern zugänglich, die Ihre Buchung persönlich betreuen.")}</dd>
<dt><strong>${esc(lang === "en" ? "3. Hanseatic quality standards" : "3. Hanseatische Qualitätsstandards")}</strong></dt>
<dd>${esc(lang === "en"
  ? "Every lady is personally met and vetted at least twice before appearing on Noir Hamburg. Education, linguistic ease, polished presentation — non-negotiable."
  : "Jede Dame wird von uns persönlich kennengelernt und mindestens zwei Mal getroffen, bevor sie auf Noir Hamburg erscheint. Bildung, sprachliche Gewandtheit, gepflegtes Auftreten — nicht verhandelbar.")}</dd>
<dt><strong>${esc(lang === "en" ? "4. Verified model profiles" : "4. Verifizierte Modelprofile")}</strong></dt>
<dd>${esc(lang === "en"
  ? "All photos are current, unretouched and come from professional shoots we have personally commissioned. No catalogue images, no stock photos, no surprises."
  : "Alle Fotos sind aktuell, unretuschiert und stammen aus professionellen Shootings, die wir persönlich in Auftrag gegeben haben. Keine Katalogbilder, keine Stock-Fotos, keine Überraschungen.")}</dd>
<dt><strong>${esc(lang === "en" ? "5. Personal service" : "5. Persönlicher Service")}</strong></dt>
<dd>${esc(lang === "en"
  ? "You speak with a real person — not a bot, not a call centre. We know our ladies personally and select the right companion for you by occasion, language and chemistry."
  : "Sie sprechen mit einem echten Menschen — nicht mit einem Bot, nicht mit einem Callcenter. Wir kennen unsere Damen persönlich und wählen für Sie die passende Begleitung nach Anlass, Sprache und Chemie aus.")}</dd>
</dl>
</section>

<section>
<h2>${esc(lang === "en" ? "Our exclusive escort models in Hamburg" : "Unsere exklusiven Escort Models in Hamburg")}</h2>
<ul>${models.map((m) => `<li><a href="${navTo(`/models/${m.slug}`, lang)}"><strong>${esc(m.name)}</strong>, ${m.age} ${esc(t("model.years", lang))} — ${esc(m.short_tagline || "Premium")}</a></li>`).join("")}</ul>
<p><a href="${navTo("/models", lang)}">${esc(t("cta.allModels", lang))}</a></p>
</section>
<section>
<h2>${esc(lang === "en" ? "Companionship for business, dinner and events" : "Begleitung für Business, Dinner und Events")}</h2>
<ul>${SERVICES.map((s) => `<li><a href="${navTo(`/services/${s.slug}`, lang)}"><strong>${esc(s.title)}</strong> — ${esc(lang === "en" ? s.descriptionEn : s.description)}</a></li>`).join("")}</ul>
</section>
<section>
<h2>${esc(lang === "en" ? "Escort service across Hamburg districts" : "Escort Service in Hamburg Stadtteilen")}</h2>
<ul>${LOCATIONS.map((l) => `<li><a href="${navTo(`/escort/${l.slug}`, lang)}">Escort ${esc(l.name)}</a></li>`).join("")}</ul>
</section>
<section>
<h2>${esc(t("sec.fromMagazine", lang))}</h2>
${posts.map((p) => `<article><h3><a href="${navTo(`/blog/${p.slug}`, lang)}">${esc(p.title)}</a></h3><p>${esc(p.excerpt)}</p></article>`).join("")}
<p><a href="${navTo("/blog", lang)}">${esc(t("cta.allPosts", lang))}</a></p>
</section>
<section>
<h2>${esc(lang === "en" ? "Frequently asked questions" : "Häufig gestellte Fragen")}</h2>
${FAQS.slice(0, 4).map((f) => `<details><summary><strong>${esc(lang === "en" ? f.qEn : f.q)}</strong></summary><p>${esc(lang === "en" ? f.aEn : f.a)}</p></details>`).join("")}
</section>
</main>`;

  const titleByLang = {
    de: "Luxus Escort Hamburg – Premium Begleitung mit Stil | Noir Hamburg",
    en: "Luxury Escort Hamburg – Premium Companionship with Style | Noir Hamburg",
  };
  const descByLang = {
    de: "Luxus Escort Hamburg — premium, diskrete Begleitagentur für Dinner, Business und Events. Handverlesene Models seit 2014, faire Tarife, Vermittlung in ganz Hamburg und Umland.",
    en: "Luxury Escort Hamburg — premium, discreet companion agency for dinner, business and events. Hand-picked models since 2014, transparent rates, coverage across Hamburg and the surrounding region.",
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
        telephone: getSettings().phone,
        email: getSettings().email,
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
