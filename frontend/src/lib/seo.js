import { useEffect } from "react";

export function useSEO({ title, description, canonical, image, jsonLd }) {
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

    const metas = [];
    metas.push(setMeta("description", description));
    metas.push(setMeta("og:title", title, "property"));
    metas.push(setMeta("og:description", description, "property"));
    metas.push(setMeta("og:type", "website", "property"));
    if (image) metas.push(setMeta("og:image", image, "property"));
    metas.push(setMeta("twitter:card", "summary_large_image"));
    metas.push(setMeta("twitter:title", title));
    metas.push(setMeta("twitter:description", description));
    if (image) metas.push(setMeta("twitter:image", image));

    let canonicalLink = document.querySelector('link[rel="canonical"]');
    if (!canonicalLink) {
      canonicalLink = document.createElement("link");
      canonicalLink.setAttribute("rel", "canonical");
      document.head.appendChild(canonicalLink);
    }
    const canon = canonical || window.location.origin + window.location.pathname;
    canonicalLink.setAttribute("href", canon);

    let ldScript = null;
    if (jsonLd) {
      ldScript = document.createElement("script");
      ldScript.type = "application/ld+json";
      ldScript.textContent = JSON.stringify(jsonLd);
      ldScript.dataset.noirSeo = "1";
      document.head.appendChild(ldScript);
    }

    return () => {
      document.title = prevTitle;
      if (ldScript && ldScript.parentNode) ldScript.parentNode.removeChild(ldScript);
    };
  }, [title, description, canonical, image, JSON.stringify(jsonLd)]);
}
