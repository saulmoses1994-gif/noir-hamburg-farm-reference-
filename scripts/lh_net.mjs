import fs from 'node:fs/promises'
const files = [
  ['Home', '/app/memory/psi/lh_https%3A%2F%2Fnoir-hamburg.com%2F_run1.json'],
  ['Business', '/app/memory/psi/lh_https%3A%2F%2Fnoir-hamburg.com%2Fservices%2Fbusiness-escort-hamburg_run1.json'],
]
for (const [label, f] of files) {
  const lhr = JSON.parse(await fs.readFile(f, 'utf8'))
  console.log(`\n============ ${label} ============`)
  const nr = lhr.audits['network-requests'].details.items
  const early = nr.filter(r => r.networkRequestTime < 2500).sort((a,b) => a.networkRequestTime - b.networkRequestTime)
  for (const r of early.slice(0, 18)) {
    const dur = Math.round((r.networkEndTime||0) - (r.networkRequestTime||0))
    console.log(`  ${String(Math.round(r.networkRequestTime)).padStart(5)}→${String(Math.round(r.networkEndTime)).padStart(5)}ms (dur ${String(dur).padStart(4)}ms) prio=${(r.priority||'').padEnd(9)} ${(r.resourceType||'').padEnd(11)} ${(r.mimeType||'').padEnd(22)} ${(r.url||'').slice(0, 140)}`)
  }
}
