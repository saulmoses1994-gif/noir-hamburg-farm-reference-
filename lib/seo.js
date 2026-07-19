// Central SEO helpers — used by every dynamic route's generateMetadata.

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_BASE_URL || 'https://noir-hamburg.com'

export function siteUrl() { return SITE_URL }

// DE ↔ EN slug pairs for pages whose EN URL differs from the DE URL.
const SLUG_MAP = {
  '/ueber-uns': '/about',
  '/kontakt': '/contact',
  '/impressum': '/imprint',
}

// Reverse map for going EN → DE (used when alternatesForLang receives an EN path).
const REVERSE_SLUG_MAP = Object.fromEntries(Object.entries(SLUG_MAP).map(([de, en]) => [en, de]))

// Given a DE path, return its EN equivalent path (still relative, prefixed with /en).
function dePathToEnPath(dePath) {
  const enSlug = SLUG_MAP[dePath] || dePath
  return `/en${enSlug === '/' ? '' : enSlug}`
}

export function alternatesFor(dePath) {
  const enPath = dePathToEnPath(dePath)
  return {
    canonical: `${SITE_URL}${dePath === '/' ? '' : dePath}`,
    languages: {
      // Use language-only codes consistently (SEMrush flags mismatches like `de-DE` + `en`).
      // Self-referencing 'de' + 'en' alternates + 'x-default' pointing at the DE URL as
      // canonical for language-neutral crawlers.
      de: `${SITE_URL}${dePath === '/' ? '' : dePath}`,
      en: `${SITE_URL}${enPath}`,
      'x-default': `${SITE_URL}${dePath === '/' ? '' : dePath}`,
    },
  }
}

// lang-aware variant: emits absolute URLs, self-referencing canonical for the
// requested language, and matching hreflang alternates. Accepts either the
// DE path (for DE pages) or the EN path with a leading `/en/…` (for EN pages).
// When called from an EN page whose canonical DE equivalent doesn't exist,
// the caller can pass hasEn/hasDe overrides via `pair` to suppress bogus alts.
export function alternatesForLang(lang, dePath, { hasEnAlternate = true, hasDeAlternate = true } = {}) {
  const enPath = dePathToEnPath(dePath)
  const deAbs = `${SITE_URL}${dePath === '/' ? '' : dePath}`
  const enAbs = `${SITE_URL}${enPath}`
  const canonicalAbs = lang === 'en' ? enAbs : deAbs
  const languages = {}
  if (hasDeAlternate) languages.de = deAbs
  if (hasEnAlternate) languages.en = enAbs
  // x-default points at the DE URL by convention (primary market).
  languages['x-default'] = deAbs
  return { canonical: canonicalAbs, languages }
}

// Convenience for pages that live only in one language (no EN pair exists).
// Emits self-referencing canonical + no cross-language alternates → prevents
// SEMrush "hreflang points to nonexistent page" warnings.
export function alternatesSingleLang(lang, path) {
  const abs = `${SITE_URL}${path === '/' ? '' : path}`
  return {
    canonical: abs,
    languages: {
      [lang]: abs,
      'x-default': abs,
    },
  }
}

export async function buildMetadata({ title, description, image, imageAlt, path, lang = 'de', pairExists = true }) {
  let resolvedImage = image
  if (!resolvedImage) {
    try {
      const { getSettings } = await import('@/lib/settings')
      const s = await getSettings()
      if (s?.social_share_image) resolvedImage = s.social_share_image
    } catch { /* noop */ }
  }
  return {
    metadataBase: new URL(SITE_URL),
    title: { absolute: title },
    description,
    alternates: alternatesForLang(lang, path, {
      hasEnAlternate: pairExists,
      hasDeAlternate: pairExists,
    }),
    openGraph: {
      title,
      description,
      url: `${SITE_URL}${lang === 'en' ? '/en' : ''}${path === '/' ? '' : path}`,
      siteName: 'Noir Hamburg',
      locale: lang === 'en' ? 'en_US' : 'de_DE',
      type: 'website',
      images: resolvedImage ? [{ url: resolvedImage, width: 1200, height: 630, alt: imageAlt || title }] : [],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: resolvedImage ? [resolvedImage] : [],
    },
    robots: { index: true, follow: true },
  }
}

export function breadcrumbSchema(items, lang = 'de') {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((it, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: it.name,
      item: it.url ? `${SITE_URL}${it.url}` : undefined,
    })),
  }
}

// ────────────────────────────────────────────────────────────────────────
//  Centralized Organization entity (SEO best practice)
//  Single canonical @id referenced by every service, model, and area page.
//  Solves SEMrush "Invalid LocalBusiness address" by omitting empty fields.
// ────────────────────────────────────────────────────────────────────────
export function organizationSchema(settings = {}) {
  const org = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': `${SITE_URL}/#organization`,
    name: 'Noir Hamburg',
    url: SITE_URL,
    logo: `${SITE_URL}/logo.png`,
    sameAs: [
      settings.instagram_url,
      settings.twitter_url,
      settings.facebook_url,
    ].filter(Boolean),
  }
  // Only include telephone/email/address when actually configured.
  if (settings.phone) org.telephone = settings.phone
  if (settings.email) org.email = settings.email
  // Skip address entirely unless a full valid PostalAddress can be emitted —
  // partial addresses trigger SEMrush "Invalid LocalBusiness schema".
  return org
}

// Lightweight reference: `{ '@id': 'https://…/#organization' }` — service
// pages should use this instead of emitting a full Organization inline.
export function organizationRef() {
  return { '@id': `${SITE_URL}/#organization` }
}
