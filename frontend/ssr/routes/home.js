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

  // Resolve the hero image dynamically — admin Setting takes precedence,
  // otherwise fall back to the first featured model's cover image, otherwise
  // the stock Unsplash placeholder.
  const settings = getSettings();
  const FALLBACK_HERO_LG = "https://images.unsplash.com/photo-1533392151650-269f96231f65?auto=format&fit=crop&w=1200&q=80";
  const FALLBACK_HERO_MD = "https://images.unsplash.com/photo-1533392151650-269f96231f65?auto=format&fit=crop&w=900&q=78";
  const featuredCover = (models.find((m) => m.featured) || models[0] || {}).cover_image;
  const heroImage = settings.homepage_hero_image || featuredCover || FALLBACK_HERO_LG;
  const heroPreload = settings.homepage_hero_image ? heroImage
    : (featuredCover || FALLBACK_HERO_MD);

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
  ? "Since 2025, Noir Hamburg has accompanied gentlemen and ladies of rank to private dinner engagements, business receptions at the Elbphilharmonie, exclusive art openings in HafenCity and discreet weekends between Blankenese and Winterhude. Our matchmaking is personal, hand-picked and discreet — never automated."
  : "Seit 2025 begleitet Noir Hamburg Herren und Damen von Rang zu privaten Dinner-Verabredungen, geschäftlichen Empfängen an der Elbphilharmonie, exklusiven Kunstvernissagen in der HafenCity und diskreten Wochenenden zwischen Blankenese und Winterhude. Unsere Vermittlung ist persönlich, handverlesen und diskret — nie automatisiert.")}</p>
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
<h2>${esc(lang === "en" ? "How simple your booking is — in 3 steps" : "So einfach ist Ihre Buchung — in 3 Schritten")}</h2>
<p>${esc(lang === "en"
  ? "No login, no forms with twenty fields, no waiting on a call centre — the process is deliberately kept simple and respects your time."
  : "Kein Login, keine Formulare mit zwanzig Feldern, kein Warten auf Callcenter — der Ablauf ist bewusst schlicht gehalten und respektiert Ihre Zeit.")}</p>
<ol>
<li><strong>${esc(lang === "en" ? "Step 1 — Send your enquiry" : "Schritt 1 — Anfrage senden")}</strong><br/>${esc(lang === "en"
  ? "Via our contact form, WhatsApp or Signal — describe the occasion, timing and your preferences. Seven days a week, no login."
  : "Über unser Kontaktformular, per WhatsApp oder Signal — schildern Sie uns Anlass, Zeitrahmen und Ihre Vorlieben. Sieben Tage die Woche, ohne Login.")}</li>
<li><strong>${esc(lang === "en" ? "Step 2 — Receive personal advice" : "Schritt 2 — Beratung erhalten")}</strong><br/>${esc(lang === "en"
  ? "A dedicated contact reaches out shortly. We propose two to three suitable ladies and answer your questions — honestly, without sales pressure."
  : "Innerhalb kurzer Zeit meldet sich Ihr persönlicher Ansprechpartner. Wir schlagen zwei bis drei passende Damen vor und beantworten Ihre Fragen — ehrlich und ohne Verkaufsdruck.")}</li>
<li><strong>${esc(lang === "en" ? "Step 3 — Choose your companion" : "Schritt 3 — Begleitung auswählen")}</strong><br/>${esc(lang === "en"
  ? "You make your choice at your own pace. We confirm the appointment in writing, coordinate place, time and every detail — the rest you leave to us."
  : "Sie treffen Ihre Wahl in Ruhe. Wir bestätigen den Termin schriftlich, koordinieren Ort, Zeit und alle Details — den Rest überlassen Sie uns.")}</li>
</ol>
<p><a href="${navTo("/kontakt", lang)}"><strong>${esc(lang === "en" ? "Send your enquiry now →" : "Anfrage jetzt senden →")}</strong></a> · ${esc(lang === "en" ? "Discreet · Free of charge · No obligation" : "Diskret · Kostenfrei · Unverbindlich")}</p>
</section>

