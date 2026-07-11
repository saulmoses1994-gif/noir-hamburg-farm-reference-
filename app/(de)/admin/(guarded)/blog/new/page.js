import BlogEditor from '@/components/admin/BlogEditor'

export const dynamic = 'force-dynamic'

export default function AdminBlogNew() {
  return (
    <BlogEditor
      mode="create"
      initial={{
        slug: '', title: '', title_en: '', category: '',
        excerpt: '', excerpt_en: '',
        content: '', content_en: '',
        cover_image: '',
        meta_title: '', meta_title_en: '',
        meta_description: '', meta_description_en: '',
        related_services: [], related_locations: [],
        published: false,
      }}
    />
  )
}
