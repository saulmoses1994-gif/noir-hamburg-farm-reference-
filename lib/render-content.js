// Render-time helper for CMS content bodies.
//
// Context (2026-07-25): the site historically shipped CMS content as
// raw HTML rendered via `dangerouslySetInnerHTML`. Editors sometimes
// paste PLAIN TEXT (from Word/GDocs) into the textarea; the DB then
// stores content with paragraph-separators as `\n\n` and no `<p>` tags.
// The old code rendered that as a single wall of text.
//
// This helper is defensive: it inspects the string and:
//   • Returns unchanged if any block-level HTML tag exists (author's
//     intent must win — never re-format authored HTML).
//   • Otherwise treats the string as plain text: HTML-escapes it,
//     splits on paragraph gaps (`\n{2,}`), wraps each in <p>…</p>,
//     converts single line breaks inside a paragraph to <br>.
//
// The helper is IDEMPOTENT: run it twice, you get the same output.
// Safe to run on every render (input is trusted-authored content;
// server-side sanitizeHtml already ran at write time on new posts).

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
 * Ensure CMS body content is renderable as HTML.
 * @param {string|null|undefined} body
 * @returns {string}
 */
export function ensureFormattedHtml(body) {
  if (!body) return ''
  if (typeof body !== 'string') return ''
  // Author supplied real HTML — respect it verbatim.
  if (BLOCK_TAG_RE.test(body)) return body
  // Plain-text path.
  const paragraphs = body
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean)
  if (paragraphs.length === 0) return ''
  return paragraphs
    .map((p) => `<p>${escapeHtml(p).replace(/\n/g, '<br />')}</p>`)
    .join('\n')
}
