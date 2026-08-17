'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, X } from 'lucide-react'
import LogoutButton from '@/components/admin/LogoutButton'

const SECTIONS = [
  { href: '/admin', label: 'Dashboard' },
  { href: '/admin/services', label: 'Services' },
  { href: '/admin/areas', label: 'Areas' },
  { href: '/admin/settings', label: 'Settings' },
  { href: '/admin/models', label: 'Models' },
  { href: '/admin/blog', label: 'Blog' },
  { href: '/admin/pages', label: 'Pages' },
  { href: '/admin/contacts', label: 'Kontakte', countKey: 'contacts' },
  { href: '/admin/media', label: 'Media' },
  { href: '/admin/account', label: 'Konto' },
]

export default function AdminNav({ user, counts = {} }) {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()

  // Auto-close the mobile drawer whenever the route changes.
  useEffect(() => { setOpen(false) }, [pathname])

  // Prevent body scroll while the mobile drawer is open.
  useEffect(() => {
    if (typeof document === 'undefined') return
    if (open) {
      const prev = document.body.style.overflow
      document.body.style.overflow = 'hidden'
      return () => { document.body.style.overflow = prev }
    }
  }, [open])

  return (
    <>
      {/* MOBILE-ONLY TOP BAR — visible below the `lg` breakpoint.  Fixed to
          the top of the viewport with a hamburger toggle so admins can pop
          the sidebar drawer open on phones and tablets. */}
      <div
        className="lg:hidden fixed top-0 inset-x-0 z-50 h-14 flex items-center justify-between bg-[#1A1414] text-white px-4 border-b border-white/10"
        data-testid="admin-mobile-topbar"
      >
        <Link href="/admin" className="font-heading text-lg flex items-center gap-1">
          <span className="font-semibold">Noir</span>
          <span className="italic text-[#E5A5B5]">Hamburg</span>
          <span className="ml-2 text-[10px] font-mono uppercase tracking-widest text-white/50">Admin</span>
        </Link>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="p-2 -mr-2 rounded-md hover:bg-white/10 active:bg-white/20 transition-colors"
          aria-label={open ? 'Menü schließen' : 'Menü öffnen'}
          aria-expanded={open}
          aria-controls="admin-nav-drawer"
          data-testid="admin-mobile-menu-toggle"
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile backdrop (below sidebar, above content). Clicking closes the
          drawer.  Positioned below the top bar so the toggle stays clickable. */}
      {open && (
        <button
          type="button"
          aria-label="Menü schließen"
          onClick={() => setOpen(false)}
          className="lg:hidden fixed inset-0 top-14 z-40 bg-black/60"
        />
      )}

      {/* SIDEBAR
          - Mobile: fixed slide-in drawer, hidden by default.
          - Desktop (lg+): normal column in the grid, always visible. */}
      <aside
        id="admin-nav-drawer"
        className={[
          'bg-[#1A1414] text-white flex flex-col',
          // Mobile drawer positioning + transitions
          'fixed top-14 bottom-0 left-0 z-50 w-[260px] transform transition-transform duration-200 ease-out',
          open ? 'translate-x-0' : '-translate-x-full',
          // Desktop static column
          'lg:sticky lg:top-0 lg:h-screen lg:z-auto lg:translate-x-0 lg:transition-none lg:w-auto',
        ].join(' ')}
        data-testid="admin-sidebar"
      >
        {/* Desktop-only brand row (mobile already shows brand in the top bar) */}
        <div className="hidden lg:block px-6 py-6 border-b border-white/10">
          <Link href="/admin" className="font-heading text-xl">
            <span className="font-semibold">Noir</span>{' '}
            <span className="italic text-[#E5A5B5]">Hamburg</span>
          </Link>
          <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-white/50 mt-1">Admin CMS</div>
        </div>

        <nav className="flex-1 py-4 overflow-y-auto">
          {SECTIONS.map((s) => {
            const badge = s.countKey && counts[s.countKey] > 0 ? counts[s.countKey] : null
            const active = pathname === s.href || (s.href !== '/admin' && pathname?.startsWith(s.href + '/'))
            return (
              <Link
                key={s.href}
                href={s.href}
                className={[
                  'flex items-center justify-between px-6 py-3 lg:py-2.5 text-sm transition-colors',
                  active
                    ? 'bg-white/10 text-[#E5A5B5]'
                    : 'hover:bg-white/5 hover:text-[#E5A5B5]',
                ].join(' ')}
                onClick={() => setOpen(false)}
              >
                <span>{s.label}</span>
                {badge != null && (
                  <span className="inline-flex items-center justify-center min-w-[22px] h-5 px-1.5 rounded-full bg-[#8B1538] text-white text-[10px] font-mono">
                    {badge}
                  </span>
                )}
              </Link>
            )
          })}
        </nav>

        <div className="px-6 py-4 border-t border-white/10 text-xs">
          <div className="text-white/70 truncate">{user?.email}</div>
          <div className="text-white/40 mt-1">Rolle: {user?.role}</div>
          <LogoutButton />
        </div>
      </aside>
    </>
  )
}
