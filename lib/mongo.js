import { MongoClient } from 'mongodb'
import fs from 'fs'
import path from 'path'

let clientPromise = null

// PERF/DEPLOY: Guard against missing MONGO_URL. Two scenarios use this:
//   1. Cloud Build during `next build` — env vars may not be plumbed through
//      to the build step, so pages using ISR (`revalidate = 300`) that try
//      to prerender at build time would otherwise throw
//      `TypeError: Cannot read properties of undefined (reading 'startsWith')`
//      inside the mongodb driver, failing the entire deploy.
//   2. Local dev with an incomplete .env — should degrade gracefully instead
//      of crashing.
// When MONGO_URL is missing we throw a specific error that callers can
// catch and treat as "collection is empty". Pages then prerender with an
// empty state at build time, and ISR fetches real data on the first live
// request when env vars ARE present.
class MongoUnavailableError extends Error {
  constructor() { super('MONGO_URL is not set — MongoDB unavailable at build time'); this.name = 'MongoUnavailableError' }
}

function getClient() {
  if (!clientPromise) {
    if (!process.env.MONGO_URL) throw new MongoUnavailableError()
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
