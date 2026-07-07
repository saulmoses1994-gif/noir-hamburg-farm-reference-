/**
 * Cached site-wide settings for the SSR layer.
 *
 * We can't easily thread an async settings fetch through the synchronous
 * `renderShell(...)` pipeline (that would touch every route renderer), so
 * instead we maintain a live in-memory copy that refreshes every 60s in the
 * background. Reads are synchronous and never block a request.
 */
const { BRAND } = require("../src/data/site");
const { backendJSON } = require("./backend");

const REFRESH_MS = 60_000;

// Baseline defaults derived from the shared BRAND object so the site never
// blanks out during a cold boot or when the backend is momentarily down.
let _cached = {
  business_name: BRAND.name,
  tagline_de: BRAND.tagline,
  tagline_en: BRAND.taglineEn,
  phone: BRAND.phone,
  email: BRAND.email,
  whatsapp_number: BRAND.whatsapp,
  hours_de: "Mo – Fr · 10 – 22 Uhr  ·  Sa, So, Feiertag · 13 – 22 Uhr",
  hours_en: "Mon – Fri · 10 am – 10 pm  ·  Sat, Sun, Holidays · 1 pm – 10 pm",
  instagram_url: "",
  facebook_url: "",
  twitter_url: "",
  homepage_hero_image: "",
  area_images: {},
  service_images: {},
  escort_hamburg_image: "",
  about_image: "",
  social_share_image: "",
};

async function refresh() {
  try {
    _cached = await backendJSON("/api/settings", { cache: false });
  } catch (e) {
    // Swallow — keep the previous cached copy. Errors are recoverable.
  }
}

// Prime immediately, then refresh on an interval.
refresh();
setInterval(refresh, REFRESH_MS).unref();

function getSettings() {
  const wa = (_cached.whatsapp_number || "").replace(/\D/g, "");
  return {
    ..._cached,
    whatsappUrl: wa ? `https://wa.me/${wa}` : "",
  };
}

module.exports = { getSettings };
