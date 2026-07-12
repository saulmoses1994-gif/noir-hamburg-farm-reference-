// Central SEO helpers — used by every dynamic route's generateMetadata.

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_BASE_URL || 'https://noir-hamburg.com'

export function siteUrl() { return SITE_URL }

// Build a Next.js Metadata object with canonical + hreflang for the given
// canonical DE path.  EN path is derived by prefixing /en (with the special
// DE→EN slug mapping for /ueber-uns → /about etc.).
const SLUG_MAP = {
  '/ueber-uns': '/about',
  '/kontakt': '/contact',
  '/impressum': '/imprint',
}

export function alternatesFor(dePath) {
  const enSlug = SLUG_MAP[dePath] || dePath
  const enPath = `/en${enSlug === '/' ? '' : enSlug}`
  return {
    canonical: dePath,
    languages: {
      'de-DE': dePath,
      en: enPath,
      'x-default': dePath,
    },
  }
}

export function alternatesForLang(lang, dePath) {
  const enSlug = SLUG_MAP[dePath] || dePath
  const enPath = `/en${enSlug === '/' ? '' : enSlug}`
  return {
    canonical: lang === 'en' ? enPath : dePath,
    languages: {
      'de-DE': dePath,
      en: enPath,
      'x-default': dePath,
    },
  }
}

export function buildMetadata({ title, description, image, imageAlt, path, lang = 'de' }) {
  return {
    metadataBase: new URL(SITE_URL),
    // Use { absolute } so per-page titles that already end with "| Noir Hamburg"
    // don't get the layout template ("%s | Noir Hamburg") appended again.
    title: { absolute: title },
    description,
    alternates: alternatesForLang(lang, path),
    openGraph: {
      title,
      description,
      url: `${SITE_URL}${lang === 'en' ? '/en' : ''}${path === '/' ? '' : path}`,
      siteName: 'Noir Hamburg',
      locale: lang === 'en' ? 'en_US' : 'de_DE',
      type: 'website',
      images: image ? [{ url: image, width: 1200, height: 630, alt: imageAlt || title }] : [],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: image ? [image] : [],
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
