import ContactBody from '@/components/public/ContactBody'
import { listServiceContent } from '@/lib/service-content'
import { getSettings } from '@/lib/settings'
import { buildMetadata } from '@/lib/seo'
import { t } from '@/lib/i18n'

// PERF: switched from 'force-dynamic' to ISR — CMS PUT handlers already call revalidatePath()
export const revalidate = 300

export async function generateMetadata() {
  const lang = 'de'
  return buildMetadata({
    title: t(lang, 'contact.metaTitle'),
    description: t(lang, 'contact.metaDesc'),
    path: '/kontakt',
    lang,
  })
}

export default async function KontaktPage() {
  const [services, settings] = await Promise.all([
    listServiceContent().catch(() => []),
    getSettings().catch(() => ({})),
  ])
  return <ContactBody lang="de" services={services} settings={settings} />
}
