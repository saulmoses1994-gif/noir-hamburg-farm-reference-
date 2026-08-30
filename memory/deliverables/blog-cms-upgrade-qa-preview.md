# Blog CMS Upgrade — Preview QA Report

**Status:** ✅ IMPLEMENTED ON PREVIEW · ⏸ PRODUCTION UNCHANGED · Awaiting explicit approval.

---

## 1. Editor technology & storage format

| Aspect | Value |
|---|---|
| Editor component | `react-markdown` + `remark-gfm` + `rehype-raw` (existing Markdown pane, extended) |
| Storage format | Raw **Markdown** in `blog.content` / `blog.content_en` (unchanged) |
| Render pipeline | `marked` (server-side) → `sanitize-html` allowlist → HTML injected into SSR page |
| Sanitiser | `sanitize-html` allowlist (existing `lib/html-sanitize.js`) — now applied at **render** for content bodies (was applied on write, which corrupted Markdown blockquotes) |
| New paste library | `turndown@7.2.4` — clipboard `text/html` → Markdown, client-side only, added to `package.json` |

## 2. Field inventory (existed / missing)

| Field | State before | Action taken |
|---|---|---|
| `title`, `title_en` | ✅ existed | reused |
| `slug`, `slug_en` | ✅ existed | reused |
| `h1`, `h1_en` | ✅ existed | reused |
| `excerpt`, `excerpt_en` | ✅ existed | reused |
| `content`, `content_en` | ✅ existed | reused + Markdown paste handler |
| `meta_title`, `meta_title_en` | ✅ existed | reused |
| `meta_description`, `meta_description_en` | ✅ existed | reused |
| `category` | ✅ existed in CMS | reused |
| `category_en` | ✅ existed in DB, **not in CMS** | exposed |
| `tags`, `tags_en` | ✅ existed in DB, **not in CMS** | exposed via new `TagsInput` chip UI + server-side dedupe |
| `cover_image` | ✅ existed | reused |
| `faqs_de`, `faqs_en` | ✅ existed | reused (still independent per lang) |
| `published`, `created_at`, `updated_at` | ✅ existed | reused |
| **`og_title`, `og_title_en`** | ❌ missing | **added** — new whitelisted fields, editor inputs, fallback to `meta_title(_en)` |
| **`og_description`, `og_description_en`** | ❌ missing | **added** — new whitelisted fields, editor inputs, fallback to `meta_description(_en)` |
| **`cover_image_alt`, `cover_image_alt_en`** | ❌ missing | **added** — per-language ALT with non-blocking CMS warning if empty |
| **`author`** | ❌ missing (hard-coded `Noir Hamburg` in JSON-LD) | **added** — single optional string; empty → Organization fallback |
| `dateModified` | ✅ already computed from `updated_at` | no change |
| Scheduled publish/unpublish | ❌ not implemented today | **not added** (was optional, out of scope for this pass) |

## 3. Files changed

| File | Purpose |
|---|---|
| `app/api/[[...path]]/route.js` | Added 7 new fields to `BLOG_FIELDS` whitelist; removed `content*` from `HTML_FIELDS_BLOG` (stored as Markdown, not HTML); added `normalizeTagArray()` (trim/dedupe/drop-empties) applied to both POST + PUT |
| `lib/render-content.js` | `ensureFormattedHtml` now sanitises marked's HTML output with `sanitize-html`. Raw-HTML pastes are also sanitised. Safe against `<script>` / event handlers / `javascript:` URLs |
| `lib/markdown-paste.js` (new) | Client-side paste utilities: `htmlToMarkdown()`, `stripDuplicateH1()`, `extractPasteAsMarkdown()` |
| `components/admin/TagsInput.js` (new) | Chip-style tag input — Enter/comma/Tab commits, Backspace removes, comma-paste bulk-adds, case-insensitive dedupe |
| `components/admin/BlogEditor.js` | New "Klassifizierung" section with Category DE+EN, Tags DE+EN, Author. New OG title/description fields inside SEO section. Cover ALT DE+EN inputs with missing-ALT warnings. `MarkdownSplitPane` gets paste handler + duplicate-H1 warning. All new fields wired into `save()` payload |
| `lib/seo.js` | `buildMetadata()` accepts optional `ogTitle` / `ogDescription`; if provided they override the OG + Twitter meta only (SEO `<title>` / meta-description unchanged) |
| `app/(de)/blog/[slug]/page.js` | Resolves OG + cover ALT + author from post fields with graceful fallbacks |
| `app/(en)/en/blog/[slug]/page.js` | Same for EN (uses `_en` variants, falls back to DE where absent) |
| `components/public/BlogDetailBody.js` | Cover `<img alt>` uses per-language `cover_image_alt(_en)`. BlogPosting JSON-LD emits `author: Person { name }` when explicit, else Organization fallback. Emits `keywords: string[]` from tags |
| `package.json` | `turndown@^7.2.4` added |

