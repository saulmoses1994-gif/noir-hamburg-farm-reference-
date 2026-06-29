/* eslint-disable no-console */
/**
 * Tiny in-memory TTL cache for SSR.
 *
 * Goal: avoid hammering the FastAPI backend on every Googlebot crawl. Each
 * key holds a value + expiry timestamp. A pending-promise map dedupes
 * concurrent requests so we never fire two parallel fetches for the same key
 * (thundering-herd protection).
 */
const store = new Map(); // key -> { value, expiresAt }
const inflight = new Map(); // key -> Promise

function memoTTL(key, ttlMs, factory) {
  const now = Date.now();
  const hit = store.get(key);
  if (hit && hit.expiresAt > now) return Promise.resolve(hit.value);

  if (inflight.has(key)) return inflight.get(key);

  const promise = Promise.resolve()
    .then(() => factory())
    .then((value) => {
      store.set(key, { value, expiresAt: Date.now() + ttlMs });
      inflight.delete(key);
      return value;
    })
    .catch((err) => {
      inflight.delete(key);
      // Serve stale-on-error if we have any prior value, otherwise rethrow.
      if (hit) {
        console.warn(`[ssr-cache] ${key} fetch failed (${err.message}); serving stale`);
        return hit.value;
      }
      throw err;
    });

  inflight.set(key, promise);
  return promise;
}

module.exports = { memoTTL };
