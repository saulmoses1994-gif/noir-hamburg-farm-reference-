import { listContacts } from '@/lib/contacts'
import ContactsListClient from '@/components/admin/ContactsListClient'

export const dynamic = 'force-dynamic'

export default async function AdminContactsList({ searchParams }) {
  const sp = await searchParams
  const archived = sp?.archived === '1'
  const contacts = await listContacts({ archived })
  return <ContactsListClient contacts={contacts} archived={archived} />
}
