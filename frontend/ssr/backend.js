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
const { memoTTL } = require("./cache");

const BACKEND = process.env.SSR_BACKEND_URL || "http://localhost:8001";
const DEFAULT_TTL_MS = 60_000;

function rawGet(reqPath) {
  return new Promise((resolve, reject) => {
    const req = http.get(`${BACKEND}${reqPath}`, (res) => {
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
