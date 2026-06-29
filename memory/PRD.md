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
- Public pages: Home, Models, ModelDetail, EscortHamburg, Services list, ServiceDetail (×8), Areas list, AreaDetail (×18), Blog list, BlogDetail, FAQ, About, Contact
- Admin CMS: Login, Dashboard, Models CRUD with image upload, Blog CRUD with image upload, Contacts list with status management
- Backend endpoints: /api/auth/{login,logout,me}, /api/models (GET/POST/PUT/DELETE), /api/blog (GET/POST/PUT/DELETE), /api/contact (POST/GET/PUT), /api/upload, /api/files/{path}, /api/sitemap.xml, /api/robots.txt
- SEO: Per-page title/meta/canonical/OG/Twitter/JSON-LD via useSEO hook, breadcrumbs, schema.org markup, sitemap.xml endpoint, robots.txt endpoint, semantic h1/h2 structure
- Seeded: 6 elegant model profiles + 3 magazine-style blog posts (Restaurants, Hamburg Guide, Escort Advice)
- Internal linking: Home → all services/locations/models/blog; service pages cross-link to related; area pages link to nearby; blog posts link to related services + locations
- Tested: 23/23 backend tests pass, all frontend flows verified

## Backlog (P1)
- Pre-built FAQ schema and HowTo schema on more pages
- Server-side rendering / static generation for Core Web Vitals (currently CSR + SPA — may need Next.js migration for Lighthouse 90+)
- Image optimization pipeline (convert to WebP, responsive srcset)
- Rate limiting on /api/contact and /api/auth/login (slowapi)
- Multi-language toggle (DE/EN) if user expands beyond DE market
- Lenis smooth scrolling library integration
- More advanced filtering on models (height, languages, etc.)
- Page-builder style admin for custom landing pages
- Newsletter signup + email integration (Resend/SendGrid)

## Admin Credentials
- Email: admin@noir-hamburg.de
- Password: NoirAdmin2026!
- (Also stored at /app/memory/test_credentials.md)

## Next Action Items
- Replace seeded German marketing content with user's final SEO content (`I will provide all final SEO content separately`)
- Consider SSR migration (Next.js) for true PageSpeed 90+ — current CRA build is good but SSR is the proper move for SEO ranking
- Add automated WebP image conversion on upload
- Set up real email notification on contact submissions
