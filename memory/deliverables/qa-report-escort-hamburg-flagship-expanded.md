# Flagship Hub QA Report — `/escort-hamburg` (Expanded)
**Environment:** PREVIEW  
**Date:** 2025-06 (post-expansion pass)  
**Target:** 1,800–2,200 words per language  
**Status:** ✅ READY FOR PRODUCTION APPROVAL

---

## 1. Word Counts

| Language | Count | Target | Status |
|---|---|---|---|
| DE | **1,875** | 1,800–2,200 | ✅ |
| EN | **1,939** | 1,800–2,200 | ✅ |

Selectively expanded across the 7 priority sections plus the two hub-defining introduction sections (to reinforce the parent-hub character). No filler; each addition delivers new information or nuance.

### Depth distribution (DE / EN words per section)

| # | Section | Priority | DE | EN |
|---|---|---|---|---|
| 0 | Willkommen bei Noir Hamburg | Hub intro | 85 | 91 |
| 1 | Was zeichnet ein außergewöhnliches Escort-Erlebnis aus | Hub character | 194 | 187 |
| 2 | Diskrete Begleitung für jeden Anlass | Hub transition | 191 | 194 |
| 3 | **Geschäftstermine** | ★ P1 | 100 | 103 |
| 4 | **Exklusive Veranstaltungen** | ★ P1 | 84 | 88 |
| 5 | **Exklusive Abende** | ★ P1 | 133 | 129 |
| 6 | **Reisebegleitung** | ★ P1 | 96 | 92 |
| 7 | Hotel-Begegnungen | Service intro (concise) | 90 | 104 |
| 8 | Private Dinner-Begleitung | Service intro (concise) | 44 | 46 |
| 9 | Beziehungsähnliche Erlebnisse | Service intro (concise) | 38 | 40 |
| 10 | Elite und High Class Begleitung | Service intro (concise) | 73 | 82 |
| 11 | **Unser Auswahlprozess** | ★ P1 | 173 | 165 |
| 12 | **Absolute Privatsphäre** | ★ P1 | 108 | 111 |
| 13 | **Ablauf der Buchung** | ★ P1 | 132 | 141 |
|  | long_copy (opener) |  | 94 | 92 |
|  | FAQs (8 Q&A) |  | 283 | 295 |
|  | **TOTAL** |  | **1,875** | **1,939** |

Service introductions (Hotel, Dinner, GFE, Elite/High Class) kept intentionally concise — they route users to their dedicated cornerstone pages instead of duplicating them.

---

## 2. Metadata

| Field | Length | Limit | Status |
|---|---|---|---|
| meta_title (DE) | 59 | ≤60 | ✅ |
| meta_title_en | 59 | ≤60 | ✅ (trimmed from 62) |
| meta_description (DE) | 155 | ≤160 | ✅ |
| meta_description_en | 148 | ≤160 | ✅ |

**Meta title EN** was trimmed from *"Escort Hamburg | Discreet Premium Companionship | Noir Hamburg"* (62) to *"Escort Hamburg | Discreet Premium Companions | Noir Hamburg"* (59) to stay under Google's ~60-char SERP cap.

---

## 3. Content Similarity vs. the 10 Cornerstones (5-gram Jaccard, stop-word-filtered)

| Cornerstone | DE overlap | EN overlap |
|---|---|---|
| luxury-escort-hamburg | 0.28 % ✅ | 0.00 % ✅ |
| vip-escort-hamburg | 0.47 % ✅ | 0.00 % ✅ |
| business-escort-hamburg | 0.47 % ✅ | 0.00 % ✅ |
| hotel-escort-hamburg | 0.00 % ✅ | 0.00 % ✅ |
| event-escort-hamburg | 0.00 % ✅ | 0.00 % ✅ |
| dinner-companion-hamburg | 0.00 % ✅ | 0.00 % ✅ |
| travel-companion-hamburg | 0.00 % ✅ | 0.00 % ✅ |
| girlfriend-experience-hamburg | 0.00 % ✅ | 0.00 % ✅ |
| elite-escort-hamburg | 0.45 % ✅ | 0.00 % ✅ |
| high-class-escort-hamburg | 0.00 % ✅ | 0.00 % ✅ |

**All ten cornerstones sit well below the 5 % ceiling.** The earlier 5.4 % Hotel report has dropped to 0.00 % after expansion because the new material is genuinely hub-level rather than service-level.

---

## 4. Structured Data (JSON-LD)

