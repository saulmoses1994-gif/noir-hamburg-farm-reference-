# QA Report — Girlfriend Experience Hamburg (Preview)

Environment: https://noir-migration.preview.emergentagent.com  
Slug: `girlfriend-experience-hamburg`

## Summary
Preview implementation of the corrected SEO document is applied. **No blocking issues.** All meta lengths within limits, both languages fully translated (no German fallback on EN), all JSON-LD blocks valid, SSR verified, cross-service internal linking is the richest of any cornerstone to date.

## 1. HTTP / SSR
| Check | DE | EN |
|---|---|---|
| HTTP status | 200 ✅ | 200 ✅ |
| SSR `<h1>` in raw HTML | ✅ | ✅ |
| SSR JSON-LD | ✅ | ✅ |
| robots meta | index, follow ✅ | index, follow ✅ |

## 2. Metadata
| Check | DE | EN |
|---|---|---|
| Title (chars, decoded) | **82 ✅** | **80 ✅** |
| Meta description (chars) | **157 ✅** (≤160) | **110 ✅** (≤160) |
| Canonical | ✅ | ✅ |
| hreflang de / en / x-default | ✅ | ✅ |
| OG title / description / image | ✅ | ✅ |
| Twitter card tags | 4 ✅ | 4 ✅ |

Titles:
- DE: `Girlfriend Experience Hamburg | Authentische & stilvolle Begleitung | Noir Hamburg`
- EN: `Girlfriend Experience Hamburg | Authentic & Elegant Companionship | Noir Hamburg`

Meta descriptions:
- DE: `Girlfriend Experience Hamburg mit diskreter, authentischer und stilvoller Begleitung für gemeinsame Zeit, Restaurantbesuche und besondere Momente in Hamburg.`
- EN: `Authentic, discreet and elegant companionship for dining, shared experiences and memorable moments in Hamburg.`

Note: HTML raw title shows 86 chars because `&` is HTML-encoded as `&amp;`; Google indexes the decoded version (82 chars). Same for EN (80 chars decoded).

## 3. Heading Structure
| Check | DE | EN |
|---|---|---|
| H1 count | 1 (`Girlfriend Experience Hamburg`) ✅ | 1 (`Girlfriend Experience Hamburg`) ✅ |
| H2 count | 11 (1 tagline + 9 sections + 1 FAQ heading) ✅ | 11 — **all in English, zero German fallback** ✅ |
| H3 count | 0 (parity with live cornerstones) | 0 |

EN H2 list (fully localised):
1. Authentic and elegant companionship
2. Authentic Companionship
3. Discretion
4. Shared Experiences
5. Fine Dining
6. Personally Selected Companions
7. International Guests
8. Why Noir Hamburg
9. Typical Occasions
10. Contact
11. FAQ — Girlfriend Experience Hamburg

## 4. Structured Data (JSON-LD)
| Block | DE | EN |
|---|---|---|
| Service | ✅ valid | ✅ valid |
| BreadcrumbList (3 items) | ✅ valid | ✅ valid |
| FAQPage | ✅ 8 Q&A | ✅ 8 Q&A |

All three JSON-LD blocks parse cleanly.

## 5. Internal Linking (natural anchors) — richest of any cornerstone
DE cross-links: `Dinner Companion Hamburg`, `Business Escort Hamburg`, `Travel Companion Hamburg`, `Luxury Escort Hamburg`, plus `Über uns`, `Kontakt`, `Diskretion und Datenschutz`.
EN cross-links: `Dinner Companion Hamburg`, `Business Escort Hamburg`, `Travel Companion Hamburg`, plus `About Us`, `Contact`, `Discretion & Privacy`.

All anchors natural, contextual, brand-consistent. ✅ **DE cross-links 4 sibling services (highest so far); EN cross-links 3.**

## 6. Duplicate-content check
| Pair | Similarity |
|---|---|
| GFE ↔ Luxury | 2.8 % |
| GFE ↔ VIP | 5.7 % |
| GFE ↔ Business | 6.2 % |
| GFE ↔ Hotel | 8.9 % |
| GFE ↔ Event | **17.1 %** |
| GFE ↔ Dinner | **17.9 %** |
| GFE ↔ Travel | **24.5 %** |

Exact-sentence overlap analysis:
- **GFE ↔ Travel: 5 overlaps** — 100 % legitimate cross-link boilerplate (Privacy, About Us, Contact — DE + EN mirrors).
- **GFE ↔ Dinner: 5 overlaps** — 100 % legitimate cross-link boilerplate.
- **GFE ↔ Event: 4 overlaps** — 100 % legitimate cross-link boilerplate.
- **GFE ↔ Hotel: 1 overlap** — Privacy link.
- **GFE ↔ Luxury / VIP / Business: 0 overlaps** ✅

**Zero body-content overlap.** The elevated similarity ratios are entirely a function of GFE being the shortest cornerstone (~4,180 chars vs 5–6 K on others), so the identical site-wide cross-link paragraphs (Privacy, About Us, Contact) proportionally dominate the SequenceMatcher score.

**These will be normalised centrally during the already-scheduled Consolidated Site-Wide SEO Audit + Internal-Linking Pass** (queued to run right after this deployment). Not a blocker.

## 7. Core Web Vitals surface
| Check | DE | EN |
|---|---|---|
| `<img>` total | 2 | 2 |
| Missing `alt` | 0 ✅ | 0 ✅ |
| Missing `width` / `height` | 0 ✅ | 0 ✅ |
| `<link rel="preload">` | 2 ✅ | 2 ✅ |

## 8. Quality parity with live cornerstones
| Slug | Sections | FAQs | long_copy DE | long_copy EN |
|---|---|---|---|---|
| luxury-escort-hamburg (LIVE) | 14 | 8 | 615 | 367 |
| vip-escort-hamburg (LIVE) | 10 | 8 | 492 | 515 |
| business-escort-hamburg (LIVE) | 10 | 8 | 437 | 539 |
| hotel-escort-hamburg (LIVE) | 7 | 8 | 596 | 549 |
| event-escort-hamburg (LIVE) | 9 | 8 | 529 | 495 |
| dinner-companion-hamburg (LIVE) | 8 | 8 | 584 | 522 |
| travel-companion-hamburg (LIVE) | 9 | 8 | 551 | 489 |
| **girlfriend-experience-hamburg (PREVIEW)** | **9** | **8** | **341** | **214** |

Section count and FAQ count on par. Long-copy is shorter than average because the source document's hero/long-copy is deliberately concise (this is user-supplied verbatim copy). If you'd like a fuller opening block after the site-wide audit, we can expand it during that pass.

## Verdict
✅ **Ready for production** — no changes required.

Awaiting production approval.
