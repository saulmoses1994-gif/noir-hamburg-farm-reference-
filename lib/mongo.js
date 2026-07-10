import { MongoClient } from 'mongodb'
import fs from 'fs'
import path from 'path'

let clientPromise = null

function getClient() {
  if (!clientPromise) {
    const client = new MongoClient(process.env.MONGO_URL, {
      maxPoolSize: 10,
    })
    clientPromise = client.connect().then(() => client)
  }
  return clientPromise
}

export async function getDb() {
  const client = await getClient()
  return client.db(process.env.DB_NAME)
}

// One-shot lazy seeding of the service_content collection from the frozen
// reference JSON.  Runs only when the collection is empty — so once the user
// clicks "Replace with existing DB" and real content is present, this is a
// no-op.
let seedPromise = null
export async function ensureSeeded() {
  if (seedPromise) return seedPromise
  seedPromise = (async () => {
    const db = await getDb()
    try {
      const svcCount = await db.collection('service_content').countDocuments()
      if (svcCount === 0) {
        const seedPath = path.join(process.cwd(), 'lib', 'service_content_seed.json')
        if (fs.existsSync(seedPath)) {
          const docs = JSON.parse(fs.readFileSync(seedPath, 'utf8'))
          if (docs.length) {
            await db.collection('service_content').insertMany(docs)
            console.log(`[seed] inserted ${docs.length} service_content docs`)
          }
        }
      }
      const areaCount = await db.collection('area_content').countDocuments()
      if (areaCount === 0) {
        const seedPath = path.join(process.cwd(), 'lib', 'area_content_seed.json')
        if (fs.existsSync(seedPath)) {
          const docs = JSON.parse(fs.readFileSync(seedPath, 'utf8'))
          if (docs.length) {
            await db.collection('area_content').insertMany(docs)
            console.log(`[seed] inserted ${docs.length} area_content docs`)
          }
        }
      }
    } catch (e) {
      console.error('[seed] error', e)
    }
  })()
  return seedPromise
}

// Strip _id and normalise datetimes so responses stay JSON-serialisable and
// match the FastAPI backend's payload shape (id + iso strings).
export function cleanDoc(doc) {
  if (!doc) return doc
  const { _id, ...rest } = doc
  for (const [k, v] of Object.entries(rest)) {
    if (v instanceof Date) rest[k] = v.toISOString()
  }
  return rest
}
