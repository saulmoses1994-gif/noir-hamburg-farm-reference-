// Server-side data-access layer for service content.  Every page + api handler
// calls through here so the seed-on-first-read logic is centralised.
import { getDb, ensureSeeded, cleanDoc } from '@/lib/mongo'

export async function listServiceContent() {
  await ensureSeeded()
  const db = await getDb()
  const docs = await db.collection('service_content').find({}).toArray()
  return docs.map(cleanDoc)
}

export async function getServiceContent(slug) {
  await ensureSeeded()
  const db = await getDb()
  const doc = await db.collection('service_content').findOne({ slug })
  return cleanDoc(doc)
}

export async function listAreaContent() {
  await ensureSeeded()
  const db = await getDb()
  const docs = await db.collection('area_content').find({}).toArray()
  return docs.map(cleanDoc)
}

export async function getAreaContent(slug) {
  await ensureSeeded()
  const db = await getDb()
  const doc = await db.collection('area_content').findOne({ slug })
  return cleanDoc(doc)
}
