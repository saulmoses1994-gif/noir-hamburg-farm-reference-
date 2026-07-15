import MediaLibraryClient from '@/components/admin/MediaLibraryClient'

export const dynamic = 'force-dynamic'

export default function AdminMediaPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-baseline justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-heading text-3xl">Media Library</h1>
          <p className="text-sm text-[#6B5F5F] mt-1">
            Upload photos once, use them everywhere. All uploads are auto-optimized (WebP/AVIF), served from a global CDN, and 10 MB max per file.
          </p>
        </div>
      </div>
      <MediaLibraryClient />
    </div>
  )
}
