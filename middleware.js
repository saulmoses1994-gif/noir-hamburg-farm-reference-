import { NextResponse } from 'next/server'

// The single canonical host for the site. Every request served on any other
// host (e.g. `www.noir-hamburg.com`) is 301-redirected here so there is exactly
// one indexable version of every URL. This resolves the SEMrush
// "No self-referencing hreflang" error caused by crawling the `www.` subdomain
// while our hreflang tags advertise the non-www domain.
const CANONICAL_HOST = 'noir-hamburg.com'

// Detect the hostname the *client* sent, not the internal proxy hostname.
// On Emergent's Cloud Run setup, the front-door proxy rewrites the `Host:`
// header to the origin's internal `*.run.app` name and puts the original
// user-facing hostname in `X-Forwarded-Host` (RFC 7239 / de-facto standard).
// We prefer that header, then fall back to `Host`, then to nextUrl.hostname.
function getClientHost(request) {
  const xfh = request.headers.get('x-forwarded-host')
  const h = request.headers.get('host')
  const fromUrl = request.nextUrl?.hostname
  const raw = xfh || h || fromUrl || ''
  // x-forwarded-host can contain a comma-separated list on chained proxies —
  // the leftmost value is the original client-facing host.
  return String(raw).split(',')[0].trim().split(':')[0].toLowerCase()
}

export function middleware(request) {
  const url = request.nextUrl
  const clientHost = getClientHost(request)

  // ── P0: force www → non-www with a single 301, preserving path + query ──
  if (clientHost === `www.${CANONICAL_HOST}`) {
    const redirectUrl = new URL(url.pathname + url.search, `https://${CANONICAL_HOST}`)
    const res = NextResponse.redirect(redirectUrl, 301)
    // Diagnostic: expose what the middleware saw so we can verify in curl.
    res.headers.set('x-mw-detected-host', clientHost)
    res.headers.set('x-mw-action', 'redirect-www-to-apex')
    return res
  }

  // Pass the pathname down to layouts so they can set <html lang> etc.
  const headers = new Headers(request.headers)
  headers.set('x-pathname', url.pathname)
  const res = NextResponse.next({ request: { headers } })
  // Diagnostic (safe): expose the host our middleware saw. Helps SEO debugging
  // when a proxy is in front of Next.js. Cheap to strip later.
  res.headers.set('x-mw-detected-host', clientHost)
  return res
}

export const config = {
  // Include everything except Next internals and static files.
  // API routes are still matched so www→non-www applies uniformly.
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|gif|svg|ico|webp|css|js|txt|xml|woff|woff2|ttf)$).*)'],
}
