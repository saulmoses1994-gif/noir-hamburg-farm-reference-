import EscortHamburgBody from '@/components/public/EscortHamburgBody'
import { listServiceContent, listAreaContent } from '@/lib/service-content'
import { getSettings } from '@/lib/settings'
import { buildMetadata } from '@/lib/seo'
import { t } from '@/lib/i18n'
import { getHubContent } from '@/lib/hub-content'

export const revalidate = 300

export async function generateMetadata() {
  const lang = 'en'
  const hub = await getHubContent('escort-hamburg')
  return buildMetadata({
    title: hub?.meta_title_en || t(lang, 'hub.metaTitle'),
    description: hub?.meta_description_en || t(lang, 'hub.metaDesc'),
    path: '/escort-hamburg',
    lang,
  })
}

export default async function EscortHamburgPage() {
  const [services, areas, settings, hub] = await Promise.all([
    listServiceContent().catch(() => []),
    listAreaContent().catch(() => []),
    getSettings().catch(() => ({})),
    getHubContent('escort-hamburg').catch(() => null),
  ])
  return <EscortHamburgBody lang="en" services={services} areas={areas} settings={settings} hub={hub} />
}
