import AboutBody from '@/components/public/AboutBody'
import { getSettings } from '@/lib/settings'
import { buildMetadata } from '@/lib/seo'
import { t } from '@/lib/i18n'

// PERF: switched from 'force-dynamic' to ISR — CMS PUT handlers already call revalidatePath()
export const revalidate = 300

export async function generateMetadata() {
  const lang = 'de'
  return buildMetadata({
    title: t(lang, 'about.metaTitle'),
    description: t(lang, 'about.metaDesc'),
    path: '/ueber-uns',
    lang,
  })
}

export default async function UeberUnsPage() {
  const settings = await getSettings().catch(() => ({}))
  return <AboutBody lang="de" settings={settings} />
}
