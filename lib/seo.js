// Central SEO helpers — used by every dynamic route's generateMetadata.

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_BASE_URL || 'https://noir-hamburg.com'

export function siteUrl() { return SITE_URL }

// Safety net for authored meta_title fields. When a CMS author accidentally
// pastes a title that belongs to a different page (e.g. copies the /p/
// "Diskretion & Datenschutz" policy title into a blog post's meta_title),
// SEMrush flags it as a duplicate. We detect this by requiring the authored
// meta title to include a substantial prefix of the article's actual title.
// If the check fails, we fall back to `${articleTitle} | Noir Hamburg`.
//
// Rationale for the 8-char prefix rule:
//   • A well-authored meta_title virtually always begins with (or contains)
//     the first several characters of the actual article title.
//   • 8 characters is short enough to avoid false negatives on legitimate
//     variations (e.g. "Business Travel Hamburg 2026 — Hotels…" starts with
//     "Business" which contains "Business" prefix) while being long enough
//     to reject cross-page collisions like the observed
//     "Diskretion im Zeitalter…" article being mis-titled as
//     "Diskretion & Datenschutz…".
export function resolveArticleTitle(articleTitle, authoredMeta, brand = 'Noir Hamburg') {
  const article = String(articleTitle || '').trim()
  const meta = String(authoredMeta || '').trim()
  const fallback = article ? `${article} | ${brand}` : meta || brand
  if (!meta) return fallback
  if (!article) return meta
  const prefix = article.slice(0, 8).toLowerCase()
  if (prefix.length < 8) return meta
  const relates = meta.toLowerCase().includes(prefix)
  return relates ? meta : fallback
}


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
//
// Options:
//   hasDeAlternate — the DE counterpart exists and is indexable
//                    (almost always true; only false for EN-only content)
//   hasEnAlternate — the EN counterpart exists and is indexable
//                    (false when the EN slug is noindex due to missing EN copy)
//
// Rules enforced (fixes SEMrush hreflang conflicts):
//   • The current-language URL is ALWAYS self-referenced.
//   • The other-language URL is only alternated if it actually exists and
//     is indexable — otherwise Google would receive `hreflang → noindex page`,
//     which is the "conflicting hreflang and canonical" SEMrush error class.
//   • x-default always points to the DE URL when DE exists (our primary
//     market), otherwise to the current page.
export function alternatesForLang(lang, dePath, { hasEnAlternate = true, hasDeAlternate = true } = {}) {
  const enPath = dePathToEnPath(dePath)
  const deAbs = `${SITE_URL}${dePath === '/' ? '' : dePath}`
  const enAbs = `${SITE_URL}${enPath}`
  const canonicalAbs = lang === 'en' ? enAbs : deAbs
  const languages = {}
  // 1) Self-referencing hreflang for the current language.
  if (lang === 'de') languages.de = deAbs
  else languages.en = enAbs
  // 2) Reciprocal alternate for the other language, only if indexable.
  if (lang === 'de' && hasEnAlternate) languages.en = enAbs
  if (lang === 'en' && hasDeAlternate) languages.de = deAbs
  // 3) x-default: prefer DE (primary market) when DE exists.
  languages['x-default'] = hasDeAlternate || lang === 'de' ? deAbs : enAbs
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

export async function buildMetadata({ title, description, image, imageAlt, path, lang = 'de', hasEnAlternate = true, hasDeAlternate = true, noindex = false }) {
  let resolvedImage = image
  if (!resolvedImage) {
    try {
      const { getSettings } = await import('@/lib/settings')
      const s = await getSettings()
      if (s?.social_share_image) resolvedImage = s.social_share_image
    } catch { /* noop */ }
  }
  // For a noindex page we deliberately do NOT emit hreflang alternates.
  // Google's guidance: "Don't include a page in a hreflang cluster if it's
  // noindexed." Emitting them anyway creates a broken chain that SEMrush
  // flags as a hreflang conflict. The canonical simply points to itself.
  const alternates = noindex
    ? { canonical: `${SITE_URL}${lang === 'en' ? '/en' : ''}${path === '/' ? '' : path}` }
    : alternatesForLang(lang, path, { hasEnAlternate, hasDeAlternate })
  return {
    metadataBase: new URL(SITE_URL),
    title: { absolute: title },
    description,
    alternates,
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
    robots: noindex ? { index: false, follow: true } : { index: true, follow: true },
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
  }
  const sameAs = [
    settings.instagram_url,
    settings.twitter_url,
    settings.facebook_url,
  ].filter(Boolean)
  // Only include sameAs when we actually have URLs — empty arrays trigger
  // "Invalid value" warnings in some structured-data validators.
  if (sameAs.length) org.sameAs = sameAs
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
