# QA Report (v2 — after content expansion) — Girlfriend Experience Hamburg (Preview)

Environment: https://noir-migration.preview.emergentagent.com  
Slug: `girlfriend-experience-hamburg`

## Summary
Content expanded to full cornerstone SEO depth as requested. **No blocking issues.** Every user-supplied sentence is preserved verbatim; new material is unique GFE-specific depth (chemistry, unhurried atmosphere, personality selection lens, Hamburg-specific dining/leisure detail, curated-not-catalogue positioning). Word counts land inside the requested target windows. Cluster similarity is now the lowest of any cornerstone.

## 1. Word count (target 600–800 DE / 500–700 EN)
| Language | Words (long_copy + all section bodies) | Target | Result |
|---|---:|---:|---|
| DE | **777** | 600–800 | ✅ inside range |
| EN | **683** | 500–700 | ✅ inside range |

## 2. HTTP / SSR
| Check | DE | EN |
|---|---|---|
| HTTP status | 200 ✅ | 200 ✅ |
| SSR `<h1>` in raw HTML | ✅ | ✅ |
| SSR JSON-LD | ✅ | ✅ |
| robots meta | index, follow ✅ | index, follow ✅ |

## 3. Metadata
| Check | DE | EN |
|---|---|---|
| Title (decoded chars) | **82 ✅** | **80 ✅** |
| Meta description (chars) | **157 ✅** (≤160) | **110 ✅** (≤160) |
| Canonical | ✅ | ✅ |
| hreflang de / en / x-default | ✅ | ✅ |
| OG title / description / image | ✅ | ✅ |
| Twitter card tags | 4 ✅ | 4 ✅ |

Metadata unchanged from prior QA — already within SEO limits.

## 4. Heading Structure
| Check | DE | EN |
|---|---|---|
| H1 count | 1 ✅ | 1 ✅ |
| H2 count | 11 ✅ | 11 ✅ (**zero German fallback**) |
| H3 count | 0 (parity with live cornerstones) | 0 |

## 5. Structured Data (JSON-LD)
| Block | DE | EN |
|---|---|---|
| Service | ✅ valid | ✅ valid |
| BreadcrumbList (3 items) | ✅ valid | ✅ valid |
| FAQPage | ✅ 8 Q&A | ✅ 8 Q&A |

All three JSON-LD blocks parse cleanly. No markdown leakage.

## 6. Internal Linking (natural anchors)
- **DE cross-links 4 sibling services:** `Dinner Companion Hamburg`, `Business Escort Hamburg`, `Travel Companion Hamburg`, `Luxury Escort Hamburg` + `Über uns`, `Kontakt`, `Diskretion und Datenschutz`.
- **EN cross-links 3 sibling services:** `Dinner Companion Hamburg`, `Business Escort Hamburg`, `Travel Companion Hamburg` + `About Us`, `Contact`, `Discretion & Privacy`.

All anchor text natural, contextual, brand-consistent. ✅

## 7. Duplicate-content check — DRAMATIC IMPROVEMENT vs v1
Similarity vs live cornerstones (before → after expansion):

| Pair | Before | After | Δ |
|---|---:|---:|---:|
| GFE ↔ Luxury | 2.8 % | **2.4 %** | ↓ |
| GFE ↔ VIP | 5.7 % | **3.2 %** | ↓ |
| GFE ↔ Business | 6.2 % | **2.0 %** | ↓ |
| GFE ↔ Hotel | 8.9 % | **5.8 %** | ↓ |
| GFE ↔ Event | 17.1 % | **6.7 %** | ↓↓ |
| GFE ↔ Dinner | 17.9 % | **6.6 %** | ↓↓ |
| GFE ↔ Travel | 24.5 % | **7.3 %** | ↓↓↓ |

**All ratios now sit in the 2 – 8 % band — the tightest cluster of any cornerstone.**

Exact-sentence overlaps (before → after):

| Pair | Before | After | Note |
|---|---:|---:|---|
| GFE ↔ Luxury / VIP / Business | 0 | **0** | ✅ |
| GFE ↔ Hotel | 1 | **0** | ✅ improved |
| GFE ↔ Event | 4 | **1** | ✅ improved |
| GFE ↔ Dinner | 5 | **1** | ✅ improved |
| GFE ↔ Travel | 5 | **1** | ✅ improved |

The single remaining overlap in each of Event / Dinner / Travel is the same one boilerplate sentence — the standard "Über uns" cross-link CTA. Zero body-content overlap. This last boilerplate line will be normalised centrally during the already-filed **Consolidated Site-Wide SEO Audit + Internal-Linking Pass** immediately after this deployment.

## 8. Semantic depth added (all unique, no filler)
Themes newly introduced that are absent from other cornerstones:
- Unhurried "chemistry" positioning (evening moves at guest's rhythm, no scripted role, no polite distance).
- Selection lens — curiosity, cultural depth, humour, real listening — beyond appearance.
- Hamburg-specific micro-geography (Eppendorf → HafenCity → Neustadt → Landungsbrücken).
- Culinary scene texture — Hanseatic classics, Japanese omakase, Elbe-view Mediterranean.
- "Curated-not-catalogued" small-circle philosophy.
- Moments that "make the difference" — quiet weekends, personal milestones, avoiding a solo evening.
- Handling of anonymity across venues (private apartment / hotel restaurant / cultural venue).
- Individually written enquiry replies, no boilerplate.

Natural semantic variations & related keywords now present: `Zweisamkeit`, `Chemie`, `ungezwungen`, `Vertrautheit`, `Kuratierung`, `Feingefühl`; `chemistry`, `unhurried`, `at ease`, `curated`, `sensitivity`, `effortless conversation`, `familiarity`.

## 9. Core Web Vitals surface
| Check | DE | EN |
|---|---|---|
| `<img>` total | 2 | 2 |
| Missing `alt` | 0 ✅ | 0 ✅ |
| Missing `width` / `height` | 0 ✅ | 0 ✅ |
| `<link rel="preload">` | 2 ✅ | 2 ✅ |

Page size grew from ~178 KB → ~193 KB HTML — well within a healthy LCP budget, no CWV impact expected.

## 10. Quality parity with live cornerstones
| Slug | DE words | EN words | Sections | FAQs |
|---|---:|---:|---:|---:|
| luxury-escort-hamburg (LIVE) | 1694 | 357 | 14 | 8 |
| vip-escort-hamburg (LIVE) | 580 | 339 | 10 | 8 |
| business-escort-hamburg (LIVE) | 367 | 276 | 10 | 8 |
| hotel-escort-hamburg (LIVE) | 325 | 339 | 7 | 8 |
| event-escort-hamburg (LIVE) | 346 | 366 | 9 | 8 |
| dinner-companion-hamburg (LIVE) | 359 | 361 | 8 | 8 |
| travel-companion-hamburg (LIVE) | 358 | 394 | 9 | 8 |
| **girlfriend-experience-hamburg (PREVIEW v2)** | **777** | **683** | **9** | **8** |

Girlfriend Experience Hamburg is now the **deepest-content cornerstone** by EN word count and 2nd deepest by DE (behind only Luxury Escort's 1694). Full parity achieved as requested.

## Verdict
✅ **Ready for production** — content expansion complete, no changes required, cluster similarity drastically improved.

Awaiting production approval.
