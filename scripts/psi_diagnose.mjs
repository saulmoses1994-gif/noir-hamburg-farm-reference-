#!/usr/bin/env node
// PSI API diagnostics - mobile only, 3 runs per URL, extract LCP-relevant audits.
// Usage: node scripts/psi_diagnose.mjs
import fs from 'node:fs/promises'
import path from 'node:path'

const URLS = [
  'https://noir-hamburg.com/',
  'https://noir-hamburg.com/services/business-escort-hamburg',
  'https://noir-hamburg.com/services/luxury-escort-hamburg',
]
const RUNS = 3
const STRATEGY = 'mobile'
const OUT_DIR = '/app/memory/psi'

async function runPsi(url, runIdx) {
  const endpoint = new URL('https://www.googleapis.com/pagespeedonline/v5/runPagespeed')
  endpoint.searchParams.set('url', url)
  endpoint.searchParams.set('strategy', STRATEGY)
  endpoint.searchParams.append('category', 'performance')
  const res = await fetch(endpoint, { headers: { 'Accept': 'application/json' } })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`PSI ${res.status} for ${url}: ${text.slice(0, 400)}`)
  }
  return res.json()
}

function extract(json) {
  const lh = json.lighthouseResult
  if (!lh) return { error: 'no lighthouseResult' }
  const audits = lh.audits || {}
  const perfScore = lh.categories?.performance?.score
  const lcpElement = audits['largest-contentful-paint-element']
  const lcpItems = lcpElement?.details?.items?.[0]?.items || lcpElement?.details?.items || []
  const lcpPhases = lcpElement?.details?.items?.find?.(x => x.phase) || null
  // Extract phases (Next.js style)
  const phasesItem = (lcpElement?.details?.items || []).find(x => x.timing !== undefined && x.phase) || null
  const phaseList = (lcpElement?.details?.items || []).filter(x => x.phase) || []

  const preloadLcp = audits['prioritize-lcp-image']
  const largestPaint = audits['largest-contentful-paint']
  const preloadFonts = audits['font-display']
  const uses = {
    lcpImage: audits['uses-optimized-images'],
    imgSize: audits['uses-responsive-images'],
    modernFormat: audits['modern-image-formats'],
    textCompression: audits['uses-text-compression'],
  }
  const rbr = audits['render-blocking-resources']
  const crc = audits['critical-request-chains']
  const netReq = audits['network-requests']

  return {
    perfScore,
    metrics: {
      LCP_ms: audits['largest-contentful-paint']?.numericValue,
      FCP_ms: audits['first-contentful-paint']?.numericValue,
      TTFB_ms: audits['server-response-time']?.numericValue,
      TBT_ms: audits['total-blocking-time']?.numericValue,
      CLS: audits['cumulative-layout-shift']?.numericValue,
      Speedindex_ms: audits['speed-index']?.numericValue,
      TotalByteWeight_kb: (audits['total-byte-weight']?.numericValue || 0) / 1024,
    },
    lcpElementRaw: lcpElement?.displayValue,
    lcpElementSelectors: (lcpElement?.details?.items || []).slice(0, 4),
    lcpPhases: phaseList,
    prioritizeLcpImage: preloadLcp ? {
      score: preloadLcp.score,
      displayValue: preloadLcp.displayValue,
      details: preloadLcp.details,
    } : null,
    renderBlocking: rbr ? {
      score: rbr.score,
      displayValue: rbr.displayValue,
      items: (rbr.details?.items || []).map(x => ({ url: x.url, totalBytes: x.totalBytes, wastedMs: x.wastedMs })),
    } : null,
    criticalRequestChains: crc?.details ? summarizeCRC(crc.details) : null,
    lcpNetworkRequest: findLcpNetRequest(netReq, lcpElement),
    largestContentfulPaintElement: lcpElement?.details?.items?.[0] || null,
  }
}

