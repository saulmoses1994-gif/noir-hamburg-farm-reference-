// Render-time helper for CMS content bodies.
//
// Context (2026-07-25): the site historically shipped CMS content as
// raw HTML rendered via `dangerouslySetInnerHTML`. Editors sometimes
// paste PLAIN TEXT (from Word/GDocs) into the textarea; the DB then
// stores content with paragraph-separators as `\n\n` and no `<p>` tags.
// The old code rendered that as a single wall of text.
//
// Extended (2026-07-25, follow-up): the admin blog editor is a Markdown
// pane (ReactMarkdown preview). Admins expect `## Heading` to render as
// an <h2> and `### Subheading` as an <h3>. When the DB body is plain
// text we therefore ALSO detect leading `##`/`###` markers on a block
// and emit the corresponding semantic heading. Regular paragraphs stay
// as <p>. Nothing else is inferred — admins must explicitly mark
// section titles with `##` (chapter, conclusion, FAQ heading) or `###`
// (subsection). This gives editors deterministic control without
// requiring us to guess which lines are structural.
//
// This helper is defensive:
//   • Returns unchanged if the input already contains any block-level
//     HTML tag (author's intent must win).
//   • Otherwise treats the string as plain-text/Markdown-heading and
//     converts to safe HTML.
//   • Idempotent — running it twice yields the same output.

const BLOCK_TAG_RE = /<(p|h[1-6]|ul|ol|blockquote|div|pre|table|section|article|figure|hr|br)\b/i

function escapeHtml(s) {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

/**
 * Convert a single plain-text block into an HTML element.
 * Detects Markdown-style heading prefixes; falls back to <p>.
 */
function blockToHtml(block) {
  // Level-1 heading (` # `). Kept for completeness; H1 is normally
  // reserved for the page title, but we don't ban authors from using it.
  const h1 = /^# (.+)$/s.exec(block)
  if (h1) return `<h1>${escapeHtml(h1[1].trim())}</h1>`
  const h2 = /^## (.+)$/s.exec(block)
  if (h2) return `<h2>${escapeHtml(h2[1].trim())}</h2>`
  const h3 = /^### (.+)$/s.exec(block)
  if (h3) return `<h3>${escapeHtml(h3[1].trim())}</h3>`
  const h4 = /^#### (.+)$/s.exec(block)
  if (h4) return `<h4>${escapeHtml(h4[1].trim())}</h4>`
  // Default: paragraph. Single line breaks inside the block become <br />.
  return `<p>${escapeHtml(block).replace(/\n/g, '<br />')}</p>`
}

/**
 * Ensure CMS body content is renderable as HTML.
 * @param {string|null|undefined} body
 * @returns {string}
 */
export function ensureFormattedHtml(body) {
  if (!body) return ''
  if (typeof body !== 'string') return ''
  // Author supplied real HTML — respect it verbatim.
  if (BLOCK_TAG_RE.test(body)) return body
  // Plain-text / Markdown-heading path.
  const paragraphs = body
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean)
  if (paragraphs.length === 0) return ''
  return paragraphs.map(blockToHtml).join('\n')
}
