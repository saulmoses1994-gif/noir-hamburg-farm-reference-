import ModelEditor from '@/components/admin/ModelEditor'
import { listServiceContent, listAreaContent } from '@/lib/service-content'

export const dynamic = 'force-dynamic'

export default async function AdminModelNew() {
  const [services, areas] = await Promise.all([listServiceContent(), listAreaContent()])
  return (
    <ModelEditor
      mode="create"
      initial={{
        slug: '', name: '', short_tagline: '', short_tagline_en: '',
        bio: '', bio_en: '', cover_image: '', gallery: [],
        age: '', height_cm: '', measurements: '', dress_size: '',
        hair_color: '', eye_color: '', nationality: '',
        languages: [], interests: [], services: [], locations: [],
        prices: [],
        meta_title: '', meta_title_en: '', meta_description: '', meta_description_en: '',
        featured: false, available: true,
      }}
      serviceSlugs={services.map((s) => s.slug)}
      areaSlugs={areas.map((a) => a.slug)}
    />
  )
}
