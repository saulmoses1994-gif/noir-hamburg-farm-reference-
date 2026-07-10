# Noir Hamburg — FARM → farmnext (Next.js) Migration Checklist

**Source project:** FARM template (FastAPI + React SPA + MongoDB)
**Target project:** farmnext template (FastAPI + Next.js App Router + MongoDB)
**Reason for migration:** React SPA static hosting cannot serve route-specific `<body>` HTML to crawlers. Next.js SSR/SSG resolves this natively.
**Rule:** Do **not** reset the MongoDB database. All CMS content (models, blog, pages, service content, area content, settings, media, contacts) must survive the migration.

---

## 0. Freeze rules (must-read before starting)

- ❌ No feature work, no bug fixes, no styling changes in this repo until the new farmnext job is live.
- ❌ Do not run `yarn build`, do not delete any files, do not run destructive DB migrations.
- ❌ Do not change the URL structure. Every route must map 1:1 (SEO parity).
- ✅ Only allowed action on this repo: **Save to GitHub**.

---

## 1. GitHub export (step-by-step)

The Emergent UI exposes a **"Save to Github"** button inside the chat input area (next to attach/settings). It is the only supported push path.

1. In the current Emergent workspace, click the chat input toolbar → **Save to Github**.
2. Authorize the Emergent GitHub app if prompted (one-time OAuth per account).
3. Choose:
   - **Account/Org:** your personal account or the org that will own the repo.
   - **Repository name:** `noir-hamburg-farm-reference` (suggested — makes it obvious this is the frozen reference).
   - **Visibility:** Private (recommended — contains admin creds structure and CMS content references).
   - **Branch:** `main`.
4. Confirm push. Wait for the "Push successful" toast.
5. Open the repo on github.com. Verify these folders are present:
   - `/backend/` (server.py, seed_data/, requirements.txt, tests/)
   - `/frontend/` (src/, public/, package.json, tailwind.config.js)
   - `/MIGRATION_CHECKLIST.md` (this file)
   - `/memory/PRD.md` (if present)
6. Copy the HTTPS clone URL — you will paste it into the new farmnext job when instructing the new agent.

**If "Save to Github" is missing or greyed out:** ask Emergent support to enable GitHub integration for the workspace. Do not attempt manual `git push` from the terminal — the platform manages remotes.

---

## 2. Environment variables to carry over

### Backend (`/backend/.env` in farmnext job)

| Variable | Source value | Notes |
|---|---|---|
| `MONGO_URL` | Provided by platform | Keep the pre-filled value in the new job. Do NOT paste the old one. |
| `DB_NAME` | Provided by platform | Keep as-is. The "Replace with existing DB" step (see §3) will swap the database contents, not the connection string. |
| `CORS_ORIGINS` | `*` or explicit list | Same as current. |
| `ADMIN_EMAIL` | `admin@noir-hamburg.de` | Seed script reads this. |
| `ADMIN_PASSWORD` | `NoirAdmin2026!` | Seed script reads this. Rotate after go-live. |
| `JWT_SECRET` | (existing secret) | **Copy the exact value** so existing admin sessions/tokens keep working. If rotated, all admins must re-login (acceptable). |
| `SITE_BASE_URL` | `https://noir-hamburg.de` (or preview URL until domain cutover) | Used by sitemap.xml, robots.txt, and canonical URLs. |

### Frontend (`/frontend/.env` in farmnext job)

| Old key (React) | New key (Next.js) | Notes |
|---|---|---|
| `REACT_APP_BACKEND_URL` | `NEXT_PUBLIC_BACKEND_URL` | Same value. Next.js requires `NEXT_PUBLIC_` prefix for client-exposed vars. |
| — | `NEXT_PUBLIC_SITE_URL` | `https://noir-hamburg.de` — used in metadata `metadataBase`. |
| — | `BACKEND_INTERNAL_URL` | Optional: server-side URL for Next.js server components / route handlers to call FastAPI internally (e.g. `http://localhost:8001`). |

**Do not** add fallback defaults inside code (`|| "http://..."`). Env must fail fast if missing.

---

## 3. MongoDB — preserving the existing database

The platform ships a **"Replace with existing DB"** action in the new job's Database panel. Use it — do not run manual dumps unless the button is unavailable.

Steps (in the new farmnext job):

