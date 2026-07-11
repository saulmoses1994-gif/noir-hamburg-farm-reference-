import { getDb, cleanDoc } from '@/lib/mongo'

const PUBLIC = { deleted_at: { $in: [null, undefined] } }

export async function listPublicBlog() {
  const db = await getDb()
  const docs = await db.collection('blog')
    .find({ ...PUBLIC, published: { $ne: false } })
    .sort({ created_at: -1 })
    .toArray()
  return docs.map(cleanDoc)
}

export async function getPublicBlog(slug) {
  const db = await getDb()
  const doc = await db.collection('blog').findOne({ slug, ...PUBLIC, published: { $ne: false } })
  return cleanDoc(doc)
}

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
