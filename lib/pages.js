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
