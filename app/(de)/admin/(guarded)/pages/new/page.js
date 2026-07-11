import PageEditor from '@/components/admin/PageEditor'

export const dynamic = 'force-dynamic'

export default function AdminPageNew() {
  return (
    <PageEditor
      mode="create"
      initial={{
        slug: '', title: '', h1: '', intro: '', content: '',
        hero_image: '',
        meta_title: '', meta_description: '',
        related_services: [], related_locations: [],
        published: false,
      }}
    />
  )
}
