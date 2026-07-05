#!/usr/bin/env node
/**
 * Static Site Generation (SSG) for Noir Hamburg.
 *
 * Emergent's production template serves /app/frontend/build/ as static files
 * via CDN and does not run our Node/Express SSR server. To ship real SEO HTML
 * to Googlebot on that platform, we pre-render every SEO-critical URL at build
 * time and write the result into build/<path>/index.html. The CDN then serves
 * these full HTML files instead of the empty CRA shell.
 *
 * Reuses the exact same route renderers as ssr-server.js — they are pure
 * functions that take (buildAssets, lang) or (slug, buildAssets, lang) and
 * return HTML strings. No behavioural drift between preview (runtime SSR) and
 * production (build-time SSG).
 */
/* eslint-disable no-console */
const fs = require("fs");
const path = require("path");

const BUILD_DIR = path.join(__dirname, "..", "build");

if (!fs.existsSync(path.join(BUILD_DIR, "index.html"))) {
  console.error("[ssg] build/ missing — run `yarn build` first (this script runs after it).");
  process.exit(1);
}

// ---- Load renderers + shared static data ----
const { renderHome } = require("../ssr/routes/home");
const { renderModels, renderModelDetail } = require("../ssr/routes/models");
const { renderServicesList, renderServiceDetail } = require("../ssr/routes/services");
const { renderAreasList, renderAreaDetail, renderEscortHamburg } = require("../ssr/routes/areas");
const { renderBlogList, renderBlogDetail, renderPageDetail } = require("../ssr/routes/blog");
const { renderFAQ, renderAbout, renderContact } = require("../ssr/routes/static");
const { backendJSON } = require("../ssr/backend");
const { SERVICES, LOCATIONS } = require("../src/data/site");

// ---- Extract React bundle asset tags from build/index.html ----
// Same logic as ssr-server.js so the pre-rendered HTML still hydrates the SPA.
const TEMPLATE = fs.readFileSync(path.join(BUILD_DIR, "index.html"), "utf8");
const headAssetsMatch = TEMPLATE.match(/<head>([\s\S]*?)<\/head>/i);
const bodyScriptsMatch = TEMPLATE.match(/<body[^>]*>([\s\S]*?)<\/body>/i);

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
const BUILD_ASSETS = { reactHeadAssets, reactScripts };

// ---- Utility: write file into build/, creating dirs on the fly ----
function writeHtml(urlPath, html) {
  if (!html) return false;
  // Normalize: /foo/bar → foo/bar/index.html, / → index.html
  const clean = urlPath.replace(/^\/+/, "").replace(/\/+$/, "");
  const target = clean === ""
    ? path.join(BUILD_DIR, "index.html")
    : path.join(BUILD_DIR, clean, "index.html");
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, html, "utf8");
  return true;
}

// ---- Main ----
(async () => {
  const t0 = Date.now();
  console.log("[ssg] fetching backend data...");
  const [models, blogPosts, pages] = await Promise.all([
    backendJSON("/api/models").catch(() => []),
    backendJSON("/api/blog").catch(() => []),
    backendJSON("/api/pages").catch(() => []),
  ]);
  console.log(`[ssg] fetched: ${models.length} models, ${blogPosts.length} blog posts, ${pages.length} CMS pages`);

  // Enumerate every SEO URL for both languages.
  const targets = [];
  for (const lang of ["de", "en"]) {
    const p = (u) => (lang === "en" ? `/en${u === "/" ? "" : u}` : u);
    targets.push({ url: p("/"),               render: () => renderHome(BUILD_ASSETS, lang) });
    targets.push({ url: p("/models"),         render: () => renderModels(BUILD_ASSETS, lang) });
    targets.push({ url: p("/services"),       render: () => renderServicesList(BUILD_ASSETS, lang) });
    targets.push({ url: p("/areas"),          render: () => renderAreasList(BUILD_ASSETS, lang) });
    targets.push({ url: p("/escort-hamburg"), render: () => renderEscortHamburg(BUILD_ASSETS, lang) });
    targets.push({ url: p("/blog"),           render: () => renderBlogList(BUILD_ASSETS, lang) });
    targets.push({ url: p("/faq"),            render: () => renderFAQ(BUILD_ASSETS, lang) });
    targets.push({ url: p("/kontakt"),        render: () => renderContact(BUILD_ASSETS, lang) });
    // /ueber-uns and /en/about
    targets.push({
      url: lang === "en" ? "/en/about" : "/ueber-uns",
      render: () => renderAbout(BUILD_ASSETS, lang),
    });
    for (const s of SERVICES) {
      targets.push({ url: p(`/services/${s.slug}`), render: () => renderServiceDetail(s.slug, BUILD_ASSETS, lang) });
    }
    for (const l of LOCATIONS) {
      targets.push({ url: p(`/escort/${l.slug}`),  render: () => renderAreaDetail(l.slug, BUILD_ASSETS, lang) });
    }
    for (const m of models) {
      targets.push({ url: p(`/models/${m.slug}`),  render: () => renderModelDetail(m.slug, BUILD_ASSETS, lang) });
    }
    for (const b of blogPosts) {
      targets.push({ url: p(`/blog/${b.slug}`),    render: () => renderBlogDetail(b.slug, BUILD_ASSETS, lang) });
    }
    for (const pg of pages) {
      targets.push({ url: p(`/p/${pg.slug}`),      render: () => renderPageDetail(pg.slug, BUILD_ASSETS, lang) });
    }
  }

  console.log(`[ssg] rendering ${targets.length} pages...`);
  let ok = 0;
  let fail = 0;
  // Small concurrency limit — the backend is local, but too many parallel
  // fetches still trip on cold-start rate limits in some deploy environments.
  const CONCURRENCY = 6;
  for (let i = 0; i < targets.length; i += CONCURRENCY) {
    const batch = targets.slice(i, i + CONCURRENCY);
    const results = await Promise.all(batch.map(async (t) => {
      try {
        const html = await t.render();
        if (!html) return { url: t.url, ok: false, reason: "renderer returned null" };
        writeHtml(t.url, html);
        return { url: t.url, ok: true, size: html.length };
      } catch (e) {
        return { url: t.url, ok: false, reason: e.message };
      }
    }));
    for (const r of results) {
      if (r.ok) { ok++; }
      else { fail++; console.error(`[ssg]  ✗ ${r.url} — ${r.reason}`); }
    }
  }

  console.log(`[ssg] ✓ done in ${((Date.now() - t0) / 1000).toFixed(1)}s: ${ok} ok, ${fail} failed`);
  if (fail > 0) process.exit(1);
})();
