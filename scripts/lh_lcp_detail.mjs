#!/usr/bin/env node
// Extract exact LCP element + phases + resource for each page (from run 1).
import fs from 'node:fs/promises'
const files = [
  ['Home', '/app/memory/psi/lh_https%3A%2F%2Fnoir-hamburg.com%2F_run1.json'],
  ['Business', '/app/memory/psi/lh_https%3A%2F%2Fnoir-hamburg.com%2Fservices%2Fbusiness-escort-hamburg_run1.json'],
  ['Luxury', '/app/memory/psi/lh_https%3A%2F%2Fnoir-hamburg.com%2Fservices%2Fluxury-escort-hamburg_run1.json'],
]
for (const [label, f] of files) {
  const lhr = JSON.parse(await fs.readFile(f, 'utf8'))
  console.log(`\n============ ${label} ============`)
  const lcpEl = lhr.audits['largest-contentful-paint-element']
  console.log(`--- largest-contentful-paint-element ---`)
  console.log(`displayValue: ${lcpEl?.displayValue}`)
  console.log(`details.type: ${lcpEl?.details?.type}`)
  const items = lcpEl?.details?.items || []
  console.log(`item count: ${items.length}`)
  for (let i = 0; i < items.length; i++) {
    console.log(`\n--- ITEM ${i} ---`)
    console.log(JSON.stringify(items[i], null, 2).slice(0, 2000))
  }
  // Also LCP breakdown from lcp-phases audit
  const phasesAudit = lhr.audits['largest-contentful-paint-element']
  // The real phases live in `lcp-lazy-loaded` or the item with subItems
  const phaseAudit = lhr.audits['largest-contentful-paint']
  console.log(`\nLCP metric numericValue: ${phaseAudit?.numericValue}`)

  // 'lcp-critical-path'
  for (const key of Object.keys(lhr.audits)) {
    if (key.includes('lcp') || key.includes('largest-contentful')) {
      const a = lhr.audits[key]
      if (a?.details?.items?.length && a.details.items.some(x => x.phase)) {
        console.log(`\nAudit ${key} has phases:`)
        for (const it of a.details.items.filter(x => x.phase)) {
          console.log(`   ${it.phase.padEnd(24)} ${Math.round(it.timing)}ms`)
        }
      }
    }
  }

  // network request for LCP image
  const nr = lhr.audits['network-requests']?.details?.items || []
  const heroReqs = nr.filter(r => (r.url || '').includes('cloudinary') && (r.mimeType || '').startsWith('image')).slice(0, 5)
  console.log(`\n--- Cloudinary IMAGE REQUESTS (first 5) ---`)
  for (const r of heroReqs) {
    console.log(`  prio=${r.priority} type=${r.resourceType} mime=${r.mimeType}`)
    console.log(`    ${r.url.slice(0, 200)}`)
    console.log(`    transfer=${(r.transferSize/1024).toFixed(1)}KB net=${Math.round(r.networkRequestTime)}→${Math.round(r.networkEndTime)}ms (dur ${Math.round(r.networkEndTime - r.networkRequestTime)}ms)`)
  }

  // prioritize-lcp-image full details
  const prio = lhr.audits['prioritize-lcp-image']
  console.log(`\n--- prioritize-lcp-image ---`)
  console.log(`  score: ${prio?.score}, displayValue: ${prio?.displayValue}`)
  console.log(`  details: ${JSON.stringify(prio?.details, null, 2).slice(0, 1000)}`)

  // resource-summary
  const rs = lhr.audits['resource-summary']?.details?.items || []
  console.log(`\n--- resource-summary ---`)
  for (const it of rs) console.log(`  ${it.resourceType?.padEnd(10) || ''} count=${it.requestCount} bytes=${((it.transferSize||0)/1024).toFixed(1)}KB`)
}
