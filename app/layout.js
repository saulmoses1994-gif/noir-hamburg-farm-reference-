import './globals.css'
import { headers } from 'next/headers'
import { Playfair_Display, DM_Sans, JetBrains_Mono } from 'next/font/google'

export const metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://noir-hamburg.com'),
}

// next/font/google — self-hosts the font files at build time. Benefits vs the
// previous CSS `@import url(fonts.googleapis.com/…)`:
//   • Zero external DNS/TLS handshake — files come from the same origin as
//     the HTML, so first paint isn't gated on a 3rd-party round-trip.
//   • Automatic <link rel="preload"> for the actual .woff2 files.
//   • Automatic `size-adjust` metrics injection — prevents the CLS bump
//     that happens when the fallback system font is swapped for the web
//     font mid-paint.
//   • Weights trimmed to the ones actually used in the codebase (audit
//     showed only font-light/normal/medium/semibold are referenced, no
//     font-bold anywhere → drop 700 and 800 to save ~30KB per file).
const playfair = Playfair_Display({
  subsets: ['latin'],
  weight: ['400', '500'],
  style: ['normal', 'italic'],
  variable: '--font-heading',
  display: 'swap',
})

const dmSans = DM_Sans({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
  variable: '--font-body',
  display: 'swap',
})

const jbMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400'],
  variable: '--font-mono',
  display: 'swap',
})

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
    <html lang={lang} className={`${playfair.variable} ${dmSans.variable} ${jbMono.variable}`}>
      <head>
        {/* CWV network hints. Fonts are now self-hosted via next/font, so we
            no longer preconnect to fonts.googleapis.com — the browser fetches
            .woff2 files from the same origin as the HTML. We keep the
            Cloudinary preconnect because every hero and card image lives on
            res.cloudinary.com and benefits from an early TLS handshake. */}
        <link rel="preconnect" href="https://res.cloudinary.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://res.cloudinary.com" />
      </head>
      <body className="font-body bg-white text-[#1A1414] antialiased">
        {children}
      </body>
    </html>
  )
}
