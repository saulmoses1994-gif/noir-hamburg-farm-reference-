# Noir Hamburg — Product Requirements Document

## Original Problem Statement
Build a premium luxury escort agency website for Hamburg metropolitan area. SEO-first architecture, dark elegant editorial aesthetic comparable to a luxury hotel website or premium fashion brand. Custom CMS, complete navigation, dedicated pages for 8 services and 18 Hamburg locations, blog with categories, model profiles, internal linking, schema.org, sitemap, robots.txt.

## Architecture
- **Frontend**: React 19 + React Router + Tailwind + Framer Motion + Sonner toasts
- **Backend**: FastAPI + Motor (async MongoDB) + JWT auth (bcrypt) + Emergent Object Storage
- **Branding**: "Noir Hamburg" — dark obsidian theme with champagne gold accents, Cormorant Garamond + Outfit typography

## Personas
- **Primary user**: Anspruchsvoller Herr in Hamburg/Umland looking for discreet premium companionship
- **Admin**: Agency operator managing models, blog, contacts

## Implemented (2026-02 — MVP + Self-audit iterations)
- Public pages: Home, Models, ModelDetail, EscortHamburg, Services list, ServiceDetail (×8), Areas list, AreaDetail (×18), Blog list, BlogDetail, FAQ, About, Contact, 404, **/p/:slug (CMS-managed landing pages, unlimited)**
- Admin CMS: Login, Dashboard, **Models / Blog / Pages / Contacts** all with full CRUD + image upload
- Backend endpoints: full /api/auth + /api/models + /api/blog + /api/pages + /api/contact + /api/upload + /api/files + image-extended sitemap + robots
- SEO: Per-page title/meta/canonical/OG/Twitter, **Organization + WebSite JSON-LD in static HTML**, BreadcrumbList JSON-LD on every detail page, ItemList JSON-LD on /models, FAQPage JSON-LD on /faq, LocalBusiness on Home, Article JSON-LD on blog with publisher/dateModified/inLanguage/articleSection
- Performance: code-split via React.lazy (each route is its own chunk; public visitors no longer download admin code), font preconnect+preload, image preconnect, LCP hero has fetchpriority=high + width/height (no CLS), images lazy-loaded
- Accessibility: skip-to-content link, focus-visible ring on all interactive elements, prefers-reduced-motion respected, aria-label on sticky WhatsApp CTA
- Mobile UX: persistent sticky WhatsApp CTA on mobile only (conversion driver)
- Security: httpOnly cookies, no token in body, draft posts admin-gated, explicit CORS allowlist, Origin/Referer check on /api/upload (closes SEC-004), honeypot field on /api/contact (silent drop)
- Security (2026-02 audit fixes): SEC-001 — single-article/page slug endpoints now publish-gated for non-admins (drafts no longer leak); SEC-002 — bleach-sanitized admin rich-text on blog/page write + restrictive Content-Security-Policy + X-Frame-Options DENY + nosniff + Referrer-Policy + Permissions-Policy on every SSR response
- Seeded: 6 model profiles + 3 magazine-style blog posts
- Internal linking: Home → all services/locations/models/blog; service pages → related; area pages → nearby + related services + models; blog → related services + locations; CMS Pages → related services + locations
- Tested: 23/23 backend tests pass, zero frontend lint errors

## SEO Architecture — SSR LIVE + Bilingual (2026-02)
**SSR is now active, production-grade, and bilingual (DE / EN).** A custom Express server (`/app/frontend/ssr-server.js` + modular `/app/frontend/ssr/`) pre-renders every public route as real HTML before the React SPA mounts on top.

**Architecture (post 2026-02 polish + i18n):**
- `ssr-server.js` (~165 lines) — thin Express wrapper, DE + EN route tables, bundle injection
- `ssr/shell.js` — shared HTML head, lang-aware header/nav/footer/breadcrumbs, hreflang + canonical assembly
- `ssr/backend.js` — HTTP client with 60s in-memory TTL cache + stale-on-error
- `ssr/cache.js` — generic TTL memo with thundering-herd protection
- `ssr/routes/{home,models,services,areas,blog,static}.js` — per-domain renderers, each accepts `lang` param
- `src/data/site.js` — single source of truth (CommonJS) shared with React SPA
- `src/data/i18n.js` — UI chrome translations + path localization helpers, shared with React via `exports.X` named-export pattern
- `src/lib/i18n.js` — React `useI18n` hook (reads lang from URL via react-router)

**Bilingual SEO contract:**
- **`/en/...` mirror routes** for every public page (option 1a chosen by user)
- Per-page `<link rel="canonical">` always points to the current-language URL
- `<link rel="alternate" hreflang="de-DE" | "en" | "x-default">` cross-links between DE & EN equivalents
- Slug mapping: `/ueber-uns` ↔ `/en/about`, `/kontakt` ↔ `/en/contact` (others share slugs)
- `<html lang="de|en">` set both at SSR time and on SPA client-side route changes
- EN long-form body copy still in German with a small "EN preview" banner (option 2a + 3a)

