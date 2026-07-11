'use client'
import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Field, StringArrayEditor, ParagraphArrayEditor, FaqsEditor, SaveToolbar } from '@/components/admin/FormFields'

export default function AreaEditor({ initial }) {
  const router = useRouter()
  const [doc, setDoc] = useState(initial)
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState(null)
  const [, startTransition] = useTransition()

  function set(name, value) { setDoc((d) => ({ ...d, [name]: value })) }

  async function save() {
    setSaving(true); setMsg(null)
    try {
      const payload = {
        title: doc.title, name: doc.name,
        intro: doc.intro, intro_en: doc.intro_en,
        description: doc.description, description_en: doc.description_en,
        long_copy: doc.long_copy, long_copy_en: doc.long_copy_en,
        meta_title: doc.meta_title, meta_title_en: doc.meta_title_en,
        meta_description: doc.meta_description, meta_description_en: doc.meta_description_en,
        image: doc.image, image_alt: doc.image_alt, image_alt_en: doc.image_alt_en,
        landmarks: doc.landmarks || [],
        body_extra: doc.body_extra || [], body_extra_en: doc.body_extra_en || [],
        faqs: doc.faqs || [],
      }
      const r = await fetch(`/api/area-content/${doc.slug}`, {
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
          <div className="overline">Area bearbeiten</div>
          <h1 className="font-heading text-4xl mt-2">{doc.name || doc.title}</h1>
          <div className="font-mono text-xs text-[#6B5F5F] mt-1">/escort/{doc.slug}  ·  <span className="italic">öffentliche Seite folgt in Phase 3</span></div>
        </div>
        <button onClick={save} disabled={saving} className="btn-primary !text-xs !py-2 !px-5 disabled:opacity-50">
          {saving ? 'Speichern …' : 'Speichern'}
        </button>
      </div>

      <div className="space-y-8">
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
          <h2 className="font-heading text-xl mb-6">Grunddaten</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <Field label="Name (Anzeige)" name="name" type="input" value={doc.name} onChange={set} />
            <Field label="Title (intern)" name="title" type="input" value={doc.title} onChange={set} />
            <Field label="Intro (DE)" name="intro" type="input" value={doc.intro} onChange={set} />
            <Field label="Intro (EN)" name="intro_en" type="input" value={doc.intro_en} onChange={set} />
            <Field label="Beschreibung (DE)" name="description" type="textarea" value={doc.description} onChange={set} />
            <Field label="Description (EN)" name="description_en" type="textarea" value={doc.description_en} onChange={set} />
          </div>
        </section>

        <section className="bg-white p-8 rounded-lg">
          <h2 className="font-heading text-xl mb-6">Hero-Bild</h2>
          <div className="grid grid-cols-1 gap-5">
            <Field label="Bild URL" name="image" type="input" value={doc.image} onChange={set} />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <Field label="Alt (DE)" name="image_alt" type="input" value={doc.image_alt} onChange={set} />
              <Field label="Alt (EN)" name="image_alt_en" type="input" value={doc.image_alt_en} onChange={set} />
            </div>
          </div>
        </section>

        <section className="bg-white p-8 rounded-lg">
          <h2 className="font-heading text-xl mb-6">Erweiterter Text</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <ParagraphArrayEditor label="Body-Zusatz (DE) — ein Absatz pro Zeile" items={doc.body_extra} onChange={(v) => set('body_extra', v)} />
            <ParagraphArrayEditor label="Body extra (EN) — one paragraph per line" items={doc.body_extra_en} onChange={(v) => set('body_extra_en', v)} />
          </div>
        </section>

        <section className="bg-white p-8 rounded-lg">
          <StringArrayEditor label="Landmarks (Sehenswürdigkeiten / Locations)" items={doc.landmarks} onChange={(v) => set('landmarks', v)} placeholder="z. B. Elbphilharmonie" />
        </section>

        <section className="bg-white p-8 rounded-lg">
          <FaqsEditor items={doc.faqs} onChange={(v) => set('faqs', v)} />
        </section>

        <SaveToolbar saving={saving} onSave={save} msg={msg} />
      </div>
    </div>
  )
}
