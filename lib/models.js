// Data-access helpers for models.  Public list filters out soft-deleted rows;
// admin functions can opt-in to include them.
import { cache } from 'react'
import { getDb, cleanDoc } from '@/lib/mongo'

// Query used by the public site \u2014 hides soft-deleted rows.
const PUBLIC_FILTER = { deleted_at: { $in: [null, undefined] } }

// PERF: React `cache()` dedupes duplicate calls within the same request.
// DEPLOY: try/catch so Cloud Build can prerender with empty data when env
// vars aren't plumbed; ISR fills real data on the first live request.
export const listPublicModels = cache(async function listPublicModelsImpl() {
  try {
    const db = await getDb()
    const docs = await db.collection('models')
      .find(PUBLIC_FILTER)
      .sort({ featured: -1, created_at: -1 })
      .toArray()
    return docs.map(cleanDoc)
  } catch (e) {
    if (e?.name !== 'MongoUnavailableError') console.error('[listPublicModels]', e?.message)
    return []
  }
})

export const getPublicModel = cache(async function getPublicModelImpl(slug) {
  try {
    const db = await getDb()
    const doc = await db.collection('models').findOne({ slug, ...PUBLIC_FILTER })
    return cleanDoc(doc)
  } catch (e) {
    if (e?.name !== 'MongoUnavailableError') console.error('[getPublicModel]', e?.message)
    return null
  }
})

// Public list scoped to a specific location slug. Filters out soft-deleted rows.
export const listPublicModelsByLocation = cache(async function listPublicModelsByLocationImpl(locationSlug, { limit = 6 } = {}) {
  try {
    const db = await getDb()
    const docs = await db.collection('models')
      .find({ ...PUBLIC_FILTER, locations: locationSlug })
      .sort({ featured: -1, created_at: -1 })
      .limit(limit)
      .toArray()
    return docs.map(cleanDoc)
  } catch (e) {
    if (e?.name !== 'MongoUnavailableError') console.error('[listPublicModelsByLocation]', e?.message)
    return []
  }
})

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
