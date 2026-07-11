import Link from 'next/link'
import { getSessionUser } from '@/lib/auth'
import { listServiceContent, listAreaContent } from '@/lib/service-content'
import { getDb } from '@/lib/mongo'

export const dynamic = 'force-dynamic'

export default async function AdminDashboard() {
  const user = await getSessionUser(null)
  const [services, areas] = await Promise.all([listServiceContent(), listAreaContent()])
  const db = await getDb()
  const [modelsCount, blogCount, pagesCount, contactsCount] = await Promise.all([
    db.collection('models').countDocuments(),
    db.collection('blog').countDocuments(),
    db.collection('pages').countDocuments(),
    db.collection('contacts').countDocuments(),
  ])
  const stats = [
    { label: 'Services', value: services.length, href: '/admin/services' },
    { label: 'Areas', value: areas.length, href: '/admin/areas' },
    { label: 'Models', value: modelsCount, href: '/admin/models' },
    { label: 'Blog', value: blogCount, href: '/admin/blog' },
    { label: 'Pages', value: pagesCount, href: '/admin/pages' },
    { label: 'Kontakte', value: contactsCount, href: '/admin/contacts' },
  ]
  return (
    <div className="p-10">
      <div className="flex items-baseline justify-between mb-10">
        <div>
          <span className="overline">Dashboard</span>
          <h1 className="font-heading text-4xl mt-2">Willkommen zurück, {user.name}</h1>
        </div>
        <div className="text-sm text-[#6B5F5F]">{user.email}</div>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-px bg-[#1A1414]/8">
        {stats.map((s) => (
          <Link key={s.label} href={s.href} className="bg-white p-8 hover:bg-[#FBF7F4] transition-colors group">
            <div className="overline">{s.label}</div>
            <div className="font-heading text-5xl mt-3 group-hover:accent-text transition-colors">{s.value}</div>
            <div className="mt-3 text-xs font-mono uppercase tracking-[0.15em] accent-text opacity-0 group-hover:opacity-100 transition-opacity">Bearbeiten →</div>
          </Link>
        ))}
      </div>
      <div className="mt-10 grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-lg">
          <div className="overline">Schnellzugriff</div>
          <ul className="mt-4 space-y-3">
            <li><Link href="/admin/services" className="link-underline font-heading text-lg">SEO-Content der Services bearbeiten →</Link></li>
            <li><Link href="/admin/areas" className="link-underline font-heading text-lg">Hamburg Areas bearbeiten →</Link></li>
            <li><Link href="/admin/settings" className="link-underline font-heading text-lg">Globale Einstellungen →</Link></li>
          </ul>
        </div>
        <div className="bg-white p-8 rounded-lg">
          <div className="overline">Live-Seite</div>
          <ul className="mt-4 space-y-3">
            <li><a href="/" target="_blank" rel="noreferrer" className="link-underline font-heading text-lg">Startseite →</a></li>
            <li><a href="/services" target="_blank" rel="noreferrer" className="link-underline font-heading text-lg">/services →</a></li>
            <li><a href="/sitemap.xml" target="_blank" rel="noreferrer" className="link-underline font-mono text-sm">sitemap.xml →</a></li>
          </ul>
        </div>
      </div>
    </div>
  )
}
