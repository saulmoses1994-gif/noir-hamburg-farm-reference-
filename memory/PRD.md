# Noir Hamburg — Product Requirements Document

## Original Problem Statement
Build a premium luxury escort agency website for Hamburg metropolitan area. SEO-first architecture, dark elegant editorial aesthetic comparable to a luxury hotel website or premium fashion brand. Custom CMS, complete navigation, dedicated pages for 8 services and 18 Hamburg locations, blog with categories, model profiles, internal linking, schema.org, sitemap, robots.txt.

## Architecture
- **Frontend**: React 19 + React Router + Tailwind + Framer Motion + Sonner toasts
- **Backend**: FastAPI + Motor (async MongoDB) + JWT auth (bcrypt) + Emergent Object Storage
- **SSR/SSG**: Build-time Static Site Generation (`frontend/scripts/ssg.js`) pre-renders every SEO-critical URL into `frontend/build/<path>/index.html`. Emergent's production CDN serves those static files. Modular renderers live in `frontend/ssr/routes/*.js`, reused by preview `ssr-server.js` and build-time `ssg.js`.
- **Branding**: "Noir Hamburg" — dark obsidian theme with champagne gold accents, Cormorant Garamond + Outfit typography

## Personas
- **Primary user**: Anspruchsvoller Herr in Hamburg/Umland looking for discreet premium companionship
- **Admin**: Agency operator managing models, blog, contacts, settings, media

## Implemented (as of 2026-02)
### Luxury Escort Hamburg SEO content rewrite (2026-02-08)
- Full replacement of H1, meta title, meta description, tagline in `site.js` for `luxury-escort-hamburg`.
- 6 new editorial H2 sections + 4 FAQs in `serviceContent.js` (DE + EN).
- Rebuilt SSG (`yarn build`) so both the pre-rendered HTML AND the hydrated React bundle serve the new content.
- Verified: h1/h2/description/FAQPage JSON-LD all render on `/services/luxury-escort-hamburg`; layout unchanged.
- Backend regression: 115/115 pytest passing.

### CMS Photo Overrides — Escort Hamburg + Über uns pages (2026-02-07)
- New `escort_hamburg_image` field on `SiteSettings` for `/escort-hamburg` hero (2400×1000 landscape).
- New `about_image` field on `SiteSettings` for `/ueber-uns` editorial portrait (1200×1800 portrait).
- Admin UI: two new sections in `/admin/settings` with URL fields + live preview thumbnails.
- Public React pages (`EscortHamburg.jsx`, `About.jsx`) read via `useSettings()` with fallback chain: admin setting → SSR bootstrap (escort-hamburg only) → Pexels default.
- SSR renderers (`renderEscortHamburg`, `renderAbout`) use the settings as `ogImage`/`preloadImage`. `renderEscortHamburg` also bootstraps via `window.__NOIR_INITIAL__` to prevent hydration flash.
- `GET /api/settings` now hydrates through `SiteSettings(**doc).model_dump()` so newly-added Pydantic fields always fall back to defaults on legacy DB rows.

### Phase 1–4 SEO Overhaul (2026-02)
- **Homepage**: H1 updated to `"Luxus Escort Hamburg – Premium Begleitung mit Stil"` (EN: Premium Companionship with Style). 10 dedicated H2 sections matching SEO taxonomy (Warum eine professionelle Agentur / Luxus Escort Service / Diskretion und Privatsphäre / VIP & Business / Warum Kunden vertrauen / Models / Business Dinner Events / Stadtteile / Aktuelles / FAQ). ~1,600 words DE + EN. LocalBusiness + FAQPage JSON-LD.
- **Service pages (×8)**: Every service now 900–1,250 words with 4 extended editorial H2 sections + per-service FAQ (5 Q&A with FAQPage schema) + Related Services + Available Models + Serviced Areas blocks. Content lives in `src/data/serviceContent.js` (CommonJS, DE + EN parallel).
- **Area pages (×18)**: Every location has 2 additional body paragraphs of neighborhood-specific editorial copy + 3 area-specific FAQs (generic template with `{name}` interpolation) with FAQPage schema. Related services + nearby areas + available models internal-link blocks. Content in `src/data/areaContent.js`.
- **Model profiles**: New optional fields `personality` / `personality_en` / `availability` / `availability_en`. Backend schema updated, admin form exposes them, public detail page renders them under bio.
- **Blog**: Auto-generated Table of Contents from H2s in article content (with in-page anchors), Related Services + Related Areas + Related Models + More from the Magazine blocks. 10 new SEO-optimised Hamburg articles seeded (Luxury Hotels, Fine Dining, Nightlife, Business Travel, Weekend Guide, Discretion, Elbphilharmonie, Etiquette, Breakfast, Booking FAQ).
- **SSG dup-H1 fix**: `ssr-server.js` + `ssg.js` now strip pre-rendered `<div id="seo-content">` from the extracted React script template — otherwise the home page's SEO body was being injected into every other SSR route (extra H1, duplicate sections).
- **Perf polish**: All gallery/thumbnail images `loading="lazy"`; hero images `loading="eager"` + `fetchpriority="high"`. Every `<img>` on public pages has descriptive alt text.
- **Verification**: 130 pre-rendered static pages, 115/115 backend tests pass, `seo_uniqueness_audit.py` reports 0 issues (unique title + meta + H1 across every DE/EN URL).

