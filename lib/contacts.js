import { getDb, cleanDoc } from '@/lib/mongo'

export async function listContacts({ archived = false } = {}) {
  const db = await getDb()
  const q = archived ? { archived: true } : { archived: { $ne: true } }
  const docs = await db.collection('contacts')
    .find(q)
    .sort({ created_at: -1 })
    .toArray()
  return docs.map(cleanDoc)
}

export async function getContact(id) {
  const db = await getDb()
  const doc = await db.collection('contacts').findOne({ id })
  return cleanDoc(doc)
}

export async function countUnread() {
  const db = await getDb()
  // Unread = doesn't have read=true (backward-compatible with existing docs)
  return db.collection('contacts').countDocuments({ read: { $ne: true }, archived: { $ne: true } })
}
