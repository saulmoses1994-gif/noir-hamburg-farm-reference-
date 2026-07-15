'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

const MAX_BYTES = 10 * 1024 * 1024
const FOLDERS = [
  { value: 'noir-hamburg/models', label: 'Models' },
  { value: 'noir-hamburg/services', label: 'Services' },
  { value: 'noir-hamburg/areas', label: 'Areas' },
  { value: 'noir-hamburg/blog', label: 'Blog' },
  { value: 'noir-hamburg/pages', label: 'Custom Pages' },
  { value: 'noir-hamburg/settings', label: 'Site Settings' },
  { value: 'noir-hamburg/misc', label: 'Misc' },
]

export default function MediaLibraryClient() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [filterFolder, setFilterFolder] = useState('')
  const [folder, setFolder] = useState('noir-hamburg/misc')
  const [copiedId, setCopiedId] = useState('')
  const fileRef = useRef(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const qs = filterFolder ? `?folder=${encodeURIComponent(filterFolder)}` : ''
      const res = await fetch(`/api/media${qs}`, { cache: 'no-store', credentials: 'include' })
      if (!res.ok) throw new Error(`Fetch failed: ${res.status}`)
      const data = await res.json()
      setItems(data.items || [])
    } catch (e) {
      setError(String(e.message || e))
    } finally {
      setLoading(false)
    }
  }, [filterFolder])

  useEffect(() => { load() }, [load])

  async function handleFiles(files) {
    if (!files || !files.length) return
    setError('')
    setUploading(true)
    setProgress(0)
    try {
      let done = 0
      for (const file of Array.from(files)) {
        if (file.size > MAX_BYTES) {
          setError(`${file.name}: max file size 10 MB (got ${(file.size / 1024 / 1024).toFixed(1)} MB)`)
          continue
        }
        await uploadOne(file, folder)
        done += 1
        setProgress(Math.round((done / files.length) * 100))
      }
      await load()
    } catch (e) {
      setError(String(e.message || e))
    } finally {
      setUploading(false)
      setProgress(0)
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  async function del(publicId) {
    if (!window.confirm('Delete this image? This cannot be undone.')) return
    try {
      const res = await fetch(`/api/media?public_id=${encodeURIComponent(publicId)}`, {
        method: 'DELETE',
        credentials: 'include',
      })
      if (!res.ok) throw new Error(`Delete failed: ${res.status}`)
      setItems((prev) => prev.filter((x) => x.public_id !== publicId))
    } catch (e) {
      setError(String(e.message || e))
    }
  }

  async function copyUrl(url, id) {
    try {
      await navigator.clipboard.writeText(url)
      setCopiedId(id)
      setTimeout(() => setCopiedId(''), 1400)
    } catch { /* ignore */ }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end gap-3 p-4 border border-[#1A1414]/10 rounded-lg bg-white">
        <div className="flex flex-col gap-1">
          <label className="text-[11px] font-mono uppercase tracking-widest text-[#6B5F5F]">Upload to folder</label>
          <select
            className="h-9 px-3 border border-[#1A1414]/15 rounded-md text-sm bg-white"
            value={folder}
            onChange={(e) => setFolder(e.target.value)}
            disabled={uploading}
          >
            {FOLDERS.map((f) => <option key={f.value} value={f.value}>{f.label}</option>)}
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-[11px] font-mono uppercase tracking-widest text-[#6B5F5F]">Choose files</label>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            multiple
            disabled={uploading}
            onChange={(e) => handleFiles(e.target.files)}
            className="text-sm file:mr-3 file:px-4 file:py-2 file:border-0 file:bg-[#1A1414] file:text-white file:rounded-md file:cursor-pointer"
          />
        </div>
        <div className="ml-auto flex flex-col gap-1">
          <label className="text-[11px] font-mono uppercase tracking-widest text-[#6B5F5F]">Filter</label>
          <select
            className="h-9 px-3 border border-[#1A1414]/15 rounded-md text-sm bg-white"
            value={filterFolder}
            onChange={(e) => setFilterFolder(e.target.value)}
          >
            <option value="">All folders</option>
            {FOLDERS.map((f) => <option key={f.value} value={f.value}>{f.label}</option>)}
          </select>
        </div>
        <button
          type="button"
          onClick={load}
          className="h-9 px-4 border border-[#1A1414]/15 rounded-md text-xs font-mono uppercase tracking-widest hover:bg-[#1A1414]/5"
        >
          Refresh
        </button>
      </div>

      {uploading && (
        <div className="p-3 bg-[#FBF7F4] border border-[#8B1538]/30 rounded-md text-sm">
          Uploading… {progress}%
          <div className="mt-1 h-1 bg-[#1A1414]/10 rounded">
            <div className="h-1 bg-[#8B1538] rounded transition-all" style={{ width: `${progress}%` }} />
          </div>
        </div>
      )}
      {error && (
        <div className="p-3 bg-red-50 border border-red-300 text-red-800 rounded-md text-sm" data-testid="media-error">{error}</div>
      )}

      {loading ? (
        <div className="py-10 text-center text-sm text-[#6B5F5F]">Loading…</div>
      ) : items.length === 0 ? (
        <div className="py-20 text-center border border-dashed border-[#1A1414]/15 rounded-lg">
          <p className="text-sm text-[#6B5F5F]">No images uploaded yet. Pick a folder and drop your first photos above.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {items.map((item) => (
            <div key={item.public_id} className="group border border-[#1A1414]/8 rounded-lg overflow-hidden bg-white">
              <div className="aspect-[4/3] bg-[#F2EAE4] overflow-hidden">
                <img src={item.thumbnail_url || item.url} alt={item.public_id} className="w-full h-full object-cover" loading="lazy" />
              </div>
              <div className="p-3 space-y-2">
                <div className="text-[10px] font-mono text-[#6B5F5F] truncate" title={item.public_id}>{item.public_id}</div>
                <div className="text-[10px] text-[#6B5F5F]">
                  {item.width}×{item.height} · {item.format?.toUpperCase()} · {((item.size_bytes || 0) / 1024).toFixed(0)} KB
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => copyUrl(item.url, item.public_id)}
                    className="flex-1 px-2 py-1.5 border border-[#1A1414]/15 rounded text-[10px] font-mono uppercase tracking-widest hover:bg-[#1A1414]/5"
                  >
                    {copiedId === item.public_id ? '✓ Copied' : 'Copy URL'}
                  </button>
                  <button
                    type="button"
                    onClick={() => del(item.public_id)}
                    className="px-2 py-1.5 border border-red-300 text-red-700 rounded text-[10px] font-mono uppercase tracking-widest hover:bg-red-50"
                  >
                    Del
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// Signed upload flow: server signs → browser uploads directly to Cloudinary
// → server persists metadata to MongoDB.
async function uploadOne(file, folder) {
  // 1) Get signature
  const signRes = await fetch('/api/cloudinary/sign', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ folder }),
  })
  if (!signRes.ok) {
    const err = await signRes.json().catch(() => ({}))
    throw new Error(err.detail || `sign failed: ${signRes.status}`)
  }
  const sign = await signRes.json()

  // 2) Upload to Cloudinary directly
  const form = new FormData()
  form.append('file', file)
  form.append('api_key', sign.api_key)
  form.append('timestamp', String(sign.timestamp))
  form.append('signature', sign.signature)
  form.append('folder', sign.folder)
  form.append('upload_preset', sign.upload_preset)
  if (sign.tags) form.append('tags', sign.tags)

  const uploadRes = await fetch(
    `https://api.cloudinary.com/v1_1/${sign.cloud_name}/image/upload`,
    { method: 'POST', body: form }
  )
  if (!uploadRes.ok) {
    const err = await uploadRes.json().catch(() => ({}))
    throw new Error(err?.error?.message || `Cloudinary upload failed: ${uploadRes.status}`)
  }
  const uploaded = await uploadRes.json()

  // 3) Persist metadata to MongoDB
  await fetch('/api/media', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(uploaded),
  })

  return uploaded
}

export { uploadOne }