<section>
<h2>${esc(lang === "en" ? "Why Noir Hamburg?" : "Warum Noir Hamburg?")}</h2>
<p>${esc(lang === "en"
  ? "Six pillars that separate a random matchmaking service from a lasting relationship — and that explain why a significant part of our clientele has been returning to us for many years."
  : "Sechs Grundpfeiler, die den Unterschied zwischen einer beliebigen Vermittlung und einer gewachsenen Beziehung ausmachen — und die erklären, warum ein wesentlicher Teil unserer Kunden seit vielen Jahren immer wieder zu uns zurückkehrt.")}</p>
<dl>
<dt><strong>${esc(lang === "en" ? "1. Absolute discretion" : "1. Absolute Diskretion")}</strong></dt>
<dd>${esc(lang === "en"
  ? "Encrypted communication, minimal data storage and — on request — written non-disclosure agreements. Neither your companion nor any third party learn more than the evening itself requires."
  : "Verschlüsselte Kommunikation, minimale Datenspeicherung und — auf Wunsch — schriftliche Geheimhaltungsvereinbarungen. Weder Ihre Begleitung noch Dritte erfahren mehr, als der Abend selbst erfordert.")}</dd>
<dt><strong>${esc(lang === "en" ? "2. Uncompromising privacy" : "2. Kompromisslose Privatsphäre")}</strong></dt>
<dd>${esc(lang === "en"
  ? "No newsletter, no retargeting, no third-party analytics trackers on sensitive pages. Your contact details are accessible only to the two staff members who personally handle your booking."
  : "Kein Newsletter, kein Retargeting, keine Analytics-Tracker Dritter auf sensiblen Seiten. Ihre Kontaktdaten sind nur den zwei Mitarbeitern zugänglich, die Ihre Buchung persönlich betreuen.")}</dd>
<dt><strong>${esc(lang === "en" ? "3. Hanseatic quality" : "3. Hanseatische Qualität")}</strong></dt>
<dd>${esc(lang === "en"
  ? "Every lady is personally met and vetted at least twice before appearing on Noir Hamburg. Education, linguistic ease, polished presentation — non-negotiable."
  : "Jede Dame wird von uns persönlich kennengelernt und mindestens zwei Mal getroffen, bevor sie auf Noir Hamburg erscheint. Bildung, sprachliche Gewandtheit, gepflegtes Auftreten — nicht verhandelbar.")}</dd>
<dt><strong>${esc(lang === "en" ? "4. Personal service" : "4. Persönlicher Service")}</strong></dt>
<dd>${esc(lang === "en"
  ? "You speak with a real person — not a bot, not a call centre. A dedicated contact coordinates your booking from enquiry to follow-up."
  : "Sie sprechen mit einem echten Menschen — nicht mit einem Bot, nicht mit einem Callcenter. Ein fester Ansprechpartner koordiniert Ihre Buchung von der Anfrage bis zur Nachbereitung.")}</dd>
<dt><strong>${esc(lang === "en" ? "5. Easy to reach" : "5. Einfache Kontaktaufnahme")}</strong></dt>
<dd>${esc(lang === "en"
  ? "Contact form, WhatsApp or Signal — seven days a week. On weekdays we usually reply within an hour, on weekends the same day. No login, no registration."
  : "Kontaktformular, WhatsApp oder Signal — sieben Tage die Woche. Werktags antworten wir in der Regel innerhalb einer Stunde, an Wochenenden am selben Tag. Ohne Login, ohne Registrierung.")}</dd>
