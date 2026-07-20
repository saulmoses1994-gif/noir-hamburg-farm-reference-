import { cache } from 'react'
import { getDb, cleanDoc } from '@/lib/mongo'

const PUBLIC = { deleted_at: { $in: [null, undefined] } }

// PERF: cache() memoises the read per request.
// DEPLOY: try/catch enables build-time prerender to succeed without a DB.
export const listPublicPages = cache(async function listPublicPagesImpl() {
  try {
    const db = await getDb()
    const docs = await db.collection('pages')
      .find({ ...PUBLIC, published: { $ne: false } })
      .toArray()
    return docs.map(cleanDoc)
  } catch (e) {
    if (e?.name !== 'MongoUnavailableError') console.error('[listPublicPages]', e?.message)
    return []
  }
})

export const getPublicPage = cache(async function getPublicPageImpl(slug) {
  try {
    const db = await getDb()
    const doc = await db.collection('pages').findOne({ slug, ...PUBLIC, published: { $ne: false } })
    return cleanDoc(doc)
  } catch (e) {
    if (e?.name !== 'MongoUnavailableError') console.error('[getPublicPage]', e?.message)
    return null
  }
})

// Slug aliases — the site's Footer + sitemap use short canonical URLs while
// the CMS may store the page under a longer, historically-authored slug.
const PAGE_ALIASES = {
  diskretion: 'diskretion-und-datenschutz-noir-hamburg',
}

export async function getPublicPageWithAlias(slug) {
  const direct = await getPublicPage(slug)
  if (direct) return direct
  const aliased = PAGE_ALIASES[slug]
  if (aliased) return getPublicPage(aliased)
  return null
}

export async function listAllPages({ includeDeleted = false } = {}) {
  const db = await getDb()
  const q = includeDeleted ? {} : PUBLIC
  const docs = await db.collection('pages').find(q).sort({ updated_at: -1 }).toArray()
  return docs.map(cleanDoc)
}

export async function getAnyPage(slug) {
  const db = await getDb()
  const doc = await db.collection('pages').findOne({ slug })
  return cleanDoc(doc)
}
