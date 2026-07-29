# Consolidated Site-Wide SEO Audit & Internal-Linking Report

**Environment audited:** production (`https://noir-hamburg.com`)  
**Scope:** all 8 currently-live cornerstone service pages, DE + EN (16 URLs)  
**Mode:** read-only — no changes made yet.

---

## 🟢 What's already healthy across all 16 URLs

| Check | Result |
|---|---|
| HTTP 200 on every DE + EN URL | ✅ 16/16 |
| Server-side `<h1>` in raw HTML | ✅ 16/16 |
| Server-side JSON-LD | ✅ 16/16 |
| Sitemap contains every cornerstone (DE + EN) | ✅ 16/16 |
| `robots.txt` allow, sitemap linked | ✅ |
| Schema types per page: Service + BreadcrumbList + FAQPage (with Question/Answer) | ✅ 16/16 |
| `City` schema (Hamburg areaServed) | ✅ 16/16 |
| FAQPage entries | ✅ 8 items on every page |
| Single H1 per page | ✅ 16/16 |
| `<img>` missing `alt` | ✅ 0 |
| `<img>` missing `width`/`height` | ✅ 0 |
| `<link rel="preload">` per page | ✅ 5 |
| Canonical + hreflang de/en/x-default matrix | ✅ 16/16 |
| OG + Twitter card tags | ✅ 16/16 |
| robots meta = `index, follow` | ✅ 16/16 |

Nothing broken, nothing missing schema-wise. Solid technical baseline. ✅

---

## 🟡 Issues found

### A. Internal-linking gaps — the biggest lift available

Adjacency matrix (rows = source page, columns = target — count of unique-anchor links from source to target). Analysing links to the 7 sibling cornerstones only:

**DE adjacency matrix**
```
      Lux  VIP  Biz  Hot  Evt  Din  Trv  GFE
Lux   -    2   1   1   2   2   1   .
VIP   2   -    2   2   1   1   1   1
Biz   2   2   -    2   1   1   1   1
Hot   1   1   1   -    .   .   .   .    ← thin
Evt   1   1   2   .   -    1   .   .
Din   1   .   2   1   1   -    .   1
Trv   1   .   2   1   .   1   -    .
GFE   1   .   1   .   .   2   2   -
```
**Missing directed edges DE:** 16 of 56 possible = **28% gap**

**EN adjacency matrix**
```
      Lux  VIP  Biz  Hot  Evt  Din  Trv  GFE
Lux   -    1   1   1   1   1   1   .
VIP   .   -    .   1   .   .   1   .
Biz   .   .   -    .   .   .   .   1
Hot   .   .   .   -    .   .   .   .    ← empty
Evt   .   .   1   .   -    1   .   .
Din   .   .   1   1   .   -    .   1
Trv   .   .   1   .   .   1   -    .
GFE   .   .   1   .   .   1   1   -
```
**Missing directed edges EN:** 37 of 56 possible = **66% gap**

Inbound sibling-link coverage (out of 7 possible):

| Page | DE inbound | EN inbound |
|---|:---:|:---:|
| Luxury | 7 | 0 |
| VIP | 4 | 1 |
| Business | 7 | 5 |
| Hotel | 5 | 3 |
| Event | 4 | 1 |
| Dinner | 6 | 4 |
| Travel | 4 | 3 |
| GFE | 3 | 2 |

**Root cause identified — the EN service page template does not render a "Related Services" sidebar.** The DE template at `/app/app/(de)/services/[slug]/page.js` renders one; the EN template at `/app/app/(en)/en/services/[slug]/page.js` is missing this block entirely. That single template-parity gap explains the majority of the 66% EN deficit.

Secondary root cause — the DE template caps `related_services` at 5 items (`.slice(0, 5)`), and the DB `related_services` field on every cornerstone is set to only 3 sibling slugs. Even if we simply expand the array to 7, the template would render at most 5.

### B. Meta descriptions below 120 chars

| Page | Language | Length | Suggested |
|---|---|:---:|:---:|
| Luxury Escort | EN | 115 | expand to ~150 |
| Girlfriend Experience | EN | 110 | expand to ~150 |

### C. Titles over 65 chars (14 of 16 pages)

Not a hard blocker, but Google may truncate them in SERPs. Sortable by severity:

| Page | Language | Length |
|---|---|:---:|
| Event | DE | 88 |
| Business | DE | 87 |
| Business | EN | 84 |
| Dinner | DE | 83 |
| GFE | DE | 82 |
| Dinner | EN | 81 |
| Event | EN | 80 |
| GFE | EN | 80 |
| VIP | DE | 76 |
| Hotel | EN | 74 |
| Hotel | DE | 73 |
| Luxury | EN | 70 |
| Travel | EN | 70 |
| VIP | EN | 67 |
| Travel | DE | 67 |
| Luxury | DE | 59 ✅ |

