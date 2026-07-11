import AreasBody from '@/components/public/AreasBody'
import { listAreaContent } from '@/lib/service-content'
import { getSettings } from '@/lib/settings'
import { buildMetadata } from '@/lib/seo'
import { t } from '@/lib/i18n'

export const revalidate = 300

export async function generateMetadata() {
  const lang = 'en'
  return buildMetadata({
    title: t(lang, 'areas.metaTitle'),
    description: t(lang, 'areas.metaDesc'),
    path: '/areas',
    lang,
  })
}

export default async function AreasListPageEn() {
  const [areas, settings] = await Promise.all([
    listAreaContent().catch(() => []),
    getSettings().catch(() => ({})),
  ])
  return <AreasBody lang="en" areas={areas} settings={settings} />
}
