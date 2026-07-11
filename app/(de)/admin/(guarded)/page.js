import Link from 'next/link'
import { getSessionUser } from '@/lib/auth'
import { listServiceContent, listAreaContent } from '@/lib/service-content'
import { getDb, cleanDoc } from '@/lib/mongo'

export const dynamic = 'force-dynamic'

// Small locale-aware date formatter for the activity feed.
function fmtDate(d) {
  if (!d) return ''
  try {
    return new Date(d).toLocaleString('de-DE', {
      day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit',
    })
  } catch { return '' }
}

async function loadDashboardData() {
  const [services, areas] = await Promise.all([listServiceContent(), listAreaContent()])
  const db = await getDb()
  const [
    modelsCount, blogCount, pagesCount, contactsTotal, contactsUnread,
    recentContacts, recentBlog, recentModels,
    servicesMissingEn, modelsMissingEn, blogMissingEn, pagesMissingEn,
  ] = await Promise.all([
    db.collection('models').countDocuments({ deleted_at: { $in: [null, undefined] } }),
    db.collection('blog').countDocuments({ deleted_at: { $in: [null, undefined] } }),
    db.collection('pages').countDocuments({ deleted_at: { $in: [null, undefined] } }),
    db.collection('contacts').countDocuments({}),
    db.collection('contacts').countDocuments({ read: { $ne: true }, archived: { $ne: true } }),
    db.collection('contacts').find({ archived: { $ne: true } }).sort({ created_at: -1 }).limit(5).toArray(),
    db.collection('blog').find({ deleted_at: { $in: [null, undefined] } }).sort({ updated_at: -1 }).limit(3).toArray(),
    db.collection('models').find({ deleted_at: { $in: [null, undefined] } }).sort({ updated_at: -1 }).limit(3).toArray(),
    db.collection('service_content').countDocuments({ $or: [{ title_en: '' }, { title_en: { $exists: false } }] }),
    db.collection('models').countDocuments({ deleted_at: { $in: [null, undefined] }, $or: [{ bio_en: '' }, { bio_en: { $exists: false } }] }),
    db.collection('blog').countDocuments({ deleted_at: { $in: [null, undefined] }, $or: [{ title_en: '' }, { title_en: { $exists: false } }] }),
    db.collection('pages').countDocuments({ deleted_at: { $in: [null, undefined] }, $or: [{ content_en: '' }, { content_en: { $exists: false } }] }),
  ])
  return {
    services, areas,
    counts: { modelsCount, blogCount, pagesCount, contactsTotal, contactsUnread },
    recentContacts: recentContacts.map(cleanDoc),
    recentBlog: recentBlog.map(cleanDoc),
    recentModels: recentModels.map(cleanDoc),
    health: { servicesMissingEn, modelsMissingEn, blogMissingEn, pagesMissingEn },
  }
}

function StatCard({ label, value, href, sub, tone = 'default' }) {
  const toneCls = tone === 'accent'
    ? 'border-l-4 border-[#8B1538]'
    : ''
  return (
    <Link
      href={href}
      className={`bg-white p-8 hover:bg-[#FBF7F4] transition-colors group ${toneCls}`}
      data-testid={`stat-${label.toLowerCase().replace(/\s+/g,'-')}`}
    >
      <div className="overline">{label}</div>
      <div className="font-heading text-5xl mt-3 group-hover:accent-text transition-colors">{value}</div>
      {sub && <div className="mt-2 text-xs text-[#6B5F5F]">{sub}</div>}
      <div className="mt-3 text-xs font-mono uppercase tracking-[0.15em] accent-text opacity-0 group-hover:opacity-100 transition-opacity">Öffnen →</div>
    </Link>
  )
}

function HealthRow({ label, count, href }) {
  const green = count === 0
  return (
    <li className="flex items-center justify-between py-2 border-b border-[#1A1414]/6 last:border-b-0">
      <Link href={href} className="text-sm text-[#3F3838] hover:accent-text">{label}</Link>
      <span className={`text-xs font-mono tabular-nums px-2 py-0.5 rounded ${green ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-800'}`}>
        {green ? '✓ 0 fehlend' : `${count} fehlend`}
      </span>
    </li>
  )
}

