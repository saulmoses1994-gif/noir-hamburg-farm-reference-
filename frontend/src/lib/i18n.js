/**
 * React i18n hook + context.
 *
 * Reads the current URL via react-router's `useLocation` and exposes:
 *   - `lang`         "de" | "en"
 *   - `t(key, vars)` translation helper bound to current lang
 *   - `to(path)`     localize a lang-neutral path to the current language
 *   - `switchTo`     the OTHER language ("en" | "de")
 *   - `switchPath`   URL to use when toggling languages, preserving page
 *
 * Translations + path mapping live in `src/i18n.js` (shared with SSR).
 */
import { useLocation } from "react-router-dom";
import { t as rawT, localizePath, detectLang } from "@/data/i18n";

export function useI18n() {
  const { pathname } = useLocation();
  const lang = detectLang(pathname);
  const switchTo = lang === "en" ? "de" : "en";
  const switchPath = localizePath(pathname, switchTo);

  return {
    lang,
    t: (key, vars) => rawT(key, lang, vars),
    to: (path) => localizePath(path, lang),
    switchTo,
    switchPath,
  };
}
