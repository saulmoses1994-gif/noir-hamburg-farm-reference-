import { useEffect } from "react";

const SITE_ORIGIN = (typeof window !== "undefined") ? window.location.origin : "";

export function useSEO({ title, description, canonical, image, jsonLd, noindex = false }) {
  useEffect(() => {
    const prevTitle = document.title;
    if (title) document.title = title;

    const setMeta = (name, content, attr = "name") => {
      if (!content) return null;
      let el = document.querySelector(`meta[${attr}="${name}"]`);
      if (!el) {
        el = document.createElement("meta");
        el.setAttribute(attr, name);
        document.head.appendChild(el);
      }
      el.setAttribute("content", content);
      return el;
    };

    setMeta("description", description);
    setMeta("og:title", title, "property");
    setMeta("og:description", description, "property");
    setMeta("og:type", "website", "property");
    if (image) setMeta("og:image", image, "property");
    setMeta("twitter:card", "summary_large_image");
    setMeta("twitter:title", title);
    setMeta("twitter:description", description);
    if (image) setMeta("twitter:image", image);
    if (noindex) setMeta("robots", "noindex, follow");

    // og:url + canonical
    const path = window.location.pathname;
    const canonHref = canonical || `${SITE_ORIGIN}${path}`;
    setMeta("og:url", canonHref, "property");

    let canonicalLink = document.querySelector('link[rel="canonical"]');
    if (!canonicalLink) {
      canonicalLink = document.createElement("link");
      canonicalLink.setAttribute("rel", "canonical");
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.setAttribute("href", canonHref);

    // jsonLd may be an object or array — render each as a separate script tag
    const ldEntries = Array.isArray(jsonLd) ? jsonLd.filter(Boolean) : (jsonLd ? [jsonLd] : []);
    const scripts = ldEntries.map((entry) => {
      const s = document.createElement("script");
      s.type = "application/ld+json";
      s.textContent = JSON.stringify(entry);
      s.dataset.noirSeo = "page";
      document.head.appendChild(s);
      return s;
    });

    return () => {
      document.title = prevTitle;
      scripts.forEach((s) => s.parentNode && s.parentNode.removeChild(s));
    };
  }, [title, description, canonical, image, JSON.stringify(jsonLd), noindex]);
}

// Helper to build a BreadcrumbList JSON-LD entry.
export function breadcrumbSchema(items) {
  const origin = SITE_ORIGIN;
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Home", "item": `${origin}/` },
      ...items.map((it, i) => ({
        "@type": "ListItem",
        "position": i + 2,
        "name": it.label,
        ...(it.to ? { "item": `${origin}${it.to}` } : {}),
      })),
    ],
  };
}
