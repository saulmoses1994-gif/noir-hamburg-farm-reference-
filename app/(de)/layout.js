// Root layout for the DE route group.
//
// PERF: This is now a PROPER Next.js multi-root layout (see also
// app/(en)/layout.js). Previously we had a single dynamic app/layout.js
// that called `headers()` to derive the `<html lang>` per request, which
// forced every page in the site into dynamic rendering (opting out of ISR,
// disabling CDN caching, and emitting `Cache-Control: no-store` on every
// response — the root cause of the 3-4s LCP in SEMrush field data).
//
// By moving the `<html>` shell into each locale group and hardcoding
// `lang="de"` / `lang="en"` statically, the tree contains no dynamic APIs
// at the layout level, so pages with `export const revalidate = 300`
// can actually be prerendered / ISR-cached.
//
// IMPORTANT: There is intentionally NO `app/layout.js`. Next.js supports
// multiple root layouts when each route group provides its own.

import '../globals.css'
import { Playfair_Display, DM_Sans, JetBrains_Mono } from 'next/font/google'

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

export const metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://noir-hamburg.com'),
  title: {
    default: 'Noir Hamburg — Premium Escort Agency',
    template: '%s | Noir Hamburg',
  },
  description: 'Premium Escort Hamburg — Diskrete Begleitagentur für anspruchsvolle Kunden.',
}

export default function DeRootLayout({ children }) {
  return (
    <html lang="de" className={`${playfair.variable} ${dmSans.variable} ${jbMono.variable}`}>
      <head>
        {/* CWV network hints — Cloudinary preconnect saves ~150ms on the LCP
            image handshake. Fonts are self-hosted via next/font so no external
            font-domain preconnect needed. */}
        <link rel="preconnect" href="https://res.cloudinary.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://res.cloudinary.com" />
      </head>
      <body className="font-body bg-white text-[#1A1414] antialiased">
        {children}
      </body>
    </html>
  )
}
