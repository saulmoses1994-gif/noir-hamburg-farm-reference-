#!/usr/bin/env node
// Local Lighthouse diagnostics — mobile, 3 runs per URL, extracts LCP audits.
// This runs an actual Lighthouse mobile audit against production URLs, so no PSI
// quota is required.
import fs from 'node:fs/promises'
import path from 'node:path'
import { launch } from 'chrome-launcher'
import lighthouse from 'lighthouse'

const URLS = [
  'https://noir-hamburg.com/',
  'https://noir-hamburg.com/services/business-escort-hamburg',
  'https://noir-hamburg.com/services/luxury-escort-hamburg',
]
const RUNS = 3
const OUT_DIR = '/app/memory/psi'

async function runOnce(url, port) {
  // Mobile config aligned with PSI: mobile emulation, Slow 4G-ish throttling
  const result = await lighthouse(url, {
    port,
    output: 'json',
    logLevel: 'error',
    onlyCategories: ['performance'],
    formFactor: 'mobile',
    screenEmulation: {
      mobile: true,
      width: 412,
      height: 823,
      deviceScaleFactor: 1.75,
      disabled: false,
    },
    throttling: {
      rttMs: 150,
      throughputKbps: 1638.4,
      cpuSlowdownMultiplier: 4,
      requestLatencyMs: 562.5,
      downloadThroughputKbps: 1474.56,
      uploadThroughputKbps: 675,
    },
    emulatedUserAgent: 'Mozilla/5.0 (Linux; Android 11; moto g power (2022)) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Mobile Safari/537.36',
  })
  return result.lhr
}

