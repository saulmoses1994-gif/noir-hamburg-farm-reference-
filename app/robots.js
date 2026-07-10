const BASE = process.env.NEXT_PUBLIC_SITE_URL || 'https://noir-hamburg.de'

export default function robots() {
  return {
    rules: [
      { userAgent: '*', allow: '/', disallow: ['/admin', '/api'] },
    ],
    sitemap: `${BASE}/sitemap.xml`,
    host: BASE,
  }
}
