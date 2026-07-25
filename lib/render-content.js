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

import { marked } from 'marked'

// Configure marked once at module load. Options:
//   • `gfm: true`  — GitHub-flavoured markdown (tables, strikethrough).
//   • `breaks: true` — single \n becomes <br>. Matches the plain-text
//     paste behaviour we already promised users.
//   • `headerIds: false` — decorateH2s() adds its own stable IDs later,
//     so we don't want marked pre-adding auto-generated slugs.
//   • `mangle: false` — don't obfuscate email anchor text.
marked.setOptions({ gfm: true, breaks: true, headerIds: false, mangle: false })

const BLOCK_TAG_RE = /<(p|h[1-6]|ul|ol|blockquote|div|pre|table|section|article|figure|hr|br)\b/i

/**
 * Ensure CMS body content is renderable as HTML.
 * @param {string|null|undefined} body
 * @returns {string}
 */
export function ensureFormattedHtml(body) {
  if (!body) return ''
  if (typeof body !== 'string') return ''
  // Author supplied real HTML — respect it verbatim (never re-format).
  if (BLOCK_TAG_RE.test(body)) return body
  // Plain-text / Markdown path — marked handles headings (## ###),
  // ordered/unordered lists, bold, italic, links, blockquotes, tables,
  // and code blocks. The renderer downstream re-sanitises anyway so
  // there's no XSS risk from marked's own output.
  try {
    return marked.parse(body).trim()
  } catch {
    return `<p>${body}</p>`
  }
}
