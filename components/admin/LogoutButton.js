'use client'
import { useRouter } from 'next/navigation'

export default function LogoutButton() {
  const router = useRouter()
  async function logout() {
    await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' })
    router.push('/admin/login')
    router.refresh()
  }
  return (
    <button onClick={logout} className="mt-3 text-xs font-mono uppercase tracking-[0.15em] text-white/60 hover:text-white transition-colors">
      Abmelden →
    </button>
  )
}
