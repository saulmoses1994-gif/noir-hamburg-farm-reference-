#!/usr/bin/env node
// Deep audit — checks every internal URL and records:
//   - Direct status (redirect: 'manual')
//   - If redirect: the Location target + destination status
//   - If 4xx directly: flagged as broken
import fs from 'node:fs/promises'
import { setTimeout as sleep } from 'node:timers/promises'

const ORIGIN = 'https://noir-hamburg.com'
const UA = 'Mozilla/5.0 (compatible; SEMrushBot/7~bl; +http://www.semrush.com/bot.html)'
const OUT_DIR = '/app/memory/audit'

async function getSitemapUrls() {
  const res = await fetch(`${ORIGIN}/sitemap.xml`, { headers: { 'User-Agent': UA } })
  const xml = await res.text()
  return [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => m[1])
}

async function fetchHtml(url) {
  const res = await fetch(url, { headers: { 'User-Agent': UA, 'Accept': 'text/html,*/*' }, redirect: 'follow' })
  return { url, status: res.status, finalUrl: res.url, html: res.status === 200 ? await res.text() : '' }
}

async function statusOnly(url) {
  // Do 3 tries with retry to eliminate transient
  let last
  for (let i = 0; i < 3; i++) {
    try {
      const res = await fetch(url, { headers: { 'User-Agent': UA, 'Accept': 'text/html,*/*' }, redirect: 'manual', method: 'GET' })
      last = { direct: res.status, location: res.headers.get('location') || null }
      if (res.status !== 429 && res.status !== 503 && res.status !== -1) break
    } catch (e) { last = { direct: -1, error: e.message } }
    await sleep(200)
  }
  // If it's a redirect, resolve the destination
  if (last.direct >= 300 && last.direct < 400 && last.location) {
    let dest = last.location
    if (!/^https?:\/\//.test(dest)) dest = new URL(dest, url).toString()
    try {
      const res = await fetch(dest, { headers: { 'User-Agent': UA }, redirect: 'follow' })
      last.finalUrl = res.url
      last.finalStatus = res.status
    } catch (e) { last.finalError = e.message }
  }
  return last
}

function extractLinks(html, baseUrl) {
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

async function main() {
  await fs.mkdir(OUT_DIR, { recursive: true })

  const sitemap = await getSitemapUrls()
  console.log(`Sitemap URLs: ${sitemap.length}`)

  // Collect every internal link across all sitemap pages
  const allTargets = new Map()
  console.log(`\n[1/3] Fetching sitemap pages and extracting links…`)
  for (let i = 0; i < sitemap.length; i++) {
    const r = await fetchHtml(sitemap[i])
    if (r.html) {
      const links = extractLinks(r.html, sitemap[i])
      for (const t of links) {
        if (!allTargets.has(t)) allTargets.set(t, new Set())
        allTargets.get(t).add(sitemap[i])
      }
    }
    if ((i + 1) % 25 === 0) console.log(`   ${i + 1}/${sitemap.length}`)
  }
  console.log(`   Unique link targets: ${allTargets.size}`)

  // Also include the sitemap URLs themselves in the test set
  for (const u of sitemap) if (!allTargets.has(u)) allTargets.set(u, new Set())

  console.log(`\n[2/3] Testing status of every unique URL…`)
  const results = []
  let i = 0
  for (const [url, sources] of allTargets) {
    i++
    const s = await statusOnly(url)
    results.push({ url, sources: [...sources], ...s })
    if ((i % 25) === 0) console.log(`   ${i}/${allTargets.size}`)
    if ((i % 10) === 0) await sleep(80)
  }

  // Classify
  const direct4xx = results.filter(r => r.direct >= 400 && r.direct < 500)
  const direct5xx = results.filter(r => r.direct >= 500)
  const redirects = results.filter(r => r.direct >= 300 && r.direct < 400)
  const redirectsToBroken = redirects.filter(r => r.finalStatus && (r.finalStatus >= 400))
  const ok = results.filter(r => r.direct >= 200 && r.direct < 300)

  console.log(`\n[3/3] Summary`)
  console.log(`   200 OK                : ${ok.length}`)
  console.log(`   3xx redirect          : ${redirects.length}`)
  console.log(`   3xx → final 2xx       : ${redirects.filter(r => r.finalStatus && r.finalStatus < 300).length}`)
  console.log(`   3xx → final 4xx/5xx   : ${redirectsToBroken.length}`)
  console.log(`   Direct 4xx            : ${direct4xx.length}`)
  console.log(`   Direct 5xx            : ${direct5xx.length}`)

  console.log(`\n=== DIRECT 4xx URLS ===`)
  for (const r of direct4xx) {
    console.log(`\n[${r.direct}]  ${r.url}`)
    console.log(`  linked from ${r.sources.length} source page(s)`)
    for (const s of r.sources.slice(0, 25)) console.log(`     • ${s}`)
  }

  console.log(`\n=== ALL 3xx REDIRECTS (internal links pointing to redirected URLs) ===`)
  const byTarget = new Map()
  for (const r of redirects) {
    const key = `${r.direct} → ${r.finalStatus} @ ${r.finalUrl || r.location}`
    if (!byTarget.has(key)) byTarget.set(key, [])
    byTarget.get(key).push(r)
  }
  for (const [key, arr] of byTarget) {
    console.log(`\n[ ${key} ] — ${arr.length} URLs`)
    for (const r of arr) {
      console.log(`   ${r.url}  ← ${r.sources.length} source(s)`)
    }
  }

  await fs.writeFile(`${OUT_DIR}/deep_audit.json`, JSON.stringify({
    generatedAt: new Date().toISOString(),
    counts: { ok: ok.length, redirects: redirects.length, direct4xx: direct4xx.length, direct5xx: direct5xx.length, redirectsToBroken: redirectsToBroken.length },
    direct4xx,
    redirects,
    ok: ok.length,
  }, null, 2))
  console.log(`\nFull JSON: ${OUT_DIR}/deep_audit.json`)
}

main().catch(e => { console.error(e); process.exit(1) })
