import { cache } from 'react'
import { getDb, cleanDoc } from '@/lib/mongo'

const PUBLIC = { deleted_at: { $in: [null, undefined] } }

// ────────────────────────────────────────────────────────────────────────
//  Slugify — URL-safe slug generator used for auto-deriving slug_en from
//  title_en at POST/PUT time. Lowercase, replaces German umlauts and other
//  common diacritics, collapses runs of non-alphanumerics into a single
//  hyphen, and strips leading/trailing hyphens. Matches the existing
//  `slugify` used by components/admin/BlogEditor.js so an editor-typed slug
//  and a server-auto-generated one look identical.
// ────────────────────────────────────────────────────────────────────────
const DIACRITICS = { 'ä':'ae','ö':'oe','ü':'ue','ß':'ss','Ä':'ae','Ö':'oe','Ü':'ue' }
export function slugify(input) {
  if (!input) return ''
  return String(input)
    .replace(/[äöüßÄÖÜ]/g, c => DIACRITICS[c] || c)
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')  // strip other accents
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 96)  // safety cap for very long titles
}

// ────────────────────────────────────────────────────────────────────────
//  hasEnBlogContent — single source of truth used by:
//    - app/(de)/blog/[slug]/page.js   (deciding whether to emit EN hreflang)
//    - app/(en)/en/blog/[slug]/page.js (deciding whether to render or notFound)
//    - app/sitemap.js                  (whether to emit /en/blog/{slug_en})
//    - components/public/BlogDetailBody.js (whether to render language switcher)
//  A post is considered to have EN content when it has EN title AND EN body.
//  Meta fields alone are not sufficient — a page without body content would
//  be thin content per Google's guidelines.
// ────────────────────────────────────────────────────────────────────────
export function hasEnBlogContent(post) {
  return !!(post && post.title_en && post.content_en)
}

// PERF: cache() dedupes reads per request.
// DEPLOY: try/catch enables build-time prerender to succeed without a DB.
export const listPublicBlog = cache(async function listPublicBlogImpl() {
  try {
    const db = await getDb()
    const docs = await db.collection('blog')
      .find({ ...PUBLIC, published: { $ne: false } })
      .sort({ created_at: -1 })
      .toArray()
    return docs.map(cleanDoc)
  } catch (e) {
    if (e?.name !== 'MongoUnavailableError') console.error('[listPublicBlog]', e?.message)
    return []
  }
})

// DE lookup — by primary `slug` field.
export const getPublicBlog = cache(async function getPublicBlogImpl(slug) {
  try {
    const db = await getDb()
    const doc = await db.collection('blog').findOne({ slug, ...PUBLIC, published: { $ne: false } })
    return cleanDoc(doc)
  } catch (e) {
    if (e?.name !== 'MongoUnavailableError') console.error('[getPublicBlog]', e?.message)
    return null
  }
})

// ────────────────────────────────────────────────────────────────────────
//  getPublicBlogByEnSlug — EN lookup by the auto-derived slug_en field.
//  Only used by the /en/blog/[slug] route. Returns the full doc; the caller
//  is responsible for verifying hasEnBlogContent() before rendering.
// ────────────────────────────────────────────────────────────────────────
export const getPublicBlogByEnSlug = cache(async function getPublicBlogByEnSlugImpl(slugEn) {
  try {
    const db = await getDb()
    const doc = await db.collection('blog').findOne({ slug_en: slugEn, ...PUBLIC, published: { $ne: false } })
    return cleanDoc(doc)
  } catch (e) {
    if (e?.name !== 'MongoUnavailableError') console.error('[getPublicBlogByEnSlug]', e?.message)
    return null
  }
})

export async function listAllBlog({ includeDeleted = false } = {}) {
  const db = await getDb()
  const q = includeDeleted ? {} : PUBLIC
  const docs = await db.collection('blog').find(q).sort({ created_at: -1 }).toArray()
  return docs.map(cleanDoc)
}

export async function getAnyBlog(slug) {
  const db = await getDb()
  const doc = await db.collection('blog').findOne({ slug })
  return cleanDoc(doc)
}

// ────────────────────────────────────────────────────────────────────────
//  ensureUniqueEnSlug — given a desired base and an optional current-doc
//  identifier to exclude, returns a slug that does not collide with any
//  other blog doc's slug_en. Used by both the migration script and the
//  admin API on POST/PUT.
// ────────────────────────────────────────────────────────────────────────
export async function ensureUniqueEnSlug(baseSlug, excludeSlug) {
  if (!baseSlug) return ''
  const db = await getDb()
  let candidate = baseSlug
  let n = 2
  while (true) {
    const collision = await db.collection('blog').findOne({
      slug_en: candidate,
      ...(excludeSlug ? { slug: { $ne: excludeSlug } } : {}),
    })
    if (!collision) return candidate
    candidate = `${baseSlug}-${n++}`
    if (n > 50) return `${baseSlug}-${Date.now()}`  // pathological guard
  }
}