1. Open the new farmnext job workspace.
2. Go to the Database panel (left sidebar → Database or Storage).
3. Click **Replace with existing DB** → select the source workspace = current FARM job.
4. Confirm. The new job's Mongo instance is now attached to the same data.
5. Verify by running (in the new job's terminal):
   ```
   curl $NEXT_PUBLIC_BACKEND_URL/api/settings
   curl $NEXT_PUBLIC_BACKEND_URL/api/models
   curl $NEXT_PUBLIC_BACKEND_URL/api/blog
   curl $NEXT_PUBLIC_BACKEND_URL/api/service-content
   curl $NEXT_PUBLIC_BACKEND_URL/api/area-content
   ```
   All should return existing data (models, posts, pages, service/area content, settings).

**If "Replace with existing DB" is not available:** ask support. Fallback (only if approved):
```bash
# From current job (read-only export):
mongodump --uri="$MONGO_URL" --db="$DB_NAME" --out=/tmp/dump
# Transfer /tmp/dump to new job (via GitHub artifact or support), then:
mongorestore --uri="$MONGO_URL" --db="$DB_NAME" /tmp/dump/$DB_NAME
```

Collections that MUST survive: `users`, `settings`, `models`, `blog_posts`, `pages`, `service_content`, `area_content`, `contacts`, `media`, and any `content_migrations` markers.

---

## 4. URL route map (must match 1:1 for SEO)

### German (default, no locale prefix)

| Route | Page type | Data source |
|---|---|---|
| `/` | Home | site.js + settings + featured models |
| `/models` | Models list | `GET /api/models` |
| `/models/[slug]` | Model detail | `GET /api/models/{slug}` |
| `/escort-hamburg` | Landing (SEO hub) | site.js |
| `/services` | Services list | `GET /api/service-content` |
| `/services/[slug]` | Service detail | `GET /api/service-content/{slug}` |
| `/areas` | Areas list | `GET /api/area-content` |
| `/escort/[slug]` | Area detail | `GET /api/area-content/{slug}` |
| `/blog` | Blog list | `GET /api/blog` |
| `/blog/[slug]` | Blog post | `GET /api/blog/{slug}` |
| `/faq` | FAQ | site.js / settings |
| `/ueber-uns` | About | static |
| `/kontakt` | Contact | static + `POST /api/contact` |
| `/impressum` | Imprint | static |
| `/p/diskretion` | Discretion page | static/default |
| `/p/[slug]` | CMS page | `GET /api/pages/{slug}` |

### English (`/en` prefix)

| Route | Notes |
|---|---|
| `/en` | Home (EN) |
| `/en/models`, `/en/models/[slug]` | Models |
| `/en/escort-hamburg` | Landing |
| `/en/services`, `/en/services/[slug]` | Services |
| `/en/areas`, `/en/escort/[slug]` | Areas |
| `/en/blog`, `/en/blog/[slug]` | Blog |
| `/en/faq` | FAQ |
| `/en/about` | About (note: `/about`, not `/ueber-uns`) |
| `/en/contact` | Contact |
| `/en/imprint` | Imprint (note: `/imprint`, not `/impressum`) |
| `/en/p/diskretion`, `/en/p/[slug]` | Pages |

### Admin (client-only, no SSG required)

| Route |
|---|
| `/admin/login` |
| `/admin` (dashboard) |
| `/admin/models`, `/admin/models/new`, `/admin/models/edit/[slug]` |
| `/admin/blog`, `/admin/blog/new`, `/admin/blog/edit/[slug]` |
| `/admin/pages`, `/admin/pages/new`, `/admin/pages/edit/[slug]` |
| `/admin/services`, `/admin/areas` |
| `/admin/contacts`, `/admin/media`, `/admin/settings`, `/admin/account` |

**In Next.js:** put `/admin/**` under a `(admin)` route group with `"use client"` components and no `generateStaticParams` — dynamic client-side rendering is fine here.

**Locale strategy in Next.js App Router:**
- Use `app/[locale]/...` with a middleware that rewrites `/` → `/de/` internally (but keeps the URL as `/`), OR
- Use two parallel route trees: `app/(de)/...` and `app/en/...` where DE has no path segment.
- Whichever you pick, the **public URL must not change** vs. the list above.

---

## 5. FastAPI backend — files to preserve as-is

Copy these files/folders from the current repo into the new farmnext job's `/backend/` folder **without modification**:

```
backend/
├── server.py                # Full FastAPI app — all @api_router endpoints (see list below)
├── requirements.txt         # Pin identical versions
├── pytest.ini
├── seed_data/
│   ├── service_content.json
│   ├── area_content.json
│   ├── generic_area_faqs.json
│   └── content_migrations/
├── scripts/                 # Any admin/seed scripts
└── tests/                   # Regression suite
```

### API endpoint inventory (must remain identical — Next.js frontend calls these)

Auth: `POST /api/auth/login`, `POST /api/auth/logout`, `GET /api/auth/me`, `POST /api/auth/change-password`
Settings: `GET /api/settings`, `PUT /api/settings`
Media: `GET /api/media`, `POST /api/upload`, `PUT/DELETE /api/media/{file_id}`, `GET /api/files/{path}`
Service content: `GET /api/service-content`, `GET/PUT /api/service-content/{slug}`
Area content: `GET /api/area-content`, `GET/PUT /api/area-content/{slug}`
Models: `GET /api/models`, `GET/POST/PUT/DELETE /api/models/{slug}`
Blog: `GET /api/blog`, `GET/POST/PUT/DELETE /api/blog/{slug}`
Pages: `GET /api/pages`, `GET/POST/PUT/DELETE /api/pages/{slug}`
Contact: `POST /api/contact`, `GET /api/contact`, `PUT /api/contact/{id}`
SEO: `GET /api/sitemap.xml`, `GET /api/robots.txt`, `GET /api/sitemap/status`
Health: `GET /api/health`

**Rule:** Backend must be a **drop-in copy**. If Next.js needs a new endpoint, add it — do not modify existing ones.

---

## 6. Next.js App Router migration requirements

### 6.1 Project skeleton

```
frontend/
├── app/
│   ├── layout.tsx                    # Root: <html lang="de">, fonts, global metadata
│   ├── page.tsx                      # /
│   ├── models/
│   │   ├── page.tsx                  # /models
│   │   └── [slug]/page.tsx           # /models/[slug]
│   ├── escort-hamburg/page.tsx
│   ├── services/
│   │   ├── page.tsx
│   │   └── [slug]/page.tsx
│   ├── areas/page.tsx
│   ├── escort/[slug]/page.tsx
│   ├── blog/
│   │   ├── page.tsx
│   │   └── [slug]/page.tsx
│   ├── faq/page.tsx
│   ├── ueber-uns/page.tsx
│   ├── kontakt/page.tsx
│   ├── impressum/page.tsx
│   ├── p/[slug]/page.tsx
│   ├── en/                           # Mirror tree for EN
│   │   ├── page.tsx
│   │   ├── models/page.tsx
│   │   └── ... (all EN routes)
│   ├── (admin)/                      # Route group, client-side
│   │   └── admin/...
│   ├── sitemap.ts                    # Dynamic sitemap
│   ├── robots.ts                     # Dynamic robots.txt
│   └── not-found.tsx
├── components/                       # Port from src/components (mostly server components)
├── lib/
│   ├── api.ts                        # fetch wrappers using BACKEND_INTERNAL_URL server-side
│   ├── seo.ts                        # buildMetadata(), buildJsonLd() helpers
│   └── i18n.ts                       # locale detection + dictionaries
└── next.config.js
```

### 6.2 `generateMetadata` (per-route SEO tags)

Every page must export `generateMetadata` returning:

```ts
export async function generateMetadata({ params }): Promise<Metadata> {
  const data = await getServiceContent(params.slug);
  return {
    metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL!),
    title: data.meta_title,
    description: data.meta_description,
    alternates: {
      canonical: `/services/${params.slug}`,
      languages: {
        'de-DE': `/services/${params.slug}`,
        'en': `/en/services/${params.slug}`,
        'x-default': `/services/${params.slug}`,
      },
    },
    openGraph: {
      title: data.meta_title,
      description: data.meta_description,
      url: `${process.env.NEXT_PUBLIC_SITE_URL}/services/${params.slug}`,
      siteName: 'Noir Hamburg',
      locale: 'de_DE',
      type: 'website',
      images: [{ url: data.image, width: 1200, height: 630, alt: data.image_alt }],
    },
    twitter: { card: 'summary_large_image', title: data.meta_title, description: data.meta_description },
    robots: { index: true, follow: true },
  };
}
```

### 6.3 `generateStaticParams` (SSG)

For every dynamic route, pre-render all known slugs at build time:

```ts
// app/services/[slug]/page.tsx
export async function generateStaticParams() {
  const items = await fetch(`${process.env.BACKEND_INTERNAL_URL}/api/service-content`).then(r => r.json());
  return items.map((s: any) => ({ slug: s.slug }));
}
export const dynamicParams = true; // allow ISR for newly added items
export const revalidate = 300;     // 5-minute ISR
```

Apply the same pattern to: `/models/[slug]`, `/services/[slug]`, `/escort/[slug]`, `/blog/[slug]`, `/p/[slug]` (and `/en/...` twins).

### 6.4 JSON-LD schema (must render inside `<body>`)

Each page emits its schema as a `<script type="application/ld+json">` in the server-rendered body:

- **Home:** `Organization` + `LocalBusiness` + `WebSite` (+ SearchAction)
- **Services list & detail:** `Service` + breadcrumb `BreadcrumbList`
- **Areas list & detail:** `Place` / `LocalBusiness` + breadcrumb
- **Blog list:** `Blog`
- **Blog post:** `Article` (with author, datePublished, image, headline)
- **FAQ:** `FAQPage`
- **Models list:** `ItemList`
- **Model detail:** `Person` (careful with jurisdiction — verify with legal before going live)
- **All pages:** `BreadcrumbList`

Implement a `<JsonLd data={...} />` server component that JSON.stringifies safely (escape `</` → `<\/`).

### 6.5 `sitemap.xml` (dynamic)

`app/sitemap.ts`:

```ts
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_SITE_URL!;
  const [models, services, areas, blog, pages] = await Promise.all([...]);
  const staticRoutes = ['', '/models', '/services', '/areas', '/escort-hamburg',
                        '/blog', '/faq', '/ueber-uns', '/kontakt', '/impressum',
                        '/en', '/en/models', /* ... */];
  return [
    ...staticRoutes.map(p => ({ url: `${base}${p}`, changeFrequency: 'weekly', priority: p === '' ? 1 : 0.7 })),
    ...models.map(m => ({ url: `${base}/models/${m.slug}`, lastModified: m.updated_at })),
    ...services.map(s => ({ url: `${base}/services/${s.slug}`, lastModified: s.updated_at })),
    // areas, blog, pages...
    // + EN twins
  ];
}
```

Every URL emitted must also emit its `/en/...` twin (or vice versa) so Google can pair them via hreflang.

### 6.6 `robots.txt` (dynamic)

`app/robots.ts`:

```ts
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: '*', allow: '/', disallow: ['/admin', '/api'] },
    ],
    sitemap: `${process.env.NEXT_PUBLIC_SITE_URL}/sitemap.xml`,
    host: process.env.NEXT_PUBLIC_SITE_URL,
  };
}
```

### 6.7 hreflang DE ↔ EN

Two mechanisms — **both** required:

1. **HTML `<link rel="alternate">`** via `generateMetadata` → `alternates.languages` (see 6.2 above). Next.js renders these into `<head>`.
2. **Sitemap `xhtml:link`** — Next.js `MetadataRoute.Sitemap` supports `alternates.languages` per entry:
   ```ts
   { url: `${base}/services/${s.slug}`,
     alternates: { languages: { 'en': `${base}/en/services/${s.slug}`, 'x-default': `${base}/services/${s.slug}` } } }
   ```

Rules:
- Every DE page has an EN twin, and vice versa. If a page is DE-only, omit hreflang rather than pointing to a 404.
- `x-default` → DE version.
- `<html lang="de">` on DE routes, `<html lang="en">` on EN routes (set in `layout.tsx` per segment).

---

## 7. Admin CMS parity

The new Next.js frontend must expose the same admin surface (client-only, protected by JWT from `POST /api/auth/login`). Port these screens 1:1:

- **Dashboard** — stats + recent contacts
- **Models** — list / new / edit (drag-reorder gallery, publish toggle, SEO fields)
- **Blog** — list / new / edit (rich editor, cover image, tags, publish date)
- **Pages** — list / new / edit (arbitrary CMS pages under `/p/[slug]`)
- **Services** — edit per-slug service content (h1, tagline, meta, sections, faqs, image_alt) — this is the key SEO surface
- **Areas** — edit per-slug area content (same schema as services)
- **Contacts** — inbox for `POST /api/contact` submissions with status + notes
- **Media** — upload, list, rename, delete, alt-text edit
- **Settings** — global site settings (site name, tagline, contact info, opening hours, socials, hero images, footer copy)
- **Account** — change password

Reuse the existing FastAPI endpoints — no rewiring needed.

---

## 8. Design-system preservation

Copy verbatim from the current repo:

- `tailwind.config.js` — extended theme (colors, fonts, spacing scale, custom keyframes)
- `postcss.config.js`
- `src/index.css` / `src/App.css` → `app/globals.css` (adjust `@apply` if needed)
- `components.json` (shadcn config) + all files under `src/components/ui/*`
- Font loading: use `next/font/google` for the exact families currently used (verify in `index.html` / `App.css`).
- Custom cursors, image lazy-load wrappers, motion components → port to Next.js client components (`"use client"`).
- Color tokens (dark luxury palette — deep blacks, gold accents) → keep CSS variables identical.
- Any bespoke SVG logos in `frontend/public/` → copy as-is to `frontend/public/`.

**Do not** redesign anything during the migration. Visual regression must be zero.

---

## 9. Deployment & domain cutover

### 9.1 Staging (preview URL)

1. New farmnext job auto-provides a preview URL (`https://<slug>.preview.emergentagent.com`).
2. Set `NEXT_PUBLIC_SITE_URL` and `SITE_BASE_URL` to this preview URL initially.
3. Deploy from the new job's Deploy panel.
4. Run the verification checklist (§10) against the preview URL.

### 9.2 Production cutover (custom domain `noir-hamburg.de`)

**Do not** change DNS until §10 verification passes on the preview.

1. In the new farmnext job → Deploy → add custom domain `noir-hamburg.de` and `www.noir-hamburg.de`.
2. Platform issues DNS instructions (A / CNAME / TXT verification).
3. **Before** flipping DNS: update env vars in the new job to production values:
   - `NEXT_PUBLIC_SITE_URL=https://noir-hamburg.de`
   - `SITE_BASE_URL=https://noir-hamburg.de`
   - Redeploy.
4. Update DNS at the domain registrar (or use Emergent's Entri integration if available in the new job).
5. Wait for SSL to issue (usually <15 min).
6. Verify `https://noir-hamburg.de` serves the new Next.js build (check `view-source:` — service pages must have their own `<h1>` and JSON-LD in the raw HTML).
7. Submit updated sitemap to Google Search Console: `https://noir-hamburg.de/sitemap.xml`.
8. In GSC, request re-indexing of top pages (home, top services, top areas).

---

## 10. Production verification checklist

Run against the new deployment **before** DNS cutover, and again **after**.

### 10.1 SEO (view-source, not devtools)

For each of: `/`, `/services/vip-escort`, `/services/business-escort`, `/escort/hafencity`, `/blog`, `/en`, `/en/services/vip-escort`:

- [ ] `curl -s <URL> | head -200` returns fully rendered HTML (not an empty `<div id="root">`).
- [ ] Unique `<title>` per route.
- [ ] Unique `<meta name="description">` per route.
- [ ] Exactly **one** `<h1>` per route, matching the route's topic.
- [ ] `<link rel="canonical">` present and pointing to the correct URL.
- [ ] `<link rel="alternate" hreflang="de-DE">`, `hreflang="en"`, `hreflang="x-default"` all present with correct URLs.
- [ ] JSON-LD schema present inside `<body>` (validate at https://validator.schema.org/).
- [ ] Open Graph tags render a valid share preview (test via https://www.opengraph.xyz/).
- [ ] `<html lang="de">` on DE routes, `<html lang="en">` on EN routes.

### 10.2 Sitemap & robots

- [ ] `GET /sitemap.xml` returns valid XML with all routes + hreflang alternates.
- [ ] `GET /robots.txt` allows `/`, disallows `/admin` and `/api`, references the sitemap URL.
- [ ] Every URL in the sitemap returns HTTP 200 (spot-check 10 random URLs).

### 10.3 Content parity

- [ ] All models visible on `/models` (count matches current production).
- [ ] All blog posts visible on `/blog`.
- [ ] Every service page shows its bespoke H1, sections, FAQs from the DB.
- [ ] Every area page shows its bespoke H1, sections, FAQs from the DB.
- [ ] Global settings (contact info, hours, socials, footer) match current production.
- [ ] Media library images all load (no broken thumbnails).

### 10.4 Admin functionality

- [ ] Login with `admin@noir-hamburg.de` / `NoirAdmin2026!` works.
- [ ] Editing a service content page and saving reflects on the public route within `revalidate` window (or after manual revalidate).
- [ ] New blog post publish flow works end-to-end.
- [ ] Contact form submission arrives in `/admin/contacts`.
- [ ] Media upload works, uploaded image displays on public pages.

### 10.5 Performance

- [ ] Lighthouse mobile: Performance ≥ 85, SEO = 100, Best Practices ≥ 95.
- [ ] LCP < 2.5s on `/` (mobile 4G throttling).
- [ ] CLS < 0.1 across all pages.
- [ ] Total page weight < 1.5MB on `/`.
- [ ] All images served as WebP/AVIF via `next/image`.

### 10.6 Bilingual

- [ ] Language switcher toggles URL correctly (`/services/vip-escort` ↔ `/en/services/vip-escort`).
- [ ] EN content pulled from CMS (or gracefully falls back to DE if EN missing — document which).

---

## 11. Rollback plan

If verification fails or a critical production issue emerges post-cutover:

### 11.1 Fast rollback (DNS)

1. In the DNS registrar (or Entri), point `noir-hamburg.de` back to the **current FARM job's** production URL.
2. TTL 300s → propagation < 5 min.
3. The old React SPA serves again with all existing CMS data (DB is shared — nothing changed there).

### 11.2 Data safety

- The DB is shared between old and new deployments (they connect to the same Mongo). **No data migration → no data loss risk.**
- If the new deployment corrupted content via a buggy write, restore from Mongo's daily automatic snapshot (available in the platform's Database panel → Backups).

### 11.3 Keep the FARM job alive

- **Do not delete** the current FARM Emergent job for at least 30 days after Next.js go-live.
- Keep its preview URL and admin credentials accessible.
- Only decommission after 30 days of stable Next.js production + confirmed Google re-indexing of new URLs.

### 11.4 Rollback trigger criteria

Roll back immediately if any of these occur post-cutover:

- Homepage returns 5xx for > 5 minutes.
- Sitemap becomes invalid or empty.
- Google Search Console reports > 20% new indexing errors within 24h.
- Admin panel becomes inaccessible.
- Any public route serves `<h1>` from the wrong page (the exact bug we're migrating to fix).

---

## 12. Post-migration backlog (deferred from FARM)

Move these into the new farmnext job's PRD after go-live:

- **P2** — Resend email notifications for new contact leads.
- **P2** — SEO refresh for Dinner / Hotel / Event / Travel / GFE service pages.
- **P3** — Custom domain onboarding via Entri (if the new job's Deploy UX supports it).
- **P3** — Media Library picker in admin (click-to-pick from uploaded photos).
- **P3** — Bulk find-and-replace tool in admin.
- **P3** — Fix the historic double-`<h1>` — should already be resolved by the Next.js migration; verify in §10.1.

---

## 13. Handoff summary for the new farmnext agent

Paste this into the first message of the new farmnext job:

> **Project:** Noir Hamburg — luxury escort agency (Hamburg). Migrating from FARM (React SPA) to farmnext (Next.js App Router) to fix a fundamental SPA SEO limitation (service/area routes serve homepage `<body>` to crawlers on the current platform).
>
> **Reference repo (frozen source of truth):** `https://github.com/<your-account>/noir-hamburg-farm-reference`
>
> **Rules:**
> 1. Backend (`/backend/`) copies as-is — do not modify endpoints.
> 2. Use platform's "Replace with existing DB" to attach the existing MongoDB — do not reset the database.
> 3. URL structure must match 1:1 (see MIGRATION_CHECKLIST.md §4).
> 4. Design must be visually identical (Tailwind + shadcn/ui config in the reference repo).
> 5. Every dynamic route must implement `generateMetadata` + `generateStaticParams` + JSON-LD in `<body>`.
> 6. Bilingual DE/EN with hreflang alternates in both metadata and sitemap.
> 7. Follow the full MIGRATION_CHECKLIST.md at the repo root — verify §10 before requesting production cutover.
>
> **Admin credentials (for testing):** `admin@noir-hamburg.de` / `NoirAdmin2026!`
> **Env keys to set:** see MIGRATION_CHECKLIST.md §2.
