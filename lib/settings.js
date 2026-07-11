import { getDb, cleanDoc } from '@/lib/mongo'

// Read the singleton site_settings doc. Returns {} when the doc does not
// exist yet (fresh DB with no admin activity). Never throws.
export async function getSettings() {
  try {
    const db = await getDb()
    const doc = await db.collection('site_settings').findOne({})
    return cleanDoc(doc) || {}
  } catch {
    return {}
  }
}
