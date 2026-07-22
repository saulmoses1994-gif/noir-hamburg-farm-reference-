import Link from 'next/link'
import { localePath } from '@/lib/i18n'
import { getBrand } from '@/lib/brand'
import { resolveContentPagePath } from '@/lib/pages'

// Async server component. Reads live site_settings on every request; the
// Settings PUT handler already fires revalidatePath('/', 'layout') so edits
// propagate to every layout surface on the next request.
export default async function Footer({ lang = 'de' }) {
  const brand = await getBrand(lang)
  const socialLinks = [
    brand.instagramUrl && { href: brand.instagramUrl, label: 'Instagram', testId: 'social-instagram' },
    brand.facebookUrl && { href: brand.facebookUrl, label: 'Facebook', testId: 'social-facebook' },
    brand.twitterUrl && { href: brand.twitterUrl, label: 'X / Twitter', testId: 'social-twitter' },
  ].filter(Boolean)

  // Resolve the three CMS "legal/info" page URLs so the footer <a href> lands
  // directly on the page the browser will render (no 3xx hop). If EN copy
  // exists in the CMS the resolver returns /en/p/${slug}; otherwise it
  // returns the DE canonical /p/${slug}. This keeps SEMrush from flagging
  // internal links pointing to redirected URLs, without changing the
  // redirect middleware, hreflang tags, or CMS behaviour. See
  // lib/pages.js `resolveContentPagePath` for the full contract.
  const [discretionHref, standardsHref, bookingHref] = await Promise.all([
    resolveContentPagePath(lang, 'diskretion-und-datenschutz-noir-hamburg'),
    resolveContentPagePath(lang, 'professionelle-standards-noir-hamburg'),
    resolveContentPagePath(lang, 'so-funktioniert-eine-buchung-noir-hamburg'),
  ])

  return (
    <footer className="bg-[#1A1414] text-white/80 mt-24" data-testid="footer">
      <div className="px-6 md:px-12 lg:px-16 py-16 grid grid-cols-1 md:grid-cols-4 gap-10">
        <div>
          <div className="font-heading text-2xl">
            <span className="text-white font-semibold">Noir</span>{' '}
            <span className="text-[#E5A5B5] italic">Hamburg</span>
          </div>
          <p className="mt-4 text-sm font-light" data-testid="footer-tagline">
            {brand.tagline}
          </p>
          <p className="mt-2 text-xs font-light text-white/50" data-testid="footer-hours">
            {brand.hours}
          </p>
        </div>
        <div>
          <div className="overline text-white/60 mb-3">{lang === 'en' ? 'Contact' : 'Kontakt'}</div>
          <ul className="space-y-2 text-sm">
            <li><a href={brand.phoneHref} className="hover:text-white" data-testid="footer-phone">{brand.phone}</a></li>
            <li><a href={brand.emailHref} className="hover:text-white" data-testid="footer-email">{brand.email}</a></li>
            <li><a href={brand.whatsappUrl} className="hover:text-white" target="_blank" rel="noreferrer nofollow" data-testid="footer-whatsapp">WhatsApp</a></li>
            {brand.recruitmentWhatsappUrl && (
              <li>
                <a href={brand.recruitmentWhatsappUrl} target="_blank" rel="noreferrer nofollow" className="inline-flex items-center gap-1 mt-1 px-3 py-1 border border-white/30 text-white hover:bg-white hover:text-[#1A1414] transition-colors text-xs uppercase tracking-widest rounded-full" data-testid="footer-work-with-us">
                  {lang === 'en' ? 'Work with us' : 'Arbeite mit uns'}
                </a>
              </li>
            )}
          </ul>
          {socialLinks.length > 0 && (
            <ul className="mt-4 space-y-2 text-sm">
              {socialLinks.map((s) => (
                <li key={s.label}>
                  <a href={s.href} target="_blank" rel="noreferrer nofollow" className="hover:text-white" data-testid={s.testId}>{s.label}</a>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div>
          <div className="overline text-white/60 mb-3">{lang === 'en' ? 'Explore' : 'Entdecken'}</div>
          <ul className="space-y-2 text-sm">
            <li><Link href={localePath(lang, '/models')} className="hover:text-white">Models</Link></li>
            <li><Link href={localePath(lang, '/services')} className="hover:text-white">Services</Link></li>
            <li><Link href={localePath(lang, '/areas')} className="hover:text-white">{lang === 'en' ? 'Areas' : 'Hamburg Areas'}</Link></li>
            <li><Link href={localePath(lang, '/blog')} className="hover:text-white">Blog</Link></li>
          </ul>
        </div>
        <div>
          <div className="overline text-white/60 mb-3">{lang === 'en' ? 'Legal & Info' : 'Rechtliches & Info'}</div>
          <ul className="space-y-2 text-sm">
            <li><Link href={localePath(lang, '/impressum')} className="hover:text-white">{lang === 'en' ? 'Imprint' : 'Impressum'}</Link></li>
            {/* PERF/SEO: Link directly to the URL the browser will actually render.
                `resolveContentPagePath` returns /en/p/${slug} when the CMS
                has EN copy, /p/${slug} otherwise — avoiding the 3xx hop
                that SEMrush classifies as a "redirected internal link". */}
            <li><Link href={discretionHref} className="hover:text-white">{lang === 'en' ? 'Discretion & Privacy' : 'Diskretion & Datenschutz'}</Link></li>
            <li><Link href={standardsHref} className="hover:text-white">{lang === 'en' ? 'Professional Standards' : 'Professionelle Standards'}</Link></li>
            <li><Link href={bookingHref} className="hover:text-white">{lang === 'en' ? 'How Booking Works' : 'So funktioniert eine Buchung'}</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10 py-6 text-center text-xs text-white/50">
        © {new Date().getFullYear()} {brand.name}. {lang === 'en' ? 'All rights reserved.' : 'Alle Rechte vorbehalten.'}
      </div>
    </footer>
  )
}