## 4. Database / schema changes

**Zero migrations required.** All new fields are optional additions to the existing `blog` documents. Existing published articles keep working with these fields absent — fallbacks handle every case:

- Empty `og_title` → `meta_title`
- Empty `og_description` → `meta_description`
- Empty `cover_image_alt` → article `title`
- Empty `author` → Organization "Noir Hamburg" (matches historical rendering)
- Empty `tags` → JSON-LD `keywords` omitted entirely (schema stays valid)
- Empty `category_en` → falls back to `category`
- Empty `tags_en` → falls back to `tags`

## 5. How Markdown paste was implemented

Two-layer approach:

1. **`onPaste` handler on the content textarea** — captures the event, inspects `clipboardData`:
   - If `text/html` is present (Google Docs, Notion, browser rich copy) → `turndown` converts to Markdown
   - Else uses `text/plain` verbatim (already-Markdown text)
2. **Duplicate-H1 guard** — if the payload begins with `# <title>` matching the article's `title` field (case-insensitive, trimmed) it's stripped before insertion. A green banner reports what happened. If the payload begins with any other H1 (e.g. different phrasing) a yellow warning stays visible until the editor removes it.
3. **Server-side render** — Markdown is converted to HTML by `marked` on SSR, sanitised by `sanitize-html` on the way out, injected via `dangerouslySetInnerHTML`.

Supported Markdown constructs (all confirmed rendering):
| Syntax | Renders as |
|---|---|
| `# H1` | `<h1>` (**but stripped from body** — CMS article H1 comes from the title field) |
| `## H2` | `<h2>` ✓ |
| `### H3` | `<h3>` ✓ |
| `**bold**` | `<strong>` ✓ |
| `*italic*` / `_italic_` | `<em>` ✓ |
| `[label](url)` | `<a href="url">label</a>` ✓ |
| `- item` | `<ul><li>` ✓ |
| `1. item` | `<ol><li>` ✓ |
| `> quote` | `<blockquote>` ✓ |
| Raw `<h2>…</h2>` etc. | Preserved through sanitiser ✓ |
| `<script>` / `onclick=` / `javascript:` URLs | **Stripped by sanitiser** ✓ |

## 6. How links are sanitised / preserved

- `<a href>` is on the allowlist with attributes `href, name, target, rel, download`.
- `javascript:`, `vbscript:`, `file:`, `data:` (non-image) URLs are **stripped**.
- Internal `noir-hamburg.com` links keep default `same tab`, **no** `nofollow`, **no** `target="_blank"`.
- External links keep whatever `target`/`rel` the author wrote (author policy preserved).
- Round-trip: save → reopen → save again does **not** strip href (verified — no client-side re-parse of stored Markdown).

## 7. How duplicate H1 is prevented

Two safeguards:
1. **Automatic strip on paste** if pasted `# X` equals the article's title field (case-insensitive). Editor sees a green notice: *"Doppelter H1 automatisch entfernt"*.
2. **Persistent warning banner** if the stored body still begins with `# …` (any wording). Non-blocking — draft still saves — but reminds the editor to remove.

SSR verification: rendered DE test article has exactly **1 `<h1>`** in the source (the CMS-supplied one). The pasted `## Exclusive Evening…` renders as `<h2>`, not `<h1>`.

