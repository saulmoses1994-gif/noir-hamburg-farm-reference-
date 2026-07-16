// Cloudinary server-side helpers. Signs upload requests, builds optimized
// delivery URLs, and never exposes the API secret to the browser.
import { v2 as cloudinary } from 'cloudinary'

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
})

// Delivery-time optimized URL. Cloudinary picks best format (WebP/AVIF where
// supported) and quality automatically. Width param defaults to 'auto' which
// pairs with client hints; falls back to full image otherwise.
export function buildMediaUrl(publicId, opts = {}) {
  if (!publicId) return ''
  return cloudinary.url(publicId, {
    secure: true,
    transformation: [
      { fetch_format: 'auto', quality: 'auto' },
      opts.width
        ? { width: opts.width, crop: opts.crop || 'limit', dpr: 'auto' }
        : { width: 'auto', crop: 'limit', dpr: 'auto' },
    ],
  })
}

export function buildThumbUrl(publicId) {
  if (!publicId) return ''
  return cloudinary.url(publicId, {
    secure: true,
    transformation: [
      { fetch_format: 'auto', quality: 'auto' },
      { width: 400, height: 300, crop: 'fill', gravity: 'auto' },
    ],
  })
}

// Take an already-delivered Cloudinary URL (from admin editor / DB) and inject
// delivery-time optimizations. Idempotent — safe to call repeatedly. If the
// input isn't a Cloudinary URL (e.g., legacy Unsplash / Pexels fallback), the
// URL is returned unchanged.
//
// Cloudinary URL grammar:
//   https://res.cloudinary.com/{cloud}/image/upload/{tx}/{version}/{public_id}.{ext}
// The transformation MUST appear before the version segment.
//
// Usage:
//   optimizeImageUrl(url, { w: 1600, ar: '16:10', crop: 'fill' })
//   optimizeImageUrl(url, { w: 2000 })
export function optimizeImageUrl(url, opts = {}) {
  if (!url || typeof url !== 'string') return url
  if (!url.includes('res.cloudinary.com') || !url.includes('/upload/')) return url

  const { w, h, ar, crop, gravity = 'auto' } = opts
  const parts = ['f_auto', 'q_auto']
  if (w) parts.push(`w_${w}`)
  if (h) parts.push(`h_${h}`)
  if (ar) parts.push(`ar_${ar}`)
  if (crop) parts.push(`c_${crop}`)
  if (crop === 'fill' || crop === 'crop' || ar) parts.push(`g_${gravity}`)
  parts.push('dpr_auto')
  const tx = parts.join(',')

  // Match `/upload/` optionally followed by an existing transformation segment
  // (heuristic: contains an underscore-flag like `f_auto` or `w_400`),
  // optionally followed by a version segment (`v123456/`).
  // Replace with `/upload/{tx}/{version}` — transformation ALWAYS before version.
  const TX_SEG = /(?:[a-z]_[^/]+\/)/  // e.g. "f_auto,q_auto,w_400/"
  const VER_SEG = /(v\d+\/)/           // e.g. "v1784213207/"
  const combined = new RegExp(
    `/upload/(?:${TX_SEG.source})?(?:${VER_SEG.source})?`
  )
  return url.replace(combined, (_match, ver) => {
    return `/upload/${tx}/${ver || ''}`
  })
}

// Generate a short-lived signature so the browser can upload directly to
// Cloudinary without ever seeing the API secret. Signature is valid until the
// timestamp expires (default Cloudinary window is ~1 hour).
export function signUploadParams(paramsToSign) {
  return cloudinary.utils.api_sign_request(
    paramsToSign,
    process.env.CLOUDINARY_API_SECRET
  )
}

// Destroy an asset from Cloudinary (also invalidates CDN cache).
export async function destroyAsset(publicId) {
  return cloudinary.uploader.destroy(publicId, { invalidate: true })
}

export { cloudinary }