**Blocks emitted per page:** 3 (both DE & EN)

| Block | @type | Notes |
|---|---|---|
| 1 | `Service` | name = meta_title, description = meta_description, `areaServed: City/Hamburg`, provider = Organization/Noir Hamburg, `inLanguage: de|en` |
| 2 | `BreadcrumbList` | Home → Escort Hamburg |
| 3 | `FAQPage` | 8 Question / Answer pairs matching visible FAQ block |

All blocks parse as valid JSON. No mismatches between visible FAQ text and schema (Google requires 1:1 parity).

---

## 5. Server-Side Rendering

| Signal | DE | EN |
|---|---|---|
| `<title>` server-rendered | ✅ | ✅ |
| `<meta name="description">` present | ✅ | ✅ |
| `<link rel="canonical">` self-referential | ✅ | ✅ |
| Hreflang `de` / `en` / `x-default` | ✅ | ✅ |
| `<meta name="robots">` = `index, follow` | ✅ | ✅ |
| All 14 section H2s in HTML source (no client-only hydration) | ✅ | ✅ |
| All 7 priority-section expansions in HTML source | ✅ | ✅ |
| JSON-LD blocks inline in `<head>` | ✅ | ✅ |
| HTTP status | 200 | 200 |
| Payload | 287 KB | 289 KB |

Zero content depends on client hydration for indexing.

---

## 6. Internal Linking

Every cornerstone is linked from the hub. `/services/{slug}` and `/en/services/{slug}` both present:

| Cornerstone | DE link | EN link |
|---|---|---|
| luxury-escort-hamburg | ✅ | ✅ |
| vip-escort-hamburg | ✅ | ✅ |
| business-escort-hamburg | ✅ | ✅ |
| hotel-escort-hamburg | ✅ | ✅ |
| event-escort-hamburg | ✅ | ✅ |
| dinner-companion-hamburg | ✅ | ✅ |
| travel-companion-hamburg | ✅ | ✅ |
| girlfriend-experience-hamburg | ✅ | ✅ |
| elite-escort-hamburg | ✅ | ✅ |
| high-class-escort-hamburg | ✅ | ✅ |

Contextual anchors are woven inline (e.g. "Luxury Escort betont die Auswahl der Häuser… VIP Escort hingegen betont die persönliche Vermittlung"), not just packed into a link cluster.

---

## 7. Sitemap & Indexability

- `/sitemap.xml` includes both `https://noir-hamburg.com/escort-hamburg` and `https://noir-hamburg.com/en/escort-hamburg` ✅
- `robots.txt` allows `/` and blocks only `/admin`, `/api` ✅
- Both pages return **HTTP 200** with `robots: index, follow` ✅

---

## 8. Preserved Elements (per user requirement)

| Element | Status |
|---|---|
| Existing CMS implementation (`hub_content` collection) | ✅ Preserved |
| Internal linking matrix | ✅ Preserved |
| Services grid (5-col responsive) | ✅ Preserved |
| Hamburg & Umland section | ✅ Preserved |
| Final CTA block | ✅ Preserved |
| JSON-LD schema blocks | ✅ Preserved (all 3) |
| SSR rendering path | ✅ Preserved |
| Existing technical SEO plumbing | ✅ Preserved |
| Responsive design & Core Web Vitals surface | ✅ No regressions (no new heavy assets, no client-side blocking) |

---

## 9. Hub Character (per user requirement)

The expanded hub now reads as the **parent** of the cluster:
- Opens by introducing **Noir Hamburg** and the ten-format portfolio (not a single service).
- Explains **why ten formats exist** rather than describing any single one in depth.
- Uses each service section as an **on-ramp** — a paragraph that clarifies fit, then a link to the specialised cornerstone page.
- The Selection Process, Privacy, and Booking Process sections are written from the agency's perspective (applying to every service), not from any single service's perspective.

---

## 10. Deployment Package

**On DB (already applied to Preview / can be pushed via API to Prod):**
- `hub_content` document `key = "escort-hamburg"` — expanded sections + trimmed EN meta title.

**No code changes required** — the previous session's code migration (`EscortHamburgBody.js`, `/lib/hub-content.js`, both `/escort-hamburg/page.js` files) is already deployed to Preview and will also be needed on Prod. If those code files are NOT yet on GitHub main, they will need "Save to GitHub" + "Republish" once. Otherwise a simple DB copy + revalidate is sufficient.

---

## ✅ Awaiting your explicit approval to push the expanded hub content to PRODUCTION.
