'use client'
// TagsInput — chip-style input for the blog CMS Tags field.
//
// UX behaviour:
//   • Enter, comma, or Tab commits the pending text as a chip.
//   • Backspace on an empty input removes the last chip.
//   • Whitespace is trimmed and duplicates are prevented (case-
//     insensitive check).
//   • Chips can be removed via the × button.
//   • Value comes in and out as string[] — the server also
//     normalises on write (see normalizeTagArray in the API).
import { useState, useEffect } from 'react'

export default function TagsInput({ label, hint, value, onChange, placeholder = 'z.\u00a0B. Exclusive Date Hamburg', dataTestid }) {
  const arr = Array.isArray(value) ? value : []
  const [pending, setPending] = useState('')

  useEffect(() => { setPending('') }, [value?.length])

  function addTag(raw) {
    const trimmed = String(raw || '').trim()
    if (!trimmed) return
    const already = arr.some((t) => t.toLowerCase() === trimmed.toLowerCase())
    if (already) { setPending(''); return }
    onChange([...arr, trimmed])
    setPending('')
  }
  function removeTag(idx) {
    onChange(arr.filter((_, i) => i !== idx))
  }
  function onKeyDown(e) {
    if (e.key === 'Enter' || e.key === ',' || e.key === 'Tab') {
      if (pending.trim()) {
        e.preventDefault()
        addTag(pending)
      }
    } else if (e.key === 'Backspace' && !pending && arr.length) {
      removeTag(arr.length - 1)
    }
  }
  // Paste of a comma-separated list splits into multiple chips.
  function onPaste(e) {
    const txt = e.clipboardData?.getData('text/plain') || ''
    if (!/[,\n]/.test(txt)) return
    e.preventDefault()
    const parts = txt.split(/[,\n]+/).map((s) => s.trim()).filter(Boolean)
    let next = arr.slice()
    for (const p of parts) {
      if (!next.some((t) => t.toLowerCase() === p.toLowerCase())) next.push(p)
    }
    onChange(next)
    setPending('')
  }

  return (
    <div data-testid={dataTestid}>
      <label className="block text-xs font-mono uppercase tracking-[0.15em] text-[#6B5F5F] mb-1.5">{label}</label>
      <div className="w-full min-h-[44px] border border-[#1A1414]/15 rounded-md px-2 py-1.5 flex flex-wrap gap-1.5 items-center bg-white focus-within:border-[#8B1538]">
        {arr.map((tag, i) => (
          <span
            key={`${tag}-${i}`}
            className="inline-flex items-center gap-1 bg-[#F2EAE4] text-[#3F3838] text-xs rounded-full pl-2.5 pr-1 py-1"
          >
            {tag}
            <button
              type="button"
              onClick={() => removeTag(i)}
              aria-label={`Remove ${tag}`}
              className="w-5 h-5 rounded-full hover:bg-[#1A1414]/10 flex items-center justify-center text-[#6B5F5F] hover:text-[#8B1538]"
            >
              ×
            </button>
          </span>
        ))}
        <input
          type="text"
          value={pending}
          onChange={(e) => setPending(e.target.value)}
          onKeyDown={onKeyDown}
          onPaste={onPaste}
          onBlur={() => pending.trim() && addTag(pending)}
          placeholder={arr.length === 0 ? placeholder : ''}
          className="flex-1 min-w-[140px] px-1.5 py-1 text-sm focus:outline-none bg-transparent"
        />
      </div>
      {hint && <div className="text-[11px] font-mono text-[#6B5F5F] mt-1">{hint}</div>}
    </div>
  )
}
