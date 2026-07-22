#!/usr/bin/env node
// Print the detailed LCP breakdown from lh_summary.json (median run of each URL).
import fs from 'node:fs/promises'
const s = JSON.parse(await fs.readFile('/app/memory/psi/lh_summary.json', 'utf8'))
for (const page of s) {
  console.log(`\n========================================================`)
  console.log(`URL: ${page.url}`)
  console.log(`Median: Score=${page.medianMetrics.perfScore}  LCP=${Math.round(page.medianMetrics.LCP_ms)}ms  FCP=${Math.round(page.medianMetrics.FCP_ms)}ms  TTFB=${Math.round(page.medianMetrics.TTFB_ms)}ms  TBT=${Math.round(page.medianMetrics.TBT_ms)}ms`)
  // pick median run (approximate: pick the run whose LCP is closest to median)
  const target = page.medianMetrics.LCP_ms
  const valid = page.runs.filter(r => !r.error)
  const medianRun = valid.reduce((best, r) => Math.abs(r.metrics.LCP_ms - target) < Math.abs(best.metrics.LCP_ms - target) ? r : best)
  console.log(`\n--- LCP ELEMENT (from median run) ---`)
  console.log(`Selector: ${medianRun.lcp.element}`)
  console.log(`Snippet:  ${medianRun.lcp.snippet}`)
  console.log(`Resource URL: ${medianRun.lcp.url}`)
  console.log(`DOM srcSet:   ${medianRun.lcp.srcSetInDom}`)
  console.log(`\n--- LCP PHASES ---`)
  for (const p of medianRun.lcp.phases) {
    console.log(`  ${p.phase.padEnd(22)} ${Math.round(p.timing).toString().padStart(6)}ms (${p.percent?.toFixed?.(1) || p.percent}%)`)
  }
  console.log(`\n--- LCP NETWORK REQUEST ---`)
  if (medianRun.lcpNetworkRequest) {
    const r = medianRun.lcpNetworkRequest
    console.log(`  URL: ${r.url}`)
    console.log(`  Priority: ${r.priority}`)
    console.log(`  MIME: ${r.mimeType}`)
    console.log(`  Protocol: ${r.protocol}`)
    console.log(`  Transfer: ${(r.transferSize / 1024).toFixed(1)} KB`)
    console.log(`  Resource: ${(r.resourceSize / 1024).toFixed(1)} KB`)
    console.log(`  Network start→end: ${Math.round(r.networkRequestTime || r.startTime)} → ${Math.round(r.networkEndTime || r.endTime)}ms  (dur: ${Math.round((r.networkEndTime || r.endTime) - (r.networkRequestTime || r.startTime))}ms)`)
  } else {
    console.log(`  (LCP is not an image / network request not resolved)`)
  }
  console.log(`\n--- INITIAL DOCUMENT ---`)
  if (medianRun.initialDocument) {
    console.log(`  URL: ${medianRun.initialDocument.url}`)
    console.log(`  Transfer: ${(medianRun.initialDocument.transferSize / 1024).toFixed(1)} KB`)
    console.log(`  Protocol: ${medianRun.initialDocument.protocol}`)
    console.log(`  Doc endTime: ${Math.round(medianRun.initialDocument.networkEndTime)}ms`)
  }
  console.log(`\n--- prioritize-lcp-image AUDIT ---`)
  console.log(`  Score: ${medianRun.prioritizeLcpImage?.score}  |  ${medianRun.prioritizeLcpImage?.displayValue || ''}  |  Savings: ${medianRun.prioritizeLcpImage?.overallSavingsMs || 0}ms`)
  console.log(`\n--- RENDER-BLOCKING RESOURCES ---`)
  console.log(`  Score: ${medianRun.renderBlocking?.score}  |  ${medianRun.renderBlocking?.displayValue || 'ok'}`)
  for (const rb of medianRun.renderBlocking?.items || []) {
    console.log(`   • ${rb.url}  bytes=${rb.totalBytes}  wasted=${rb.wastedMs}ms`)
  }
  console.log(`\n--- uses-responsive-images ---`)
  console.log(`  Score: ${medianRun.responsiveImages?.score}  |  ${medianRun.responsiveImages?.displayValue || 'ok'}`)
  for (const it of medianRun.responsiveImages?.items || []) {
    console.log(`   • ${it.url}  wasted=${it.wastedBytes}B  total=${it.totalBytes}B`)
  }
  console.log(`\n--- modern-image-formats ---`)
  console.log(`  Score: ${medianRun.modernFormats?.score}  |  ${medianRun.modernFormats?.displayValue || 'ok'}`)
  for (const it of medianRun.modernFormats?.items || []) {
    console.log(`   • ${it.url}  wasted=${it.wastedBytes}B`)
  }
}
