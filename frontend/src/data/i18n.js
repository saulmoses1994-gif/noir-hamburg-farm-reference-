/**
 * Noir Hamburg — UI chrome translations (DE / EN).
 *
 * Single source of truth for both the React SPA (`import { t } from "@/data/i18n"`)
 * and the Node SSR server (`require("./src/data/i18n")`). CommonJS so it works on
 * both sides. Webpack 5 detects the individual `exports.X = X` assignments at
 * the bottom as named exports, so React's `import { t, detectLang } from …` works.
 *
 * Scope: UI chrome only — nav, buttons, breadcrumbs, footer, section headings.
 * Long-form site content (service longCopy, area descriptions, FAQ answers,
 * model bios, blog posts) stays in German for now; English pages show a small
 * "Full English content coming soon" notice above them.
 */

const STRINGS = {
  de: {
    // brand / meta
    "lang.code": "de",
    "lang.label": "Deutsch",
    "lang.switch": "EN",
    "lang.switchLabel": "Switch to English",
    "site.hoursDe": "Mo – Fr · 10 – 22 Uhr  ·  Sa, So, Feiertag · 13 – 22 Uhr",

    // nav
    "nav.home": "Startseite",
    "nav.models": "Models",
    "nav.escortHamburg": "Escort Hamburg",
    "nav.services": "Services",
    "nav.areas": "Hamburg Areas",
    "nav.blog": "Blog",
    "nav.faq": "FAQ",
    "nav.about": "Über uns",
    "nav.contact": "Kontakt",

    // header CTAs
    "cta.whatsapp": "WhatsApp",
    "cta.book": "Buchen",
    "cta.bookNow": "Termin anfragen",
    "cta.discoverModels": "Models entdecken",
    "cta.allModels": "Alle Models ansehen",
    "cta.allPosts": "Alle Beiträge",
    "cta.allServices": "Alle Services",
    "cta.viewDetails": "Details ansehen",
    "cta.contactUs": "Kontakt aufnehmen",
    "cta.sendRequest": "Anfrage senden",
    "cta.menuOpen": "Menü öffnen",
    "cta.menuClose": "Menü schließen",
    "cta.skipToMain": "Zum Hauptinhalt springen",
    "cta.bookModel": "{name} buchen",
    "cta.bookInArea": "In {name} buchen",

    // breadcrumbs
    "crumb.home": "Home",
    "crumb.models": "Models",
    "crumb.services": "Services",
    "crumb.areas": "Hamburg Areas",
    "crumb.blog": "Blog",
    "crumb.faq": "FAQ",
    "crumb.about": "Über uns",
    "crumb.contact": "Kontakt",
    "crumb.escortHamburg": "Escort Hamburg",

    // hero/home
    "home.eyebrow": "Premium · Hamburg seit 2014",
    "home.h1.welcome": "Premium Escort",
    "home.h1.brand": "Hamburg",
    "home.lead":
      "Ihre vertrauenswürdige Premium-Begleitagentur in Hamburg und Umland — ehrlich, diskret und stilvoll. Wir vermitteln charmante, gebildete Persönlichkeiten für unvergessliche Begegnungen.",

    // section H2 chrome
    "sec.ourModels": "Unsere Escort Damen",
    "sec.whatWeOffer": "Was wir bieten",
    "sec.hamburgRegion": "Hamburg & Umland",
    "sec.fromMagazine": "Aktuelles aus dem Magazin",
    "sec.faq": "Häufige Fragen",
    "sec.faqH1": "Häufig gestellte Fragen",
    "sec.about": "Über uns",
    "sec.contact": "Kontakt",
    "sec.aboutPerson": "Über {name}",
    "sec.services": "Services",
    "sec.availableIn": "Verfügbar in",
    "sec.popularServices": "Beliebte Services",
    "sec.nearby": "In der Nähe",
    "sec.characteristics": "Charakteristika",
    "sec.popularAddresses": "Beliebte Adressen",

    // model card chrome
    "model.years": "Jahre",
    "model.languages": "Sprachen",
    "model.availableIn": "Verfügbar in",
    "model.height": "Größe",
    "model.nationality": "Nationalität",
    "model.hairEyes": "Haar / Augen",

    // misc
    "misc.callUs": "Telefon",
    "misc.emailUs": "E-Mail",
    "misc.loading": "Lädt…",
    "misc.footerTagline": "Premium-Begleitagentur in Hamburg und Umland.",
    "misc.contactLead":
      "Wir antworten persönlich, vertraulich und meist innerhalb weniger Stunden.",
    "misc.englishComingSoon": "",

    // pricing unit suffixes (rendered after amount, e.g. "500 EUR / pro Stunde")
    "price.unit.hour": "/ pro Stunde",
    "price.unit.flat": "",
    "price.unit.night": "/ pro Nacht",
    "price.unit.day": "/ pro Tag",
    "price.unit.weekend": "/ Wochenende",
  },

  en: {
    "lang.code": "en",
    "lang.label": "English",
    "lang.switch": "DE",
    "lang.switchLabel": "Auf Deutsch wechseln",
    "site.hoursDe": "Mon – Fri · 10 am – 10 pm  ·  Sat, Sun, Holidays · 1 pm – 10 pm",

    "nav.home": "Home",
    "nav.models": "Models",
    "nav.escortHamburg": "Escort Hamburg",
    "nav.services": "Services",
    "nav.areas": "Hamburg Areas",
    "nav.blog": "Magazine",
    "nav.faq": "FAQ",
    "nav.about": "About",
    "nav.contact": "Contact",

    "cta.whatsapp": "WhatsApp",
    "cta.book": "Book",
    "cta.bookNow": "Request Appointment",
    "cta.discoverModels": "Discover Models",
    "cta.allModels": "View all Models",
    "cta.allPosts": "All Articles",
    "cta.allServices": "All Services",
    "cta.viewDetails": "View Details",
    "cta.contactUs": "Get in Touch",
    "cta.sendRequest": "Send Request",
    "cta.menuOpen": "Open Menu",
    "cta.menuClose": "Close Menu",
    "cta.skipToMain": "Skip to main content",
    "cta.bookModel": "Book {name}",
    "cta.bookInArea": "Book in {name}",

    "crumb.home": "Home",
    "crumb.models": "Models",
    "crumb.services": "Services",
    "crumb.areas": "Hamburg Areas",
    "crumb.blog": "Magazine",
    "crumb.faq": "FAQ",
    "crumb.about": "About",
    "crumb.contact": "Contact",
    "crumb.escortHamburg": "Escort Hamburg",

    "home.eyebrow": "Premium · Hamburg since 2014",
    "home.h1.welcome": "Premium Escort",
    "home.h1.brand": "Hamburg",
    "home.lead":
      "Your trusted premium companion agency in Hamburg and the surrounding region — honest, discreet and stylish. We connect you with charming, well-educated personalities for unforgettable encounters.",

    "sec.ourModels": "Our Companions",
    "sec.whatWeOffer": "What We Offer",
    "sec.hamburgRegion": "Hamburg & Surroundings",
    "sec.fromMagazine": "From the Magazine",
    "sec.faq": "Frequently Asked Questions",
    "sec.faqH1": "Frequently Asked Questions",
    "sec.about": "About",
    "sec.contact": "Contact",
    "sec.aboutPerson": "About {name}",
    "sec.services": "Services",
    "sec.availableIn": "Available in",
    "sec.popularServices": "Popular Services",
    "sec.nearby": "Nearby",
    "sec.characteristics": "Characteristics",
    "sec.popularAddresses": "Notable Addresses",

    "model.years": "years",
    "model.languages": "Languages",
    "model.availableIn": "Available in",
    "model.height": "Height",
    "model.nationality": "Nationality",
    "model.hairEyes": "Hair / Eyes",

    "misc.callUs": "Phone",
    "misc.emailUs": "Email",
    "misc.loading": "Loading…",
    "misc.footerTagline": "Premium companion agency in Hamburg and the surrounding region.",
    "misc.contactLead":
      "We respond personally, confidentially, and usually within a few hours.",
    "misc.englishComingSoon":
      "Detailed editorial copy is currently available in German only — a full English edition is on its way. Personal enquiries in English are warmly welcomed.",

    "price.unit.hour": "/ per hour",
    "price.unit.flat": "",
    "price.unit.night": "/ per night",
    "price.unit.day": "/ per day",
    "price.unit.weekend": "/ weekend",
  },
};

