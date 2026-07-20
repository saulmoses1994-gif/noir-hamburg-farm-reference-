import { cache } from 'react'
import { getDb, cleanDoc } from '@/lib/mongo'

const PUBLIC = { deleted_at: { $in: [null, undefined] } }

// PERF: `cache()` dedupes request-scoped duplicate reads (e.g. blog index
// + sitemap builder in the same render both call listPublicBlog).
export const listPublicBlog = cache(async function listPublicBlogImpl() {
  const db = await getDb()
  const docs = await db.collection('blog')
    .find({ ...PUBLIC, published: { $ne: false } })
    .sort({ created_at: -1 })
    .toArray()
  return docs.map(cleanDoc)
})

export const getPublicBlog = cache(async function getPublicBlogImpl(slug) {
  const db = await getDb()
  const doc = await db.collection('blog').findOne({ slug, ...PUBLIC, published: { $ne: false } })
  return cleanDoc(doc)
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
