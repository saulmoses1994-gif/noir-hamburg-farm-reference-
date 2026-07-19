import { NextResponse } from 'next/server'

// The single canonical host for the site. Every request served on any
// other host (e.g. `www.noir-hamburg.com`) is 301-redirected here so
// there is exactly one indexable version of every URL. This resolves the
// SEMrush "No self-referencing hreflang" error caused by crawling the
// `www.` subdomain while our hreflang tags advertise the non-www domain.
const CANONICAL_HOST = 'noir-hamburg.com'

export function middleware(request) {
  const url = request.nextUrl
  const hostHeader = request.headers.get('host') || ''
  // Strip port for comparison (host header may include :port on non-standard ports).
  const hostname = hostHeader.split(':')[0].toLowerCase()

  // ── P0: force www → non-www with a single 301, preserving path + query ──
  // Only fire on the production canonical hosts — never on preview,
  // localhost, or the internal `*.preview.emergentagent.com` domain.
  if (hostname === `www.${CANONICAL_HOST}`) {
    const redirectUrl = new URL(url.pathname + url.search, `https://${CANONICAL_HOST}`)
    return NextResponse.redirect(redirectUrl, 301)
  }

  // Pass the pathname down to layouts so they can set <html lang> etc.
  const headers = new Headers(request.headers)
  headers.set('x-pathname', url.pathname)
  return NextResponse.next({ request: { headers } })
}

export const config = {
  // Include everything except Next internals and static files.
  // API routes are still matched so www→non-www applies uniformly.
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|gif|svg|ico|webp|css|js|txt|xml|woff|woff2|ttf)$).*)'],
}
