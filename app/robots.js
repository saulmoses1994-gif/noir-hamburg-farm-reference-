const BASE = process.env.NEXT_PUBLIC_SITE_URL || 'https://noir-hamburg.com'

// robots.txt for noir-hamburg.com
// NOTE: we deliberately do NOT emit a `Host:` directive. It's a non-standard
// Yandex-only extension that Google ignores and that SEMrush flags as an
// "Invalid robots.txt format" error. The canonical host is enforced via the
// www→non-www 301 redirect in middleware.js instead.
export default function robots() {
  return {
    rules: [
      { userAgent: '*', allow: '/', disallow: ['/admin', '/api'] },
    ],
    sitemap: `${BASE}/sitemap.xml`,
  }
}

