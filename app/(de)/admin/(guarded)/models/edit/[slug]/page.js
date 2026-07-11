import { notFound } from 'next/navigation'
import ModelEditor from '@/components/admin/ModelEditor'
import { getAnyModel } from '@/lib/models'
import { listServiceContent, listAreaContent } from '@/lib/service-content'

export const dynamic = 'force-dynamic'

export default async function AdminModelEdit({ params }) {
  const { slug } = await params
  const [doc, services, areas] = await Promise.all([
    getAnyModel(slug),
    listServiceContent(),
    listAreaContent(),
  ])
  if (!doc) notFound()
  return (
    <ModelEditor
      mode="edit"
      initial={doc}
      serviceSlugs={services.map((s) => s.slug)}
      areaSlugs={areas.map((a) => a.slug)}
    />
  )
}
