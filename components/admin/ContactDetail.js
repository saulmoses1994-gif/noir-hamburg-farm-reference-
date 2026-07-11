'use client'
import { useState, useEffect, useTransition } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { cls } from '@/components/admin/FormFields'

function fmt(d) {
  if (!d) return '—'
  try { return new Date(d).toLocaleString('de-DE', { dateStyle: 'medium', timeStyle: 'short' }) } catch { return '—' }
}

export default function ContactDetail({ initial }) {
  const router = useRouter()
  const [c, setC] = useState(initial)
  const [notes, setNotes] = useState(initial.notes || '')
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState(null)
  const [, startTransition] = useTransition()

  // Auto mark-as-read on first open.
  useEffect(() => {
    if (c.read !== true) {
      patch({ read: true }, false)
    }
    // eslint-disable-next-line
  }, [])

  async function patch(update, showToast = true) {
    setSaving(true); setMsg(null)
    try {
      const r = await fetch(`/api/contacts/${c.id}`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        credentials: 'include', body: JSON.stringify(update),
      })
      const data = await r.json().catch(() => ({}))
      if (!r.ok) { setMsg({ type: 'error', text: data?.detail || 'Speichern fehlgeschlagen' }); return }
      setC(data)
      if (showToast) setMsg({ type: 'ok', text: `Gespeichert · ${new Date().toLocaleTimeString('de-DE')}` })
      startTransition(() => router.refresh())
    } catch (e) {
      setMsg({ type: 'error', text: e.message || 'Netzwerkfehler' })
    } finally { setSaving(false) }
  }

  const mailto = c.email
    ? `mailto:${c.email}?subject=${encodeURIComponent('Re: Ihre Anfrage bei Noir Hamburg')}`
    : null

  return (
    <div className="p-10 max-w-5xl">
      <div className="mb-6">
        <Link href="/admin/contacts" className="text-xs font-mono uppercase tracking-[0.15em] text-[#6B5F5F] hover:accent-text">← Zurück zur Inbox</Link>
      </div>

      <div className="flex items-start justify-between mb-8">
        <div>
          <div className="overline">Kontakt</div>
          <h1 className="font-heading text-4xl mt-2">{c.name || <span className="italic text-[#9B8F8F]">Ohne Namen</span>}</h1>
          <div className="font-mono text-xs text-[#6B5F5F] mt-2 flex flex-wrap items-center gap-3">
            <span>{c.email || '—'}</span>
            {c.phone && <span>· {c.phone}</span>}
            <span>· {fmt(c.created_at)}</span>
            {c.read === true
              ? <span className="px-2 py-0.5 rounded-full bg-[#F2EAE4] uppercase tracking-[0.15em]">gelesen</span>
              : <span className="px-2 py-0.5 rounded-full bg-[#8B1538] text-white uppercase tracking-[0.15em]">ungelesen</span>}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {mailto && <a href={mailto} className="btn-primary !text-xs !py-2 !px-4">Antworten</a>}
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-8">
        <button onClick={() => patch({ read: !c.read })} disabled={saving} className="text-xs font-mono uppercase tracking-[0.15em] px-4 py-2 border border-[#1A1414]/15 rounded-full hover:bg-white transition-colors">
          {c.read ? 'Als ungelesen markieren' : 'Als gelesen markieren'}
        </button>
        <button onClick={() => patch({ starred: !c.starred })} disabled={saving} className={`text-xs font-mono uppercase tracking-[0.15em] px-4 py-2 border rounded-full transition-colors ${c.starred ? 'border-[#8B1538] text-[#8B1538] bg-[#F4E4E4]' : 'border-[#1A1414]/15 hover:bg-white'}`}>
          {c.starred ? '★ Markiert' : 'Markieren'}
        </button>
        <button onClick={() => patch({ archived: !c.archived })} disabled={saving} className="text-xs font-mono uppercase tracking-[0.15em] px-4 py-2 border border-[#1A1414]/15 rounded-full hover:bg-white transition-colors">
          {c.archived ? 'Aus Archiv holen' : 'Archivieren'}
        </button>
      </div>

      {msg && <div className={`mb-6 px-4 py-3 rounded text-sm ${msg.type === 'ok' ? 'bg-[#DCEFE2] text-[#2D7A4E]' : 'bg-[#F4E4E4] text-[#8B1538]'}`}>{msg.text}</div>}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <section className="bg-white p-8 rounded-lg lg:col-span-2">
          <h2 className="font-heading text-xl mb-4">Nachricht</h2>
          <div className="text-sm text-[#3F3838] leading-relaxed whitespace-pre-wrap">{c.message || <span className="italic text-[#9B8F8F]">keine Nachricht</span>}</div>

          <div className="mt-8 pt-6 border-t border-[#1A1414]/8 grid grid-cols-2 gap-4 text-sm">
            {c.service && <div><div className="text-[10px] font-mono uppercase tracking-[0.15em] text-[#6B5F5F]">Service</div><div>{c.service}</div></div>}
            {c.model_slug && <div><div className="text-[10px] font-mono uppercase tracking-[0.15em] text-[#6B5F5F]">Model</div><div>{c.model_slug}</div></div>}
            {c.location && <div><div className="text-[10px] font-mono uppercase tracking-[0.15em] text-[#6B5F5F]">Location</div><div>{c.location}</div></div>}
            {c.date && <div><div className="text-[10px] font-mono uppercase tracking-[0.15em] text-[#6B5F5F]">Gewünschter Termin</div><div>{c.date}</div></div>}
            {c.source_page && <div className="col-span-2"><div className="text-[10px] font-mono uppercase tracking-[0.15em] text-[#6B5F5F]">Herkunft</div><div className="font-mono text-xs">{c.source_page}</div></div>}
            {c.status && <div><div className="text-[10px] font-mono uppercase tracking-[0.15em] text-[#6B5F5F]">Status (Legacy)</div><div className="font-mono text-xs">{c.status}</div></div>}
          </div>
        </section>

        <section className="bg-white p-8 rounded-lg">
          <h2 className="font-heading text-xl mb-2">Interne Notizen</h2>
          <p className="text-xs text-[#6B5F5F] mb-3">Nicht sichtbar für Kunden. Für Follow-ups, Anruf-Historie …</p>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className={cls('textarea-lg')}
            placeholder="z. B.  '12.02 angerufen — will Freitag Dinner-Escort ab 19h'"
          />
          <button
            onClick={() => patch({ notes })}
            disabled={saving || notes === (c.notes || '')}
            className="btn-primary !text-xs !py-2 !px-4 mt-3 disabled:opacity-40"
          >{saving ? 'Speichern …' : 'Notiz speichern'}</button>
          {c.updated_at && <div className="text-[10px] font-mono text-[#6B5F5F] mt-3">zuletzt bearbeitet: {fmt(c.updated_at)}</div>}
        </section>
      </div>
    </div>
  )
}
