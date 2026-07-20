import { cache } from 'react'
import { getDb, cleanDoc } from '@/lib/mongo'

const PUBLIC = { deleted_at: { $in: [null, undefined] } }

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
