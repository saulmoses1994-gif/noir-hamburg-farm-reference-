'use client'
import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Field, StringArrayEditor, SaveToolbar, cls } from '@/components/admin/FormFields'

function slugify(s) {
  return String(s || '').toLowerCase()
    .replace(/[äàáâ]/g, 'a').replace(/[öòóô]/g, 'o').replace(/[üùúû]/g, 'u')
    .replace(/[éèêë]/g, 'e').replace(/ß/g, 'ss')
    .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
}

function PricesEditor({ items, onChange }) {
  const arr = Array.isArray(items) ? items : []
  const setField = (i, k, v) => { const n = [...arr]; n[i] = { ...n[i], [k]: v }; onChange(n) }
  const add = () => onChange([...arr, { label: '', amount: 0, currency: 'EUR', unit: '€' }])
  const del = (i) => onChange(arr.filter((_, j) => j !== i))
  return (
    <div>
      <label className="block text-xs font-mono uppercase tracking-[0.15em] text-[#6B5F5F] mb-3">Preise</label>
      <div className="space-y-3">
        {arr.map((p, i) => (
          <div key={i} className="grid grid-cols-[1fr_120px_100px_60px_auto] gap-2 items-center">
            <input type="text" placeholder="Label (z.B. 2h)" value={p.label || ''} onChange={(e) => setField(i, 'label', e.target.value)} className={cls('input')} />
            <input type="number" placeholder="Betrag" value={p.amount ?? ''} onChange={(e) => setField(i, 'amount', Number(e.target.value) || 0)} className={cls('input')} />
            <input type="text" placeholder="EUR" value={p.currency || 'EUR'} onChange={(e) => setField(i, 'currency', e.target.value)} className={cls('input')} />
            <input type="text" placeholder="€" value={p.unit || ''} onChange={(e) => setField(i, 'unit', e.target.value)} className={cls('input')} />
            <button type="button" onClick={() => del(i)} className="px-2 text-xs font-mono text-[#8B1538]">Löschen</button>
          </div>
        ))}
      </div>
      <button type="button" onClick={add} className="mt-3 text-xs font-mono uppercase tracking-[0.15em] accent-text">+ Preis hinzufügen</button>
    </div>
  )
}

