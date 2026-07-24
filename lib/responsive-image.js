// Responsive image helper — CLIENT-SAFE.
//
// Given a raw image URL (Cloudinary or any other origin) + a set of widths +
// an aspect ratio, this helper returns the exact prop bag needed by an
// `<img>` element to be fully responsive AND avoid CLS:
//   { src, srcSet, sizes, width, height }
//
// Cloudinary URLs are rewritten via `optimizeImageUrl` (f_auto, q_auto,
// dpr_auto, ar_*, c_fill/limit). Non-Cloudinary URLs (legacy Unsplash /
// Pexels fallbacks) are returned as-is with no srcSet.
//
// The width / height attributes are ALWAYS emitted so the browser can
// reserve the correct box before the pixels arrive (eliminates CLS).
// They reflect the LARGEST srcSet candidate — actual rendered size is
// controlled by CSS.
//
// This helper never emits <picture> / <source> because Cloudinary already
// serves modern formats (WebP/AVIF) via `f_auto` based on Accept headers,
// making <source type=...> redundant.

import { optimizeImageUrl } from './cloudinary-url'

// Default widths per usage class. Chosen so the browser almost always has
// a candidate within ~15% of the physical pixels it needs, avoiding the
// oversize/undersize traps that DevTools flags. Numbers align to Cloudinary
// billing tiers (200-wide bands) and common device widths at various DPRs.
const DEFAULT_WIDTHS = {
  hero:  [400, 640, 900, 1200, 1600, 2000], // full-viewport hero
  cover: [400, 640, 900, 1200, 1600],       // article cover / 60vh
  card:  [280, 400, 600, 800],              // grid tiles (blog / model / area)
  tile:  [200, 320, 480],                   // small thumbnails
}

// Parse an aspect ratio string like "3/2" or "16/9" or "3:2" into a numeric
// ratio (w/h). Returns null on malformed input.
function parseAspect(ar) {
  if (!ar) return null
  const m = String(ar).match(/^(\d+)\s*[/:]\s*(\d+)$/)
  if (!m) return null
  const w = parseInt(m[1], 10)
  const h = parseInt(m[2], 10)
  if (!w || !h) return null
  return { w, h }
}

// Build a single srcset entry (URL + width descriptor).
function makeSrcSetEntry(url, w, ar, crop) {
  return `${optimizeImageUrl(url, { w, ar, crop })} ${w}w`
}

/**
 * @param {object} opts
 * @param {string} opts.url         Base image URL (Cloudinary or otherwise).
 * @param {string} [opts.sizes]     `sizes` attribute value. REQUIRED for meaningful srcSet.
 * @param {string} [opts.ar]        Aspect ratio, e.g. "3/2", "16/9", "3/4".
 * @param {string} [opts.crop]      Cloudinary crop mode, default "fill".
 * @param {string} [opts.class]     Usage class (see DEFAULT_WIDTHS). Default "cover".
 * @param {number[]} [opts.widths]  Override widths array.
 * @param {number} [opts.baseWidth] Which width to use for the (fallback) `src` attribute.
 *                                  Should be a mid-range candidate — modern browsers
 *                                  use srcSet anyway.
 * @returns {object|null}  { src, srcSet, sizes, width, height }  or null when url is empty.
 */
export function buildResponsiveImage(opts) {
  const {
    url,
    sizes = '100vw',
    ar = null,
    crop = 'fill',
    class: className = 'cover',
    widths,
    baseWidth,
  } = opts || {}

  if (!url) return null

  const widthList = widths || DEFAULT_WIDTHS[className] || DEFAULT_WIDTHS.cover
  const isCloudinary = typeof url === 'string' && url.includes('res.cloudinary.com') && url.includes('/upload/')

  // Non-Cloudinary URL: no srcSet possible (can't resize). Return width/height
  // only if ar is known; otherwise omit dimensions.
  if (!isCloudinary) {
    const parsed = parseAspect(ar)
    const outW = widthList[widthList.length - 1]
    const outH = parsed ? Math.round((outW * parsed.h) / parsed.w) : undefined
    return {
      src: url,
      srcSet: undefined,
      sizes: undefined,
      width: parsed ? outW : undefined,
      height: parsed ? outH : undefined,
    }
  }

  const largest = widthList[widthList.length - 1]
  const fallbackW = baseWidth || widthList[Math.floor(widthList.length / 2)] || largest
  const parsed = parseAspect(ar)

  const srcSet = widthList
    .map((w) => makeSrcSetEntry(url, w, ar, crop))
    .join(', ')

  // Intrinsic width/height derived from the LARGEST candidate. object-cover /
  // object-contain in CSS handles the visual fit; these attributes exist
  // solely to let the browser reserve the correct aspect box before load.
  const intrinsicW = largest
  const intrinsicH = parsed ? Math.round((largest * parsed.h) / parsed.w) : largest

  return {
    src: optimizeImageUrl(url, { w: fallbackW, ar, crop }),
    srcSet,
    sizes,
    width: intrinsicW,
    height: intrinsicH,
  }
}
