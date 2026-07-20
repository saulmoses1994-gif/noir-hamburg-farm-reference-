// Server-side data-access layer for service content.  Every page + api handler
// calls through here so the seed-on-first-read logic is centralised.
import { cache } from 'react'
import { getDb, ensureSeeded, cleanDoc } from '@/lib/mongo'

// PERF: Wrapped in React `cache()` so multiple callers within the same
// request (e.g. page + JSON-LD builder) share one MongoDB round-trip.
export const listServiceContent = cache(async function listServiceContentImpl() {
  await ensureSeeded()
  const db = await getDb()
  const docs = await db.collection('service_content').find({}).toArray()
  return docs.map(cleanDoc)
})

export const getServiceContent = cache(async function getServiceContentImpl(slug) {
  await ensureSeeded()
  const db = await getDb()
  const doc = await db.collection('service_content').findOne({ slug })
  return cleanDoc(doc)
})

export const listAreaContent = cache(async function listAreaContentImpl() {
  await ensureSeeded()
  const db = await getDb()
  const docs = await db.collection('area_content').find({}).toArray()
  return docs.map(cleanDoc)
})

export const getAreaContent = cache(async function getAreaContentImpl(slug) {
  await ensureSeeded()
  const db = await getDb()
  const doc = await db.collection('area_content').findOne({ slug })
  return cleanDoc(doc)
})
