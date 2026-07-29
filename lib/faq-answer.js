// ─────────────────────────────────────────────────────────────────────
//  Safe FAQ-answer renderer.
//
//  FAQ answers stored in the CMS may contain a *minimal* subset of
//  Markdown: paragraphs (blank lines), unordered lists (lines starting
//  with `- `), and inline internal links `[label](/path)`.
//
//  Security constraints:
//    • Link URLs MUST be relative internal paths (start with `/`).
//    • They MUST NOT be protocol-relative (`//example.com`) or contain
//      `javascript:`, `data:`, path-traversal (`..`), or a scheme.
//    • Any other markdown syntax is rendered verbatim as plain text.
//    • All plain text is passed through React → automatic HTML escaping.
//
//  Companion helper `faqAnswerPlain()` returns the text with markdown
//  syntax stripped (labels kept, URL removed) — used to populate the
//  FAQPage JSON-LD Answer.text so the schema value matches what a user
//  actually reads on the page.
// ─────────────────────────────────────────────────────────────────────
import React from 'react'

// Match [label](url). Non-greedy label, no nested brackets. URL captured raw.
const LINK_RE = /\[([^\]]+)\]\(([^)\s]+)\)/g

function isSafeInternalHref(href) {
  if (typeof href !== 'string' || href.length === 0) return false
  // Must start with a single slash, must not be protocol-relative.
  if (!href.startsWith('/') || href.startsWith('//')) return false
  // No embedded scheme / javascript: / path-traversal.
  if (/^\s*javascript:/i.test(href)) return false
  if (href.includes('..')) return false
  return true
}

// Split a line of text into an array of React nodes, converting safe
// `[label](/path)` occurrences into anchors and leaving everything else
// as plain strings.
function renderInline(text, keyPrefix) {
  const out = []
  let lastIndex = 0
  let m
  let k = 0
  LINK_RE.lastIndex = 0
  while ((m = LINK_RE.exec(text)) !== null) {
    const [full, label, href] = m
    if (m.index > lastIndex) out.push(text.slice(lastIndex, m.index))
    if (isSafeInternalHref(href)) {
      out.push(
        React.createElement(
          'a',
          {
            key: `${keyPrefix}-a-${k++}`,
            href,
            className: 'accent-text underline hover:no-underline',
          },
          label
        )
      )
    } else {
      // Unsafe / non-internal URL: leave the raw markdown as plain text.
      out.push(full)
    }
    lastIndex = m.index + full.length
  }
  if (lastIndex < text.length) out.push(text.slice(lastIndex))
  return out.length === 1 && typeof out[0] === 'string' ? out[0] : out
}

// Render a FAQ answer string into an array of React block elements
// (<p> and <ul>). Blocks are separated by blank lines. Consecutive
// lines starting with `- ` become one <ul> with <li> children.
export function renderFaqAnswer(raw) {
  const text = String(raw ?? '').replace(/\r\n?/g, '\n')
  if (!text.trim()) return null

  const blocks = []
  const lines = text.split('\n')
  let i = 0
  let bkey = 0
  while (i < lines.length) {
    const line = lines[i]
    // Blank line → block separator
    if (!line.trim()) { i++; continue }
    // Markdown H3 (### Heading) — used by service page body copy.
    // Only H3 is supported here (H1/H2 are reserved for page structure).
    const h3m = /^\s*###\s+(.+?)\s*#*\s*$/.exec(line)
    if (h3m) {
      blocks.push(
        React.createElement(
          'h3',
          {
            key: `h3-${bkey++}`,
            className: 'font-heading text-xl lg:text-2xl text-[#1A1414] mt-8 mb-3',
          },
          renderInline(h3m[1], `h3-${bkey}`)
        )
      )
      i++
      continue
    }
    // Unordered list
    if (/^\s*-\s+/.test(line)) {
      const items = []
      while (i < lines.length && /^\s*-\s+/.test(lines[i])) {
        const item = lines[i].replace(/^\s*-\s+/, '')
        items.push(
          React.createElement(
            'li',
            { key: `li-${bkey}-${items.length}` },
            renderInline(item, `li-${bkey}-${items.length}`)
          )
        )
        i++
      }
      blocks.push(
        React.createElement(
          'ul',
          { key: `ul-${bkey++}`, className: 'list-disc list-inside space-y-1 my-2' },
          items
        )
      )
      continue
    }
    // Paragraph: collect until blank line or list start
    const paraLines = [line]
    i++
    while (i < lines.length && lines[i].trim() && !/^\s*-\s+/.test(lines[i])) {
      paraLines.push(lines[i]); i++
    }
    const paraText = paraLines.join(' ')
    blocks.push(
      React.createElement(
        'p',
        { key: `p-${bkey++}`, className: 'mb-2 last:mb-0' },
        renderInline(paraText, `p-${bkey}`)
      )
    )
  }
  return blocks
}

// Plain-text projection of the answer for FAQPage JSON-LD `Answer.text`.
// Strips `[label](url)` down to just `label`, and turns list bullets
// into ", " separators so the sentence reads naturally in schema output.
export function faqAnswerPlain(raw) {
  const text = String(raw ?? '').replace(/\r\n?/g, '\n')
  // Replace safe internal links with just the label; leave unsafe intact.
  const withoutLinks = text.replace(LINK_RE, (full, label, href) =>
    isSafeInternalHref(href) ? label : full
  )
  // Turn list markers into inline separators, drop H3 markdown headings
  // (they're rendered visually but shouldn't appear in schema plain text),
  // collapse whitespace.
  return withoutLinks
    .replace(/^\s*###\s+/gm, '')
    .replace(/^\s*-\s+/gm, '')
    .replace(/\s*\n+\s*/g, ' ')
    .replace(/\s{2,}/g, ' ')
    .trim()
}
