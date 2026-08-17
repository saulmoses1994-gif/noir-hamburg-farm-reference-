import { redirect } from 'next/navigation'
import { getSessionUser } from '@/lib/auth'
import { countUnread } from '@/lib/contacts'
import AdminNav from '@/components/admin/AdminNav'

export const dynamic = 'force-dynamic'

export default async function GuardedAdminLayout({ children }) {
  const user = await getSessionUser(null)
  if (!user) redirect('/admin/login')
  const unread = await countUnread().catch(() => 0)
  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[240px_1fr]">
      <AdminNav user={user} counts={{ contacts: unread }} />
      {/* pt-14 leaves room for the fixed mobile top bar; lg:pt-0 restores the
          normal flow on desktop where the sidebar is static, not fixed. */}
      <main className="bg-[#F7F5F2] overflow-x-hidden pt-14 lg:pt-0 min-w-0">{children}</main>
    </div>
  )
}
