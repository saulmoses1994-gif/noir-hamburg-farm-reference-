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
//
// We check for BOTH the SSG-baked index.html AND at least one compiled JS
// bundle. The former can now be committed to git as a deploy safety net
// (see frontend/.gitignore) but that doesn't imply the React bundle exists.
function _needsFreshBuild() {
  if (!fs.existsSync(path.join(BUILD_DIR, "index.html"))) return true;
  try {
    const jsDir = path.join(BUILD_DIR, "static", "js");
    if (!fs.existsSync(jsDir)) return true;
    const hasMainBundle = fs.readdirSync(jsDir).some((f) => /^main\.[a-z0-9]+\.js$/i.test(f));
    return !hasMainBundle;
  } catch (_) { return true; }
}

if (_needsFreshBuild()) {
  console.log("[ssr] build/ incomplete — running `yarn build` now (one-time)...");
  try {
    execSync("yarn build", { cwd: __dirname, stdio: "inherit" });
  } catch (err) {
    console.error("[ssr] yarn build failed:", err);
    // Do NOT process.exit — if a partial build exists (e.g. committed SSG
    // HTML but no compiled bundle), the server can still serve degraded but
    // useful SEO HTML. Better than a crash loop that shows nothing.
  }
}

const { backendRaw } = require("./ssr/backend");
const { renderHome } = require("./ssr/routes/home");
const { renderModels, renderModelDetail } = require("./ssr/routes/models");
const { renderServicesList, renderServiceDetail } = require("./ssr/routes/services");
const { renderAreasList, renderAreaDetail, renderEscortHamburg } = require("./ssr/routes/areas");
const { renderBlogList, renderBlogDetail, renderPageDetail } = require("./ssr/routes/blog");
const { renderFAQ, renderAbout, renderContact, renderImpressum, renderDiskretion } = require("./ssr/routes/static");

// Read the SSG-baked build/index.html. This file has:
//   • The correct <link>/<script> tags to the compiled bundle (unique hashes).
//   • The homepage's SEO body baked into <div id="seo-content"> + hijacked
//     <title>/<meta> tags in the <head>.
// We use it ONLY as a source for the bundle asset tags. For the SPA-fallback
// TEMPLATE (served on 404/render errors) we build a *clean* shell so any
// route that fails to render never accidentally shows homepage content.
const BUILT_HTML = fs.readFileSync(path.join(BUILD_DIR, "index.html"), "utf8");

// Construct the clean SPA-fallback shell. We take the built HTML and remove:
//   - the baked <div id="seo-content"> (which contains homepage body copy)
//   - the homepage-specific baked <title>, <meta name="description">,
//     <link rel="canonical">, and JSON-LD <script type="application/ld+json">
//     tags added by ssr/shell.js — because they belong to the homepage, not
//     to whatever route errored out.
// Bundle <script src> and <link rel=stylesheet> tags stay intact so React
// still hydrates on top of the empty shell.
function _buildCleanTemplate() {
  let shell = BUILT_HTML;

  // Strip baked homepage body content
  shell = shell.replace(
    /<div id="seo-content">[\s\S]*?<\/div>\s*<div id="root">/i,
    '<div id="root">'
  );
  // Strip homepage-specific <head> content injected by ssr/shell.js
  shell = shell.replace(/<title>[\s\S]*?<\/title>/i,
    "<title>Noir Hamburg</title>");
  shell = shell.replace(/<meta\s+name="description"[^>]*>/gi, "");
  shell = shell.replace(/<meta\s+property="og:[^"]+"[^>]*>/gi, "");
  shell = shell.replace(/<meta\s+name="twitter:[^"]+"[^>]*>/gi, "");
  shell = shell.replace(/<link\s+rel="canonical"[^>]*>/gi, "");
  shell = shell.replace(/<link\s+rel="alternate"[^>]*hreflang[^>]*>/gi, "");
  shell = shell.replace(/<script\s+type="application\/ld\+json"[^>]*>[\s\S]*?<\/script>/gi, "");
  // Prevent crawler indexing of the fallback shell (safety net — any 404 or
  // render error should never be indexed as duplicate homepage content).
  if (!/<meta\s+name="robots"/i.test(shell)) {
    shell = shell.replace(/<head>/i, '<head>\n<meta name="robots" content="noindex,nofollow">');
  }
  return shell;
}

