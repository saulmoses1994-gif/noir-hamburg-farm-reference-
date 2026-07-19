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
      <body className="font-body bg-white text-[#1A1414] antialiased">
        {children}
      </body>
    </html>
  )
}
