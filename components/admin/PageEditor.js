'use client'
import { useState, useEffect, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeRaw from 'rehype-raw'
import { Field, StringArrayEditor, SaveToolbar, cls } from '@/components/admin/FormFields'

function slugify(s) {
  return String(s || '').toLowerCase()
    .replace(/[äàáâ]/g, 'a').replace(/[öòóô]/g, 'o').replace(/[üùúû]/g, 'u')
    .replace(/[éèêë]/g, 'e').replace(/ß/g, 'ss')
    .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
}

function MarkdownSplitPane({ value, onChange }) {
  return (
    <div className="grid grid-cols-2 gap-4 border border-[#1A1414]/15 rounded-md overflow-hidden bg-white">
      <textarea
        value={value || ''} onChange={(e) => onChange(e.target.value)}
        className="px-3 py-3 text-sm font-mono leading-relaxed focus:outline-none border-r border-[#1A1414]/10 min-h-[420px] resize-y"
        spellCheck={false}
        placeholder="# Überschrift\n\nMarkdown oder rohes HTML."
      />
      <div className="px-4 py-3 prose prose-sm max-w-none overflow-y-auto min-h-[420px] max-h-[600px] bg-[#FBF7F4]">
        <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>{value || '*Vorschau erscheint hier.*'}</ReactMarkdown>
      </div>
    </div>
  )
}

function DeleteModal({ slug, onCancel, onConfirm, busy }) {
  const [typed, setTyped] = useState('')
  return (
    <div className="fixed inset-0 z-[100] bg-black/70 flex items-center justify-center px-6" onClick={onCancel}>
      <div className="bg-white rounded-lg max-w-lg w-full p-8" onClick={(e) => e.stopPropagation()}>
        <h2 className="font-heading text-2xl mb-3">Seite löschen?</h2>
        <p className="text-sm text-[#6B5F5F] leading-relaxed">Wird sofort von der öffentlichen Seite entfernt. Soft-delete mit <code className="font-mono text-xs bg-[#F7F5F2] px-1">deleted_at</code> — Wiederherstellung per Mongo-Query.</p>
        <div className="mt-5">
          <label className="block text-xs font-mono uppercase tracking-[0.15em] text-[#6B5F5F] mb-2">Zur Bestätigung Slug tippen: <code className="accent-text">{slug}</code></label>
          <input type="text" autoFocus value={typed} onChange={(e) => setTyped(e.target.value)} className={cls('input')} />
        </div>
        <div className="mt-6 flex justify-end gap-3">
          <button onClick={onCancel} className="btn-ghost !text-xs !py-2 !px-4" disabled={busy}>Abbrechen</button>
          <button onClick={onConfirm} disabled={typed !== slug || busy} className="btn-primary !text-xs !py-2 !px-4 disabled:opacity-40 !bg-[#8B1538]">
            {busy ? 'Lösche …' : 'Endgültig löschen'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function PageEditor({ mode, initial }) {
  const router = useRouter()
  const [doc, setDoc] = useState(initial)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [showDelete, setShowDelete] = useState(false)
  const [msg, setMsg] = useState(null)
  const [, startTransition] = useTransition()

  const set = (name, value) => setDoc((d) => ({ ...d, [name]: value }))

  async function save() {
    setSaving(true); setMsg(null)
    try {
      const payload = {
        slug: (doc.slug || '').trim(),
        title: (doc.title || '').trim(),
        h1: doc.h1 || '',
        intro: doc.intro || '',
        content: doc.content || '',
        hero_image: doc.hero_image || '',
        meta_title: doc.meta_title || '',
        meta_description: doc.meta_description || '',
        related_services: doc.related_services || [],
        related_locations: doc.related_locations || [],
        published: !!doc.published,
      }
      const url = mode === 'create' ? '/api/pages' : `/api/pages/${initial.slug}`
      const method = mode === 'create' ? 'POST' : 'PUT'
      const r = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify(payload) })
      const data = await r.json().catch(() => ({}))
      if (!r.ok) { setMsg({ type: 'error', text: data?.detail || 'Speichern fehlgeschlagen' }); return }
      setMsg({ type: 'ok', text: `Gespeichert · ${new Date().toLocaleTimeString('de-DE')}` })
      if (mode === 'create') startTransition(() => router.push(`/admin/pages/edit/${data.slug}`))
      else startTransition(() => router.refresh())
    } catch (e) {
      setMsg({ type: 'error', text: e.message || 'Netzwerkfehler' })
    } finally { setSaving(false) }
  }

  async function doDelete() {
    setDeleting(true)
    try {
      const r = await fetch(`/api/pages/${initial.slug}`, { method: 'DELETE', credentials: 'include' })
      const data = await r.json().catch(() => ({}))
      if (!r.ok) { setMsg({ type: 'error', text: data?.detail || 'Löschen fehlgeschlagen' }); setShowDelete(false); return }
      router.push('/admin/pages'); router.refresh()
    } finally { setDeleting(false) }
  }

  const isDraft = !doc.published

  return (
    <div className="p-10 max-w-6xl">
      <div className="flex items-baseline justify-between mb-8">
        <div>
          <div className="overline">{mode === 'create' ? 'Neue Seite' : 'Seite bearbeiten'}</div>
          <h1 className="font-heading text-4xl mt-2">{doc.title || <span className="italic text-[#9B8F8F]">Unbenannt</span>}</h1>
          <div className="font-mono text-xs text-[#6B5F5F] mt-1 flex items-center gap-3">
            <span>/p/{doc.slug || '?'}</span>
            {isDraft
              ? <span className="px-2 py-0.5 rounded-full bg-[#F2EAE4] uppercase tracking-[0.15em]">Entwurf</span>
              : <span className="px-2 py-0.5 rounded-full bg-[#DCEFE2] text-[#2D7A4E] uppercase tracking-[0.15em]">Live</span>}
          </div>
        </div>
        <div className="flex items-center gap-3">
          {mode === 'edit' && <button onClick={() => setShowDelete(true)} className="text-xs font-mono uppercase tracking-[0.15em] text-[#8B1538] hover:underline">Löschen</button>}
          <button
            onClick={() => { set('published', !doc.published); setTimeout(save, 50) }}
            disabled={saving}
            className={`text-xs font-mono uppercase tracking-[0.15em] px-4 py-2 rounded-full border transition-colors ${isDraft ? 'border-[#2D7A4E] text-[#2D7A4E] hover:bg-[#DCEFE2]' : 'border-[#6B5F5F] text-[#6B5F5F] hover:bg-[#F2EAE4]'}`}
          >{isDraft ? 'Veröffentlichen' : 'Auf Entwurf setzen'}</button>
          <button onClick={save} disabled={saving} className="btn-primary !text-xs !py-2 !px-5 disabled:opacity-50">
            {saving ? 'Speichern …' : (mode === 'create' ? 'Erstellen' : 'Speichern')}
          </button>
        </div>
      </div>

      <div className="space-y-8">
        <section className="bg-white p-8 rounded-lg">
          <h2 className="font-heading text-xl mb-6">Basis</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <Field label="Titel" name="title" type="input" value={doc.title} onChange={(k, v) => { set(k, v); if (mode === 'create' && !doc.slug) set('slug', slugify(v)) }} />
            <div>
              <label className="block text-xs font-mono uppercase tracking-[0.15em] text-[#6B5F5F] mb-1.5">Slug</label>
              <input type="text" value={doc.slug || ''} onChange={(e) => set('slug', e.target.value)} disabled={mode === 'edit'} className={cls('input') + (mode === 'edit' ? ' opacity-60 cursor-not-allowed' : '')} />
              <div className="text-[11px] font-mono text-[#6B5F5F] mt-1">/p/{doc.slug || '…'}</div>
            </div>
            <Field label="H1 (Hero)" name="h1" type="input" value={doc.h1} onChange={set} />
            <Field label="Hero-Bild URL" name="hero_image" type="input" value={doc.hero_image} onChange={set} />
            <div className="md:col-span-2"><Field label="Intro" name="intro" type="textarea" value={doc.intro} onChange={set} /></div>
          </div>
        </section>

        <section className="bg-white p-8 rounded-lg">
          <h2 className="font-heading text-xl mb-3">Content</h2>
          <p className="text-xs font-mono text-[#6B5F5F] mb-4">Markdown oder HTML links — Live-Vorschau rechts.</p>
          <MarkdownSplitPane value={doc.content} onChange={(v) => set('content', v)} />
        </section>

        <section className="bg-white p-8 rounded-lg">
          <h2 className="font-heading text-xl mb-6">SEO</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <Field label="Meta Title" name="meta_title" type="input" value={doc.meta_title} onChange={set} showCounter />
            <Field label="Meta Description" name="meta_description" type="textarea" value={doc.meta_description} onChange={set} showCounter />
          </div>
        </section>

        <section className="bg-white p-8 rounded-lg">
          <h2 className="font-heading text-xl mb-6">Verwandte</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <StringArrayEditor label="Related Services (Slugs)" items={doc.related_services} onChange={(v) => set('related_services', v)} />
            <StringArrayEditor label="Related Locations (Slugs)" items={doc.related_locations} onChange={(v) => set('related_locations', v)} />
          </div>
        </section>

        <SaveToolbar saving={saving} onSave={save} msg={msg} />
      </div>

      {showDelete && <DeleteModal slug={initial.slug} onCancel={() => setShowDelete(false)} onConfirm={doDelete} busy={deleting} />}
    </div>
  )
}