const TEMPLATE = _buildCleanTemplate();

// Version marker — bump this whenever ssr-server.js changes. Emitted at
// startup AND on every response header (X-App-Build) so we can verify from
// outside what code is deployed without needing internal log access:
//
//   curl -sI https://noir-hamburg.com/services/vip-escort-hamburg | grep -i build
//
// Should print `x-app-build: 2026-02-09-business-seo`. If it prints an
// older value (or no header at all), production is running stale code and
// needs to be redeployed.
const APP_BUILD_ID = process.env.APP_BUILD_ID || "2026-02-09-seo-hide-immediate";
console.log(`[ssr] APP_BUILD_ID = ${APP_BUILD_ID}`);
console.log(`[ssr] TEMPLATE sanitized: ${TEMPLATE.length}B, homepage-title=${/Luxus Escort Hamburg \| Premium Escort Agentur/i.test(TEMPLATE) ? "LEAKED" : "clean"}`);

// ---------- React bundle injection ----------
// Extract React's bundle <link rel=stylesheet> + <script src> from the built
// index.html so SSR pages still hydrate the SPA after first paint.
const headAssetsMatch = BUILT_HTML.match(/<head>([\s\S]*?)<\/head>/i);
const bodyScriptsMatch = BUILT_HTML.match(/<body[^>]*>([\s\S]*?)<\/body>/i);

// Strip the <div id="root"> placeholder (SSR provides its own #seo-content +
// empty #root for React) and the CRA boilerplate <noscript>You need to enable
// JavaScript...</noscript> (misleading for SEO crawlers — real HTML *is*
// present without JS). Also strip any pre-rendered <div id="seo-content">
// content that the SSG build step may have baked into build/index.html —
// without this, the home page's SEO body would be re-injected into every
// SSR route as duplicate HTML (extra H1, duplicate sections, etc.).
const reactScripts = (bodyScriptsMatch ? bodyScriptsMatch[1] : "")
  .replace(/<div id="seo-content">[\s\S]*?<\/div>\s*<div id="root">/i, '<div id="root">')
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
  // Externally-visible build fingerprint (see APP_BUILD_ID definition above).
  res.set("X-App-Build", APP_BUILD_ID);
  // Static asset responses get long-lived caching set below; do NOT add HSTS
  // here — the ingress already terminates TLS and emits HSTS.
  next();
});

// ---------- www → non-www 301 redirect ----------
// Google treats `www.noir-hamburg.com` and `noir-hamburg.com` as separate hosts.
// Serving identical content on both creates duplicate content + hreflang conflicts
// (Semrush error #24). Force one canonical host by 301-redirecting all `www.`
// requests to the bare-domain equivalent.
app.use((req, res, next) => {
  const host = req.headers.host || "";
  if (host.startsWith("www.")) {
    const canonical = host.slice(4);
    return res.redirect(301, `https://${canonical}${req.originalUrl}`);
  }
  next();
});

// ---------- Content-Language HTTP header ----------
// Semrush flagged hreflang conflicts because /en/* pages were served without a
// matching Content-Language header. Set it here so the header always matches
// the URL prefix (fixes error #24 for the English variants).
app.use((req, res, next) => {
  const isEn = req.path === "/en" || req.path.startsWith("/en/");
  res.set("Content-Language", isEn ? "en" : "de");
  next();
});

