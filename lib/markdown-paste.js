// Markdown paste helper — client-only.
//
// Called from the two content textareas (DE / EN) in BlogEditor. When
// the user pastes we look at the clipboard's `text/html` payload first
// and, if present, convert it to Markdown via `turndown` so the pasted
// document keeps its heading structure, links, bold/italic, lists and
// blockquotes. When only plain text is available (e.g. Notion export,
// Google Docs plain paste, a text file) we insert it verbatim — that
// path already handles pasted Markdown correctly because our editor
// stores raw Markdown.
//
// Two extra safety nets:
//   1. Duplicate H1 guard — if the first non-empty line is `# <Title>`
//      and matches the article's title (case-insensitive), we strip it.
//      Prevents accidentally publishing two <h1>s (SEO regression).
//   2. Sanitisation is left to the server-side `sanitize-html` allowlist
//      that already guards every write. Client just converts formats.
//
// Returns { text, replacedH1 } — `text` is the payload the caller
// should insert at the cursor.
import TurndownService from 'turndown'

let turndown = null
function service() {
  if (turndown) return turndown
  turndown = new TurndownService({
    headingStyle: 'atx',            // # H1, ## H2, ### H3
    codeBlockStyle: 'fenced',       // ``` fenced code ```
    bulletListMarker: '-',
    emDelimiter: '_',
    strongDelimiter: '**',
    linkStyle: 'inlined',           // [label](url) rather than reference-style
    linkReferenceStyle: 'full',
  })
  // Drop <script>/<style> etc. defensively; server sanitises anyway.
  turndown.remove(['script', 'style', 'iframe', 'noscript'])
  // Google Docs / Word paste often carries <b> instead of <strong>; the
  // default rules already normalise those.  Preserve <a href> — the
  // default rule inlines them as [text](href).
  return turndown
}

/**
 * Convert an arbitrary clipboard HTML fragment to Markdown.
 * Returns '' for empty/nullish input. Runs entirely client-side.
 */
export function htmlToMarkdown(html) {
  if (!html || typeof html !== 'string') return ''
  try {
    return service().turndown(html).trim()
  } catch (e) {
    // On any turndown error fall back to a naive tag-strip so we never
    // block the paste flow entirely.
    return String(html).replace(/<[^>]+>/g, '')
  }
}

/**
 * If the payload begins with `# <line>` that matches `articleTitle`
 * (case-insensitive, trimmed), strip that first line and any immediately
 * following blank line.  Returns { text, replacedH1 } so callers can
 * surface a subtle "H1 stripped" notice in the UI.
 */
export function stripDuplicateH1(text, articleTitle) {
  if (!text) return { text: '', replacedH1: false }
  const title = String(articleTitle || '').trim().toLowerCase()
  if (!title) return { text, replacedH1: false }
  const lines = text.split(/\r?\n/)
  let i = 0
  // Skip blank leading lines.
  while (i < lines.length && lines[i].trim() === '') i++
  if (i >= lines.length) return { text, replacedH1: false }
  // Match `# Heading` (ATX H1, one `#` followed by space). Setext H1
  // (===== underline) is not stripped — very rare in modern paste flows.
  const m = /^#\s+(.+?)\s*#*\s*$/.exec(lines[i])
  if (!m) return { text, replacedH1: false }
  const headingText = m[1].trim().toLowerCase()
  if (headingText !== title) return { text, replacedH1: false }
  // Drop the H1 line and any single blank line after it.
  lines.splice(i, 1)
  if (i < lines.length && lines[i].trim() === '') lines.splice(i, 1)
  return { text: lines.join('\n'), replacedH1: true }
}

/**
 * Build the final Markdown text to insert.  Called from the textarea
 * onPaste handler.  Prefers `text/html` (rich paste) then falls back
 * to `text/plain` (already-Markdown paste).  Returns `null` when the
 * clipboard has nothing usable — caller should let the browser default
 * paste behaviour happen.
 */
export function extractPasteAsMarkdown(clipboardData, { articleTitle } = {}) {
  if (!clipboardData) return null
  const html = clipboardData.getData('text/html')
  const plain = clipboardData.getData('text/plain')
  let md = ''
  if (html && html.trim()) {
    md = htmlToMarkdown(html)
  } else if (plain) {
    md = plain
  }
  if (!md) return null
  const { text, replacedH1 } = stripDuplicateH1(md, articleTitle)
  return { text, replacedH1, source: html && html.trim() ? 'html' : 'plain' }
}
