// Pick DE or EN value from a CMS payload with *_en variants.
// If the EN variant is empty/missing, fall back to DE (rule (a)).
export function pick(obj, key, lang) {
  if (!obj) return undefined
  if (lang === 'en') {
    const enKey = `${key}_en`
    if (obj[enKey] !== undefined && obj[enKey] !== null && obj[enKey] !== '' &&
        !(Array.isArray(obj[enKey]) && obj[enKey].length === 0)) {
      return obj[enKey]
    }
  }
  return obj[key]
}

export const DICT = {
  de: {
    // Nav / chrome
    'crumb.home': 'Home',
    'crumb.services': 'Services',
    'crumb.models': 'Models',
    'crumb.areas': 'Hamburg Areas',
    'crumb.blog': 'Blog',
    'lang.switch': 'EN',
    'nav.langLabel': 'Sprache wechseln',

    // Common CTAs
    'cta.book': 'Termin',
    'cta.bookNow': 'Termin buchen',
    'cta.bookNowArrow': 'Termin buchen \u2192',
    'cta.whatsapp': 'WhatsApp',
    'cta.discoverModels': 'Models entdecken',
    'cta.viewDetails': 'Details ansehen',
    'cta.viewAll': 'Alle ansehen \u2192',
    'cta.exploreServices': 'Services entdecken',
    'cta.contactUs': 'Jetzt anfragen',

    // Sections
    'sec.characteristics': 'Merkmale',
    'sec.availableIn': 'Verf\u00fcgbar in',
    'sec.questions': 'Fragen',
    'sec.faqPrefix': 'H\u00e4ufige Fragen zu',
    'sec.relatedServices': 'Verwandte Services',

    // Model detail labels
    'model.overline': 'Model',
    'model.about': '\u00dcber',
    'model.age': 'Alter',
    'model.ageUnit': 'Jahre',
    'model.height': 'H\u00f6he',
    'model.measurements': 'Ma\u00dfe',
    'model.dress': 'Konfektion',
    'model.hair': 'Haar',
    'model.eyes': 'Augen',
    'model.nationality': 'Herkunft',
    'model.languages': 'Sprachen',
    'model.prices': 'Preise',
    'model.services': 'Services',
    'model.featured': 'Featured',
    'model.available': 'verf\u00fcgbar',
    'model.notAvailable': 'nicht verf.',
    'models.list.overline': 'Unsere Damen',
    'models.list.title': 'Models',
    'models.list.intro': 'Handverlesene Begleitung f\u00fcr anspruchsvolle Kunden \u2014 vom ersten Kaffee bis zum stilvollen Dinner.',

    // Service detail labels
    'service.overline': 'Service',

    // Blog — list
    'blog.list.overline': 'Journal',
    'blog.list.title1': 'Noir',
    'blog.list.title2': 'Magazin',
    'blog.list.intro': 'Geschichten, Empfehlungen und Insider-Wissen aus dem Hamburger Premium-Lifestyle.',
    'blog.list.metaTitle': 'Magazin \u2014 Noir Hamburg | Lifestyle, Hamburg Guide & Reiseempfehlungen',
    'blog.list.metaDesc': 'Das Noir Hamburg Magazin: Restaurants, Hotels, Reisen, Lifestyle und Hamburg-Insider-Wissen f\u00fcr anspruchsvolle Genie\u00dfer.',
    'blog.categories.label': 'Kategorien',
    'blog.categories.all': 'Alle',
    'blog.empty': 'Keine Beitr\u00e4ge in dieser Kategorie.',

    // Blog — detail
    'blog.detail.notFoundTitle': 'Artikel nicht gefunden',
    'blog.detail.notFound': 'Artikel nicht gefunden.',
    'blog.detail.contactTop': 'Kontakt / Buchung \u2192',
    'blog.detail.modelsTop': 'Escort Hamburg \u2014 Alle Models',
    'blog.detail.enFallbackTitle': 'EN preview.',
    'blog.detail.enFallback': 'Die englische Fassung folgt in K\u00fcrze. Sie lesen aktuell die deutsche Originalversion.',
    'blog.detail.toc': 'Inhaltsverzeichnis',
    'blog.detail.viewModelsCta': 'Unsere Escort Hamburg Models ansehen',
    'blog.detail.faqOverline': 'Fragen',
    'blog.detail.faqTitle': 'H\u00e4ufige Fragen',
    'blog.detail.relatedServices': 'Verwandte Services',
    'blog.detail.relatedAreas': 'Verwandte Orte',
    'blog.detail.relatedModels': 'Unsere Models',
    'blog.detail.relatedArticles': 'Weitere Artikel',
    'blog.detail.contactBoxTitle': 'Kontakt Noir Hamburg',
    'blog.detail.contactBoxBody': 'Diskret, pers\u00f6nlich, sieben Tage die Woche. Kontaktieren Sie uns per WhatsApp, E-Mail oder Kontaktformular.',
    'blog.detail.contactBoxAction': 'Kontakt / Buchung',
    'blog.detail.contactBoxSecondary': 'Models ansehen',
    'blog.detail.backToMag': '\u2190 Zur\u00fcck zum Magazin',

    // Area detail
    'area.overline': 'Escort',
    'area.notFound': 'Standort nicht gefunden.',
    'area.companionsHeading': 'Begleitung in',
    'area.popularAddresses': 'Bekannte Adressen',
    'area.popularServices': 'Beliebte Services',
    'area.nearby': 'Weitere Stadtteile',
    'area.faqHeading': 'H\u00e4ufige Fragen \u2014 Escort in',
    'area.bookInArea': 'In {name} anfragen',
    'area.modelsHeading': 'Models in',

    // Custom pages (/p/[slug])
    'page.notFound': 'Seite nicht gefunden.',
    'page.relatedServices': 'Passende Services',
    'page.relatedLocations': 'Verwandte Orte',
    'page.enFallbackTitle': 'EN preview.',
    'page.enFallback': 'Die englische Fassung folgt in K\u00fcrze. Sie lesen aktuell die deutsche Originalversion.',

    // Contact page + form
    'contact.crumb': 'Kontakt',
    'contact.metaTitle': 'Kontakt \u2014 Diskrete Buchung | Noir Hamburg',
    'contact.metaDesc': 'Nehmen Sie diskret Kontakt zu Noir Hamburg auf. Wir antworten pers\u00f6nlich und vertraulich \u2013 per E-Mail, Telefon oder WhatsApp.',
    'contact.overline': 'Buchung & Anfrage',
    'contact.h1a': 'Diskret',
    'contact.h1b': 'kontaktieren',
    'contact.intro': 'Wir antworten pers\u00f6nlich, vertraulich und meist innerhalb weniger Stunden.',
    'contact.form.name': 'Name',
    'contact.form.email': 'E-Mail',
    'contact.form.phone': 'Telefon (optional)',
    'contact.form.service': 'Service',
    'contact.form.serviceDefault': 'Bitte w\u00e4hlen',
    'contact.form.serviceOther': 'Andere / Sonstiges',
    'contact.form.date': 'Wunschtermin (optional)',
    'contact.form.datePlaceholder': 'z.\u202fB. Freitag Abend, 19\u00a0Uhr',
    'contact.form.message': 'Ihre Nachricht',
    'contact.form.messagePlaceholder': 'Anlass, W\u00fcnsche, Hinweise \u2026',
    'contact.form.consent': 'Ich stimme der Kontaktaufnahme zu und habe die',
    'contact.form.consentLink': 'Diskretionserkl\u00e4rung',
    'contact.form.consentTail': 'gelesen.',
    'contact.form.submit': 'Anfrage senden',
    'contact.form.sending': 'Wird gesendet \u2026',
    'contact.form.honeypot': 'Firma (nicht ausf\u00fcllen)',
    'contact.err.required': 'Pflichtfeld',
    'contact.err.email': 'Bitte g\u00fcltige E-Mail eingeben.',
    'contact.err.min20': 'Bitte mindestens 20 Zeichen \u2014 hilft uns, Ihre Anfrage besser einzuordnen.',
    'contact.err.consent': 'Bitte best\u00e4tigen Sie, dass wir Sie kontaktieren d\u00fcrfen.',
    'contact.err.network': '\u00dcbermittlung fehlgeschlagen. Bitte erneut versuchen.',
    'contact.success.overline': 'Anfrage erhalten',
    'contact.success.h1a': 'Vielen',
    'contact.success.h1b': 'Dank',
    'contact.success.body': 'Wir haben Ihre Anfrage erhalten und melden uns pers\u00f6nlich, diskret und meist innerhalb weniger Stunden.',
    'contact.success.reset': 'Neue Anfrage schreiben',
    'contact.direct.title': 'Direkt',
    'contact.direct.whatsapp': 'WhatsApp',
    'contact.direct.phone': 'Telefon',
    'contact.direct.email': 'E-Mail',
    'contact.privacy.title': 'Diskretion',
    'contact.privacy.body': 'Alle Anfragen werden vertraulich behandelt. Pers\u00f6nliche Daten werden ausschlie\u00dflich zur Vermittlung verwendet und nach Abschluss eines Termins fachgerecht gel\u00f6scht.',

    // About page
    'about.crumb': '\u00dcber uns',
    'about.metaTitle': '\u00dcber uns \u2014 Die Philosophie von Noir Hamburg',
    'about.metaDesc': 'Noir Hamburg ist eine kleine, kuratierte Premium-Begleitagentur in Hamburg. Lernen Sie unsere Werte, Standards und unser Verst\u00e4ndnis von Diskretion kennen.',
    'about.overline': 'Die Agentur',
    'about.h1a': '\u00dcber',
    'about.h1b': 'uns',
    'about.principles': 'Unsere Prinzipien',
    'about.cta.h1a': 'Beginnen Sie ein',
    'about.cta.h1b': 'Gespr\u00e4ch',
    'about.cta.action': 'Kontakt aufnehmen',

    // Impressum
    'impressum.crumb': 'Impressum',
    'impressum.overline': 'Rechtliches',
    'impressum.h1': 'Impressum',
    'impressum.metaTitle': 'Impressum | Noir Hamburg',
    'impressum.metaDesc': 'Impressum von Noir Hamburg gem\u00e4\u00df \u00a7 5 TMG \u2014 Anbieteradresse, Kontakt, Bildrechte und Jugendschutzbeauftragter.',

    // FAQ page
    'faq.crumb': 'FAQ',
    'faq.metaTitle': 'FAQ \u2014 H\u00e4ufige Fragen | Noir Hamburg Premium Escort',
    'faq.metaDesc': 'Antworten auf h\u00e4ufige Fragen zum Buchungsprozess, Diskretion, Verf\u00fcgbarkeit und Zahlungsmodalit\u00e4ten bei Noir Hamburg.',
    'faq.overline': 'Wissenswertes',
    'faq.h1a': 'H\u00e4ufige',
    'faq.h1b': 'Fragen',
    'faq.intro': 'Antworten auf das, was unsere Klienten am h\u00e4ufigsten wissen m\u00f6chten.',
    'faq.cta.h1a': 'Noch eine Frage \u00fcbrig? Wir antworten',
    'faq.cta.h1b': 'pers\u00f6nlich',
    'faq.cta.action': 'Kontakt aufnehmen',
  },
  en: {
    // Nav / chrome
    'crumb.home': 'Home',
    'crumb.services': 'Services',
    'crumb.models': 'Models',
    'crumb.areas': 'Areas',
    'crumb.blog': 'Blog',
    'lang.switch': 'DE',
    'nav.langLabel': 'Switch language',

    // Common CTAs
    'cta.book': 'Book',
    'cta.bookNow': 'Book now',
    'cta.bookNowArrow': 'Book now \u2192',
    'cta.whatsapp': 'WhatsApp',
    'cta.discoverModels': 'Discover models',
    'cta.viewDetails': 'View details',
    'cta.viewAll': 'View all \u2192',
    'cta.exploreServices': 'Explore services',
    'cta.contactUs': 'Get in touch',

    // Sections
    'sec.characteristics': 'Characteristics',
    'sec.availableIn': 'Available in',
    'sec.questions': 'Questions',
    'sec.faqPrefix': 'FAQ \u2014',
    'sec.relatedServices': 'Related services',

    // Model detail labels
    'model.overline': 'Model',
    'model.about': 'About',
    'model.age': 'Age',
    'model.ageUnit': 'years',
    'model.height': 'Height',
    'model.measurements': 'Measurements',
    'model.dress': 'Dress',
    'model.hair': 'Hair',
    'model.eyes': 'Eyes',
    'model.nationality': 'Nationality',
    'model.languages': 'Languages',
    'model.prices': 'Rates',
    'model.services': 'Services',
    'model.featured': 'Featured',
    'model.available': 'available',
    'model.notAvailable': 'not avail.',
    'models.list.overline': 'Our companions',
    'models.list.title': 'Models',
    'models.list.intro': 'Handpicked companionship for discerning gentlemen \u2014 from the first coffee to the stylish dinner.',

    // Service detail labels
    'service.overline': 'Service',

    // Blog — list
    'blog.list.overline': 'Journal',
    'blog.list.title1': 'Noir',
    'blog.list.title2': 'Magazine',
    'blog.list.intro': "Stories, recommendations and insider knowledge from Hamburg's premium lifestyle.",
    'blog.list.metaTitle': 'Magazine \u2014 Noir Hamburg | Lifestyle, Hamburg Guide & Travel Recommendations',
    'blog.list.metaDesc': "The Noir Hamburg Magazine: restaurants, hotels, travel, lifestyle and Hamburg insider knowledge for discerning connoisseurs.",
    'blog.categories.label': 'Categories',
    'blog.categories.all': 'All',
    'blog.empty': 'No articles in this category.',

    // Blog — detail
    'blog.detail.notFoundTitle': 'Article not found',
    'blog.detail.notFound': 'Article not found.',
    'blog.detail.contactTop': 'Contact / Booking \u2192',
    'blog.detail.modelsTop': 'Escort Hamburg \u2014 All Models',
    'blog.detail.enFallbackTitle': 'EN preview.',
    'blog.detail.enFallback': 'The English translation is coming soon. You are currently reading the German original.',
    'blog.detail.toc': 'Table of Contents',
    'blog.detail.viewModelsCta': 'View our Escort Hamburg Models',
    'blog.detail.faqOverline': 'Questions',
    'blog.detail.faqTitle': 'Frequently asked questions',
    'blog.detail.relatedServices': 'Related Services',
    'blog.detail.relatedAreas': 'Related Areas',
    'blog.detail.relatedModels': 'Meet Our Models',
    'blog.detail.relatedArticles': 'More from the Magazine',
    'blog.detail.contactBoxTitle': 'Contact Noir Hamburg',
    'blog.detail.contactBoxBody': 'Discreet, personal, seven days a week. Reach out via WhatsApp, e-mail or our contact form.',
    'blog.detail.contactBoxAction': 'Contact / Booking',
    'blog.detail.contactBoxSecondary': 'View Models',
    'blog.detail.backToMag': '\u2190 Back to the Magazine',

    // Area detail
    'area.overline': 'Escort',
    'area.notFound': 'Location not found.',
    'area.companionsHeading': 'Companionship in',
    'area.popularAddresses': 'Notable addresses',
    'area.popularServices': 'Popular services',
    'area.nearby': 'Other districts',
    'area.faqHeading': 'FAQ \u2014 Escort in',
    'area.bookInArea': 'Enquire in {name}',
    'area.modelsHeading': 'Companions in',

    // Custom pages (/p/[slug])
    'page.notFound': 'Page not found.',
    'page.relatedServices': 'Related Services',
    'page.relatedLocations': 'Related Areas',
    'page.enFallbackTitle': 'EN preview.',
    'page.enFallback': 'The English translation is coming soon. You are currently reading the German original.',

    // Contact page + form
    'contact.crumb': 'Contact',
    'contact.metaTitle': 'Contact \u2014 Discreet Booking | Noir Hamburg',
    'contact.metaDesc': 'Get in touch with Noir Hamburg \u2014 discreetly and personally. We reply by e-mail, phone or WhatsApp, usually within a few hours.',
    'contact.overline': 'Booking & Enquiry',
    'contact.h1a': 'Contact',
    'contact.h1b': 'discreetly',
    'contact.intro': 'We reply personally, confidentially and usually within a few hours.',
    'contact.form.name': 'Name',
    'contact.form.email': 'E-mail',
    'contact.form.phone': 'Phone (optional)',
    'contact.form.service': 'Service',
    'contact.form.serviceDefault': 'Please choose',
    'contact.form.serviceOther': 'Other',
    'contact.form.date': 'Preferred date & time (optional)',
    'contact.form.datePlaceholder': 'e.g. Friday evening, 7\u00a0pm',
    'contact.form.message': 'Your message',
    'contact.form.messagePlaceholder': 'Occasion, wishes, notes \u2026',
    'contact.form.consent': 'I agree to be contacted and have read the',
    'contact.form.consentLink': 'Discretion policy',
    'contact.form.consentTail': '.',
    'contact.form.submit': 'Send enquiry',
    'contact.form.sending': 'Sending \u2026',
    'contact.form.honeypot': 'Company (do not fill)',
    'contact.err.required': 'Required',
    'contact.err.email': 'Please enter a valid e-mail address.',
    'contact.err.min20': 'Please write at least 20 characters \u2014 it helps us understand your enquiry.',
    'contact.err.consent': 'Please confirm that we may contact you.',
    'contact.err.network': 'Submission failed. Please try again.',
    'contact.success.overline': 'Enquiry received',
    'contact.success.h1a': 'Thank',
    'contact.success.h1b': 'you',
    'contact.success.body': 'We have received your enquiry and will be in touch personally, discreetly and usually within a few hours.',
    'contact.success.reset': 'Send another enquiry',
    'contact.direct.title': 'Direct',
    'contact.direct.whatsapp': 'WhatsApp',
    'contact.direct.phone': 'Phone',
    'contact.direct.email': 'E-mail',
    'contact.privacy.title': 'Discretion',
    'contact.privacy.body': 'All enquiries are handled confidentially. Personal data is used exclusively for arranging the booking and permanently deleted after the engagement.',

    // About page
    'about.crumb': 'About',
    'about.metaTitle': 'About \u2014 The philosophy of Noir Hamburg',
    'about.metaDesc': 'Noir Hamburg is a small, curated premium companion agency in Hamburg. Learn about our values, standards and our understanding of discretion.',
    'about.overline': 'The Agency',
    'about.h1a': 'About',
    'about.h1b': 'us',
    'about.principles': 'Our principles',
    'about.cta.h1a': 'Start a',
    'about.cta.h1b': 'conversation',
    'about.cta.action': 'Get in touch',

    // Impressum (renders as "Imprint" in EN but is a DE legal page)
    'impressum.crumb': 'Imprint',
    'impressum.overline': 'Legal',
    'impressum.h1': 'Imprint',
    'impressum.metaTitle': 'Imprint | Noir Hamburg',
    'impressum.metaDesc': 'Legal imprint of Noir Hamburg per \u00a7 5 TMG \u2014 company address, contact, image credits and youth-protection officer.',

    // FAQ page
    'faq.crumb': 'FAQ',
    'faq.metaTitle': 'FAQ \u2014 Frequently Asked Questions | Noir Hamburg Premium Escort',
    'faq.metaDesc': 'Answers to common questions about bookings, discretion, availability and payment with Noir Hamburg.',
    'faq.overline': 'Good to know',
    'faq.h1a': 'Frequently',
    'faq.h1b': 'Asked',
    'faq.intro': 'Answers to what our clients ask most frequently.',
    'faq.cta.h1a': 'Still have a question? We reply',
    'faq.cta.h1b': 'personally',
    'faq.cta.action': 'Get in touch',
  },
}