function extract(lhr) {
  const audits = lhr.audits || {}
  const perfScore = lhr.categories?.performance?.score
  const lcpEl = audits['largest-contentful-paint-element']
  const phases = (lcpEl?.details?.items || []).filter(x => x.phase)
  const lcpNode = (lcpEl?.details?.items || []).find(x => x.node)
  const snippet = lcpNode?.node?.snippet || ''
  const nodeSelector = lcpNode?.node?.selector || ''

  // Extract LCP resource URL from snippet
  const srcMatch = snippet.match(/src=(?:\\?"|")([^"\\]+)/)
  const srcsetMatch = snippet.match(/srcset=(?:\\?"|")([^"\\]+)/i) || snippet.match(/srcSet=(?:\\?"|")([^"\\]+)/)
  const lcpUrl = srcMatch?.[1] || null
  const lcpSrcSet = srcsetMatch?.[1] || null

  const prioritizeLcp = audits['prioritize-lcp-image']
  const rbr = audits['render-blocking-resources']
  const netReqDetails = audits['network-requests']?.details?.items || []
  // Find network request matching LCP URL
  let lcpNet = null
  if (lcpUrl) {
    const base = lcpUrl.split('?')[0]
    lcpNet = netReqDetails.find(r => (r.url || '').split('?')[0] === base) ||
             netReqDetails.find(r => (r.url || '').includes(base.split('/').pop()))
  }
  const initialResp = netReqDetails.find(r => r.resourceType === 'Document')

  const usesResp = audits['uses-responsive-images']
  const modernFmt = audits['modern-image-formats']
  const optImg = audits['uses-optimized-images']
  const unsizedImg = audits['unsized-images']

  return {
    perfScore,
    metrics: {
      LCP_ms: audits['largest-contentful-paint']?.numericValue,
      FCP_ms: audits['first-contentful-paint']?.numericValue,
      TTFB_ms: audits['server-response-time']?.numericValue,
      TBT_ms: audits['total-blocking-time']?.numericValue,
      CLS: audits['cumulative-layout-shift']?.numericValue,
      SI_ms: audits['speed-index']?.numericValue,
      TotalByteWeight_kb: (audits['total-byte-weight']?.numericValue || 0) / 1024,
    },
    lcp: {
      element: nodeSelector,
      snippet: snippet.slice(0, 400),
      url: lcpUrl,
      srcSetInDom: lcpSrcSet,
      phases: phases.map(p => ({ phase: p.phase, timing: p.timing, percent: p.percent })),
    },
    lcpNetworkRequest: lcpNet ? {
      url: lcpNet.url,
      priority: lcpNet.priority,
      resourceType: lcpNet.resourceType,
      transferSize: lcpNet.transferSize,
      resourceSize: lcpNet.resourceSize,
      mimeType: lcpNet.mimeType,
      startTime: lcpNet.startTime,
      endTime: lcpNet.endTime,
      networkRequestTime: lcpNet.networkRequestTime,
      networkEndTime: lcpNet.networkEndTime,
      protocol: lcpNet.protocol,
    } : null,
    initialDocument: initialResp ? {
      url: initialResp.url,
      transferSize: initialResp.transferSize,
      networkEndTime: initialResp.networkEndTime,
      protocol: initialResp.protocol,
    } : null,
    prioritizeLcpImage: prioritizeLcp ? {
      score: prioritizeLcp.score,
      displayValue: prioritizeLcp.displayValue,
      overallSavingsMs: prioritizeLcp.details?.overallSavingsMs,
    } : null,
    renderBlocking: rbr ? {
      score: rbr.score,
      displayValue: rbr.displayValue,
      items: (rbr.details?.items || []).map(x => ({
        url: (x.url || '').slice(0, 160),
        totalBytes: x.totalBytes,
        wastedMs: x.wastedMs,
      })),
    } : null,
    responsiveImages: usesResp ? {
      score: usesResp.score,
      displayValue: usesResp.displayValue,
      items: (usesResp.details?.items || []).slice(0, 5).map(x => ({
        url: (x.url || '').slice(0, 160),
        wastedBytes: x.wastedBytes,
        totalBytes: x.totalBytes,
      })),
    } : null,
    modernFormats: modernFmt ? {
      score: modernFmt.score,
      displayValue: modernFmt.displayValue,
      items: (modernFmt.details?.items || []).slice(0, 5).map(x => ({
        url: (x.url || '').slice(0, 160),
        wastedBytes: x.wastedBytes,
        totalBytes: x.totalBytes,
      })),
    } : null,
    optImages: optImg ? {
      score: optImg.score,
      items: (optImg.details?.items || []).slice(0, 5),
    } : null,
    unsizedImages: unsizedImg?.score === null ? null : { score: unsizedImg?.score, items: (unsizedImg?.details?.items || []).slice(0, 3) },
  }
}

function median(arr) {
  const nums = arr.filter(n => typeof n === 'number' && !Number.isNaN(n)).slice().sort((a, b) => a - b)
  if (!nums.length) return null
  const mid = Math.floor(nums.length / 2)
  return nums.length % 2 ? nums[mid] : (nums[mid - 1] + nums[mid]) / 2
}

async function main() {
  await fs.mkdir(OUT_DIR, { recursive: true })
  const chromePath = process.env.CHROME_PATH || '/root/bin/chromium'
  const chrome = await launch({
    chromePath,
    chromeFlags: ['--headless=new', '--no-sandbox', '--disable-gpu', '--disable-dev-shm-usage', '--no-first-run'],
  })
  const summary = []
  try {
    for (const url of URLS) {
      console.error(`\n=== ${url} ===`)
      const runs = []
      for (let i = 0; i < RUNS; i++) {
        try {
          console.error(`  Run ${i + 1}/${RUNS}…`)
          const lhr = await runOnce(url, chrome.port)
          const rawFile = path.join(OUT_DIR, `lh_${encodeURIComponent(url)}_run${i + 1}.json`)
          await fs.writeFile(rawFile, JSON.stringify(lhr))
          const ext = extract(lhr)
          runs.push(ext)
          console.error(`    Score=${ext.perfScore} LCP=${Math.round(ext.metrics.LCP_ms)}ms FCP=${Math.round(ext.metrics.FCP_ms)}ms TTFB=${Math.round(ext.metrics.TTFB_ms)}ms TBT=${Math.round(ext.metrics.TBT_ms)}ms CLS=${ext.metrics.CLS?.toFixed(3)}`)
        } catch (e) {
          console.error(`  Run ${i + 1} failed: ${e.message}`)
          runs.push({ error: e.message })
        }
      }
      const valid = runs.filter(r => !r.error)
      const medianMetrics = {
        perfScore: median(valid.map(r => r.perfScore)),
        LCP_ms: median(valid.map(r => r.metrics?.LCP_ms)),
        FCP_ms: median(valid.map(r => r.metrics?.FCP_ms)),
        TTFB_ms: median(valid.map(r => r.metrics?.TTFB_ms)),
        TBT_ms: median(valid.map(r => r.metrics?.TBT_ms)),
        CLS: median(valid.map(r => r.metrics?.CLS)),
        SI_ms: median(valid.map(r => r.metrics?.SI_ms)),
      }
      summary.push({ url, medianMetrics, runs })
    }
  } finally {
    await chrome.kill()
  }
  const outFile = path.join(OUT_DIR, 'lh_summary.json')
  await fs.writeFile(outFile, JSON.stringify(summary, null, 2))
  console.error('\n=== MEDIAN SUMMARY ===')
  for (const s of summary) {
    const m = s.medianMetrics
    console.error(`${s.url}`)
    console.error(`  Score(median): ${m.perfScore}`)
    console.error(`  LCP(median):   ${Math.round(m.LCP_ms)}ms`)
    console.error(`  FCP(median):   ${Math.round(m.FCP_ms)}ms`)
    console.error(`  TTFB(median):  ${Math.round(m.TTFB_ms)}ms`)
    console.error(`  TBT(median):   ${Math.round(m.TBT_ms)}ms`)
    console.error(`  CLS(median):   ${m.CLS?.toFixed(3)}`)
  }
  console.error(`\nFull details: ${outFile}`)
}

main().catch(e => { console.error(e); process.exit(1) })
