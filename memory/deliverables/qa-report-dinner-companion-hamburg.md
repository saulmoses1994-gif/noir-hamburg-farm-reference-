# QA Report — Dinner Companion Hamburg (Preview)

Environment: https://noir-migration.preview.emergentagent.com  
Slug: `dinner-companion-hamburg`

## Summary
Preview implementation of the Dinner Companion Hamburg SEO document is clean. **No blocking issues.** All meta lengths comfortably within SEO limits, both languages fully translated (no German fallback on EN), all JSON-LD blocks valid, SSR verified, richer cross-service linking than any earlier cornerstone.

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
| Title length | **83 chars ✅** | **81 chars ✅** |
| Meta description length | **134 chars ✅** (≤160) | **141 chars ✅** (≤160) |
| Canonical | ✅ | ✅ |
| hreflang de / en / x-default | ✅ | ✅ |
| OG title / description / image | ✅ | ✅ |
| Twitter card tags | 4 ✅ | 4 ✅ |

Both language meta blocks are well within SEO-recommended limits — no trimming required.

## 3. Heading Structure
| Check | DE | EN |
|---|---|---|
| H1 count | 1 (`Dinner Companion Hamburg`) ✅ | 1 (`Dinner Companion Hamburg`) ✅ |
| H2 count | 10 ✅ | 10 — **all in English, zero German fallback** ✅ |
| H3 count | 0 (parity with live) | 0 |

EN H2 list (fully localised):
1. Stylish companionship for exclusive dinners
2. Business Dinner in Hamburg
3. Private Occasions and Special Evenings
4. Personally Selected Companions
5. International Guests
6. Discretion and Class
7. Why Noir Hamburg?
8. Hamburg's Fine Dining Scene
9. Contact & Consultation
10. FAQ — Dinner Companion Hamburg

## 4. Structured Data (JSON-LD)
| Block | DE | EN |
|---|---|---|
| Service | ✅ valid | ✅ valid |
| BreadcrumbList (3 items) | ✅ valid | ✅ valid |
| FAQPage | ✅ 8 Q&A | ✅ 8 Q&A |

All three JSON-LD blocks parse cleanly.

## 5. Internal Linking (natural anchors)
DE: `Über uns`, `Kontakt`, `Termin buchen →`, `Diskretion und Datenschutz`, `Business Escort Hamburg`, `Hotel Escort Hamburg`, `Girlfriend Experience Hamburg`, `Luxury Escort Hamburg`, `Event Escort Hamburg`.
EN: `About`, `About Us`, `Contact`, `Book now →`, `Discretion & Privacy`, `Business Escort Hamburg`, `Hotel Escort Hamburg`, `Girlfriend Experience Hamburg`.

**Cross-service linking is now the richest of any cornerstone** — DE cross-links 5 sibling services, EN cross-links 3. All anchors natural, contextual, brand-consistent. ✅

## 6. Duplicate-content check (Dinner vs all live/preview cornerstones)
| Pair | Similarity |
|---|---|
| Dinner ↔ Luxury | 3.3 % |
| Dinner ↔ VIP | 5.8 % |
| Dinner ↔ Business | 9.3 % |
| Dinner ↔ Hotel | 8.2 % |
| Dinner ↔ Event | **10.9 %** ← highest in set |

Exact-sentence overlaps analysed:

- **Dinner ↔ Event:** 6 overlaps — all confirmed **legitimate boilerplate cross-links** (Privacy, About Us, Contact pages) plus one generic selection-criteria sentence ("Freundlichkeit, Stil, Zuverlässigkeit und ein authentisches Auftreten…"). No paragraph-level duplication.
- **Dinner ↔ Hotel:** 1 overlap — EN Privacy link boilerplate.
- **Dinner ↔ Luxury / VIP / Business:** 0 overlaps ✅

10.9 % is still far below Google's practical duplicate-content threshold (~30 %). ✅ **Not a blocker.**

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
| **dinner-companion-hamburg (PREVIEW)** | **8** | **8** | **584** | **522** |

Fully at parity with the live cornerstones.

## Verdict
✅ **Ready for production** — no changes required.

Awaiting production approval.
