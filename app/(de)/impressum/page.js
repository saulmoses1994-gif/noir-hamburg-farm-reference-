import ImpressumBody from '@/components/public/ImpressumBody'
import { getSettings } from '@/lib/settings'
import { buildMetadata } from '@/lib/seo'
import { t } from '@/lib/i18n'

// PERF: switched from 'force-dynamic' to ISR — CMS PUT handlers already call revalidatePath()
export const revalidate = 300

export async function generateMetadata() {
  const lang = 'de'
  return buildMetadata({
    title: t(lang, 'impressum.metaTitle'),
    description: t(lang, 'impressum.metaDesc'),
    path: '/impressum',
    lang,
  })
}

export default async function ImpressumPage() {
  const settings = await getSettings().catch(() => ({}))
  return <ImpressumBody lang="de" settings={settings} />
}