## 8. How OG fallback works

| OG field | Resolution order (per language) |
|---|---|
| `og:title` | `og_title` → `meta_title` → `resolveArticleTitle(title, meta_title)` |
| `og:description` | `og_description` → `meta_description` → `excerpt` |
| `twitter:title` | Same as `og:title` |
| `twitter:description` | Same as `og:description` |
| `og:image` | `cover_image` (existing behaviour, unchanged) |
| `og:type` | Always `article` on blog pages |
| `og:url` | Matches canonical URL (existing behaviour, unchanged) |

## 9. How Cover ALT DE/EN works

`BlogDetailBody` computes:
```js
const coverAlt = ((isEn ? post.cover_image_alt_en : post.cover_image_alt) || title).trim()
```
The `<img>` element uses `alt={coverAlt}`. Explicit ALT always overrides the title fallback so screen readers + Googlebot see meaningful text.

CMS shows a non-blocking yellow warning per language when the field is empty AND a cover image exists.

## 10. How Author works

- New optional `author` string field (single field, no per-language variant — matches how the historical Organization author was used).
- Empty → BlogPosting JSON-LD uses `Organization { name: "Noir Hamburg", url: siteBase }` (identical to pre-change output — no regression).
- Set → JSON-LD uses `Person { name: <author> }`. Same string surfaces in `<meta property="article:author">`.

## 11. How Tags work

- Two independent lists: `tags` (DE) and `tags_en` (EN).
- UI: chip input in the Klassifizierung section. Enter / comma / Tab commits; Backspace on empty removes; paste of comma-separated string bulk-imports.
- Server-side `normalizeTagArray()` on write: trims, drops empties, dedupes case-insensitively.
- Frontend: emitted in BlogPosting JSON-LD as `keywords: string[]` — DE page uses `tags`, EN uses `tags_en` (falls back to `tags` when EN empty). Also surfaced in `<meta property="article:tag">`.
- **No tag archive pages, no /tag/ routes** — as requested.

## 12. SSR HTML verification (test article `qa-test-exclusive-evening-hamburg`)

| Check | DE | EN |
|---|---|---|
| HTTP 200 | ✓ | ✓ |
| `<title>` in HTML | Exklusiver Abend Hamburg \| Noir Hamburg | Exclusive Evening Hamburg \| Noir Hamburg |
| `<meta name="description">` | ✓ | ✓ |
| `<meta name="robots">` | index,follow | index,follow |
| `<link rel="canonical">` | ✓ | ✓ |
| hreflang de + en + x-default | ✓ | ✓ |
| `<meta property="og:type" content="article">` | ✓ | ✓ |
| `<meta property="og:title">` | Exklusiver Abend Hamburg — Fine Dining & Elbphilharmonie *(custom OG title)* | Exclusive Evening Hamburg — Fine Dining & Elbphilharmonie |
| `<meta property="og:description">` | *(empty OG_desc → fallback)* Meta description DE | Meta description EN |
| `<meta property="og:url">` | matches canonical ✓ | matches canonical ✓ |
| `<meta property="og:image">` | cover_image ✓ | cover_image ✓ |
| `<meta name="twitter:title">` | matches og:title ✓ | matches og:title ✓ |
| `<meta property="article:published_time">` | ISO ✓ | ISO ✓ |
| `<meta property="article:modified_time">` | ISO ✓ | ISO ✓ |
| `<meta property="article:author">` | Sofia Marchesi | Sofia Marchesi |
| `<meta property="article:tag">` × N | 3 tags ✓ | 3 tags ✓ |
| `<h1>` count | **1** ✓ | **1** ✓ |
| `<h2>` from Markdown `##` | ✓ | ✓ |
| `<h3>` from Markdown `###` | ✓ | ✓ |
| `<strong>` from `**bold**` | ✓ | ✓ |
| `<ul><li>` from `- item` | ✓ | ✓ |
| `<blockquote>` from `> quote` | ✓ *(fixed after removing content from write-side sanitiser)* | ✓ |
| Real `<a href>` internal links (crawlable, same tab) | 2 (`/escort-hamburg`, `/services/dinner-companion-hamburg`) | 2 |
| Cover `<img alt="…">` | *"Elegantes Paar bei einem exklusiven Date in Hamburg am Abend"* | *"Elegant couple enjoying an exclusive evening date in Hamburg"* |

