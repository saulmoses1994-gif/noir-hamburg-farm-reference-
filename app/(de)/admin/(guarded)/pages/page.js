import Link from 'next/link'
import { listAllPages } from '@/lib/pages'

export const dynamic = 'force-dynamic'

function fmt(d) {
  if (!d) return '—'
  try { return new Date(d).toLocaleDateString('de-DE', { day: '2-digit', month: 'short', year: 'numeric' }) } catch { return '—' }
}

export default async function AdminPagesList() {
  const pages = await listAllPages()
  const published = pages.filter((p) => p.published !== false).length
  return (
    <div className="p-10">
      <div className="flex items-baseline justify-between mb-8">
        <div>
          <span className="overline">CMS</span>
          <h1 className="font-heading text-4xl mt-2">Pages</h1>
          <p className="text-sm text-[#6B5F5F] mt-2">Individuelle CMS-Seiten unter /p/[slug]. {published} live · {pages.length - published} Entwürfe · {pages.length} gesamt.</p>
        </div>
        <Link href="/admin/pages/new" className="btn-primary !text-xs !py-2 !px-5">+ Neue Seite</Link>
      </div>
      <div className="bg-white rounded-lg overflow-hidden border border-[#1A1414]/8">
        <table className="w-full">
          <thead>
            <tr className="text-left text-xs font-mono uppercase tracking-[0.15em] text-[#6B5F5F] border-b border-[#1A1414]/8">
              <th className="px-6 py-4">Titel</th>
              <th className="px-6 py-4">Slug</th>
              <th className="px-6 py-4 w-24 text-center">Status</th>
              <th className="px-6 py-4 w-32">Aktualisiert</th>
              <th className="px-6 py-4 text-right">Aktionen</th>
            </tr>
          </thead>
          <tbody>
            {pages.map((p) => (
              <tr key={p.slug} className="border-b border-[#1A1414]/5 hover:bg-[#FBF7F4]">
                <td className="px-6 py-4">
                  <div className="font-heading text-base text-[#1A1414]">{p.title}</div>
                  {p.intro && <div className="text-xs text-[#6B5F5F] mt-1 truncate max-w-md">{p.intro}</div>}
                </td>
                <td className="px-6 py-4 font-mono text-xs">/p/{p.slug}</td>
                <td className="px-6 py-4 text-center">
                  {p.published !== false
                    ? <span className="px-2 py-0.5 rounded-full text-[10px] font-mono uppercase tracking-[0.15em] bg-[#DCEFE2] text-[#2D7A4E]">Live</span>
                    : <span className="px-2 py-0.5 rounded-full text-[10px] font-mono uppercase tracking-[0.15em] bg-[#F2EAE4] text-[#6B5F5F]">Entwurf</span>}
                </td>
                <td className="px-6 py-4 text-xs text-[#6B5F5F]">{fmt(p.updated_at || p.created_at)}</td>
                <td className="px-6 py-4 text-right whitespace-nowrap">
                  <Link href={`/admin/pages/edit/${p.slug}`} className="text-xs font-mono uppercase tracking-[0.15em] accent-text">Bearbeiten →</Link>
                </td>
              </tr>
            ))}
            {pages.length === 0 && <tr><td colSpan="5" className="px-6 py-12 text-center text-sm text-[#6B5F5F] italic">Noch keine Seiten. Erstelle die erste.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  )
}
