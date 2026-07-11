import { notFound } from 'next/navigation'
import { getServiceContent } from '@/lib/service-content'
import ServiceEditor from '@/components/admin/ServiceEditor'

export const dynamic = 'force-dynamic'

export default async function AdminServiceEditPage({ params }) {
  const { slug } = await params
  const doc = await getServiceContent(slug)
  if (!doc) notFound()
  return <ServiceEditor initial={doc} />
}
