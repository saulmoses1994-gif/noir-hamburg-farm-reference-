import { notFound } from 'next/navigation'
import PageEditor from '@/components/admin/PageEditor'
import { getAnyPage } from '@/lib/pages'

export const dynamic = 'force-dynamic'

export default async function AdminPageEdit({ params }) {
  const { slug } = await params
  const doc = await getAnyPage(slug)
  if (!doc) notFound()
  return <PageEditor mode="edit" initial={doc} />
}
