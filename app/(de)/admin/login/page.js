'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function AdminLoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('admin@noir-hamburg.de')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function submit(e) {
    e.preventDefault()
    setLoading(true); setError('')
    try {
      const r = await fetch('/api/auth/login', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }), credentials: 'include',
      })
      const data = await r.json().catch(() => ({}))
      if (!r.ok) { setError(data?.detail || 'Login failed'); return }
      router.push('/admin')
      router.refresh()
    } catch (e) {
      setError(e.message || 'Network error')
    } finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6 bg-[#1A1414]">
      <div className="w-full max-w-md bg-white rounded-lg shadow-xl overflow-hidden">
        <div className="bg-[#1A1414] text-white px-8 py-6">
          <div className="font-heading text-2xl">
            <span className="font-semibold">Noir</span>{' '}
            <span className="italic text-[#E5A5B5]">Hamburg</span>
          </div>
          <div className="text-xs font-mono uppercase tracking-[0.2em] text-white/60 mt-1">Admin</div>
        </div>
        <form onSubmit={submit} className="px-8 py-8 space-y-5">
          <div>
            <label className="block text-xs font-mono uppercase tracking-[0.15em] text-[#6B5F5F] mb-2">Email</label>
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-[#1A1414]/15 rounded-md px-3 py-2.5 focus:outline-none focus:border-[#8B1538] transition-colors" />
          </div>
          <div>
            <label className="block text-xs font-mono uppercase tracking-[0.15em] text-[#6B5F5F] mb-2">Passwort</label>
            <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-[#1A1414]/15 rounded-md px-3 py-2.5 focus:outline-none focus:border-[#8B1538] transition-colors" />
          </div>
          {error && <div className="text-sm text-[#8B1538] bg-[#F4E4E4] px-3 py-2 rounded">{error}</div>}
          <button type="submit" disabled={loading} className="btn-primary w-full justify-center disabled:opacity-50">
            {loading ? 'Anmelden …' : 'Anmelden'}
          </button>
        </form>
      </div>
    </div>
  )
}