## 13. Structured data verification

3 JSON-LD blocks per article (both languages):

| @type | Verified |
|---|---|
| `BlogPosting` | headline, description, image, datePublished, dateModified, `author: Person { name: "Sofia Marchesi" }` (or `Organization` fallback), publisher, `inLanguage`, `articleSection: "Hamburg Lifestyle"`, `keywords: ["Exclusive Date Hamburg","Fine Dining Hamburg","Elbphilharmonie"]`, `mainEntityOfPage` |
| `BreadcrumbList` | Home → Blog → Article |
| `FAQPage` | 1 mainEntity Question (matches visible FAQ) |

**Sanitizer stress test** — pasted `<script>alert('xss')</script>` in body: `<script>` **absent** from rendered HTML ✓. Same test preserved legitimate `<h2>`, `<strong>`, `<a href>`.

## 14. DE/EN QA (from `/tmp/blog_qa.py` + `/tmp/blog_qa2.py`)

All 30 items in section AA (frontend/SSR) verified. Highlights:

- OG **fallback**: empty `og_title` → resolves to `meta_title` ✓; empty `og_description` → resolves to `meta_description` ✓
- Tags **dedupe**: sending `["A","B","A"]` → server stores `["A","B"]` ✓
- Author **fallback**: empty `author` → Organization "Noir Hamburg" in JSON-LD ✓
- Cover ALT **fallback**: no ALT set → uses article title ✓
- **No hydration warnings** (checked in Playwright console)
- **No console errors** on published article
- Mobile viewport still renders (600px probe): title, cover, body, FAQ, footer all present

## 15. Existing article regression

Sample: `die-zehn-besten-restaurants-in-hamburg-fuer-ein-unvergessliches-dinner` (DE, published).

| Signal | Result |
|---|---|
| HTTP 200 | ✓ |
| Page size | 154,558 bytes (was similar pre-change) |
| `<h1>` count | 1 ✓ (no duplicate) |
| BlogPosting JSON-LD | present ✓ |
| BlogPosting.author | `Noir Hamburg` (Organization fallback, unchanged) |
| BlogPosting.keywords | `null` (article has no tags — unchanged) |
| Metadata / canonical / hreflang | unchanged ✓ |
| Cover ALT | falls back to article title (unchanged) ✓ |

**No published article was modified.** Only the SSR renderer + metadata resolvers changed — existing rows read the same way they did before, and their output is byte-equivalent unless a field was intentionally set.

## 16. Compliance with "DO NOT" list

| Rule | Status |
|---|---|
| No new fields when existing field could be reused | ✓ (reused `tags`, `tags_en`, `category_en`) |
| No duplicate schema | ✓ (3 JSON-LD blocks — same as before) |
| No `/tag/` archive routes | ✓ |
| No changes to URLs, canonicals, hreflang, sitemap, robots | ✓ |
| No changes to homepage, service pages, /escort-hamburg, model pages | ✓ |
| No auto-rewrite of existing articles | ✓ |
| No client-only links, no button-navigation | ✓ (all internal links are real `<a href>`) |
| Server sanitisation still active | ✓ (moved to render-time for Markdown fields; still applied on write for HTML fields like `excerpt`) |

## 17. Production confirmation

**Production `https://noir-hamburg.com` has NOT been changed.** All modifications are in the preview environment only. Ten files were modified locally (plus `turndown` in `node_modules`); nothing has been pushed to GitHub / republished.

---

## ⏸ Awaiting explicit approval

Reply **"approved — deploy blog CMS"** and I'll walk you through the "Save to GitHub" + "Republish" steps to promote this to production, then run the same QA suite against `noir-hamburg.com` to confirm parity.