app.use("/static", express.static(path.join(BUILD_DIR, "static"), { maxAge: "1y", immutable: true }));
app.get("/favicon.ico", (req, res) => res.sendFile(path.join(BUILD_DIR, "favicon.ico")));
app.get("/manifest.json", (req, res) => res.sendFile(path.join(BUILD_DIR, "manifest.json")));
app.get("/robots.txt", (req, res) => res.sendFile(path.join(BUILD_DIR, "robots.txt")));
app.get("/llms.txt", (req, res) => {
  res.set("Content-Type", "text/plain; charset=utf-8");
  res.sendFile(path.join(BUILD_DIR, "llms.txt"));
});

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
//
// Recovery strategy on failure:
//   1. Try dynamic renderer (fn).
//   2. If it returns null (unknown slug) OR throws, look for a pre-generated
//      SSG file on disk at `build/{route}/index.html`. This file is committed
//      to git as a deploy safety net, so even if the dynamic renderer's
//      backend dependencies are unavailable, the SSG-baked HTML is served.
//   3. Only if BOTH fail: serve the sanitized SPA shell TEMPLATE.
function _tryReadPrebuilt(reqPath) {
  const clean = reqPath.replace(/^\/+/, "").replace(/\/+$/, "") || "index";
  const filePath = clean === "index"
    ? path.join(BUILD_DIR, "index.html")
    : path.join(BUILD_DIR, clean, "index.html");
  try {
    if (fs.existsSync(filePath)) {
      return fs.readFileSync(filePath, "utf8");
    }
  } catch (_) { /* fall through */ }
  return null;
}

function safe(fn) {
  return async (req, res) => {
    try {
      const html = await fn(req, res);
      if (html === null) {
        // Route rendered nothing (unknown slug etc.) → try prebuilt, else clean 404 shell.
        const prebuilt = _tryReadPrebuilt(req.path);
        if (prebuilt) {
          res.set("X-SSR-Status", "prebuilt-fallback-404");
          return send(res, prebuilt);
        }
        res.set("X-SSR-Status", "not-found");
        return send404(res, TEMPLATE);
      }
      res.set("X-SSR-Status", "ok");
      send(res, html);
    } catch (e) {
      console.error(`[ssr] ${req.path} failed:`, e.message);
      // Try prebuilt SSG output first before falling back to the neutral shell.
      const prebuilt = _tryReadPrebuilt(req.path);
      if (prebuilt) {
        res.set("X-SSR-Status", "prebuilt-fallback-error");
        res.set("X-SSR-Error", (e.message || "unknown").slice(0, 200).replace(/[\r\n]/g, " "));
        return send(res, prebuilt);
      }
      res.set("X-SSR-Status", "error");
      res.set("X-SSR-Error", (e.message || "unknown").slice(0, 200).replace(/[\r\n]/g, " "));
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
// Specific /p/diskretion before the catch-all /p/:slug — Express matches
// first-declared wins.
app.get("/p/diskretion", safe(() => renderDiskretion(BUILD_ASSETS, "de")));
app.get("/p/:slug", safe((req) => renderPageDetail(req.params.slug, BUILD_ASSETS, "de")));
app.get("/faq", safe(() => renderFAQ(BUILD_ASSETS, "de")));
app.get("/ueber-uns", safe(() => renderAbout(BUILD_ASSETS, "de")));
app.get("/kontakt", safe(() => renderContact(BUILD_ASSETS, "de")));
app.get("/impressum", safe(() => renderImpressum(BUILD_ASSETS, "de")));

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
app.get("/en/p/diskretion", safe(() => renderDiskretion(BUILD_ASSETS, "en")));
app.get("/en/p/:slug", safe((req) => renderPageDetail(req.params.slug, BUILD_ASSETS, "en")));
app.get("/en/faq", safe(() => renderFAQ(BUILD_ASSETS, "en")));
app.get("/en/about", safe(() => renderAbout(BUILD_ASSETS, "en")));
app.get("/en/contact", safe(() => renderContact(BUILD_ASSETS, "en")));
app.get("/en/imprint", safe(() => renderImpressum(BUILD_ASSETS, "en")));

// Admin + anything else → SPA shell (React handles routing client-side).
app.get("*", (req, res) => send(res, TEMPLATE));

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Noir Hamburg SSR server listening on 0.0.0.0:${PORT}`);
  console.log(`Build dir: ${BUILD_DIR}`);
});
