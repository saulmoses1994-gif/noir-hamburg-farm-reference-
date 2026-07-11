// Auth guard for every route under this group.  Redirects to /admin/login
// server-side (before any HTML is streamed) if there's no valid session.
import { redirect } from 'next/navigation'
import { getSessionUser } from '@/lib/auth'
import AdminNav from '@/components/admin/AdminNav'

export const dynamic = 'force-dynamic'

export default async function GuardedAdminLayout({ children }) {
  const user = await getSessionUser(null)
  if (!user) redirect('/admin/login')
  return (
    <div className="grid grid-cols-[240px_1fr] min-h-screen">
      <AdminNav user={user} />
      <main className="bg-[#F7F5F2] overflow-x-hidden">{children}</main>
    </div>
  )
}