export function t(lang, key) {
  return DICT[lang]?.[key] ?? DICT.de[key] ?? key
}

// --- Attribute-value translator ---------------------------------------------
// Small dictionary for German data-values that have no *_en column in the DB
// (hair_color, eye_color, nationality, languages[], prices[].label).
// Unknown values fall through unchanged.
const ATTR_DE_TO_EN = {
  // hair colors
  'Blond': 'Blonde',
  'Br\u00fcnett': 'Brunette',
  'Br\u00fcnette': 'Brunette',
  'Kastanienbraun': 'Chestnut',
  'Schwarz': 'Black',
  'Rot': 'Red',
  'Braun': 'Brown',

  // eye colors
  'Blau': 'Blue',
  'Gr\u00fcn': 'Green',
  'Grau': 'Grey',
  'Haselnussbraun': 'Hazel',

  // nationalities / languages
  'Deutsch': 'German',
  'Englisch': 'English',
  'Franz\u00f6sisch': 'French',
  'Italienisch': 'Italian',
  'Spanisch': 'Spanish',
  'Russisch': 'Russian',
  'Polnisch': 'Polish',
  'T\u00fcrkisch': 'Turkish',

  // price / time units
  '1 Stunde': '1 hour',
  '2 Stunden': '2 hours',
  '3 Stunden': '3 hours',
  '4 Stunden': '4 hours',
  'Halber Tag': 'Half day',
  'Ganzer Tag': 'Full day',
  '\u00dcbernachtung': 'Overnight',
  'Wochenende': 'Weekend',
  'Reise': 'Travel',
  'Nacht': 'Night',
}

export function translateAttribute(value, lang) {
  if (lang !== 'en' || value == null) return value
  if (typeof value !== 'string') return value
  return ATTR_DE_TO_EN[value.trim()] ?? value
}

// Map a canonical DE path to its EN counterpart (or vice versa).
const DE_EN_MAP = {
  '/ueber-uns': '/about',
  '/kontakt': '/contact',
  '/impressum': '/imprint',
}
const EN_DE_MAP = Object.fromEntries(Object.entries(DE_EN_MAP).map(([k, v]) => [v, k]))

export function localePath(lang, path) {
  if (lang === 'de') return path
  const mapped = DE_EN_MAP[path] || path
  return `/en${mapped === '/' ? '' : mapped}`
}

export function swappedPath(currentPath, currentLang) {
  if (currentLang === 'de') return localePath('en', currentPath)
  const stripped = currentPath.replace(/^\/en/, '') || '/'
  const dePath = EN_DE_MAP[stripped] || stripped
  return dePath
}
