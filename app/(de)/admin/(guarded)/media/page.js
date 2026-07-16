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

      <div className="p-4 border-l-4 border-amber-500 bg-amber-50 rounded-md" data-testid="media-storage-hint">
        <p className="text-sm font-semibold text-amber-900">
          ⚠️  This page is <span className="underline">storage only</span> — photos uploaded here don&apos;t automatically appear on the public site.
        </p>
        <p className="text-sm text-amber-900 mt-2 leading-relaxed">
          To make a photo appear on <code className="font-mono text-xs bg-amber-100 px-1.5 py-0.5 rounded">/services</code>, <code className="font-mono text-xs bg-amber-100 px-1.5 py-0.5 rounded">/models</code>, <code className="font-mono text-xs bg-amber-100 px-1.5 py-0.5 rounded">/areas</code>, etc., either:
        </p>
        <ol className="text-sm text-amber-900 mt-2 ml-6 list-decimal space-y-1">
          <li>Go to the individual editor (e.g. <span className="font-semibold">Admin → Services → [click a service]</span>), click the <span className="font-semibold">Upload</span> button on the image field, then click <span className="font-semibold">Speichern</span>. <span className="italic">(Recommended — fastest workflow.)</span></li>
          <li>OR from this page, click <span className="font-semibold">Copy URL</span> below any photo, then paste it into an editor&apos;s image field and click <span className="font-semibold">Speichern</span>.</li>
        </ol>
      </div>

      <MediaLibraryClient />
    </div>
  )
}
