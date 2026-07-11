import ImpressumBody from '@/components/public/ImpressumBody'
import { getSettings } from '@/lib/settings'
import { buildMetadata } from '@/lib/seo'
import { t } from '@/lib/i18n'

export const revalidate = 300

export async function generateMetadata() {
  const lang = 'en'
  return buildMetadata({
    title: t(lang, 'impressum.metaTitle'),
    description: t(lang, 'impressum.metaDesc'),
    path: '/impressum',
    lang,
  })
}

export default async function ImprintPageEn() {
  const settings = await getSettings().catch(() => ({}))
  return <ImpressumBody lang="en" settings={settings} />
}
