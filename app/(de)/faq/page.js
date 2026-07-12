import FaqBody from '@/components/public/FaqBody'
import { buildMetadata } from '@/lib/seo'
import { t } from '@/lib/i18n'

export const dynamic = 'force-dynamic'

export async function generateMetadata() {
  const lang = 'de'
  return buildMetadata({
    title: t(lang, 'faq.metaTitle'),
    description: t(lang, 'faq.metaDesc'),
    path: '/faq',
    lang,
  })
}

export default function FaqPage() {
  return <FaqBody lang="de" />
}
