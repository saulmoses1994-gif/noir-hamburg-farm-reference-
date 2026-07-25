// Root layout for the EN route group.
// See app/(de)/layout.js for full architectural rationale.

import '../globals.css'
import ReactDOM from 'react-dom'
import { Playfair_Display, DM_Sans, JetBrains_Mono } from 'next/font/google'

// PERF (Pass B, CWV 2026-07): Font preload budget — see app/(de)/layout.js
// for the full rationale. Mirroring the same configuration here so DE and
// EN pages have identical font-loading behaviour.
const playfair = Playfair_Display({
  subsets: ['latin'],
  weight: ['400'],
  style: ['normal', 'italic'],
  variable: '--font-heading',
  display: 'swap',
})

const dmSans = DM_Sans({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
  variable: '--font-body',
  display: 'swap',
  preload: false,
})

const jbMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400'],
  variable: '--font-mono',
  display: 'swap',
  // Preload ON — see app/(de)/layout.js for full rationale
  // (breadcrumb reflow CLS on mobile blog articles).
})

export const metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://noir-hamburg.com'),
  title: {
    default: 'Noir Hamburg — Premium Escort Agency Hamburg',
    template: '%s | Noir Hamburg',
  },
  description: 'Premium Escort Hamburg — discreet companion agency for discerning gentlemen.',
}

export default function EnRootLayout({ children }) {
  // PERF: See app/(de)/layout.js — imperative preconnect API gives the
  // Cloudinary hint the highest priority, landing before Next.js's
  // managed CSS stylesheet in the emitted <head>.
  ReactDOM.preconnect('https://res.cloudinary.com', { crossOrigin: 'anonymous' })
  ReactDOM.prefetchDNS('https://res.cloudinary.com')
  return (
    <html lang="en" className={`${playfair.variable} ${dmSans.variable} ${jbMono.variable}`}>
      <body className="font-body bg-white text-[#1A1414] antialiased">
        {children}
      </body>
    </html>
  )
}