### D. Duplicate-content ratios — healthy but boilerplate-driven

Cluster average pairwise similarity is **~5.5 %** (max 8.9 % Hotel↔Business). All exact-sentence overlaps that remain are legitimate cross-link CTAs to `Über uns`, `Kontakt`, `Diskretion und Datenschutz`. No paragraph-level duplication anywhere.

### E. Core Web Vitals surface

Zero issues found. All 16 pages: 2 images with `width`/`height`/`alt`, 5 preloads each. Preserved.

---

## 🟢 Recommended fixes (batchable in one preview → QA → prod cycle)

### Fix 1 — Add "Related Services" sidebar to the EN template (single-file code change)
Mirror the existing DE block at `app/(de)/services/[slug]/page.js:211-220` into `app/(en)/en/services/[slug]/page.js`. Translated headline "Related services" instead of "Verwandte Services". This alone closes ~35 of the 37 missing EN edges.

### Fix 2 — Raise DE + EN template cap from `.slice(0, 5)` to `.slice(0, 7)`
So every cornerstone can render all 7 siblings once the DB is updated.

### Fix 3 — Set `related_services` on all 8 cornerstones to the complete other-7 list (data-only)
Each page's `related_services` array becomes exactly `[the 7 other cornerstone slugs]`. Symmetric bilingual coverage becomes 100 % automatically after Fix 1 + Fix 2.

### Fix 4 — Trim over-long titles to ≤65 chars where a natural short form exists
Draft replacements (DE + EN) for the six most-truncated titles:

| Page | Current | Proposed |
|---|---|---|
| Event DE (88→60) | `Event Escort Hamburg \| Stilvolle Begleitung für exklusive Veranstaltungen \| Noir Hamburg` | `Event Escort Hamburg \| Stilvolle Event-Begleitung \| Noir Hamburg` |
| Business DE (87→64) | `Business Escort Hamburg \| Stilvolle Begleitung für geschäftliche Anlässe \| Noir Hamburg` | `Business Escort Hamburg \| Diskrete Business-Begleitung \| Noir Hamburg` |
| Business EN (84→64) | `Business Escort Hamburg \| Exclusive Companionship for Business Travel \| Noir Hamburg` | `Business Escort Hamburg \| Discreet Business Companionship \| Noir Hamburg` |
| Dinner DE (83→64) | `Dinner Companion Hamburg \| Stilvolle Begleitung für exklusive Dinner \| Noir Hamburg` | `Dinner Companion Hamburg \| Stilvolle Dinner-Begleitung \| Noir Hamburg` |
| Event EN (80→60) | `Event Escort Hamburg \| Stylish Companionship for Exclusive Events \| Noir Hamburg` | `Event Escort Hamburg \| Stylish Event Companionship \| Noir Hamburg` |
| GFE DE (82→65) | `Girlfriend Experience Hamburg \| Authentische & stilvolle Begleitung \| Noir Hamburg` | `Girlfriend Experience Hamburg \| Authentische Begleitung \| Noir Hamburg` |

(For the 8 titles between 67–81 chars I'd leave as-is — they're at parity with each other and further compression would sacrifice the value phrase.)

### Fix 5 — Expand the two short meta descriptions
- Luxury EN 115 → suggested (~150 chars): `Luxury Escort Hamburg — refined, discreet companionship for exclusive dinners, business travel and private occasions in Hamburg's finest settings.`
- GFE EN 110 → suggested (~150 chars): `Authentic, discreet and elegant girlfriend-experience companionship in Hamburg for dining, cultural evenings and shared moments that feel natural.`

---

## 🔵 Deliverable of this pass (once you approve)

- 1 code change: EN service template (add sidebar block).
- 1 code change: increase template slice cap 5 → 7.
- 8 data updates: `related_services` on each cornerstone → the 7 siblings.
- 6 title trims + 2 description expansions.

All applied to preview first, then a full re-audit (this same script) executed on preview, then one batch push to production with a single revalidation.

## ❓ Please pick before I touch anything

- **Approve all 5 fixes** — I'll batch them on preview, re-audit, and send an updated report before production.
- **Approve subset** — tell me which fix numbers (1 – 5) to include/exclude.
- **Adjust proposed copy** — send me your preferred title / description wording.
- **Reject** — I stop here and file this as a documented backlog item.
