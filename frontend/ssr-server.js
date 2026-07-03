/* eslint-disable no-console */
/**
 * Noir Hamburg SSR server.
 *
 * Goal: serve full HTML (title, meta, schemas, headings, links, body content)
 *       for every public route so Googlebot, Bingbot, social-card crawlers and
 *       users on a slow connection see real content without executing JS.
 *
 * Architecture (post-refactor 2026-02):
 *   - `ssr/shell.js`             — page <head>, header/nav, footer, breadcrumbs
 *   - `ssr/backend.js`           — HTTP client with 60s in-memory TTL cache
 *   - `ssr/cache.js`             — generic TTL memo helper
 *   - `ssr/routes/*.js`          — one file per route family (home, models,
 *                                  services, areas, blog, static)
 *   - `src/data/site.js`         — SINGLE SOURCE OF TRUTH (CommonJS) shared
 *                                  with the React SPA. No more duplication.
 *
 * The React bundle's <link rel=stylesheet> and <script src> tags are pulled
 * out of `build/index.html` and re-injected into every SSR response so the
 * SPA hydrates on top of the SSR-rendered HTML.
 */
const express = require("express");
const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const PORT = parseInt(process.env.PORT || "3000", 10);
const BUILD_DIR = path.join(__dirname, "build");

// Auto-build safeguard for production deploys: some platforms (including
// Emergent's) hand us a fresh container without running `yarn build` first.
// Rather than crash-loop, we run the build in-process before the server
// starts. This keeps deploys self-healing without a shell start script.
if (!fs.existsSync(path.join(BUILD_DIR, "index.html"))) {
  console.log("[ssr] build/ missing — running `yarn build` now (one-time)...");
  try {
    execSync("yarn build", { cwd: __dirname, stdio: "inherit" });
  } catch (err) {
    console.error("[ssr] yarn build failed:", err);
    process.exit(1);
  }
}

const { backendRaw } = require("./ssr/backend");
const { renderHome } = require("./ssr/routes/home");
const { renderModels, renderModelDetail } = require("./ssr/routes/models");
const { renderServicesList, renderServiceDetail } = require("./ssr/routes/services");
const { renderAreasList, renderAreaDetail, renderEscortHamburg } = require("./ssr/routes/areas");
const { renderBlogList, renderBlogDetail, renderPageDetail } = require("./ssr/routes/blog");
const { renderFAQ, renderAbout, renderContact } = require("./ssr/routes/static");

const TEMPLATE = fs.readFileSync(path.join(BUILD_DIR, "index.html"), "utf8");

// ---------- React bundle injection ----------
// Extract React's bundle <link rel=stylesheet> + <script src> from the built
// index.html so SSR pages still hydrate the SPA after first paint.
const headAssetsMatch = TEMPLATE.match(/<head>([\s\S]*?)<\/head>/i);
const bodyScriptsMatch = TEMPLATE.match(/<body[^>]*>([\s\S]*?)<\/body>/i);

// Strip the <div id="root"> placeholder (SSR provides its own #seo-content +
// empty #root for React) and the CRA boilerplate <noscript>You need to enable
// JavaScript...</noscript> (misleading for SEO crawlers — real HTML *is*
// present without JS).
const reactScripts = (bodyScriptsMatch ? bodyScriptsMatch[1] : "")
  .replace(/<div id="root">[\s\S]*?<\/div>/i, "")
  .replace(/<noscript>[\s\S]*?<\/noscript>/gi, "");

