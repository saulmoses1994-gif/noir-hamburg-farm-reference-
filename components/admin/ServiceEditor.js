'use client'
import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'

// Editable whitelist — must match the server-side whitelist in the PUT handler.
const SIMPLE_FIELDS = [
  ['title', 'Title (intern)', 'input'],
  ['title_en', 'Title (EN) — bestimmt den H1 auf /en/services/…', 'input'],
  ['short_label', 'Short label', 'input'],
  ['h1', 'H1 (Hero, wird auf beiden Sprachen genutzt)', 'input'],
  ['tagline', 'Tagline (DE)', 'input'],
  ['tagline_en', 'Tagline (EN)', 'input'],
  ['description', 'Kurzbeschreibung (DE)', 'textarea'],
  ['description_en', 'Short description (EN)', 'textarea'],
  ['long_copy', 'Lange Einleitung (DE)', 'textarea-lg'],
  ['long_copy_en', 'Long intro (EN)', 'textarea-lg'],
  ['meta_title', 'Meta Title (DE) — max ~65 Zeichen', 'input'],
  ['meta_title_en', 'Meta Title (EN)', 'input'],
  ['meta_description', 'Meta Description (DE) — max ~160 Zeichen', 'textarea'],
  ['meta_description_en', 'Meta Description (EN)', 'textarea'],
  ['image', 'Hero-Bild URL', 'input'],
  ['image_alt', 'Hero-Bild Alt (DE)', 'input'],
  ['image_alt_en', 'Hero image alt (EN)', 'input'],
]

function cls(t) {
  if (t === 'textarea-lg') return 'w-full border border-[#1A1414]/15 rounded-md px-3 py-2 text-sm min-h-[200px] font-body leading-relaxed focus:outline-none focus:border-[#8B1538]'
  if (t === 'textarea') return 'w-full border border-[#1A1414]/15 rounded-md px-3 py-2 text-sm min-h-[80px] focus:outline-none focus:border-[#8B1538]'
  return 'w-full border border-[#1A1414]/15 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-[#8B1538]'
}

function Field({ label, name, type, value, onChange }) {
  const common = { name, value: value ?? '', onChange: (e) => onChange(name, e.target.value), className: cls(type) }
  return (
    <div>
      <label className="block text-xs font-mono uppercase tracking-[0.15em] text-[#6B5F5F] mb-1.5">{label}</label>
      {type === 'input' ? <input type="text" {...common} /> : <textarea {...common} />}
      {(name === 'meta_title' || name === 'meta_title_en') && <div className="text-[11px] font-mono text-[#6B5F5F] mt-1">{(value ?? '').length} Zeichen</div>}
      {(name === 'meta_description' || name === 'meta_description_en') && <div className="text-[11px] font-mono text-[#6B5F5F] mt-1">{(value ?? '').length} Zeichen</div>}
    </div>
  )
}

function StringArrayEditor({ label, items, onChange }) {
  const arr = Array.isArray(items) ? items : []
  const set = (i, v) => { const n = [...arr]; n[i] = v; onChange(n) }
  const add = () => onChange([...arr, ''])
  const del = (i) => onChange(arr.filter((_, j) => j !== i))
  return (
    <div>
      <label className="block text-xs font-mono uppercase tracking-[0.15em] text-[#6B5F5F] mb-2">{label}</label>
      <div className="space-y-2">
        {arr.map((v, i) => (
          <div key={i} className="flex gap-2">
            <input type="text" value={v} onChange={(e) => set(i, e.target.value)} className={cls('input')} />
            <button type="button" onClick={() => del(i)} className="px-3 text-xs font-mono text-[#8B1538] hover:bg-[#F4E4E4] rounded">Löschen</button>
          </div>
        ))}
      </div>
      <button type="button" onClick={add} className="mt-2 text-xs font-mono uppercase tracking-[0.15em] accent-text">+ Hinzufügen</button>
    </div>
  )
}

