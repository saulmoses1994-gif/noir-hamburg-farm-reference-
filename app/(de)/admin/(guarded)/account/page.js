import { getSessionUser } from '@/lib/auth'
import AccountClient from '@/components/admin/AccountClient'

export const dynamic = 'force-dynamic'

export default async function AdminAccountPage() {
  const user = await getSessionUser(null)
  return <AccountClient user={user} />
}