export default async function AdminDashboard() {
  const user = await getSessionUser(null)
  const data = await loadDashboardData()
  const { services, areas, counts, recentContacts, recentBlog, recentModels, health } = data
  const displayName = user?.name || 'Admin'
  const displayEmail = user?.email || ''

  const stats = [
    { label: 'Services', value: services.length, href: '/admin/services' },
    { label: 'Areas', value: areas.length, href: '/admin/areas' },
    { label: 'Models', value: counts.modelsCount, href: '/admin/models' },
    { label: 'Blog', value: counts.blogCount, href: '/admin/blog' },
    { label: 'Pages', value: counts.pagesCount, href: '/admin/pages' },
    { label: 'Kontakte', value: counts.contactsTotal, href: '/admin/contacts', sub: `${counts.contactsUnread} ungelesen` },
  ]

  return (
    <div className="p-10 max-w-6xl">
      <div className="flex items-baseline justify-between mb-10">
        <div>
          <span className="overline">Dashboard</span>
          <h1 className="font-heading text-4xl mt-2">Willkommen zurück, {displayName}</h1>
        </div>
        <div className="text-sm text-[#6B5F5F]">{displayEmail}</div>
      </div>

      {/* Row 1 — headline metric: the daily-driver number. */}
      {counts.contactsUnread > 0 && (
        <Link
          href="/admin/contacts"
          className="block bg-[#1A1414] text-white p-8 mb-6 rounded-lg hover:bg-[#2A1F1F] transition-colors group"
          data-testid="hero-unread-contacts"
        >
          <div className="flex items-center justify-between gap-6">
            <div>
              <div className="overline text-[#E5A5B5]">Posteingang</div>
              <div className="mt-2 font-heading text-4xl">
                <span className="text-[#E5A5B5]">{counts.contactsUnread}</span>{' '}
                <span className="text-white/80">ungelesene {counts.contactsUnread === 1 ? 'Anfrage' : 'Anfragen'}</span>
              </div>
              <div className="mt-2 text-sm text-white/60">
                Zuletzt eingegangen: {recentContacts[0] ? fmtDate(recentContacts[0].created_at) : '—'}
              </div>
            </div>
            <div className="text-xs font-mono uppercase tracking-[0.2em] text-[#E5A5B5] group-hover:translate-x-1 transition-transform">Inbox öffnen →</div>
          </div>
        </Link>
      )}

      {/* Row 2 — six count tiles. */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-px bg-[#1A1414]/8">
        {stats.map((s) => (
          <StatCard key={s.label} label={s.label} value={s.value} href={s.href} sub={s.sub} />
        ))}
      </div>

      {/* Row 3 — activity feed + content health */}
      <div className="mt-10 grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-lg" data-testid="panel-activity">
          <div className="overline">Aktivität</div>
          <h2 className="font-heading text-xl mt-2 mb-5">Zuletzt geändert</h2>

          <div className="text-xs font-mono uppercase tracking-[0.15em] text-[#6B5F5F] mb-2">Anfragen</div>
          <ul className="space-y-2 mb-6">
            {recentContacts.length === 0 && <li className="text-sm text-[#6B5F5F]">Noch keine Anfragen.</li>}
            {recentContacts.map((c) => {
              const unread = !c.read
              return (
                <li key={c.id} className="flex items-center justify-between gap-3">
                  <Link href={`/admin/contacts/${c.id}`} className="text-sm text-[#1A1414] hover:accent-text truncate">
                    {unread && <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#8B1538] mr-2 align-middle" />}
                    <strong className="font-medium">{c.name}</strong>
                    <span className="text-[#6B5F5F]"> · {c.email}</span>
                  </Link>
                  <span className="text-[11px] font-mono text-[#6B5F5F] whitespace-nowrap">{fmtDate(c.created_at)}</span>
                </li>
              )
            })}
          </ul>

          <div className="text-xs font-mono uppercase tracking-[0.15em] text-[#6B5F5F] mb-2">Blog-Beiträge</div>
          <ul className="space-y-2 mb-6">
            {recentBlog.length === 0 && <li className="text-sm text-[#6B5F5F]">Noch keine Beiträge.</li>}
            {recentBlog.map((b) => (
              <li key={b.slug} className="flex items-center justify-between gap-3">
                <Link href={`/admin/blog/${b.slug}`} className="text-sm text-[#1A1414] hover:accent-text truncate">{b.title}</Link>
                <span className="text-[11px] font-mono text-[#6B5F5F] whitespace-nowrap">{fmtDate(b.updated_at || b.created_at)}</span>
              </li>
            ))}
          </ul>

          <div className="text-xs font-mono uppercase tracking-[0.15em] text-[#6B5F5F] mb-2">Models</div>
          <ul className="space-y-2">
            {recentModels.length === 0 && <li className="text-sm text-[#6B5F5F]">Noch keine Models.</li>}
            {recentModels.map((m) => (
              <li key={m.slug} className="flex items-center justify-between gap-3">
                <Link href={`/admin/models/${m.slug}`} className="text-sm text-[#1A1414] hover:accent-text truncate">{m.name}</Link>
                <span className="text-[11px] font-mono text-[#6B5F5F] whitespace-nowrap">{fmtDate(m.updated_at || m.created_at)}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-white p-8 rounded-lg" data-testid="panel-health">
          <div className="overline">Launch-Bereitschaft</div>
          <h2 className="font-heading text-xl mt-2 mb-5">Englische Übersetzungen</h2>
          <p className="text-xs text-[#6B5F5F] mb-4 leading-relaxed">
            Fehlende <code className="text-[#8B1538] bg-[#FBF7F4] px-1 rounded">_en</code>-Felder fallen automatisch auf die deutschen Werte zurück, sollten aber vor der Domain-Umschaltung befüllt werden.
          </p>
          <ul className="text-sm">
            <HealthRow label="Services ohne title_en" count={health.servicesMissingEn} href="/admin/services" />
            <HealthRow label="Models ohne bio_en" count={health.modelsMissingEn} href="/admin/models" />
            <HealthRow label="Blog-Posts ohne title_en" count={health.blogMissingEn} href="/admin/blog" />
            <HealthRow label="Pages ohne content_en" count={health.pagesMissingEn} href="/admin/pages" />
          </ul>
        </div>
      </div>

      {/* Row 4 — quick access + live site */}
      <div className="mt-10 grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-lg">
          <div className="overline">Schnellzugriff</div>
          <ul className="mt-4 space-y-3">
            <li><Link href="/admin/services" className="link-underline font-heading text-lg">SEO-Content der Services bearbeiten →</Link></li>
            <li><Link href="/admin/areas" className="link-underline font-heading text-lg">Hamburg Areas bearbeiten →</Link></li>
            <li><Link href="/admin/settings" className="link-underline font-heading text-lg">Globale Einstellungen →</Link></li>
            <li><Link href="/admin/account" className="link-underline font-heading text-lg">Passwort ändern →</Link></li>
          </ul>
        </div>
        <div className="bg-white p-8 rounded-lg">
          <div className="overline">Live-Seite</div>
          <ul className="mt-4 space-y-3">
            <li><a href="/" target="_blank" rel="noreferrer" className="link-underline font-heading text-lg">Startseite (DE) →</a></li>
            <li><a href="/en" target="_blank" rel="noreferrer" className="link-underline font-heading text-lg">Homepage (EN) →</a></li>
            <li><a href="/blog" target="_blank" rel="noreferrer" className="link-underline font-heading text-lg">/blog →</a></li>
            <li><a href="/sitemap.xml" target="_blank" rel="noreferrer" className="link-underline font-mono text-sm">sitemap.xml →</a></li>
            <li><a href="/robots.txt" target="_blank" rel="noreferrer" className="link-underline font-mono text-sm">robots.txt →</a></li>
          </ul>
        </div>
      </div>
    </div>
  )
}
