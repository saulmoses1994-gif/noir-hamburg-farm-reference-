import Link from 'next/link'
import { NAV } from '@/lib/site'
import { t, localePath, swappedPath } from '@/lib/i18n'
import { getBrand } from '@/lib/brand'

// Async server component. Reads live site_settings on every request; the
// Settings PUT handler already fires revalidatePath('/', 'layout') so edits
// propagate to every layout surface on the next request without a redeploy.
export default async function Header({ lang = 'de', currentPath = '/' }) {
  const brand = await getBrand(lang)
  const swap = swappedPath(currentPath, lang)
  return (
    <>
      <div className="hidden md:block bg-[#1A1414] text-white text-xs py-2 px-6 md:px-12 lg:px-16" data-testid="topbar">
        <div className="flex items-center justify-between gap-6">
          <div className="flex items-center gap-5 text-white/90">
            <a href={brand.phoneHref} className="hover:text-[#E5A5B5]" data-testid="topbar-phone">{brand.phone}</a>
            <a href={brand.emailHref} className="hover:text-[#E5A5B5]" data-testid="topbar-email">{brand.email}</a>
          </div>
          <div className="text-white/70 tracking-wide" data-testid="topbar-hours">
            {brand.hours}
          </div>
        </div>
      </div>

      <header className="sticky top-0 z-50 bg-white border-b border-[#1A1414]/8">
        <div className="px-6 md:px-10 lg:px-8 xl:px-10 2xl:px-16 py-4 flex items-center justify-between gap-3">
          <Link href={localePath(lang, '/')} className="font-heading text-2xl tracking-tight whitespace-nowrap" data-testid="brand-link">
            <span className="text-[#1A1414] font-semibold">Noir</span>{' '}
            <span className="accent-text italic">Hamburg</span>
          </Link>
          <nav aria-label={lang === 'en' ? 'Primary' : 'Hauptnavigation'} className="hidden xl:flex items-center gap-3 2xl:gap-6">
            {NAV.map((n) => {
              const href = localePath(lang, n.to)
              const label = lang === 'en' ? n.enLabel : n.deLabel
              return (
                <Link key={n.to} href={href} className="text-[13px] 2xl:text-sm font-medium text-[#1A1414] hover:accent-text whitespace-nowrap">
                  {label}
                </Link>
              )
            })}
          </nav>
          <div className="hidden xl:flex items-center gap-1.5 2xl:gap-2.5">
            <Link href={swap} className="inline-flex items-center gap-1 px-2.5 py-1.5 border border-[#8B1538] text-[#8B1538] text-[11px] 2xl:text-xs font-semibold tracking-widest uppercase rounded-full hover:bg-[#8B1538] hover:text-white transition-colors whitespace-nowrap" hrefLang={lang === 'de' ? 'en' : 'de'}>
              {t(lang, 'lang.switch')}
            </Link>
            <a href={brand.whatsappUrl} target="_blank" rel="noreferrer nofollow" className="btn-whatsapp whitespace-nowrap !px-4 !py-1.5 !text-xs" data-testid="header-whatsapp">
              {t(lang, 'cta.whatsapp')}
            </a>
            <Link href={localePath(lang, '/kontakt')} className="btn-primary whitespace-nowrap !px-4 !py-1.5 !text-xs">
              {t(lang, 'cta.book')}
            </Link>
            {brand.recruitmentWhatsappUrl && (
              <a
                href={brand.recruitmentWhatsappUrl}
                target="_blank"
                rel="noreferrer nofollow"
                className="inline-flex items-center gap-1 px-3 py-1.5 border border-[#1A1414] text-[#1A1414] text-[11px] 2xl:text-xs font-semibold tracking-widest uppercase rounded-full hover:bg-[#1A1414] hover:text-white transition-colors whitespace-nowrap"
                data-testid="header-work-with-us"
              >
                {t(lang, 'cta.workWithUs')}
              </a>
            )}
          </div>
          {/*
            Mobile hamburger scaffold — hidden until a mobile nav ships.
            When wiring it, use a client subcomponent that toggles a local
            `open` state and mirrors it onto both aria-expanded (below) and
            aria-controls pointing at the drawer id. This static markup keeps
            the AT contract stable for screen readers and future audits.
          */}
          <button
            type="button"
            className="xl:hidden inline-flex items-center justify-center w-10 h-10 border border-[#1A1414]/15"
            aria-expanded="false"
            aria-controls="mobile-nav"
            aria-label={lang === 'en' ? 'Open menu' : 'Men\u00fc \u00f6ffnen'}
            data-testid="mobile-nav-toggle"
            data-nav-open="false"
          >
            <span aria-hidden="true" className="block w-4 h-[2px] bg-[#1A1414] relative before:content-[''] before:absolute before:-top-1.5 before:left-0 before:w-4 before:h-[2px] before:bg-[#1A1414] after:content-[''] after:absolute after:top-1.5 after:left-0 after:w-4 after:h-[2px] after:bg-[#1A1414]" />
          </button>
        </div>
      </header>
    </>
  )
}
