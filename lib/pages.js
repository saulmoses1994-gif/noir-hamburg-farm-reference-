import { getDb, cleanDoc } from '@/lib/mongo'

const PUBLIC = { deleted_at: { $in: [null, undefined] } }

export async function listPublicPages() {
  const db = await getDb()
  const docs = await db.collection('pages')
    .find({ ...PUBLIC, published: { $ne: false } })
    .toArray()
  return docs.map(cleanDoc)
}

export async function getPublicPage(slug) {
  const db = await getDb()
  const doc = await db.collection('pages').findOne({ slug, ...PUBLIC, published: { $ne: false } })
  return cleanDoc(doc)
}

// Slug aliases — the site's Footer + sitemap use short canonical URLs while
// the CMS may store the page under a longer, historically-authored slug. Keep
// this map tiny and only for URLs the site itself links to.
const PAGE_ALIASES = {
  diskretion: 'diskretion-und-datenschutz-noir-hamburg',
}

// Resolves a page by its public slug, falling back to a known alias so
// canonical marketing URLs (e.g. /p/diskretion) never 404 even when the CMS
// stores the doc under a longer slug.
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
