'use client'
import { useState, useMemo } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'

function fmt(d) {
  if (!d) return '—'
  try { return new Date(d).toLocaleString('de-DE', { day: '2-digit', month: 'short', year: '2-digit', hour: '2-digit', minute: '2-digit' }) } catch { return '—' }
}

export default function ContactsListClient({ contacts, archived }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [q, setQ] = useState('')
  const [filter, setFilter] = useState('all') // all | unread | starred

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase()
    return contacts.filter((c) => {
      if (filter === 'unread' && c.read === true) return false
      if (filter === 'starred' && c.starred !== true) return false
      if (!needle) return true
      const hay = `${c.name || ''} ${c.email || ''} ${c.phone || ''} ${c.message || ''} ${c.service || ''}`.toLowerCase()
      return hay.includes(needle)
    })
  }, [contacts, q, filter])

  const unreadCount = contacts.filter((c) => c.read !== true).length
  const starredCount = contacts.filter((c) => c.starred === true).length

  function toggleArchived() {
    const nextArchived = !archived
    router.push(`/admin/contacts${nextArchived ? '?archived=1' : ''}`)
  }

  return (
    <div className="p-10">
      <div className="flex items-baseline justify-between mb-8">
        <div>
          <span className="overline">CMS</span>
          <h1 className="font-heading text-4xl mt-2">{archived ? 'Archivierte Kontakte' : 'Kontakte'}</h1>
          <p className="text-sm text-[#6B5F5F] mt-2">
            {archived ? `${contacts.length} archiviert` : `${unreadCount} ungelesen · ${starredCount} markiert · ${contacts.length} aktiv`}
          </p>
        </div>
        <button onClick={toggleArchived} className="text-xs font-mono uppercase tracking-[0.15em] text-[#6B5F5F] hover:accent-text">
          {archived ? '← Aktive Inbox' : 'Archiv →'}
        </button>
      </div>

      {!archived && (
        <div className="bg-white rounded-lg p-4 mb-6 flex flex-wrap items-center gap-3 border border-[#1A1414]/8">
          <input
            type="text" placeholder="Suche in Name / Email / Telefon / Nachricht …"
            value={q} onChange={(e) => setQ(e.target.value)}
            className="flex-1 min-w-[240px] border border-[#1A1414]/15 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-[#8B1538]"
          />
          <div className="flex items-center gap-1 border border-[#1A1414]/15 rounded-md p-1">
            {[['all','Alle'],['unread','Ungelesen'],['starred','Markiert']].map(([k,l]) => (
              <button key={k} onClick={() => setFilter(k)}
                className={`px-3 py-1 text-xs font-mono uppercase tracking-[0.15em] rounded ${filter === k ? 'bg-[#1A1414] text-white' : 'text-[#6B5F5F] hover:text-[#1A1414]'}`}>
                {l}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg overflow-hidden border border-[#1A1414]/8">
        <table className="w-full">
          <thead>
            <tr className="text-left text-xs font-mono uppercase tracking-[0.15em] text-[#6B5F5F] border-b border-[#1A1414]/8">
              <th className="px-4 py-3 w-8"></th>
              <th className="px-4 py-3">Name / Email</th>
              <th className="px-4 py-3">Service</th>
              <th className="px-4 py-3">Nachricht</th>
              <th className="px-4 py-3 w-32">Erhalten</th>
              <th className="px-4 py-3 text-right">→</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((c) => {
              const unread = c.read !== true
              return (
                <tr key={c.id} className={`border-b border-[#1A1414]/5 hover:bg-[#FBF7F4] ${unread ? 'bg-white' : 'bg-[#FAFAFA]'}`}>
                  <td className="px-4 py-3 text-center">
                    {unread && <span className="inline-block w-2 h-2 rounded-full bg-[#8B1538]" title="ungelesen" />}
                    {c.starred && <span className="ml-1" title="markiert">★</span>}
                  </td>
                  <td className="px-4 py-3">
                    <div className={`text-sm ${unread ? 'font-semibold text-[#1A1414]' : 'text-[#3F3838]'}`}>{c.name || '—'}</div>
                    <div className="text-xs text-[#6B5F5F] mt-0.5">{c.email}{c.phone ? ` · ${c.phone}` : ''}</div>
                  </td>
                  <td className="px-4 py-3 text-xs font-mono text-[#6B5F5F]">{c.service || '—'}</td>
                  <td className="px-4 py-3 text-sm text-[#3F3838] max-w-md">
                    <div className="truncate">{c.message || <span className="italic text-[#9B8F8F]">keine Nachricht</span>}</div>
                    {c.notes && <div className="text-[10px] font-mono text-[#8B1538] mt-1 truncate">Notiz: {c.notes}</div>}
                  </td>
                  <td className="px-4 py-3 text-xs text-[#6B5F5F]">{fmt(c.created_at)}</td>
                  <td className="px-4 py-3 text-right whitespace-nowrap">
                    <Link href={`/admin/contacts/${c.id}`} className="text-xs font-mono uppercase tracking-[0.15em] accent-text">Öffnen</Link>
                  </td>
                </tr>
              )
            })}
            {filtered.length === 0 && <tr><td colSpan="6" className="px-4 py-12 text-center text-sm text-[#6B5F5F] italic">Keine Kontakte entsprechen dem Filter.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  )
}
