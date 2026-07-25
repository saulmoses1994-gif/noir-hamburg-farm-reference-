'use client'
import { useState, useEffect, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeRaw from 'rehype-raw'
import { Field, StringArrayEditor, SaveToolbar, cls } from '@/components/admin/FormFields'
import CloudinaryImageField from '@/components/admin/CloudinaryImageField'

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

// ─────────────────────────────────────────────────────────────────────
//  FAQ Editor — language-independent structured Q/A editor.
//
//  Renders exactly one language column at a time. Each entry has a
//  Question input, an Answer textarea, delete + reorder buttons.
//  Validation (client-side only, non-blocking):
//    • Both Q and A required (empty rows are dropped at save time by
//      the server sanitizer).
//    • Duplicate questions in the same language are flagged with a
//      subtle warning line.
//    • Answers shorter than 20 characters get a "very short" hint.
//
//  When the OTHER language has entries but this language has none, a
//  banner is shown so admins know the translation is incomplete.
//
//  Preview: a Markdown-rendered mini preview of the last edited answer
//  is shown at the bottom so admins can verify formatting (bold, italic,
//  lists) before publishing.
// ─────────────────────────────────────────────────────────────────────
function FaqEditor({ lang, title, hint, value, onChange, otherLangCount, otherLangLabel }) {
  const list = Array.isArray(value) ? value : []
  const langLabel = lang === 'de' ? 'Deutsch' : 'English'
  // Duplicate detection: normalise + count questions, flag any that appear >1×.
  const dupes = new Set()
  {
    const seen = new Map()
    list.forEach((f, i) => {
      const key = (f?.q || '').trim().toLowerCase()
      if (!key) return
      if (seen.has(key)) { dupes.add(i); dupes.add(seen.get(key)) }
      else seen.set(key, i)
    })
  }
  const isMissingTranslation = list.length === 0 && otherLangCount > 0

  const update = (idx, patch) => {
    const next = list.slice()
    next[idx] = { ...next[idx], ...patch }
    onChange(next)
  }
  const add = () => onChange([...list, { q: '', a: '' }])
  const remove = (idx) => {
    if (!confirm('Diese FAQ wirklich entfernen?')) return
    onChange(list.filter((_, i) => i !== idx))
  }
  const move = (idx, dir) => {
    const j = idx + dir
    if (j < 0 || j >= list.length) return
    const next = list.slice()
    ;[next[idx], next[j]] = [next[j], next[idx]]
    onChange(next)
  }

  return (
    <section className="bg-white p-8 rounded-lg" data-testid={`faq-editor-${lang}`}>
      <div className="flex items-baseline justify-between mb-2">
        <h2 className="font-heading text-xl">{title}</h2>
        <span className="font-mono text-xs text-[#6B5F5F]">
          {list.length} Eintr{list.length === 1 ? 'ag' : 'äge'} · Sprache: {langLabel}
        </span>
      </div>
      <p className="text-xs text-[#6B5F5F] mb-4">{hint}</p>
      {isMissingTranslation && (
        <div className="text-xs bg-[#FEF3E4] border border-[#EEC474] text-[#8A5A00] rounded p-3 mb-4">
          ⚠ Die {otherLangLabel}-FAQs enthalten {otherLangCount} Eintr{otherLangCount === 1 ? 'ag' : 'äge'},
          aber für {langLabel} sind keine gepflegt. Auf der {langLabel}-Version des Artikels wird
          <strong> kein FAQ-Bereich</strong> angezeigt.
        </div>
      )}

      <div className="space-y-3">
        {list.map((f, i) => {
          const q = f?.q || ''
          const a = f?.a || ''
          const shortA = a.trim().length > 0 && a.trim().length < 20
          const isDupe = dupes.has(i)
          return (
            <div key={i} className="border border-[#1A1414]/10 rounded p-4 bg-[#FBF7F4]" data-testid={`faq-row-${lang}-${i}`}>
              <div className="flex items-center gap-2 mb-2">
                <span className="font-mono text-xs text-[#6B5F5F] w-8">#{i + 1}</span>
                <div className="flex-1 flex items-center gap-1 justify-end">
                  <button type="button" className="text-xs px-2 py-1 rounded border border-[#1A1414]/10 hover:bg-white disabled:opacity-30" onClick={() => move(i, -1)} disabled={i === 0} title="Nach oben">↑</button>
                  <button type="button" className="text-xs px-2 py-1 rounded border border-[#1A1414]/10 hover:bg-white disabled:opacity-30" onClick={() => move(i, +1)} disabled={i === list.length - 1} title="Nach unten">↓</button>
                  <button type="button" className="text-xs px-2 py-1 rounded border border-[#B00020]/30 text-[#B00020] hover:bg-[#B00020]/5" onClick={() => remove(i)} title="Löschen">Löschen</button>
                </div>
              </div>
              <label className="block text-[10px] font-mono uppercase tracking-[0.12em] text-[#6B5F5F] mb-1">Frage</label>
              <input
                value={q}
                onChange={(e) => update(i, { q: e.target.value })}
                placeholder={lang === 'de' ? 'Wie plane ich einen Abend?' : 'How do I plan an evening?'}
                className={`w-full px-3 py-2 border rounded font-heading text-lg mb-1 ${isDupe ? 'border-[#EEC474] bg-[#FEF3E4]' : 'border-[#1A1414]/15 bg-white'}`}
              />
              {isDupe && <div className="text-[11px] text-[#8A5A00] mb-2">⚠ Doppelte Frage — in derselben Sprache existiert bereits eine identische Frage.</div>}
              <label className="block text-[10px] font-mono uppercase tracking-[0.12em] text-[#6B5F5F] mt-2 mb-1">Antwort <span className="normal-case text-[#9B8F8F]">(Markdown erlaubt: **fett**, *kursiv*, [link](url))</span></label>
              <textarea
                value={a}
                onChange={(e) => update(i, { a: e.target.value })}
                placeholder={lang === 'de' ? 'Wir empfehlen ein Restaurant zu reservieren…' : 'We recommend reserving a restaurant…'}
                rows={4}
                className="w-full px-3 py-2 border border-[#1A1414]/15 rounded bg-white leading-relaxed"
              />
              {shortA && <div className="text-[11px] text-[#8A5A00] mt-1">Hinweis: sehr kurze Antwort — bitte mindestens 1–2 vollständige Sätze schreiben.</div>}
            </div>
          )
        })}
      </div>

      <button type="button" onClick={add} className="mt-4 px-4 py-2 rounded bg-[#1A1414] text-white text-sm hover:bg-black">
        + FAQ hinzufügen
      </button>
    </section>
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


// ─────────────────────────────────────────────────────────────────────
//  MigrationPanel — protected in-CMS entry point to the reflow migration
//
//  Wraps the internal `POST /api/blog/reflow-plaintext/[slug]` endpoint
//  with a preview-first, confirm-required, restore-capable UI. Every
//  request rides on the admin's existing HttpOnly session cookie — the
//  password never touches the client bundle, URLs, or logs.
//
//  Security posture:
//    • The endpoint itself is `requireAdmin`-gated server-side (401 for
//      unauthenticated / non-admin callers).
//    • Cookie is HttpOnly + Secure + SameSite=Lax → cross-site fetches
//      cannot forge a session (CSRF-safe for state-changing POST).
//    • No credential appears in any URL, header, or console log.
// ─────────────────────────────────────────────────────────────────────
function MigrationPanel({ slug }) {
  const [preview, setPreview] = useState(null)
  const [result, setResult] = useState(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [expanded, setExpanded] = useState(false)

  if (!slug) return null

  const call = async (url, opts = {}) => {
    setBusy(true); setError('')
    try {
      const r = await fetch(url, { method: 'POST', credentials: 'same-origin', ...opts })
      const d = await r.json()
      if (!r.ok) throw new Error(d?.detail || 'Fehler')
      return d
    } catch (e) { setError(String(e.message || e)); return null }
    finally { setBusy(false) }
  }

  const loadPreview = async () => {
    const d = await call(`/api/blog/reflow-plaintext/${encodeURIComponent(slug)}?dry_run=1`)
    if (d) { setPreview(d); setResult(null); setExpanded(true) }
  }
  const confirmMigrate = async () => {
    if (!confirm('Migration jetzt ausführen? Ein Backup wird automatisch erstellt.')) return
    const d = await call(`/api/blog/reflow-plaintext/${encodeURIComponent(slug)}`)
    if (d) { setResult(d); setPreview(null) }
  }
  const restore = async () => {
    if (!confirm('Backup wiederherstellen? Aktuelle Inhalte werden überschrieben.')) return
    const d = await call(`/api/blog/reflow-plaintext-restore/${encodeURIComponent(slug)}`)
    if (d) { setResult({ restored: d.restored }); setPreview(null) }
  }

  return (
    <section className="bg-[#FBF7F4] border border-[#1A1414]/10 p-8 rounded-lg" data-testid="migration-panel">
      <div className="flex items-baseline justify-between mb-2">
        <h2 className="font-heading text-xl">Legacy-Artikel migrieren</h2>
        <span className="font-mono text-xs text-[#6B5F5F]">Reflow • H2 + FAQs</span>
      </div>
      <p className="text-xs text-[#6B5F5F] mb-4 leading-relaxed">
        Konvertiert plain-text Artikel-Inhalte in strukturierte H2-Überschriften
        und übernimmt numerierte Q/A-Absätze in die deutschen FAQ-Felder. Der
        Vorgang erstellt automatisch ein Backup und ist über „Zurücksetzen&quot;
        rückgängig.
      </p>
      <div className="flex flex-wrap gap-2">
        <button type="button" onClick={loadPreview} disabled={busy}
          className="px-4 py-2 rounded bg-white border border-[#1A1414]/15 text-sm disabled:opacity-50">
          {busy ? '…' : 'Vorschau anzeigen'}
        </button>
        <button type="button" onClick={restore} disabled={busy}
          className="px-4 py-2 rounded bg-white border border-[#1A1414]/15 text-sm disabled:opacity-50 text-[#6B5F5F]">
          Backup wiederherstellen
        </button>
      </div>
      {error && <div className="mt-3 text-xs text-[#B00020] bg-[#FDECEC] rounded p-3">{error}</div>}
      {expanded && preview && (
        <div className="mt-6 border border-[#1A1414]/10 rounded p-4 bg-white text-sm">
          <div className="flex items-baseline justify-between mb-3">
            <strong className="font-heading text-base">Migrations-Vorschau</strong>
            {preview.alreadyMigrated && <span className="text-[10px] font-mono uppercase tracking-[0.14em] text-[#8A5A00] bg-[#FEF3E4] px-2 py-0.5 rounded">Bereits migriert</span>}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
            <div>
              <div className="text-[10px] font-mono uppercase tracking-[0.14em] text-[#6B5F5F] mb-1">Deutsch</div>
              <div>Überschriften: <strong>{preview.de.headingCount}</strong> · FAQs: <strong>{preview.de.faqCount}</strong></div>
              {preview.de.preview.headings.length > 0 && (
                <ul className="mt-2 space-y-1 text-xs text-[#3A2F2F] list-disc list-inside">
                  {preview.de.preview.headings.slice(0, 10).map((h, i) => <li key={i}>{h}</li>)}
                </ul>
              )}
              {preview.de.preview.firstFaq && (
                <div className="mt-3 text-xs">
                  <div className="text-[#6B5F5F]">Beispiel-FAQ:</div>
                  <div className="font-medium mt-1">Q: {preview.de.preview.firstFaq.q}</div>
                  <div className="text-[#6B5F5F] mt-1">A: {String(preview.de.preview.firstFaq.a).slice(0, 160)}…</div>
                </div>
              )}
            </div>
            <div>
              <div className="text-[10px] font-mono uppercase tracking-[0.14em] text-[#6B5F5F] mb-1">English</div>
              <div>Headings: <strong>{preview.en.headingCount}</strong> · FAQs: <strong>{preview.en.faqCount}</strong></div>
              {preview.en.preview.headings.length === 0 && preview.en.faqCount === 0 && (
                <div className="text-xs text-[#6B5F5F] mt-2">Kein Reflow für EN-Inhalt notwendig (bereits strukturiert oder leer).</div>
              )}
            </div>
          </div>
          <div className="flex gap-2 pt-3 border-t border-[#1A1414]/10">
            <button type="button" onClick={confirmMigrate} disabled={busy}
              className="px-4 py-2 rounded bg-[#1A1414] text-white text-sm hover:bg-black disabled:opacity-50">
              Migration ausführen
            </button>
            <button type="button" onClick={() => { setExpanded(false); setPreview(null) }}
              className="px-4 py-2 rounded border border-[#1A1414]/15 text-sm">
              Abbrechen
            </button>
          </div>
        </div>
      )}
      {result && (
        <div className="mt-4 text-xs bg-[#EDF7ED] border border-[#4C9A50]/30 text-[#1B5E20] rounded p-3">
          {result.restored ? (
            <>Wiederhergestellt: <code>{result.restored.join(', ')}</code></>
          ) : (
            <>Erfolg. DE: {result.de?.headingCount} Überschriften, {result.de?.faqCount} FAQs. EN: {result.en?.headingCount} Überschriften, {result.en?.faqCount} FAQs. Backups: <code>{(result.backedUp || []).join(', ')}</code></>
          )}
        </div>
      )}
    </section>
  )
}

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

  // `override` lets callers force specific fields (e.g. the publish toggle
  // passes { published: true }) without depending on the async React state
  // update landing before the fetch is fired. Fixes the "click Veröffentlichen
  // but article stays Entwurf" race condition.
  async function save(override = {}) {
    setSaving(true); setMsg(null)
    try {
      const merged = { ...doc, ...override }
      const payload = {
        slug: (merged.slug || '').trim(),
        title: (merged.title || '').trim(),
        title_en: merged.title_en || '',
        h1: merged.h1 || '',                    // optional custom H1 override — DE
        h1_en: merged.h1_en || '',              // optional custom H1 override — EN
        category: merged.category || '',
        excerpt: merged.excerpt || '', excerpt_en: merged.excerpt_en || '',
        content: merged.content || '', content_en: merged.content_en || '',
        cover_image: merged.cover_image || '',
        meta_title: merged.meta_title || '', meta_title_en: merged.meta_title_en || '',
        meta_description: merged.meta_description || '', meta_description_en: merged.meta_description_en || '',
        related_services: merged.related_services || [],
        related_locations: merged.related_locations || [],
        faqs: merged.faqs || [],
        faqs_de: merged.faqs_de || [],
        faqs_en: merged.faqs_en || [],
        // MULTILINGUAL: send slug_en. If the field is blank the server
        // auto-derives it from title_en via resolveBlogSlugEn(). If the
        // editor typed a custom slug, the server sanitises + enforces
        // uniqueness. Either way the API returns the final value.
        slug_en: (merged.slug_en || '').trim(),
        published: !!merged.published,
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
            onClick={() => {
              const nextPublished = !doc.published
              set('published', nextPublished)
              save({ published: nextPublished })
            }}
            disabled={saving}
            className={`text-xs font-mono uppercase tracking-[0.15em] px-4 py-2 rounded-full border transition-colors ${isDraft ? 'border-[#2D7A4E] text-[#2D7A4E] hover:bg-[#DCEFE2]' : 'border-[#6B5F5F] text-[#6B5F5F] hover:bg-[#F2EAE4]'}`}
          >
            {isDraft ? 'Veröffentlichen' : 'Auf Entwurf setzen'}
          </button>
          <button onClick={() => save()} disabled={saving} className="btn-primary !text-xs !py-2 !px-5 disabled:opacity-50">
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
            {/* Optional custom H1 override per language. Empty = fall back
                to the corresponding Titel (SEO best practice: an article
                page has exactly one <h1>, independent from <title> and
                meta description). */}
            <div>
              <label className="block text-xs font-mono uppercase tracking-[0.15em] text-[#6B5F5F] mb-1.5">
                H1 (DE) <span className="text-[#B8AFAF] normal-case tracking-normal">— optional, Fallback: Titel (DE)</span>
              </label>
              <input
                type="text"
                value={doc.h1 || ''}
                onChange={(e) => set('h1', e.target.value)}
                placeholder={doc.title || 'wird auf den Titel (DE) zurückgesetzt, wenn leer'}
                className={cls('input')}
              />
              <div className="text-[11px] font-mono text-[#6B5F5F] mt-1">
                Erscheint als sichtbare Hauptüberschrift &lt;h1&gt; auf der DE-Seite. Leer lassen für Standardverhalten.
              </div>
            </div>
            <div>
              <label className="block text-xs font-mono uppercase tracking-[0.15em] text-[#6B5F5F] mb-1.5">
                H1 (EN) <span className="text-[#B8AFAF] normal-case tracking-normal">— optional, fallback: Titel (EN)</span>
              </label>
              <input
                type="text"
                value={doc.h1_en || ''}
                onChange={(e) => set('h1_en', e.target.value)}
                placeholder={doc.title_en || 'falls back to Titel (EN) when empty'}
                className={cls('input')}
              />
              <div className="text-[11px] font-mono text-[#6B5F5F] mt-1">
                Renders as the visible &lt;h1&gt; on the EN page. Leave empty to reuse Titel (EN).
              </div>
            </div>
            <div>
              <label className="block text-xs font-mono uppercase tracking-[0.15em] text-[#6B5F5F] mb-1.5">Slug (DE)</label>
              <input type="text" value={doc.slug || ''} onChange={(e) => set('slug', e.target.value)} disabled={mode === 'edit'} className={cls('input') + (mode === 'edit' ? ' opacity-60 cursor-not-allowed' : '')} />
              <div className="text-[11px] font-mono text-[#6B5F5F] mt-1">a-z, 0-9, hyphen — nicht änderbar</div>
            </div>
            {/* MULTILINGUAL BLOG: URL slug for the /en/blog/… version.
                Leave empty to auto-derive from Titel (EN) on save. Editors
                may override to shorten or personalise. Server sanitises
                (lowercase, ASCII-only) and enforces uniqueness. */}
            <div>
              <label className="block text-xs font-mono uppercase tracking-[0.15em] text-[#6B5F5F] mb-1.5">
                Slug (EN) <span className="text-[#B8AFAF] normal-case tracking-normal">— optional, auto-generiert aus Titel (EN)</span>
              </label>
              <input
                type="text"
                value={doc.slug_en || ''}
                onChange={(e) => set('slug_en', e.target.value)}
                placeholder={doc.title_en ? slugify(doc.title_en) : 'wird beim Speichern aus Titel (EN) generiert'}
                className={cls('input')}
              />
              <div className="text-[11px] font-mono text-[#6B5F5F] mt-1">
                URL: <code>/en/blog/{doc.slug_en || (doc.title_en ? slugify(doc.title_en) : '?')}</code>
                {' · '}leerlassen für Auto-Generierung
              </div>
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
              <CloudinaryImageField
                label="Cover-Bild"
                name="cover_image"
                value={doc.cover_image}
                onChange={set}
                folder="noir-hamburg/blog"
              />
            </div>
            <Field label="Excerpt (DE)" name="excerpt" type="textarea" value={doc.excerpt} onChange={set} />
            <Field label="Excerpt (EN)" name="excerpt_en" type="textarea" value={doc.excerpt_en} onChange={set} />
          </div>
        </section>

        <section className="bg-white p-8 rounded-lg">
          <h2 className="font-heading text-xl mb-3">Content (DE)</h2>
          <p className="text-xs font-mono text-[#6B5F5F] mb-2">Markdown links — Live-Vorschau rechts.</p>
          <div className="text-xs text-[#6B5F5F] bg-[#F8F4F0] border border-[#1A1414]/8 rounded p-3 mb-4 leading-relaxed">
            <strong className="text-[#1A1414]">Formatierungs-Hilfe:</strong>{' '}
            <code>## Überschrift</code> → H2 ·{' '}
            <code>### Unter</code> → H3 ·{' '}
            <code>- Punkt</code> → Aufzählung ·{' '}
            <code>1. Punkt</code> → Nummerierte Liste ·{' '}
            <code>**fett**</code> ·{' '}
            <code>*kursiv*</code> ·{' '}
            <code>[Text](https://url)</code>
          </div>
          <MarkdownSplitPane label="content" value={doc.content} onChange={(v) => set('content', v)} />
        </section>

        <section className="bg-white p-8 rounded-lg">
          <h2 className="font-heading text-xl mb-3">Content (EN)</h2>
          <MarkdownSplitPane label="content_en" value={doc.content_en} onChange={(v) => set('content_en', v)} />
        </section>

        <FaqEditor
          lang="de"
          title="FAQs (Deutsch)"
          hint="Angezeigt auf /blog/… und im FAQPage-Schema. Optional — leer lassen, um keinen FAQ-Bereich zu zeigen."
          value={doc.faqs_de || []}
          onChange={(v) => set('faqs_de', v)}
          otherLangCount={(doc.faqs_en || []).length}
          otherLangLabel="English"
        />

        <FaqEditor
          lang="en"
          title="FAQs (English)"
          hint="Shown on /en/blog/… and in the FAQPage schema. Optional — leave empty to render no FAQ section."
          value={doc.faqs_en || []}
          onChange={(v) => set('faqs_en', v)}
          otherLangCount={(doc.faqs_de || []).length}
          otherLangLabel="Deutsch"
        />

        <MigrationPanel slug={mode === 'edit' ? initial.slug : ''} />

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
