import { getDb } from './mongo'

export async function getHubContent(key) {
  try {
    const db = await getDb()
    const doc = await db.collection('hub_content').findOne({ key })
    if (!doc) return null
    const { _id, ...rest } = doc
    return rest
  } catch (e) {
    console.error('[getHubContent]', e?.message)
    return null
  }
}
