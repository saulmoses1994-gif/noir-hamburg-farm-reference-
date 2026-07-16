'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'

// Full mobile navigation drawer. Server Header renders this and hands over
// pre-resolved brand + nav data so the client bundle stays small.
//
// Behavior:
//   * Hamburger toggles a slide-in panel on the right
//   * Body scroll is locked while open
//   * Panel auto-closes on route change (usePathname effect)
//   * Escape key closes the panel
//   * Aria-expanded stays in sync with the state for AT users
export default function MobileNav({
  lang,
  brand,
  swap,
  labels,
  navItems,
}) {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()

  // Close on route change
  useEffect(() => {
    setOpen(false)
  }, [pathname])

  // Lock body scroll + Escape-to-close while drawer is open
  useEffect(() => {
    if (!open) return
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = (e) => {
      if (e.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = prevOverflow
      window.removeEventListener('keydown', onKey)
    }
  }, [open])

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="xl:hidden inline-flex items-center justify-center w-10 h-10 border border-[#1A1414]/15 rounded-md hover:bg-[#1A1414]/5"
        aria-expanded={open}
        aria-controls="mobile-nav"
        aria-label={labels.open}
        data-testid="mobile-nav-toggle"
        data-nav-open={open ? 'true' : 'false'}
      >
        <span aria-hidden="true" className="block w-4 h-[2px] bg-[#1A1414] relative before:content-[''] before:absolute before:-top-1.5 before:left-0 before:w-4 before:h-[2px] before:bg-[#1A1414] after:content-[''] after:absolute after:top-1.5 after:left-0 after:w-4 after:h-[2px] after:bg-[#1A1414]" />
      </button>

      {/* Overlay */}
      <div
        onClick={() => setOpen(false)}
        aria-hidden="true"
        className={`xl:hidden fixed inset-0 z-[70] bg-black/60 transition-opacity duration-300 ${open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
      />

      {/* Slide-in drawer */}
      <aside
        id="mobile-nav"
        aria-label={labels.menu}
        aria-hidden={!open}
        className={`xl:hidden fixed top-0 right-0 z-[80] h-full w-[86%] max-w-[380px] bg-white shadow-2xl transform transition-transform duration-300 ease-out flex flex-col ${open ? 'translate-x-0' : 'translate-x-full'}`}
      >
        <div className="flex items-center justify-between px-6 py-5 border-b border-[#1A1414]/8">
          <span className="font-heading text-xl">
            <span className="text-[#1A1414] font-semibold">Noir</span>{' '}
            <span className="accent-text italic">Hamburg</span>
          </span>
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label={labels.close}
            className="w-10 h-10 inline-flex items-center justify-center border border-[#1A1414]/15 rounded-md hover:bg-[#1A1414]/5"
            data-testid="mobile-nav-close"
          >
            <span aria-hidden="true" className="block w-4 h-4 relative before:content-[''] before:absolute before:top-1/2 before:left-0 before:w-4 before:h-[2px] before:bg-[#1A1414] before:-translate-y-1/2 before:rotate-45 after:content-[''] after:absolute after:top-1/2 after:left-0 after:w-4 after:h-[2px] after:bg-[#1A1414] after:-translate-y-1/2 after:-rotate-45" />
          </button>
        </div>

        <nav aria-label={labels.menu} className="flex-1 overflow-y-auto px-6 py-6 space-y-1">
          {navItems.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className="block px-3 py-3 text-lg font-heading text-[#1A1414] hover:accent-text hover:bg-[#FBF7F4] rounded-md transition-colors"
              data-testid={`mobile-nav-link-${n.href}`}
            >
              {n.label}
            </Link>
          ))}
        </nav>

        <div className="border-t border-[#1A1414]/8 p-6 space-y-3">
          <div className="flex items-center gap-3 text-sm">
            <a href={brand.phoneHref} className="flex-1 text-[#1A1414] hover:accent-text truncate" data-testid="mobile-phone">
              {brand.phone}
            </a>
            <Link
              href={swap}
              hrefLang={lang === 'de' ? 'en' : 'de'}
              className="inline-flex items-center px-3 py-1.5 border border-[#8B1538] text-[#8B1538] text-[11px] font-semibold tracking-widest uppercase rounded-full hover:bg-[#8B1538] hover:text-white transition-colors"
            >
              {labels.langSwitch}
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <a
              href={brand.whatsappUrl}
              target="_blank"
              rel="noreferrer nofollow"
              className="btn-whatsapp !text-xs !py-2 !px-3 text-center"
              data-testid="mobile-whatsapp"
            >
              {labels.whatsapp}
            </a>
            <Link
              href={lang === 'en' ? '/en/contact' : '/kontakt'}
              className="btn-primary !text-xs !py-2 !px-3 text-center"
              data-testid="mobile-book"
            >
              {labels.book}
            </Link>
          </div>
          {brand.recruitmentWhatsappUrl && (
            <a
              href={brand.recruitmentWhatsappUrl}
              target="_blank"
              rel="noreferrer nofollow"
              className="w-full inline-flex items-center justify-center gap-1 px-4 py-2 border border-[#1A1414] text-[#1A1414] text-[11px] font-semibold tracking-widest uppercase rounded-full hover:bg-[#1A1414] hover:text-white transition-colors"
              data-testid="mobile-work-with-us"
            >
              {labels.workWithUs}
            </a>
          )}
          <p className="text-[10px] text-[#6B5F5F] pt-1">{brand.hours}</p>
        </div>
      </aside>
    </>
  )
}
