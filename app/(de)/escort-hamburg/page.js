import EscortHamburgBody from '@/components/public/EscortHamburgBody'
import { listServiceContent, listAreaContent } from '@/lib/service-content'
import { getSettings } from '@/lib/settings'
import { buildMetadata } from '@/lib/seo'
import { t } from '@/lib/i18n'

// PERF: switched from 'force-dynamic' to ISR — CMS PUT handlers already call revalidatePath()
export const revalidate = 300

export async function generateMetadata() {
  const lang = 'de'
  return buildMetadata({
    title: t(lang, 'hub.metaTitle'),
    description: t(lang, 'hub.metaDesc'),
    path: '/escort-hamburg',
    lang,
  })
}

export default async function EscortHamburgPage() {
  const [services, areas, settings] = await Promise.all([
    listServiceContent().catch(() => []),
    listAreaContent().catch(() => []),
    getSettings().catch(() => ({})),
  ])
  return <EscortHamburgBody lang="de" services={services} areas={areas} settings={settings} />
}
