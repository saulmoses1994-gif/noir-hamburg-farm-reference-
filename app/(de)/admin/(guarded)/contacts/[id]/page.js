import { notFound } from 'next/navigation'
import { getContact } from '@/lib/contacts'
import ContactDetail from '@/components/admin/ContactDetail'

export const dynamic = 'force-dynamic'

export default async function AdminContactDetailPage({ params }) {
  const { id } = await params
  const doc = await getContact(id)
  if (!doc) notFound()
  return <ContactDetail initial={doc} />
}
