// Pick DE or EN value from a CMS payload with *_en variants.
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
    'crumb.home': 'Startseite',
    'crumb.services': 'Services',
    'crumb.areas': 'Hamburg Areas',
    'cta.book': 'Termin',
    'cta.bookNow': 'Termin buchen',
    'cta.whatsapp': 'WhatsApp',
    'cta.discoverModels': 'Models entdecken',
    'cta.viewDetails': 'Details ansehen',
    'sec.characteristics': 'Merkmale',
    'sec.availableIn': 'Verfügbar in',
    'lang.switch': 'EN',
    'nav.langLabel': 'Sprache wechseln',
  },
  en: {
    'crumb.home': 'Home',
    'crumb.services': 'Services',
    'crumb.areas': 'Hamburg Areas',
    'cta.book': 'Book',
    'cta.bookNow': 'Book now',
    'cta.whatsapp': 'WhatsApp',
    'cta.discoverModels': 'Discover models',
    'cta.viewDetails': 'View details',
    'sec.characteristics': 'Characteristics',
    'sec.availableIn': 'Available in',
    'lang.switch': 'DE',
    'nav.langLabel': 'Switch language',
  },
}

export function t(lang, key) {
  return DICT[lang]?.[key] || DICT.de[key] || key
}

// Map a canonical DE path to its EN counterpart (or vice versa).
const DE_EN_MAP = {
  '/ueber-uns': '/about',
  '/kontakt': '/contact',
  '/impressum': '/imprint',
}
const EN_DE_MAP = Object.fromEntries(Object.entries(DE_EN_MAP).map(([k, v]) => [v, k]))

export function localePath(lang, path) {
  // path is always the canonical DE path (e.g. /services/xyz, /ueber-uns).
  if (lang === 'de') return path
  const mapped = DE_EN_MAP[path] || path
  return `/en${mapped === '/' ? '' : mapped}`
}

export function swappedPath(currentPath, currentLang) {
  // Compute the twin URL in the other language for the language switcher.
  if (currentLang === 'de') {
    return localePath('en', currentPath)
  }
  // currentPath is `/en/...`
  const stripped = currentPath.replace(/^\/en/, '') || '/'
  const dePath = EN_DE_MAP[stripped] || stripped
  return dePath
}
