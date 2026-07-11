import Link from 'next/link'
import Header from '@/components/site/Header'
import Footer from '@/components/site/Footer'

// Bilingual 404. The root not-found can't reliably read the requested URL
// (Next.js does not forward `x-invoked-path` on the root fallback), so
// rather than guess wrong we show both languages side-by-side. Also used
// by the (de) and (en) group not-found files when a page calls
// notFound() from within a route group — safe there too.
export default function NotFoundBody() {
  return (
    <>
      <Header lang="de" currentPath="/" />
      <main id="main" className="px-6 md:px-12 lg:px-16 py-24 lg:py-32" data-testid="not-found">
        <div className="max-w-3xl">
          <span className="overline accent-text" data-testid="not-found-overline">404</span>
          <h1 className="font-heading text-6xl lg:text-8xl font-light tracking-tighter leading-none mt-6">
            Seite <em className="italic accent-text">nicht gefunden</em>
          </h1>
          <p className="mt-8 text-lg font-light text-[#6B5F5F] leading-relaxed max-w-xl">
            Diese Seite existiert nicht mehr oder wurde nie verlinkt. Vielleicht hilft einer dieser Wege weiter.
          </p>
          <div className="mt-10 flex flex-wrap gap-4">
            <Link href="/" className="btn-primary" data-testid="not-found-home">← Zurück zur Startseite</Link>
            <Link href="/models" className="btn-ghost" data-testid="not-found-models">Models ansehen</Link>
            <Link href="/kontakt" className="btn-ghost" data-testid="not-found-contact">Kontakt / Buchung</Link>
          </div>

          <div className="mt-16 pt-10 border-t border-[#1A1414]/8" lang="en">
            <p className="text-sm font-light text-[#6B5F5F] leading-relaxed max-w-xl">
              This page does not exist any more, or was never linked. Perhaps one of these routes will help.
            </p>
            <div className="mt-6 flex flex-wrap gap-4">
              <Link href="/en" className="btn-primary" data-testid="not-found-home-en">← Back to the homepage</Link>
              <Link href="/en/models" className="btn-ghost" data-testid="not-found-models-en">View companions</Link>
              <Link href="/en/contact" className="btn-ghost" data-testid="not-found-contact-en">Contact / Booking</Link>
            </div>
          </div>
        </div>
      </main>
      <Footer lang="de" />
    </>
  )
}