**Verified via raw `curl` (no JS execution):**
- 23 DE + 14 EN public routes return their own `<title>`, meta, canonical, hreflang, JSON-LD
- Real H1/H2/links/lists in HTML source on every route
- Bing, Yandex, Slack/WhatsApp/X social-card crawlers (non-JS) see full content in both languages
- React SPA still hydrates on top — UX unchanged
- Lang switcher button in header (desktop + mobile menu) toggles DE↔EN, preserves current page
- **59/59 tests passing** (23 backend + 17 SSR + 19 i18n)
- Cache: ~40% faster on warm requests (172ms cold → ~100ms warm)

## Backlog (P1)
- **Next.js migration for true SSR/SSG** — single highest-impact item
- WebP image optimization pipeline + responsive srcset
- Rate limiting on /api/auth/login and /api/contact (slowapi)
- DOMPurify / bleach sanitization on blog HTML
- Site Settings CMS (phone, email, hours, WhatsApp — currently hardcoded in data/site.js)
- Search functionality (models + blog)
- FAQ CMS (currently hardcoded)
- Email notification on /api/contact (Resend / SendGrid)
- "Neuzugang" badge on models added in last 30 days
- Multi-language toggle (DE/EN)
- Newsletter capture
- Real WhatsApp & phone numbers replacing placeholders
- Public pages: Home, Models, ModelDetail, EscortHamburg, Services list, ServiceDetail (×8), Areas list, AreaDetail (×18), Blog list, BlogDetail, FAQ, About, Contact, 404
- Admin CMS: Login, Dashboard, Models CRUD with image upload, Blog CRUD with image upload, Contacts list with status management
- Backend endpoints: /api/auth/{login,logout,me}, /api/models (GET/POST/PUT/DELETE), /api/blog (GET/POST/PUT/DELETE — drafts admin-only), /api/contact (POST/GET/PUT), /api/upload, /api/files/{path}, /api/sitemap.xml (image-extended, real lastmod, priority+changefreq), /api/robots.txt
- SEO: Per-page title/meta/canonical/OG/Twitter/JSON-LD via useSEO hook; **Organization + WebSite schema embedded statically in index.html so it's in the source HTML**; BreadcrumbList JSON-LD on Service/Area/Model/Blog detail pages; FAQPage schema on /faq; LocalBusiness on Home; Article schema on blog detail with publisher/date/inLanguage
- Performance: font preconnect + preload, image preconnect, hero LCP image has fetchpriority=high + explicit width/height (no CLS), images lazy-loaded
- Security: httpOnly auth cookies, no token in body, draft posts admin-gated, explicit CORS allowlist
- Seeded: 6 elegant model profiles + 3 magazine-style blog posts
- Internal linking: Home → all services/locations/models/blog; service pages → related; area pages → nearby + related services + models in area; blog → related services + locations
- Tested: 23/23 backend tests pass

## SEO Architecture — Honest Assessment
**The single biggest remaining gap is SSR/SSG.** This site is built on Create React App, which renders client-side only. View-source on any page shows an empty `<div id="root">`. Mitigations already in place:
- Organization + WebSite JSON-LD is in the **static** HTML (visible without JS)
- All meta tags, canonical, OG, Twitter cards, hreflang are present in HTML head (via index.html for defaults, useSEO for per-route updates)
- Sitemap is server-rendered with absolute URLs, image extensions, and accurate lastmod
- Modern Googlebot DOES execute JS and will index the rendered DOM — but with slower discovery, weaker ranking signals, and zero coverage for Bing/Yandex/social-card crawlers

**The proper fix is migrating to Next.js (App Router)** — every page would then be SSR/SSG with full HTML in the response. Estimated effort: 6-10 hours; risk: medium. Until then, the current setup is the strongest CSR-SEO posture possible.

## Backlog (P1)
- **Next.js migration for true SSR/SSG** — single highest-impact item
- CMS for arbitrary landing pages (currently Services + Areas are code-defined)
- WebP image optimization pipeline on upload (Pillow + magic byte check)
- Rate limiting on /api/contact and /api/auth/login (slowapi)
- DOMPurify / bleach sanitization on blog HTML (defense-in-depth XSS)
- Origin/Referer check on /api/upload (closes SEC-004 CSRF surface)
- Email notification on contact submission (Resend / SendGrid)
- "Neuzugang" badge on models added in last 30 days
- Multi-language toggle (DE/EN)
- Real WhatsApp & phone numbers replacing placeholders

## Admin Credentials
- Email: admin@noir-hamburg.de
- Password: NoirAdmin2026!
- (Also stored at /app/memory/test_credentials.md)

## Next Action Items
- Replace seeded German marketing content with user's final SEO content (`I will provide all final SEO content separately`)
- Consider SSR migration (Next.js) for true PageSpeed 90+ — current CRA build is good but SSR is the proper move for SEO ranking
- Add automated WebP image conversion on upload
- Set up real email notification on contact submissions
