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
- Seeded: 6 model profiles + 3 magazine-style blog posts
- Internal linking: Home → all services/locations/models/blog; service pages → related; area pages → nearby + related services + models; blog → related services + locations; CMS Pages → related services + locations
- Tested: 23/23 backend tests pass, zero frontend lint errors

## SEO Architecture — SSR LIVE (2026-02)
**SSR is now active.** A custom Express server (`/app/frontend/ssr-server.js` + `ssr-data.js`) pre-renders every public route as real HTML before the React SPA mounts on top. Verified via raw `curl` (no JS execution):
- Every route returns its own `<title>`, meta description, canonical, OG, Twitter, JSON-LD
- Real `<h1>`, `<h2>`, paragraphs, model lists, service cards, area lists, blog teasers, FAQ accordion in HTML source
- Bing, Yandex, Slack/WhatsApp/X social-card crawlers (non-JS) see full content
- React SPA still hydrates on top — UX unchanged
- Final cleanup (2026-02): removed CRA boilerplate `<noscript>You need to enable JavaScript to run this app.</noscript>` + duplicate `<title>`/`<meta>` from the served HTML so SEO auditors no longer pick up the misleading message.

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
