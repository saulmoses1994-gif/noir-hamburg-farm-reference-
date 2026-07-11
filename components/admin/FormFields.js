'use client'
// Shared admin form primitives used by every editor screen.

export function cls(t) {
  if (t === 'textarea-lg') return 'w-full border border-[#1A1414]/15 rounded-md px-3 py-2 text-sm min-h-[200px] font-body leading-relaxed focus:outline-none focus:border-[#8B1538]'
  if (t === 'textarea') return 'w-full border border-[#1A1414]/15 rounded-md px-3 py-2 text-sm min-h-[80px] focus:outline-none focus:border-[#8B1538]'
  return 'w-full border border-[#1A1414]/15 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-[#8B1538]'
}

export function Field({ label, name, type, value, onChange, showCounter = false }) {
  const common = { name, value: value ?? '', onChange: (e) => onChange(name, e.target.value), className: cls(type) }
  return (
    <div>
      <label className="block text-xs font-mono uppercase tracking-[0.15em] text-[#6B5F5F] mb-1.5">{label}</label>
      {type === 'input' ? <input type="text" {...common} /> : <textarea {...common} />}
      {showCounter && <div className="text-[11px] font-mono text-[#6B5F5F] mt-1">{(value ?? '').length} Zeichen</div>}
    </div>
  )
}

export function StringArrayEditor({ label, items, onChange, placeholder = '' }) {
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
            <input type="text" placeholder={placeholder} value={v} onChange={(e) => set(i, e.target.value)} className={cls('input')} />
            <button type="button" onClick={() => del(i)} className="px-3 text-xs font-mono text-[#8B1538] hover:bg-[#F4E4E4] rounded">Löschen</button>
          </div>
        ))}
      </div>
      <button type="button" onClick={add} className="mt-2 text-xs font-mono uppercase tracking-[0.15em] accent-text">+ Hinzufügen</button>
    </div>
  )
}

// Editor for arrays of paragraphs (body_extra, body_extra_en) — shows the
// whole array as one textarea, one paragraph per line.  Simpler UX than a
// grid of individual textareas.
export function ParagraphArrayEditor({ label, items, onChange }) {
  const text = (Array.isArray(items) ? items : []).join('\n')
  function handle(e) {
    const v = e.target.value.split('\n').map((l) => l.trim()).filter(Boolean)
    onChange(v)
  }
  return (
    <div>
      <label className="block text-xs font-mono uppercase tracking-[0.15em] text-[#6B5F5F] mb-1.5">{label}</label>
      <textarea value={text} onChange={handle} className={cls('textarea-lg')} placeholder="Ein Absatz pro Zeile" />
    </div>
  )
}

export function FaqsEditor({ items, onChange }) {
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

export function SaveToolbar({ saving, onSave, msg, previewHref, previewLabel = 'Vorschau →' }) {
  return (
    <>
      {msg && (
        <div className={`mb-6 px-4 py-3 rounded text-sm ${msg.type === 'ok' ? 'bg-[#DCEFE2] text-[#2D7A4E]' : 'bg-[#F4E4E4] text-[#8B1538]'}`}>{msg.text}</div>
      )}
      <div className="sticky bottom-6 flex justify-end gap-3 z-40">
        {previewHref && (
          <a href={previewHref} target="_blank" rel="noreferrer" className="btn-ghost !text-xs !py-2 !px-5 bg-white shadow-lg">{previewLabel}</a>
        )}
        <button onClick={onSave} disabled={saving} className="btn-primary shadow-2xl disabled:opacity-50">
          {saving ? 'Speichern …' : 'Änderungen speichern'}
        </button>
      </div>
    </>
  )
}