<dt><strong>${esc(lang === "en" ? "6. Professional standards" : "6. Professionelle Standards")}</strong></dt>
<dd>${esc(lang === "en"
  ? "Punctuality as a given, transparent rates without hidden surcharges, clear agreements in the initial call. The same principles since 2025 — for you and for our ladies."
  : "Pünktlichkeit als Selbstverständlichkeit, transparente Tarife ohne versteckte Zuschläge, klare Vereinbarungen im Vorgespräch. Seit 2025 dieselben Prinzipien — für Sie und für unsere Damen.")}</dd>
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
<h2>${esc(lang === "en" ? "Featured articles" : "Ausgewählte Beiträge")}</h2>
<p>${esc(lang === "en"
  ? "Personal guides through Hamburg's finest addresses — curated by our team, with honest recommendations for hotels, restaurants and culture."
  : "Persönliche Wegweiser durch Hamburgs feinste Adressen — kuratiert von unserem Team, mit ehrlichen Empfehlungen für Hotels, Restaurants und Kultur.")}</p>
${posts.length ? `<article><h3><a href="${navTo(`/blog/${posts[0].slug}`, lang)}"><strong>${esc(lang === "en" ? "Feature · " : "Feature · ")}${esc(posts[0].category)}: ${esc(posts[0].title)}</strong></a></h3><p>${esc(posts[0].excerpt)}</p></article>` : ""}
<ul>
${posts.slice(1, 4).map((p) => `<li><a href="${navTo(`/blog/${p.slug}`, lang)}"><strong>${esc(p.category)}</strong>: ${esc(p.title)}</a></li>`).join("")}
</ul>
<p><strong>${esc(lang === "en" ? "By category:" : "Nach Kategorie:")}</strong> <a href="${navTo("/blog?category=Luxury+Hotels+Hamburg", lang)}">Luxury Hotels Hamburg</a> · <a href="${navTo("/blog?category=Fine+Dining+Hamburg", lang)}">Fine Dining Hamburg</a> · <a href="${navTo("/blog?category=Nightlife+Hamburg", lang)}">Nightlife Hamburg</a> · <a href="${navTo("/blog?category=Business+Travel+Hamburg", lang)}">Business Travel Hamburg</a> · <a href="${navTo("/blog?category=Hamburg+Lifestyle", lang)}">Hamburg Lifestyle</a> · <a href="${navTo("/blog?category=Escort+Guides", lang)}">Escort Guides</a></p>
<p><a href="${navTo("/blog", lang)}">${esc(t("cta.allPosts", lang))}</a></p>
</section>
<section>
<h2>${esc(lang === "en" ? "Frequently asked questions" : "Häufig gestellte Fragen")}</h2>
${FAQS.slice(0, 4).map((f) => `<details><summary><strong>${esc(lang === "en" ? f.qEn : f.q)}</strong></summary><p>${esc(lang === "en" ? f.aEn : f.a)}</p></details>`).join("")}
</section>
</main>`;

  const titleByLang = {
    de: "Luxus Escort Hamburg | Premium Escort Agentur | Noir Hamburg",
    en: "Luxury Escort Hamburg | Premium Escort Agency | Noir Hamburg",
  };
  const descByLang = {
    de: "Exklusive Begleitung in Hamburg. Diskretion, Eleganz und Professionalität auf höchstem Niveau.",
    en: "Exclusive companionship in Hamburg. Discretion, elegance and professionalism at the highest level.",
  };

  return renderShell({
    ...buildAssets,
    lang,
    title: titleByLang[lang] || titleByLang.de,
    description: descByLang[lang] || descByLang.de,
    canonicalPath: "/",
    ogImage: settings.social_share_image || heroImage,
    preloadImage: heroPreload,
    // Bootstrap the resolved hero URL to the client so React's initial render
    // matches what SSG produced — no image flash on load.
    bootstrapData: { heroImage },
    jsonLd: [
      {
        "@context": "https://schema.org",
        "@type": "LocalBusiness",
        name: "Noir Hamburg",
        description: "Premium Escort Agency Hamburg",
        address: {
          "@type": "PostalAddress",
          streetAddress: "Pinneberger Chaussee 50",
          addressLocality: "Hamburg",
          postalCode: "22523",
          addressCountry: "DE",
        },
        areaServed: "Hamburg",
        telephone: getSettings().phone,
        email: getSettings().email,
        url: "https://noir-hamburg.com",
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
