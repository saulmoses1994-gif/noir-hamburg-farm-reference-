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
