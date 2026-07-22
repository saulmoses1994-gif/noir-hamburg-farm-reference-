#!/usr/bin/env node
/*
 * Full site audit — evidence-based
 *  1) Crawl sitemap → get all pages
 *  2) For each page: fetch HTML, extract every internal <a href> and every
 *     JSON-LD <script type="application/ld+json"> block.
 *  3) Test each unique href with a real GET (HEAD is unreliable for Next.js).
 *  4) Report:
 *       - link map (source → target → status)
 *       - every 4xx/5xx target with all its source pages
 *       - every JSON-LD schema block that fails JSON.parse or lacks a valid
 *         @context / @type
 */
import fs from 'node:fs/promises'
import { setTimeout as sleep } from 'node:timers/promises'

const ORIGIN = 'https://noir-hamburg.com'
const UA = 'Mozilla/5.0 (Linux; Android 11) AppleWebKit/537.36 Chrome/119.0.0.0 Mobile'
const OUT_DIR = '/app/memory/audit'

async function getSitemapUrls() {
  const res = await fetch(`${ORIGIN}/sitemap.xml`, { headers: { 'User-Agent': UA } })
  const xml = await res.text()
  return [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => m[1])
}

async function fetchHtml(url) {
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': UA, 'Accept': 'text/html,*/*' },
      redirect: 'follow',
    })
    return { url, status: res.status, finalUrl: res.url, html: res.status === 200 ? await res.text() : '' }
  } catch (e) {
    return { url, status: -1, error: e.message, finalUrl: url, html: '' }
  }
}

function extractLinks(html, baseUrl) {
  // href="..." — grab, filter internal, normalise
  const hrefs = [...html.matchAll(/<a\s[^>]*href=(?:"([^"]+)"|'([^']+)')/gi)].map(m => m[1] || m[2])
  const internal = new Set()
  for (const h of hrefs) {
    if (!h || h.startsWith('#') || h.startsWith('mailto:') || h.startsWith('tel:') || h.startsWith('javascript:') || h.startsWith('whatsapp:')) continue
    try {
      const abs = new URL(h, baseUrl).toString()
      if (abs.startsWith(ORIGIN)) internal.add(abs.split('#')[0])
    } catch { /* ignore */ }
  }
  return [...internal]
}

function extractJsonLd(html, baseUrl) {
  const blocks = []
  const re = /<script\s+type=(?:"application\/ld\+json"|'application\/ld\+json')[^>]*>([\s\S]*?)<\/script>/gi
  let m; let i = 0
  while ((m = re.exec(html))) {
    const raw = m[1].trim()
    const block = { page: baseUrl, index: i++, raw: raw.slice(0, 2000) }
    try {
      const parsed = JSON.parse(raw)
      block.parsed = true
      block.context = parsed['@context']
      block.type = parsed['@type']
      block.errors = validateJsonLd(parsed)
    } catch (e) {
      block.parsed = false
      block.parseError = e.message
      block.errors = [`JSON parse error: ${e.message}`]
    }
    blocks.push(block)
  }
  return blocks
}

// Minimal schema.org validator — checks the shapes Google Rich Results needs
function validateJsonLd(obj, path = '$') {
  const errs = []
  if (obj == null) return errs
  if (Array.isArray(obj)) {
    obj.forEach((x, i) => errs.push(...validateJsonLd(x, `${path}[${i}]`)))
    return errs
  }
  if (typeof obj !== 'object') return errs
  if (path === '$' && !obj['@context']) errs.push(`${path}: missing @context`)
  if (!obj['@type']) errs.push(`${path}: missing @type`)
  const t = obj['@type']
  // Type-specific checks matching what SEMrush's structured-data validator looks for
  if (t === 'BreadcrumbList') {
    if (!Array.isArray(obj.itemListElement)) errs.push(`${path}: BreadcrumbList missing itemListElement[]`)
    else obj.itemListElement.forEach((it, i) => {
      const p = `${path}.itemListElement[${i}]`
      if (it['@type'] !== 'ListItem') errs.push(`${p}: expected @type=ListItem, got ${it['@type']}`)
      if (typeof it.position !== 'number') errs.push(`${p}: missing/invalid position`)
      if (!it.name && !(it.item && it.item.name)) errs.push(`${p}: missing name`)
      if (!it.item && !it.url) errs.push(`${p}: missing item/url`)
    })
  }
  if (t === 'FAQPage') {
    if (!Array.isArray(obj.mainEntity)) errs.push(`${path}: FAQPage missing mainEntity[]`)
    else obj.mainEntity.forEach((q, i) => {
      const p = `${path}.mainEntity[${i}]`
      if (q['@type'] !== 'Question') errs.push(`${p}: expected Question`)
      if (!q.name) errs.push(`${p}: missing name`)
      if (!q.acceptedAnswer || !q.acceptedAnswer.text) errs.push(`${p}: missing acceptedAnswer.text`)
    })
  }
  if (t === 'Service' || t === 'LocalBusiness' || t === 'Organization') {
    if (!obj.name) errs.push(`${path}: ${t} missing name`)
    if (t !== 'Service' && !obj.url) errs.push(`${path}: ${t} missing url`)
  }
  if (t === 'Person') {
    if (!obj.name) errs.push(`${path}: Person missing name`)
  }
  if (t === 'ImageObject') {
    if (!obj.url && !obj.contentUrl) errs.push(`${path}: ImageObject missing url/contentUrl`)
  }
  if (t === 'Article' || t === 'BlogPosting' || t === 'NewsArticle') {
    if (!obj.headline) errs.push(`${path}: ${t} missing headline`)
    if (!obj.image) errs.push(`${path}: ${t} missing image`)
    if (!obj.datePublished) errs.push(`${path}: ${t} missing datePublished`)
    if (!obj.author) errs.push(`${path}: ${t} missing author`)
  }
  // Recurse into nested objects
  for (const [k, v] of Object.entries(obj)) {
    if (k === '@context' || k === '@type') continue
    if (typeof v === 'object' && v !== null) errs.push(...validateJsonLd(v, `${path}.${k}`))
  }
  return errs
}

