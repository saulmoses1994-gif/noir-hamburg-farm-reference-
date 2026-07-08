/**
 * SEO content cache — Services + Areas.
 *
 * Mirrors ssr/settings.js: prefetches /api/service-content and
 * /api/area-content into an in-memory map so renderShell(...) callers can
 * read synchronously. Falls back to the bundled JS defaults (site.js +
 * serviceContent.js + areaContent.js) so the site still renders even if the
 * backend is unreachable.
 */
const { backendJSON } = require("./backend");
const { SERVICES, LOCATIONS } = require("../src/data/site");
const { SERVICE_CONTENT, RELATED_SERVICES } = require("../src/data/serviceContent");
const { AREA_CONTENT, GENERIC_AREA_FAQS } = require("../src/data/areaContent");

const REFRESH_MS = 60_000;

// Fallback maps derived from bundled data — normalised into the same shape
// as the API payload so consumers can treat them identically.
function _buildFallbackServices() {
  const map = {};
  for (const s of SERVICES) {
    const ext = SERVICE_CONTENT[s.slug] || { sections: [], faqs: [] };
    map[s.slug] = {
      slug: s.slug,
      title: s.title,
      short_label: s.shortLabel,
      h1: s.h1,
      tagline: s.tagline || "",
      tagline_en: s.taglineEn || "",
      description: s.description || "",
      description_en: s.descriptionEn || "",
      long_copy: s.longCopy || "",
      long_copy_en: s.longCopyEn || "",
      keypoints: s.keypoints || [],
      keypoints_en: s.keypointsEn || [],
      image: s.image || "",
      image_alt: "",
      image_alt_en: "",
      meta_title: s.metaTitle || "",
      meta_title_en: s.metaTitleEn || "",
      meta_description: s.metaDescription || "",
      meta_description_en: s.metaDescriptionEn || "",
      sections: (ext.sections || []).map((sec) => ({
        h2: sec.h2 || "",
        h2_en: sec.h2En || "",
        body: sec.body || [],
        body_en: sec.bodyEn || [],
      })),
      faqs: (ext.faqs || []).map((f) => ({
        q: f.q, q_en: f.qEn, a: f.a, a_en: f.aEn,
      })),
      related_services: RELATED_SERVICES[s.slug] || [],
    };
  }
  return map;
}

function _buildFallbackAreas() {
  const map = {};
  for (const l of LOCATIONS) {
    const ext = AREA_CONTENT[l.slug] || { bodyExtra: [], bodyExtraEn: [] };
    map[l.slug] = {
      slug: l.slug,
      name: l.name,
      title: l.title,
      intro: l.intro || "",
      intro_en: l.introEn || "",
      description: l.description || "",
      description_en: l.descriptionEn || "",
      image: l.image || "",
      image_alt: "",
      image_alt_en: "",
      landmarks: l.landmarks || [],
      body_extra: ext.bodyExtra || [],
      body_extra_en: ext.bodyExtraEn || [],
      meta_title: "",
      meta_title_en: "",
      meta_description: "",
      meta_description_en: "",
      faqs: [],
    };
  }
  return map;
}

let _services = _buildFallbackServices();
let _areas = _buildFallbackAreas();

async function refresh() {
  let ok = false;
  try {
    const list = await backendJSON("/api/service-content", { cache: false });
    if (Array.isArray(list) && list.length) {
      const map = {};
      for (const doc of list) map[doc.slug] = doc;
      _services = map;
      ok = true;
    }
  } catch (_) { /* keep fallback */ }
  try {
    const list = await backendJSON("/api/area-content", { cache: false });
    if (Array.isArray(list) && list.length) {
      const map = {};
      for (const doc of list) map[doc.slug] = doc;
      _areas = map;
      ok = true;
    }
  } catch (_) { /* keep fallback */ }
  return ok;
}

refresh();
setInterval(refresh, REFRESH_MS).unref();

function getServiceContent(slug) { return _services[slug] || null; }
function getAllServiceContent() { return Object.values(_services); }
function getAreaContent(slug) { return _areas[slug] || null; }
function getAllAreaContent() { return Object.values(_areas); }
function getGenericAreaFaqs() { return GENERIC_AREA_FAQS; }

async function ensureContentLoaded() {
  for (let attempt = 0; attempt < 5; attempt++) {
    const ok = await refresh();
    if (ok) return true;
    await new Promise((r) => setTimeout(r, 500 * (attempt + 1)));
  }
  console.warn("[content] failed to load service/area content after 5 retries — using bundled defaults");
  return false;
}

module.exports = {
  getServiceContent,
  getAllServiceContent,
  getAreaContent,
  getAllAreaContent,
  getGenericAreaFaqs,
  ensureContentLoaded,
};