const SLUG_MAP = {
  about: { de: "/ueber-uns", en: "/about" },
  contact: { de: "/kontakt", en: "/contact" },
};

const t = (key, lang, vars) => {
  const ln = lang || "de";
  const dict = STRINGS[ln] || STRINGS.de;
  let s = dict[key];
  if (s == null) s = STRINGS.de[key] != null ? STRINGS.de[key] : key;
  if (vars) {
    for (const k of Object.keys(vars)) {
      s = s.replace(new RegExp("\\{" + k + "\\}", "g"), vars[k]);
    }
  }
  return s;
};

const localizePath = (currentPath, targetLang) => {
  const basePath = currentPath.replace(/^\/en(?=\/|$)/, "") || "/";
  let canonical = basePath;
  for (const key of Object.keys(SLUG_MAP)) {
    const entry = SLUG_MAP[key];
    if (entry.de === basePath || entry.en === basePath) {
      canonical = entry;
      break;
    }
  }
  let targetPath;
  if (typeof canonical === "object") {
    targetPath = canonical[targetLang] || canonical.de;
  } else {
    targetPath = basePath;
  }
  if (targetLang === "en") {
    if (targetPath === "/") return "/en";
    return "/en" + targetPath;
  }
  return targetPath;
};

const detectLang = (pathname) =>
  /^\/en(\/|$)/.test(pathname || "") ? "en" : "de";

exports.STRINGS = STRINGS;
exports.t = t;
exports.localizePath = localizePath;
exports.detectLang = detectLang;