async function main() {
  await fs.mkdir(OUT_DIR, { recursive: true })
  console.log('# Site Audit — noir-hamburg.com')
  console.log(`Started: ${new Date().toISOString()}\n`)

  const sitemapUrls = await getSitemapUrls()
  console.log(`Sitemap URLs: ${sitemapUrls.length}`)

  // Fetch each sitemap page, extract links + JSON-LD
  const pageResults = []
  const allTargets = new Map() // target URL → Set of source URLs
  const allJsonLd = [] // { page, index, parsed, errors, raw }

  console.log(`\nFetching sitemap pages…`)
  let idx = 0
  for (const url of sitemapUrls) {
    idx++
    const r = await fetchHtml(url)
    pageResults.push(r)
    if (r.html) {
      const links = extractLinks(r.html, url)
      for (const t of links) {
        if (!allTargets.has(t)) allTargets.set(t, new Set())
        allTargets.get(t).add(url)
      }
      const jsonLds = extractJsonLd(r.html, url)
      allJsonLd.push(...jsonLds)
    }
    if (idx % 20 === 0) console.log(`  ${idx}/${sitemapUrls.length} pages fetched`)
    // Be gentle with the origin
    if (idx % 10 === 0) await sleep(100)
  }
  console.log(`  Done. Total pages fetched: ${pageResults.length}`)
  console.log(`  Total unique link targets found: ${allTargets.size}`)
  console.log(`  Total JSON-LD blocks discovered: ${allJsonLd.length}`)

  // Also test every sitemap URL itself for status
  const sitemapStatus = new Map(pageResults.map(r => [r.url, r.status]))

  // Now test every unique target for HTTP status (only those not already tested)
  const untested = [...allTargets.keys()].filter(u => !sitemapStatus.has(u))
  console.log(`\nTesting ${untested.length} additional link targets (not in sitemap)…`)
  const targetStatus = new Map(sitemapStatus)
  let ti = 0
  for (const t of untested) {
    ti++
    const r = await fetchHtml(t)
    targetStatus.set(t, r.status)
    if (r.status >= 400 || r.status < 0) console.log(`  ❌ ${r.status}  ${t}`)
    if (ti % 20 === 0) console.log(`  ${ti}/${untested.length} tested`)
    if (ti % 5 === 0) await sleep(50)
  }
  console.log(`  Done.`)

  // Report broken targets
  const broken = []
  for (const [t, status] of targetStatus) {
    if (status >= 400 || status < 0) broken.push({ target: t, status, sources: [...(allTargets.get(t) || [])] })
  }
  const brokenReport = broken.sort((a, b) => (b.sources.length || 0) - (a.sources.length || 0))
  console.log(`\n### BROKEN LINK TARGETS (${broken.length}) ###`)
  for (const b of brokenReport) {
    console.log(`\n[${b.status}]  ${b.target}`)
    console.log(`  Linked from ${b.sources.length} source page(s):`)
    for (const s of b.sources.slice(0, 30)) console.log(`    • ${s}`)
  }

  // Also print sitemap-page statuses that aren't 200
  console.log(`\n### SITEMAP PAGES WITH NON-200 STATUS ###`)
  for (const r of pageResults) if (r.status !== 200) console.log(`  [${r.status}]  ${r.url}`)

  // JSON-LD validation
  const invalidLd = allJsonLd.filter(b => (b.errors || []).length > 0)
  console.log(`\n### JSON-LD BLOCKS WITH ERRORS (${invalidLd.length}) ###`)
  for (const b of invalidLd) {
    console.log(`\nPAGE: ${b.page}`)
    console.log(`  block #${b.index}   @context=${b.context || '?'}   @type=${b.type || '?'}   parsed=${b.parsed}`)
    for (const e of b.errors) console.log(`  ERROR: ${e}`)
    if (!b.parsed) console.log(`  RAW (first 500 chars): ${b.raw.slice(0, 500)}`)
  }

  await fs.writeFile(`${OUT_DIR}/audit_report.json`, JSON.stringify({
    generatedAt: new Date().toISOString(),
    sitemapCount: sitemapUrls.length,
    pageCount: pageResults.length,
    uniqueTargetCount: allTargets.size,
    broken: brokenReport,
    invalidLd,
  }, null, 2))
  console.log(`\nFull JSON report: ${OUT_DIR}/audit_report.json`)
}

main().catch(e => { console.error(e); process.exit(1) })
