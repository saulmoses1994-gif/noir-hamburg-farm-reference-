import Link from 'next/link'
import LogoutButton from '@/components/admin/LogoutButton'

const SECTIONS = [
  { href: '/admin', label: 'Dashboard' },
  { href: '/admin/services', label: 'Services' },
  { href: '/admin/areas', label: 'Areas' },
  { href: '/admin/settings', label: 'Settings' },
  { href: '/admin/models', label: 'Models' },
  { href: '/admin/blog', label: 'Blog' },
  { href: '/admin/pages', label: 'Pages' },
  { href: '/admin/contacts', label: 'Kontakte' },
  { href: '/admin/media', label: 'Media' },
  { href: '/admin/account', label: 'Konto' },
]

export default function AdminNav({ user }) {
  return (
    <aside className="bg-[#1A1414] text-white flex flex-col">
      <div className="px-6 py-6 border-b border-white/10">
        <Link href="/admin" className="font-heading text-xl">
          <span className="font-semibold">Noir</span>{' '}
          <span className="italic text-[#E5A5B5]">Hamburg</span>
        </Link>
        <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-white/50 mt-1">Admin CMS</div>
      </div>
      <nav className="flex-1 py-4 overflow-y-auto">
        {SECTIONS.map((s) => (
          <Link key={s.href} href={s.href} className="block px-6 py-2.5 text-sm hover:bg-white/5 hover:text-[#E5A5B5] transition-colors">
            {s.label}
          </Link>
        ))}
      </nav>
      <div className="px-6 py-4 border-t border-white/10 text-xs">
        <div className="text-white/70 truncate">{user?.email}</div>
        <div className="text-white/40 mt-1">Rolle: {user?.role}</div>
        <LogoutButton />
      </div>
    </aside>
  )
}
