#!/usr/bin/env node
// Local Lighthouse — same config as lh_diagnose.mjs but points at localhost:3001
// (production build with Pass A applied)
import fs from 'node:fs/promises'
import path from 'node:path'
import { launch } from 'chrome-launcher'
import lighthouse from 'lighthouse'

const URLS = [
  'http://127.0.0.1:3001/',
  'http://127.0.0.1:3001/services/business-escort-hamburg',
  'http://127.0.0.1:3001/services/luxury-escort-hamburg',
]
const RUNS = 3
const OUT_DIR = '/app/memory/psi'
const OUT_TAG = 'passB'

async function runOnce(url, port) {
  const result = await lighthouse(url, {
    port,
    output: 'json',
    logLevel: 'error',
    onlyCategories: ['performance'],
    formFactor: 'mobile',
    screenEmulation: { mobile: true, width: 412, height: 823, deviceScaleFactor: 1.75, disabled: false },
    throttling: {
      rttMs: 150, throughputKbps: 1638.4, cpuSlowdownMultiplier: 4,
      requestLatencyMs: 562.5, downloadThroughputKbps: 1474.56, uploadThroughputKbps: 675,
    },
    emulatedUserAgent: 'Mozilla/5.0 (Linux; Android 11; moto g power (2022)) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Mobile Safari/537.36',
  })
  return result.lhr
}

function extract(lhr) {
  const a = lhr.audits || {}
  const lcpEl = a['largest-contentful-paint-element']
  const phases = (lcpEl?.details?.items || []).filter(x => x.phase)
  const lcpNode = (lcpEl?.details?.items || []).find(x => x.node)
  const snippet = lcpNode?.node?.snippet || ''
  const srcMatch = snippet.match(/src=(?:\\?"|")([^"\\]+)/)
  const lcpUrl = srcMatch?.[1] || null

  const nr = a['network-requests']?.details?.items || []
  let lcpNet = null
  if (lcpUrl) {
    const base = lcpUrl.split('?')[0]
    lcpNet = nr.find(r => (r.url || '').split('?')[0] === base) ||
             nr.find(r => (r.url || '').includes(base.split('/').pop()))
  }
  // Count high-priority image requests to verify no duplicates
  const highPriImages = nr.filter(r => (r.priority === 'High' || r.priority === 'VeryHigh') && (r.resourceType === 'Image'))
  return {
    perfScore: lhr.categories?.performance?.score,
    LCP_ms: a['largest-contentful-paint']?.numericValue,
    FCP_ms: a['first-contentful-paint']?.numericValue,
    TTFB_ms: a['server-response-time']?.numericValue,
    TBT_ms: a['total-blocking-time']?.numericValue,
    CLS: a['cumulative-layout-shift']?.numericValue,
    lcpElement: lcpNode?.node?.selector || '',
    lcpSnippetShort: snippet.slice(0, 220),
    lcpUrl,
    lcpPhases: phases.map(p => ({ phase: p.phase, timing: Math.round(p.timing), percent: p.percent })),
    lcpNet: lcpNet ? {
      url: lcpNet.url,
      transferKB: (lcpNet.transferSize / 1024).toFixed(1),
      resourceKB: (lcpNet.resourceSize / 1024).toFixed(1),
      mimeType: lcpNet.mimeType,
      priority: lcpNet.priority,
      protocol: lcpNet.protocol,
      networkStart: Math.round(lcpNet.networkRequestTime || 0),
      networkEnd: Math.round(lcpNet.networkEndTime || 0),
      networkDurMs: Math.round((lcpNet.networkEndTime || 0) - (lcpNet.networkRequestTime || 0)),
    } : null,
    highPriImageCount: highPriImages.length,
    highPriImageUrls: highPriImages.map(r => r.url.slice(0, 200)),
    prioritizeLcpImage: {
      score: a['prioritize-lcp-image']?.score,
      savingsMs: a['prioritize-lcp-image']?.details?.overallSavingsMs || 0,
    },
    usesResponsiveImages: {
      score: a['uses-responsive-images']?.score,
      display: a['uses-responsive-images']?.displayValue,
    },
  }
}

const median = arr => {
  const nums = arr.filter(n => typeof n === 'number' && !isNaN(n)).slice().sort((a,b) => a-b)
  if (!nums.length) return null
  const mid = Math.floor(nums.length / 2)
  return nums.length % 2 ? nums[mid] : (nums[mid-1] + nums[mid]) / 2
}

async function main() {
  await fs.mkdir(OUT_DIR, { recursive: true })
  const chrome = await launch({
    chromePath: '/root/bin/chromium',
    chromeFlags: ['--headless=new', '--no-sandbox', '--disable-gpu', '--disable-dev-shm-usage', '--no-first-run'],
  })
  const summary = []
  try {
    for (const url of URLS) {
      console.error(`\n=== ${url} ===`)
      const runs = []
      for (let i = 0; i < RUNS; i++) {
        try {
          console.error(`  Run ${i+1}/${RUNS}…`)
          const lhr = await runOnce(url, chrome.port)
          await fs.writeFile(path.join(OUT_DIR, `${OUT_TAG}_${encodeURIComponent(url)}_run${i+1}.json`), JSON.stringify(lhr))
          const ext = extract(lhr)
          runs.push(ext)
          console.error(`    Score=${ext.perfScore} LCP=${Math.round(ext.LCP_ms)}ms FCP=${Math.round(ext.FCP_ms)}ms TTFB=${Math.round(ext.TTFB_ms)}ms  imgKB=${ext.lcpNet?.transferKB}`)
        } catch (e) {
          console.error(`  Run ${i+1} failed: ${e.message}`)
          runs.push({ error: e.message })
        }
      }
      const valid = runs.filter(r => !r.error)
      const m = {
        perfScore: median(valid.map(r => r.perfScore)),
        LCP_ms: median(valid.map(r => r.LCP_ms)),
        FCP_ms: median(valid.map(r => r.FCP_ms)),
        TTFB_ms: median(valid.map(r => r.TTFB_ms)),
        TBT_ms: median(valid.map(r => r.TBT_ms)),
        CLS: median(valid.map(r => r.CLS)),
      }
      summary.push({ url, medianMetrics: m, runs })
    }
  } finally { await chrome.kill() }
  await fs.writeFile(path.join(OUT_DIR, `${OUT_TAG}_summary.json`), JSON.stringify(summary, null, 2))
  console.error('\n=== MEDIAN SUMMARY ===')
  for (const s of summary) {
    const m = s.medianMetrics
    console.error(`${s.url}`)
    console.error(`  Score: ${m.perfScore} | LCP: ${Math.round(m.LCP_ms)}ms | FCP: ${Math.round(m.FCP_ms)}ms | TTFB: ${Math.round(m.TTFB_ms)}ms | TBT: ${Math.round(m.TBT_ms)}ms | CLS: ${m.CLS?.toFixed(3)}`)
    const first = s.runs.find(r => !r.error)
    if (first?.lcpNet) console.error(`  LCP image: ${first.lcpNet.url}\n    ${first.lcpNet.transferKB}KB (${first.lcpNet.mimeType}) prio=${first.lcpNet.priority}, high-priority imgs=${first.highPriImageCount}`)
    if (first?.lcpPhases?.length) {
      console.error(`  Phases: ${first.lcpPhases.map(p => `${p.phase}=${p.timing}ms`).join(', ')}`)
    }
  }
}

main().catch(e => { console.error(e); process.exit(1) })
