#!/usr/bin/env node
/**
 * One-time migration — backfill `slug_en` on every blog post that has
 * `title_en` populated but no `slug_en` yet.
 *
 *   - Reads every doc in the `blog` collection
 *   - Derives slug_en from title_en using the same slugify() used by the
 *     admin editor and API layer (imported from lib/blog.js)
 *   - Ensures uniqueness by appending -2, -3, … only when a collision would
 *     occur with another doc's slug_en
 *   - Never overwrites an existing slug_en
 *   - Never modifies published/deleted/updated_at metadata
 *
 * Safe to run repeatedly (idempotent). Reports what changed on each run.
 * Requires MONGO_URL + DB_NAME in the environment (loaded from /app/.env).
 */
import { MongoClient } from 'mongodb'
import { readFileSync } from 'node:fs'

// Load env from /app/.env manually — this script runs outside Next.js.
try {
  for (const line of readFileSync('/app/.env', 'utf8').split('\n')) {
    const m = line.match(/^([A-Z_]+)=(.*)$/)
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^"|"$/g, '')
  }
} catch {}

const DIACRITICS = { 'ä':'ae','ö':'oe','ü':'ue','ß':'ss','Ä':'ae','Ö':'oe','Ü':'ue' }
function slugify(input) {
  if (!input) return ''
  return String(input)
    .replace(/[äöüßÄÖÜ]/g, c => DIACRITICS[c] || c)
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 96)
}

async function main() {
  const url = process.env.MONGO_URL
  const dbName = process.env.DB_NAME || 'noir_hamburg'
  if (!url) { console.error('MONGO_URL missing'); process.exit(1) }
  const client = new MongoClient(url)
  await client.connect()
  const db = client.db(dbName)
  const coll = db.collection('blog')

  const docs = await coll.find({ deleted_at: { $in: [null, undefined] } }).toArray()
  console.log(`Scanning ${docs.length} blog posts…\n`)

  const takenEnSlugs = new Set(docs.map(d => d.slug_en).filter(Boolean))
  const changed = []
  const skippedNoEn = []

  for (const d of docs) {
    if (d.slug_en) continue                       // already migrated
    if (!d.title_en || !d.content_en) {           // no EN copy → no EN slug
      skippedNoEn.push(d.slug)
      continue
    }
    const base = slugify(d.title_en)
    if (!base) { skippedNoEn.push(d.slug); continue }

    // Ensure uniqueness
    let candidate = base
    let n = 2
    while (takenEnSlugs.has(candidate)) {
      candidate = `${base}-${n++}`
      if (n > 50) { candidate = `${base}-${Date.now()}`; break }
    }
    takenEnSlugs.add(candidate)

    await coll.updateOne(
      { _id: d._id },
      { $set: { slug_en: candidate } }              // do NOT bump updated_at
    )
    changed.push({ slug: d.slug, slug_en: candidate, title_en: d.title_en })
    console.log(`  ✓ ${d.slug}\n    → slug_en: ${candidate}`)
  }

  console.log(`\n───────────────────────────────`)
  console.log(`Migrated: ${changed.length}`)
  console.log(`Skipped (no EN copy): ${skippedNoEn.length}`)
  console.log(`Already had slug_en: ${docs.filter(d => d.slug_en).length - changed.length}`)

  // Ensure the sparse unique index on slug_en (only enforces uniqueness on
  // docs where the field is present)
  try {
    await coll.createIndex({ slug_en: 1 }, { unique: true, sparse: true, name: 'slug_en_unique_sparse' })
    console.log(`\nUnique sparse index on slug_en ensured.`)
  } catch (e) {
    console.error(`\nIndex creation warning: ${e.message}`)
  }

  await client.close()
}

main().catch(e => { console.error(e); process.exit(1) })
