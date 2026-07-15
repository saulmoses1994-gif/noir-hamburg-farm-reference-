'use client'
import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Field, SaveToolbar, cls } from '@/components/admin/FormFields'
import CloudinaryImageField from '@/components/admin/CloudinaryImageField'

// Simple slug->URL map editor.  Used for service_images and area_images which
// are objects keyed by slug in the DB.
function ImageMapEditor({ label, value, onChange, slugs = [] }) {
  const map = value && typeof value === 'object' ? value : {}
  const keys = Array.from(new Set([...slugs, ...Object.keys(map)])).sort()
  const filled = keys.filter((k) => (map[k] || '').length > 0).length
  return (
    <div>
      <div className="flex items-baseline justify-between mb-3">
        <label className="text-xs font-mono uppercase tracking-[0.15em] text-[#6B5F5F]">{label}</label>
        <div className="text-[11px] font-mono text-[#6B5F5F]">{filled}/{keys.length} befüllt</div>
      </div>
      <div className="space-y-2">
        {keys.map((k) => (
          <div key={k} className="flex items-center gap-3">
            <div className="w-40 font-mono text-xs text-[#6B5F5F] truncate" title={k}>{k}</div>
            <input
              type="text"
              placeholder="Bild-URL"
              value={map[k] || ''}
              onChange={(e) => onChange({ ...map, [k]: e.target.value })}
              className={cls('input')}
            />
            {map[k] && (
              <a href={map[k]} target="_blank" rel="noreferrer" className="text-xs font-mono text-[#6B5F5F] hover:accent-text">↗</a>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

export default function SettingsEditor({ initial, serviceSlugs = [], areaSlugs = [] }) {
  const router = useRouter()
  const [doc, setDoc] = useState(initial)
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState(null)
  const [, startTransition] = useTransition()

  const set = (name, value) => setDoc((d) => ({ ...d, [name]: value }))

  async function save() {
    setSaving(true); setMsg(null)
    try {
      const payload = {
        business_name: doc.business_name || '',
        tagline_de: doc.tagline_de || '',
        tagline_en: doc.tagline_en || '',
        phone: doc.phone || '',
        email: doc.email || '',
        whatsapp_number: doc.whatsapp_number || '',
        recruitment_whatsapp_number: doc.recruitment_whatsapp_number || '',
        hours_de: doc.hours_de || '',
        hours_en: doc.hours_en || '',
        homepage_hero_image: doc.homepage_hero_image || '',
        escort_hamburg_image: doc.escort_hamburg_image || '',
        about_image: doc.about_image || '',
        social_share_image: doc.social_share_image || '',
        service_images: doc.service_images || {},
        area_images: doc.area_images || {},
        facebook_url: doc.facebook_url || '',
        instagram_url: doc.instagram_url || '',
        twitter_url: doc.twitter_url || '',
        impressum_content: doc.impressum_content || '',
        impressum_content_en: doc.impressum_content_en || '',
        diskretion_content: doc.diskretion_content || '',
        about_content: doc.about_content || '',
        about_content_en: doc.about_content_en || '',
      }
      const r = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      })
      const data = await r.json().catch(() => ({}))
      if (!r.ok) { setMsg({ type: 'error', text: data?.detail || 'Speichern fehlgeschlagen' }); return }
      setMsg({ type: 'ok', text: `Gespeichert · ${new Date().toLocaleTimeString('de-DE')} — änderungen sind sofort auf der ganzen Seite sichtbar` })
      startTransition(() => router.refresh())
    } catch (e) {
      setMsg({ type: 'error', text: e.message || 'Netzwerkfehler' })
    } finally { setSaving(false) }
  }

  return (
    <div className="p-10 max-w-5xl">
      <div className="flex items-baseline justify-between mb-8">
        <div>
          <div className="overline">Globale Einstellungen</div>
          <h1 className="font-heading text-4xl mt-2">Site Settings</h1>
          <p className="font-mono text-xs text-[#6B5F5F] mt-2">Kontakt, Öffnungszeiten, Bilder, Impressum — wirkt sofort auf die gesamte öffentliche Seite.</p>
        </div>
        <div className="flex items-center gap-3">
          <a href="/" target="_blank" rel="noreferrer" className="text-xs font-mono uppercase tracking-[0.15em] text-[#6B5F5F] hover:accent-text">Live-Site →</a>
          <button onClick={save} disabled={saving} className="btn-primary !text-xs !py-2 !px-5 disabled:opacity-50">
            {saving ? 'Speichern …' : 'Speichern'}
          </button>
        </div>
      </div>

      <div className="space-y-8">
        <section className="bg-white p-8 rounded-lg">
          <h2 className="font-heading text-xl mb-6">Identität</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <Field label="Business Name" name="business_name" type="input" value={doc.business_name} onChange={set} />
            <div />
            <Field label="Tagline (DE)" name="tagline_de" type="input" value={doc.tagline_de} onChange={set} />
            <Field label="Tagline (EN)" name="tagline_en" type="input" value={doc.tagline_en} onChange={set} />
          </div>
        </section>

        <section className="bg-white p-8 rounded-lg">
          <h2 className="font-heading text-xl mb-6">Kontakt</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <Field label="Telefon" name="phone" type="input" value={doc.phone} onChange={set} />
            <Field label="Email" name="email" type="input" value={doc.email} onChange={set} />
            <Field label="WhatsApp-Nummer (Buchung)" name="whatsapp_number" type="input" value={doc.whatsapp_number} onChange={set} />
            <Field label="WhatsApp-Nummer (Recruiting)" name="recruitment_whatsapp_number" type="input" value={doc.recruitment_whatsapp_number} onChange={set} />
            <Field label="Öffnungszeiten (DE)" name="hours_de" type="input" value={doc.hours_de} onChange={set} />
            <Field label="Opening hours (EN)" name="hours_en" type="input" value={doc.hours_en} onChange={set} />
          </div>
        </section>

        <section className="bg-white p-8 rounded-lg">
          <h2 className="font-heading text-xl mb-6">Social Media</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <Field label="Instagram URL" name="instagram_url" type="input" value={doc.instagram_url} onChange={set} />
            <Field label="Facebook URL" name="facebook_url" type="input" value={doc.facebook_url} onChange={set} />
            <Field label="Twitter / X URL" name="twitter_url" type="input" value={doc.twitter_url} onChange={set} />
          </div>
        </section>

        <section className="bg-white p-8 rounded-lg">
          <h2 className="font-heading text-xl mb-6">Bilder</h2>
          <div className="space-y-5">
            <CloudinaryImageField
              label="Homepage Hero-Bild"
              name="homepage_hero_image"
              value={doc.homepage_hero_image}
              onChange={set}
              folder="noir-hamburg/settings"
              helpText="Erscheint auf der Startseite als Hauptbild."
            />
            <CloudinaryImageField
              label="Escort Hamburg (Hub) Hero"
              name="escort_hamburg_image"
              value={doc.escort_hamburg_image}
              onChange={set}
              folder="noir-hamburg/settings"
              helpText="Für /escort-hamburg und /en/escort-hamburg."
            />
            <CloudinaryImageField
              label="About / Wir Bild"
              name="about_image"
              value={doc.about_image}
              onChange={set}
              folder="noir-hamburg/settings"
              helpText="Erscheint auf /ueber-uns und /en/about."
            />
            <CloudinaryImageField
              label="Social Share Image (og:image)"
              name="social_share_image"
              value={doc.social_share_image}
              onChange={set}
              folder="noir-hamburg/settings"
              helpText="Empfohlen 1200×630 · wird beim Teilen in Facebook/LinkedIn/WhatsApp angezeigt."
            />
          </div>
        </section>

        <section className="bg-white p-8 rounded-lg">
          <h2 className="font-heading text-xl mb-6">Service-Bilder</h2>
          <p className="text-xs font-mono text-[#6B5F5F] mb-4">Optionale Übersteuerung des Service-Hero-Bilds pro Slug. Leer lassen = im Service-CMS gepflegtes Bild wird verwendet.</p>
          <ImageMapEditor label="Service Slug → Bild URL" value={doc.service_images} onChange={(v) => set('service_images', v)} slugs={serviceSlugs} />
        </section>

        <section className="bg-white p-8 rounded-lg">
          <h2 className="font-heading text-xl mb-6">Area-Bilder</h2>
          <ImageMapEditor label="Area Slug → Bild URL" value={doc.area_images} onChange={(v) => set('area_images', v)} slugs={areaSlugs} />
        </section>

        <section className="bg-white p-8 rounded-lg">
          <h2 className="font-heading text-xl mb-6">Impressum</h2>
          <div className="space-y-5">
            <Field label="Impressum-Text DE (Markdown / HTML erlaubt)" name="impressum_content" type="textarea-lg" value={doc.impressum_content} onChange={set} />
            <Field label="Impressum-Text EN (leer = DE-Version wird angezeigt)" name="impressum_content_en" type="textarea-lg" value={doc.impressum_content_en} onChange={set} />
          </div>
        </section>

        <section className="bg-white p-8 rounded-lg">
          <h2 className="font-heading text-xl mb-6">Über uns</h2>
          <p className="text-xs font-mono text-[#6B5F5F] mb-4">Reichhaltiger Fließtext für die /ueber-uns Seite. Leer lassen = eingebautes Fallback-Prosatext wird verwendet.</p>
          <div className="space-y-5">
            <Field label="Über uns – Fließtext DE (HTML erlaubt)" name="about_content" type="textarea-lg" value={doc.about_content} onChange={set} />
            <Field label="Über uns – Fließtext EN (leer = DE-Version wird angezeigt)" name="about_content_en" type="textarea-lg" value={doc.about_content_en} onChange={set} />
          </div>
        </section>

        <section className="bg-white p-8 rounded-lg">
          <h2 className="font-heading text-xl mb-6">Diskretion</h2>
          <Field label="Diskretion / Datenschutz-Text" name="diskretion_content" type="textarea-lg" value={doc.diskretion_content} onChange={set} />
        </section>

        <SaveToolbar saving={saving} onSave={save} msg={msg} previewHref="/" previewLabel="Live-Site →" />
      </div>
    </div>
  )
}