function extractAssetTags(headHtml) {
  const tags = [];
  const tagRegex = /<(link|script)\b[^>]*?(?:\/>|>(?:[\s\S]*?<\/\1>)?)/gi;
  let m;
  while ((m = tagRegex.exec(headHtml)) !== null) {
    const tag = m[0];
    if (/<link\b[^>]+rel=["']stylesheet/i.test(tag)) tags.push(tag);
    else if (/<script\b[^>]+src=/i.test(tag)) tags.push(tag);
  }
  return tags.join("\n");
}
const reactHeadAssets = extractAssetTags(headAssetsMatch ? headAssetsMatch[1] : "");

// Bag of build-time assets passed into every route renderer.
const BUILD_ASSETS = { reactHeadAssets, reactScripts };

// ---------- Express app ----------
const app = express();

// ---------- Security headers ----------
// Defense-in-depth on every SSR response. CSP blocks inline <script> execution
// so even if admin-authored rich-text slips a <script> tag past server-side
// sanitization, the browser refuses to run it. Other headers neutralize
// clickjacking, MIME-sniffing, and referer leakage.
//
// Notes on CSP allowlist:
//   - 'unsafe-inline' is required for the React build's inline mount script
//     and the SSR seo-content hider; both are first-party fixed payloads.
//     CSP still blocks ANY runtime-injected inline <script> from blog HTML
//     because the inline-script-hash policy would not match.
//     We keep 'unsafe-inline' for now and rely on bleach to scrub <script>
//     tags from admin content. Upgrade path: switch to per-request nonces.
//   - PostHog + Emergent badge load from their CDNs; whitelisted.
//   - Images come from Unsplash, Pexels, our preview origin, and inline data:.
const CSP_DIRECTIVES = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' https://assets.emergent.sh https://us.i.posthog.com https://us-assets.i.posthog.com https://static.cloudflareinsights.com",
  "worker-src 'self' blob:",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' data: https://fonts.gstatic.com",
  "img-src 'self' data: blob: https://images.unsplash.com https://images.pexels.com https://integrations.emergentagent.com https://*.preview.emergentagent.com",
  "connect-src 'self' https://us.i.posthog.com https://us-assets.i.posthog.com https://*.preview.emergentagent.com",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "object-src 'none'",
];

app.use((req, res, next) => {
  res.set("Content-Security-Policy", CSP_DIRECTIVES.join("; "));
  res.set("X-Content-Type-Options", "nosniff");
  res.set("X-Frame-Options", "DENY");
  res.set("Referrer-Policy", "strict-origin-when-cross-origin");
  res.set("Permissions-Policy", "geolocation=(), microphone=(), camera=(), payment=()");
  // Static asset responses get long-lived caching set below; do NOT add HSTS
  // here — the ingress already terminates TLS and emits HSTS.
  next();
});

app.use("/static", express.static(path.join(BUILD_DIR, "static"), { maxAge: "1y", immutable: true }));
app.get("/favicon.ico", (req, res) => res.sendFile(path.join(BUILD_DIR, "favicon.ico")));
app.get("/manifest.json", (req, res) => res.sendFile(path.join(BUILD_DIR, "manifest.json")));
app.get("/robots.txt", (req, res) => res.sendFile(path.join(BUILD_DIR, "robots.txt")));

app.get("/sitemap.xml", async (req, res) => {
  try {
    const r = await backendRaw("/api/sitemap.xml");
    res.set("Content-Type", "application/xml").status(r.status).send(r.body);
  } catch (e) {
    res.status(502).send("sitemap upstream error");
  }
});

const send = (res, html) => res.set("Content-Type", "text/html; charset=utf-8").send(html);
const send404 = (res, html) => res.set("Content-Type", "text/html; charset=utf-8").status(404).send(html);

// Wrap an async route handler so backend failures fall back to the SPA shell
// instead of returning a 500 to crawlers.
function safe(fn) {
  return async (req, res) => {
    try {
      const html = await fn(req, res);
      if (html === null) return send404(res, TEMPLATE);
      send(res, html);
    } catch (e) {
      console.error(`[ssr] ${req.path} failed:`, e.message);
      send(res, TEMPLATE);
    }
  };
}

// ---------- Public SSR routes ----------
// DE (default-language) routes
app.get("/", safe(() => renderHome(BUILD_ASSETS, "de")));
app.get("/models", safe(() => renderModels(BUILD_ASSETS, "de")));
app.get("/models/:slug", safe((req) => renderModelDetail(req.params.slug, BUILD_ASSETS, "de")));
app.get("/services", safe(() => renderServicesList(BUILD_ASSETS, "de")));
app.get("/services/:slug", safe((req) => renderServiceDetail(req.params.slug, BUILD_ASSETS, "de")));
app.get("/areas", safe(() => renderAreasList(BUILD_ASSETS, "de")));
app.get("/escort/:slug", safe((req) => renderAreaDetail(req.params.slug, BUILD_ASSETS, "de")));
app.get("/escort-hamburg", safe(() => renderEscortHamburg(BUILD_ASSETS, "de")));
app.get("/blog", safe(() => renderBlogList(BUILD_ASSETS, "de")));
app.get("/blog/:slug", safe((req) => renderBlogDetail(req.params.slug, BUILD_ASSETS, "de")));
app.get("/p/:slug", safe((req) => renderPageDetail(req.params.slug, BUILD_ASSETS, "de")));
app.get("/faq", safe(() => renderFAQ(BUILD_ASSETS, "de")));
app.get("/ueber-uns", safe(() => renderAbout(BUILD_ASSETS, "de")));
app.get("/kontakt", safe(() => renderContact(BUILD_ASSETS, "de")));

// EN (/en/*) mirror routes — same data, English UI chrome, en-specific
// canonical + hreflang. Long-form body copy stays in DE with a "coming soon"
// banner until full English content is supplied via the CMS.
app.get("/en", safe(() => renderHome(BUILD_ASSETS, "en")));
app.get("/en/", safe(() => renderHome(BUILD_ASSETS, "en")));
app.get("/en/models", safe(() => renderModels(BUILD_ASSETS, "en")));
app.get("/en/models/:slug", safe((req) => renderModelDetail(req.params.slug, BUILD_ASSETS, "en")));
app.get("/en/services", safe(() => renderServicesList(BUILD_ASSETS, "en")));
app.get("/en/services/:slug", safe((req) => renderServiceDetail(req.params.slug, BUILD_ASSETS, "en")));
app.get("/en/areas", safe(() => renderAreasList(BUILD_ASSETS, "en")));
app.get("/en/escort/:slug", safe((req) => renderAreaDetail(req.params.slug, BUILD_ASSETS, "en")));
app.get("/en/escort-hamburg", safe(() => renderEscortHamburg(BUILD_ASSETS, "en")));
app.get("/en/blog", safe(() => renderBlogList(BUILD_ASSETS, "en")));
app.get("/en/blog/:slug", safe((req) => renderBlogDetail(req.params.slug, BUILD_ASSETS, "en")));
app.get("/en/p/:slug", safe((req) => renderPageDetail(req.params.slug, BUILD_ASSETS, "en")));
app.get("/en/faq", safe(() => renderFAQ(BUILD_ASSETS, "en")));
app.get("/en/about", safe(() => renderAbout(BUILD_ASSETS, "en")));
app.get("/en/contact", safe(() => renderContact(BUILD_ASSETS, "en")));

// Admin + anything else → SPA shell (React handles routing client-side).
app.get("*", (req, res) => send(res, TEMPLATE));

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Noir Hamburg SSR server listening on 0.0.0.0:${PORT}`);
  console.log(`Build dir: ${BUILD_DIR}`);
});
