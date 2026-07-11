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
