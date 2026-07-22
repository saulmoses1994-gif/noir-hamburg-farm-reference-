#!/usr/bin/env node
import fs from 'node:fs/promises'
const scenarios = [
  ['BASELINE', 'baseline'],
  ['Pass A', 'passA'],
  ['Pass B', 'passB'],
]
const pages = [
  ['Home', 'http%3A%2F%2F127.0.0.1%3A3001%2F'],
  ['Business', 'http%3A%2F%2F127.0.0.1%3A3001%2Fservices%2Fbusiness-escort-hamburg'],
  ['Luxury', 'http%3A%2F%2F127.0.0.1%3A3001%2Fservices%2Fluxury-escort-hamburg'],
]

for (const [pName, pSlug] of pages) {
  console.log(`\n============= ${pName} =============`)
  for (const [sName, sTag] of scenarios) {
    // Use median run: parse all 3 runs, pick middle LCP
    const runs = []
    for (let i = 1; i <= 3; i++) {
      try {
        const j = JSON.parse(await fs.readFile(`/app/memory/psi/${sTag}_${pSlug}_run${i}.json`, 'utf8'))
        runs.push(j)
      } catch {}
    }
    if (!runs.length) { console.log(`  ${sName}: NO DATA`); continue }
    const sorted = runs.map(r => ({ lcp: r.audits['largest-contentful-paint'].numericValue, lhr: r }))
      .sort((a, b) => a.lcp - b.lcp)
    const mid = sorted[Math.floor(sorted.length / 2)].lhr
    const a = mid.audits
    const lcpEl = a['largest-contentful-paint-element']
    const phases = (lcpEl?.details?.items || []).filter(x => x.phase)
    const nr = a['network-requests'].details.items
    const fonts = nr.filter(r => r.resourceType === 'Font')
    const imgs = nr.filter(r => (r.resourceType === 'Image') && (r.priority === 'High' || r.priority === 'VeryHigh'))
    // Find font preloads (all fonts with priority high which start early)
    const preloadedFonts = fonts.filter(r => r.priority === 'High' && r.networkRequestTime < 200)
    console.log(`  --- ${sName} (median LCP=${Math.round(a['largest-contentful-paint'].numericValue)}ms) ---`)
    console.log(`    FCP=${Math.round(a['first-contentful-paint'].numericValue)}  TTFB=${Math.round(a['server-response-time'].numericValue)}  TBT=${Math.round(a['total-blocking-time'].numericValue)}  CLS=${a['cumulative-layout-shift'].numericValue?.toFixed(3)}`)
    if (phases.length) console.log(`    Phases: ${phases.map(p => `${p.phase}=${Math.round(p.timing)}ms`).join(' | ')}`)
    console.log(`    High-prio image reqs: ${imgs.length}`)
    for (const im of imgs) console.log(`      ${(im.transferSize/1024).toFixed(1)}KB  net=${Math.round(im.networkRequestTime)}→${Math.round(im.networkEndTime)}ms  ${im.url.slice(im.url.lastIndexOf('/')+1, im.url.lastIndexOf('/')+60)}...`)
    console.log(`    Font requests total: ${fonts.length}  |  Early (net<200ms): ${preloadedFonts.length}`)
    for (const f of fonts.slice(0, 6)) {
      const name = f.url.split('/').pop()
      console.log(`      ${f.priority.padEnd(9)} ${(f.transferSize/1024).toFixed(1).padStart(5)}KB  net=${Math.round(f.networkRequestTime)}→${Math.round(f.networkEndTime)}ms  ${name}`)
    }
  }
}
