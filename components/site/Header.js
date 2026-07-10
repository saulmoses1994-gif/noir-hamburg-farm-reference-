import Link from 'next/link'
import { NAV, BRAND } from '@/lib/site'
import { t, localePath, swappedPath } from '@/lib/i18n'

export default function Header({ lang = 'de', currentPath = '/' }) {
  const swap = swappedPath(currentPath, lang)
  return (
    <>
      <div className="hidden md:block bg-[#1A1414] text-white text-xs py-2 px-6 md:px-12 lg:px-16">
        <div className="flex items-center justify-between gap-6">
          <div className="flex items-center gap-5 text-white/90">
            <a href={`tel:${BRAND.phone}`} className="hover:text-[#E5A5B5]">{BRAND.phone}</a>
            <a href={`mailto:${BRAND.email}`} className="hover:text-[#E5A5B5]">{BRAND.email}</a>
          </div>
          <div className="text-white/70 tracking-wide">
            {lang === 'en' ? 'Mon – Fri · 10 am – 10 pm  ·  Sat, Sun, Holidays · 1 pm – 10 pm' : 'Mo – Fr · 10 – 22 Uhr  ·  Sa, So, Feiertag · 13 – 22 Uhr'}
          </div>
        </div>
      </div>

      <header className="sticky top-0 z-50 bg-white border-b border-[#1A1414]/8">
        <div className="px-6 md:px-10 lg:px-8 xl:px-10 2xl:px-16 py-4 flex items-center justify-between gap-3">
          <Link href={localePath(lang, '/')} className="font-heading text-2xl tracking-tight whitespace-nowrap">
            <span className="text-[#1A1414] font-semibold">Noir</span>{' '}
            <span className="accent-text italic">Hamburg</span>
          </Link>
          <nav className="hidden xl:flex items-center gap-3 2xl:gap-6">
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
            <a href={BRAND.whatsappUrl} target="_blank" rel="noreferrer nofollow" className="btn-whatsapp whitespace-nowrap !px-4 !py-1.5 !text-xs">
              {t(lang, 'cta.whatsapp')}
            </a>
            <Link href={localePath(lang, '/kontakt')} className="btn-primary whitespace-nowrap !px-4 !py-1.5 !text-xs">
              {t(lang, 'cta.book')}
            </Link>
          </div>
        </div>
      </header>
    </>
  )
}
