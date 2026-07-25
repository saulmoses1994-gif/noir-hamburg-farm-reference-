// Migration helper: convert a plain-text blog body into a structured
// (Markdown-headings + structured FAQ array) shape.
//
// Context (2026-07-25): early articles were pasted from Word/GDocs into
// the plain textarea, so section titles like "Einleitung", "Kapitel 1 – …",
// "Fazit", "Häufig gestellte Fragen (FAQ)" arrive in the DB as ordinary
// text lines separated by `\n\n`. The FAQ block below the FAQ heading is
// a series of numbered Q/A pairs (`1. Question?\n\nAnswer\n\n2. Q\n\nA…`).
// The renderer used to emit them as <p> tags, producing a wall of text.
//
// This module extracts:
//   • Recognised heading lines → same content but with a leading `## ` so
//     `ensureFormattedHtml()` turns them into <h2> on render.
//   • The trailing FAQ section → a structured `faqs[]` array
//     ({ q, a }) that BlogDetailBody renders as the visible FAQ list AND
//     that generateMetadata emits as FAQPage JSON-LD.
//
// The function is **idempotent** and **conservative**:
//   • If the content already has HTML block tags (real HTML article),
//     returns { changed: false } — never touches authored HTML.
//   • Only recognises German section markers spelled in the specific
//     forms used by the affected article (`Einleitung`, `Kapitel N …`,
//     `Fazit`, `Häufig gestellte Fragen (FAQ)`). English pending —
//     current data doesn't need it.
//   • Only extracts FAQs that follow a `Häufig gestellte Fragen` heading.
//   • Preserves all visible content — heading text is kept verbatim; FAQ
//     Q/A text is trimmed but not otherwise modified.

const HAS_BLOCK_HTML = /<(p|h[1-6]|ul|ol|blockquote|div|pre|table|section|article|figure)\b/i

// Heading detectors. Each callback receives the trimmed line text.
// Order matters: FAQ heading must be checked before generic "Kapitel N".
const HEADING_DETECTORS = [
  // "Häufig gestellte Fragen" — with or without the "(FAQ)" suffix,
  // with or without a colon. Captures the section title exactly.
  (line) => /^H[äa]ufig\s+gestellte\s+Fragen(\s*\(FAQ\))?\s*:?\s*$/i.test(line),
  // "Einleitung" — alone on a line
  (line) => /^Einleitung\s*:?\s*$/i.test(line),
  // "Fazit" — alone on a line
  (line) => /^Fazit\s*:?\s*$/i.test(line),
  // "Kapitel N – …" (N is 1..99). Matches en-dash, em-dash, and hyphen.
  (line) => /^Kapitel\s+\d{1,2}\s*[–—-]/.test(line),
  // "Zusammenfassung" (rare but sometimes appears as section title)
  (line) => /^Zusammenfassung\s*:?\s*$/i.test(line),
]

function isHeadingLine(line) {
  return HEADING_DETECTORS.some((fn) => fn(line))
}

// FAQ Q/A parser. Input is the raw text AFTER the FAQ heading line.
// Expected shape (double-newlines shown as ⏎⏎):
//   1. Was versteht man unter …?⏎⏎
//   Antwort-Text …⏎⏎
//   2. Warum …?⏎⏎
//   Antwort-Text …⏎⏎
// Question lines start with `N.` (digits + dot + space). The answer is
// the paragraph(s) up to the next question line.
function parseFaqs(text) {
  const faqs = []
  if (!text) return faqs
  const blocks = text.split(/\n{2,}/).map((b) => b.trim()).filter(Boolean)
  let currentQ = null
  let currentA = []
  const flush = () => {
    if (currentQ) {
      faqs.push({ q: currentQ, a: currentA.join('\n\n').trim() })
    }
    currentQ = null
    currentA = []
  }
  for (const block of blocks) {
    // Numbered question: "12. Text …". Question mark not required —
    // some titles are declarative.
    const m = /^(\d{1,3})\.\s+(.+)$/s.exec(block)
    if (m) {
      flush()
      currentQ = m[2].trim()
    } else if (currentQ) {
      currentA.push(block)
    }
    // Blocks before the first numbered question are ignored (usually a
    // stray "FAQ" marker or empty line).
  }
  flush()
  // Drop malformed entries (empty question or empty answer).
  return faqs.filter((f) => f.q && f.a)
}

/**
 * @param {string} content  Raw content from DB.
 * @returns {{ changed:boolean, content:string, faqs:Array<{q:string,a:string}>|null, headingCount:number, faqCount:number }}
 */
export function reflowPlainTextArticle(content) {
  if (!content || typeof content !== 'string') {
    return { changed: false, content, faqs: null, headingCount: 0, faqCount: 0 }
  }
  // Bail out on real HTML — never rewrite authored HTML.
  if (HAS_BLOCK_HTML.test(content)) {
    return { changed: false, content, faqs: null, headingCount: 0, faqCount: 0 }
  }

  // Normalise: some legacy content has the FAQ heading joined to the
  // first numbered question by a SINGLE newline (not the double newline
  // used elsewhere). Insert an extra newline so the paragraph splitter
  // sees them as separate blocks.
  const normalised = content.replace(
    /(H[äa]ufig\s+gestellte\s+Fragen(?:\s*\(FAQ\))?\s*:?)\s*\n(?!\n)/i,
    '$1\n\n',
  )
  const paragraphs = normalised.split(/\n{2,}/).map((p) => p.trim()).filter(Boolean)
  if (paragraphs.length === 0) {
    return { changed: false, content, faqs: null, headingCount: 0, faqCount: 0 }
  }

  const outBlocks = []
  let inFaqSection = false
  let faqText = []
  let headingCount = 0

  for (const block of paragraphs) {
    if (inFaqSection) {
      faqText.push(block)
      continue
    }
    // Idempotent: block already starts with `## ` → keep as is, count it.
    if (/^#{2,4}\s/.test(block)) {
      outBlocks.push(block)
      headingCount++
      continue
    }
    if (isHeadingLine(block)) {
      // Recognised section title → prefix with `## `.
      outBlocks.push(`## ${block}`)
      headingCount++
      // Once we hit the FAQ heading, ALL following blocks belong to the
      // FAQ section and are extracted into `faqs[]` instead of kept in
      // the body.
      if (/^H[äa]ufig\s+gestellte\s+Fragen/i.test(block)) {
        inFaqSection = true
        // Do NOT push the heading itself into the body since faqs render
        // their own visible "FAQ" heading via BlogDetailBody.
        outBlocks.pop()
        headingCount--
      }
      continue
    }
    outBlocks.push(block)
  }

  const faqs = inFaqSection ? parseFaqs(faqText.join('\n\n')) : []

  const newContent = outBlocks.join('\n\n')
  const changed = newContent !== content || faqs.length > 0
  return {
    changed,
    content: newContent,
    faqs: faqs.length ? faqs : null,
    headingCount,
    faqCount: faqs.length,
  }
}
