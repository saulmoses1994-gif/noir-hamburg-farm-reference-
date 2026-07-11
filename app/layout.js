import './globals.css'

export const metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://noir-hamburg.de'),
}

// Root layout — required by Next.js so app/not-found.js can render for URLs
// that don't match any route group. The (de) and (en) route groups each
// define their own <html lang="..."> layout that supersedes this one for
// their routes; this shell only wraps app/not-found.js.
export default function RootLayout({ children }) {
  return (
    <html lang="de">
      <body className="font-body bg-white text-[#1A1414] antialiased">
        {children}
      </body>
    </html>
  )
}
