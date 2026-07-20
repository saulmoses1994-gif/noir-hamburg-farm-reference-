// Server-side data-access layer for service content.  Every page + api handler
// calls through here so the seed-on-first-read logic is centralised.
import { cache } from 'react'
import { getDb, ensureSeeded, cleanDoc } from '@/lib/mongo'

// PERF: Wrapped in React `cache()` so multiple callers within the same
// request (e.g. page + JSON-LD builder) share one MongoDB round-trip.
//
// DEPLOY: Each function catches errors so that if MongoDB is unreachable
// during `next build` (e.g. Cloud Build without env vars), pages can still
// prerender an empty state — ISR then fetches real data on the first live
// request when env vars are properly set.
export const listServiceContent = cache(async function listServiceContentImpl() {
  try {
    await ensureSeeded()
    const db = await getDb()
    const docs = await db.collection('service_content').find({}).toArray()
    return docs.map(cleanDoc)
  } catch (e) {
    if (e?.name !== 'MongoUnavailableError') console.error('[listServiceContent]', e?.message)
    return []
  }
})

export const getServiceContent = cache(async function getServiceContentImpl(slug) {
  try {
    await ensureSeeded()
    const db = await getDb()
    const doc = await db.collection('service_content').findOne({ slug })
    return cleanDoc(doc)
  } catch (e) {
    if (e?.name !== 'MongoUnavailableError') console.error('[getServiceContent]', e?.message)
    return null
  }
})

export const listAreaContent = cache(async function listAreaContentImpl() {
  try {
    await ensureSeeded()
    const db = await getDb()
    const docs = await db.collection('area_content').find({}).toArray()
    return docs.map(cleanDoc)
  } catch (e) {
    if (e?.name !== 'MongoUnavailableError') console.error('[listAreaContent]', e?.message)
    return []
  }
})

export const getAreaContent = cache(async function getAreaContentImpl(slug) {
  try {
    await ensureSeeded()
    const db = await getDb()
    const doc = await db.collection('area_content').findOne({ slug })
    return cleanDoc(doc)
  } catch (e) {
    if (e?.name !== 'MongoUnavailableError') console.error('[getAreaContent]', e?.message)
    return null
  }
})
