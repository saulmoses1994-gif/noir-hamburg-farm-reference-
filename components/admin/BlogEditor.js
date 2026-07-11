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

function MarkdownSplitPane({ label, value, onChange }) {
  return (
    <div>
      <label className="block text-xs font-mono uppercase tracking-[0.15em] text-[#6B5F5F] mb-2">{label}</label>
      <div className="grid grid-cols-2 gap-4 border border-[#1A1414]/15 rounded-md overflow-hidden bg-white">
        <textarea
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          className="px-3 py-3 text-sm font-mono leading-relaxed focus:outline-none border-r border-[#1A1414]/10 min-h-[380px] resize-y"
          spellCheck={false}
          placeholder="# Überschrift\n\nText mit **Markdown**."
        />
        <div className="px-4 py-3 prose prose-sm max-w-none overflow-y-auto min-h-[380px] max-h-[600px] bg-[#FBF7F4]">
          <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>{value || '*Vorschau erscheint hier — tippe links los.*'}</ReactMarkdown>
        </div>
      </div>
    </div>
  )
}

function DeleteModal({ slug, onCancel, onConfirm, busy }) {
  const [typed, setTyped] = useState('')
  return (
    <div className="fixed inset-0 z-[100] bg-black/70 flex items-center justify-center px-6" onClick={onCancel}>
      <div className="bg-white rounded-lg max-w-lg w-full p-8" onClick={(e) => e.stopPropagation()}>
        <h2 className="font-heading text-2xl mb-3">Beitrag löschen?</h2>
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

const CATEGORIES = [
  'Escort Advice', 'Escort Guides', 'FAQ Guides',
  'Restaurants', 'Fine Dining Hamburg', 'Luxury Hotels Hamburg',
  'Nightlife Hamburg', 'Hamburg Lifestyle', 'Luxury Lifestyle',
  'Business Travel Hamburg', 'Privacy & Discretion',
]

export default function BlogEditor({ mode, initial }) {
  const router = useRouter()
  const [doc, setDoc] = useState(initial)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [showDelete, setShowDelete] = useState(false)
  const [msg, setMsg] = useState(null)
  const [draftMsg, setDraftMsg] = useState('')
  const [, startTransition] = useTransition()

  const draftKey = `blog-draft:${mode}:${initial.slug || 'new'}`

  // Auto-save-draft to localStorage every 30s.
  useEffect(() => {
    const iv = setInterval(() => {
      try {
        localStorage.setItem(draftKey, JSON.stringify({ ...doc, _savedAt: Date.now() }))
        setDraftMsg(`Entwurf lokal gespeichert · ${new Date().toLocaleTimeString('de-DE')}`)
      } catch {}
    }, 30000)
    return () => clearInterval(iv)
  }, [doc, draftKey])

  // Offer restore on mount.
  useEffect(() => {
    try {
      const raw = localStorage.getItem(draftKey)
      if (!raw) return
      const saved = JSON.parse(raw)
      // Only offer if it looks newer than the DB doc (updated_at) or if create mode.
      const dbTime = new Date(initial.updated_at || 0).getTime()
      if (saved._savedAt && saved._savedAt > dbTime + 5000) {
        if (confirm('Ein neuerer lokaler Entwurf wurde gefunden. Wiederherstellen?')) {
          setDoc(saved)
        } else {
          localStorage.removeItem(draftKey)
        }
      }
    } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const set = (name, value) => setDoc((d) => ({ ...d, [name]: value }))

  async function save() {
    setSaving(true); setMsg(null)
    try {
      const payload = {
        slug: (doc.slug || '').trim(),
        title: (doc.title || '').trim(),
        title_en: doc.title_en || '',
        category: doc.category || '',
        excerpt: doc.excerpt || '', excerpt_en: doc.excerpt_en || '',
        content: doc.content || '', content_en: doc.content_en || '',
        cover_image: doc.cover_image || '',
        meta_title: doc.meta_title || '', meta_title_en: doc.meta_title_en || '',
        meta_description: doc.meta_description || '', meta_description_en: doc.meta_description_en || '',
        related_services: doc.related_services || [],
        related_locations: doc.related_locations || [],
        published: !!doc.published,
      }
      const url = mode === 'create' ? '/api/blog' : `/api/blog/${initial.slug}`
      const method = mode === 'create' ? 'POST' : 'PUT'
      const r = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify(payload) })
      const data = await r.json().catch(() => ({}))
      if (!r.ok) { setMsg({ type: 'error', text: data?.detail || 'Speichern fehlgeschlagen' }); return }
      setMsg({ type: 'ok', text: `Gespeichert · ${new Date().toLocaleTimeString('de-DE')}` })
      try { localStorage.removeItem(draftKey) } catch {}
      if (mode === 'create') startTransition(() => router.push(`/admin/blog/edit/${data.slug}`))
      else startTransition(() => router.refresh())
    } catch (e) {
      setMsg({ type: 'error', text: e.message || 'Netzwerkfehler' })
    } finally { setSaving(false) }
  }

  async function doDelete() {
    setDeleting(true)
    try {
      const r = await fetch(`/api/blog/${initial.slug}`, { method: 'DELETE', credentials: 'include' })
      const data = await r.json().catch(() => ({}))
      if (!r.ok) { setMsg({ type: 'error', text: data?.detail || 'Löschen fehlgeschlagen' }); setShowDelete(false); return }
      try { localStorage.removeItem(draftKey) } catch {}
      router.push('/admin/blog'); router.refresh()
    } finally { setDeleting(false) }
  }

  const isDraft = !doc.published

  return (
    <div className="p-10 max-w-6xl">
      <div className="flex items-baseline justify-between mb-8">
        <div>
          <div className="overline">{mode === 'create' ? 'Neuer Beitrag' : 'Beitrag bearbeiten'}</div>
          <h1 className="font-heading text-4xl mt-2">{doc.title || <span className="italic text-[#9B8F8F]">Unbenannt</span>}</h1>
          <div className="font-mono text-xs text-[#6B5F5F] mt-1 flex items-center gap-3">
            <span>/blog/{doc.slug || '?'}</span>
            {isDraft
              ? <span className="px-2 py-0.5 rounded-full bg-[#F2EAE4] uppercase tracking-[0.15em]">Entwurf</span>
              : <span className="px-2 py-0.5 rounded-full bg-[#DCEFE2] text-[#2D7A4E] uppercase tracking-[0.15em]">Live</span>}
            {draftMsg && <span className="italic text-[#9B8F8F]">· {draftMsg}</span>}
          </div>
        </div>
        <div className="flex items-center gap-3">
          {mode === 'edit' && <button onClick={() => setShowDelete(true)} className="text-xs font-mono uppercase tracking-[0.15em] text-[#8B1538] hover:underline">Löschen</button>}
          <button
            onClick={() => { set('published', !doc.published); setTimeout(save, 50) }}
            disabled={saving}
            className={`text-xs font-mono uppercase tracking-[0.15em] px-4 py-2 rounded-full border transition-colors ${isDraft ? 'border-[#2D7A4E] text-[#2D7A4E] hover:bg-[#DCEFE2]' : 'border-[#6B5F5F] text-[#6B5F5F] hover:bg-[#F2EAE4]'}`}
          >
            {isDraft ? 'Veröffentlichen' : 'Auf Entwurf setzen'}
          </button>
          <button onClick={save} disabled={saving} className="btn-primary !text-xs !py-2 !px-5 disabled:opacity-50">
            {saving ? 'Speichern …' : (mode === 'create' ? 'Erstellen' : 'Speichern')}
          </button>
        </div>
      </div>

      <div className="space-y-8">
        <section className="bg-white p-8 rounded-lg">
          <h2 className="font-heading text-xl mb-6">Basis</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <Field label="Titel (DE)" name="title" type="input" value={doc.title} onChange={(k, v) => { set(k, v); if (mode === 'create' && !doc.slug) set('slug', slugify(v)) }} />
            <Field label="Titel (EN)" name="title_en" type="input" value={doc.title_en} onChange={set} />
            <div>
              <label className="block text-xs font-mono uppercase tracking-[0.15em] text-[#6B5F5F] mb-1.5">Slug</label>
              <input type="text" value={doc.slug || ''} onChange={(e) => set('slug', e.target.value)} disabled={mode === 'edit'} className={cls('input') + (mode === 'edit' ? ' opacity-60 cursor-not-allowed' : '')} />
              <div className="text-[11px] font-mono text-[#6B5F5F] mt-1">a-z, 0-9, hyphen — nicht änderbar</div>
            </div>
            <div>
              <label className="block text-xs font-mono uppercase tracking-[0.15em] text-[#6B5F5F] mb-1.5">Kategorie</label>
              <select value={doc.category || ''} onChange={(e) => set('category', e.target.value)} className={cls('input')}>
                <option value="">— wählen —</option>
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                {doc.category && !CATEGORIES.includes(doc.category) && <option value={doc.category}>{doc.category}</option>}
              </select>
            </div>
            <div className="md:col-span-2">
              <Field label="Cover-Bild URL" name="cover_image" type="input" value={doc.cover_image} onChange={set} />
              {doc.cover_image && <img src={doc.cover_image} alt="cover" className="mt-3 h-40 rounded-md object-cover" />}
            </div>
            <Field label="Excerpt (DE)" name="excerpt" type="textarea" value={doc.excerpt} onChange={set} />
            <Field label="Excerpt (EN)" name="excerpt_en" type="textarea" value={doc.excerpt_en} onChange={set} />
          </div>
        </section>

        <section className="bg-white p-8 rounded-lg">
          <h2 className="font-heading text-xl mb-3">Content (DE)</h2>
          <p className="text-xs font-mono text-[#6B5F5F] mb-4">Markdown links — Live-Vorschau rechts.</p>
          <MarkdownSplitPane label="content" value={doc.content} onChange={(v) => set('content', v)} />
        </section>

        <section className="bg-white p-8 rounded-lg">
          <h2 className="font-heading text-xl mb-3">Content (EN)</h2>
          <MarkdownSplitPane label="content_en" value={doc.content_en} onChange={(v) => set('content_en', v)} />
        </section>

        <section className="bg-white p-8 rounded-lg">
          <h2 className="font-heading text-xl mb-6">SEO</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <Field label="Meta Title (DE)" name="meta_title" type="input" value={doc.meta_title} onChange={set} showCounter />
            <Field label="Meta Title (EN)" name="meta_title_en" type="input" value={doc.meta_title_en} onChange={set} showCounter />
            <Field label="Meta Description (DE)" name="meta_description" type="textarea" value={doc.meta_description} onChange={set} showCounter />
            <Field label="Meta Description (EN)" name="meta_description_en" type="textarea" value={doc.meta_description_en} onChange={set} showCounter />
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
