'use client'

import { useRef, useState } from 'react'
import { uploadOne } from '@/components/admin/MediaLibraryClient'

const MAX_BYTES = 10 * 1024 * 1024

// Inline upload button that replaces the plain "paste image URL" pattern in
// admin editors. Users can still paste a URL manually; the Upload button
// signs, uploads to Cloudinary, and auto-fills the URL on success.
export default function CloudinaryImageField({
  label,
  name,
  value,
  onChange,
  folder = 'noir-hamburg/misc',
  placeholder = 'https://…',
  helpText,
}) {
  const fileRef = useRef(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')

  async function onPick(e) {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > MAX_BYTES) {
      setError(`Max file size 10 MB (got ${(file.size / 1024 / 1024).toFixed(1)} MB)`)
      if (fileRef.current) fileRef.current.value = ''
      return
    }
    setError('')
    setUploading(true)
    try {
      const uploaded = await uploadOne(file, folder)
      onChange(name, uploaded.secure_url)
    } catch (err) {
      setError(String(err.message || err))
    } finally {
      setUploading(false)
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  return (
    <div className="space-y-1.5">
      {label && (
        <label className="block text-[11px] font-mono uppercase tracking-widest text-[#6B5F5F]">
          {label}
        </label>
      )}
      <div className="flex gap-2">
        <input
          type="text"
          value={value || ''}
          onChange={(e) => onChange(name, e.target.value)}
          placeholder={placeholder}
          className="flex-1 min-w-0 h-9 px-3 border border-[#1A1414]/15 rounded-md text-sm bg-white focus:outline-none focus:border-[#8B1538]"
        />
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={onPick}
        />
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
          className="whitespace-nowrap h-9 px-4 bg-[#1A1414] text-white text-xs font-mono uppercase tracking-widest rounded-md hover:bg-[#8B1538] disabled:opacity-50 disabled:cursor-not-allowed"
          data-testid={`upload-${name}`}
        >
          {uploading ? 'Uploading…' : 'Upload'}
        </button>
      </div>
      {value && (
        <div className="pt-2">
          <img src={value} alt="preview" className="h-32 rounded-md object-cover border border-[#1A1414]/10" />
        </div>
      )}
      {error && <p className="text-xs text-red-700">{error}</p>}
      {helpText && !error && <p className="text-xs text-[#6B5F5F]">{helpText}</p>}
    </div>
  )
}
