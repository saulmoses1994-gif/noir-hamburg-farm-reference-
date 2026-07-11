// Data-access helpers for models.  Public list filters out soft-deleted rows;
// admin functions can opt-in to include them.
import { getDb, cleanDoc } from '@/lib/mongo'

// Query used by the public site \u2014 hides soft-deleted rows.
const PUBLIC_FILTER = { deleted_at: { $in: [null, undefined] } }

export async function listPublicModels() {
  const db = await getDb()
  const docs = await db.collection('models')
    .find(PUBLIC_FILTER)
    .sort({ featured: -1, created_at: -1 })
    .toArray()
  return docs.map(cleanDoc)
}

export async function getPublicModel(slug) {
  const db = await getDb()
  const doc = await db.collection('models').findOne({ slug, ...PUBLIC_FILTER })
  return cleanDoc(doc)
}

// Admin helpers \u2014 can include deleted (recovery UI, not built yet).
export async function listAllModels({ includeDeleted = false } = {}) {
  const db = await getDb()
  const q = includeDeleted ? {} : PUBLIC_FILTER
  const docs = await db.collection('models').find(q).sort({ created_at: -1 }).toArray()
  return docs.map(cleanDoc)
}

export async function getAnyModel(slug) {
  const db = await getDb()
  const doc = await db.collection('models').findOne({ slug })
  return cleanDoc(doc)
}
