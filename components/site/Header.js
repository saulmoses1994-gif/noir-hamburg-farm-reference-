import Link from 'next/link'
import { NAV } from '@/lib/site'
import { t, localePath, swappedPath } from '@/lib/i18n'
import { getBrand } from '@/lib/brand'
import MobileNav from '@/components/site/MobileNav'

// Async server component. Reads live site_settings on every request; the
// Settings PUT handler already fires revalidatePath('/', 'layout') so edits
// propagate to every layout surface on the next request without a redeploy.
export default async function Header({ lang = 'de', currentPath = '/' }) {
  const brand = await getBrand(lang)
  const swap = swappedPath(currentPath, lang)
  const navItems = NAV.map((n) => ({
    href: localePath(lang, n.to),
    label: lang === 'en' ? n.enLabel : n.deLabel,
  }))
  const mobileLabels = {
    open: lang === 'en' ? 'Open menu' : 'Men\u00fc \u00f6ffnen',
    close: lang === 'en' ? 'Close menu' : 'Men\u00fc schlie\u00dfen',
    menu: lang === 'en' ? 'Mobile navigation' : 'Mobile Navigation',
    whatsapp: t(lang, 'cta.whatsapp'),
    book: t(lang, 'cta.book'),
    workWithUs: t(lang, 'cta.workWithUs'),
    langSwitch: t(lang, 'lang.switch'),
  }
  return (
    <>
      <div className="hidden md:block bg-[#1A1414] text-white text-xs py-2 px-6 md:px-12 lg:px-16" data-testid="topbar">
        <div className="flex items-center justify-between gap-6">
          <div className="flex items-center gap-5 text-white/90">
            <a href={brand.phoneHref} className="inline-flex items-center gap-1.5 hover:text-[#E5A5B5]" data-testid="topbar-phone">
              <svg aria-hidden="true" viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-current" data-testid="topbar-phone-icon">
                <path d="M6.62 10.79a15.05 15.05 0 006.59 6.59l2.2-2.2a1 1 0 011.02-.24 11.72 11.72 0 003.68.59 1 1 0 011 1V20a1 1 0 01-1 1A17 17 0 013 4a1 1 0 011-1h3.5a1 1 0 011 1 11.72 11.72 0 00.59 3.68 1 1 0 01-.24 1.02l-2.23 2.09z"/>
              </svg>
              <span>{brand.phone}</span>
            </a>
            <a href={brand.emailHref} className="inline-flex items-center gap-1.5 hover:text-[#E5A5B5]" data-testid="topbar-email">
              <svg aria-hidden="true" viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-current" data-testid="topbar-email-icon">
                <path d="M20 4H4a2 2 0 00-2 2v12a2 2 0 002 2h16a2 2 0 002-2V6a2 2 0 00-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
              </svg>
              <span>{brand.email}</span>
            </a>
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
            Mobile navigation drawer — client component. Hidden on xl (>= 1280px)
            where the full nav is visible; shown on smaller viewports. The
            drawer contains every nav link + WhatsApp / Book / Work-with-us
            CTAs + language switcher so mobile users have parity with desktop.
          */}
          <MobileNav
            lang={lang}
            brand={brand}
            swap={swap}
            labels={mobileLabels}
            navItems={navItems}
          />
        </div>
      </header>

      {/*
        Floating WhatsApp button (FAB) — mobile only. Fixed bottom-right,
        renders on every page since Header is included in every layout.
        Auto-hides when whatsapp_number isn't configured in Settings.
        No client-side JS needed — just a styled anchor tag.
      */}
      {brand.whatsappUrl && (
        <a
          href={brand.whatsappUrl}
          target="_blank"
          rel="noreferrer nofollow"
          aria-label={lang === 'en' ? 'Chat on WhatsApp' : 'Auf WhatsApp schreiben'}
          data-testid="wa-fab"
          className="xl:hidden fixed bottom-5 right-5 z-[60] inline-flex items-center justify-center w-14 h-14 rounded-full bg-[#25D366] text-white shadow-lg shadow-black/20 hover:bg-[#1DA851] hover:scale-105 active:scale-95 transition-all duration-200"
        >
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            className="w-7 h-7 fill-current"
          >
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.71.306 1.263.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
          </svg>
        </a>
      )}
    </>
  )
}
