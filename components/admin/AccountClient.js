'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { cls } from '@/components/admin/FormFields'

export default function AccountClient({ user }) {
  const router = useRouter()
  const [current, setCurrent] = useState('')
  const [next, setNext] = useState('')
  const [confirm, setConfirm] = useState('')
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState(null)

  async function submit(e) {
    e.preventDefault()
    setMsg(null)
    if (!current || !next) return setMsg({ type: 'error', text: 'Aktuelles und neues Passwort erforderlich.' })
    if (next.length < 8) return setMsg({ type: 'error', text: 'Neues Passwort muss mindestens 8 Zeichen lang sein.' })
    if (next !== confirm) return setMsg({ type: 'error', text: 'Neues Passwort und Bestätigung stimmen nicht überein.' })
    if (next === current) return setMsg({ type: 'error', text: 'Neues Passwort darf nicht identisch mit dem aktuellen sein.' })

    setSaving(true)
    try {
      const r = await fetch('/api/auth/change-password', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ current_password: current, new_password: next }),
      })
      const data = await r.json().catch(() => ({}))
      if (!r.ok) return setMsg({ type: 'error', text: data?.detail || 'Passwort-Änderung fehlgeschlagen' })
      setMsg({ type: 'ok', text: 'Passwort erfolgreich geändert. Session bleibt aktiv.' })
      setCurrent(''); setNext(''); setConfirm('')
      router.refresh()
    } catch (e) {
      setMsg({ type: 'error', text: e.message || 'Netzwerkfehler' })
    } finally { setSaving(false) }
  }

  async function logoutEverywhere() {
    if (!confirmDialog()) return
    setSaving(true)
    try {
      await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' })
      router.push('/admin/login')
    } finally { setSaving(false) }
  }
  function confirmDialog() {
    if (typeof window === 'undefined') return true
    return window.confirm('Du wirst abgemeldet und musst dich erneut anmelden. Fortfahren?')
  }

  return (
    <div className="p-10 max-w-3xl">
      <div className="mb-8">
        <div className="overline">Admin</div>
        <h1 className="font-heading text-4xl mt-2">Konto</h1>
      </div>

      <section className="bg-white p-8 rounded-lg mb-8">
        <h2 className="font-heading text-xl mb-6">Profil</h2>
        <dl className="grid grid-cols-[140px_1fr] gap-3 text-sm">
          <dt className="text-xs font-mono uppercase tracking-[0.15em] text-[#6B5F5F] pt-0.5">Name</dt>
          <dd>{user?.name || '—'}</dd>
          <dt className="text-xs font-mono uppercase tracking-[0.15em] text-[#6B5F5F] pt-0.5">Email</dt>
          <dd className="font-mono text-xs">{user?.email}</dd>
          <dt className="text-xs font-mono uppercase tracking-[0.15em] text-[#6B5F5F] pt-0.5">Rolle</dt>
          <dd>{user?.role}</dd>
          {user?.id && (<>
            <dt className="text-xs font-mono uppercase tracking-[0.15em] text-[#6B5F5F] pt-0.5">User ID</dt>
            <dd className="font-mono text-[10px] text-[#6B5F5F]">{user.id}</dd>
          </>)}
        </dl>
      </section>

      <section className="bg-white p-8 rounded-lg mb-8">
        <h2 className="font-heading text-xl mb-2">Passwort ändern</h2>
        <p className="text-xs text-[#6B5F5F] mb-6">Mindestens 8 Zeichen. Wir empfehlen eine Passphrase aus 4+ zufälligen Wörtern.</p>

        <form onSubmit={submit} className="space-y-5 max-w-md" autoComplete="off">
          <div>
            <label className="block text-xs font-mono uppercase tracking-[0.15em] text-[#6B5F5F] mb-1.5">Aktuelles Passwort</label>
            <input type="password" value={current} onChange={(e) => setCurrent(e.target.value)} className={cls('input')} autoComplete="current-password" />
          </div>
          <div>
            <label className="block text-xs font-mono uppercase tracking-[0.15em] text-[#6B5F5F] mb-1.5">Neues Passwort</label>
            <input type="password" value={next} onChange={(e) => setNext(e.target.value)} className={cls('input')} autoComplete="new-password" />
            <div className="text-[11px] font-mono text-[#6B5F5F] mt-1">{next.length} / min. 8 Zeichen</div>
          </div>
          <div>
            <label className="block text-xs font-mono uppercase tracking-[0.15em] text-[#6B5F5F] mb-1.5">Neues Passwort bestätigen</label>
            <input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} className={cls('input')} autoComplete="new-password" />
            {confirm && next && confirm !== next && (
              <div className="text-[11px] font-mono text-[#8B1538] mt-1">Stimmt nicht mit dem neuen Passwort überein.</div>
            )}
          </div>

          {msg && (
            <div className={`px-4 py-3 rounded text-sm ${msg.type === 'ok' ? 'bg-[#DCEFE2] text-[#2D7A4E]' : 'bg-[#F4E4E4] text-[#8B1538]'}`}>{msg.text}</div>
          )}

          <button type="submit" disabled={saving} className="btn-primary !text-sm disabled:opacity-50">
            {saving ? 'Speichern …' : 'Passwort ändern'}
          </button>
        </form>
      </section>

      <section className="bg-white p-8 rounded-lg">
        <h2 className="font-heading text-xl mb-2">Session</h2>
        <p className="text-xs text-[#6B5F5F] mb-6">Aktive Session-Cookie läuft nach 7 Tagen ab. Manuell abmelden:</p>
        <button onClick={logoutEverywhere} disabled={saving} className="btn-ghost !text-sm">Jetzt abmelden →</button>
      </section>
    </div>
  )
}
