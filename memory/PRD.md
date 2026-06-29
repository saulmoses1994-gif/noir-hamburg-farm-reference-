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

## Implemented (2026-02 — MVP)
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
