// Cloudinary URL helper — CLIENT-SAFE, no SDK imports.
// This file must have zero runtime dependencies on `cloudinary` (which pulls
// in the Node `fs` module). It's a pure string function that rewrites a
// delivered Cloudinary URL to add on-the-fly transformation parameters.
//
// Cloudinary URL grammar:
//   https://res.cloudinary.com/{cloud}/image/upload/{tx}/{version}/{public_id}.{ext}
// The transformation MUST appear before the version segment.
//
// Usage:
//   optimizeImageUrl(url, { w: 1600, ar: '16:10', crop: 'fill' })
//   optimizeImageUrl(url, { w: 2000 })
//
// Idempotent — safe to call repeatedly. Non-Cloudinary URLs are returned
// unchanged (e.g. legacy Unsplash / Pexels fallbacks).
export function optimizeImageUrl(url, opts = {}) {
  if (!url || typeof url !== 'string') return url
  if (!url.includes('res.cloudinary.com') || !url.includes('/upload/')) return url

  const { w, h, ar, crop, gravity = 'auto' } = opts
  const parts = ['f_auto', 'q_auto']
  if (w) parts.push(`w_${w}`)
  if (h) parts.push(`h_${h}`)
  // Cloudinary's aspect-ratio syntax uses a colon (e.g. `ar_3:4`, `ar_16:9`),
  // NOT a slash. Normalize `'3/4'`, `'16/9'` → `'3:4'`, `'16:9'` so the URL
  // path doesn't get broken by an accidental `/` inside the transformation
  // segment (would cause Cloudinary to reject the URL as malformed).
  if (ar) parts.push(`ar_${String(ar).replace('/', ':')}`)
  if (crop) parts.push(`c_${crop}`)
  if (crop === 'fill' || crop === 'crop' || ar) parts.push(`g_${gravity}`)
  parts.push('dpr_auto')
  const tx = parts.join(',')

  const TX_SEG = /(?:[a-z]_[^/]+\/)/  // e.g. "f_auto,q_auto,w_400/"
  const VER_SEG = /(v\d+\/)/           // e.g. "v1784213207/"
  const combined = new RegExp(
    `/upload/(?:${TX_SEG.source})?(?:${VER_SEG.source})?`
  )
  return url.replace(combined, (_match, ver) => {
    return `/upload/${tx}/${ver || ''}`
  })
}
