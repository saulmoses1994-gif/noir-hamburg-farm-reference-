'use client'
import { useState, useMemo } from 'react'
import Link from 'next/link'

function fmt(d) {
  if (!d) return '—'
  try { return new Date(d).toLocaleDateString('de-DE', { day: '2-digit', month: 'short', year: 'numeric' }) } catch { return '—' }
}

export default function BlogListClient({ posts, categories }) {
  const [q, setQ] = useState('')
  const [cat, setCat] = useState('')
  const [pubFilter, setPubFilter] = useState('all') // all | published | draft

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase()
    return posts.filter((p) => {
      if (cat && p.category !== cat) return false
      if (pubFilter === 'published' && p.published === false) return false
      if (pubFilter === 'draft' && p.published !== false) return false
      if (!needle) return true
      return (p.title || '').toLowerCase().includes(needle)
        || (p.slug || '').toLowerCase().includes(needle)
        || (p.excerpt || '').toLowerCase().includes(needle)
    })
  }, [posts, q, cat, pubFilter])

  const publishedCount = posts.filter((p) => p.published !== false).length
  const draftCount = posts.length - publishedCount

  return (
    <div className="p-10">
      <div className="flex items-baseline justify-between mb-8">
        <div>
          <span className="overline">CMS</span>
          <h1 className="font-heading text-4xl mt-2">Blog</h1>
          <p className="text-sm text-[#6B5F5F] mt-2">{publishedCount} veröffentlicht · {draftCount} Entwürfe · {posts.length} gesamt</p>
        </div>
        <Link href="/admin/blog/new" className="btn-primary !text-xs !py-2 !px-5">+ Neuer Beitrag</Link>
      </div>

      <div className="bg-white rounded-lg p-4 mb-6 flex flex-wrap items-center gap-3 border border-[#1A1414]/8">
        <input
          type="text" placeholder="Suche in Titel / Slug / Excerpt …"
          value={q} onChange={(e) => setQ(e.target.value)}
          className="flex-1 min-w-[240px] border border-[#1A1414]/15 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-[#8B1538]"
        />
        <select value={cat} onChange={(e) => setCat(e.target.value)} className="border border-[#1A1414]/15 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-[#8B1538]">
          <option value="">Alle Kategorien</option>
          {categories.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <div className="flex items-center gap-1 border border-[#1A1414]/15 rounded-md p-1">
          {[
            ['all', 'Alle'],
            ['published', 'Veröffentlicht'],
            ['draft', 'Entwürfe'],
          ].map(([k, l]) => (
            <button key={k} onClick={() => setPubFilter(k)} className={`px-3 py-1 text-xs font-mono uppercase tracking-[0.15em] rounded ${pubFilter === k ? 'bg-[#1A1414] text-white' : 'text-[#6B5F5F] hover:text-[#1A1414]'}`}>
              {l}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-lg overflow-hidden border border-[#1A1414]/8">
        <table className="w-full">
          <thead>
            <tr className="text-left text-xs font-mono uppercase tracking-[0.15em] text-[#6B5F5F] border-b border-[#1A1414]/8">
              <th className="px-4 py-3 w-24">Cover</th>
              <th className="px-4 py-3">Titel</th>
              <th className="px-4 py-3">Kategorie</th>
              <th className="px-4 py-3 w-24 text-center">Status</th>
              <th className="px-4 py-3 w-32">Aktualisiert</th>
              <th className="px-4 py-3 text-right">Aktionen</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((p) => (
              <tr key={p.slug} className="border-b border-[#1A1414]/5 hover:bg-[#FBF7F4]">
                <td className="px-4 py-3">
                  {p.cover_image
                    ? <img src={p.cover_image} alt="" className="w-16 h-12 object-cover rounded" />
                    : <div className="w-16 h-12 bg-[#F2EAE4] rounded" />}
                </td>
                <td className="px-4 py-3">
                  <div className="font-heading text-sm text-[#1A1414] leading-tight">{p.title}</div>
                  <div className="font-mono text-[10px] text-[#6B5F5F] mt-1 truncate max-w-md">{p.slug}</div>
                </td>
                <td className="px-4 py-3 text-xs">{p.category}</td>
                <td className="px-4 py-3 text-center">
                  {p.published !== false ? (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-mono uppercase tracking-[0.15em] bg-[#DCEFE2] text-[#2D7A4E]">Live</span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-mono uppercase tracking-[0.15em] bg-[#F2EAE4] text-[#6B5F5F]">Entwurf</span>
                  )}
                </td>
                <td className="px-4 py-3 text-xs text-[#6B5F5F]">{fmt(p.updated_at || p.created_at)}</td>
                <td className="px-4 py-3 text-right whitespace-nowrap">
                  <Link href={`/admin/blog/edit/${p.slug}`} className="text-xs font-mono uppercase tracking-[0.15em] accent-text">Bearbeiten →</Link>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan="6" className="px-4 py-12 text-center text-sm text-[#6B5F5F] italic">Keine Beiträge entsprechen dem Filter.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