function DeleteModal({ slug, onCancel, onConfirm, busy }) {
  const [typed, setTyped] = useState('')
  const match = typed === slug
  return (
    <div className="fixed inset-0 z-[100] bg-black/70 flex items-center justify-center px-6" onClick={onCancel}>
      <div className="bg-white rounded-lg max-w-lg w-full p-8" onClick={(e) => e.stopPropagation()}>
        <h2 className="font-heading text-2xl mb-3">Model löschen?</h2>
        <p className="text-sm text-[#6B5F5F] leading-relaxed">
          Das Model wird sofort von der öffentlichen Seite entfernt. Der Datensatz bleibt in der Datenbank
          (soft-delete mit <code className="font-mono text-xs bg-[#F7F5F2] px-1">deleted_at</code>) und
          kann per Mongo-Query wiederhergestellt werden.
        </p>
        <div className="mt-5">
          <label className="block text-xs font-mono uppercase tracking-[0.15em] text-[#6B5F5F] mb-2">
            Zur Bestätigung Slug tippen: <code className="accent-text">{slug}</code>
          </label>
          <input
            type="text"
            autoFocus
            value={typed}
            onChange={(e) => setTyped(e.target.value)}
            className={cls('input')}
          />
        </div>
        <div className="mt-6 flex justify-end gap-3">
          <button onClick={onCancel} className="btn-ghost !text-xs !py-2 !px-4" disabled={busy}>Abbrechen</button>
          <button
            onClick={onConfirm}
            disabled={!match || busy}
            className="btn-primary !text-xs !py-2 !px-4 disabled:opacity-40 !bg-[#8B1538]"
          >
            {busy ? 'Lösche …' : 'Endgültig löschen'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function ModelEditor({ mode, initial, serviceSlugs = [], areaSlugs = [] }) {
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
        name: (doc.name || '').trim(),
        short_tagline: doc.short_tagline || '', short_tagline_en: doc.short_tagline_en || '',
        bio: doc.bio || '', bio_en: doc.bio_en || '',
        cover_image: doc.cover_image || '',
        gallery: doc.gallery || [],
        age: doc.age === '' || doc.age == null ? null : Number(doc.age),
        height_cm: doc.height_cm === '' || doc.height_cm == null ? null : Number(doc.height_cm),
        measurements: doc.measurements || '', dress_size: doc.dress_size || '',
        hair_color: doc.hair_color || '', eye_color: doc.eye_color || '',
        nationality: doc.nationality || '',
        languages: doc.languages || [], interests: doc.interests || [],
        services: doc.services || [], locations: doc.locations || [],
        prices: doc.prices || [],
        meta_title: doc.meta_title || '', meta_title_en: doc.meta_title_en || '',
        meta_description: doc.meta_description || '', meta_description_en: doc.meta_description_en || '',
        featured: !!doc.featured, available: doc.available !== false,
      }
      const url = mode === 'create' ? '/api/models' : `/api/models/${initial.slug}`
      const method = mode === 'create' ? 'POST' : 'PUT'
      const r = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify(payload) })
      const data = await r.json().catch(() => ({}))
      if (!r.ok) { setMsg({ type: 'error', text: data?.detail || 'Speichern fehlgeschlagen' }); return }
      setMsg({ type: 'ok', text: `Gespeichert · ${new Date().toLocaleTimeString('de-DE')}` })
      if (mode === 'create') {
        startTransition(() => router.push(`/admin/models/edit/${data.slug}`))
      } else {
        startTransition(() => router.refresh())
      }
    } catch (e) {
      setMsg({ type: 'error', text: e.message || 'Netzwerkfehler' })
    } finally { setSaving(false) }
  }

  async function doDelete() {
    setDeleting(true)
    try {
      const r = await fetch(`/api/models/${initial.slug}`, { method: 'DELETE', credentials: 'include' })
      const data = await r.json().catch(() => ({}))
      if (!r.ok) { setMsg({ type: 'error', text: data?.detail || 'Löschen fehlgeschlagen' }); setShowDelete(false); return }
      router.push('/admin/models')
      router.refresh()
    } catch (e) {
      setMsg({ type: 'error', text: e.message || 'Netzwerkfehler' })
    } finally { setDeleting(false) }
  }

  return (
    <div className="p-10 max-w-5xl">
      <div className="flex items-baseline justify-between mb-8">
        <div>
          <div className="overline">{mode === 'create' ? 'Neues Model' : 'Model bearbeiten'}</div>
          <h1 className="font-heading text-4xl mt-2">{doc.name || <span className="italic text-[#9B8F8F]">Unbenannt</span>}</h1>
          <div className="font-mono text-xs text-[#6B5F5F] mt-1">
            /models/{doc.slug || '?'}  ·  <span className="italic">öffentliche Seite folgt in Phase 3</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {mode === 'edit' && (
            <button onClick={() => setShowDelete(true)} className="text-xs font-mono uppercase tracking-[0.15em] text-[#8B1538] hover:underline">Löschen</button>
          )}
          <button onClick={save} disabled={saving} className="btn-primary !text-xs !py-2 !px-5 disabled:opacity-50">
            {saving ? 'Speichern …' : (mode === 'create' ? 'Erstellen' : 'Speichern')}
          </button>
        </div>
      </div>

      <div className="space-y-8">
        <section className="bg-white p-8 rounded-lg">
          <h2 className="font-heading text-xl mb-6">Basis</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <Field label="Name" name="name" type="input" value={doc.name} onChange={(k, v) => {
              set(k, v)
              if (mode === 'create' && !doc.slug) set('slug', slugify(v))
            }} />
            <div>
              <label className="block text-xs font-mono uppercase tracking-[0.15em] text-[#6B5F5F] mb-1.5">Slug</label>
              <input
                type="text" value={doc.slug || ''}
                onChange={(e) => set('slug', e.target.value)}
                disabled={mode === 'edit'}
                className={cls('input') + (mode === 'edit' ? ' opacity-60 cursor-not-allowed' : '')}
              />
              <div className="text-[11px] font-mono text-[#6B5F5F] mt-1">a-z, 0-9, hyphen — nicht änderbar nach Erstellung</div>
            </div>
            <Field label="Short Tagline (DE)" name="short_tagline" type="input" value={doc.short_tagline} onChange={set} />
            <Field label="Short Tagline (EN)" name="short_tagline_en" type="input" value={doc.short_tagline_en} onChange={set} />
            <Field label="Bio (DE)" name="bio" type="textarea-lg" value={doc.bio} onChange={set} />
            <Field label="Bio (EN)" name="bio_en" type="textarea-lg" value={doc.bio_en} onChange={set} />
          </div>
          <div className="mt-5 flex items-center gap-8">
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input type="checkbox" checked={!!doc.featured} onChange={(e) => set('featured', e.target.checked)} className="w-4 h-4 accent-[#8B1538]" />
              <span>Featured</span>
            </label>
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input type="checkbox" checked={doc.available !== false} onChange={(e) => set('available', e.target.checked)} className="w-4 h-4 accent-[#8B1538]" />
              <span>Verfügbar</span>
            </label>
          </div>
        </section>

        <section className="bg-white p-8 rounded-lg">
          <h2 className="font-heading text-xl mb-6">Bilder</h2>
          <div className="space-y-5">
            <Field label="Cover-Bild URL" name="cover_image" type="input" value={doc.cover_image} onChange={set} />
            {doc.cover_image && <img src={doc.cover_image} alt="cover preview" className="h-40 rounded-md object-cover" />}
            <StringArrayEditor label="Gallery (Bild-URLs)" items={doc.gallery} onChange={(v) => set('gallery', v)} placeholder="https://…" />
          </div>
        </section>

        <section className="bg-white p-8 rounded-lg">
          <h2 className="font-heading text-xl mb-6">Attribute</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Field label="Alter" name="age" type="input" value={doc.age} onChange={set} />
            <Field label="Höhe (cm)" name="height_cm" type="input" value={doc.height_cm} onChange={set} />
            <Field label="Maße" name="measurements" type="input" value={doc.measurements} onChange={set} />
            <Field label="Kleidergröße" name="dress_size" type="input" value={doc.dress_size} onChange={set} />
            <Field label="Haarfarbe" name="hair_color" type="input" value={doc.hair_color} onChange={set} />
            <Field label="Augenfarbe" name="eye_color" type="input" value={doc.eye_color} onChange={set} />
            <Field label="Nationalität" name="nationality" type="input" value={doc.nationality} onChange={set} />
          </div>
        </section>

        <section className="bg-white p-8 rounded-lg">
          <h2 className="font-heading text-xl mb-6">Zuordnungen</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <StringArrayEditor label="Sprachen" items={doc.languages} onChange={(v) => set('languages', v)} />
            <StringArrayEditor label="Interessen" items={doc.interests} onChange={(v) => set('interests', v)} />
            <StringArrayEditor label="Services (Slugs)" items={doc.services} onChange={(v) => set('services', v)} placeholder={serviceSlugs[0] || ''} />
            <StringArrayEditor label="Locations (Area-Slugs)" items={doc.locations} onChange={(v) => set('locations', v)} placeholder={areaSlugs[0] || ''} />
          </div>
        </section>

        <section className="bg-white p-8 rounded-lg">
          <PricesEditor items={doc.prices} onChange={(v) => set('prices', v)} />
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

        <SaveToolbar saving={saving} onSave={save} msg={msg} />
      </div>

      {showDelete && (
        <DeleteModal slug={initial.slug} onCancel={() => setShowDelete(false)} onConfirm={doDelete} busy={deleting} />
      )}
    </div>
  )
}
