import { getDb } from '@/lib/mongo'
import SettingsEditor from '@/components/admin/SettingsEditor'
import { listServiceContent, listAreaContent } from '@/lib/service-content'

export const dynamic = 'force-dynamic'

export default async function AdminSettingsPage() {
  const db = await getDb()
  const doc = (await db.collection('site_settings').findOne({})) || {}
  delete doc._id
  const [services, areas] = await Promise.all([listServiceContent(), listAreaContent()])
  return (
    <SettingsEditor
      initial={doc}
      serviceSlugs={services.map((s) => s.slug)}
      areaSlugs={areas.map((a) => a.slug)}
    />
  )
}
