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
    <div className="grid grid-cols-[240px_1fr] min-h-screen">
      <AdminNav user={user} counts={{ contacts: unread }} />
      <main className="bg-[#F7F5F2] overflow-x-hidden">{children}</main>
    </div>
  )
}