function summarizeCRC(details) {
  // details.chains is nested
  const flat = []
  function walk(node, depth = 0, parent = null) {
    if (!node) return
    for (const k of Object.keys(node)) {
      const child = node[k]
      const req = child.request || {}
      flat.push({ depth, url: req.url, startTime: req.startTime, endTime: req.endTime, transferSize: req.transferSize })
      if (child.children) walk(child.children, depth + 1)
    }
  }
  walk(details.chains)
  return flat.slice(0, 20)
}

function findLcpNetRequest(netReq, lcpElement) {
  if (!netReq || !lcpElement) return null
  // Try to extract URL from lcpElement snippet
  const snippet = lcpElement.details?.items?.[0]?.node?.snippet || ''
  const m = snippet.match(/src="([^"]+)"|href="([^"]+)"/)
  const candidate = m ? (m[1] || m[2]) : null
  if (!candidate) return null
  const req = (netReq.details?.items || []).find(r => (r.url || '').includes(candidate.split('?')[0].split('/').pop()))
  return req || { candidate, note: 'not found in netReq' }
}

function median(nums) {
  const arr = nums.filter(n => typeof n === 'number' && !Number.isNaN(n)).slice().sort((a, b) => a - b)
  if (!arr.length) return null
  const mid = Math.floor(arr.length / 2)
  return arr.length % 2 ? arr[mid] : (arr[mid - 1] + arr[mid]) / 2
}

async function main() {
  await fs.mkdir(OUT_DIR, { recursive: true })
  const summary = []
  for (const url of URLS) {
    console.error(`\n=== ${url} ===`)
    const runs = []
    for (let i = 0; i < RUNS; i++) {
      try {
        console.error(`  Run ${i + 1}/${RUNS}…`)
        const json = await runPsi(url, i)
        const rawFile = path.join(OUT_DIR, `${encodeURIComponent(url)}_run${i + 1}.json`)
        await fs.writeFile(rawFile, JSON.stringify(json))
        const ext = extract(json)
        runs.push(ext)
        console.error(`    LCP=${Math.round(ext.metrics.LCP_ms)}ms FCP=${Math.round(ext.metrics.FCP_ms)}ms TTFB=${Math.round(ext.metrics.TTFB_ms)}ms Score=${ext.perfScore}`)
      } catch (e) {
        console.error(`  Run ${i + 1} failed: ${e.message}`)
        runs.push({ error: e.message })
      }
    }
    // Medians
    const valid = runs.filter(r => !r.error)
    const medianMetrics = {
      LCP_ms: median(valid.map(r => r.metrics.LCP_ms)),
      FCP_ms: median(valid.map(r => r.metrics.FCP_ms)),
      TTFB_ms: median(valid.map(r => r.metrics.TTFB_ms)),
      TBT_ms: median(valid.map(r => r.metrics.TBT_ms)),
      CLS: median(valid.map(r => r.metrics.CLS)),
      Speedindex_ms: median(valid.map(r => r.metrics.Speedindex_ms)),
      perfScore: median(valid.map(r => r.perfScore)),
    }
    summary.push({ url, medianMetrics, runs })
  }
  await fs.writeFile(path.join(OUT_DIR, 'summary.json'), JSON.stringify(summary, null, 2))
  console.error('\n=== MEDIAN SUMMARY ===')
  for (const s of summary) {
    console.error(`${s.url}`)
    console.error(`  Score(median): ${s.medianMetrics.perfScore}`)
    console.error(`  LCP(median): ${Math.round(s.medianMetrics.LCP_ms)}ms`)
    console.error(`  FCP(median): ${Math.round(s.medianMetrics.FCP_ms)}ms`)
    console.error(`  TTFB(median): ${Math.round(s.medianMetrics.TTFB_ms)}ms`)
    console.error(`  TBT(median): ${Math.round(s.medianMetrics.TBT_ms)}ms`)
    console.error(`  CLS(median): ${s.medianMetrics.CLS}`)
  }
}

main().catch(e => { console.error(e); process.exit(1) })