function SectionsEditor({ items, onChange }) {
  const arr = Array.isArray(items) ? items : []
  const setField = (i, k, v) => { const n = [...arr]; n[i] = { ...n[i], [k]: v }; onChange(n) }
  const setBody = (i, key, text) => setField(i, key, text.split('\n').map((l) => l.trim()).filter(Boolean))
  const add = () => onChange([...arr, { h2: '', h2_en: '', body: [], body_en: [] }])
  const del = (i) => onChange(arr.filter((_, j) => j !== i))
  const move = (i, dir) => {
    const t = i + dir
    if (t < 0 || t >= arr.length) return
    const n = [...arr]; [n[i], n[t]] = [n[t], n[i]]; onChange(n)
  }
  return (
    <div>
      <label className="block text-xs font-mono uppercase tracking-[0.15em] text-[#6B5F5F] mb-3">Sections (H2 + Absätze)</label>
      <div className="space-y-6">
        {arr.map((sec, i) => (
          <div key={i} className="border border-[#1A1414]/10 rounded-md p-5 bg-[#FBF7F4]">
            <div className="flex items-center justify-between mb-3">
              <div className="text-xs font-mono uppercase tracking-[0.15em] text-[#6B5F5F]">Section {i + 1}</div>
              <div className="flex gap-3 text-xs font-mono">
                <button type="button" onClick={() => move(i, -1)} className="text-[#6B5F5F] hover:accent-text">↑</button>
                <button type="button" onClick={() => move(i, 1)} className="text-[#6B5F5F] hover:accent-text">↓</button>
                <button type="button" onClick={() => del(i)} className="text-[#8B1538]">Löschen</button>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-mono uppercase tracking-[0.15em] text-[#6B5F5F] mb-1">H2 (DE)</label>
                <input type="text" value={sec.h2 || ''} onChange={(e) => setField(i, 'h2', e.target.value)} className={cls('input')} />
              </div>
              <div>
                <label className="block text-[10px] font-mono uppercase tracking-[0.15em] text-[#6B5F5F] mb-1">H2 (EN)</label>
                <input type="text" value={sec.h2_en || ''} onChange={(e) => setField(i, 'h2_en', e.target.value)} className={cls('input')} />
              </div>
              <div>
                <label className="block text-[10px] font-mono uppercase tracking-[0.15em] text-[#6B5F5F] mb-1">Body (DE) — ein Absatz pro Zeile</label>
                <textarea value={(sec.body || []).join('\n')} onChange={(e) => setBody(i, 'body', e.target.value)} className={cls('textarea')} />
              </div>
              <div>
                <label className="block text-[10px] font-mono uppercase tracking-[0.15em] text-[#6B5F5F] mb-1">Body (EN) — one paragraph per line</label>
                <textarea value={(sec.body_en || []).join('\n')} onChange={(e) => setBody(i, 'body_en', e.target.value)} className={cls('textarea')} />
              </div>
            </div>
          </div>
        ))}
      </div>
      <button type="button" onClick={add} className="mt-3 text-xs font-mono uppercase tracking-[0.15em] accent-text">+ Section hinzufügen</button>
    </div>
  )
}

function FaqsEditor({ items, onChange }) {
  const arr = Array.isArray(items) ? items : []
  const setField = (i, k, v) => { const n = [...arr]; n[i] = { ...n[i], [k]: v }; onChange(n) }
  const add = () => onChange([...arr, { q: '', q_en: '', a: '', a_en: '' }])
  const del = (i) => onChange(arr.filter((_, j) => j !== i))
  return (
    <div>
      <label className="block text-xs font-mono uppercase tracking-[0.15em] text-[#6B5F5F] mb-3">FAQs</label>
      <div className="space-y-4">
        {arr.map((f, i) => (
          <div key={i} className="border border-[#1A1414]/10 rounded-md p-5 bg-[#FBF7F4]">
            <div className="flex items-center justify-between mb-3">
              <div className="text-xs font-mono uppercase tracking-[0.15em] text-[#6B5F5F]">FAQ {i + 1}</div>
              <button type="button" onClick={() => del(i)} className="text-xs font-mono text-[#8B1538]">Löschen</button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-mono uppercase tracking-[0.15em] text-[#6B5F5F] mb-1">Frage (DE)</label>
                <input type="text" value={f.q || ''} onChange={(e) => setField(i, 'q', e.target.value)} className={cls('input')} />
              </div>
              <div>
                <label className="block text-[10px] font-mono uppercase tracking-[0.15em] text-[#6B5F5F] mb-1">Question (EN)</label>
                <input type="text" value={f.q_en || ''} onChange={(e) => setField(i, 'q_en', e.target.value)} className={cls('input')} />
              </div>
              <div>
                <label className="block text-[10px] font-mono uppercase tracking-[0.15em] text-[#6B5F5F] mb-1">Antwort (DE)</label>
                <textarea value={f.a || ''} onChange={(e) => setField(i, 'a', e.target.value)} className={cls('textarea')} />
              </div>
              <div>
                <label className="block text-[10px] font-mono uppercase tracking-[0.15em] text-[#6B5F5F] mb-1">Answer (EN)</label>
                <textarea value={f.a_en || ''} onChange={(e) => setField(i, 'a_en', e.target.value)} className={cls('textarea')} />
              </div>
            </div>
          </div>
        ))}
      </div>
      <button type="button" onClick={add} className="mt-3 text-xs font-mono uppercase tracking-[0.15em] accent-text">+ FAQ hinzufügen</button>
    </div>
  )
}

export default function ServiceEditor({ initial }) {
  const router = useRouter()
  const [doc, setDoc] = useState(initial)
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState(null)
  const [, startTransition] = useTransition()

  function set(name, value) { setDoc((d) => ({ ...d, [name]: value })) }

  async function save() {
    setSaving(true); setMsg(null)
    try {
      const payload = {}
      for (const [k] of SIMPLE_FIELDS) payload[k] = doc[k] ?? ''
      payload.keypoints = doc.keypoints || []
      payload.keypoints_en = doc.keypoints_en || []
      payload.related_services = doc.related_services || []
      payload.sections = doc.sections || []
      payload.faqs = doc.faqs || []

      const r = await fetch(`/api/admin/service-content/${doc.slug}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      })
      const data = await r.json().catch(() => ({}))
      if (!r.ok) { setMsg({ type: 'error', text: data?.detail || 'Speichern fehlgeschlagen' }); return }
      setMsg({ type: 'ok', text: `Gespeichert · ${new Date().toLocaleTimeString('de-DE')}` })
      startTransition(() => router.refresh())
    } catch (e) {
      setMsg({ type: 'error', text: e.message || 'Netzwerkfehler' })
    } finally { setSaving(false) }
  }

  return (
    <div className="p-10 max-w-5xl">
      <div className="flex items-baseline justify-between mb-8">
        <div>
          <div className="overline">Service bearbeiten</div>
          <h1 className="font-heading text-4xl mt-2">{doc.title}</h1>
          <div className="font-mono text-xs text-[#6B5F5F] mt-1">/services/{doc.slug}</div>
        </div>
        <div className="flex items-center gap-3">
          <a href={`/services/${doc.slug}`} target="_blank" rel="noreferrer" className="text-xs font-mono uppercase tracking-[0.15em] text-[#6B5F5F] hover:accent-text">Vorschau →</a>
          <button onClick={save} disabled={saving} className="btn-primary !text-xs !py-2 !px-5 disabled:opacity-50">
            {saving ? 'Speichern …' : 'Speichern'}
          </button>
        </div>
      </div>

      {msg && (
        <div className={`mb-6 px-4 py-3 rounded text-sm ${msg.type === 'ok' ? 'bg-[#DCEFE2] text-[#2D7A4E]' : 'bg-[#F4E4E4] text-[#8B1538]'}`}>{msg.text}</div>
      )}

      <div className="space-y-8">
        <section className="bg-white p-8 rounded-lg">
          <h2 className="font-heading text-xl mb-6">SEO</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <Field label="Meta Title (DE)" name="meta_title" type="input" value={doc.meta_title} onChange={set} />
            <Field label="Meta Title (EN)" name="meta_title_en" type="input" value={doc.meta_title_en} onChange={set} />
            <Field label="Meta Description (DE)" name="meta_description" type="textarea" value={doc.meta_description} onChange={set} />
            <Field label="Meta Description (EN)" name="meta_description_en" type="textarea" value={doc.meta_description_en} onChange={set} />
          </div>
        </section>

        <section className="bg-white p-8 rounded-lg">
          <h2 className="font-heading text-xl mb-6">Hero</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <Field label="Title (intern)" name="title" type="input" value={doc.title} onChange={set} />
            <Field label="Title (EN)" name="title_en" type="input" value={doc.title_en} onChange={set} />
            <Field label="Short label" name="short_label" type="input" value={doc.short_label} onChange={set} />
            <div className="md:col-span-2"><Field label="H1 (Hero)" name="h1" type="input" value={doc.h1} onChange={set} /></div>
            <Field label="Tagline (DE)" name="tagline" type="input" value={doc.tagline} onChange={set} />
            <Field label="Tagline (EN)" name="tagline_en" type="input" value={doc.tagline_en} onChange={set} />
            <div className="md:col-span-2"><Field label="Hero-Bild URL" name="image" type="input" value={doc.image} onChange={set} /></div>
            <Field label="Alt (DE)" name="image_alt" type="input" value={doc.image_alt} onChange={set} />
            <Field label="Alt (EN)" name="image_alt_en" type="input" value={doc.image_alt_en} onChange={set} />
          </div>
        </section>

        <section className="bg-white p-8 rounded-lg">
          <h2 className="font-heading text-xl mb-6">Beschreibung</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <Field label="Kurzbeschreibung (DE)" name="description" type="textarea" value={doc.description} onChange={set} />
            <Field label="Short description (EN)" name="description_en" type="textarea" value={doc.description_en} onChange={set} />
            <Field label="Lange Einleitung (DE)" name="long_copy" type="textarea-lg" value={doc.long_copy} onChange={set} />
            <Field label="Long intro (EN)" name="long_copy_en" type="textarea-lg" value={doc.long_copy_en} onChange={set} />
          </div>
        </section>

        <section className="bg-white p-8 rounded-lg">
          <h2 className="font-heading text-xl mb-6">Merkmale (Keypoints)</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <StringArrayEditor label="Keypoints (DE)" items={doc.keypoints} onChange={(v) => set('keypoints', v)} />
            <StringArrayEditor label="Keypoints (EN)" items={doc.keypoints_en} onChange={(v) => set('keypoints_en', v)} />
          </div>
        </section>

        <section className="bg-white p-8 rounded-lg">
          <SectionsEditor items={doc.sections} onChange={(v) => set('sections', v)} />
        </section>

        <section className="bg-white p-8 rounded-lg">
          <FaqsEditor items={doc.faqs} onChange={(v) => set('faqs', v)} />
        </section>

        <section className="bg-white p-8 rounded-lg">
          <StringArrayEditor label="Verwandte Services (Slugs)" items={doc.related_services} onChange={(v) => set('related_services', v)} />
        </section>

        <div className="sticky bottom-6 flex justify-end">
          <button onClick={save} disabled={saving} className="btn-primary shadow-2xl disabled:opacity-50">
            {saving ? 'Speichern …' : 'Änderungen speichern'}
          </button>
        </div>
      </div>
    </div>
  )
}
