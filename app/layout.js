import './globals.css'
import { headers } from 'next/headers'

export const metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://noir-hamburg.com'),
}

// Root layout — required by Next.js so app/not-found.js can render for URLs
// that don't match any route group. The `<html lang>` attribute is derived
// dynamically from the request path (`x-pathname` header set by middleware.js)
// so pages under /en/ correctly declare English to crawlers, fixing SEMrush's
// "language mismatch" warning on /en/p/diskretion and other EN pages.
export default async function RootLayout({ children }) {
  const hdrs = await headers()
  const pathname = hdrs.get('x-pathname') || '/'
  const lang = pathname.startsWith('/en/') || pathname === '/en' ? 'en' : 'de'
  return (
    <html lang={lang}>
      <head>
        {/* Core Web Vitals — early network hints. `preconnect` opens the TCP+TLS
            handshake immediately so the actual font/image requests skip the
            2×RTT setup cost. `dns-prefetch` is the older fallback for browsers
            that don't act on `preconnect`. This alone shaves roughly 100-250ms
            off first-contentful and largest-contentful paint on cold visits. */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://res.cloudinary.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://fonts.googleapis.com" />
        <link rel="dns-prefetch" href="https://res.cloudinary.com" />
      </head>
      <body className="font-body bg-white text-[#1A1414] antialiased">
        {children}
      </body>
    </html>
  )
}
