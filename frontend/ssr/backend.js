/* eslint-disable no-console */
/**
 * HTTP client for the FastAPI backend, with optional TTL caching.
 *
 * Hot endpoints (/api/models, /api/blog) are cached for 60s in-memory so
 * heavy crawler traffic does not flood the backend. Per-resource lookups
 * (/api/models/:slug, /api/blog/:slug, /api/pages/:slug) are cached too —
 * the cardinality is bounded and stale-for-60s is acceptable for SEO HTML.
 */
const http = require("http");
const https = require("https");
const { memoTTL } = require("./cache");

const BACKEND = process.env.SSR_BACKEND_URL || "http://localhost:8001";
// Optional production API URL used as a fallback during static-site
// generation when the local build backend has empty defaults (fresh deploy
// container). Set via env var so the same code runs in preview + prod.
const PROD_FALLBACK = process.env.SSR_BACKEND_FALLBACK_URL || "https://noir-hamburg.com";
const DEFAULT_TTL_MS = 60_000;

function _get(url) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith("https:") ? https : http;
    const req = client.get(url, (res) => {
      let data = "";
      res.on("data", (c) => (data += c));
      res.on("end", () => resolve({
        status: res.statusCode,
        body: data,
        contentType: res.headers["content-type"],
      }));
    });
    req.on("error", reject);
    req.setTimeout(8000, () => req.destroy(new Error("timeout")));
  });
}

async function rawGet(reqPath) {
  // Try local backend first (fast, low latency). If it fails OR returns an
  // empty-looking settings payload (typical of a fresh build container that
  // hasn't been seeded), retry against the live production API. This makes
  // the SSG build resilient in deployment environments where the local DB
  // isn't populated with the admin's uploaded images.
  try {
    const local = await _get(`${BACKEND}${reqPath}`);
    if (local.status === 200) {
      // Detect empty settings response (no uploaded image URLs) → fall through
      // to production. We only apply this special-case to /api/settings.
      if (reqPath === "/api/settings" && local.body && !local.body.includes("/api/files/") && PROD_FALLBACK) {
        try {
          const prod = await _get(`${PROD_FALLBACK}${reqPath}`);
          if (prod.status === 200 && prod.body.includes("/api/files/")) return prod;
        } catch (_) { /* fall through to local */ }
      }
      return local;
    }
  } catch (_) { /* fall through */ }

  // Local unreachable → try production fallback.
  if (PROD_FALLBACK) {
    return _get(`${PROD_FALLBACK}${reqPath}`);
  }
  throw new Error("all backends unreachable");
}

function jsonGet(reqPath) {
  return rawGet(reqPath).then((r) => {
    if (r.status >= 400) throw new Error(`upstream ${r.status} ${reqPath}`);
    return JSON.parse(r.body);
  });
}

// Public API: cached JSON fetch keyed by path. Pass cache:false for fresh.
function backendJSON(reqPath, { cache = true, ttlMs = DEFAULT_TTL_MS } = {}) {
  if (!cache) return jsonGet(reqPath);
  return memoTTL(`json:${reqPath}`, ttlMs, () => jsonGet(reqPath));
}

function backendRaw(reqPath) {
  return rawGet(reqPath);
}

module.exports = { backendJSON, backendRaw, BACKEND };
