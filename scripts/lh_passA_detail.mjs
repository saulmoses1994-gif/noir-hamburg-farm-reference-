#!/usr/bin/env node
import fs from 'node:fs/promises'
const files = [
  ['Home', '/app/memory/psi/passA_http%3A%2F%2F127.0.0.1%3A3001%2F_run3.json'],
  ['Business', '/app/memory/psi/passA_http%3A%2F%2F127.0.0.1%3A3001%2Fservices%2Fbusiness-escort-hamburg_run3.json'],
  ['Luxury', '/app/memory/psi/passA_http%3A%2F%2F127.0.0.1%3A3001%2Fservices%2Fluxury-escort-hamburg_run3.json'],
]
for (const [label, f] of files) {
  const lhr = JSON.parse(await fs.readFile(f, 'utf8'))
  console.log(`\n=== ${label} ===`)
  const lcpEl = lhr.audits['largest-contentful-paint-element']
  const items = lcpEl?.details?.items || []
  const node = items.find(x => x.node)?.node
  const phases = items.filter(x => x.phase)
  console.log(`LCP display: ${lcpEl?.displayValue}  |  Selector: ${node?.selector}`)
  console.log(`Snippet: ${(node?.snippet || '').slice(0, 400)}`)
  console.log(`\nPhases:`)
  for (const p of phases) console.log(`  ${p.phase.padEnd(22)} ${Math.round(p.timing).toString().padStart(6)}ms  (${p.percent})`)
  const nr = lhr.audits['network-requests'].details.items
  // find cloudinary image requests
  const imgs = nr.filter(r => (r.resourceType === 'Image') && (r.url || '').includes('cloudinary'))
  console.log(`\nCloudinary IMAGE requests (${imgs.length}):`)
  for (const r of imgs) {
    console.log(`  prio=${r.priority.padEnd(8)} ${(r.transferSize/1024).toFixed(1)}KB  net=${Math.round(r.networkRequestTime)}→${Math.round(r.networkEndTime)}ms (${Math.round(r.networkEndTime - r.networkRequestTime)}ms)`)
    console.log(`     ${r.url.slice(0, 200)}`)
  }
  // fonts
  const fonts = nr.filter(r => (r.resourceType || '') === 'Font')
  console.log(`\nFont requests (${fonts.length}): starts at ${fonts.length ? Math.round(Math.min(...fonts.map(r => r.networkRequestTime))) : '-'}ms`)
  // prioritize-lcp-image
  const pri = lhr.audits['prioritize-lcp-image']
  console.log(`\nprioritize-lcp-image: score=${pri?.score} savings=${pri?.details?.overallSavingsMs || 0}ms`)
}
