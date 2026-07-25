// HTML sanitizer for editorial CMS content. Server-only.
//
// Rationale (SEC-001, 2026-07-25 audit):
//   Blog / page / about / impressum bodies are stored verbatim in MongoDB
//   and rendered to every visitor via `dangerouslySetInnerHTML`. Although
//   the write path is `requireAdmin`-gated (single admin role today), any
//   compromised admin session or supply-chain attack against the CMS UI
//   would result in site-wide persistent XSS. Sanitizing on WRITE means
//   the DB itself is the trust boundary — every future render is safe by
//   construction, and existing stored content is upgraded on next edit.
//
// Design:
//   • Allowlist (not blocklist). Only known-safe tags/attributes survive.
//   • Preserves the tag set actually used by the site's editor (rich text
//     headings, lists, tables, quotes, code, links, images, iframes-of-
//     approved-origins).
//   • Rewrites <a> so external links get rel="noopener noreferrer" and
//     javascript: URLs are dropped.
//   • Idempotent — safe to call on already-sanitized HTML.
//   • Empty/nullish input passes through unchanged (POST bodies with
//     missing fields stay missing, not "").
import sanitizeHtmlLib from 'sanitize-html'

// Tags allowed in editorial content. Deliberately excludes <script>,
// <style>, <object>, <embed>, <form>, <input>, <link>, <meta>, <base>,
// and any SVG (SVG can host inline scripts). <iframe> is allowed only
// for a small allowlist of embed origins (see allowedIframeHostnames).
const ALLOWED_TAGS = [
  // Structure
  'p', 'br', 'hr', 'div', 'span', 'section', 'article', 'aside',
  'header', 'footer', 'main', 'nav', 'figure', 'figcaption',
  // Headings
  'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
  // Inline text
  'strong', 'em', 'b', 'i', 'u', 's', 'sub', 'sup', 'small', 'mark',
  'abbr', 'cite', 'q', 'code', 'kbd', 'samp', 'var',
  // Blocks
  'blockquote', 'pre',
  // Lists
  'ul', 'ol', 'li', 'dl', 'dt', 'dd',
  // Tables
  'table', 'thead', 'tbody', 'tfoot', 'tr', 'th', 'td', 'caption',
  'colgroup', 'col',
  // Links / media
  'a', 'img', 'picture', 'source', 'video', 'audio',
  // Embeds (further restricted by allowedIframeHostnames)
  'iframe',
]

// Attribute allowlist — the '*' key applies to every tag.
const ALLOWED_ATTRIBUTES = {
  '*': ['class', 'id', 'lang', 'dir', 'title', 'aria-label', 'aria-hidden'],
  a: ['href', 'name', 'target', 'rel', 'download'],
  img: [
    'src', 'srcset', 'sizes', 'alt', 'width', 'height',
    'loading', 'decoding', 'fetchpriority',
  ],
  source: ['src', 'srcset', 'sizes', 'type', 'media'],
  video: ['src', 'controls', 'poster', 'width', 'height', 'loop', 'muted', 'playsinline'],
  audio: ['src', 'controls', 'loop', 'muted'],
  iframe: [
    'src', 'width', 'height', 'title', 'allow', 'allowfullscreen',
    'loading', 'referrerpolicy', 'sandbox',
  ],
  th: ['scope', 'colspan', 'rowspan'],
  td: ['colspan', 'rowspan'],
  ol: ['start', 'type'],
  li: ['value'],
  blockquote: ['cite'],
}

// URL schemes we accept for links + <img src>. Excludes javascript:,
// data: (except data:image, allowed only for <img>), file:, vbscript:.
const ALLOWED_SCHEMES = ['http', 'https', 'mailto', 'tel']
const ALLOWED_SCHEMES_BY_TAG = {
  img: ['http', 'https', 'data'], // data: URIs only for <img> (inline previews)
  source: ['http', 'https', 'data'],
}

// Only these iframe origins are permitted — everything else is stripped.
// Extend as needed when the editorial team adds new legitimate embeds.
const ALLOWED_IFRAME_HOSTNAMES = [
  'www.youtube.com', 'youtube.com', 'youtube-nocookie.com',
  'player.vimeo.com',
  'open.spotify.com',
  'www.google.com', // maps embed
]

const BASE_OPTIONS = {
  allowedTags: ALLOWED_TAGS,
  allowedAttributes: ALLOWED_ATTRIBUTES,
  allowedSchemes: ALLOWED_SCHEMES,
  allowedSchemesByTag: ALLOWED_SCHEMES_BY_TAG,
  allowedSchemesAppliedToAttributes: ['href', 'src', 'cite'],
  allowProtocolRelative: true,
  allowedIframeHostnames: ALLOWED_IFRAME_HOSTNAMES,
  // Force safe attributes on external <a> tags. Also drop any javascript:
  // href that somehow slipped past the scheme allowlist.
  transformTags: {
    a: (tagName, attribs) => {
      const out = { ...attribs }
      const href = String(out.href || '').trim()
      if (/^\s*javascript:/i.test(href) || /^\s*vbscript:/i.test(href)) {
        delete out.href
      }
      // If target=_blank, guarantee rel includes noopener noreferrer.
      const target = String(out.target || '').toLowerCase()
      if (target === '_blank') {
        const existing = String(out.rel || '').toLowerCase().split(/\s+/).filter(Boolean)
        for (const need of ['noopener', 'noreferrer']) {
          if (!existing.includes(need)) existing.push(need)
        }
        out.rel = existing.join(' ')
      }
      return { tagName, attribs: out }
    },
    // Strip inline event handlers and style="" that could contain
    // `expression()` / CSS-based data exfiltration. Style is dropped
    // wholesale — designers can express layout via classes.
    '*': (tagName, attribs) => {
      const out = {}
      for (const [k, v] of Object.entries(attribs)) {
        const key = k.toLowerCase()
        if (key.startsWith('on')) continue // onclick, onerror, onload, ...
        if (key === 'style') continue      // no inline styles
        out[k] = v
      }
      return { tagName, attribs: out }
    },
  },
}

/**
 * Sanitize a single HTML string. Returns '' for nullish input.
 * Idempotent: sanitize(sanitize(x)) === sanitize(x).
 */
export function sanitizeHtml(html) {
  if (html == null) return html                 // preserve null/undefined semantics
  if (typeof html !== 'string') return ''
  if (html.length === 0) return ''
  return sanitizeHtmlLib(html, BASE_OPTIONS)
}

/**
 * In-place sanitize a set of HTML fields on an object. Only touches keys
 * that actually exist on the object (so PATCH-style updates stay minimal).
 * Non-string values (null/undefined/arrays) pass through untouched.
 *
 * Usage:
 *   sanitizeFields(body, ['content', 'content_en', 'intro', 'intro_en'])
 */
export function sanitizeFields(obj, fields) {
  if (!obj || typeof obj !== 'object') return obj
  for (const f of fields) {
    if (f in obj && typeof obj[f] === 'string' && obj[f].length > 0) {
      obj[f] = sanitizeHtml(obj[f])
    }
  }
  return obj
}