### Earlier work (foundation)
- Public pages: Home, Models, ModelDetail, EscortHamburg, Services list, ServiceDetail (×8), Areas list, AreaDetail (×18), Blog list, BlogDetail, FAQ, About, Contact, 404, /p/:slug (CMS-managed landing pages, unlimited)
- Admin CMS: Login, Dashboard, Models / Blog / Pages / Contacts / Settings / Account / Media with full CRUD + image upload + sitemap widget + per-record SEO meta (DE + EN) + per-record English translation panels with status badges
- Backend endpoints: full /api/auth + /api/models + /api/blog + /api/pages + /api/contact + /api/upload + /api/files + /api/settings + /api/media + image-extended sitemap + robots
- SEO: Per-page title/meta/canonical/hreflang/OG/Twitter, Organization + WebSite JSON-LD static, BreadcrumbList JSON-LD on every detail page, LocalBusiness on Home, Article JSON-LD on blog, FAQPage on FAQ + Home + every service + every area + every model
- Bilingual DE/EN: `/en/*` mirror for every public route, `<html lang>` per SSR + client, hreflang alternates, x-default = DE, per-record `bio_en`, `title_en`, `excerpt_en`, `content_en`, `meta_title_en`, `meta_description_en`, `personality_en`, `availability_en`
- Tiered pricing on models with per-price unit selector (hour / flat / night / weekend / day)
- Security: httpOnly cookies, bleach sanitization on rich text, CSP + X-Frame-Options + Permissions-Policy, Origin/Referer check on /api/upload, honeypot on /api/contact, single-article/page slug endpoints publish-gated for non-admins, draft posts admin-gated

## SEO Architecture — LIVE + Bilingual + SSG
- **`frontend/ssr/*.js` + `frontend/scripts/ssg.js`**: 130 pre-rendered static HTML files at build time, served by the production CDN.
- **`frontend/ssr-server.js`**: Runtime SSR wrapper used in preview environments. Both share the same renderer functions and shell — no behavioural drift.
- **Verified via raw curl (no JS)**: every public route emits its own `<title>`, meta, canonical, hreflang, JSON-LD blocks, and real H1/H2/lists/links in the source HTML.
- **Cache**: 60s in-memory TTL on backend fetches inside SSR; SSG is single-shot at build time.

## Admin Credentials
- Email: admin@noir-hamburg.de
- Password: NoirAdmin2026!
- (Also stored at /app/memory/test_credentials.md)

## Backlog (Prioritized)

### P1 — High impact
- **Deploy verification**: click "Deploy" in Emergent UI, then `curl` the production URL to confirm SEO HTML is served (SSG output shipped through the static CDN). No code change needed — user action.
- **Custom domain**: wire up `noir-hamburg.de` via Entri once production deploy is verified.
- **WebP image pipeline**: on upload, convert to WebP + AVIF with responsive srcset; frontend `<picture>` fallback. Backend: Pillow on the `/api/upload` handler.
- **Rate limiting**: slowapi on `/api/auth/login` and `/api/contact`.

### P2 — Medium impact
- **Resend / SendGrid email notification** on new contact submissions.
- **Search**: full-text over models + blog (Mongo text index).
- **"Neuzugang" badge** on models added in last 30 days.
- **Newsletter capture** (double opt-in DSGVO-compliant).
- **Real phone / WhatsApp numbers** replacing placeholders (currently the Settings CMS defaults are dummies).

### Refactoring (backlog)
- Break `server.py` into `/app/backend/routes/` modules (currently ~1,100 lines in one file).
- Migrate `SERVICE_CONTENT` and `AREA_CONTENT` into MongoDB so admin can edit long-form copy without a code deploy.

## Next Action Items
1. **User verification**: click Deploy in Emergent UI → run `curl https://noir-hamburg.host/services/luxury-escort-hamburg | grep '<h1'` to confirm SEO HTML is live on production.
2. Optionally: wire custom domain `noir-hamburg.de` via Entri.
3. Consider WebP pipeline for another 10–15% mobile PageSpeed lift.
