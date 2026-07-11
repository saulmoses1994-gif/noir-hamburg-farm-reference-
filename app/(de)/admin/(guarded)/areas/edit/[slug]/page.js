import { notFound } from 'next/navigation'
import { getAreaContent } from '@/lib/service-content'
import AreaEditor from '@/components/admin/AreaEditor'

export const dynamic = 'force-dynamic'

export default async function AdminAreaEditPage({ params }) {
  const { slug } = await params
  const doc = await getAreaContent(slug)
  if (!doc) notFound()
  return <AreaEditor initial={doc} />
}
